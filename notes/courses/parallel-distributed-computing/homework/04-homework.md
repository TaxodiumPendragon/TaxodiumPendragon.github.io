---
title: "课程作业 4：分布式训练"
description: "ZeRO、流水线并行和 3D 并行分析。"
course: parallel-distributed-computing
category: homework
order: 4
source_file: "PDC-note/作业4.md"
tags:
  - parallel-computing
  - gpu
sidebar:
  order: 4
prev:
  link: /courses/parallel-distributed-computing/homework/03-homework/
  label: "课程作业 3：编译与算子优化"
next:
  link: /courses/parallel-distributed-computing/homework/05-homework/
  label: "课程作业 5：集合通信"
---

## (1) 判断下列说法是否正确，并用一句话说明理由

| # | 说法 | 正确/错误 | 理由 |
|---|------|----------|------|
| a | 数据并行（DDP）中，每块 GPU 存储完整的模型权重副本 | 正确 | DDP 每个进程独立持有完整模型副本，通过梯度 All‑Reduce 保持参数一致。 |
| b | 流水线并行（TP）中，相邻 stage 之间通过 All‑Reduce 传递梯度 | 错误 | 流水线并行相邻 stage 之间通过 Send/Recv 传递激活值和梯度，而非 All‑Reduce。 |
| c | 张量并行（TP）中，单层的矩阵运算被切分到多块 GPU 上并行计算 | 正确 | TP 将单层参数切分到多 GPU，分别计算子矩阵后再聚合结果。 |
| d | ZeRO‑3 中，每块 GPU 只存储全部参数的 \(\frac{1}{N_d}\) | 正确 | ZeRO‑3 将参数、梯度和优化器状态全部分片到各 GPU，每卡仅存 1/N_d 的完整参数。 |

## (2) 将下列通信原语与其对应的使用场景匹配

| 通信原语 | 使用场景 |
|----------|----------|
| All‑Reduce | B. DDP 中同步各 GPU 的梯度 |
| All‑Gather | A. ZeRO‑3 前向传播前，从其他 GPU 收集完整参数 |
| Reduce‑Scatter | C. ZeRO‑1/2 中将梯度分发给对应的参数负责 GPU |
| Send / Recv | D. 流水线并行中相邻 stage 传递激活值（注：原选项写“TP 中相邻 stage”，应为 PP） |

---

## 题目 2：ZeRO 内存开销计算

**参数设定**：  
\(\Psi = 7 \times 10^9\)，\(N_d = 64\)，\(K = 12\) 字节。  
混合精度：模型参数（FP16）占 2 字节，梯度（FP16）占 2 字节。

## 1. Baseline DDP 显存计算

公式：\((2 + 2 + K) \times \Psi = (2+2+12) \times 7\mathrm{e}9 = 16 \times 7\mathrm{e}9 = 112\mathrm{e}9\) 字节 = **112 GB**

- 模型参数（FP16）：\(2\Psi = 14\) GB  
- 梯度（FP16）：\(2\Psi = 14\) GB  
- 优化器状态（FP32 主权重 + momentum + variance）：\(12\Psi = 84\) GB  
- 合计：\(14+14+84 = 112\) GB

## 2. ZeRO 各策略每 GPU 显存占用

| 策略 | 每 GPU 内存公式 | 计算结果 (GB) |
|------|----------------|---------------|
| Baseline DDP | \((2+2+K)\Psi\) | \(16 \times 7 = 112\) GB |
| ZeRO‑1 | \(2\Psi + 2\Psi + \frac{K\Psi}{N_d}\) | \(4\Psi + \frac{12\Psi}{64} = (4 + 0.1875) \times 7 = 29.3125\) GB |
| ZeRO‑2 | \(2\Psi + \frac{(2+K)\Psi}{N_d}\) | \(2\Psi + \frac{14\Psi}{64} = (2 + 0.21875) \times 7 = 15.53125\) GB |
| ZeRO‑3 | \(\frac{(2+2+K)\Psi}{N_d}\) | \(\frac{16\Psi}{64} = 0.25 \times 7 = 1.75\) GB |

## 3. ZeRO‑1 通信量分析

- Baseline DDP 每步通信量（All‑Reduce）：\(2 \times 2\Psi = 4\Psi\) 字节。  
- ZeRO‑1 采用 **Reduce‑Scatter**（对梯度分片求和） + **All‑Gather**（收集更新后的参数分片）。  
  - 每个 GPU 发送的梯度量：\(\frac{2\Psi}{N_d}\)（其负责的分片大小）  
  - Reduce‑Scatter 总通信量 ≈ \(2\Psi\)（所有 GPU 发送和接收的总和）  
  - All‑Gather 总通信量 ≈ \(2\Psi\)  
  - **合计**：\(4\Psi\) 字节，与 Baseline 相同。  

**结论**：ZeRO‑1 的总通信量与 Baseline DDP 相同，均为 \(4\Psi\) 字节。

---

## 题目 3：流水线并行与 3D 并行分析

## (1) 1F1B 调度相比 GPipe 在峰值显存上的改进

1F1B 调度**大幅降低峰值显存**。  
**原因**：GPipe 必须等所有 micro‑batch 完成前向后才开始反向，需同时保存全部激活值；而 1F1B 交错执行前向和反向，尽早释放不再需要的激活，因此峰值显存更低。

## (2) 3D 并行中各通信组及 PP 邻居

- **总 GPU 数**：\(DP \times PP \times TP = 4 \times 4 \times 2 = 32\)  
- **TP 通信组**：包含 **2** 块 GPU（同一层内参数切分）  
- **DP 通信组**：包含 **4** 块 GPU（数据并行副本）  
- **PP 中直接通信的 GPU**：  
  - 上游 stage（前一个 stage）  
  - 下游 stage（后一个 stage）  
  - 对于某块 GPU，其所在 PP 流水线中有唯一的前驱和后继（首尾 stage 只有下游或上游）。

## (3) 为何 TP 限制在节点内，而 PP/DP 走跨节点网络？

- **TP 需要极高带宽和极低延迟**（频繁的全规约/全收集操作），节点内 NVLink 可满足；跨节点网络（如 InfiniBand）延迟和带宽相对不足。  
- **PP 和 DP 通信粒度较粗**（每层或每步一次），对带宽和延迟要求低于 TP。  
- **若将 TP 改为跨节点**，会引入巨大的通信开销，导致张量并行的加速比严重下降，甚至出现负优化。
