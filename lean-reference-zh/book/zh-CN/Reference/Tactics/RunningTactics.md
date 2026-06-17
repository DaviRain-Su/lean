# 运行 tactic

> 对应英文：[Running Tactics](https://lean-lang.org/doc/reference/latest/Tactic-Proofs/Running-Tactics/)，抓取日期：2026-06-16。

`tactic` 通过 `by` term 嵌入到普通 Lean term 中。也就是说，只要某个位置允许出现 term，就可以在那里写 tactic proof。

## 两种基本写法

缩进风格：

```lean
by
  tac1
  tac2
```

显式大括号和分号风格：

```lean
by { tac1; tac2 }
```

这两种写法在语义上等价，区别主要在排版习惯和局部可读性。

## `by` 做了什么

当 elaborator 遇到 `by` 时，它不会把后面内容当作普通 term 直接 elaborates，而是调用 tactic interpreter。tactic interpreter 逐步修改 proof state，最终构造出一个满足当前位置 expected type 的 proof term。

因此：

- `by` 是 term 语法的一部分；
- tactic proof 最终仍会生成普通 Lean term；
- tactic proof 可以出现在 theorem、`have`、`let`、匿名 `example` 等任何需要 term 的位置。

## 使用建议

- 短而直接的证明可直接写 term；
- 当证明需要分解 goal、引入假设、反复 rewrite 或依赖自动化时，`by` 往往更清晰；
- 若 proof state 在多步之间演化明显，优先使用缩进式 tactic block，便于阅读和维护。

## 示例

定理里的 `by`：

```lean
theorem add_zero (n : Nat) : n + 0 = n := by
  rw [Nat.add_zero]
```

`have` 引入局部引理：

```lean
example (a b : Nat) (h : a = b) : b = a := by
  have h' : b = a := h.symm
  exact h'
```

`let` 绑定中间项（证明里较少用，元编程里更常见）：

```lean
example (n : Nat) : n + 0 = n := by
  let h := Nat.add_zero n
  exact h
```

`by` 块最终都会 elaboration 成一个 proof term；可用 `#check` 查看（可能很大，默认会被折叠）。
