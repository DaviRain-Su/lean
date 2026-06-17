# simplification 与 rewriting

> 对应英文：[Simplification vs Rewriting](https://lean-lang.org/doc/reference/latest/The-Simplifier/Simplification-vs-Rewriting/)，抓取日期：2026-06-16。

`simp` 与 `rw` / `rewrite` 都会用等式引理替换 term 的一部分，但它们的目标和策略不同。

## `simp` 的目标

`simp` 主要用于把问题改写成更规范、更易读、更利于自动化的形式。它倾向于：

- 由内向外简化；
- 先简化最小子表达式，再利用这些结果解锁更外层简化；
- 把表达式推向某个约定俗成的 normal form。

设计上，`simp` 不应把一个本来可证明的目标改成不可证明的目标。

## `rw` 的目标

`rw` 更像手工控制的定点变换：

- 选择匹配的子项；
- 一次性按指定方向重写；
- 不追求规范化，只执行用户选定的变换。

默认情况下，`rw` 会选择**最左侧最外层**的匹配项。

## 二者的核心差异

- `simp`：inside-out、可迭代、多规则数据库驱动。
- `rw`：用户显式选规则、单次重写、关注局部变换。

## 何时用哪个

优先用 `simp`：

- 清理 if/match/projection/let；
- 归一化代数或逻辑表达式；
- 利用库中已有 `[simp]` 规则。

优先用 `rw`：

- 需要精确控制方向；
- 只想改某一步，而不想触发整个 simp database；
- 要保留当前表达式形状，只替换某个指定等式。

## 可覆盖默认策略

- `simp` 中使用 `↓` 可以让某条规则在进入子项前就先应用；
- `rw` 的 `occs` 配置可改变目标 occurrence 的选择。

这说明二者并非完全刚性工具，但其默认意图始终不同：`simp` 面向规范化，`rw` 面向精确改写。

## 并排示例

目标 `⊢ (if true then 1 else 2) + 0 = 1`：

```lean
-- simp：按 simp set 把 if、+0 等一并化简到 1 = 1
example : (if true then 1 else 2) + 0 = 1 := by simp

-- rw：只改你指定的那一步，其余形状保留
example : (if true then 1 else 2) + 0 = 1 := by
  rw [Nat.add_zero]   -- 目标仍是 (if true then 1 else 2) = 1
```

同一等式链里「只想动第二个 2」时（learn-proof 示例 10 的场景）：

```lean
-- rw 可指定 occurrence
example : 2 + 2 = 4 := by
  rw (occs := .pos [2]) [show 2 = Nat.succ 1 from rfl]

-- simp only 限制规则，避免牵动整个数据库
example (n : Nat) : n + 0 = n := by simp only [Nat.add_zero]
```

## 选型速查

| 你想做的事 | 优先 |
| --- | --- |
| 清掉 `+ 0`、`if true`、projection | `simp` |
| 按引理 `h` 精确替换一处 | `rw [h]` |
| 只改第二个匹配子项 | `rw (occs := ...)` 或 `conv` |
| 避免 simp 误伤其他子式 | `simp only [...]` 或 `rw` |
