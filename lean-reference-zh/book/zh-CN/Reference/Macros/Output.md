# 扩展 Lean 的输出

> 对应英文：[Extending Lean's Output](https://lean-lang.org/doc/reference/latest/Notations-and-Macros/Extending-Lean___s-Output/)，抓取日期：2026-06-16。

用新 syntax 扩展 Lean，并用 macro/elaborator 实现这些 syntax，可以让用户更方便地向 Lean 表达想法。但 Lean 是交互式定理证明器：它提供的反馈也必须易于理解。因此 syntax extension 不仅应能用于输入，也应能用于输出。

Lean 主要用两种机制让输出使用 syntax extension：

## Unexpander

unexpander 是 macro 的反向机制。macro 把新 syntax 翻译为旧 syntax；unexpander 则把底层 encoding 转回新 extension。和 macro 一样，unexpander 也是 `Syntax → Syntax` 的转换；不同的是，它把已有 encoding 转成新 syntax。

在显示 syntax 之前，Lean 会尝试把常量 application 按 unexpander table 重写。unexpansion 从内向外进行。unexpander 会收到 application 的 syntax，其中 implicit argument 已隐藏，argument 也已经先被 unexpanded。

如果 option `pp.explicit` 为 true 或 `pp.notation` 为 false，则不会使用 unexpander。

unexpander 类型是 `Lean.PrettyPrinter.Unexpander`，也就是 `Syntax → Lean.PrettyPrinter.UnexpandM Syntax`。`UnexpandM` 支持 quotation，也支持通过失败让下一个 unexpander 尝试。

unexpander 应该返回 unexpanded syntax，或用 `throw ()` 失败。如果成功，结果 syntax 会再次进入 unexpansion；如果失败，Lean 尝试下一个 unexpander。若没有 unexpander 成功，则继续处理 child node，直到没有更多机会。

可以用 `app_unexpander` attribute 为某个 constant 注册 unexpander：

```lean
attribute [app_unexpander someConstant] someUnexpander
```

custom operator 和 notation 通常会自动为引入的 syntax 创建 unexpander。

## Delaborator

Delaborator 是 elaborator 的反向机制。elaborator 把 `Syntax` 翻译为核心类型论的 `Expr`；delaborator 把 `Expr` 翻译回 `Syntax`。

在某个 `Expr` 显示给用户之前，Lean 会先 delaborate，再 unexpand。delaborator 会跟踪输出 syntax 来自原始 `Expr` 的哪个位置，并把该位置编码在 resulting syntax 的 `SourceInfo` 中。这样，当该 syntax 出现在 proof state 或 diagnostic 中时，Lean 的交互功能仍能提供相关信息。

delaborator 类型是 `Lean.PrettyPrinter.Delaborator.Delab`，近似为 `DelabM Term`。它不是普通函数形式，这是为了更容易正确实现：`DelabM` monad 会跟踪当前正在 delaborate 的 expression 位置，并在递归时更新该位置。

## 注册 delaborator

`delab` attribute 为指定的 `Expr` constructor 或 metadata key 注册 delaborator：

```lean
attribute [delab ident] someDelaborator
```

`app_delab` attribute 为某个常量 application 注册 delaborator：

```lean
attribute [app_delab someConstant] someDelaborator
```

内部表会查询 `Expr` constructor 名称；对常量 application，还会查询 `app.c` 形式的名称；对带特定 metadata key 的 `Expr.mdata`，会查询 `mdata.k`。

## 子表达式工具

`DelabM` 是 reader monad，能访问当前 `Expr` 位置。递归 delaboration 通过调整 reader 中的当前位置完成，而不是显式把子表达式传给另一个函数。

常用工具位于 `Lean.PrettyPrinter.Delaborator.SubExp` namespace：

- `getExpr`：取得当前 expression；
- `withAppFn`：把当前位置调整到 application 的函数部分；
- `withAppArg`：把当前位置调整到 application 的参数部分；
- `withAppFnArgs`：把当前 expression 分解为非 application 的函数和参数；
- `withBindingBody`：进入函数或函数类型的 body。

## 选择机制

- 若底层 `Expr` 需要特殊显示，写 delaborator。
- 若已有 delaboration 结果只是需要换成更友好的 syntax，写 unexpander。
- 若使用 custom operator 或 notation，Lean 通常会自动生成 unexpander；只有输出不符合预期时才需要手写。
