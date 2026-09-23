---
title: 第 13—14 讲作业
description: +----+----+----+----+-----+-----+
course: introduction-to-computer-systems
category: homework
order: 5
source_file: ICS/作业/HW1314.md
tags:
  - introduction-to-computer-systems
  - homework
sidebar:
  order: 5
prev:
  link: /courses/introduction-to-computer-systems/homework/10-12-homework/
  label: 第 10—12 讲作业
next:
  link: /courses/introduction-to-computer-systems/homework/15-16-homework/
  label: 第 15—16 讲作业
---
## P393 5.13

A.
```
 +----+----+----+----+-----+-----+
 |%rbp|%rcx|%rax|%rbx|%xmm1|%xmm0|
 +----+----+----+----+-----+-----++----+
   +----|----|----|----------|--->|    |
   |    +----|----|----------|--->|load|      vmovad 0(%rbp,%rcx,8),%xmm1
   |    |    |    |    +-----|----|    |
   |    |    |    |    |     |    +----+
   |    +----|----|----------|--->|    |
   |    |    |    |    |     |    |load|---+
   |    |    +----|----------|--->|    |   |
   |    |    |    |    |     |    +----+   |  vmulsd (%rax,%rcx,8),%xmm1,%xmm0
   |    |    |    |    |     |    |    |<--+
   |    |    |    |    +-----|--->|mul |
   |    |    |    |    +-----|----|    |
   |    |    |    |    |     |    +----+
   |    |    |    |    +-----|--->|    |
   |    |    |    |    |     +--->|add |      vaddsd %xmm1,%xmm0,%xmm0
   |    |    |    |    |     +----|    |
   |    |    |    |    |     |    +----+
   |    +----|----|----------|--->|    |
   |         |    |    |     |    |add |      addq $1, %rcx
   |    +----|----|----------|----|    |
   |    |    |    |    |     |    +----+
   |    +----|----|----------|--->|    |
   |    |    |    |    |     |    |cmp |---+  cmpq %rbx, %rcx
   |    |    |    +----|-----|--->|    |   |
   |    |    |    |    |     |    +----+   |
   |    |    |    |    |     |    |    |   |
   |    |    |    |    |     |    |jne |<--+  jne .L15
   |    |    |    |    |     |    |    |
   |    |    |    |    |     |    +----+
   v    v    v    v    v     v
 +----+----+----+----+-----+-----+
 |%rbp|%rcx|%rax|%rbx|%xmm1|%xmm0|
 +----+----+----+----+-----+-----+



      +----+                      +-----+
      |%rcx|                      |%xmm0|
      +----+                      +-----+
        |                           |
        |     +----+                |  <--------- key path
        +---->|load|------+         |
        |     +----+      |         |
        |                 v         v
        |     +----+    +-+--+    +-+--+
        +---->|load|--->|mul |--->|add |
        |     +----+    +----+    +----+
        |                           |
        |                           |
        v                           |
      +----+                        |
      |add |                        |
      +----+                        |
        |                           |
        v                           v
      +-+--+                      +-----+
      |%rcx|                      |%xmm0|
      +----+                      +-----+
```
### B.

3.0

### C.

1.0

### D.

因为两个版本的浮点乘法都不在关键周期

## 5.14

### A

虽然迭代过程减少了，但是每次迭代仍然要进行6个乘法操作，最后仍然有n个惩罚操作

### B

同上

## 5.15

```cpp
void inner4(vec_ptr u, vec_ptr v, data_t *dest) {
  long i;
  long length = vec_length(u);
  data_t *udata = get_vec_start(u);
  data_t *vdata = get_vec_start(v);
  data_t sum = (data_t) 0;
  data_t sum1 = (data_t) 0;
  data_t sum2 = (data_t) 0;
  data_t sum3 = (data_t) 0;
  data_t sum4 = (data_t) 0;
  data_t sum5 = (data_t) 0;
  for (i = 0; i < length-6; i+=6) {
    sum = sum + udata[i] * vdata[i];
    sum1 = sum1 + udata[i+1] * vdata[i+1];
    sum2 = sum2 + udata[i+2] * vdata[i+2];
    sum3 = sum3 + udata[i+3] * vdata[i+3];
    sum4 = sum4 + udata[i+4] * vdata[i+4];
    sum5 = sum5 + udata[i+5] * vdata[i+5];
  }
  for(; i < length; i++) {
    sum = sum + udata[i] * vdata[i];
  }
  *dest = sum + sum1 + sum2 + sum3 + sum4 + sum5;
}
```
加载器只有两个

## 5.16

```cpp
void inner4(vec_ptr u, vec_ptr v, data_t *dest) {
  long i;
  long length = vec_length(u);
  data_t *udata = get_vec_start(u);
  data_t *vdata = get_vec_start(v);
  data_t sum = (data_t) 0;
  for (i = 0; i < length-6; i+=6) {
    sum = sum + (udata[i] * vdata[i]
              + (udata[i+1] * vdata[i+1]
              + (udata[i+2] * vdata[i+2]
              + (udata[i+3] * vdata[i+3]
              + (udata[i+4] * vdata[i+4]
              + (udata[i+5] * vdata[i+5])))));
  }
  for(; i < length; i++) {
    sum = sum + udata[i] * vdata[i];
  }
  *dest = sum;
}
```


## P453 6.30

### A.

$C=SEB=8*4*4=128字节$

### B.

$b=2，s=3，m=13$ 

CT=m[5-12],CI=m[2-4],CO=m[0-1]

## 6.31

### A.

0011 1000 110 10

### B.

|参数|值|
|---|--|
|CO|0x2|
|CI|0x6|
|CT|0x38|
|高速缓存命中|是|
|返回的高速缓存字节|0xEB|

> 虽然第一个38有效位是0，但是后面的有效位是1，因为是先匹配有效位的

## 6.32

### A.

1011 0111 010 00

### B.

|参数|值|
|---|--|
|CO|0x0|
|CI|0x2|
|CT|0xB7|
|高速缓存命中|否|
|返回的高速缓存字节|0x——|

## 6.33

0x1788,0x1789,0x178A,0x178B  
0x16C8,0x16C9,0x16CA,0x16CB

## 6.34

dst数组

| |列0|列1|列2|列3|
|-|---|---|---|---|
|行0|m|m|m|m|
|行1|m|m|m|m|
|行2|m|m|m|m|
|行3|m|m|m|m|

src数组

| |列0|列1|列2|列3|
|-|---|---|---|---|
|行0|m|m|h|m|
|行1|m|h|m|h|
|行2|m|m|h|m|
|行3|m|h|m|h|

## 6.35

src和dst数组都如此
| |列0|列1|列2|列3|
|-|---|---|---|---|
|行0|m|h|h|h|
|行1|m|h|h|h|
|行2|m|h|h|h|
|行3|m|h|h|h|
