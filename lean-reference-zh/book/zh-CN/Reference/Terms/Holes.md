# Hole

> 对应英文：[Holes](https://lean-lang.org/doc/reference/latest/Terms/Holes/)，抓取日期：2026-06-16。

hole 或 placeholder term 表示“这里没有给 elaborator 明确指令”。在 term 中，如果 surrounding context 只允许一个 type-correct term，hole 可以自动填充；否则就是错误。在 pattern 中，hole 表示可匹配任意值的 universal pattern。

## `_`

最基本的 hole 写作下划线：

```lean
_
```

它依赖上下文中的 type 和约束，由 unification 自动求解。

## Synthetic hole

证明中有时希望显式引入未知值。这时可以使用 synthetic hole：

```lean
?x
?_
```

synthetic hole 不会被普通 unification 自动求解，而且同一个 synthetic hole 名称可以出现在多个位置。它主要用于 tactic proof，与 proof 中的 metavariable 机制关系最密切。

## 使用建议

- 如果 Lean 明显能从上下文唯一确定值，普通 `_` 很方便。
- 如果想在交互式证明中留下待填目标，用 `?_` 或具名 `?x` 更合适。
- 如果 hole 太多，错误信息会变差；在库代码里，最终应把 hole 替换为显式 term。
