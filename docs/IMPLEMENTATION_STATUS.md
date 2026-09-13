# SiliconWiki 功能完善实施状态记录

本文档用于跟踪 SiliconWiki 的增量开发与功能完善进度。每轮任务严格聚焦一个阶段，记录真实代码检查结果、修改内容与测试验证情况。

---

## 阶段总体状态一览

| 阶段 | 阶段名称 | 状态 | 简述 |
| :--- | :--- | :--- | :--- |
| **阶段 1** | **修复真实性问题和基础交互** | **已完成** | 修复无后端伪装提交、完善 GitHub Issue 与复制降级路径、修复杂乱导航与详情弹窗 URL 同步、修正虚假宣传文案 |
| 阶段 2 | 完善结构化数据与可信度 | 未开始 | 区分芯片与具体商品、支持字段级来源快照、缺失字段标记为未知、数据状态面板 |
| 阶段 3 | 自选装机配置器与兼容性检查 | 未开始 | 我的装机单、独立纯函数兼容性评估、可解释替代建议、预算与导入导出 |
| 阶段 4 | 性能天梯与对比方法完善 | 未开始 | 区分测试场景与跑分来源、避免无序混排、支持差异高亮与合理对比 |
| 阶段 5 | 旧电脑升级助手 | 未开始 | 导入/选择旧机配件、锁定保留部件、升级瓶颈与成本评估 |
| 阶段 6 | 3D 装机挑战与故障教学 | 未开始 | 4~6 个教学情境挑战、物理/气流免责与合理示意、故障排查 |
| 阶段 7 | 页面可发现性、分享和体验收尾 | 未开始 | 硬件独立路由与分享卡片、移动端全尺寸适配、预渲染与性能 |
| 阶段 8 | 可选扩展 (AI 顾问 / PWA / CI) | 未开始 | 待用户明确授权后再行动 |

---

## 阶段 1：修复真实性问题和基础交互（已完成）

### 1. 验收项核查结果
- [x] **A. 检查并修复反馈提交**
  - 代码核对确认项目为纯静态 SPA（部署于 Vercel / GitHub Pages），无任何中心化后端数据库；
  - 移除了“反馈已成功提交！你的反馈已实时同步至后台管理看板”等误导性文案；
  - 实现“填写反馈 → 前往 GitHub Issue 页面确认提交”轻量方案（按钮文案：“前往 GitHub 提交 / Continue to GitHub Issue”）；
  - 点击后以结构化模板在新标签页打开 GitHub Issue，前端界面进入“请在 GitHub 页面确认提交”提示状态，说明需要用户点击「Submit new issue」完成最终提交，不冒充已提交成功；
  - 提供“复制反馈文本”完整备选方案，剪贴板写入受阻时降级为可手动全选的文本框并弹出明确警示；
  - 隐私保护：弹窗醒目展示隐私说明，禁止在公开 Issue 模版中带入联系方式（邮箱/微信）；联系方式仅作为当前设备本地草稿保留；
  - 容错处理：本地草稿写入 LocalStorage 时捕获 QuotaExceededError / SecurityError，存储受限时弹出诚实提示，不伪装成功。
- [x] **B. 检查基础导航和状态**
  - 主动切换标签页（Navbar、Footer、WikiIntro 等）改用 `window.history.pushState`，用户点击浏览器后退可返回上一标签页；点击相同标签页保持 `replaceState` 避免历史栈重复堆叠；
  - 打开硬件详情弹窗时，URL 自动同步追加 `hardware=<id>` 并记录 history，页面刷新后能精准恢复该硬件详情弹窗；
  - 关闭硬件详情弹窗时，URL 自动移除 `hardware` 参数，保持界面与地址栏绝对一致；
  - 监听 `popstate` / `hashchange`，浏览器点击后退或前进时，若 hardware 参数移除则自动关闭详情弹窗，完全符合用户心理预期；
  - 完美兼容历史分享链接格式：`?tab=wiki&hardware=...`、`?hardware=...`、`#/hardware-id`、`#hardware-id`；
  - 切换标签页离开百科时自动清理 `hardware` 详情参数，避免跨页参数污染；
  - 全局搜索（Omnisearch）选中具体硬件型号时，直达该硬件详情弹窗；
  - 分类切换状态（`category=gpu` 等）同步至 URL 查询参数并支持刷新恢复；
  - 语言切换同步更新 `document.documentElement.lang`，且 `localStorage` 读写已包裹 try/catch 异常隔离。
- [x] **C. 检查并修正不准确文案**
  - `src/i18n/translations.ts`：将“科学装机配置单与实时行情比价”（英文“Verified Build BOMs & Live Price Tracking”、“Live Pricing”）修正为客观的“科学装机配置单与行情参考估算”（英文“Curated Build BOMs & Price References”、“Search Stores”）；
  - `src/data/changelog.ts`：移除“真实物理级装配层级”（改为“装配层级与确定性时间线”）、“实现全站技术文档零坏链”（改为“完成外链审计并修复失效链接，持续跟踪技术文档可用性”）、“确保总价精准无误差”、“实时市价”等无事实依据的高调修饰；
  - `src/data/hardware/ram.ts`：移除“零死机、零蓝屏、彻底告别不稳定”、“100% 兼容各类巨型双塔风冷”、“永不顶散热器”等绝对化承诺，修正为“遵循 JEDEC 原厂规范”、“低高度避让绝大多数双塔风冷”等客观工程描述；
  - `src/components/wiki/LaptopSection.tsx`：将“精选标杆笔记本系列与实时比价”修正为“精选标杆笔记本系列与配置参考”。
- [x] **D. 自动化测试与构建验证**
  - 全量运行 `npm test`：17 个测试文件、106 个测试全部通过（新增 3 个测试套件，涵盖反馈生成/隐私过滤/剪贴板、导航状态与后退同步、真实文案约束）；
  - 全量运行 `npm run build`：生产环境 TypeScript 编译与 Vite 生产打包零警告零错误通过。

### 2. 主要修改文件与职责
- [新建] `src/utils/feedback.ts`：反馈处理纯函数模块，负责构建结构化 GitHub Issue 链接、剔除敏感隐私信息、剪贴板 Markdown 格式化、本地安全读写。
- [新建] `src/__tests__/feedback.test.ts`：反馈链接生成、隐私过滤与存储异常降级测试。
- [新建] `src/__tests__/navigationAndState.test.ts`：详情弹窗 URL 联动、前进后退恢复、新旧分享链接兼容性测试。
- [新建] `src/__tests__/truthfulCopy.test.ts`：全站夸大文案（实时/零坏链/物理级/绝对兼容）防退化回归测试。
- [修改] `src/components/feedback/FeedbackModal.tsx`：重构反馈弹窗，移除虚假“已同步后台”，接入真实 GitHub Issue 跳转、复制备选及隐私保护提示。
- [修改] `src/components/admin/QuickTextEditorModal.tsx`：澄清反馈列表为“当前设备本地记录”，为 LocalStorage 读写添加异常捕获。
- [修改] `src/components/wiki/HardwareWiki.tsx`：打通详情弹窗与 URL `hardware` 参数双向绑定，支持浏览器前进后退开关弹窗，支持分类 URL 持久化。
- [修改] `src/App.tsx`：完善导航 history 语义（标签切换 pushState，防重复堆栈，离开 wiki 清理详情参数），LocalStorage 安全处理。
- [修改] `src/components/search/SearchModal.tsx`：修复搜索硬件后无法直达详情弹窗的问题。
- [修改] `src/context/LanguageContext.tsx`：增加 LocalStorage 安全降级并同步 `document.documentElement.lang`。
- [修改] `src/i18n/translations.ts`：修正“实时比价”、“实时行情”等文案。
- [修改] `src/data/changelog.ts`：修正更新日志中的绝对化夸大用词。
- [修改] `src/data/hardware/ram.ts`：修正内存规格中的“零死机/零蓝屏/100% 兼容”等不严谨描述。
- [修改] `src/components/wiki/LaptopSection.tsx`：修正笔记本板块“实时比价”文案。

### 3. 执行验证记录
- `npm test`：
  ```
  Test Files  17 passed (17)
       Tests  106 passed (106)
  ```
- `npm run build`：
  ```
  vite building for production...
  ✓ built in 2.97s
  ```

### 4. 边界与未完成说明
- 本项目目前为纯前端静态站，无集中式后端与数据库。由于 GitHub Issue 需要用户拥有 GitHub 账号并在网页点击确认提交，因此针对无账号或无法访问 GitHub 的用户，本阶段提供了结构化复制到剪贴板的降级方案；
- 硬件历史价格目前仍为参考区间估算，尚未接入第三方电商 API（阶段 2/3 将进一步规范字段级数据来源快照与未知字段标记）。

### 5. 下一步任务
- **阶段 2：完善结构化数据与可信度**（待用户明确指令后开启）。
