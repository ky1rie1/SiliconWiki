import { describe, it, expect } from 'vitest';
import {
  exportBuildToJson,
  importBuildFromJson,
  serializeBuildToUrl,
  deserializeBuildFromUrl,
  getBuildUrlParams,
  generateBuildPlainText,
  convertRecommendedBuildToCustomBuild,
} from '../utils/pcBuildShare';
import { CustomBuild } from '../types/pcBuilder';
import { HardwareRecord } from '../types/hardwareCatalog';
import { RecommendedBuild } from '../types';

describe('pcBuildShare (装机单序列化、分享与纯文本导出)', () => {
  const sampleBuild: CustomBuild = {
    schemaVersion: 1,
    id: 'test-build-1',
    title: '极客 4K 游戏生产力配置',
    targetBudget: 15000,
    slots: [
      {
        slotId: 'slot-cpu',
        type: 'cpu',
        hardwareId: 'intel-core-i7-14700k',
        userPrice: 2899,
        quantity: 1,
      },
      {
        slotId: 'slot-motherboard',
        type: 'motherboard',
        hardwareId: 'msi-z790-tomahawk',
        userPrice: 1899,
        quantity: 1,
      },
      {
        slotId: 'slot-ram',
        type: 'ram',
        hardwareId: 'kingston-fury-32g-ddr5-6000',
        userPrice: null,
        quantity: 1,
      },
      {
        slotId: 'slot-gpu',
        type: 'gpu',
        hardwareId: 'rtx-4070-super-gaming-oc',
        userPrice: 0,
        isExplicitZeroPrice: true,
        quantity: 1,
        notes: '朋友赠送闲置显卡',
      },
    ],
    notes: '双十一装机清单测试',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  };

  describe('exportBuildToJson & importBuildFromJson', () => {
    it('应当能完整导出符合 schemaVersion: 1 的 JSON 字符串并重新解析导入', () => {
      const jsonStr = exportBuildToJson(sampleBuild);
      expect(typeof jsonStr).toBe('string');

      const parsed = JSON.parse(jsonStr);
      expect(parsed.schemaVersion).toBe(1);
      expect(parsed.title).toBe('极客 4K 游戏生产力配置');
      expect(parsed.targetBudget).toBe(15000);
      expect(parsed.slots).toHaveLength(4);

      const importResult = importBuildFromJson(jsonStr);
      expect(importResult.success).toBe(true);
      expect(importResult.build).toBeDefined();
      expect(importResult.build?.slots[3].isExplicitZeroPrice).toBe(true);
      expect(importResult.build?.slots[3].userPrice).toBe(0);
    });

    it('当输入空字符串或全空格时应当报错拒绝', () => {
      expect(importBuildFromJson('').success).toBe(false);
      expect(importBuildFromJson('   ').success).toBe(false);
    });

    it('当 JSON 体积超过 64KB 限制时应当立即熔断报错', () => {
      const hugeString = 'a'.repeat(70000);
      const res = importBuildFromJson(hugeString);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/超出上限/);
    });

    it('当 schemaVersion 不为 1 时应当拒绝导入', () => {
      const invalidVersionJson = JSON.stringify({
        schemaVersion: 2,
        title: 'Future Build',
        slots: [],
      });
      const res = importBuildFromJson(invalidVersionJson);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/schemaVersion/);
    });

    it('当配件槽位类型不合法时应当拒绝导入', () => {
      const invalidTypeJson = JSON.stringify({
        schemaVersion: 1,
        title: 'Bad Slot',
        slots: [
          {
            type: 'toaster', // 不存在的配件类别
            hardwareId: 'x',
          },
        ],
      });
      const res = importBuildFromJson(invalidTypeJson);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/品类不合法/);
    });

    it('当目标预算为非法负数时应当拒绝导入', () => {
      const negativeBudgetJson = JSON.stringify({
        schemaVersion: 1,
        title: 'Negative Budget',
        targetBudget: -500,
        slots: [],
      });
      const res = importBuildFromJson(negativeBudgetJson);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/targetBudget/);
    });
  });

  describe('serializeBuildToUrl & deserializeBuildFromUrl', () => {
    it('应当能完成 URL 安全 Base64 编码并成功反序列化恢复配置', () => {
      const res = serializeBuildToUrl(sampleBuild);
      expect(res.success).toBe(true);
      expect(res.urlParam).toBeDefined();

      // 编码结果不能包含破坏 URL 的字符 (+, /, =)
      expect(res.urlParam).not.toMatch(/[+/=]/);

      const restored = deserializeBuildFromUrl(res.urlParam!);
      expect(restored).not.toBeNull();
      expect(restored?.schemaVersion).toBe(1);
      expect(restored?.title).toBe('极客 4K 游戏生产力配置');
      expect(restored?.targetBudget).toBe(15000);
      expect(restored?.slots).toHaveLength(4);
      expect(restored?.slots[0].hardwareId).toBe('intel-core-i7-14700k');
      expect(restored?.slots[3].isExplicitZeroPrice).toBe(true);
    });

    it('反序列化损坏或畸形的 Base64 字符串时应返回 null 而不抛出异常', () => {
      expect(deserializeBuildFromUrl('@@@not-base-64@@@')).toBeNull();
      expect(deserializeBuildFromUrl('')).toBeNull();
      expect(deserializeBuildFromUrl('e30=')).toBeNull(); // {} 没有 slots 和 v: 1
    });

    it('应当对中文和特殊字符安全编码与解码', () => {
      const unicodeBuild: CustomBuild = {
        schemaVersion: 1,
        id: 'u-1',
        title: '测试中文与符号 💻✨ & < > " \'',
        targetBudget: null,
        slots: [
          {
            slotId: 's1',
            type: 'cpu',
            hardwareId: null,
            customName: '自备 7800X3D 盒装散片',
            userPrice: 2200,
            quantity: 1,
          },
        ],
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      };

      const res = serializeBuildToUrl(unicodeBuild);
      expect(res.success).toBe(true);
      const restored = deserializeBuildFromUrl(res.urlParam!);
      expect(restored?.title).toBe('测试中文与符号 💻✨ & < > " \'');
      expect(restored?.slots[0].customName).toBe('自备 7800X3D 盒装散片');
    });
  });

  describe('getBuildUrlParams', () => {
    it('能正确识别 #/builds?view=custom 并保持 share 参数的大小写', () => {
      const url = 'https://computer-wiki.vercel.app/#/builds?view=custom&share=eYjN0aXRsZSI6IlhZWiJ9';
      const params = getBuildUrlParams(url);
      expect(params.view).toBe('custom');
      // 必须严格区分大小写，不能被 toLowerCase 转成小写
      expect(params.sharePayload).toBe('eYjN0aXRsZSI6IlhZWiJ9');
    });

    it('能正确识别标准 search 参数 ?tab=builds&view=custom', () => {
      const url = 'https://computer-wiki.vercel.app/?tab=builds&view=custom&share=CaseSensitiveAbC';
      const params = getBuildUrlParams(url);
      expect(params.view).toBe('custom');
      expect(params.sharePayload).toBe('CaseSensitiveAbC');
    });

    it('当 URL 无特别参数时默认返回 recommended 视图', () => {
      const url = 'https://computer-wiki.vercel.app/#/builds';
      const params = getBuildUrlParams(url);
      expect(params.view).toBe('recommended');
      expect(params.sharePayload).toBeNull();
    });

    it('能识别 #builder 简写路由并跳转至 custom 视图', () => {
      const url = 'https://computer-wiki.vercel.app/#builder';
      const params = getBuildUrlParams(url);
      expect(params.view).toBe('custom');
    });
  });

  describe('generateBuildPlainText', () => {
    it('应当输出包含标题、预算、BOM、功耗预估与免责声明的中文排版', () => {
      const text = generateBuildPlainText(sampleBuild, [], 'zh');
      expect(text).toContain('【SiliconWiki 芯知自选装机单】');
      expect(text).toContain('极客 4K 游戏生产力配置');
      expect(text).toContain('整机满载预估功耗');
      expect(text).toContain('60W 经验假设');
      expect(text).toContain('免责声明');
    });

    it('应当输出包含英文对应排版的文本', () => {
      const text = generateBuildPlainText(sampleBuild, [], 'en');
      expect(text).toContain('【SiliconWiki Custom PC Build】');
      expect(text).toContain('Notice: Generated by SiliconWiki Custom Builder');
    });
  });

  describe('convertRecommendedBuildToCustomBuild', () => {
    const mockRec: RecommendedBuild = {
      id: 'rec-test-1',
      title: '5500元 2K甜点电竞机',
      budgetLevel: '5500元档',
      targetPrice: 5500,
      tagline: '畅玩 2K 3A 与高刷电竞',
      scenario: '家庭娱乐、网游高刷',
      totalPrice: 5499,
      notes: ['散热器请撕膜后再涂硅脂', '主板建议插第2、4内存插槽'],
      parts: [
        {
          type: 'CPU',
          name: 'AMD 锐龙5 7500F',
          spec: '6核12线程 / 基础3.7GHz',
          approxPrice: 899,
          jdQuery: '锐龙 7500F',
        },
        {
          type: '显卡',
          name: '七彩虹 RTX 4060 战斧 8G',
          spec: '8GB GDDR6 / 115W',
          approxPrice: 2199,
          jdQuery: 'RTX 4060 战斧',
        },
      ],
    };

    const mockCatalog: HardwareRecord[] = [
      {
        schemaVersion: 1,
        identity: {
          id: 'amd-ryzen-5-7500f',
          category: 'cpu',
          name: 'AMD 锐龙5 7500F',
          brand: 'AMD',
          series: 'Ryzen 7000',
          releaseYear: 2023,
        },
        pricing: { launchReference: 899, referenceRange: { min: 850, max: 950 } },
        power: { watts: 65, tdpWatts: 65 },
        specifications: [],
        credibility: { overallRating: 'official-verified', sources: [], verifiedFieldCount: 2, unverifiedFieldCount: 0 },
        sources: [],
      } as unknown as HardwareRecord,
    ];

    it('当硬件目录中存在精确同名硬件时应赋予其确切 hardwareId', () => {
      const custom = convertRecommendedBuildToCustomBuild(mockRec, mockCatalog);
      expect(custom.title).toContain('5500元 2K甜点电竞机');
      expect(custom.targetBudget).toBe(5500);

      const cpuSlot = custom.slots.find((s) => s.type === 'cpu');
      expect(cpuSlot).toBeDefined();
      expect(cpuSlot?.hardwareId).toBe('amd-ryzen-5-7500f');
      expect(cpuSlot?.userPrice).toBeNull(); // 匹配成功时使用目录价
    });

    it('当硬件目录中未收录该型号时应保留原名称与参考价作为待确认项，严禁胡乱猜测替换', () => {
      const custom = convertRecommendedBuildToCustomBuild(mockRec, mockCatalog);
      const gpuSlot = custom.slots.find((s) => s.type === 'gpu');
      expect(gpuSlot).toBeDefined();
      expect(gpuSlot?.hardwareId).toBeNull();
      expect(gpuSlot?.customName).toBe('七彩虹 RTX 4060 战斧 8G');
      expect(gpuSlot?.userPrice).toBe(2199);
    });
  });
});
