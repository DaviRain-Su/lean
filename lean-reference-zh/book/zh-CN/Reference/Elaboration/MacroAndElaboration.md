# Macro expansion 与 elaboration

> 对应英文：[Macro Expansion and Elaboration](https://lean-lang.org/doc/reference/latest/Elaboration-and-Compilation/#macro-and-elab)，抓取日期：2026-06-16。

解析完 command 后，下一步就是 elaboration。其含义取决于 elaboration 的对象：

- **command elaboration**：改变 Lean 状态，例如声明 inductive type、保存 definition、执行 command；
- **term elaboration**：把用户语法翻译为 Lean 核心类型论中的 term。

二者都可能递归进行，因为 command 里可嵌套 command combinator，term 里也可嵌套 term。

## command elaboration 与 term elaboration 的能力差异

### command elaboration

可以：

- 修改 environment；
- 访问 environment extension；
- 写 message log；
- 维护 debugging trace；
- 读写 info trees；
- 在 `IO` 中执行任意计算。

### term elaboration

除了不能修改 open scope 外，也能改动大多数交互元数据；并额外拥有：

- unification；
- type class instance synthesis；
- type checking；
- 从用户友好语法生成 fully explicit core term 的能力。

## macro expansion 的位置

macro expansion 是 elaboration 的一部分。Lean 会先检查最外层 syntax 是否有关联 macro：

- 若有，就调用 macro 把它改写为新 syntax；
- 若改写后最外层仍是 macro，则继续展开；
- 更深层的 macro syntax 会等 elaborator 递归到那里时再展开。

因此，macro expansion 不是一次性“把全树展开干净”，而是按 elaboration 需要逐层发生。

## lookup 表驱动

macro expansion 之后，Lean 会根据 syntax kind 去查询 elaborator 表：

- term elaborator：接收 syntax 和可选 expected type，返回核心表达式；
- command elaborator：接收 syntax，通过 side effect 修改全局 command state。

虽然二者都能访问 `IO`，但实际副作用更多见于 command elaboration，例如与外部工具交互。

## Info trees

info tree 是 Lean 交互体验的关键元数据结构。它把原始 syntax 与 elaboration 期间生成的信息关联起来，例如：

- 某个 expression 的 type；
- 某个位置的 proof state；
- identifier completion 候选；
- 文档提示；
- 自定义 code action 所需的元数据。

它的树结构与 syntax tree 近似，但一个 syntax node 可能对应多个 info tree node，分别描述不同方面。很多 VS Code / language server 中“看起来很智能”的功能，本质上都依赖这些信息树。
