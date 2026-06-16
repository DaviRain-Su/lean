# `mvcgen` proof mode

> 对应英文：[Proof Mode](https://lean-lang.org/doc/reference/latest/The--mvcgen--tactic/Proof-Mode/)，抓取日期：2026-06-16。

stateful goal 可在 `mvcgen` 提供的 special proof mode 下证明。此时 goal 不再只是普通 `Prop`，而会以 stateful entailment 的形式显示。

## 显示形式

proof mode 中，goal 以：

```text
(… : …)* ⊢ₛ …
```

的形式显示。它包含两层上下文：

- 普通 Lean context：Lean 变量与假设；
- stateful context：关于 monadic state 的断言。

整个 goal 等价于一个 `SPred.entails` 断言。

## 何时会出现

对具体 monad，`mvcgen` 往往会把 stateful goal 简化掉；但在 monad-polymorphic theorem 中，stateful goal 更容易保留下来，这时 proof mode 就非常重要。

## 特殊 tactic

proof mode 提供一组专门操作 stateful context 的 tactic。这些 tactic 在 tactic reference 中单独说明。普通 Lean tactic 仍然可用，但 proof mode 的专用工具会更贴近 stateful assertion 的结构。

## 使用建议

- 若 goal 还保留 `⊢ₛ` 形式，就不要把它误当成普通 proposition；
- 优先理解当前 stateful assumptions 的含义，再决定是继续 `mvcgen` 风格证明，还是把部分内容转成普通 proposition 后交给通用 tactic。
