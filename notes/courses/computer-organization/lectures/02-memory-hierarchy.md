---
title: 存储层次结构
description: 仅内部存储器使用1024为底，其余频率、外部存储器、周期都为国际单位制各前缀，k->M->G->T，小m->micro->n->p
course: computer-organization
category: lectures
order: 2
source_file: 体系/note/3.26存储层次结构.md
tags:
  - computer-organization
  - lectures
sidebar:
  order: 2
prev:
  link: /courses/computer-organization/lectures/01-controller-basics/
  label: 控制器基本原理
next:
  link: /courses/computer-organization/lectures/03-interrupts-and-exceptions/
  label: 中断与异常
---
- 仅内部存储器使用1024为底，其余频率、外部存储器、周期都为国际单位制各前缀，k->M->G->T，小m->micro->n->p
- PC133周期计算使用主频倒数，约7.5ns，CL单位是时钟周期
- 如果题目问位，则要记得正常单位GB里B是字节，对*位*要*8

## DDR接口频率计算

- 核心频率= 数据传输速率（MT/s）/预取位数
- 接口频率则与IO有关

### 公式

- DDR技术导致：数据传输速率（MT/s）= 接口频率（MHz） × 2（DDR的双倍速率）

- 数据预取技术：核心频率（MHz）= 数据传输速率（MT/s） / 预取位数

- 峰值带宽（GB/s）*1000= 数据宽度（bits） × 数据传输速率（MT/s） / 8（转换为字节）
