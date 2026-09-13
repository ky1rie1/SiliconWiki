import { describe, it, expect } from 'vitest';
import { recommendedBuilds } from '../data/builds';
import {
  buildTranslationsEn,
  getLocalizedBuildTitle,
  getLocalizedBuildTagline,
  getLocalizedBuildScenario,
  getLocalizedBuildNotes,
  getLocalizedPartName,
  getLocalizedPartSpec,
  getLocalizedUpgradeOption,
} from '../data/buildTranslationsEn';

describe('Budget Builds English Translations Suite', () => {
  it('should have complete English translations for all 5 recommended builds', () => {
    expect(recommendedBuilds).toHaveLength(5);
    for (const build of recommendedBuilds) {
      const en = buildTranslationsEn[build.id];
      expect(en, `Missing English translations for build: ${build.id}`).toBeDefined();
      expect(en.title.trim().length).toBeGreaterThan(5);
      expect(en.tagline.trim().length).toBeGreaterThan(10);
      expect(en.scenario.trim().length).toBeGreaterThan(10);
      expect(en.notes.length).toBe(build.notes.length);
      for (const note of en.notes) {
        expect(note.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it('should have complete English translations for all parts in all builds', () => {
    for (const build of recommendedBuilds) {
      const en = buildTranslationsEn[build.id];
      expect(Object.keys(en.parts).length).toBe(build.parts.length);
      build.parts.forEach((_part, idx) => {
        const enPart = en.parts[idx];
        expect(enPart, `Missing part translation for build ${build.id} index ${idx}`).toBeDefined();
        expect(enPart.name.trim().length).toBeGreaterThan(3);
        expect(enPart.spec.trim().length).toBeGreaterThan(3);
      });
    }
  });

  it('should have complete English translations for all upgrade options in all builds', () => {
    for (const build of recommendedBuilds) {
      const en = buildTranslationsEn[build.id];
      if (build.upgradeOptions && build.upgradeOptions.length > 0) {
        expect(Object.keys(en.upgradeOptions).length).toBe(build.upgradeOptions.length);
        for (const opt of build.upgradeOptions) {
          const enOpt = en.upgradeOptions[opt.id];
          expect(enOpt, `Missing upgrade translation for option ${opt.id} in ${build.id}`).toBeDefined();
          expect(enOpt.title.trim().length).toBeGreaterThan(3);
          expect(enOpt.description.trim().length).toBeGreaterThan(5);
          expect(enOpt.partName.trim().length).toBeGreaterThan(3);
        }
      }
    }
  });

  it('helper getters should seamlessly switch between en and zh locales', () => {
    const build = recommendedBuilds[0];
    expect(getLocalizedBuildTitle(build, 'en')).toBe(buildTranslationsEn[build.id].title);
    expect(getLocalizedBuildTitle(build, 'zh')).toBe(build.title);

    expect(getLocalizedBuildTagline(build, 'en')).toBe(buildTranslationsEn[build.id].tagline);
    expect(getLocalizedBuildTagline(build, 'zh')).toBe(build.tagline);

    expect(getLocalizedBuildScenario(build, 'en')).toBe(buildTranslationsEn[build.id].scenario);
    expect(getLocalizedBuildScenario(build, 'zh')).toBe(build.scenario);

    expect(getLocalizedBuildNotes(build, 'en')).toEqual(buildTranslationsEn[build.id].notes);
    expect(getLocalizedBuildNotes(build, 'zh')).toEqual(build.notes);

    expect(getLocalizedPartName(build.id, 0, build.parts[0].name, 'en')).toBe(buildTranslationsEn[build.id].parts[0].name);
    expect(getLocalizedPartName(build.id, 0, build.parts[0].name, 'zh')).toBe(build.parts[0].name);

    expect(getLocalizedPartSpec(build.id, 0, build.parts[0].spec, 'en')).toBe(buildTranslationsEn[build.id].parts[0].spec);
    expect(getLocalizedPartSpec(build.id, 0, build.parts[0].spec, 'zh')).toBe(build.parts[0].spec);

    const firstOpt = build.upgradeOptions![0];
    const enOpt = getLocalizedUpgradeOption(build.id, firstOpt.id, firstOpt, 'en');
    expect(enOpt.title).toBe(buildTranslationsEn[build.id].upgradeOptions[firstOpt.id].title);
    const zhOpt = getLocalizedUpgradeOption(build.id, firstOpt.id, firstOpt, 'zh');
    expect(zhOpt.title).toBe(firstOpt.title);
  });
});
