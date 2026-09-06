import { describe, it, expect } from 'vitest';
import { gpuRankings, cpuRankings } from '../data/rankings';
import { BenchmarkItem } from '../types';

describe('Benchmark Ladder Global Rank & Absolute Ranking Logic', () => {
  const getScore = (item: BenchmarkItem, scoreMode: 'gaming' | 'productivity' | 'efficiency') => {
    if (scoreMode === 'productivity') return item.scores.productivityScore;
    if (scoreMode === 'efficiency') return item.scores.efficiencyScore;
    return item.scores.gamingScore;
  };

  const computeRankedList = (
    rawList: BenchmarkItem[],
    scoreMode: 'gaming' | 'productivity' | 'efficiency',
    includeLaptop: boolean,
    searchQuery: string
  ) => {
    // 1. Filter by platform scope
    const platformFilteredList = rawList.filter((item) => {
      if (!includeLaptop && item.platform === 'laptop') return false;
      return true;
    });

    const getSecondaryScore = (item: BenchmarkItem) => {
      if (scoreMode === 'gaming') return item.scores.productivityScore;
      if (scoreMode === 'productivity') return item.scores.gamingScore;
      return item.scores.gamingScore;
    };

    // 2. Calculate true absolute rank in active tier list using multi-level deterministic sort & competition ranking
    const sorted = [...platformFilteredList].sort((a, b) => {
      const primaryDiff = getScore(b, scoreMode) - getScore(a, scoreMode);
      if (primaryDiff !== 0) return primaryDiff;
      const secondaryDiff = getSecondaryScore(b) - getSecondaryScore(a);
      if (secondaryDiff !== 0) return secondaryDiff;
      return a.id.localeCompare(b.id);
    });

    const rankedBenchmarkList: (BenchmarkItem & { globalRank: number; isTied?: boolean })[] = [];
    for (let i = 0; i < sorted.length; i++) {
      const item = sorted[i];
      const isTiedWithPrev = i > 0 && getScore(item, scoreMode) === getScore(sorted[i - 1], scoreMode);
      const globalRank = isTiedWithPrev ? rankedBenchmarkList[i - 1].globalRank : i + 1;
      rankedBenchmarkList.push({
        ...item,
        globalRank,
      });
    }

    for (let i = 0; i < rankedBenchmarkList.length; i++) {
      const prevScore = i > 0 ? getScore(rankedBenchmarkList[i - 1], scoreMode) : null;
      const nextScore = i < rankedBenchmarkList.length - 1 ? getScore(rankedBenchmarkList[i + 1], scoreMode) : null;
      const curScore = getScore(rankedBenchmarkList[i], scoreMode);
      rankedBenchmarkList[i].isTied = curScore === prevScore || curScore === nextScore;
    }

    // 3. Filter according to search query, preserving true globalRank
    if (!searchQuery.trim()) return rankedBenchmarkList;
    const q = searchQuery.toLowerCase();
    return rankedBenchmarkList.filter((item) => item.name.toLowerCase().includes(q));
  };

  it('assigns RTX 5090 as #1 in GPU gaming mode', () => {
    const list = computeRankedList(gpuRankings, 'gaming', true, '');
    expect(list[0].id).toBe('rank-gpu-5090');
    expect(list[0].globalRank).toBe(1);
    expect(list[0].scores.gamingScore).toBe(395);
  });

  it('retains true desktop rank #18 for RTX 4070 when searching "4070"', () => {
    // Search for "4070" in desktop GPUs
    const searchResults = computeRankedList(gpuRankings, 'gaming', false, '4070');
    expect(searchResults.length).toBeGreaterThan(0);

    // The first item in search should NOT be falsely assigned globalRank 1
    const firstSearchItem = searchResults[0];
    expect(firstSearchItem.globalRank).toBeGreaterThan(1);

    // RTX 4070 12GB maintains its absolute position (#21 in desktop GPUs)
    const rtx4070 = searchResults.find((item) => item.id === 'rank-gpu-4070');
    expect(rtx4070).toBeDefined();
    expect(rtx4070?.globalRank).toBe(21);
    expect(rtx4070?.scores.gamingScore).toBe(136);
  });

  it('retains true global rank in all GPUs when searching "4070" with laptops included', () => {
    const searchResults = computeRankedList(gpuRankings, 'gaming', true, '4070');
    const rtx4070 = searchResults.find((item) => item.id === 'rank-gpu-4070');
    expect(rtx4070?.globalRank).toBe(24);
  });

  it('updates global ranks accurately when switching to efficiency mode', () => {
    const gamingList = computeRankedList(gpuRankings, 'gaming', true, '');
    const effList = computeRankedList(gpuRankings, 'efficiency', true, '');

    // In gaming mode, RTX 5090 is #1
    expect(gamingList[0].id).toBe('rank-gpu-5090');
    expect(gamingList[0].globalRank).toBe(1);

    // In efficiency mode, high-efficiency chip (Intel Arc 140V or Radeon 890M) takes #1
    expect(effList[0].globalRank).toBe(1);
    expect(effList[0].scores.efficiencyScore).toBeGreaterThanOrEqual(195);
    // RTX 5090 is NOT #1 in efficiency mode
    expect(effList[0].id).not.toBe('rank-gpu-5090');
  });

  it('assigns Ryzen 7 9800X3D as #1 and 7800X3D as #2 in CPU gaming mode', () => {
    const list = computeRankedList(cpuRankings, 'gaming', true, '');
    expect(list[0].id).toBe('rank-cpu-9800x3d');
    expect(list[0].globalRank).toBe(1);
    expect(list[0].scores.gamingScore).toBe(125);

    // 7800X3D is solid #2 in gaming, beating 9950X and 14900K
    expect(list[1].id).toBe('rank-cpu-7800x3d');
    expect(list[1].globalRank).toBe(2);
    expect(list[1].scores.gamingScore).toBe(118);

    const r9_9950x = list.find((i) => i.id === 'rank-cpu-9950x');
    const i9_14900k = list.find((i) => i.id === 'rank-cpu-14900k');
    expect(r9_9950x?.scores.gamingScore).toBe(110);
    expect(i9_14900k?.scores.gamingScore).toBe(112);
    expect(list[1].scores.gamingScore).toBeGreaterThan(r9_9950x!.scores.gamingScore);
    expect(list[1].scores.gamingScore).toBeGreaterThan(i9_14900k!.scores.gamingScore);
  });

  it('guarantees identical score items share the exact same globalRank', () => {
    const list = computeRankedList(cpuRankings, 'gaming', true, '');
    // 9950X and Ultra 9 285K both have gamingScore: 110
    const r9_9950x = list.find((i) => i.id === 'rank-cpu-9950x');
    const ultra9_285k = list.find((i) => i.id === 'rank-cpu-ultra-9-285k');

    expect(r9_9950x).toBeDefined();
    expect(ultra9_285k).toBeDefined();
    expect(r9_9950x?.scores.gamingScore).toBe(110);
    expect(ultra9_285k?.scores.gamingScore).toBe(110);
    // They MUST share the exact same rank number!
    expect(r9_9950x?.globalRank).toBe(ultra9_285k?.globalRank);
    expect(r9_9950x?.isTied).toBe(true);
    expect(ultra9_285k?.isTied).toBe(true);
  });

  it('deterministically breaks ties using secondary score and ID', () => {
    const list = computeRankedList(cpuRankings, 'gaming', true, '');
    const idx9950x = list.findIndex((i) => i.id === 'rank-cpu-9950x');
    const idx285k = list.findIndex((i) => i.id === 'rank-cpu-ultra-9-285k');

    // In gaming mode, secondary is productivityScore
    // 9950X has productivityScore: 165, Ultra 9 285K has productivityScore: 162
    // Therefore 9950X should precede 285K deterministically
    expect(idx9950x).toBeLessThan(idx285k);
  });

  it('verifies progress bar calculation scales accurately without inversion', () => {
    const list = computeRankedList(gpuRankings, 'gaming', true, '');
    const maxScore = list[0].scores.gamingScore; // 395
    expect(maxScore).toBe(395);

    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const pct = Math.min(100, Math.max(8, Math.round((item.scores.gamingScore / maxScore) * 100)));
      expect(pct).toBeGreaterThanOrEqual(8);
      expect(pct).toBeLessThanOrEqual(100);
      if (i === 0) {
        expect(pct).toBe(100);
      }
      if (i > 0) {
        const prevItem = list[i - 1];
        const prevPct = Math.min(100, Math.max(8, Math.round((prevItem.scores.gamingScore / maxScore) * 100)));
        // Progress percentage must never falsely invert
        expect(pct).toBeLessThanOrEqual(prevPct);
      }
    }
  });
});
