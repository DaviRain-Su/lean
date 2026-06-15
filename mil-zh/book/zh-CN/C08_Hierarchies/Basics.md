# 基础

Lean 所有层次的最底层是 **携带数据的类**（data-carrying classes）。下列类记录类型 `α` 配备称为 `one` 的特异元素；此时尚无任何性质：

```lean
class One₁ (α : Type) where
  /-- The element one -/
  one : α
```

本章将大量使用类，需理解 `class` 命令的作用。`class` 定义带参数 `α : Type`、单字段 `one` 的结构 `One₁`，并将其标为类，使 `One₁ α` 类型的参数在标为 **实例隐式**（instance-implicit，方括号）时可由实例解析过程推断。也可用 `@[class] structure` 达到类似效果，但 `class` 还会让其字段中 `One₁ α` 以实例隐式出现。对比：

```lean
#check One₁.one -- One₁.one {α : Type} [self : One₁ α] : α

@[class] structure One₂ (α : Type) where
  /-- The element one -/
  one : α

#check One₂.one
```

第二处检查可见 `self : One₂ α` 为显式参数。确认第一版无需显式参数即可使用：

```lean
example (α : Type) [One₁ α] : α := One₁.one
```

注：上例将 `One₁ α` 标为实例隐式对 `example` 生成的声明无实际用处（无法复用），但可避免命名该参数，并养成将 `One₁ α` 标为实例隐式的习惯。

另一注：仅当 Lean 知道 `α` 是什么时才有效。省略类型标注 `: α` 可能报错：`typeclass instance problem is stuck... One₁ (?m.263 α)`。可用类型注解避免：

```lean
example (α : Type) [One₁ α] := (One₁.one : α)
```

在[序列与收敛](../C03_Logic/SequencesAndConvergence.md)中若写 `0 < 1` 而未说明是自然数还是实数，可能遇到类似问题。

下一步为 `One₁.one` 指定记号。为避免与内置 `1` 冲突，使用 `𝟙`：

```lean
@[inherit_doc]
notation "𝟙" => One₁.one

example {α : Type} [One₁ α] : α := 𝟙

example {α : Type} [One₁ α] : (𝟙 : α) = 𝟙 := rfl
```

再定义记录二元运算的数据类；暂不在加法与乘法间选择，用 diamond（⋄）：

```lean
class Dia₁ (α : Type) where
  dia : α → α → α

infixl:70 " ⋄ "   => Dia₁.dia
```

运算此阶段仍无性质。手工定义 **半群**（semigroup）结构：两字段——`Dia₁` 实例与断言 ⋄ 结合律的 `Prop` 字段 `dia_assoc`：

```lean
class Semigroup₀ (α : Type) where
  toDia₁ : Dia₁ α
  /-- Diamond is associative -/
  dia_assoc : ∀ a b c : α, a ⋄ b ⋄ c = a ⋄ (b ⋄ c)
```

陈述 `dia_assoc` 时，局部上下文有 `toDia₁`，Lean 可找 `Dia₁ α` 实例以理解 `a ⋄ b`。但 `toDia₁` 不会进入类型类实例库，故 `example {α : Type} [Semigroup₁ α] (a b : α) : α := a ⋄ b` 会失败：`failed to synthesize instance Dia₁ α`。可稍后加 `instance` 属性修复：

```lean
attribute [instance] Semigroup₀.toDia₁

example {α : Type} [Semigroup₀ α] (a b : α) : α := a ⋄ b
```

更宜用不同语法添加 `toDia₁`，告诉 Lean 将 `Dia₁ α` 的字段视为 `Semigroup₁` 自身字段，并自动添加 `toDia₁` 实例——`extends` 语法：

```lean
class Semigroup₁ (α : Type) extends toDia₁ : Dia₁ α where
  /-- Diamond is associative -/
  dia_assoc : ∀ a b c : α, a ⋄ b ⋄ c = a ⋄ (b ⋄ c)

example {α : Type} [Semigroup₁ α] (a b : α) : α := a ⋄ b
```

`structure` 命令也有此语法，但那里只解决写字段问题，无实例可定义。`extends` 中字段名 `toDia₁` 可选，默认取被扩展类名加前缀 `to`：

```lean
class Semigroup₂ (α : Type) extends Dia₁ α where
  /-- Diamond is associative -/
  dia_assoc : ∀ a b c : α, a ⋄ b ⋄ c = a ⋄ (b ⋄ c)
```

组合 diamond 运算与特异元，要求该元两侧中性：

```lean
class DiaOneClass₁ (α : Type) extends One₁ α, Dia₁ α where
  /-- One is a left neutral element for diamond. -/
  one_dia : ∀ a : α, 𝟙 ⋄ a = a
  /-- One is a right neutral element for diamond -/
  dia_one : ∀ a : α, a ⋄ 𝟙 = a
```

下一例说明 Lean 如何找 `Dia₁` 与 `One₁` 实例（可开 `set_option trace.Meta.synthInstance true` 在 Infoview 查看，成功尝试会用到 `extends` 生成的实例）：

```lean
set_option trace.Meta.synthInstance true in
example {α : Type} [DiaOneClass₁ α] (a b : α) : Prop := a ⋄ b = 𝟙
```

合并已有类时不必重复字段，故 **幺半群**（monoid）可定义为：

```lean
class Monoid₁ (α : Type) extends Semigroup₁ α, DiaOneClass₁ α
```

此定义隐藏微妙之处：`Semigroup₁ α` 与 `DiaOneClass₁ α` 均扩展 `Dia₁ α`，恐 `Monoid₁ α` 给出两个无关的 diamond 运算。若手工定义：

```lean
class Monoid₂ (α : Type) where
  toSemigroup₁ : Semigroup₁ α
  toDiaOneClass₁ : DiaOneClass₁ α
```

则得两个完全无关的 `dia`：`Monoid₂.toSemigroup₁.toDia₁.dia` 与 `Monoid₂.toDiaOneClass₁.toDia₁.dia`。

用 `extends` 的版本无此缺陷：

```lean
example {α : Type} [Monoid₁ α] :
  (Monoid₁.toSemigroup₁.toDia₁.dia : α → α → α) = Monoid₁.toDiaOneClass₁.toDia₁.dia := rfl
```

`class`（`structure` 亦然）为此做了处理。比较构造子可见 `Monoid₁` 接受 `Semigroup₁ α`，但不接受重叠的 `DiaOneClass₁ α` 整体，而是拆开只含非重叠部分，并自动生成实例 `Monoid₁.toDiaOneClass₁`：

```lean
#check Monoid₂.mk
#check Monoid₁.mk

#check Monoid₁.toSemigroup₁
#check Monoid₁.toDiaOneClass₁
```

接近定义群。可为每个元素断言逆元存在，但实践中更宜将逆作为数据。定义新数据类并赋记号：

```lean
class Inv₁ (α : Type) where
  /-- The inversion function -/
  inv : α → α

@[inherit_doc]
postfix:max "⁻¹" => Inv₁.inv

class Group₁ (G : Type) extends Monoid₁ G, Inv₁ G where
  inv_dia : ∀ a : G, a⁻¹ ⋄ a = 𝟙
```

上式看似过弱，只要求 `a⁻¹` 为 a 的左逆，右逆可证。需预备引理：

```lean
lemma left_inv_eq_right_inv₁ {M : Type} [Monoid₁ M] {a b c : M} (hba : b ⋄ a = 𝟙) (hac : a ⋄ c = 𝟙) : b = c := by
  rw [← DiaOneClass₁.one_dia c, ← hba, Semigroup₁.dia_assoc, hac, DiaOneClass₁.dia_one b]
```

全名繁琐。可用 `export` 将事实复制到根命名空间：

```lean
export DiaOneClass₁ (one_dia dia_one)
export Semigroup₁ (dia_assoc)
export Group₁ (inv_dia)
```

证明可改写为：

```lean
example {M : Type} [Monoid₁ M] {a b c : M} (hba : b ⋄ a = 𝟙) (hac : a ⋄ c = 𝟙) : b = c := by
  rw [← one_dia c, ← hba, dia_assoc, hac, dia_one b]
```

练习：

```lean
lemma inv_eq_of_dia [Group₁ G] {a b : G} (h : a ⋄ b = 𝟙) : a⁻¹ = b :=
  sorry

lemma dia_inv [Group₁ G] (a : G) : a ⋄ a⁻¹ = 𝟙 :=
  sorry
```

## `to_additive` 与环

欲定义环，遇严重问题：环含加法群与乘法幺半群及交互性质，但我们为所有运算硬编码了 `⋄`。更根本的是，类型类系统假设每类型每类仅一实例。Mathlib 用代码生成属性 `to_additive` **复制** 加法和乘法理论。多重继承时自动生成的「恢复对称」实例也需标记。细节可略；要点是引理多在乘法记号下陈述并标 `to_additive` 生成加法版。

```lean
class AddSemigroup₃ (α : Type) extends Add α where
  add_assoc₃ : ∀ a b c : α, a + b + c = a + (b + c)

@[to_additive AddSemigroup₃]
class Semigroup₃ (α : Type) extends Mul α where
  mul_assoc₃ : ∀ a b c : α, a * b * c = a * (b * c)

class AddMonoid₃ (α : Type) extends AddSemigroup₃ α, AddZeroClass α

@[to_additive AddMonoid₃]
class Monoid₃ (α : Type) extends Semigroup₃ α, MulOneClass α

export Semigroup₃ (mul_assoc₃)
export AddSemigroup₃ (add_assoc₃)

@[to_additive]
lemma left_inv_eq_right_inv' {M : Type} [Monoid₃ M] {a b c : M} (hba : b * a = 1) (hac : a * c = 1) : b = c := by
  rw [← one_mul c, ← hba, mul_assoc₃, hac, mul_one b]

#check left_neg_eq_right_neg'
```

可继续定义交换半群、幺半群、群与环。适当标 `simp`：

```lean
attribute [simp] Group₃.inv_mul AddGroup₃.neg_add
```

```lean
@[to_additive]
lemma inv_eq_of_mul [Group₃ G] {a b : G} (h : a * b = 1) : a⁻¹ = b :=
  sorry

@[to_additive (attr := simp)]
lemma Group₃.mul_inv {G : Type} [Group₃ G] (a : G) : a * a⁻¹ = 1 := by
  sorry

@[to_additive]
lemma mul_left_cancel₃ {G : Type} [Group₃ G] {a b c : G} (h : a * b = a * c) : b = c := by
  sorry

@[to_additive]
lemma mul_right_cancel₃ {G : Type} [Group₃ G] {a b c : G} (h : b*a = c*a) : b = c := by
  sorry

class AddCommGroup₃ (G : Type) extends AddGroup₃ G, AddCommMonoid₃ G

@[to_additive AddCommGroup₃]
class CommGroup₃ (G : Type) extends Group₃ G, CommMonoid₃ G
```

为演示，环不先假设加法交换，再提供 `AddCommGroup₃` 实例（Mathlib 经半环等更复杂层次，此处得漂亮练习）：

```lean
class Ring₃ (R : Type) extends AddGroup₃ R, Monoid₃ R, MulZeroClass R where
  left_distrib : ∀ a b c : R, a * (b + c) = a * b + a * c
  right_distrib : ∀ a b c : R, (a + b) * c = a * c + b * c

instance {R : Type} [Ring₃ R] : AddCommGroup₃ R :=
{ add_comm := by
    sorry }
```

也可建具体实例（下面借用 Mathlib 已有工作）：

```lean
instance : Ring₃ ℤ where
  add := (· + ·)
  add_assoc₃ := add_assoc
  zero := 0
  zero_add := by simp
  add_zero := by simp
  neg := (- ·)
  neg_add := by simp
  mul := (· * ·)
  mul_assoc₃ := mul_assoc
  one := 1
  one_mul := by simp
  mul_one := by simp
  zero_mul := by simp
  mul_zero := by simp
  left_distrib := Int.mul_add
  right_distrib := Int.add_mul
```

练习：为序关系建简单层次，含 **有序交换幺半群**（ordered commutative monoid）：偏序 + 交换幺半群，且 `∀ a b, a ≤ b → ∀ c, c * a ≤ c * b`。需补字段与 `extends`：

```lean
class LE₁ (α : Type) where
  le : α → α → Prop

@[inherit_doc] infix:50 " ≤₁ " => LE₁.le

class Preorder₁ (α : Type) :=
  sorry

class PartialOrder₁ (α : Type) :=
  sorry

class OrderedCommMonoid₁ (α : Type) :=
  sorry

instance : OrderedCommMonoid₁ ℕ := by sorry
```

## 模与坏钻石

涉及多类型的代数结构：典型为环上的 **模**（module）。若不知何为模，可暂当作向量空间，并设想环皆为域。模为交换加法群，配备环元素的标量乘法。

先定义类型 `α` 在类型 `β` 上的标量乘法数据类，右结合记号：

```lean
class SMul₃ (α : Type) (β : Type) where
  smul : α → β → β

infixr:73 " • " => SMul₃.smul
```

定义模：

```lean
class Module₁ (R : Type) [Ring₃ R] (M : Type) [AddCommGroup₃ M] extends SMul₃ R M where
  zero_smul : ∀ m : M, (0 : R) • m = 0
  one_smul : ∀ m : M, (1 : R) • m = m
  mul_smul : ∀ (a b : R) (m : M), (a * b) • m = a • b • m
  add_smul : ∀ (a b : R) (m : M), (a + b) • m = a • m + b • m
  smul_add : ∀ (a : R) (m n : M), a • (m + n) = a • m + a • n
```

有趣之处：`Ring₃ R` 作参数不意外，但 `AddCommGroup₃ M` 若放进 `extends` 会生成 `Module₁.toAddCommGroup₃` 实例，签名迫使 Lean 在找 `AddCommGroup₃ M` 时先猎寻未知类型 `R`——对实例解析是陷阱。`extends SMul₃ R M` 则安全：结果 `SMul₃ R M` 同时提及 R 与 M。规则易记：**`extends` 中每个类须提及参数中的每个类型**。

环以乘法为标量乘，是自身上的模：

```lean
instance selfModule (R : Type) [Ring₃ R] : Module₁ R R where
  smul := fun r s ↦ r*s
  zero_smul := zero_mul
  one_smul := one_mul
  mul_smul := mul_assoc₃
  add_smul := Ring₃.right_distrib
  smul_add := Ring₃.left_distrib
```

每个阿贝尔群是 `ℤ` 上的模。先对带零与加法的类型定义自然数标量乘法 `n • a` 为 n 个 a 之和，再扩展到整数，保证 `(-1) • a = -a`：

```lean
def nsmul₁ {M : Type*} [Zero M] [Add M] : ℕ → M → M
  | 0, _ => 0
  | n + 1, a => a + nsmul₁ n a

def zsmul₁ {M : Type*} [Zero M] [Add M] [Neg M] : ℤ → M → M
  | Int.ofNat n, a => nsmul₁ n a
  | Int.negSucc n, a => -nsmul₁ n.succ a
```

证模公理繁琐，下面用 `sorry`（不要求你补全）：

```lean
instance abGrpModule (A : Type) [AddCommGroup₃ A] : Module₁ ℤ A where
  smul := zsmul₁
  zero_smul := sorry
  one_smul := sorry
  mul_smul := sorry
  add_smul := sorry
  smul_add := sorry
```

更严重：`ℤ` 上有两个 `Module₁ ℤ ℤ`：`abGrpModule ℤ`（ℤ 为阿贝尔群）与 `selfModule ℤ`（ℤ 为环）。加法群结构相同，标量乘未必按定义相等，需证明——对类型类解析很糟，称 **坏钻石**（bad diamond）。与上文 diamond 运算无关，指从 `ℤ` 经 `AddCommGroup₃ ℤ` 或 `Ring₃ ℤ` 到 `Module₁ ℤ ℤ` 的两条路径。

```lean
#synth Module₁ ℤ ℤ -- abGrpModule ℤ
```

并非所有钻石都坏。底层为 `Prop` 的钻石不坏，因同一命题两证明定义相等。此坏钻石的症结是 `smul` 为数据，两构造非定义相等。稳健修复：**从富结构到贫结构应遗忘数据，而非重新定义数据**——「遗忘继承」（forgetful inheritance），见 [HAL 论文](https://inria.hal.science/hal-02463336v2)。

具体地，修改 `AddMonoid₃` 加入 `nsmul` 数据字段及证明其为上述构造的 `Prop` 字段，类型后用 `:=` 给默认值：

```lean
class AddMonoid₄ (M : Type) extends AddSemigroup₃ M, AddZeroClass M where
  nsmul : ℕ → M → M := nsmul₁
  nsmul_zero : ∀ x, nsmul 0 x = 0 := by intros; rfl
  nsmul_succ : ∀ (n : ℕ) (x), nsmul (n + 1) x = x + nsmul n x := by intros; rfl

instance mySMul {M : Type} [AddMonoid₄ M] : SMul ℕ M := ⟨AddMonoid₄.nsmul⟩
```

仍可建积幺半群实例而无需提供 `nsmul` 相关字段。对 `ℤ` 用 ℕ 到 ℤ 的强制与 `ℤ` 乘法定义 `nsmul`：

```lean
instance : AddMonoid₄ ℤ where
  add := (· + ·)
  add_assoc₃ := Int.add_assoc
  zero := 0
  zero_add := Int.zero_add
  add_zero := Int.add_zero
  nsmul := fun n m ↦ (n : ℤ) * m
  nsmul_zero := Int.zero_mul
  nsmul_succ := fun n m ↦ show (n + 1 : ℤ) * m = m + n * m
    by rw [Int.add_mul, Int.add_comm, Int.one_mul]
```

```lean
example (n : ℕ) (m : ℤ) : SMul.smul (self := mySMul) n m = n * m := rfl
```

故事继续：在群定义中加入 `zsmul` 等。现可阅读 Mathlib 中幺半群、群、环、模的定义——层次更庞大，但上述原则已涵盖。

练习：为序关系层次加入 `LT₁` 与记号 `<₁`，使每个预序自带由 `≤₁` 构造的默认 `<₁` 及断言二者自然关系的 `Prop` 字段。