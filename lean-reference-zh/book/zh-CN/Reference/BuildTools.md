# 构建工具与分发

> 对应英文：[Build Tools and Distribution](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/)，抓取日期：2026-06-16。

Lean toolchain 是一组命令行工具，用于检查 Lean 文件集合中的证明并编译程序。toolchain 由 `elan` 管理；`elan` 会在需要时安装对应 toolchain。Lean toolchain 被设计为自包含的，大多数命令行用户通常只需要显式调用 `lake` 和 `elan`。

一个 toolchain 包含以下工具：

## `lean`

Lean 编译器，用于 elaboration 并编译 Lean 源文件。

## `lake`

Lean 构建工具。它在跟踪依赖关系的同时，以增量方式调用 `lean` 和其他工具。

## `leanc`

随 Lean 一起分发的 C 编译器，是 Clang 的一个版本。

## `leanmake`

`make` 构建工具的一个实现，用于编译 C 依赖。

## `leanchecker`

该工具会把 `.olean` 文件中的 elaboration 结果重新交给 Lean kernel 回放，从而为所有项都已被正确检查提供额外保证。

## toolchain 中的其他文件

除了这些构建工具外，toolchain 还包含构建 Lean 代码所需的文件，包括：

- 源码；
- `.olean` 文件；
- 已编译库；
- C 头文件；
- 已编译的 Lean run-time system。

它也包含 Lean 内置 tactic 使用的外部证明自动化工具，例如 `bv_decide` 使用的 `cadical`。

## 后续章节

- 24.1 Lake
- 24.2 Managing Toolchains with Elan