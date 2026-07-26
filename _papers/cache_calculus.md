---
title: "Cache Calculus"
venue: CAL
year: 2016
authors: "Nathan Beckmann, Daniel Sanchez"
summary: "用连续模型与闭式解分析缓存命中行为，覆盖扫描、随机与堆栈等访问模式。"
tags: [cache, modeling, analytical]
links:
  - label: PDF
    url: https://people.csail.mit.edu/sanchez/papers/2016.cachecalc.cal.pdf
---

[https://people.csail.mit.edu/sanchez/papers/2016.cachecalc.cal.pdf](https://people.csail.mit.edu/sanchez/papers/2016.cachecalc.cal.pdf)

##  基本概念回顾
+ 缓存的access pattern:扫描，随机和堆栈
+ 闭式解与ODE：含有导数和原式子的公式，闭式解就是指能得出一个“**有限数量的标准运算和已知函数”明确表达出来**的表达式
+ 提到的用于对比的其他研究缓存行为变化（主要是命中率和未命中率）的方式：数值迭代、仿真

## 汇报大纲
### 整体思路
1. 回顾cache
2. <font style="color:black;">什么是Cache Caculus及其研究背景</font>
3. <font style="color:black;">Cache Caculus的原理和定义</font>
4. <font style="color:black;">基于Cache Caculus得出的解</font>
+ <font style="color:black;">对三种经典访问模式算出来的公式</font>
+ <font style="color:black;">更复杂访问模式下的解</font>
5. <font style="color:black;">结论</font>

## 一些细节
+ 作者N.Beckman在写作时是MIT计算机科学与人工智能实验室（CSAIL）的博士研究生，另一个作者<font style="color:black;">D. Sanchez</font>是他的导师，其中一篇参考文献是这位作者的博士论文，作者在2019年去CMU当了助理教授
+ 基于的离散模型里<font style="color:black;">为什么三个公式是成立的？</font>
    1. <font style="color:black;">年龄方程基于推理定义的命中方程是基于年龄和共同假设推导的</font>
    2. <font style="color:black;">驱逐方程比较特殊(不对，那除了随机策略，驱逐怎么计算的?为了简化，前几个情况都是随机替换，后面引入了排名函数）</font>

### <font style="color:black;">怎么模拟的？</font>
使用了体系结构仿真器（gem5或者zsim）并没有直接提到，可能是zsim。前文提到的离散模型使用了SPEC CPU2006基准测试

## 反思总结
+ 二作<font style="color:black;">D. Sanchez</font>有广泛的研究可以多了解介绍
+ 尽量脱稿，英文使用
+ 一个学长提到的流式访问是否可以使用cache calculus作为数学工具？在GPU中没有CPU一般的空间使用复杂cache，iid假设难以迁移
