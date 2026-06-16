# 类型标注

> 对应英文：[Type Ascription](https://lean-lang.org/doc/reference/latest/Terms/Type-Ascription/)，抓取日期：2026-06-16。

类型标注显式告诉 Lean：某个 term 应被看作某个类型。它不仅是文档化手段，更是影响 elaboration 的重要工具。

## 后缀类型标注

最常见写法：

```lean
(e : α)
```

这里必须加括号。它告诉 Lean：

- 先按 `α` 作为 expected type 去 elaborates `e`
- 然后要求 `e` 的最终类型与 `α` definitionally equal

## `show ... from ...`

对于很长的 term，尤其是 tactic proof 或 `do` block，后缀标注有时不易读。Lean 还提供前缀形式：

```lean
show α from e
```

若右侧是 tactic proof，还可写成：

```lean
show α by
  ...
```

## 类型标注为什么重要

它解决至少三类问题：

1. **类型信息不足**：Lean 单靠源码推不出类型。
2. **推断结果不是你想要的类型**：例如某处默认成了 `Nat`，而你希望是 `Int`。
3. **需要精确控制 coercion 插入**：类型标注能显式划定 coercion 的两端。

## `(e : α)` 与 `show α from e` 的区别

二者都提供 expected type，但并不完全等价：

- 普通后缀标注主要在 elaboration 期间提供 expected type；
- `show` 形式会保证**最终推断出来的类型**就是该标注类型。

这在 generalized field notation 等场景下会出现可观察差异：某些字段解析只有 `show` 才能保证使用你写下的那个类型。

## 使用建议

- 只想轻量提示 Lean 时，优先 `(e : α)`。
- term 很长或想强调“这里的目标类型就是 α”时，用 `show α from ...` / `show α by ...`。
- 调试 coercion、field notation、隐式参数推断问题时，类型标注往往是第一手工具。