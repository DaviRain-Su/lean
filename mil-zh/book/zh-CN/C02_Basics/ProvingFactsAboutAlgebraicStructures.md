# 证明关于代数结构的命题

在[证明代数结构中的恒等式](ProvingIdentitiesInAlgebraicStructures.md)中，我们看到实数的许多恒等式在交换环等更一般的代数结构中成立。描述代数结构不限于等式公理。**偏序**（partial order）由集合与二元关系组成，满足自反、传递、反对称，如实数上的 `≤`。Lean 了解偏序：

```lean
section
variable {α : Type*} [PartialOrder α]
variable (x y z : α)

#check x ≤ y
#check (le_refl x : x ≤ x)
#check (le_trans : x ≤ y → y ≤ z → x ≤ z)
#check (le_antisymm : x ≤ y → y ≤ x → x = y)

end
```

这里采用 Mathlib 惯例：用 `α`、`β`、`γ`（`\a`、`\b`、`\g`）表示任意类型；`R`、`G` 常用于环、群的载体，但一般希腊字母用于关联结构较少的类型。

任何偏序 `≤` 都有**严格偏序** `<`，行为类似实数上的小于：说 `x` 严格小于 `y` 等价于 `x ≤ y` 且 `x ≠ y`：

```lean
#check x < y
#check (lt_irrefl x : ¬ (x < x))
#check (lt_trans : x < y → y < z → x < z)
#check (lt_of_le_of_lt : x ≤ y → y < z → x < z)
#check (lt_of_lt_of_le : x < y → y ≤ z → x < z)

example : x < y ↔ x ≤ y ∧ x ≠ y :=
  lt_iff_le_and_ne
```

`∧` 表示「与」，`¬` 表示「非」，`x ≠ y` 是 `¬ (x = y)` 的缩写。第 3 章将学习如何用这些逻辑联结词**证明** `<` 的上述性质。

**格**（lattice）在偏序上扩展运算 `⊓` 与 `⊔`，分别类似实数上的 `min` 与 `max`：

```lean
section
variable {α : Type*} [Lattice α]
variable (x y z : α)

#check x ⊓ y
#check (inf_le_left : x ⊓ y ≤ x)
#check (inf_le_right : x ⊓ y ≤ y)
#check (le_inf : z ≤ x → z ≤ y → z ≤ x ⊓ y)
#check x ⊔ y
#check (le_sup_left : x ≤ x ⊔ y)
#check (le_sup_right : y ≤ x ⊔ y)
#check (sup_le : x ≤ z → y ≤ z → x ⊔ y ≤ z)

end
```

`⊓`、`⊔` 的刻画说明它们分别是**最大下界**（greatest lower bound / infimum / meet）与**最小上界**（least upper bound / supremum / join）。VS Code 可用 `\glb`、`\lub` 输入；Mathlib 定理名用 `inf`、`sup`，文献中也常称 meet、join。记忆对照：

- `⊓`：最大下界 / infimum / meet
- `⊔`：最小上界 / supremum / join

格实例包括：`≤` 下的 `min`/`max`（整数、实数等全序）；`⊆` 下的 `∩`/`∪`（子集）；布尔值上的 `∧`/`∨`；自然数整除序下的 `gcd`/`lcm`；向量空间子空间（交为下界、和为上界，包含序）；集合拓扑（生成并的下界、交为上界，反包含序）等。

与 `min`/`max`、`gcd`/`lcm` 类似，仅用刻画公理配合 `le_refl`、`le_trans` 可证 `⊓`、`⊔` 的交换律与结合律。

见到目标 `x ≤ z` 时直接 `apply le_trans` 不太好：Lean 无法猜测中间元 `y`，会产生 `x ≤ ?a`、`?a ≤ z` 及提供 `y` 的目标。可用 `calc` 显式给出 `y`，或用 `trans` 策略（`y` 为参数），或直接 `exact le_trans inf_le_left inf_le_right`（需更多规划）：

```lean
example : x ⊓ y = y ⊓ x := by
  sorry

example : x ⊓ y ⊓ z = x ⊓ (y ⊓ z) := by
  sorry

example : x ⊔ y = y ⊔ x := by
  sorry

example : x ⊔ y ⊔ z = x ⊔ (y ⊔ z) := by
  sorry
```

Mathlib 中分别为 `inf_comm`、`inf_assoc`、`sup_comm`、`sup_assoc`。

好练习是仅用上述公理证明**吸收律**（absorption laws）：

```lean
theorem absorb1 : x ⊓ (x ⊔ y) = x := by
  sorry

theorem absorb2 : x ⊔ x ⊓ y = x := by
  sorry
```

Mathlib 中名为 `inf_sup_self`、`sup_inf_self`。

满足额外恒等式 `x ⊓ (y ⊔ z) = (x ⊓ y) ⊔ (x ⊓ z)` 与 `x ⊔ (y ⊓ z) = (x ⊔ y) ⊓ (x ⊔ z)` 的格称为**分配格**（distributive lattice）。Lean 也了解：

```lean
section
variable {α : Type*} [DistribLattice α]
variable (x y z : α)

#check (inf_sup_left x y z : x ⊓ (y ⊔ z) = x ⊓ y ⊔ x ⊓ z)
#check (inf_sup_right x y z : (x ⊔ y) ⊓ z = x ⊓ z ⊔ y ⊓ z)
#check (sup_inf_left x y z : x ⊔ y ⊓ z = (x ⊔ y) ⊓ (x ⊔ z))
#check (sup_inf_right x y z : x ⊓ y ⊔ z = (x ⊔ z) ⊓ (y ⊔ z))

end
```

左右版本在 `⊓`、`⊔` 交换律下等价。好练习：给出有限元非分配格的显式描述；以及在任意格中证明一条分配律蕴含另一条：

```lean
section
variable {α : Type*} [Lattice α]
variable (a b c : α)

example (h : ∀ x y z : α, x ⊓ (y ⊔ z) = x ⊓ y ⊔ x ⊓ z) : a ⊔ b ⊓ c = (a ⊔ b) ⊓ (a ⊔ c) := by
  sorry

example (h : ∀ x y z : α, x ⊔ y ⊓ z = (x ⊔ y) ⊓ (x ⊔ z)) : a ⊓ (b ⊔ c) = a ⊓ b ⊔ a ⊓ c := by
  sorry

end
```

可将公理结构组合成更大结构。**严格有序环**（strict ordered ring）由环、载体上的偏序及环运算与序相容的额外公理组成：

```lean
section
variable {R : Type*} [Ring R] [PartialOrder R] [IsStrictOrderedRing R]
variable (a b c : R)

#check (add_le_add_right : a ≤ b → ∀ c, c + a ≤ c + b)
#check (mul_pos : 0 < a → 0 < b → 0 < a * b)

end
```

第 3 章将提供从 `mul_pos` 与 `<` 的定义导出下列的工具：

```lean
#check (mul_nonneg : 0 ≤ a → 0 ≤ b → 0 ≤ a * b)
```

扩展练习：证明实数算术与序的许多常见事实对任意有序环泛化成立。试下列例子，仅用环、偏序及上两例事实（注意环未必交换，`ring` 策略不可用）：

```lean
example (h : a ≤ b) : 0 ≤ b - a := by
  sorry

example (h: 0 ≤ b - a) : a ≤ b := by
  sorry

example (h : a ≤ b) (h' : 0 ≤ c) : a * c ≤ b * c := by
  sorry
```

最后一例：**度量空间**（metric space）由配备距离函数 `dist x y`（将元素对映到实数）的集合组成，满足：

```lean
section
variable {X : Type*} [MetricSpace X]
variable (x y z : X)

#check (dist_self x : dist x x = 0)
#check (dist_comm x y : dist x y = dist y x)
#check (dist_triangle x y z : dist x z ≤ dist x y + dist y z)

end
```

掌握本节后，可证由此公理推出距离恒非负：

```lean
example (x y : X) : 0 ≤ dist x y := by
  sorry
```

该定理在 Mathlib 中名为 `dist_nonneg`。