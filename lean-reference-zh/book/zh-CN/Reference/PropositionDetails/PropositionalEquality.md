# 命题相等

> 对应英文：[Propositional Equality](https://lean-lang.org/doc/reference/latest/Basic-Propositions/Propositional-Equality/)，抓取日期：2026-06-16。

命题相等 `a = b` 是 Lean 中显式陈述“两个项相等”的方式。它与 definitional equality 不同：

- **definitional equality**：Lean 自动检查；要求算法快速、可判定；
- **propositional equality**：必须显式证明和显式使用，但表达力更强。

## `Eq`

命题相等通过归纳类型 `Eq` 定义。它只有一个构造子：

- `Eq.refl`
- 常用简写：`rfl`

其思想是：若两个项 definitional 上已经相同，则可直接用 `rfl` 得到命题相等 proof。

## 等价关系性质

Lean 提供常见定理：

- `Eq.symm`
- `Eq.trans`

因此相等是一个等价关系。

## substitution

最重要的推理原则之一是：

- `Eq.subst`
- 写法 `h ▸ proof`

它表达“相等项可替换”。很多 tactic（尤其 `rw`）本质上就是在自动寻找合适的 motive 来应用 `Eq.subst`。

## `cast`

当相等的是**类型**时，可用：

- `cast`
- `Eq.mp`
- `Eq.mpr`

把一个项沿着类型相等搬到另一侧。通常应尽量避免在普通证明中大量依赖 cast，因为它会让项更难读，但有时无法避免。

## congruence

常见定理包括：

- `congr`
- `congrFun`
- `congrArg`

它们把“相等”传播到函数应用和参数位置。

## 唯一性与异类相等

英文页还包含两个重要扩展主题：

### 唯一性

由于 definitional proof irrelevance，命题相等 proof 本身也是唯一的。

### 异类相等 `HEq`

`HEq` 允许比较**类型不同**的两个项。它比普通 `Eq` 更灵活，但也更难使用；在依赖模式匹配和某些高级证明里会自然出现。

## 使用建议

- 先分清你需要的是 definitional equality 还是 propositional equality；
- 想显式重写目标/假设时，通常最后都会落到 `Eq.subst` / `rw`；
- 只有普通 `Eq` 不足时，再考虑 `HEq`。