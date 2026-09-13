import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildGitHubIssueUrl,
  formatFeedbackForClipboard,
  saveLocalFeedback,
  getLocalFeedbacks,
  LOCAL_FEEDBACK_STORAGE_KEY,
} from '../utils/feedback';
import { FeedbackItem } from '../types';

describe('Feedback Utility Suite', () => {
  describe('buildGitHubIssueUrl', () => {
    it('should generate a valid GitHub Issue URL with pre-filled title and template', () => {
      const urlString = buildGitHubIssueUrl({
        type: 'bug',
        target: '3D装机散热器',
        content: '安装第3步动画卡住，模型不显示。',
        contact: 'secret@domain.com',
        lang: 'zh',
      });

      const url = new URL(urlString);
      expect(url.origin).toBe('https://github.com');
      expect(url.pathname).toBe('/ky1rie1/SiliconWiki/issues/new');

      const title = url.searchParams.get('title') || '';
      expect(title).toContain('[Bug 缺陷]');
      expect(title).toContain('[3D装机散热器]');
      expect(title).toContain('安装第3步动画卡住');

      const body = url.searchParams.get('body') || '';
      expect(body).toContain('### 反馈类型');
      expect(body).toContain('Bug 缺陷');
      expect(body).toContain('### 涉及页面 / 硬件型号');
      expect(body).toContain('3D装机散热器');
      expect(body).toContain('安装第3步动画卡住，模型不显示。');

      // CRITICAL PRIVACY ASSERTION:
      // The contact info MUST NOT be included in the public GitHub issue URL or body!
      expect(urlString).not.toContain('secret@domain.com');
      expect(body).not.toContain('secret@domain.com');
      expect(body).toContain('隐私说明');
    });

    it('should handle English locale appropriately', () => {
      const urlString = buildGitHubIssueUrl({
        type: 'data',
        target: 'RTX 4070 Super',
        content: 'TDP is listed as 200W but official spec is 220W.',
        lang: 'en',
      });

      const url = new URL(urlString);
      const title = url.searchParams.get('title') || '';
      expect(title).toContain('[Data Correction]');
      expect(title).toContain('[RTX 4070 Super]');

      const body = url.searchParams.get('body') || '';
      expect(body).toContain('### Feedback Category');
      expect(body).toContain('Data Correction');
      expect(body).toContain('Privacy Notice');
    });
  });

  describe('formatFeedbackForClipboard', () => {
    it('should format clean markdown summary for clipboard without contact by default', () => {
      const text = formatFeedbackForClipboard({
        type: 'feature',
        target: '天梯榜',
        content: '希望支持按照功耗比排序。',
        contact: 'wechat: my_id',
        lang: 'zh',
      });

      expect(text).toContain('# SiliconWiki 用户反馈');
      expect(text).toContain('- **类型**: 功能建议');
      expect(text).toContain('- **涉及目标**: 天梯榜');
      expect(text).toContain('希望支持按照功耗比排序。');
      expect(text).not.toContain('wechat: my_id');
    });

    it('should optionally include contact when explicitly permitted for direct developer transfer', () => {
      const text = formatFeedbackForClipboard(
        {
          type: 'feature',
          content: '测试建议',
          contact: 'user@example.com',
          lang: 'zh',
        },
        { includeContact: true }
      );

      expect(text).toContain('- **联系方式**: user@example.com');
    });
  });

  describe('saveLocalFeedback & getLocalFeedbacks', () => {
    const createMockStorage = () => {
      let store: Record<string, string> = {};
      return {
        getItem: (k: string) => store[k] || null,
        setItem: (k: string, v: string) => {
          store[k] = v;
        },
        removeItem: (k: string) => {
          delete store[k];
        },
        clear: () => {
          store = {};
        },
      };
    };

    let mockStorage: ReturnType<typeof createMockStorage>;

    beforeEach(() => {
      mockStorage = createMockStorage();
    });

    it('should save and retrieve feedback gracefully', () => {
      const item: FeedbackItem = {
        id: 'fb_1',
        type: 'bug',
        content: 'Test content',
        createdAt: new Date().toISOString(),
        status: 'pending',
      };

      const res = saveLocalFeedback(item, mockStorage as unknown as Storage);
      expect(res.success).toBe(true);

      const items = getLocalFeedbacks(mockStorage as unknown as Storage);
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe('fb_1');
    });

    it('should handle storage errors (e.g. QuotaExceededError) gracefully without crashing', () => {
      const failingStorage = {
        getItem: () => null,
        setItem: () => {
          throw new Error('QuotaExceededError: storage is full');
        },
      } as unknown as Storage;

      const item: FeedbackItem = {
        id: 'fb_err',
        type: 'bug',
        content: 'Crash test',
        createdAt: new Date().toISOString(),
        status: 'pending',
      };

      const res = saveLocalFeedback(item, failingStorage);
      expect(res.success).toBe(false);
      expect(res.error).toContain('QuotaExceededError');
    });

    it('should handle corrupted JSON in storage without throwing', () => {
      mockStorage.setItem(LOCAL_FEEDBACK_STORAGE_KEY, '{invalid json');
      const items = getLocalFeedbacks(mockStorage as unknown as Storage);
      expect(items).toEqual([]);
    });
  });
});
