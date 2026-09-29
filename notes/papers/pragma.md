---
title: "PRAGMA: A Profiling-Reasoned Multi-Agent Framework for Automatic Kernel Optimization"
description: 通过 Coder、Verifier、Profiler 和 Conductor 的闭环，把运行时性能证据持续反馈给代码生成模型，实现 CPU/GPU kernel 的自动诊断与迭代优化。
venue: arXiv preprint
year: 2025
authors: Kelun Lei, Hailong Yang, Huaitao Zhang, Xin You, Kaige Zhang, Zhongzhi Luan, Yi Liu, Depei Qian
tags:
  - kernel-optimization
  - profiling
  - multi-agent
  - Triton
  - CPU
  - GPU
links:
  - label: Paper
    url: https://arxiv.org/abs/2511.06345
sidebar:
  order: 4
  label: PRAGMA · Profiling 推理闭环
source_file: "paper/PRAGMA A Profiling-Reasoned Multi-Agent Framework for Automatic Kernel Optimization.md"
---


> **一句话总结：** PRAGMA 将代码生成、编译与正确性验证、硬件 profiling 和优化决策拆成四个角色，让 Conductor 根据当前结果、历史最佳版本及 profiler 知识提出下一轮建议，在最多 15 次尝试内持续改进 CPU 或 GPU kernel。

## 一、论文概览

### 1. 基本信息

- 作者来自北京航空航天大学。
- 系统同时支持 GPU Triton kernel 和 CPU C++ kernel；GPU 使用 NVIDIA Nsight Compute，CPU 使用 Linux `perf`。
- 论文以 DeepSeek-R1 为基础模型，在 NVIDIA A100 40GB 和 Intel Xeon Gold 6230R 上评价。
- 论文报告相对 Torch 的平均加速为 CPU 2.81×、GPU 2.30×，GPU 相对 Caesar 为 4.50×。

### 2. 核心贡献

1. 提出 profiling-reasoned 多 Agent 框架，使性能指标成为每轮代码修改的显式依据。
2. 构建离线 profiler 知识整理流程，把官方文档压缩为模型可使用的指标解释与优化知识。
3. 设计 Conductor，将源码、编译/验证错误、profile、历史最佳代码和性能统一转换为针对性建议。
4. 用同一框架覆盖 CPU 与 GPU，验证 profiling 反馈比只让 LLM 自我反思更有效。

### 3. 关键概念

- **Profiling-reasoned**：模型不仅知道运行时间，还读取能解释时间的硬件指标，并依据指标选择优化动作。
- **Conductor**：不直接写最终 kernel，而是整合证据、决定下一步并指导 Coder。
- **Profiler compendium**：从工具官方文档离线整理出的指标语义、诊断规则和优化建议集合。
- **Historical best**：迭代过程中性能最好的正确版本及其 profile，用于防止后续回退覆盖有效成果。

## 二、Motivation

### 1. 背景与问题

LLM 可以把 PyTorch 算子翻译为 Triton/CUDA/C++，但常见循环是“生成—测试—把错误文本喂回模型”。当代码已经正确但不够快时，单一运行时间只能说明结果，不能解释原因。模型可能反复做表面改写，或因一次性能抖动走向错误方向。

传统性能工程师会查看 occupancy、寄存器、缓存命中、带宽、流水线 stall 或 CPU top-down 指标，再结合源码判断瓶颈。PRAGMA 试图把这个证据链放入自动 Agent 循环。

### 2. 现有方法及局限

- 纯 LLM 反思缺乏硬件证据，容易给出泛化建议，如“增加并行度”或“优化访存”。
- 单 Agent 同时承担写代码、验证、读 profile 和规划，长上下文中不同类型信息相互干扰。
- profiler 指标数量多、名字复杂，模型未必知道其定义和因果含义。
- 只保留当前版本会在后续探索失败时丢失已找到的高性能实现。
- CPU 与 GPU 的优化工具和指标体系不同，框架需要把后端相关知识隔离，而非用一套固定 prompt 硬套。

### 3. 核心观察

性能优化应是“证据驱动的闭环控制”：每轮修改都产生可验证结果；Profiler 解释当前状态；Conductor 依据历史对比选择下一动作；只有正确版本才参与性能竞争。LLM 的价值主要在综合异构证据，而不是替代编译器或测量工具。

## 三、Method

### 1. 四角色架构

```text
参考算子 + 硬件信息
  → Coder：生成 Triton/C++ kernel
  → Verifier：编译、运行、正确性检查
      ├─ 失败 → 错误原因与修复提示 → Coder
      └─ 通过 → Profiler：采集硬件指标
                   → Conductor：对比历史最佳并形成优化建议
                        → Coder：下一轮实现
  → 达到预算后返回历史最佳正确版本
```

![PRAGMA 中 Coder、Verifier、Profiler 与 Conductor 的闭环](/assets/papers/agent-systems/pragma-fig01-architecture.png)

*图 1：PRAGMA 四角色架构。Verifier 用随机输入比较参考结果与候选输出，Profiler 分别通过 NCU 或 perf 采集 GPU/CPU 证据，Conductor 联合历史最佳、代码、验证日志、profiler 文档和指标生成下一轮建议。来源：论文 Figure 1。*

图中的编号体现闭环顺序：Coder 先生成实现，Verifier 决定候选是否可进入 profiling；Conductor 解释硬件数据后把建议送回 Coder。LLM 负责生成和综合，但编译、正确性与性能事实来自外部工具。

角色划分不是为了让多个模型投票，而是让不同工具输出以稳定接口流动。Verifier 和 Profiler 提供外部事实，Conductor 负责解释，Coder 负责修改。

### 2. Coder

Coder 接收参考实现、目标硬件、上一轮代码以及 Conductor 指令。GPU 侧生成 Triton，CPU 侧生成 C++。它需要保持接口与数值语义，同时实施明确优化，例如改变 tile、并行映射、向量化、内存访问或指令结构。

### 3. Verifier：硬门控

Verifier 是非 LLM 的执行组件，依次检查：

1. 能否编译；
2. 能否在目标输入上运行；
3. 输出是否与参考实现一致；
4. 失败时提取可操作的错误原因。

只有通过验证的版本才进入 profiling 和性能排序。这避免把错误结果的“极短运行时间”误当成优化收益。

### 4. Profiler 与知识整理

GPU Profiler 使用 NCU，默认关注：

- kernel 执行时间；
- occupancy；
- 寄存器与 shared memory 使用；
- Tensor Core 活跃周期；
- 内存吞吐。

CPU 侧采用 top-down 风格指标，包括 retired instructions、front-end bound、back-end bound、bad speculation 和 cycles。Conductor 还可以按当前假设请求额外指标，而不是每次固定收集全部数据。

仅有指标名仍不够。PRAGMA 先离线抓取 profiler 官方文档，分段让 LLM 总结，再逐层合并成统一 compendium。运行时把相关知识与数值一起交给 Conductor，减少对模型预训练记忆的依赖。

### 5. Conductor：历史比较与下一步计划

Conductor 的输入包括：

- 原始算子与当前代码；
- 编译、运行和正确性结果；
- profiler 指标及其文档解释；
- 历史最佳代码、性能和 profile；
- 过去尝试及已知失败模式。

其输出不是泛泛总结，而是下一轮 Coder 可执行的修改建议。当前版本即使比历史最佳慢，也可以提供有价值证据；最终选择仍以历史最佳为准。

### 6. 多后端抽象

框架在流程上复用 Agent，但把硬件规格、代码生成语言、验证器、数据采集器和 profiler 文档作为后端配置。CPU 与 GPU 因而共享“生成—验证—分析—指导”的控制逻辑，却不共享未经适配的指标语义。

## 四、Evaluation

### 1. 实验设置

- **GPU**：NVIDIA A100 40GB；CUDA 13.0，driver 580.95.05。
- **CPU**：Intel Xeon Gold 6230R；gcc 12.3。
- **模型**：DeepSeek-R1。
- **任务**：KernelBench 算子。
- **预算**：每个任务最多 15 次尝试。
- **GPU 测量**：Triton `do_bench`，5 次 warmup、100 次重复。
- **基线**：Torch、N-PRAGMA（移除 profiling 反馈）和单 Agent Caesar。

### 2. 主要结果

- PRAGMA 相对 Torch 平均达到 **CPU 2.81×**、**GPU 2.30×**。
- GPU 相对 Caesar 报告 **4.50×** 的平均提升。
- 相对基础 LLM 生成 kernel，最大加速达到 **10.95×**。
- GPU 上 N-PRAGMA 的平均 speedup 为 1.28×、Fast1 为 0.322；完整 PRAGMA 为 2.30×、Fast1 为 0.598。
- Caesar 的成功率仅 0.49；N-PRAGMA 为 0.92，说明多角色验证流程本身改善可靠性，而 profile 主要进一步改善性能。

![PRAGMA 与 N-PRAGMA 在六类 KernelBench 算子上的 CPU/GPU 加速分布](/assets/papers/agent-systems/pragma-fig03-performance.png)

*图 2：六类 KernelBench 任务的 speedup 分布，红色虚线为与 Torch 持平。Profiling 反馈在 GPU matmul 和“others”等类别带来明显上界提升，但卷积和部分 CPU 类别仍有大量低于 1× 的候选。来源：论文 Figure 3。*

这些数字支持“profiling 证据有效”，但不同指标不能混为同一结论：成功率反映生成/修复能力，Fast1 反映超过 Torch 的覆盖率，平均 speedup 反映通过任务上的收益幅度。

### 3. 迭代案例

在 GPU max-reduction 案例中，候选相对基线的性能从 31.41% 逐步提升到约 120%。N-PRAGMA 一度达到 85.97%，随后回退到 58.06%；带 profile 和历史最佳记录的 PRAGMA 能识别回退并继续沿有效瓶颈优化。

CPU `conv1d` 案例中，当前版本 speedup 为 2.54×，低于历史最佳 2.93×。虽然 IPC 较高，Conductor 发现分支更多、总指令数更大，于是建议利用 FMA、向量化并减少指令，下一版本达到 4.71×。这个案例说明“单一局部指标变好”不等于整体更快，必须结合历史和多指标解释。

### 4. 结果边界

- 卷积仍是困难类别，深层循环、布局变换和预取需要更复杂的跨层规划。
- 全部方法使用 DeepSeek-R1，尚未说明框架收益对基础模型是否稳定。
- 任务集中在 KernelBench，缺少真实应用端到端测试。
- 每个正确候选都 profiling 会增加显著成本，论文没有系统报告整体墙钟时间。
- CPU/GPU 的统一主要在编排层，后端知识和工具仍需要单独建设。

## 五、局限与开放问题

1. **profile 成本**：对每轮成功候选采集完整指标可能比 kernel 本身慢几个数量级。
2. **指标因果性**：相关指标改善不一定由某次修改导致，多个同时改动更难归因。
3. **测量噪声**：短 kernel 的差异可能落在波动范围，需要置信区间或重复实验门槛。
4. **知识时效**：profiler 文档与硬件版本变化后，离线 compendium 需要重新构建和校验。
5. **正确性范围**：有限输入通过不等于对所有 shape、dtype、边界都正确。
6. **安全回退**：历史最佳能防止最终性能倒退，但不能阻止大量无效尝试消耗预算。

## 六、个人思考与项目关联

### 1. 对 Aprof 的直接启发

PRAGMA 最值得借鉴的是把“profile 证据包”作为技能图中的一等对象。一次优化边不应只有自然语言建议，还应记录：

- 修改前后的代码差异；
- 编译与正确性证据；
- 关键指标的前后变化；
- 性能重复测量与噪声范围；
- Conductor 的瓶颈假设；
- 实际收益和是否进入历史最佳。

这样 skillGraph 可区分“建议被使用”“建议使指标变化”和“建议最终带来性能提升”，避免仅凭共同出现就强化错误技能。

迁移到 Ascend 时，Profiler 需要替换为 CANN/msprof 体系，知识库也必须基于对应版本的官方文档构建。编译成功、数值正确和性能提升应形成分层门控；只有正确性通过后，性能奖励才生效。

### 2. 可改进的执行策略

- 先用低成本计时筛选，只有明显有希望的候选才进行完整 profiling。
- 根据假设按需采集指标，避免每轮收集全集。
- 一轮只执行一个主要技能，增强性能归因。
- 对同一候选重复测量，提升必须超过噪声阈值才能写回经验库。
- 用历史最佳作最终回退，同时保留“最近稳定基线”供小步局部搜索。

### 3. 阅读中的问题

- Profiler 文档由 LLM 多级摘要后，如何验证没有丢失阈值、单位和限定条件？
- Conductor 请求额外指标是否会出现循环或预算失控？
- 15 次尝试中 profiling 占总时间多少，和无 profile 方案的净收益如何？
- 历史最佳在输入 shape 变化时是否仍有效，还是需要按 workload 分开维护？

### 4. 与相关工作的关系

- KEET 同样把源码与 NCU 证据结合，但目标更偏性能解释和报告审查。
- KernelSkill 增加了结构化长期技能和短期记忆；PRAGMA 的知识主要是 profiler 文档与当前历史。
- SAGE 通过 RL 奖励技能生成和使用；PRAGMA 不训练模型，而是在推理时用真实测量闭环改进。

## 七、结论

PRAGMA 证明，给 kernel Agent 增加真实 profile、历史最佳和独立决策角色，能显著优于没有硬件证据的自我反思。对 Aprof 来说，它提供了一个很清晰的在线优化骨架；下一步应重点解决 profiling 成本、指标版本化、动作归因和经验写回质量，而不只是增加更多 Agent。

## 参考链接

- [Paper](https://arxiv.org/abs/2511.06345)
