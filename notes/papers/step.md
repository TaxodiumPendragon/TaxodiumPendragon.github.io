---
title: "Streaming Tensor Programs (STeP): A Streaming Abstraction for Dynamic
  Parallelism"
description: 面向空间数据流加速器的流式抽象，支持动态 tiling 与动态并行，加速 LLM 中的 MoE 等动态张量程序。
venue: ASPLOS
year: 2026
authors: Gina Sohn, Genghan Zhang, Konstantin Hossfeld, Jungwoo Kim, Nathan
  Sobotka, Nathan Zhang, Olivia Hsu, Kunle Olukotun
tags:
  - SDA
  - LLM
  - MoE
  - streaming
links:
  - label: Artifact
    url: https://github.com/stanford-ppl/step_artifact
sidebar:
  order: 4
  label: STeP · 流式张量程序
---

> **发表在ASPLOS 2026**
>

    1. 论文提出了STeP，一种新的流式抽象，专门用于在空间数据流加速器（SDA）上高效运行动态张量程序（如LLM中的MoE）。
    2. 它引入了显式存储层次和动态数据速率等概念，实现了动态tiling和动态并行化等优化，在LLM层上获得了显著加速。

## 一、Abstract
### 1.研究背景
+ 动态行为（如数据相关的张量形状和控制流）在机器学习等张量应用中日益普遍，典型例子包括混合专家（MoE）模型根据输入动态选择专家、注意力机制中因请求不同导致的 KV 缓存长度变化、动态批处理等。
+ 空间数据流加速器（SDA）通过分布式计算和存储单元、流水线执行、硬件 FIFO 通信等特性，可实现高吞吐和高能效，近年来在大型语言模型（LLM）推理中展现出优于 GPU 的潜力。
+ 然而，现有 SDA 编程抽象对动态行为的支持严重不足：
    - 命令式抽象（如 Spatial、Revet）虽通用，但缺乏显式的异步和队列原语，控制流受限，且需编译器将命令式循环转换为数据流图，复杂度高。
    - 数据流抽象（如 StreamIt、SAM、Ripple）要么同步数据率固定，要么局限于稀疏张量领域，要么隐式内存层次，导致无法有效表达和优化动态工作负载。
    - 这种局限性迫使动态行为只能以静态、未优化的方式实现，无法发挥 SDA 的硬件优势。

> 和RIPPLE里面提到的抽象倒置问题是相似的
>

| **<font style="color:#663000;">抽象</font>** | **<font style="color:#663000;">数据流</font>** | **<font style="color:#663000;">显式数据速率</font>** | **<font style="color:#663000;">显式内存层次</font>** | **<font style="color:#663000;">动态路由与合并</font>** | **<font style="color:#663000;">动态片上平铺</font>** |
| --- | --- | --- | --- | --- | --- |
| **<font style="color:#00346B;">Spatial</font>** | **X** | **X** | **✓** | **X** | **X** |
| **<font style="color:#00346B;">Revet</font>** | **X** | **X** | **✓** | **✓(有限)** | **X** |
| **<font style="color:#00346B;">StreamIt</font>** | **✓** | **✓** | **X** | **X** | **X** |
| **<font style="color:#00346B;">SAM</font>** | **✓** | **X** | **X** | **✓(有限)** | **✓(有限)** |
| **<font style="color:#00346B;">Ripple</font>** | **✓** | **X** | **X** | **✓** | **X** |
| **<font style="color:#00346B;">STeP</font>** | **✓** | **✓** | **✓** | **✓** | **✓** |


### 2.研究团队背景
+ 论文主要作者来自斯坦福大学（Stanford University）和 SambaNova Systems。
+ 斯坦福团队OMEGA在数据流架构、编译器、硬件设计领域有长期积累，曾提出 Spatial、Plasticine、Revet 等工作。
+ SambaNova Systems 是一家专注于数据流加速器的公司，其 SN40L RDU 等产品已在工业界大规模部署。

| 姓名（角色） | 简介 |
| :--- | :--- |
| **Gina Sohn (第一作者)** | 斯坦福大学博士生，主要研究方向为空间数据流架构、动态并行编程抽象和张量程序编译。是STeP论文的第一作者和核心贡献者，隶属于斯坦福大学OMEGA研究组。 |
| **Genghan Zhang (合作作者)** | 斯坦福大学博士生，研究方向包括数据流架构、机器学习系统和编译器优化，专注于动态张量程序的加速。 |
| **Konstantin Hossfeld (合作作者)** | 斯坦福大学博士生（或博士后），研究兴趣涵盖数据流架构、内存系统和硬件加速器设计。在GainSight等内存优化项目上也有相关研究产出 。 |
| **Jungwoo Kim (合作作者)** | 斯坦福大学博士生，研究方向为空间数据流加速器、并行编程模型和深度学习编译器。 |
| **Nathan Sobotka (合作作者)** | 斯坦福大学博士生，研究兴趣包括数据流架构、硬件加速器设计和动态并行计算。 |
| **Nathan Zhang (合作作者)** | SambaNova Systems工程师，斯坦福大学校友。在工业界和学术界均有积累，专注于大规模AI加速器的软件栈和编程抽象。 |
| **Olivia Hsu (合作作者)** | 斯坦福大学博士生，同时挂职卡内基梅隆大学（CMU）。研究方向为稀疏张量编译、数据流架构和编程语言。是SAM（Sparse Abstract Machine）项目的核心贡献者之一 。 |
| **Kunle Olukotun (通讯作者)** | 斯坦福大学电气工程与计算机科学系教授，Pervasive Parallelism Lab负责人。数据流架构领域权威学者，是Plasticine、Spatial等经典工作的主导者。研究兴趣包括数据流加速器、多核处理器、并行编程语言和机器学习系统。 |


### 3.基本概念
+ **空间数据流加速器（SDA）**：可重构架构，由计算单元和存储单元通过硬件 FIFO 和片上网络互联。程序表示为数据流图，节点为操作，边为数据依赖。SDA 避免了指令解码、缓存一致性等开销，支持算子融合、流水线并行和细粒度并行。
+ **异步数据流（Asynchronous Dataflow）**：执行模型，数据流块无需全局同步，每个块可具有动态数据率和延迟，与 SDA 硬件天然匹配。
+ **动态并行性（Dynamic Parallelism）**：运行时根据数据动态调整并行度或任务粒度，以应对工作负载的动态变化。
+ **流（Stream）**：STeP 中的核心数据抽象，由零个或多个张量组成，通过停止令牌（stop token）分隔维度。流具有秩（rank）和数据类型（可以是图块、选择器、片上内存引用等），支持动态形状。
+ **符号形状语义（Symbolic Shape Semantics）**：用符号表达式表示流的形状（包括静态、动态正则、动态不规则维度），从而在抽象层分析片外流量、片上内存需求等性能关键指标。
+ **关键算子类别**：
    - 片外内存算子（LinearOffChipLoad/Store、RandomOffChipLoad/Store）
    - 片上内存算子（Bufferize、Streamify）
    - 动态路由与合并算子（Reassemble、EagerMerge、Partition）
    - 高阶算子（Map、Accum、Scan、FlatMap）
    - 形状算子（Flatten、Reshape、Promote、Expand、Zip）

## 二、LOG
### 1.Motivation
#### (1)背景
+ 张量应用（尤其是 LLM）对计算和内存需求激增，促使 SDA 成为重要加速方案。
+ **动态行为**在 LLM 中普遍存在（如 MoE 路由、变长 KV 缓存、动态批处理），已成为性能瓶颈。
+ SDA 硬件天然适合异步、动态的并行模式，但现有编程抽象无法充分表达这些动态行为。

#### (2)问题
+ 命令式抽象（Spatial、Revet）：
    - 控制流受限（Spatial 仅在有限区域允许）或仅支持标量级动态（Revet 的 Dataflow Thread）。
    - 缺乏显式的异步和队列原语，难以表达动态并行。
    - 需编译器将命令式循环转换为数据流图，过程复杂且可能产生次优调度。
+ 数据流抽象（StreamIt、SAM、Ripple）：
    - StreamIt：同步数据流，固定数据率，无法表达动态速率。
    - SAM：仅针对稀疏张量代数，难以直接用于稠密动态张量应用。
    - Ripple：隐式内存层次，缺乏对数据移动的显式控制，且数据率不透明，编译器难以分析。
+ 具体表现：
    - 无法表达动态形状的图块（tile），导致静态分块要么浪费片上内存（填充），要么频繁片外访问。
    - 缺乏动态路由与合并原语，无法高效实现数据相关的控制流并行。
    - 隐式或固定数据率阻碍运行时自适应优化。

#### (3)例子
+ **MoE 层**：输入行根据数据动态路由到不同专家，每个专家处理的输入行数不确定。
    - 静态分块：需将每个专家的输入填充到固定图块大小，浪费内存和计算。
    - 静态并行化：固定专家分配，可能造成负载不均。
    - 现有抽象难以同时处理动态路由和动态形状。
+ **注意力层的解码阶段**
    - 每个请求的 KV cache 长度不同
    - 动态并行的做法是：使用 `Partition `和 `EagerMerge` 等算子，每当一个并行单元空闲时，就立即从等待队列中取出下一个请求（无论长短）分配给该单元。

#### (4)解决方案
+ 提出 **Streaming Tensor Programs (STeP)**，一种面向 SDA 的流式抽象，核心特性包括：
    1. **显式内存层次**：提供片外和片上内存算子，使程序员能精确控制数据放置与移动，在抽象层即可分析片外流量和片上内存需求。
    2. **符号形状语义**：支持动态正则和动态不规则维度，允许在抽象层表达和推导数据率，指导优化。
    3. **动态路由与合并算子**：如 Reassemble、EagerMerge、Partition，支持数据相关的控制流，实现动态并行化。
+ 基于上述特性，实现了三类优化：
    - **动态分块（Dynamic Tiling）**：根据运行时实际数据量自适应调整图块大小，打破静态分块的 Pareto 权衡。
    - **配置时分复用（Configuration Time-Multiplexing）**：在多个分支（如 MoE 专家）间复用同一硬件配置，减少资源占用。
    - **动态并行化（Dynamic Parallelization）**：在并行区域空闲时立即分配任务，改善负载均衡。



### 2.Method
#### （1）阅读过程中的问题
+ 符号形状语义推导的片上内存需求与模拟器实测值之间是否存在系统性偏差？论文虽验证了高相关性，但未详细分析误差来源。
+ 动态路由算子（如 Reassemble）的硬件实现复杂度如何？论文提及可通过空间布局所有分支或网内路由实现，但未评估面积和功耗。
+ 动态分块中，图块大小的动态调整是否会导致流水线停顿或额外的控制开销？
    - 没有专门量化控制开销
+ 配置时分复用的切换延迟是否在资源节省与性能之间引入了新的权衡？
    - 图12 中，动态分块下使用配置时分复用（time-multiplexing）时，性能开销约为 5%（计算利用率提升 2.51× 但性能下降 5%），而静态分块下开销 <1%。这 5% 的开销很大程度上就来自于切换延迟（加载新专家的权重、清空流水线、重新配置路由）
+ 关于RIPPLE的问题？
+ 端到端模型是什么？

#### （2）使用的方法
+ **符号前端（Symbolic Python Frontend）**  
    - 基于 SymPy 实现形状符号化，自动推导流的形状表达式。  
    - 为每个算子定义片上内存需求和片外流量公式，汇总得到程序的整体指标。  
    - 程序员可编写类似 PyTorch 的代码，但使用 STeP 算子，并能检查流形状。
+ **周期近似模拟器（Cycle-Approximate Simulator）**  
    - 基于 Dataflow Abstract Machine 框架，用 Rust 实$  $现。  
    - 集成 HBM 节点（基于 Ra$  $mulator 2.0）模拟片外访问延迟。  
    - 高阶算子使用 Roofline 模型计算延迟：  
$ [
\text{cycles} = \max\left(\frac{\text{input size}}{\text{on-chip BW}}, \frac{\text{FLOPs}}{\text{compute BW}}, \frac{\text{output size}}{\text{on-chip BW}}\right)
]   $
    - 支持配置计算带宽、内存带宽等参数，可适配不同 SDA 架构。
+ **配置时分复用（以MoE层为例）**
    - 只分配一组计算单元，然后动态地加载不同专家的权重，依次处理发往不同专家的 token。
    - 切换时，通过 `EagerMerge` 和 `RandomOffChipLoad` 来改变当前活跃的专家。
+ **验证**  
    - 将模拟器结果与周期精确的 Bluespec SystemVerilog HDL 模拟对比，在 SwiGLU 层上扫描不同图块大小，Pearson 相关系数为 0.99，验证了模拟器的准确性。
+ **评估设置**  
    - **工作负载**：MoE 层（Qwen3-30B-A3B 和 Mixtral8x7B）、Attention 层（使用 AzureLLMInference 数据集采样 KV 缓存长度）、完整模型端到端推理。  
    - **基线**：选用 Revet 作为对比基准，因其在现有抽象中对动态行为支持最广。由于 Revet 无法表达 STeP 优化，用 STeP 实现 Revet 可表达的静态调度作为基线。  
    - **度量指标**：周期数、片外流量、片上内存需求、计算资源利用率等。



### 3.Evaluation
+ **模型**：Qwen3-30B-A3B、Mixtral-8x7B（MoE结构）
+ **数据集**：AzureLLMInferenceDataset（KV cache长度）、HH-RLHF（专家路由轨迹）
+ **模拟器**：周期级STeP模拟器，带宽设置匹配真实SDA（如SambaNova SN40L）
+ **基线**：Revet（最具动态支持能力的SDA抽象），因为STeP的优化在Revet中无法表达



+ **图9、10**（动态分块）：横坐标为“On-Chip Memory (MiB)”和“Norm. Cycles”，每条曲线对应不同静态图块大小（8,16,32,64,128,256…），并标记动态图块点。  

<img src="https://cdn.nlark.com/yuque/0/2026/png/64694239/1774311420633-63e3b9c6-06bb-41a7-a84b-095ad18027d7.png" width="530.9292621007845" title="" crop="0,0,1,1" id="u8a77650e" class="ne-image">

<img src="https://cdn.nlark.com/yuque/0/2026/png/64694239/1774311451078-765504bd-b9ad-4f83-b45f-e9adbe6ca865.png" width="548.1275976547283" title="" crop="0,0,1,1" id="uf9bd9098" class="ne-image">

+ **图12**（配置时分复用）：横坐标为“Configuration Time-Multiplexing Factor”（共享同一配置的专家数），纵坐标为“Compute Utilization”。  

<img src="https://cdn.nlark.com/yuque/0/2026/png/64694239/1774311468953-2c2dd368-8a9c-416a-921a-0dd2f9de98ad.png" width="536.477112279476" title="" crop="0,0,1,1" id="u2c2c39a6" class="ne-image">

+ **图14、15**（动态并行化）：横坐标为“KV Cache Length Standard Deviation”和“Batch Size”，纵坐标为“Speedup over static”。  

<img src="https://cdn.nlark.com/yuque/0/2026/png/64694239/1774311489851-c3c12fa3-5c5d-4ffe-9b14-beb6edd638de.png" width="680.166431907588" title="" crop="0,0,1,1" id="ufea56468" class="ne-image">

+ **图17**（端到端模型）：横坐标为不同模型和实现（static memory-matched, static performance-matched, dynamic with optimizations），纵坐标为“Normalized Latency”和“Resource Usage”，归一化的部分是除以了baseline

<img src="https://cdn.nlark.com/yuque/0/2026/png/64694239/1774311505602-0a5990e3-6888-45a0-8afd-184fbe47a191.png" width="527.0457669757003" title="" crop="0,0,1,1" id="u2b74afc8" class="ne-image">

+ **实验结果**  
    - 动态分块打破静态分块 Pareto 前沿，PID 达到 (1.33X 到 2.11X)。  
    - 配置时分复用提高计算利用率 (2.51X 到2.64X)。  
    - 动态并行化实现 (1.14X 到2.72X) 加速。  
    - 端到端模型上，Qwen3-30B-A3B 实现 (1.27X) 加速，同时减少 69% 片上内存和 54% 计算资源。

### 4.Explore：Rust模拟器
> 代码仓库：[https://github.com/stanford-ppl/step_artifact](https://github.com/stanford-ppl/step_artifact)
>

+ 项目核心是 Rust 编写的周期近似模拟器，并通过 pyo3 库将其编译为 Python 的原生模块。用户使用 Python 写模拟实验，而底层的计算密集型模拟逻辑则由 Rust 代码执行。
+ 配套提供了与周期精确的硬件（HDL）模拟器进行交叉验证的脚本和流程`hdl_validation`

#### （1）DSE设计启发：Design Space Exploration（设计空间探索）


主要围绕三个动态优化展开（Section 5.2–5.4），以及最终的端到端模型调优（Section 5.5）。它回答了以下典型问题：

+ **动态分块**：应该选择多大的静态 tile？如果使用动态 tile，能比静态 tile 节省多少内存或提升多少性能？
    - 符号前端快速估算每个静态 tile 的片上内存需求。
    - 模拟器对所有候选点进行仿真，得到性能。
    - 绘制 Pareto 曲线。
    - **结果**：动态 tile 突破静态 tile 的 Pareto 前沿，获得 1.33×～2.11× 的 Pareto Improvement Distance（PID）
+ **配置时分复用**：多少个专家共享一套计算资源最合适？切换延迟与资源节省之间的平衡点在哪里？
    - 模拟器对比静态分配（每个专家独享资源）与时分配（动态加载权重）。
    - **结果**：时分复用以 <1%~5% 的性能代价换取了 2.5～2.6 倍 的利用率提升，并释放大量内存/计算资源。
+ **动态并行化**：对于注意力层，是使用粗粒度静态分区、静态交错分配，还是动态按需分配？不同 batch size 和 KV cache 长度分布下哪种最好？
    - **方法**：模拟器对每种策略和输入变体进行仿真。
    - **结果**：动态并行化在各种场景下均优于静态策略，最高 2.72 倍 加速。
+ **端到端 DSE**（Figure 17）
    - 探索空间：组合上述三种优化的不同配置（例如，是否使用时分复用，是否使用动态并行等）。
    - 目标：端到端延迟、总片上内存、总计算资源。
    - 结果：最优组合实现了 1.15～1.27 倍 加速，同时内存减少 69%、计算资源减少 54%。



**方法**

+ **符号前端**：用 SymPy 符号表达式表示每个算子的片外流量和片上内存需求。
    - 可以快速估算，筛选掉明显不可行的早期设计点
+ **模拟器：**对于每个候选设计（如某个 tile 大小、某种并行策略），模拟器输出执行周期数、实际片外流量、资源占用等。
