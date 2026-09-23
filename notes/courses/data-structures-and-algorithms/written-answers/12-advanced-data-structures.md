---
title: 书面作业第 12 章：高级数据结构
description: 内存分配策略与高级数据结构题目。
course: data-structures-and-algorithms
category: written-answers
order: 10
source_file: DSA-HW/Chapter12.md
tags:
  - advanced-data-structures
  - written-homework
sidebar:
  order: 10
prev:
  link: /courses/data-structures-and-algorithms/written-answers/11-file-index/
  label: 书面作业第 11 章：文件索引
next: false
---
## 1

### (1)首先适配法

- 对于12MB内存请求，分配最先的20MB  
- 对于10MB内存请求，分配10MB
- 对于9MB的内存请求，分配18MB

### (2)最佳适配法

- 对于12MB内存请求，分配最佳的12MB  
- 对于10MB内存请求，分配10MB
- 对于9MB的内存请求，分配9MB

### (3)最差适配法

- 对于12MB内存请求，分配最大的20MB  
- 对于10MB内存请求，分配18MB
- 对于9MB的内存请求，分配15MB

## 2
