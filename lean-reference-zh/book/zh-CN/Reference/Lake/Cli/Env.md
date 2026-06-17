# `lake env`

> 对应英文：[Lake command: lake env](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#lake-env)，抓取日期：2026-06-16。

`lake env` 的作用是：在 Lake 计算出的构建环境中运行某个命令；若不给命令，则直接把该环境打印出来。

## 两种模式

### 1. 打印环境

```bash
lake env
```

Lake 会输出它为工具运行准备的环境变量。这个输出和平台有关。

### 2. 在 Lake 环境中运行命令

```bash
lake env cmd arg1 arg2 ...
```

此时 `cmd` 会在 Lake 的环境里执行，继承：

- 正确的 `LEAN_PATH`
- `LEAN_SRC_PATH`
- `PATH`
- `LEAN_SYSROOT`
- `LAKE_HOME`
- 以及其它和当前 workspace / toolchain 对齐的环境变量

## 为什么它重要

很多“本地 shell 跑不通，但编辑器/构建里能跑”的问题，本质上就是环境不同。

`lake env` 适合：

- 调试某命令在 Lean/Lake 语境下看到的环境；
- 让外部工具在 Lake 配置好的路径里执行；
- 复现编辑器或 CI 中的构建环境。

## 与 `lake lean` / `lake exe` 的区别

- `lake env`：泛化的“在该环境里跑命令”。
- `lake lean`：专门在该环境里运行 Lean，并先处理 import 构建。
- `lake exe`：专门构建并运行某 executable target。

## 使用建议

- 调试环境问题时，先试 `lake env`；
- 若只是想运行外部命令并确保它看到正确 Lean 工具链，`lake env cmd` 往往最直接。