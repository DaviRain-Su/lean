# 扩展 `do` 记法

> 对应英文：[Extending do-Notation](https://lean-lang.org/doc/reference/latest/Notations-and-Macros/Extending--do--Notation/)，抓取日期：2026-06-16。

macro 和 elaborator 可以用于向 Lean 添加新 command 和 term。除此之外，`do` notation 也可以扩展。对 `do` notation 的扩展定义新的 do-element。macro 把新的 do-element 翻译为已有 do-element；elaborator 则能访问更多信息，并能产生任意 Lean 类型论中的 term。

extensible do-notation 从 Lean 4.29.0 开始引入。此前版本的 `do` elaborator 不可扩展。是否使用新实现由 option 控制：

```lean
set_option backward.do.legacy false
```

`backward.do.legacy` 默认值为 `true`；为 `false` 时启用 extensible elaborator。

## Elaboration overview

syntax kind `doElem` 表示单个 do-element。do-block 的 body 是一串 do-element，由 syntax kind `doSeq` 表示。`do` 的 elaborator 会对 body 中的 `doSeq` 调用专门的 elaboration framework，依次 elaborates 每个 `doElem`。

这个 framework 允许每个元素修改后续元素的 elaboration，并跟踪以下信息：

- enclosing loop，用于 `break` 和 `continue`；
- 通过 `return` 逃逸的方式；
- mutable variable 集合；
- 当前 monad 及其 `pure`/`bind` 构造方式。

单个 do-element 的 elaboration 类似 term elaboration：先展开最外层 macro，直到不再是 macro；再查内部表，找到该 do-element syntax kind 的 elaboration procedure。这个表和 term elaborator 表分离，因为 do-element elaborator 类型不同。

若 do-element 只是一个普通 term，parser 会把它包装为 `doExpr`；其 elaborator 会调用 term elaborator，并保证 term 的 type 适合当前 do-block。

## `do` notation 中的 macro

macro expansion 会在 do-element elaboration 中发生。do-element macro 与 term/command macro 没有本质区别；区别只是它们定义在 `doElem` syntax category 的 syntax 上。

如果某个扩展能写成 macro，通常应该优先写 macro。macro 更容易维护，并且会继承它展开目标语法实现中的 bug fix。

macro 的限制包括：

- 不能访问 mutable variable 集合，也不能覆盖它；
- 不能实现无法用内建 control structure 表达的新控制结构；
- 不能把 do-sequence 放进某个新上下文（例如 binder 下），同时仍让它作为外层 do-block 的一部分参与 early return 和 mutable variable 处理。

这些场景可能需要 elaborator。

## Do-element elaborator

`do` element 的 elaboration 发生在 `DoElabM` monad 中。它封装 `TermElabM`，并额外提供 do-elaboration context。

elaborator 还会收到 continuation 参数。continuation 表示当前元素之后 do-block 的剩余部分：它既包含 elaborating 剩余 block 的 `DoElabM` action，也包含一个名称，用来让剩余代码引用当前步骤的结果。

不同于 term elaborator 把 elaborated term 返回给外层上下文，do-element elaborator 会调用提供的 continuation，安排剩余 do-block 的 elaboration。

## Context 与 monad 操作

`Lean.Elab.Do.Context` 包含 do elaboration 所需状态，例如：

- `monadInfo`：当前 monad 的缓存信息；
- `mutVars`：按声明顺序记录的 mutable variables；
- `doBlockResultType`：当前 do-block 的 expected result type；
- `contInfo`：`return`、`break`、`continue` continuation 信息；
- `deadCode`：当前元素是否是 dead code；
- `ops`：构造 `pure` 和 `bind` application 的可插拔 builder。

framework 提供 helper 构造 monad operation：

- `mkMonadApp`：从 result type 构造 `m α`；
- `mkPureApp`：构造 `pure` application；
- `mkBindApp`：构造 `Bind.bind` application；
- `mkPUnitUnit`：取得缓存的 `PUnit.unit` expression。

## Continuation 与 control flow

continuation 描述当前 do-element 后续如何继续。相关工具会确保当前结果 type 正确，必要时生成 `Unit`，处理 dead code，并在可能时把 `e >>= pure` 之类结构收缩。

`return`、`break` 和 `continue` 由 context 中保存的 continuation 实现。进入 loop body 时，framework 会更新 break/continue continuation，使自定义 do-element 能和控制流协同。

## Mutable variable 与 effect lifting

extensible do elaborator 跟踪 mutable variable 的声明和重新赋值。自定义 do-element 如果要读写或冻结 mutable variable，需要与这套状态协作。

effect lifting 允许在较大 monad 上下文中嵌入较小 effect。do-elaboration framework 提供 `ControlLifter` 等结构，帮助在 continuation 周围 lift 和 restore effect。

## 实用建议

- 能用 macro 表达的 do-extension，优先用 macro。
- 需要控制 early return、loop control、mutable variable 或 continuation 时，再写 do-element elaborator。
- 复杂 do-extension 应尽量复用 framework 提供的 helper，而不是手写 `pure`/`bind` 结构。
