# 错误解释

> 对应英文：[Error Explanations](https://lean-lang.org/doc/reference/latest/Error-Explanations/)，抓取日期：2026-06-16。

本节提供 Lean 在处理源文件时可能生成的 error 和 warning 的解释。下面列出的所有 error name 都带有 `lean` package prefix。

错误解释页的用途不是替代具体错误消息，而是为常见错误提供稳定索引：当 VS Code、Lake 或 CI 报出某个具名错误时，可以回到这里查找该错误的含义、常见原因和修复方向。

## 当前收录的错误

| 名称 | 摘要 | 严重性 | 起始版本 |
|---|---|---|---|
| `ctorResultingTypeMismatch` | constructor 的结果 type 不是正在声明的 inductive type。 | Error | 4.22.0 |
| `dependsOnNoncomputable` | declaration 依赖 noncomputable definition，但自身没有标记为 `noncomputable`。 | Error | 4.22.0 |
| `inductionWithNoAlts` | natural-number-game 风格 `with` 子句中的 induction pattern 搭配了非 tactic。 | Error | 4.26.0 |
| `inductiveParamMismatch` | constructor 中出现 inductive type 时使用了无效参数。 | Error | 4.22.0 |
| `inductiveParamMissing` | constructor 中出现 inductive type 时缺少参数。 | Error | 4.22.0 |
| `inferBinderTypeFailed` | 无法推断 binder 的 type。 | Error | 4.23.0 |
| `inferDefTypeFailed` | 无法推断 definition 的 type。 | Error | 4.23.0 |
| `invalidDottedIdent` | dotted identifier notation 用在无效或无法推断 expected type 的位置。 | Error | 4.22.0 |
| `invalidField` | generalized field notation 以潜在歧义方式使用。 | Error | 4.22.0 |
| `projNonPropFromProp` | 尝试从 proof 中投影非 proposition 数据。 | Error | 4.23.0 |
| `propRecLargeElim` | 试图把 proof 消去到更高 type universe。 | Error | 4.23.0 |
| `redundantMatchAlt` | match alternative 永远不会到达。 | Error | 4.22.0 |
| `synthInstanceFailed` | type class instance synthesis 失败。 | Error | 4.26.0 |
| `unknownIdentifier` | identifier 无法解析为变量或常量。 | Error | 4.23.0 |

## 使用建议

- 若错误名来自 VS Code 诊断或 CI 日志，先用表格确认错误类别。
- 若错误涉及 type inference，例如 `inferBinderTypeFailed` 或 `inferDefTypeFailed`，通常应添加显式 type annotation。
- 若错误涉及 identifier 或 field resolution，例如 `unknownIdentifier`、`invalidDottedIdent`、`invalidField`，应检查 namespace、`open`、import、field notation 的 inferred type，以及是否需要 type ascription。
- 若错误涉及 computability，例如 `dependsOnNoncomputable`，应判断目标 declaration 是否确实应标记为 `noncomputable`，还是应移除对非计算原则的依赖。
- 若错误涉及 inductive declaration，应优先检查 constructor 的 result type 是否精确返回正在声明的 inductive type，并且所有参数是否按声明参数一致出现。

## 后续页面

英文参考手册为每个错误名提供单独说明页。本译文当前翻译总览索引；具体错误的长解释仍应以英文子页为准，后续可逐条补齐。