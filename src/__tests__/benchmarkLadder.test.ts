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

    // 2. Calculate true absolute rank in active tier list
    const rankedBenchmarkList = [...platformFilteredList]
      .sort((a, b) => getScore(b, scoreMode) - getScore(a, scoreMode))
      .map((item, index) => ({
        ...item,
        globalRank: index + 1,
      }));

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
});
