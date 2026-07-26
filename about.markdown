---
layout: page
title: About
permalink: /about/
---

这里是 **TaxodiumPendragon** 的个人学习笔记站。

## 两大板块

| 板块 | 源目录 | 列表页 | 细分方式 |
|------|--------|--------|----------|
| 课程笔记 | `_courses/` | [/courses/]({{ "/courses/" | relative_url }}) | `course`（哪门课）+ `tags`（课内主题） |
| 论文笔记 | `_papers/` | [/papers/]({{ "/papers/" | relative_url }}) | `venue` / `year` + `tags` |

课程显示名在 `_data/courses.yml` 登记。

## 首页介绍

首页文案写在仓库根目录的 [`index.markdown`]({{ "/" | relative_url }}) 里「关于本站」一节。

## 构建说明

只维护 Markdown；`bundle exec jekyll build` 会生成 `_site/` 下的 HTML。不要手写、也不要单独维护一份 HTML。
