---
title: 第 8 章：异常控制流
description: 内核把进程从内核模式切换到用户模式的时候才会检查进程未阻塞的待处理信号
course: introduction-to-computer-systems
category: chapters
order: 7
source_file: ICS/noteExp/C8ECF.md
tags:
  - introduction-to-computer-systems
  - chapters
sidebar:
  order: 7
prev:
  link: /courses/introduction-to-computer-systems/chapters/07-linking/
  label: 第 7 章：链接
next:
  link: /courses/introduction-to-computer-systems/chapters/09-dynamic-memory/
  label: 第 9 章：动态内存分配
---
## 接收信号

- 内核把进程从**内核模式切换到用户模式**的时候才会检查进程未阻塞的待处理信号
- 注意子进程可以比父进程先结束，父进程将无法发送信号给子进程
- 信号至少会处理一次。但可能多次信号只一次
- 异常只有中断是异步的，其他故障/陷阱/终止都是同步的
- 用户态到内核态的唯一途径是中断/异常/陷入机制
- 中断来自I/O设备，故障是缺页，陷阱多为系统调用(文件IO和进程控制)，硬件非法终止
- SIGTSTP 可以被忽略；既不能被捕获又不能被忽略的是 SIGKILL 和 SIGSTOP
- 系统调用可以被中断，如 read 这样的慢速系统调用
- ```SIGCHLD```信号在fork子进程结束时产生