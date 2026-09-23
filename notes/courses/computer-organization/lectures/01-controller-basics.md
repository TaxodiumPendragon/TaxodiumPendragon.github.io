---
title: 控制器基本原理
description: 前情提要：对汇编的要求是用助记符和查表可以使用
course: computer-organization
category: lectures
order: 1
source_file: 体系/note/3.17控制器基本原理.md
tags:
  - computer-organization
  - lectures
sidebar:
  order: 1
prev: false
next:
  link: /courses/computer-organization/lectures/02-memory-hierarchy/
  label: 存储层次结构
---
> 第一次线下课
> 前情提要：对汇编的要求是用助记符和查表可以使用

## 大小端表示

体系确实用的小端法表示。是之前对数据的低位理解不准，数据的低位在右边，如12312，最右是个位。只是在分字节的汇编转机器码时习惯于从左到右decode而忘却了低位。小端就是低位数据低位地址，竖装表格很清楚。  

## 控制器实现
　　控制器实际上是控制信号生成的不同方式。所举三个例子的信号顺序和类型可能需要记忆。分类：硬布线是组合逻辑硬件（如图灵完备），T周期需要注意。微程序则更为复杂——想起课上老师说微命令其实就是控制信号，真是喜欢取名。类似查表。本质上是ics讲流水线时跳过的信号部分，控制器+数据通路=处理器。
