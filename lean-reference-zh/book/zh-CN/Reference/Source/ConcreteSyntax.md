# 具体语法

> 对应英文：[Concrete Syntax](https://lean-lang.org/doc/reference/latest/Source-Files-and-Modules/#The-Lean-Language-Reference--Source-Files-and-Modules--Concrete-Syntax)，抓取日期：2026-06-16。

Lean 的 concrete syntax 是**可扩展**的。和许多固定语法语言不同，Lean 不可能“把全部语法一次性列完”：库不仅能定义新常量、新归纳类型，也能定义新 syntax。

因此，参考手册对语法的处理方式是：

- 先说明整体框架；
- 再在各语言构造所属章节中说明其具体语法。

## 为什么这很重要

Lean 的 parser、notation、macro、elaborator 都允许语言在库层面增长。这意味着：

- “什么是合法 Lean 代码”部分取决于当前导入的库；
- 不同项目可以拥有显著不同的表面语法；
- 阅读代码时，除了看核心语言，还要看引入了哪些 syntax extension。

## 具体语法与核心语法的关系

用户写下的是 concrete syntax；经过 parsing、macro expansion 和 elaboration 后，Lean 才得到核心类型论项。

因此，具体语法主要服务于：

- 提升可读性；
- 降低书写负担；
- 支持领域专用语言和数学记号；
- 改善交互式证明体验。

而真正受 kernel 检查的是 elaboration 后的核心表达式。