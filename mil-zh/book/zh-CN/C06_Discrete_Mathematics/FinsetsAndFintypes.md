# Finsets 与 Fintypes

在 Mathlib 中处理有限集与有限类型可能令人困惑，因为库提供多种方式。本节讨论最常见的一种。

我们已在[归纳与递归](../C05_Elementary_Number_Theory/InductionAndRecursion.md)与[无穷多素数](../C05_Elementary_Number_Theory/InfinitelyManyPrimes.md)中见过类型 `Finset`。顾名思义，`Finset α` 的元素是类型 `α` 的 **有限集**（finite set）；下文称 **finset**。`Finset` 数据类型设计为可计算解释，许多基本运算假设 `α` 有 **可判定相等**（decidable equality），从而保证有算法判定 `a : α` 是否属于 finset `s`：

```lean
section
variable {α : Type*} [DecidableEq α] (a : α) (s t : Finset α)

#check a ∈ s
#check s ∩ t

end
```

若去掉 `[DecidableEq α]`，Lean 会在 `#check s ∩ t` 处报错，因无法计算交集。你期望可计算的数据类型通常都有可判定相等；若用经典逻辑，可 `open Classical` 并声明 `noncomputable section`，从而对任意类型的 finsets 推理。

Finsets 支持集合论中大部分运算：

```lean
open Finset

variable (a b c : Finset ℕ)
variable (n : ℕ)

#check a ∩ b
#check a ∪ b
#check a \ b
#check (∅ : Finset ℕ)

example : a ∩ (b ∪ c) = (a ∩ b) ∪ (a ∩ c) := by
  ext x; simp only [mem_inter, mem_union]; tauto

example : a ∩ (b ∪ c) = (a ∩ b) ∪ (a ∩ c) := by rw [inter_union_distrib_left]
```

我们已 `open Finset`，finset 专用定理在该命名空间。单步执行上一例可见：`ext` 后 `simp` 将恒等式化为命题逻辑问题。练习：尝试证明[第 4 章集合](../C04_Sets_and_Functions/Sets.md)中的部分集合恒等式，移植到 finsets。

你已见过记号 `Finset.range n`，表示自然数有限集 {0, 1, …, n−1}。`Finset` 也允许通过枚举元素定义有限集：

```lean
#check ({0, 2, 5} : Finset Nat)

def example1 : Finset ℕ := {0, 1, 2}
```

有多种方式让 Lean 识别：以此方式给出的集合中，元素顺序与重复无关紧要：

```lean
example : ({0, 1, 2} : Finset ℕ) = {1, 2, 0} := by decide

example : ({0, 1, 2} : Finset ℕ) = {0, 1, 1, 2} := by decide

example : ({0, 1} : Finset ℕ) = {1, 0} := by rw [Finset.pair_comm]

example (x : Nat) : ({x, x} : Finset ℕ) = {x} := by simp

example (x y z : Nat) : ({x, y, z, y, z, x} : Finset ℕ) = {x, y, z} := by
  ext i; simp [or_comm, or_left_comm]

example (x y z : Nat) : ({x, y, z, y, z, x} : Finset ℕ) = {x, y, z} := by
  ext i; simp; tauto
```

可用 `insert` 向 Finset 加入单个元素，用 `Finset.erase` 删除单个元素。注意 `erase` 在 `Finset` 命名空间，而 `insert` 在根命名空间：

```lean
example (s : Finset ℕ) (a : ℕ) (h : a ∉ s) : (insert a s |>.erase a) = s :=
  Finset.erase_insert h

example (s : Finset ℕ) (a : ℕ) (h : a ∈ s) : insert a (s.erase a) = s :=
  Finset.insert_erase h
```

事实上 `{0, 1, 2}` 只是 `insert 0 (insert 1 (singleton 2))` 的记号：

```lean
set_option pp.notation false in
#check ({0, 1, 2} : Finset ℕ)
```

给定 finset `s` 与谓词 `P`，可用集合构造记号 `{x ∈ s | P x}` 定义 s 中满足 `P` 的元素集。这是 `Finset.filter P s` 的记号，亦可写 `s.filter P`：

```lean
example : {m ∈ range n | Even m} = (range n).filter Even := rfl
example : {m ∈ range n | Even m ∧ m ≠ 3} = (range n).filter (fun m ↦ Even m ∧ m ≠ 3) := rfl

example : {m ∈ range 10 | Even m} = {0, 2, 4, 6, 8} := by decide
```

Mathlib 知道函数下 finsets 的 **像**（image）仍是 finset：

```lean
#check (range 5).image (fun x ↦ x * 2)

example : (range 5).image (fun x ↦ x * 2) = {x ∈ range 10 | Even x} := by decide
```

Lean 还知道两 finsets 的笛卡尔积 `s ×ˢ t` 是 finset，finset 的 **幂集**（powerset）也是 finset。（记号 `s ×ˢ t` 对集合同样适用。）

```lean
#check s ×ˢ t
#check s.powerset
```

按元素定义 finset 上的运算较棘手，因定义须与元素呈现顺序无关。当然总可用已有运算复合定义函数。也可用 `Finset.fold` 对元素 **折叠**（fold）二元运算，前提是运算 **结合** 且 **交换**，从而结果与运算顺序无关。有限和、积、并如此定义。最后一例中 `biUnion` 表示「有界指标并」；常规数学记号为 ⋃_{i ∈ s} g(i)：

```lean
#check Finset.fold

def f (n : ℕ) : Int := (↑n)^2

#check (range 5).fold (fun x y : Int ↦ x + y) 0 f
#eval (range 5).fold (fun x y : Int ↦ x + y) 0 f

#check ∑ i ∈ range 5, i^2
#check ∏ i ∈ range 5, i + 1

variable (g : Nat → Finset Int)

#check (range 5).biUnion g
```

Finsets 有自然的 **归纳原理**：证每个 finset 具有某性质，先证空集具有该性质，再证向 finset 加入一个新元素时保持。（下一例归纳步中 `@insert` 的 `@` 用于为参数 `a`、`s` 命名，因它们被标为隐式。）

```lean
#check Finset.induction

example {α : Type*} [DecidableEq α] (f : α → ℕ)  (s : Finset α) (h : ∀ x ∈ s, f x ≠ 0) :
    ∏ x ∈ s, f x ≠ 0 := by
  induction s using Finset.induction_on with
  | empty => simp
  | @insert a s anins ih =>
    rw [prod_insert anins]
    apply mul_ne_zero
    · apply h; apply mem_insert_self
    apply ih
    intros x xs
    exact h x (mem_insert_of_mem xs)
```

若 `s` 为 finset，`Finset.Nonempty s` 定义为 `∃ x, x ∈ s`。可用经典选择（classical choice）从非空 finset 中取元素。库还定义 `Finset.toList s`，用选择以某种顺序取出 s 的元素：

```lean
noncomputable example (s : Finset ℕ) (h : s.Nonempty) : ℕ := Classical.choose h

example (s : Finset ℕ) (h : s.Nonempty) : Classical.choose h ∈ s := Classical.choose_spec h

noncomputable example (s : Finset ℕ) : List ℕ := s.toList

example (s : Finset ℕ) (a : ℕ) : a ∈ s.toList ↔ a ∈ s := mem_toList
```

可用 `Finset.min`、`Finset.max` 在线性序的 finset 中选最小或最大元；在格上可用 `Finset.inf`、`Finset.sup`，但有个细节：空 finset 的最小元应是什么？下面带撇版本在 finset 非空的前提下工作。无撇版本 `Finset.min`、`Finset.max` 在输出类型中加入顶或底元以处理空集；无撇 `Finset.inf`、`Finset.sup` 假设格自带顶或底元：

```lean
#check Finset.min
#check Finset.min'
#check Finset.max
#check Finset.max'
#check Finset.inf
#check Finset.inf'
#check Finset.sup
#check Finset.sup'

example : Finset.Nonempty {2, 6, 7} := ⟨6, by trivial⟩
example : Finset.min' {2, 6, 7} ⟨6, by trivial⟩ = 2 := by trivial
```

每个 finset `s` 有有限 **基数** `Finset.card s`；`open Finset` 时可写 `#s`：

```lean
#check Finset.card

#eval (range 5).card

example (s : Finset ℕ) : s.card = #s := by rfl

example (s : Finset ℕ) : s.card = ∑ _i ∈ s, 1 := by rw [card_eq_sum_ones]

example (s : Finset ℕ) : s.card = ∑ _i ∈ s, 1 := by simp
```

下一节专门讨论基数推理。

形式化数学时常需决定用集合还是类型表达定义与定理。用类型往往简化记号与证明，但对类型的子集工作更灵活。Finset 的类型论类比是 **fintype**（有限类型）：对某 `α` 的类型 `Fintype α`。按定义，fintype 是附带 finset `univ`（包含其所有元素）的数据类型：

```lean
variable {α : Type*} [Fintype α]

example : ∀ x : α, x ∈ Finset.univ := by
  intro x; exact mem_univ x
```

`Fintype.card α` 等于对应 finset 的基数：

```lean
example : Fintype.card α = (Finset.univ : Finset α).card := rfl
```

我们已见过 fintype 的典型例子：每个 n 的类型 `Fin n`。Lean 识别 fintypes 在积等运算下封闭：

```lean
example : Fintype.card (Fin 5) = 5 := by simp
example : Fintype.card ((Fin 5) × (Fin 3)) = 15 := by simp
```

`Finset α` 的每个元素 `s` 可 **强制**（coerce）为类型 `(↑s : Type α)`，即 `α` 中属于 s 的元素之子类型；Lean 知道 `↑s` 是 fintype：

```lean
variable (s : Finset ℕ)

example : (↑s : Type) = {x : ℕ // x ∈ s} := rfl
example : Fintype.card ↑s = s.card := by simp
```

Lean 与 Mathlib 用 **类型类推断**（type class inference）追踪 fintypes 的额外结构，即包含所有元素的 universal finset。可将 fintype 视为配备该额外数据的代数结构；[第 7 章《结构体》](../C07_Structures/Structures.md)与[第 8 章《层次结构》](../C08_Hierarchies/Basics.md)将说明其机制。