import { FeedbackItem } from '../types';
import { getSafeLocalStorage } from './storage';

export const GITHUB_REPO_ISSUES_URL = 'https://github.com/ky1rie1/SiliconWiki/issues/new';

export interface FeedbackSubmissionParams {
  type: FeedbackItem['type'];
  target?: string;
  content: string;
  contact?: string;
  lang?: 'zh' | 'en';
  currentUrl?: string;
}

const TYPE_LABELS: Record<FeedbackItem['type'], { zh: string; en: string }> = {
  bug: { zh: 'Bug 缺陷', en: 'Bug Report' },
  data: { zh: '数据校准', en: 'Data Correction' },
  feature: { zh: '功能建议', en: 'Feature Request' },
  other: { zh: '其他反馈', en: 'General Feedback' },
};

export function getTypeLabel(type: FeedbackItem['type'], lang: 'zh' | 'en' = 'zh'): string {
  return TYPE_LABELS[type]?.[lang] || type;
}

/**
 * Sanitizes a page URL for error reporting.
 * Strips tracking query parameters, tokens, and arbitrary query strings.
 * Retains only essential functional parameters: 'tab', 'hardware', 'category'.
 */
export function sanitizePageUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    const sanitized = new URL(url.origin + url.pathname);
    const allowedParams = ['tab', 'hardware', 'category'];
    allowedParams.forEach((param) => {
      const val = url.searchParams.get(param);
      if (val) {
        sanitized.searchParams.set(param, val);
      }
    });

    if (url.hash) {
      const cleanHash = url.hash.replace(/^#\/?/, '').trim();
      const safeTabs = [
        'wiki',
        'rankings',
        'simulator3d',
        '3d',
        'build',
        'glossary',
        'dict',
        'builds',
        'budget',
      ];
      if (safeTabs.includes(cleanHash)) {
        sanitized.hash = `#/${cleanHash}`;
      }
    }

    return sanitized.toString();
  } catch {
    return 'https://computer-wiki.vercel.app/#/wiki';
  }
}

/**
 * Builds a GitHub Issue URL with pre-filled title and structured Markdown template.
 * PRIVACY REQUIREMENT:
 * - Contact info form field is NEVER included in the public GitHub Issue parameters.
 * - Privacy notice explicitly alerts user that the issue is public and description is submitted as typed.
 * - Page URL is sanitized to prevent leaking arbitrary query tokens or tracking parameters.
 */
export function buildGitHubIssueUrl(params: FeedbackSubmissionParams): string {
  const { type, target, content, lang = 'zh', currentUrl } = params;
  const isZh = lang === 'zh';
  const typeLabel = getTypeLabel(type, lang);

  const cleanTarget = target?.trim() ? `[${target.trim()}] ` : '';
  const firstLine = content.trim().split('\n')[0] || '';
  const titleSummary = firstLine.slice(0, 50).trim();
  const issueTitle = `[${typeLabel}] ${cleanTarget}${titleSummary}`;

  const now = new Date().toISOString();
  const rawUrl = currentUrl || (typeof window !== 'undefined' ? window.location.href : 'https://computer-wiki.vercel.app');
  const safeUrl = sanitizePageUrl(rawUrl);
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';

  const bodyLines = [
    `### ${isZh ? '反馈类型' : 'Feedback Category'}`,
    typeLabel,
    '',
    `### ${isZh ? '涉及页面 / 硬件型号' : 'Target Page / Hardware'}`,
    target?.trim() || (isZh ? '未指定' : 'Not specified'),
    '',
    `### ${isZh ? '详细描述' : 'Description'}`,
    content.trim(),
    '',
    '---',
    `### ${isZh ? '环境信息' : 'Environment Details'}`,
    `- **${isZh ? '提交来源' : 'Source'}**: SiliconWiki Web Client`,
    `- **${isZh ? '当前页面' : 'Page URL'}**: ${safeUrl}`,
    `- **${isZh ? '客户端' : 'User Agent'}**: \`${userAgent}\``,
    `- **${isZh ? '生成时间' : 'Timestamp'}**: ${now}`,
    '',
    `> 🔒 **${isZh ? '公开 Issue 隐私提示' : 'Public Issue Privacy Notice'}**: ${
      isZh
        ? '本 Issue 为公开内容，所有用户均可查看。独立联系方式输入框已由系统剔除未带入；详细描述由用户直接输入，请自行确认描述中未包含密码、手机号、真实姓名或敏感个人隐私。'
        : 'This issue is publicly visible. The separate contact form field was excluded; the description is submitted as typed. Please verify that no passwords, phone numbers, real names, or sensitive personal data are in the description.'
    }`,
  ];

  const issueBody = bodyLines.join('\n');

  const url = new URL(GITHUB_REPO_ISSUES_URL);
  url.searchParams.set('title', issueTitle);
  url.searchParams.set('body', issueBody);

  return url.toString();
}

/**
 * Formats the feedback payload into human-readable Markdown for copying to clipboard.
 */
export function formatFeedbackForClipboard(
  params: FeedbackSubmissionParams,
  options: { includeContact?: boolean } = {}
): string {
  const { type, target, content, contact, lang = 'zh' } = params;
  const isZh = lang === 'zh';
  const typeLabel = getTypeLabel(type, lang);
  const now = new Date().toISOString();

  const lines = [
    `# SiliconWiki ${isZh ? '用户反馈' : 'User Feedback'}`,
    `- **${isZh ? '类型' : 'Category'}**: ${typeLabel}`,
    `- **${isZh ? '涉及目标' : 'Target'}**: ${target?.trim() || (isZh ? '无' : 'None')}`,
    `- **${isZh ? '时间' : 'Time'}**: ${now}`,
  ];

  if (options.includeContact && contact?.trim()) {
    lines.push(`- **${isZh ? '联系方式' : 'Contact'}**: ${contact.trim()}`);
  }

  lines.push('', `## ${isZh ? '反馈描述' : 'Description'}`, content.trim());
  return lines.join('\n');
}

export const LOCAL_FEEDBACK_STORAGE_KEY = '_sw_feedback_list';

function isValidFeedbackItem(item: unknown): item is FeedbackItem {
  if (typeof item !== 'object' || item === null) return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.type === 'string' &&
    typeof candidate.content === 'string' &&
    typeof candidate.createdAt === 'string'
  );
}

/**
 * Safely saves a feedback item to localStorage with comprehensive error handling.
 * Avoids evaluating `window.localStorage` in parameter defaults to prevent uncaught SecurityError.
 * Returns { success: true } or { success: false, error: string }.
 */
export function saveLocalFeedback(
  item: FeedbackItem,
  storageOverride?: Storage | null
): { success: boolean; error?: string } {
  try {
    const storage = storageOverride !== undefined ? storageOverride : getSafeLocalStorage();
    if (!storage) {
      return { success: false, error: 'Storage unavailable or access denied' };
    }

    const raw = storage.getItem(LOCAL_FEEDBACK_STORAGE_KEY);
    let list: FeedbackItem[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          list = parsed.filter(isValidFeedbackItem);
        }
      } catch {
        list = [];
      }
    }

    list.unshift(item);
    storage.setItem(LOCAL_FEEDBACK_STORAGE_KEY, JSON.stringify(list));

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('sw_feedback_updated'));
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to write to local storage',
    };
  }
}

/**
 * Safely retrieves local feedback items from localStorage.
 * Validates that parsed data is an array of valid FeedbackItem objects.
 */
export function getLocalFeedbacks(storageOverride?: Storage | null): FeedbackItem[] {
  try {
    const storage = storageOverride !== undefined ? storageOverride : getSafeLocalStorage();
    if (!storage) return [];

    const raw = storage.getItem(LOCAL_FEEDBACK_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidFeedbackItem);
  } catch {
    return [];
  }
}
