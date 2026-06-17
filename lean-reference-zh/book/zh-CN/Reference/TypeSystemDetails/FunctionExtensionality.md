# 函数外延性

> 对应英文：[Extensionality](https://lean-lang.org/doc/reference/latest/The-Type-System/Functions/#The-Lean-Language-Reference--The-Type-System--Functions--Extensionality)，抓取日期：2026-06-16。

Lean 对函数的 definitional equality 采用 **intensional** 视角：它主要看语法结构、变量重命名和规约，而不是直接采用“数学上对所有输入结果相同就算相等”的标准。

## 为什么不是直接用外延相等

外延相等很符合数学直觉：若两个函数对所有输入输出都相同，它们就相等。

但 type checker 需要一个：

- 可判定
- 可实现
- 代价可控

的等价检查算法。若把函数外延相等直接放进 definitional equality，就等于要求 type checker 自动证明任意函数相等命题，这既不可预测，也不可行。

因此，Lean 把外延性保留为**推理原则**，而不是 definitional equality 的默认组成部分。

## `η`-equivalence

尽管 Lean 不把完整外延性纳入 definitional equality，但仍支持一种有限形式：η-equivalence。

也就是说，若 `f` 是函数，则：

```text
f  ≡  fun x => f x
```

在适当条件下成立。

## `funext`

当你真正需要证明两个函数相等时，可使用 theorem：

- `funext`

它表达：若对所有输入 `x`，都有 `f x = g x`，则 `f = g`。

Lean 还提供对应 tactic：

- `funext`
- `ext`

来把“函数相等目标”化成“对任意输入值证明结果相等”。

## 实践意义

- definitional equality 里看不出的函数相等，通常需要 `funext`；
- 许多“为何 `rfl` 不行”的问题，本质上就是缺少函数外延性；
- 若你在写高阶证明，`funext` 基本是必备工具。