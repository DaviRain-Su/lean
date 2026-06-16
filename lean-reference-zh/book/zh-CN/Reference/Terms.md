# Term

> 对应英文：[Terms](https://lean-lang.org/doc/reference/latest/Terms/)，抓取日期：2026-06-16。

term 是在 Lean 中书写数学和程序的主要方式。elaborator 会把用户写下的 term 翻译为 Lean 的最小核心语言；随后，kernel 检查这些核心 term，compiler 再把可执行部分编译为运行时代码。

Lean 的 term syntax 可以任意扩展。本章记录 Lean 默认提供的 term syntax；库和用户代码还可以通过 notation、macro 和 elaborator 添加新的 term 语法。

## 本章覆盖范围

英文参考手册随后把本章展开为：

- 13.1 Identifiers
- 13.2 Function Types
- 13.3 Functions
- 13.4 Function Application
- 13.5 Numeric Literals
- 13.6 Structures and Constructors
- 13.7 Conditionals
- 13.8 Pattern Matching
- 13.9 Holes
- 13.10 Type Ascription
- 13.11 Quotation and Antiquotation
- 13.12 `do`-Notation
- 13.13 Proofs

## Identifier

identifier 是最常见的 term 之一。它可以引用局部变量、section variable、namespace 中的 declaration、constructor、type class method、notation 展开的名称等。identifier 的解析依赖当前 namespace、opened namespace、local context 和可见的 declaration。

## 函数类型与函数

Lean 中的函数类型写作：

```lean
α → β
```

依赖函数类型可以写作：

```lean
(x : α) → β x
```

函数值通常通过 `fun` 构造：

```lean
fun x => x + 1
```

函数应用使用空格：

```lean
f x y
```

Lean 会根据函数类型、expected type、implicit parameter 和 type class instance synthesis 来 elaborates 应用表达式。

## Literal、structure 与 constructor

numeric literal 会通过 `OfNat` 等 type class 解释，因此同一个数字语法可以在不同 type 中使用。structure 和 constructor syntax 则提供构造 inductive type 或 structure value 的方式。

## 条件、pattern matching 与 hole

`if ... then ... else ...` 可对 decidable proposition 或 boolean condition 分支。`match` 则提供 pattern matching；elaborator 会把 pattern matching 翻译为核心语言中 recursor 和辅助 matcher function 的使用。

hole 允许暂时省略 term，例如 `_` 或 `?_`，让 elaborator 推断或生成 goal。它们是交互式开发中非常重要的工具。

## Type ascription 与 quotation

type ascription 显式给 term 标注 type：

```lean
(e : α)
```

它可以帮助 elaborator 确定 expected type，也可以触发 coercion。

quotation 和 antiquotation 用于元编程，把 Lean syntax 作为数据构造和拼接。它们是定义 macro、syntax extension 和 custom elaborator 的基础工具。

## `do` notation 与 proof

`do` notation 为 monadic program 提供命令式外观。它会被 elaborated 为 bind、pure、let、match 等组合。proof 也是 term；tactic proof 最终同样会构造核心语言中的 proof term，并由 kernel 检查。