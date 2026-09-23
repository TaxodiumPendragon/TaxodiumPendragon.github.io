---
title: 15命题逻辑的基本概念
description: 目标：符号化推理 → 消除歧义 → 研究可解性与计算模型
course: discrete-mathematics
category: chapters
order: 15
source_file: 离散数学/note/15命题逻辑的基本概念.md
tags:
  - discrete-mathematics
  - chapters
sidebar:
  order: 15
prev:
  link: /courses/discrete-mathematics/chapters/14-lattices-and-boolean-algebra/
  label: 14格与布尔代数
next:
  link: /courses/discrete-mathematics/chapters/16-logical-equivalences/
  label: 16命题逻辑等值演算
---
- **目标**：符号化推理 → 消除歧义 → 研究可解性与计算模型
- **命题**：具有唯一真值的陈述句（真/假）
- **命题公式**：由变项、联结词、括号递归构成（合式公式）
- **主要联结词与真值条件**：
	- 否定 $\neg$：$\neg p$ 真 ⇔ $p$ 假
	- 合取 $\land$：$p \land q$ 真 ⇔ $p$ 真 且 $q$ 真
	- 析取 $\lor$：$p \lor q$ 假 ⇔ 否：$p$ 假 且 $q$ 假
	- 蕴含 $\to$：$p \to q$ 假 ⇔ 否：$p$ 真 且 $q$ 假
	- 等价 $\leftrightarrow$：$p \leftrightarrow q$ 真 ⇔ 两者真值相同
- **真值表构造**：列出 $2^n$ 种赋值 → 按优先级逐层求值 → 得出公式真值
- **公式分类**：重言式（恒真）、矛盾式（恒假）、可满足式（存在真值使其成立）
