# 第 13 章 基本数学结构

> 已对照英文原版 PDF 与 `LoVe13_BasicMathematicalStructures_Demo.lean` 人工翻译校对（Lean-zh 中文版 PDF 第三部分尚未发布，发布后可用 `node scripts/extract-from-pdf.mjs` 重新对齐）。

在本章中，我们将介绍关于基本数学结构（如群、域和线性序）的定义与证明。

## 13.1 单一二元运算上的类型类

在数学中，**群**（group）是一个集合 `G`，配备二元运算 `· : G × G → G`，满足下列称为**群公理**的性质：

* **结合律**：对所有 `a, b, c ∈ G`，有 `(a · b) · c = a · (b · c)`；
* **单位元**：存在元素 `e ∈ G`，使得对所有 `a ∈ G`，有 `e · a = a`；
* **逆元**：对每个 `a ∈ G`，存在逆元，记作 `a⁻¹`，使得 `a⁻¹ · a = e`。

在 Lean 中，群可以这样定义为一个类型类：

```lean
class Group (α : Type) where
  mul          : α → α → α
  one          : α
  inv          : α → α
  mul_assoc    : ∀a b c, mul (mul a b) c = mul a (mul b c)
  one_mul      : ∀a, mul one a = a
  mul_left_inv : ∀a, mul (inv a) a = one
```

然而，这并不是官方定义。群是更大代数结构层级的一部分。

群的运算可以写成**乘法形式**（运算符 `*`，单位元 `1`，逆元 `a⁻¹`）或**加法形式**（运算符 `+`，单位元 `0`，逆元 `-a`）。因此 Lean 提供两个群类型类：乘法群 `Group` 与加法群 `AddGroup`。二者本质相同，只是对常量与性质使用了不同的名称。

任何满足群公理的类型都可以注册为 `Group` 或 `AddGroup`。为说明这一点，我们将定义模 2 整数类型 `Int2`（亦称 `ℤ/2ℤ` 或 `ℤ₂`），并将其注册为 `AddGroup`。类型 `Int2` 有两个元素：

```lean
inductive Int2 : Type where
  | zero
  | one
```

加法定义如下：

```lean
def Int2.add : Int2 → Int2 → Int2
  | Int2.zero, a         => a
  | Int2.one,  Int2.zero => Int2.one
  | Int2.one,  Int2.one  => Int2.zero
```

要实例化 `AddGroup`，我们需要提供下列常量与性质：

```lean
add            : α → α → α
zero           : α
neg            : α → α
add_assoc      : ∀a b c, add (add a b) c = add a (add b c)
zero_add       : ∀a, add zero a = a
add_zero       : ∀a, add a zero = a
neg_add_cancel : ∀a, add (neg a) a = zero
nsmul          : ℕ → α → α
zsmul          : ℤ → α → α
```

常量 `AddGroup.add`、`AddGroup.zero` 与 `AddGroup.neg` 分别对应二元运算、单位元与逆元。性质 `AddGroup.add_assoc`、`AddGroup.zero_add` 与 `AddGroup.neg_add_cancel` 对应三条群公理。出于技术原因，我们还必须证明冗余性质 `AddGroup.add_zero`，并提供 `n` 重加法 `AddGroup.nsmul` 与 `AddGroup.zsmul` 的定义。

`Int2` 可以如下注册为群：

```lean
instance Int2.AddGroup : AddGroup Int2 :=
  { add            := Int2.add
    zero           := Int2.zero
    neg            := fun a ↦ a
    add_assoc      :=
      by
        intro a b c
        cases a <;>
          cases b <;>
          cases c <;>
          rfl
    zero_add       :=
      by
        intro a
        cases a <;>
          rfl
    add_zero       :=
      by
        intro a
        cases a <;>
          rfl
    neg_add_cancel :=
      by
        intro a
        cases a <;>
          rfl
    nsmul          :=
      @nsmulRec Int2 (Zero.mk Int2.zero) (Add.mk Int2.add)
    zsmul          :=
      @zsmulRec Int2 (Zero.mk Int2.zero) (Add.mk Int2.add)
        (Neg.mk (fun a ↦ a))
        (@nsmulRec Int2 (Zero.mk Int2.zero) (Add.mk Int2.add)) }
```

对于 `AddGroup.nsmul` 与 `AddGroup.zsmul`，我们使用 mathlib 提供的默认定义。

借助上述类型类实例，我们现在可以书写 `0`、`+`、`-` 等记号：

```lean
#reduce Int2.one + 0 - 0 - Int2.one
```

代数层级还包含更多仅有一个二元运算的类型类。主要类型类如下：

| 类型类 | 性质 | 示例 |
|--------|------|------|
| `Semigroup` | `*` 的结合律 | `ℝ`、`ℚ`、`ℤ`、`ℕ` |
| `Monoid` | 带单位元 `1` 的 `Semigroup` | `ℝ`、`ℚ`、`ℤ`、`ℕ` |
| `LeftCancelSemigroup` | 满足 `c * a = c * b → a = b` 的 `Semigroup` | |
| `RightCancelSemigroup` | 满足 `a * c = b * c → a = b` 的 `Semigroup` | |
| `Group` | 带乘法逆元 `⁻¹` 的 `Monoid` | |

对大多数这类结构，都有交换版本（对所有 `a, b` 有 `a · b = b · a`）：`CommSemigroup`、`CommMonoid`、`CommGroup`。这些结构也都有以 `Add` 为前缀的加法版本：

| 类型类 | 性质 | 示例 |
|--------|------|------|
| `AddSemigroup` | `+` 的结合律 | `ℝ`、`ℚ`、`ℤ`、`ℕ` |
| `AddMonoid` | 带单位元 `0` 的 `AddSemigroup` | `ℝ`、`ℚ`、`ℤ`、`ℕ` |
| `AddLeftCancelSemigroup` | 满足 `c + a = c + b → a = b` 的 `AddSemigroup` | `ℝ`、`ℚ`、`ℤ`、`ℕ` |
| `AddRightCancelSemigroup` | 满足 `a + c = b + c → a = b` 的 `AddSemigroup` | `ℝ`、`ℚ`、`ℤ`、`ℕ` |
| `AddGroup` | 带加法逆元 `-` 的 `AddMonoid` | `ℝ`、`ℚ`、`ℤ` |

尽管加法类型类只是其乘法对应物的副本，但在构造具有多个二元运算的代数结构（如环与域）时，它们至关重要。为避免基于乘法类型类的所有定理与定义被重复一遍，复制过程通过元程序自动化完成。

`AddMonoid` 的一个实例是类型 `List α`，其中空列表 `[]` 为零元，连接运算符 `++` 为加法：

```lean
instance List.AddMonoid {α : Type} : AddMonoid (List α) :=
  { zero      := []
    add       := fun xs ys ↦ xs ++ ys
    add_assoc := List.append_assoc
    zero_add  := List.nil_append
    add_zero  := List.append_nil
    nsmul     :=
      @nsmulRec (List α) (Zero.mk [])
        (Add.mk (fun xs ys ↦ xs ++ ys)) }
```

我们还可以继续将 `List α` 连同 `[]` 与 `++` 注册为 `AddLeftCancelSemigroup` 与 `AddRightCancelSemigroup`。

下图说明了部分类型类之间的关系。在本章及后续图中，从 `X` 指向 `Y` 的箭头表示「`X` 继承 `Y` 的全部常量与性质」。

```
Semigroup ──→ Monoid ──→ Group
    │             │           │
    ↓             ↓           ↓
CommSemigroup → CommMonoid → CommGroup

AddSemigroup ──→ AddMonoid ──→ AddGroup
    │               │              │
    ↓               ↓              ↓
AddCommSemigroup → AddCommMonoid → AddCommGroup
```

## 13.2 两个二元运算上的类型类

加法结构与乘法结构被合并，形成具有两个二元运算的更复杂结构。其中之一是**域**（field）。域 `F` 由下列性质定义：

* `F` 在运算符 `+`（称为加法）下构成交换群，单位元为 `0`。
* `F \ {0}` 在运算符 `*`（称为乘法）下构成交换群。
* 乘法对加法分配，即对所有 `a, b, c ∈ F`，有 `a * (b + c) = a * b + a * c`。

运行 `#print Field` 可以显示 `Field` 所需的全部常量与性质。同样，由于构造方式的原因，该类型类包含一些冗余性质与定义。

我们现在通过为 `Int2` 实例化 `Field` 类型类，来证明 `Int2` 是一个域。首先，必须在 `Int2` 上定义乘法：

```lean
def Int2.mul : Int2 → Int2 → Int2
  | Int2.one,  a => a
  | Int2.zero, _ => Int2.zero
```

要将 `Int2` 声明为域，可以借助语法 `Int2.AddGroup with` 复用上面定义的实例 `Int2.AddGroup`。其余性质可如下证明：

```lean
theorem Int2.mul_assoc (a b c : Int2) :
    Int2.mul (Int2.mul a b) c = Int2.mul a (Int2.mul b c) :=
  by
    cases a <;>
    cases b <;>
    cases c <;>
    rfl

instance Int2.Field : Field Int2 :=
  { Int2.AddGroup with
    one            := Int2.one
    mul            := Int2.mul
    inv            := fun a ↦ a
    add_comm       :=
      by
        intro a b
        cases a <;>
          cases b <;>
          rfl
    exists_pair_ne :=
      by
        apply Exists.intro Int2.zero
        apply Exists.intro Int2.one
        simp
    zero_mul       :=
      by
        intro a
        rfl
    mul_zero       :=
      by
        intro a
        cases a <;>
          rfl
    one_mul        :=
      by
        intro a
        rfl
    mul_one        :=
      by
        intro a
        cases a <;>
          rfl
    mul_inv_cancel :=
      by
        intro a h
        cases a
        · apply False.elim
          apply h
          rfl
        · rfl
    inv_zero       := by rfl
    mul_assoc      := Int2.mul_assoc
    mul_comm       :=
      by
        intro a b
        cases a <;>
          cases b <;>
          rfl
    left_distrib   :=
      by
        intro a b c
        cases a <;>
          cases b <;>
          rfl
    right_distrib  :=
      by
        intro a b c
        cases a <;>
          cases b <;>
          cases c <;>
          rfl
    nnqsmul        := _
    nnqsmul_def    :=
      by
        intro a b
        rfl
    qsmul          := _
    qsmul_def      :=
      by
        intro a b
        rfl
    nnratCast_def  :=
      by
        intro q
        rfl }
```

（为规避 Lean 的一处限制，`Field.mul_assoc` 字段被单独证明为一个定理。）

有了该类型类实例，我们现在可以使用记号 `1`、`*`、`/` 等：

```lean
#reduce (1 : Int2) * 0 / (0 - 1)
```

该命令打印 `Int2.zero`。此处类型注解 `: Int2` 是必要的，用以告诉 Lean 我们希望在 `Int2` 中计算，而不是在默认的 `ℕ` 中。我们甚至可以在 `Int2` 中使用任意数字字面量。例如，数字 `3` 被解释为 `1 + 1 + 1`，在 `Int2` 中与 `1` 相同：

```lean
#reduce (3 : Int2)
```

该命令打印 `Int2.one`。

除 `Field` 外，还有许多针对具有两个二元运算的结构的类型类。主要类型类如下：

| 类型类 | 性质 | 示例 |
|--------|------|------|
| `Semiring` | 带分配律的 `Monoid` 与 `AddCommMonoid` | `ℝ`、`ℚ`、`ℤ`、`ℕ` |
| `CommSemiring` | `*` 可交换的 `Semiring` | `ℝ`、`ℚ`、`ℤ`、`ℕ` |
| `Ring` | 带分配律的 `Monoid` 与 `AddCommGroup` | `ℝ`、`ℚ`、`ℤ` |
| `CommRing` | `*` 可交换的 `Ring` | `ℝ`、`ℚ`、`ℤ` |
| `DivisionRing` | 带乘法逆元 `⁻¹` 的 `Ring` | `ℝ`、`ℚ` |
| `Field` | `*` 可交换的 `DivisionRing` | `ℝ`、`ℚ` |

下图说明了这些类型类之间的关系。

```
Semiring ──→ Ring ──→ DivisionRing
    │          │            │
    ↓          ↓            ↓
CommSemiring → CommRing ──→ Field
```

`Field` 类型类要求性质 `∀a, a / 0 = 0`。这仅仅是一种约定，使除法成为全函数。数学家会把除法视为偏函数。以这种方式将偏函数**全化**并无害处。

一旦我们用具体类型实例化了类型类，就可以使用 `ring` 策略来归一化含有该类型运算符的项。例如：

```lean
theorem ring_example (a b : Int2) :
    (a + b) ^ 3 = a ^ 3 + 3 * a ^ 2 * b + 3 * a * b ^ 2 + b ^ 3
    :=
  by ring
```

该策略适用于任何被声明为域，或更一般地声明为交换半环的类型。

## 13.3 强制类型转换

当在同一定理中组合来自 `ℕ`、`ℤ`、`ℚ` 与 `ℝ` 的数时，我们可能希望在不同类型之间进行转换。例如，给定一个自然数，可能需要将其转换为整数。考虑下列定理，并注意乘法参数的类型：

```lean
theorem neg_mul_neg_Nat (n : ℕ) (z : ℤ) :
    (- z) * (- n) = z * n :=
  by simp
```

令人惊讶的是，该陈述并不会导致错误，尽管对 `n : ℕ` 并未定义取反 `- n`，且 `z : ℤ` 与 `n : ℕ` 的乘法也未定义。

诊断命令 `#check neg_mul_neg_Nat` 告诉我们发生了什么：

```
neg_mul_neg_Nat : ∀ (n : ℕ) (z : ℤ), -z * -↑n = z * ↑n
```

Lean 有一种机制，在必要时引入记作 `↑` 或 `coe` 的**强制类型转换**（coercion）。该强制转换运算符可配置为在任意类型之间提供隐式转换。许多强制转换已经就位，包括：

* `Coe.coe : ℕ → α` 将 `ℕ` 转换为另一半环 `α`；
* `Coe.coe : ℤ → α` 将 `ℤ` 转换为另一环 `α`；
* `Coe.coe : ℚ → α` 将 `ℚ` 转换为另一除环 `α`。

我们可以提供类型注解来记录意图，或帮助 Lean 确定强制转换的位置，如下例所示：

```lean
theorem neg_Nat_mul_neg (n : ℕ) (z : ℤ) :
    (- n : ℤ) * (- z) = n * z :=
  by simp
```

在涉及强制类型转换的证明中，`norm_cast` 策略可能很方便。它有助于处理形如 `m n : ℕ, h : ↑m = ↑n ⊢ m = n` 的目标：

```lean
theorem Eq_coe_int_imp_Eq_Nat (m n : ℕ)
      (h : (m : ℤ) = (n : ℤ)) :
    m = n :=
  by norm_cast at h
```

类似地，它有助于处理形如 `m n : ℕ ⊢ ↑m + ↑n = ↑(m + n)` 的目标：

```lean
theorem Nat_coe_Int_add_eq_add_Nat_coe_Int (m n : ℕ) :
    (m : ℤ) + (n : ℤ) = ((m + n : ℕ) : ℤ) :=
  by norm_cast
```

`norm_cast` 策略依赖于如下定理：

```lean
-- Nat.cast_add : ∀a b : ℕ, ↑(a + b) = ↑a + ↑b
-- Int.cast_add : ∀a b : ℤ, ↑(a + b) = ↑a + ↑b
-- Rat.cast_add : ∀a b : ℚ, ↑(a + b) = ↑a + ↑b
```

## 13.4 归一化策略

代数策略 `ring` 与强制类型转换策略 `norm_cast` 通过**归一化**（normalization）工作：它们重写表达式，希望最终变得语法上相等，此时相等性证明是平凡的。与 `rw` 和 `simp` 类似，当它们取得进展但未能完全证明目标时，会产生子目标。

可选的位置参数与重写策略相同（见[第 3.5 节](ch03_BackwardProofs.md#35-重写策略)）。

**`ring`** — 通过在交换环与半环（如 `ℕ`、`ℤ`、`ℚ`、`ℝ`）上归一化表达式并语法比较结果，证明相等式。

```
ring
ring at 位置
```

**`norm_cast`** — 将强制类型转换推向表达式外侧，作为一种简化形式。

```
norm_cast
norm_cast at 位置
```

## 13.5 列表、多重集与有限集

我们在前几章中已见过列表的许多用法。但在给出新定义或陈述新定理时，我们也应思考多重集与有限集等替代方案。

考虑基于[第 5.8 节](ch05_FunctionalProgramming.md#58-二叉树)引入的二叉树的下列定义：

```lean
def List.elems : Tree ℕ → List ℕ
  | Tree.nil        => []
  | Tree.node a l r => a :: List.elems l ++ List.elems r
```

该函数返回树中所有元素组成的列表。它按深度优先、从左到右遍历树。但对某些应用，我们可能并不关心元素的顺序。

这正是**多重集**（multiset）的用武之地。对多重集，有 `{3, 2, 1, 2} = {1, 2, 2, 3}`，而两个列表 `[3, 2, 1, 2]` 与 `[1, 2, 2, 3]` 则不同。多重集被定义为列表在重排意义下的商类型。我们可以用多重集重做上述定义：

```lean
def Multiset.elems : Tree ℕ → Multiset ℕ
  | Tree.nil        => ∅
  | Tree.node a l r =>
    {a} ∪ Multiset.elems l ∪ Multiset.elems r
```

借助该定义，可以证明 `Multiset.elems t = Multiset.elems (mirror t)`，而一般情况下 `List.elems t = List.elems (mirror t)` 并不成立。

对某些应用，我们可能希望更进一步：不仅忽略顺序，还忽略每个元素在树中出现的次数，只区分出现与不出现。这正是**有限集**（finite set，finset）的用武之地。在有限集上，有 `{3, 2, 1, 2} = {1, 2, 3}`。有限集被定义为不包含重复元素的多重集的子类型。（另一种可能的定义是有限集合的子类型。）我们可以用有限集重做上述定义：

```lean
def Finset.elems : Tree ℕ → Finset ℕ
  | Tree.nil        => ∅
  | Tree.node a l r => {a} ∪ Finset.elems l ∪ Finset.elems r
```

对列表与多重集，Lean 提供 `sum` 与 `prod` 运算符，分别对所有元素求和或求积。下面前两条命令打印 `9`，后两条打印 `24`：

```lean
#eval List.sum [2, 3, 4]
#eval Multiset.sum ({2, 3, 4} : Multiset ℕ)

#eval List.prod [2, 3, 4]
#eval Multiset.prod ({2, 3, 4} : Multiset ℕ)
```

这些运算符要求元素的类型被声明为 `AddMonoid`（对 `sum`）或 `Monoid`（对 `prod`）的实例。多重集版本还要求 `AddCommMonoid` 或 `CommMonoid` 的实例声明，因为结果不能依赖于相加或相乘元素的顺序。

## 13.6 序类型类

上文介绍的许多结构都可以配备序。例如，自然数上熟悉的序可以定义为

```lean
inductive Nat.le : ℕ → ℕ → Prop where
  | refl : ∀a : ℕ, Nat.le a a
  | step : ∀a b : ℕ, Nat.le a b → Nat.le a (b + 1)
```

这是**线性序**（linear order，亦称**全序** total order）的一个例子。线性序是二元关系 `≤`，对所有 `a`、`b`、`c` 满足下列性质：

* **自反性**：`a ≤ a`；
* **传递性**：若 `a ≤ b` 且 `b ≤ c`，则 `a ≤ c`；
* **反对称性**：若 `a ≤ b` 且 `b ≤ a`，则 `a = b`；
* **全序性**：`a ≤ b` 或 `b ≤ a`。

若关系具有前三条性质，则它是**偏序**（partial order）。例子包括集合、有限集或多重集上的子集关系 `⊆`。若关系仅具有前两条性质，则它是**预序**（preorder）。例子包括按长度比较列表。

在 Lean 中，有不同种类序的类型类：`LinearOrder`、`PartialOrder` 与 `Preorder`。`Preorder` 类有一个常量与两条性质：

```lean
le       : α → α → Prop
le_refl  : ∀a : α, le a a
le_trans : ∀a b c : α, le a b → le b c → le a c
```

`PartialOrder` 类有额外性质

```lean
le_antisymm : ∀a b : α, le a b → le b a → a = b
```

而 `LinearOrder` 有额外性质

```lean
le_total : ∀a b : α, le a b ∨ le b a
```

我们可以如下声明按长度比较列表的 `List α` 上的预序：

```lean
instance List.length.Preorder {α : Type} : Preorder (List α) :=
  { le := fun xs ys ↦ List.length xs ≤ List.length ys
    lt := fun xs ys ↦ List.length xs < List.length ys
    le_refl :=
      by
        intro xs
        apply Nat.le_refl
    le_trans :=
      by
        intro xs ys zs
        exact Nat.le_trans
    lt_iff_le_not_ge :=
      by
        intro a b
        exact Nat.lt_iff_le_not_le }
```

该类型类实例使我们能使用中缀语法 `≤` 以及相应关系 `≥`、`<` 与 `>`：

```lean
theorem list.length.Preorder_example :
    [1] > [] :=
  by decide
```

该证明用到了新策略 `decide`，它借助类型类推导来证明平凡的**可判定**（decidable）目标。

我们在[第 11 章](ch11_DenotationalSemantics.md)讨论过的**完备格**（complete lattice）被形式化为另一类型类 `CompleteLattice`，它继承自 `PartialOrder`。

```
Preorder ──→ PartialOrder ──→ LinearOrder
                  │
                  ↓
           CompleteLattice
```

最后，Lean 还提供结合序与代数结构的类型类：`OrderedCancelCommMonoid`、`OrderedCommGroup`、`OrderedSemiring`、`LinearOrderedSemiring`、`LinearOrderedCommRing`、`LinearOrderedField`。

所有这些数学结构通过单调性规则（例如 `a ≤ b → c ≤ d → a + c ≤ b + d`）与消去规则（例如 `c + a ≤ c + b → a ≤ b`），将 `≤` 与 `<` 同常量 `0`、`1`、`+` 与 `*` 联系起来。

## 13.7 判定策略 `decide`

**`decide`** — 可用于证明为真的可判定目标。可判定性通过检查是否属于 `Decidable` 类型类来确定。与 `rfl` 不同，`decide` 不限于证明相等式。

## 13.8 新引入的 Lean 结构总结

**记号**

| 记号 | 含义 |
|------|------|
| `↑` | 强制类型转换运算符 `coe` |

**策略**

| 策略 | 含义 |
|------|------|
| `decide` | 证明可判定为真的命题（例如可执行表达式为真） |
| `norm_cast` | 归一化强制类型转换 |
| `ring` | 归一化环表达式 |