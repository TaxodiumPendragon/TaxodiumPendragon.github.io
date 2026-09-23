---
title: 18一阶逻辑基本概念
description: 个体常项：表示特定的个体（如 $a, b, c$）。
course: discrete-mathematics
category: chapters
order: 18
source_file: 离散数学/note/18一阶逻辑基本概念.md
tags:
  - discrete-mathematics
  - chapters
sidebar:
  order: 18
prev:
  link: /courses/discrete-mathematics/chapters/17-logical-inference/
  label: 17命题逻辑的推理理论
next:
  link: /courses/discrete-mathematics/chapters/20-languages-and-grammars/
  label: 20语言与文法
---
## 1.一阶逻辑的基本构成

### 个体词
指代研究的具体或抽象的客体。
- **个体常项**：表示特定的个体（如 $a, b, c$）。
- **个体变项**：表示泛指的个体（如 $x, y, z$）。
- **个体域（论域）**：个体变项的取值范围。

### 谓词
刻画个体词的性质或个体词间的关系。
- **$n$ 元谓词**：带有 $n$ 个个体变项，描述性质（$n=1$）或关系（$n \geq 2$）。
- **$0$ 元谓词**：不带个体变项的谓词，等同于一个命题。

### 量词
表示个体变项的数量关系。
- **全称量词** $\forall$："对所有的"，断言个体域中**所有**个体都满足某性质。
- **存在量词** $\exists$："存在一个"，断言个体域中**至少有一个**个体满足某性质。

## 命题符号化

### 符号化步骤
1. 确定个体域。
2. 定义谓词来表示性质和关系。
3. 使用个体词和量词将自然语言句子翻译成一阶逻辑公式。

### 关键模式
- **全称命题**：通常使用特性谓词和**蕴含** $\to$ 连接，如 $\forall x(M(x) \to F(x))$（凡是 M 都有性质 F）。
- **存在命题**：通常使用特性谓词和**合取** $\land$ 连接，如 $\exists x(M(x) \land G(x))$（有的 M 具有性质 G）。

### 注意事项
- 量词的顺序至关重要，改变顺序会改变命题含义。
- 同一命题在不同个体域下的符号化形式可能不同。
