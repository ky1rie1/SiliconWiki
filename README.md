# SiliconWiki（芯知硬件百科）

> **现代化全功能计算机硬件百科与 Three.js 3D 实景装机互动指南**  
> 纯静态免后端架构 · 支持一键 100% 免费部署上线至 Vercel 并绑定自定义独立域名

---

## 🌟 核心功能特性

### 1. 🖥️ 硬件全景百科与笔记本专区
* **台式机核心硬件全覆盖**：深入科普 CPU、显卡 GPU、主板、内存 RAM、高速固态 SSD、电源 PSU、散热器 Cooler、机箱 Chassis 的做工用料、电气规范与选购要点。
* **移动端/笔记本专项**：
  * **同名不同芯解密**：揭开移动版 RTX 4060/4090 与桌面版的物理规格与流处理器差异。
  * **功耗墙机制**：解析残血 45W 与满血 140W TGP 的性能断层。
  * **屏幕面板四大金刚**：OLED vs Mini-LED vs Fast-IPS、100% DCI-P3 色域、PWM 高频调光防频闪。
  * **散热模具**：VC 均热板与液金散热注意事项。
* **防失效实时电商搜索**：针对每个型号，动态生成精准指向**京东自营、淘宝百亿补贴、拼多多**的官方语义聚合搜索通道，彻底杜绝单品详情页随时间下架或 404 失效的痛点。

### 2. 📊 多维性能天梯排行榜与 PK 比拼台
* **权威基准对齐**：深度对齐**极客湾（Geekerwan / socpk.com）**能效比与实测游戏基准，以及 3DMark TimeSpy 理论分。
* **多维度指标切换**：支持「大型 3A 游戏帧率」、「多核生产力渲染剪辑」、「每瓦能效比」三大维度自由排序。
* **移动与桌面联合对比**：支持一键开关「显示移动笔记本芯片」，直观查看笔记本芯片相当于台式机什么水准。
* **硬件横向 PK 对决台**：可任选 2~3 款硬件并排比拼，生成相对百分比柱状图与智能选购建议。
* **权威溯源直达**：每个型号右侧附带直达极客湾天梯原站与 TechPowerUp 官方芯片数据库的外链。

### 3. 🛠️ Three.js 3D 实景虚拟装机室
* **WebGL 高精度三维主机**：程序化构建海景房机箱、主板、CPU、双通道内存、M.2 固态、散热器、显卡、电源与线缆，高保真 PBR 物理材质渲染。
* **360° 自由掌控**：鼠标拖拽 360° 旋转、平移、滚轮缩放；手机平板触控手势完全适配。
* **9 大标准分步装机流程**：从 CPU 安装防呆、内存双通道、M.2 安装到机箱跳线图解与首次通电 Debug 灯自检。
* **💥 一键全机爆炸拆解透视 (Exploded View)**：内部所有硬件在三维空间中向四周平滑展开悬浮，整机结构一目了然！再次点击平滑复原。
* **高危防呆防坑警示**：深度标红**“散热器与固态马甲底座撕膜警告”**、AM5 针脚保护等新手易翻车点。
* **📺 B站保姆级实操视频接入**：精选硬件茶社、极客湾、装机猿等全网超千万播放的高分视频教程，每个步骤一键直达对应实操时间轴。

### 4. 📖 硬件名词术语宝典与全站智能气泡
* **人话词典**：覆盖 IPC、3D V-Cache、大小核调度、显存位宽、DLSS/FSR 帧生成、XMP/EXPO、内存时序 CL、双通道、NVMe PCIe 4.0/5.0、TLC/QLC 颗粒避坑、ATX 3.1 12V-2x6 防烧规范等。
* **三段式科普**：一句话大白话解释 + 底层物理技术原理 + 选购避坑指南。
* **全站智能气泡 (Smart Tooltips)**：全站在出现专业术语时自动带有虚线下划线，鼠标悬浮或轻触立即弹出迷你卡片，无需跳出页面。

### 5. 💰 3000~25000元预算配置单
* 涵盖 3500 元（网游电竞学生党）、5500 元（2K 甜点全能）、8500 元（2K 高刷 3A 主力）、15000 元（4K 纯血游戏神装）、25000 元+（终极发烧机皇）。
* 完整配件清单 BOM、规格要点、参考均价、装机搭配避坑理由与一键复制整机配置文本。

### 6. 🔍 深度全局智能搜索系统
* 全局快捷键 `Ctrl + K`、`Cmd + K` 或 `/` 随叫随到。
* 跨硬件型号、天梯跑分、名词术语、装机步骤、推荐配置五大维度聚合索引。
* 支持拼音模糊与缩写匹配（如输入 `4070s`、`98x3d`、`xmp`、`zj` 或 `装机`）。

### 7. 📢 更新公告与版本日志
* 记录每一次版本上线、硬件数据库同步（已收录 2024~2026 最新 RTX 50/40 系、Ryzen 9000、酷睿全系）及价格动态。
* 顶部导航铃铛带未读动态小红点，本地记忆已读状态。

### 8. ☀️/🌙 极客暗黑与纯净明亮双主题
* 一键在深邃极客暗黑（Dark Tech）与高对比纯净工程白皮书（Clean White）之间无缝切换，本地持久化记忆。

---

## 🛠️ 本地运行与调试

本项目基于 Node.js 18+ 环境：

```bash
# 1. 克隆或进入项目目录
cd "c:\Users\ROG\Desktop\Coding Lessons\programs\computer_wiki"

# 2. 安装项目依赖
npm install

# 3. 启动本地开发热重载服务器
npm run dev

# 4. 构建生产环境纯静态产物 (输出至 dist/)
npm run build
```

---

## 🚀 免费部署到您的个人域名（Vercel 保姆级教程）

由于本项目采用纯静态单页架构，**终身不需要购买云服务器、不需要购买数据库、不需要支付 SSL 证书费用**！

### 方式一：Vercel 免费部署（强烈推荐，2 分钟上线）

1. **将代码推送到 GitHub**：
   ```bash
   git init
   git add .
   git commit -m "feat: initial release of SiliconWiki"
   # 在 GitHub 创建一个新仓库后执行：
   git remote add origin https://github.com/您的用户名/您的仓库名.git
   git branch -M main
   git push -u origin main
   ```

2. **在 Vercel 导入项目**：
   * 打开 [https://vercel.com](https://vercel.com)，使用 GitHub 账号直接登录。
   * 点击右上角 **"Add New..." -> "Project"**。
   * 在列表中找到您的 `computer_wiki` 仓库，点击 **"Import"**。
   * Framework Preset 保持默认识别的 **Vite**，点击底部的 **"Deploy"**。
   * 大约 30 秒后，Vercel 就会完成构建并给您分配一个专属的二级域名（如 `silicon-wiki.vercel.app`）。

3. **绑定您自己的独立域名**：
   * 在 Vercel 项目主页进入 **Settings -> Domains**。
   * 在输入框中输入您拥有的域名（如 `wiki.yourdomain.com` 或 `yourdomain.com`），点击 **Add**。
   * Vercel 会给出一条 DNS 解析提示（通常为一条指向 `cname.vercel-dns.com` 的 CNAME 记录，或者一条 A 记录）。
   * 打开您的域名服务商后台（阿里云、腾讯云、Cloudflare、Namecheap 等），添加该条 DNS 解析。
   * 解析生效后，Vercel 会自动为您申请并部署免费的 HTTPS SSL 证书，网站即刻正式上线！
   * **后续福利**：以后您只要在本地修改代码或更新硬件数据推送到 GitHub，Vercel 会全自动重新编译部署上线，全程 0 人工干预！

---

### 方式二：Cloudflare Pages 免费部署（全球顶级 CDN）

1. 打开 [Cloudflare 仪表盘](https://dash.cloudflare.com/)，点击左侧 **Workers & Pages -> Pages**。
2. 点击 **Connect to Git**，选中本仓库。
3. 构建设置：构建命令填写 `npm run build`，输出目录填写 `dist`。
4. 点击 **Save and Deploy**，完成后在 **Custom Domains** 中一键绑定您的 Cloudflare 托管域名即可。

---

## 📄 开源与数据致敬

- 天梯榜能效比与实测基准致敬：[极客湾 Geekerwan (socpk.com)](https://socpk.com/)
- 显卡芯片数据库致敬：[TechPowerUp GPU Database](https://www.techpowerup.com/gpu-specs/)
- 理论基准测试：[UL 3DMark](https://www.3dmark.com/)
- 芯片技术白皮书：[Intel ARK](https://ark.intel.com/) & [AMD Documentation](https://www.amd.com/)
