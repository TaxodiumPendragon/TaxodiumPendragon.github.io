---
title: "课程作业 5：集合通信"
description: "Ring All-Reduce、DDP 与通信优化。"
course: parallel-distributed-computing
category: homework
order: 5
source_file: "PDC-note/作业5.md"
tags:
  - parallel-computing
  - gpu
sidebar:
  order: 5
prev:
  link: /courses/parallel-distributed-computing/homework/04-homework/
  label: "课程作业 4：分布式训练"
next: false
---

## (1) 判断下列说法是否正确

| # | 说法 | 正确/错误 | 理由 |
|---|------|----------|------|
| a | All-Reduce 完成后，所有参与节点持有相同的归约结果 | 正确 | 所有节点得到完全相同的全局归约值。 |
| b | Reduce-Scatter 完成后，每个节点持有完整的归约结果 | 错误 | Reduce-Scatter 后每个节点仅持有归约结果的 \(1/N\) 分片。 |
| c | All-Gather 完成后，每个节点持有所有节点数据的拼接 | 正确 | 每个节点收集所有其他节点的数据块，形成完整拼接。 |
| d | All-Reduce 等价于先执行 Reduce-Scatter，再执行 All-Gather | 正确 | 先分片归约再收集，等价于全局归约。 |

## (2) 通信原语选择

| # | 场景 | 原语 | 原因 |
|---|------|------|------|
| a | DDP 训练中，各 GPU 计算出本地梯度后，需要让所有 GPU 得到平均梯度 | All-Reduce | 对所有梯度求和（或平均）后广播给每个 GPU。 |
| b | ZeRO-3 前向传播前，每块 GPU 需要从其他 GPU 收集完整的参数 | All-Gather | 每块 GPU 持有参数分片，通过 All-Gather 拼接成完整参数。 |
| c | ZeRO-2 反向传播中，将各 GPU 的梯度汇总，每块 GPU 只需保留负责的那一份 | Reduce-Scatter | 归约各 GPU 的梯度，并将结果按分片分散到不同 GPU。 |
| d | 训练开始时，rank 0 将初始化好的模型权重分发给所有其他 GPU | Broadcast | 单一源节点向所有其他节点发送相同数据。 |

---

## 题目 2：Ring All-Reduce 通信分析

## 1. 每个节点的发送量

- **Reduce-Scatter 阶段**：每个节点共发送 \(\displaystyle (N-1) \cdot \frac{M}{N}\) 字节。  
- **All-Gather 阶段**：每个节点共发送 \(\displaystyle (N-1) \cdot \frac{M}{N}\) 字节。  
- **全程总发送量**（每个节点）：\(\displaystyle 2(N-1)\frac{M}{N}\) 字节。

## 2. 带宽充足时的总耗时及扩展性

忽略延迟 (\(\alpha \approx 0\))，总耗时  
\[
T = 2(N-1) \cdot \frac{M}{N} \cdot \beta
\]  
当 \(N\) 很大时，\(T \approx 2M\beta\)，**趋于常数**。  
说明 Ring All-Reduce 的通信时间不随节点数线性增长，具有良好的可扩展性。

## 3. 具体数值计算

- \(N = 8\)，\(M = 2\Psi = 2 \times 7 \text{B} = 14 \text{ GB}\)  
- 带宽 \(200 \text{ GB/s}\) → \(\beta = 1/200 \ \text{s/GB}\)  
- 总耗时  
\[
T = 2 \times (8-1) \times \frac{14}{8} \times \frac{1}{200}
= 14 \times 1.75 \times \frac{1}{200}
= \frac{24.5}{200} = 0.1225 \ \text{秒}
\]

---

## 题目 3：DDP 中的通信优化

## (1) 梯度打包成 bucket 的好处与缺点

- **好处**：  
  减少 All-Reduce 的调用次数，降低通信启动开销（kernel launch latency），同时能合并小消息，提高网络带宽利用率。

- **潜在缺点**：  
  需要等待 bucket 填满才能触发通信，可能造成部分梯度的通信延迟，略微增加内存占用（缓存梯度）。

## (2) All-Reduce 与反向传播重叠的条件

反向传播按层从后向前计算梯度。当某一层的梯度计算完成后，该层所属的 bucket 即可立即启动 All-Reduce 通信，而反向传播继续计算更浅层的梯度。由于通信是异步的且不阻塞计算，两者可以自然重叠，因此通信不在反向传播的关键路径上。

## (3) DDP 与 ZeRO-3 (FSPD) 的通信对比

| 并行策略 | 每个 step 的通信原语 | 通信次数与阶段 |
|----------|---------------------|----------------|
| DDP | All-Reduce（每个 bucket 一次） | 每个 step 中所有 bucket 的 All-Reduce 触发一次，集中在反向传播中。 |
| ZeRO-3 | All-Gather（前向）+ Reduce-Scatter（反向） | **额外通信**：前向每一层需 All-Gather 收集完整参数；反向每一层计算完梯度后需 Reduce-Scatter 归约并分片梯度。此外，参数更新后无全局同步。 |

ZeRO-3 的额外通信发生在**每个 layer 的前向传播之前**（All-Gather）和**每个 layer 的反向传播之后**（Reduce-Scatter），因此通信次数远多于 DDP（与层数成正比）。
