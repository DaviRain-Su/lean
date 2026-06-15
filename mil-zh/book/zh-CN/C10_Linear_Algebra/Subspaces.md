# 子空间与商空间

## 子空间

与线性映射一样，线性子空间（linear subspace）也是捆绑结构：由 `V` 中一个集合（称为子空间的**载体**，carrier）及相应的封闭性性质组成。这里仍写 module 而非 vector space，因为 Mathlib 在线性代数中使用更一般的上下文。

```lean
section
variable {K : Type*} [Field K] {V : Type*} [AddCommGroup V] [Module K V]

example (U : Submodule K V) {x y : V} (hx : x ∈ U) (hy : y ∈ U) :
    x + y ∈ U :=
  U.add_mem hx hy

example (U : Submodule K V) {x : V} (hx : x ∈ U) (a : K) :
    a • x ∈ U :=
  U.smul_mem a hx
end
```

重要的是：`Submodule K V` 是 `V` 的 `K`-线性子空间的**类型**，而不是谓词 `IsSubmodule U`（其中 `U : Set V`）。`Submodule K V` 可强制为 `Set V`，并在 `V` 上有成员关系谓词。做法与动机见[子对象](../C08_Hierarchies/Subobjects.md)。

两个子空间相同当且仅当元素相同；该事实已注册供 **`ext`** 策略使用，用法与证明两个集合相等类似。

例如要说明 $\mathbb{R}$ 是 $\mathbb{C}$ 的 $\mathbb{R}$-线性子空间，实际要构造类型为 `Submodule ℝ ℂ` 的项，其投影到 `Set ℂ` 为 $\mathbb{R}$（更精确地，$\mathbb{R}$ 在 $\mathbb{C}$ 中的像）：

```lean
noncomputable example : Submodule ℝ ℂ where
  carrier := Set.range ((↑) : ℝ → ℂ)
  add_mem' := by
    rintro _ _ ⟨n, rfl⟩ ⟨m, rfl⟩
    use n + m
    simp
  zero_mem' := by
    use 0
    simp
  smul_mem' := by
    rintro c - ⟨a, rfl⟩
    use c*a
    simp
```

`Submodule` 证明字段末尾的撇号与 `LinearMap` 中类似：在 `Membership` 实例定义之前，用 `carrier` 表述；之后由 `Submodule.add_mem`、`Submodule.zero_mem`、`Submodule.smul_mem` 取代。

**练习**：定义线性映射下子空间的**原像**（pre-image；Mathlib 下文会给出）。`Set.mem_preimage` 可改写涉及成员与原像的命题。除 `LinearMap` 与 `Submodule` 相关引理外，只需这一条。

```lean
variable {K : Type*} [Field K] {V : Type*} [AddCommGroup V] [Module K V]

def preimage {W : Type*} [AddCommGroup W] [Module K W] (φ : V →ₗ[K] W) (H : Submodule K W) :
    Submodule K V where
  carrier := φ ⁻¹' H
  zero_mem' := by
    sorry
  add_mem' := by
    sorry
  smul_mem' := by
    sorry
```

借助类型类，Mathlib 知道向量空间的子空间继承向量空间结构：

```lean
example (U : Submodule K V) : Module K U := inferInstance
```

此例较微妙：`U` 本身不是类型，Lean 自动把它强制为 `V` 的子类型。更明确的写法：

```lean
example (U : Submodule K V) : Module K {x : V // x ∈ U} := inferInstance
```

## 完备格结构与内直和

用类型 `Submodule K V` 而非谓词 `IsSubmodule : Set V → Prop` 的重要好处，是可以方便地赋予额外结构。特别地，按包含关系它有**完备格**（complete lattice）结构。例如两个子空间的交不必单独写引理，而用格运算 `⊓` 构造交，再对格应用任意引理。

下面验证：两个子空间下确界（infimum）对应的集合，按定义就是它们的交：

```lean
example (H H' : Submodule K V) :
    ((H ⊓ H' : Submodule K V) : Set V) = (H : Set V) ∩ (H' : Set V) := rfl
```

交有对应记号，但上确界（supremum）与集合并**不**对应——子空间的并一般不是子空间。须用并生成的子空间，即 `Submodule.span`：

```lean
example (H H' : Submodule K V) :
    ((H ⊔ H' : Submodule K V) : Set V) = Submodule.span K ((H : Set V) ∪ (H' : Set V)) := by
  simp [Submodule.span_union]
```

`V` 本身类型不是 `Submodule K V`；要把 `V` 看作 `V` 的子空间，由格结构提供：**顶元**（top）即全空间：

```lean
example (x : V) : x ∈ (⊤ : Submodule K V) := trivial
```

**底元**（bottom）是仅含零元的子空间：

```lean
example (x : V) : x ∈ (⊥ : Submodule K V) ↔ x = 0 := Submodule.mem_bot K
```

由此可讨论**（内）直和**（internal direct sum）。两个子空间时用泛谓词 `IsCompl`（对任意有界偏序类型有意义）；一般族用 `DirectSum.IsInternal`。

```lean
-- 两子空间内直和 ⇒ 生成全空间
example (U V : Submodule K V) (h : IsCompl U V) :
  U ⊔ V = ⊤ := h.sup_eq_top

-- 两子空间内直和 ⇒ 交仅为零
example (U V : Submodule K V) (h : IsCompl U V) :
  U ⊓ V = ⊥ := h.inf_eq_bot

section
open DirectSum
variable {ι : Type*} [DecidableEq ι]

example (U : ι → Submodule K V) (h : DirectSum.IsInternal U) :
  ⨆ i, U i = ⊤ := h.submodule_iSup_eq_top

example {ι : Type*} [DecidableEq ι] (U : ι → Submodule K V) (h : DirectSum.IsInternal U)
    {i j : ι} (hij : i ≠ j) : U i ⊓ U j = ⊥ :=
  (h.submodule_iSupIndep.pairwiseDisjoint hij).eq_bot

#check DirectSum.isInternal_submodule_iff_iSupIndep_and_iSup_eq_top

-- 与外直和的关系：内直和时，从外直和到 `V` 的映射是线性同构
noncomputable example {ι : Type*} [DecidableEq ι] (U : ι → Submodule K V)
    (h : DirectSum.IsInternal U) : (⨁ i, U i) ≃ₗ[K] V :=
  LinearEquiv.ofBijective (coeLinearMap U) h
end
```

## 由集合生成的子空间

除由已有子空间构造外，可用 `Submodule.span K s` 构造包含 `s` 的最小子空间。纸上常写该空间由 `s` 中元的线性组合组成；形式化中更常高效使用泛性质 `Submodule.span_le` 及 Galois 连接整套理论。

```lean
example {s : Set V} (E : Submodule K V) : Submodule.span K s ≤ E ↔ s ⊆ E :=
  Submodule.span_le

example : GaloisInsertion (Submodule.span K) ((↑) : Submodule K V → Set V) :=
  Submodule.gi K V
```

不够时可用归纳原理 `Submodule.span_induction`：若在零元与 `s` 中元上成立，且对加法与标量乘法稳定，则对 `span s` 中每个元成立。

**练习**：重证 `Submodule.mem_sup` 的一个方向。可用 **`module`** 策略处理由 `V` 上代数运算公理推出的目标。

```lean
example {S T : Submodule K V} {x : V} (h : x ∈ S ⊔ T) :
    ∃ s ∈ S, ∃ t ∈ T, x = s + t  := by
  rw [← S.span_eq, ← T.span_eq, ← Submodule.span_union] at h
  induction h using Submodule.span_induction with
  | mem y h =>
      sorry
  | zero =>
      sorry
  | add x y hx hy hx' hy' =>
      sorry
  | smul a x hx hx' =>
      sorry
```

## 子空间的推与拉

现在说明如何用线性映射**推**（push）与**拉**（pull）子空间。Mathlib 中第一个运算叫 `map`，第二个叫 `comap`。

```lean
section

variable {W : Type*} [AddCommGroup W] [Module K W] (φ : V →ₗ[K] W)

variable (E : Submodule K V) in
#check (Submodule.map φ E : Submodule K W)

variable (F : Submodule K W) in
#check (Submodule.comap φ F : Submodule K V)
```

它们在 `Submodule` 命名空间，可用点记号写 `E.map φ`，但读起来较别扭（部分 Mathlib 贡献者仍这样写）。

线性映射的**值域**（range）与**核**（kernel）是子空间，重要到各有专门声明：

```lean
example : LinearMap.range φ = .map φ ⊤ := LinearMap.range_eq_map φ

example : LinearMap.ker φ = .comap φ ⊥ := Submodule.comap_bot φ -- 或 `rfl`
```

不能写 `φ.ker` 代替 `LinearMap.ker φ`，因为 `LinearMap.ker` 也用于更一般的映射类，不期望以 `LinearMap` 开头的参数，故点记号不适用。但右端可用另一种点记号：Lean 在左边求值后期望 `Submodule K V` 类型的项，故把 `.comap` 解释为 `Submodule.comap`。

下面引理给出这些子空间与 `φ` 性质的关键关系：

```lean
open Function LinearMap

example : Injective φ ↔ ker φ = ⊥ := ker_eq_bot.symm

example : Surjective φ ↔ range φ = ⊤ := range_eq_top.symm
```

**练习**：证明 `map` 与 `comap` 的 Galois 连接性质。可用下面引理，非必须（它们按定义成立）：

```lean
#check Submodule.mem_map_of_mem
#check Submodule.mem_map
#check Submodule.mem_comap

example (E : Submodule K V) (F : Submodule K W) :
    Submodule.map φ E ≤ F ↔ E ≤ Submodule.comap φ F := by
  sorry
```

## 商空间

商向量空间使用一般商记号（用 `\quot` 输入，不是普通 `/`）。到商空间的投影为 `Submodule.mkQ`，泛性质为 `Submodule.liftQ`。

```lean
variable (E : Submodule K V)

example : Module K (V ⧸ E) := inferInstance

example : V →ₗ[K] V ⧸ E := E.mkQ

example : ker E.mkQ = E := E.ker_mkQ

example : range E.mkQ = ⊤ := E.range_mkQ

example (hφ : E ≤ ker φ) : V ⧸ E →ₗ[K] W := E.liftQ φ hφ

example (F : Submodule K W) (hφ : E ≤ .comap φ F) : V ⧸ E →ₗ[K] W ⧸ F := E.mapQ F φ hφ

noncomputable example : (V ⧸ LinearMap.ker φ) ≃ₗ[K] range φ := φ.quotKerEquivRange
```

**练习**：证明商空间子空间的**对应定理**（correspondence theorem）。Mathlib 有更精细版本 `Submodule.comapMkQRelIso`。

```lean
open Submodule

#check Submodule.map_comap_eq
#check Submodule.comap_map_eq

example : Submodule K (V ⧸ E) ≃ { F : Submodule K V // E ≤ F } where
  toFun := sorry
  invFun := sorry
  left_inv := sorry
  right_inv := sorry
```