# TaxodiumPendragon.github.io

个人学术论文笔记站（Jekyll + Minima + Collections）。

## 本地预览

Ruby 装在用户 PATH 里时，若 Cursor 内置终端找不到 `ruby`/`bundle`，先刷新 PATH：

```powershell
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
```

然后：

```powershell
cd D:\Code\blog\TaxodiumPendragon.github.io
bundle install
bundle exec jekyll serve
```

打开 <http://127.0.0.1:4000>。

## 内容组织

| 路径 | 说明 |
|------|------|
| `_papers/` | 论文笔记集合（正式发布） |
| `paperlist/` | 本地草稿（构建排除） |
| `_posts/` | 普通博客文章 |
| `/papers/` | 笔记列表页 |

新增笔记：在 `_papers/` 放 Markdown，写好 YAML front matter（`title` / `venue` / `year` / `authors` / `summary` / `tags` / `links`）。

## 部署

推送到 `main` 后，由 GitHub Actions（`.github/workflows/pages.yml`）构建并发布到 GitHub Pages。

仓库设置：Settings → Pages → Source 选 **GitHub Actions**。
