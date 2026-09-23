---
title: 17命题逻辑的推理理论
description: 前提 $\Gamma$：一组已知的命题公式。
course: discrete-mathematics
category: chapters
order: 17
source_file: 离散数学/note/17命题逻辑的推理理论.md
tags:
  - discrete-mathematics
  - chapters
sidebar:
  order: 17
prev:
  link: /courses/discrete-mathematics/chapters/16-logical-equivalences/
  label: 16命题逻辑等值演算
next:
  link: /courses/discrete-mathematics/chapters/18-first-order-logic/
  label: 18一阶逻辑基本概念
---
## 推理的形式结构

### 推理的基本概念
从**前提**推导出**结论**的思维过程。
- 前提 $\Gamma$：一组已知的命题公式。
- 结论 $B$：通过推理规则得出的新命题公式。

### 有效推理
记为 $\Gamma \models B$，定义为：不可能出现前提为真而结论为假的情况。
- 关键性质："善意推定"—— 当前提为假时，推理自动有效。

### 推理的判定定理
推理 $A_1, A_2, \ldots, A_k \models B$ **有效**当且仅当公式 $(A_1 \land A_2 \land \cdots \land A_k) \to B$ 是**重言式**。

**核心转化**：将推理问题转化为判断公式是否为重言式的问题。

## 基本推理定律（有效的推理模式）

### 核心推导
- **假言推理（MP）**：$\{A \to B, A\} \models B$
- **拒取式（MT）**：$\{A \to B, \neg B\} \models \neg A$

### 链式推理
- **假言三段论**：$\{A \to B, B \to C\} \models A \to C$

### 排除法
- **析取三段论**：$\{A \lor B, \neg A\} \models B$

### 复杂推理
- **构造性/破坏性二难**：基于析取前提的复杂推理模式。

## 自然推理系统 P（形式化证明）

### 基本概念
- **目标**：形式化地描述一个完整的证明过程。
- **证明**：一个公式序列，每一步都是前提或由前面步骤通过推理规则得出。

### 核心规则
- **前提引入**：可在任意步骤引入一个前提。
- **置换规则**：可用等值公式替换子公式。
- **基本推理规则**：将推理定律作为可直接使用的推导步骤。

### 高级证明策略

#### 附加前提证明法（CP）
- **目标**：证明 $A \to B$。
- **方法**：将 $A$ 作为临时前提，推导出 $B$。

#### 归谬法/反证法（RAA）
- **目标**：证明 $B$。
- **方法**：将 $\neg B$ 作为临时前提，推导出矛盾（永假式）。