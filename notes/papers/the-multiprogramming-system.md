---
title: '读 THE：把并发系统组织成可以推理的层次'
description: Dijkstra 如何用分层抽象、显式同步和自底向上测试控制多道程序系统的复杂性，以及这些论证的边界。
venue: Communications of the ACM 11(5), 341–346
year: 1968
authors: Edsger W. Dijkstra
tags: [operating-systems, layering, concurrency, verification]
links:
  - label: Paper
    url: https://doi.org/10.1145/363095.363143
  - label: Author Archive
    url: https://www.cs.utexas.edu/~EWD/transcriptions/EWD01xx/EWD196.html
sidebar:
  order: 4
  label: THE · 分层与并发推理
---

> **一句话总结：** THE 的重要贡献是把并发系统的正确性变成设计结构本身的问题：每一层建立一种抽象，再在已确认的低层基础上推理和测试高层。

## 一、Short summary：四个问题的简答

以下英文短总结约 210 词，按常规正文排版可放在一页以内；后文是中文扩展阅读。

**What kind of paper is this?** This is a systems-design and experience report about THE, a multiprogramming system for the Electrologica X8. Its main contribution is a method for structuring and reasoning about a concurrent system, rather than a performance benchmark.

**Motivation.** The practical goals were shorter turnaround for small jobs and better use of the processor, peripherals, and backing store. The deeper difficulty was correctness: unpredictable interrupt timing makes concurrency bugs hard to reproduce, especially for a small development team.

**Benefits over prior approaches.** THE organizes cooperating sequential processes into layers that hide processor allocation, storage placement, console sharing, and I/O buffering. Explicit semaphore operations coordinate processes without assuming relative execution speeds. This structure supports bottom-up testing and reduces the relevant states considered at each stage. Separating segment identifiers from physical pages also permits flexible backing-store placement.

**Drawbacks and potential problems.** The paper reports no controlled performance comparison with competing systems. Its university workload excludes multi-access service and machine-language user programs, limiting direct generalization. Testing was unfinished when the author expressed confidence in a flawless delivered system; this is stronger than the evidence presented and is not a machine-checked proof. Peripheral failures were considered too late, illustrating that clean abstractions alone do not ensure fault recovery. Applying the approach elsewhere still requires explicit assumptions about synchronization, progress, and failures.

## 二、论文概览与 Motivation：为什么先考虑结构

原题为 **The Structure of the “THE”-Multiprogramming System**。本文采用本地六页 CACM 版本，发表于 1968 年；论文曾在 1967 年的操作系统原理研讨会上报告，不应混淆报告时间与期刊年份。

系统面向大学内连续到来的用户程序，运行在带核心存储器与磁鼓后备存储的 Electrologica X8 上。让 CPU 在等待外设的间隙服务其他程序，可以缩短短作业周转时间，也提高设备利用率。然而，多道程序带来一个更难的问题：中断时刻不可复现，错误可能看起来像偶发硬件故障。

作者团队只有六人，平均半时投入。论文关心的不是如何堆出更多功能，而是如何让一个小团队能够设计、实现并检查并发系统。关键观察是：**若上层必须同时考虑时钟中断、磁鼓中断和每个设备的细节，相关状态会迅速膨胀。**

## 三、Method：分层抽象、存储标识与显式同步

### 1. 每层消除一类下层细节

正文的 System Hierarchy（期刊第 343 页）依次列出：

- **Level 0 · 处理器分配**：处理时钟中断、可运行性与优先级。高层可以围绕顺序进程推理，不必重新分析每次处理器切换。
- **Level 1 · 存储管理**：segment controller 管理核心存储与磁鼓之间的信息位置。高层使用 segment 标识，而不是绑定具体物理页。
- **Level 2 · 操作员会话**：message interpreter 协调对共享控制台的会话，高层像拥有自己的逻辑会话接口。
- **Level 3 · I/O 缓冲**：关联外设的进程处理输入缓冲与输出解缓冲，对高层隐藏实际外设。
- **Level 4 · 用户程序**：建立在上述服务之上。
- **Level 5 · 操作员**：作者注明这不是团队实现的软件层。

因此，“六个层次编号”不等于“实现了六个内核模块”。各层解决的是不同抽象问题，也不能把其编号当作现代 CPU 的权限环。

层次顺序有具体理由：会话解释器的消息可以保存在磁鼓上，所以它依赖存储管理；外设处理又可能需要向操作员报告故障，因此放在会话机制之上。分层不是为了画一个整齐目录，而是为了约束依赖。

原论文没有单独的系统架构图，本文依据正文逐层解释，不将后人绘制的图当作原图。

### 2. Segment 是信息身份，page 是存放位置

论文严格区分信息单元与存储单元：**segment 恰好装入一个 page**，并有独立于核心存储和磁鼓页地址的标识。它不是现代教材中任意长度的硬件分段。

系统通过 segment variable 查询信息当前在哪里。将核心存储中的 segment 写回磁鼓时，不必回到原来的磁鼓页，可以选择空闲页中旋转等待较短的位置。这也消除了要求同一程序占用连续磁鼓页的需要。

相比按磁鼓地址直接识别信息，这种间接标识给放置策略留下了自由。**这是论文描述的设计优势，不是通过受控实验量化得到的速度提升。**

### 3. 不依赖进程相对速度，用 P／V 明确等待

系统被描述为一组顺序进程，进程之间不假设固定速度比。先产生的信息才能被使用，共享设备不能同时分给两个互斥任务，这些约束通过 semaphore 表达。

附录使用的计数语义是：P 将值减一，结果为负则等待；V 将值加一，结果非正时解除一个等待者的阻塞。两者是不可分割操作。V 使进程重新获得运行资格，**不代表它立即占用 CPU**。

作者区分两种用途：`mutex` 保护共享状态的检查与修改；private semaphore 让特定进程等待某个可继续条件。后者先在短临界区里检查／修改状态并记录唤醒义务，离开临界区后再执行可能阻塞的 P。这样同步依据的是状态和明确义务，而不是“另一进程应该已经来得及完成”。

## 四、Evaluation：作者提供了什么证据

这不是以吞吐量曲线证明优于所有现有 OS 的论文。主要证据是系统构造、测试经历与附录中的正确性论证。

1. **自底向上测试**：先检查 Level 0 的处理器分配，再加入 Level 1 存储管理，然后逐步增加高层。低层抽象建立后，高层测试无需枚举每种原始中断时序。
2. **构造相关状态**：专门的测试进程既把系统推入需要检查的状态，又验证行为是否符合规范。作者也强调，证明测试没有遗漏相关状态本身很困难。
3. **附录的进展论证**：任务向更低层生成子任务，避免无限生成；不能留下未接收任务却全体回到静止状态；还需排除循环等待，使进程最终回到 homing position。调入的 segment 必须保留到请求者实际访问，以避免无效的反复换入换出。

论证依赖系统的具体任务结构与同步约束。**“使用层次结构”本身不是任意程序都无死锁、无饥饿的充分条件。**

## 五、局限：怎样理解作者的强正确性主张

- **报告状态与结论强度不同**：写作时测试尚未完成，作者对交付系统无瑕疵的信心属于作者主张；论文没有提供可独立运行的全系统机器检查证明。
- **错误模型不完整**：作者承认过晚考虑外设故障，故障恢复反而需要额外工作。逻辑正确性不能代替对失败设备的处理。
- **适用范围有限**：它不是多用户交互式 multi-access 服务，没有独立用户之间的共享数据库，也不接受机器语言用户程序。
- **性能比较不足**：没有现代意义上的基线、重复试验、消融或量化开销分析。不能据此写成“分层比单体内核快”。

## 六、个人思考与课程关联

**个人理解：** 真正值得学习的是“选取能缩小推理范围的接口”，而不是原样复制层数。JOS 中把页分配、地址映射和用户态入口拆开检查，与这种思路相通；但 JOS 的模块边界并不等同于 THE 的层次。

和 [Xen](/papers/xen-art-of-virtualization/) 对照看，两篇都重新界定了低层提供什么抽象：THE 让高层不必关心具体处理器和存储位置，Xen 则选择向 guest OS 暴露一部分真实资源信息。抽象是否隐藏某个细节，要看它对正确性和性能的影响。

可继续追问：

1. 若高层为了性能直接访问下层内部状态，原来的分层论证还剩下什么？
2. 如果外设失败或某个进程不再推进，哪些 homing-position 论证前提会失效？
3. 到多核与弱内存序环境，P／V 的原子性和可见性应由哪些硬件与软件机制保障？这是现代延伸问题，不是原文已经证明的结论。

## 七、结论与参考链接

THE 把“能否理解和验证”提升为系统结构的设计目标。其价值在于解释为什么某些并发细节可以在建立低层抽象后退出高层推理，同时提醒读者检查故障、适用范围与论证前提。

- [CACM 原论文与 DOI](https://doi.org/10.1145/363095.363143)
- [Dijkstra 档案中的授权转录 EWD196](https://www.cs.utexas.edu/~EWD/transcriptions/EWD01xx/EWD196.html)
- 本地作业摘要仅用作阅读问题线索；以上论述按原论文正文与附录核对。英文短总结与后续中文解析属于同一篇博客，短总结的“一页”要求不适用于整篇扩展笔记。
