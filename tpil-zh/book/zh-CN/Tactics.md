# 第 5 章：策略

> 本译文对应原书 [Tactics](https://lean-lang.org/theorem_proving_in_lean4/Tactics/)；英文 Verso 源：`book/TPiL/Tactics.lean`。

本章介绍构造证明的另一种途径：**策略**（tactics）。证明项是数学证明的表示；策略是命令或指令，说明如何构造这样的证明。非形式地，你可能这样开始数学证明：「要证正向，展开定义，应用上一引理，再化简。」这些是给读者找相关证明的指令；策略则是告诉 Lean 如何构造证明项的指令。它们自然支持增量式写证明：分解证明、逐步处理目标。

我们把由策略序列组成的证明称为**策略式证明**（tactic-style proof），以对比迄今见过的**项式证明**（term-style proof）。两种风格各有优劣：策略式证明可能更难读，因为读者须预测或猜测每条指令的结果；但也可能更短、更易写。此外，策略是通往 Lean 自动化的入口——自动过程本身也是策略。

## 5.1 进入策略模式

概念上，陈述定理或引入 **`have`** 会创建一个目标：构造具有期望类型的项。例如下列代码创建的目标是：在含常量 `p q : Prop`、`hp : p`、`hq : q` 的上下文中，构造类型为 `p ∧ q ∧ p` 的项：

```lean
theorem test (p q : Prop) (hp : p) (hq : q) : p ∧ q ∧ p := by
  --                                   PROOF_STATE: X      ^
  sorry
```

该目标可写成：

```
p : Prop
q : Prop
hp : p
hq : q
⊢ p ∧ q ∧ p
```

（`⊢` 表示当前须证的目标。）

事实上，若把上例中的 `sorry` 换成下划线 `_`，Lean 会报告未解决的目标正是上述目标。

通常用显式项满足此类目标。但 Lean 允许在期望项之处插入 **`by <tactics>`** 块，其中 `<tactics>` 为以分号或换行分隔的命令序列。可用该方式证上定理：

```lean
theorem test (p q : Prop) (hp : p) (hq : q) : p ∧ q ∧ p :=
  by apply And.intro
     exact hp
     apply And.intro
     exact hq
     exact hp
```

常把 **`by`** 放在上一行，写成：

```lean
theorem test (p q : Prop) (hp : p) (hq : q) : p ∧ q ∧ p := by
  apply And.intro
-- ^ PROOF_STATE: intro
  exact hp
  apply And.intro
  exact hq
  exact hp
```

**`apply`** 策略把表达式视为表示零个或多个参数的函数并应用。它将结论与当前目标中的表达式合一，并为剩余参数创建新目标（前提是后续参数不依赖它们）。上例中 `apply And.intro` 产生两个子目标：

```
case left
p : Prop
q : Prop
hp : p
hq : q
⊢ p

case right
p : Prop
q : Prop
hp : p
hq : q
⊢ q ∧ p
```

第一个目标用 `exact hp` 解决。**`exact`** 是 **`apply`** 的变体，表示给定表达式应恰好填满目标。在策略证明中宜用它，失败即表明出错；也比 `apply` 更稳健，因为 elaborator 会考虑目标期望的类型。此例中 `apply` 同样可行。

可用 **`#print`** 查看所得证明项：

```lean
theorem test (p q : Prop) (hp : p) (hq : q) : p ∧ q ∧ p := by
  apply And.intro
  exact hp
  apply And.intro
  exact hq
  exact hp
------
#print test
```

可增量编写策略脚本。在 VS Code 中，按 `Ctrl+Shift+Enter` 可打开消息窗口；光标在策略块内时，该窗口显示当前目标。若证明不完整，`by` 会标红波浪线，错误信息含剩余目标。

策略命令可接受复合表达式，不限于单个标识符。下面是更短版本：

```lean
theorem test (p q : Prop) (hp : p) (hq : q) : p ∧ q ∧ p := by
  apply And.intro hp
  exact And.intro hq hp
```

它产生完全相同的证明项：

```lean
theorem test (p q : Prop) (hp : p) (hq : q) : p ∧ q ∧ p := by
 apply And.intro hp
 exact And.intro hq hp
------
#print test
```

多个策略应用可用分号写在同一行：

```lean
theorem test (p q : Prop) (hp : p) (hq : q) : p ∧ q ∧ p := by
  apply And.intro hp; exact And.intro hq hp
```

可能产生多个子目标的策略常给它们打标签。例如 `apply And.intro` 把第一个子目标标为 `left`，第二个为 `right`。对 `apply`，标签从 `And.intro` 声明中的参数名推断。可用 **`case <tag> => <tactics>`** 组织策略。下面是本章第一个策略证明的结构化版本：

```lean
theorem test (p q : Prop) (hp : p) (hq : q) : p ∧ q ∧ p := by
  apply And.intro
  case left => exact hp
  case right =>
    apply And.intro
    case left => exact hq
    case right => exact hp
```

可用 **`case`** 先解 `right` 再解 `left`：

```lean
theorem test (p q : Prop) (hp : p) (hq : q) : p ∧ q ∧ p := by
  apply And.intro
  -- ^ PROOF_STATE: intro2
  case right =>
    apply And.intro
    case left => exact hq
  --          ^ PROOF_STATE: leftBranch
    case right => exact hp
  case left => exact hp
```

注意 Lean 在 **`case`** 块内隐藏其他目标。`case left =>` 之后，证明状态为：

```
p : Prop
q : Prop
hp : p
hq : q
⊢ q
```

我们说 **`case`** 在「聚焦」所选目标。此外，若 **`case`** 块结束时所选目标未完全解决，Lean 报错。

对简单子目标，可能不必用标签选子目标，但仍可结构化证明。Lean 还提供「bullet」记法 **`. <tactics>`**（或 **`· <tactics>`**）：

```lean
theorem test (p q : Prop) (hp : p) (hq : q) : p ∧ q ∧ p := by
  apply And.intro
  . exact hp
  . apply And.intro
    . exact hq
    . exact hp
```

## 5.2 基本策略

除 **`apply`**、**`exact`** 外，**`intro`** 也很有用，它引入假设。下面是上一章用项式证明的命题逻辑恒等式，现用策略证明：

```lean
example (p q r : Prop) : p ∧ (q ∨ r) ↔ (p ∧ q) ∨ (p ∧ r) := by
  apply Iff.intro
  . intro h
    apply Or.elim (And.right h)
    . intro hq
      apply Or.inl
      apply And.intro
      . exact And.left h
      . exact hq
    . intro hr
      apply Or.inr
      apply And.intro
      . exact And.left h
      . exact hr
  . intro h
    apply Or.elim h
    . intro hpq
      apply And.intro
      . exact And.left hpq
      . apply Or.inl
        exact And.right hpq
    . intro hpr
      apply And.intro
      . exact And.left hpr
      . apply Or.inr
        exact And.right hpr
```

**`intro`** 更一般地可引入任意类型的变量：

```lean
example (α : Type) : α → α := by
  intro a
  exact a

example (α : Type) : ∀ x : α, x = x := by
  intro x
  exact Eq.refl x
```

可一次引入多个变量：

```lean
example : ∀ a b c : Nat, a = b → a = c → c = b := by
  intro a b c h₁ h₂
  exact Eq.trans (Eq.symm h₂) h₁
```

（环境中有 `variable {α : Sort u} {p : Prop} {e : p}`。）

**`apply`** 交互式构造函数应用；**`intro`** 交互式构造函数抽象（即 `fun x => e` 形式的项）。与 lambda 记法一样，**`intro`** 允许隐式 **`match`**：

```lean
example (p q : α → Prop) : (∃ x, p x ∧ q x) → ∃ x, q x ∧ p x := by
  intro ⟨w, hpw, hqw⟩
  exact ⟨w, hqw, hpw⟩
```

也可像在 **`match`** 表达式中那样提供多个分支：

```lean
example (p q : α → Prop) : (∃ x, p x ∨ q x) → ∃ x, q x ∨ p x := by
  intro
  | ⟨w, Or.inl h⟩ => exact ⟨w, Or.inr h⟩
  | ⟨w, Or.inr h⟩ => exact ⟨w, Or.inl h⟩
```

**`intros`** 可无参数使用，此时它自选名字并尽可能多引入变量——稍后会有例子。

**`assumption`** 在当前目标的假设中查找与结论匹配的项并应用：

```lean
variable (x y z w : Nat)

example (h₁ : x = y) (h₂ : y = z) (h₃ : z = w) : x = w := by
  apply Eq.trans h₁
  apply Eq.trans h₂
  assumption   -- applied h₃
```

必要时会在结论中合一元变量：

```lean
variable (x y z w : Nat)

example (h₁ : x = y) (h₂ : y = z) (h₃ : z = w) : x = w := by
  apply Eq.trans
  assumption      -- solves x = ?b with h₁
  apply Eq.trans
  assumption      -- solves y = ?h₂.b with h₂
  assumption      -- solves z = w with h₃
```

下列例子用 **`intros`** 自动引入三个变量与两个假设：

```lean
example : ∀ a b c : Nat, a = b → a = c → c = b := by
  intros
  apply Eq.trans
  apply Eq.symm
  assumption
  assumption
```

注意 Lean 自动生成的名字默认不可访问，目的是让策略证明不依赖自动名、更稳健。可用组合子 **`unhygienic`** 关闭该限制：

```lean
example : ∀ a b c : Nat, a = b → a = c → c = b := by unhygienic
  intros
  apply Eq.trans
  apply Eq.symm
  exact a_2
  exact a_1
```

也可用 **`rename_i`** 重命名上下文中最近不可访问的名字。下例 `rename_i h1 _ h2` 重命名最后三个假设中的两个：

```lean
example : ∀ a b c d : Nat, a = b → a = d → a = c → c = b := by
  intros
  rename_i h1 _ h2
  apply Eq.trans
  apply Eq.symm
  exact h2
  exact h1
```

**`rfl`** 解决自反关系作用于定义相等参数的目标。相等是自反的：

```lean
example (y : Nat) : (fun x : Nat => 0) y = 0 := by
  rfl
```

**`repeat`** 组合子可对策略重复应用：

```lean
example : ∀ a b c : Nat, a = b → a = c → c = b := by
  intros
  apply Eq.trans
  apply Eq.symm
  repeat assumption
```

有时有用的是 **`revert`**，某种意义上是 **`intro`** 的逆：

```lean
example (x : Nat) : x = x := by
  revert x
  -- ^ PROOF_STATE: afterRevert
  intro y
  -- ^ PROOF_STATE: afterRevertIntro
  rfl
```

`revert x` 之后：

```
⊢ ∀ (x : Nat), x = x
```

`intro y` 之后：

```
y : Nat
⊢ y = y
```

把假设移入目标得到蕴含：

```lean
example (x y : Nat) (h : x = y) : y = x := by
  revert h
  -- ^ PROOF_STATE: afterRevertH
  intro h₁
  -- ^ PROOF_STATE: afterRevertHIntro
  -- goal is x y : Nat, h₁ : x = y ⊢ y = x
  apply Eq.symm
  assumption
```

`revert h` 之后：

```
x : Nat
y : Nat
⊢ x = y → y = x
```

`intro h₁` 之后：

```
x : Nat
y : Nat
h₁ : x = y
⊢ y = x
```

**`revert`** 更聪明：不仅 revert 上下文元素，还会 revert 依赖它的后续元素。例如 revert `x` 时会把 `h` 一并带上：

```lean
example (x y : Nat) (h : x = y) : y = x := by
  revert x
  -- ^ PROOF_STATE: afterRevertXH
  intros
  apply Eq.symm
  assumption
```

`revert x` 之后，目标为：

```
y : Nat
⊢ ∀ (x : Nat), x = y → y = x
```

也可一次 revert 多个上下文元素：

```lean
example (x y : Nat) (h : x = y) : y = x := by
  revert x y
  -- ^ PROOF_STATE: revertXY
  intros
  apply Eq.symm
  assumption
```

`revert x y` 之后：

```
⊢ ∀ (x y : Nat), x = y → y = x
```

只能 **`revert`** 局部上下文元素（局部变量或假设）。但可用 **`generalize`** 把目标中任意表达式换成新变量：

```lean
example : 3 = 3 := by
  generalize 3 = x
  -- ^ PROOF_STATE: afterGen
  revert x
  -- ^ PROOF_STATE: afterRevert
  intro y
  -- ^ PROOF_STATE: afterIntro
  rfl
```

`generalize` 之后，目标为：

```
x : Nat
⊢ x = x
```

助记：通过把 `3` 设为任意变量 `x` 来「泛化」目标。注意：并非每次泛化都保持目标可证。这里 `generalize` 把可用 `rfl` 证的目标换成不可证的：

```lean
example : 2 + 3 = 5 := by
  generalize 3 = x
  -- ^ PROOF_STATE: afterGen
  sorry
```

此例中 **`sorry`** 策略对应 `sorry` 证明项：关闭当前目标并给出 usual 警告。为保持前一目标的有效性，**`generalize`** 允许记录 `3` 已被 `x` 替换的事实——提供标签即可，**`generalize`** 用它把赋值存入局部上下文：

```lean
example : 2 + 3 = 5 := by
  generalize h : 3 = x
  -- ^ PROOF_STATE: afterGen
  rw [← h]
```

`generalize h : 3 = x` 之后，`h` 是 `3 = x` 的证明：

```
x : Nat
h : 3 = x
⊢ 2 + x = 5
```

重写策略 **`rw`** 用 `h` 把 `x` 再换回 `3`。下文详述 **`rw`**。

## 5.3 更多策略

另一些策略有助于构造与解构命题和数据。对形如 `p ∨ q` 的目标，可用 **`apply Or.inl`**、**`apply Or.inr`**。反之，**`cases`** 可分解析取：

```lean
example (p q : Prop) : p ∨ q → q ∨ p := by
  intro h
  cases h with
  | inl hp => apply Or.inr; exact hp
  | inr hq => apply Or.inl; exact hq
```

语法与 **`match`** 表达式类似。新子目标可任意顺序解决：

```lean
example (p q : Prop) : p ∨ q → q ∨ p := by
  intro h
  cases h with
  | inr hq => apply Or.inl; exact hq
  | inl hp => apply Or.inr; exact hp
```

也可用（非结构化）**`cases`**，不用 `with`，每个分支跟一个策略：

```lean
example (p q : Prop) : p ∨ q → q ∨ p := by
  intro h
  cases h
  apply Or.inr
  assumption
  apply Or.inl
  assumption
```

（非结构化）**`cases`** 在可用同一策略关闭多个子目标时特别有用：

```lean
example (p : Prop) : p ∨ p → p := by
  intro h
  cases h
  repeat assumption
```

也可用组合子 **`tac1 <;> tac2`**，对 **`tac1`** 产生的每个子目标应用 **`tac2`**：

```lean
example (p : Prop) : p ∨ p → p := by
  intro h
  cases h <;> assumption
```

可把非结构化 **`cases`** 与 **`case`**、**`.`** 记法结合：

```lean
example (p q : Prop) : p ∨ q → q ∨ p := by
  intro h
  cases h
  . apply Or.inr
    assumption
  . apply Or.inl
    assumption

example (p q : Prop) : p ∨ q → q ∨ p := by
  intro h
  cases h
  case inr h =>
    apply Or.inl
    assumption
  case inl h =>
    apply Or.inr
    assumption

example (p q : Prop) : p ∨ q → q ∨ p := by
  intro h
  cases h
  case inr h =>
    apply Or.inl
    assumption
  . apply Or.inr
    assumption
```

**`cases`** 也可分解合取：

```lean
example (p q : Prop) : p ∧ q → q ∧ p := by
  intro h
  cases h with
  | intro hp hq => constructor; exact hq; exact hp
  --             ^ PROOF_STATE: afterIntroCase
```

此例中 **`cases`** 应用后只有一个目标，`h : p ∧ q` 被替换为假设 `hp : p` 与 `hq : q`：

```
case intro
p : Prop
q : Prop
hp : p
hq : q
⊢ q ∧ p
```

**`constructor`** 应用合取的唯一构造子 `And.intro`。

借助这些策略，上一节例子可重写为：

```lean
example (p q r : Prop) : p ∧ (q ∨ r) ↔ (p ∧ q) ∨ (p ∧ r) := by
  apply Iff.intro
  . intro h
    cases h with
    | intro hp hqr =>
      cases hqr
      . apply Or.inl; constructor <;> assumption
      . apply Or.inr; constructor <;> assumption
  . intro h
    cases h with
    | inl hpq =>
      cases hpq with
      | intro hp hq =>
        constructor; exact hp; apply Or.inl; exact hq
    | inr hpr =>
      cases hpr with
      | intro hp hr =>
        constructor; exact hp; apply Or.inr; exact hr
```

第 7 章「归纳类型」将看到这些策略相当一般：**`cases`** 可分解任何归纳定义类型的元素；**`constructor`** 总是应用归纳类型的第一个适用构造子。例如对存在量词可用 **`cases`** 与 **`constructor`**：

```lean
example (p q : Nat → Prop) : (∃ x, p x) → ∃ x, p x ∨ q x := by
  intro h
  cases h with
  | intro x px => constructor; apply Or.inl; exact px
```

此例 **`constructor`** 把存在断言的第一分量（`x` 的值）留隐式，用元变量表示，稍后实例化。上例中 **`exact px`** 确定元变量，因 `px : p x`。若要显式指定见证，可用 **`exists`** 策略：

```lean
example (p q : Nat → Prop) : (∃ x, p x) → ∃ x, p x ∨ q x := by
  intro h
  cases h with
  | intro x px => exists x; apply Or.inl; exact px
```

另一例：

```lean
example (p q : Nat → Prop) : (∃ x, p x ∧ q x) → ∃ x, q x ∧ p x := by
  intro h
  cases h with
  | intro x hpq =>
    cases hpq with
    | intro hp hq =>
      exists x
```

这些策略对数据与命题同样适用。下例用它们定义交换积类型与和类型分量的函数：

```lean
def swap_pair : α × β → β × α := by
  intro p
  cases p
  constructor <;> assumption

def swap_sum : Sum α β → Sum β α := by
  intro p
  cases p
  . apply Sum.inr; assumption
  . apply Sum.inl; assumption
```

除所选变量名外，定义与合取、析取对应命题的证明相同。**`cases`** 也可对自然数分情形：

```lean
open Nat
example (P : Nat → Prop)
    (h₀ : P 0) (h₁ : ∀ n, P (succ n))
    (m : Nat) : P m := by
  cases m with
  | zero    => exact h₀
  | succ m' => exact h₁ m'
```

**`cases`** 及其伙伴 **`induction`** 在「归纳类型的策略」一节详述。

**`contradiction`** 在当前目标的假设中搜索矛盾：

```lean
example (p q : Prop) : p ∧ ¬ p → q := by
  intro h
  cases h
  contradiction
```

也可在策略块中使用 **`match`**：

```lean
example (p q r : Prop) : p ∧ (q ∨ r) ↔ (p ∧ q) ∨ (p ∧ r) := by
  apply Iff.intro
  . intro h
    match h with
    | ⟨_, Or.inl _⟩ =>
      apply Or.inl; constructor <;> assumption
    | ⟨_, Or.inr _⟩ =>
      apply Or.inr; constructor <;> assumption
  . intro h
    match h with
    | Or.inl ⟨hp, hq⟩ =>
      constructor; exact hp; apply Or.inl; exact hq
    | Or.inr ⟨hp, hr⟩ =>
      constructor; exact hp; apply Or.inr; exact hr
```

可把 **`intro`** 与 **`match`**「结合」，上例可写成：

```lean
example (p q r : Prop) : p ∧ (q ∨ r) ↔ (p ∧ q) ∨ (p ∧ r) := by
  apply Iff.intro
  . intro
    | ⟨hp, Or.inl hq⟩ =>
      apply Or.inl; constructor <;> assumption
    | ⟨hp, Or.inr hr⟩ =>
      apply Or.inr; constructor <;> assumption
  . intro
    | Or.inl ⟨hp, hq⟩ =>
      constructor; assumption; apply Or.inl; assumption
    | Or.inr ⟨hp, hr⟩ =>
      constructor; assumption; apply Or.inr; assumption
```

## 5.4 组织策略式证明

策略常是高效构造证明的方式，但长指令序列可能掩盖论证结构。本节介绍为策略式证明提供结构、使其更可读、更稳健的手段。

Lean 证明语法的一个优点是项式与策略式可混用、自由切换。例如 **`apply`**、**`exact`** 期望任意项，可用 **`have`**、**`show`** 等书写；写任意 Lean 项时，也可插入 **`by`** 块进入策略模式。下面是一个略玩具化的例子：

```lean
example (p q r : Prop) : p ∧ (q ∨ r) → (p ∧ q) ∨ (p ∧ r) := by
  intro h
  exact
    have hp : p := h.left
    have hqr : q ∨ r := h.right
    show (p ∧ q) ∨ (p ∧ r) by
      cases hqr with
      | inl hq => exact Or.inl ⟨hp, hq⟩
      | inr hr => exact Or.inr ⟨hp, hr⟩
```

更自然的例子：

```lean
example (p q r : Prop) : p ∧ (q ∨ r) ↔ (p ∧ q) ∨ (p ∧ r) := by
  apply Iff.intro
  . intro h
    cases h.right with
    | inl hq => exact Or.inl ⟨h.left, hq⟩
    | inr hr => exact Or.inr ⟨h.left, hr⟩
  . intro h
    cases h with
    | inl hpq => exact ⟨hpq.left, Or.inl hpq.right⟩
    | inr hpr => exact ⟨hpr.left, Or.inr hpr.right⟩
```

事实上有 **`show`** 策略，类似证明项中的 **`show`** 表达式：声明即将解决的目标类型，同时留在策略模式。

```lean
example (p q r : Prop) : p ∧ (q ∨ r) ↔ (p ∧ q) ∨ (p ∧ r) := by
  apply Iff.intro
  . intro h
    cases h.right with
    | inl hq =>
      show (p ∧ q) ∨ (p ∧ r)
      exact Or.inl ⟨h.left, hq⟩
    | inr hr =>
      show (p ∧ q) ∨ (p ∧ r)
      exact Or.inr ⟨h.left, hr⟩
  . intro h
    cases h with
    | inl hpq =>
      show p ∧ (q ∨ r)
      exact ⟨hpq.left, Or.inl hpq.right⟩
    | inr hpr =>
      show p ∧ (q ∨ r)
      exact ⟨hpr.left, Or.inr hpr.right⟩
```

**`show`** 策略还可把目标重写为定义等价的式子：

```lean
example (n : Nat) : n + 1 = Nat.succ n := by
  show Nat.succ n = Nat.succ n
  rfl
```

还有 **`have`** 策略，引入新子目标，与写证明项时类似：

```lean
example (p q r : Prop) : p ∧ (q ∨ r) → (p ∧ q) ∨ (p ∧ r) := by
  intro ⟨hp, hqr⟩
  show (p ∧ q) ∨ (p ∧ r)
  cases hqr with
  | inl hq =>
    have hpq : p ∧ q := And.intro hp hq
    apply Or.inl
    exact hpq
  | inr hr =>
    have hpr : p ∧ r := And.intro hp hr
    apply Or.inr
    exact hpr
```

与证明项一样，**`have`** 策略可省略标签，默认用 **`this`**：

```lean
example (p q r : Prop) : p ∧ (q ∨ r) → (p ∧ q) ∨ (p ∧ r) := by
  intro ⟨hp, hqr⟩
  show (p ∧ q) ∨ (p ∧ r)
  cases hqr with
  | inl hq =>
    have : p ∧ q := And.intro hp hq
    apply Or.inl
    exact this
  | inr hr =>
    have : p ∧ r := And.intro hp hr
    apply Or.inr
    exact this
```

**`have`** 策略的类型可省略，可写 `have hp := h.left`、`have hqr := h.right`。甚至类型与标签都可省略，新事实以 **`this`** 引入：

```lean
example (p q r : Prop) : p ∧ (q ∨ r) → (p ∧ q) ∨ (p ∧ r) := by
  intro ⟨hp, hqr⟩
  cases hqr with
  | inl hq =>
    have := And.intro hp hq
    apply Or.inl; exact this
  | inr hr =>
    have := And.intro hp hr
    apply Or.inr; exact this
```

Lean 还有 **`let`** 策略，类似 **`have`**，但用于局部定义而非辅助事实——是证明项中 **`let`** 的策略版：

```lean
example : ∃ x, x + 2 = 8 := by
  let a : Nat := 3 * 2
  exists a
```

与 **`have`** 一样，可写 `let a := 3 * 2` 省略类型。**`let`** 与 **`have`** 的区别：**`let`** 在上下文中引入局部定义，证明中可展开该定义。

我们用 **`.`** 创建嵌套策略块。嵌套块中 Lean 聚焦第一个目标，块末若未完全解决则报错——有助于标明策略引入的多个子目标的分别证明。**`.`** 对空白敏感，靠缩进检测块结束。也可用花括号与分号定义策略块：

```lean
example (p q r : Prop) : p ∧ (q ∨ r) ↔ (p ∧ q) ∨ (p ∧ r) := by
  apply Iff.intro
  { intro h;
    cases h.right;
    { show (p ∧ q) ∨ (p ∧ r);
      exact Or.inl ⟨h.left, ‹q›⟩ }
    { show (p ∧ q) ∨ (p ∧ r);
      exact Or.inr ⟨h.left, ‹r›⟩ } }
  { intro h;
    cases h;
    { show p ∧ (q ∨ r);
      rename_i hpq;
      exact ⟨hpq.left, Or.inl hpq.right⟩ }
    { show p ∧ (q ∨ r);
      rename_i hpr;
      exact ⟨hpr.left, Or.inr hpr.right⟩ } }
```

用缩进组织证明很有用：每当策略留下多个子目标，用块包裹并缩进分隔。若把定理 `foo` 用于单一目标产生四个子目标，证明宜形如：

```
  apply foo
  . <proof of first goal>
  . <proof of second goal>
  . <proof of third goal>
  . <proof of final goal>
```

或：

```
  apply foo
  case <tag of first goal>  => <proof of first goal>
  case <tag of second goal> => <proof of second goal>
  case <tag of third goal>  => <proof of third goal>
  case <tag of final goal>  => <proof of final goal>
```

或：

```
  apply foo
  { <proof of first goal>  }
  { <proof of second goal> }
  { <proof of third goal>  }
  { <proof of final goal>  }
```

## 5.5 策略组合子

**策略组合子**（tactic combinators）是从旧策略构造新策略的运算。**`by`** 块已隐含顺序组合：

```lean
example (p q : Prop) (hp : p) : p ∨ q :=
  by apply Or.inl; assumption
```

这里 `apply Or.inl; assumption` 在功能上等价于先 `apply Or.inl` 再 `assumption` 的单一策略。

在 **`t₁ <;> t₂`** 中，**`<;>`** 提供顺序的**并行**版本：先对当前目标应用 `t₁`，再对**所有**所得子目标应用 `t₂`：

```lean
example (p q : Prop) (hp : p) (hq : q) : p ∧ q :=
  by constructor <;> assumption
```

当所得目标能以统一方式完成，或至少能统一推进时，这尤其有用。

**`first | t₁ | t₂ | ... | tₙ`** 依次尝试各 `tᵢ` 直至成功，否则失败：

```lean
example (p q : Prop) (hp : p) : p ∨ q := by
  first | apply Or.inl; assumption | apply Or.inr; assumption

example (p q : Prop) (hq : q) : p ∨ q := by
  first | apply Or.inl; assumption | apply Or.inr; assumption
```

第一例左分支成功，第二例右分支成功。下面三例同一复合策略均成功：

```lean
example (p q r : Prop) (hp : p) : p ∨ q ∨ r := by
  repeat (first | apply Or.inl; assumption | apply Or.inr | assumption)

example (p q r : Prop) (hq : q) : p ∨ q ∨ r := by
  repeat (first | apply Or.inl; assumption | apply Or.inr | assumption)

example (p q r : Prop) (hr : r) : p ∨ q ∨ r := by
  repeat (first | apply Or.inl; assumption | apply Or.inr | assumption)
```

该策略先尝试用 assumption 立即解左析取支；失败则聚焦右支；再不行则调用 assumption。

策略会失败——正是失败状态使 **`first`** 回溯试下一策略。**`try t`** 构造总成功的策略（可能平凡地）：执行 `t` 并报告成功，即使 `t` 失败。等价于 **`first | t | skip`**，`skip` 什么都不做且成功。下例第二个 `constructor` 在右合取支 `q ∧ r` 上成功（析取与合取右结合），在第一个上失败；**`try`** 保证顺序组合成功：

```lean
example (p q r : Prop) (hp : p) (hq : q) (hr : r) : p ∧ q ∧ r := by
  constructor <;> (try constructor) <;> assumption
```

注意：**`repeat (try t)`** 会无限循环，因内层策略从不失败。

证明中常有多个未完成目标。并行顺序是一种让单一策略作用于多目标的方式，还有其他方式。**`all_goals t`** 对所有开放目标应用 `t`：

```lean
example (p q r : Prop) (hp : p) (hq : q) (hr : r) : p ∧ q ∧ r := by
  constructor
  all_goals (try constructor)
  all_goals assumption
```

此例 **`any_goals`** 更稳健：类似 **`all_goals`**，但只要参数在至少一个目标上成功即成功：

```lean
example (p q r : Prop) (hp : p) (hq : q) (hr : r) : p ∧ q ∧ r := by
  constructor
  any_goals constructor
  any_goals assumption
```

下面 **`by`** 块中第一个策略反复拆分合取：

```lean
example (p q r : Prop) (hp : p) (hq : q) (hr : r) :
      p ∧ ((p ∧ q) ∧ r) ∧ (q ∧ r ∧ p) := by
  repeat (any_goals constructor)
  all_goals assumption
```

事实上可压成一行：

```lean
example (p q r : Prop) (hp : p) (hq : q) (hr : r) :
      p ∧ ((p ∧ q) ∧ r) ∧ (q ∧ r ∧ p) := by
  repeat (any_goals (first | constructor | assumption))
```

**`focus t`** 确保 `t` 只影响当前目标，暂时隐藏其他。故若 `t`  ordinarily 只影响当前目标，则 **`focus (all_goals t)`** 与 `t` 效果相同。

## 5.6 重写

**`rw`** 与 **`simp`** 在第 4 章「计算式证明」中已简述；本节与下一节详述。

（环境中有 `variable (x y : α) (h : x = y)`、`theorem add_comm : ∀ (x y : Nat), x + y = y + x := by omega`。）

**`rw`** 对目标与假设做替换的基本机制，是处理相等的便利高效方式。最基本形式为 **`rw [t]`**，其中 `t` 的类型断言相等。`t` 可以是上下文中的假设 `h : x = y`；可以是一般引理如 `add_comm : ∀ x y, x + y = y + x`，重写策略会找合适的 `x`、`y` 实例化；也可以是断言具体或一般等式的复合项。下例用假设重写目标：

```lean
variable (k : Nat) (f : Nat → Nat)

example (h₁ : f 0 = 0) (h₂ : k = 0) : f k = 0 := by
  rw [h₂] -- replace k with 0
  rw [h₁] -- replace f 0 with 0
```

（环境中有 `variable (t : α)`。）

上例第一次 `rw` 在目标 `f k = 0` 中把 `k` 换成 `0`；第二次把 `f 0` 换成 `0`。策略自动关闭形如 `t = t` 的目标。下面用复合表达式重写：

```lean
example (x y : Nat) (p : Nat → Prop) (q : Prop) (h : q → x = y)
        (h' : p y) (hq : q) : p x := by
  rw [h hq]; assumption
```

这里 `h hq` 建立等式 `x = y`。

多次重写可合并为 **`rw [t_1, ..., t_n]`**，即 **`rw [t_1]; ...; rw [t_n]`** 的简写：

```lean
variable (k : Nat) (f : Nat → Nat)

example (h₁ : f 0 = 0) (h₂ : k = 0) : f k = 0 := by
  rw [h₂, h₁]
```

默认 **`rw`** 正向使用等式：左端与表达式匹配，替换为右端。记法 **`←t`** 指示反向使用：

```lean
variable (a b : Nat) (f : Nat → Nat)

example (h₁ : a = b) (h₂ : f a = 0) : f b = 0 := by
  rw [←h₁, h₂]
```

此例 `←h₁` 指示把 `b` 换成 `a`。编辑器中反向箭头输入 `\l`，也可用 ASCII `<-`。

有时恒等式左端在模式中匹配多个子项，**`rw`** 遍历项时选第一个匹配。若非所需，可用额外参数指定子项：

```lean
example (a b c : Nat) : a + b + c = a + c + b := by
  rw [Nat.add_assoc, Nat.add_comm b, ← Nat.add_assoc]

example (a b c : Nat) : a + b + c = a + c + b := by
  rw [Nat.add_assoc, Nat.add_assoc, Nat.add_comm b]

example (a b c : Nat) : a + b + c = a + c + b := by
  rw [Nat.add_assoc, Nat.add_assoc, Nat.add_comm _ b]
```

第一例：第一步把 `a + b + c` 重写为 `a + (b + c)`；下一步对 `b + c` 用交换律——不指定参数则会把 `a + (b + c)` 重写为 `(b + c) + a`；最后一步反向用结合律，把 `a + (c + b)` 重写为 `a + c + b`。后两例先在两侧用结合律把括号移到右边，再交换 `b`、`c`。最后一例通过 `Nat.add_comm` 的第二个参数指定在右端重写。

默认 **`rw`** 只影响目标。记法 **`rw [t] at h`** 对假设 `h` 应用重写：

```lean
example (f : Nat → Nat) (a : Nat) (h : a + 0 = 0) : f a = f 0 := by
  rw [Nat.add_zero] at h
  rw [h]
```

第一步 `rw [Nat.add_zero] at h` 把假设 `a + 0 = 0` 重写为 `a = 0`；再用新假设 `a = 0` 把目标重写为 `f 0 = f 0`。

**`rw`** 不限于命题。下例用 **`rw [h] at t`** 把假设 `t : Tuple α n` 重写为 `t : Tuple α 0`：

```lean
def Tuple (α : Type) (n : Nat) :=
  { as : List α // as.length = n }

example (n : Nat) (h : n = 0) (t : Tuple α n) : Tuple α 0 := by
  rw [h] at t
  exact t
```

## 5.7 使用简化器

**`rw`** 是操纵目标的手术刀；**简化器**（simplifier）提供更强大的自动化。Lean 库中许多恒等式标有 **`[simp]`** 属性，**`simp`** 策略用它们迭代重写表达式中的子项。

```lean
example (x y z : Nat) : (x + 0) * (0 + y * 1 + z * 0) = x * y := by
  simp

example (x y z : Nat) (p : Nat → Prop) (h : p (x * y))
        : p ((x + 0) * (0 + y * 1 + z * 0)) := by
  simp; assumption
```

第一例，目标左端用涉及 0、1 的 usual 恒等式化简，目标化为 `x * y = x * y`，`simp` 用自反性结束。第二例 `simp` 把目标化为 `p (x * y)`，假设 `h` 完成。列表示例：

```lean
open List

example (xs : List Nat)
        : reverse (xs ++ [1, 2, 3]) = [3, 2, 1] ++ reverse xs := by
  simp

example (xs ys : List α)
        : length (reverse (xs ++ ys)) = length xs + length ys := by
  simp [Nat.add_comm]
```

与 **`rw`** 一样，可用关键字 **`at`** 化简假设：

```lean
example (x y z : Nat) (p : Nat → Prop)
        (h : p ((x + 0) * (0 + y * 1 + z * 0))) : p (x * y) := by
  simp at h; assumption
```

还可用通配符 `*` 化简所有假设与目标：

```lean
attribute [local simp] Nat.mul_comm Nat.mul_assoc Nat.mul_left_comm
attribute [local simp] Nat.add_assoc Nat.add_comm Nat.add_left_comm

example (w x y z : Nat) (p : Nat → Prop)
        (h : p (x * y + z * w * x)) : p (x * w * z + y * x) := by
  simp at *; assumption

example (x y z : Nat) (p : Nat → Prop)
        (h₁ : p (1 * x + y)) (h₂ : p (x * z * 1))
        : p (y + 0 + x) ∧ p (z * x) := by
  simp at * <;> constructor <;> assumption
```

（环境中有 `variable (x y z : Nat)`。）

对交换、结合运算（如自然数乘法），简化器用这两条事实重写表达式，还有**左交换律**（left commutativity）：`x * (y * z) = y * (x * z)`。**`local`** 修饰符告诉简化器在当前文件（或 section、命名空间）使用这些规则。交换与左交换似乎会导致重复应用而循环；但简化器检测置换参数的恒等式，使用**有序重写**（ordered rewriting）：系统维护项的内部序，仅当降低序时才应用恒等式。对上述三恒等式，效果是表达式中括号都右结合，项按规范（略任意）序排列；结合、交换等价的两个表达式会重写到同一规范形。

```lean
attribute [local simp] Nat.mul_comm Nat.mul_assoc Nat.mul_left_comm
attribute [local simp] Nat.add_assoc Nat.add_comm Nat.add_left_comm
------
example (w x y z : Nat) (p : Nat → Prop)
        : x * y + z * w * x = x * w * z + y * x := by
  simp

example (w x y z : Nat) (p : Nat → Prop)
        (h : p (x * y + z * w * x)) : p (x * w * z + y * x) := by
  simp; simp at h; assumption
```

与 **`rw`** 一样，可向 **`simp`** 提供事实列表：一般引理、局部假设、要展开的定义、复合表达式。**`simp`** 也识别 **`←t`** 语法。无论如何，附加规则加入用于化简的恒等式集合。

```lean
def f (m n : Nat) : Nat :=
  m + n + m

example {m n : Nat} (h : n = 1) (h' : 0 = m) : (f m n) = n := by
  simp [h, ←h', f]
```

常见习惯是用局部假设化简目标：

```lean
variable (k : Nat) (f : Nat → Nat)

example (h₁ : f 0 = 0) (h₂ : k = 0) : f k = 0 := by
  simp [h₁, h₂]
```

要用局部上下文中所有假设化简，可用通配符 **`*`**：

```lean
variable (k : Nat) (f : Nat → Nat)

example (h₁ : f 0 = 0) (h₂ : k = 0) : f k = 0 := by
  simp [*]
```

另一例：

```lean
example (u w x y z : Nat) (h₁ : x = y + z) (h₂ : w = u + x)
        : w = z + y + u := by
  simp [*, Nat.add_comm]
```

简化器也做命题重写。例如用假设 `p`，把 `p ∧ q` 重写为 `q`，`p ∨ q` 重写为 `True` 并平凡证明。迭代此类重写产生非平凡命题推理。

```lean
example (p q : Prop) (hp : p) : p ∧ q ↔ q := by
  simp [*]

example (p q : Prop) (hp : p) : p ∨ q := by
  simp [*]

example (p q r : Prop) (hp : p) (hq : q) : p ∧ (q ∨ r) := by
  simp [*]
```

下例化简所有假设，再用它们证目标：

```lean
set_option linter.unusedVariables false
------
example (u w x x' y y' z : Nat) (p : Nat → Prop)
        (h₁ : x + 0 = x') (h₂ : y + 0 = y')
        : x + y + 0 = x' + y' := by
  simp at *
  simp [*]
```

简化器特别有用之处在于：随库发展能力可增长。例如定义列表操作，把输入与其反转拼接以「对称化」：

```lean
def mk_symm (xs : List α) :=
  xs ++ xs.reverse
```

则对任意列表 `xs`，`(mk_symm xs).reverse` 等于 `mk_symm xs`，展开定义易证：

```lean
def mk_symm (xs : List α) :=
 xs ++ xs.reverse
------
theorem reverse_mk_symm (xs : List α)
        : (mk_symm xs).reverse = mk_symm xs := by
  simp [mk_symm]
```

可用该定理证新结果：

```lean
def mk_symm (xs : List α) :=
 xs ++ xs.reverse
theorem reverse_mk_symm (xs : List α)
       : (mk_symm xs).reverse = mk_symm xs := by
 simp [mk_symm]
------
example (xs ys : List Nat)
        : (xs ++ mk_symm ys).reverse = mk_symm ys ++ xs.reverse := by
  simp [reverse_mk_symm]

example (xs ys : List Nat) (p : List Nat → Prop)
        (h : p (xs ++ mk_symm ys).reverse)
        : p (mk_symm ys ++ xs.reverse) := by
  simp [reverse_mk_symm] at h; assumption
```

但一般应使用 `reverse_mk_symm`，最好用户不必显式调用。可在定义定理时标为简化规则：

```lean
def mk_symm (xs : List α) :=
 xs ++ xs.reverse
------
@[simp] theorem reverse_mk_symm (xs : List α)
        : (mk_symm xs).reverse = mk_symm xs := by
  simp [mk_symm]

example (xs ys : List Nat)
        : (xs ++ mk_symm ys).reverse = mk_symm ys ++ xs.reverse := by
  simp

example (xs ys : List Nat) (p : List Nat → Prop)
        (h : p (xs ++ mk_symm ys).reverse)
        : p (mk_symm ys ++ xs.reverse) := by
  simp at h; assumption
```

记号 **`@[simp]`** 声明 `reverse_mk_symm` 具有 **`[simp]`** 属性，可更明确地写出：

```lean
def mk_symm (xs : List α) :=
 xs ++ xs.reverse
------
theorem reverse_mk_symm (xs : List α)
        : (mk_symm xs).reverse = mk_symm xs := by
  simp [mk_symm]

attribute [simp] reverse_mk_symm

example (xs ys : List Nat)
        : (xs ++ mk_symm ys).reverse = mk_symm ys ++ xs.reverse := by
  simp

example (xs ys : List Nat) (p : List Nat → Prop)
        (h : p (xs ++ mk_symm ys).reverse)
        : p (mk_symm ys ++ xs.reverse) := by
  simp at h; assumption
```

属性也可在定理声明后的任意时刻应用：

```lean
def mk_symm (xs : List α) :=
 xs ++ xs.reverse
------
theorem reverse_mk_symm (xs : List α)
        : (mk_symm xs).reverse = mk_symm xs := by
  simp [mk_symm]

example (xs ys : List Nat)
        : (xs ++ mk_symm ys).reverse = mk_symm ys ++ xs.reverse := by
  simp [reverse_mk_symm]

attribute [simp] reverse_mk_symm

example (xs ys : List Nat) (p : List Nat → Prop)
        (h : p (xs ++ mk_symm ys).reverse)
        : p (mk_symm ys ++ xs.reverse) := by
  simp at h; assumption
```

属性应用后无法永久移除；导入该文件的任何文件都会保留。第 12 章「属性」将讨论用 **`local`** 修饰符把属性限于当前文件或 section：

```lean
def mk_symm (xs : List α) :=
 xs ++ xs.reverse
------
theorem reverse_mk_symm (xs : List α)
        : (mk_symm xs).reverse = mk_symm xs := by
  simp [mk_symm]

section
attribute [local simp] reverse_mk_symm

example (xs ys : List Nat)
        : (xs ++ mk_symm ys).reverse = mk_symm ys ++ xs.reverse := by
  simp

example (xs ys : List Nat) (p : List Nat → Prop)
        (h : p (xs ++ mk_symm ys).reverse)
        : p (mk_symm ys ++ xs.reverse) := by
  simp at h; assumption
end
```

section 外，简化器默认不再使用 `reverse_mk_symm`。

注意各种 **`simp`** 选项——显式规则列表、**`at`** 指定位置——可组合，但列出顺序固定。编辑器中把光标放在 `simp` 上可查看关联文档串。

还有两个有用修饰符。默认 **`simp`** 包含所有标 **`[simp]`** 的定理。写 **`simp only`** 排除这些默认，用更精心列出的规则。下面用减号与 **`only`** 阻止 `reverse_mk_symm` 的应用：

```lean
def mk_symm (xs : List α) :=
  xs ++ xs.reverse
@[simp] theorem reverse_mk_symm (xs : List α)
        : (mk_symm xs).reverse = mk_symm xs := by
  simp [mk_symm]

example (xs ys : List Nat) (p : List Nat → Prop)
        (h : p (xs ++ mk_symm ys).reverse)
        : p (mk_symm ys ++ xs.reverse) := by
  simp at h; assumption

example (xs ys : List Nat) (p : List Nat → Prop)
        (h : p (xs ++ mk_symm ys).reverse)
        : p ((mk_symm ys).reverse ++ xs.reverse) := by
  simp [-reverse_mk_symm] at h; assumption

example (xs ys : List Nat) (p : List Nat → Prop)
        (h : p (xs ++ mk_symm ys).reverse)
        : p ((mk_symm ys).reverse ++ xs.reverse) := by
  simp only [List.reverse_append] at h; assumption
```

**`simp`** 有许多配置选项。例如可启用上下文化简：

```lean
example : if x = 0 then y + x = y else x ≠ 0 := by
  simp +contextual
```

**`+contextual`** 时，化简 `y + x = y` 会用 `x = 0`，化简另一分支会用 `x ≠ 0`。另一例：

```lean
example : ∀ (x : Nat) (h : x = 0), y + x = y := by
  simp +contextual
```

另一有用选项 **`+arith`** 启用算术化简：

```lean
example : 0 < 1 + x ∧ x + y + 2 ≥ y + 1 := by
  simp +arith
```

## 5.8 split 策略

**`split`** 策略用于按情形拆分嵌套的 **`if`-`then`-`else`** 与 **`match`** 表达式。对含 `n` 个分支的 **`match`**，**`split`** 至多产生 `n` 个子目标。示例：

```lean
def f (x y z : Nat) : Nat :=
  match x, y, z with
  | 5, _, _ => y
  | _, 5, _ => y
  | _, _, 5 => y
  | _, _, _ => 1

example (x y z : Nat) : x ≠ 5 → y ≠ 5 → z ≠ 5 → z = w → f x y w = 1 := by
  intros
  simp [f]
  split
  . contradiction
  . contradiction
  . contradiction
  . rfl
```

可压缩为：

```lean
def f (x y z : Nat) : Nat :=
 match x, y, z with
 | 5, _, _ => y
 | _, 5, _ => y
 | _, _, 5 => y
 | _, _, _ => 1
------
example (x y z : Nat) :
  x ≠ 5 → y ≠ 5 → z ≠ 5 → z = w →
  f x y w = 1 := by
  intros; simp [f]; split <;> first | contradiction | rfl
```

策略 `split <;> first | contradiction | rfl` 先 **`split`**，再对每个生成目标试 **`contradiction`**，失败则试 **`rfl`**。与 **`simp`** 一样，可对特定假设 **`split at h`**：

```lean
def g (xs ys : List Nat) : Nat :=
  match xs, ys with
  | [a, b], _ => a+b+1
  | _, [b, _] => b+1
  | _, _      => 1

example (xs ys : List Nat) (h : g xs ys = 0) : False := by
  simp [g] at h; split at h <;> simp +arith at h
```

## 5.9 可扩展策略

下例用 **`syntax`** 定义记法 **`triv`**，用 **`macro_rules`** 指定使用时的展开。可提供不同展开，策略解释器会逐一尝试直至成功：

```lean
-- Define a new tactic notation
syntax "triv" : tactic

macro_rules
  | `(tactic| triv) => `(tactic| assumption)

example (h : p) : p := by
  triv

-- You cannot prove the following theorem using `triv`
-- example (x : α) : x = x := by
--  triv

-- Let's extend `triv`. The tactic interpreter
-- tries all possible macro extensions for `triv` until one succeeds
macro_rules
  | `(tactic| triv) => `(tactic| rfl)

example (x : α) : x = x := by
  triv

example (x : α) (h : p) : x = x ∧ p := by
  apply And.intro <;> triv

-- We now add a (recursive) extension
macro_rules | `(tactic| triv) => `(tactic| apply And.intro <;> triv)

example (x : α) (h : p) : x = x ∧ p := by
  triv
```

## 5.10 练习

1. 回到「命题与证明」「量词与相等」章末练习，尽可能多用策略证明重做，并酌情使用 **`rw`**、**`simp`**。

2. 用策略组合子得到下列一行证明：

```lean
example (p q r : Prop) (hp : p)
        : (p ∨ q ∨ r) ∧ (q ∨ p ∨ r) ∧ (q ∨ r ∨ p) := by
  sorry
```