import { describe, it, expect, beforeEach } from 'vitest';
import { recommendedBuilds } from '../data/builds';
import { changelogList } from '../data/changelog';
import { FeedbackItem } from '../types';

describe('2026 Budget Builds Suite', () => {
  it('should have 5 balanced price tier configurations', () => {
    expect(recommendedBuilds).toHaveLength(5);
    const budgetLevels = recommendedBuilds.map((b) => b.budgetLevel);
    expect(budgetLevels).toEqual([
      '3500元档',
      '5500元档',
      '8500元档',
      '13000元档',
      '25000元档+',
    ]);
  });

  it('should have 100% exact price arithmetic for all builds', () => {
    for (const build of recommendedBuilds) {
      const partsSum = build.parts.reduce((sum, p) => sum + p.approxPrice, 0);
      expect(partsSum).toBe(build.totalPrice);
      expect(partsSum).toBe(build.targetPrice);
      expect(build.parts.length).toBeGreaterThanOrEqual(8);
    }
  });

  it('should not contain marketing buzzwords (神机, 天花板, 卡皇, 机皇)', () => {
    const bannedWords = ['神机', '天花板', '卡皇', '机皇'];
    for (const build of recommendedBuilds) {
      for (const word of bannedWords) {
        expect(build.title).not.toContain(word);
        expect(build.tagline).not.toContain(word);
        for (const note of build.notes) {
          expect(note).not.toContain(word);
        }
      }
    }
  });

  it('should contain balanced 2026 components in respective tiers', () => {
    const b3500 = recommendedBuilds.find((b) => b.budgetLevel === '3500元档');
    expect(b3500?.parts.some((p) => p.name.includes('12400F') || p.name.includes('5600'))).toBe(true);
    expect(b3500?.parts.some((p) => p.name.includes('6750 GRE') || p.name.includes('4060'))).toBe(true);

    const b5500 = recommendedBuilds.find((b) => b.budgetLevel === '5500元档');
    expect(b5500?.parts.some((p) => p.name.includes('7500F'))).toBe(true);
    expect(b5500?.parts.some((p) => p.name.includes('B650M'))).toBe(true);

    const b8500 = recommendedBuilds.find((b) => b.budgetLevel === '8500元档');
    expect(b8500?.parts.some((p) => p.name.includes('4070 SUPER'))).toBe(true);

    const b13000 = recommendedBuilds.find((b) => b.budgetLevel === '13000元档');
    expect(b13000?.parts.some((p) => p.name.includes('9800X3D') || p.name.includes('265K'))).toBe(true);
    expect(b13000?.parts.some((p) => p.name.includes('4070 Ti SUPER'))).toBe(true);

    const b25000 = recommendedBuilds.find((b) => b.budgetLevel === '25000元档+');
    expect(b25000?.parts.some((p) => p.name.includes('5090') || p.name.includes('4090'))).toBe(true);
  });
});

describe('Version Changelog Suite', () => {
  it('should have v2.4.0 as the latest release entry', () => {
    const latest = changelogList[0];
    expect(latest.version).toBe('v2.4.0');
    expect(latest.date).toBe('2026-09-05');
    expect(latest.tag).toBe('最新发布');
    expect(latest.title).toContain('3D装机光影矫正');
    expect(latest.title).toContain('天梯榜基准标尺重构');
    expect(latest.title).toContain('2026预算配置升级');
    expect(latest.title).toContain('客观工程文风净化');
    expect(latest.title).toContain('用户反馈系统');
  });

  it('should cover all 5 required update areas in v2.4.0', () => {
    const latest = changelogList[0];
    const texts = latest.updates.map((u) => u.text).join('\n');

    expect(texts).toContain('ACES Filmic');
    expect(texts).toContain('天梯排行榜基准逻辑校准');
    expect(texts).toContain('2026 预算配置全面焕新');
    expect(texts).toContain('全站文风工程化净化');
    expect(texts).toContain('上线右下角轻量反馈系统');
  });
});

describe('User Feedback Storage Suite', () => {
  const storageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    storageMock.clear();
  });

  it('should store and retrieve feedback items in localStorage _sw_feedback_list', () => {
    const mockItem: FeedbackItem = {
      id: 'fb_test_123',
      type: 'bug',
      target: '3D装机',
      content: '全景玻璃反光显示正常',
      contact: 'tester@siliconwiki.org',
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    storageMock.setItem('_sw_feedback_list', JSON.stringify([mockItem]));
    const retrieved = JSON.parse(storageMock.getItem('_sw_feedback_list') || '[]');
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].id).toBe('fb_test_123');
    expect(retrieved[0].type).toBe('bug');
    expect(retrieved[0].status).toBe('pending');
  });
});
