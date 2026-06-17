# inductionWithNoAlts

> 对应英文：[About: inductionWithNoAlts](https://lean-lang.org/doc/reference/latest/Error-Explanations/About___--inductionWithNoAlts/)，抓取日期：2026-06-16。

错误码：`lean.inductionWithNoAlts`

含义：natural-number-game 风格 `with` 子句中的 induction pattern 后面跟了非 tactic。

严重性：Error。起始版本：4.26.0。

Lean 中基于 tactic 的 induction proof 需要使用类似 pattern matching 的写法描述各个 case。Mathlib 的 `induction'` tactic 和 Natural Number Game 中的专用自然数 induction tactic 使用另一种模式；把那种写法直接用于核心 Lean 的 `induction` 时，就可能触发这个错误。

## 常见错误形态

```lean
induction m with n n_ih
```

在基础 Lean 的 `induction` tactic 中，`with` 后面应该跟 tactic 或 case alternative，例如：

```lean
induction m with
| zero => ...
| succ n n_ih => ...
```

## 修复方向

- 使用 core Lean 风格的 case alternative。
- 如果你确实想用 Mathlib 风格，导入 Mathlib 并使用 `induction'`。
- 把 inductive case 的变量名写到对应 case 中，而不是在 `with` 后一次性给出。

## 对照

| 写法 | 结果 |
| --- | --- |
| `induction n with \| zero => ... \| succ k ih => ...` | 核心 Lean 4 标准语法 |
| `induction n with n n_ih` | 触发 `inductionWithNoAlts` |
| `induction' n with ...` | 需 `import Mathlib`，Mathlib 专用 tactic |

NNG / 旧教程里的「一行 with 两个名字」对应的是 Mathlib `induction'`，不是内置 `induction`。
