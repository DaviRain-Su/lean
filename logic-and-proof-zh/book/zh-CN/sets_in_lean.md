# 第 12 章：Lean 中的集合

> 本译文对应原书 [Sets in Lean](https://leanprover.github.io/logic_and_proof/sets_in_lean.html)；英文 Sphinx 源：`sets_in_lean.rst`。

在上一章中，我们指出，虽然在公理化集合论中会考虑由各种不同对象组成的集合，但在数学中更常见的是考虑某个固定论域 $\mathcal{U}$ 的子集。Lean 正是这样处理集合的。对任何数据类型 `U`，Lean 给我们一个新的数据类型 `Set U`，由 `U` 中元素的集合组成。因此，例如，我们可以讨论自然数集合、整数集合，或自然数对的集合。

## 12.1. 基础

给定 `A : Set U` 和 `x : U`，我们可以写 `x ∈ A` 来表示 `x` 是集合 `A` 的成员。字符 `∈` 可以用 `\in` 输入。

```lean
import Mathlib.Data.Set.Basic
open Set

variable {U : Type}
variable (A B C : Set U)
variable (x : U)

#check x ∈ A
#check A ∪ B
#check B \ C
#check C ∩ A
#check Cᶜ
#check ∅ ⊆ A
#check B ⊆ univ
```

你可以分别用 `\subeq`、`\empty`、`\un`、`\i`、`\\` 输入符号 `⊆`、`∅`、`∪`、`∩`、 `\`。我们让类型变量 `U` 是隐式的，因为它通常可以从上下文中推断出来。全集记作 `univ`，集合补集用上标字母 “c” 表示，可以用 `\^c` 或 `\compl` 输入。这些基本集合论概念在 Lean 的核心库中已有定义，但额外的定理和记号在辅助库中，我们通过文件开头的命令 `import Mathlib.Data.Set.Basic` 加载它。命令 `open Set` 让我们可以直接用 `mem_union` 来引用名为 `Set.mem_union` 的定理。

以下模式可用来证明 `A` 是 `B` 的子集：

```lean
-- term mode
example : A ⊆ B :=
fun x ↦
fun (h : x ∈ A) ↦
show x ∈ B from sorry

-- tactic mode
example : A ⊆ B := by
intro x
intro (h : x ∈ A)
show x ∈ B
sorry
```

口号是：`A ⊆ B` 等同于 `∀ x, x ∈ A → x ∈ B`。对 Lean 来说，这按定义成立，因此上面的项和策略看起来非常熟悉。

以下模式可用来证明 `A` 和 `B` 相等：

```lean
-- term mode
example : A = B :=
eq_of_subset_of_subset
  (fun x ↦
    fun (h : x ∈ A) ↦
    show x ∈ B from sorry)
  (fun x ↦
    fun (h : x ∈ B) ↦
    show x ∈ A from sorry)
```

口号是：`A = B` 等同于 `A ⊆ B ∧ B ⊆ A`，也等同于 `∀ x, x ∈ A ↔ x ∈ B`。因此我们可以使用如下替代方式：

```lean
-- term mode
example : A = B :=
ext (fun x ↦ Iff.intro
  (fun h : x ∈ A ↦
    show x ∈ B from sorry)
  (fun h : x ∈ B ↦
    show x ∈ A from sorry))

-- tactic mode
example : A = B := by
  ext x
  show x ∈ A ↔ x ∈ B
  apply Iff.intro
  . show x ∈ A → x ∈ B
    intro (h : x ∈ A)
    show x ∈ B
    sorry
  . show x ∈ B → x ∈ A
    intro (h : x ∈ B)
    show x ∈ A
    sorry
```

这里 `ext` 是 “extensionality” 的缩写。在项模式中，`Set.ext` 是如下事实：

$$
\forall x (x \in A \leftrightarrow x \in B) \to A = B.
$$

它把证明 $A = B$ 归结为证明 $\forall x (x \in A \leftrightarrow x \in B)$，而后者可以用 `∀` 和 `↔` 引入来完成。策略 `ext` 是指尽可能应用 `Set.ext`。我们写 `ext x` 来指定我们想使用的变量名。

Lean 支持以下便捷特性：并、交等集合运算的定义规则被认为是“按定义成立”的。这意味着对 Lean 而言，`x ∈ A ∩ B` 和 `x ∈ A ∧ x ∈ B` 含义相同。其他集合构造也是如此；例如 `x ∈ A \ B` 和 `x ∈ A ∧ ¬(x ∈ B)` 对 Lean 含义相同。你也可以写 `x ∉ B` 表示 `¬(x ∈ B)`，其中 `∉` 用 `\notin` 输入。下面的例子说明了这些特性。

```lean
example : ∀ x, x ∈ A → x ∈ B → x ∈ A ∩ B :=
fun x ↦
fun _ : x ∈ A ↦
fun _ : x ∈ B ↦
show x ∈ A ∩ B from And.intro ‹x ∈ A› ‹x ∈ B›

example : A ⊆ A ∪ B :=
fun x ↦
fun _ : x ∈ A ↦
show x ∈ A ∪ B from Or.inl ‹x ∈ A›

example : ∅ ⊆ A  :=
fun x ↦
fun _ : x ∈ ∅ ↦
show x ∈ A from False.elim ‹x ∈ (∅ : Set U)›
```

记得在[4.6 节](propositional_logic_in_lean.md#46-定义与定理)中我们说过，可以不带标签使用 `assume`，并用法文引号（用 `\f<` 和 `\f>` 输入）引用假设。我们在上一个例子中使用了这一特性。没有它的话，我们可以把上面的例子写成：

```lean
example : ∀ x, x ∈ A → x ∈ B → x ∈ A ∩ B :=
fun x ↦
fun hA : x ∈ A ↦
fun hB : x ∈ B ↦
show x ∈ A ∩ B from And.intro hA hB

example : A ⊆ A ∪ B :=
fun x ↦
fun h : x ∈ A ↦
show x ∈ A ∪ B from Or.inl h

example : ∅ ⊆ A  :=
fun x ↦
fun h : x ∈ ∅ ↦
show x ∈ A from False.elim h
```

从现在开始，我们将开始不带标签地使用 `fun` 和 `have` 命令，但你可以随意采用自己喜欢的风格。

还要注意，在最后一个例子中，我们必须通过写 `(∅ : Set U)` 来标注空集，以告诉 Lean 我们指的是哪个空集。Lean 通常可以从上下文中推断这类信息（例如，从我们试图证明 `x ∈ A`，而 `A` 的类型是 `Set U`），但在这种情况下，它需要多一点帮助。

另外，我们可以使用 Lean 库中专为集合设计的定理：

```lean
example : ∀ x, x ∈ A → x ∈ B → x ∈ A ∩ B :=
fun x ↦
fun _ : x ∈ A ↦
fun _ : x ∈ B ↦
show x ∈ A ∩ B from mem_inter ‹x ∈ A› ‹x ∈ B›

example : A ⊆ A ∪ B :=
fun x ↦
fun h : x ∈ A ↦
show x ∈ A ∪ B from mem_union_left B h

example : ∅ ⊆ A  :=
fun x ↦
fun h : x ∈ ∅ ↦
show x ∈ A from absurd h (not_mem_empty x)
```

记住，`absurd` 可以用来从两个矛盾的假设 `h1 : P` 和 `h2 : ¬P` 证明任何事实。这里 `not_mem_empty x` 是事实 `x ∉ ∅`。你可以在 Lean 中用 `#check` 命令查看这些定理的陈述：

```lean
#check @mem_inter
#check @mem_of_mem_inter_left
#check @mem_of_mem_inter_right
#check @mem_union_left
#check @mem_union_right
#check @mem_or_mem_of_mem_union
#check @not_mem_empty
```

这里 Lean 中的 `@` 符号阻止它自动填充隐式参数，强制它显示定理的完整陈述。

Lean 能把集合与其逻辑定义等同起来，这使得证明集合之间的包含关系变得容易：

```lean
example : A \ B ⊆ A :=
fun x ↦
fun h : x ∈ A \ B ↦
show x ∈ A from And.left h

example : A \ B ⊆ Bᶜ :=
fun x ↦
fun h : x ∈ A \ B ↦
have : x ∉ B := And.right h
show x ∈ Bᶜ from this
```

再次，我们可以使用专为集合设计的定理：

```lean
example : A \ B ⊆ A :=
fun x ↦
fun h : x ∈ A \ B ↦
show x ∈ A from mem_of_mem_diff h

example : A \ B ⊆ Bᶜ :=
fun x ↦
fun h : x ∈ A \ B ↦
have : x ∉ B := not_mem_of_mem_diff h
show x ∈ Bᶜ from this
```

## 12.2. 一些恒等式

下面是我们在上一章中非正式证明的第一个恒等式在 Lean 中的证明：

```lean
example : A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C) := by
  ext x
  apply Iff.intro
  . intro (hx : x ∈ A ∩ (B ∪ C))
    have hA: x ∈ A := hx.left
    have hBC: x ∈ B ∪ C := hx.right
    cases hBC with
    | inl hB =>
      have : x ∈ A ∩ B := ⟨hA, hB⟩
      show x ∈ (A ∩ B) ∪ (A ∩ C)
      apply Or.inl
      assumption
    | inr hC =>
      have : x ∈ A ∩ C := ⟨hA, hC⟩
      show x ∈ (A ∩ B) ∪ (A ∩ C)
      apply Or.inr
      assumption
  . intro (hx : x ∈ (A ∩ B) ∪ (A ∩ C))
    cases hx with
    | inl h =>
      show x ∈ A ∩ (B ∪ C)
      apply And.intro
      . show x ∈ A
        exact h.left
      . show x ∈ B ∪ C
        apply Or.inl
        show x ∈ B
        exact h.right
    | inr h =>
      show x ∈ A ∩ (B ∪ C)
      apply And.intro
      . show x ∈ A
        exact h.left
      . show x ∈ B ∪ C
        apply Or.inr
        show x ∈ C
        exact h.right
```

注意它比上一章的非正式证明长得多，因为我们展开了每一个细节。不幸的是，这不一定使它更易读。请记住，你总可以增量地写长证明，使用 `sorry`。你也可以把长证明拆成更小的片段：

```lean
theorem inter_union_subset {x} :
    (x ∈ A ∩ (B ∪ C)) → (x ∈ (A ∩ B) ∪ (A ∩ C)) := by
  intro (hx : x ∈ A ∩ (B ∪ C))
  have hA: x ∈ A := hx.left
  have hBC: x ∈ B ∪ C := hx.right
  cases hBC with
  | inl hB =>
    have : x ∈ A ∩ B := ⟨hA, hB⟩
    show x ∈ (A ∩ B) ∪ (A ∩ C)
    apply Or.inl
    assumption
  | inr hC =>
    have : x ∈ A ∩ C := ⟨hA, hC⟩
    show x ∈ (A ∩ B) ∪ (A ∩ C)
    apply Or.inr
    assumption

theorem inter_union_inter_subset {x} :
    (x ∈ (A ∩ B) ∪ (A ∩ C)) → (x ∈ A ∩ (B ∪ C)) := by
  intro (hx : x ∈ (A ∩ B) ∪ (A ∩ C))
  cases hx with
  | inl h =>
    show x ∈ A ∩ (B ∪ C)
    apply And.intro
    . show x ∈ A
      exact h.left
    . show x ∈ B ∪ C
      apply Or.inl
      show x ∈ B
      exact h.right
  | inr h =>
    show x ∈ A ∩ (B ∪ C)
    apply And.intro
    . show x ∈ A
      exact h.left
    . show x ∈ B ∪ C
      apply Or.inr
      show x ∈ C
      exact h.right

example : A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C) := by
  ext x
  constructor
  . exact inter_union_subset A B C
  . exact inter_union_inter_subset A B C
```

注意这两个定理依赖于变量 `A`、`B`、`C`，在应用时必须作为参数传入。它们也依赖于底层类型 `U`，但因为变量 `U` 被标记为隐式，Lean 会从上下文中推断出来。

还要注意，我们不用 `apply Iff.intro` 把目标 `x ∈ A ∩ (B ∪ C) ↔ x ∈ A ∩ B ∪ A ∩ C` 转换为证明每个方向，而是简单地使用策略 `constructor`。`constructor` 策略也适用于拆分目标 `A ∧ B` 和 `∃ x, P x`。

```lean
section
variable (A B : Prop)

example : A ∧ B := by
constructor
. show A
    sorry
. show B
    sorry
end

section
variable {U : Type}
variable (P : U → Prop)
variable (a : U)

example : ∃ x, P x := by
constructor
. show P a
    sorry
end
```

在上一章中，我们证明了 $(A \cap \overline{B}) \cup B = B$。下面是 Lean 中相应的证明：

```lean
example : (A ∩ Bᶜ) ∪ B = A ∪ B :=
calc
  (A ∩ Bᶜ) ∪ B = (A ∪ B) ∩ (Bᶜ ∪ B) := by rw [inter_union_distrib_right]
             _ = (A ∪ B) ∩ univ     := by rw [compl_union_self]
             _ = A ∪ B              := by rw [inter_univ]
```

翻译成命题，上面的定理陈述了：在布尔代数中，对任意两个元素 $A$ 和 $B$，$(A \land \neg B) \lor B = B$。

## 12.3. 指标族

记住，如果 $(A_i)_{i \in I}$ 是由 $I$ 索引的集合族，那么 $\bigcap_{i \in I} A_i$ 表示所有集合 $A_i$ 的交集，$\bigcup_{i \in I} A_i$ 表示它们的并集。在 Lean 中，我们可以通过写 `A : I → Set U`（其中 `I` 是一个 `Type`）来指定 `A` 是一个集合族。换言之，集合族其实是一个函数，对 `I` 中每个类型为 `I` 的元素返回一个集合 `A i`。然后我们可以如下定义并集和交集：

```lean
import Mathlib.Data.Set.Basic

variable {I U : Type}

def iUnion (A : I → Set U) : Set U := { x | ∃ i : I, x ∈ A i }

def iInter (A : I → Set U) : Set U := { x | ∀ i : I, x ∈ A i }

section
variable (x : U) (A : I → Set U)

example (h : x ∈ iUnion A) : ∃ i, x ∈ A i := h
example (h : x ∈ iInter A) : ∀ i, x ∈ A i := h
end
```

这些例子表明，Lean 可以展开定义，使得 `x ∈ iInter A` 可以按 `∀ i, x ∈ A i` 处理，`x ∈ iUnion A` 可以按 `∃ i, x ∈ A i` 处理。要复习如何在 Lean 中处理全称和存在量词，参见[第 9 章](first_order_logic_in_lean.md)。然后我们可以为指标并和指标交定义记号：

```lean
notation3 "⋃ "(...)", "r:60:(scoped f => iUnion f) => r

notation3 "⋂ "(...)", "r:60:(scoped f => iInter f) => r

variable (A : I → Set U) (x : U)

example (h : x ∈ ⋃ i, A i) : ∃ i, x ∈ A i := h
example (h : x ∈ ⋂ i, A i) : ∀ i, x ∈ A i := h
```

你可以分别用 `\I` 和 `\Un` 输入 `⋂` 和 `⋃`。与量词一样，记号 `⋃ i, A i` 和 `⋂ i, A i` 在表达式中绑定变量 `i`，作用域尽可能宽。例如，如果你写 `⋂ i, A i ∪ B`，Lean 假设序列的第 `i` 个元素是 `A i ∪ B`。如果你想更窄地限制作用域，使用括号。

好消息是 Lean 的库确实定义了指标并和指标交，使用这个记号，并且通过 `import Mathlib.Order.SetNotation` 可以使用。坏消息是库使用了不同的定义，因此 `x ∈ iInter A` 和 `x ∈ iUnion A` 并不按定义分别等于 `∀ i, x ∈ A i` 和 `∃ i, x ∈ A i`。好消息是 Lean 至少知道它们是等价的，通过两个引理 `mem_iUnion` 和 `mem_iInter`。

```lean
import Mathlib.Order.SetNotation
open Set

variable {I U : Type}
variable {A B : I → Set U}

#check mem_iUnion
#check mem_iInter

theorem exists_of_mem_Union {x : U} (h : x ∈ ⋃ i, A i) :
    ∃ i, x ∈ A i := by
  rw [← mem_iUnion]
  assumption

theorem mem_Union_of_exists {x : U} (h : ∃ i, x ∈ A i) :
    x ∈ ⋃ i, A i := by
  rw [mem_iUnion]
  assumption

theorem forall_of_mem_Inter {x : U} (h : x ∈ ⋂ i, A i) :
    ∀ i, x ∈ A i := by
  rw [← mem_iInter]
  assumption

theorem mem_Inter_of_forall {x : U} (h : ∀ i, x ∈ A i) :
    x ∈ ⋂ i, A i := by
  rw [mem_iInter]
  assumption
```

引理 `mem_iUnion` 说，对任何 `x`，有 `x ∈ ⋃ i, s i ↔ ∃ i, x ∈ s i`。由于它是一个双条件，我们可以用 `rewrite` 把其中一边替换为另一边。

下面是一个使用它们的例子：

```lean
example : (⋂ i, A i ∩ B i) = (⋂ i, A i) ∩ (⋂ i, B i) := by
  ext x
  show x ∈ ⋂ i, A i ∩ B i ↔ x ∈ (⋂ i, A i) ∧ x ∈ ⋂ i, B i
  rw [mem_iInter, mem_iInter, mem_iInter]
  show (∀ (i : I), x ∈ A i ∧ x ∈ B i) ↔
    (∀ (i : I), x ∈ A i) ∧ (∀ (i : I), x ∈ B i)
  constructor
  . intro (h : ∀ (i : I), x ∈ A i ∧ x ∈ B i)
    show (∀ (i : I), x ∈ A i) ∧ ∀ (i : I), x ∈ B i
    constructor
    . show ∀ i, x ∈ A i
      exact fun j ↦ And.left $ h j
    . show ∀ i, x ∈ B i
      exact fun j ↦ And.right $ h j
  . intro (h : (∀ (i : I), x ∈ A i) ∧ ∀ (i : I), x ∈ B i)
    show ∀ i, x ∈ A i ∧ x ∈ B i
    exact fun j ↦ ⟨h.left j, h.right j⟩
```

我们首先应用外延性。然后我们通过在 `show` 后写后者，强制 Lean 把 `x ∈ (⋂ i, A i) ∩ (⋂ i, B i)` 解释为按定义相等的 `x ∈ (⋂ i, A i) ∧ x ∈ ⋂ i, B i`。接着我们使用重复的 `rewrite` 策略来归约属于指标交的含义。然后再次用 `show` 强制 Lean 把 `x ∈ A i ∩ B i` 解释为 `x ∈ A i ∧ x ∈ B i`。最后我们证明这个双条件，现在它完全用一阶逻辑表达了。

更好的是，我们可以证明指标交和并的引入与消去规则：

```lean
import Mathlib.Order.SetNotation
open Set

variable {I U : Type}
variable {A : I → Set U}

theorem Inter.intro {x : U} (h : ∀ i, x ∈ A i) : x ∈ ⋂ i, A i := by
  rw [mem_iInter]
  show ∀ i, x ∈ A i
  assumption

theorem Inter.elim {x : U} (h : x ∈ ⋂ i, A i) (i : I) : x ∈ A i := by
  rw [mem_iInter] at h
  apply h

theorem Union.intro {x : U} (i : I) (h : x ∈ A i) : x ∈ ⋃ i, A i := by
  rw [mem_iUnion]
  show ∃ i, x ∈ A i
  exact ⟨i, h⟩

theorem Union.elim {b : Prop} {x : U}
(h₁ : x ∈ ⋃ i, A i) (h₂ : ∀ (i : I), x ∈ A i → b) : b := by
  rw [mem_iUnion] at h₁
  cases h₁ with
  | intro i hi => exact h₂ i hi
```

注意这里我们做了 `rw [mem_iInter] at h`，指示 Lean 在假设 `h` 处沿 `mem_iInter` 证明的双条件进行替换。如果你查看应用该策略前后 `h` 的类型，会注意到变化。

我们可以不用 `rewrite`，只用引入和消去规则：

```lean
example (x : U) : x ∈ ⋂ i, A i :=
Inter.intro $
fun i ↦
show x ∈ A i from sorry

example (x : U) (i : I) (h : x ∈ ⋂ i, A i) : x ∈ A i :=
Inter.elim h i

example (x : U) (i : I) (h : x ∈ A i) : x ∈ ⋃ i, A i :=
Union.intro i h

example (C : Prop) (x : U) (h : x ∈ ⋃ i, A i) : C :=
Union.elim h $
fun i ↦
fun h : x ∈ A i ↦
show C from sorry
```

记住，美元符号省去了我们必须把证明其余部分用括号括起来的麻烦。注意有了 `Inter.intro` 和 `Inter.elim`，使用指标交的证明看起来就像使用全称量词一样。类似地，`Union.intro` 和 `Union.elim` 反映了存在量词的引入和消去规则。下面的例子只使用引入和消去规则，证明了上面一个等价式的一个方向：

```lean
variable {I U : Type}
variable (A : I → Set U) (B : I → Set U) (C : Set U)

example : (⋂ i, A i ∩ B i) ⊆ (⋂ i, A i) ∩ (⋂ i, B i) :=
fun x : U ↦
fun h : x ∈ ⋂ i, A i ∩ B i ↦
have h1 : x ∈ ⋂ i, A i :=
  Inter.intro $
  fun i : I ↦
  have h2 : x ∈ A i ∩ B i := Inter.elim h i
  show x ∈ A i from And.left h2
have h2 : x ∈ ⋂ i, B i :=
    Inter.intro $
    fun i : I ↦
    have h2 : x ∈ A i ∩ B i := Inter.elim h i
    show x ∈ B i from And.right h2
show x ∈ (⋂ i, A i) ∩ (⋂ i, B i) from And.intro h1 h2
```

下面的练习要求你证明另一个方向。这里是一个展示如何使用指标并的引入和消去规则例子：

```lean
variable {I U : Type}
variable (A : I → Set U) (B : I → Set U) (C : Set U)

example : (⋃ i, C ∩ A i) ⊆ C ∩ (⋃i, A i) :=
fun x : U ↦
fun h : x ∈ ⋃ i, C ∩ A i ↦
Union.elim h $
fun i ↦
fun h1 : x ∈ C ∩ A i ↦
have h2 : x ∈ C := And.left h1
have h3 : x ∈ A i := And.right h1
have h4 : x ∈ ⋃ i, A i := Union.intro i h3
show x ∈ C ∩ ⋃ i, A i from And.intro h2 h4
```

我们再次请你证明另一个方向。

有时我们想处理由两个变量索引的族 $(A_{i,j})_{i \in I, j \in J}$。这在 Lean 中也很容易管理：如果我们声明 `A : I → J → Set U`，那么给定 `i : I` 和 `j : J`，就有 `A i j : Set U`。（你应该把表达式 `I → J → Set U` 理解为 `I → (J → Set U)`，因此 `A i` 的类型是 `J → Set U`，然后 `A i j` 的类型是 `Set U`。）下面是一个涉及双重索引族的证明例子：

```lean
section
variable {I U : Type}
variable (A : I → J → Set U)

example : (⋃i, ⋂j, A i j) ⊆ (⋂j, ⋃i, A i j) :=
fun x : U ↦
fun h : x ∈ ⋃i, ⋂j, A i j ↦
Union.elim h $
fun i ↦
fun h1 : x ∈ ⋂ j, A i j ↦
show x ∈ ⋂j, ⋃i, A i j from
    Inter.intro $
    fun j ↦
    have h2 : x ∈ A i j := Inter.elim h1 j
    Union.intro i h2
end
```

## 12.4. 幂集

我们也可以在 Lean 中定义幂集：

```lean
variable {U : Type}

def powerset (A : Set U) : Set (Set U) := {B : Set U | B ⊆ A}

example (A B : Set U) (h : B ∈ powerset A) : B ⊆ A :=
h
```

如例子所示，`B ∈ powerset A` 按定义与 `B ⊆ A` 相同。

事实上，`powerset` 在 Lean 中正是以这种方式定义的，当你 `import Mathlib.Data.Set.Basic` 并 `open Set` 后就可以使用。下面是一个使用例子：

```lean
#check powerset A

example : A ∈ powerset (A ∪ B) :=
fun x ↦
fun _ : x ∈ A ↦
show x ∈ A ∪ B from Or.inl ‹x ∈ A›
```

本质上，这个例子证明了 `A ⊆ A ∪ B`。在下面的练习中，我们要求你形式化地证明，对任意 `A B : Set U`，有 `powerset A ⊆ powerset B`。

## 12.5. 练习

1. 填上 `sorry`。

```lean
example : ∀ x, x ∈ A ∩ C → x ∈ A ∪ B :=
sorry

example : ∀ x, x ∈ (A ∪ B)ᶜ → x ∈ Aᶜ :=
sorry
```

2. 填上 `sorry`。

```lean
import Mathlib.Data.Set.Basic
open Set

section
variable {U : Type}

/- defining "disjoint" -/

def disj (A B : Set U) : Prop := ∀ ⦃x⦄, x ∈ A → x ∈ B → False

example (A B : Set U) (h : ∀ x, ¬ (x ∈ A ∧ x ∈ B)) :
  disj A B :=
fun x ↦
fun h1 : x ∈ A ↦
fun h2 : x ∈ B ↦
have h3 : x ∈ A ∧ x ∈ B := And.intro h1 h2
show False from h x h3

-- notice that we do not have to mention x when applying
-- h : disj A B
example (A B : Set U) (h1 : disj A B) (x : U)
    (h2 : x ∈ A) (h3 : x ∈ B) :
  False :=
h1 h2 h3

-- the same is true of ⊆
example (A B : Set U) (x : U) (h : A ⊆ B) (h1 : x ∈ A) :
  x ∈ B :=
h h1

example (A B C D : Set U) (h1 : disj A B) (h2 : C ⊆ A)
    (h3 : D ⊆ B) :
  disj C D :=
sorry
end
```

3. 使用上面列出的定理 `Inter.intro`、`Inter.elim`、`Union.intro`、`Union.elim` 证明以下关于指标并和指标交的事实。

```lean
variable {I U : Type}
variable (A : I → Set U) (B : I → Set U) (C : Set U)

example : (⋂ i, A i) ∩ (⋂ i, B i) ⊆ (⋂ i, A i ∩ B i) :=
sorry

example : C ∩ (⋃i, A i) ⊆ ⋃i, C ∩ A i :=
sorry
```

4. 证明以下关于幂集的事实。你可以使用定理 `Subset.trans` 和 `Subset.refl`。

```lean
variable {U : Type}
variable (A B C : Set U)

-- For this exercise these two facts are useful
example (h1 : A ⊆ B) (h2 : B ⊆ C) : A ⊆ C :=
Subset.trans h1 h2

example : A ⊆ A :=
Subset.refl A

example (h : A ⊆ B) : powerset A ⊆ powerset B :=
sorry

example (h : powerset A ⊆ powerset B) : A ⊆ B :=
sorry
```
