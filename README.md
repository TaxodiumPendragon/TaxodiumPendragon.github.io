# TaxodiumPendragon.github.io

个人学习笔记站：课程笔记 + 论文笔记，基于 Jekyll Collections。

- 线上站点：https://taxodiumpendragon.github.io/
- 论文列表：https://taxodiumpendragon.github.io/papers/
- 课程列表：https://taxodiumpendragon.github.io/courses/

---

## 使用指南

### 1. 内容怎么组织：板块 + tag

站点用两层结构，避免「所有笔记堆在一个目录里用 tag 硬分」：

| 层级 | 机制 | 作用 |
|------|------|------|
| **大板块** | Jekyll Collection | 导航上分开：课程笔记 / 论文笔记 |
| **板块内分类** | YAML front matter | 课程用 `course` + `tags`；论文用 `venue` / `year` + `tags` |

对应目录：

| 板块 | 源目录（只写 Markdown） | 列表页 | 细分字段 |
|------|-------------------------|--------|----------|
| 课程笔记 | `_courses/` | `/courses/` | `course`（哪门课）、`week`、`tags`（课内主题） |
| 论文笔记 | `_papers/` | `/papers/` | `venue`、`year`、`authors`、`tags`、`links` |

课程显示名在 `_data/courses.yml` 里登记（`slug` → 中文名 / 学期）。列表页会按 `course` 分组展示。

**不要**再维护一份 `paperlist/` 之类的平行草稿目录：正式内容只放在 `_papers/` / `_courses/`，避免重复。

### 2. 首页站内介绍写在哪

编辑仓库根目录的 **`index.markdown`**。

文件里「关于本站」那一段（带 HTML 注释标记）就是首页介绍；下面两节会自动列出最近论文 / 课程笔记。改完后本地 `jekyll serve` 预览，推送 `main` 即上线。

其他常用入口：

| 你想改的 | 文件 |
|----------|------|
| 首页介绍与首页区块 | `index.markdown` |
| 关于页 | `about.markdown` |
| 顶栏导航 | `_config.yml` → `header_pages` |
| 站点标题 / 描述 | `_config.yml` → `title` / `description` |
| 笔记页样式 | `assets/css/papers.css` |
| 笔记页布局 | `_layouts/note.html` |

### 3. 新建一篇笔记

**方式 A：脚手架脚本（推荐）**

```powershell
# 论文
python scripts/new_note.py paper --title "Paper Title" --venue ISCA --year 2025 --tag SDA --tag cache

# 课程（--course 填 _data/courses.yml 里的 slug）
python scripts/new_note.py course --title "第2讲：流水线" --course computer-architecture --week 2 --tag pipeline
```

脚本会在对应目录生成带 front matter 的 `.md`，再自己补正文即可。

**方式 B：手写 Markdown**

在 `_papers/` 或 `_courses/` 新建 `.md`，文件头加上 YAML，例如：

```yaml
---
title: "Cache Calculus"
venue: CAL
year: 2016
authors: "Nathan Beckmann, Daniel Sanchez"
summary: "一句话摘要，出现在列表卡片上。"
tags: [cache, modeling]
links:
  - label: PDF
    url: https://example.com/paper.pdf
---
```

课程笔记示例：

```yaml
---
title: "示例：缓存层次与命中率"
course: computer-architecture
week: 1
tags: [cache, memory]
summary: "列表页上显示的短摘要。"
---
```

### 4. Markdown 会变成 HTML 吗？要不要自己写转换脚本？

**不用。** Jekyll 构建时会自动把集合里的 Markdown 转成 `_site/` 下的 HTML。

| 工具 | 做什么 | 不做什么 |
|------|--------|----------|
| `bundle exec jekyll build` / `serve` | MD → HTML，套布局、生成列表页 | — |
| `scripts/new_note.py` | 生成带 front matter 的空 MD | **不**生成 HTML |

日常流程：改 `.md` → 本地 `jekyll serve` 看效果 → `git push` → GitHub Actions 构建并发布。不要手写、也不要单独维护一份 HTML。

### 5. 本地预览

本机 Ruby 若装在用户 PATH（例如 `D:\Ruby40-x64\bin`），Cursor 内置终端有时读不到。先刷新再启动：

```powershell
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
cd D:\Code\blog\TaxodiumPendragon.github.io
bundle install
bundle exec jekyll serve
```

打开 <http://127.0.0.1:4000>。

依赖由 `Gemfile` / `Gemfile.lock` 锁定；换机器或 CI 报缺 gem 时再跑一次 `bundle install`。

### 6. 部署到 GitHub Pages

1. 提交并推送到 `main`
2. `.github/workflows/pages.yml` 自动 `jekyll build` 并部署
3. 仓库 Settings → Pages → Source 选 **GitHub Actions**（已配置则无需再改）

站点：https://taxodiumpendragon.github.io/

---

## 目录速查

```
_config.yml          # 站点配置、collections、导航
index.markdown       # 首页（含站内介绍）
courses.md           # 课程笔记列表页
papers.md            # 论文笔记列表页
_courses/            # 课程笔记源文件
_papers/             # 论文笔记源文件
_data/courses.yml    # 课程 slug → 显示名
_layouts/note.html   # 笔记详情布局
assets/css/papers.css
scripts/new_note.py  # 新建笔记脚手架
.github/workflows/pages.yml
```
