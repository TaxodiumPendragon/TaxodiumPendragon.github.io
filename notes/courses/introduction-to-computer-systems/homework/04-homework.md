---
title: 第 4 讲作业
description: 函数原型long decode(long x,long y,long z);
course: introduction-to-computer-systems
category: homework
order: 1
source_file: ICS/作业/HW4.md
tags:
  - introduction-to-computer-systems
  - homework
sidebar:
  order: 1
prev: false
next:
  link: /courses/introduction-to-computer-systems/homework/05-07-homework/
  label: 第 5—7 讲作业
---
## 3.58 P217
函数原型long decode(long x,long y,long z);
GCC汇编：x in %rdi,y in %rsi,z in %rdx

```asm
decode2:
subq %rdx,%rsi  # y-=z;
imulq %rsi,%rdi # x*=y;
movq %rsi,%rax  # int r=y;
salq $63,%rax   # r<<=63;
sarq $63,%rax   # r>>=63;
xorq %rdi, %rax # r=x^r;
ret
```

### anser

```cpp
long decode(long x,long y,long z){
    y-=z;
    x*=y;
    long r=(y<<63)>>63;
    r=x^r;
    return r;
}

```