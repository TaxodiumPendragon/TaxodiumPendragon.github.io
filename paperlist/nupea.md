# NUPEA: Optimizing Critical Loads on Spatial Dataflow Architectures via Non-Uniform Processing-Element Access

> **NUPEA: Optimizing Critical Loads on Spatial Dataflow Architectures via Non-Uniform Processing-Element Access. **
>

    1. 优化SDA上的关键负载访问：考虑借鉴到vPE的后续设计中

## 一、Abstract
> Spatial dataflow architectures (SDAs) present a new opportunity to tackle data movement. SDAs distribute program instructions across a spatial fabric of processing elements (PEs). On large SDAs, some PEs are necessarily closer to memory than others, giving rise to non-uniform processing-element access (NUPEA). Clever instruction placement can thus reduce data movement by, e.g., placing critical loads close to memory.
>

### 1.研究团队背景
这篇论文被2025年6月在东京举行的ISCA(International Symposium on Computer Architecture)接收，ISCA是CCF-A类会议，在计算机体系结构领域很有影响力。

研究团队是RIPPLE的作者及其老师，CMU的团队与UCLA的PolyArch研究组合作。

| 姓名（角色） | 简介 |
| :--- | :--- |
| **Souradip Ghosh (一作)** | 卡内基梅隆大学（CMU）计算机科学博士生，主要研究空间数据流架构和并行编程。在ISCA、MICRO等顶级会议上发表多篇数据流架构相关论文，是Nathan Beckmann和Brandon Lucia的学生，与Tony Nowatzki团队也有紧密合作。 |
| **Brandon Lucia (合作作者)** | 卡内基梅隆大学ECE系正教授，Efficient Computer公司CEO兼联合创始人。研究方向包括间歇计算、低功耗系统和边缘计算，位于计算机架构、系统和编程语言的交叉领域。曾获ASPLOS 2018最佳论文奖、斯隆研究奖等多项荣誉。 |
| **Nathan Beckmann (合作作者)** | CMU副教授，研究方向包括计算机体系结构、缓存系统、数据流架构。在ISCA、MICRO、PLDI等顶级会议发表多篇论文，提出过“缓存微积分”（Cache Calculus）理论，与Brandon Lucia长期合作研究节能型数据流架构。 |
| **Tony Nowatzki (合作作者)** | 加州大学洛杉矶分校（UCLA）计算机科学系副教授，领导PolyArch研究组。研究方向包括计算机架构、微架构、硬件定制化、编译器协同设计。研究成果多次获得IEEE Micro Top Picks奖、PLDI杰出论文奖等。 |
| **Graham Gobieski (合作作者)** | Efficient Computer公司首席技术官（CTO），在卡内基梅隆大学获得计算机科学博士学位。研究方向为可编程、能量最小化的新型架构，是MANIC、RipTide等数据流架构项目的核心贡献者，在ISCA、MICRO、PLDI等会议发表多篇论文。 |
| **Keyi Zhang (合作作者)** | 加州大学洛杉矶分校（UCLA）计算机科学系博士生（或博士后），在Tony Nowatzki的PolyArch研究组工作，研究方向为数据流架构、硬件加速器和编译器协同设计。在空间数据流架构领域有多篇论文发表。 |


2.基本概念

+ Fabric-Memory NoC 是什么？
    - 找到一个intel关于NoC的文档：[https://docs.altera.com/r/docs/768844/25.1.1/agilextm-7-m-series-fpga-network-on-chip-noc-user-guide/answers-to-top-faqs](https://docs.altera.com/r/docs/768844/25.1.1/agilextm-7-m-series-fpga-network-on-chip-noc-user-guide/answers-to-top-faqs)
    - 这里是英特尔（Intel）在 Agilex 7 M 系列 FPGA 中引入的一种硬件特性
    - 是一种硬件实现，实现“如何让计算靠近数据”的架构思想（通过编译器识别关键Load，让计算发生在数据所在的位置）



## 二、LOG
### 1.Motivation
+ **背景**：数据移动是现代计算机体系结构中的一个根本瓶颈，影响着性能、效率和可扩展性。
    - 非统一内存访问（ NUMA）等**以数据为中心**的解决方案试图通过将数据放置在其附近的处理器来解决这些问题
+ **问题**：传统的以数据为中心的方法，如NUMA，在数据识别、分区和迁移的静态分析方面负载困难，限制了它们对复杂或广泛共享数据集的有效性。
    - 之前的数据流架构（SDA）空间通常不会明确揭示或利用非统一内存访问延迟来实现单个负载的存储地优化关键负载
    - **核心目的**：提高数据移动效率
+ **平台**：MONACO与effcc编译器

#### 过往：NUMA非统一内存访问
空间数据流架构SDA将程序指令分配在处理单元（PE）网络中，编译器执行“放置与路由”操作，将指令分配给PE并管理片上网络上的通信。随着这些网络规模的扩大，不同PE和内存之间的物理距离变得越来越严重，自然会产生非统一的内存访问延迟。然而，大多数先前的SDA显然都利用这种架构特性进行优化。

根本挑战提出了数据移动瓶颈。传统以数据为中心的方法面临以下几个限制：

+ **复杂的静态分析**：识别哪些数据应该放置在需要复杂编译器分析的地方，而这种分析对于非规则访问模式通常会失败。
+ **别名分析失败**：静态确定数据请求通常是难以处理的。
+ **共享数据效果有限**：当数据被广泛共享或工作集超出本地内存容量时，数据策略放置会网格无效。



#### 解决方案：通过NUPEA以指令为中心的思路优化关键负载
+ NUPEA 通过将重点从数据放置转移到指令放置来解决这些挑战。
+ 对于编译器而言，识别**关键加载（位于程序关键执行路径上的内存操作）**通常比有效分区和放置数据更容易。

### 2.Method
#### （1）阅读过程中的问题
1. Monaco架构细节：144 个 PE 其中一半被指定为加载存储 (LS) PE，进而使得NUPEA的构想可以成立。
    1. vPE能否借鉴这种思想？那样的话LSPE应该是什么？
    2. 物理上离DRAM近的PE吗，还是能借用vPE的virtual性质进行更高效的映射
2. 片上网络的仲裁器和计算机网络领域的仲裁器有何关键的区别？
3. 对于Monaco和effcc实用性的疑惑
    1. effcc 是基于 MLIR 的完整C语言编译器，引用的是2021年的论文
    2. Monaco是在25年初流片生产的

> Monaco and effcc are both industry products. Monaco is implemented in a 22mm planar process and is based on a design taped out in Q1'25. effcc is implemented in MLIR [44] and is general- purpose, supporting the full C language.
>

#### （2）方法1：架构设计
+ Monaco SDA提出了通过设计的12×12处理单元网络实现NUPEA。该架构创建了不同的“NUPEA域”，根据PE的内存访问特性对它们进行分组：

$ \text{域延迟} = \text{基本内存延迟} + \text{域偏移} $ 

+ Monaco有四个NUPEA域（D0、D1、D2、D3），按与内存的接近程度排序，
    - D0提供最快的访问，每个后续域增加一个周期的延迟。
    - D0域直接连接到内存端口，绕过仲裁阶段，以实现最小延迟和最大带宽。
+ 网络采用分层仲裁系统用于网络片上（Fabric-Memory Network-on-Chip，NoC）
    - **仲裁器**按行和域组织组成具有4个扇出的不平衡树状结构，每个仲裁阶段增加**一个周期**的延迟。	这种设计创造了NUPEA利用的非统一访问模式，同时保持了合理的实现复杂性。

<img src="https://cdn.nlark.com/yuque/0/2026/png/64694239/1773683914440-f65d9876-8eea-4cb8-8d4b-26b6632aa747.png" width="596.9486792272143" title="" crop="0,0,1,1" id="u708df0b9" class="ne-image">

#### （3）方法2：编译器优化
高效C编译器（`effcc`）通过两个关键机制实现NUPEA加载优化：

+ **关键加载识别**：编译器使用静态分析方式来识别可能影响程序性能的加载
    1. 导致循环控制递推（如结果指标）中启动间隔过长的加载操作
    2. 内部循环中间隔执行的内存指令
+ **NUPEA 的布线模拟布线**：编译器采用了一种基于布线的布线算法，并利用 NUPEA 特定的指示方式方法进行了增强。它应用了分层优先系统
    - 最高优先级：来自递推分析的关键加载
    - 中等优先级：其他内部循环内存指令
    - 最低优先级：所有其他内存指令

这种优先级排序保证了性能最关键的加载操作被放置在最快的NUPEA域中（D0，然后是D1等）

####  （4）关于MONACO平台的技术细节


<img src="https://cdn.nlark.com/yuque/0/2026/png/64694239/1773683886156-67114838-c311-42f4-88b2-d660a6e821ef.png" width="1203.3287037582043" title="" crop="0,0,1,1" id="ub6e26cbb" class="ne-image">

+ **处理单元架构**：Monaco 中的每个 PE 都包含用于算术、控制流和数据存储的功能单元。144 个 PE 其中一半被指定为加载存储 (LS) PE，能够执行内存指令。PE 中的数据流执行模型运行，当所有输入令牌到达时触发指令。
+ **片上网络设计：**该架构采用了多种不同的网络：
    - **数据片上网络（Data NoC）**：一个无缓冲、静态路由的网格网络，采用Wilton拓扑结构，每个瓦片有3个32位轨道，促进PE到PE的通信。
    - **互连结构-内存片上网络（Fabric-Memory NoC）**：一个动态的多层网络，管理内存请求和响应，通过其仲裁结构明确实现 NUPEA 域层次结构。
+ **内存子系统**
    - 采用集中的、32路分区内存系统，承载共享的256KB数据存储。
    - 内存子系统从互连结构（fabric）提供18个内存端口，其中D0域的PE接收直接连接，而其他域通过仲裁局共享访问。

### 3.Evaluation
#### （1）性能结果
评估将Monaco与多个基线进行了比较，使用了13种不同的工作负载，架构了密集/稀疏线性代数、图处理、数字信号处理和机器学习应用。

**总体对稀疏应用效果更好，密集应用优化空间有限**



+ **总体性能提升**：Monaco 的内存延迟与具有统一 0 周期内存访问的理想化 SDA 的差距在 21% 以内。

<img src="https://cdn.nlark.com/yuque/0/2026/png/64694239/1773683951462-0196e6cb-2cd0-451a-82f7-06c938827c03.png" width="1233.2870947231388" title="" crop="0,0,1,1" id="uc31ba8ec" class="ne-image">

> 这个ideal是指的零延迟的理想结果
>

+ **应用特定结果**：稀疏应用表现出特别显着的改进。对于稀疏操作矩阵（`spmspm`和`spmspv`），Monaco 于 UPEA 实现了 27% 的性能提升，并与理想基线扩展 3-5%。这些应用来自 NUPEA 中受益浅，因为它们的关键加载通常位于整体程序货物的长递推路径上。
+ 对于延迟敏感的工作负载，如二维雅可比模板 ( `jacobi2d`) 和快速傅里叶变换 ( `fft`)，也表现出强大的性能，Monaco 使它们的性能分别达到理想性能的 4% 和 7% 以内。

<img src="https://cdn.nlark.com/yuque/0/2026/png/64694239/1773683995716-d45db4ad-b103-44b8-b7d7-190d5b903b1a.png" width="1225.5201044729706" title="" crop="0,0,1,1" id="ud937d7bb" class="ne-image">

> 上面单位用的是加速比，以无NUPEA感知的放置”（Domain-Unaware）为基准，仅域感知（Only-Domain-Aware），即编译器知道 NUPEA 域，但不区分负载关键性。
>

+ **与NUMA的对比（单位是运行时间）**

<img src="https://cdn.nlark.com/yuque/0/2026/png/64694239/1773684088742-7d6e6eec-f656-455e-b0d1-98ce81426514.png" width="1239.9445149375688" title="" crop="0,0,1,1" id="u6ebc464c" class="ne-image">

> 归一化执行时间，基准仍为 Monaco（1.0）。柱表示 NUMA-UPEA 中远程访问延迟从 0 到 4 周期。
>
> **解读**：即使引入 NUMA，随着远程延迟增加，性能仍线性下降，且 Monaco 依然优于这些基线，证明 NUPEA 比 NUMA 更有效。
>

#### （2）编译器功效
评估隔离了不同编译器启发式方法的贡献：

+ 仅域占用（优先考虑快速 NUPEA 域）推测域关联的放置提供了 16% 的平均加速
+ 添加关键性感知（识别关键加载）额外贡献了 9% 的改进
+ 综合来看，NUPEA 装载编译器优化大大于简单安置实现了 25% 的平均加速

<img src="https://cdn.nlark.com/yuque/0/2026/png/64694239/1773684148775-09473b3a-953d-475b-9556-24ed61c09d78.png" width="598.6130342808218" title="" crop="0,0,1,1" id="u1fd58c90" class="ne-image">

> 不同规模拓扑运行时间，不同的NoC轨道；CS和CD是一种不同的布线方式，主要区别在于LSPE放在内存一侧还是两侧，CS,CD,Monaco的内存端口分别是12,24,18个
>

<img src="https://cdn.nlark.com/yuque/0/2026/png/64694239/1773684160777-ad952507-46e6-42f5-baaa-d5df93616662.png" width="597.5034642450835" title="" crop="0,0,1,1" id="u325690f1" class="ne-image">

> 不同拓扑的 PnR 最大路径延迟  
在 2 通道下，Monaco 的最大路径延迟增长平缓，而 CS 和 CD 急剧上升，说明 Monaco 的布局（LS PE 分散在阵列中）减少了布线拥塞和长路径
>

#### (3)密集应用结果不佳的分析
+ **根本原因**：密集型的应用（如jacobi2d, fft）对绝大多数内存指令的延迟都很敏感。不像稀疏应用只依赖少数关键Load。
+ **硬件瓶颈**：这些密集应用会发出很高的内存请求并发度（memory IPC）。这导致Monaco的“fabric-memory NoC”上的仲裁器出现拥塞。即使把Load放到了最快的NUPEA域（D0），如果都在同时发请求，也得排队。



#### (4)测试用例来源
| 编号 | 应用名称 | 全称/描述 | 来源/生成工具 |
| --- | --- | --- | --- |
| 1 | **dmv** | Dense Matrix-Vector multiplication (稠密矩阵-向量乘) | 自行编写（常规稠密线性代数） |
| 2 | **jacobi2d** | 2D Jacobi stencil (二维雅可比模板计算) | **Polybench** [94] |
| 3 | **heat3d** | 3D Heat equation stencil (三维热方程模板计算) | **Polybench** [94] |
| 4 | **smv** | Sparse Matrix - Dense Vector multiplication (稀疏矩阵-稠密向量乘) | **TACO** [42] 生成 |
| 5 | **spmspm** | Sparse Matrix - Sparse Matrix multiplication (稀疏矩阵-稀疏矩阵乘) | **TACO** [42] 生成 |
| 6 | **spmspv** | Sparse Matrix - Sparse Vector multiplication (稀疏矩阵-稀疏向量乘) | **TACO** [42] 生成 |
| 7 | **spadd** | Sparse Matrix addition (稀疏矩阵加法) | **TACO** [42] 生成 |
| 8 | **tc** | Triangle Counting (三角形计数，图处理) | **GAPBS** [9] (GAP Benchmark Suite) |
| 9 | **mergesort** | Merge sort (归并排序) | 自行编写（排序算法） |
| 10 | **fft** | Fast Fourier Transform (快速傅里叶变换) | **CMSIS-DSP** [4] (ARM的 `arm_rfft_q31`<br/>) |
| 11 | **ad** | Anomaly Detection (异常检测，神经网络) | **MLPerfTiny** [6] |
| 12 | **ic** | Image Classification (图像分类，神经网络) | **MLPerfTiny** [6] |
| 13 | **vww** | Visual Wake Words (视觉唤醒词，神经网络) | **MLPerfTiny** [6] |




##### 内部生成的两个样例——归并排序和稠密矩阵向量乘
归并排序核心操作是**比较两个链表/数组的元素并合并**。在实现中（比如归并链表），大量涉及：

+ 间接内存访问（通过指针加载下一个节点）
+ 控制流密集的条件分支（比较大小）
+ 数据依赖链（前一次比较的结果决定下一次加载哪个链表的元素）

这些事情容易出现**关键加载（critical loads）**

****

##### 数据库来源样例
+ Polybench（多面体模型基准）
+ 现代的 TACO（张量代数编译器）生成程序，
+ 图处理基准 GAPBS
+ 嵌入式 DSP 库 CMSIS-DSP
+ 以及最新的微型机器学习基准 MLPerfTiny



**多面体模型（Polyhedral Model）**是一种专门用于分析和优化嵌套循环程序的数学框架，把程序的执行过程用几何方式表示

+ 循环迭代抽象成多维空间中的一个整数点、点集合起来，在数学上形成一个被不等式约束的多面体形状、数据访问抽象为线性代数
+ Polybench 包含的30多个程序（如矩阵乘、雅可比模板、傅里叶变换等）都具有静态控制流，即循环边界和数组下标都是循环索引的仿射函数
+ Polybench测试集是用于检验这方面是否做得好


