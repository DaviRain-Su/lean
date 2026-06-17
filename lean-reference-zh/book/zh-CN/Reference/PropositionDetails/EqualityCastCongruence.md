# cast 与 congruence

> 对应英文：[Propositional Equality](https://lean-lang.org/doc/reference/latest/Basic-Propositions/Propositional-Equality/)，抓取日期：2026-06-16。本页整理其中关于 `cast`、`Eq.mp` / `Eq.mpr` 与 congruence 定理的高频部分。

除了直接声明“两个项相等”，命题相等还承担两个非常实用的角色：

- 沿类型相等搬运项
- 把相等传播进函数应用和子项内部

## `cast`

当你有：

- `h : α = β`
- `a : α`

但系统不接受把 `a` 直接当作 `β`，就可以写：

- `cast h a : β`

这表示“沿着类型相等把值从 `α` 搬到 `β`”。

英文页特别提醒：若能避免 `cast`，最好尽量避免，因为带有大量 cast 的项通常更难读、更难推理；但当类型不 definitionally 对齐时，有时没有更好的选择。

## `Eq.mp` 与 `Eq.mpr`

`Eq.mp` 和 `Eq.mpr` 是 `cast` 的两个方向化版本：

- `Eq.mp h : α → β`
- `Eq.mpr h : β → α`

它们都把类型相等当作“在两个类型之间搬运值”的证据。

## congruence 定理

英文页列出三类高频 congruence 工具：

### `congr`

同时在函数部分和参数部分传播相等：

- 若 `f₁ = f₂`
- 且 `a₁ = a₂`
- 则 `f₁ a₁ = f₂ a₂`

### `congrFun`

只在函数部分传播：

- 若 `f = g`
- 则对任意 `a`，有 `f a = g a`

这在函数外延性证明和高阶等式推理里非常常见。

### `congrArg`

只在参数部分传播：

- 若 `a₁ = a₂`
- 则 `f a₁ = f a₂`

一个重要技巧是：`f` 不必是已命名函数，也可以是 lambda。这样你能把“某个更大表达式里的一处参数替换”包装成 congruence 证明。

## 与 tactic 的关系

这些定理和记号广泛支撑：

- `rw`
- `simp`
- `congr`
- `change`
- dependent rewrite 相关技巧

当这些 tactic 看起来“像魔法”时，底层往往就是 `cast` 或 congruence 定理在工作。

## 使用建议

- 类型不对齐时，先想是不是需要 `cast` / `Eq.mp` / `Eq.mpr`；
- 普通子项改写优先让 tactic 自动做；
- 只有 tactic 不够时，再手工用 `congrArg` / `congrFun` 精确控制相等传播。