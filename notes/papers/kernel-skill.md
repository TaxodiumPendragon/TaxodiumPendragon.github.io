---
title: "KernelSkill: A Multi-Agent Framework for GPU Kernel Optimization"
description: 通过长短期双层记忆、显式专家技能和多角色反馈闭环，将 GPU kernel 优化从无结构试错转化为可检索、可复用的决策过程。
venue: arXiv preprint
year: 2026
authors: Qitong Sun, Jun Han, Tianlin Li, Zhe Tang, Sheng Chen, Fei Yang, Aishan Liu, Xianglong Liu, Yang Liu
tags:
  - GPU
  - CUDA
  - kernel-optimization
  - multi-agent
  - skill-library
  - memory
links:
  - label: Paper
    url: https://arxiv.org/abs/2603.10085
  - label: Code
    url: https://github.com/0satan0/KernelMem/
sidebar:
  order: 3
  label: KernelSkill · 双层技能记忆
source_file: "paper/KernelSkill A Multi-Agent Framework for GPU Kernel Optimization.md"
---


> **一句话总结：** KernelSkill 用 Generator、Reviewer、Planner/Optimizer 和 Diagnoser/Repairer 构成闭环，并把跨任务专家知识放入长期技能库、把当前任务的优化与修复轨迹放入短期记忆，使 CUDA 优化能够基于 profile 和代码特征检索明确策略，而不是只靠模型反复猜测。

## 一、论文概览

### 1. 基本信息

- 作者来自北京航空航天大学、之江实验室和南洋理工大学。
- 论文以 KernelBench Level 1–3 的 250 个 PyTorch 算子为任务，把它们翻译并优化为 CUDA kernel。
- 实验平台为 NVIDIA A100 80GB，统一比较编译正确率、数值正确率以及相对 PyTorch Eager 的加速。
- 代码仓库名仍使用 `KernelMem`，论文中系统名为 KernelSkill。

### 2. 核心贡献

1. 提出一个面向 GPU kernel 优化的多 Agent 框架，把初始代码生成、编译/正确性/性能审查、优化规划与错误修复分开处理。
2. 设计长期记忆与短期记忆：前者保存结构化专家技能和适用条件，后者记录单个任务内的优化轨迹、失败原因和修复链。
3. 用 profile 特征和静态代码特征驱动确定性技能检索，使建议能追溯到硬件瓶颈和代码模式。
4. 在 KernelBench 上实现全部任务成功，并报告 Level 1/2/3 分别为 5.44×、2.82×、1.92× 的平均加速。

### 3. 关键概念

- **长期记忆（Long-term Memory）**：跨任务共享的技能库，既包含文献提炼的专家规则，也包含执行经验。
- **短期记忆（Short-term Memory）**：当前算子的完整交互历史，区分优化轨迹和失败修复链。
- **技能（Skill）**：不是一句宽泛提示，而是带有适用 profile、代码特征、瓶颈优先级、禁止条件和具体方法的结构化决策单元。
- **Fast1**：生成 kernel 的速度是否超过 PyTorch Eager；论文同时报告成功率、平均 speedup 和 Fast1 比例。

## 二、Motivation

### 1. 背景与问题

LLM 已能生成可运行 CUDA，但“能运行”与“接近硬件上限”之间差距很大。性能优化需要联合理解算法、内存层次、并行映射和硬件指标，而失败可能来自编译、数值、越界或性能回退等不同路径。

论文给出的动机示例是一个大矩阵乘之后接逐元素运算的任务。模型知道应当融合算子，却生成了低效 GEMM，最终只有 0.032×。随后它继续尝试融合层面的修改，而没有先修复决定性能上限的 GEMM 实现。这说明模型可能识别了局部优化词汇，却缺少“当前瓶颈是什么、哪个动作优先”的显式决策结构。

### 2. 现有方法及局限

- 训练式方法需要大量高质量 kernel 或昂贵 rollout，难以快速覆盖新硬件。
- 单 Agent 迭代通常把所有反馈堆进上下文，编译修复和性能优化互相干扰。
- profile 数值本身不会自动变成可执行策略；如果没有代码特征和硬件规则，模型仍可能选择错误方向。
- 成功轨迹常停留在单个任务的对话中，无法迁移到相似算子。
- 只保留“最佳代码”会丢失失败原因；只保留完整对话又会引入大量低价值上下文。

### 3. 核心观察

KernelSkill 的核心假设是：GPU 优化可以表示为“观测特征 → 判断瓶颈 → 选择技能 → 执行并验证”的决策过程。将这个过程显式化后，LLM 负责生成和组合，结构化记忆负责提供边界、优先级与历史证据。

## 三、Method

### 1. 系统总览

```text
PyTorch 参考实现
  → Generator：生成多个初始 CUDA 候选
  → Reviewer：编译 + 正确性 + Profiler
      ├─ 失败 → Diagnoser → Repairer → 重新审查
      └─ 成功 → 特征提取 → 长期技能检索
                           → Planner → Optimizer → 重新审查
  → 持续更新短期记忆与历史最优 kernel
  → 输出正确且性能最好的候选
```

![KernelSkill 的种子生成、多 Agent 优化和双层记忆架构](/assets/papers/agent-systems/kernelskill-fig01-overview.png)

*图 1：KernelSkill 总体架构。中间的 Reviewer、Planner/Optimizer 与 Diagnoser/Repairer 分别处理证据、性能优化和失败修复；右侧长期记忆保存可检索专家技能，短期记忆分别保存优化树与修复链。来源：论文 Figure 1。*

Generator 首先将参考实现翻译为 CUDA。该阶段重点是建立可编译、语义一致的起点，而不是要求一次达到最优；论文为每个任务采样 3 个初始种子，再选择较好的候选进入迭代。

### 2. Reviewer：把反馈拆成三类证据

Reviewer 由三个非同质模块组成：

1. **Compiler**：收集编译是否成功以及具体错误。
2. **Verifier**：与 PyTorch 参考结果比较，检查数值正确性。
3. **Profiler**：测量运行时间，并用 NCU/NSYS 收集硬件指标。

这种拆分很重要。编译失败时不存在可信性能；正确性失败时加速也没有意义；只有前两关通过后，profile 才能成为优化依据。

### 3. 长期记忆：结构化专家技能

长期记忆不是普通向量库。论文从 GPU 优化资料中整理专家知识，并将执行经验也纳入统一结构。一个技能大体包含：

- profile 字段与含义映射；
- 当前运行的 profile 特征和静态代码特征；
- 可推导字段与性能余量分级；
- 瓶颈判定和优先级规则；
- NCU 指标谓词与代码模式；
- 全局禁止规则，避免在不适用场景强行套用；
- “条件—动作”决策表；
- 供 LLM 使用的背景知识和具体优化方法。

静态特征关注循环、访存、同步、数据类型、共享内存、向量化等代码模式；动态特征描述带宽、吞吐、占用率和 stall 等运行状态。检索策略联合两类特征，以规则和决策表选择满足前置条件的技能，而不是只按语义相似度返回“看起来相关”的建议。

### 4. 短期记忆：优化轨迹与修复链分离

论文把任务内历史分成两类：

- **优化轨迹**：正确 kernel 的版本、计划、profile 变化和性能结果。
- **修复链**：失败代码、编译/验证错误、诊断与修复动作。

Planner 和 Optimizer 主要消费优化轨迹；Diagnoser 和 Repairer 主要处理失败链。这样可避免模型在做性能决策时被大量语法错误淹没，也能避免修复 Agent 擅自进行未验证的架构重写。

### 5. Planner、Optimizer 与基础 kernel 更新

Planner 根据检索技能、当前 profile 和历史最优版本生成优化计划，Optimizer 再据此改写代码。系统会记录全局最佳候选，但不会因微小抖动频繁替换后续迭代的基础 kernel。论文设置更新门槛：相对提升至少 30%，或绝对 speedup 提升至少 0.3，才更新基础版本。

这个门槛的作用是稳定搜索路径。若每次 1% 波动都成为新起点，上下文会充满近似版本，模型难以判断真正有效的修改。

### 6. 错误处理路径

当编译或正确性失败时：

1. Diagnoser 根据错误日志、参考语义和失败历史定位原因；
2. Repairer 只实施针对性修复；
3. 修复结果重新进入 Compiler 与 Verifier；
4. 成功后才回到性能优化路径。

这种状态机比“让同一个模型继续修改直到通过”更容易控制，也便于统计错误类型和沉淀修复技能。

## 四、Evaluation

### 1. 实验设置

- **数据集**：KernelBench Level 1/2/3，共 100/100/50 个任务。
- **硬件**：NVIDIA A100 80GB。
- **软件**：Python 3.11.13、PyTorch 2.6.0+cu124、CUDA 12.4、cuDNN 9.1.0、cuBLAS 12.9。
- **基础模型**：ChatGPT-5.1。
- **搜索预算**：每题最多 15 轮，temperature 1.0，3 个初始候选。
- **计时**：25 次 warmup、100 次正式运行，取平均值。
- **基线**：CudaForge、STARK 等自动 kernel 生成/优化系统。

### 2. 主要结果

| 方法 | L1 Success | L1 Speedup | L2 Success | L2 Speedup | L3 Success | L3 Speedup |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| KernelSkill | 1.00 | 5.44× | 1.00 | 2.82× | 1.00 | 1.92× |
| STARK | 1.00 | 3.03× | 1.00 | 2.69× | 1.00 | 1.58× |
| CudaForge | 0.96 | 1.45× | 1.00 | 2.10× | 0.96 | 1.28× |

KernelSkill 的 Fast1 分别为 0.62、1.00 和 0.82；STARK 为 0.71、1.00 和 0.87。也就是说 KernelSkill 的平均加速更高，但“超过 PyTorch 的任务比例”并非每一级都占优，少数大幅加速任务可能显著影响平均值。

### 3. 记忆消融

| 配置 | L1 Speedup | L2 Speedup | L3 Speedup | 主要现象 |
| --- | ---: | ---: | ---: | --- |
| 完整 KernelSkill | 5.44× | 2.82× | 1.92× | 成功率均为 1.00 |
| 无全部记忆 | 1.52× | 1.05× | 0.95× | L3 平均性能甚至低于 PyTorch |
| 无短期记忆 | 3.53× | 2.42× | 1.78× | 仍受益于专家技能，但迭代一致性下降 |
| 无长期记忆 | 1.77× | 1.18× | 1.04× | 正确率保持，性能优化明显退化 |

![KernelSkill 长期记忆与短期记忆的消融结果](/assets/papers/agent-systems/kernelskill-table02-memory-ablation.png)

*图 2：双层记忆消融。去掉任意一种记忆都会降低 Fast1 与 Speedup；完全移除记忆后 Level 3 平均 Speedup 为 0.95×，说明无结构试错甚至可能慢于 PyTorch。来源：论文 Table 2。*

无记忆版本的成功率为 0.96/0.98/0.94，Fast1 为 0.46/0.75/0.36；这说明记忆不仅影响最终速度，也影响修复与收敛。长期记忆对性能方向的贡献尤其明显，短期记忆则让模型能利用同一任务内的试验结果。

### 4. 结果边界

- 论文只在 A100 和 KernelBench 上验证，不能直接推出在 H100、消费级 GPU 或非 CUDA 后端上同样有效。
- 平均 speedup 对少量极高收益任务敏感，应同时阅读 Fast1 和任务级分布。
- 长期记忆的规则覆盖面决定上限。没有匹配技能时，系统仍回退到 LLM 依据证据选择策略。
- 15 轮 × 3 初始候选加上 profile 的成本不低，论文没有把 token、编译和 profile 总开销作为核心指标比较。

## 五、局限与开放问题

1. **知识构建仍需专家劳动**：结构化技能质量高，但字段、谓词和决策表需要持续维护。
2. **规则迁移依赖硬件语义**：A100 上的阈值和优化优先级未必适合其他架构。
3. **经验写回机制不够清楚**：论文强调长期经验，但对错误经验如何去重、衰减和冲突消解描述有限。
4. **性能归因仍可能混淆**：一轮同时改动多个点时，很难证明是哪条技能带来提升。
5. **可复现成本**：基础模型、硬件、驱动和测量协议都会改变结果，需要固定环境和重复统计。

## 六、个人思考与项目关联

### 1. 对 Aprof/skillGraph 的可借鉴点

KernelSkill 最适合迁移的并不是“多 Agent 数量”，而是技能节点的结构。skillGraph 可以把一个优化技能拆成：

```text
SkillNode
  preconditions: 算子/shape/硬件/代码模式
  evidence: profile 指标与阈值
  hypothesis: 当前瓶颈
  action: 代码或参数修改
  forbidden_when: 禁用条件
  expected_effect: 应改善的指标
  validation: 编译、正确性、性能门槛
  provenance: 来源论文/轨迹/提交
```

图中的边则可表达 `requires`、`conflicts-with`、`followed-by`、`repairs` 和 `generalizes-to`。这样能同时保留长期策略与局部转移经验。

在 Ascend 场景中，需要把 CUDA/NCU 证据映射为 CANN 与 profiling 语义，例如 UB 使用、MTE/Vector/Cube 利用率、流水并行、搬运与同步开销，同时把 tiling 参数和硬件型号放入前置条件，不能直接复制 A100 阈值。

### 2. 阅读中的问题

- 长期技能库里哪些内容来自人工文献整理，哪些来自自动经验写回？两者冲突时如何排序？
- 30%/0.3 的更新门槛是否经过消融，是否会跳过可累积的小改进？
- 若检索出多条互相冲突的技能，Planner 如何选择或排序？
- 一个优化动作在多个 kernel 上成功多少次，才应晋升为可跨任务使用的技能？

### 3. 与相关工作的关系

- 相比 PRAGMA，KernelSkill 更强调显式技能与长短期记忆；PRAGMA 更强调 profiler 文档知识和动态指标闭环。
- 相比 KEET，KernelSkill 的目标是直接生成更快代码；KEET 更专注于解释与建议的证据质量。
- 相比 SAGE，KernelSkill 没有用强化学习训练“何时生成/使用技能”，而是依赖结构化检索与多轮执行。

## 七、结论

KernelSkill 说明，kernel 优化 Agent 的关键不是无限追加历史，而是把知识分成可跨任务复用的长期技能和服务当前任务的短期轨迹，并让编译、正确性与 profile 证据进入明确状态机。它为 Aprof 的 skillGraph 提供了很直接的节点模式，但要真正自进化，还需要补上经验质量评估、冲突消解、硬件条件化和低成本验证机制。

## 参考链接

- [Paper](https://arxiv.org/abs/2603.10085)
- [Code](https://github.com/0satan0/KernelMem/)
