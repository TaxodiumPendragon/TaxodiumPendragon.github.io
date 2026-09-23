---
title: 第 19—20 讲作业
description: 在下面的一系列问题中...0X027c
course: introduction-to-computer-systems
category: homework
order: 8
source_file: ICS/作业/HW1920.md
tags:
  - introduction-to-computer-systems
  - homework
sidebar:
  order: 8
prev:
  link: /courses/introduction-to-computer-systems/homework/17-18-homework/
  label: 第 17—18 讲作业
next:
  link: /courses/introduction-to-computer-systems/homework/21-homework/
  label: 第 21 讲作业
---
## 9.11

> 在下面的一系列问题中...0X027c

### A.虚拟地址格式  
|0| 0| 0| 0| 1| 0| 0| 1| 1| 1| 1| 1| 0| 0|

### B.地址翻译

|参数	|值|
|-------|-----|
|VPN	|0x09|
|TLBI	|0x01|
|TLBT	|0x02|
|TLB命中?	|否|
|缺页?|	否|
|PPN	|0x17|

### C.物理地址格式

| 0| 1| 0| 1| 1| 1| 1| 1| 1| 1| 0| 0|

### D.物理地址引用

|参数|	值|
|---|-----|
|CO	|0x00|
|CI	|0x0F|
|CT	|0x17|
|命中?	|否|
|值	|—–|

## 9.12

> 虚拟地址0X03a9

### A.虚拟地址格式  
| 0| 0| 0| 0| 1| 1| 1| 0| 1| 0| 1| 0| 0| 1|

### B.地址翻译

|参数	|值|
|-------|-----|
|VPN	|0x0E|
|TLBI	|0x02|
|TLBT	|0x03|
|TLB命中?	|否|
|缺页?|	否|
|PPN	|0x11|

### C.物理地址格式

| 0| 1| 0| 0| 0| 1| 1| 0| 1| 0| 0| 1|

### D.物理地址引用

|参数|	值|
|---|-----|
|CO	|0x01|
|CI	|0x0A|
|CT	|0x11|
|命中?	|否|
|值	|—–|

## 9.13

> 虚拟地址0X0040

### A.虚拟地址格式  
| 0| 0| 0| 0| 0| 0| 0| 1| 0| 0| 0| 0| 0| 0|

### B.地址翻译

|参数	|值|
|-------|-----|
|VPN	|0x01|
|TLBI	|0x01|
|TLBT	|0x00|
|TLB命中?	|否|
|缺页?|	是|
|PPN	|——|

### C.物理地址格式

缺页

### D.物理地址引用

缺页
