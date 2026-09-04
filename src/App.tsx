import { useState, useEffect } from 'react';
import { Cpu, Box, Sparkles, Moon, Sun, Layers, Terminal } from 'lucide-react';

export default function App() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <Cpu className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                SiliconWiki 芯知
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                现代化全功能硬件百科与 3D 装机互动应用
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-600" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <Layers className="w-5 h-5 text-blue-500 mb-2" />
            <div className="font-semibold text-sm text-slate-900 dark:text-slate-200">全景百科</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">深度涵盖 CPU/GPU/主板/散热/机箱核心参数</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <Sparkles className="w-5 h-5 text-amber-500 mb-2" />
            <div className="font-semibold text-sm text-slate-900 dark:text-slate-200">极客湾天梯榜</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">权威真实跑分与同阶 PK 横向对比</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <Box className="w-5 h-5 text-emerald-500 mb-2" />
            <div className="font-semibold text-sm text-slate-900 dark:text-slate-200">3D 实景装机</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Three.js 交互式机箱拼装与全真爆炸拆解</div>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 dark:text-slate-400 pt-2">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span>Scaffolding initialized successfully. React + Vite + Tailwind + Three.js Ready.</span>
        </div>
      </div>
    </div>
  );
}
