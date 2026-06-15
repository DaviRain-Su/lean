# 幺半群与群

抽象代数课程常从群开始，再讲环、域与向量空间。乘法并非来自群结构，但许多证明可从群论 verbatim 移植。纸笔数学常把这些证明留作练习；形式化更稳妥的路是用 **幺半群**（monoid）：类型 `M` 上的内部合成律结合且带中性元。幺半群主要容纳群与环的乘法结构，也有自然例子——自然数配加法即幺半群。

使用 Mathlib 时大多可忽略幺半群，但浏览库文件时需知其存在，否则可能在群论文件中找引理，而它在幺半群文件中（因不要求可逆）。

类型 `M` 上的幺半群结构写作 `Monoid M`。`Monoid` 为类型类，几乎总作实例隐式参数（方括号）。默认 `Monoid` 用乘法记号；加法记号用 `AddMonoid`。交换版本在 `Monoid` 前加前缀 `Comm`：

```lean
example {M : Type*} [Monoid M] (x : M) : x * 1 = x := mul_one x

example {M : Type*} [AddCommMonoid M] (x y : M) : x + y = y + x := add_comm x y
```

库中有 `AddMonoid`，但对非交换运算用加法记号通常易混淆。

`M` 与 `N` 间幺半群态射类型为 `MonoidHom M N`，记号 `M →* N`。Lean 对 `M` 中元素应用时自动视为 `M → N` 的函数。加法版为 `AddMonoidHom`，记号 `M →+ N`：

```lean
example {M N : Type*} [Monoid M] [Monoid N] (x y : M) (f : M →* N) : f (x * y) = f x * f y :=
  f.map_mul x y

example {M N : Type*} [AddMonoid M] [AddMonoid N] (f : M →+ N) : f 0 = 0 :=
  f.map_zero
```

态射为捆绑映射（见[态射](../C08_Hierarchies/Morphisms.md)），故不能用普通函数复合，须用 `MonoidHom.comp` 与 `AddMonoidHom.comp`：

```lean
example {M N P : Type*} [AddMonoid M] [AddMonoid N] [AddMonoid P]
    (f : M →+ N) (g : N →+ P) : M →+ P := g.comp f
```

## 群及其态射

群是每元有逆的幺半群：

```lean
example {G : Type*} [Group G] (x : G) : x * x⁻¹ = 1 := mul_inv_cancel x
```

类似 `ring` 策略，有 **`group`** 策略，可证任意群中成立的恒等式（等价于在自由群中成立）：

```lean
example {G : Type*} [Group G] (x y z : G) : x * (y * z) * (x * z)⁻¹ * (x * y * x⁻¹)⁻¹ = 1 := by
  group
```

交换加法群有 **`abel`** 策略：

```lean
example {G : Type*} [AddCommGroup G] (x y z : G) : z + x + (y - z - x) = y := by
  abel
```

群态射不过是群之间的幺半群态射：

```lean
example {G H : Type*} [Group G] [Group H] (x y : G) (f : G →* H) : f (x * y) = f x * f y :=
  f.map_mul x y

example {G H : Type*} [Group G] [Group H] (x : G) (f : G →* H) : f (x⁻¹) = (f x)⁻¹ :=
  f.map_inv x
```

构造群态射时，幺半群态射要求中性元映到中性元；在群情形这自动成立，但可用 `MonoidHom.mk'` 从与合成律兼容的函数构造，避免多余工作：

```lean
example {G H : Type*} [Group G] [Group H] (f : G → H) (h : ∀ x y, f (x * y) = f x * f y) :
    G →* H :=
  MonoidHom.mk' f h
```

群（或幺半群）**同构**类型为 `MulEquiv`，记号 `≃*`（加法 `AddEquiv`，`≃+`）。`f : G ≃* H` 的逆为 `MulEquiv.symm f` 或 `f.symm`，复合为 `MulEquiv.trans f g` 或 `f.trans g`，恒等同构为 `MulEquiv.refl G`。必要时自动强制为态射与函数：

```lean
example {G H : Type*} [Group G] [Group H] (f : G ≃* H) :
    f.trans f.symm = MulEquiv.refl G :=
  f.self_trans_symm
```

可用 `MulEquiv.ofBijective` 从双射态射构造同构（逆函数不可计算）：

```lean
noncomputable example {G H : Type*} [Group G] [Group H]
    (f : G →* H) (h : Function.Bijective f) :
    G ≃* H :=
  MulEquiv.ofBijective f h
```

## 子群

子群亦为捆绑结构，含 `G` 中满足闭包性质的集合：

```lean
example {G : Type*} [Group G] (H : Subgroup G) {x y : G} (hx : x ∈ H) (hy : y ∈ H) :
    x * y ∈ H :=
  H.mul_mem hx hy

example {G : Type*} [Group G] (H : Subgroup G) {x : G} (hx : x ∈ H) :
    x⁻¹ ∈ H :=
  H.inv_mem hx
```

`Subgroup G` 是 `G` 的 **子群类型**，而非 `H : Set G` 上的谓词 `IsSubgroup H`。`Subgroup G` 可强制为 `Set G`，在 `G` 上有成员谓词（见[子对象](../C08_Hierarchies/Subobjects.md)）。两子群相等当且仅当元素相同，可用 `ext` 证明。

要说明 `ℤ` 是 `ℚ` 的加法子群，需构造 `AddSubgroup ℚ`，其投影到 `Set ℚ` 为 `ℤ`（更精确为 `ℤ` 在 `ℚ` 中的像）：

```lean
example : AddSubgroup ℚ where
  carrier := Set.range ((↑) : ℤ → ℚ)
  add_mem' := by
    rintro _ _ ⟨n, rfl⟩ ⟨m, rfl⟩
    use n + m
    simp
  zero_mem' := by
    use 0
    simp
  neg_mem' := by
    rintro _ ⟨n, rfl⟩
    use -n
    simp
```

类型类使 Mathlib 知子群继承群结构：

```lean
example {G : Type*} [Group G] (H : Subgroup G) : Group H := inferInstance
```

`H` 非类型，Lean 将其强制为 `G` 的子类型：

```lean
example {G : Type*} [Group G] (H : Subgroup G) : Group {x : G // x ∈ H} := inferInstance
```

用 `Subgroup G` 而非 `IsSubgroup : Set G → Prop` 的好处：易赋予额外结构。`Subgroup G` 对包含关系构成 **完备格**；两子群的交用格运算 `⊓` 构造，而非单独引理：

```lean
example {G : Type*} [Group G] (H H' : Subgroup G) :
    ((H ⊓ H' : Subgroup G) : Set G) = (H : Set G) ∩ (H' : Set G) := rfl
```

下确界对应集合交，但 **上确界** 不对应并——子群之并一般不是子群，须用 `Subgroup.closure` 生成：

```lean
example {G : Type*} [Group G] (H H' : Subgroup G) :
    ((H ⊔ H' : Subgroup G) : Set G) = Subgroup.closure ((H : Set G) ∪ (H' : Set G)) := by
  rw [Subgroup.sup_eq_closure]
```

`G` 本身类型不是 `Subgroup G`；全群为格顶元 `⊤`，仅含中性元的子群为底元 `⊥`：

```lean
example {G : Type*} [Group G] (x : G) : x ∈ (⊤ : Subgroup G) := trivial

example {G : Type*} [Group G] (x : G) : x ∈ (⊥ : Subgroup G) ↔ x = 1 := Subgroup.mem_bot
```

练习：用环境群元素定义子群的 **共轭**（conjugate）：

```lean
def conjugate {G : Type*} [Group G] (x : G) (H : Subgroup G) : Subgroup G where
  carrier := {a : G | ∃ h, h ∈ H ∧ a = x * h * x⁻¹}
  one_mem' := by sorry
  inv_mem' := by sorry
  mul_mem' := by sorry
```

子群可用群态射 **前推** `map` 与 **拉回** `comap`：

```lean
example {G H : Type*} [Group G] [Group H] (G' : Subgroup G) (f : G →* H) : Subgroup H :=
  Subgroup.map f G'

example {G H : Type*} [Group G] [Group H] (H' : Subgroup H) (f : G →* H) : Subgroup G :=
  Subgroup.comap f H'

#check Subgroup.mem_map
#check Subgroup.mem_comap
```

`f` 下底子群的 preimage 为 **核**（kernel）`MonoidHom.ker f`，像为子群：

```lean
example {G H : Type*} [Group G] [Group H] (f : G →* H) (g : G) :
    g ∈ MonoidHom.ker f ↔ f g = 1 :=
  f.mem_ker

example {G H : Type*} [Group G] [Group H] (f : G →* H) (h : H) :
    h ∈ MonoidHom.range f ↔ ∃ g : G, f g = h :=
  f.mem_range
```

练习（Mathlib 已有，勿过早 `exact?`）：

```lean
section exercises
variable {G H : Type*} [Group G] [Group H]
open Subgroup

example (φ : G →* H) (S T : Subgroup H) (hST : S ≤ T) : comap φ S ≤ comap φ T := by sorry

example (φ : G →* H) (S T : Subgroup G) (hST : S ≤ T) : map φ S ≤ map φ T := by sorry

variable {K : Type*} [Group K]

example (φ : G →* H) (ψ : H →* K) (U : Subgroup K) :
    comap (ψ.comp φ) U = comap φ (comap ψ U) := by sorry

example (φ : G →* H) (ψ : H →* K) (S : Subgroup G) :
    map (ψ.comp φ) S = map ψ (S.map φ) := by sorry

end exercises
```

**拉格朗日定理**（Lagrange's theorem）：有限群中子群基数整除群基数。**西罗第一定理**（Sylow's first theorem）为其著名部分逆命题：

```lean
open scoped Classical

example {G : Type*} [Group G] (G' : Subgroup G) : Nat.card G' ∣ Nat.card G :=
  ⟨G'.index, mul_comm G'.index _ ▸ G'.index_mul_card.symm⟩

open Subgroup

example {G : Type*} [Group G] [Finite G] (p : ℕ) {n : ℕ} [Fact p.Prime]
    (hdvd : p ^ n ∣ Nat.card G) : ∃ K : Subgroup G, Nat.card K = p ^ n :=
  Sylow.exists_subgroup_card_pow_prime p hdvd
```

练习：由拉格朗日引理推出推论（库中亦有）：

```lean
lemma eq_bot_iff_card {G : Type*} [Group G] {H : Subgroup G} :
    H = ⊥ ↔ Nat.card H = 1 := by sorry

lemma inf_bot_of_coprime {G : Type*} [Group G] (H K : Subgroup G)
    (h : (Nat.card H).Coprime (Nat.card K)) : H ⊓ K = ⊥ := by sorry
```

## 具体群

Mathlib 也可处理具体群，通常比抽象理论更繁琐。类型 `X` 的置换群为 `Equiv.Perm X`；对称群 𝔖ₙ 为 `Equiv.Perm (Fin n)`：

```lean
open Equiv

example {X : Type*} [Finite X] : Subgroup.closure {σ : Perm X | Perm.IsCycle σ} = ⊤ :=
  Perm.closure_isCycle
```

可用 `#simp` 计算轮换之积；记号 `c[]` 定义轮换：

```lean
#simp [mul_assoc] c[1, 2, 3] * c[2, 3, 4]
```

**自由群**（free group）`FreeGroup α`，含入映射 `FreeGroup.of`：

```lean
section FreeGroup

inductive S | a | b | c
open S

def myElement : FreeGroup S := (.of a) * (.of b)⁻¹
```

泛性质为 `FreeGroup.lift`。定义 `FreeGroup S → Perm (Fin 5)` 的态射：

```lean
def myMorphism : FreeGroup S →* Perm (Fin 5) :=
  FreeGroup.lift fun | .a => c[1, 2, 3]
                     | .b => c[2, 3, 1]
                     | .c => c[2, 3]
```

**呈示群**（presented group）：`PresentedGroup` 取关系集（自由群中元素集），返回自由群对由关系生成的正规子群之商。用 `Unit` 定义立方为 1 的群（同构于 ℤ/3），并建到 `Perm (Fin 5)` 的态射：

```lean
def myGroup := PresentedGroup {.of () ^ 3} deriving Group

def myMap : Unit → Perm (Fin 5)
| () => c[1, 2, 3]

lemma compat_myMap :
    ∀ r ∈ ({.of () ^ 3} : Set (FreeGroup Unit)), FreeGroup.lift myMap r = 1 := by
  rintro _ rfl
  simp
  decide

def myNewMorphism : myGroup →* Perm (Fin 5) := PresentedGroup.toGroup compat_myMap

end FreeGroup
```

## 群作用

群论与数学其余部分的重要接口是 **群作用**（group action）：`G` 在类型 `X` 上的作用即 `G → Equiv.Perm X` 的态射。为便于 Lean 推断，有类型类 `MulAction G X`；同一群在同一类型上多种作用需类型同义词等技巧。可用 `g • x` 表示群元 g 对点 x 的作用：

```lean
example {G X : Type*} [Group G] [MulAction G X] (g g': G) (x : X) :
    g • (g' • x) = (g * g') • x :=
  (mul_smul g g' x).symm
```

加法版为 `AddAction`，记号 `+ᵥ`（用于仿射空间等）。底层态射为 `MulAction.toPermHom`：

```lean
open MulAction

example {G X : Type*} [Group G] [MulAction G X] : G →* Equiv.Perm X :=
  toPermHom G X
```

**凯莱同构**（Cayley isomorphism）将群 `G` 嵌入 `Perm G`（左乘作用）：

```lean
def CayleyIsoMorphism (G : Type*) [Group G] : G ≃* (toPermHom G G).range :=
  Equiv.Perm.subgroupOfMulAction G G
```

划分轨道需群条件；等价关系为 `MulAction.orbitRel`：

```lean
example {G X : Type*} [Group G] [MulAction G X] : Setoid X := orbitRel G X
```

`X` 与轨道依赖积双射；轨道与稳定子商 `G ⧸ stabilizer G x` 双射：

```lean
example {G X : Type*} [Group G] [MulAction G X] :
    X ≃ (ω : orbitRel.Quotient G X) × (orbit G (Quotient.out ω)) :=
  MulAction.selfEquivSigmaOrbits G X

example {G X : Type*} [Group G] [MulAction G X] (x : X) :
    orbit G x ≃ G ⧸ stabilizer G x :=
  MulAction.orbitEquivQuotientStabilizer G x
```

子群 `H` 左平移作用时：`G ≃ (G ⧸ H) × H`（拉格朗日定理的概念版，无有限性假设）：

```lean
example {G : Type*} [Group G] (H : Subgroup G) : G ≃ (G ⧸ H) × H :=
  groupEquivQuotientProdSubgroup
```

练习：用 `conjugate` 定义群在子群上的共轭作用：

```lean
variable {G : Type*} [Group G]

lemma conjugate_one (H : Subgroup G) : conjugate 1 H = H := by sorry

instance : MulAction G (Subgroup G) where
  smul := conjugate
  one_smul := by sorry
  mul_smul := by sorry
```

## 商群

`G ⧸ H` 一般仅为类型；当且仅当 `H` 为 **正规子群**（normal subgroup）时可赋予使商映射为群态射的群结构（且唯一）。正规性为类型类 `Subgroup.Normal`：

```lean
noncomputable section QuotientGroup

example {G : Type*} [Group G] (H : Subgroup G) [H.Normal] : Group (G ⧸ H) := inferInstance

example {G : Type*} [Group G] (H : Subgroup G) [H.Normal] : G →* G ⧸ H :=
  QuotientGroup.mk' H
```

泛性质经 `QuotientGroup.lift`：态射 `φ` 核含 `N` 时可下降到 `G ⧸ N`：

```lean
example {G : Type*} [Group G] (N : Subgroup G) [N.Normal] {M : Type*}
    [Group M] (φ : G →* M) (h : N ≤ MonoidHom.ker φ) : G ⧸ N →* M :=
  QuotientGroup.lift N φ h
```

`N = ker φ` 时得 **第一同构定理**：

```lean
example {G : Type*} [Group G] {M : Type*} [Group M] (φ : G →* M) :
    G ⧸ MonoidHom.ker φ →* MonoidHom.range φ :=
  QuotientGroup.quotientKerEquivRange φ
```

`G ⧸ N → G' ⧸ N'` 的态射条件：用拉回表述「φ 将 N 映到 N' 内」更便于 `Subgroup.comap`：

```lean
example {G G': Type*} [Group G] [Group G']
    {N : Subgroup G} [N.Normal] {N' : Subgroup G'} [N'.Normal]
    {φ : G →* G'} (h : N ≤ Subgroup.comap φ N') : G ⧸ N →* G' ⧸ N':=
  QuotientGroup.map N N' φ h
```

`G ⧸ N` 真依赖 `N`（至定义相等）；`M = N` 不足以使商类型定义相等，但泛性质给出同构：

```lean
example {G : Type*} [Group G] {M N : Subgroup G} [M.Normal]
    [N.Normal] (h : M = N) : G ⧸ M ≃* G ⧸ N := QuotientGroup.quotientMulEquivOfEq h
```

练习：若有限群 `G` 中正规子群 `H`、`K` 不交且基数之积为 `|G|`，则 `G ≃* H × K`（`H ⊓ K = ⊥`）：

```lean
section
variable {G : Type*} [Group G] {H K : Subgroup G}
open MonoidHom

lemma aux_card_eq [Finite G] (h' : Nat.card G = Nat.card H * Nat.card K) :
    Nat.card (G ⧸ H) = Nat.card K := by sorry

variable [H.Normal] [K.Normal] [Fintype G] (h : Disjoint H K)
  (h' : Nat.card G = Nat.card H * Nat.card K)

def iso₁ : K ≃* G ⧸ H := by sorry

def iso₂ : G ≃* (G ⧸ K) × (G ⧸ H) := by sorry

def finalIso : G ≃* H × K := by sorry

end
```