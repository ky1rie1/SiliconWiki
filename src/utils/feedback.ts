import { FeedbackItem } from '../types';

export const GITHUB_REPO_ISSUES_URL = 'https://github.com/ky1rie1/SiliconWiki/issues/new';

export interface FeedbackSubmissionParams {
  type: FeedbackItem['type'];
  target?: string;
  content: string;
  contact?: string;
  lang?: 'zh' | 'en';
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
 * Builds a GitHub Issue URL with pre-filled title and structured Markdown template.
 * PRIVACY REQUIREMENT: Contact info (email/wechat/phone) is NEVER included in the public GitHub Issue parameters.
 */
export function buildGitHubIssueUrl(params: FeedbackSubmissionParams): string {
  const { type, target, content, lang = 'zh' } = params;
  const isZh = lang === 'zh';
  const typeLabel = getTypeLabel(type, lang);

  const cleanTarget = target?.trim() ? `[${target.trim()}] ` : '';
  const firstLine = content.trim().split('\n')[0] || '';
  const titleSummary = firstLine.slice(0, 50).trim();
  const issueTitle = `[${typeLabel}] ${cleanTarget}${titleSummary}`;

  const now = new Date().toISOString();
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://computer-wiki.vercel.app';
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
    `- **${isZh ? '当前页面' : 'Page URL'}**: ${currentUrl}`,
    `- **${isZh ? '客户端' : 'User Agent'}**: \`${userAgent}\``,
    `- **${isZh ? '生成时间' : 'Timestamp'}**: ${now}`,
    '',
    `> 🔒 **${isZh ? '隐私说明' : 'Privacy Notice'}**: ${
      isZh
        ? '本 Issue 为公开内容，所有用户可见。个人联系方式已由系统在前端过滤，未带入此页面。'
        : 'This issue is public. Contact details were filtered out locally and are not included.'
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

/**
 * Safely saves a feedback item to localStorage with error handling.
 * Returns { success: true } or { success: false, error: string }.
 */
export function saveLocalFeedback(
  item: FeedbackItem,
  storage: Storage | null = typeof window !== 'undefined' ? window.localStorage : null
): { success: boolean; error?: string } {
  if (!storage) {
    return { success: false, error: 'Storage unavailable' };
  }

  try {
    const raw = storage.getItem(LOCAL_FEEDBACK_STORAGE_KEY);
    const list: FeedbackItem[] = raw ? JSON.parse(raw) : [];
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
 */
export function getLocalFeedbacks(
  storage: Storage | null = typeof window !== 'undefined' ? window.localStorage : null
): FeedbackItem[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(LOCAL_FEEDBACK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
