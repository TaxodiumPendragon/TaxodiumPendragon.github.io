---
title: "词汇级自然语言理解"
description: "词义学习、语言离散性与词汇级自然语言理解。"
course: natural-language-processing
category: notes
order: 2
source_file: "NLP/02自然语言理解.md"
tags:
  - nlp
  - linguistics
sidebar:
  order: 2
prev:
  link: /courses/natural-language-processing/notes/01-introduction/
  label: "自然语言处理简介"
next:
  link: /courses/natural-language-processing/notes/03-ba-bei-constructions/
  label: "“把”字句与“被”字句"
---

> 词汇学习，词义学习：即使计算机理解词汇的意思且可以比较不同词汇的相似度

## 1.词义学习的挑战

### 语言的离散

> 将字符转换为可计算的数值

- 传统方法：one-hot表示，缺点1维度爆炸，2是没有含义信息
- 词向量：利用上下文信息使用较少维度建模
