# SiliconWiki 功能完善实施状态记录

本文档用于跟踪 SiliconWiki 的增量开发与功能完善进度。每轮任务严格聚焦一个阶段，记录真实代码检查结果、修改内容与测试验证情况。

---

## 阶段总体状态一览

| 阶段 | 阶段名称 | 状态 | 简述 |
| :--- | :--- | :--- | :--- |
| **阶段 1** | **修复真实性问题和基础交互** | **已完成（源码审查认可、真实浏览器验证待补）** | 修复无后端伪装提交、完善 GitHub Issue 与复制降级路径、修复 ThemeContext 存储异常与入口安全、统一导航 History 状态写入并防止元数据丢失、收紧隐私提示 |
| **阶段 2** | **完善结构化数据与可信度** | **已完成（全量测试与构建通过）** | 区分芯片核心与具体商品变体、来源类别与核验状态分离、未知字段严谨化、数据状态汇总面板（详见 docs/PHASE_2_PLAN.md） |
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
  - **ThemeContext 存储异常修复**：`src/context/ThemeContext.tsx` 移除了直接对 `localStorage.getItem` 和 `localStorage.setItem` 的调用，接入 `safeGetItem` / `safeSetItem`。读取受限时安全回退至系统媒体查询（`prefers-color-scheme`）或默认 `'dark'`；写入失败时静默降级，当前页面仍可自由切换主题；
  - **应用顶层入口安全**：鉴于 `ThemeProvider` 位于根组件 `App.tsx` 外层（不在 `RouteErrorBoundary` 保护范围内），编写了应用根入口挂载级别的自动化测试，确保即便存储完全受阻，整个应用依然能正常渲染而不出现白屏；
  - **默认参数陷阱**：在 `src/utils/feedback.ts` 中移除函数默认参数对 `window.localStorage` 的直接求值（默认参数求值发生在函数体执行前，其抛出的异常无法被函数体内部 try/catch 拦截）；
  - **结构校验**：从 LocalStorage 读取本地草稿 JSON 时执行 `Array.isArray` 数组判定与 `isValidFeedbackItem` 字段结构校验，防止异常格式或非数组对象导致运行时异常；
  - **状态文案如实呈现**：`FeedbackModal.tsx` 引入真实 `draftState: 'idle' | 'saved' | 'failed'`。本地草稿保存失败时明确提示“存储受限未保存”，绝不继续显示“草稿已安全保存”；保存失败不会阻断前往 GitHub Issue、文本复制或备用全选框；
  - **GitHub 跳转友好性**：跳转确认界面保留原生安全外部链接（`<a target="_blank" rel="noopener noreferrer">`），避免浏览器安全策略下 `window.open` 弹窗被拦截后无直接入口，且不以 `window.open` 返回值是否为 null 误判。

- [x] **B. 导航 URL 构造与 History 状态语义修复**
  - **统一导航写入与元数据保护**：修复了此前从搜索打开详情时，`SearchModal` 执行 `pushState` 后被 `App.tsx` 内部 `replaceState({ tab: 'wiki' })` 冲掉 `swDetail` 元数据的缺陷。改由 `App.tsx` 的 `handleTabChange` 统一写入导航历史，支持传入 `options.historyState` 并于 `replace: true` 时合并既有状态，保留 `swDetail: true` 与 `hardware: hwId`；
  - **元数据隔离**：普通页面切换（如在 Navbar 点击天梯榜等标签页）保持纯净的 `{ tab: newTab }`，绝不无条件将 `swDetail` 污染继承到常规路由；
  - **详情弹窗关闭路径严格分流**：
    - **应用内打开**（卡片点击、热门推荐、关键词搜索、从其他页面搜索）：由于保留了 `history.state.swDetail: true` 或内部 push 标记，关闭弹窗时准确调用 `window.history.back()` 回退到进入详情前的上一条历史，杜绝残留重复 `/wiki` 历史记录；
    - **外部直接分享链接进入**：识别无内部历史栈标记，关闭详情弹窗时采用 `window.history.replaceState` 清理 `hardware` 参数并指向 `#/wiki`，防止用户按关闭按钮直接退出本站；
  - **无 tab 时的 URL 构造**：在 `src/utils/navigation.ts` 中提供统一的 `computeTabNavigationUrl`、`computeDetailOpenUrl`、`computeDetailCloseUrl`，基于完整 `pathname + search + hash` 构造。当 URL 仅含 `?hardware=...` 而无 `tab` 参数时，切换标签页或关闭详情不会退化为相对 hash（如 `#/rankings`），彻底消除地址栏残留 `?hardware=...#/rankings` 的相对路径陷阱；
  - **StrictMode 副作用安全**：将 `history.pushState` / `replaceState` 移出 React `setActiveTab` 状态更新器函数，置于 `handleTabChange` 事件处理函数中，避免 StrictMode 多次触发导致的重复 push；
  - **分类与详情状态双向同步**：监听 `popstate` / `hashchange` 事件，不仅恢复 `selectedDetailItem`，同时从 URL query 中同步 `selectedCategory`，消除浏览器前进/后退导致的分类选中状态脱节；
  - **HardwareWiki viewMode 容错**：`viewMode` 初始化与切换读写使用 `safeGetItem` / `safeSetItem`，确保存储异常时稳定降级至默认 `'grid'` 视图。

- [x] **C. 搜索热搜推荐与精准详情命中**
  - 在 `src/components/search/SearchModal.tsx` 的 `SearchResultItem` 接口中显式增加 `hardwareId?: string` 字段；
  - 热门推荐硬件显式绑定数据中心标的：`sug-1` 显式关联 `cpu-amd-9800x3d`（AMD Ryzen 7 9800X3D），`sug-2` 显式关联 `gpu-nvidia-rtx4070super`（NVIDIA GeForce RTX 4070 Super），并在 `HardwareWiki.tsx` 中增加 `gpu-rtx-4070-super` 别名规范化映射；
  - 点击或回车选中热搜硬件时，直接根据 `item.hardwareId` 切换并打开对应硬件详情弹窗，弃用不稳定的字符串前缀猜测。

- [x] **D. 隐私提示收紧与 URL 脱敏**
  - **客观隐私文案**：明确区分“独立联系方式输入框”与“详细问题描述输入框”。不在未对正文进行 NLP 正则脱敏的情况下妄称“系统已自动过滤所有联系方式”；清晰警示“本 Issue 为公开内容，所有用户均可查看。独立联系方式输入框已由系统剔除未带入；详细描述由用户直接输入，请自行确认描述中未包含密码、手机号、真实姓名或敏感个人隐私”；
  - **URL 附带信息脱敏**：在 `src/utils/feedback.ts` 中实现 `sanitizePageUrl`，仅保留 `tab`、`hardware`、`category` 三个基础导航参数，彻底剥离可能残留于 URL 中的敏感 token、账号凭证及追踪参数（utm 等）。

- [x] **E. 不准确文案修正**
  - 修正“实时比价”、“实时行情”等夸大文案为“行情参考估算”、“搜寻在售店铺”；
  - 修正更新日志中“零坏链”、“真实物理级装配层级”、“确保总价精准无误差”等缺乏事实依据的措辞；
  - 修正内存等硬件条目中“零死机/零蓝屏/100% 兼容”等绝对化承诺，改为客观工程标准表述。

---

### 2. 自动化测试与多层级验证情况

> **测试分层与验收边界说明**：
> 严格区分“服务端渲染检查”、“客户端组件测试”与“真实浏览器测试”，只有实际执行并完全通过验证的项目才标记为已验收：
> - **服务端渲染检查 (SSR Check)**：使用 `renderToString` 进行无 DOM 阶段的防御性安全检查，确保根级组件在环境受限（如 storage getter 抛 `SecurityError`）时不抛出未捕获异常导致整站崩溃；
> - **客户端组件测试 (Client-Side Component DOM Testing)**：基于 `happy-dom` 环境使用 React 18 官方标准的 `createRoot` + `act` 渲染生产 `<App />` 根组件，**禁止在测试代码中复制业务处理函数**，完全通过真实 DOM 事件（点击搜索、输入关键词、选择搜索项、点击关闭按钮、点击导航标签、点击主题切换按钮）驱动生产状态机，断言可见 DOM 节点生命周期（`[role="dialog"]` 出现与销毁、`document.documentElement` 主题 class 真实反转）以及 `window.history.state` 与 URL 契约；
> - **测试有效性逆向验证 (Red-Green Verification)**：在临时破坏性实验中证实，移除 `SearchModal` 中的 `swDetail` 传递会导致导航回退测试断言失败，恢复 `ThemeContext` 的裸 `localStorage.getItem` 会导致受限存储挂载测试报错，证明测试用例真实有效且具备防御性回归拦截能力；
> - **真实浏览器测试 (Real Browser Testing)**：涉及真实浏览器物理前进/后退手势、多标签页历史出栈、移动端真实手势等物理特性，明确记录环境边界，**不把 happy-dom 的模拟行为或 history.back 调用直接等同于跨平台真实浏览器回退成功**，标记为待人工/端到端浏览器实测。

#### A. 自动化测试套件执行结果 (全量通过)
- 执行命令：`npm test`
- 测试统计：**19 个测试文件，132 个用例全部通过，0 失败**

| 测试层级 / 类别 | 文件 | 用例数 | 验收状态 | 覆盖要点与验证边界 |
| :--- | :--- | :--- | :--- | :--- |
| **服务端渲染检查** | `src/__tests__/componentRegression.test.tsx` | 1 | **已通过** | `renderToString(<App />)` 在 `localStorage` 抛出 `SecurityError` 时的安全初始化检查 |
| **客户端组件交互测试** | `src/__tests__/componentRegression.test.tsx` | 8 | **已通过** | **真实生产组件挂载与 DOM 交互**：<br>1. 客户端受限存储挂载安全（`createRoot` + `act` 挂载 `App`，验证导航与品牌 DOM 正常渲染）；<br>2. 真实主题切换按钮点击测试（`setItem` 失败时点击实际 DOM 按钮，断言 `document.documentElement` class 真实改变为浅色/深色，无未捕获异常）；<br>3. **Flow 1**：百科 → 热门硬件推荐 → 详情 DOM 出现 → 点击关闭按钮 → 详情 DOM 销毁，`history.state` 干净出栈；<br>4. **Flow 2**：百科 → 输入关键词 "4070" → 选择硬件项 → 详情出现 → 点击关闭；<br>5. **Flow 3**：天梯榜 → 打开搜索选择硬件 → 详情出现（跨 Tab 导航）→ 关闭后准确返回天梯榜 DOM 状态；<br>6. **Flow 4**：直接分享链接进入（null state）→ 点击关闭后执行 `replaceState` 留在本站，断言不触发 `history.back()`；<br>7. **Flow 5**：从打开详情状态切换到普通标签页，断言 `swDetail` 完全隔离不被继承；<br>8. **Flow 6**：硬件卡片实际点击 → 详情出现 → 点击关闭。 |
| **纯函数与存储契约** | `src/__tests__/storage.test.ts` | 9 | **已通过** | `SecurityError` 捕获降级、`QuotaExceededError` 降级、非数组与损坏 JSON 结构校验过滤 |
| **反馈逻辑与脱敏** | `src/__tests__/feedback.test.ts` | 9 | **已通过** | 结构化 Issue 模板、`sanitizePageUrl` 白名单、隐私警示文案、本地保存失败不阻断流程 |
| **导航工具与状态** | `src/__tests__/navigationAndState.test.ts` | 16 | **已通过** | 仅含 hardware 参数时的规范化 URL 清理、相对 Hash 消除、分类解析与切换 URL、热搜推荐 hardwareId 校验 |
| **业务计算与检索** | 其余 14 个测试套件 | 89 | **已通过** | 天梯榜归一化、目录索引、硬件模糊搜索、防夸大文案审查、3D 模拟性能与词汇表翻译等 |

#### B. 生产环境构建验证 (零错误通过)
- 执行命令：`npm run build` (`tsc && vite build`)
- 编译输出：TypeScript 严格类型检查通过（0 error, 0 warning），Vite 生产打包构建通过（1659 modules transformed，dist 产物完整生成）。

#### C. 测试层级与人工核验状态
- [x] **服务端渲染检查 (SSR Check)**：已验证通过；
- [x] **客户端组件测试 (happy-dom + React 18 createRoot/act)**：已验证通过；
- [ ] **真实浏览器跨设备测试 (Chrome / Safari / Firefox / Edge)**：待人工验证；
- [ ] **移动端手势与原生分享进入退出 (iOS Safari / Android Chrome)**：待人工验证。

---

### 3. 主要产出与修改文件汇总

1. **基础库与工具函数**
   - [新建] `src/utils/storage.ts`：异常安全的 LocalStorage 读写隔离层；
   - [新建] `src/utils/navigation.ts`：规范化 URL 构造函数（`computeTabNavigationUrl`, `computeDetailOpenUrl`, `computeDetailCloseUrl` 等）；
   - [修改] `src/utils/feedback.ts`：剔除默认参数存储读取、增加 `sanitizePageUrl`、结构校验与客观隐私声明；
2. **业务组件**
   - [修改] `src/context/ThemeContext.tsx`：接入 `safeGetItem` / `safeSetItem`，消除存储受限时的崩溃隐患，确保存储故障时页面主题仍能切换；
   - [修改] `src/App.tsx`：统一导航 History 写入，支持 `historyState` 携带与 `replace` 元数据保护，消除 StrictMode 双重 push；
   - [修改] `src/components/search/SearchModal.tsx`：统一委托 `onNavigate` 写入详情历史（保留 `swDetail`），绑定热搜 hardwareId；
   - [修改] `src/components/wiki/HardwareWiki.tsx`：详情弹窗关闭分流（应用内 back / 外链 replaceState）、popstate 分类同步、安全读写 `viewMode`；
   - [修改] `src/components/feedback/FeedbackModal.tsx`：诚实保存状态机、原生外部链接备用方案、细化隐私文案；
3. **自动化测试**
   - [新建] `src/__tests__/componentRegression.test.tsx`：使用真实生产组件验证 ThemeContext 异常与 7 类核心 History 交互流程；
   - [新建] `src/__tests__/storage.test.ts`：存储异常边界与坏数据防御测试；
   - [修改] `src/__tests__/feedback.test.ts`：完善隐私提示与 URL 脱敏测试；
   - [修改] `src/__tests__/navigationAndState.test.ts`：规范化 URL 构造与查询参数同步测试；
4. **实施记录**
   - [修改] `docs/IMPLEMENTATION_STATUS.md`：更新收尾遗漏修复记录与客观测试环境说明。

---

### 4. 边界说明与后续规划

- **阶段 1 收尾确认**：所有源码审查问题与自动化测试已彻底闭环并通过回归验证，状态标记为“已完成（源码审查认可、真实浏览器验证待补）”，剩余真实跨浏览器与移动端真机实操已记录入待办，不再反复重构已稳定代码；
- **阶段 2 交付确认**：阶段 2（完善结构化数据与可信度建设）已全面实施并通过自动化测试与生产构建验证，详见下方“阶段 2”章节。

---

## 阶段 2：完善结构化数据与可信度建设（已完成）

详细需求与数据模型规范保存在 [`docs/PHASE_2_PLAN.md`](./PHASE_2_PLAN.md)。本阶段所有产出已全部通过全量自动化回归测试与生产编译打包。

### 1. 核心改进项核查结果

- [x] **A. 实体层级建模（芯片架构 vs 公版参考品 vs 非公商品变体）**
  - 在 `src/types/hardwareSources.ts` 中引入 `EntityKind = 'chip' | 'reference-product' | 'partner-variant'`，彻底消除此前将“核心代号/芯片规格”与“具体零售长宽高/供电接口”混杂的架构缺陷；
  - 在 `src/types/hardwareCatalog.ts` 中扩展 `HardwareRecord.entityKind` 与 `variantDetails`（包含长宽高 mm、PCIe 槽厚、辅助供电接口形态、原厂建议整机电源功率）；
  - 将公版卡与非公卡解耦：
    - `gpu-nvidia-rtx4070super`（NVIDIA GeForce RTX 4070 Super）定性为 `reference-product`，规格源自原厂官方白皮书；
    - 新增独立硬件条目 `gpu-colorful-rtx4070s-ultra-w`（七彩虹 iGame GeForce RTX 4070 SUPER Ultra W OC），定性为 `partner-variant`，明确记录其实测 313.5mm 长度、2.5 槽厚度及 16-pin (12VHPWR/12V-2x6) 供电规格；
    - 在详情页中明确提示“具体非公显卡的长宽高、厚度与供电接口可能不同，请以具体品牌型号为准”。

- [x] **B. 来源类别与核验状态完全分离（防虚构核验日期）**
  - 在 `src/types/hardwareSources.ts` 中定义独立枚举：
    - `SourceKind = 'manufacturer' | 'product-database' | 'editorial' | 'unknown'`；
    - `VerificationStatus = 'verified' | 'unverified'`；
  - 每个事实记录包含明确的 `checkedAt`（YYYY-MM-DD）。对于编辑经验条目或未核验项，**绝对禁止自动填入当天日期或硬编码假日期**；
  - 详情页字段呈现上，已核验项显示绿色徽标（`✓ 已官方核验 · 2024-11-07`），未核验项显示黄色虚线徽章（`待核验`），杜绝混淆。

- [x] **C. 未知字段严谨化与安全排序**
  - **数值型未知值防御**：缺失功耗或 `tdpWatts <= 0` 统一处理为 `watts: null, isKnown: false`，界面显示“功耗未记录”，杜绝未核验配件变成 `0W`“超低功耗神器”；
  - **价格未知值防御**：缺失价格或零区间统一处理为 `min: null, max: null, isKnownRange: false`，卡片与详情均显示“暂无价格参考”，杜绝出现 `¥0`“免费神卡”；
  - **尺寸未知值防御**：未核验具体长宽高的芯片核心不伪造尺寸，防止兼容性引擎误判“肯定装得下”；
  - **安全排序纯函数**：在 `src/utils/hardwareCatalog.ts` 中实现 `safeSortHardwareByPrice` 与 `safeSortHardwareByTdp`，将未知功耗与未知价格的条目稳定归入末尾（排在已知项之后），杜绝 `NaN`、`Infinity` 导致的排序错乱与列表崩溃。

- [x] **D. 透明核验口径与分母基准 ($X/Y$)**
  - 建立全品类 9 大核心规格标准基准（`CATEGORY_CORE_FIELDS`），严格固定分母 $Y$：
    - CPU: 7 项 | GPU: 8 项 | 主板: 6 项 | 内存: 5 项 | 存储: 5 项 | 电源: 5 项 | 散热: 4 项 | 机箱: 5 项 | 笔记本: 6 项；
  - **严谨分离全部已核验字段与核心已核验字段**：
    - `computeAuditSummary` 分别返回 `verifiedFieldCount`（全量已核验字段数）、`verifiedCoreCount`（已核验核心字段数）与 `coreFieldTotal`（核心基准分母）；
    - 核心徽标、核验率（`verificationRate = verifiedCoreCount / coreFieldTotal`）与缺失核心字段清单使用严格一致的统计口径；
    - 典型示例：RTX 5090 核心核验准确核算为 4/8 项，另有 2 项额外已核验非核心字段（总核验 6 项），卡片与弹窗准确呈现为核心 4/8，彻底纠正此前误将总数 6 当作核心 6/8 的口径缺陷；
  - 详情页与汇总面板文案与算法保持一致，明确采用品类核心基准标准计算。

- [x] **E. 严密来源有效性校验与第三方来源解耦**
  - **校验防御**：实现 `isValidSourceUrl`（限制 http/https 协议）与 `isValidCheckDate`（严格校验 YYYY-MM-DD 格式），来源 URL 无效或核验日期损坏时不得计入已核验；
  - **真实状态判断**：杜绝仅凭 `Boolean(fact)` 判定为官方核验；显式标记 `status === 'unverified'` 的字段绝不产生已核验证据标签；
  - **第三方来源独立绑定**：支持第三方事实记录（如 ZOL 中关村在线）关联至真实第三方来源对象，杜绝将第三方数据硬编码指向厂商官方来源。

- [x] **F. 全入口未知值统一防御与安全排序**
  - **全场景统一样式**：在 `src/utils/hardwareCatalog.ts` 中封装 `formatHardwarePrice` 与 `formatHardwareTdp`，在卡片、详情弹窗、尺寸面板、表格视图及全局搜索弹窗中统一应用；
  - 未知价格绝不显示 `¥0~¥0` 或 `¥0`，统一显示“价格未记录”或“暂无参考价”；未知功耗绝不显示 `0W` 或虚标“标准功耗”，统一显示“功耗未记录”；
  - **表格视图三态排序与末尾归并**：修复 `HardwareTableView.tsx` 价格与功耗列排序三态逻辑（降序 -> 升序 -> 取消），并保证在升序和降序两种状态下，未知值条目均稳定排在列表末尾，避免未知价格在升序排序中冲到顶部。

- [x] **G. 非公品牌实测与物理规格严谨化**
  - 修正七彩虹 RTX 4070 SUPER Ultra W OC 供电接口描述为 `16-pin (12VHPWR / 12V-2x6)`，与规格表严格对应；
  - 完善显卡尺寸字段核验记录（`gpu.dimensions`，核验日期 `2026-09-11`）；
  - 剔除未经实验室仪器测量的“实测”夸大用词，客观表述为“已依据七彩虹官方规格表核验”。

---

### 2. 自动化测试与质量验收

- **测试套件执行**：`npm test`
  - **20 个测试文件全部通过，共 150 个用例全部通过，0 失败**；
  - `src/__tests__/hardwareCredibility.test.tsx` 扩展至 18 个用例，包含针对提交 8a0b9f64 的 7 项专属回归测试：
    1. 统计口径隔离：RTX 5090 核心字段 4/8，总核验字段 6 项；
    2. 无效来源 URL（如 javascript: 伪协议）与损坏日期（非 YYYY-MM-DD）防御拦截；
    3. 显式 unverified 字段不生成官方核验徽标；
    4. 第三方事实记录正确绑定第三方数据源 ID；
    5. 卡片、表格、搜索弹窗全入口未知价格统一格式化（无 ¥0 漏网）；
    6. 表格升序与降序时未知价格均稳定置底；
    7. 非公变体供电接口文案一致性与去虚构描述校验。
- **生产构建验证**：`npm run build` (`tsc && vite build`)
  - TypeScript 严格类型检查 0 错误；
  - Vite 生产打包 0 警告 0 错误（产物位于 `dist/`）。

---

### 3. 本阶段产出与修改文件汇总

1. **类型定义与工具库**
   - [修改] `src/types/hardwareSources.ts`：增加 `EntityKind`, `SourceKind`, `VerificationStatus`，补充 `gpu.dimensions` 字段 ID 与 `sourceId`；
   - [修改] `src/types/hardwareCatalog.ts`：扩展 `HardwareRecord`（`verifiedCoreCount`, `entityKind`, `variantDetails`, `auditSummary` 等）；
   - [新建] `src/utils/dataCredibilityStats.ts`：全品类可信度指标计算纯函数 `computeCatalogCredibilityStats`；
   - [修改] `src/utils/hardwareCatalog.ts`：定义 9 大品类核心字段分母基准 `CATEGORY_CORE_FIELDS`，实现 `computeAuditSummary`（口径分离）、`formatHardwarePrice`、`formatHardwareTdp`、`isValidSourceUrl`、`isValidCheckDate`、`safeSortHardwareByPrice`、`safeSortHardwareByTdp`；
2. **硬件数据底册**
   - [修改] `src/data/sources/verifiedHardware.ts`：补充官方核验记录、拆分实体类型，完善尺寸核验与供电接口一致性，剔除“实测”浮夸文案；
   - [修改] `src/data/hardware/gpus.ts`：新增 `gpu-colorful-rtx4070s-ultra-w` 非公显卡条目；
3. **界面呈现组件**
   - [新建] `src/components/wiki/DataCredibilityModal.tsx`：全站数据可信度与核验状态汇总弹窗，文案对齐算法口径；
   - [修改] `src/components/wiki/HardwareWiki.tsx`：接入“数据可信度”工具栏按钮与汇总弹窗；
   - [修改] `src/components/wiki/HardwareTableView.tsx`：修复三态排序与未知值末尾归并，接入统一格式化器；
   - [修改] `src/components/wiki/HardwareCard.tsx`：展示核心已核验比率，接入统一格式化器；
   - [修改] `src/components/wiki/HardwareMeasurements.tsx`：实体层级标签、字段级核验状态、折叠来源与待核验清单、统一价格防御；
   - [修改] `src/components/wiki/HardwareDetailModal.tsx`：头部可信度徽章口径对齐、表格字段打钩标示；
   - [修改] `src/components/search/SearchModal.tsx`：接入统一价格格式化器，防止未知价格在搜索条目副标题显示 `¥0~¥0`；
4. **自动化测试**
   - [新建] `src/__tests__/hardwareCredibility.test.tsx`：纯函数与真实 DOM 组件交互自动化验收套件（18 个测试用例）；
5. **项目文档**
   - [新建] `docs/PHASE_2_PLAN.md`：阶段 2 需求规范与实施计划；
   - [修改] `docs/IMPLEMENTATION_STATUS.md`：更新阶段 2 实施与审查修复验收记录。


