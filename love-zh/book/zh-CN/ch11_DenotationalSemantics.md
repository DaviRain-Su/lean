# 第 11 章 指称语义

> 已对照 Lean-zh PDF 与 `LoVe11_DenotationalSemantics_Demo.lean` 人工校对（原 PDF 8100–8555 行）。

英文原版与练习：[logical_verification_2025](https://github.com/lean-forward/logical_verification_2025)

我们现在回顾指定编程语言语义的第三种方式：**指称语义**（denotational semantics）。指称语义直接将程序的含义指定为一个数学对象。如果说操作语义对应于理想化的解释器、Hoare 逻辑对应于理想化的验证器，那么指称语义就对应于理想化的编译器：一个将源程序不是翻译成汇编语言，而是直接翻译成数学对象的编译器。

本章核心内容紧密仿照 *Concrete Semantics: With Isabelle/HOL* 一书的第 11 章。

## 11.1 组合性

指称语义将每个程序的含义定义为一个数学对象。抽象地看，它可以被视为一个函数

```
⟦ ⟧ : syntax → semantics
```

指称语义的一个关键性质是**组合性**（compositionality）：复合语句的含义应当用其各组成部分的含义来定义。考虑下面这个借助大步语义 `⟹` 给出的直截了当的定义：

```lean
-- 非组合性的定义（示意）
-- ⟦S⟧ = {(s, t) | (S, s) ⟹ t}
```

该定义指定了所期望的语义，但由于缺乏组合性，它并不构成指称语义：复合语句（顺序组合、`if`–`then`–`else` 和 `while`）的含义是直接给出的，而没有使用其子语句的指称。

完全组合性的定义使我们能够对方程方式进行程序推理，这通常比使用 `⟹` 的引入、消去和反转规则更为方便。本质上，我们希望得到如下形式的结构递归方程：

```
⟦S; T⟧               = … ⟦S⟧ … ⟦T⟧ …
⟦if B then S else T⟧ = … ⟦S⟧ … ⟦T⟧ …
⟦while B do S⟧       = … ⟦S⟧ …
```

其中右端除了作为 `⟦ ⟧` 的参数出现的 `S` 和 `T` 之外，不应再出现 `S` 和 `T`。

算术表达式上的求值函数

```
eval : AExp → (String → ℤ) → ℤ
       \_________/   \_______/
         syntax        semantics
```

满足如下方程：

```lean
-- eval (AExp.add e₁ e₂) env = eval e₁ env + eval e₂ env
```

这是一个指称语义，因为 `AExp.add e₁ e₂` 的语义是用 `e₁` 和 `e₂` 的语义来定义的。

指称语义天然适用于算术表达式，也适用于函数式程序。现在我们希望为指令式程序建立一个方便的指称语义。由于 `while` 循环不能保证终止，我们需要发展一些额外的数学概念，才能表述所期望的语义。

## 11.2 关系型指称语义

确定性语言的指称语义通常给为从前状态到后状态的函数，但**关系**（relation）更一般，也更便于操作。我们介绍一种关系型指称语义。

程序指称语义的数学对象类型为 `Set (State × State)`。关系型方法也曾用于大步语义，其形式为类型 `State → State → Prop` 的谓词。这两种类型是同构的，但 `Set α`（定义为 `α → Prop`）支持许多有用的运算和记法，例如 `∅`、`∪`、`∩`、`∈` 以及 `{… | …}`（见[第 7 章](ch07_EffectfulProgramming.md)）。

我们的语义称为 `denote`，`⟦ ⟧` 是它的语法糖。我们先给出定义的前四个方程，将 `while` 留到后面：

```lean
def denote : Stmt → Set (State × State)
  | Stmt.skip             => Id
  | Stmt.assign x a       => {(s, t) | t = s[x ↦ a s]}
  | Stmt.seq S T          => denote S ◯ denote T
  | Stmt.ifThenElse B S T =>
    (denote S ⇃ B) ∪ (denote T ⇃ (fun s ↦ ¬ B s))
  | Stmt.whileDo B S      => sorry
```

`skip` 语句被解释为状态上的恒等关系——即所有形如 `(s, s)` 的元组构成的集合。这捕获了 `skip` 的期望语义：后状态始终与前状态相同。

赋值的语义是这样一个元组集合：其中第二个分量反映了赋值的结果。

顺序组合的语义优雅地表达为关系组合 `◯`，由以下方程定义：

```lean
def comp {α : Type} (r₁ r₂ : Set (α × α)) : Set (α × α) :=
  {(a, c) | ∃b, (a, b) ∈ r₁ ∧ (b, c) ∈ r₂}

infixl:90 " ◯ " => comp
```

`if`–`then`–`else` 语句的语义给为两个分支语义的并集，并限制为只包含第一个分量使布尔条件为真或为假的元组，具体取决于分支。限制算子 `⇃` 定义为

```lean
def restrict {α : Type} (r : Set (α × α)) (p : α → Prop) : Set (α × α) :=
  {(a, b) | (a, b) ∈ r ∧ p a}

infixl:90 " ⇃ " => restrict
```

注意两个退化情形：若 `P := (fun _ ↦ True)`，则 `r ⇃ P = r`；若 `P := (fun _ ↦ False)`，则 `r ⇃ P = ∅`。

当我们试图定义 `while` 循环的语义时，困难出现了。我们本想写成

```lean
-- ((denote S ◯ denote (Stmt.whileDo B S)) ⇃ B)
-- ∪ (Id ⇃ (fun s ↦ ¬ B s))
```

但这由于在对 `Stmt.whileDo B S` 的递归调用而**无基**（ill-founded）。我们需要别的办法。我们在右端寻找的是满足方程

```
X = ((denote S ◯ X) ⇃ B) ∪ (Id ⇃ (fun s ↦ ¬ B s))
```

的某个项 `X`。我们寻找的是数学家所说的**不动点**（fixpoint）。接下来四节致力于构造一个算子 `lfp`，它为给定方程计算不动点。借助 `lfp`，我们将能够如下定义 `while` 循环的语义：

```lean
| Stmt.whileDo B S =>
  lfp (fun X ↦ ((denote S ◯ X) ⇃ B)
    ∪ (Id ⇃ (fun s ↦ ¬ B s)))
```

## 11.3 不动点

`f` 的**不动点**（或**固定点**）是方程

```
X = f X
```

中 `X` 的解。一般而言，对某些 `f` 不动点可能根本不存在；例如，若 `f := Nat.succ`，则不存在满足 `X = Nat.succ X` 的值 `X`。也可能存在多个不动点；例如，若 `f := (fun x ↦ x)`，则任意 `X` 都是 `X = (fun x ↦ x) X = X` 的解。在 `f` 的某些条件下，可以保证存在唯一的最小不动点和唯一的最大不动点。

考虑如下不动点方程，其中 `X : ℕ → Prop`：

```
X = (fun n : ℕ ↦ n = 0 ∨ (∃m : ℕ, n = m + 2 ∧ X m))
```

该方程是右端具有正确格式的方程的 β-归约变体：

```
X = (fun (P : ℕ → Prop) (n : ℕ) ↦ n = 0 ∨ (∃m : ℕ, n = m + 2 ∧ P m)) X
```

一个解是 `X := Even`，即刻画偶自然数的谓词。回想一下，我们在[第 6.5 节](ch06_InductivePredicates.md#65-消去)证明了反转规则

```lean
theorem Even_Iff (n : ℕ) :
    Even n ↔ n = 0 ∨ (∃m : ℕ, n = m + 2 ∧ Even m) :=
  sorry
```

事实证明，`Even` 是唯一的不动点。一般而言，最小不动点和最大不动点可能不同。考虑方程

```
X = (fun P ↦ P) X
```

其中 `X : ℕ → Prop`。最小不动点是 `fun _ ↦ False`，最大不动点是 `fun _ ↦ True`。按惯例，我们有 `False < True`，从而 `(fun _ ↦ False) < (fun _ ↦ True)`。类似地，对任意有居元素的类型 `α`，有 `∅ < @Set.univ α`。

对于 `while` 循环的语义，`X` 的类型将是 `Set (State × State)`，即状态之间的关系，而 `f` 将对应于再执行循环的一次额外迭代（若条件 `B` 为真）或恒等（若 `B` 为假）。

对于 `while` 的语义，我们应当使用哪个不动点？最大不动点还会允许循环和发散的执行，而最小不动点只允许有限（但可能无界）的执行。因此我们选择最小不动点。

## 11.4 单调函数

上文我们声称，在 `f` 的某些条件下，最小不动点和最大不动点保证存在。现在该把这一点说得更精确些。设 `α` 和 `β` 为任意类型，各自配备偏序 `≤`。若对所有 `a, b` 有 `a ≤ b → f a ≤ f b`，则函数 `f : α → β` 是**单调**（monotone）的。若 `f : Set α → Set α` 是单调的，则它承认最小和最大不动点。

集合上的许多运算（例如并 `∪`）、关系上的运算（例如组合 `◯`）以及函数上的运算（例如恒等函数 `fun x ↦ x`、常值函数 `fun _ ↦ k`、复合 `∘`）是单调的或保持单调性。当然，并非所有函数都是单调的。下面是 `Set α` 上一个非单调函数 `f` 的例子，其中偏序为 `⊆`：

```lean
-- f A = (if A = ∅ then Set.univ else ∅)
```

若 `α` 有居元素，则 `∅ ⊆ Set.univ`，但 `f ∅ = Set.univ ⊈ ∅ = f Set.univ`。

在 Lean 中，我们可以如下定义单调性：

```lean
def Monotone {α β : Type} [PartialOrder α] [PartialOrder β]
  (f : α → β) : Prop :=
  ∀a₁ a₂, a₁ ≤ a₂ → f a₁ ≤ f a₂
```

## 11.5 完备格

要为集合（包括关系）定义 `lfp`，我们需要两个运算：子集 `⊆ : Set α → Set α → Prop` 和**大交**（big intersection）`⋂ : Set (Set α) → Set α`，后者可定义为

```lean
-- ⋂ X = {a | ∀A, A ∈ X → a ∈ A}
```

若 `X` 是有限集 `{A₁, …, Aₙ}`，则 `⋂ X = A₁ ∩ ⋯ ∩ Aₙ`。

我们可以更一般地定义 `lfp`，使其不仅对集合有效，而且对称为**完备格**（complete lattice）的代数结构的所有实例都有效。完备格由以下部分组成：

1. 一个类型 `α`；
2. 一个偏序 `≤ : α → α → Prop`（即一个自反、反对称且传递的二元谓词）；
3. 一个算子 `Inf : Set α → α`，称为**下确界**（infimum）。

`Inf` 满足以下两个条件：

1. `Inf A` 是 `A` 的**下界**：对所有 `b ∈ A`，有 `Inf A ≤ b`；
2. `Inf A` 是**最大下界**：对所有满足 `∀a, a ∈ A → b ≤ a` 的 `b`，有 `b ≤ Inf A`。

条件 1 和 2 一起保证 `Inf A` 是唯一的最大下界。格算子 `≤` 和 `Inf` 分别推广了 `⊆ : Set α → Set α → Prop` 和 `⋂ : Set (Set α) → Set α`。请注意，`Inf A` 未必属于 `A`。例如，实数 `ℝ` 上的开区间 `]a, b[` 的下确界是 `a ∉ ]a, b[`。集合的下确界是极小元概念的一种推广。

以下是完备格的一些例子：

- 对所有类型 `α`，`Set α` 关于 `⊆` 和 `⋂`；
- `Prop` 关于 `→` 和 `fun A ↦ ∀a ∈ A, a`；
- `ENat := ℕ ∪ {∞}` 关于 `≤` 及合适的下确界算子；
- `EReal := ℝ ∪ {-∞, ∞}` 关于 `≤` 及合适的下确界算子。

若 `α` 是完备格，则 `β → α` 也是完备格。若 `α` 和 `β` 是完备格，则 `α × β` 也是完备格。在这两种情况下，`≤` 和 `Inf` 都是按分量定义的。

以下是完备格的一些反例：`ℕ`、`ℤ`、`ℚ` 和 `ℝ` 关于 `≤`。问题在于无法为 `∅` 指定最大元素以赋予 `Inf`。另一个反例是 `ERat := ℚ ∪ {-∞, ∞}`，因为 `{q | 2 < q * q}` 的下确界 `sqrt 2` 不在 `ERat` 中。

在 Lean 中，用类型类表示完备格是很自然的：

```lean
class CompleteLattice (α : Type)
  extends PartialOrder α : Type where
  Inf    : Set α → α
  Inf_le : ∀A b, b ∈ A → Inf A ≤ b
  le_Inf : ∀A b, (∀a, a ∈ A → b ≤ a) → b ≤ Inf A
```

类型 `Set α` 是该类型类的一个实例：

```lean
instance Set.CompleteLattice {α : Type} :
  CompleteLattice (Set α) :=
  { @Set.PartialOrder α with
    Inf         := fun X ↦ {a | ∀A, A ∈ X → a ∈ A}
    Inf_le      := by aesop
    le_Inf      := by aesop }
```

## 11.6 最小不动点

借助完备格，我们可以定义最小不动点算子：

```
lfp f = Inf {x | f x ≤ x}
```

在 Lean 中：

```lean
def lfp {α : Type} [CompleteLattice α] (f : α → α) : α :=
  CompleteLattice.Inf {a | f a ≤ a}
```

我们在[第 6 章](ch06_InductivePredicates.md)中简要提及的 Knaster–Tarski 定理[^knaster-tarski]告诉我们，对完备格上的任意单调函数 `f`，有以下性质：

- `lfp f` 是不动点：`lfp f = f (lfp f)`；
- `lfp f` 小于任何其他不动点：`X = f X → lfp f ≤ X`。

[^knaster-tarski]: https://en.wikipedia.org/wiki/Knaster-Tarski_theorem

`lfp` 作为不动点的定理在演示文件中记为 `lfp_eq`：

```lean
theorem lfp_eq {α : Type} [CompleteLattice α] (f : α → α)
      (hf : Monotone f) :
    lfp f = f (lfp f) :=
  sorry
```

## 11.7 关系型指称语义（续）

有了 `lfp`，我们就能兑现承诺，完成 WHILE 程序指称语义的定义：

```lean
def denote : Stmt → Set (State × State)
  | Stmt.skip             => Id
  | Stmt.assign x a       => {(s, t) | t = s[x ↦ a s]}
  | Stmt.seq S T          => denote S ◯ denote T
  | Stmt.ifThenElse B S T =>
    (denote S ⇃ B) ∪ (denote T ⇃ (fun s ↦ ¬ B s))
  | Stmt.whileDo B S      =>
    lfp (fun X ↦ ((denote S ◯ X) ⇃ B)
      ∪ (Id ⇃ (fun s ↦ ¬ B s)))

notation (priority := high) "⟦" S "⟧" => denote S
```

为验证我们的定义，可以证明指称语义与大步语义之间的如下联系：

```lean
theorem denote_Iff_BigStep (S : Stmt) (s t : State) :
    (s, t) ∈ ⟦S⟧ ↔ (S, s) ⟹ t :=
  sorry
```

关于证明，请参见 *Concrete Semantics: With Isabelle/HOL* 一书的第 11 章，或参阅本章配套的演示文件。

## 11.8 应用于程序等价

基于指称语义，我们引入**程序等价**（program equivalence）的概念。若两个程序具有相同的语义，则它们等价：

```lean
def DenoteEquiv (S₁ S₂ : Stmt) : Prop :=
  ⟦S₁⟧ = ⟦S₂⟧

infix:50 (priority := high) " ~ " => DenoteEquiv
```

我们将 `S₁ ~ S₂` 作为 `DenoteEquiv S₁ S₂` 的缩写。由定义不难看出，`~` 是一个等价关系。

程序等价可用于在较大程序中用另一个语义相同的子程序替换某个子程序。这由以下**同余规则**（congruence rule）实现：

```lean
theorem DenoteEquiv.seq_congr {S₁ S₂ T₁ T₂ : Stmt}
      (hS : S₁ ~ S₂) (hT : T₁ ~ T₂) :
    S₁; T₁ ~ S₂; T₂ :=
  by
    simp [DenoteEquiv, denote] at *
    simp [*]

theorem DenoteEquiv.if_congr {B} {S₁ S₂ T₁ T₂ : Stmt}
      (hS : S₁ ~ S₂) (hT : T₁ ~ T₂) :
    Stmt.ifThenElse B S₁ T₁ ~ Stmt.ifThenElse B S₂ T₂ :=
  by
    simp [DenoteEquiv, denote] at *
    simp [*]

theorem DenoteEquiv.while_congr {B} {S₁ S₂ : Stmt}
      (hS : S₁ ~ S₂) :
    Stmt.whileDo B S₁ ~ Stmt.whileDo B S₂ :=
  by
    simp [DenoteEquiv, denote] at *
    simp [*]
```

同余规则是这样一类定理：它们将等价关系提升到某个上下文之上（此处是将 `~` 提升到顺序组合、`if`–`then`–`else` 和 `while` 之上）。

请注意指称语义如何导致简短的重写式证明。这并不令人惊讶，因为它被设计成方程式和组合性的。若我们以大步语义作为程序等价的基础，这些证明会复杂得多。

我们现在可以通过方程推理证明一些简单程序的等价性：

```lean
theorem DenoteEquiv.skip_assign_id {x} :
    Stmt.assign x (fun s ↦ s x) ~ Stmt.skip :=
  by simp [DenoteEquiv, denote, Id]

theorem DenoteEquiv.seq_skip_left {S} :
    Stmt.skip; S ~ S :=
  by simp [DenoteEquiv, denote, Id, comp]

theorem DenoteEquiv.seq_skip_right {S} :
    S; Stmt.skip ~ S :=
  by simp [DenoteEquiv, denote, Id, comp]
```

我们用 `lfp` 算子定义了 `while` 的语义，但谁知道单调性——它保证最小不动点的存在——是否满足呢？为消除此类疑虑，我们证明以下定理：

```lean
theorem DenoteEquiv.if_seq_while {B S} :
    Stmt.ifThenElse B (S; Stmt.whileDo B S) Stmt.skip
    ~ Stmt.whileDo B S :=
  by
    simp [DenoteEquiv, denote]
    apply Eq.symm
    apply lfp_eq
    apply Monotone_while_lfp_arg
```

该定理为我们提供了一种方便的方式来展开或收缩循环的一次迭代。第二个 `apply` 调用定理 `lfp_eq : lfp f = f (lfp f)`，它说明 `lfp` 是不动点。最后一步应用一个定理，使 Lean 确信 `lfp` 的参数是单调的。该定理的证明相当单调乏味：

```lean
theorem Monotone_while_lfp_arg (S B) :
    Monotone (fun X ↦ ⟦S⟧ ◯ X ⇃ B ∪ Id ⇃ (fun s ↦ ¬ B s)) :=
  by
    apply Monotone_union
    · apply SorryTheorems.Monotone_restrict
      apply SorryTheorems.Monotone_comp
      · exact Monotone_const _
      · exact Monotone_id
    · apply SorryTheorems.Monotone_restrict
      exact Monotone_const _
```

## 11.9 基于归纳谓词的更简单方法

Lean 的归纳谓词对应于最小不动点，但它们内建于 Lean 的逻辑（归纳构造演算）中，无需使用像 `lfp` 这样的不动点算子。本章大部分篇幅都用于构造 `lfp` 算子。我们能否改用归纳谓词，从而省去这些工作呢？

答案是肯定的。首先回想，`Set (State × State)` 和 `State → State → Prop` 这两种类型是 Lean 中表示二元关系的等价表示。于是我们可以构造如下 `Awhile` 谓词，它类似于自反传递闭包，但在给定条件 `B` 变为假时停止：

```lean
inductive Awhile (B : State → Prop)
    (r : Set (State × State)) :
  State → State → Prop
where
  | true {s t u} (hcond : B s) (hbody : (s, t) ∈ r)
      (hrest : Awhile B r t u) :
    Awhile B r s u
  | false {s} (hcond : ¬ B s) :
    Awhile B r s s
```

借助该算子，指称语义的定义变为

```lean
def denoteAwhile : Stmt → Set (State × State)
  | Stmt.skip             => Id
  | Stmt.assign x a       => {(s, t) | t = s[x ↦ a s]}
  | Stmt.seq S T          => denoteAwhile S ◯ denoteAwhile T
  | Stmt.ifThenElse B S T =>
    (denoteAwhile S ⇃ B)
    ∪ (denoteAwhile T ⇃ (fun s ↦ ¬ B s))
  | Stmt.whileDo B S      =>
    {st | Awhile B (denoteAwhile S) (Prod.fst st)
       (Prod.snd st)}
```

`Awhile` 谓词的引入规则与大步操作语义中 `while` 的规则非常相似。在不同的外表之下，操作语义与指称语义毕竟并没有那么不同。