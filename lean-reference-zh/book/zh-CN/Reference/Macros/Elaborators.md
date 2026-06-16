# Elaborator

> 对应英文：[Elaborators](https://lean-lang.org/doc/reference/latest/Notations-and-Macros/Elaborators/)，抓取日期：2026-06-16。

elaborator 处理新的 syntax extension。quotation pattern 是拆解 syntax 最常见的方式。

macro 通过把新 syntax 翻译为已有 syntax 来扩展 Lean；elaborator 则允许直接处理新 syntax。elaborator 能访问 Lean 自身实现语言功能时使用的工具。定义新 elaborator 可以让 language extension 与 Lean 内建功能一样强大。

## 两类 elaborator

### Command elaborator

command elaborator 用于向 Lean 添加新 command。command 通过 side effect 实现：它们可以向 global environment 添加新 constant，扩展 compile-time table（例如 instance table），产生 information/warning/error，也可以完整访问 `IO` monad。

command elaborator 与它能处理的 syntax kind 关联。

### Term elaborator

term elaborator 用于实现新 term，把 syntax 翻译成 Lean core type theory 中的 `Expr`。它拥有 command elaborator 的能力，还能访问当前 term elaboration 的 local context。

term elaborator 可以查找 bound variable、绑定新变量、统一两个 term、使用 expected type、合成 type class instance 等。term elaborator 必须返回 `Lean.Expr`，也就是核心类型论 AST。

## 多 elaborator 与 delegation

和 macro 一样，一个 syntax kind 可以关联多个 elaborator。Lean 会按顺序尝试。elaborator 若不能处理当前 syntax，可抛出 `unsupportedSyntax`，把机会交给表中下一个 elaborator。

## `elab_rules`

`elab_rules` command 可以用一系列 quotation pattern 定义 elaboration rule，并把它们加入 elaborator table。语法类别可以是 `term`、`command` 或 `tactic`。

term elaborator 可以用 `<=` 绑定当前 expected type：

```lean
elab_rules : term <= expected
  | `(someSyntax) => ...
```

这让 elaborator 能根据上下文 expected type 做不同处理。

## Attribute 注册

elaborator 也可以作为普通函数定义，再用 attribute 注册：

- `term_elab`
- `command_elab`
- `tactic`

这些 attribute 把函数关联到指定 syntax kind。

## Command、term 与 tactic

- command elaborator 类型近似为 `Syntax → CommandElabM Unit`；
- term elaborator 类型近似为 `Syntax → Option Expr → TermElabM Expr`；
- custom tactic 属于 tactic elaboration，详见 tactic 章节。

经验规则：能用 notation/macro 表达时不写 elaborator；只有当需要 expected type、local context、environment side effect 或核心 expression 控制时，才写 elaborator。
