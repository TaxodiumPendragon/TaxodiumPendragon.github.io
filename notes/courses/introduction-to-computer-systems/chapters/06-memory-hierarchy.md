---
title: 第 6 章：存储层次
description: 即使在地址里，也要注意十六进制表示的时候使用最低有效位，另外首位多余0可以不理
course: introduction-to-computer-systems
category: chapters
order: 5
source_file: ICS/noteExp/C6memory.md
tags:
  - introduction-to-computer-systems
  - chapters
sidebar:
  order: 5
prev:
  link: /courses/introduction-to-computer-systems/chapters/04-architecture/
  label: 第 4 章：处理器体系结构
next:
  link: /courses/introduction-to-computer-systems/chapters/07-linking/
  label: 第 7 章：链接
---
> 即使在地址里，也要注意十六进制表示的时候使用最低有效位，另外首位多余0可以不理

## RAM与Disk

- 磁盘旋转时间记录记得**/2**
- 高速缓存利用了时间局部性
- 一级高速缓存更看重命中时间(E低)，L2/L3更看重命中率，E高以减少不命中惩罚

策略
- 如果LRU策略造成N+1次miss，其他策略也至少miss两次，N为大小
- LRU不适合数组顺序访存，因为缺乏时间局部性

## cahce结构

### 细节概念

- cache总大小=数据大小+(有效位大小1+标记位大小)*块数，标记位通常依靠地址位，t=m-s-b
- cache的结构中S和B都需要是2的幂,如果要进行大小调整，只能调整行E,因为行匹配是直接通过tag

### 大题

- 注意地址是字节寻址的，在cache的一行中以块为单位，存储时也是如此
- 直接映射的冲突在于组索引的相同，这一点要从底层考虑(到底mod2^多少)，可以以右移的思想思考计数，因为数据往往是多个字节的