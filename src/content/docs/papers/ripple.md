---
title: "Ripple: Asynchronous Programming for Spatial Dataflow Architectures"
description: 用异步迭代器与硬件令牌队列消除 SDA 上的抽象倒置，提升不规则工作负载性能。
venue: PLDI
year: 2025
authors: Souradip Ghosh, Yufei Shi, Brandon Lucia, Nathan Beckmann
tags:
  - SDA
  - async
  - programming-model
  - ISA
links:
  - label: DOI
    url: https://doi.org/10.1145/3729256
sidebar:
  order: 5
  label: Ripple · 异步数据流编程
---

**Souradip Ghosh, Yufei Shi, Brandon Lucia, and Nathan Beckmann, **[**Ripple: Asynchronous Programming for Spatial Dataflow Architectures**](https://doi.org/10.1145/3729256)**," Proc. ACM Program. Lang. 9, PLDI, Article 157 (June 2025), 28 pages.**

> cache calculus作者也有Nathan Beckmann
>

## 一、Abstract
> **abstraction inversion**: they fail to capture coarse-grain dataflow semantics in the application — namely asynchronous communication, pipelining, and queueing — that are naturally supported by the dataflow execution model and existing SDA hardware.
>

### 1.研究背景
空间数据流架构（SDA）是一种高效的硬件加速器，但在处理不规则计算（如图分析、稀疏线性代数）时效率低下。其根本原因是“抽象倒置”：硬件底层天然支持数据流语义（如异步通信、流水线），但上层用C等顺序语言编写的程序无法直接表达这些语义，导致硬件无法充分利用



Ripple是一个软硬协同设计的系统，旨在消除抽象倒置。其核心创新点包括：

+ 编程模型：引入了“异步迭代器”，让程序员能用类似任务并行的直观方式，编写出天然适合数据流硬件执行的、异步流水线风格的程序。
+ 硬件指令集架构：在ISA中显式暴露“硬件令牌队列”，使编译器能直接映射和管理任务间通信，实现高效且无死锁的异步通信。
+ 完整工具链：论文实现了从编程语言、编译器到硬件扩展的完整原型

### 2.研究团队背景
这篇论文发表在计算机系统与编程语言领域的顶级会议之一 PLDI 2025上。它同时被收录于ACM的期刊《Proceedings of the ACM on Programming Languages》（PACMPL）。研究团队都来自CMU的一个叫CORGi(Computer Organization Research Group)的研究组。2025年新论文

| **Souradip Ghosh** (第一作者) | 核心贡献者，在ISCA、MICRO等顶级会议上有多篇数据流架构相关论文。<br/>在25年更新的个人网站里显示是CS方向博四生，是另两位作者的学生。感兴趣**<font style="color:rgb(73, 78, 82);">post-von Neumann computer architectures(后冯诺依曼架构？)</font>**<font style="color:rgb(73, 78, 82);">. 正在工作的领域</font>_<font style="color:rgb(73, 78, 82);">parallel programming for spatial dataflow architectures</font>_<font style="color:rgb(73, 78, 82);">并行</font> |
| --- | --- |
| **Brandon Lucia** | 副教授，研究方向包括间歇计算、低功耗系统，在PLDI、OSDI等发表多篇论文。<br/>+ <font style="color:rgb(85, 85, 85);">研究关键词之一：Intersection of computer architecture, computer systems, and programming languages</font> |
| **Nathan Beckmann** | 助理教授，研究方向包括计算机体系结构、缓存系统，在ISCA、MICRO等顶级会议发表多篇论文，比如cache calculus，博士论文写的缓存，现在是副教授了 |


**拓展**

post-von Neumann后冯诺依曼架构

+ 内存计算 / 存内计算：近内存计算，如如高带宽内存HBM
+ 神经形态计算：事件驱动、高度并行(如英特尔的Loihi芯片)，存算一体
+ 量子计算
+ 非冯诺依曼架构



### 3.基本概念
+ ASIC：Application-Specific Integrated Circuit（专用集成电路）。为某一个算法或应用定制的硬件，比如比特币矿机（只做哈希运算）、TPU（Tensor Processing Unit，专为神经网络计算），性能高、功耗低但代价高
+ 粗粒度、细粒度：描述并行计算中任务划分的粗细程度
    - **细粒度并行**：任务被分解成非常小的操作，比如单个加法、单个内存读取。这样硬件可以在每个时钟周期内同时执行很多这样的操作（指令级并行）
    - **粗粒度并行**：任务被分解成较大的子任务，比如一个函数、一个循环体。这样程序员或编译器更容易管理，但可能浪费了硬件能够同时执行更多小操作的能力
+ SDA生成的DFG数据流图：DFG（数据流图）是程序在 SDA 上的中间表示形式，其中节点是操作指令，有向边是数据依赖关系
+ 关于SDA的结构：SDA(空间数据流架构)是一种硬件设计风格。由很多处理单元（PE）组成的网格，PE 之间通过片上网络（NoC）连接，每个 PE 有硬件队列来暂存数据。
+ 在 SDA 中，程序被映射到由许多处理单元（PE）组成的网格上。当一个 PE 收集齐了所需的输入令牌（Token）时，它就会“触发”（fire）并执行一条指令。



## 二、LOG
### 1.Motivation
+ **背景**：SDA硬件省电、速度快可编程，但编程困难
    - 使用C语言编程，然后编译器将其转换为数据流图映射到硬件
+ **问题**：抽象倒置
    - SDA硬件本应支持异步、队列、流水线等机制
    - 但编译器无法识别这些机制，都转换为内存读写和if-else
    - **结果**：编译器生成的 DFG 里就充满了控制指令（红色节点），数据指令（绿色）反而很少，程序臃肿，性能差
    - **例证**：existing SDAs commonly extract DFGs from sequential [8, 14, 24, 34–36, 42, 54, 55, 59, 70, 76, 81, 82, 87] or data-parallel [45, 72, 77, 84, 85]

#### 例子：BFS广搜
+ 天然就要用队列来存待处理的顶点。
+ 用 C 写：手动维护一个队列（数组 + head/tail 指针）
+ 导致编译器生成的 DFG：控制节点（判断、分支）大大多于数据节点，指令数多，并行度低。

<img src="https://cdn.nlark.com/yuque/0/2026/png/64694239/1773102292767-74157e47-e400-44f3-a60a-5b67305c4234.png" width="807.7669860174944" title="" crop="0,0,1,1" id="u823f631e" class="ne-image">

#### 解决方案：RIPPLE
+ 新的编程语言能直接告诉硬件“队列”与“异步”操作
+ 编译器就能直接把这种意图映射到硬件已有的队列上
+ DFG 变小，提高并行度

### 2.Method
#### （1）阅读过程中的问题
+ HW Queues硬件队列缓冲令牌是如果实现的?
+ 为什么说SDAs未能很好地捕捉应用程序中的粗粒度数据流语义，如何理解SDA的结构？
+ 为什么ripple的队列可以防止死锁？
+ RIPPLE扩展了ISA，这个是基于什么语言的ISA，是如何扩展的？

#### （2）使用的方法
+ **编程模型**：RIPPLE 用三个原语扩展了 C 语言，旨在直接向硬件暴露异步数据流语义，分别是异步迭代器`async`、任务间通信 `push`和共享内存同步 `atomic`
+ **架构扩展**：RIPPLE 对基线 Riptide SDA 指令集（一篇前序工作论文）引入了扩展
    - 队列指令：`queue `指令直接暴露硬件令牌队列以实现高效的数据传递。`queue` 可以标记为 `spill`，表示它应该由内存支持以防止有限的硬件队列溢出导致的死锁。spill 机制充当动态大小的缓冲区，无缝地在硬件队列和主内存之间移动数据。
    - 仲裁器指令：`arb `指令使用公平的循环选择从多个源合并令牌。复杂的仲裁树处理具有多个输入或推送站点的 async 区域，在任务分派之前同步完整的输入元组。
    - 原子同步：`acquire` 和 `release` 指令通过请求和释放对内存地址的独占访问来实现原子块。硬件原子目录有效地管理这些操作，实现非冲突原子操作的并发执行。
+ **编译器实现**：RIPPLE 编译器基于 LLVM 14 并扩展了 Riptide 编译框架。前端将 RIPPLE 构造翻译成 LLVM-IR，将 async 区域转换为循环，并将通信/同步原语转换为内部函数。
    - 内部创新：内存排序分析、从`push` 操作构建任务依赖图（TDG）来执行溢出分析
+ **微架构设计**：RIPPLE 的微架构扩展通过**溢出处理单元**（Spill Processing Element）和**原子目录**（Atomic Directory）与现有 SDA 结构集成

### 3.Evaluation
> IPC =Instructions Per Cycle（每周期指令数），在本论文中是PE 触发次数除以执行时间（number of PE firings divided by execution time）
>

RIPPLE 在多项指标上显示出显著改进：

+ **加速比**：相对于最先进的 Riptide SDA，实现了 3 倍的几何平均加速；相对于顺序执行，实现了 14.2 倍的加速。像连通分量这样的不规则工作负载，相对于 Riptide 显示出高达 7.3 倍的改进。<img src="https://cdn.nlark.com/yuque/0/2026/png/64694239/1773077517439-569e199b-9f77-4084-8220-1e5c62234fad.png" width="795.5617156243729" title="" crop="0,0,1,1" id="ufc787f42" class="ne-image">
+ **资源利用率**：相对于 Riptide，IPC 提高了 58%，同时静态程序大小减少了 1.9 倍。这转化为每面积性能提高了 5.8 倍，表明硬件利用率更高。<img src="https://cdn.nlark.com/yuque/0/2026/png/64694239/1773077945975-f1a88c46-58ce-425c-8746-8dda293ab932.png" width="795.5617156243729" title="" crop="0,0,1,1" id="uffeac3b3" class="ne-image">
+ <img src="https://cdn.nlark.com/yuque/0/2026/png/64694239/1773077970134-746e3b68-745e-4885-972d-9fe75bfec13f.png" width="408.3217731517005" title="" crop="0,0,1,1" id="ue23526e5" class="ne-image">
+ **能效**：动态指令计数平均减少 44%。溢出机制开销适中，在需要它的应用程序中，平均仅占内存操作的 7.6%。

<img src="https://cdn.nlark.com/yuque/0/2026/png/64694239/1773077996449-0233de8a-f121-466a-aff7-d7189aa834db.png" width="447.7115094204107" title="" crop="0,0,1,1" id="u54e73d04" class="ne-image">

<img src="https://cdn.nlark.com/yuque/0/2026/png/64694239/1773078016229-7faea366-b8da-46a7-9bb8-19bc86eb8a92.png" width="791.6782204992888" title="" crop="0,0,1,1" id="ucd053b63" class="ne-image">



#### 测试用例（表格横坐标）
| 测试用例 | 类型 |
| --- | --- |
| 广度优先搜索 (BFS) | 图算法 |
| 拓扑排序 (ts) | 图算法 |
| K-core分解 (kc) | 图算法 |
| 连通分量 (cc) | 图算法 |
| 单源最短路径 (sssp) | 图算法 |
| PageRank-Delta (prd) | 图算法 |
| 矩阵加法 (ma) | 线性代数 |
| 二维5点模板 (st) | 数值计算 |
| 稠密矩阵-向量乘 (dmv) | 线性代数 |


  
 
