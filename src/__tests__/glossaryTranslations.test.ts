import { describe, it, expect } from 'vitest';
import { glossaryTerms } from '../data/glossary';
import {
  glossaryShortDescEn,
  glossaryTermTitlesEn,
  getLocalizedShortDesc,
  getLocalizedTermTitle,
} from '../data/glossaryTranslationsEn';

describe('Glossary English Translations Suite', () => {
  it('should have 100% coverage for all 89 glossary terms shortDesc', () => {
    expect(glossaryTerms).toHaveLength(89);
    for (const term of glossaryTerms) {
      const enDesc = glossaryShortDescEn[term.id];
      expect(enDesc, `Missing English shortDesc for term: ${term.id}`).toBeDefined();
      expect(enDesc.trim().length, `Empty English shortDesc for term: ${term.id}`).toBeGreaterThan(10);
      // Ensure it is actually in English (contains basic ASCII characters and not identical to Chinese)
      expect(enDesc).not.toBe(term.shortDesc);
    }
  });

  it('should have 100% coverage for all 89 glossary term titles', () => {
    for (const term of glossaryTerms) {
      const enTitle = glossaryTermTitlesEn[term.id];
      expect(enTitle, `Missing English title for term: ${term.id}`).toBeDefined();
      expect(enTitle.trim().length, `Empty English title for term: ${term.id}`).toBeGreaterThan(2);
    }
  });

  it('getLocalizedShortDesc should switch accurately between en and zh', () => {
    const firstTerm = glossaryTerms[0];
    expect(getLocalizedShortDesc(firstTerm, 'en')).toBe(glossaryShortDescEn[firstTerm.id]);
    expect(getLocalizedShortDesc(firstTerm, 'zh')).toBe(firstTerm.shortDesc);
  });

  it('getLocalizedTermTitle should switch accurately between en and zh', () => {
    const firstTerm = glossaryTerms[0];
    expect(getLocalizedTermTitle(firstTerm, 'en')).toBe(glossaryTermTitlesEn[firstTerm.id]);
    expect(getLocalizedTermTitle(firstTerm, 'zh')).toBe(firstTerm.term);
  });
});
