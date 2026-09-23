---
title: 16命题逻辑等值演算
description: 两个命题公式 $A$ 与 $B$ 若 $A \leftrightarrow B$ 为重言式，则称 $A$ 与 $B$ 等值，记作 $A
  \Leftrightarrow B$。
course: discrete-mathematics
category: chapters
order: 16
source_file: 离散数学/note/16命题逻辑等值演算.md
tags:
  - discrete-mathematics
  - chapters
sidebar:
  order: 16
prev:
  link: /courses/discrete-mathematics/chapters/15-propositional-logic/
  label: 15命题逻辑的基本概念
next:
  link: /courses/discrete-mathematics/chapters/17-logical-inference/
  label: 17命题逻辑的推理理论
---
## 等值式

### 定义
两个命题公式 $A$ 与 $B$ 若 $A \leftrightarrow B$ 为重言式，则称 $A$ 与 $B$ 等值，记作 $A \Leftrightarrow B$。

### 判断方法
- 真值表法：比较两个公式的真值表是否完全相同。
- 等值推导：使用基本等值式和置换规则进行代换推导。

## 基本等值式（常用工具）

### 核心法则
- 双重否定：$A \Leftrightarrow \neg\neg A$
- 交换、结合律：$\land,\lor$ 满足交换和结合。
- 分配律：$\land$ 与 $\lor$ 相互分配。
- 德摩根律：$\neg(A \lor B) \Leftrightarrow \neg A \land \neg B$
- 吸收律：$A \lor (A \land B) \Leftrightarrow A$

### 联结词转换
- 蕴含转换：$A \to B \Leftrightarrow \neg A \lor B$
- 等价转换：$A \leftrightarrow B \Leftrightarrow (A \to B) \land (B \to A)$

## 范式（公式的标准形式）

### 基础概念
- 文字（literal）：命题变项或其否定（如 $p,\ \neg p$）。
- 简单合取式（conjunction of literals）：文字的合取，如 $p \land \neg q$。
- 简单析取式（disjunction of literals）：文字的析取，如 $p \lor \neg q$。

### 两种基本范式
- 析取范式（DNF）：若干简单合取式的析取。
- 合取范式（CNF）：若干简单析取式的合取。

### 存在性与转化步骤
- 任一命题公式都存在等值的 DNF 与 CNF。
- 常用转化步骤：消去 $\to,\leftrightarrow$ → 将 $\neg$ 内移到文字上 → 应用分配律得到标准形式。

## 主范式（唯一的标准形式）

### 基础单元
- 极小项（minterm）：包含所有变项（或其否定）的简单合取式；每个极小项仅在唯一赋值上为真。
- 极大项（maxterm）：包含所有变项（或其否定）的简单析取式；每个极大项仅在唯一赋值上为假。

### 主范式类型
- 主析取范式（PDNF）：所有对应真值表中为真的行所对应的极小项之析取。PDNF 唯一。
- 主合取范式（PCNF）：所有对应真值表中为假的行所对应的极大项之合取。PCNF 唯一。

### 核心用途
- 判断公式类型：重言式的 PDNF 包含全部 $2^n$ 个极小项；矛盾式的 PDNF 为空。
- 判断等值：两个公式等值当且仅当它们的 PDNF（或 PCNF）相同。

