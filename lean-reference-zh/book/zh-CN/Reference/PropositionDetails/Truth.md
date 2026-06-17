# 真与假

> 对应英文：[Truth](https://lean-lang.org/doc/reference/latest/Basic-Propositions/Truth/)，抓取日期：2026-06-16。

从最根本上说，Lean 中的命题最终都可归约到两种极端情形：

- `True`
- `False`

借助命题外延性 `propext`，任何为真的命题都与 `True` 逻辑等价，任何为假的命题都与 `False` 逻辑等价。

## `True`

`True` 是一个只有单个构造子的归纳命题。它总是可证明，其标准证明是：

- `True.intro`
- 更常用的简写：`trivial`

从信息量上说，`True` 的 proof 不携带额外内容，因此它基本只是“这个目标已经成立”的标志。

## `False`

`False` 是没有任何构造子的归纳命题，因此不能直接构造 proof。想证明 `False`，只能从当前上下文中推出矛盾。

一旦得到了 `h : False`，就可通过：

- `False.elim`

推出任意结论。这就是常说的：

- ex falso
- principle of explosion

## subsingleton 与计算

`True` 和 `False` 都是 subsingleton，因此它们的 proof 在逻辑上都没有可区分的信息。这也解释了：

- `True` 的 proof 可被忽略；
- `False` 的 proof 可被当作“这段代码不可能运行到这里”的证据。

## 使用建议

- 只想表示“某命题成立但不含额外数据”时，`True` 是最简单终点；
- 进入不可能分支时，优先用 `False.elim` 结束；
- 遇到复杂 proposition，可先思考它最终是否只是 `True` / `False` 风格的边界情形。