---
title: 第 10—12 讲作业
description: 阶段iaddq V, rB c 0 F rB V
course: introduction-to-computer-systems
category: homework
order: 4
source_file: ICS/作业/HW101112.md
tags:
  - introduction-to-computer-systems
  - homework
sidebar:
  order: 4
prev:
  link: /courses/introduction-to-computer-systems/homework/09-homework/
  label: 第 9 讲作业
next:
  link: /courses/introduction-to-computer-systems/homework/13-14-homework/
  label: 第 13—14 讲作业
---
## P328 4.51

|阶段|iaddq V, rB c 0 F rB V|
|---|----------------------|
|取指|icode:ifun ← \leftarrow← M1[PC]|
||rA:rB ← \leftarrow← M1[PC+1]|
||valC ← \leftarrow← M8[PC+2]|
||valP ← \leftarrow← PC + 10|
|译码|valB ← \leftarrow← R[rB]|
|执行|valE ← \leftarrow← valB + valC|
||Set CC|
|访存,写回|R[rB] ← \leftarrow← valE|
|更新PC|PC ← \leftarrow← val|

## P329 4.57

### A.加载/使用冒险条件

```
E_icode in { IMRMOVQ, IPOPQ } &&
(
  E_dstM == d_srcB ||
  (
    E_dstM == d_srcA && !(D_icode in { IRMMOVQ, IPUSHQ })
  )
);
```

### B.

修改 e_valA 的值，再修改halt和bubble的条件

```
word e_valA = [
+	E_icode in { IRMMOVQ, IPUSHQ } && E_srcA == M_dstM : m_valM;
 	1 : E_valA;]
```

## 12讲6.23

旋转时间(以ms为单位)

$$
T_{avg\ rotation}=1/2*\frac{1}{RPM}*\frac{60s}{1min}=2ms
$$

传送时间(以ms为单位)  

$T_{avg\ transfer}$

$=\frac{1}{RPM}*
\frac{1}{平均扇区数per磁道}*\frac{60s}{1min}$  

$=5*10^{-3}ms$

则时间为  
$$
T_{access}=T_{avg\ seek}+T_{avg\ rotation}+T_{avg\ transfer}=6.005ms
\approx 6 ms
$$


## 6.24

一个2MB文件，由4000个512字节的逻辑块构成，对于磁盘
$$
T_{avg\ seek}=4ms，T_{max\ rotation}=4ms，T_{avg\ rotation}=2ms
$$

A.在最好的情况下，文件都顺序地映射到磁盘上，则需要磁盘转4圈，则总时间为
$$
T_{avg\ seek}+T_{avg\ rotation}+4*T_{max\ rotation}=22ms
$$

B.在随机情况下文件是随机分布的，则总时间为

$$
4000*(T_{avg\ seek}+T_{avg\ rotation})+4*T_{max\ rotation}=24016ms
\approx 24s
$$
