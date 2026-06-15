# 代数结构

要澄清 **代数结构**（algebraic structure）的含义，先看若干例子：

1. **偏序集**（partially ordered set）：集合 P 与 P 上的二元关系 ≤，满足传递、自反、反对称。
2. **群**（group）：集合 G、结合二元运算、单位元 1、映射 g ↦ g⁻¹ 给出每个 g 的逆。运算可交换时称为 **阿贝尔群**（abelian）或 **交换群**（commutative group）。
3. **格**（lattice）：带 meet 与 join 的偏序集。
4. **环**（ring）：(R, +, 0, x ↦ −x) 为（加法写的）阿贝尔群，另有结合乘法、单位元 1，且乘法对加法分配。乘法可交换时为 **交换环**（commutative ring）。
5. **有序环**（ordered ring）：环配备偏序，a ≤ b 蕴含 a + c ≤ b + c；0 ≤ a 且 0 ≤ b 蕴含 0 ≤ ab。
6. **度量空间**（metric space）：集合 X 与函数 d : X × X → ℝ，满足非负、恒为零当且仅当相等、对称、三角不等式。
7. **拓扑空间**（topological space）：集合 X 与开集族 𝒯，满足空集与 X 开、两开集之交开、任意开集之并开。

这些例子中，结构元素属于一个集合——**载体集**（carrier set），有时代表整个结构。说「设 G 为群」再「设 g ∈ G」时，G 既指结构又指载体。并非每个代数结构都对应单一载体集；二部图涉及两集之间的关系，Galois 对应亦然；**范畴**（category）通常涉及 **对象**（objects）与 **态射**（morphisms）两个集合。

这些例子表明证明助手须支持代数推理：识别结构的具体实例（ℤ、ℚ、ℝ 皆为有序环，泛型有序环定理应适用于它们）；同一集合可有多种结构（ℝ 除通常拓扑外还有 **离散拓扑**）；支持结构上的泛型记号（Lean 中 `*` 用于常见数系及泛型群、环的乘法，写 `f x * y` 时 Lean 据类型推断指哪种乘法）；处理结构间的继承（交换环仍是环；环的加法部分是加法群；度量空间有典范拓扑等）；允许用函数与运算定义结构（群的积与幂仍是群；ℤ/nℤ 为环；k×k 多项式系数环上的矩阵又为环）——结构在数学中有双重身份：对象的容器与对象本身。

处理带代数结构的类型元素时，证明助手须识别结构并找到相关定义、定理与记号。Lean 用少量基本机制完成这些任务；本节解释这些机制及用法。

第一个要素几乎不言而喻：形式地说，代数结构就是[定义结构体](Structures.md)意义上的结构——数据包满足公理假设，`structure` 命令正为此设计。

对数据类型 `α`，可如下定义群结构：

```lean
structure Group₁ (α : Type*) where
  mul : α → α → α
  one : α
  inv : α → α
  mul_assoc : ∀ x y z : α, mul (mul x y) z = mul x (mul y z)
  mul_one : ∀ x : α, mul x one = x
  one_mul : ∀ x : α, mul one x = x
  inv_mul_cancel : ∀ x : α, mul (inv x) x = one
```

类型 `α` 是 `Group₁` 定义中的 **参数**。应将 `struc : Group₁ α` 视为 α 上的群结构。在[证明代数结构中的恒等式](../C02_Basics/ProvingIdentitiesInAlgebraicStructures.md)中见过，`inv_mul_cancel` 的对应式可由其他群公理推出，不必加入定义。

此定义与 Mathlib 的 `Group` 类似，我们用 `Group₁` 区分。`#check Group` 并 ctrl-click 可见 Mathlib 的 `Group` **扩展**（extends）另一结构（后文说明）。`#print Group` 可见 Mathlib 版有额外字段——有时向结构添加 **冗余** 信息有用，便于从核心数据定义的对象与函数有额外字段；暂不必深究，简化版 `Group₁` 与 Mathlib 群定义在数学意义上相同。

有时宜将类型与结构一并捆绑；Mathlib 有等价的 `Grp` 结构：

```lean
structure Grp₁ where
  α : Type*
  str : Group₁ α
```

更常将类型 `α` 与结构 `Group α` 分开，二者合称 **部分捆绑结构**（partially bundled structure）。Mathlib 常用大写罗马字母如 G 表示作为群载体的类型。

下面通过定义 `Group₁` 的元素构造群。对任意类型对 `α`、`β`，Mathlib 定义 **等价**（equivalence）类型 `Equiv α β`，记号 `α ≃ β`。`f : α ≃ β` 为 α 与 β 之间的双射，由四部分组成：正向函数 `f.toFun`、反向函数 `f.invFun`、以及二者互逆的两个性质：

```lean
variable (α β γ : Type*)
variable (f : α ≃ β) (g : β ≃ γ)

#check Equiv α β
#check (f.toFun : α → β)
#check (f.invFun : β → α)
#check (f.right_inv : ∀ x : β, f (f.invFun x) = x)
#check (f.left_inv : ∀ x : α, f.invFun (f x) = x)
#check (Equiv.refl α : α ≃ α)
#check (f.symm : β ≃ α)
#check (f.trans g : α ≃ γ)
```

最后三个构造的命名富有创意：`Equiv.refl`、逆 `Equiv.symm`、复合 `Equiv.trans` 可视为双射对应关系为等价关系的显式证据。`f.trans g` 需反向复合正向函数。Mathlib 声明了从 `Equiv α β` 到 `α → β` 的 **强制**（coercion），可省略 `.toFun` 由 Lean 插入：

```lean
example (x : α) : (f.trans g).toFun x = g.toFun (f.toFun x) :=
  rfl

example (x : α) : (f.trans g) x = g (f x) :=
  rfl

example : (f.trans g : α → γ) = g ∘ f :=
  rfl
```

Mathlib 还定义 `Perm α` 为 α 到自身的等价：

```lean
example (α : Type*) : Equiv.Perm α = (α ≃ α) :=
  rfl
```

`Equiv.Perm α` 在等价复合下成群。我们取向使 `mul f g` 等于 `g.trans f`，正向函数为 `f ∘ g`，即通常的双射复合。定义如下：

```lean
def permGroup {α : Type*} : Group₁ (Equiv.Perm α)
    where
  mul f g := Equiv.trans g f
  one := Equiv.refl α
  inv := Equiv.symm
  mul_assoc f g h := (Equiv.trans_assoc h g f).symm
  one_mul := Equiv.trans_refl
  mul_one := Equiv.refl_trans
  inv_mul_cancel := Equiv.self_trans_symm
```

Mathlib 在 `Algebra.Group.End` 中对 `Equiv.Perm α` 定义了正是此 `Group` 结构。可对 `permGroup` 中用到的定理悬停查看陈述并跳转实现。

通常数学中记号似乎独立于结构；可考虑群 (G₁, ·, 1, ·⁻¹)、(G₂, ∘, e, i(·))、(G₃, +, 0, −)。在 Lean 中形式化群时记号与结构联系更紧：`Group` 的分量名为 `mul`、`one`、`inv`，乘法记号将指向它们。若用加法记号，则用同构结构 `AddGroup`（加法群底层结构），分量为 `add`、`zero`、`neg`。

回忆[定义结构体](Structures.md)中的 `Point` 与加法。练习：定义类似 `Group₁` 的 `AddGroup₁`，但用上述加法命名；在 `Point` 上定义取负与零，并定义 `AddGroup₁` 实例：

```lean
structure AddGroup₁ (α : Type*) where
  add : α → α → α
  zero : α
  neg : α → α
  add_assoc : ∀ x y z : α, add (add x y) z = add x (add y z)
  add_zero : ∀ x : α, add x zero = x
  zero_add : ∀ x : α, add zero x = x
  neg_add_cancel : ∀ x : α, add (neg x) x = zero

@[ext]
structure Point where
  x : ℝ
  y : ℝ
  z : ℝ

namespace Point

def add (a b : Point) : Point :=
  ⟨a.x + b.x, a.y + b.y, a.z + b.z⟩

def neg (a : Point) : Point := sorry

def zero : Point := sorry

def addGroupPoint : AddGroup₁ Point := sorry

end Point
```

进展不错：已知如何在 Lean 定义代数结构及其实例。还需为结构关联记号，以便在每个实例上使用；希望定义结构上的运算后可用于任意实例，证明结构上的定理后可用于任意实例。

事实上 Mathlib 已为 `Equiv.Perm α` 配置泛型群记号、定义与定理：

```lean
variable {α : Type*} (f g : Equiv.Perm α) (n : ℕ)

#check f * g
#check mul_assoc f g g⁻¹

#check g ^ n

example : f * g * g⁻¹ = f := by rw [mul_assoc, mul_inv_cancel, mul_one]

example : f * g * g⁻¹ = f :=
  mul_inv_cancel_right f g

example {α : Type*} (f g : Equiv.Perm α) : g.symm.trans (g.trans f) = f :=
  mul_inv_cancel_right f g
```

对上面要求定义的 `Point` 加法群则尚非如此。任务在于理解使 `Equiv.Perm α` 示例生效的底层机制。

Lean 须能 **找到** 相关记号与隐式群结构。写 `x + y`（x、y : ℝ）时须将 `+` 解释为实数加法，并识别 `ℝ` 为交换环实例以启用相应定理。连续性相对任意两拓扑空间定义；对 `f : ℝ → ℂ` 写 `Continuous f` 时须找到 `ℝ` 与 `ℂ` 上的相关拓扑。

这靠三者结合实现：

1. **逻辑**：应在任意群解释的定理以群的类型与群结构为参数；关于任意群元素的定理以类型与结构的全称量词开头。
2. **隐式参数**（implicit arguments）：类型与结构参数通常隐式，不必书写或在信息窗口看到；Lean 静默填充。
3. **类型类推断**（type class inference）：注册信息供 Lean 后续使用；填充隐式参数时可利用已注册信息。

注解 `(grp : Group G)` 表示显式给定；`{grp : Group G}` 表示从上下文推断；`[grp : Group G]` 表示用类型类推断 **合成**（synthesize）该参数。常写 `[Group G]` 匿名。`variable` 中用方括号匿名注解时，只要变量在作用域内，提及 `G` 的定义或定理会自动加上 `[Group G]`。

如何注册 Lean 搜索所需信息？回到群例子，只需两处改动：用 `class` 而非 `structure` 表明候选类型类；用 `instance` 而非 `def` 注册具体实例（实例名可匿名）：

```lean
class Group₂ (α : Type*) where
  mul : α → α → α
  one : α
  inv : α → α
  mul_assoc : ∀ x y z : α, mul (mul x y) z = mul x (mul y z)
  mul_one : ∀ x : α, mul x one = x
  one_mul : ∀ x : α, mul one x = x
  inv_mul_cancel : ∀ x : α, mul (inv x) x = one

instance {α : Type*} : Group₂ (Equiv.Perm α) where
  mul f g := Equiv.trans g f
  one := Equiv.refl α
  inv := Equiv.symm
  mul_assoc f g h := (Equiv.trans_assoc h g f).symm
  one_mul := Equiv.trans_refl
  mul_one := Equiv.refl_trans
  inv_mul_cancel := Equiv.self_trans_symm
```

用法示例：

```lean
#check Group₂.mul

def mySquare {α : Type*} [Group₂ α] (x : α) :=
  Group₂.mul x x

#check mySquare

section
variable {β : Type*} (f g : Equiv.Perm β)

example : Group₂.mul f g = g.trans f :=
  rfl

example : mySquare f = f.trans f :=
  rfl

end
```

`#check` 显示 `Group₂.mul` 有隐式参数 `[Group₂ α]`，期望由类型类推断找到；`{α : Type*}` 为群元素类型的隐式参数。写 `Group₂.mul f g` 时，f、g 的类型使 `α` 须实例化为 `Equiv.Perm β`，Lean 须找到 `Group₂ (Equiv.Perm β)`；前述 `instance` 声明即告诉 Lean 如何做到。

该注册机制极为有用。例如类型 `α` 可能为空；许多应用需知类型至少有一元素。`List.headI` 在列表为空时可返回默认值；Lean 库定义类 `Inhabited α` 存储默认值。可证 `Point` 为实例：

```lean
instance : Inhabited Point where default := ⟨0, 0, 0⟩

#check (default : Point)

example : ([] : List Point).headI = default :=
  rfl
```

类型类机制也用于泛型记号。`x + y` 是 `Add.add x y` 的缩写，`Add α` 为存储 α 上二元函数的类；写 `x + y` 即让 Lean 找 `[Add α]` 的注册实例。下面为 `Point` 注册加法：

```lean
instance : Add Point where add := Point.add

section
variable (x y : Point)

#check x + y

example : x + y = Point.add x y :=
  rfl

end
```

可为其他类型同样指定 `+`。更好的是：`*` 用于任意群、`+` 用于任意加法群、二者用于任意环；定义新环实例时不必再为其实例定义 `+` 与 `*`，Lean 知环上已定义。可为 `Group₂` 指定记号：

```lean
instance {α : Type*} [Group₂ α] : Mul α :=
  ⟨Group₂.mul⟩

instance {α : Type*} [Group₂ α] : One α :=
  ⟨Group₂.one⟩

instance {α : Type*} [Group₂ α] : Inv α :=
  ⟨Group₂.inv⟩

section
variable {α : Type*} (f g : Equiv.Perm α)

#check f * 1 * g⁻¹

def foo : f * 1 * g⁻¹ = g.symm.trans ((Equiv.refl α).trans f) :=
  rfl

end
```

关键在于 Lean 进行 **递归搜索**：据已声明实例，找 `Mul (Equiv.Perm α)` 需找 `Group₂ (Equiv.Perm α)`，而我们已提供。

此例有隐患：Lean 库亦有 `Group (Equiv.Perm α)`，任何群上均定义乘法，故实例有歧义。Lean 除非指定优先级否则倾向较新声明。还可用 `extends` 告诉 Lean 一结构是另一结构的实例（Mathlib 中每个交换环是环）。详见第 8 章《层次结构》与 [*Theorem Proving in Lean* 的类型类推断章节](https://leanprover.github.io/theorem_proving_in_lean4/Type-Classes/#managing-type-class-inference)。

一般不宜为已有记号的代数结构实例再指定 `*` 的值。在 Lean 中重定义 `Group` 是人为例子；此例两种群记号解释均展开为 `Equiv.trans`、`Equiv.refl`、`Equiv.symm`，方式相同。

类似的人为练习：仿 `Group₂` 定义 `AddGroup₂`；用 `Add`、`Neg`、`Zero` 为任意 `AddGroup₂` 定义加法、取负、零记号；证 `Point` 为 `AddGroup₂` 实例并验证加法群记号对 `Point` 元素可用：

```lean
class AddGroup₂ (α : Type*) where
  add : α → α → α
  zero : α
  neg : α → α
  add_assoc : ∀ x y z : α, add (add x y) z = add x (add y z)
  add_zero : ∀ x : α, add x zero = x
  zero_add : ∀ x : α, add zero x = x
  neg_add_cancel : ∀ x : α, add (neg x) x = zero

instance hasAddAddGroup₂ {α : Type*} [AddGroup₂ α] : Add α :=
  ⟨AddGroup₂.add⟩

instance hasZeroAddGroup₂ {α : Type*} [AddGroup₂ α] : Zero α :=
  ⟨AddGroup₂.zero⟩

instance hasNegAddGroup₂ {α : Type*} [AddGroup₂ α] : Neg α :=
  ⟨AddGroup₂.neg⟩

instance : AddGroup₂ Point where
  add := Point.add
  zero := Point.zero
  neg := Point.neg
  add_assoc := by simp [Point.add, add_assoc]
  add_zero := by simp [Point.add, Point.zero]
  zero_add := by simp [Point.add, Point.zero]
  neg_add_cancel := by simp [Point.add, Point.neg, Point.zero]

section
variable (x y : Point)

#check x + -y + 0

end
```

我们已为 `Point` 声明过 `Add`、`Neg`、`Zero` 实例，问题不大；两种合成记号方式应给出相同答案。

类型类推断微妙，使用时须谨慎——它配置不可见地支配表达式解释的自动化。善用则威力强大，是 Lean 中代数推理得以实现的关键。