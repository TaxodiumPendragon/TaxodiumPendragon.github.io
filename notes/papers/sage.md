---
title: "Reinforcement Learning for Self-Improving Agent with Skill Library"
description: SAGE 通过相似任务的序列化 rollout 与技能生成/使用奖励，让 Agent 在强化学习中学习创建、复用并改进可执行技能库。
venue: arXiv preprint
year: 2025
authors: Jiongxiao Wang, Qiaojing Yan, Yawei Wang, Yijun Tian, Soumya Smruti Mishra, Zhichao Xu, Megha Gandhi, Panpan Xu, Lin Lee Cheong
tags:
  - reinforcement-learning
  - agent
  - skill-library
  - GRPO
  - AppWorld
  - self-improvement
links:
  - label: Paper
    url: https://arxiv.org/abs/2512.17102
  - label: Code
    url: https://github.com/amazon-science/SAGE
sidebar:
  order: 5
  label: SAGE · 技能增强自进化
source_file: "paper/Reinforcement learning for self-improving agent with skill library.md"
---


> **一句话总结：** SAGE 把相关任务串成序列 rollout，让前一个任务产生的 Python 技能可被后一个任务调用，并在 outcome reward 之外奖励“有效技能生成”和“成功技能使用”，从而把技能库真正纳入 GRPO 的学习目标。

## 一、论文概览

### 1. 基本信息

- 论文由威斯康星大学麦迪逊分校与 AWS Agentic AI 团队完成。
- 实验环境是 AppWorld：Agent 通过代码调用 9 个应用的 457 个 API，完成跨应用现实任务。
- 基础模型为 Qwen2.5-32B-Instruct；Agent 采用 CodeAct 风格，用 Python 编写和执行动作。
- 技能在本文中是 Agent 生成的 Python 函数。成功后可保存到库，在后续相关任务中检索和调用。

### 2. 核心贡献

1. 提出 **Sequential Rollout**：一次 rollout 不再只含一个任务，而是按相似场景顺序执行多个任务，技能可在序列内积累。
2. 提出 **Skill-integrated Reward**：除任务结果外，显式奖励被后续成功复用的技能，以及成功调用已有技能的行为。
3. 将序列化技能交互并入 GRPO，训练模型学会何时抽象函数、何时复用，而不只是完成当前任务。
4. 在 AppWorld 上提高场景级完成率，同时显著降低交互步数和 token 消耗。

### 3. 关键概念

- **Skill Library**：保存 Agent 自己生成的可执行 Python 函数及描述，可在后续任务中检索。
- **Sequential Rollout**：同一训练样本由一条相关任务链组成，前序任务的技能对后序任务可见。
- **Skill-generation Reward**：若任务 1 生成的技能被后续任务调用，且后续任务成功，则奖励生成行为。
- **Skill-usage Reward**：当前任务成功且使用了前序技能时，奖励技能调用行为。
- **TGC / SGC**：Task Goal Completion 衡量单任务成功；Scenario Goal Completion 要求同一场景的三个任务全部成功，更强调跨任务稳定性。

## 二、Motivation

### 1. 背景与问题

传统 Agent RL 通常把每个任务独立 rollout，奖励只看当前任务是否成功。模型即使在某次轨迹中发现了可复用流程，也没有动力把它抽象为技能；即使有外部技能库，训练目标也不会区分“碰巧调用”与“调用后帮助成功”。

AppWorld 中同一场景的多个任务常共享应用、实体和操作模式。例如第一次任务可能需要检索邮件并抽取订单号，后续任务还会重复这一流程。若每次从零探索，会浪费 API 调用和 token。

### 2. 现有方法及局限

- 独立 rollout 让技能跨任务迁移无法获得梯度信号。
- 仅有 outcome reward 时，模型倾向直接完成任务，不愿承担编写通用函数的即时成本。
- 单纯在 prompt 中提供技能库并不足够；未训练模型可能不会正确选择、调用或调试技能。
- 奖励“生成技能”本身会鼓励无用函数堆积，必须用后续成功使用作为质量信号。
- 过长任务链带来 credit assignment、梯度方差和训练成本问题。

### 3. 核心观察

技能的价值不是它看起来是否通用，而是它是否在后续任务中被正确使用并帮助任务成功。因此可以通过相似任务链制造一个可观测的“生成—复用—结果”闭环，再把这个闭环变成强化学习奖励。

## 三、Method

### 1. Agent 与技能表示

Agent 以 Python 代码与 AppWorld 交互。除直接调用 API 外，它可以把重复操作封装成 Python 函数，并为函数生成描述。技能保存后进入库；后续任务能检索描述、加载函数并执行。

这种表示的优点是可执行和可验证，缺点是技能可能携带场景特定参数、错误假设或副作用，不能仅靠自然语言相似度判断是否安全。

### 2. 先进行 SFT 初始化

论文发现，直接把基础模型放入技能化 prompt 后表现很差。于是先用 Claude Sonnet 3.5 V2 作为专家进行 rejection sampling，构造 1,129 条监督样本，对 Qwen2.5-32B-Instruct 做全参数 SFT。

SFT 教会模型基本行为：理解 AppWorld 接口、生成可执行技能、调用技能并完成任务。随后 RL 才能在此基础上优化技能策略；否则稀疏奖励很难区分 API 使用错误、代码错误与技能决策错误。

### 3. Sequential Rollout

标准 GRPO 对单个问题采样一组独立答案。SAGE 把 rollout 单元改成相关任务序列：

![SAGE 的可执行技能库、Sequential Rollout 与技能奖励](/assets/papers/agent-systems/sage-fig01-sequential-rollout.png)

*图 1：上半部分展示 Agent 将 Python 函数保存为可执行技能并在环境交互中复用；下半部分展示二任务序列中，q1 生成的技能被 q2 成功使用后，分别触发 Skill Generation Reward 与 Skill Usage Reward。来源：论文 Figure 1。*

图中两个额外奖励都受任务成功门控。它不是为“写了一个函数”或“调用了一次技能”直接加分，而是要求相关任务成功，从而把技能的跨任务效用纳入训练信号。

```text
任务 q1：执行 → 可能生成技能 s1 → 写入临时技能库
任务 q2：读取 q1 的技能库 → 可能调用 s1 → 执行并得到结果
（理论上可继续 q3 ...）
```

训练时使用同一 AppWorld scenario 中的相关任务，使复用机会更真实。论文实际采用长度 2 的任务链；更长链虽然看似积累更多技能，却使奖励分配不平衡、方差增大且成本上升。

### 4. Skill-integrated Reward

最终奖励由任务 outcome 与技能信号共同组成。对两任务链，可直观理解为：

- q1 成功，获得 q1 的 outcome reward；
- q1 生成的技能若被 q2 使用且 q2 成功，再获得 generation reward；
- q2 成功，获得 q2 的 outcome reward；
- q2 成功且调用 q1 技能，再获得 usage reward。

关键门控是“后续任务成功”。若 q2 调用技能后失败，不能把调用本身当成正奖励；否则模型可以通过频繁生成、调用函数刷分。

### 5. 与 GRPO 的结合

SAGE 延续 GRPO 的组内相对优势思想：对同一任务上下文采样多个轨迹，用组内奖励归一化计算 advantage，再更新 policy。区别在于环境状态包含技能库，且 reward 同时反映当前任务结果和跨任务技能作用。

论文附录给出一般任务链的奖励形式，但实验选择二任务链，以减轻早期任务累计更多潜在技能奖励造成的位置偏差。

### 6. 训练与推理时的技能库

训练 rollout 中，任务链内技能库是可增长状态。评测时也允许 Agent 在场景相关任务之间积累技能。这个协议更接近持续交互 Agent，但与每题完全独立、清空记忆的评测不可直接横向比较。

## 四、Evaluation

### 1. 实验设置

- **环境**：AppWorld，9 个应用、457 个 API、750 个任务/250 个 scenario，每个 scenario 含 3 个相关任务。
- **划分**：train 105、dev 60、test-normal 168、test-challenge 417 个任务。
- **Challenge 特点**：包含训练中未见的 Amazon 和 Gmail API。
- **模型**：Qwen2.5-32B-Instruct；先 SFT，后 SAGE/GRPO。
- **指标**：TGC、SGC、平均交互步数和生成 token 数。
- **检索**：论文比较同 scenario、query n-gram、query embedding、skill embedding 等策略。

### 2. 主要结果

| 方法 | Normal TGC | Normal SGC | Normal 步数 | Normal tokens | Challenge TGC | Challenge SGC | Challenge 步数 | Challenge tokens |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| GRPO，无技能 | 69.2 | 51.8 | 16.4 | 3613 | 40.7 | 26.9 | 21.9 | 5211 |
| 未训练 Skill Agent | 30.7 | 19.6 | 13.4 | 2988 | 15.3 | 7.0 | 18.7 | 4803 |
| Skill Agent + SFT | 55.2 | 41.7 | 11.4 | 1340 | 37.2 | 20.9 | 16.2 | 1909 |
| SAGE | **72.0** | **60.7** | 12.1 | 1475 | **50.1** | **32.4** | 17.3 | 1807 |

![SAGE 在 AppWorld Normal 与 Challenge 测试集上的主结果](/assets/papers/agent-systems/sage-table01-main-results.png)

*图 2：SAGE 主结果。完整 SAGE 在 Normal/Challenge 的 TGC 与 SGC 上均超过无技能 GRPO；SFT 阶段的步数和 token 更低，但成功率仍不足，说明效率下降不能单独证明技能策略更好。来源：论文 Table 1。*

未训练 Skill Agent 大幅退化，说明“提供技能能力”不等于“会使用技能”。SFT 显著降低步数和 token，但成功率仍低于无技能 GRPO；SAGE 才同时提高成功率与效率。

论文摘要概括为：相对已有方法，SAGE 的场景目标完成率提高 8.9%，交互步骤减少 26%，token 生成减少 59%。具体比较对象和数据集分项应结合表格理解，不能把摘要数字套到所有 split。

### 3. 技能是否真的有帮助

在 Normal split 上，完整 SAGE 为 TGC 72.0、SGC 60.7、12.1 步、1475 tokens；推理时禁用技能后为 71.4、54.8、16.0 步、1937 tokens。单任务成功率只小幅下降，但场景级成功和效率明显变差，说明技能主要提升跨任务一致性与重复流程效率。

### 4. 奖励消融

| 奖励设计 | Normal TGC | Normal SGC |
| --- | ---: | ---: |
| Skill-integrated reward | **72.0** | **60.7** |
| 仅 outcome reward | 69.8 | 55.4 |
| chain-level reward | 67.9 | 56.6 |

仅在整条链完成时给统一奖励会加重 credit assignment，无法判断哪个任务和哪项技能贡献了结果。细粒度生成/使用奖励更有效。

### 5. 检索与初始化消融

- 同 scenario 检索为 72.0/60.7；query n-gram 为 72.0/60.1；query embedding 为 69.6/59.5；skill embedding 为 66.3/56.0。
- 初始化方面，base 仅 40.7/25.6；self-distill 66.5/53.6；RL warmup 68.3/55.3；完整 SFT 初始化达到 72.0/60.7。

结果提示：在具有明确任务结构的环境里，利用 scenario 元数据或词面线索可能比通用 embedding 更可靠；同时 SFT 初始化对稳定 RL 至关重要。

### 6. 任务链长度

二任务链得到 72.0 TGC、60.7 SGC、12.1 步和 1475 tokens；三任务链降至 70.6、54.8、14.3 步和 2585 tokens。更长链没有带来更多收益，反而暴露位置偏差、方差和成本问题。

## 五、局限与开放问题

1. **环境单一**：只在 AppWorld 验证，技能是 Python/API 流程，不代表对代码优化、机器人或网页 Agent 同样成立。
2. **相似任务假设较强**：同 scenario 检索提供了理想相关性，真实开放任务流未必有现成分组。
3. **SFT 数据成本**：1,129 条专家拒绝采样数据仍依赖强教师模型。
4. **技能污染**：论文主要奖励成功复用，对过时、重复、隐含副作用技能的清理讨论不足。
5. **因果归因**：调用技能与任务成功相关，但技能可能不是成功的真正原因。
6. **评测协议**：跨任务保留技能有现实意义，却需要明确哪些信息允许泄漏，才能公平比较。

## 六、个人思考与项目关联

### 1. 映射到算子优化

SAGE 的任务链可以映射为算子族：相同算子不同 shape、同一融合模式、同一数据布局或同一硬件后端。前一个任务产生的 tiling、访存或流水技能在后一个任务中接受再验证。

但算子优化的奖励必须加入硬门控：

```text
compile_ok
  → correctness_ok
      → performance_gain 超过噪声阈值
          → 技能使用奖励 / 技能贡献奖励
```

仅仅“引用了技能且候选变快”还不足以写回。应记录代码 diff、profile 变化、硬件、shape 与重复测量，并尽量让一轮只应用一个主要技能，降低归因混淆。

### 2. 对 skillGraph 结构的建议

SAGE 主要是扁平函数库；Aprof 可以用图补足前置条件和依赖：

- `generated-from`：技能来自哪条成功轨迹；
- `validated-on`：在哪些算子/shape/硬件验证；
- `uses`：本轮显式使用哪些技能；
- `improves`：改善哪些 profile 指标；
- `conflicts-with`：哪些技能不能同时使用；
- `specializes/generalizes`：从具体参数技巧到通用原则的层级。

技能奖励不应直接按被调用次数累计，而应按带置信度的边更新：正确性、显著速度提升、跨任务复现和低回归率共同决定权重。

### 3. 成本与训练方式

AppWorld 的一次验证是 API 交互；kernel 优化一次验证包含编译、运行和 profiling，成本高得多。可采用：

- 较短的二任务链；
- 小 batch 在线采集；
- 对历史轨迹做离线 replay；
- 低成本计时初筛，完整 profile 延迟执行；
- 夜间批量合并、去重和回归测试技能。

### 4. 阅读中的问题

- 若后续任务即使不使用技能也能成功，generation/usage reward 是否高估技能贡献？
- 技能调用失败后，系统是修复原技能、创建新版本，还是简单放弃？
- 技能库不断增长时如何去重、版本化和删除？
- 同一技能在 Normal 成功、Challenge 失败时，权重和适用条件如何更新？

### 5. 与相关工作的关系

- KernelSkill 在推理时依赖结构化专家记忆；SAGE 直接训练 policy 学会生成和复用技能。
- PRAGMA 用真实性能反馈驱动下一轮，但没有给技能本身单独奖励。
- EvolveR 更强调从成功/失败轨迹蒸馏自然语言原则；SAGE 的技能是可执行 Python 函数。
- SkillOpt 把技能文档本身作为可编辑状态并用验证集门控；SAGE 则更新模型 policy。

## 七、结论

SAGE 的价值在于把“技能库有用”变成可训练目标：只有在相关任务序列中被后续成功使用的技能才获得额外信用。它对 Aprof 的启发是明确的，但算子优化必须比 AppWorld 更严格地处理正确性、测量噪声、硬件条件和昂贵验证，才能避免技能奖励演化成新的 reward hacking 通道。

## 参考链接

- [Paper](https://arxiv.org/abs/2512.17102)
- [Code](https://github.com/amazon-science/SAGE)
