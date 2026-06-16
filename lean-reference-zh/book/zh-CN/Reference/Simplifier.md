# Simplifier

> 对应英文：[The Simplifier](https://lean-lang.org/doc/reference/latest/The-Simplifier/)，抓取日期：2026-06-16。

simplifier 是 Lean 中最常用的功能之一。它基于一组 simplification rule 数据库，对 term 进行由内向外的 rewriting。simplifier 高度可配置，许多 tactic 都会以不同方式使用它。

最常见的入口是 `simp` tactic。它会尝试把 goal 和 hypothesis 化为 simp normal form，并用 database 中的 rewrite rule、已知假设、definition unfolding 和一些内置规约规则进行简化。

## 15.1 调用 simplifier

通常通过 tactic 调用 simplifier：

```lean
simp
simp [some_definition]
simp at h
simp [h₁, h₂] at *
```

常见用法包括：

- 简化目标；
- 简化某个 hypothesis；
- 使用本地 hypothesis 或指定 theorem 作为额外 rewrite rule；
- 展开某些 definition；
- 同时简化所有 goal 和 hypothesis。

## 15.2 Rewrite rule

simplifier 的核心是 rewrite rule。典型 rewrite rule 是等式或 iff theorem，它告诉 `simp` 可以把某种形式替换为更简单形式。

将 theorem 标记为 simp lemma 通常使用 attribute：

```lean
@[simp]
theorem name : lhs = rhs := ...
```

或者对已有 theorem 使用：

```lean
attribute [simp] name
```

rewrite rule 的方向很重要。`simp` 试图把 term 化为 normal form，因此不应添加会导致循环或使表达式变大的规则。

## 15.3 Simp set

simp set 是 simplifier 使用的规则集合。默认 simp set 来自当前导入的库和当前 scope 中可见的 `[simp]` attribute。用户可以通过 `simp [x]` 临时加入规则，也可以用 `simp [-x]` 临时移除规则。

`local` 和 `scoped` attribute 也可影响 simp set 的可见性：

```lean
attribute [local simp] local_rule
attribute [scoped simp] scoped_rule
```

## 15.4 Simp normal form

`simpa` 或 `simp` 的目标是把表达式变成 simp normal form。normal form 不是由 Lean kernel 固定定义的数学概念，而是由当前 simp set、配置和内置规则决定。改变 simp lemma 集合可能改变 normal form。

良好的 simp lemma 应把表达式推向稳定、可预测、较简单的形式。坏的 simp lemma 可能让 `simp` 变慢、循环，或产生难以阅读的 normal form。

## 15.5 Terminal 与 non-terminal position

某些 simplification 行为取决于表达式位置：一个 term 是否位于 terminal position，会影响 simplifier 是否继续向内部递归，或是否把某些规则视为最终结果。理解这一点有助于调试为什么某条 simp lemma 没有在预期位置触发。

## 15.6 配置 simplification

`simp` 有许多配置选项，可控制是否展开 definition、是否使用某些规则、如何处理 proof、是否显示 trace 等。调试时常用：

```lean
set_option trace.Meta.Tactic.simp true
```

trace 可以显示 simplifier 尝试了哪些规则、使用了哪些 rewrite，以及某些规则为什么没有生效。

## 15.7 Simplification 与 rewriting

`simp` 和 `rw` 都可以使用等式重写，但目标不同。

- `rw` 是精确 rewriting：按用户指定规则和方向改写特定匹配项。
- `simp` 是规范化过程：使用整个 simp set 反复简化，直到达到 normal form。

因此，`rw` 更适合需要控制每一步证明时使用；`simp` 更适合清理代数、数据结构、if/match、逻辑 connective 等常见表达式。