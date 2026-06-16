# `#eval`

> 对应英文：[Evaluating Terms / `#eval`](https://lean-lang.org/doc/reference/latest/Interacting-with-Lean/#hash-eval)，抓取日期：2026-06-16。

`#eval` 用于对 term 求值。它会把给定表达式编译并运行，然后把结果作为信息消息输出到 message log。

## 基本形式

```lean
#eval e
#eval! e
```

- `#eval e`：普通求值。
- `#eval! e`：即使表达式依赖 `sorry`，也强制求值。

Lean 默认拒绝对依赖 `sorry` 的表达式使用 `#eval`，因为 `sorry` 可能破坏运行时不变量。只有在确实理解风险时，才应使用 `#eval!`。

## `#eval` 如何工作

`#eval` 会先 elaborates 并编译给定 term，然后按照 term 的 type 决定如何执行：

- 若 type 是 `IO α`，则运行该 `IO` action，并把标准输出/标准错误重定向到 message log。
- 若 type 位于 Lean 内部元编程 monad（例如 `CoreM`、`MetaM`、`TermElabM`、`CommandElabM`），则在当前交互上下文中执行。
- 若 type 位于其他支持的 monad 中，可通过 `MonadEval` / `MonadEvalT` 适配。
- 若是纯值，则运行编译后的代码并显示结果。

因此，`#eval` 既能执行普通程序，也能执行 `IO` 和一部分元编程代码。

## 显示结果

`#eval` 会尝试用下列方式显示结果：

- `ToExpr`
- `Repr`
- `ToString`

相关选项：

- `eval.pp`：默认 `true`。若为真，优先使用 pretty printer 友好的方式显示。
- `eval.type`：默认 `false`。若为真，同时显示求值结果的 type。
- `eval.derive.repr`：默认 `true`。若没有其他显示方式，尝试自动派生 `Repr` instance。

## 何时用 `#eval`

适合：

- 运行纯函数并查看返回值；
- 测试 `IO` 代码；
- 在文档或示例中展示表达式结果；
- 调试 metaprogram 在当前 environment 下的行为。

不适合：

- 想看 definitional reduction 时，此时应使用 `#reduce`；
- 只想知道一个 term 的 type，此时应使用 `#check`；
- 需要保证 proof 不依赖 `sorry` 时，不能用 `#eval!` 掩盖问题。
