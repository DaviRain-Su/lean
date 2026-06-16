# `grind`：constraint propagation

> 对应英文：[Constraint Propagation](https://lean-lang.org/doc/reference/latest/The--grind--tactic/Constraint-Propagation/)，抓取日期：2026-06-16。

constraint propagation 主要在白板上的 `True` / `False` bucket 上工作。每当某个 term 被判成真或假，`grind` 就触发一系列前向规则，把其逻辑后果继续写回白板。

## 传播来源

### 布尔连接词

例如：

- 若 `A` 为 `True`，则 `A ∨ B` 为 `True`；
- 若 `A ∧ B` 为 `True`，则 `A` 和 `B` 都为 `True`；
- 若 `A ∧ B` 为 `False`，则至少一个分量为 `False`。

### 归纳类型

- 若同一归纳类型的两个不同 constructor 被判等，则推出矛盾；
- 若同一 constructor 的两个值被判等，则其参数也被判等。

### 投影与 cast

- 从 `(x, y) = (x', y')` 推出各分量相等；
- cast term 会尽快与原 term 关联起来；
- definitional reduction 结果也会被传播，例如 `(a, b).1 = a`。

## 向上与向下传播

英文页把传播分成两类：

- **upward propagation**：由子项推出整体事实；
- **downward propagation**：由整体事实推出子项事实。

这使 `grind` 不只是“记录已有事实”，而是在白板上持续做局部逻辑闭包。

## 使用建议

- 只要问题含有大量布尔连接词、constructor 判等、tuple/structure 投影，constraint propagation 就可能单独解决很多目标；
- 若 `grind` 失败，可查看 diagnostics 中的 true/false buckets，判断缺了哪些传播前提。
