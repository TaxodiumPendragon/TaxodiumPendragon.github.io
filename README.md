# TaxodiumPendragon 的学习笔记

基于 **Astro + Starlight** 的个人课程笔记与论文阅读站。

线上地址：https://taxodiumpendragon.github.io/

## 最常用的更新流程

所有可编辑的 Markdown/MDX 都放在仓库根目录的 **`notes/`**，它和本 README 同级。日常不需要修改 `src/content/docs/`；那个目录由同步脚本临时生成，并已加入 `.gitignore`。

第一次使用先安装依赖（Node.js 22.12+，推荐 Node.js 24）：

```powershell
npm ci
```

之后每次更新：

1. 在 `notes/` 中新增或修改 `.md` / `.mdx`。
2. 运行 `npm run sync`，把内容同步到网站构建目录。
3. 运行 `npm run dev`，打开终端显示的本地地址预览。
4. 确认后提交并推送 `main`，GitHub Actions 会自动发布。

也可以直接运行：

```powershell
npm run build
```

`build`、`dev` 和 `check` 都会先自动执行同步，因此通常不必单独运行 `npm run sync`。生产检查命令为：

```powershell
npm run check
npm run build
npm test
```

## 内容目录

```text
notes/
├─ index.mdx                         # 首页与作者简介
├─ about.mdx                         # 旧 /about/ 地址兼容页（不显示在导航）
├─ courses/
│  ├─ index.mdx                     # 课程总览
│  ├─ compilers/                    # 编译原理
│  ├─ software-engineering/         # 软件工程
│  ├─ data-structures-and-algorithms/ # 数据结构与算法
│  ├─ computer-networks/            # 计算机网络
│  ├─ discrete-mathematics/         # 离散数学
│  ├─ computer-organization/        # 计算机组成原理
│  ├─ introduction-to-computer-systems/ # 计算机系统导论
│  ├─ information-security/         # 信息安全
│  ├─ music-and-mathematics/        # 音乐与数学
│  └─ british-american-drama/       # 英美戏剧
└─ papers/                           # 论文阅读
```

课程内部继续按用途分目录。例如数据结构与算法分为 `review`、`homework`、`written-answers` 和 `oj`；计算机系统导论分为 `chapters`、`tutorials` 和 `homework`。网站侧边栏使用相同分类，并默认折叠。

图片等静态资源放在 `public/assets/courses/课程名/`。Markdown 中使用从网站根目录开始的路径，例如：

```markdown
![TCP 可靠性](/assets/courses/computer-networks/img03/TCP可靠性.png)
```

## 新建笔记

课程笔记可以复制同一课程中的现有文件，至少保留以下 frontmatter：

```yaml
---
title: 页面标题
description: 列表中显示的简短摘要
course: computer-networks
category: chapters
order: 6
sidebar:
  order: 6
---
```

`course` 与 `category` 决定课程和分组，`order` 决定课程总览中的顺序，`sidebar.order` 决定左侧目录顺序。`draft: true` 的文件不会发布或进入搜索。

原有脚手架仍可创建基础文件：

```powershell
python scripts/new_note.py course --course computer-networks --category chapters --slug routing --title "路由算法" --order 6
python scripts/new_note.py paper --slug paper-name --title "Paper Title" --venue ISCA --year 2026 --tag architecture
```

脚手架会把新文件直接写入 `notes/` 的对应课程目录。公式使用 `$...$` 或 `$$...$$`，构建时通过 KaTeX 渲染。

## 新课程如何加入网站

1. 在 `notes/courses/<course-slug>/` 建立课程首页 `index.mdx` 和分类子目录。
2. 给笔记设置一致的 `course` 与 `category`。
3. 在 `astro.config.mjs` 的 `sidebar` 中登记课程及分类。
4. 在 `notes/courses/index.mdx` 添加课程入口；需要显示在首页时，同时编辑 `notes/index.mdx`。
5. 运行 `npm run build` 和 `npm test`。

本次从 `D:\Code\blog\draft` 导入了其中有 Markdown 的课程。原始 `draft` 没有修改：计算机网络 7 篇、离散数学 26 篇、计算机组成原理 9 篇、信息安全 3 篇、音乐与数学 7 篇、英美戏剧 4 篇、计算机系统导论 25 篇。`信概统` 目录只有 PDF，因此没有生成博客文章。两篇空的组成原理笔记和一篇空的 ICS 提纲以草稿保存。

## 站点结构与部署

- `notes/`：唯一需要日常编辑的 Markdown/MDX 内容源。
- `scripts/sync-content.mjs`：校验 frontmatter 并同步到 Astro 内容目录。
- `src/components/`：课程列表、笔记标题元信息等界面组件。
- `src/styles/custom.css`：主题配色、首页作者区和文章排版。
- `astro.config.mjs`：站点信息、右侧文章目录与折叠侧边栏。
- `public/`：头像、图标和笔记图片。
- `.github/workflows/pages.yml`：安装、检查、构建、验证并部署 GitHub Pages。

仓库已经完全使用 Astro 部署，不再依赖 Ruby 或 Jekyll。旧 Jekyll 源文件、构建缓存和兼容跳转已从仓库中移除；历史版本仍可从 Git 记录恢复。
