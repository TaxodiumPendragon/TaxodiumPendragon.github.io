---
title: 第 7 章：链接
description: 静态类型是局部符号类型，因为只对该文件可见
course: introduction-to-computer-systems
category: chapters
order: 6
source_file: ICS/noteExp/C7Link.md
tags:
  - introduction-to-computer-systems
  - chapters
sidebar:
  order: 6
prev:
  link: /courses/introduction-to-computer-systems/chapters/06-memory-hierarchy/
  label: 第 6 章：存储层次
next:
  link: /courses/introduction-to-computer-systems/chapters/08-exceptional-control-flow/
  label: 第 8 章：异常控制流
---
## 符号解析

- 静态类型是局部符号类型，因为只对该文件可见
- .bss还收录初始化为0的静态变量和全局变量。尽管是未初始化的静态变量。CMMON则存放未初始化的全局变量
- 强符号是函数和初始化的全局变量，弱符号是未初始化的全局变量