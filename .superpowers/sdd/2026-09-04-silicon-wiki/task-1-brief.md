# Task 1 Brief: 项目脚手架搭建与核心依赖配置

## Files:
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

## Requirements:
1. 初始化 React 18/19 + Vite + TypeScript 项目配置。
2. 安装并配置核心依赖：
   - `react`, `react-dom`
   - `three`, `@types/three`
   - `lucide-react`
   - `tailwindcss`, `postcss`, `autoprefixer`
3. 配置 `vite.config.ts` 支持 `@` 指向 `src` 目录，并配置 `@vitejs/plugin-react`。
4. 配置 `tailwind.config.js` 开启 `darkMode: 'class'`，配置 content 为 `["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`。
5. 配置 `src/index.css` 包含 `@tailwind base; @tailwind components; @tailwind utilities;` 及深浅色基础背景过渡平滑效果。
6. 配置 `vercel.json`，确保单页应用 SPA 路由重写规则：
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
7. 运行 `npm install` 安装所有依赖。
8. 验证 `npm run build` 生成 `dist/`，确保无报错。
9. 提交 git commit: `chore: scaffold SiliconWiki project with React, Tailwind, and Three.js`.

## Report Contract:
Write full report to `.superpowers/sdd/2026-09-04-silicon-wiki/task-1-report.md`.
Return status: DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, or BLOCKED.
