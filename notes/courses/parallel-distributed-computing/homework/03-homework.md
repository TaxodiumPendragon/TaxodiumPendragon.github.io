---
title: "课程作业 3：编译与算子优化"
description: "Graph Break、Triton 算术强度与 Inductor 优化。"
course: parallel-distributed-computing
category: homework
order: 3
source_file: "PDC-note/作业3.md"
tags:
  - parallel-computing
  - gpu
sidebar:
  order: 3
prev:
  link: /courses/parallel-distributed-computing/homework/02-homework/
  label: "课程作业 2：Attention 与 GPU"
next:
  link: /courses/parallel-distributed-computing/homework/04-homework/
  label: "课程作业 4：分布式训练"
---

## 题⽬ 1：Graph Break 概念（判断题）

在 `torch.compile`（基于 TorchDynamo）的追踪过程中，**Graph Break** 是指编译器无法将某段代码（如非纯 Tensor 操作、Python 原生控制流、外部库调用等）纳入计算图时，被迫中断当前子图编译、回退到 Python 解释器执行的现象[reference:0]。以下对各代码片段逐一判断：

1. **`x * 2`**  
   不会产生 Graph Break。  
   理由：`x * 2` 是纯 Tensor 的逐元素乘法操作，属于 PyTorch 原生可追踪的张量运算，Dynamo 可以完整捕获并将其纳入 FX Graph 中。

2. **`x.numpy()`**  
   会产生 Graph Break。  
   理由：`x.numpy()` 将 PyTorch Tensor 转换为 NumPy ndarray，跨越了 PyTorch 的计算图边界。NumPy 数组不携带自动微分历史，Dynamo 默认情况下无法追踪通过该转换后的操作[reference:1]。只有当手动开启 `torch._dynamo.config.trace_numpy = True` 时才可能避免中断[reference:2]。

3. **`if x.sum() > 0:`**  
   会产生 Graph Break。  
   理由：该条件分支依赖于 Tensor 的运行时计算值（`x.sum()` 的结果为标量），属于**数据依赖型控制流**。Dynamo 目前不支持对动态控制流进行完整追踪，遇到此类以 Python 原生分支语句（`if`、`while` 等）形式出现的动态分支时，会触发 Graph Break。

4. **`print(x)`**  
   会产生 Graph Break。  
   理由：`print` 是 Python 内置的标准输出函数，不属于任何 PyTorch Tensor 操作。当 Dynamo 在处理计算图的过程中遇到非张量运算的外部函数调用时，无法将其以原生操作的形式纳入图中，从而被迫中断追踪[reference:4]。

5. **`x.reshape(-1)`**  
   不会产生 Graph Break。  
   理由：`reshape(-1)` 是 PyTorch Tensor 的原生形状变换操作，属于纯张量操作，Dynamo 可以完整捕获并纳入计算图。该操作不涉及数据类型转换、外部库调用或动态控制流，因此不会引起 Graph Break。

## 题⽬ 2：Triton Tile 算术强度（计算题）

### 已知条件
- **GPU Roofline 参数**：峰值算力 312 TFLOPS / 峰值带宽 2 TB/s → 平衡点算术强度 `I_balance = 312 / 2 = 156 Flops/Byte`
- **矩阵乘法**：`A(1024×512) × B(512×1024)`，输出 `C(1024×1024)`
- **Tile 尺寸**：`tile = 64×64`，即每个 tile 从输出矩阵 C 中覆盖一个 `64×64` 的子块，计算该子块所需的输入数据来自 A 的 64 行 × K 列和 B 的 K 行 × 64 列

### 每个 Tile 的 Flops（计算量）
对于输出矩阵中的一个 `64×64` tile，每个输出元素需要 K 次乘法和 K 次加法（即一次融合乘加 FMA = 2 次浮点运算）。  
因此：
\[
\text{FLOPs}_{\text{tile}} = 2 \times (64 \times 64) \times K
\]
其中 `K = 512`，代入得：
\[
\text{FLOPs}_{\text{tile}} = 2 \times 4096 \times 512 = 2 \times 2{,}097{,}152 = 4{,}194{,}304 \ \text{FLOPs}
\]

### 每个 Tile 的 Bytes 访问量（访存量）
计算一个 `64×64` tile 需要：
- 从矩阵 A 加载 `64 × K` 个元素（A 中与 tile 对应的 64 行 × 512 列）
- 从矩阵 B 加载 `K × 64` 个元素（B 中与 tile 对应的 512 行 × 64 列）
- 将计算结果写回 C 中的 `64×64` 个输出元素

此处假设数据类型为 FP32（单精度浮点，每元素 4 字节）[reference:5]。  
访存量（仅考虑全局内存访问，忽略片上缓存重用）：
\[
\text{Bytes}_{\text{tile}} = (64 \times K + K \times 64 + 64 \times 64) \times 4
\]
\[
= (64 \times 512 + 512 \times 64 + 4096) \times 4
\]
\[
= (32768 + 32768 + 4096) \times 4
\]
\[
= 69632 \times 4 = 278{,}528 \ \text{Bytes}
\]

### 算术强度对比
\[
I_{\text{tile}} = \frac{\text{FLOPs}_{\text{tile}}}{\text{Bytes}_{\text{tile}}} = \frac{4{,}194{,}304}{278{,}528} \approx 15.06 \ \text{Flops/Byte}
\]
该值（≈15.06）**远低于**平衡点（156 Flops/Byte），因此该 tile 的计算处于**访存受限（Memory‑Bound）**区域，性能瓶颈在于 GPU 内存带宽而非计算能力。

### 对 Tile Size 选择的启发
1. **增大 Tile 尺寸以提高算术强度**：  
   在固定矩阵维度下，增大 tile 尺寸（如从 64×64 增至 128×128 或 256×256）可使算术强度向平衡点靠近，从而缓解访存瓶颈。这是因为计算量（∝ `Mtile × Ntile × K`）以平方级增长，而访存开销（∝ `Mtile × K + Ntile × K + Mtile × Ntile`）以线性增长为主[reference:6]。

2. **Tile 尺寸受片上内存（共享内存）容量限制**：  
   tile 的输入子块（`Mtile×K` 和 `K×Ntile`）需加载至 GPU 的共享内存中，tile 过大会超出共享内存容量或降低线程块并行度。

3. **面向 Roofline 模型的优化策略**：  
   - 若算术强度 **小于** 平衡点 → **访存瓶颈** → 优先优化数据复用、增大 tile、减少全局内存访问次数[reference:7]。  
   - 若算术强度 **大于** 平衡点 → **计算瓶颈** → 可适度减小 tile 以提高并行度，或使用更高效的指令（如 Tensor Core）。

当前 64×64 tile 算术强度仅为平衡点的约 1/10，说明矩阵乘法在该配置下严重受限于访存。在实际调优中，建议尝试更大的 tile（如 128×128 或 256×256），在共享内存容量允许的前提下将算术强度推向计算受限区，以充分利用 GPU 的 312 TFLOPS 算力。

---

## 题⽬ 3：Inductor 优化（计算题）

### 已知条件
- **矩阵 A**：尺寸 `m×k = 4×1000`
- **矩阵 B**：尺寸 `k×n = 1000×4`
- **向量 v**：尺寸 `n×1 = 4×1`
- 数据类型为 FP32，矩阵乘法均以标准 GEMM 定义：`C = A @ B` 中每个输出元素需 **2** 次浮点运算（一次乘法 + 一次加法）[reference:8]

### 优化前：`(A @ B) @ v`
1. **第一步**：`S = A @ B`，其中 A(4×1000) × B(1000×4) → S(4×4)  
   \[
   \text{FLOPs}_{S} = 2 \times m \times n \times k = 2 \times 4 \times 4 \times 1000 = 32{,}000
   \]

2. **第二步**：`T = S @ v`，其中 S(4×4) × v(4×1) → T(4×1)  
   矩阵‑向量乘法的 FLOPs 计算方式与矩阵‑矩阵乘法一致：每个输出元素（4 个）需要 2 × k 次运算，其中 k = 4。  
   \[
   \text{FLOPs}_{T} = 2 \times m \times 1 \times n = 2 \times 4 \times 1 \times 4 = 32
   \]

优化前总 FLOPs：
\[
\text{FLOPs}_{\text{before}} = 32{,}000 + 32 = 32{,}032
\]

### 优化后：`A @ (B @ v)`
1. **第一步**：`U = B @ v`，其中 B(1000×4) × v(4×1) → U(1000×1)  
   \[
   \text{FLOPs}_{U} = 2 \times k \times 1 \times n = 2 \times 1000 \times 1 \times 4 = 8{,}000
   \]

2. **第二步**：`V = A @ U`，其中 A(4×1000) × U(1000×1) → V(4×1)  
   \[
   \text{FLOPs}_{V} = 2 \times m \times 1 \times k = 2 \times 4 \times 1 \times 1000 = 8{,}000
   \]

优化后总 FLOPs：
\[
\text{FLOPs}_{\text{after}} = 8{,}000 + 8{,}000 = 16{,}000
\]

### 结果对比
| 计算顺序                | 中间结果维度       | 总 FLOPs  |
|------------------------|------------------|-----------|
| `(A @ B) @ v`（优化前） | S(4×4)           | 32,032    |
| `A @ (B @ v)`（优化后） | U(1000×1)        | 16,000    |

优化后 FLOPs 约为优化前的 **50%**。Inductor 通过自动识别并应用矩阵乘法的结合律，将先计算小维度中间结果（`B @ v`，维度 1000×1）的策略优先于先计算大维度中间结果（`A @ B`，维度 4×4）的策略，显著降低了总浮点运算次数。这种优化在序列中维度差异悬殊（m, n 较小而 k 较大）时尤为有效，也是 PyTorch 编译器自动执行代数简化的重要案例。
