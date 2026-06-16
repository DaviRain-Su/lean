# propRecLargeElim

> 对应英文：[About: propRecLargeElim](https://lean-lang.org/doc/reference/latest/Error-Explanations/About___--propRecLargeElim/)，抓取日期：2026-06-16。

错误码：`lean.propRecLargeElim`

含义：试图把 proof 消去到更高的 type universe。

严重性：Error。起始版本：4.23.0。

这个错误发生在试图对 proposition 的 proof 做 pattern match，并产生非 proposition universe 中的数据时。Lean 的类型论通常不允许从 `Prop` 做 large elimination：propositional recursor 的 motive 必须仍是 proposition。

即使整个外层 expression 的 type 是 proposition，只要中间 `let` 或 `match` 先从 proof 生成了普通数据，也会触发这个错误。

## 为什么禁止

`Prop` 中的 proof 具有 proof irrelevance：同一 proposition 的所有 proof 被视为相同。如果允许从 proof 中提取普通数据，就可能得到不一致结论。例如从两个 existential proof 中分别提取不同 witness，却又因为 proof irrelevance 认为两个 proof 相等，会破坏逻辑。

## 修复方向

- 把 match/recursor 向外移动，让消去目标本身是正在证明的 proposition。
- 用 continuation-passing 风格：把 unpack 出来的值只用于构造另一个 proof。
- 如果确实需要返回数据，把输入从 proposition 改为 `Type` 中的数据结构，例如 dependent pair，而不是 `∃` proof。

经验规则：从 `Prop` 中拆出来的东西，只能用于继续证明 `Prop`，不能作为普通程序数据返回。
