---
title: 章节作业 6：树与并查集
description: 树结构与并查集的简要练习。
course: data-structures-and-algorithms
category: homework
order: 6
source_file: homework/6树.md
tags:
  - tree
  - union-find
sidebar:
  order: 6
prev:
  link: /courses/data-structures-and-algorithms/homework/05-binary-tree/
  label: 章节作业 5：二叉树
next:
  link: /courses/data-structures-and-algorithms/homework/07-graph/
  label: 章节作业 7：图
---
## 并查集

- 起始的时候默认左边是根
- 每次union进行检查里面两个点的根，没存的话根就是自己
- **根的父亲为自身**
- **路径压缩**比如说一个已经union的点要继续，先自查根，然后另一个打算连它的就当自己是一个单点树，然后连到它的根上。因此除了两非单点联合，之后都是在同一层的