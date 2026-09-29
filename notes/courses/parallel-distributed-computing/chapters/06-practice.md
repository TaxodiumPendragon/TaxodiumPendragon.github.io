---
title: "并行计算课程实践"
description: "Tensor Core、Softmax 实验与远程开发环境记录。"
course: parallel-distributed-computing
category: chapters
order: 6
source_file: "PDC-note/05实践.md"
tags:
  - parallel-computing
  - gpu
sidebar:
  order: 6
prev:
  link: /courses/parallel-distributed-computing/chapters/05-operator-fusion/
  label: "卷积、非线性与算子融合"
next: false
---

## 4.15Tensors Core相关

### 环境

- ```ssh -p 10022 2300013210@222.29.136.226```登录服务器，密码也是学号
- 运行```nvidia-smi```查看CUDA版本信息，CUDA Version12.8,里面能看到四个H200
- 访问github用代理：```proxychains4 -q ssh 2300013210@222.29.136.226 -p 10022```。但是是linux系统用的东西，WSL也没配代理服务器

## Softmax 示例运行说明

本说明对应 `lab_day1/03_softmax_compare.py`：在昇腾 NPU 上对比手写 Triton Softmax 内核与 `torch_npu` 内置算子。

**文件系统说明**：本文档一般在**登录节点**上查看；登录节点与 `cntrain` 所连的训练节点挂载**同一套共享文件系统**（相同的 `$HOME`、`/data/home/...` 等）。因此在登录节点上准备好的 `lab_day1`、改过的 `~/.bashrc`、SSH 密钥与 `authorized_keys` 等，经 `cntrain` 连到训练机时仍是**同一路径、同一份文件**，训练机上的 sshd 会直接使用你在登录节点维护的 `authorized_keys`，一般不必在训练机上再拷一份。


## 首次配置：SSH 免密与 `~/.bashrc`

登录训练机前，建议先完成下面两项：**为 `cntrain` 配置 SSH 免密**（在已能登录的**登录节点**上维护 `~/.ssh` 即可，与训练节点共享，见下），以及 **在 `~/.bashrc` 中加载 `settings.sh`**（自动配置 CANN、conda 与 `cntrain`）。

### 为 `cntrain` 配置 SSH 免密登录

即使你暂时还无法通过 `cntrain` 登录训练机，只要你能登录本**登录节点**（本说明通常在此阅读），即可在下面完成配置：登录节点与 `cntrain` 目标机共享同一 `$HOME`，你在登录节点写入的 `~/.ssh/authorized_keys` 即为训练机 sshd 所读的那份，配置完成后 `cntrain` 即可用该密钥免密登录。

1. **生成密钥对**（一路回车可使用默认路径 `~/.ssh/id_ed25519`；也可按需设置口令短语）：

   ```bash
   ssh-keygen -t ed25519
   ```

2. **将公钥追加到登录节点上的 `authorized_keys`**：

   - 将 `~/.ssh/id_ed25519.pub` 内容**追加**到登录节点上的 `~/.ssh/authorized_keys`（若目录或文件不存在，需先 `mkdir -p ~/.ssh`，并将 `authorized_keys` 权限设为 `600`、`~/.ssh` 为 `700`）。无需事先能密码登录 `cntrain`；共享家目录下，训练机侧会自动认可同一公钥。

### `~/.bashrc`

在 `~/.bashrc` 末尾加入（或每��新开终端先执行一次）：

```bash
source /data/home/1106183127/pdc/settings.sh
```

`settings.sh` 会加载 CANN、conda 等环境，并提供 `cntrain` 命令。修改后请执行 `source ~/.bashrc` 或重新打开终端使配置生效。


## 获取实验目录

在**共享路径下**你希望存放实验的目录中执行（登录机与训练节点路径一致，任选一端操作即可）：

```bash
cp -r /data/home/1106183127/pdc/lab_day1 .
```

拷贝完成后，训练节点上进入**相同路径**下的 `lab_day1` 即可，无需再在远端重复 `cp`。


## 在训练节点上运行

1. **登录训练机**（会随机选择一台可用节点）：

   ```bash
   cntrain
   ```

2. **进入 conda 环境**：

   ```bash
   conda activate -p /data/home/1106183127/.conda/envs/pdc
   ```

   `pdc` 环境使用 `python=3.11` 创建；若需自行复现或对照，主要依赖可通过 `pip install torch_npu triton-ascend numpy pybind11 pyyaml` 安装（版本需与当前 CANN / 驱动匹配）。

3. **进入实验目录并运行示例**：

   ```bash
   cd lab_day1
   python 03_softmax_compare.py
   ```

CANN 已通过 `settings.sh` 中的 `set_env.sh` 加载。

## Triton Optimization Pass Lab

本 lab 用两个 Triton kernel 观察 Triton 3.x 的编译优化流程：

- 主线 kernel：blocked GEMM，负责牵引 TTIR、TTGIR、data layout、software pipelining、tensor core lowering。
- 对照 kernel：row-wise fused softmax，负责观察 TTIR 层的融合表达、mask、reduce 和 elementwise 优化。

实验目标不是写最快的 GEMM，而是让学生能把一段 Triton Python 代码和编译器中间表示对应起来，理解哪些优化发生在 TTIR，哪些发生在 TTGIR，哪些已经是 NVIDIA 后端和 LLVM/PTX 相关的优化。

## 1. 环境准备

下面所有命令都假设已经进入 lab 目录：

```bash
cd labs/triton-opt
```

推荐环境：

- NVIDIA CUDA GPU，驱动需要能支持 CUDA 12.x
- Python 3.10 或 3.11
- PyTorch CUDA build，`torch.version.cuda` 必须不是 `None`
- Triton 3.x

推荐新建 conda 环境，避免 base 里已有 CPU-only PyTorch 干扰：

```bash
conda create -n triton-opt -y python=3.10
conda activate triton-opt
cd labs/triton-opt
python -m pip install -r requirements.txt
```

`requirements.txt` 默认使用 PyTorch CUDA 12.4 wheel 源作为额外索引，并要求 `torch>=2.5`、`triton>=3.0,<4`。如果机器上已经有可用 CUDA 版 PyTorch，也可以直接复用该环境，但必须先通过下面的检查。

环境检查：

```bash
python -c "import torch, triton; print(torch.__version__, torch.version.cuda, torch.cuda.is_available()); print(torch.cuda.get_device_name(0)); print(triton.__version__)"
```

预期输出中：

- `torch.version.cuda` 不是 `None`
- `torch.cuda.is_available()` 是 `True`
- 能打印出 NVIDIA GPU 名称
- Triton 版本是 3.x

如果 `nvidia-smi` 正常但 `torch.version.cuda` 是 `None`，说明当前 Python 环境安装的是 CPU-only PyTorch，需要换环境或重新安装 CUDA 版 PyTorch。

检查脚本参数：

```bash
python run_lab.py --help
```

如果机器没有 CUDA GPU，`--help` 仍然可用，但完整 IR artifact 需要实际触发 Triton JIT 编译。

## 2. 运行实验

运行全部例子：

```bash
python run_lab.py --kernel all

(triton-opt) 2300013210@fbe24cadb207:~/triton-opt$ python run_lab.py --kernel all
Device: NVIDIA H200 NVL
Triton: 3.6.0
For pass-by-pass traces, rerun with MLIR_ENABLE_DUMP=1 and/or LLVM_IR_ENABLE_DUMP=1. The lab already sets TRITON_CACHE_DIR inside the artifact directory so cache state is easy to inspect or remove.
matmul: artifacts=/home/2300013210/triton-opt/artifacts/matmul, max_abs_err=0.000106812
softmax: artifacts=/home/2300013210/triton-opt/artifacts/softmax, max_abs_err=5.58794e-09
```

分别运行：

```bash
python run_lab.py --kernel matmul
python run_lab.py --kernel softmax
```

```bash
Device: NVIDIA H200 NVL
Triton: 3.6.0
For pass-by-pass traces, rerun with MLIR_ENABLE_DUMP=1 and/or LLVM_IR_ENABLE_DUMP=1. The lab already sets TRITON_CACHE_DIR inside the artifact directory so cache state is easy to inspect or remove.
matmul: artifacts=/home/2300013210/triton-opt/artifacts/matmul, max_abs_err=0.000106812

Device: NVIDIA H200 NVL
Triton: 3.6.0
For pass-by-pass traces, rerun with MLIR_ENABLE_DUMP=1 and/or LLVM_IR_ENABLE_DUMP=1. The lab already sets TRITON_CACHE_DIR inside the artifact directory so cache state is easy to inspect or remove.
softmax: artifacts=/home/2300013210/triton-opt/artifacts/softmax, max_abs_err=5.58794e-09
```

可选 benchmark：

```bash
python run_lab.py --kernel matmul --benchmark

For pass-by-pass traces, rerun with MLIR_ENABLE_DUMP=1 and/or LLVM_IR_ENABLE_DUMP=1. The lab already sets TRITON_CACHE_DIR inside the artifact directory so cache state is easy to inspect or remove.
matmul: artifacts=/home/2300013210/triton-opt/artifacts/matmul, max_abs_err=0.000106812, benchmark=0.011 ms
```

默认输出目录：

```text
artifacts/
  matmul/
    00_ttir.mlir
    01_ttgir.mlir
    02_llir.ll
    03_ptx.ptx
    run.json
  softmax/
    00_ttir.mlir
    01_ttgir.mlir
    02_llir.ll
    03_ptx.ptx
    run.json
```

脚本会把 `TRITON_CACHE_DIR` 设到 artifact 目录下的 `.triton-cache`，并在默认情况下清理该局部 cache，避免二次运行命中缓存后看不到重新编译。

生成课件 PDF：

```bash
typst compile slides.typ slides.pdf
```

## 3. 编译流程地图

```mermaid
flowchart LR
  PythonKernel[Python Triton Kernel] --> TTIR[TTIR]
  TTIR --> TTIRPasses[Canonicalize CSE LICM Fusion]
  TTIRPasses --> TTGIR[TTGIR With Layout]
  TTGIR --> LayoutPasses[Layout Propagation Dot Operand Optimization]
  LayoutPasses --> PipelinePasses[Software Pipelining Prefetch]
  PipelinePasses --> LLIR[LLVM IR Or LLIR]
  LLIR --> PTX[PTX With MMA Or WGMMA]
```

粗略理解：

- TTIR 是接近 Triton 语言语义的 MLIR dialect，保留 `tt.load`、`tt.store`、`tt.dot`、`tt.exp`、`tt.reduce` 等高层 tensor 操作。
- TTGIR 在 TTIR 上加入 GPU 分布式执行和 layout encoding，比如 blocked layout、dot operand layout、MMA accumulator layout、shared memory layout。
- LLVM IR/LLIR 和 PTX 已经更接近硬件，适合观察 load/store lowering、barrier、shared memory、`mma.sync` 或 `wgmma`。

## 4. 从 TTIR 开始读

先看 softmax 的 `00_ttir.mlir`。它通常比 GEMM 更短，适合回答三个问题：

1. 一个 program 对应 softmax 的哪一行？
2. mask 如何保证越界列不参与计算？
3. `load -> max -> exp -> sum -> div -> store` 为什么可以在一个 kernel 内完成？

再看 matmul 的 `00_ttir.mlir`：

- 找 `tt.program_id`：它决定当前 program 负责哪个 C tile。
- 找 `tt.load`：A/B tile 的指针计算和 mask 会被显式表示。
- 找 `tt.dot`：这是后续 tensor core lowering 的高层锚点。
- 找 `scf.for` 或展开后的循环：K 维分块累加会在这里体现。

TTIR 层常见的是 canonicalization、CSE、LICM、symbol DCE、loop simplification 这类通用优化。学生不一定能在最终 `00_ttir.mlir` 中看到每一个 pass 的前后差异，但可以从表达式被简化、重复计算被合并、循环不变量被外提等现象理解这些 pass 的作用。

## 5. TTGIR 和 Data Layout

打开 matmul 的 `01_ttgir.mlir`，重点找类型里的 `#ttg.*` encoding。layout 是 TTGIR 最关键的变化：它不只是“张量形状”，还描述了元素如何分布到 CTA、warp、thread、register 或 shared memory。

建议学生重点观察：

- `#ttg.blocked`：通用 blocked layout，常见于 load/store 和 elementwise 操作。
- `#ttg.dot_op` 或 dot operand encoding：为 `tt.dot` 的输入准备的 layout。
- `#ttg.nvidia_mma`：NVIDIA MMA accumulator 或 tensor core 相关 layout。
- `ttg.convert_layout`：layout 之间转换的显式操作。

为什么 `convert_layout` 重要？因为 layout conversion 往往意味着 warp shuffle、shared memory 中转或额外寄存器移动。TTGIR 的 layout propagation、remove layout conversions、rematerialization 等 pass 会尽量把值改写到更合适的 layout 中，减少不必要的数据搬运。

课堂上可以用这个判断标准：

- Load/store 更偏好适合内存合并访问的 layout。
- Dot 更偏好 tensor core 友好的 operand 和 accumulator layout。
- Elementwise 操作通常可以跟随输入 layout，被复制或重算比做昂贵 conversion 更划算。

## 6. Dot Operand Optimization

GEMM 的核心是 `tl.dot(a, b)`。在 TTGIR 优化阶段，Triton 会围绕这个锚点做硬件相关变换：

- `AccelerateMatmul`：把高层 dot 转成适合 MMA 的 layout 和 op。
- `OptimizeDotOperands`：优化 dot operand 的 shared memory 布局、swizzle、transpose fusion、reshape 等。
- NVIDIA 后端 lowering：根据 compute capability 选择 MMAv2、MMAv3/WGMMA 或更高版本路径。

阅读 IR 时可以让学生找：

- operand 是否先变成 dot operand layout；
- 是否出现 shared memory allocation / local load；
- transpose 或 reshape 是否被搬到 memory descriptor 层；
- PTX 中是否出现 `mma.sync`，或在 Hopper 上出现 `wgmma` 相关指令。

底层概念可提炼成一句话：dot operand optimization 的目标是让数据以 tensor core 想要的方式进入硬件指令，同时减少 shared memory bank conflict 和寄存器侧转置开销。

## 7. Software Pipelining

GEMM 的 K 维循环天然适合讲 software pipelining：当前 iteration 做 dot，同时提前加载后续 iteration 的 A/B tile，从而隐藏 global memory 或 shared memory 访问延迟。

本 lab 中可以修改：

```bash
python run_lab.py --kernel matmul --num-stages 1
python run_lab.py --kernel matmul --num-stages 3
python run_lab.py --kernel matmul --num-stages 5
```

建议学生比较 `01_ttgir.mlir` 和 `02_llir.ll`：

- prologue：主循环前预取最初的若干 stage；
- kernel：稳定状态，多 stage 的 load 和 compute 交错；
- epilogue：主循环后收尾最后几个 stage；
- loop arguments：跨 stage 的值会变成循环携带变量；
- barrier / wait：异步 copy 或 WGMMA 路径需要等待和同步。

直观模型：

```text
without pipeline:
  load A/B for k0 -> dot k0 -> load A/B for k1 -> dot k1

with pipeline:
  preload k0, k1
  dot k0 while loading k2
  dot k1 while loading k3
```

## 8. Tensor Core Lowering

从 `tl.dot` 到硬件指令的链路：

```text
tl.dot
  -> TTIR tt.dot
  -> TTGIR dot with MMA-friendly encodings
  -> NVIDIA-specific MMA lowering
  -> LLVM IR / NVVM intrinsics
  -> PTX mma.sync / wgmma.mma_async
```

不同 GPU 上看到的结果会不同：

- Ampere / Ada 常见 `mma.sync.*`。
- Hopper 可能出现 `wgmma.mma_async.*` 和更多 async/wait/barrier 相关结构。
- Blackwell 相关路径会有更多 TMEM / TCGen5 概念，本 lab 不作为必讲重点。

如果 PTX 中没有看到预期指令，先确认输入 dtype、block size、compute capability 和 Triton 版本。小尺寸或不合适的 dtype 可能走非 tensor-core 路径。

## 9. Pass-by-pass Trace

脚本导出的是每个大阶段的稳定 artifact。若要观察更细的 pass trace，可以使用环境变量：

```bash
MLIR_ENABLE_DUMP=1 python run_lab.py --kernel matmul
LLVM_IR_ENABLE_DUMP=1 python run_lab.py --kernel matmul
```

也可以指定 kernel 名称：

```bash
MLIR_ENABLE_DUMP=matmul_kernel python run_lab.py --kernel matmul
```

注意：Triton JIT cache 会影响 dump。如果你手动改变了 cache 设置，必要时清理 `~/.triton/cache` 或使用本 lab 默认的局部 cache。

## 10. 学生任务

建议任务按难度递进：

1. 改 `--block-m`、`--block-n`、`--block-k`，观察 `tt.dot` 的 tile shape 和 TTGIR layout 变化。
2. 改 `--num-warps`，观察 warp 分布、MMA layout 和寄存器压力线索。
3. 改 `--num-stages`，观察 software pipeline 结构和 benchmark 变化。
4. 对比 matmul 和 softmax：为什么 softmax 很适合讲 fusion，但不适合讲 tensor core？
5. 在 PTX 中搜索 `mma`、`wgmma`、`ldmatrix`、`barrier`、`wait`，解释它们分别对应高层代码里的哪一类操作。

完成后，学生应能解释：Triton 的性能不是只来自 Python 层表达力，而是来自 TTGIR layout、dot operand preparation、software pipelining 和后端硬件 lowering 的组合。
