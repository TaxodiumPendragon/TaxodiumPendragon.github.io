---
title: 第 9 章：动态内存分配
description: 页表条目代表VPN位数，与页表条目大小相乘可得页表大小
course: introduction-to-computer-systems
category: chapters
order: 8
source_file: ICS/noteExp/C9Malloc.md
tags:
  - introduction-to-computer-systems
  - chapters
sidebar:
  order: 8
prev:
  link: /courses/introduction-to-computer-systems/chapters/08-exceptional-control-flow/
  label: 第 8 章：异常控制流
next:
  link: /courses/introduction-to-computer-systems/chapters/10-system-io/
  label: 第 10 章：系统 I/O
---
## 地址翻译

- 页表是多少对齐的说明页表大小
- 页表条目代表VPN位数，与页表条目大小相乘可得页表大小

## 空闲链表

- 最佳适应算法的空白区是按**小大递增**顺序链接在一起。
