export interface BilingualOverride {
  zh: string;
  en: string;
}

/**
 * 芯知百科 (SiliconWiki) 官方默认文案与站长双语配置字典
 * 提交并永久固化至 GitHub 仓库，全平台、所有设备与 Vercel 部署即时生效。
 * 用户在开发者模式中进行的任何新增改动均会与此字典自动合并。
 */
export const defaultTextOverrides: Record<string, BilingualOverride> = {
  'SiliconWiki | 芯知硬件百科': {
    zh: 'SiliconWiki | 芯知硬件百科',
    en: 'SiliconWiki | Hardware Encyclopedia',
  },
  '探索 PC 硬件的无限细节，零基础也能轻松掌握装机与选购精髓': {
    zh: '探索 PC 硬件的无限细节，零基础也能轻松掌握装机与选购精髓',
    en: 'Explore infinite PC hardware details, master PC building and component selection effortlessly',
  },
  '全方位硬件指南 · 3D 互动装机 · 真实天梯跑分': {
    zh: '全方位硬件指南 · 3D 互动装机 · 真实天梯跑分',
    en: 'Comprehensive Hardware Guide · 3D PC Simulator · Real Multi-dimensional Benchmarks',
  },
  '汇聚多维度综合跑分测试结果，直观量化不同世代处理器的性能阶梯': {
    zh: '汇聚多维度综合跑分测试结果，直观量化不同世代处理器的性能阶梯',
    en: 'Multi-dimensional benchmark scores quantifying processor performance ladders across generations',
  },
  '真实比例体素化部件与气流模拟，沉浸式体验从零搭建一台理想主机': {
    zh: '真实比例体素化部件与气流模拟，沉浸式体验从零搭建一台理想主机',
    en: 'True-scale voxel components and airflow simulation for an immersive PC building journey',
  },
  '深度解析 75+ 核心技术术语，从底层芯片架构到散热微结构一览无余': {
    zh: '深度解析 75+ 核心技术术语，从底层芯片架构到散热微结构一览无余',
    en: 'In-depth breakdown of 75+ hardware technical terms and micro-architectures',
  },
  '近期微跌 · 性价比高': {
    zh: '近期微跌 · 性价比高',
    en: 'Price Dropped · High Value',
  },
  '行情平稳': {
    zh: '行情平稳',
    en: 'Stable Market Price',
  },
  '略有上涨': {
    zh: '略有上涨',
    en: 'Slight Price Rise',
  },
  '溢价明显 / 紧俏': {
    zh: '溢价明显 / 紧俏',
    en: 'Premium / Low Stock',
  },
};
