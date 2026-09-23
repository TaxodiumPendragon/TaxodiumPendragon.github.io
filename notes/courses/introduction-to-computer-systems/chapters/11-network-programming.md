---
title: 第 11 章：网络编程
description: TCP连接中，客户端和服务器都是指进程
course: introduction-to-computer-systems
category: chapters
order: 10
source_file: ICS/noteExp/C11network.md
tags:
  - introduction-to-computer-systems
  - chapters
sidebar:
  order: 10
prev:
  link: /courses/introduction-to-computer-systems/chapters/10-system-io/
  label: 第 10 章：系统 I/O
next:
  link: /courses/introduction-to-computer-systems/chapters/12-ascend-lecture/
  label: 昇腾 AI 计算系统讲座
---
- TCP连接中，客户端和服务器都是指**进程**
- 域名和IP是多对多映射关系
- TCP提供可靠传输，在两个进程之间传输(不是主机)，是全双工的，不依赖DNS
- HTTP是用户级别的，其他底层协议是kernel的
- socket返回的不能直接读写。还要经过server/client之后的处理
- 代理服务器作为客户和server中介，在与server连接的时候会动态分配新的端口
- 动态内容(可执行文件)、服务动态内容，静态内容如磁盘文件、服务静态内容(服务器将静态文件大宋给客户端)