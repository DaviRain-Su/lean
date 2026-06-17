# `lake exe`

> 对应英文：[Lake command: lake exe](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#lake-exe)，抓取日期：2026-06-16。

`lake exe exe-target [args...]` 会在当前 workspace 中查找某个 executable target，若它过期则先构建，再带上给定参数运行。

## 别名

- `lake exec`

## 它与 `lake build` 的关系

`lake exe` 内部仍依赖 Lake 的构建机制：

- 先解析 target 规格；
- 检查它是否过期；
- 必要时重建；
- 最后在 Lake 环境中执行构建出的程序。

因此它适合“我就是想跑这个可执行目标”，而不必分两步写成：

1. `lake build ...`
2. 再手工去构建目录找二进制运行。

## 参数

`[args...]` 会在 executable 构建完成后直接传给它。

## 使用建议

- 日常开发中，要运行项目可执行文件时优先 `lake exe`；
- 若只是想拿到可执行文件路径供脚本使用，优先考虑 `lake query`。