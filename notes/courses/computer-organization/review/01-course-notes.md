---
title: 课程随记
description: x86的段寄存器相关寻址，以及什么情况下使用，
course: computer-organization
category: review
order: 1
source_file: 体系/note/Note.md
tags:
  - computer-organization
  - review
sidebar:
  order: 1
prev: false
next:
  link: /courses/computer-organization/review/02-midterm-review/
  label: 期中复习
---
## 第三章（感觉会考的）
- x86的段寄存器相关寻址，以及什么情况下使用，
- - 比如一般情况默认使用DS，但代码相关会使用CS
- - BP和SI,DI作为基址寄存器进行运算
- 复杂指令中的串传送
- MIPS寄存器的指令编码方式，以及每一位对应的位置。在可以查表情况下，如何解码。对齐方式提高位数*2

## 4. 算术逻辑单元

### MIPS算术与逻辑

- MIPS在I型指令需要扩展立即数时，算术指令是符号扩展，逻辑指令是零扩展

### 溢出判断

- 溢出只针对有符号数运算结果符号不合法。与进位是两个概念
- 判断溢出使用最高位的进位输入输出是否相等，使用XOR门

### 优化

- 关键路径:经过最长的门
