# 第 12 章 数学的逻辑基础

> 已对照英文原版 PDF 与 `LoVe12_LogicalFoundationsOfMathematics_Demo.lean` 人工翻译校对（Lean-zh 中文版 PDF 第四部分尚未发布，发布后可用 `node scripts/extract-from-pdf.mjs` 重新对齐）。

在本章中，我们将更深入地探讨 Lean 的逻辑基础。此处介绍的大多数特性尤其适用于定义数学对象并证明与之相关的定理。更多细节可参考 Carneiro 的硕士论文 [5]。

## 12.1 宇宙

在依值类型论中，不仅所有项都有类型，所有类型本身也有类型。我们此前已经见过若干这样的情形。PAT 原理告诉我们，应将证明视为项、将命题视为类型。例如，定理

```lean
@And.intro : ∀a b, a → b → a ∧ b
```

实际上是一个类型为 `∀a b, a → b → a ∧ b` 的项 `@And.intro`，而后者又有类型：

```lean
∀a b, a → b → a ∧ b : Prop
```

那么 `Prop` 的类型是什么？`Prop` 的类型与迄今为止我们构造的几乎所有其他类型相同：

```lean
Prop : Type
```

`Type` 的类型又是什么？最简单的做法或许是令 `Type : Type`，但这一选择会导致**吉拉尔悖论**（Girard's paradox）——类型论版本的罗素悖论。为避免不一致性，我们需要一个更大的新类型来容纳 `Type`，我们称之为 `Type 1`。`Type 1` 本身的类型是 `Type 2`，依此类推：

```
Type   : Type 1
Type 1 : Type 2
Type 2 : Type 3
⋮
```

事实上，不带参数的 `Type` 是 `Type 0` 的缩写。若要将 `Prop` 纳入这一层级，可使用语法 `Sort u`，其中 `Sort 0` 是 `Prop` 的别名，`Sort (u + 1)` 是 `Type u` 的别名。该层级由下列类型判断刻画：

```
————————————————————————— Sort
C ⊢ Sort u : Sort (u + 1)
```

所有这些容纳其他类型的类型都称为**宇宙**（universe），表达式 `Sort u` 中的 `u` 是一个**宇宙层级**（universe level）。尽管宇宙层级看起来像类型为 `ℕ` 的项，事实上它们甚至不是项。

若不想处处写 `Type`，可以写 `Type _` 来使定理稍微更一般，而无需考虑宇宙层级；Lean 会创建一个新鲜的宇宙变量。这有助于维持一种便利的错觉：我们仿佛在一个 `Type : Type` 成立的逻辑中工作，却又不引入任何悖论。实践中，`Type 0` 对计算机科学与数学的大多数工作已足够大。

```lean
#check @And.intro
#check ∀a b : Prop, a → b → a ∧ b
#check Prop
#check ℕ
#check Type
#check Type 1
#check Type 2

universe u v

#check Type u

#check Sort 0
#check Sort 1
#check Sort 2
#check Sort u

#check Type _
```

## 12.2 Prop 的奇特之处

尽管 `Prop` 似乎能很好地融入宇宙层级，它在若干方面与其他宇宙不同。

### 12.2.1 非直谓性

从其他类型构造新类型时（例如从 `α : Type u` 和 `β : Type v` 构造 `α → β`），新构造的类型比其每个分量都更复杂，自然应将其放入所涉及的最大宇宙中（例如 `α → β : Type (max u v)`）。Lean 正是这样做的。下列类型规则对依赖类型一般地表达了这一思想：

```
C ⊢ σ : Type u    C, x : σ ⊢ τ[x] : Type v
——————————————————————————————————————————— Arrow-Type
C ⊢ (x : σ) → τ[x] : Type (max u v)
```

`Type` 宇宙的这种行为称为**直谓性**（predicativity）。一般而言，直谓性意味着一个对象不能借助遍历该对象自身的量词来定义。

然而，让 `Prop` 表现不同会很方便。我们希望表达式 `∀a : Prop, a → a` 的类型为 `Prop`——毕竟它是一个命题。展开 `∀` 的语法糖，该表达式与 `(a : Prop) → a → a` 相同。若此处是 `Type u` 而非 `Prop`，上述类型规则将给出

```
(a : Type u) → a → a : Type (u + 1)
```

因为 `Type u : Type (u + 1)` 且 `max (u + 1) (max u u) = u + 1`。于是，对该表达式进行类型检查时宇宙层级会加一。为强制像 `∀a : Prop, a → a` 这样的表达式仍具有类型 `Prop`，我们需要一条针对 `Prop` 体量的 `∀` 表达式的特殊类型规则：

```
C ⊢ σ : Sort u    C, x : σ ⊢ τ[x] : Prop
—————————————————————————————————————— Arrow-Prop
C ⊢ (∀x : σ, τ[x]) : Prop
```

该规则给出

```
∀a : Prop, a → a : Prop
```

正如所愿。上述两条类型规则可概括为单条规则：

```
C ⊢ σ : Sort u    C, x : σ ⊢ τ[x] : Sort v
——————————————————————————————————————————— Arrow
C ⊢ (x : σ) → τ[x] : Sort (imax u v)
```

其中 `imax u 0 = 0` 且 `imax u (v + 1) = max u (v + 1)`。这种行为称为 `Prop` 的**非直谓性**（impredicativity）。一般而言，非直谓性意味着一个对象可以借助遍历自身的量词来定义。

```lean
#check fun (α : Type u) (β : Type v) ↦ α → β
#check ∀a : Prop, a → a
```

### 12.2.2 证明无关性

`Prop` 与 `Type` 之间的第二个区别是**证明无关性**（proof irrelevance）。它意味着同一命题 `a` 的任意两个证明都相等：

```lean
theorem proof_irrel {a : Prop} (h₁ h₂ : a) :
    h₁ = h₂ :=
  by rfl
```

在 Lean 中，这一相等性是直至计算为止的语法相等，因此我们可以使用 `rfl` 策略。将命题视为类型、将证明视为该类型的元素时，证明无关性意味着一个命题要么是空类型，要么恰好有一个元素。若命题是空类型，则为假；若恰好有一个元素，则为真。证明无关性在推理依赖类型时非常有用，本章后文将看到。

在[第 6.3 节](ch06_InductivePredicates.md#63-规则归纳)中，我们看到了一张并排描述 `Bool` 与 `Prop` 解释的图。该图未考虑证明无关性，为同一命题显示了多个证明。我们现在知道这不准确。以下是修订后的图：

```
Bool:                    Prop:
┌─────────┐              ┌─────────┐
│ false ● │              │ False ● │
│ true  ● │              │ True  ● │
└─────────┘              └─────────┘
```

若我们在心理上将 `Bool` 的两个元素（`false` 与 `true`）与 `Prop` 的两个类型（`False` 与 `True`）对应起来，可见 `Prop` 几乎与 `Bool` 相同，只是 `Prop` 类型的命题可以存储证明，这与 PAT 原理一致。下表总结了情况：

| 项 | 类型 | 宇宙 |
|----|------|------|
| （无） | `False` | `Prop` |
| `True.intro` | `True` | `Prop` |
| `false` | `Bool` | `Type` |
| `true` | `Bool` | `Type` |

为使证明无关性成立，Lean 必须放弃归纳谓词的「无混淆」（no confusion）性质。的确，同一命题的多种证明应当被「混淆」。这只涉及归纳谓词（例如 `Even`），而不涉及一般的归纳类型（例如 `List α`）。

其他系统与逻辑做出了不同选择。例如，Rocq 默认是证明相关的，但与证明无关性兼容。同伦类型论及其他构造性或直觉主义类型论依赖相等证明中的数据，因此与证明无关性不兼容。

### 12.2.3 禁止大消去

`Prop` 与 `Type` 之间的又一区别在于：`Prop` 不允许**大消去**（large elimination）：通常无法从命题的证明中提取信息并在程序中使用（即属于 `Type` 的类型的值）。毕竟，由于证明无关性，给定命题的所有证明都相等，因而无法携带能区分它们的特定信息。

设想我们可以在程序中从证明提取信息。例如，可以在如下函数定义中使用 `match` 构造：

```lean
-- fails
def unsquare (i : ℤ) (hsq : ∃j, i = j * j) : ℤ :=
  match hsq with
  | Exists.intro j _ => j
```

函数 `unsquare` 接受一个平方数 `i` 以及 `i` 确为平方数的证明 `hsq`，并返回平方前的数 `j`，从证明中提取。Lean 会报错：

```
tactic 'induction' failed, recursor 'Exists.casesOn' can
only eliminate into Prop
```

若 Lean 接受该定义，我们可以如下推出 `False`。令

```lean
hsq₁ := Exists.intro 3 (by linarith)
hsq₂ := Exists.intro (-3) (by linarith)
```

为 `∃j, (9 : ℤ) = j * j` 的两个证明。注意它们对 `j` 使用了不同的见证（`3` 与 `-3`）。于是 `unsquare 9 hsq₁ = 3` 且 `unsquare 9 hsq₂ = -3`。然而，由证明无关性，`hsq₁ = hsq₂`。故 `unsquare 9 hsq₂` 等于 `3`。但我们已确定它等于 `-3`。这意味着 `3 = -3`，矛盾。

大消去缺失的一个不幸后果是，我们无法通过模式匹配与递归进行规则归纳（[第 4.8 节](ch04_ForwardProofs.md#48-通过模式匹配与递归进行归纳)）。这类归纳依赖一个「度量」——将参数映射到 `ℕ` 的函数。没有大消去，度量无法有意义地定义。这解释了为何规则归纳我们总是使用 `induction` 策略。

作为折衷，Lean 允许**小消去**（small elimination），它只能消去到 `Prop`——而大消去可以消去到任意大宇宙 `Type u`。这意味着我们可以用 `match` 分析证明的结构、提取存在性见证等，只要 `match` 表达式本身处于证明中。我们在[第 5.7 节](ch05_FunctionalProgramming.md#57-列表)与[第 6.5 节](ch06_InductivePredicates.md#65-消去)中已见过此类例子。

进一步的折衷是，Lean 允许对**语法单子集**（syntactic subsingleton）进行大消去：即 `Prop` 中最多以一种方式可证的类型。例如，`False` 无证明，而 `a ∧ b` 的所有证明都具有形式 `And.intro _ _`。（递归地，证明 `a` 与 `b` 的方式可能有多种。）更精确地说，语法单子集是至多有一个构造子的归纳定义，其参数要么属于 `Prop`，要么作为直接参数出现在结果类型中。当我们将 `h : a ∧ b` 与 `And.intro ha hb` 匹配时，不会泄露关于 `h` 的信息。

## 12.3 选择公理

Lean 的逻辑包含**选择公理**（axiom of choice），使得可以从任意非空类型获取一个任意元素。考虑下列预定义谓词：

```lean
inductive Nonempty (α : Sort u) : Prop
  | intro (val : α) : Nonempty α
```

该谓词表明 `α` 至少有一个元素。要证明 `Nonempty α`，必须向 `Nonempty.intro` 提供一个 `α` 值：

```lean
theorem Nat.Nonempty :
    Nonempty ℕ :=
  Nonempty.intro 0
```

由于 `Nonempty` 位于 `Prop` 中，大消去不可用，因而无法从 `Nonempty α` 的证明中提取所用元素。

在 Lean 中，选择公理的形式是一个函数：给定 `Nonempty α` 的证明，返回一个任意的 `α` 值：

```lean
Classical.choice {α : Sort u} : Nonempty α → α
```

我们无法知道返回的元素是否与用于证明 `Nonempty α` 的元素相同；它只会是 `α` 的某个任意元素。

常量 `Classical.choice` 是**不可计算**（noncomputable）的。若用 `#reduce` 或 `#eval` 向 Lean 索取其值，Lean 会拒绝计算。换言之，证明可以是项，但不一定是程序。这是一些逻辑学家倾向于不使用选择公理的原因之一。相比之下，绝大多数数学家对选择公理没有异议。

与证明无关性及大、小消去不同，选择公理并非内建于 Lean 内核；它只是核心库中的一条公理，我们可以自由选择是否使用。若用 `Classical.choice` 在 `Type` 中定义常量，Lean 要求将定义标记为 `noncomputable`。

下列工具依赖 `Classical.choice`：

* 函数 `Classical.choose`，称为**希尔伯特选择算子**（Hilbert's choice operator），在我们不在乎具体哪一个时，帮助我们找到 `∃a : α, p a` 的见证。其配套定理 `Classical.choose_spec` 给出见证确为见证的证明。

```lean
Classical.choose : (∃a : α, p a) → α
Classical.choose_spec : ∀h : (∃a : α, p a), p (Classical.choose h)
```

直观上，选择算子告诉我们：「说服我存在满足 `p` 的元素，我就给你一个这样的元素。」

* 我们还可以推出传统的选择公理：

```lean
Classical.axiomOfChoice (α β : Type) {R : α → β → Prop} :
    (∀x : α, ∃y : β, R x y) → (∃f : α → β, ∀x : α, R x (f x))
```

* 由选择公理以及命题与函数外延性（`propext`、`funext`），可以推出**排中律**（law of excluded middle）：

```lean
Classical.em : ∀a : Prop, a ∨ ¬a
```

有了排中律，每个命题都是可判定的。这意味着我们可以基于某命题是否为真进行分情况讨论来构造证明。

```lean
#check Classical.choice
#reduce Classical.choice Nat.Nonempty

noncomputable def arbitraryNat : ℕ :=
  Classical.choice Nat.Nonempty

#check Classical.em
#check Classical.choose
#check Classical.choose_spec
#check Classical.axiomOfChoice
```

## 12.4 子类型

归纳类型在适用时是非常便利的定义机制，但许多数学构造并不符合这一模式。Lean 提供两种替代方案：**子类型**（subtype）与**商类型**（quotient）。

**子类型化**（subtyping）是从现有类型创建新类型的机制。给定基类型元素上的谓词，子类型只包含满足该谓词的基类型元素。更精确地说，子类型包含**元素–证明对**，将基类型的一个元素与「该元素满足谓词」的证明组合在一起。

下图描绘了一个子类型：从基类型的五个元素中保留了两个。

```
基类型          子类型
·               ·
···             ·
·
···
·
```

子类型化对那些无法定义为归纳类型的类型很有用。例如，任何沿下列思路定义有限集类型的尝试都注定失败：

```lean
-- wrong
inductive Finset (α : Type) : Type where
  | empty  : Finset α
  | insert : α → Finset α → Finset α
```

因为一个给定集合可能有多种表示。例如 `{1, 2}` 可以用下列任意方式（以及更多方式）表示：

```lean
Finset.insert 1 (Finset.insert 2 Finset.empty)
Finset.insert 2 (Finset.insert 1 Finset.empty)
Finset.insert 1 (Finset.insert 1 (Finset.insert 2 Finset.empty))
```

相反，我们可以将有限集定义为（可能无限的）集合的子类型，且这些集合是有限的。一般而言，子类型的语法为

```
{variable : base-type // property-applied-to-variable}
```

我们在[第 4.6 节](ch04_ForwardProofs.md#46-依值类型)见过一个例子，即 `{i : ℕ // i ≤ n}`，它由满足 `i ≤ n` 的自然数 `i` 组成，其中 `n` 在语境中固定。基类型是 `ℕ`，性质是 `fun i ↦ i ≤ n`。同一类型不那么直观、但或许不那么令人困惑的写法是 `@Subtype ℕ (fun i ↦ i ≤ n)`。我们的动机性例子——某类型 `α` 上的有限集类型——指定为 `{A : Set α // Set.Finite A}`，其中 `Set.Finite` 当且仅当其参数有限时为真。

别名：

```lean
{x : τ // P[x]} := @Subtype τ (fun x ↦ P[x])
```

示例：

```lean
{i : ℕ // i ≤ n}            := @Subtype ℕ (fun i ↦ i ≤ n)
{a : α // a ∈ A}            := @Subtype α (fun a ↦ a ∈ A)
{A : Set α // Set.Finite A} := @Subtype (Set α) Set.Finite
```

### 12.4.1 第一个例子：满二叉树

为说明子类型，我们将基于[第 5.8 节](ch05_FunctionalProgramming.md#58-二叉树)的 `Tree` 类型定义满二叉树类型。在[第 6.6.3 节](ch06_InductivePredicates.md#663-满二叉树)中，我们引入了谓词 `IsFull`：当树的每个节点要么有零个子节点、要么有两个子节点时为真。基于该类型与该谓词，可以如下构造只含满二叉树的子类型 `FullTree`：

```lean
def FullTree (α : Type) : Type :=
  {t : Tree α // IsFull t}
```

这是下列定义的语法糖：

```lean
def FullTree (α : Type) : Type :=
  @Subtype (Tree α) IsFull
```

其中 `Subtype` 定义如下：

```lean
inductive Subtype {α : Type} (p : α → Prop) : Type
  | mk : (x : α) → p x → Subtype p
```

`FullTree` 的元素本质上是依值对：第一个分量是树 `t`，第二个分量是 `t` 为满树的证明。例如，下面是空满二叉树与由标号为 `6` 的单个内节点构成的满二叉树的定义：

```lean
def nilFullTree : FullTree ℕ :=
  Subtype.mk Tree.nil IsFull.nil

def fullTree6 : FullTree ℕ :=
  Subtype.mk (Tree.node 6 Tree.nil Tree.nil)
    (by
       apply IsFull.node
       apply IsFull.nil
       apply IsFull.nil
       rfl)
```

给定 `FullTree` 类型的值，可通过 `Subtype.val` 与 `Subtype.property` 检索其两个分量：

```lean
#reduce Subtype.val fullTree6
#check Subtype.property fullTree6
```

子类型最吸引人的方面是：只要操作保持子类型性质，我们就可以将基类型上的操作**提升**（lift）到子类型，而不必从零开始构建库。我们只需在基类型常量周围定义「包装器」。一般而言，为基类型上的操作 `f` 定义这样的包装器涉及三步：

1. 从包装器参数中提取基类型值；
2. 对这些基类型值调用 `f`；
3. 用 `Subtype.mk` 封装结果，并附上所得基类型值满足子类型性质的证明。

按此流程，若操作保持 `IsFull` 性质，我们可以将 `Tree` 函数提升为 `FullTree` 函数。例如，要将镜像操作从类型 `Tree → Tree` 提升到 `FullTree → FullTree`，我们必须

1. 从包装器参数中提取 `Tree`；
2. 对该 `Tree` 调用 `mirror`；
3. 用 `Subtype.mk` 封装结果，并证明所得 `Tree` 满足 `IsFull`。

第 3 步须从参数中提取 `IsFull` 的证明，并使用[第 6.6.3 节](ch06_InductivePredicates.md#663-满二叉树)的定理 `IsFull_mirror`。综合起来得到：

```lean
def FullTree.mirror {α : Type} (t : FullTree α) :
    FullTree α :=
  Subtype.mk (LoVe.mirror (Subtype.val t))
    (by
       apply IsFull_mirror
       apply Subtype.property t)
```

输入是子类型 `FullTree` 的元素 `t`。我们将 `t` 分解为 `Subtype.val t : Tree` 与 `Subtype.property t : IsFull t`。用先前的 `mirror` 函数反转 `t` 的树分量，并用定理 `IsFull_mirror` 连同 `t` 的性质分量，说明条件 `IsFull (mirror (Subtype.val t))` 成立。

最后，用 `Subtype.mk` 构造包含所得树及其满树性证明的对。`Subtype.mk` 构造子既可视为类对的构造子，也可视为从 `Tree` 到 `FullTree` 的强制转换，第二个参数保证该转换是安全的。

关于子类型的证明，下列定理很有用：

```lean
Subtype.eq : Subtype.val ?a = Subtype.val ?b → ?a = ?b
```

该定理表明：若两个子类型值的 `Subtype.val` 分量相等，则这两个子类型值相等。证明在 Lean 中无关紧要至关重要，因为我们不希望子类型中出现仅证明不同而产生的虚假重复值。`Subtype.eq` 可用于证明满二叉树的镜像的镜像仍是该满二叉树本身：

```lean
theorem FullTree.mirror_mirror {α : Type}
      (t : FullTree α) :
    (FullTree.mirror (FullTree.mirror t)) = t :=
  by
    apply Subtype.eq
    simp [FullTree.mirror, LoVe.mirror_mirror]
```

应用定理 `Subtype.eq` 并展开 `FullTree.mirror` 的定义，得到子目标

```
mirror (mirror (Subtype.val t)) = Subtype.val t
```

这与[第 5.8 节](ch05_FunctionalProgramming.md#58-二叉树)定理 `mirror_mirror` 的陈述一致。

### 12.4.2 第二个例子：向量

第二个例子是向量的下列定义：

```lean
def Vector (α : Type) (n : ℕ) : Type :=
  {xs : List α // List.length xs = n}
```

向量定义为给定长度的列表。对列表而言，所有长度的列表共用一个类型；对向量而言，每种长度都有专用类型。这一方案的优点是，诸如向量加法、标量积等操作要求参与的两个向量长度相同。我们在[第 5.9 节](ch05_FunctionalProgramming.md#59-依值归纳类型选读)见过一种不太实用的向量定义。

可以用 `Subtype.mk` 从列表构造向量：

```lean
def vector123 : Vector ℤ 3 :=
  Subtype.mk [1, 2, 3] (by rfl)
```

向量的基本操作可通过用 `Subtype.val` 与 `Subtype.property` 分解向量、操作底层列表、再用 `Subtype.mk` 重新组合来定义。例如，可以如下定义整数向量的分量取负：

```lean
def Vector.neg {n : ℕ} (v : Vector ℤ n) : Vector ℤ n :=
  Subtype.mk (List.map Int.neg (Subtype.val v))
    (by
       rw [List.length_map]
       exact Subtype.property v)
```

我们用 `List.map` 对底层列表的每一项取负，并用定理 `List.length_map` 说明这不会改变列表长度。

利用 `Subtype.eq`，可以证明关于 `Vector.neg` 的下列定理：

```lean
theorem Vector.neg_neg (n : ℕ) (v : Vector ℤ n) :
    Vector.neg (Vector.neg v) = v :=
  by
    apply Subtype.eq
    simp [Vector.neg]
```

应用 `Subtype.eq` 将目标约化为证明底层列表上的对应性质，随后可用 `simp` 完成证明。

## 12.5 商类型

**商**（quotient）是数学中强大的构造，用于定义 `ℤ`、`ℝ` 及许多其他集合。Lean 支持**商类型**，即类型上的对应物。与子类型化类似，商化从现有类型构造新类型。与子类型不同，商类型包含基类型的所有元素，只是基类型中不同的某些元素在商类型中可能被视为相等。用数学术语说，商类型与基类型的一个划分同构。下图展示了一个三分划构造的商类型：

```
基类型              商类型
·                   ○
···                 ○
·                   ○
···
·
```

所描绘的商类型只有三个元素，用灰色椭圆表示。每个元素对应一个或多个基类型元素。

构造商类型的前提是基类型 `τ` 与等价关系 `R : τ → τ → Prop`，它指定基类型的哪些元素在商中视为相等。要构造商类型，首先须证明 `R` 是 `τ` 上的等价关系。配备等价关系的类型 `τ` 称为**等价类型**（setoid）。在 Lean 中，`Setoid` 是一个类型类。可以用下列命令声明实例：

```lean
instance τ.Setoid : Setoid τ :=
  { r :=
      R
    iseqv :=
      { refl := …
        symm := …
        trans := … } }
```

其中省略号代表各性质缺失的证明。此外，该实例声明引入记号 `a ≈ b` 表示 `R a b`。更重要的是，我们现在可以使用商类型 `Quotient τ.Setoid`。

每个元素 `a : τ` 都属于 `Quotient τ.Setoid` 中的某个元素，由 `Quotient.mk τ.Setoid a` 给出，其中

```lean
Quotient.mk {α : Type} → (s : Setoid α) → α → Quotient s
```

表达式 `Quotient.mk τ.Setoid a` 相当冗长。幸好 Lean 允许将其缩写为 `⟦a⟧`。

下列公理保证：对满足 `R` 的元素对在商类型中确实相等：

```lean
Quotient.sound {a b : τ} : a ≈ b → ⟦a⟧ = ⟦b⟧
```

一个定理给出逆方向：

```lean
Quotient.exact {a b : τ} : ⟦a⟧ = ⟦b⟧ → a ≈ b
```

最后，可以将类型 `τ → υ` 的函数（`υ` 为任意类型）提升到 `Quotient τ.Setoid → υ`，使用 `Quotient.lift`，它满足直至计算为止的下列语法相等。给定某个 `f : τ → υ` 以及 `h : ∀a b, a ≈ b → f a = f b`，对所有 `a : τ` 有

```
Quotient.lift f h ⟦a⟧ = f a
```

参数 `h` 是 `f` 与 `≈` 相容的证明；换言之，`f` 不区分 `≈` 等价的参数。

```lean
#check Quotient
#check Quotient.mk
#check Quotient.sound
#check Quotient.exact
#check Quotient.lift
#check Quotient.lift₂
#check @Quotient.inductionOn
```

### 12.5.1 第一个例子：整数

作为商类型的第一个例子，我们构造整数。一个便利的做法是在自然数对上构造商。想法是：自然数对 `(p, n)` 表示整数 `p - n`。这样，所有非负整数 `p` 可用 `(p, 0)` 表示，所有负整数 `-n` 可用 `(0, n)` 表示。同一整数还有许多其他表示；例如 `(7, 0)`、`(8, 1)`、`(9, 2)` 与 `(10, 3)` 都表示整数 `7`。

首先，须注册要用的等价关系。我们希望两对 `(p₁, n₁)` 与 `(p₂, n₂)` 在 `p₁ - n₁` 与 `p₂ - n₂` 给出同一整数时相等。然而，条件 `p₁ - n₁ = p₂ - n₂` 不可行，因为 `ℕ` 上的减法行为不良（例如 `0 - 1 = 0`）。我们改用条件 `p₁ + n₂ = p₂ + n₁`，它依赖加法。

下面给出等价关系的定义，以及其为自反、对称、传递的证明：

```lean
instance Int.Setoid : Setoid (ℕ × ℕ) :=
  { r :=
      fun pn₁ pn₂ : ℕ × ℕ ↦
        Prod.fst pn₁ + Prod.snd pn₂ =
        Prod.fst pn₂ + Prod.snd pn₁
    iseqv :=
      { refl :=
          by
            intro pn
            rfl
        symm :=
          by
            intro pn₁ pn₂ h
            rw [h]
        trans :=
          by
            intro pn₁ pn₂ pn₃ h₁₂ h₂₃
            linarith } }

theorem Int.Setoid_Iff (pn₁ pn₂ : ℕ × ℕ) :
    pn₁ ≈ pn₂ ↔
    Prod.fst pn₁ + Prod.snd pn₂ =
    Prod.fst pn₂ + Prod.snd pn₁ :=
  by rfl
```

于是可以定义整数：

```lean
def Int : Type :=
  Quotient Int.Setoid
```

可以定义整数零：

```lean
def Int.zero : Int :=
  ⟦(0, 0)⟧
```

事实上，任何形如 `⟦(m, m)⟧` 的项都表示零：

```lean
theorem Int.zero_Eq (m : ℕ) :
    Int.zero = ⟦(m, m)⟧ :=
  by
    rw [Int.zero]
    apply Quotient.sound
    rw [Int.Setoid_Iff]
    simp
```

接下来在新整数上定义加法。在商类型上定义函数时，不能像归纳类型那样简单地用模式匹配定义。我们须先在基类型上定义函数，再将定义提升到商。为此，必须证明函数 `f` 的定义不依赖等价类所选的代表（即 `a ≈ b → f a = f b`）。函数 `Quotient.lift`（一元）与 `Quotient.lift₂`（二元）可用于这种方式的提升。

加法可定义为自然数对的分量逐对相加。然后须提供证明，说明这可以提升到商上的函数，即证明 `pn₁ ≈ pn₁'` 与 `pn₂ ≈ pn₂'` 蕴含

```
⟦(Prod.fst pn₁ + Prod.fst pn₂, Prod.snd pn₁ + Prod.snd pn₂)⟧
= ⟦(Prod.fst pn₁' + Prod.fst pn₂', Prod.snd pn₁' + Prod.snd pn₂')⟧
```

形式地：

```lean
def Int.add : Int → Int → Int :=
  Quotient.lift₂
    (fun pn₁ pn₂ : ℕ × ℕ ↦
       ⟦(Prod.fst pn₁ + Prod.fst pn₂,
         Prod.snd pn₁ + Prod.snd pn₂)⟧)
    (by
       intro pn₁ pn₂ pn₁' pn₂' h₁ h₂
       apply Quotient.sound
       rw [Int.Setoid_Iff] at *
       linarith)
```

所得函数 `Int.add` 具有预期行为：

```lean
theorem Int.add_Eq (p₁ n₁ p₂ n₂ : ℕ) :
    Int.add ⟦(p₁, n₁)⟧ ⟦(p₂, n₂)⟧ =
    ⟦(p₁ + p₂, n₁ + n₂)⟧ :=
  by rfl
```

若 Lean 允许我们一开始就把该定理作为 `Int.add` 的定义输入，那会非常方便，大概用下列语法：

```lean
-- fails
def Int.add : Int → Int → Int
  | ⟦(p₁, n₁)⟧, ⟦(p₂, n₂)⟧ => ⟦(p₁ + p₂, n₁ + n₂)⟧
```

这是优美直观的语法，但没有证明定义与 `≈` 相容，我们可以定义荒谬的函数并用它们推出 `False`。例如，可以定义

```lean
-- fails
def Int.fst : Int → ℕ
  | ⟦(p, n)⟧ => p
```

注意 `Int.fst ⟦(0, 0)⟧ = 0` 且 `Int.fst ⟦(1, 1)⟧ = 1`。然而，由于 `⟦(0, 0)⟧ = ⟦(1, 1)⟧`，我们得到 `0 = 1`，矛盾。

可以用特征定理 `Int.add_Eq` 证明关于 `Int.add` 的其他定理，例如

```lean
theorem Int.add_zero (i : Int) :
    Int.add Int.zero i = i :=
  by
    induction i using Quotient.inductionOn with
    | h pn =>
      cases pn with
      | mk p n => simp [Int.zero, Int.add]
```

我们用 `Quotient.inductionOn` 作为归纳原理调用 `induction` 策略，对 `i` 分情况，将 `i` 替换为 `⟦pn⟧`，其中 `pn` 是基类型 `ℕ × ℕ` 的任意值。然后对 `pn` 分情况，得到对 `(p, n)`。最后用 `Int.zero` 的定义与 `Int.add` 的特征等式化简目标。

### 12.5.2 第二个例子：无序对

**无序对**（unordered pair）是不区分第一、第二分量的对，通常记为 `{a, b}`。我们将引入类型 `UPair α`，作为 `α` 上的无序对，它是 `(a, b)` 关于关系「包含相同元素」的商：

```lean
instance UPair.Setoid (α : Type) : Setoid (α × α) :=
  { r :=
      fun ab₁ ab₂ : α × α ↦
        ({Prod.fst ab₁, Prod.snd ab₁} : Set α) =
        ({Prod.fst ab₂, Prod.snd ab₂} : Set α)
    iseqv :=
      { refl  := by simp
        symm  := by aesop
        trans := by aesop } }

theorem UPair.Setoid_Iff {α : Type} (ab₁ ab₂ : α × α) :
    ab₁ ≈ ab₂ ↔
    ({Prod.fst ab₁, Prod.snd ab₁} : Set α) =
    ({Prod.fst ab₂, Prod.snd ab₂} : Set α) :=
  by rfl

def UPair (α : Type) : Type :=
  Quotient (UPair.Setoid α)
```

容易证明我们的对确实是无序的：

```lean
theorem UPair.mk_symm {α : Type} (a b : α) :
    (⟦(a, b)⟧ : UPair α) = ⟦(b, a)⟧ :=
  by
    apply Quotient.sound
    rw [UPair.Setoid_Iff]
    aesop
```

无序对的另一种表示是基数为 1 或 2 的集合。下列操作将 `UPair α` 值转换为该表示：

```lean
def Set_of_UPair {α : Type} : UPair α → Set α :=
  Quotient.lift (fun ab : α × α ↦ {Prod.fst ab, Prod.snd ab})
    (by
       intro ab₁ ab₂ h
       rw [UPair.Setoid_Iff] at *
       exact h)
```

### 12.5.3 通过规范化与子类型化的替代定义

商类型的每个元素对应基类型的一个 `≈` 等价类。若存在系统方法为每个 `≈` 等价类获取**规范代表**（canonical representative），则可以用子类型代替商，只保留规范代表、滤掉其余元素。

考虑上文构造的整数商类型 `Int`。我们观察到 `(7, 0)`、`(8, 1)`、`(9, 2)` 与 `(10, 3)` 都表示整数 `7`，但直观上 `(7, 0)` 似乎更可取。若 `p` 或 `n` 为 `0`，则称对 `(p, n)` 是**规范的**：

```lean
inductive Int.IsCanonical : ℕ × ℕ → Prop
  | nonpos {n : ℕ} : Int.IsCanonical (0, n)
  | nonneg {p : ℕ} : Int.IsCanonical (p, 0)
```

整数则由规范的自然数对组成：

```lean
def Int : Type :=
  {pn : ℕ × ℕ // Int.IsCanonical pn}
```

显然，每个整数有且仅有一种表示。整数上的 `+`、`*` 等运算须给出规范结果。幸好，规范化自然数对很容易：

```lean
def Int.normalize : ℕ × ℕ → ℕ × ℕ
  | (p, n) => if p ≥ n then (p - n, 0) else (0, n - p)

theorem Int.IsCanonical_normalize (pn : ℕ × ℕ) :
    Int.IsCanonical (Int.normalize pn) :=
  by
    cases pn with
    | mk p n =>
      simp [Int.normalize]
      cases Classical.em (p ≥ n) with
      | inl hpn =>
        simp [*]
        exact Int.IsCanonical.nonneg
      | inr hpn =>
        simp [*]
        exact Int.IsCanonical.nonpos
```

对无序对而言，没有明显的规范形式，除非总是将较小元素放在前面（或后面）。这要求 `α` 上有线性序 `≤`：

```lean
def UPair.IsCanonical {α : Type} [LinearOrder α] :
    α × α → Prop
  | (a, b) => a ≤ b

def UPair (α : Type) [LinearOrder α] : Type :=
  {ab : α × α // UPair.IsCanonical ab}
```

回到 `Int.IsCanonical`，注意 `(0, 0)` 有两种规范性的证明，分别使用 `Int.IsCanonical.nonpos` 或 `Int.IsCanonical.nonneg`。这不是问题，因为由证明无关性，这些证明必须相等。

## 12.6 新引入的 Lean 结构总结

**声明**

| 名称 | 含义 |
|------|------|
| `noncomputable` | 修饰不可计算声明的前缀 |

**常量**

| 名称 | 含义 |
|------|------|
| `Classical.choice` | 从非空类型返回任意元素的函数 |
| `Classical.choose` | 由 `∃` 的证明返回见证的函数 |
| `Quotient` | 由给定 setoid 实例创建商类型的函数 |
| `Quotient.lift` | 将一元函数提升到商类型 |
| `Quotient.lift₂` | 将二元函数提升到商类型 |
| `Setoid` | 带有等价关系的类型的类型类 |
| `Sort u` | 层级 `u` 处的宇宙 |
| `Subtype.mk` | 构造子类型值的函数 |
| `Subtype.property` | 从子类型值提取性质的函数 |
| `Subtype.val` | 从子类型值提取基类型值的函数 |

**记法**

| 记法 | 含义 |
|------|------|
| `{x : α // P[x]}` | 满足 `P[x]` 的所有 `x ∈ α` 构成的子类型 |
| `≈` | setoid 上的等价关系（用于商化） |
| `Prop` | `Sort 0` 的缩写 |
| `Type u` | `Sort (u + 1)` 的缩写 |

**定理**

| 名称 | 含义 |
|------|------|
| `Classical.axiomOfChoice` | 传统的选择公理 |
| `Classical.choose_spec` | `Classical.choose` 的特征性质 |
| `Quotient.exact` | 商类型上的相等蕴含基类型上的 `≈` |
| `Quotient.inductionOn` | 商类型值上的归纳原理 |
| `Quotient.sound` | 基类型上的 `≈` 蕴含商类型上的相等 |
| `Subtype.eq` | 基类型上的相等蕴含子类型上的相等 |