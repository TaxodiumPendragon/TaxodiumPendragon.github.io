---
title: 中断与异常
description: 中断向量区存放处理程序的地址。且从零开始
course: computer-organization
category: lectures
order: 3
source_file: 体系/note/3.31中断与异常.md
tags:
  - computer-organization
  - lectures
sidebar:
  order: 3
prev:
  link: /courses/computer-organization/lectures/02-memory-hierarchy/
  label: 存储层次结构
next:
  link: /courses/computer-organization/lectures/04-io-devices/
  label: 输入输出设备
---
## 中断向量表的结构

> 8086使用向量表

- 使用段+偏移形成物理地址
- 中断向量区存放处理程序的地址。且从零开始

### 计算

- 注意小端法：低地址低数据，从低到高是先偏移再段基址
- 中断类型码就是编号。*4即可得存放初始地址

## 中断的处理过程

- 硬件分工：前三步，关中断->保存断点->识别中断源（先存在识别
- 软件分工：保护现场(存寄存器、标志寄存器)->执行中断->恢复现场并返回
- 但具体系统具体分析。如标志寄存器压入堆栈来自哪

## 内部中断

> 类型0-4，类型2非屏蔽中断留给外部中断

- 除0：是指得到的商过大超过寄存器，常见于除0
- 溢出中断只在检查时中断
- 单步中断和断点中断用于调试，断点是唯一一个单字节的，因为需要替代原本指令，而最短的指令是单字节的
- 溢出中断有时候会被处理位空指令：因为是主动使用INT的，如果OF没有自然就不需要了
- 所有内部中断优先级都比外部中断高
- 任何内部中断都不能使用软件的方式来屏蔽，**单步中断**可以借助TF位设置（也就是只有它可以被软件方式屏蔽
