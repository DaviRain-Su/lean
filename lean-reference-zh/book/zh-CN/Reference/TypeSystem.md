# 类型系统

> 对应英文：[The Type System](https://lean-lang.org/doc/reference/latest/The-Type-System/)，抓取日期：2026-06-16。

term，也称为 expression，是 Lean 核心语言中意义的基本单位。用户写下的语法会由 elaborator 转换成 term。Lean 的类型系统把 term 与它们的 type 关联起来，而 type 本身也是 term。可以把 type 理解为表示集合，把 term 理解为这些集合中的单个元素。如果一个 term 在 Lean 类型论规则下拥有某个 type，那么它就是 well-typed。只有 well-typed term 才有意义。

Lean 的 term 构成一个依赖类型 λ-calculus：它们包括函数抽象、函数应用、变量和 `let` 绑定。除了绑定变量，term language 中的变量还可以指向 constructor、type constructor、recursor、已定义常量或 opaque constant。constructor、type constructor、recursor 和 opaque constant 不会被替换；已定义常量则可以被它们的定义替换。

一个 derivation 通过明确指出所用推理规则，展示某个 term 是 well-typed 的。隐含地，well-typed term 可以代替展示其 well-typedness 的 derivation。Lean 的类型论足够显式，可以从 well-typed term 重构 derivation；这大幅降低了存储完整 derivation 的开销，同时仍有足够表达力表示现代研究数学。这意味着 proof term 足以作为定理为真的证据，并且适合独立验证。

除了拥有 type，term 之间还通过 definitional equality 关联。definitional equality 是一种机械可检查的关系，它根据 term 的计算行为，在语法上把 term 视为相等。definitional equality 包括以下 reduction 形式：

## β（beta）

把函数抽象应用到实参时，用实参替换绑定变量。

## δ（delta）

把已定义常量的出现替换为其定义值。

## ι（iota）

对目标是 constructor 的 recursor 进行规约，也就是 primitive recursion。

## ζ（zeta）

把 `let` 绑定的变量替换为其定义值。

## quotient reduction

当 quotient type 的函数 lifting operator 应用于 quotient 的元素时进行规约。

所有可能 reduction 都已经执行完的 term 处于 normal form。

## η 等价与证明无关性

definitional equality 包括函数和单构造子归纳类型的 η-equivalence。也就是说，`fun x => f x` 与 `f` definitionally equal；如果 `S` 是一个有字段 `f1` 和 `f2` 的结构，那么 `S.mk x.f1 x.f2` 与 `x` definitionally equal。

它还具有 proof irrelevance：同一 proposition 的任意两个 proof 都 definitionally equal。definitional equality 是 reflexive 和 symmetric 的，但不是 transitive 的。

## conversion

conversion 使用 definitional equality：如果两个 term definitionally equal，而某个 term 的 type 是其中一个，那么它也可以拥有另一个作为 type。因为 definitional equality 包括 reduction，所以 type 可以由对数据的计算产生。

## 可计算的类型

Lean 中的基本 type 包括 universe、function type、quotient former `Quot`，以及 inductive type 的 type constructor。和任意其他 type 中的 term 一样，已定义常量、recursor 应用、函数应用、公理或 opaque constant 也可以产生 type。

## 后续小节

英文参考手册随后把本章展开为：

- 4.1 Functions
- 4.2 Propositions
- 4.3 Universes
- 4.4 Inductive Types
- 4.5 Quotients