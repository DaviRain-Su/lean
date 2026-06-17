# 第 9 章 操作语义

> 已对照英文原版 PDF 与 `LoVe09_OperationalSemantics_Demo.lean` 人工翻译校对（Lean-zh 中文版 PDF 第三部分尚未发布，发布后可用 `node scripts/extract-from-pdf.mjs` 重新对齐）。

在本章以及接下来的两章中，我们将看到如何用 Lean 来规定编程语言的语法与语义、证明语义方面的性质，并对具体程序进行推理。本章在很大程度上受到 *Concrete Semantics: With Isabelle/HOL* 第 7 章的启发。

## 课前须知：形式化项目

> 本节来自课程 Demo 材料，英文原版 PDF 第 9 章正文未收录；保留供选课同学参考。

作为两份家庭作业表的替代，你可以选择完成一个验证项目，计 20 分。若选择此方案，请在本周结束前通过电子邮件告知授课教师。一个完全成功的项目，我们期望包含大约 200 行（或更多）Lean 代码，包括定义与证明。

以下是一些项目构想。

**计算机科学：**

* 扩展 WHILE 语言，加入静态数组或其他特性；
* 函数式数据结构（例如平衡树）；
* 函数式算法（例如冒泡排序、归并排序、Tarjan 算法）；
* 从表达式或命令式程序到栈机等目标的编译器；
* 类型系统（例如 Benjamin Pierce 的 *Types and Programming Languages*）；
* 安全性质（例如 Volpano–Smith 风格的非干扰分析）；
* 一阶项理论，包括匹配、项重写；
* 自动机理论；
* 上下文无关文法或正则表达式的规范化；
* 进程代数与互模拟；
* 证明系统的可靠性与（可能的）完备性（例如 Gentzen 的相继式演算、自然演绎、表方法）；
* 分离逻辑（separation logic）；
* 使用 [Hoare 逻辑](ch10_HoareLogic.md) 的已验证程序。

**数学：**

* 图论；
* 组合数学；
* 数论。

**元编程：**

* 自定义策略；
* 自定义诊断工具。

过往评价摘录：

> Q：你觉得项目怎么样？
>
> A：很享受。
>
> A：有趣且有难度。
>
> A：很好，我认为这种形式很棒——它让人们有机会做有挑战性的练习，并且可以提交未完成的成果。
>
> A：我非常喜欢。我认为这是很好的学习方式——找你喜欢的东西，深入一点，卡住，寻求帮助。我希望我能多做这样的事！
>
> A：能花时间自己钻研感兴趣的内容，这很棒。
>
> A：其实非常有趣！！！
>
> A：很有帮助。它提供了机会，让你能在课程的某个特定方面多花些时间。

## 9.1 形式语义

**形式语义**（formal semantics）使我们能够规定并推理一门编程语言，以及用该语言编写的各个程序。它可以成为已验证编译器、解释器、验证器、静态分析器、类型检查器等工具的基础。若没有形式化证明，这些工具几乎总是不正确的。

以 WebAssembly 为例——这是一种面向 Web 浏览器的新型类汇编语言，设计为 C++、Rust 等高级语言的可移植编译目标。研究者 Conrad Watt 使用 Isabelle/HOL 证明助手对其语义与类型系统进行了形式化。他发现了许多问题（以下斜体为原文强调）：

> 我们完成了 WebAssembly 语言核心执行语义与类型系统的完整 Isabelle 机械化。此外，我们还为工作组论文中陈述的类型可靠性性质创建了机械化证明。为了完成该证明，我们的证明与建模工作揭露了官方 WebAssembly 规范中的**若干缺陷**，需要由规范作者予以修正。在某些情况下，这意味着类型系统**原本是不健全的**。
>
> 我们与工作组部分成员保持了建设性对话，在规范新增特性时对其进行机械化与验证。特别是，WebAssembly 实现与其宿主环境交互的机制，在工作组原始论文中并未得到形式化规定。将我们的机械化扩展以建模该特性时，揭露了 WebAssembly 规范中的一个缺陷，该缺陷**破坏了类型系统的健全性**。

Watt 的研究只是众多例子之一。证明助手在编程语言研究中被广泛使用。每年，在编程语言原理（Principles of Programming Languages，POPL）会议上发表的大量论文中，有相当比例得到了形式化。这之所以可行，是因为入门所需的机制相对较少。证明往往包含大量分情况讨论，非常适合计算机处理。此外，证明助手在扩展编程语言、增添更多特性时，能极其方便地跟踪需要修改的内容。

## 9.2 极简命令式语言

状态 `s` 是从变量名到取值的函数（`String → ℕ`）。

**WHILE** 是一种极简的命令式语言，其文法如下：

```text
S  ::=  skip                 -- 空操作
     |  x := a               -- 赋值
     |  S; S                 -- 顺序组合
     |  if B then S else S   -- 条件语句
     |  while B do S         -- while 循环
```

其中 `S` 表示语句（statement，亦称命令 command 或程序 program），`x` 表示程序变量，`a` 表示算术表达式，`B` 表示布尔表达式。

WHILE 名称的一个趣味双关：Weak Hypothetical Imperative Language Example（弱假设命令式语言示例）。

在文法中，我们有意不规定算术表达式与布尔表达式的具体语法。在 Lean 中，我们有两种选择：

* 可以使用类似[第 2.1 节](ch02_ProgramsAndTheorems.md#21-类型定义)中 `AExp` 的类型，布尔表达式亦类似；
* 也可以直接规定：算术表达式是从状态到自然数的函数（`State → ℕ`），布尔表达式是状态上的谓词（`State → Prop` 或 `State → Bool`）。`State` 是从程序变量到取值的映射。于是 `x + y + 1` 可表示为 `fun s : State ↦ s "x" + s "y" + 1`，而 `a ≠ b` 可表示为谓词 `fun s : State ↦ s "a" ≠ s "b"`。

这两种选择对应**深嵌入**（deep embedding）与**浅嵌入**（shallow embedding）的区别：

* **深嵌入**的某种语法（表达式、公式、程序等）由证明助手中的抽象语法树（例如 `AExp`）及其语义（例如 `eval`）共同给出；
* **浅嵌入**则直接复用逻辑中相应的机制（例如项、函数、谓词类型）。

深嵌入使我们能够推理程序的语法；浅嵌入更轻量，因为可以直接使用，无需再定义语义。浅嵌入本身就是其自身的语义。

在[第 7 章](ch07_EffectfulProgramming.md)中，我们对带作用的程序使用了浅嵌入。此处，我们对程序使用深嵌入（我们觉得有趣且希望仔细研究），对算术表达式与布尔表达式使用浅嵌入（我们觉得不那么有趣）。

我们的 Lean 程序定义如下：

```lean
#print State

inductive Stmt : Type where
  | skip       : Stmt
  | assign     : String → (State → ℕ) → Stmt
  | seq        : Stmt → Stmt → Stmt
  | ifThenElse : (State → Prop) → Stmt → Stmt → Stmt
  | whileDo    : (State → Prop) → Stmt → Stmt

infixr:90 "; " => Stmt.seq
```

中缀语法 `S; T` 是 `Stmt.seq S T` 的缩写。

归纳类型的构造子与 WHILE 文法规则之间的对应关系应当一目了然。变量用字符串表示。`State` 类型定义为 `String → ℕ`，即从变量名到取值的映射。为简单起见，所有程序变量均为自然数类型，且状态中包含所有可能的变量名并均赋予一个值。

下列小程序展示了深嵌入的 WHILE 语法（及其浅嵌入的方面）：

```lean
def sillyLoop : Stmt :=
  Stmt.whileDo (fun s ↦ s "x" > s "y")
    (Stmt.skip;
     Stmt.assign "x" (fun s ↦ s "x" - 1))
```

即程序

```text
while x > y do
  skip;
  x := x - 1
```

## 9.3 大步语义

**操作语义**（operational semantics）对应于理想化的解释器。主要有两种变体：**大步语义**（big-step semantics）与**小步语义**（small-step semantics）。我们先为 WHILE 语言给出大步语义。

在大步操作语义（亦称**自然语义**，natural semantics）中，判断具有形式 `(S, s) ⟹ t`，其直观含义为：

> 从状态 `s` 出发执行 `S`，可能终止于状态 `t`。

对于 WHILE 这类确定性语言，由于程序总有单一结果，「可能终止」与「必然终止」或「终止」同义。

依照 WHILE 程序的定义，状态 `s` 是 `String → ℕ` 类型的函数。下面是一个判断示例：

```text
(x := x + y; y := 0, [x ↦ 3, y ↦ 5]) ⟹ [x ↦ 8, y ↦ 0]
```

我们用非正式记法 `[x ↦ 3, y ↦ 5]` 表示函数 `fun v ↦ if v = "x" then 3 else if v = "y" then 5 else 0`，`[x ↦ 8, y ↦ 0]` 类似。直观上，该判断成立。

规定此类语义的传统方式是通过**推导规则**（derivation rule）构成的形式系统，风格与[第 1.3 节](ch01_TypesAndTerms.md#13-类型检查与类型推断)及[第 4.6 节](ch04_ForwardProofs.md#46-依值类型)中给出的类型规则类似。大步语义判断的推导规则如下，可视为 WHILE 程序的理想化解释器：

```text
——————————————— Skip
(skip, s) ⟹ s

——————————————————————————— Assign
(x := a, s) ⟹ s[x ↦ a s]

(S, s) ⟹ t   (T, t) ⟹ u
——————————————————————————— Seq
(S; T, s) ⟹ u

(S, s) ⟹ t
———————————————————————————— If-True   若 b s 为真
(if b then S else T, s) ⟹ t

(T, s) ⟹ t
———————————————————————————— If-False   若 b s 为假
(if b then S else T, s) ⟹ t

(S, s) ⟹ t   (while b do S, t) ⟹ u
—————————————————————————————————————— While-True   若 b s 为真
(while b do S, s) ⟹ u

———————————————————————— While-False   若 b s 为假
(while b do S, s) ⟹ s
```

在规则中，`a s` 表示算术表达式 `a` 在状态 `s` 中的值，`b s` 类似。语法 `s[x ↦ n]` 表示与 `s` 相同、但将变量 `x` 映射为 `n` 的状态。形式地：

```lean
s[x ↦ n] = (fun v ↦ if v = x then n else s v)
```

该语法由 LoVelib 提供。

最复杂的规则无疑是 While-True。直观上可理解为：

> 假设条件 `b` 在状态 `s` 中为真。若（1）在状态 `s` 中执行 `S` 得到状态 `t`，且（2）从状态 `t` 执行 `while b do S` 得到状态 `u`，则在状态 `s` 中执行 `while b do S` 得到状态 `u`。

另一种理解 While-True 的方式是**循环展开**（loop unrolling）。若循环条件为真，则 `while b do S` 等价于复合语句 `S; while b do S`。While-True 的两个前提对应于 `S; while b do S` 的 Seq 规则实例的两个前提。

作为练习，我们来推导上述示例判断。令 `s := [x ↦ 3, y ↦ 5]`，`t := [x ↦ 8, y ↦ 5]`，`u := [x ↦ 8, y ↦ 0]`，则有

```text
(x := x + y, s) ⟹ t          Assign
(y := 0, t) ⟹ u              Assign
—————————————————————————
(x := x + y; y := 0, s) ⟹ u  Seq
```

推导规则可以直观阅读。以 Seq 为例：

> 若（1）在状态 `s` 中执行 `S` 得到状态 `t`，且（2）在状态 `t` 中执行 `T` 得到状态 `u`，则在状态 `s` 中执行顺序组合 `S; T` 得到状态 `u`。

条件（1）和（2）对应于 Seq 的两个前提。

在 Lean 中，大步语义判断由归纳谓词表示，其引入规则与上述推导规则紧密对应：

```lean
inductive BigStep : Stmt × State → State → Prop where
  | skip (s) :
    BigStep (Stmt.skip, s) s
  | assign (x a s) :
    BigStep (Stmt.assign x a, s) (s[x ↦ a s])
  | seq (S T s t u) (hS : BigStep (S, s) t)
      (hT : BigStep (T, t) u) :
    BigStep (S; T, s) u
  | if_true (B S T s t) (hcond : B s)
      (hbody : BigStep (S, s) t) :
    BigStep (Stmt.ifThenElse B S T, s) t
  | if_false (B S T s t) (hcond : ¬ B s)
      (hbody : BigStep (T, s) t) :
    BigStep (Stmt.ifThenElse B S T, s) t
  | while_true (B S s t u) (hcond : B s)
      (hbody : BigStep (S, s) t)
      (hrest : BigStep (Stmt.whileDo B S, t) u) :
    BigStep (Stmt.whileDo B S, s) u
  | while_false (B S s) (hcond : ¬ B s) :
    BigStep (Stmt.whileDo B S, s) s

infix:110 " ⟹ " => BigStep
```

与递归函数相比，使用归纳谓词可以处理非终止（发散的 `while`），以及对 WHILE 更丰富的语言中的非确定性。也可以说，它提供了更贴近科学文献中传统判断规则的语法。若我们尝试如下递归定义：

```lean
def eval : Stmt → State → State
| Stmt.skip,           s => s
| Stmt.assign x a,     s => s[x ↦ a s]
| Stmt.ifThenElse b S T, s =>
    if b s then eval S s else eval T s
| S; T,                s => eval T (eval S s)
| Stmt.whileDo b S,    s =>
    if b s then eval (Stmt.whileDo b S) (eval S s) else s
```

则会在 `Stmt.whileDo` 情形面临非终止。确实，由于程序 `Stmt.whileDo (fun _ ↦ True) Stmt.skip` 永远循环，用 `eval` 求值它将永不返回。

有了大步语义，我们可以对具体程序进行推理，例如[第 9.2 节](#92-极简命令式语言)中定义的程序，并证明如下定理：

```lean
theorem sillyLoop_from_1_BigStep :
    (sillyLoop, (fun _ ↦ 0)["x" ↦ 1]) ⟹ (fun _ ↦ 0) :=
  by
    rw [sillyLoop]
    apply BigStep.while_true
    · simp
    · apply BigStep.seq
      · apply BigStep.skip
      · apply BigStep.assign
    · simp
      apply BigStep.while_false
      simp
```

## 9.4 大步语义的性质

有了大步语义，我们可以对具体程序进行推理，证明将终态与初态联系起来的定理。同样重要的是，它使我们能够证明编程语言的性质，例如确定性与非终止性。

我们从确定性开始。它看似平凡，但很容易因规则笔误而获得非确定性。例如，在赋值规则中，若误将 `BigStep (Stmt.assign x a, s) (s[y ↦ a s])` 中的 `x` 写成 `y`，则该规则可随意修改任意变量 `y`。换言之，程序执行可能随机修改任意变量。因此，我们来验证 WHILE 语言确实具有确定性：

```lean
theorem BigStep_deterministic {Ss l r} (hl : Ss ⟹ l)
      (hr : Ss ⟹ r) :
    l = r :=
  by
    induction hl generalizing r with
    | skip s =>
      cases hr with
      | skip => rfl
    | assign x a s =>
      cases hr with
      | assign => rfl
    | seq S T s l₀ l hS hT ihS ihT =>
      cases hr with
      | seq _ _ _ r₀ _ hS' hT' =>
        cases ihS hS' with
        | refl =>
          cases ihT hT' with
          | refl => rfl
    | if_true B S T s l hB hS ih =>
      cases hr with
      | if_true _ _ _ _ _ hB' hS'  => apply ih hS'
      | if_false _ _ _ _ _ hB' hS' => aesop
    | if_false B S T s l hB hT ih =>
      cases hr with
      | if_true _ _ _ _ _ hB' hS'  => aesop
      | if_false _ _ _ _ _ hB' hS' => apply ih hS'
    | while_true B S s l₀ l hB hS hw ihS ihw =>
      cases hr with
      | while_true _ _ _ r₀ hB' hB' hS' hw' =>
        cases ihS hS' with
        | refl =>
          cases ihw hw' with
          | refl => rfl
      | while_false _ _ _ hB' => aesop
    | while_false B S s hB =>
      cases hr with
      | while_true _ _ _ s' _ hB' hS hw => aesop
      | while_false _ _ _ hB'           => rfl
```

出于技术原因，对 `(S, s)` 用单一变量 `Ss` 表示。上文已给出完整证明；非形式证明梗概如下：

证明对 `(S, s) ⟹ l` 进行**规则归纳**（rule induction）。

* **Skip 情形**：要有 `(skip, s) ⟹ l`，需 `l = s`。类似地，对 `(skip, s) ⟹ r` 分情况分析得 `r = s`。故 `l = r`。
* **Assign 情形**：与 Skip 类似。
* **Seq 情形**：有假设 `(S, s) ⟹ t`、`(T, t) ⟹ l`、`(S, s) ⟹ t'`、`(T, t') ⟹ r`，以及归纳假设 `∀r, (S, s) ⟹ r → t = r` 和 `∀r, (T, t) ⟹ r → l = r`。由第一个归纳假设与 `(S, s) ⟹ t'` 得 `t = t'`。由第二个归纳假设与 `(T, t') ⟹ r` 得 `l = r`。
* **If-True 情形**：因 `b s` 为真，`(if b then S else T, s) ⟹ r` 只能由 If-True 推出，故 `(S, s) ⟹ r`。归纳假设为 `∀r, (S, s) ⟹ r → l = r`。将 `(S, s) ⟹ r` 应用于它得 `l = r`。
* **If-False 情形**：与 If-True 类似。
* **While-True 情形**：与 Seq 类似。
* **While-False 情形**：与 Skip 类似。

鉴于 WHILE 语言是确定性的，对大步语义而言，终止性可表述为：

```lean
/-
theorem BigStep_terminates {S s} :
    ∃t, (S, s) ⟹ t :=
  sorry   -- 不可证明
-/
```

该性质表示：对每个语句 `S` 和状态 `s`，存在状态 `t`，使得从 `s` 出发执行 `S` 可能终止于 `t`。因 WHILE 是确定性的，「可能终止」与「必然终止」同义。然而，该性质不成立。

对归纳谓词推理时，使用**反转规则**（inversion rule）（[第 6.5 节](ch06_InductivePredicates.md#65-消去)）往往很方便。据此，我们证明下列规则：

```lean
@[simp] theorem BigStep_skip_Iff {s t} :
    (Stmt.skip, s) ⟹ t ↔ t = s :=
  by
    apply Iff.intro
    · intro h
      cases h with
      | skip => rfl
    · intro h
      rw [h]
      apply BigStep.skip

@[simp] theorem BigStep_assign_Iff {x a s t} :
    (Stmt.assign x a, s) ⟹ t ↔ t = s[x ↦ a s] :=
  by
    apply Iff.intro
    · intro h
      cases h with
      | assign => rfl
    · intro h
      rw [h]
      apply BigStep.assign

@[simp] theorem BigStep_seq_Iff {S T s u} :
    (S; T, s) ⟹ u ↔ (∃t, (S, s) ⟹ t ∧ (T, t) ⟹ u) :=
  by
    apply Iff.intro
    · intro h
      cases h with
      | seq =>
        apply Exists.intro
        apply And.intro <;>
          assumption
    · intro h
      cases h with
      | intro s' h' =>
        cases h' with
        | intro hS hT =>
          apply BigStep.seq <;>
            assumption

@[simp] theorem BigStep_if_Iff {B S T s t} :
    (Stmt.ifThenElse B S T, s) ⟹ t ↔
    (B s ∧ (S, s) ⟹ t) ∨ (¬ B s ∧ (T, s) ⟹ t) :=
  by
    apply Iff.intro
    · intro h
      cases h with
      | if_true _ _ _ _ _ hB hS =>
        apply Or.intro_left
        aesop
      | if_false _ _ _ _ _ hB hT =>
        apply Or.intro_right
        aesop
    · intro h
      cases h with
      | inl h =>
        cases h with
        | intro hB hS =>
          apply BigStep.if_true <;>
            assumption
      | inr h =>
        cases h with
        | intro hB hT =>
          apply BigStep.if_false <;>
            assumption

theorem BigStep_while_Iff {B S s u} :
    (Stmt.whileDo B S, s) ⟹ u ↔
    (B s ∧ ∃t, (S, s) ⟹ t ∧ (Stmt.whileDo B S, t) ⟹ u)
    ∨ (¬ B s ∧ u = s) :=
  by
    apply Iff.intro
    · intro h
      cases h with
      | while_true _ _ _ t _ hB hS hw => aesop
      | while_false _ _ _ hB => aesop
    · intro h
      cases h with
      | inl hex =>
        cases hex with
        | intro t h =>
          cases h with
          | intro hB h =>
            cases h with
            | intro hS hwhile =>
              apply BigStep.while_true <;>
                assumption
      | inr h =>
        cases h with
        | intro hB hus =>
          rw [hus]
          apply BigStep.while_false
          assumption

@[simp] theorem BigStep_while_true_Iff {B S s u}
      (hcond : B s) :
    (Stmt.whileDo B S, s) ⟹ u ↔
    (∃t, (S, s) ⟹ t ∧ (Stmt.whileDo B S, t) ⟹ u) :=
  by
    rw [BigStep_while_Iff]
    simp [hcond]

@[simp] theorem BigStep_while_false_Iff {B S s t}
      (hcond : ¬ B s) :
    (Stmt.whileDo B S, s) ⟹ t ↔ t = s :=
  by
    rw [BigStep_while_Iff]
    simp [hcond]
```

我们将这些规则加入 `simp` 集合，但 `BigStep_while_Iff` 除外——加入它会使 `simp` 陷入循环。

## 9.5 小步语义

大步语义的一个局限是无法推理**中间状态**。从判断 `(S, s) ⟹ t` 中，我们只能看到初态 `s` 与终态 `t`。这对于多线程程序来说粒度太粗——多个进程可能彼此在中间状态上交互。此外，对非确定性语言，大步语义没有一般方式表达终止：一个判断表示一种可能性（在状态 `s` 中执行 `S` 可能得到状态 `t`），而非必然性。

**小步操作语义**（small-step operational semantics，亦称**结构操作语义**，structural operational semantics）提供更精细的视角。迁移谓词 `⇒` 的类型为 `Stmt × State → Stmt × State → Prop`。直观上，`(S, s) ⇒ (T, t)` 表示：在状态 `s` 中执行程序 `S` 的一步后，剩余待执行的程序为 `T`，状态为 `t`。若没有剩余程序待执行，则置为 `skip`。

一次执行是有限或无限的「小步」链 `(S₀, s₀) ⇒ (S₁, s₁) ⇒ ⋯`。对 `(S, s)` 称为**配置**（configuration）。若不存在形如 `(S, s) ⇒ (T, t)` 的迁移，则该配置为**终态配置**（final）。一次执行如下：

```text
(x := x + y; y := 0, [x ↦ 3, y ↦ 5])
  ⇒ (skip; y := 0,       [x ↦ 8, y ↦ 5])
  ⇒ (y := 0,             [x ↦ 8, y ↦ 5])
  ⇒ (skip,               [x ↦ 8, y ↦ 0])
```

若借用计算机处理器的类比，配置 `(S, s)` 中的 `S` 分量可视为**程序计数器**（program counter），指示接下来应执行哪些指令。程序的逐步执行类似于在调试器中为每一步设置断点来运行程序。

有效的小步判断由下列推导规则给出：

```text
————————————————————————————————— Assign
(x := a, s) ⇒ (skip, s[x ↦ a s])

(S, s) ⇒ (S', s')
——————————————————————— Seq-Step
(S; T, s) ⇒ (S'; T, s')

———————————————————— Seq-Skip
(skip; T, s) ⇒ (T, s)

——————————————————————————————— If-True   若 b s 为真
(if b then S else T, s) ⇒ (S, s)

——————————————————————————————— If-False   若 b s 为假
(if b then S else T, s) ⇒ (T, s)

——————————————————————————————————————————————————————————————— While
(while b do S, s) ⇒ (if b then (S; while b do S) else skip, s)
```

这些规则令人想起[第 6.1.2 节](ch06_InductivePredicates.md#612-网球比赛)中网球比赛的迁移系统，那里也规定了小步：从 0–0 到 15–0，再到 15–15，依此类推。

与大步语义不同，小步语义中没有 `skip` 的规则。这是因为形如 `(skip, s)` 的配置被视为终态；`skip` 被理解为执行平凡的语句。检视规则可知，配置为终态当且仅当其第一个分量为 `skip`。

两条规则涉及顺序组合 `S; T`。第一条规则在能对 `S` 取得进展时适用；若 `S` 为 `skip`，则无法取得进展，第二条规则适用。

`if` 的规则检查条件 `b`，并根据其真假将 then 或 else 分支作为剩余待执行的计算。

对 `while` 循环，有一条无条件规则，展开循环的一次迭代并引入 `if` 语句。随后由 If-True 与 If-False 规则处理该 `if`。在 If-True 情形下，我们最终会再次到达 `while` 循环。对无限循环，这可以永远持续。

在 Lean 中，小步语义规定如下：

```lean
inductive SmallStep : Stmt × State → Stmt × State → Prop where
  | assign (x a s) :
    SmallStep (Stmt.assign x a, s) (Stmt.skip, s[x ↦ a s])
  | seq_step (S S' T s s') (hS : SmallStep (S, s) (S', s')) :
    SmallStep (S; T, s) (S'; T, s')
  | seq_skip (T s) :
    SmallStep (Stmt.skip; T, s) (T, s)
  | if_true (B S T s) (hcond : B s) :
    SmallStep (Stmt.ifThenElse B S T, s) (S, s)
  | if_false (B S T s) (hcond : ¬ B s) :
    SmallStep (Stmt.ifThenElse B S T, s) (T, s)
  | whileDo (B S s) :
    SmallStep (Stmt.whileDo B S, s)
      (Stmt.ifThenElse B (S; Stmt.whileDo B S) Stmt.skip, s)

infixr:100 " ⇒ " => SmallStep
infixr:100 " ⇒* " => RTC SmallStep
```

小步语义中没有 `skip` 的规则（为什么？）。

基于小步语义，可以如下**定义**大步语义：

```text
(S, s) ⟹ t  当且仅当  (S, s) ⇒* (skip, t)
```

其中 `p*` 表示二元谓词 `p` 的**自反传递闭包**（reflexive transitive closure，RTC）。自反传递闭包在[第 6.1.3 节](ch06_InductivePredicates.md#613-自反传递闭包)中已有介绍。或者，若已定义大步语义，可证明上述等价定理以验证定义。

小步语义的主要缺点是我们现在有两个谓词 `⇒` 与 `⇒*`，推导规则与证明往往比大步情形更复杂。下面例子中，每一步小步都需应用定理 `RTC.head`：

```lean
RTC.head : ?R ?a ?b → RTC ?R ?b ?c → RTC ?R ?a ?c
```

```lean
theorem sillyLoop_from_1_SmallStep :
    (sillyLoop, (fun _ ↦ 0)["x" ↦ 1]) ⇒*
    (Stmt.skip, (fun _ ↦ 0)) :=
  by
    rw [sillyLoop]
    apply RTC.head
    · apply SmallStep.whileDo
    · apply RTC.head
      · apply SmallStep.if_true
        aesop
      · apply RTC.head
        · apply SmallStep.seq_step
          apply SmallStep.seq_skip
        · apply RTC.head
          · apply SmallStep.seq_step
            apply SmallStep.assign
          · apply RTC.head
            · apply SmallStep.seq_skip
            · apply RTC.head
              · apply SmallStep.whileDo
              · apply RTC.head
                · apply SmallStep.if_false
                  simp
                · simp
                  apply RTC.refl
```

## 9.6 小步语义的性质

我们可以证明配置 `(S, s)` 为终态当且仅当 `S = skip`。这确保我们没有遗漏推导规则，从而小步语义不会「卡住」：

```lean
theorem SmallStep_final (S s) :
    (¬ ∃T t, (S, s) ⇒ (T, t)) ↔ S = Stmt.skip :=
  by
    induction S with
    | skip =>
      simp
      intros T t hstep
      cases hstep
    | assign x a =>
      simp
      apply Exists.intro Stmt.skip
      apply Exists.intro (s[x ↦ a s])
      apply SmallStep.assign
    | seq S T ihS ihT =>
      simp
      cases Classical.em (S = Stmt.skip) with
      | inl h =>
        rw [h]
        apply Exists.intro T
        apply Exists.intro s
        apply SmallStep.seq_skip
      | inr h =>
        simp [h] at ihS
        cases ihS with
        | intro S' hS₀ =>
          cases hS₀ with
          | intro s' hS =>
            apply Exists.intro (S'; T)
            apply Exists.intro s'
            apply SmallStep.seq_step
            assumption
    | ifThenElse B S T ihS ihT =>
      simp
      cases Classical.em (B s) with
      | inl h =>
        apply Exists.intro S
        apply Exists.intro s
        apply SmallStep.if_true
        assumption
      | inr h =>
        apply Exists.intro T
        apply Exists.intro s
        apply SmallStep.if_false
        assumption
    | whileDo B S ih =>
      simp
      apply Exists.intro
        (Stmt.ifThenElse B (S; Stmt.whileDo B S)
           Stmt.skip)
      apply Exists.intro s
      apply SmallStep.whileDo
```

与大步语义类似，小步语义也是确定性的：

```lean
theorem SmallStep_deterministic {Ss Ll Rr}
      (hl : Ss ⇒ Ll) (hr : Ss ⇒ Rr) :
    Ll = Rr :=
  by
    induction hl generalizing Rr with
    | assign x a s =>
      cases hr with
      | assign _ _ _ => rfl
    | seq_step S S₁ T s s₁ hS₁ ih =>
      cases hr with
      | seq_step S S₂ _ _ s₂ hS₂ =>
        have hSs₁₂ :=
          ih hS₂
        aesop
      | seq_skip => cases hS₁
    | seq_skip T s =>
      cases hr with
      | seq_step _ S _ _ s' hskip => cases hskip
      | seq_skip                  => rfl
    | if_true B S T s hB =>
      cases hr with
      | if_true  => rfl
      | if_false => aesop
    | if_false B S T s hB =>
      cases hr with
      | if_true  => aesop
      | if_false => rfl
    | whileDo B S s =>
      cases hr with
      | whileDo => rfl
```

对小步语义，配置 `(S₀, s₀)` **终止**，若从它出发的所有执行都是有限的：`(S₀, s₀) ⇒ (S₁, s₁) ⇒ ⋯ ⇒ (Sₙ, sₙ)`。它**非终止**，若存在无限链 `(S₀, s₀) ⇒ (S₁, s₁) ⇒ ⋯`。编程语言整体终止，当且仅当其所有配置都终止。容易证明 WHILE 语言是非终止的：取 `S₀ := Stmt.whileDo (fun _ ↦ True) Stmt.skip`，对任意 `s₀` 有

```text
(S₀, s₀) ⇒ (S₀, s₀) ⇒ (S₀, s₀) ⇒ ⋯
```

我们也可以为小步语义定义反转规则，例如：

```lean
theorem SmallStep_skip {S s t} :
    ¬ ((Stmt.skip, s) ⇒ (S, t)) :=
  by
    intro h
    cases h

@[simp] theorem SmallStep_seq_Iff {S T s Ut} :
    (S; T, s) ⇒ Ut ↔
    (∃S' t, (S, s) ⇒ (S', t) ∧ Ut = (S'; T, t))
    ∨ (S = Stmt.skip ∧ Ut = (T, s)) :=
  by
    apply Iff.intro
    · intro hST
      cases hST with
      | seq_step _ S' _ _ s' hS =>
        apply Or.intro_left
        apply Exists.intro S'
        apply Exists.intro s'
        aesop
      | seq_skip =>
        apply Or.intro_right
        aesop
    · intro hor
      cases hor with
      | inl hex =>
        cases hex with
        | intro S' hex' =>
          cases hex' with
          | intro s' hand =>
            cases hand with
            | intro hS hUt =>
              rw [hUt]
              apply SmallStep.seq_step
              assumption
      | inr hand =>
        cases hand with
        | intro hS hUt =>
          rw [hS, hUt]
          apply SmallStep.seq_skip

@[simp] theorem SmallStep_if_Iff {B S T s Us} :
    (Stmt.ifThenElse B S T, s) ⇒ Us ↔
    (B s ∧ Us = (S, s)) ∨ (¬ B s ∧ Us = (T, s)) :=
  by
    apply Iff.intro
    · intro h
      cases h with
      | if_true _ _ _ _ hB  => aesop
      | if_false _ _ _ _ hB => aesop
    · intro hor
      cases hor with
      | inl hand =>
        cases hand with
        | intro hB hUs =>
          rw [hUs]
          apply SmallStep.if_true
          assumption
      | inr hand =>
        cases hand with
        | intro hB hUs =>
          rw [hUs]
          apply SmallStep.if_false
          assumption
```

### 大步语义与小步语义的等价性（选读）

一个更根本的结果是大步语义与小步语义之间的等价性：

```lean
(S, s) ⟹ t  ↔  (S, s) ⇒* (Stmt.skip, t)
```

其中 `⇒*` 表示小步谓词 `⇒` 的自反传递闭包。该定理的证明超出本课程范围。可参考 *Concrete Semantics: With Isabelle/HOL* 第 7 章，或本章演示文件。演示文件中的证明如下：

```lean
theorem RTC_SmallStep_seq {S T s u}
      (h : (S, s) ⇒* (Stmt.skip, u)) :
    (S; T, s) ⇒* (Stmt.skip; T, u) :=
  by
    apply RTC.lift (fun Ss ↦ (Prod.fst Ss; T, Prod.snd Ss)) _ h
    intro Ss Ss' hrtc
    cases Ss with
    | mk S s =>
      cases Ss' with
      | mk S' s' =>
        apply SmallStep.seq_step
        assumption

theorem RTC_SmallStep_of_BigStep {Ss t} (hS : Ss ⟹ t) :
    Ss ⇒* (Stmt.skip, t) :=
  by
    induction hS with
    | skip => exact RTC.refl
    | assign =>
      apply RTC.single
      apply SmallStep.assign
    | seq S T s t u hS hT ihS ihT =>
      apply RTC.trans
      · exact RTC_SmallStep_seq ihS
      · apply RTC.head
        apply SmallStep.seq_skip
        assumption
    | if_true B S T s t hB hst ih =>
      apply RTC.head
      · apply SmallStep.if_true
        assumption
      · assumption
    | if_false B S T s t hB hst ih =>
      apply RTC.head
      · apply SmallStep.if_false
        assumption
      · assumption
    | while_true B S s t u hB hS hw ihS ihw =>
      apply RTC.head
      · apply SmallStep.whileDo
      · apply RTC.head
        · apply SmallStep.if_true
          assumption
        · apply RTC.trans
          · exact RTC_SmallStep_seq ihS
          · apply RTC.head
            apply SmallStep.seq_skip
            assumption
    | while_false B S s hB =>
      apply RTC.tail
      apply RTC.single
      apply SmallStep.whileDo
      apply SmallStep.if_false
      assumption

theorem BigStep_of_SmallStep_of_BigStep {Ss₀ Ss₁ s₂}
      (h₁ : Ss₀ ⇒ Ss₁) :
    Ss₁ ⟹ s₂ → Ss₀ ⟹ s₂ :=
  by
    induction h₁ generalizing s₂ with
    | assign x a s               => simp
    | seq_step S S' T s s' hS ih => aesop
    | seq_skip T s               => simp
    | if_true B S T s hB         => aesop
    | if_false B S T s hB        => aesop
    | whileDo B S s              => aesop

theorem BigStep_of_RTC_SmallStep {Ss t} :
    Ss ⇒* (Stmt.skip, t) → Ss ⟹ t :=
  by
    intro hS
    induction hS using RTC.head_induction_on with
    | refl =>
      apply BigStep.skip
    | head Ss Ss' hST hsmallT ih =>
      cases Ss' with
      | mk S' s' =>
        apply BigStep_of_SmallStep_of_BigStep hST
        apply ih

theorem BigStep_Iff_RTC_SmallStep {Ss t} :
    Ss ⟹ t ↔ Ss ⇒* (Stmt.skip, t) :=
  Iff.intro RTC_SmallStep_of_BigStep BigStep_of_RTC_SmallStep
```

在[第 10 章](ch10_HoareLogic.md)（Hoare 逻辑）与[第 11 章](ch11_DenotationalSemantics.md)（指称语义）中，我们将继续用 Lean 规定编程语言语义并对程序进行推理。