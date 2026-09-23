---
title: 第 3 章：汇编
description: 算术右移向下取整(毕竟丢位了)，整数除法\向零取整
course: introduction-to-computer-systems
category: chapters
order: 3
source_file: ICS/noteExp/C3asm.md
tags:
  - introduction-to-computer-systems
  - chapters
sidebar:
  order: 3
prev:
  link: /courses/introduction-to-computer-systems/chapters/02-bit-operations/
  label: 第 2 章补充：位运算
next:
  link: /courses/introduction-to-computer-systems/chapters/04-architecture/
  label: 第 4 章：处理器体系结构
---
## 算术指令

- 算术右移向下取整(毕竟丢位了)，整数除法```\```向零取整
- 特殊算术操作比如```imul```,```cqto```，```idiv```都表示对rax的操作，结果存储在rdx，分别是有符号乘、rax的符号扩展到rdx、有符号除。除法将余数存储在rdx，商存储在rax
