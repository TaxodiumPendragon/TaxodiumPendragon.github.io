---
title: 01集合论
description: 直观地说，集合是若干事物的汇集，这些事物被称为集合的元素或成员。集合中的元素必须是确定的（对于任何一个元素，它要么在集合中，要么不在，二者必居其一）、互异的（集合中的元素不重复计数）以及无序的（元素的排列顺序无关紧要）。
course: discrete-mathematics
category: chapters
order: 1
source_file: 离散数学/note/01集合论.md
tags:
  - discrete-mathematics
  - chapters
sidebar:
  order: 1
prev: false
next:
  link: /courses/discrete-mathematics/chapters/02-binary-relations/
  label: 02二元关系
---
## 1.1 集合的基本概念

直观地说，**集合**是若干事物的汇集，这些事物被称为集合的**元素**或**成员**。集合中的元素必须是**确定的**（对于任何一个元素，它要么在集合中，要么不在，二者必居其一）、**互异的**（集合中的元素不重复计数）以及**无序的**（元素的排列顺序无关紧要）。

元素与集合之间的关系是**隶属关系**，用符号 $\in$ 表示“属于”，用 $\notin$ 表示“不属于”。为了避免罗素悖论中出现的自指问题，公理化集合论规定，任何集合都不能包含其自身，即对任何集合 $A$，都有 $A \notin A$。

### 集合的表示与关系

表示集合通常有两种方法：
- **列举法**：将集合的所有元素一一列出，并用花括号括起来，如 $\{1, 2, 3\}$。
- **描述法**：通过描述集合内元素的共同属性来定义集合，如 $\{x \mid x \text{是正偶数}\}$。

集合之间存在**包含关系**。如果集合 $B$ 中的每一个元素都是集合 $A$ 中的元素，则称 $B$ 是 $A$ 的**子集**，记作 $B \subseteq A$。如果 $B \subseteq A$ 且 $B \neq A$，则称 $B$ 是 $A$ 的**真子集**，记作 $B \subset A$。

**空集**，记作 $\emptyset$，是不含任何元素的特殊集合。它被证明是任何集合的子集，并且是唯一的。

### 幂集与全集

- **幂集 (Power Set)**：一个集合 $A$ 的所有子集构成的集合，被称为 $A$ 的幂集，记作 $P(A)$ 或 $2^A$。如果集合 $A$ 含有 $n$ 个元素，那么它的幂集 $P(A)$ 含有 $2^n$ 个元素。
- **全集 (Universal Set)**：在特定的问题讨论中，如果我们所涉及的所有集合都是某一个更大集合的子集，那么这个更大的集合就称为全集，通常记作 $E$。

## 1.2 集合的运算

- **并集 (Union)**：$A \cup B = \{x \mid x \in A \lor x \in B\}$，包含所有属于 $A$ 或属于 $B$ 的元素。
- **交集 (Intersection)**：$A \cap B = \{x \mid x \in A \land x \in B\}$，包含所有既属于 $A$ 又属于 $B$ 的元素。
- **相对补集 (Difference)**：$A - B = \{x \mid x \in A \land x \notin B\}$，包含所有属于 $A$ 但不属于 $B$ 的元素。
- **绝对补集 (Complement)**：在给定全集 $E$ 的前提下，$\sim A = E - A$，包含所有不属于 $A$ 的元素。
- **对称差 (Symmetric Difference)**：$A \oplus B = (A - B) \cup (B - A)$，包含所有只属于 $A$ 或只属于 $B$ 的元素。

## 1.3 集合运算的性质

集合的运算遵循一系列重要的代数定律，这些定律与逻辑运算中的规律高度相似。
- **幂等律**: $A \cup A = A$, $A \cap A = A$
- **结合律**: $(A \cup B) \cup C = A \cup (B \cup C)$
- **交换律**: $A \cup B = B \cup A$
- **分配律**: $A \cup (B \cap C) = (A \cup B) \cap (A \cup C)$
- **德摩根律**: $\sim(A \cup B) = \sim A \cap \sim B$, $A - (B \cup C) = (A - B) \cap (A - C)$
- **吸收律**: $A \cup (A \cap B) = A$

## 1.4 有穷集的计数

**文氏图 (Venn Diagram)** 是一种用封闭曲线来表示集合及其关系的图形工具，可以直观地展示集合的运算。

**包含排斥原理 (Principle of Inclusion-Exclusion)** 是一个用于计算多个集合并集大小的重要公式。对于两个集合，它表现为 $|A \cup B| = |A| + |B| - |A \cap B|$。对于 $n$ 个集合，其推广形式为：

$$
|A_1 \cup A_2 \cup \cdots \cup A_n| = \sum |A_i| - \sum |A_i \cap A_j| + \sum |A_i \cap A_j \cap A_k| - \cdots + (-1)^{n-1} |A_1 \cap \cdots \cap A_n|
$$

这个原理的一个重要应用是计算**错位排列 (Derangements)** 的数量。一个 $n$ 个元素的错位排列是指一个排列，其中没有任何一个元素出现在其原来的位置上。其数量 $D_n$ 可以通过包含排斥原理推导得出：

$$
D_n = n! \left( 1 - \frac{1}{1!} + \frac{1}{2!} - \cdots + (-1)^n \frac{1}{n!} \right)
$$

当 $n$ 足够大时，这个比例 $D_n / n!$ 约等于 $1/e$。