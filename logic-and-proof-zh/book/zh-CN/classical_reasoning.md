# 第 5 章：经典推理

> 本译文对应原书 [Classical Reasoning](https://leanprover.github.io/logic_and_proof/classical_reasoning.html)；英文 Sphinx 源：`classical_reasoning.rst`。

如果我们把到目前为止见过的所有命题逻辑规则放在一起，但排除 *reductio ad absurdum*（反证法），就得到所谓的**直觉主义逻辑**（intuitionistic logic，有时也用更一般的术语**构造性逻辑**constructive logic）。在直觉主义逻辑中，可以从计算的角度看待证明：$A \land B$ 的证明是一对分别证明 $A$ 和 $B$ 的证据；$A \rightarrow B$ 的证明是把 $A$ 的证据转化为 $B$ 的证据的过程；$A \lor B$ 的证明是其中一方的证明，并带有标签以便我们知道是哪一方。*ex falso* 规则之所以合理，只是因为我们预期不存在“假”的证明；它就像空数据类型。

反证法与这种世界观不太契合：从 $\neg A$ 推出矛盾，我们却应当魔术般地产生一个 $A$ 的证明。我们将会看到，借助反证法可以证明下面这条称为**排中律**（law of the excluded middle）的定律：$\forall A, A \lor \neg A$。从计算角度看，它说对于每个命题 $A$，我们都能判定 $A$ 是否为真。

然而，允许使用 *reductio ad absurdum* 的**经典推理**（classical reasoning）确实向逻辑引入了一些可以简化推理的原则。本章我们将考虑这些原则，并看看它们如何从基本规则推出。

## 5.1. 反证法

记住，在自然演绎中，反证法由如下模式表达：

![推理规则 1](https://leanprover-community.github.io/logic_and_proof/_static/classical_reasoning.1.png)

假设 $\neg A$ 在最后一步推理中被取消。

在 Lean 中，这条推理名为 `byContradiction`，并且由于它是经典规则，我们必须在使用前先执行命令 `open Classical`。之后，推理模式表达如下：

```lean
section
open Classical
variable (A : Prop)

example : A :=
byContradiction
  (fun h : ¬ A ↦ show False from sorry)

end
```

这条规则最重要的推论之一就是我们上面提到的经典原则——**排中律**，它断言对所有 $A$ 都有：$A \lor \neg A$。在 Lean 中我们用 `em` 表示这条定律。在数学论证中，人们常常把证明分成两种情况，先假设 $A$，再假设 $\neg A$。使用析取消去规则，这等价于使用 $A \lor \neg A$，即这个特定 $A$ 的排中律。

下面是用反证法证明排中律的自然演绎证明：

![推理规则 2](https://leanprover-community.github.io/logic_and_proof/_static/classical_reasoning.3.png)

同一个证明在 Lean 中如下：

```lean
section
open Classical

example : A ∨ ¬ A := by
  apply byContradiction
  intro (h1 : ¬ (A ∨ ¬ A))
  have h2 : ¬ A := by
    intro (h3 : A)
    have h4 : A ∨ ¬ A := Or.inl h3
    show False
    exact h1 h4
  have h5 : A ∨ ¬ A := Or.inr h2
  show False
  exact h1 h5

end
```

这条原则被称为排中律，因为它说一个命题 `A` 要么为真要么为假；没有中间地带。缩写这个名称，该定理在 Lean 库中名为 `em`。对任何命题 `A`，`em A` 表示 $A \lor \neg A$ 的一个证明，只要 `Classical` 已打开，你就可以随时使用它：

```lean
section
open Classical

example (A : Prop) : A ∨ ¬ A :=
Or.elim (em A)
  (fun _ : A ↦ Or.inl ‹A›)
  (fun _ : ¬ A ↦ Or.inr ‹¬A›)
end
```

或者更简单：

```lean
section
open Classical

example (A : Prop) : A ∨ ¬ A :=
em A

end
```

事实上，我们也可以朝另一个方向走：用排中律来证明反证法。练习中会让你完成这一点。

反证法还等价于原则 $\neg \neg A \leftrightarrow A$。从右到左的蕴涵在直觉主义中成立；另一个方向是经典的，称为**双重否定消去**（double-negation elimination）。下面是自然演绎中的一个证明：

![推理规则 3](https://leanprover-community.github.io/logic_and_proof/_static/classical_reasoning.4.png)

对应的 Lean 证明：

```lean
section
open Classical

example (A : Prop) : ¬ ¬ A ↔ A :=
Iff.intro
  (fun h1 : ¬ ¬ A ↦
    show A from byContradiction
      (fun h2 : ¬ A ↦
        show False from h1 h2))
  (fun h1 : A ↦
    show ¬ ¬ A from fun h2 : ¬ A ↦ h2 h1)

end
```

下一节我们将推导若干经典规则和等价式。这些证明比较 tricky。一般而言，在自然演绎中使用经典推理时，我们需要把[第 3.3 节](natural_deduction_for_propositional_logic.md#33-前向与后向推理)给出的一般启发式扩展为：

1. 首先，从结论出发向后工作，使用引入规则。
2. 当第一步无事可做时，使用消去规则向前工作。
3. 如果其他方法都失败了，使用反证法。

有时反证法是必要的，但如果不必要，它可能不如直接证明有信息量。例如，假设我们要证明 $A \land B \land C \to D$。在直接证明中，我们假设 $A$、$B$、$C$，然后朝 $D$ 推进。在此过程中我们会推出 $A$、$B$、$C$ 的其他推论，这些在其他情境中可能有用。另一方面，如果使用反证法，我们假设 $A$、$B$、$C$ 和 $\neg D$，并尝试证明 $\bot$。此时我们在不一致的上下文中工作；这样得到的任何辅助结果最终都被“$\bot$ 是假设的后承”这一事实所涵盖。

## 5.2. 若干经典原则

我们已经看到，$A \lor \neg A$ 和 $\neg \neg A \leftrightarrow A$ 是经典命题逻辑中两个重要定理。本节我们将给出更多定理、规则和等价式。其中一些会在这里证明，但大部分留作练习。在普通数学中，这些通常被不加说明地使用。然而，知道它们都可以用经典自然演绎的基本规则加以证明，是件好事。

对任何蕴涵 $A \to B$，断言 $\neg B \to \neg A$ 称为它的**逆否命题**（contrapositive）。每个蕴涵都蕴涵其逆否命题，而另一个方向在经典逻辑中成立：

![推理规则 4](https://leanprover-community.github.io/logic_and_proof/_static/classical_reasoning.5.png)

再看另一个例子。直观上，断言“如果 $A$ 那么 $B$”等价于说不可能出现 $A$ 为真而 $B$ 为假的情况。从第二个陈述推出第一个需要经典推理。

![推理规则 5](https://leanprover-community.github.io/logic_and_proof/_static/classical_reasoning.6.png)

下面是相同的证明在 Lean 中的写法：

```lean
section
open Classical
variable (A B : Prop)

example (h : ¬ B → ¬ A) : A → B := by
  intro (h1 : A)
  show B
  apply byContradiction
  intro (h2 : ¬ B)
  have h3 : ¬ A := h h2
  show False
  exact h3 h1

example (h : ¬ (A ∧ ¬ B)) : A → B := by
  intro (h1 : A)
  show B
  apply byContradiction
  intro
  have : A ∧ ¬ B := And.intro ‹A› ‹¬ B›
  show False
  exact h this

end
```

注意在第二个例子中，我们使用了匿名的 `intro` 和匿名的 `have`。我们用 French quotes `\f<` 和 `\f>` 写出 `‹A›` 和 `‹¬ B›`，回头引用第一个假设。`this` 一词则回头引用最近的 `have`。

知道我们可以证明排中律后，在经典证明中使用它就变得很方便。下面是一个例子，证明 $(A \to B) \lor (B \to A)$：

![推理规则 6](https://leanprover-community.github.io/logic_and_proof/_static/classical_reasoning.6bis.png)

对应的 Lean 证明：

```lean
section
open Classical

variable (A B : Prop)

example : (A → B) ∨ (B → A) :=
Or.elim (em B)
  (fun h : B ↦
    have : A → B :=
      fun _ : A ↦ show B from h
    show (A → B) ∨ (B → A) from Or.inl this)
  (fun h : ¬ B ↦
    have : B → A :=
      fun _ : B ↦ have : False := h ‹B›
      show A from False.elim this
    show (A → B) ∨ (B → A) from Or.inr this)

end
```

使用经典推理，蕴涵可以用析取和否定重写：

$$
(A \to B) \leftrightarrow \neg A \lor B .
$$

正向需要经典推理。

下面的等价式称为**德摩根律**（De Morgan’s laws）：

- $\neg (A \lor B) \leftrightarrow \neg A \land \neg B$
- $\neg (A \land B) \leftrightarrow \neg A \lor \neg B$

第二个的正向需要经典推理。

利用这些恒等式，我们总可以把否定下推到命题变量。例如，我们有

![推理规则 7](https://leanprover-community.github.io/logic_and_proof/_static/classical_reasoning.8.png)

一个由 $\land$、$\lor$、$\neg$ 构成且否定只出现在变量上的公式，称为**否定范式**（negation normal form）。

事实上，利用分配律，我们还可以进一步让所有析取都跑到最外层，使得公式成为若干“命题变量或否定命题变量的合取”的析取。这种公式称为**析取范式**（disjunctive normal form）。 alternatively，也可以把所有合取都放到最外层，称为**合取范式**（conjunctive normal form）。不过，下面的练习会说明，把公式写成析取或合取范式可能会使它们变得长得多。

## 5.3. `contradiction` 策略

一旦我们在证明中达到矛盾，即同时有 `h1 : A` 和 `h2 : ¬A`，我们就可以应用 tactic `contradiction`。它会在假设中搜索矛盾，如果找到就完成证明。回顾前面的例子：

```lean
section
open Classical

example : A ∨ ¬ A := by
  apply byContradiction
  intro (h1 : ¬ (A ∨ ¬ A))
  have h2 : ¬ A := by
    intro (h3 : A)
    have h4 : A ∨ ¬ A := Or.inl h3
    show False
    exact h1 h4
  have h5 : A ∨ ¬ A := Or.inr h2
  show False
  exact h1 h5

example : A ∨ ¬ A := by
  apply byContradiction
  intro (h1 : ¬ (A ∨ ¬ A))
  have h2 : ¬ A := by
    intro (h3 : A)
    have h4 : A ∨ ¬ A := Or.inl h3
    contradiction
  have h5 : A ∨ ¬ A := Or.inr h2
  contradiction

end
```

由于 `contradiction` 不需要给出构成矛盾的变量名，我们甚至可以去掉所有名字：

```lean
section
open Classical

example : A ∨ ¬ A := by
  apply byContradiction
  intro
  have : ¬ A := by
    intro
    have : A ∨ ¬ A := Or.inl ‹A›
    contradiction
  have : A ∨ ¬ A := Or.inr this
  contradiction

end
```

## 5.4. 练习

1. 说明如何从排中律推导出反证法规则，使用自然演绎的其他规则。换言之，假设你已有从 $\neg A$ 到 $\bot$ 的证明。以 $A \lor \neg A$ 为假设，但**不**使用 RAA 规则，说明如何继续推导出 $A$。

2. 从 $\neg A \lor \neg B$ 给出 $\neg (A \land B)$ 的自然演绎证明。（不需要使用反证法。）

3. 从 $\neg (A \land B)$ 构造 $\neg A \lor \neg B$ 的自然演绎证明。可以按如下步骤进行：
   1. 首先，从 $\neg (A \land B)$ 和 $A$ 证明 $\neg B$，从而得到 $\neg A \lor \neg B$。
   2. 利用这一点，从 $\neg (A \land B)$ 和 $\neg (\neg A \lor \neg B)$ 构造 $\neg A$ 的证明，从而得到 $\neg A \lor \neg B$。
   3. 利用这一点，从 $\neg (A \land B)$ 和 $\neg (\neg A \lor \neg B)$ 构造矛盾的证明。
   4. 使用反证法，这就给出了从 $\neg (A \land B)$ 到 $\neg A \lor \neg B$ 的证明。

4. 从 $\neg P \to (Q \lor R)$、$\neg Q$ 和 $\neg R$ 给出 $P$ 的自然演绎证明。

5. 从 $A \to B$ 给出 $\neg A \lor B$ 的自然演绎证明。你可以使用排中律。

6. 给出 $A \to ((A \land B) \lor (A \land \neg B))$ 的自然演绎证明。你可以使用排中律。

7. 把 $(A \lor B) \land (C \lor D) \land (E \lor F)$ 写成析取范式，即写成多个“合取表达式”的大“析取”。

8. 通过把下面的 `sorry` 替换成证明，来证明 `¬ (A ∧ B) → ¬ A ∨ ¬ B`。

```lean
import Mathlib.Tactic

section

open Classical
variable {A B C : Prop}

-- 通过把下面的 sorry 替换成证明，来证明 ¬ (A ∧ B) → ¬ A ∨ ¬ B。

lemma step1 (h₁ : ¬ (A ∧ B)) (h₂ : A) : ¬ A ∨ ¬ B :=
have : ¬ B := sorry
show ¬ A ∨ ¬ B from Or.inr this

lemma step2 (h₁ : ¬ (A ∧ B)) (h₂ : ¬ (¬ A ∨ ¬ B)) : False :=
have : ¬ A :=
  fun _ : A ↦
  have : ¬ A ∨ ¬ B := step1 h₁ ‹A›
  show False from h₂ this
show False from sorry

theorem step3 (h : ¬ (A ∧ B)) : ¬ A ∨ ¬ B :=
byContradiction
  (fun h' : ¬ (¬ A ∨ ¬ B) ↦
    show False from step2 h h')

end
```

9. 在 tactic 模式下完成这些证明：

```lean
section
open Classical
variable {A B C : Prop}

example (h : ¬ B → ¬ A) : A → B := by
  sorry

example (h : A → B) : ¬ A ∨ B := by
  sorry

end
```
