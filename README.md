<div align="center">
  <img src="docs/assets/readme-cover.svg" alt="SiliconWiki — Explore hardware. Understand the build." width="100%" />
  <h1>SiliconWiki · 芯知</h1>
  <p>看懂硬件，理解每一步装配。</p>
  <p>计算机硬件百科 · 性能对比 · 交互式 3D 装机</p>
  <p>
    <a href="https://computer-wiki.vercel.app/">在线体验</a>
    &nbsp; / &nbsp;
    <a href="#quick-start">本地运行</a>
    &nbsp; / &nbsp;
    <a href="README.en.md">English</a>
  </p>
</div>

---

SiliconWiki 把硬件知识、参数对比与装机过程放在同一个学习空间里。查一个术语、比较几款芯片，或跟随九步引导观察一台电脑如何组装：每个模块都围绕“理解为什么”展开。

网站支持简体中文与 English、明暗主题，以及键盘快捷搜索。项目使用 React、TypeScript 和 Three.js 构建，内容数据随仓库维护。

[功能](#features) · [3D 装机室](#assembly-studio) · [数据来源](#data-sources) · [本地运行](#quick-start) · [配置与部署](#configuration) · [代码导览](#architecture)

<a id="features"></a>

## 可以做什么

| 模块 | 内容与交互 |
| --- | --- |
| 硬件百科 | CPU、GPU、主板、内存、存储、电源、散热与机箱知识，另含笔记本专题 |
| 性能对比 | 按场景浏览参考排行，并排查看硬件规格与相对分数 |
| 3D 装机室 | 九步装配引导、可旋转缩放的程序化模型、组件聚焦与爆炸视图 |
| 术语词典 | 用通俗解释连接参数、原理与使用场景 |
| 配置参考 | 查看配件清单、搭配思路与参考价格，复制配置文本 |
| 全局搜索 | 使用 `Ctrl + K` / `⌘ + K` 搜索型号、术语与页面内容 |

百科图片采用统一的石墨、金属与暖金产品插画，兼顾明暗主题与小尺寸缩略图。标注“外观示意”的图片表现品类特征，不是对应型号的实物照片。

<a id="assembly-studio"></a>

## 3D 装机室

以一台 **AM5 / DDR5 / ATX 塔式电脑**为教学原型，展示部件之间的位置、方向与安装顺序。模型由代码生成，包含主板布局、M.2 固定位置、散热鳍片与热管、显卡、供电线缆及透明侧板。

![3D 装机室实际界面：九步引导与完成装配的 ATX 主机](docs/assets/assembly-studio.png)

`CPU → 内存 → M.2 SSD → 散热器 → 主板入箱 → 电源 → 显卡 → 前面板接线 → 首次通电`

- **有依据的比例与方向**：ATX 主板按 305 × 244 mm 比例构建，双内存使用 A2 / B2，M.2 2280 以约 30° 插入，双塔风冷朝机箱后方排风，常规水平显卡的风扇朝下。
- **连贯的装配关系**：主板入箱时，已安装的 CPU、内存、SSD 和散热器随主板一起移动；电源从后部开口装入，侧板沿自身法线靠近机箱。
- **可反复观察**：旋转、平移、缩放、步骤切换与爆炸视图共同呈现空间关系；恢复装配状态时回到部件原始变换。
- **照顾不同设备与偏好**：场景采用独立动画时间线，支持减少动态效果；3D 加载失败时提供可理解的回退提示。

画质默认使用**均衡**，可在装机室切换。三档均按画布大小与设备像素比限制渲染像素总量；场景不可见或页面进入后台时暂停绘制。风扇目标更新频率不是设备实际帧率保证。

| 画质 | 阴影与风扇演示 |
| --- | --- |
| 省电 | 关闭阴影，风扇目标更新频率 20 Hz |
| 均衡（默认） | 缓存阴影，风扇目标更新频率 30 Hz |
| 精细 | 更高像素预算，风扇目标更新频率 60 Hz |

<details>
<summary>查看爆炸视图</summary>

![装机室爆炸视图实际界面：展开组件以观察内部空间关系](docs/assets/assembly-exploded.png)

</details>

**模型范围**：这是具有代表性的教学几何与装配动画，不是特定产品的 CAD 复刻，也不进行热学、电气、碰撞或整机兼容性验证。风扇转动表示演示中的通电状态，不对应实测转速、温度或负载。实际孔位、安装机构、线材与操作顺序请查阅所用产品说明书。

<a id="data-sources"></a>

## 内容与数据来源

硬件规格、排行、配置单和价格保存在 [`src/data/`](src/data/)，属于**随仓库更新的静态内容**。参考分数用于帮助理解相对定位，不能替代同条件下的完整测试；项目未接入实时跑分或价格 API。

部分型号另有按字段复核的[官方规格快照](src/data/sources/verifiedHardware.ts)，记录来源链接、核验日期、原始字段名称与适用范围。目前覆盖 Ryzen 7 9800X3D、Ryzen 7 7800X3D、Ryzen 9 9950X、GeForce RTX 5090 和 RTX 5080 的部分技术参数。**核验仅对明确列出的字段成立**，不代表整条产品介绍、跑分、价格或全库内容均已核验；NVIDIA 规格快照采用参考设计口径，不能直接套用到地区变体或非公版超频型号。

| 内容类型 | 如何理解 |
| --- | --- |
| 本地百科与配置内容 | 编辑维护的学习资料，随代码版本更新 |
| 已核验规格字段 | 在记录日期依据产品来源逐字段复核的快照 |
| 参考排行与价格 | 用于定位与比较，不是实时测量或成交报价 |
| 第三方产品资料 | 供查阅、导入与人工复核，不等同于官方规格认证 |

仓库还提供 [ZOL 单页候选导入工具](scripts/import_zol.py)。它读取 ZOL 装机网页使用的**未文档化内部接口**，不是官方开放 API；当前仅支持 CPU 关键词搜索的第一页，不自动翻页，也不自动更新应用中的规格、价格或图片。

如需维护候选资料，安装 Python 3.10 或以上版本后，在仓库根目录运行：

```bash
python scripts/import_zol.py --keyword 9800X3D --output data/sources/zol-9800x3d-new-check.json
python -m unittest discover -s scripts -p test_import_zol.py
```

导入器仅依赖 Python 标准库。输出文件必须是新文件；候选结果保留来源与观察时间，需逐字段人工复核后再纳入已核验快照。报价单独记录，不写入应用价格历史。接口行为、候选格式与离线复现步骤见[数据来源说明](docs/data-sources.md)。普通浏览网站不需要 Python，也不会从浏览器请求该接口。

电商链接打开平台搜索结果，不保证卖家身份、商品库存、成交价格或链接永久有效。页面中的外部资料链接用于进一步查阅，不表示数据已经获得来源方认证或背书。

装配教学中的 M.2 插入角度参考 [MSI 安装指南](https://www.msi.com/support/technical_details/MB_Upgrade_SSD)，塔式散热器风向参考 [Noctua 安装方向说明](https://www.noctua.at/en/support/faqs/in-which-orientation-should-noctua-coolers-be-installed)。插槽、接线和诊断状态应结合实际主板手册；可参阅 [MSI AM5 主板手册示例](https://download-2.msi.com/archive/mnu_exe/mb/MPGB850EDGETIWIFI_English.pdf)。

<a id="quick-start"></a>

## 本地运行

准备 Node.js 与 npm，在项目目录中执行：

```bash
npm install
npm run dev
```

打开终端显示的本地地址。百科与内容浏览无需配置 API 密钥；3D 装机室需要支持 WebGL 的浏览器，外部视频和电商链接需要网络连接。

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm test` | 运行 Vitest 测试 |
| `npm run build` | 执行 TypeScript 检查并生成生产构建 |
| `npm run preview` | 本地预览已生成的构建 |

<a id="configuration"></a>

## 配置与部署

默认运行不需要 `.env` 文件、API 密钥或数据库。语言与主题可在网站界面中切换；核心百科内容由本地 TypeScript 数据模块提供。外部视频、商品搜索与在线资料需联网访问。

开发服务器的主机与端口可通过 Vite 参数指定，例如 `npm run dev -- --port 5174`。部署资源路径在 [`vite.config.ts`](vite.config.ts) 的 `base` 中配置，当前使用 `./` 相对路径。

执行 `npm run build` 后，生产文件输出到 `dist/`，可将该目录部署到静态站点托管服务。`npm run preview` 用于本地检查构建结果；正式发布前运行测试与构建，并检查实际托管路径、图片资源和 3D 场景加载。

<a id="architecture"></a>

## 代码导览

| 路径 | 职责 |
| --- | --- |
| [`src/components/assembly/`](src/components/assembly/) | 装机界面、Three.js 场景与动画逻辑 |
| [`src/components/wiki/`](src/components/wiki/)、[`rankings/`](src/components/rankings/)、[`builds/`](src/components/builds/) | 百科、性能对比与配置单界面 |
| [`src/components/search/`](src/components/search/)、[`glossary/`](src/components/glossary/) | 全局搜索与术语交互 |
| [`src/data/`](src/data/) | 硬件、排行、装机步骤和其他静态内容 |
| [`src/data/sources/`](src/data/sources/) | 按字段核验的规格及来源记录 |
| [`scripts/import_zol.py`](scripts/import_zol.py)、[`data/sources/`](data/sources/) | 单页候选导入与待审查来源快照 |
| [`src/context/`](src/context/)、[`src/i18n/`](src/i18n/) | 应用状态、语言和主题相关逻辑 |
| [`src/utils/`](src/utils/)、[`src/__tests__/`](src/__tests__/) | 可复用逻辑与自动化测试 |
| [`docs/assets/`](docs/assets/) | README 原创封面与界面截图 |

装机场景按职责拆分：`PCScene3D.ts` 管理生命周期、输入与渲染；`pcModel.ts` 构建几何及组件层级；`modelResources.ts` 统一管理共享 GPU 资源与释放；`animation.ts` 用纯函数计算绝对姿态，并管理可取消的动画时间线。这些模块均位于 `src/components/assembly/`。

同目录下的 `renderingBudget.ts` 管理各画质档位的像素预算与风扇更新频率，`batchStaticMeshes.ts` 合并适合批处理的静态几何，同时保留组件选择与装配动画边界。

[硬件数据模型](docs/hardware-data.md) 将精确型号、字段证据、来源、参考价格与跑分分开维护，缺失测量保持为空。[链接审计报告](docs/link-audit.md) 记录修复地址，并区分页面可达、型号匹配与无法核验。

[3D 性能报告](docs/performance.md) 记录同场景软件渲染对照：绘制调用减少 63.6%，三角形细节保持不变；该结果不代表真实硬件帧率保证。

## 参与维护

修改硬件内容时，请同时核对中英文、单位与来源，并注明具体型号、适用字段和核验日期。修改装机逻辑时，请检查跳步、重复播放、爆炸视图恢复及减少动态效果。欢迎通过 Issue 或 Pull Request 提交可复现的问题和有出处的修正。

技术栈：**React 18 · TypeScript 5 · Three.js · Vite 6 · Tailwind CSS 3 · Vitest**。

完整英文文档见 [English README](README.en.md)。
