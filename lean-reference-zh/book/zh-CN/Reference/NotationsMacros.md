# Notation 与 Macro

> 对应英文：[Notations and Macros](https://lean-lang.org/doc/reference/latest/Notations-and-Macros/)，抓取日期：2026-06-16。

不同数学领域有各自的 notation 约定，许多 notation 也会在不同领域中以不同含义复用。形式化开发能够使用既有 notation 很重要：数学形式化本来已经很困难，如果还要在不同语法之间手动转换，会带来显著心智负担。

与此同时，也必须能控制 notation extension 的 scope。许多领域使用形似但含义非常不同的 notation；把这些领域的开发组合在一起时，读者和系统都应该能知道文件中某个区域正在使用哪套约定。

Lean 用多种机制解决 notation 可扩展性问题。每种机制处理问题的不同方面，并且可以灵活组合。

## Extensible parser

Lean 的 parser 可扩展。它允许用声明式方式实现各种 notation 约定，并可灵活组合。库可以添加新的 term syntax、tactic syntax、command syntax 或其他语法类别，使用户能用自然领域语言写代码和证明。

## Macro

macro 允许把新语法轻松映射到已有语法。这是一种为新构造赋予意义的简单方式。由于 hygiene 和 source position 的自动传播，这个过程不会干扰 Lean 的交互式功能，例如错误定位、hover、goal 显示或代码跳转。

macro 适合把一种语法糖展开为更基础的 Lean syntax。当新语法的意义可以由现有语法表达时，macro 通常是最直接的选择。

## Elaborator

当 macro 的表达力不足时，可以为新语法编写 elaborator。elaborator 可以使用与 Lean 自身语法相同的工具，包括 expected type、unification、type class synthesis、environment 查询和 message log。

这使得用户定义的语法不仅能展开成已有语法，还能拥有专门的 elaboration 行为。例如，需要根据上下文推断含义、生成多个 declaration、或执行复杂检查时，custom elaborator 比 macro 更合适。

## Notation

notation 允许同时定义 parser extension、macro 和 pretty printer。定义 infix、prefix 或 postfix operator 时，custom operator 会自动处理 precedence 和 associativity。

常见形式包括：

```lean
infix:50 " ⊕ " => someOperation
prefix:70 "¬" => Not
postfix:100 "⁻¹" => inv
```

notation 的优势是语法紧凑，并且能和 Lean 的 pretty printer 协同，使输出也能使用相同 notation。

## 低层 parser extension

低层 parser extension 可以以更底层的方式扩展 parser，例如修改 token 和 whitespace 规则，甚至完全替换 Lean 的 concrete syntax。这是高级主题，需要熟悉 Lean 内部实现。

尽管如此，能够不修改 compiler 就做到这一点很重要。Lean 参考手册本身就是用一个语言扩展编写的：它把 Lean 的 concrete syntax 替换为类似 Markdown 的文档写作语言，但源文件仍然是 Lean 文件。

## 本章覆盖范围

英文参考手册随后把本章展开为：

- 23.1 Custom Operators
- 23.2 Precedence
- 23.3 Notations
- 23.4 Defining New Syntax
- 23.5 Macros
- 23.6 Elaborators
- 23.7 Extending `do`-Notation
- 23.8 Extending Lean's Output