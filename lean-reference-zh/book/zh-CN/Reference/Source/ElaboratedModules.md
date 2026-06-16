# elaborated module

> 对应英文：[Elaborated Modules](https://lean-lang.org/doc/reference/latest/Source-Files-and-Modules/#The-Lean-Language-Reference--Source-Files-and-Modules--Elaborated-Modules)，抓取日期：2026-06-16。

源文件在解析、macro expansion、elaboration、kernel 检查之后，会形成可供后续 import 的 elaborated module。

## `.olean`

Lean 把模块 elaboration 后的环境变化序列化到 `.olean` 文件中。`.olean` 是后续 import 的关键中间产物：

- 它让下游文件无需重新 elaborates 上游源码；
- 它保存了后续 type checking / import 所需的声明信息；
- 它支持增量构建和快速加载。

## `.ilean`

除了 `.olean`，Lean 还会生成 `.ilean`。它主要供 language server 与交互功能使用，例如：

- declaration 源位置索引；
- 无需完整加载模块就能提供的编辑器信息；
- 交互查询所需的辅助元数据。

## 为什么这层很重要

理解 elaborated module 有助于解释：

- 为什么 import 一个大库通常比重新编译它快得多；
- 为什么缓存、构建系统和编辑器都高度依赖 `.olean` / `.ilean`；
- 为什么修改源码后有时需要重新构建相关模块，而不只是重新打开文件。

## 与 build system 的关系

Lake 主要围绕这些产物工作：

- 判断哪些 `.olean` 过期；
- 哪些依赖必须重新 elaborates；
- 哪些结果可从缓存或历史构建复用。

## 使用建议

- 普通用户通常不直接手动管理 `.olean` / `.ilean`；
- 出现奇怪的“代码改了但行为像没改”时，可怀疑相关 elaborated module 产物过期或缓存不一致；
- 处理 Lean 构建问题时，应把“源码”和“elaborated module 产物”分开看。