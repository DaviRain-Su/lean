# 态射

本章迄今讨论如何搭建数学结构层次；定义结构体直到配备 **态射**（morphisms）才算完整。主要有两路。

最显然的是对函数定义谓词：

```lean
def isMonoidHom₁ [Monoid G] [Monoid H] (f : G → H) : Prop :=
  f 1 = 1 ∧ ∀ g g', f (g * g') = f g * f g'
```

用合取略不便，用户须记住条件顺序。可改用结构体：

```lean
structure isMonoidHom₂ [Monoid G] [Monoid H] (f : G → H) : Prop where
  map_one : f 1 = 1
  map_mul : ∀ g g', f (g * g') = f g * f g'
```

甚至可做成类，用类型类推断从简单函数推出复杂函数的 `isMonoidHom₂`（如复合）。但此类实例对解析很棘手——须在处处搜寻 `g ∘ f`，在 `g (f x)` 处失败会令人沮丧。更一般地，识别表达式中应用的函数是 **高阶合一**（higher-order unification）难题，Mathlib 不用此类做法。

更根本的问题：用上述谓词（`def` 或 `structure`），还是 **捆绑**（bundle）函数与谓词？部分心理层面：极少考虑非态射的幺半群间函数；「幺半群态射」更像名词而非可赋给裸函数的形容词。另一方面可说拓扑空间间的连续函数「碰巧」连续——Mathlib 有 `Continuous` 谓词：

```lean
example : Continuous (id : ℝ → ℝ) := continuous_id
```

仍有连续函数捆绑（便于给连续函数空间赋拓扑），但连续性主要工具是未捆绑谓词。

相比之下，幺半群（及其他代数结构）态射采用捆绑：

```lean
@[ext]
structure MonoidHom₁ (G H : Type) [Monoid G] [Monoid H]  where
  toFun : G → H
  map_one : toFun 1 = 1
  map_mul : ∀ g g', toFun (g * g') = toFun g * toFun g'
```

不想处处写 `toFun`，故用 `CoeFun` 类型类注册强制：第一参数为要强制为函数的类型；第二参数描述目标函数类型，此处恒为 `f : MonoidHom₁ G H` 时的 `G → H`。`MonoidHom₁.toFun` 标 `coe` 属性，在策略状态中几乎不可见，仅 `↑` 前缀：

```lean
instance [Monoid G] [Monoid H] : CoeFun (MonoidHom₁ G H) (fun _ ↦ G → H) where
  coe := MonoidHom₁.toFun

attribute [coe] MonoidHom₁.toFun

example [Monoid G] [Monoid H] (f : MonoidHom₁ G H) : f 1 = 1 :=  f.map_one
```

可对加法幺半群态射、环态射等重复，直至环态射：

```lean
@[ext]
structure AddMonoidHom₁ (G H : Type) [AddMonoid G] [AddMonoid H]  where
  toFun : G → H
  map_zero : toFun 0 = 0
  map_add : ∀ g g', toFun (g + g') = toFun g + toFun g'

instance [AddMonoid G] [AddMonoid H] : CoeFun (AddMonoidHom₁ G H) (fun _ ↦ G → H) where
  coe := AddMonoidHom₁.toFun

attribute [coe] AddMonoidHom₁.toFun

@[ext]
structure RingHom₁ (R S : Type) [Ring R] [Ring S] extends MonoidHom₁ R S, AddMonoidHom₁ R S
```

此路有小问题：`RingHom₁.toFun` 不存在，相关函数为 `MonoidHom₁.toFun ∘ RingHom₁.toMonoidHom₁`，无法直接标 `coe`（仍可定义 `CoeFun (RingHom₁ R S) (fun _ ↦ R → S)` 实例）。更重要：关于幺半群态射的引理不能直接用于环态射——要么每次经 `RingHom₁.toMonoidHom₁` 转换，要么为环态射重述所有引理，皆不理想。

Mathlib 的层次技巧：定义「至少是幺半群态射」的类型类，用幺半群态射与环态射实例化，并据此陈述引理。下文中 `F` 可为 `MonoidHom₁ M N` 或（M、N 为环时）`RingHom₁ M N`：

```lean
class MonoidHomClass₁ (F : Type) (M N : Type) [Monoid M] [Monoid N] where
  toFun : F → M → N
  map_one : ∀ f : F, toFun f 1 = 1
  map_mul : ∀ f g g', toFun f (g * g') = toFun f g * toFun f g'
```

尚未注册强制为函数的实例。若现在注册：

```lean
def badInst [Monoid M] [Monoid N] [MonoidHomClass₁ F M N] : CoeFun F (fun _ ↦ M → N) where
  coe := MonoidHomClass₁.toFun
```

做成实例会很糟：面对 `f x` 且 `f` 非函数类型时，Lean 会找 `CoeFun` 实例。上式类型为 `{M N F : Type} → [Monoid M] → [Monoid N] → [MonoidHomClass₁ F M N] → CoeFun F ...`，应用时不先验知 `M`、`N`、`F` 的推断顺序。不知 `M` 时 Lean 须在未知类型上搜幺半群实例——与已见的坏实例同类。

解法：告诉 Lean **先** 确定 `F`，再推出 `M`、`N`。用 `outParam` 函数（定义为恒等，但类型类机制识别并触发期望行为）：

```lean
class MonoidHomClass₂ (F : Type) (M N : outParam Type) [Monoid M] [Monoid N] where
  toFun : F → M → N
  map_one : ∀ f : F, toFun f 1 = 1
  map_mul : ∀ f g g', toFun f (g * g') = toFun f g * toFun f g'

instance [Monoid M] [Monoid N] [MonoidHomClass₂ F M N] : CoeFun F (fun _ ↦ M → N) where
  coe := MonoidHomClass₂.toFun

attribute [coe] MonoidHomClass₂.toFun
```

实例化该类：

```lean
instance (M N : Type) [Monoid M] [Monoid N] : MonoidHomClass₂ (MonoidHom₁ M N) M N where
  toFun := MonoidHom₁.toFun
  map_one := fun f ↦ f.map_one
  map_mul := fun f ↦ f.map_mul

instance (R S : Type) [Ring R] [Ring S] : MonoidHomClass₂ (RingHom₁ R S) R S where
  toFun := fun f ↦ f.toMonoidHom₁.toFun
  map_one := fun f ↦ f.toMonoidHom₁.map_one
  map_mul := fun f ↦ f.toMonoidHom₁.map_mul
```

在 `[MonoidHomClass₂ F]` 下对 `f : F` 证的引理同时适用于幺半群态射与环态射：

```lean
lemma map_inv_of_inv [Monoid M] [Monoid N] [MonoidHomClass₂ F M N] (f : F) {m m' : M} (h : m*m' = 1) :
    f m * f m' = 1 := by
  rw [← MonoidHomClass₂.map_mul, h, MonoidHomClass₂.map_one]

example [Monoid M] [Monoid N] (f : MonoidHom₁ M N) {m m' : M} (h : m*m' = 1) : f m * f m' = 1 :=
map_inv_of_inv f h

example [Ring R] [Ring S] (f : RingHom₁ R S) {r r' : R} (h : r*r' = 1) : f r * f r' = 1 :=
map_inv_of_inv f h
```

乍看像回到把 `MonoidHom₁` 做成类的坏主意，实则抽象升了一层：类型类解析找的是 `MonoidHom₁` 或 `RingHom₁`，不是裸函数。

`toFun`、`CoeFun`、`coe` 仍有重复代码。最好记录该模式仅用于带额外性质的函数，故强制为函数应 **单射**。Mathlib 再加一层抽象：**DFunLike**（DFun = dependent function）。在基类上重定义 `MonoidHomClass`：

```lean
class MonoidHomClass₃ (F : Type) (M N : outParam Type) [Monoid M] [Monoid N] extends
    DFunLike F M (fun _ ↦ N) where
  map_one : ∀ f : F, f 1 = 1
  map_mul : ∀ (f : F) g g', f (g * g') = f g * f g'

instance (M N : Type) [Monoid M] [Monoid N] : MonoidHomClass₃ (MonoidHom₁ M N) M N where
  coe := MonoidHom₁.toFun
  coe_injective' _ _ := MonoidHom₁.ext
  map_one := MonoidHom₁.map_one
  map_mul := MonoidHom₁.map_mul
```

态射层次还可继续（`RingHomClass₃`、`AlgebraHom` 等），但 Mathlib 态射形式化的主要思想已覆盖。

练习：定义有序类型间的捆绑保序函数，再定义保序幺半群态射（训练用；Mathlib 中保序函数主要用未捆绑的 `Monotone` 谓词）。补全下列类定义：

```lean
@[ext]
structure OrderPresHom (α β : Type) [LE α] [LE β] where
  toFun : α → β
  le_of_le : ∀ a a', a ≤ a' → toFun a ≤ toFun a'

@[ext]
structure OrderPresMonoidHom (M N : Type) [Monoid M] [LE M] [Monoid N] [LE N] extends
MonoidHom₁ M N, OrderPresHom M N

class OrderPresHomClass (F : Type) (α β : outParam Type) [LE α] [LE β] :=
  sorry

instance (α β : Type) [LE α] [LE β] : OrderPresHomClass (OrderPresHom α β) α β := by sorry

instance (α β : Type) [LE α] [Monoid α] [LE β] [Monoid β] :
    OrderPresHomClass (OrderPresMonoidHom α β) α β := by sorry

instance (α β : Type) [LE α] [Monoid α] [LE β] [Monoid β] :
    MonoidHomClass₃ (OrderPresMonoidHom α β) α β := sorry
```