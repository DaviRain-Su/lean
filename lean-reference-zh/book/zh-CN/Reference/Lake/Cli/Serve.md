# `lake serve`

> 对应英文：[Lake command: lake serve](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#lake-serve)，抓取日期：2026-06-16。

`lake serve` 会在 root package 的环境中运行 Lean language server，并把 package 配置中的 `moreServerArgs` 与命令行参数一起传给它。

## 主要用途

它通常不是给人手动敲的日常命令，而是供：

- 编辑器
- IDE 插件
- 其它开发工具

调用，用来启动或复用项目的语言服务器。

## 为什么需要它

语言服务器不仅要找到 `lean` 本体，还要看到：

- 正确的 toolchain
- workspace 的库路径
- `moreServerArgs`
- 项目的 package 配置

`lake serve` 把这些上下文统一准备好。

## 与直接启动 language server 的区别

如果你绕过 Lake 直接启动语言服务器，常见问题包括：

- 依赖路径不对；
- package 特有参数没带上；
- toolchain 与项目要求不匹配。

## 使用建议

- 工具集成时优先经由 `lake serve`；
- 手工调试 language server 问题时，也可以显式运行它来复现编辑器行为。