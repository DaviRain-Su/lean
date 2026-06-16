# redundantMatchAlt

> 对应英文：[About: redundantMatchAlt](https://lean-lang.org/doc/reference/latest/Error-Explanations/About___--redundantMatchAlt/)，抓取日期：2026-06-16。

错误码：`lean.redundantMatchAlt`

含义：某个 match alternative 永远不会到达。

严重性：Error。起始版本：4.22.0。

这个错误发生在 pattern match 的某个分支不可能被匹配时：任何能匹配该分支 pattern 的值，都会先匹配前面的某个 alternative。

它可能出现在：

- `match` expression；
- equational function definition；
- `if let` binding；
- 带 fallback clause 的 monadic `let` binding。

## 常见原因

- 更一般的 pattern 写在更具体的 pattern 前面。
- `if let` 或 monadic let 的 fallback clause 实际永远不会用到。
- 原本想写 constructor pattern，却因为没有 namespace 前缀而被 Lean 当成 variable pattern。

例如在 `List` namespace 外写 `nil`，Lean 可能把它当作变量名，而不是 `List.nil` constructor；这样第一分支会匹配所有值，后续分支冗余。

## 修复方向

- 把更具体的 pattern 放在更一般的 pattern 前面。
- 删除永远不会触发的 fallback clause。
- 对 constructor 使用 dot-prefix notation 或完整名称，例如 `.nil` 或 `List.nil`。
- 不建议关闭该检查；如果确实需要，可用 `set_option match.ignoreUnusedAlts true`，但这通常表示代码本身需要重写。
