---
title: 第 24—26 讲作业
description: static int readtimes;
course: introduction-to-computer-systems
category: homework
order: 10
source_file: ICS/作业/HW24-26.md
tags:
  - introduction-to-computer-systems
  - homework
sidebar:
  order: 10
prev:
  link: /courses/introduction-to-computer-systems/homework/21-homework/
  label: 第 21 讲作业
next: false
---
## 12.17

### A.

主线程没有等待其他线程

### B

pthread_exit

## 12.18

A不安全  
B安全
C不安全

## 12.19

```cpp
static int readtimes;
static int writetimes;
static int readcnt;
// 如果读者在等待写者，下一层它更先
static int reader_first;
sem_t mutex, w;

void *reader(void *vargp) {
  while (1) {
    P(&mutex);
    readcnt++;
    if (readcnt == 1)
      P(&w);
    V(&mutex);

    /* Critical section */
    readtimes++;
    reader_first = 0;
    

    P(&mutex);
    readcnt--;
    if (readcnt == 0)
      V(&w);
    V(&mutex);
  }
}
```



## 12.30

### A.

- 线程 1: a&b, a&c

- 线程 2: b&c

- 线程 3: a&b

### B.

线程 2 和 线程 3

### C.

每个线程中按照相同的顺序对P(a), P(b),和P(c) 进行操作

## 12.28

对死锁无影响

