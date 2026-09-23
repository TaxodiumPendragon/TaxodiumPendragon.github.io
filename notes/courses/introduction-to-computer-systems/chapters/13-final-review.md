---
title: 期末复习
description: L2 缓存：在速度和命中率之间进行权衡。
course: introduction-to-computer-systems
category: chapters
order: 12
source_file: ICS/noteExp/Final.md
tags:
  - introduction-to-computer-systems
  - chapters
sidebar:
  order: 12
prev:
  link: /courses/introduction-to-computer-systems/chapters/12-ascend-lecture/
  label: 昇腾 AI 计算系统讲座
next: false
---
> 周一最后一节课存在前沿内容靠选择题

## 不考的

1. 动态链接
2. RIO
3. 网络编程计网部分PPT

## 1.

## 6

L1 缓存：更看重访问速度。
L2 缓存：在速度和命中率之间进行权衡。

## 9

- TLB在上下文切换的时候刷新。内核与用户态切换的时候不改变内存映射

## 10.

- 不同操作系统用到的系统调用不一样(C语言中的I/O函数，并不线程安全)
- 

## 11.

注意fork使用之后会复制的东西
- fork和longjmp返回多次(longjmp第一次返回0)，set和execve从不返回
- ```?```：用于分隔 URL 的路径部分和查询参数部分。查询参数部分紧跟在 ? 之后。```&```：用于分隔多个查询参数。
- 路由器可以把多个***不兼容***的网络连接起来组成一个互联网络
- 连接是两个套接字四元组，套接字存放端口和地址

## 12.

- 并行是指**多处理器**处理相同问题,并发则相同处理器
- 互斥锁加锁顺序规则是所有线程以相同顺序加锁