# invalidDottedIdent

> 对应英文：[About: invalidDottedIdent](https://lean-lang.org/doc/reference/latest/Error-Explanations/About___--invalidDottedIdent/)，抓取日期：2026-06-16。

错误码：`lean.invalidDottedIdent`

含义：dotted identifier notation 用在无效或不支持的上下文中。

严重性：Error。起始版本：4.22.0。

dotted identifier notation 允许省略 identifier 的 namespace，前提是 Lean 能根据 type 信息推断它。例如 `.some`、`.none`、`.succ` 等写法依赖 expected type 来决定完整名称。

这个 notation 只能用于 Lean 能推断当前 term type 的位置。如果 type 信息不足，就会报这个错误。推断出的 type 也不能是 type universe，例如 `Prop` 或 `Type`；dotted identifier notation 不支持在这些 type universe 上使用。

## 常见原因

- 没有写返回 type，导致 Lean 无法推断 `.reverse` 之类 identifier 的 namespace。
- 期望 type 是 `Prop` 或 `Type`，但写了 `.true`、`.false` 等 dotted identifier。
- 误以为 Lean 会根据参数 type 推断 namespace；dotted identifier 实际根据 expected result type 推断。

## 修复方向

- 给 expression 或 declaration 添加 type annotation。
- 写完整限定名，例如 `List.reverse`。
- 如果想根据参数 type 调用函数，使用 generalized field notation，例如 `xs.reverse`。
- 对 proposition 做 case analysis 时，如果想匹配 boolean constructor，先显式使用 `decide` 把 proposition 转成 `Bool`。
