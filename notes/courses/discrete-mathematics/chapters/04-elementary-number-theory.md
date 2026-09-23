---
title: 04初等数论基础及其运用
description: "核心思想: 一个整数可以被另一个整数无余数地除尽。"
course: discrete-mathematics
category: chapters
order: 4
source_file: 离散数学/note/04初等数论基础及其运用.md
tags:
  - discrete-mathematics
  - chapters
sidebar:
  order: 4
prev:
  link: /courses/discrete-mathematics/chapters/03-functions/
  label: 03函数
next:
  link: /courses/discrete-mathematics/chapters/05-graphs/
  label: 05图
---
## 🔢 基础概念：整除性与素数

*   **整除 (Divisibility)**
    *   **核心思想**: 一个整数可以被另一个整数无余数地除尽。
    *   **定义**: 若 $a = bc$，则 $b|a$。(有说b不为0，但a可以)
    *   **核心工具**: **带余除法**: $a = qb + r$，其中 $0 \le r < |b|$。这是所有后续理论的基石。

*   **素数与合数 (Primes & Composites)**
    *   **核心思想**: 素数是构成所有正整数的乘法“原子”。
    *   **定义**:
        *   **素数**: 大于1且正因子只有1和自身的整数。
        *   **合数**: 大于1且不是素数的整数。
    *   **算术基本定理**: 任何大于1的整数都可以被**唯一**地分解为素数的乘积。
        *   **应用**: 计算正因子个数。若 $n = p_1^{r_1} \cdots p_k^{r_k}$，则因子个数为 $(r_1+1)\cdots(r_k+1)$。
    *   **素数的分布与测试**:
        *   **无穷性**: 素数有无穷多个。
        *   **素数定理**: 小于n的素数个数 $\pi(n) \approx \frac{n}{\ln n}$。
        *   **素数测试**: 合数 $a$ 必有一个素因子小于等于 $\sqrt{a}$。
        *   **厄拉多塞筛法**: 基于上述原理的素数筛选算法。可得100个数以内有25个素数，10000就可以借用这25个素数了
        *   $\pi(n)$为小于等于n的素数的个数

## 核心关系：最大公因数 (GCD)

*   **定义**:
    *   **最大公因数 gcd(a, b)**: 能同时整除a和b的最大正整数。
    *   **互素 (Coprime)**: 若 gcd(a, b) = 1。

*   **计算方法**:
    *   **欧几里得算法 (辗转相除法)**: 核心原理是 $\text{gcd}(a, b) = \text{gcd}(b, a \pmod b)$。通过不断递归，高效求出最大公因数。

*   **核心性质**:
    *   **裴蜀定理**: 对于不全为零的整数 $a, b$，总存在整数 $x, y$ 使得：
        $$
        xa + yb = \text{gcd}(a, b)
        $$
    *   **互素的充要条件**: $a, b$ 互素 $\iff$ 存在整数 $x, y$ 使得 $xa + yb = 1$。

## 核心工具：同余 (Congruence)

*   **定义**: $a \equiv b \pmod{m}$，意为 $a$ 和 $b$ 除以 $m$ 的余数相同，等价于 $m | (a-b)$。

*   **核心概念**:
    *   **等价关系**: 同余关系具有自反、对称、传递性。
    *   **剩余类**: 所有模 $m$ 同余的数构成一个等价类 $[a]$。
    *   **剩余类环 $\mathbb{Z}_m$**: 所有 $m$ 个剩余类组成的集合，可以在其上进行加法和乘法运算（模运算）。

*   **性质**:
    *   同余式两边可以进行加、减、乘运算。
    *   $a \equiv b \pmod m \implies a^k \equiv b^k \pmod m$。

## 应用与定理

*   **一次同余方程**
    *   **标准形式**: $ax \equiv c \pmod{m}$。
    *   **有解条件**: $\text{gcd}(a, m) | c$。
    *   **模逆元**: $ax \equiv 1 \pmod m$ 的解 $x$ 称为 $a$ 的模 $m$ 逆元。
        *   **存在条件**: $a$ 存在模 $m$ 逆元 $\iff \text{gcd}(a, m) = 1$ (即 $a, m$ 互素)。

*   **欧拉函数与欧拉定理**
    *   **欧拉函数 $\phi(n)$**: 小于等于 $n$ 的正整数中与 $n$ 互素的数的个数。
    *   **欧拉定理**: 若 $\text{gcd}(a, n) = 1$，则：
        $$
        a^{\phi(n)} \equiv 1 \pmod{n}
        $$

*   **费马小定理 (欧拉定理的特例)**
    *   **适用场景**: 当模数是一个素数 $p$ 时。
    *   *内容**:
        *   形式一: 若 $p$ 是素数且 $p \nmid a$，则 $a^{p-1} \equiv 1 \pmod p$。
        *   形式二: 若 $p$ 是素数，对任意整数 $a$，有 $a^p \equiv a \pmod p$。
