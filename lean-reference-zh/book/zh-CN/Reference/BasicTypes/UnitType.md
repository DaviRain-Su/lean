# Unit 类型

> 对应英文：[The Unit Type](https://lean-lang.org/doc/reference/latest/Basic-Types/The-Unit-Type/)，抓取日期：2026-06-16。

`Unit` 是“恰好只有一个元素的类型”。这个唯一元素写作：

```lean
()
```

从程序设计角度，它相当于“函数返回了控制流，但没有额外信息”。

## 为什么不是空类型

`Unit` 不是“没有值”，而是“有一个完全无信息的值”。

- `Unit`：有且仅有一个值；
- `Empty`：根本没有值。

因此：

- `Unit` 适合表示“返回 nothing”；
- `Empty` 适合表示“不可能到达”。

## monad 中的意义

对于任意 monad `m`：

- `m α`：有副作用并返回 `α`
- `m Unit`：有副作用，但不返回有意义的值

所以很多“只执行动作”的 `IO` 程序都返回 `IO Unit`。

## `Unit` 与 `PUnit`

Lean 有两个 unit-like 类型：

- `Unit`：位于最小非命题 universe；
- `PUnit`：universe-polymorphic，可出现在任意非命题 universe。

实际实现上，`Unit` 本质是 `PUnit.{1}` 的特化。通常优先使用 `Unit`；只有遇到 universe 约束时再考虑 `PUnit`。

## definitional equality

所有 unit-like 类型的元素彼此 definitionally equal。对 `Unit`/`PUnit` 来说，这意味着：

- 不存在多个可区分的运行值；
- 证明和程序里都可把它视作“唯一占位值”。

## 使用建议

- 函数/动作“没有返回值”时用 `Unit`；
- 仅在需要 universe-polymorphic unit 时用 `PUnit`；
- 若想表达“不可能”，不要误用 `Unit`，应改用 `Empty`。