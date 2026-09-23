---
title: 输入输出设备
description: 共6个，前三个是为了解决其产生的原因
course: computer-organization
category: lectures
order: 4
source_file: 体系/note/4.2输入输出设备.md
tags:
  - computer-organization
  - lectures
sidebar:
  order: 4
prev:
  link: /courses/computer-organization/lectures/03-interrupts-and-exceptions/
  label: 中断与异常
next: false
---
> 加上第二次线下课

## 1.输入输出接口电路

### IO接口功能

> 共6个，前三个是为了解决其产生的原因

1. 数据缓冲：解决速度差距
2. 提供联络信息：协调与同步数据交换过程
3. 信号与信息格式的转换：串/并、数/模，电平是否标准
4. 设备选择、中断管理和可编程功能

### 编址方式

- IO接口数量有限，所以译码过后可能只采低位就进行使用了

## DMA

- DMA初始化的时候待传送数据长度可以不设置。至少要设置的是源地址、目的地址初始值和地址增减方式
