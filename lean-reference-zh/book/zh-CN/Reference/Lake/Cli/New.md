# `lake new` / `lake init`

> 对应英文：[Creating Packages](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#new)，抓取日期：2026-06-16。

Lake 创建新项目的两个高频命令是：

- `lake new`
- `lake init`

二者都会创建 workspace，但语义不同。

## `lake new`

`lake new` 用于创建一个全新的 package/workspace。它会生成项目骨架，包括：

- `lean-toolchain`
- `lakefile.toml` 或 `lakefile.lean`
- 初始源码目录与示例文件
- 必要的目录结构

适用场景：从零开始创建新 Lean 包。

## `lake init`

`lake init` 更适合在**已有目录**中初始化 Lake 工作区。它不会像 `lake new` 那样假定“这里什么都没有”，而是把当前目录整理成一个 Lake package。

适用场景：

- 已有仓库想接入 Lake；
- 先手工建好目录，再补 Lake 配置；
- 迁移已有 Lean 项目。

## 选择建议

- 从零开始：优先 `lake new`。
- 现有目录接入：优先 `lake init`。

## 生成结果

无论使用哪一个，最终都会得到标准 Lake 工作区布局：

- `lean-toolchain`
- `lakefile.toml` 或 `lakefile.lean`
- `lake-manifest.json`（通常在首次解析依赖后出现）
- `.lake/`
- 源码目录与目标配置

## 使用建议

- 创建项目后，第一件事通常是运行 `lake build`，确保骨架可构建。
- 若团队协作，尽早把 `lean-toolchain` 和 `lakefile.*` 纳入版本控制。
- 若只是实验小片段，仍建议尽快进入标准 Lake workspace，而不是长期依赖裸文件。