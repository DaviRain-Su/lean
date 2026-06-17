# 异类相等

> 对应英文：[Heterogeneous Equality](https://lean-lang.org/doc/reference/latest/Basic-Propositions/Propositional-Equality/#The-Lean-Language-Reference--Basic-Propositions--Propositional-Equality--Heterogeneous-Equality)，抓取日期：2026-06-16。

普通命题相等 `Eq` 要求左右两边先属于同一个类型；**异类相等** `HEq` 则放宽这一点，允许先把“两个项类型不同”这种情况写成命题。

## `HEq`

记号：

```text
a ≍ b
```

核心构造子：

- `HEq.refl`
- `HEq.rfl`

不过，虽然 `HEq` 允许表述“类型不同的项相等”，它的反身构造仍要求：

- 两边类型 definitional 上一致
- 两边项 definitional 上一致

因此它扩展的是**可表达的命题形式**，而不是把“任意异类型项都能轻易证明相等”。

## 为什么它通常更难用

英文页特别强调：`HEq` 虽然更灵活，但实践中往往比普通 `Eq` 更不方便，因为它失去了很多 `Eq` 上自然成立的好性质。

例如，普通相等下常见的 congruence 推理，在异类相等里并不总能无条件成立。

## 何时会遇到 `HEq`

最常见来源是：

- 依赖模式匹配
- `split` tactic
- functional induction

这些场景中，控制流带来的“普通相等假设”有时写不出类型正确的形式，于是系统只能退而使用 `HEq`。

## 常见定理

英文页列出了一组高频工具：

- `HEq.subst`
- `eq_of_heq`
- `heq_of_eq`
- `type_eq_of_heq`
- `cast_heq`
- `eqRec_heq`
- `heq_of_eqRec_eq`
- `heq_of_heq_of_eq`

这些定理的核心用途是：

- 在 `Eq` 和 `HEq` 之间来回转换；
- 把类型相等和项相等联系起来；
- 在 dependent rewriting 场景中传递信息。

## 实践建议

- 若普通 `Eq` 足够表达目标，优先用 `Eq`；
- 看到 `HEq` 时，不要急着手工消灭它，先找是否已有 `eq_of_heq` / `heq_of_eq` / `type_eq_of_heq` 等桥接定理可用；
- 若某 tactic 自动生成了 `HEq` 假设，通常说明当前问题本身就具有依赖类型性质，而不是“系统多此一举”。