# 与 Lean 交互

> 对应英文：[Interacting with Lean](https://lean-lang.org/doc/reference/latest/Interacting-with-Lean/)，抓取日期：2026-06-16。本译文覆盖本章主要交互命令与格式化输出结构；生成式 API reference 细节以英文原页为准。

Lean 是为交互式使用设计的，而不是只把整个文件批量输入，再一次性得到目标代码或错误信息的系统。许多交互式编程语言提供 REPL（Read-Eval-Print Loop）：用户输入代码，系统解析、求值并显示结果，然后重复这个过程。Lean 的交互功能采用不同范式：它不是在程序外提供单独命令提示符，而是在源文件上下文中提供 command 来完成同类任务。按照约定，用于交互而不是长期代码制品的 command 通常以 `#` 开头。

Lean command 产生的信息会进入 message log。message log 累积 elaborator 输出的消息。每条消息都关联到特定源码范围，并具有 severity。severity 有三类：

- `information`：不表示问题的信息；
- `warning`：潜在问题；
- `error`：确定的问题。

交互命令的结果通常作为 information message 返回，并关联到该 command 的起始关键字。

## 3.1 求值 term：`#eval`

`#eval e` 会通过编译并运行表达式 `e` 来求值。它用于把 Lean 代码当作程序运行，尤其可以执行 `IO` action。它采用 call-by-value 求值策略，会执行 `partial` function，并擦除 type 和 proof。

输出结果时，`#eval` 会尝试使用 `ToExpr`、`Repr` 或 `ToString` instance 打印值。如果 `e` 是类型为 `m ty` 的 monadic value，Lean 会尝试把 monad `m` 适配到 `#eval` 支持的 monad。内建支持包括：

- `IO`
- `CoreM`
- `MetaM`
- `TermElabM`
- `CommandElabM`

用户可以定义 `MonadEval` instance 扩展支持的 monad 列表。

`#eval` 的能力会随导入内容而降级。导入 `Lean.Elab.Command` 模块可以提供完整能力。

出于 soundness 原因，`#eval` 默认拒绝求值依赖 `sorry` 的表达式，即使只是间接依赖也不允许。`sorry` 可能破坏运行时不变量，引发 Lean 自身崩溃。如果确实需要绕过这个检查，可以使用 `#eval! e`。

常用选项：

- `eval.pp`：默认 `true`。若为真，尝试使用 `ToExpr` instance 调用通常 pretty printer；否则只尝试 `Repr` 和 `ToString`。
- `eval.type`：默认 `false`。若为真，pretty print 求值结果的 type。
- `eval.derive.repr`：默认 `true`。若没有其他打印结果的方式，尝试自动派生 `Repr` instance。

若想按 definitional equality 的 reduction rule 化简 term，而不是编译执行程序，应使用 `#reduce`。

### `#eval` 如何运行不同类型的 term

`#eval` 总会先 elaborates 并编译给定 term。随后它会检查该 term 是否传递依赖任何 `sorry`。如果依赖 `sorry`，除非使用 `#eval!`，否则会终止求值。

运行方式取决于 term 的 type：

- 若 type 位于 `IO` monad 中，则在捕获 standard output 和 standard error 的环境中执行，并把输出重定向到 Lean message log。如果返回值 type 不是 `Unit`，则按非 monadic expression 的结果显示。
- 若 type 位于 Lean 内部元编程 monad（`CommandElabM`、`TermElabM`、`MetaM`、`CoreM`）之一，则在当前上下文中运行。例如 environment 会包含调用 `#eval` 处可见的 definition。Lean 在 Lake 下运行时，工作目录是当前 workspace。
- 若 type 位于其他 monad `m`，且存在 `MonadLiftT m CommandElabM` 或 `MonadEvalT m CommandElabM` instance，则 Lean 会先把该 monad 转换为可由 `#eval` 运行的 monad。
- 若 term type 不在任何受支持 monad 中，则视为 pure value。Lean 运行已编译代码并显示结果。

## 3.2 化简 term：`#reduce`

`#reduce <expression>` 会把表达式化简到 normal form。它会应用 reduction rule，直到无法继续 reduction。

默认情况下，表达式内部的 proof 和 type 不会被化简。可以使用 modifier：

- `(proofs := true)`：化简 proof；
- `(types := true)`：化简 type。

由于 proposition 在 Lean 中也是 type，化简 type 可能很昂贵。对复杂表达式，`#reduce` 可能计算成本很高。若只是想简单执行表达式，通常应考虑 `#eval`。

## 3.3 检查 type：`#check`

`#check` 用于让 Lean elaborates 一个 term 并显示其 type。它是交互式探索库和理解表达式最常用的命令之一。

典型用途：

```lean
#check Nat.succ
#check List.map
#check fun x : Nat => x + 1
```

`#check` 不运行程序；它只要求 elaborator 找到表达式的 type，并把结果显示到 message log。

## 3.4 合成 instance：`#synth`

`#synth` 要求 Lean 为给定 type 合成 type class instance。它常用于调试 type class search：

```lean
#synth Inhabited Nat
#synth Repr (List Nat)
```

如果 instance search 成功，Lean 会显示找到的 instance；如果失败，则产生错误消息。它只查询当前 environment 和当前打开 namespace / instance 可见性下可用的 instance。

## 3.5 查询上下文

Lean 提供多种交互 command 来查询当前 context、environment 和可用声明。常见例子包括：

- `#check`：显示 term 的 type；
- `#print`：打印 declaration 或相关信息；
- `#print axioms`：打印定理依赖的公理；
- `#where`、`#help` 等：依版本和导入内容提供上下文或帮助信息。

这些命令的共同点是：它们使用当前文件中已经 elaborated 的环境，结果作为 message log 中的消息显示。

## 3.6 用 `#guard_msgs` 测试输出

`#guard_msgs` 用于测试后续 command 产生的消息是否符合预期。这对文档、测试和错误消息稳定性很有用。它可以把 warning、error 或 information message 作为预期输出的一部分检查。

例如，文档中的 Lean 示例可以用 `#guard_msgs` 保证某个命令确实产生指定错误或警告。这样当 Lean 的错误消息或行为改变时，测试会失败，提醒维护者更新文档或代码。

## 3.7 格式化输出

Lean 有一套格式化输出结构，用于 pretty printing 值、消息和文档片段。本章英文原页进一步介绍 `Format`、`Repr` 与相关 type class。

### `Format`

`Format` 表示可渲染的结构化文档。它不是简单字符串，而是保留了换行、缩进、组合和括号等排版信息。渲染时，formatter 可以根据可用宽度决定在哪里换行。

常见构造包括：

- empty document；
- sequence；
- indentation；
- bracket / parenthesis；
- group / line break；
- rendering 到最终字符串或 message。

这种结构让 Lean 能在错误消息、type 显示、`#check` 输出和 pretty printer 中保持一致排版。

### `ToFormat`

`ToFormat` class 描述某个类型如何转换为 `Format`。如果某类型有 `ToFormat` instance，就可以以结构化方式显示它，而不是只能转成普通字符串。

### `Repr`

`Repr` class 描述如何把值显示为接近 Lean 语法的表示。`#eval` 会尝试使用 `Repr` 打印结果。为自定义类型编写 `Repr` instance 时，应尽量让输出可读，并在可能时接近可复制的 Lean 表达式。

对 atomic type，可以直接输出一个简单文档；对 compound type，通常应组合子文档，并正确处理优先级、括号和缩进。