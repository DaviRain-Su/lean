# `lake lean`

> 对应英文：[Lake command: lake lean](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#lake-lean)，抓取日期：2026-06-16。

`lake lean file [-- args...]` 会先构建目标文件依赖的 imports，再在 Lake 环境中直接运行 Lean 处理这个文件。

## 它做了什么

1. 找到该文件所需的 imports。
2. 构建这些 imports。
3. 在 root package 配置的额外 Lean 参数基础上，再附加命令行提供的参数。
4. 在 Lake 环境中执行 `lean`。

## 参数顺序

传给 `lean` 的参数顺序是：

1. workspace root package 的额外 Lean 参数
2. `--` 后面显式提供的参数

这意味着项目配置和临时 CLI 参数可以叠加。

## 何时有用

- 想对单个 Lean 文件做更底层调用；
- 想显式传一些 `lean` 参数，而不是只走 `lake build`；
- 想在正确 workspace / toolchain 环境里直接运行编译器。

## 与 `lake env lean` 的区别

`lake env lean file` 只是在 Lake 环境里直接跑 Lean；而 `lake lean file` 还会先处理该文件的 imports 构建，因此更适合面向项目文件的常规使用。