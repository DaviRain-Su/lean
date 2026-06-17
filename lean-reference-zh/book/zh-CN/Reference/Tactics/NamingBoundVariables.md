# 命名绑定变量

> 对应英文：[Naming Bound Variables](https://lean-lang.org/doc/reference/latest/Tactic-Proofs/Naming-Bound-Variables/)，抓取日期：2026-06-16。

当 `simp` 或 `rw` 之类 tactic 在重写过程中引入新的 binder（例如函数参数）时，Lean 会尽量根据所应用 rewrite rule 原本使用的名字，为新绑定变量选一个合理名称。必要时还会自动改成不冲突的唯一名字。

## 为什么这重要

名字本身通常不影响证明正确性，但会显著影响：

- 证明状态可读性；
- 终止证明义务里的变量名是否还能对上原始定义；
- 文档与错误消息中是否能看出“这个变量原来是谁”。

## `binderNameHint`

Lean 提供一个专门的 gadget：

- `binderNameHint`

它的语义本质上就是返回第三个参数本身，但附带元信息：告诉 `rw` / `simp` 在需要新建 binder 时，应优先使用另一个 term 里的变量名。

## 典型用途

最常见场景是：

- 某 theorem 的右侧会在重写后引入新 binder；
- 你希望重写后的 proof state 继续沿用原函数或原谓词里的名字，而不是退化成 `x`、`x_1` 一类机械名称。

这在 well-founded recursion 的终止证明预处理里尤其重要，因为变量名一旦漂移太远，证明义务会更难读。

## 限制

英文页特别指出，`binderNameHint` 的效果只在有限场景里受支持，例如：

- `simp` / `dsimp` / `rw` 在方程右侧中使用时；
- `simp` 处理 congruence rule 的假设时。

在其他位置，或者被其他 tactic 使用时，它可能不起作用。

## 使用建议

- 平时写普通证明很少需要手工用 `binderNameHint`；
- 设计会被大规模 rewrite / simplification 使用的 theorem 时，若新 binder 名很重要，可考虑显式使用它；
- 看到 proof state 里变量名“看起来很怪”时，别急着怪 tactic，本质上往往是缺少类似提示。