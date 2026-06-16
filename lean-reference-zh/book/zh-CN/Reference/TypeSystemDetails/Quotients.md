# quotient

> 对应英文：[Quotients](https://lean-lang.org/doc/reference/latest/The-Type-System/Quotients/)，抓取日期：2026-06-16。

quotient type 通过“降低某类型上命题相等的分辨粒度”来构造新类型。给定类型 `A` 和等价关系 `∼`，商类型 `A / ∼` 里的元素仍来自 `A`，但任何满足 `a ∼ b` 的元素都会被视为相等。

## 为什么 quotient 有用

它们能建立真正的抽象屏障：

- 只要两个元素在 quotient 中相等，Lean 逻辑的任何部分都不能再观察出差别；
- 从 quotient 出发定义函数时，必须证明该函数尊重等价关系。

这在数学里非常常见，例如：

- 整数：把自然数对 `(n, k)` 按 `n - k` 的等价关系取商
- 有理数：把 `(n, d)` 按交叉乘积相等取商
- 实数：把合适的 Cauchy 序列按“差收敛到 0”取商
- 有限集合：把列表按“包含相同元素”取商

## `Quotient` 与 `Setoid`

`Quotient` 构造依赖 `Setoid`。`Setoid` 是“类型 + 指定等价关系”的打包：

- `≈` 用于书写该等价关系
- 其 relation 必须是 reflexive、symmetric、transitive

## 常用 API

### 引入 quotient

- `Quotient.mk`
- `Quotient.mk'`

把底层类型的值放进 quotient 中。

### 消去 quotient

- `Quotient.lift`
- `Quotient.liftOn`
- `Quotient.lift₂`
- `Quotient.liftOn₂`

定义从 quotient 出发的函数时，必须证明你的函数对等价类选择无关，也就是尊重等价关系。

### 关于 quotient 的证明

- `Quotient.sound`
- `Quotient.ind`
- `Quotient.rec`
- `Quotient.recOn`
- `Quotient.hrecOn`

其中 `Quotient.sound` 让你从“底层值满足关系 `≈`”推出“它们在 quotient 中相等”。

## `Quot` 与 `Quotient`

Lean 还有更底层的 primitive quotient：`Quot`。它不要求你先证明关系真的是等价关系。一般用户应优先使用 `Quotient`，因为它更安全，也更贴近数学直觉。

## 与函数外延性的关系

英文页还特别指出：函数外延性 theorem `funext` 可借 quotient 证明。这说明 quotient 不只是“数学对象的商构造”，也深度参与 Lean 自身逻辑原则的表达。

## 与归纳类型的关系

商类型不像普通 inductive type 那样自由；有些嵌套归纳场景里，手工选 canonical representative 的方式可能比 `Quotient` 更易用。英文页也专门讨论了 quotient 与 inductive type 的交互。

## 使用建议

- 需要“值相等但实现不同”的抽象边界时，考虑 quotient。
- 若每个等价类都容易选 canonical representative，手工正规化有时比 quotient 更方便。
- 从 quotient 出发定义函数时，优先先想清楚“尊重等价关系”的证明是什么。