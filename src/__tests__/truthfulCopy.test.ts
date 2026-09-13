import { describe, it, expect } from 'vitest';
import { changelogList } from '../data/changelog';
import { translations } from '../i18n/translations';
import { hardwareList } from '../data/hardware';

describe('Truthful Copy and Claims Verification Suite', () => {
  it('should not contain ungrounded claims in changelog texts', () => {
    const allChangelogTexts = changelogList
      .flatMap((c) => c.updates.map((u) => u.text))
      .join('\n');

    expect(allChangelogTexts).not.toContain('零坏链');
    expect(allChangelogTexts).not.toContain('真实物理级');
    expect(allChangelogTexts).not.toContain('确保总价精准无误差');
    expect(allChangelogTexts).not.toContain('实时市价');
  });

  it('should not promise real-time price tracking in build headers', () => {
    expect(translations.zh.buildsHeroBadge).not.toContain('实时行情比价');
    expect(translations.en.buildsHeroBadge).not.toContain('Live Price Tracking');
    expect(translations.en.thAction).not.toBe('Live Pricing');
  });

  it('should not contain exaggerated compatibility or reliability claims in RAM specs', () => {
    const ramCrucial = hardwareList.find((h) => h.name.includes('Crucial Pro'));
    if (ramCrucial) {
      const pros = ramCrucial.pros.join(' ');
      expect(pros).not.toContain('零死机');
      expect(pros).not.toContain('零蓝屏');
      expect(pros).not.toContain('彻底告别');
    }

    const ramCorsair = hardwareList.find((h) => h.name.includes('Vengeance'));
    if (ramCorsair) {
      const highlights = ramCorsair.highlights.join(' ');
      expect(highlights).not.toContain('100% 兼容');
      const pros = ramCorsair.pros.join(' ');
      expect(pros).not.toContain('永不顶散热器');
    }
  });
});
