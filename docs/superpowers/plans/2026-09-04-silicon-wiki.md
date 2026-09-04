# SiliconWiki（芯知硬件百科）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建 SiliconWiki（芯知硬件百科）现代化全功能硬件知识与 3D 装机互动 Web 应用，包含硬件全景百科、极客湾天梯榜、Three.js 3D 分步交互装机、B站教程接入、名词宝典、全局智能搜索、更新日志、深浅色模式与 Vercel 免费部署配置。

**Architecture:** 前端采用 React 19 + TypeScript + Vite 构建高性能单页应用，UI 基于 Tailwind CSS 与 Lucide Icons，3D 实景装机基于 Three.js 硬件加速渲染（程序化建模与 PBR 材质），数据层采用高内聚模块化强类型字典仓库，提供 Vercel 一键静态构建部署。

**Tech Stack:** React 18/19, TypeScript, Vite, Tailwind CSS, Three.js, Lucide React, Vitest (测试验证)。

## Global Constraints

- 纯静态免后端架构，输出目录 `dist/`，支持 0 成本部署至 Vercel / Cloudflare Pages / GitHub Pages。
- 全站支持暗黑科技模式 (Dark Tech) 与纯净明亮模式 (Clean White) 无缝切换。
- 电商链接采用精准语义聚合搜索，彻底杜绝单品链接随时间失效与 404 问题。
- 跑分数据打通极客湾（Geekerwan/socpk）与 3DMark 权威溯源。
- 3D 模型采用程序化几何体与 PBR 物理材质组合构建，杜绝外部大体积模型网络加载失败风险。

---

### Task 1: 项目脚手架搭建与核心依赖配置

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `vercel.json`
- Create: `src/index.css`
- Create: `src/main.tsx`
- Create: `src/App.tsx`

**Interfaces:**
- Produces: 基础 React + Vite + Tailwind + Three.js 运行环境与 build 脚本。

- [ ] **Step 1: 创建 package.json 与项目配置文件**
配置 React, ReactDOM, Three.js, Lucide-react, Tailwind CSS, TypeScript 及 Vitest。
- [ ] **Step 2: 配置 Vite, Tailwind 与 PostCSS**
配置 `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`。
- [ ] **Step 3: 安装项目依赖并验证构建环境**
运行 `npm install`。
- [ ] **Step 4: 配置 index.html 与基础入口 main.tsx / App.tsx**
引入 Tailwind CSS 并验证启动。
- [ ] **Step 5: 验证测试环境并提交**
运行 `git add . && git commit -m "chore: scaffold SiliconWiki project with React, Tailwind, and Three.js"`。

---

### Task 2: 主题系统与全局导航布局框架

**Files:**
- Create: `src/types/index.ts`
- Create: `src/context/ThemeContext.tsx`
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/Footer.tsx`

**Interfaces:**
- Produces: `useTheme()` 提供 `theme: 'dark' | 'light'`, `toggleTheme: () => void`。
- Produces: `Navbar` 提供主导航栏、当前活跃 Tab、搜索快捷按钮、更新日志提醒按钮与主题切换。

- [ ] **Step 1: 编写 ThemeContext 状态管理与单元测试**
实现深浅色自动记忆（localStorage）与 `<html>` class 切换。
- [ ] **Step 2: 编写 Navbar 响应式顶栏**
包含 Logo、5 大核心板块切换按钮、`Ctrl+K` 搜索按钮、更新日志小红点、深浅色切换按钮。
- [ ] **Step 3: 编写 Footer 页脚**
包含免责声明、开源说明、极客湾/3DMark数据致敬外链。
- [ ] **Step 4: 验证深浅色切换与响应式菜单**
- [ ] **Step 5: 提交代码**
运行 `git add . && git commit -m "feat: implement theme provider and global responsive layout"`。

---

### Task 3: 核心数据仓库建设

**Files:**
- Create: `src/data/hardware.ts` (桌面及移动端全硬件参数库)
- Create: `src/data/rankings.ts` (CPU & GPU 多维天梯榜跑分与极客湾溯源)
- Create: `src/data/glossary.ts` (硬件专有名词大白话通俗解释宝典)
- Create: `src/data/builds.ts` (3000~25000 元精选装机配置与电商直达)
- Create: `src/data/assemblySteps.ts` (9大标准装机步骤与防呆注意事项)
- Create: `src/data/changelog.ts` (更新公告与版本迭代日志)

**Interfaces:**
- Produces: 强类型数据导出 `hardwareList`, `cpuRankings`, `gpuRankings`, `glossaryTerms`, `recommendedBuilds`, `assemblyStepsData`, `changelogList`。

- [ ] **Step 1: 编写硬件规格库 hardware.ts 与跑分库 rankings.ts**
涵盖 Intel 13/14代/Core Ultra、AMD Ryzen 7000/9000、NVIDIA RTX 40/50 系列、AMD RX 7000/8000、Apple M 系列及笔记本屏幕/散热专项。
- [ ] **Step 2: 编写名词宝典 glossary.ts 与装机步骤 assemblySteps.ts**
涵盖 IPC, TDP, 3D V-Cache, DLSS, 供电相数, 内存时序, 撕膜警告, 跳线图解。
- [ ] **Step 3: 编写配置单 builds.ts 与更新日志 changelog.ts**
3000~25000 元价位配置，包含电商自营语义搜索 URL 生成函数。
- [ ] **Step 4: 编写数据验证测试**
验证数据 ID 唯一性与非空校验。
- [ ] **Step 5: 提交代码**
运行 `git add src/data && git commit -m "feat: create comprehensive structured hardware database"`。

---

### Task 4: 硬件全景百科模块 (Hardware Wiki)

**Files:**
- Create: `src/components/wiki/HardwareWiki.tsx`
- Create: `src/components/wiki/HardwareCard.tsx`
- Create: `src/components/wiki/LaptopSection.tsx`

**Interfaces:**
- Consumes: `hardwareList`, `glossaryTerms`。
- Produces: 硬件百科分类浏览（CPU/GPU/主板/内存/固态/电源/散热/机箱/笔记本）、品牌与规格筛选、智能电商比价直达入口。

- [ ] **Step 1: 编写 HardwareCard 硬件信息卡片**
展示硬件架构、核心规格、优缺点点评、功耗、指导价与京东/淘宝自营直达比价按钮。
- [ ] **Step 2: 编写 LaptopSection 笔记本专区**
展示移动端 vs 桌面端差异、残血 vs 满血功耗墙图解、屏幕面板素质（OLED/MiniLED/IPS/高刷/护眼）与选购矩阵。
- [ ] **Step 3: 组合 HardwareWiki 主视图**
支持类别 Tab、品牌过滤、关键词即时过滤。
- [ ] **Step 4: 验证交互与渲染**
- [ ] **Step 5: 提交代码**
运行 `git add . && git commit -m "feat: implement hardware encyclopedia with laptop guide"`。

---

### Task 5: 多维性能天梯榜与 PK 比拼台 (Benchmark Ladder)

**Files:**
- Create: `src/components/rankings/BenchmarkLadder.tsx`
- Create: `src/components/rankings/HardwarePKModal.tsx`

**Interfaces:**
- Consumes: `cpuRankings`, `gpuRankings`。
- Produces: CPU/GPU 梯队条形图比拼、多维度指标切换（游戏/生产力/能效）、移动端显卡开关、硬件横向 PK 对比抽屉、极客湾天梯直达入口。

- [ ] **Step 1: 编写 BenchmarkLadder 天梯条形图**
支持动态计算百分比条、高亮选定硬件、切换测试基准。
- [ ] **Step 2: 编写 HardwarePKModal 硬件 PK 对比台**
支持勾选 2~3 款硬件进行参数并排对比、跑分差距柱状图呈现与选购建议。
- [ ] **Step 3: 集成极客湾（Geekerwan/socpk）与 3DMark 溯源链接**
- [ ] **Step 4: 验证榜单排序与筛选功能**
- [ ] **Step 5: 提交代码**
运行 `git add . && git commit -m "feat: implement multi-dimensional benchmark ranking and PK tool"`。

---

### Task 6: 3D 可视化交互装机教学室 (Three.js 3D Simulator)

**Files:**
- Create: `src/components/assembly/AssemblySimulator3D.tsx`
- Create: `src/components/assembly/PCScene3D.ts` (Three.js 场景、机箱、硬件模型程序化构建与着色器材质)
- Create: `src/components/assembly/BilibiliGuidesModal.tsx` (B站精选保姆级教程接入)

**Interfaces:**
- Consumes: `assemblyStepsData`。
- Produces: 3D WebGL 交互画布、360° 控制、分步拼装动效、一键全机爆炸拆解透视 (Exploded View)、硬件点击高亮聚焦、B站权威实操教程直达。

- [ ] **Step 1: 编写 PCScene3D.ts 程序化 3D 电脑主机场景**
使用 Three.js 构建海景房机箱、ATX主板、CPU芯片、内存条、M.2 SSD、散热器、显卡、电源与线缆，赋予金属、PCB漆面与玻璃材质。
- [ ] **Step 2: 实现分步拼装动画与爆炸拆解 (Exploded View)**
计算各部件爆炸位移向量，通过 requestAnimationFrame 实现丝滑平滑过渡。
- [ ] **Step 3: 编写 AssemblySimulator3D 控制面板**
包含 9 大步骤切换按钮、防呆与安全提示（撕膜警告！）、Debug 灯排障指引。
- [ ] **Step 4: 编写 BilibiliGuidesModal B站装机实操视频卡片**
精选极客湾、硬件茶社等高分视频，标注关键步骤时间轴与直达链接。
- [ ] **Step 5: 验证 3D 画布在各种窗口尺寸下的自适应与无内存泄漏清理**
- [ ] **Step 6: 提交代码**
运行 `git add . && git commit -m "feat: implement interactive 3D assembly simulator with exploded view and Bilibili tutorials"`。

---

### Task 7: 硬件名词术语宝典与全站智能气泡 (Glossary & Tooltips)

**Files:**
- Create: `src/components/glossary/GlossaryView.tsx`
- Create: `src/components/common/SmartTooltip.tsx`

**Interfaces:**
- Consumes: `glossaryTerms`。
- Produces: 独立的名词速查页面，以及可以在全站任意地方包裹文本的 `<SmartTooltip term="XMP">` 组件。

- [ ] **Step 1: 编写 SmartTooltip 智能悬浮气泡组件**
鼠标悬浮或轻触弹出精致的名词解释浮层，支持大白话解释与选购影响。
- [ ] **Step 2: 编写 GlossaryView 专页**
支持按硬件类别分类检索、拼音 A-Z 快速定位。
- [ ] **Step 3: 验证全站名词联动**
- [ ] **Step 4: 提交代码**
运行 `git add . && git commit -m "feat: implement hardware glossary and smart tooltip system"`。

---

### Task 8: 行情预算配置单模块 (Budget & Builds)

**Files:**
- Create: `src/components/builds/BudgetBuilds.tsx`

**Interfaces:**
- Consumes: `recommendedBuilds`。
- Produces: 3000~25000 元价位装机配置单，配件明细清单，一键复制配置文本，电商自营搜索比价直达。

- [ ] **Step 1: 编写 BudgetBuilds 视图组件**
卡片展示各个价位档次（3000入门网游/5000甜点/8000 2K高刷/15000 4K电竞/25000 旗舰）。
- [ ] **Step 2: 实现一键导出/复制装机单功能**
- [ ] **Step 3: 提交代码**
运行 `git add . && git commit -m "feat: implement budget build configurations with live e-commerce search anchors"`。

---

### Task 9: 全局智能搜索系统 (Omnisearch Command Palette)

**Files:**
- Create: `src/components/search/SearchModal.tsx`

**Interfaces:**
- Consumes: 全库数据（硬件、天梯、名词、装机步骤、配置单）。
- Produces: 全局快捷键 (`Ctrl+K` / `/`) 呼出的命令面板，支持模糊拼音、缩写匹配与分类高亮跳转。

- [ ] **Step 1: 编写 SearchModal 智能搜索浮层**
监听键盘 `Ctrl+K`、`Cmd+K` 与 `/` 快捷键，提供聚焦输入框。
- [ ] **Step 2: 实现多维度模糊匹配算法**
跨硬件型号、天梯、名词与装机步骤进行统一聚合索引与关键字高亮。
- [ ] **Step 3: 实现上下箭头选中与回车跳转**
- [ ] **Step 4: 提交代码**
运行 `git add . && git commit -m "feat: implement omnichannel command palette search modal"`。

---

### Task 10: 更新公告与版本日志系统 (Changelog & Announcements)

**Files:**
- Create: `src/components/changelog/ChangelogModal.tsx`

**Interfaces:**
- Consumes: `changelogList`。
- Produces: 侧滑/弹窗式版本更新日志，带未读小红点标记与本地存储记忆。

- [ ] **Step 1: 编写 ChangelogModal 时间轴组件**
展示每次版本更新的发布日期、硬件数据更新记录、价格调整与新功能。
- [ ] **Step 2: 实现已读/未读状态本地持久化**
用户点击查看后，顶部铃铛图标的小红点自动熄灭。
- [ ] **Step 3: 提交代码**
运行 `git add . && git commit -m "feat: implement update changelog and announcement modal"`。

---

### Task 11: 整体系统集成、构建验证与 Vercel 部署配置

**Files:**
- Modify: `src/App.tsx` (集成所有板块路由与全局弹窗)
- Modify: `vercel.json` (Vercel SPA 重定向与静态缓存配置)
- Create: `README.md` (项目介绍与一键 Vercel 部署指引)

**Interfaces:**
- Produces: 完整可构建运行的生产级 Web 应用，通过 `npm run build` 生成 `dist/`，配置 Vercel 部署参数。

- [ ] **Step 1: 在 App.tsx 中完成全板块无缝装配**
- [ ] **Step 2: 执行全量代码静态检查与生产构建**
运行 `npm run build` 确保 TypeScript 类型 0 报错，产物打包成功。
- [ ] **Step 3: 完善 vercel.json 与部署文档**
编写清晰的 Vercel 2 分钟免费上线指南。
- [ ] **Step 4: 提交最终构建代码**
运行 `git add . && git commit -m "feat: finalize SiliconWiki application and Vercel deployment configuration"`。
