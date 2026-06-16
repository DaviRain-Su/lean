# `#reduce`

> 对应英文：[Reducing Terms / `#reduce`](https://lean-lang.org/doc/reference/latest/Interacting-with-Lean/#hash-reduce)，抓取日期：2026-06-16。

`#reduce` 会把表达式化简到 normal form。它走的是 Lean 的 definitional equality reduction 路线，而不是“编译后执行程序”的路线。

## 基本形式

```lean
#reduce e
#reduce (proofs := true) e
#reduce (types := true) e
```

默认情况下，`#reduce` 不会主动化简 proof 或 type 中的内容。可以用：

- `proofs := true`
- `types := true`

来打开对应行为。

## `#reduce` 与 `#eval` 的区别

- `#reduce`：使用 Lean 的 reduction rule，把 term 化到 normal form；更偏逻辑和 definitional equality。
- `#eval`：把表达式编译运行；更偏程序执行和实际结果。

如果你关心“Lean 逻辑上是否把这两个 term 当成同一个”，应优先考虑 `#reduce`。如果只关心程序跑出来是什么值，优先用 `#eval`。

## 使用场景

- 检查某个 definition 是否按预期展开；
- 观察 pattern matching、recursor、`let`、constant unfolding 等规约结果；
- 调试为什么某个 `rfl`/`simp`/rewrite 没有按预期生效；
- 教学时展示 core-style reduction 行为。

## 注意事项

- 对复杂 type 或 proposition 使用 `types := true` 可能代价较高。
- `#reduce` 不是性能工具；它反映的是逻辑定义与 reduction 规则，不一定对应最优运行时代码。
- 某些 term 在运行时有高效 primitive，但在逻辑模型里定义较慢；此时 `#reduce` 的表现可能远慢于 `#eval`。
