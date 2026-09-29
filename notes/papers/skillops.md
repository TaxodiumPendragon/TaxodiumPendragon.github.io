---
title: "SkillOps: Managing LLM Agent Skill Libraries as Self-Maintaining Software Ecosystems"
description: 将技能库视为需要持续治理的软件生态，通过类型化技能契约、分层技能图和任务时/库时双循环诊断并修复技能技术债。
venue: arXiv preprint
year: 2026
authors: Xinyuan Song, Hongji Pu, Liang Zhao
tags:
  - agent
  - skill-library
  - software-maintenance
  - graph
  - technical-debt
  - ALFWorld
links:
  - label: Paper
    url: https://arxiv.org/abs/2605.13716
  - label: Code
    url: https://github.com/Hik289/SkillOps
sidebar:
  order: 6
  label: SkillOps · 技能库维护
source_file: "paper/SkillOps Managing LLM Agent Skill Libraries as Self-Maintaining Software Ecosystems.md"
---


> **一句话总结：** SkillOps 不把 skill library 当作静态检索池，而是用 `(P,O,A,V,F)` 技能契约、两层 HSEG 图和任务时/库时双循环持续发现冗余、接口漂移、失败风险与验证缺口；论文在 ALFWorld 上报告 79.5% 成功率，并展示其作为插件对检索型 Agent 的稳定增益。

## 一、论文概览

### 1. 基本信息

- 作者来自 Emory University 与 University of Illinois Urbana-Champaign。
- 当前 PDF 明确标注为 **Preprint**，对应 arXiv:2605.13716v1；原飞书草稿中的“已提交 NeurIPS 2026”没有在论文正文中得到确认，因此不保留。
- 代码仓库为 `Hik289/SkillOps`。
- 实验以 ALFWorld 文本任务和 SkillsBench 技能为基础，研究长期增长、含缺陷技能库的维护问题。

### 2. 核心贡献

1. 提出 **Skill Technical Debt**：单个 skill 当下可能可用，但库级冗余、陈旧、接口不兼容、验证缺口等问题会持续损害未来检索、组合和执行。
2. 用类型化 **Skill Contract** 表示技能，并用 Hierarchical Skill Ecosystem Graph（HSEG）统一表达技能内部契约和技能之间的关系。
3. 区分 Task-Time Loop 与 Library-Time Loop：前者完成当前任务的检索、拼接和局部修复，后者把执行日志转化为持久库更新。
4. 提供 `run_maintenance(raw_lib)` 插件接口，使已有检索器或 Planner 无需修改内部逻辑即可使用维护后的库。
5. 在 ALFWorld 上分析独立使用、插件使用、库规模、token 成本和组件消融，并指出维护收益具有明显的下游方法依赖性。

### 3. 核心概念

- **技能技术债**：不会立即破坏单个技能，却会长期降低库级检索精度、组合合法性和执行可靠性的持久缺陷。
- **Skill Contract**：五元组 `(P,O,A,V,F)`，分别表示前置条件、可执行操作、产物、验证器和已知失败模式。
- **HSEG**：内部图表达一个技能的契约，外部 Graph-of-Graphs 表达不同技能之间的类型化关系。
- **Validation Gap**：技能没有局部验证器，即 `V = ∅`，错误产物可能继续传播。
- **Library-Time Maintenance**：不服务某个即时任务，而是对整个技能库做合并、修复、退役和接口治理。

## 二、Motivation

### 1. 为什么任务成功仍不代表技能库健康

现有 skill-based Agent 多数优化任务时行为：如何检索最相关技能、如何组合计划、失败后怎样修复。一次执行最终成功，只能说明当前轨迹被补救，并不意味着底层库问题已经消失。例如：

- 两个重复技能仍会共同污染下次检索；
- 一个缺少 validator 的技能仍可能产出错误中间结果；
- 上游输出类型与下游输入类型仍然不匹配；
- 本轮临时修好的 skill 没有写回库，未来还会重复失败；
- 过时或过度特化的技能仍会占据 top-k 候选。

因此，SkillOps 把技能库定义为一种持续演化的软件资产，而不是只读 prompt 集合。

### 2. Skill Technical Debt

论文将传统软件/ML 技术债概念迁移到技能生态，重点在“持久性”和“库级影响”。典型问题包括：

- **冗余**：接口和功能近似的 clone 扩大候选池、降低检索精度。
- **陈旧**：依赖或环境改变后实现不再适用。
- **规范不足**：缺少前置条件、产物类型或失败模式。
- **过度特化**：只适用于极窄参数或上下文。
- **验证缺口**：没有对输出产物进行局部正确性检查。
- **接口漂移**：技能之间有逻辑依赖，却无法直接组合数据类型。

### 3. 核心观察

检索的语义相关性不等于可执行性。一个技能名称与任务很相似，却可能前置条件不满足；两个技能看似应该相连，却可能产物类型不兼容。解决方案需要同时表达“做什么”和“能否安全组合”，并把执行反馈持久化为库级维护动作。

## 三、Method

### 1. 总体架构

![SkillOps 的任务时循环、HSEG 双层图与库时维护循环](/assets/papers/agent-systems/skillops-fig01-hseg-architecture.png)

*图 1：SkillOps 系统架构。左侧 Task-Time Loop 在当前任务中检索、拼接、插入 validator/adapter 并局部修复；中间 HSEG 同时包含每个技能的内部契约图和跨技能 Graph-of-Graphs；右侧 Library-Time Loop 从执行日志诊断健康度并持久更新技能库。来源：论文 Figure 1。*

图中蓝色路径解决“这次任务怎么执行”，橙色路径解决“执行之后技能库如何变得更健康”。二者共享 HSEG，但更新时机和优化目标不同。

### 2. Skill Contract：`(P,O,A,V,F)`

| 字段 | 含义 | 用途 |
| --- | --- | --- |
| `P` | Preconditions | 判断当前状态是否允许调用技能 |
| `O` | Operation | 实际可执行操作 |
| `A` | Artifact | 技能产生的类型化结果 |
| `V` | Validator | 对 `A` 做局部正确性检查 |
| `F` | Failure modes | 已知失败模式与修复依据 |

技能契约使系统能在执行前检查适用性和组合性，在执行后检查局部正确性并记录失败。尤其是 `V = ∅` 会被直接识别为 validation gap。

### 3. HSEG 的两层关系

**内部技能图**把 `P → O → A → V` 表示为契约链，并让失败模式 `F` 与操作、验证路径关联。

**外部 Graph-of-Graphs**使用四类关系：

- `dependency (dep)`：上游产物可以满足下游一部分前置条件。
- `compatibility (comp)`：上游输出类型与下游输入类型兼容。
- `redundancy (red)`：两个技能暴露等价接口。
- `alternative (alt)`：目标相同但操作实现不同，可用于失败回退。

依赖和兼容被刻意分开：存在逻辑依赖不代表类型一定匹配。Planner 只有在 `dep` 与 `comp` 同时满足时才允许直接转移，否则需要插入 adapter。

### 4. Task-Time Loop

任务时流程分为四步：

1. **Skill Matching**：结合 BM25 与语义相关度打分，并过滤前置条件不满足的技能。
2. **Dependency Stitching**：只沿同时满足依赖与兼容约束的边组合计划。
3. **Validator/Adapter Insertion**：非终端技能缺 validator 时补验证节点；类型不兼容时插入转换节点。
4. **Local Repair**：执行失败后，优先使用 `alt` 邻居替代，或让 `repair(s)` 结合错误轨迹修复；无法恢复的失败进入库时诊断缓冲区。

这里 adapter 不是任意补丁。只有其输出类型满足下游前置条件时才能进入图，从而恢复被破坏的类型约束。

### 5. Library-Time Loop 与五维健康度

每个技能在五个维度上评分：

- **Utility `U(s)`**：近期调用中成功使用该技能的比例。
- **Redundancy `R(s)`**：所属最大冗余簇的归一化规模。
- **Compatibility `C(s)`**：相关 dependency 边中同时满足 compatibility 的比例。
- **Failure Risk `F(s)`**：经验失败率。
- **Validation Gap `G(s)`**：是否缺少 validator 的指示量。

总体库健康度对 `U`、`1-R`、`C`、`1-F` 和 `1-G` 做均匀加权平均。这个分数把使用价值、clone 污染、接口一致性、运行可靠性和验证覆盖率放到统一诊断框架中。

### 6. 维护动作

- `merge(si, sj)`：合并冗余技能。
- `repair(s)`：使用执行反馈改写操作。
- `retire(s)`：移除陈旧或持续失败的技能及其关联边。
- `add_validator(s)`：为验证缺口补充验证器。
- `add_adapter(si, sj)`：增加类型转换节点。
- `instantiate(s, arg)`：任务时为参数化技能绑定具体参数。

当前实现主要依据 utility 日志、body hash 冲突、validator 缺失、失败日志和类型不匹配等可观测信号执行规则，因此库时几乎不需要额外 LLM 调用。

### 7. CGPD 风险传播

Contract Graph-Propagated Diagnosis 不只看单个技能的局部风险，还沿 dependency 边传播上游风险。其迭代形式为：

```text
R(t+1)(s) = (1 - α) · Rloc(s) + α · max R(t)(parent)
```

目的是让本身看似正常、但依赖高风险上游的技能提前得到 validator 或修复。不过论文消融显示 CGPD 对当前任务成功率贡献很小，因为 validator 字段尚未真正用于 plan-time 技能选择。

### 8. 插件接口

核心接口是：

```text
cleaned_lib = run_maintenance(raw_lib)
```

它被定义为纯 library transformation。下游 BM25、dense/hybrid retrieval、LLM Planner、图 Planner 或 self-repair Agent 只需把原始库替换为维护后的库，不必修改内部代码。

## 四、Evaluation

### 1. 数据与协议

- **任务**：ALFWorld 文本化家庭操作任务。
- **技能来源**：SkillsBench 的 229 个 curated `SKILL.md`。
- **技术债注入**：库规模超过真实技能数后，加入 redundant/stale clone、missing validator、missing artifact、wrong interface 和 over-specialized 等合成退化版本。
- **库规模**：200、250、500、750、1000、1250、1500、1750、2000。
- **评测任务**：每个 seed 185 个实例，seed 为 42、7、123。
- **指标**：高层动作序列严格匹配标注时计为 Task Success；同时给出 Wilson 95% 置信区间。
- **基础模型**：比较中的 LLM 基线统一使用 GPT-4o-mini；GoS/GraSP 风格基线是作者控制实现，不是官方复现。

### 2. 独立运行主结果

| 方法 | SR mean ± std | Wilson 95% CI |
| --- | ---: | ---: |
| ReAct | 12.8% ± 1.90pp | [10.3, 15.8] |
| SkillWeaver | 50.3% ± 1.43pp | [46.1, 54.4] |
| Hybrid Retrieval | 58.2% ± 0.83pp | [54.1, 62.2] |
| GoS Style | 61.1% ± 0.94pp | [57.0, 65.0] |
| LLM Skill Planner | 70.6% ± 0.31pp | [66.7, 74.3] |
| **SkillOps Full** | **79.5% ± 0.00pp** | **[75.9, 82.6]** |

![SkillOps 在 200-skill ALFWorld 设置下与基线的任务成功率](/assets/papers/agent-systems/skillops-table01-main-results.png)

*图 2：SkillOps 独立运行主结果。完整系统达到 79.5% SR，比最强的 LLM Skill Planner 高 8.9 个百分点；论文摘要写作 +8.8pp，正文表格按显示值相减为 8.9pp，应保留这一舍入差异。来源：论文 Table 1。*

该比较体现的是完整 SkillOps 作为 Agent/Planner 的效果，不应与“仅将维护后的库交给既有下游方法”的插件实验混为一谈。

### 3. Drop-in 插件效果

在 200-skill 设置中，只替换维护后的库而不改下游代码：

- Hybrid Retrieval：+2.90pp；
- BM25 Only：+1.00pp；
- Dense Only：+1.12pp；
- GoS Style：+0.80pp；
- LLM Skill Planner：+0.50pp；
- ReAct：+0.00pp；
- SkillWeaver：+2.46pp。

收益主要出现在检索依赖强的 Agent，因为清理库直接改善 top-k 候选；已有复杂 task-time 过滤或修复的系统可能收益较小，甚至与外部维护发生干扰。

### 4. Token 与维护开销

35 个“方法 × 规模”单元中，24 个 task-time token 减少、4 个近似不变、7 个增加。最大下降为 Dense Only 在 1000-skill 库上的 `-3.95%`；BM25 Only 在 500-skill 时反而 `+5.56%`，作者推测合并后的 canonical skill 描述更长。

规则维护阶段在所有规模下几乎不产生 LLM 调用；但这不等于没有计算成本，只是主要成本来自规则、图处理和日志分析，而非 token。

### 5. 规模敏感性

随着技能库从 200 扩展到 2000、合成退化密度从 15% 上升到 90%，SkillOps SR 仍约为 78.9%–80.5%。在 2000-skill 时领先下一基线 31.1pp。作者认为类型化过滤和库时清理阻止退化候选进入检索，同时更大的库也提供更多合法替代节点。

这个压力测试有价值，但其噪声是按预定义缺陷合成的，因此不能直接等价于真实长期 Agent 中自然形成的技能债。

### 6. 组件消融

- 移除 Task-Time Loop：SR 从 79.5% 降至 15.7%，说明匹配、类型拼接、validator/adapter 与局部修复是主要贡献。
- 移除 Library-Time Loop：降至 71.9%，证明持久维护有独立价值。
- 移除 External Graph：降至 64.6%；移除 Internal Contract Graph：降至 72.2%。
- 去掉 Repair：降至 55.9%。
- 去掉 CGPD：仅降至 79.0%，与论文承认的当前实现局限一致。

## 五、局限与开放问题

1. **结构化输入依赖**：系统要求契约字段，在部分设置还使用 gold PDDL 风格参数；真实技能库通常缺少这种标注。
2. **数据半合成**：基础技能真实，但大规模库通过人工规则生成退化版本，可能高估规则诊断的匹配度。
3. **基准单一**：主要在 ALFWorld 验证，缺少代码执行、浏览器/API 和真实长期日志。
4. **规则语义有限**：body hash 能发现近重复，却可能漏掉语义等价或复杂冲突。
5. **CGPD 没有形成有效闭环**：传播风险尚未充分影响计划选择，因此复杂度还没有转化为明显成功率提升。
6. **维护动作安全性**：merge、repair 和 retire 都可能误删能力或引入行为变化，需要版本化、回归测试和可回滚机制。
7. **方法条件性**：维护并非对所有 Agent 都有同样收益；与已有自修复逻辑重复时可能产生冲突。

## 六、个人思考与 Aprof/skillGraph 关联

### 1. 最值得直接迁移的结构

Aprof 的 skillGraph 可以把每个技能节点升级为类似契约：

```text
preconditions: 算子、shape、dtype、硬件、profile 瓶颈
operation: 代码变换或优化动作
artifacts: 新代码、编译产物、profile、性能数据
validator: 编译、数值正确性、性能显著性检查
failure_modes: 越界、精度损失、性能回退、不适用硬件
```

外部边可以使用 `depends-on`、`compatible-with`、`redundant-with`、`alternative-to`，再增加算子优化需要的 `conflicts-with`、`validated-on` 和 `generalizes-to`。

### 2. 与 skill-RL 的结合位置

SkillOps 当前库时维护是规则驱动；Aprof 可以把维护动作本身视为 policy：

- state：库健康、执行轨迹、硬件上下文和回归结果；
- action：merge、split、repair、retire、add-validator、调整适用条件；
- reward：后续任务成功、正确性、性能收益、检索成本和回归风险；
- gate：任何维护候选必须通过留出算子族与多硬件回归。

这比直接让 RL 改写任意 SKILL.md 更安全：动作空间受类型和维护操作约束，候选只有通过验证门控才进入正式库。

### 3. 对论文主张的保留意见

- 完整系统相对 LLM Planner 的 8.9pp 增益混合了 Task-Time Planner 和 Library-Time Maintenance；插件模式的纯维护增益通常只有 0–2.9pp。
- “近零成本”特指 LLM call/token，并不等于图构建、日志采集、validator 执行和回归测试免费。
- ALFWorld 严格动作序列匹配能提供可控评价，但真实工具任务可能有多条等价正确路径。

### 4. 阅读中的问题

- 如何从已有非结构化 `SKILL.md` 自动抽取 `(P,O,A,V,F)`，并估计抽取错误？
- 合并两个语义相似但边界略有不同的技能时，怎样保证不丢失适用范围？
- retire 的触发需要多长观察窗口，如何处理长期低频但关键的技能？
- 若 validator 自身错误，风险传播是否会放大错误判断？
- 如何用真实长期轨迹评估“维护后的未来收益”，而不是只验证当下任务？

### 5. 与其他工作的关系

- KernelSkill 关注任务内优化轨迹和跨任务专家技能；SkillOps 更关注库级契约、依赖和维护。
- SAGE 用 RL 学习生成/使用技能；SkillOps 不训练 policy，而是维护技能库结构。
- SkillOpt 把技能文档作为可训练状态并用验证集门控；SkillOps 提供了更明确的维护动作和库健康指标。
- GraSP/SkillTrace 强调可执行技能图和组合；SkillOps 进一步把验证缺口、冗余和持续维护纳入图生命周期。

## 七、结论

SkillOps 最重要的贡献是把技能库治理从“任务失败后的临时修补”提升为独立的库时问题，并用契约和双层图给出可检查、可维护的表示。它为 Aprof 的 skillGraph 提供了直接的工程骨架；但论文也表明，真正的库时维护增益比完整 Planner 增益更小且依赖下游方法。下一步需要在真实算子优化轨迹中验证维护动作，并用编译、正确性、性能和跨硬件回归为任何自动写回提供硬门控。

## 参考链接

- [Paper](https://arxiv.org/abs/2605.13716)
- [Code](https://github.com/Hik289/SkillOps)
