---
title: 第 5—7 讲作业
description: long loop(long x,int n){
course: introduction-to-computer-systems
category: homework
order: 2
source_file: ICS/作业/HW567.MD
tags:
  - introduction-to-computer-systems
  - homework
sidebar:
  order: 2
prev:
  link: /courses/introduction-to-computer-systems/homework/04-homework/
  label: 第 4 讲作业
next:
  link: /courses/introduction-to-computer-systems/homework/09-homework/
  label: 第 9 讲作业
---
## P217 3.60

>> 填写代码缺失部分

```cpp
long loop(long x,int n){
    long result=0;
    long mask;
    for(mask=1;mask!=0;mask=mask<<n){
        result|=x&mask;
    }
    return result;
}
```

## P219 3.63

>> fill in code

```cpp
long switch_prob(long x, long n){
    long result=x;
    switch (n){
        case 60:
        case 62:
        result=8*x;
        break;
        case 63:
        result=x>>3;
        break;
        case 64:
        result=(x<<4)-x;
        case 65:
        result=x*x;
        default:
        result=x+0x4B;
    }
    return result;
}
```

## P221 3.66

>> 考虑下面的源代码，这里NR和NC是用#define声明的宏表达式，计算用参数n表述的矩阵A的维度。······确定NR和NC的定义

```asm
//n in %rdi,A in %rsi,j in %rdx
sum_col:
  leaq 1(,%rdi,4), %r8        // %r8 = n*4 + 1
  leaq (%rdi,%rdi,2), %rax    // %rax = n*3
  movq %rax, %rdi             // %rdi = n*3
  testq %rax, %rax            // test n*3
  jle .L4                     // n*3 <= 0, jump .L4
  salq $3, %r8                // %r8 = %r8*8 = 8*(n*4 + 1)
  leaq (%rsi,%rdx,8), %rcx    // %rcx = j*8 + A
  movl $0, %eax               // %rax = 0
  movl $0, %edx               // %rdx = 0
.L3:
  addq (%rcx), %rax           // %rax = *(%rcx) = *(A + j*8)
  addq $1, %rdx               // %rdx = %rdx+1
  addq %r8, %rcx              // %rcx = %r8+%rcx = A + j*8 + 8*(n*4 + 1)
  cmpq %rdi, %rdx             // cmp %rdx & %rdi
  jne .L3                     // if %rdx != n*3, loop
  rep
  ret
.L4:
  movl $0, %eax               // return 0
  ret
```

由jne .L3上一句可知NR(n)=3*n
NC(n)=4*n+1;

## P221 3.67

### A:栈帧
|       |值|
|-------|--|
|+64	|返回地址  |
|-----	|–  |
|+24	|z|
|+16	|s.p=&z|
|+8     |	y|
|%rsp   |	x|

### B:eval调用process时传递的值

传递了%rsp+64

### C
通过%rsp+偏移量来访问

### D

process通过传递的%rsp+64存储，最后回到该地址，通过%rdi+偏移量来寻址元素

### E：eval栈帧

|	    |值|
|-------|-------------|
|+80	|z  |
|+72	|x|
|+64	|y  |
|-----	|–  |
|+24	|z|
|+16	|s.p=&z|
|+8     |	y|
|%rsp   |	x|

### F

利用%rsp+偏移量来传递作为函数参数的结构，利用%rdi+偏移量来设置函数结果的结构

## P223 3.68

由q->t = 8(%rsi)，有4<B<=8,由q->u = 32(%rsi)及long类型，6<A<=10,又p->y = 184(%rdi)，44<A*B<=46.

则**A=9，B=5**
