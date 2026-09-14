# TaxodiumPendragon 的学习笔记

基于 **Astro + Starlight** 的个人课程笔记与论文阅读站。

线上地址：https://taxodiumpendragon.github.io/

## 本地运行

需要 Node.js 22.12+，推荐 Node.js 24（与 GitHub Actions 一致）。

```powershell
npm ci
npm run dev
```

打开终端显示的本地地址。全文搜索需要生产构建，测试搜索时运行：

```powershell
npm run check
npm run build
npm test
npm run preview
```

## 内容放在哪里

- `src/content/docs/courses/compilers/`：编译原理，6 篇正式笔记和 1 篇空草稿。
- `src/content/docs/courses/software-engineering/`：软件工程，8 篇笔记。
- `src/content/docs/courses/example-cache-hierarchy.md`：保留的体系结构示例。
- `src/content/docs/papers/`：4 篇论文阅读；`index.mdx` 自动生成列表。
- `src/content/docs/index.mdx`：首页。
- `src/content/docs/about.mdx`：作者介绍。
- `public/assets/courses/`：笔记图片；正文使用 `/assets/courses/...` 引用。
- `public/avatar.png`：作者 GitHub 头像的本地副本，可直接替换。

编译原理按词法分析、语法分析、期中复习、期中考点、期末复习、2019 年试题排列。软件工程按介绍、作业 1/2、后端架构、顺序图、软件测试、作业 3、期末复习排列。原本空白的期末清单设置了 `draft: true`，不参与生产构建和搜索；原始简短提纲仍保留。PlantUML 顺序图当前以源码展示。

## 新建笔记

```powershell
python scripts/new_note.py course --course compilers --slug exercises --title "补充练习" --order 7
python scripts/new_note.py paper --slug paper-name --title "Paper Title" --venue ISCA --year 2026 --tag architecture
```

也可以手写 Markdown，文件头至少需要 `title`。课程笔记还需 `course`、`order`、`sidebar.order`；论文可设置 `venue`、`year`、`authors`、`tags` 和 `links`。`description` 用作摘要。

课内目录依据 `sidebar.order` 排序，总览依据 `order` 排序，两者应使用相同数字。已迁移课程用显式 `prev` / `next` 保持课内连续阅读；插入新笔记时同时调整相邻页链接，或删除这两个字段使用 Starlight 的目录顺序。

增加一门新课程时，在 `astro.config.mjs` 的 sidebar 增加自动目录分组，并在 `src/content/docs/courses/index.mdx` 增加对应的 `NoteList`。页面中的课程中文名在 `src/components/PageTitle.astro` 里登记。

公式使用 `$...$` 或 `$$...$$`，构建时通过 KaTeX 渲染。正文保持普通 Markdown；需要组件的索引页使用 MDX。

## 界面与部署

- `astro.config.mjs`：站点名称、侧栏、语言和集成配置。
- `src/styles/custom.css`：配色、阅读宽度、头像和排版。
- `src/components/PageTitle.astro`：课程名称、论文作者与原文链接。
- `.github/workflows/pages.yml`：推送 `main` 后执行安装、类型检查、构建、链接验证，再发布 `dist/` 到 GitHub Pages。

仓库 Pages 的 Source 使用 **GitHub Actions**。构建不需要 Ruby，也不需要手写 HTML。

## 迁移说明

保留 `/courses/`、`/papers/`、`/about/`、原有论文与课程 URL；旧 Jekyll 欢迎文章跳转至首页，`/feed.xml` 提供课程和论文 RSS。图片引用已从 Liquid 转换为静态路径。

原笔记备份目录未修改；博客内的副本不是自动同步文件。旧 Jekyll 内容和配置在迁移前另存了本地备份，Git 历史也保留原版。日常只维护 `src/content/docs/`。
