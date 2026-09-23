---
title: 昇腾 AI 计算系统讲座
description: evolve from dense models of hundred-billion para meters to sparse
  models of trillion parameters and progress t
course: introduction-to-computer-systems
category: chapters
order: 11
source_file: ICS/noteExp/讲座课.md
tags:
  - introduction-to-computer-systems
  - chapters
sidebar:
  order: 11
prev:
  link: /courses/introduction-to-computer-systems/chapters/11-network-programming/
  label: 第 11 章：网络编程
next:
  link: /courses/introduction-to-computer-systems/chapters/13-final-review/
  label: 期末复习
---
> Lecture@11.21

## Evolution of LLM

- evolve from dense models of hundred-billion para meters to sparse models of trillion parameters and progress towards million-level ultra-long sequences and multimodalities
- 模型能力向长序列方向演进

### law of LLM：large models + More Data +More Cputing (including inference )=Emergence of intelligence

1. scaling Law：Moore`s Law in large model field.更多思考，强化学习，训练规模
2. Chinchilla Law：数据质量，规模饱和
3. emergence Law：参数质量影响智力的涌现能力

## Challenges and Trends LLM

- Performance:精度下降之后的瓶颈，微架构需要创新；NPU性能跟不上GPU，需要运行时优化；
- Usability:stable Long Task; Develogment & maintenance; 收敛性
- DevsOps/Insfructure

### chanllenge

- 内存墙
- 性能墙：通信瓶颈
- 效率墙effciency Wall:

### 高可用挑战

- 预测风险

## 昇腾计算系统推理的解决方案
