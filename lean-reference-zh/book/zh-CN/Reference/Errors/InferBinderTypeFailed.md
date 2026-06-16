# inferBinderTypeFailed

> 对应英文：[About: inferBinderTypeFailed](https://lean-lang.org/doc/reference/latest/Error-Explanations/About___--inferBinderTypeFailed/)，抓取日期：2026-06-16。

错误码：`lean.inferBinderTypeFailed`

含义：无法推断 binder 的 type。

严重性：Error。起始版本：4.23.0。

这个错误发生在 declaration header 或 local binding 中某个 binder 的 type 没有完整指定，Lean 也无法从上下文推断出来。通常可以通过显式标注 binder type，或在使用位置提供更多 type 信息来解决。

如果问题出现在 declaration header 中，这个错误常常会和 `lean.inferDefTypeFailed` 同时出现。

## 重要规则

如果 declaration 已经显式标注了 resulting type，即使该 type 中有 hole，Lean 也不会用 definition body 的信息来推断参数 type。因此，原本能从 body 推断出的参数，在加了返回 type annotation 后可能需要显式写出。

在 theorem declaration 中，body 永远不会用于推断 binder type；无法从 theorem type 其余部分推断的 binder 必须带 type annotation。

## 常见原因

- 写了 `def identity x := x`，但 `x` 的 type 完全没有约束。
- 写了返回 type annotation，例如 `def plusTwo x : Nat := x + 2`，导致 Lean 不能用 body 推断 `x : Nat`。
- 试图给 `example` 命名：`example trivial_proof : True := ...`。`example` 没有名称，`trivial_proof` 会被当作 binder。
- 试图在一个 `def` 或 `opaque` 中一次声明多个常量。
- 在 structure 中把多个 field 名写在同一行却没有使用支持的括号语法。

## 修复方向

- 给 binder 显式写 type：`(x : α)`。
- 给 definition 显式提供足够的 type 参数。
- 使用 `def` 或 `theorem` 命名 declaration，不要命名 `example`。
- 多个常量分开声明。
- structure field 多个同类型字段要按支持的语法写，或分行写。
