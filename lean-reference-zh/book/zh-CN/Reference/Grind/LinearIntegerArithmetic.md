# `grind`：线性整数算术

> 对应英文：[Linear Integer Arithmetic](https://lean-lang.org/doc/reference/latest/The--grind--tactic/Linear-Integer-Arithmetic/)，抓取日期：2026-06-16。

`grind` 内置一个基于模型的线性整数算术（LIA）判定过程。它处理的核心约束类型包括：

- `p = 0`
- `d ∣ p`
- `p ≤ 0`
- `p ≠ 0`

其中 `p` 是线性多项式。

## 能力范围

- 对线性整数算术是完备的；
- `Nat` 会通过 `Int.ofNat` 嵌入整数处理；
- 其他可嵌入整数的类型可通过 `Lean.Grind.ToInt` 扩展支持；
- 非线性项（如 `x * x`）允许出现，但会被当作“额外变量”处理，因此不会真正推理其非线性结构。

## 典型用途

- 线性等式和不等式；
- 可整除约束；
- 含 `Nat`、`Int`、某些 `Fin` / 固定位宽整数的线性目标；
- 与 `grind` 其他模块协同：LIA 可把额外等式传播回白板，触发更多自动化。

## 重要选项

- `-lia`：关闭线性整数算术求解器。
- `qlia`：允许接受有理数解，能减少搜索空间，但会失去完备性。
- `-mbtc`：关闭 model-based theory combination 的额外等式传播。

## 非线性限制

`x * x ≥ 0` 这类目标不在线性范围内。对 LIA 来说，`x * x` 被视作一个黑盒变量，而不是可展开的平方项。

## `ToInt` 与 `IntInterval`

若某个类型可忠实嵌入整数区间，可通过 `Lean.Grind.ToInt` 提供实例，让 LIA 处理该类型上的线性约束。区间由 `IntInterval` 描述，可是有限区间、半无穷区间或整条整数线。

## 使用建议

- 线性算术优先交给 `grind`；
- 非线性问题优先考虑 ring/bv/specialized solver；
- 对新类型若有整数嵌入，补 `ToInt` instance 常能显著提升自动化覆盖率。
