# `grind`：E-matching

> 对应英文：[E‑matching](https://lean-lang.org/doc/reference/latest/The--grind--tactic/E___matching/)，抓取日期：2026-06-16。

E-matching 是 SMT solver 中广泛使用的一种过程：用 ground term 去实例化量化定理。`grind` 用它高效地把库中的 theorem 实例化为当前白板上可用的新事实。

## 白板视角

`grind` 会维护一张 pattern 索引表。当白板上出现某些 term、能够匹配某条 theorem 的 pattern 时，E-matching engine 就尝试实例化该 theorem，并把得到的新事实重新写回白板。

这与 congruence closure 配合尤其强：等价类中的 term 也能触发 pattern，从而发现原本不明显的推论。

## `grind_pattern`

用户可用：

```lean
grind_pattern theoremName => pattern1, pattern2
```

显式指定 pattern。若给出多个 pattern，它们构成 multi-pattern，必须同时匹配后才会实例化该 theorem。

`where` 子句还能添加约束，限制何时允许实例化，避免无界爆炸。

## `[grind]` attribute 家族

`grind` 提供一组 attribute，让系统用启发式自动选择 pattern：

- `@[grind]`
- `@[grind!]`
- `@[grind?]`
- `@[grind!?]`

其中：

- `?` 版本会显示选到的 pattern；
- `!` 版本会更严格，倾向选 minimal indexable subexpression。

## 何时重要

- 库 theorem 想让 `grind` 自动发现时；
- match auxiliary equation、membership、inequality 等需要按模式触发时；
- 既不想全量暴力搜索，也不想手工每次显式应用 theorem 时。

## 调试

- `trace.grind.ematch.instance` 可输出每次实例化的 theorem；
- `grind?` / `grind!?` 有助于调试 pattern 选择是否合理。
