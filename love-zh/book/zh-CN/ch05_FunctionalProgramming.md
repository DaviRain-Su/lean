# 第 5 章 函数式编程

> 已对照 Lean-zh PDF 与 `LoVe05_FunctionalProgramming_Demo.lean` 人工校对（原 PDF 3838–5056 行）。

我们将深入探讨带类型函数式编程的本质：**归纳类型**、**归纳证明**、**递归函数**、**模式匹配**、**结构体**（记录）以及**类型类**。这里涵盖的概念在 [《Lean 4 定理证明》][12] 的第 7 到 10 章中有更详细的描述。

## 5.1 归纳类型

归纳类型模仿了带类型函数式编程语言（如 Haskell、ML、OCaml）中的数据类型，也让人联想到 Scala 中的密封类（sealed class）。在第 2 章中，我们看到了一些基本的归纳类型：自然数、算术表达式类型以及有限列表。在本章中，我们将重新审视列表并研究二叉树，还将简要了解长度为 `n` 的**向量**（vector）——一种依值类型。

回想一下作为归纳类型的自然数定义：

```lean
inductive Nat : Type where
  | zero : Nat
  | succ : Nat → Nat
```

这定义了类型 `Nat` 以及两个常量 `Nat.zero` 和 `Nat.succ`，它们被称为**构造子**。该定义还断言了构造子的一些性质，并引入了用于在内部支持归纳和递归的额外常量。

正如我们在第 2.1 节中看到的，归纳类型是一种其成员全部由（且仅由）有限次应用其构造子所构建的值组成的类型。两条格言：

- **无杂质**（no junk）：类型中不包含除使用构造子可表达的值之外的任何值。
- **无混淆**（no confusion）：以不同方式用构造子组合构建的值是不同的。

对于自然数，「无杂质」意味着不存在无法用 `Nat.zero` 和 `Nat.succ` 的有限组合来表达的特殊值（如 −1、ε、∞ 或 NaN）；「无混淆」则确保对所有 `n` 有 `Nat.zero ≠ Nat.succ n`，且 `Nat.succ` 是**单射**的（injective）。

此外，归纳类型的值总是有限的。`Nat.succ (Nat.succ (Nat.succ (Nat.succ …)))` 并不是一个值。同样，也不存在值 `n` 使得 `Nat.succ n = n`，这一点我们将在下文证明。

归纳类型使用起来非常方便，因为它们支持归纳和递归，且构造子表现良好；但并非所有类型都能定义为归纳类型。特别地，诸如 ℚ 和 ℝ 等数学类型需要基于**商构造**（quotienting）和**子类型化**（subtyping）的更复杂构造，这将在第 14 章中详细说明。

## 5.2 结构归纳

**结构归纳**（structural induction）是数学归纳法向任意归纳类型的推广。为了通过对 `n` 的结构归纳证明目标 `n : ℕ ⊢ P[n]`，只需证明两个子目标，传统上称为**基本情况**（base case）和**归纳步骤**（induction step）：

```
⊢ P[0]
k : ℕ, ih : P[k] ⊢ P[k + 1]
```

当然，我们也可以写 `Nat.zero` 和 `Nat.succ k` 来代替 `0` 和 `k + 1`。

通常情况下，情况会更复杂。目标可能包含一些不依赖于 `n` 的额外假设（例如 `Q`），以及一些依赖于 `n` 的假设（例如 `R[n]`）。若我们每种假设各有一个，初始目标为：

```
hQ : Q, n : ℕ, hR : R[n] ⊢ S[n]
```

对 `n` 进行结构归纳会产生两个子目标：

```
hQ : Q, hR : R[0] ⊢ S[0]
hQ : Q, k : ℕ, ih : R[k] → S[k], hR : R[k + 1] ⊢ S[k + 1]
```

假设 `Q` 从初始目标原封不动地继承，而 `R[n] ⊢ S[n]` 处理起来几乎就像目标的目的变成了 `R[n] → S[n]`。在上面的第一个例子中，令 `P[n] := R[n] → S[n]` 即可验证。由于这种通用格式非常冗长且几乎不包含额外信息，从现在起我们将以尽可能简单的形式呈现目标，不带额外假设。

对于列表，给定目标 `xs : List α ⊢ P[xs]`，对 `xs` 进行结构归纳得到：

```
⊢ P[[]]
y : α, ys : List α, ih : P[ys] ⊢ P[y :: ys]
```

当然，我们也可以写 `List.nil` 和 `List.cons y ys`。这里没有与 `y` 关联的归纳假设，因为 `y` 不是列表类型的。

对于算术表达式，基本情况是：

```
i : ℤ ⊢ P[AExp.num i]
x : String ⊢ P[AExp.var x]
```

归纳步骤是：

```
e₁ e₂ : AExp, ih₁ : P[e₁], ih₂ : P[e₂] ⊢ P[AExp.add e₁ e₂]
e₁ e₂ : AExp, ih₁ : P[e₁], ih₂ : P[e₂] ⊢ P[AExp.sub e₁ e₂]
e₁ e₂ : AExp, ih₁ : P[e₁], ih₂ : P[e₂] ⊢ P[AExp.mul e₁ e₂]
e₁ e₂ : AExp, ih₁ : P[e₁], ih₂ : P[e₂] ⊢ P[AExp.div e₁ e₂]
```

注意关于 `e₁` 和 `e₂` 的两个归纳假设。

通常情况下，结构归纳会为每个构造子产生一个子目标。在每个子目标中，对于我们正在进行归纳的类型的所有构造子参数，归纳假设都是可用的。

给定归纳类型 `τ`，计算子目标的步骤总是相同的：

1. 将 `P[_]` 中的空缺替换为应用于新变量（例如 `y :: ys`）的每个可能的构造子，产生与构造子数量相同的子目标。
2. 将这些新变量（例如 `y`、`ys`）添加到局部语境中。
3. 为所有类型为 `τ` 的新变量添加归纳假设。

例如，我们将证明对于所有 `n : ℕ`，`Nat.succ n ≠ n`。非形式证明如下：

> 证明采用对 `n` 的结构归纳。  
> **情况 0**：我们必须证明 `Nat.succ 0 ≠ 0`。这遵循归纳类型构造子的「无混淆」性质。  
> **情况 `Nat.succ k`**：归纳假设是 `Nat.succ k ≠ k`。我们必须证明 `Nat.succ (Nat.succ k) ≠ Nat.succ k`。通过 `Nat.succ` 的单射性，`Nat.succ (Nat.succ k) = Nat.succ k` 等价于 `Nat.succ k = k`。因此只需证明 `Nat.succ k ≠ k`，这恰好是归纳假设。证毕。

请注意此非形式证明的主要特征——你在自己的非形式论证中应努力复现：

- 证明以明确声明证明类型开始（例如哪种归纳、对哪个变量归纳）。
- 各个情况被清晰识别，且对每个情况都陈述了目标的目的和假设。
- 明确调用了证明所依赖的关键定理（例如 `Nat.succ` 的单射性）。

现在在 Lean 中完成该证明：

```lean
theorem Nat.succ_neq_self (n : ℕ) :
    Nat.succ n ≠ n :=
  by
    induction n with
    | zero       => simp
    | succ n' ih =>
      intro hsucc
      apply ih
      apply Nat.succ.inj hsucc
```

这个证明有些刻意——它可以用单个 `simp` 调用取代——但仍具启发意义。

## 5.3 结构化递归

**结构化递归**（structural recursion）是一种递归形式，它允许我们从进行递归的值中剥离出一个构造子。下面的阶乘函数就是结构化递归的：

```lean
def fact : ℕ → ℕ
  | 0     => 1
  | n + 1 => (n + 1) * fact n
```

我们剥离的构造子是 `Nat.succ`（写作 `+ 1`）。这样的函数保证在递归停止前只调用自身有限次；例如 `fact 12345` 将调用自身 12345 次。该函数被称为**终止的**（terminating），这一性质有助于确保逻辑一致性。

在结构化递归中，等式的数量与构造子的数量相同。初学者往往倾向于提供额外的冗余情况：

```lean
def factThreeCases : ℕ → ℕ
  | 0     => 1
  | 1     => 1
  | n + 1 => (n + 1) * factThreeCases n
```

抵制这种诱惑对你最有好处。定义中的情况越多，推理工作量越大。请记住格言：「一个好的定义抵得上三个定理。」

对于结构化递归函数，Lean 可以自动证明其终止性。对于更通用的递归模式，终止性检查可能会失败——有时失败是有充分理由的：

```lean
-- fails
def illegal : ℕ → ℕ
  | n => illegal n + 1
```

若 Lean 接受这个定义，我们就可以从等式 `illegal n = illegal n + 1` 两边减去 `illegal n` 来证明 `0 = 1`，进而得到 `False`，再从 `False` 导出任何结论。显然，我们不想要这样的结果。

若使用 `opaque` 和 `axiom`，那就没有任何办法了：

```lean
opaque immoral : ℕ → ℕ

axiom immoral_eq (n : ℕ) :
    immoral n = immoral n + 1

theorem proof_of_False :
    False :=
  have hi : immoral 0 = immoral 0 + 1 :=
    immoral_eq 0
  have him :
    immoral 0 - immoral 0 = immoral 0 + 1 - immoral 0 :=
    by rw [←hi]
  have h0eq1 : 0 = 1 :=
    by simp at him
  show False from
    by simp at h0eq1
```

我们更倾向于使用 `def` 而非 `opaque` 和 `axiom` 的另一个原因是，定义的等式可用于计算。像 `rfl` 这样在计算意义下进行统一的策略，在我们每次引入定义时都会变得更强大；`#eval` 和 `#reduce` 也可用于已定义的常量。

## 5.4 模式匹配表达式

模式匹配不仅可以在 `def` 命令的顶层进行，还可以通过 `match` 表达式深入到项的内部。通用语法为：

```
match 项₁, …, 项ₘ with
| 模式₁₁, …, 模式₁ₘ => 结果₁
  ⋮
| 模式ₙ₁, …, 模式ₙₘ => 结果ₙ
```

含义如下：考虑项 `项₁, …, 项ₘ`；若它们的形式分别为 `模式₁₁, …, 模式₁ₘ`，则得到 `结果₁`；……；若它们的形式分别为 `模式ₙ₁, …, 模式ₙₘ`，则得到 `结果ₙ`。模式可包含变量、构造子和匿名占位符 `_`；`结果ᵢ` 可引用相应模式中引入的变量。

下面的 `bcount` 函数计算列表中满足谓词 `p` 的元素数量。该谓词的**陪域**（codomain）是 `Bool`：

```lean
def bcount {α : Type} (p : α → Bool) : List α → ℕ
  | []      => 0
  | x :: xs =>
    match p x with
    | true  => bcount p xs + 1
    | false => bcount p xs
```

作为一般规则，我们在程序中使用布尔类型 `Bool`，在陈述程序性质时使用命题类型 `Prop`。`Bool` 的两个值是 `false` 和 `true`（小写）。逻辑联结词为 `or`（中缀 `||`）、`and`（中缀 `&&`）以及 `not`（前缀 `!`）。

下图展示了 `Bool` 和 `Prop` 的解释：点代表元素，圆圈代表类型，矩形代表宇宙（类型的类型）。`Bool` 被解释为拥有两个值的集合，而 `Prop` 由无限多个命题组成，每个命题有零个或多个证明（元素）。我们将在第 6 章中完善这张图。

我们不能对命题（类型为 `Prop`）进行模式匹配，但可以使用 `if`–`then`–`else`。例如，自然数上的 `min` 可定义如下：

```lean
def min (a b : ℕ) : ℕ :=
  if a ≤ b then a else b
```

这需要一个**可判定**（decidable）的命题——对 `≤` 而言确实如此：给定具体参数（如 35 和 49），Lean 可将 `35 ≤ 49` 约化为 `True`。Lean 用**类型类**机制跟踪可判定性，下文将解释。

> Lean 也允许使用 `True` 和 `False`，但它们会被隐式地从 `Prop` 转换为 `Bool`。我们通常建议避免这种隐式强制转换；遗憾的是，目前没有办法禁用它们。

## 5.5 结构体

Lean 提供了定义**结构体**（structure，也称**记录** record）的便捷语法。它们本质上是拥有语法糖的非递归、单构造子归纳类型。

下面的定义引入名为 `RGB` 的结构体，有三个类型为 `ℕ` 的字段 `red`、`green` 和 `blue`：

```lean
structure RGB where
  red   : ℕ
  green : ℕ
  blue  : ℕ
```

此定义大致等价于：

```lean
inductive RGB : Type where
  | mk : ℕ → ℕ → ℕ → RGB

def RGB.red : RGB → ℕ
  | RGB.mk r _ _ => r

def RGB.green : RGB → ℕ
  | RGB.mk _ g _ => g

def RGB.blue : RGB → ℕ
  | RGB.mk _ _ b => b
```

可将新结构体定义为现有结构体的扩展。下面的定义用字段 `alpha : ℕ` 扩展 `RGB`：

```lean
structure RGBA extends RGB where
  alpha : ℕ
```

定义结构体的通用语法为：

```
structure 结构体名 (参数₁ : 类型₁) … (参数ₖ : 类型ₖ)
  [extends 结构体₁, …, 结构体ₘ] where
  字段名₁ : 字段类型₁
  ⋮
  字段名ₙ : 字段类型ₙ
```

参数 `参数₁`、…、`参数ₖ` 实际上也是额外字段，但与 `字段名₁`、…、`字段名ₙ` 不同，它们存储在类型中，作为类型构造子 `(结构体名)` 的参数。

可用多种语法指定值：

```lean
def pureRed : RGB :=
  RGB.mk 0xff 0x00 0x00

def pureGreen : RGB :=
  { red   := 0x00
    green := 0xff
    blue  := 0x00 }

def semitransparentGreen : RGBA :=
  { pureGreen with
    alpha := 0x7f }
```

`semitransparentGreen` 从 `pureGreen` 复制所有值，但显式设置 `alpha` 字段。

接下来定义 `shuffle` 操作：

```lean
def shuffle (c : RGB) : RGB :=
  { red   := RGB.green c
    green := RGB.blue c
    blue  := RGB.red c }
```

该定义依赖生成的选择器 `RGB.red`、`RGB.green` 和 `RGB.blue`。除 `RGB.red c` 外也可写 `c.red`，其他字段同理。连续三次应用 `shuffle` 相当于没有应用：

```lean
theorem shuffle_shuffle_shuffle (c : RGB) :
    shuffle (shuffle (shuffle c)) = c :=
  by rfl
```

## 5.6 类型类

**类型类**（type class）由 Haskell 推广，目前存在于多个证明助手中。在 Lean 中，类型类是一种结合了抽象常量及其性质的结构体类型。通过为常量提供具体定义并证明性质成立，可将类型声明为类型类的**实例**（instance）；根据类型，Lean 会检索相关实例。

简单例子是 `Inhabited` 类型类，它只需要常量 `Inhabited.default`，而不需要任何性质：

```lean
class Inhabited (α : Type) : Type where
  default : α
```

类的定义语法与结构体相同，只是用 `class` 代替 `structure`。参数 `α` 代表可作为该类成员的任意类型。

任何拥有至少一个元素的类型都可注册为 `Inhabited` 的实例：

```lean
instance Nat.Inhabited : Inhabited ℕ :=
  { default := 0 }

instance List.Inhabited {α : Type} : Inhabited (List α) :=
  { default := [] }
```

使用 `instance` 而非 `def` 时，该结构体值被注册为**典范实例**（canonical instance），在需要 `Inhabited ℕ` 的结构体时使用。全局表中现在有条目 `Inhabited ℕ ↦ Nat.Inhabited`。

对函数类型，若 `β` 有居留元，则 `α → β` 有居留元：

```lean
instance Fun.Inhabited {α β : Type} [Inhabited β] :
    Inhabited (α → β) :=
  { default := fun a : α ↦ Inhabited.default }
```

> 尽管名称如此，相比 Haskell 的类型类，Lean 的类型类机制与 Scala 的**隐式参数**（implicit argument）关系更密切。

序对类型 `α × β`（**积类型** product type）包含形如 `(a, b)` 的值，其中 `a : α` 且 `b : β`。给定 `ab : α × β`，可用 `Prod.fst ab` 和 `Prod.snd ab` 提取分量：

```lean
instance Prod.Inhabited {α β : Type}
    [Inhabited α] [Inhabited β] :
  Inhabited (α × β) :=
  { default := (Inhabited.default, Inhabited.default) }
```

使用 `Inhabited`，可定义列表上的 `head` 操作——返回第一个元素。空列表没有有意义的返回值，故在类型属于 `Inhabited` 时返回默认值：

```lean
def head {α : Type} [Inhabited α] : List α → α
  | []     => Inhabited.default
  | x :: _ => x
```

`[Inhabited α]` 要求 `α` 属于 `Inhabited`，并允许访问 `Inhabited.default`。语法 `[Inhabited α]` 为 `head` 添加隐式参数；Lean 会通过所有已声明实例进行**类型类搜索**以确定其值。因此

```lean
#eval head ([] : List ℕ)
```

会寻找 `Inhabited ℕ` 的实例并找到 `Nat.Inhabited`，打印 `0`。若有多个适用实例且 Lean 选错，可用 `@` 语法将类型类参数转为显式参数。

Lean 核心库对 `List.head` 的定义与此相同。实践中几乎所有类型都非空（明显例外是 `False`），故 `Inhabited` 限制几乎不是问题。可证明抽象定理：

```lean
theorem head_head {α : Type} [Inhabited α] (xs : List α) :
    head [head xs] = head xs :=
  by rfl
```

在类型为 `List α` 的列表上使用 `head` 需要假设 `[Inhabited α]`；若省略，Lean 会报告「类型类合成失败」。

还有更多只有常量、没有性质的**语法类型类**（syntactic type class），包括 `Zero`、`One`、`Neg`、`Inv`、`Add`、`Mul` 等。它们的主要目的是为代数类型类层次结构（群、**幺半群** monoid、环、域等）奠定基础，并允许**重载**（overloading）常见数学符号如 `+`、`*`、`0`、`1` 和 `⁻¹`。

相比之下，**语义类型类**（semantic type class）包含的性质用于约束常量行为。在第 3.6 节中我们遇到了：

```lean
class Std.Commutative (α : Type) (f : α → α → α) where
  comm : ∀a b, f a b = f b a

class Std.Associative (α : Type) (f : α → α → α) where
  assoc : ∀a b c, f (f a b) c = f a (f b c)
```

这一次，关联不再是从类型到常量，而是从类型「以及一个函数」到性质。在第 3.6 节中，我们将 `ℕ` 上的 `add` 注册为可交换且可结合的操作：

```lean
instance Associative_add : Std.Associative ℕ add :=
  { assoc := Nat.add_assoc }

instance Commutative_add : Std.Commutative ℕ add :=
  { comm := Nat.add_comm }
```

策略 `ac_rfl` 会尝试查找问题中所有二元运算符的 `comm` 和 `assoc` 性质并加以利用。

定义类型类的通用语法：

```
class 类名 (参数₁ : 类型₁) … (参数ₖ : 类型ₖ)
  [extends 结构体₁, …, 结构体ₘ] where
  常量名₁ : 常量类型₁
  ⋮
  常量名ₙ : 常量类型ₙ
  性质名₁ : 命题₁
  ⋮
  性质名ₚ : 命题ₚ
```

实例化类型类：

```
instance 实例名 : 类型类 参数 :=
  { 常量₁ := 定义₁,
    ⋮
    常量ₙ := 定义ₙ,
    性质₁ := 证明₁,
    ⋮
    性质ₚ := 证明ₚ }
```

## 5.7 列表

Lean 提供了丰富的有限列表函数库。本节回顾其中一些并定义我们自己的函数。

第一个例子对列表进行分情况讨论：

```lean
theorem head_head_cases {α : Type} [Inhabited α]
      (xs : List α) :
    head [head xs] = head xs :=
  by
    cases xs with
    | nil        => rfl
    | cons x xs' => rfl
```

该证明依赖 `cases`——`induction` 的近亲。它进行分情况讨论但不生成归纳假设。`cases xs` 将目标 `⊢ P[xs]` 转换为 `⊢ P[[]]` 和 `⊢ P[x :: xs']`。若不确定用 `induction` 还是 `cases`，可先选 `induction`，若不需要归纳假设，再改为 `cases` 以明确表示。

在结构化证明中可用 `match`：

```lean
theorem head_head_match {α : Type} [Inhabited α]
      (xs : List α) :
    head [head xs] = head xs :=
  match xs with
  | List.nil        => by rfl
  | List.cons x xs' => by rfl
```

下一个例子利用构造子的单射性。当等式两边应用相同构造子时，`cases` 会化简等式：

```lean
theorem injection_example {α : Type} (x y : α) (xs ys : List α)
      (h : x :: xs = y :: ys) :
    x = y ∧ xs = ys :=
  by
    cases h
    simp
```

当构造子不同时，`cases` 可识别不可能的情况：

```lean
theorem distinctness_example {α : Type} (y : α) (ys : List α)
      (h : [] = y :: ys) :
    False :=
  by cases h
```

接下来定义列表上的 `map` 函数：

```lean
def map {α β : Type} (f : α → β) : List α → List β
  | []      => []
  | x :: xs => f x :: map f xs

def mapArgs {α β : Type} : (α → β) → List α → List β
  | _, []      => []
  | f, x :: xs => f x :: mapArgs f xs
```

基本性质：

```lean
theorem map_ident {α : Type} (xs : List α) :
    map (fun x ↦ x) xs = xs :=
  by
    induction xs with
    | nil           => rfl
    | cons x xs' ih => simp [map, ih]

theorem map_comp {α β γ : Type} (f : α → β) (g : β → γ)
      (xs : List α) :
    map g (map f xs) = map (fun x ↦ g (f x)) xs :=
  by
    induction xs with
    | nil           => rfl
    | cons x xs' ih => simp [map, ih]

theorem map_append {α β : Type} (f : α → β)
      (xs ys : List α) :
    map f (xs ++ ys) = map f xs ++ map f ys :=
  by
    induction xs with
    | nil           => rfl
    | cons x xs' ih => simp [map, ih]
```

最后三个证明在文本上完全相同——典型的 `induction`–`rfl`–`simp` 证明。

`tail` 删除第一个元素：

```lean
def tail {α : Type} : List α → List α
  | []      => []
  | _ :: xs => xs
```

提取第一个元素的另一种方案是用 `Option` 包装：

```lean
def headOpt {α : Type} : List α → Option α
  | []     => Option.none
  | x :: _ => Option.some x
```

`Option α` 有两个构造子：`Option.none` 和 `Option.some a`。要检索存储的值必须进行模式匹配：

```
match headOpt xs with
| Option.none   => handleTheError
| Option.some x => doSomethingWithValue x
```

利用依值类型，还可指定**前置条件**：

```lean
def headPre {α : Type} : (xs : List α) → xs ≠ [] → α
  | [],     hxs => by simp at *
  | x :: _, hxs => x
```

第二个参数 `hxs` 是 `xs ≠ []` 的证明；对 `[]` 的情况，该证明不可能，由此导出矛盾并得到任意 `α`。

```lean
#eval headOpt [3, 1, 4]
#eval headPre [3, 1, 4] (by simp)
```

`zip` 构造序对列表：

```lean
def zip {α β : Type} : List α → List β → List (α × β)
  | x :: xs, y :: ys => (x, y) :: zip xs ys
  | [],      _       => []
  | _ :: _,  []      => []
```

列表长度：

```lean
def length {α : Type} : List α → ℕ
  | []      => 0
  | x :: xs => length xs + 1
```

关于 `zip` 结果长度：

```lean
theorem length_zip {α β : Type} (xs : List α) (ys : List β) :
    length (zip xs ys) = min (length xs) (length ys) :=
  by
    induction xs generalizing ys with
    | nil           => simp [zip, min, length]
    | cons x xs' ih =>
      cases ys with
      | nil        => rfl
      | cons y ys' => simp [zip, length, ih ys', min_add_add]
```

归纳假设中的 `∀ys` 来自 `induction xs generalizing ys`——**泛化**（generalizing）使归纳假设可用于 `ys` 的任意值。

证明依赖关于 `min` 的定理：

```lean
theorem min_add_add (l m n : ℕ) :
    min (m + l) (n + l) = min m n + l :=
  by
    cases Classical.em (m ≤ n) with
    | inl h => simp [min, h]
    | inr h => simp [min, h]

theorem min_add_add_match (l m n : ℕ) :
    min (m + l) (n + l) = min m n + l :=
  match Classical.em (m ≤ n) with
  | Or.inl h => by simp [min, h]
  | Or.inr h => by simp [min, h]

theorem min_add_add_if (l m n : ℕ) :
    min (m + l) (n + l) = min m n + l :=
  if h : m ≤ n then
    by simp [min, h]
  else
    by simp [min, h]
```

可为第 4.7 节的表格添加几行：

| 策略式证明 | 结构化证明 | 原始证明项 |
|-----------|-----------|-----------|
| `cases t` | `match t with` | `match t with` |
| `cases Classical.em Q` | `if Q then … else …` | `if Q then … else …` |

`map` 与 `zip` 的分配律：

```lean
theorem map_zip {α α' β β' : Type} (f : α → α')
      (g : β → β') :
    ∀xs ys,
      map (fun ab : α × β ↦
          (f (Prod.fst ab), g (Prod.snd ab)))
        (zip xs ys) =
      zip (map f xs) (map g ys)
  | x :: xs, y :: ys => by simp [zip, map, map_zip f g xs ys]
  | [],      _       => by rfl
  | _ :: _,  []      => by rfl
```

左侧模式与 `zip` 定义中的模式对应，比分别对 `xs` 归纳、对 `ys` 分情况简单得多。好的证明通常遵循所基于定义的结构。

在 `zip` 和 `map_zip` 中，我们小心指定三个不重叠的模式。也可编写重叠模式，例如 `| xs => … xs …` 在 `[]` 之后；由于模式按顺序应用，这与显式写 `| x :: xs => …` 不同。我们通常建议后者，产生的意外更少。

## 5.8 二叉树

带多个递归参数的归纳类型定义树状对象。**二叉树**（binary tree）的节点最多有两个子节点：

```lean
inductive Tree (α : Type) : Type where
  | nil  : Tree α
  | node : α → Tree α → Tree α → Tree α
```

算术表达式类型 `AExp` 也是树结构的例子。树的节点（无论内部还是叶子）常携带标签或注解。归纳树不包含无穷分支，甚至没有环——这比命令式语言中的指针结构表达力弱，但更易推理。

对 `t : Tree α ⊢ P[t]` 进行结构归纳需展示：

```
⊢ P[Tree.nil]
a : α, l r : Tree α, ih_l : P[l], ih_r : P[r] ⊢ P[Tree.node a l r]
```

对应列表翻转的是**镜像**（mirror）操作：

```lean
def mirror {α : Type} : Tree α → Tree α
  | Tree.nil        => Tree.nil
  | Tree.node a l r => Tree.node a (mirror r) (mirror l)
```

镜像可直接定义，无需追加操作，故关于 `mirror` 的推理比关于 `reverse` 更简单：

```lean
theorem mirror_mirror {α : Type} (t : Tree α) :
    mirror (mirror t) = t :=
  by
    induction t with
    | nil                  => rfl
    | node a l r ih_l ih_r => simp [mirror, ih_l, ih_r]
```

更详细的非形式证明：

> 证明采用对 `t` 的结构归纳。  
> **情况 `Tree.nil`**：直接由 `mirror` 的定义。  
> **情况 `Tree.node a l r`**：归纳假设 `(ih_l) mirror (mirror l) = l`，`(ih_r) mirror (mirror r) = r`。  
> `mirror (mirror (Tree.node a l r))`  
> `= mirror (Tree.node a (mirror r) (mirror l))`（定义）  
> `= Tree.node a (mirror (mirror l)) (mirror (mirror r))`（定义）  
> `= Tree.node a l (mirror (mirror r))`（ih_l）  
> `= Tree.node a l r`（ih_r）。证毕。

用计算块（第 4.4 节）可达到同样详细程度：

```lean
theorem mirror_mirror_calc {α : Type} :
    ∀t : Tree α, mirror (mirror t) = t
  | Tree.nil        => by rfl
  | Tree.node a l r =>
    calc
      mirror (mirror (Tree.node a l r))
      = mirror (Tree.node a (mirror r) (mirror l)) :=
          by rfl
      _ = Tree.node a (mirror (mirror l))
          (mirror (mirror r)) :=
          by rfl
      _ = Tree.node a l (mirror (mirror r)) :=
          by rw [mirror_mirror_calc l]
      _ = Tree.node a l r :=
          by rw [mirror_mirror_calc r]
```

以下定理在第 6 章中会很有用：

```lean
theorem mirror_Eq_nil_Iff {α : Type} :
    ∀t : Tree α, mirror t = Tree.nil ↔ t = Tree.nil
  | Tree.nil        => by simp [mirror]
  | Tree.node _ _ _ => by simp [mirror]
```

### `cases` 策略

```
cases 项 with
| 构造子₁ 名称列表₁ => 策略₁
  ⋮
| 构造子ₙ 名称列表ₙ => 策略ₙ
```

`cases` 对指定项进行分情况讨论，产生与类型构造子数量相同的子目标。与 `induction` 类似，但不产生归纳假设，并自动排除不可能的情况。

对形如 `l = r` 的假设 `h`，`cases` 将 `r` 与 `l` 匹配，并在目标各处替换变量。可用 `clear h` 删除剩余假设 `l = l`。

对命题分情况讨论：

```
cases Classical.em (命题) with
| inl 为真时的名称 => 为真时的策略
| inr 为假时的名称 => 为假时的策略
```

## 5.9 依值归纳类型（选读）

归纳类型 `List α` 和 `Tree α` 属于 Lean 的简单类型部分。归纳类型也可依赖于（非类型的）项。典型例子是长度为 `n` 的**向量**：

```lean
inductive Vec (α : Type) : ℕ → Type where
  | nil                                : Vec α 0
  | cons (a : α) {n : ℕ} (v : Vec α n) : Vec α (n + 1)
```

项 `Vec.cons 3 (Vec.cons 1 Vec.nil)` 的类型为 `Vec ℕ 2`。在类型中编码长度可提供更精确的函数签名，例如 `Vec.reverse` 保持长度，`Vec.zip` 可要求两参数长度相同。固定长度向量和矩阵在计算机科学与数学中都很有用。

不幸的是，这种精确性有代价：当依值类型所依赖的项可证相等但非计算上语法相等（例如 `m + n` 与 `n + m`）时，会引起困难。本指南通常避免依值归纳类型；本节为完整性而简要介绍——**明确地说：这不属于考试内容**。

列表与向量之间的转换：

```lean
def listOfVec {α : Type} : ∀{n : ℕ}, Vec α n → List α
  | _, Vec.nil      => []
  | _, Vec.cons a v => a :: listOfVec v

def vecOfList {α : Type} :
    ∀xs : List α, Vec α (List.length xs)
  | []      => Vec.nil
  | x :: xs => Vec.cons x (vecOfList xs)
```

验证转换是否保持长度：

```lean
theorem length_listOfVec {α : Type} :
    ∀(n : ℕ) (v : Vec α n), List.length (listOfVec v) = n
  | _, Vec.nil      => by rfl
  | _, Vec.cons a v =>
    by simp [listOfVec, length_listOfVec _ v]
```

天真地对 `v : Vec α n ⊢ P[v]` 归纳时，子目标可能类型不正确——`P[_]` 中的洞拥有类型 `Vec α n`，不能简单填入 `Vec.nil`、`u` 或 `Vec.cons a u`。必须调整 `P`，将 `n` 替换为 `0`、`m` 或 `m + 1`。使用 `cases` 时，不可能的情况会被静默消除。

依值类型的模式匹配很微妙。给定 `v : Vec α n`，不能只写：

```
match v with
| Vec.nil      => …
| Vec.cons a u => …
```

还须对 `n` 进行模式匹配：

```
match n, v with
| 0,       Vec.nil      => …
| m + 1,   Vec.cons a u => …
```

通常在第一列放占位符即可：`match n, v with | _, Vec.nil => … | _, Vec.cons a u => …`。对 `n` 模式匹配却忽略结果看起来矛盾，但没有它 Lean 无法推断 `Vec.cons` 的第二个隐式参数。在这方面，`cases` 比 `match` 更用户友好。

## 5.10 新引入的 Lean 结构总结

**声明**

| 关键字 | 作用 |
|--------|------|
| `class` | 将结构体类型声明为类型类 |
| `instance` | 将结构体值声明为类型类的实例 |
| `structure` | 引入结构体类型及其选择器 |

**表达式**

| 构造 | 作用 |
|------|------|
| `if … then … else` | 对可判定命题进行分情况讨论 |
| `match … with` | 进行模式匹配 |

**策略**

| 策略 | 作用 |
|------|------|
| `cases` | 执行分情况讨论 |