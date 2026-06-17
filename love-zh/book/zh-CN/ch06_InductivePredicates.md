# 第 6 章 归纳谓词

> 已对照 Lean-zh PDF 与 `LoVe06_InductivePredicates_Demo.lean` 人工校对（原 PDF 5057–6294 行）。

**归纳谓词**（inductive predicate），或称归纳定义的命题，是一种指定类型为 `⋯ → Prop` 的函数的便捷方式。它能让人联想到[形式系统](ch01_TypesAndTerms.md#13-类型检查与类型推断)（第 1.3 节）和 Prolog 风格的逻辑编程。但 Lean 比 Prolog 的表达能力强得多，为此我们需要做一些工作来建立定理，而不仅仅是运行 Prolog 解释器。看待 Lean 的一种视角是：

> Lean = 函数式编程 + 逻辑编程 + 更多逻辑

## 6.1 入门示例

除非你接触过 Prolog 或逻辑编程，否则你可能会好奇归纳谓词是什么，以及它们为什么有用。我们首先回顾三个展示其多种用途的示例：偶数、网球比赛和自反传递闭包。

### 6.1.1 偶数

数学家经常将特定集合定义为满足某些标准的最小集合。考虑以下定义：

> **偶自然数**（even natural number）：偶自然数的集合 `E` 被定义为在以下规则下封闭的最小集合 `S`：
>
> 1. `0 ∈ S`；
> 2. 对于每个 `k ∈ ℕ`，如果 `k ∈ S`，那么 `k + 2 ∈ S`。
>
> 根据 Knaster–Tarski 定理，这样的集合是存在的。（上一句话通常会省略。）

我们很容易相信 `E` 包含了所有的偶数，且仅包含这些数。让我们带上数学家的帽子，证明 4 是偶数：

1. 根据规则 (1)，我们有 `0 ∈ E`。
2. 因此，根据规则 (2)（取 `k := 0`），我们有 `2 ∈ E`。
3. 由此，根据规则 (2)（取 `k := 2`），我们有 `4 ∈ E`，证毕。

相比之下，计算机科学家可能会使用一个由两个**推导规则**（derivation rule）组成的形式系统来指定相同的集合：

```text
  ───────
  0 ∈ E        Zero

  k ∈ E
  ─────────
  k + 2 ∈ E    AddTwoₖ
```

那么证明就是一棵**推导树**（derivation tree）：

```text
  0 ∈ E
  ─────── AddTwo₀
  2 ∈ E
  ─────── AddTwo₂
  4 ∈ E
```

如果我们自上而下阅读，证明是正向的；如果我们自底向上阅读，证明就是逆向的。

归纳谓词是逻辑学家实现相同结果的方式。在 Lean 中，我们不会定义一个集合，而是归纳地定义一个**刻画谓词**（characteristic predicate）：

```lean
inductive Even : ℕ → Prop where
  | zero    : Even 0
  | add_two : ∀k : ℕ, Even k → Even (k + 2)
```

这看起来应该很熟悉。除了使用 `Prop` 代替 `Type` 之外，我们还使用了相同的语法来定义归纳类型。根据 **PAT 原理**（Propositions As Types），在 Lean 中，归纳类型和归纳谓词是由同一种机制提供的。

上面的命令定义了一个一元谓词 `Even` 以及两个**引入规则**（introduction rule）`Even.zero` 和 `Even.add_two`，它们可用于证明形如 `⊢ Even …` 的目标。回想一下，一个符号（例如 `Even`）的引入规则是一个结论包含该符号的定理（[第 4.3 节](ch04_ForwardProofs.md#43-关于连结词和量词的正向推理)）。根据 PAT 原理，`Even n` 可以被视为像 `Vec α n`（[第 5.9 节](ch05_FunctionalProgramming.md#59-依值归纳类型选读)）那样的依值归纳类型，而 `Even.zero` 和 `Even.add_two` 则是像 `Vec.nil` 和 `Vec.cons` 那样的构造子。

如果我们将 Lean 的定义翻译回中文，我们会得到类似上面的 Knaster–Tarski 风格的定义：

> 以下子句定义了偶数。
>
> 1. `0` 是偶数；
> 2. 若 `k` 是偶数，则任何形如 `k + 2` 的数都是偶数。
>
> 任何其他数都不是偶数。

值得注意的是，归纳定义的符号没有定义。因此，我们不能使用 `simp` **展开**（unfold）它们的定义。唯一可用的推理原则是引入和消去。

作为一个热身练习，这里是 `Even 4` 的证明：

```lean
theorem Even_4 :
    Even 4 :=
  have Even_0 : Even 0 :=
    Even.zero
  have Even_2 : Even 2 :=
    Even.add_two _ Even_0
  show Even 4 from
    Even.add_two _ Even_2
```

例如，证明项 `Even.add_two _ Even_0` 的类型为 `Even (0 + 2)`，它在计算意义下语法等价于 `Even 2`，因此在类型检查器看来是相等的。下划线代表 `0`。

得益于归纳定义的「无杂质」保证，`Even.zero` 和 `Even.add_two` 是构造 `⊢ Even …` 的证明仅有的两种方式。通过检查结论 `Even 0` 和 `Even (k + 2)`，我们发现永远不存在证明 `1` 是偶数的风险。

看待上述归纳定义的另一种方式如下：第一行引入了一个谓词，而第二行和第三行引入了我们希望该谓词满足的公理。相应地，我们可以写成：

```lean
opaque Even : ℕ → Prop

axiom Even.zero    : Even 0
axiom Even.add_two : ∀k : ℕ, Even k → Even (k + 2)
```

这里将 `inductive` 替换为 `opaque`，将 `|` 替换为 `axiom`。但这个公理性版本没有告诉我们 `Even` 什么时候为假。我们无法用它来证明 `¬ Even 1` 或 `¬ Even 17`。据我们所知，`Even` 对所有自然数都可能为真。相比之下，归纳定义保证了我们获得满足引入规则 `Even.zero` 和 `Even.add_two` 的最小谓词（即「最假」的谓词），并提供消去和归纳原则，允许我们证明 `¬ Even 1`、`¬ Even 17` 或 `¬ Even (2 * n + 1)`。

既然我们可以定义递归函数，为什么还要麻烦地使用归纳谓词呢？事实上，以下定义是完全合法的：

```lean
def evenRec : ℕ → Bool
  | 0     => true
  | 1     => false
  | k + 2 => evenRec k
```

每种风格都有其优缺点。递归版本迫使我们指定一个假的情况（第二个等式），并且迫使我们考虑停机问题。另一方面，由于它具有等式性和计算性，因此它能很好地与 `rfl`、`simp`、`#eval` 和 `#reduce` 配合使用。归纳版本可以说更加地抽象和优雅，每个引入规则都是独立声明的。我们可以添加或删除规则，而无需考虑停机或可执行性。

定义 `Even` 的另一种方式是使用取模运算符（`%`）进行非递归定义：

```lean
def evenNonrec (k : ℕ) : Prop :=
  k % 2 = 0
```

数学家可能更喜欢这个版本。但归纳版本是一个方便的「Hello, World!」示例，类似于许多现实的归纳定义。它可能只是个玩具，但它是个有用的玩具。

### 6.1.2 网球比赛

**迁移系统**（transition system）由连接「前」状态和「后」状态的迁移规则组成。作为迁移系统的范例，我们考虑网球比赛中从 `0–0`（「双方零分」，*love all*）开始可能的迁移。网球比赛也是一个玩具示例，但在[第 9 章](ch09_OperationalSemantics.md)中，我们将以类似的风格将命令式编程语言的语义定义为迁移系统。

以下摘录自国际网球联合会的《网球规则》，介绍了网球的计分规则。

> 标准局的计分方式如下，发球方的得分先报：
>
> - 零分（*love*）–「零分」
> - 第一分 –「15」
> - 第二分 –「30」
> - 第三分 –「40」
> - 第四分 –「局」（*game*）
>
> 但如果每位球员/每对球员都赢得了三分，比分就是「平分」（*deuce*）。「平分」之后，赢得下一分的球员/球员对获得「占先」（*advantage*）。如果该球员/球员对也赢得了下一分，则该球员/球员对赢得该「局」；如果对方球员/球员对赢得了下一分，比分再次变为「平分」。球员/球员对需要在「平分」之后立即连赢两分才能赢得该「局」。

我们首先定义一个归纳类型来表示比分：

```lean
inductive Score : Type where
  | vs       : ℕ → ℕ → Score
  | advServ  : Score
  | advRecv  : Score
  | gameServ : Score
  | gameRecv : Score

infixr:50 " – " => Score.vs
```

诸如 `30–15` 之类的比分表示为 `Score.vs 30 15`，我们也将使用中缀记法将其记作 `30 – 15`。我们忽略了计分规则中一些最繁琐的方面，将「零分」记作 `0`，将「平分」记作 `40 – 40`。如果愿意，我们可以引入诸如 `def love : ℕ := Score.vs 0 0` 之类的别名。

下一阶段是引入一个二元谓词 `Step`，它确定迁移是否可能：

```lean
inductive Step : Score → Score → Prop where
  | serv_0_15     : ∀n, Step (0 – n) (15 – n)
  | serv_15_30    : ∀n, Step (15 – n) (30 – n)
  | serv_30_40    : ∀n, Step (30 – n) (40 – n)
  | serv_40_game  : ∀n, n < 40 → Step (40 – n) Score.gameServ
  | serv_40_adv   : Step (40 – 40) Score.advServ
  | serv_adv_40   : Step Score.advServ (40 – 40)
  | serv_adv_game : Step Score.advServ Score.gameServ
  | recv_0_15     : ∀n, Step (n – 0) (n – 15)
  | recv_15_30    : ∀n, Step (n – 15) (n – 30)
  | recv_30_40    : ∀n, Step (n – 30) (n – 40)
  | recv_40_game  : ∀n, n < 40 → Step (n – 40) Score.gameRecv
  | recv_40_adv   : Step (40 – 40) Score.advRecv
  | recv_adv_40   : Step Score.advRecv (40 – 40)
  | recv_adv_game : Step Score.advRecv Score.gameRecv

infixr:45 " ↝ " => Step
```

令 `s ↝ t` 作为 `Step s t` 的简写。一场比赛是一条链 `s₀ ↝ s₁ ↝ s₂ ↝ ⋯ ↝ sₙ`，其中 `s₀ = 0 – 0`，且从 `sₙ` 无法进行任何迁移。该谓词允许诸如 `15 – 99 ↝ 30 – 99` 之类的无意义迁移，但由于比分 `15 – 99` 无法从「双方零分」（`0–0`）达到，因此这些迁移是无害的。

有了形式化定义，我们就可以提出并正式回答以下问题：比赛是否有最大长度？有多少种不同的最终比分？从「双方零分」开始是否能达到 `15–99`？比分是否可能回到 `0–0`？让我们使用 Lean 来反驳最后一项断言：

```lean
theorem no_Step_to_0_0 (s : Score) :
    ¬ s ↝ 0 – 0 :=
  by
    intro h
    cases h
```

下图总结了哪些比分可以从哪些比分到达：

```text
0 – 0 ──→ 15 – 0 ──→ 30 – 0 ──→ 40 – 0 ──→ Score.gameServ
  │         │           │           │
  ↓         ↓           ↓           ↓
0 – 15 ──→ 15 – 15 ──→ 30 – 15 ──→ 40 – 15
  │         │           │           │
  ↓         ↓           ↓           ↓
0 – 30 ──→ 15 – 30 ──→ 30 – 30 ──→ 40 – 30
  │         │           │           │
  ↓         ↓           ↓           ↓
0 – 40 ──→ 15 – 40 ──→ 30 – 40 ──→ 40 – 40 ⇄ Score.advServ / Score.advRecv
                                              ↓
                                    Score.gameServ / Score.gameRecv
```

### 6.1.3 自反传递闭包

归纳谓词一个特别有用的应用是二元**关系**（relation）`R` 的**自反传递闭包**（reflexive transitive closure）`Star R`。非形式地，`Star R` 是表示 `R` 的零次或多次步骤的关系。例如，如果 `R` 对应于在迁移系统中（如自动机）执行一次迁移，那么 `Star R` 则对应于执行任意步数（包括零步）。作为一个更具体的例子，请考虑以下情况：

```text
R   = {(1, 2), (2, 4), (4, 8)}
R*  = {(n, n) | n ∈ ℕ}
    ∪ {(1, 2), (1, 4), (1, 8), (2, 4), (2, 8), (4, 8)}
```

星号（`∗`）算子通常被严格地定义为一个形式系统：

```text
  R a b
  ─────────    Base        a : α
  Star R a b   ─────       Star R a a    Refl

  Star R a b    Star R b c
  ─────────────────────────    Trans
         Star R a c
```

这些规则将 `Star R` 定义为包含 `R`（通过 `Base`）且满足自反性（通过 `Refl`）和传递性（通过 `Trans`）的**最小关系**（smallest relation）。如果我们想定义**传递闭包**（transitive closure）`R⁺`，只需省略 `Refl` 规则即可。如果我们想要**自反对称闭包**（reflexive symmetric closure），我们会将 `Trans` 规则替换为对称规则。在形式系统中，我们只需声明我们希望为真的属性，而无需考虑停机或可执行性。

将上述推导规则直接翻译为归纳谓词的引入规则也很简单：

```lean
inductive Star {α : Type} (R : α → α → Prop) : α → α → Prop
where
  | base (a b : α)    : R a b → Star R a b
  | refl (a : α)      : Star R a a
  | trans (a b c : α) : Star R a b → Star R b c → Star R a c
```

我们将关系表示为**二元谓词**（binary predicate）而非序对的集合，将 `(a, b) ∈ R` 写作 `R a b`。关系和谓词是可互换的，但在证明助手中，谓词通常更方便使用。`R` 的自反传递闭包记作 `Star R`。请注意，`a`、`b` 和 `c` 在冒号左侧被声明为引入规则的参数。我们也可以写成：

```lean
| base : ∀a b : α, R a b → Star R a b
```

或者在另一个极端写成：

```lean
| base (a b : α) (hab : R a b) : Star R a b
```

所有这些形式都在逻辑和操作上等价。

归纳谓词的一般格式如下：

```lean
inductive 谓词名称 (参数₁ : 类型₁) … (参数ₖ : 类型ₖ) :
    类型ₖ₊₁ → ⋯ → 类型ₖ₊ₚ → Prop where
| 规则名称₁ (参数₁₁ : 类型₁₁) … (参数₁ₘ₁ : 类型₁ₘ₁) : 命题₁
  ⋮
| 规则名称ₙ (参数ₙ₁ : 类型ₙ₁) … (参数ₙₘₙ : 类型ₙₘₙ) : 命题ₙ
```

其中每个 `命题ⱼ` 的结论必须是已定义的谓词 `谓词名称` 在某些**实参**（argument）上的**应用**（application）。这些参数可以是任意项；它们不需要是构造子模式。如果我们想让对应于参数的实参变成**隐式**（implicit）的，也可以使用花括号 `{ }` 而非圆括号 `( )`。

上述 `Star` 的定义确实非常优雅。如果你仍然对此表示怀疑，请尝试将其实现为**递归函数**（recursive function）：

```lean
def starRec {α : Type} (R : α → α → Bool) :
    α → α → Bool :=
  sorry
```

总结一下，归纳谓词 `P` 的每个引入规则由以下部分组成（从左到右）：

1. 一个**名称**（name）；
2. 可能出现在规则中的**变量**（variable）；
3. 必须满足的零个或多个**条件**（condition），这些条件可能会**递归地**（recursively）应用 `P`；
4. 将 `P` 应用于某些参数，形成一个**模式**（pattern）。

因此，对于规则 `Star.base`，模式是 `Star R a b`，条件是 `R a b`，变量是 `a` 和 `b`。

### 6.1.4 反例

并非所有的归纳定义都允许一个**最小解**（least solution）。最简单的反例是：

```lean
-- fails
inductive Illegal : Prop where
  | intro : ¬ Illegal → Illegal
```

如果 Lean 接受了这个定义，我们就可以用它来证明等价性 `Illegal ↔ ¬ Illegal`，从而很容易推导出 `False`。幸运的是，Lean 拒绝了这个定义：

```text
arg #1 of 'Illegal.intro' has a non positive occurrence of the datatypes being declared
```

翻译：`'Illegal.intro'` 的第 1 个参数具有正在声明的数据类型的**非正出现**（nonpositive occurrence）。

它所抱怨的非正出现是指在**否定**（negation）下的 `Illegal` 出现。数学家会根据 Knaster–Tarski 定理的**单调性条件**（monotonicity condition）不满足而拒绝该定义。

## 6.2 逻辑符号

虽然 `Even` 是本指南中第一个公开的归纳谓词，但前面的章节已经悄悄介绍了其他归纳谓词。其中第一个是**相等**（equality）`=`，在[第 2 章](ch02_ProgramsAndTheorems.md)中引入，随后是逻辑符号 `∧`、`∨`、`↔`、`∃`、`True` 和 `False`。它们的定义值得仔细研究：

```lean
inductive And (a b : Prop) : Prop where
  | intro : a → b → And a b

inductive Or (a b : Prop) : Prop where
  | inl : a → Or a b
  | inr : b → Or a b

inductive Iff (a b : Prop) : Prop where
  | intro : (a → b) → (b → a) → Iff a b

inductive Exists {α : Type} (P : α → Prop) : Prop where
  | intro : ∀a : α, P a → Exists P

inductive True : Prop where
  | intro : True

inductive False : Prop where

inductive Eq {α : Type} : α → α → Prop where
  | refl : ∀a : α, Eq a a
```

（严格来说，在 Lean 中，上述一些定义实际上是**结构体**（structure）而非归纳谓词，但区别只是表面的。正如我们在[第 5.5 节](ch05_FunctionalProgramming.md#55-结构体)中看到的，结构体本质上是带有一些**语法糖**（syntactic sugar）的单构造子归纳谓词。）

传统记法 `∃x : α, P` 和 `x = y` 是 `Exists (fun x : α ↦ P)` 和 `Eq x y` 的语法糖。请注意 `fun` 是如何充当全能**绑定子**（binder）的。另请注意，`False` 没有构造子。不存在 `False` 的证明，就像不存在 `Even 1` 的证明一样。对于归纳谓词，我们只陈述我们希望为真的规则。

符号 `∀`（包括其特例 `→`）直接内置于逻辑中，并未定义为归纳谓词。它也没有显式的引入或消去规则。**引入原理**是**匿名函数**（anonymous function）`fun x ↦ _`，而**消去原理**是函数应用 `_ u`。

对于任何归纳谓词，只需指定引入规则即可。[第 3.3 节](ch03_BackwardProofs.md#33-关于连结词和量词的推理)和[第 3.4 节](ch03_BackwardProofs.md#34-关于相等的推理)中介绍的消去规则必须手动推导。

## 6.3 规则归纳

正如我们可以在归纳类型的项上进行归纳一样，我们也可以在归纳谓词的证明上进行归纳。例如，给定目标 `h : Even n ⊢ P n`，我们可以调用 `induction h` 并得到两个子目标，分别对应 `Even.zero` 和 `Even.add_two`。这被称为「在 `h` 的推导结构上归纳」或简称为「**规则归纳**」（rule induction），因为归纳是在谓词的引入规则（即证明项的构造子）上进行的。

看待规则归纳有两种方式：「满足……的最小谓词」视角和「PAT」视角。

要理解「满足……的最小谓词」视角，请回想一下，归纳定义将一个符号引入为满足引入规则的最小（即最假）谓词。相应地，`Even` 是满足性质 `Q 0` 和 `∀k, Q k → Q (k + 2)` 的最小谓词 `Q`。因此，如果我们能证明对于某个谓词 `P`，性质 `P 0` 和 `∀k, P k → P (k + 2)` 成立，那么 `P` 要么是 `Even` 本身，要么比 `Even` 更大（即更真）。结果是，`Even n` 蕴含 `P n`，这正是我们证明目标 `h : Even n ⊢ P n` 所需要的。

「满足……的最小谓词」视角为规则归纳提供了一个很好的直观解释，可用于**非形式论证**（informal argument）中，例如以下关于「对于所有 `n`，`Even n` 蕴含 `n % 2 = 0`」的证明：

> 证明对假设 `Even n` 使用规则归纳。
>
> **情况 `Even.zero`**：我们必须证明 `0 % 2 = 0`。这可以通过计算得出。
>
> **情况 `Even.add_two k`**：归纳假设是 `k % 2 = 0`。我们必须证明 `(k + 2) % 2 = 0`。这可以通过基本算术推理得出。证毕。

Lean 证明具有相同的结构：

```lean
theorem mod_two_Eq_zero_of_Even (n : ℕ) (h : Even n) :
    n % 2 = 0 :=
  by
    induction h with
    | zero            => rfl
    | add_two k hk ih => simp [ih]
```

PAT 原理为我们提供了另一种看待规则归纳的有效方式。其核心思想是，在形如 `h : Even n ⊢ P[h]` 的目标中对 `h` 进行规则归纳，完全类似于在**依值归纳类型**（dependent inductive type）（例如 `Vec α n`，见[第 5.9 节](ch05_FunctionalProgramming.md#59-依值归纳类型选读)）的值上进行结构归纳。将 `P[ ]` 中 `n` 被替换为项 `u` 的变体记作 `Pᵤ[ ]`，我们得到以下子目标：

```text
⊢ P₀[Even.zero : Even 0]
k : ℕ, hk : Even k, ih : Pₖ[hk] ⊢ Pₖ₊₂[Even.add_two k hk : Even (k + 2)]
```

这些实际上就是 `induction` 策略产生的子目标。

无论归纳谓词 `Q` 为何，计算子目标的步骤总是相同的：

1. 在 `P[h]` 中，将 `h` 替换为应用在一些新变量上的每一个可能的引入规则（例如 `Even.add_two k hk`），并在 `P[ ]` 中对 `n` 进行实例化以使 `P[ ]` 类型正确。这会产生与引入规则数量相等的子目标。
2. 将这些新变量（例如 `k`、`hk`）添加到本地**语境**（context）中。
3. 为所有断言 `Q …` 的新假设添加归纳假设。

注意上述假设中出现了 `hk : Even k`。在「满足……的最小谓词」视角中，它是缺失的，而且它并不是必不可少的，因为总是可以通过将 `P` 强化为 `Even n ∧ ⋯` 的形式来恢复它。

在几乎所有的实际情况中，`h` 不会出现在 `P[h]` 中。我们可以简单地写作：

```text
⊢ P₀
k : ℕ, hk : Even k, ih : Pₖ ⊢ Pₖ₊₂
```

在极少数情况下，`h` 会出现在 `P[h]` 中。正如我们在[第 5.7 节](ch05_FunctionalProgramming.md#57-列表)中尝试提取列表头部时看到的那样，证明可能作为子项出现在任意项中。

接下来，我们考虑自反传递闭包 `Star R`。给定目标 `h : Star R x y ⊢ P`，对 `h` 进行规则归纳会产生以下子目标，其中 `Pₜ,ᵤ` 表示将 `P` 中的 `x` 和 `y` 分别替换为 `t` 和 `u` 的变体：

```text
a b : α, hab : R a b ⊢ Pₐ,ᵦ
a : α ⊢ Pₐ,ₐ
a b c : α, hab : Star R a b, hbc : Star R b c, ihab : Pₐ,ᵦ, ihbc : Pᵦ,ᶜ ⊢ Pₐ,ᶜ
```

这就是「证明助手」中「助手」这一方面发挥作用的地方。`Star` 的关键性质之一是**幂等性**（idempotence）——对 `Star R` 应用 `Star` 不会有任何效果。这可以在 Lean 中如下证明，在等价性的 `→` 方向上使用规则归纳：

```lean
theorem Star_Star_Iff_Star {α : Type} (R : α → α → Prop)
      (a b : α) :
    Star (Star R) a b ↔ Star R a b :=
  by
    apply Iff.intro
    · intro h
      induction h with
      | base a b hab                  => exact hab
      | refl a                        => apply Star.refl
      | trans a b c hab hbc ihab ihbc =>
        apply Star.trans a b
        · exact ihab
        · exact ihbc
    · intro h
      apply Star.base
      exact h
```

我们小心地为新出现的变量赋予直观的名称。在包含长的、自动生成的名称的目标中很容易迷失。[第 3.8 节](ch03_BackwardProofs.md#38-清理策略)中介绍的**清理策略**在面对大型目标时也很有帮助。

我们可以用相等性而非等价性来更常规地陈述幂等性质：

```lean
@[simp] theorem Star_Star_Eq_Star {α : Type}
      (R : α → α → Prop) :
    Star (Star R) = Star R :=
  by
    apply funext
    intro a
    apply funext
    intro b
    apply propext
    apply Star_Star_Iff_Star
```

由于 Lean 的逻辑是**经典逻辑**（classical logic），证明中使用了以下两个定理：

```lean
#check funext   -- 函数外延性
#check propext   -- 命题外延性
```

**函数外延性**（functional extensionality，`funext`）指出，如果两个函数对所有输入都产生相等的结果，那么这两个函数必然相等。**命题外延性**（propositional extensionality，`propext`）指出，命题的等价性与相等性是一致的。在这些短语中，外延性意味着类似于「所见即所得」的意思。虽然这些性质看起来显而易见，但有些证明助手是建立在较弱的、**直觉主义逻辑**（intuitionistic logic）之上的，在这些逻辑中，这些性质通常不成立。

我们将定理 `Star_Star_Eq_Star` 注册为 `simp` 规则，因为以从左到右的重写规则来看，它确实用一个更简单的项替换了一个复杂的项。很难想象会有我们不希望 `simp` 将 `Star (Star …)` 重写为 `Star …` 的情况。

对于规则归纳，我们使用 `induction` 策略。由于一些微妙的逻辑原因（这在[第 12 章](ch12_LogicalFoundations.md)中会更加清晰），这里不允许通过**模式匹配递归**（pattern matching recursion）进行规则归纳。

在[第 5.4 节](ch05_FunctionalProgramming.md#54-模式匹配表达式)中，我们看到了一张并排的描述 `Bool` 和 `Prop` 解释的图表。该图表暗示存在无限数量的命题，但我们目前知道的恰好有两个命题：`False` 和 `True`。以下是修订后的图表：

```text
Bool:                    Prop:
┌─────────┐              ┌─────────────────────────┐
│ false ● │              │ False ●                 │
│ true  ● │              │ True  ● ● ● …           │
└─────────┘              └─────────────────────────┘
```

我们看到，只有两个命题，一个没有证明，另一个有若干证明。图中显示了三个证明。我们将在[第 12 章](ch12_LogicalFoundations.md)中再次完善这幅图。

## 6.4 线性算术策略

`linarith` 策略可用于证明涉及**线性算术**（linear arithmetic）等式（`=`）、不等式（`<`、`>`、`≤` 和 `≥`）以及非等式（`≠`）的目标。「线性」意味着不会出现乘法和除法，或者如果出现，则其中一个操作数必须是数字常量。例如，`2 * x < y` 是一个线性约束（可以改写为 `x + x < y`），而 `x * y < y` 是非线性的。

```lean
theorem linarith_example (i : Int) (hi : i > 5) :
    2 * i + 3 > 11 :=
  by linarith
```

## 6.5 消去

给定一个归纳谓词 `Q`，其引入规则通常具有 `∀…, ⋯ → Q …` 的形式，且可用于证明 `⊢ Q …` 形式的目标。**消去**（elimination）则以相反的方式工作：它从定理或假设 `h : Q …` 中提取信息。消去有多种形式：`cases` 和 `induction` 策略、模式匹配以及消去规则（例如 `And.left`）。

在 `h : Q …` 上调用的 `cases h` 策略执行的规则归纳大致与 `induction h` 相同，但不产生任何归纳假设。我们在[第 5 章](ch05_FunctionalProgramming.md)中遇到了两个惯用法，现在终于可以分析它们了。

第一个惯用法是当 `h` 的形式为 `l = r` 时——即 `Eq l r`（第 6.2 节）。假设目标是 `h : l = r ⊢ P[h]`。第 6.3 节中介绍的步骤会产生子目标

```text
a : α ⊢ Pₐ,ₐ[Eq.refl a : a = a]
```

其中 `Pₜ,ᵤ[ ]` 代表 `P[ ]` 的变体，其中 `l` 和 `r` 分别被 `t` 和 `u` 替换。（严格来说，无用的假设 `h : a = a` 也会出现在子目标中。）在实践中，`P[h]` 可能并不依赖于 `h`。此外，`cases` 会重用名称 `l`，而不会使用像 `a` 这样不同的名称。因此，我们会得到

```text
l : α ⊢ Pₗ,ₗ
```

换句话说，原始目标中所有出现的 `r` 都被替换成了 `l`。这对应于我们在[第 5.7 节](ch05_FunctionalProgramming.md#57-列表)中观察到的行为。

```lean
theorem cases_Eq_example {α : Type} (l r : α) (h : l = r)
      (P : α → α → Prop) :
    P l r :=
  by
    cases h
    sorry
```

第二个惯用法是策略 `cases Classical.em Q`，其中 `Q` 是一个命题。`Classical.em Q` 部分是 `Q ∨ ¬ Q`（即 `Or Q (¬ Q)`，见第 6.2 节）的一个证明项。然后应用 `cases` 来消去 `∨` 联结词。假设目标是 `⊢ P[Classical.em Q]`。根据 `Or` 谓词的定义，新的子目标是

```text
hQ : Q ⊢ P[Or.inl hQ : Q ∨ ¬ Q]
hnQ : ¬ Q ⊢ P[Or.inr hnQ : Q ∨ ¬ Q]
```

不需要修改 `P`，因为 `Or.inl hQ` 和 `Or.inr hnQ` 具有与 `Classical.em Q` 相同的类型——即 `Q ∨ ¬ Q`。在实践中，目标通常不包含 `Classical.em Q`，而仅仅是 `⊢ P`，这样我们就得到子目标

```text
hQ : Q ⊢ P
hnQ : ¬ Q ⊢ P
```

同样，这也是我们在[第 5.7 节](ch05_FunctionalProgramming.md#57-列表)中观察到的行为。

```lean
theorem cases_Classical_em_example {α : Type} (a : α)
      (P Q : α → Prop) :
    Q a :=
  by
    have hor : P a ∨ ¬ P a :=
      Classical.em (P a)
    cases hor with
    | inl hl => sorry
    | inr hr => sorry
```

在结构化证明中，我们可以使用 `match` 表达式（[第 5.4 节](ch05_FunctionalProgramming.md#54-模式匹配表达式)）来实现与 `cases` 相同的效果。这对于逻辑符号非常有效。然而，对于像 `Even` 和 `Star` 这样参数会随归纳而变化的谓词，我们最终会遇到**依值类型模式匹配**（dependently typed pattern matching），这是很微妙的（见[第 5.9 节](ch05_FunctionalProgramming.md#59-依值归纳类型选读)）。通常，让 `cases` 来确定子目标的样式，比我们自己进行模式匹配要容易得多。我们将在下面回顾这两种风格的示例。

展开形如 `Q (c …)` 的假设通常很有用，其中 `c` 是一个**构造子**（constructor）或某些其他常量。我们可以陈述并证明一个**反转规则**（inversion rule）来支持这种消去推理。典型的反转规则具有以下形式：

```text
∀x₁ … xₙ, Q (c x₁ … xₙ) → (∃…, ⋯ ∧ ⋯) ∨ ⋯ ∨ (∃…, ⋯ ∧ ⋯)
```

将引入和消去合并为一个定理也很有用，这可以用于重写假设和子目标的目的。除了中间的联结词 `↔` 之外，格式是相同的：

```text
∀x₁ … xₙ, Q (c x₁ … xₙ) ↔ (∃…, ⋯ ∧ ⋯) ∨ ⋯ ∨ (∃…, ⋯ ∧ ⋯)
```

`Even` 的反转规则如下所示：

```lean
theorem Even_Iff (n : ℕ) :
    Even n ↔ n = 0 ∨ (∃m : ℕ, n = m + 2 ∧ Even m) :=
  by
    apply Iff.intro
    · intro hn
      cases hn with
      | zero         => simp
      | add_two k hk =>
        apply Or.inr
        apply Exists.intro k
        simp [hk]
    · intro hor
      cases hor with
      | inl heq => simp [heq, Even.zero]
      | inr hex =>
        cases hex with
        | intro k hand =>
          cases hand with
          | intro heq hk =>
            simp [heq, Even.add_two _ hk]
```

一如既往，策略式证明并不是特别易读，但我们可以看到引入规则和消去式的 `cases` 策略在逻辑符号和 `Even` 谓词中都起着重要的作用。`simp` 策略则进行了最后的收尾工作。

如果你更喜欢结构化证明，这里有一个对 `hn : Even n` 使用依值类型模式匹配的证明版本：

```lean
theorem Even_Iff_struct (n : ℕ) :
    Even n ↔ n = 0 ∨ (∃m : ℕ, n = m + 2 ∧ Even m) :=
  Iff.intro
    (assume hn : Even n
     match hn with
     | Even.zero         =>
       show 0 = 0 ∨ _ from
         by simp
     | Even.add_two k hk =>
       show _ ∨ (∃m, k + 2 = m + 2 ∧ Even m) from
         Or.inr (Exists.intro k (by simp [*])))
    (assume hor : n = 0 ∨ (∃m, n = m + 2 ∧ Even m)
     match hor with
     | Or.inl heq =>
       show Even n from
         by simp [heq, Even.zero]
     | Or.inr hex =>
       match hex with
       | Exists.intro m hand =>
         match hand with
         | And.intro heq hm =>
           show Even n from
             by simp [heq, Even.add_two _ hm])
```

## 6.6 更多示例

在对归纳谓词有了更深入的了解之后，我们现在可以依次回顾另外四个应用实例。

### 6.6.1 有序列表

我们的第一个例子是一个检查自然数列表是否按升序排列的谓词：

```lean
inductive Sorted : List ℕ → Prop where
  | nil : Sorted []
  | single (x : ℕ) : Sorted [x]
  | two_or_more (x y : ℕ) {zs : List ℕ} (hle : x ≤ y)
      (hsorted : Sorted (y :: zs)) :
    Sorted (x :: y :: zs)
```

该定义捕捉了以下数学直觉：

> 有序列表的集合被定义为满足下列规则的最小闭集：
>
> 1. 列表 `[]` 是有序的；
> 2. 给定一个数字 `x`，列表 `[x]` 是有序的；
> 3. 给定两个数字 `x`、`y` 和一个列表 `zs`，如果 `x ≤ y` 且 `y :: zs` 是有序的，那么 `x :: y :: zs` 是有序的。

通过尝试一些小例子来测试我们的定义总是一个好主意。列表 `[3, 5]` 是有序的吗？看起来是的：

```lean
theorem Sorted_3_5 :
    Sorted [3, 5] :=
  by
    apply Sorted.two_or_more
    · simp
    · exact Sorted.single _

theorem Sorted_3_5_raw :
    Sorted [3, 5] :=
  Sorted.two_or_more _ _ (by simp) (Sorted.single _)
```

同样的想法可以用来证明 `[7, 9, 9, 11]` 是有序的：

```lean
theorem sorted_7_9_9_11 :
    Sorted [7, 9, 9, 11] :=
  Sorted.two_or_more _ _ (by simp)
    (Sorted.two_or_more _ _ (by simp)
       (Sorted.two_or_more _ _ (by simp)
          (Sorted.single _)))
```

相反，我们可以证明某些列表不是有序的。为此，我们需要消去：

```lean
theorem Not_Sorted_17_13 :
    ¬ Sorted [17, 13] :=
  by
    intro h
    cases h with
    | two_or_more _ _ hlet hsorted => simp at hlet
```

从列表 `[17, 13]` 是有序的这一假设中，我们提取出不等式 `17 ≤ 13`。`cases` 策略静默地排除了 `nil` 和 `single` 情况，因为它们无法与双元素列表匹配。然后我们调用 `simp` 来利用不可能成立的假设 `17 ≤ 13`。

### 6.6.2 回文

**回文**（palindrome）是从左向右读和从右向左读都相同的列表。例如，`[a, b, b, a]` 和 `[a, h, a]` 都是回文。当且仅当作为参数传递的列表是回文时，以下归纳谓词为 `True`：

```lean
inductive Palindrome {α : Type} : List α → Prop where
  | nil : Palindrome []
  | single (x : α) : Palindrome [x]
  | sandwich (x : α) (xs : List α) (hxs : Palindrome xs) :
    Palindrome ([x] ++ xs ++ [x])
```

该定义区分了三种情况：

1. `[]` 是回文；
2. 对于任何元素 `x`，单元素列表 `[x]` 是回文；
3. 对于任何元素 `x` 和任何回文 `[y₁, …, yₙ]`，列表 `[x, y₁, …, yₙ, x]` 是回文。

回文是归纳谓词大显身手的另一个例子。以下**朴素递归定义**（naive recursive definition）无法工作，因为 `[x] ++ xs ++ [x]` 不是一个构造子模式，且变量 `x` 被重复了：

```lean
-- fails
def palindromeRec {α : Type} : List α → Bool
  | []                 => true
  | [_]                => true
  | ([x] ++ xs ++ [x]) => palindromeRec xs
  | _                  => false
```

正确的递归定义是可能的，但超出了本指南的范围。

当然，回文的反转也是回文。这是一个很好的练习：

```lean
theorem Palindrome_reverse {α : Type} (xs : List α)
      (hxs : Palindrome xs) :
    Palindrome (reverse xs) :=
  by
    induction hxs with
    | nil                  => exact Palindrome.nil
    | single x             => exact Palindrome.single x
    | sandwich x xs hxs ih =>
      · simp [reverse, reverse_append]
        exact Palindrome.sandwich _ _ ih
```

非形式地：

> 证明通过对假设 `hxs` 进行规则归纳。
>
> **情况 `Palindrome.nil`**：我们必须证明 `Palindrome (reverse [])`。利用 `reverse [] = []`，这由 `Palindrome.nil` 得出。
>
> **情况 `Palindrome.single x`**：我们必须证明 `Palindrome (reverse [x])`。利用 `reverse [x] = [x]`，这由 `Palindrome.single x` 得出。
>
> **情况 `Palindrome.sandwich x xs hxs`**：在假设 `Palindrome xs` 下，我们必须证明 `Palindrome (reverse ([x] ++ xs ++ [x]))`。归纳假设是 `Palindrome (reverse xs)`。通过简化，只需证明 `Palindrome ([x] ++ reverse xs ++ [x])`。根据 `Palindrome.sandwich`，只需证明 `Palindrome (reverse xs)`，这正是归纳假设。证毕。

### 6.6.3 满二叉树

我们的第三个例子基于[第 5.8 节](ch05_FunctionalProgramming.md#58-二叉树)中介绍的二叉树类型。如果二叉树的所有节点都有零个或两个子节点，则称该二叉树是**满的**（full）。这可以编码为一个归纳谓词：

```lean
inductive IsFull {α : Type} : Tree α → Prop where
  | nil : IsFull Tree.nil
  | node (a : α) (l r : Tree α)
      (hl : IsFull l) (hr : IsFull r)
      (hiff : l = Tree.nil ↔ r = Tree.nil) :
    IsFull (Tree.node a l r)
```

第一种情况指出空树是满树。第二种情况指出，如果一个非空树有两个本身也是满的子树，且这两个子树要么都是空的，要么都是非空的，那么该树就是满树。这两种情况整齐地遵循了归纳类型的结构，因此重用名称 `nil` 和 `node` 是很自然的。

子节点是空树的节点组成的树是满树。这是一个简单的证明：

```lean
theorem IsFull_singleton {α : Type} (a : α) :
    IsFull (Tree.node a Tree.nil Tree.nil) :=
  by
    apply IsFull.node
    · exact IsFull.nil
    · exact IsFull.nil
    · rfl
```

满树的一个更有趣的性质是，满树性在**镜像操作**（mirror operation）下是保持不变的。我们的第一个证明是通过对 `ht : IsFull t` 进行规则归纳：

```lean
theorem IsFull_mirror {α : Type} (t : Tree α)
      (ht : IsFull t) :
    IsFull (mirror t) :=
  by
    induction ht with
    | nil                             => exact IsFull.nil
    | node a l r hl hr hiff ih_l ih_r =>
      · rw [mirror]
        apply IsFull.node
        · exact ih_r
        · exact ih_l
        · simp [mirror_Eq_nil_Iff, *]
```

由于 `IsFull` 的定义遵循了 `Tree` 的定义，因此对树 `t` 进行**结构归纳**（structural induction）也是合理的：

```lean
theorem IsFull_mirror_struct_induct {α : Type} (t : Tree α) :
    IsFull t → IsFull (mirror t) :=
  by
    induction t with
    | nil                  =>
      · intro ht
        exact ht
    | node a l r ih_l ih_r =>
      · intro ht
        cases ht with
        | node _ _ _ hl hr hiff =>
          · rw [mirror]
            apply IsFull.node
            · exact ih_r hr
            · apply ih_l hl
            · simp [mirror_Eq_nil_Iff, *]
```

这里的关键是对假设 `ht : IsFull (Tree.node a l r)` 进行的**分情况讨论**（case distinction）。`cases` 策略注意到 `IsFull.nil` 引入规则不可能被用来推导出 `ht`，因此它只能产生一种情况，对应于 `IsFull.node`。一如既往，如果你在 Visual Studio Code 中通过移动光标来检查策略式证明，它会更有意义。

### 6.6.4 一阶项

我们的最后一个例子基于**一阶项**（first-order term）的归纳类型：

```lean
inductive Term (α β : Type) : Type where
  | var : β → Term α β
  | fn  : α → List (Term α β) → Term α β
```

一阶项要么是一个变量 `x`，要么是一个应用于参数列表的函数符号 `f`：`f(t₁, …, tₙ)`，其中数学变量 `t₁, …, tₙ` 代表参数，它们本身也是项。因此，`sin(max(x, y))` 是一个一阶项。参数 `α` 和 `β` 分别是函数符号和变量的类型。

并非所有项都是合法的。例如，项 `min(cos(a), cos(a, b))` 被认为是**非良构的**（ill-formed），因为函数 `cos` 调用时的参数数量不一致（1 个对比 2 个）。除了 `α` 和 `β`，我们还考虑了**元数**（arity），由函数 `arity : α → ℕ` 表示，指示每个函数符号接受多少个参数。例如，二元符号的元数为 2。

`WellFormed` 谓词接着检查给定的项是否仅包含具有指定数量参数的函数符号应用：

```lean
inductive WellFormed {α β : Type} (arity : α → ℕ) :
  Term α β → Prop where
  | var (x : β) : WellFormed arity (Term.var x)
  | fn (f : α) (ts : List (Term α β))
      (hargs : ∀t ∈ ts, WellFormed arity t)
      (hlen : length ts = arity f) :
    WellFormed arity (Term.fn f ts)
```

`var` 情况指出变量总是良构的。`fn` 情况检查参数 `ts` 是否递归地良构，并且 `ts` 的长度是否等于所讨论函数符号 `f` 的指定元数。

一阶项的另一个有趣性质是它们是否包含变量。这可以使用归纳谓词轻松检查：

```lean
inductive VariableFree {α β : Type} : Term α β → Prop where
  | fn (f : α) (ts : List (Term α β))
      (hargs : ∀t ∈ ts, VariableFree t) :
    VariableFree (Term.fn f ts)
```

没有对应于 `Term.var` 的引入规则，因为变量永远不是**无变量的**（variable-free）。

## 6.7 归纳中的陷阱

对归纳谓词调用 `induction` 时需要小心。归纳谓词的参数通常会在归纳过程中演变。这些细节在非形式证明中通常会被一带而过，但证明助手要求我们保持精确。

回想一下偶数的定义：

```lean
inductive Even : ℕ → Prop where
  | zero    : Even 0
  | add_two : ∀k : ℕ, Even k → Even (k + 2)
```

如果目标的格式为 `h : Even n ⊢ P n`，对 `h` 应用 `induction` 将产生以下子目标：

```text
⊢ P 0
k : ℕ, hk : P k ⊢ P (k + 2)
```

这符合预期。

问题出现在 `Even` 的参数不是变量时。在目标 `hev : Even (2 * n + 1) ⊢ False` 中对假设 `hev` 应用 `induction` 会失败并报错：

```text
index in target's type is not a variable (consider using the `cases` tactic instead)
```

译文：目标类型中的索引不是变量（考虑改用 `cases` 策略）。

为了解决这个问题，我们需要用变量 `m` 替换 `2 * n + 1`，并添加等式 `m = 2 * n + 1` 作为假设：

```text
m : ℕ, hm : m = 2 * n + 1, hev : Even m ⊢ False
```

这个目标在逻辑上是等价的，但现在 `induction` 会产生两个子目标：

```text
m n : ℕ, hm : 0 = 2 * n + 1 ⊢ False
m : ℕ, hm : m + 2 = 2 * n + 1, ih : m = 2 * n + 1 → False ⊢ False
```

遗憾的是，第二个子目标是不可证明的。问题在于我们想要用 `n - 1` 来实例化归纳假设 `ih` 中的 `n`，但 `n` 是不可实例化的。

解决方案是什么？我们需要对 `n` 进行全称量化，以便能够在归纳假设中实例化它。这可以通过在 `induction h` 之后指定 `generalizing n` 来实现。现在我们得到如下子目标：

```text
m n : ℕ, hm : 0 = 2 * n + 1 ⊢ False
m : ℕ, hm : m + 2 = 2 * n + 1, ih : ∀n, m = 2 * n + 1 → False ⊢ False
```

现在归纳假设中的变量 `n` 与目标其余部分中的变量 `n` 断开了联系，我们可以将归纳假设中的 `n` 实例化为 `n - 1`。

综上所述，我们得到：

```lean
theorem Not_Even_two_mul_add_one (m n : ℕ)
      (hm : m = 2 * n + 1) :
    ¬ Even m :=
  by
    intro h
    induction h generalizing n with
    | zero            => linarith
    | add_two k hk ih =>
      apply ih (n - 1)
      cases n with
      | zero    => simp at *
      | succ n' =>
        simp at *
        linarith
```

我们使用定理 `Nat.succ_eq_add_one` 将 `Nat.succ n` 形式的项重写为 `n + 1`，并使用 `linarith` 策略进行简单的算术推理。当我们面对 `Nat.succ` 和加法的混合时，该定理非常有用。

## 6.8 新引入的 Lean 结构总结

**定理**

| 名称 | 含义 |
|------|------|
| `funext` | 函数外延性 |
| `propext` | 命题外延性 |

**策略**

| 策略 | 含义 |
|------|------|
| `linarith` | 为线性算术调用求解过程 |