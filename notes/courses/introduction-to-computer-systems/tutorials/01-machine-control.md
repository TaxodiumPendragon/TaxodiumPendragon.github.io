---
title: 机器级程序：控制
description: while,do-while,for loop
course: introduction-to-computer-systems
category: tutorials
order: 1
source_file: ICS/小班课/回课.md
tags:
  - introduction-to-computer-systems
  - tutorials
sidebar:
  order: 1
prev: false
next:
  link: /courses/introduction-to-computer-systems/tutorials/02-memory-hierarchy/
  label: 存储层次
---
> while,do-while,for loop

## 循环的实现

循环是程序三大结构——顺序、选择、循环结构——之一，可以用较短的代码有效实现复杂的过程。

### 跳转指令

- 类似于C语言中的goto语句，可以改变汇编语言中的顺序结构，有无条件跳转指令jmp和其他以jmp为代表的有条件跳转指令。可以通过向上的有条件跳转或者多个跳转来实现循环结构。
- 有条件跳转依赖于条件码，条件码一般表示上一个操作进行后的状态，常见的有为零、溢出、进位借位和负数
- 此外还有循环指令loop

条件和jump，类似C语言中goto语句的形式来在汇编之中实现

|条件码|	含义|	描述|
|--|-----|-------|
|ZF|	Zero Flag|	零标志，当结果为零时置位|
|SF	|Sign Flag	|符号标志，当结果为负时置位|
|CF	|Carry Flag	|进位标志，当发生进位或借位时置位|
|OF	|Overflow Flag|	溢出标志，当有符号溢出时置位|
|PF	|Parity Flag	|奇偶标志，当结果的最低字节中1的个数为偶数时置位|
|AF	|Auxiliary Carry Flag|	辅助进位标志，用于BCD运算时的进位|

## 三大循环的异同

|----|do-while|while|for|
|----|--------|-----|---|
|特点|先执行一遍|判断之后再进入循环|清楚循环次数|
|汇编实现|    |      |   |

- do-while通过一个向前的有条件跳转来实现，先执行后判断的流程虽然有些不符合直觉认知，但在计算机处理的流水线中却很合适
- while与do-while最显著的区别是需要先进行条件判断，所以要在循环开始跳转到后面进行条件判断，然后再跳转到中间。或者另外一种翻译方式，先判断，若不满足直接结束循环
- for相比之下多了初始值和自增/自减环节，和while很像，一般用于清楚循环次数的循环结构

## 性能比较


回到汇编来看


>> i++与++i

i++：需要额外的指令来保存变量的原始值，然后再进行递增操作，增加了指令数量和寄存器的使用。
++i：直接对变量进行递增操作，然后返回递增后的值，指令数量较少，寄存器使用更高效。

## switch

答案是D，因为前两个缺少跳转表格式的*，且不是正常跳转，而x86-64系统中8字节更常见，所以选D


2014期中考试题目