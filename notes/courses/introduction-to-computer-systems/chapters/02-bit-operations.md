---
title: 第 2 章补充：位运算
description: 大端法小端法，在题目中可能存在大地址放右边的情况，注意方向辨别
course: introduction-to-computer-systems
category: chapters
order: 2
source_file: ICS/noteExp/Chapter2.md
tags:
  - introduction-to-computer-systems
  - chapters
sidebar:
  order: 2
prev:
  link: /courses/introduction-to-computer-systems/chapters/02-information-representation/
  label: 第 2 章：信息表示
next:
  link: /courses/introduction-to-computer-systems/chapters/03-assembly/
  label: 第 3 章：汇编
---
## 位运算

- 大端法小端法，在题目中可能存在大地址放右边的情况，注意方向辨别
- 移位操作要检查是否超过32位
- ics右移向负无穷取整而正常C语言整除中是向零取整