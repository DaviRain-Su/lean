# 量词

> 对应英文：[Quantifiers](https://lean-lang.org/doc/reference/latest/Basic-Propositions/Quantifiers/)，抓取日期：2026-06-16。

Lean 里的量词和函数类型/依赖对高度统一。

## 全称量词 `∀`

`∀ x, P x` 在 Lean 中直接通过 dependent function type 表示。因为 `Prop` 是 impredicative，只要函数的 codomain 是 proposition，整个函数类型本身也仍然是 proposition。

### 这意味着什么

- 证明 `∀ x, P x`，本质上就是写一个函数：给任意 `x`，返回 `P x` 的 proof。
- 使用 `∀ x, P x`，本质上就是把这个函数应用到具体实例上。

### 语法

Lean 支持：

- `∀ x, P x`
- `forall x, P x`
- 多 binder 版本
- 带括号的显式 binder

## 存在量词 `∃`

存在量词通过 `Exists` 实现。它很像 dependent pair：

- 一个 witness
- 一个证明该 witness 满足性质的 proof

但和 `Subtype` / `Sigma` 不同的是，`Exists` 本身仍然位于 `Prop` 中，因此它的 proof 不能一般性地被用来恢复可计算数据。

### 构造

- `Exists.intro`
- 匿名构造子 `⟨w, h⟩`
- tactic `exists`

### 解包

在 proposition 目标里，可以用：

- `cases`
- `match`
- `let ⟨x, hx⟩ := h`

来拆开 existential proof。

### 限制

由于 proof irrelevance，Lean 不允许你把 `∃` proof 直接当作普通数据源来提取 witness 用于任意计算。若真需要可计算 witness，应考虑：

- `Sigma`
- `Subtype`
- 或显式数据结构

## `Exists.choose`

英文页还列出：

- `Exists.choose`

它依赖 `Classical.choose`，也就是说它走的是经典选择，而不是构造性提取。

## 使用建议

- “对所有对象都成立”时，优先把它想成函数；
- “存在某个对象满足性质”时，优先把它想成 witness + 证明；
- 想保留可计算 witness 时，不要只用 `Exists`。