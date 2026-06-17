# subsingleton 消去

> 对应英文：[Subsingleton Elimination](https://lean-lang.org/doc/reference/latest/The-Type-System/Inductive-Types/#subsingleton-elimination)，抓取日期：2026-06-16。

通常来说，命题层对象不能随意消去到普通数据类型；但如果某个归纳类型是 subsingleton，那么情况会有所不同。

## 直觉

subsingleton 的含义是：该类型中任意两个值都相等。因此，从这种类型的值中“取出哪一个分支”不会泄露有意义的计算信息。

这就是为什么某些看似命题层的对象，仍可安全地参与更一般的消去。

## 为什么重要

这条规则解释了：

- 为什么 `True` / `False` 等某些命题构造在实践中更灵活；
- 为什么部分 recursor 在 `Prop` 情况下仍能产生有用的结果；
- 为什么 Lean 会区分普通命题消去和 subsingleton elimination。

## 与 `Prop` / `Type` 的关系

`Prop` 中的归纳类型若是 subsingleton，Lean 对其 elimination 通常比一般命题更宽松；但若该命题有多个不可区分但“构造上不同”的 proof 选择，就不能这样做。

## 使用建议

- 看到某个命题对象能被消去到更一般类型时，先检查它是否本质上是 subsingleton；
- 若某个 elimination 被拒绝，常见原因就是 Lean 认为该类型并非 subsingleton。