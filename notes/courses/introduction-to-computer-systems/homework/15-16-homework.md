---
title: 第 15—16 讲作业
description: int bufp0 = &buf[0];
course: introduction-to-computer-systems
category: homework
order: 6
source_file: ICS/作业/HW1516.md
tags:
  - introduction-to-computer-systems
  - homework
sidebar:
  order: 6
prev:
  link: /courses/introduction-to-computer-systems/homework/13-14-homework/
  label: 第 13—14 讲作业
next:
  link: /courses/introduction-to-computer-systems/homework/17-18-homework/
  label: 第 17—18 讲作业
---
## C7,7.6

```cpp
extern int buf[];

int* bufp0 = &buf[0];
static int* bufp1;

static void incr() {
  static int count=0;
  count++;
}

void swap() {
  int temp;

  incr();
  bufp1 = &buf[1];
  temp = *bufp0;
  *bufp0 = *bufp1;
  *bufp1 = temp;
}
```

> 对于每个```swap.o```中定义和引用的符号，请指出它是否在模版```swap.o```的```.symtab1```节中有符号条目，如果有请指出

|   |.symtab条目?|	符号类型|定义符号的模块|节|
|---|------------|---------|-------------|--|
|buf  |  Yes|external|	m	|.data|
|bufp0|  Yes|global|	swap|.data|
|bufp1|  Yes|local|	swap	|.bss|
|swap |  Yes|global|	swap|.text|
|temp |  No	|   ——|	—–	|——|
|incr |  Yes|local|	swap	|.text|
|count|	 Yes|local|	swap	|.bss|

## 7.8

### A

main.1  
main.2

### B

unknown  
unknown

### C

error
error

## 7.12

> 考虑7.6中目标文件对swap函数的调用
> 具有如下重定位条目

```cpp
r.offset=0xa
r.symbol=swap
r.type =R_X86_64_PC32
r.addend=-4
```

### A.

ADDR(s) = ADDR(.text) = 0x4004e0  

ADDR(r.symbol) = ADDR(swap) = 0x4004f8  

refaddr = ADDR(s) + r.offset = 0x4004ea  

*refptr = (unsigned) (ADDR(r.symbol) + r.addend - refaddr) = 0xa

### B.

ADDR(s) = ADDR(.text) = 0x4004d0  

ADDR(r.symbol) = ADDR(swap) = 0x400500  

refaddr = ADDR(s) + r.offset = 0x4004da  

*refptr = (unsigned) (ADDR(r.symbol) + r.addend - refaddr) = 0x22

## C8 8.9

AB不是，表格内其他都是并行的

## 8.18

> 考虑下面程序...判断下面哪个输出是可能的。

B和D是不可能的，ACE是可能的

## 8.19

$2^n$
