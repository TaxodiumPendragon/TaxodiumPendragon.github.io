---
title: 期中考点复习
description: 正则表达式、自动机与语法分析的考点清单。
course: compilers
order: 4
source_file: 04about期中.md
sidebar:
  order: 4
prev:
  link: /courses/compilers/03-midterm/
  label: 期中复习：正则表达式与自动机
next:
  link: /courses/compilers/05-final-review/
  label: 期末复习
---

## 清单列表

1. 正则表达式 ↔ NFA/DFA

必会：给定正则，用Thompson构造法画NFA（注意ε边）；子集构造法转DFA；DFA最小化（分割法）。

期末形式：2019一(1)（选与NFA等价的正则）、2020一(1)(2)（描述NFA语言+构造被5整除的DFA）。

2. LL(1)分析
必会：消除左递归、提取左公因子；计算FIRST/FOLLOW；构造预测分析表；判断是否LL(1)。

期末形式：2020一(3)(4)（消除左递归、提取左公因子、填预测表、最左推导）。

3. LR分析（LR(0)、SLR、LR(1)）
必会：拓广文法，构造项集族（闭包、goto）；判断移进/归约、归约/归约冲突；SLR用FOLLOW限制归约；LR(1)加入前瞻符；知道包含关系 LR(1) ⊇ LALR(1) ⊇ SLR(1) ⊇ LR(0)。

期末形式：2019三（补全LR(1)自动机，判断是否SLR/LR(0)）。

##


