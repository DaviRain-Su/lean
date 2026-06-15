# 子对象

定义代数结构及其态射后，下一步是考虑继承该结构的集合，如 **子群**（subgroup）、**子环**（subring）。这与态射主题大量重叠：`X` 中的集合实现为 `X → Prop` 的函数，子对象即满足某谓词的函数。故可复用导向 `DFunLike` 的思路。不直接复用 `DFunLike`——那会破坏从 `Set X` 到 `X → Prop` 的抽象屏障。而有 **SetLike** 类：将注入包装进 `Set` 类型，而非函数类型，并定义相应强制与 `Membership` 实例。

```lean
@[ext]
structure Submonoid₁ (M : Type) [Monoid M] where
  /-- The carrier of a submonoid. -/
  carrier : Set M
  /-- The product of two elements of a submonoid belongs to the submonoid. -/
  mul_mem {a b} : a ∈ carrier → b ∈ carrier → a * b ∈ carrier
  /-- The unit element belongs to the submonoid. -/
  one_mem : 1 ∈ carrier

instance [Monoid M] : SetLike (Submonoid₁ M) M where
  coe := Submonoid₁.carrier
  coe_injective' _ _ := Submonoid₁.ext
```

有 `SetLike` 实例后，可自然写子幺半群 `N` 含 `1`，无需 `N.carrier`；也可将 `N` 静默当作 `M` 中的集合并对之取映射的像：

```lean
example [Monoid M] (N : Submonoid₁ M) : 1 ∈ N := N.one_mem

example [Monoid M] (N : Submonoid₁ M) (α : Type) (f : M → α) := f '' N
```

还有到 `Type` 的强制，用 `Subtype`：对子幺半群 `N` 可写参数 `(x : N)`，强制为属于 `N` 的 `M` 中元素：

```lean
example [Monoid M] (N : Submonoid₁ M) (x : N) : (x : M) ∈ N := x.property
```

用该强制可为子幺半群配备幺半群结构，用 `SetCoe.ext`（由 `SetLike` 提供）证强制单射：

```lean
instance SubMonoid₁Monoid [Monoid M] (N : Submonoid₁ M) : Monoid N where
  mul := fun x y ↦ ⟨x*y, N.mul_mem x.property y.property⟩
  mul_assoc := fun x y z ↦ SetCoe.ext (mul_assoc (x : M) y z)
  one := ⟨1, N.one_mem⟩
  one_mul := fun x ↦ SetCoe.ext (one_mul (x : M))
  mul_one := fun x ↦ SetCoe.ext (mul_one (x : M))
```

也可用解构绑定子，不必显式强制到 `M` 再取 `property`：

```lean
example [Monoid M] (N : Submonoid₁ M) : Monoid N where
  mul := fun ⟨x, hx⟩ ⟨y, hy⟩ ↦ ⟨x*y, N.mul_mem hx hy⟩
  mul_assoc := fun ⟨x, _⟩ ⟨y, _⟩ ⟨z, _⟩ ↦ SetCoe.ext (mul_assoc x y z)
  one := ⟨1, N.one_mem⟩
  one_mul := fun ⟨x, _⟩ ↦ SetCoe.ext (one_mul x)
  mul_one := fun ⟨x, _⟩ ↦ SetCoe.ext (mul_one x)
```

为将子幺半群引理用于子群、子环，需要类（同态射）。该类以 `SetLike` 实例为参数，故无需 `carrier` 字段，可在字段中用成员记号：

```lean
class SubmonoidClass₁ (S : Type) (M : Type) [Monoid M] [SetLike S M] : Prop where
  mul_mem : ∀ (s : S) {a b : M}, a ∈ s → b ∈ s → a * b ∈ s
  one_mem : ∀ s : S, 1 ∈ s

instance [Monoid M] : SubmonoidClass₁ (Submonoid₁ M) M where
  mul_mem := Submonoid₁.mul_mem
  one_mem := Submonoid₁.one_mem
```

练习：定义 `Subgroup₁` 结构，配备 `SetLike` 与 `SubmonoidClass₁` 实例，在 `Subgroup₁` 的子类型上放 `Group` 实例，并定义 `SubgroupClass₁` 类。

Mathlib 中给定代数对象的子对象总构成 **完备格**（complete lattice），并大量使用。例如两子幺半群的交是子幺半群——这不是引理，而是 **下确界**（infimum）构造。两子幺半群的情形：

```lean
instance [Monoid M] : Min (Submonoid₁ M) :=
  ⟨fun S₁ S₂ ↦
    { carrier := S₁ ∩ S₂
      one_mem := ⟨S₁.one_mem, S₂.one_mem⟩
      mul_mem := fun ⟨hx, hx'⟩ ⟨hy, hy'⟩ ↦ ⟨S₁.mul_mem hx hy, S₂.mul_mem hx' hy'⟩ }⟩
```

故两子幺半群的交可写为子幺半群：

```lean
example [Monoid M] (N P : Submonoid₁ M) : Submonoid₁ M := N ⊓ P
```

或许遗憾不能用 `∩` 而须用 `⊓`。但想想 **上确界**：两子幺半群的并一般不是子幺半群，子幺半群仍构成（完备）格；`N ⊔ P` 是由 `N` 与 `P` 之并 **生成** 的子幺半群，用 `N ∪ P` 记会极混乱。故 `N ⊓ P` 更一致，且跨代数结构统一。向量次子空间 `E`、`F` 的和记为 `E ⊔ F` 而非 `E + F` 初看怪异，习惯后会觉得 `E + F` 强调「元素可表为 E 中元与 F 中元之和」这一偶然事实，而 `E ⊔ F` 强调「含 E、F 的最小子空间」这一根本事实。

## 商

本章最后一题是 **商**（quotient）。Mathlib 用 `HasQuotient` 类提供 `M ⧸ N` 等记号。商符号 `⧸` 为特殊 Unicode，非 ASCII `/`。

以交换幺半群对子幺半群的商为例，证明留作练习。末例可用 `Setoid.refl`，但不会自动拾取相关 `Setoid`；可用 `@` 语法补全参数，如 `@Setoid.refl M N.Setoid`：

```lean
def Submonoid.Setoid [CommMonoid M] (N : Submonoid M) : Setoid M  where
  r := fun x y ↦ ∃ w ∈ N, ∃ z ∈ N, x*w = y*z
  iseqv := {
    refl := fun x ↦ ⟨1, N.one_mem, 1, N.one_mem, rfl⟩
    symm := fun ⟨w, hw, z, hz, h⟩ ↦ ⟨z, hz, w, hw, h.symm⟩
    trans := by
      sorry
  }

instance [CommMonoid M] : HasQuotient M (Submonoid M) where
  Quotient := fun N ↦ Quotient N.Setoid

def QuotientMonoid.mk [CommMonoid M] (N : Submonoid M) : M → M ⧸ N := Quotient.mk N.Setoid

instance [CommMonoid M] (N : Submonoid M) : Monoid (M ⧸ N) where
  mul := Quotient.map₂ (· * ·) (by
      sorry
        )
  mul_assoc := by
      sorry
  one := QuotientMonoid.mk N 1
  one_mul := by
      sorry
  mul_one := by
      sorry
```