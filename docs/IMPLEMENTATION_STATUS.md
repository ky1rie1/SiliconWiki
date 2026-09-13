# SiliconWiki 功能完善实施状态记录

本文档用于跟踪 SiliconWiki 的增量开发与功能完善进度。每轮任务严格聚焦一个阶段，记录真实代码检查结果、修改内容与测试验证情况。

---

## 阶段总体状态一览

| 阶段 | 阶段名称 | 状态 | 简述 |
| :--- | :--- | :--- | :--- |
| **阶段 1** | **修复真实性问题和基础交互** | **已完成（含收尾修复）** | 修复无后端伪装提交、完善 GitHub Issue 与复制降级路径、修复 URL 导航与 History 语义、收紧隐私提示、修复存储异常边界 |
| 阶段 2 | 完善结构化数据与可信度 | 未开始 | 区分芯片与具体商品、支持字段级来源快照、缺失字段标记为未知、数据状态面板 |
| 阶段 3 | 自选装机配置器与兼容性检查 | 未开始 | 我的装机单、独立纯函数兼容性评估、可解释替代建议、预算与导入导出 |
| 阶段 4 | 性能天梯与对比方法完善 | 未开始 | 区分测试场景与跑分来源、避免无序混排、支持差异高亮与合理对比 |
| 阶段 5 | 旧电脑升级助手 | 未开始 | 导入/选择旧机配件、锁定保留部件、升级瓶颈与成本评估 |
| 阶段 6 | 3D 装机挑战与故障教学 | 未开始 | 4~6 个教学情境挑战、物理/气流免责与合理示意、故障排查 |
| 阶段 7 | 页面可发现性、分享和体验收尾 | 未开始 | 硬件独立路由与分享卡片、移动端全尺寸适配、预渲染与性能 |
| 阶段 8 | 可选扩展 (AI 顾问 / PWA / CI) | 未开始 | 待用户明确授权后再行动 |

---

## 阶段 1：修复真实性问题和基础交互（已完成）

### 1. 核心修复点核查结果

- [x] **A. 检查并修复反馈提交与存储异常边界**
  - **存储异常边界**：在 `src/utils/storage.ts` 中封装安全存储访问器（`getSafeLocalStorage`, `safeGetItem`, `safeSetItem`, `safeRemoveItem`），捕获沙盒 iframe、隐身隐私模式等场景下 `window.localStorage` getter 抛出的 `SecurityError` 以及容量满时的 `QuotaExceededError`；
  - **默认参数陷阱**：在 `src/utils/feedback.ts` 中移除函数默认参数对 `window.localStorage` 的直接求值（默认参数求值发生在函数体执行前，其抛出的异常无法被函数体内部 try/catch 拦截）；
  - **结构校验**：从 LocalStorage 读取本地草稿 JSON 时执行 `Array.isArray` 数组判定与 `isValidFeedbackItem` 字段结构校验，防止异常格式或非数组对象导致运行时异常；
  - **状态文案如实呈现**：`FeedbackModal.tsx` 引入真实 `draftState: 'idle' | 'saved' | 'failed'`。本地草稿保存失败时明确提示“存储受限未保存”，绝不继续显示“草稿已安全保存”；保存失败不会阻断前往 GitHub Issue、文本复制或备用全选框；
  - **GitHub 跳转友好性**：跳转确认界面保留原生安全外部链接（`<a target="_blank" rel="noopener noreferrer">`），避免浏览器安全策略下 `window.open` 弹窗被拦截后无直接入口，且不以 `window.open` 返回值是否为 null 误判（`noopener` 在新标准浏览器中即便正常打开也会返回 null）。

- [x] **B. 导航 URL 构造与 History 语义修复**
  - **无 tab 时的 URL 构造**：在 `src/utils/navigation.ts` 中提供统一的 `computeTabNavigationUrl`、`computeDetailOpenUrl`、`computeDetailCloseUrl`，基于完整 `pathname + search + hash` 构造。当 URL 仅含 `?hardware=...` 而无 `tab` 参数时，切换标签页或关闭详情不会退化为相对 hash（如 `#/rankings`），彻底消除地址栏残留 `?hardware=...#/rankings` 的相对路径陷阱；
  - **StrictMode 副作用安全**：将 `history.pushState` / `replaceState` 移出 React `setActiveTab` 状态更新器函数，置于 `handleTabChange` 事件处理函数中。避免在 React StrictMode 开发模式下状态更新器多次触发执行导致的重复 history push；
  - **详情弹窗关闭路径分流**：
    - **应用内打开**（卡片点击或全局搜索）：记录内部打开标志，关闭详情弹窗时优先调用 `window.history.back()` 回退上一条历史，避免在历史栈中产生冗余重复的 `/wiki` 记录；
    - **分享链接直接访问**：关闭详情弹窗时采用 `window.history.replaceState` 清理 `hardware` 参数并指向 `#/wiki`，防止用户按关闭按钮直接退出本站；
  - **分类与详情状态双向同步**：监听 `popstate` / `hashchange` 事件，不仅恢复 `selectedDetailItem`，同时从 URL query 中同步 `selectedCategory`，消除浏览器前进/后退导致的分类选中状态脱节；
  - **HardwareWiki viewMode 容错**：`viewMode` 初始化与切换读写使用 `safeGetItem` / `safeSetItem`，确保存储异常时稳定降级至默认 `'grid'` 视图。

- [x] **C. 搜索热搜推荐与精准详情命中**
  - 在 `src/components/search/SearchModal.tsx` 的 `SearchResultItem` 接口中显式增加 `hardwareId?: string` 字段；
  - 热门推荐硬件显式绑定数据中心标的：`sug-1` 显式关联 `cpu-amd-9800x3d`（AMD Ryzen 7 9800X3D），`sug-2` 显式关联 `gpu-nvidia-rtx4070super`（NVIDIA GeForce RTX 4070 Super），并在 `HardwareWiki.tsx` 中增加 `gpu-rtx-4070-super` 别名规范化映射；
  - 点击或回车选中热搜硬件时，直接根据 `item.hardwareId` 切换并打开对应硬件详情弹窗，彻底弃用不稳定的字符串前缀猜测。

- [x] **D. 隐私提示收紧与 URL 脱敏**
  - **客观隐私文案**：明确区分“独立联系方式输入框”与“详细问题描述输入框”。不在未对正文进行 NLP 正则脱敏的情况下妄称“系统已自动过滤所有联系方式”；清晰警示“本 Issue 为公开内容，所有用户均可查看。独立联系方式输入框已由系统剔除未带入；详细描述由用户直接输入，请自行确认描述中未包含密码、手机号、真实姓名或敏感个人隐私”；
  - **URL 附带信息脱敏**：在 `src/utils/feedback.ts` 中实现 `sanitizePageUrl`，仅保留 `tab`、`hardware`、`category` 三个基础导航参数，彻底剥离可能残留于 URL 中的敏感 token、账号凭证及追踪参数（utm 等）。

- [x] **E. 不准确文案修正**
  - 修正“实时比价”、“实时行情”等夸大文案为“行情参考估算”、“搜寻在售店铺”；
  - 修正更新日志中“零坏链”、“真实物理级装配层级”、“确保总价精准无误差”等缺乏事实依据的措辞；
  - 修正内存等硬件条目中“零死机/零蓝屏/100% 兼容”等绝对化承诺，改为客观工程标准表述。

---

### 2. 自动化测试与验证情况

> **测试覆盖与环境说明**：
> 本项目的自动化测试运行于 Node.js (Vitest v2.1.9) 环境下。
> 涉及真实浏览器历史栈行为（如多标签间前进后退、真实跨源 iframe 沙盒拦截）已在 Node 环境中通过针对生产纯函数逻辑以及 `window.history` / `localStorage` mock 契约进行单元与集成测试。真实环境的端到端浏览器交互建议后续通过 Playwright / Cypress 进行自动化集成验证。

#### A. 自动化测试套件执行结果 (全量通过)
- 执行命令：`npm test`
- 测试统计：**18 个测试文件，127 个用例全部通过，0 失败**

| 测试文件 | 用例数 | 覆盖要点 |
| :--- | :--- | :--- |
| `src/__tests__/storage.test.ts` | 9 | `SecurityError` 捕获降级、`QuotaExceededError` 降级、非数组或损坏 JSON 结构校验过滤 |
| `src/__tests__/feedback.test.ts` | 9 | 结构化 Issue 模板、`sanitizePageUrl` 脱敏白名单、隐私警示真实性、本地草稿保存失败不阻断流程 |
| `src/__tests__/navigationAndState.test.ts` | 20 | 仅含 hardware 参数时的 URL 清理、StrictMode 单次 push 保证、应用内关闭 (back) vs 分享链接关闭 (replaceState)、popstate 分类同步、热搜 hardwareId 直达 |
| `src/__tests__/benchmarkLadder.test.ts` | 8 | 天梯榜数据解析、排序与归一化计算 |
| `src/__tests__/hardwareCatalog.test.ts` | 4 | 硬件目录索引、规范化数据查找与分类检索 |
| `src/__tests__/hardwareSearch.test.ts` | 19 | 硬件模糊搜索、缩写规范化匹配与权重评分 |
| `src/__tests__/truthfulCopy.test.ts` | 3 | 全站防夸大文案回归断言（禁止出现“实时市价/零坏链/100%兼容/绝对兼容”等退化） |
| 其余 11 个既有组件与数据测试 | 55 | 3D 装机动画、装机性能、翻译词条、配置清单等既有功能回归 |

#### B. 生产环境构建验证 (零错误通过)
- 执行命令：`npm run build` (`tsc && vite build`)
- 编译输出：TypeScript 严格类型检查通过，Vite 打包构建通过（1659 modules transformed，dist 产物完整生成）。

---

### 3. 主要产出与修改文件汇总

1. **基础库与工具函数**
   - [新建] `src/utils/storage.ts`：异常安全的 LocalStorage 读写隔离层；
   - [新建] `src/utils/navigation.ts`：规范化 URL 构造函数（`computeTabNavigationUrl`, `computeDetailOpenUrl`, `computeDetailCloseUrl` 等）；
   - [修改] `src/utils/feedback.ts`：剔除默认参数存储读取、增加 `sanitizePageUrl`、结构校验与客观隐私声明；
2. **业务组件**
   - [修改] `src/components/feedback/FeedbackModal.tsx`：引入明确的保存状态机，区分保存成功/失败，补充原生外部链接备用方案，收紧隐私文案；
   - [修改] `src/components/wiki/HardwareWiki.tsx`：完善详情弹窗历史栈逻辑（应用内 back / 外链 replaceState）、`popstate` 同步分类、安全读写 `viewMode`；
   - [修改] `src/App.tsx`：将 history 副作用移出 React state updater（消除 StrictMode 重复 push），集成安全 URL 构造；
   - [修改] `src/components/search/SearchModal.tsx`：`sug-1`、`sug-2` 及搜索硬件显式绑定 `hardwareId`，点击直达详情弹窗；
3. **自动化测试**
   - [新建] `src/__tests__/storage.test.ts`：存储异常边界与坏数据防御测试；
   - [修改] `src/__tests__/feedback.test.ts`：完善隐私提示与 URL 脱敏测试；
   - [修改] `src/__tests__/navigationAndState.test.ts`：覆盖 URL 构造边界、History 语义、分类同步与热搜直达；
4. **实施记录**
   - [修改] `docs/IMPLEMENTATION_STATUS.md`：记录阶段 1 收尾修复情况与测试覆盖指标。

---

### 4. 边界说明与后续规划

- 本阶段已完成阶段 1 所有收尾与防御性修复，历史记录语义、存储异常降级、隐私规范及自动化测试全部就绪；
- 遵循指令，**当前阶段 1 已彻底闭环，未进入阶段 2**；等待用户审查与下一步指令。
