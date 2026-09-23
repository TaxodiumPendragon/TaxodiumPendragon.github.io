---
title: 第三次作业
description: 计算 \(3^{201} \mod 11\)
course: information-security
category: homework
order: 2
source_file: 信安/3.md
tags:
  - information-security
  - homework
sidebar:
  order: 2
prev:
  link: /courses/information-security/homework/02-homework/
  label: 第二次作业
next: false
---
## 1.

1) 计算 \(3^{201} \mod 11\)  
   使用 Fermat 小定理，由于 11 是质数且 3 不是 11 的倍数，有 \(3^{10} \equiv 1 \mod 11\)。  
   指数 201 除以 10：201 = 20 × 10 + 1。  
   因此，\(3^{201} = (3^{10})^{20} \times 3^1 \equiv 1^{20} \times 3 \equiv 3 \mod 11\)。  
   答案：3。

2) 找到 \(a\) 在 0 到 72 之间，使得 \(a \equiv 9^{794} \mod 73\)。  
   使用 Fermat 小定理，由于 73 是质数且 9 不是 73 的倍数，有 \(9^{72} \equiv 1 \mod 73\)。  
   指数 794 除以 72：794 = 11 × 72 + 2。  
   因此，\(9^{794} = (9^{72})^{11} \times 9^2 \equiv 1^{11} \times 81 \equiv 81 \mod 73\)。  
   计算 \(81 \mod 73\)：81 - 73 = 8，所以 \(81 \equiv 8 \mod 73\)。  
   答案：8。

## 2.

### 3a. \( p=3 \), \( q=11 \), \( e=7 \), \( M=5 \)

1. \( n = p \times q = 3 \times 11 = 33 \)  
2. \( \phi(n) = (p-1)(q-1) = 2 \times 10 = 20 \)  
3. \( e = 7 \) (given), and \( \gcd(7, 20) = 1 \), so valid.  
4. Compute \( d \) such that \( d \times e \equiv 1 \mod \phi(n) \):  
   \( 7d \equiv 1 \mod 20 \) ⇒ \( d = 3 \) (since \( 7 \times 3 = 21 \equiv 1 \mod 20 \)).  
5. Encryption: \( C = M^e \mod n = 5^7 \mod 33 \)  
   \( 5^2 = 25 \mod 33 = 25 \)  
   \( 5^3 = 25 \times 5 = 125 \mod 33 = 125 - 3 \times 33 = 125 - 99 = 26 \)  
   \( 5^4 = 26 \times 5 = 130 \mod 33 = 130 - 3 \times 33 = 130 - 99 = 31 \)  
   \( 5^5 = 31 \times 5 = 155 \mod 33 = 155 - 4 \times 33 = 155 - 132 = 23 \)  
   \( 5^6 = 23 \times 5 = 115 \mod 33 = 115 - 3 \times 33 = 115 - 99 = 16 \)  
   \( 5^7 = 16 \times 5 = 80 \mod 33 = 80 - 2 \times 33 = 80 - 66 = 14 \)  
   So, \( C = 14 \).  
6. Decryption: \( M = C^d \mod n = 14^3 \mod 33 \)  
   \( 14^2 = 196 \mod 33 = 196 - 5 \times 33 = 196 - 165 = 31 \)  
   \( 14^3 = 31 \times 14 = 434 \mod 33 = 434 - 13 \times 33 = 434 - 429 = 5 \)  
   So, \( M = 5 \).  

### 3b. \( p=3 \), \( q=11 \), \( e=7 \), \( M=9 \)

1. \( n = 33 \), \( \phi(n) = 20 \), \( e = 7 \), \( d = 3 \) (as in part a).  
2. Encryption: \( C = M^e \mod n = 9^7 \mod 33 \)  
   \( 9^2 = 81 \mod 33 = 81 - 2 \times 33 = 81 - 66 = 15 \)  
   \( 9^3 = 15 \times 9 = 135 \mod 33 = 135 - 4 \times 33 = 135 - 132 = 3 \)  
   \( 9^4 = 3 \times 9 = 27 \mod 33 = 27 \)  
   \( 9^5 = 27 \times 9 = 243 \mod 33 = 243 - 7 \times 33 = 243 - 231 = 12 \)  
   \( 9^6 = 12 \times 9 = 108 \mod 33 = 108 - 3 \times 33 = 108 - 99 = 9 \)  
   \( 9^7 = 9 \times 9 = 81 \mod 33 = 15 \)  
   So, \( C = 15 \).  
3. Decryption: \( M = C^d \mod n = 15^3 \mod 33 \)  
   \( 15^2 = 225 \mod 33 = 225 - 6 \times 33 = 225 - 198 = 27 \)  
   \( 15^3 = 27 \times 15 = 405 \mod 33 = 405 - 12 \times 33 = 405 - 396 = 9 \)  
   So, \( M = 9 \).  

### 3c. \( p=7 \), \( q=11 \), \( e=17 \), \( M=8 \)

1. \( n = p \times q = 7 \times 11 = 77 \)  
2. \( \phi(n) = (p-1)(q-1) = 6 \times 10 = 60 \)  
3. \( e = 17 \), and \( \gcd(17, 60) = 1 \), so valid.  
4. Compute \( d \) such that \( d \times e \equiv 1 \mod \phi(n) \):  
   \( 17d \equiv 1 \mod 60 \)  
   Using extended Euclidean algorithm:  
   \( 60 = 17 \times 3 + 9 \)  
   \( 17 = 9 \times 1 + 8 \)  
   \( 9 = 8 \times 1 + 1 \)  
   Back substitution:  
   \( 1 = 9 - 8 \times 1 \)  
   \( 8 = 17 - 9 \times 1 \) ⇒ \( 1 = 9 - (17 - 9 \times 1) = 2 \times 9 - 17 \)  
   \( 9 = 60 - 17 \times 3 \) ⇒ \( 1 = 2 \times (60 - 17 \times 3) - 17 = 2 \times 60 - 7 \times 17 \)  
   So, \( -7 \times 17 \equiv 1 \mod 60 \) ⇒ \( d = -7 \mod 60 = 53 \).  
   Verification: \( 17 \times 53 = 901 \), \( 901 \mod 60 = 901 - 15 \times 60 = 1 \).  
5. Encryption: \( C = M^e \mod n = 8^{17} \mod 77 \)  
   Compute powers of 8 modulo 77:  
   \( 8^2 = 64 \mod 77 = 64 \)  
   \( 8^4 = (8^2)^2 = 64^2 = 4096 \mod 77 = 4096 - 53 \times 77 = 4096 - 4081 = 15 \)  
   \( 8^8 = (8^4)^2 = 15^2 = 225 \mod 77 = 225 - 2 \times 77 = 225 - 154 = 71 \)  
   \( 8^{16} = (8^8)^2 = 71^2 = 5041 \mod 77 = 5041 - 65 \times 77 = 5041 - 5005 = 36 \)  
   \( 8^{17} = 8^{16} \times 8 = 36 \times 8 = 288 \mod 77 = 288 - 3 \times 77 = 288 - 231 = 57 \)  
   So, \( C = 57 \).  
6. Decryption: \( M = C^d \mod n = 57^{53} \mod 77 \)  
   Use Chinese Remainder Theorem since \( n = 77 = 7 \times 11 \):  
   - Compute \( M \mod 7 \):  
     \( 57 \mod 7 = 1 \) ⇒ \( 57^{53} \mod 7 = 1^{53} = 1 \)  
   - Compute \( M \mod 11 \):  
     \( 57 \mod 11 = 2 \) ⇒ \( 2^{53} \mod 11 \)  
     By Fermat's little theorem, \( 2^{10} \equiv 1 \mod 11 \), so \( 2^{53} = 2^{5 \times 10 + 3} = (2^{10})^5 \times 2^3 \equiv 1^5 \times 8 = 8 \mod 11 \)  
   So, we have:  
   \( M \equiv 1 \mod 7 \)  
   \( M \equiv 8 \mod 11 \)  
   Let \( M = 7k + 1 \), then \( 7k + 1 \equiv 8 \mod 11 \) ⇒ \( 7k \equiv 7 \mod 11 \) ⇒ \( k \equiv 1 \mod 11 \)  
   So \( k = 11t + 1 \), then \( M = 7(11t + 1) + 1 = 77t + 8 \) ⇒ \( M \equiv 8 \mod 77 \)  
   Thus, \( M = 8 \).  


### 4

设第1天为周一，则各教授的授课条件为：

- 教授1（周一开始，间隔2天）：$T \equiv 1 \pmod{2}$
- 教授2（周二开始，间隔3天）：$T \equiv 2 \pmod{3}$
- 教授3（周三开始，间隔4天）：$T \equiv 3 \pmod{4}$
- 教授4（周四开始，间隔1天）：$T \geq 4$（总是成立当$T \geq 4$）
- 教授5（周五开始，间隔6天）：$T \equiv 5 \pmod{6}$
- 教授6（周六开始，间隔5天）：$T \equiv 6 \pmod{5}$，即$T \equiv 1 \pmod{5}$

周日不上课：$T \equiv 0 \pmod{7}$

简化后可以列出方程：

- $T \equiv 0 \pmod{7}$
- $T \equiv 1 \pmod{5}$
- $T \equiv 11 \pmod{12}$

设 $M = 7 \times 5 \times 12 = 420$

1. 由 $T \equiv 0 \pmod{7}$，得 $T = 7k$

2. 代入 $T \equiv 1 \pmod{5}$：
   $7k \equiv 1 \pmod{5}$  
   $2k \equiv 1 \pmod{5}$  
   $k \equiv 3 \pmod{5}$（因为$2 \times 3 = 6 \equiv 1 \pmod{5}$）  
   所以 $k = 5m + 3$  
   代入得 $T = 7(5m + 3) = 35m + 21$

3. 代入 $T \equiv 11 \pmod{12}$：
   $35m + 21 \equiv 11 \pmod{12}$  
   $11m + 9 \equiv 11 \pmod{12}$  
   $11m \equiv 2 \pmod{12}$  
   $m \equiv 10 \pmod{12}$（因为$11 \times 10 = 110 \equiv 2 \pmod{12}$）  
   所以 $m = 12n + 10$

4. 代入得：
   $T = 35(12n + 10) + 21 = 420n + 350 + 21 = 420n + 371$

最小正整数解为 $T = 371$

则所有教授是在第371天后停课

### 5

#### a. 计算M=30的密文

ElGamal加密过程如下：
密文是一个数对 C = (C₁, C₂)，其中：
C₁ = g^k mod p
C₂ = M * Y_b^k mod p

根据题目a部分给定的值：
*   公用素数 p = 71
*   本原根 g = 7
*   B的公钥 Y_b = 3
*   A选择的随机整数 k = 2
*   明文 M = 30

我们将这些值代入公式进行计算。

**对C₁:**
C₁ = g^k mod p
C₁ = 7² mod 71
C₁ = 49 mod 71
C₁ = 49

**计算C₂:**
C₂ = M * Y_b^k mod p
C₂ = 30 * 3² mod 71
C₂ = 30 * 9 mod 71
C₂ = 270 mod 71

又270 = 3 * 71 + 57。所以余数是57。
C₂ = 57

因此，M=30的密文是 (49, 57)。

#### **b. 计算整数C₂**

根据题目b部分给定的值：
*   公用素数 p = 71
*   本原根 g = 7
*   B的公钥 Y_b = 3 
*   明文 M = 30
*   密文 C = (59, C₂)

根据加密公式 C₁ = g^k mod p，

我们需要找到一个k，使得7的k次方模71等于59。
*   7¹ mod 71 = 7
*   7² mod 71 = 49
*   7³ mod 71 = 343 mod 71 = 59 (因为 343 = 4 * 71 + 59)

所以，k = 3。

计算C₂：
C₂ = M * Y_b^k mod p
C₂ = 30 * 3³ mod 71
C₂ = 30 * 27 mod 71
C₂ = 810 mod 71
为了计算 810 mod 71，我们做除法：810 = 11 * 71 + 29。所以余数是29。
C₂ = 29

因此，整数C₂的值是 **29**。

### 6

在ElGamal加密算法中，为每条消息使用一个全新的、不可预测的随机数 k 是保障其安全性的核心要求。如果重用随机数 k 会让攻击者能够轻易地发现不同消息之间的关联，甚至直接计算出明文。