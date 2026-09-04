# SiliconWiki 子域名与独立路由绑定配置指南 (Subdomain & Routing Guide)

SiliconWiki 现已原生支持**基于二级子域名（Subdomains）**与**独立深层路由（Deep Links）**的精准直达访问。

你可以将 3D 装机、战力天梯、装机配置单、术语词典等功能独立拆分给不同的二级域名，也可以通过 URL Hash / Query 参数随时分享和书签直达。

---

## 1. 域名与路由映射矩阵

### ① 子域名映射规则（自动识别 Hostname）

| 子域名前缀 (Hostname Prefix) | 目标功能模块 | 模块标识 (Tab ID) | 说明 |
| :--- | :--- | :--- | :--- |
| `3d.` 或 `build.` | **三维实景装机工坊** | `simulator3d` | 3D 仿真拼装硬件与实操指引 |
| `rank.` 或 `ladder.` | **多维战力天梯榜** | `rankings` | 极客湾实测基准天梯图 |
| `wiki.` | **硬件全解百科** | `wiki` | CPU、显卡、主板等硬件知识全库 |
| `dict.` 或 `glossary.` | **装机术语与避坑词典** | `glossary` | 硬件术语、黑话与避坑指南 |
| `budget.` | **科学装机配置单** | `builds` | 3000~25000 元各价位高性价比配置单 |
| 根域名或 `www.` | **硬件全解百科 (首页)** | `wiki` | 默认综合入口 |

### ② 深层链接 (Deep Link) 映射

除了子域名，你还可以直接在任意域名下通过 **Hash** 或 **Query 参数**直达：

- **Hash 格式**：
  - `https://yourdomain.com/#/3d` 或 `/#/simulator3d`
  - `https://yourdomain.com/#/rankings` 或 `/#/rank` 或 `/#/ladder`
  - `https://yourdomain.com/#/builds` 或 `/#/budget`
  - `https://yourdomain.com/#/glossary` 或 `/#/dict`
  - `https://yourdomain.com/#/wiki`
- **Query 格式**：
  - `https://yourdomain.com/?tab=simulator3d` (或 `?tab=3d`)
  - `https://yourdomain.com/?tab=rankings`
  - `https://yourdomain.com/?tab=builds`
  - `https://yourdomain.com/?tab=glossary`
  - `https://yourdomain.com/?tab=wiki`
- **路由优先级**：`Query 参数` > `URL Hash` > `Path 路径` > `子域名前缀` > `默认 (wiki)`。
- **自动同步**：用户在页面内点击不同导航选项时，页面 URL 会静默自动更新（使用 HTML5 History API），方便直接复制地址栏发送给好友。支持浏览器前进/后退。

---

## 2. Vercel 部署与单页重写 (SPA Rewrites)

在项目根目录下已配置好 [`vercel.json`](file:///c:/Users/ROG/Desktop/Coding%20Lessons/programs/computer_wiki/vercel.json)：

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**作用**：
- 确保用户不论访问任何路径（如 `/3d`、`/rankings`）或子域名时，Vercel 都将请求平滑重写至单页入口 `index.html`，绝不会发生 404 错误。

---

## 3. 在 Vercel 控制台绑定子域名

1. 登录 [Vercel 控制台](https://vercel.com/)，进入你的 SiliconWiki 项目。
2. 点击顶部导航栏的 **Settings** -> 左侧菜单选择 **Domains**。
3. 添加子域名（建议选择以下两种方式之一）：

### 推荐方案 A：泛域名解析（一次性搞定所有子域名）
在输入框中填入：
```text
*.yourdomain.com
```
点击 **Add**。
- **优势**：添加一次后，`3d.`、`rank.`、`wiki.`、`dict.`、`budget.` 以及未来扩展的任何子域名都会自动接入，无需逐个添加！

### 方案 B：独立添加指定子域名
逐一添加你希望启用的子域名：
- `3d.yourdomain.com`
- `rank.yourdomain.com`
- `wiki.yourdomain.com`
- `dict.yourdomain.com`
- `budget.yourdomain.com`

---

## 4. 在 DNS 服务商处添加解析记录

登录你的域名注册商 / DNS 解析控制台（如 **Cloudflare**、**阿里云万网**、**腾讯云 DNSPod**、**华为云**、**GoDaddy** 等）。

添加对应的 **CNAME 记录**：

### 对应方案 A（泛域名解析）：
| 记录类型 | 主机记录 / 名称 (Name) | 记录值 (Value / Target) | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME** | `*` | `cname.vercel-dns.com` | 自动 / 600s |

### 对应方案 B（逐个子域名解析）：
| 记录类型 | 主机记录 / 名称 (Name) | 记录值 (Value / Target) | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME** | `3d` | `cname.vercel-dns.com` | 自动 / 600s |
| **CNAME** | `rank` | `cname.vercel-dns.com` | 自动 / 600s |
| **CNAME** | `wiki` | `cname.vercel-dns.com` | 自动 / 600s |
| **CNAME** | `dict` | `cname.vercel-dns.com` | 自动 / 600s |
| **CNAME** | `budget` | `cname.vercel-dns.com` | 自动 / 600s |

> [!TIP]
> 如果你在使用 **Cloudflare**：
> - 初始添加记录时，请将 **代理状态 (Proxy Status)** 暂时设为 **DNS Only (仅限 DNS，灰色云朵)**，以便 Vercel 顺利验证所有权并由 Let's Encrypt 自动签发 SSL 泛域名安全证书。
> - 证书就绪生效后，可按需开启 Cloudflare 代理（此时 Cloudflare SSL/TLS 加密模式需设为 **Full** 或 **Full (strict)**）。

---

## 5. 常见问题排查 (FAQ)

### Q1: 绑定后访问子域名提示 "DNS_PROBE_FINISHED_NXDOMAIN" 或打不开？
- DNS 解析全球生效通常需要 1~10 分钟。你可以打开本地命令行输入 `nslookup 3d.yourdomain.com` 或 `ping 3d.yourdomain.com`，确认是否已解析到 Vercel 的 IP/CNAME。

### Q2: 访问子域名提示 "Invalid Domain" 或 Vercel 错误页？
- 确认是否已在 Vercel 项目的 **Settings -> Domains** 中添加了对应的域名（`*.yourdomain.com` 或具体的 `3d.yourdomain.com`）。

### Q3: 访问子域名刷新后会不会 404？
- 不会。根目录的 `vercel.json` 包含 `rewrites` 规则，任何深层路径与子域名刷新均会由 Vercel 代理到 `index.html`，前端路由会在页面载入第一时间解析 hostname / hash 并激活对应视图。
