---
title: 第 2 章：信息表示
description: 总是考虑Tmin，也就是全为1的int，~n+1有奇效
course: introduction-to-computer-systems
category: chapters
order: 1
source_file: ICS/noteExp/C2info.md
tags:
  - introduction-to-computer-systems
  - chapters
sidebar:
  order: 1
prev: false
next:
  link: /courses/introduction-to-computer-systems/chapters/02-bit-operations/
  label: 第 2 章补充：位运算
---
## 整数

- 总是考虑Tmin，也就是全为1的int，~n+1有奇效
- 比较时往范围大的地方隐式转换，有符号/常数和无符号比较转```unsigned```
- 8是```0x1000```出现在开头常为Tmin
- 在小端法存储中，**最低有效字节**存储在*最低地址*
- 指向不同数据类型的数据指针++的时候跳跃的不一样
-  2147483648会因为溢出而作为long或者```unsigned int```与另一个范围内+1进行比较的时候进行隐式类型转换
-  单纯的&与|不能表示所有的逻辑与或非操作，所有逻辑语句都可以由与和异或表示

```cpp
    char *t = "20189";//类似数组的情况，这里是顺序存储的
    int *s = (int *)t;//理解，会按小端法来理解，把第一个撞见的做最低有效字节
    printf("%x\n", *s);//会输出0x38313032
```

## 浮点数

- 浮点运算是可交换，不可结合与分配的
- float：e=8，m=23，记一半就行，剩下用总位数和符号位减法，bias是2^7-1
- double：e=11，m=52，bias是2^10-1，bias就是2^e-1
- 实数转换到浮点数最大误差为2^127*2^-24=2^103：是来自于阶码最大然后尾数最后一位发生舍入的情况下产生的
- 正负inf相加结果是未定义，并且这和Nan并非一样
- 计算浮点数表达数字种时，阶数更重要
- 记住非规格化的情况是```1-bias```，所以最低到```2^(-(bias-1))```这里是-1
- sizeof函数返回无符号整数，注意在表达式里的转换
- 浮点数可以精确表示的最大数字是2^(尾数位数+1)+1，这里理解为数字即可
- 阶码字段增加， 小数字段减少，可以表示的 NaN 的数量减少，所以能表示的实数值增多

### 推导
共9位
$$
规格化数的数量为 ( 2 \times (2^k - 2) \times 2^{8-k} )（原始格式）。
\newline
规格化数的数量为 ( 2 \times (2^{k+1} - 2) \times 2^{7-k} )（新格式）。
\newline
非规格化数：
\newline
非规格化数的数量为 ( 2 \times 2^{8-k} )（原始格式）。
\newline
非规格化数的数量为 ( 2 \times 2^{7-k} )（新格式）。
$$
