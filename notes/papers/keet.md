---
title: "KEET: Explaining Performance of GPU Kernels Using LLM Agents"
description: 使用多角色 LLM Agent 联合阅读 CUDA 源码和 Nsight Compute profile，生成可追溯的性能解释与针对性优化建议。
venue: arXiv preprint
year: 2026
authors: Joshua H. Davis, Klaudiusz Rydzy, Srinivasan Ramesh, Aadit Nilay, Daniel Nichols, Swapna Raj, Nikhil Jain, Abhinav Bhatele
tags:
  - GPU
  - profiling
  - multi-agent
  - performance-explanation
links:
  - label: Paper
    url: https://arxiv.org/abs/2605.04467
sidebar:
  order: 2
  label: KEET · GPU 性能解释 Agent
source_file: "paper/KEET Explaining Performance of GPU Kernels  Using LLM Agents.md"
---


> **一句话总结：** KEET 把 CUDA 源码理解、profile/metric 选择、性能分析、报告聚合和证据审查拆成多个 Agent 角色，使 LLM 能从大量 Nsight Compute 数据中筛出关键指标，解释瓶颈并提出与具体代码对应的优化建议。

## 一、论文概览

### 1. 基本信息

- 作者来自马里兰大学、NVIDIA 和 Lawrence Livermore National Laboratory。
- 输入包括 CUDA 源文件、一个或多个 `.ncu-rep` profile，以及生成 profile 的运行配置元数据。
- 输出是自然语言性能报告和独立 review；报告既解释硬件瓶颈，也分析调参变量与性能的关系，并提出代码级建议。
- 论文在 NVIDIA H100 SXM5 上测试多种 CUDA kernel，并在多 profile 消融中加入 V100/A100/H100 数据。

### 2. 核心贡献

1. 提出面向 NCU profile 的多角色 Agent 架构，将源码假设与实测证据串联起来。
2. 使用 Profile Selector 和 Metric Selector 分批筛选 profile 与指标，降低把整份高维报告直接塞给模型造成的噪声和幻觉。
3. 用 MCQ 和代码优化两个下游任务评价“解释是否有用”，而不是仅让人工主观评价报告文本。
4. 分析 profile 数量、选择器角色和基础 LLM 对最终优化质量的影响，并比较/融合规则工具 DrGPU。

### 3. 基本概念

- **NCU profile**：Nsight Compute 通过多次 replay 收集 kernel 级硬件指标，保存为 `.ncu-rep`。
- **PRI**：NCU Python Report Interface，可程序化读取指标名称、值、单位等；行级数据仍需从 GUI 手动导出 CSV。
- **DrGPU**：按 stall reason 树和固定规则生成原因及建议的非 LLM 工具。
- **Pass@1**：单次生成的代码能够编译并通过测试的期望概率。
- **Speedup@1**：在多次候选采样下，单次尝试相对原 kernel 的期望加速。

## 二、Motivation

### 1. 问题背景

NCU 能提供数以千计的指标、源代码行关联和规则提示，但从大量 profile 中找出真正限制性能的硬件组件、代码区域和调参规律仍主要依赖专家。硬件代际变化还会引入新的指标和优化模式，固定规则维护成本很高。

### 2. 现有方案的局限

- GUI 适合查看单个 profile，却不适合系统比较大量配置。
- GPA/DrGPU 能自动分类 stall，但建议基于固定阈值，难以结合特定算法语义和源码结构。
- 把原始指标表直接交给 LLM 会产生明显信息噪声；模型可能复述数据，却没有形成瓶颈解释。
- 单一大 prompt 难以同时处理多文件、多 profile、指标筛选、证据引用和最终审查。

### 3. 核心观察

性能解释可以分成“源码提出假设”和“profile 验证假设”两阶段。模型无需一次看到所有数据，而应像分析人员一样迭代选择最有信息量的源码、profile 和指标，再由独立角色聚合并复核。

## 三、Method

### 1. 总体架构

KEET 的主流程为：

```text
源码 + NCU profiles + 元数据
  → Source Code Inspection
  → Profile Inspection
  → Analysis Aggregator
  → Explanation Reviewer
  → 性能解释 + Review
```

每个角色是一个带专用上下文的 prompt 模板。多文件或多 profile 时启用选择器；单文件/单 profile 时跳过不必要的角色。

![KEET 从源码检查到 profile 分析、聚合与复核的多 Agent 架构](/assets/papers/agent-systems/keet-fig01-architecture.png)

*图 1：KEET 总体架构。上方是从源码和 NCU profile 到最终解释的主路径；下方展开两个迭代阶段，虚线框表示单文件或单 profile 时可跳过的角色。来源：论文 Figure 1。*

读图时应关注“假设—证据”的分工：源码阶段先形成算法摘要与性能假设，profile 阶段再由选择器挑选数据和指标进行验证，Aggregator 与 Reviewer 最后负责合并和复核，而不是让一个大 prompt 一次完成全部工作。

### 2. Source Code Inspection

1. **Source File Describer** 为源文件生成简要描述。
2. **Source File Selector** 决定下一份最值得读取的文件。
3. **Algorithm Summarizer** 累积更新算法摘要。
4. **Performance Hypothesizer** 仅根据源码提出可验证的性能假设，作为后续 profile 检查计划。

这个阶段的输出是“假设”而不是结论，避免仅凭源码断言真实硬件瓶颈。

### 3. Profile Inspection

- **Profile Selector** 根据算法摘要、当前假设和已有分析，选择信息增益最大的 profile。
- **Metric Selector** 从可用 NCU 指标中选出本轮最相关的子集，避免高维数据淹没有效信号。
- **Profile Analyzer** 结合源码、指标和人工编写的分析准则，生成瓶颈、调参影响与优化建议，并要求对所引用 profile 做内联标记。
- **DrGPU Evaluator** 可选地读取 DrGPU 建议，只把判断为有用的内容并入分析。

所有 profile 至少被分析一次后，Aggregator 合并各轮结论，Reviewer 再将最终报告与初始性能假设对照，检查支持、反证和遗漏。

### 4. 评价解释质量的方法

论文没有只做“专家打分”，而是把报告作为上下文交给另一个 LLM 完成两个任务：

- **MCQ**：回答人工编写的源码与 NCU 性能问题，评价报告是否传递了正确理解。
- **OPT**：根据报告修改 kernel，最多允许三次修复；用编译、测试和 NSYS 三次计时评价 Pass@1 与 Speedup@1。

比较组包括 Code-only、Code+Data、DrGPU-only、LLM+DrGPU、KEET 和 KEET+DrGPU。LLM 方法每个设置生成三份独立报告，下游任务各采样 20 次。

## 四、Evaluation

### 1. 实验设置

- 应用包括 Rodinia kernel、LULESH、XSBench 和 Gaussian 等，覆盖动态规划、网格遍历、N-body、有限状态机、结构网格、Monte Carlo 等 motif。
- 主要硬件为 NVIDIA H100 SXM5。
- 下游任务模型为 `gpt-oss-120b`；KEET 内部还比较 GPT-5.1、gpt-oss-120b 和 Nemotron-3-Nano。
- OPT 用 NSYS 计时，每个候选取三次运行平均值，避免 NCU replay 干扰真实时间。

### 2. MCQ 结果

KEET 与 KEET+DrGPU 的跨应用平均 Score@1 都为 `82%`，高于最近的 Code+Data 基线 `79%`。提升在较难的 backprop 和 LULESH 问题上尤其明显；但 `nw` 上 Code-only 更好，XSBench 上 DrGPU 与 KEET 持平，说明额外解释并非对所有任务都稳定增益。

### 3. OPT 结果

- KEET 在 5 个应用上取得最高最大加速，KEET+DrGPU 在 3 个应用上最高。
- 未获最高值的 lavaMD、XSBench、heartwall 中，最佳 KEET 方法与最佳基线差距小于 5 个百分点。
- 代表性最佳优化包括：`nw` 从基线最佳 `1.32×` 提高到 `1.85×`，hotspot 从 `1.37×` 到 `1.67×`，Gaussian 从 `12.4×` 到 `14.0×`。
- KEET 的优势常来自更针对性的组合，如减少 barrier、降低 shared memory 使用、`__ldg`、hoist invariant、CUB scan 等。

![KEET、规则工具与其他解释方法在不同应用上的 Speedup@1](/assets/papers/agent-systems/keet-fig07-speedup.png)

*图 2：不同报告生成方法驱动下游代码优化后的 Speedup@1。各应用收益差异很大，Gaussian 使用右侧独立纵轴；这说明平均数不能替代逐应用分析，也说明 KEET 与 DrGPU 的组合不是在所有工作负载上都占优。来源：论文 Figure 7。*

### 4. 消融结果

- Metric Selector 和 Profile Selector 整体提高平均 Speedup@1 或最大加速，说明主动筛选不是可有可无的提示技巧。
- Profile 数量存在 sweet spot：LULESH 约 4 份、XSBench 约 16 份；继续增加会引入无关信息并降低效果。
- GPT-5.1 多数情况下最好，说明 Agent 分工无法完全弥补基础模型能力差异。
- DrGPU 对 `nw` 和 hotspot 等同步问题有补充价值，会推动 KEET 识别多余 barrier；但不是所有任务都需要规则工具。

### 5. 失败模式

论文按代码 diff 对优化动作分类，发现 loop optimization、memory qualifier/hint、算法重构和强度削减与编译/运行失败相关；线程块配置变更的 slowdown 比例最高。单个 profile 很难支撑网格与 block size 的可靠调优。

## 五、局限与开放问题

1. 下游评价仍由另一个 LLM 完成，报告质量和代码生成能力存在耦合；需要更多人工专家或可执行诊断基准验证。
2. NCU PRI 不能直接提供全部行级数据，DrGPU 路径仍需手工导出 CSV，自动化不完整。
3. 多 Agent、多轮 profile 筛选和三份报告会增加 token 与推理成本，论文主要评价质量而非端到端分析成本。
4. “更新到知识更新的模型即可支持新硬件”是潜力判断，不等于无需新的工具语义和硬件验证。
5. 实验以 NVIDIA CUDA 为主，跨 AMD、Ascend 或 CPU profiler 的泛化尚未展示。

## 六、个人思考与 AProf 关联

### 1. 可直接借鉴

- AProf 的 `source-hypothesis → profiling-plan → evidence-attribution` 与 KEET 两阶段结构高度一致。
- Metric Selector 可以用“最多三个最有区分力的 metric”控制上下文，避免把全部 msprof CSV 交给模型。
- Reviewer 应显式把每条初始假设标为 confirmed、refuted、uncertain，并附 report 字段和源码锚点。
- 多 shape/multi-profile 不能越多越好，应按假设选择信息增益最大的样本，并在达到覆盖后停止。
- 评价诊断 Skill 时，可以设计“诊断驱动的优化是否更成功”这一可执行下游指标，而不仅比较报告文本。

### 2. 迁移到 Ascend 时的变化

- 将 NCU 指标映射替换为 msprof 的 OpBasicInfo、PipeUtilization、Memory、L2Cache、ResourceConflictRatio 和 trace。
- 将 SM/warp/shared memory 术语替换为 AI Core、AIC/AIV、UB/L1/L0、MTE 与 blockDim/tiling。
- Profile Selector 应同时考虑 shape、dtype、SoC 和 CANN 版本；不同硬件的数据不能无条件合并。
- 性能解释必须引用真实 CSV/trace 证据，simulator 只能标为 proxy。

### 3. 阅读中的问题

- Selector 的停止条件只是“都至少看过一次”，是否能进一步按证据充分性提前停止？
- 人工分析准则在效果中贡献多大？如果替换为自动维护的知识库，结果是否稳定？
- 报告中的建议若没有执行，如何校准其置信度和预期收益？
- 能否把失败优化结果回写成结构化反证，形成跨任务经验库？

## 七、结论

KEET 的价值不只是“让 LLM 读 profiler”，而是建立了源码假设、主动数据筛选、证据聚合和独立复核的完整链路。实验说明，合适的解释能提高问答与代码优化质量，但 profile 过多、基础模型不足和错误的线程配置仍会带来明显风险。

## 参考链接

- [arXiv](https://arxiv.org/abs/2605.04467)
