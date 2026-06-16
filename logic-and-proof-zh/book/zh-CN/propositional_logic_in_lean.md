# 第 4 章：Lean 中的命题逻辑

> 本译文对应原书 [Propositional Logic in Lean](https://leanprover.github.io/logic_and_proof/propositional_logic_in_lean.html)；英文 Sphinx 源：`propositional_logic_in_lean.rst`。

在本章中，你将学习如何用 Lean 写证明。我们会从一种纯机械的翻译开始，它能把任何自然演绎证明都表示成 Lean 代码。然而我们会看到，这种证明写法既不直观，可读性也不好，而且难以扩展。

然后我们会考虑 Lean 提供的一些机制，它们支持更“前向驱动”的论证风格。由于这些证明看起来更像非正式证明，但又可以直接翻译为自然演绎，它们将帮助我们理解两者之间的关系。

## 4.1. 命题与证明的表达式

Lean 的核心是一个**类型检查器**（type checker）。这意味着我们可以写下表达式，让系统检查它们是否良构，也可以让系统告诉我们它们表示什么类型的对象。试试看：

```lean
variable (A B C : Prop)

#check A ∧ ¬ B → C
```

在本书的在线版本中，你可以点击“try it!”按钮把例子复制到编辑器窗口，然后把鼠标悬停在文本标记上阅读消息。

在这个例子中，我们声明了三个取值范围为命题的变量，并让 Lean 检查表达式 `A ∧ ¬ B → C`。`#check` 命令的输出是 `A ∧ ¬ B → C : Prop`，它断言 `A ∧ ¬ B → C` 的类型是 `Prop`，即它是一个良构的命题。在 Lean 中，每个良构表达式都有一个类型。

逻辑联结词以 Unicode 渲染。下表展示了如何在编辑器中输入这些符号，也为偏好 ASCII 的用户提供了等价写法。

| Unicode | Ascii | Lean input |
|---|---|---|
| true |  | `True` |
| false |  | `False` |
| ¬ | not | `\not`, `\neg` |
| ∧ | /\ | `\and` |
| ∨ | \/ | `\or` |
| → | -> | `\to`, `\r`, `\imp` |
| ↔ | <-> | `\iff`, `\lr` |
| ∀ | forall | `\all` |
| ∃ | exists | `\ex` |
| λ | fun | `\lam`, `\fun` |
| ≠ | ~= | `\ne` |

到目前为止，我们只讨论了表中前七项。量词、lambda 和相等将在后面讨论。你可以自己试着输入一些表达式并检查。你可以尝试把上面例子中的某个变量改成 `D`，或者在表达式中插入无意义的符号，看看 Lean 返回什么错误信息。

除了声明变量，如果 `P` 是任意 `Prop` 类型的表达式，例如 `A ∧ ¬ B`，我们还可以声明假设 `P` 为真：

```lean
variable (h : A ∧ ¬ B)

#check h
```

从形式上看，任何命题都可以被看作一个类型，即该命题的证明的类型。一个假设或前提就是该类型的一个变量。正如命题变量 `A : Prop` 可以代替一个实际命题，正如编程语言中的布尔变量可以代替一个实际布尔值，Lean 中的假设被表示为一个证明变量，每当我们需要所假设命题的证明时就可以使用它。

构建证明就是写下正确类型的表达式。例如，如果 `h` 是 `A ∧ B` 类型的表达式，那么 `And.left h` 是 `A` 类型的表达式，`And.right h` 是 `B` 类型的表达式。换言之，如果 `h` 是 `A ∧ B` 的证明，那么 `And.left h` 就是应用合取消去左规则得到的证明的名字：

![推理规则 1](https://leanprover-community.github.io/logic_and_proof/_static/propositional_logic_in_lean.1.png)

类似地，`And.right h` 是应用合取消去右规则得到的 `B` 的证明。所以，继续上面的例子，我们可以写：

```lean
variable (h : A ∧ ¬ B)

#check And.left h
#check And.right h
```

这两个表达式分别对应下面两个证明：

![推理规则 2](https://leanprover-community.github.io/logic_and_proof/_static/propositional_logic_in_lean.2.png)

注意，在这种表示自然演绎证明的方式中，不存在“游离”的假设。每个假设都有标签。在 Lean 中，我们通常用 `h`、`h1`、`h2`、……这样的表达式来标记假设，但你可以使用任何标识符。

如果 `h1` 是 `A` 的证明，`h2` 是 `B` 的证明，那么 `And.intro h1 h2` 就是 `A ∧ B` 的证明。所以我们可以继续上面的例子：

```lean
variable (h : A ∧ ¬ B)

#check And.intro (And.right h) (And.left h)
```

这对应于下面的证明：

![推理规则 3](https://leanprover-community.github.io/logic_and_proof/_static/propositional_logic_in_lean.2b.png)

那么蕴涵呢？消去规则很简单：如果 `h₁` 是 `A → B` 的证明，`h₂` 是 `A` 的证明，那么 `h₁ h₂` 就是 `B` 的证明。注意我们甚至不需要命名这条规则：只需把 `h₁` 写在 `h₂` 前面，就像把前者应用于后者一样。如果 `h₁` 和 `h₂` 是复合表达式，用括号把它们括起来，以标明各自的起点和终点。

```lean
variable (h1 : A → (B → C))
variable (h2 : D → A)
variable (h3 : D)
variable (h4 : B)

#check h2 h3
#check h1 (h2 h3)
#check (h1 (h2 h3)) h4
```

Lean 采用如下约定：函数应用向左结合，因此表达式 `h1 h2 h3` 被解释为 `(h1 h2) h3`。蕴涵则向右结合，因此 `A → B → C` 被解释为 `A → (B → C)`。这也许看起来有点怪，但它是表示带多个前提的蕴涵的方便方式，因为表达式 `A → B → C → D → E` 意味着 `E` 从 `A`、`B`、`C`、`D` 推出。所以上面的例子也可以写成：

```lean
variable (h1 : A → (B → C))
variable (h2 : D → A)
variable (h3 : D)
variable (h4 : B)

#check h2 h3
#check h1 (h2 h3)
#check h1 (h2 h3) h4
```

注意表达式 `h1 (h2 h3)` 中仍然需要括号。

蕴涵引入规则比较 tricky，因为它会取消一个假设。用 Lean 表达式来说，这条规则翻译如下。假设 `A` 和 `B` 的类型是 `Prop`，并且假设 `hA` 是 `A` 成立的前提，`hB` 是 `B` 的证明（可能用到 `hA`）。那么表达式 `fun h : A ↦ hB` 就是 `A → B` 的证明。你可以输入 `\mapsto` 得到符号 `↦`。例如，我们可以如下构造 `A → A ∧ A` 的证明：

```lean
#check (fun h : A ↦ And.intro h h)
```

我们可以把 `fun` 读作“假设 `h`”。事实上，`fun` 代表“function”（函数），因为 `A → B` 的证明就是从 `A` 的证明类型到 `B` 的证明类型的函数。

注意，我们不再需要把 `A` 声明为前提；我们不需要写 `variable (h : A)`。表达式 `fun h : A ↦ hB` 让前提 `h` 只作用于括号内的表达式，我们可以在括号内引用 `h`。给定假设 `h : A`，表达式 `And.intro h h` 是 `A ∧ A` 的证明，因此表达式 `fun h : A ↦ And.intro h h` 是 `A → A ∧ A` 的证明。在这个例子中，由于表达式没有歧义，我们可以省略括号：

```lean
#check fun h : A ↦ And.intro h h
```

上面我们从前提 `A ∧ ¬ B` 证明了 `¬ B ∧ A`。我们也可以改而得到 `A ∧ ¬ B → ¬ B ∧ A` 的证明：

```lean
#check (fun h : A ∧ ¬ B ↦ And.intro (And.right h) (And.left h))
```

我们所做的只是把前提移到了一个局部的 `fun` 表达式中。

（顺便说一下，`fun` 命令只是 lambda 符号 `λ` 的替代语法，所以我们也可以写成：

```lean
#check (λ h : A ∧ ¬ B ↦ And.intro (And.right h) (And.left h))
```

你将在后面学到更多关于 lambda 符号的内容。）

## 4.2. 更多命令

让我们介绍一个新的 Lean 命令：`example`。这个命令告诉 Lean，你将要证明一个定理，或者更一般地，写下一个给定类型的表达式。它后面应该跟着证明或表达式本身。

```lean
example : A ∧ ¬ B → ¬ B ∧ A :=
fun h : A ∧ ¬ B ↦
And.intro (And.right h) (And.left h)
```

给出这个命令后，Lean 会检查 `:=` 后面的表达式，并确保它具有正确的类型。如果是，Lean 就接受它作为有效证明；否则报错。

因为 `example` 命令提供了后面表达式的类型信息（在这个例子中即要证明的命题），它有时使我们能够省略其他信息。例如，我们可以省略假设的类型：

```lean
example : A ∧ ¬ B → ¬ B ∧ A :=
fun h ↦
And.intro (And.right h) (And.left h)
```

因为 Lean 知道我们要证明一个以 `A ∧ ¬ B` 为前提的蕴涵，当你写 `fun h ↦` 时，它可以推断标识符 `h` 标记的是假设 `A ∧ ¬ B`。

我们也可以朝另一个方向走，用 `show` 向系统提供**更多**信息。如果 `A` 是一个命题，`h : A` 是一个证明，那么表达式 `show A from h` 与单独的 `h` 含义相同，但它明确 signal 了 `h` 是 `A` 的证明。Lean 检查这个表达式时，会先确认 `h` 确实是 `A` 的证明，然后再解析 surrounding 表达式。所以，在我们的例子中，我们也可以写：

```lean
example : A ∧ ¬ B → ¬ B ∧ A :=
fun h : A ∧ ¬ B ↦
show ¬ B ∧ A from And.intro (And.right h) (And.left h)
```

我们甚至可以为较小的表达式 `And.right h` 和 `And.left h` 添加标注：

```lean
example : A ∧ ¬ B → ¬ B ∧ A :=
fun h : A ∧ ¬ B ↦
show ¬ B ∧ A from And.intro
  (show ¬ B from And.right h)
  (show A from And.left h)
```

尽管上面的例子中 `show` 命令并非必需，但使用这种风格有很多好处。首先，也许最重要的是，它使证明对人类更易读。其次，它使证明更**容易写**：如果你在证明中犯了错误，把你的意图表达清楚能让 Lean 更容易定位错误位置并给出有意义的错误信息。最后，`show` 子句中提供的类型信息往往能让你在其他地方省略信息，因为 Lean 可以根据你声明的意图推断出来。

还有记法变体。你可以不事先声明变量和前提，而是把它们作为 `example` 的“参数”，后面跟冒号：

```lean
example (A B : Prop) : A ∧ ¬ B → ¬ B ∧ A :=
fun h : A ∧ ¬ B ↦
show ¬ B ∧ A from And.intro
  (show ¬ B from And.right h)
  (show A from And.left h)
```

还有两个技巧可以帮助你在 Lean 中写证明。第一个是使用 `sorry`，它是 Lean 中的一个神奇项，能提供任何东西的证明。它也被称为“作弊”。但作弊可以帮助你逐步构造合法证明：如果 Lean 接受了一个带 `sorry` 的证明，那么你到目前为止写下的部分已经通过了 Lean 的正确性检查。你只需要把每个 `sorry` 替换成真正的证明即可完成任务。

```lean
example : A ∧ ¬ B → ¬ B ∧ A :=
fun h ↦ sorry

example : A ∧ ¬ B → ¬ B ∧ A :=
fun h ↦ And.intro sorry sorry

example : A ∧ ¬ B → ¬ B ∧ A :=
fun h ↦ And.intro (And.right h) sorry

example : A ∧ ¬ B → ¬ B ∧ A :=
fun h ↦ And.intro (And.right h) (And.left h)
```

第二个技巧是使用**占位符**，用下划线符号 `_` 表示。当你在表达式中写下下划线时，你是在请求系统尝试为你填入值。这还称不上调用完整的自动化来证明定理；你只是请求 Lean 根据上下文推断该值。如果你在需要证明的地方使用下划线，Lean 通常**不会**自动填入证明，但会给出一个错误信息，告诉你缺少什么。这将帮助你以反向驱动的方式逐步写证明项。在上面的例子中，试着把每个 `sorry` 替换成下划线 `_`，看看产生的错误信息。每种情况下，错误都会告诉你需要填入什么，以及在该阶段可用的变量和假设。

再一个提示：如果你想限定用 `variable` 命令引入的变量或前提的作用域，可以把它们放在以 `section` 开头、`end` 结尾的块中。

## 4.3. 构建自然演绎证明

本节我们为自然演绎证明的每条规则给出对应的机械翻译，从而描述从自然演绎证明到 Lean 的转换。其中一些对应关系已经见过，但为完整起见我们全部重述一遍。

### 4.3.1. 蕴涵

我们已经解释过，蕴涵引入用 `fun` 实现，蕴涵消去写成函数应用。

```lean
section
  variable (A B : Prop)

  example : A → B :=
  fun h : A ↦
  show B from sorry

  section
    variable (h1 : A → B) (h2 : A)

    example : B := h1 h2
  end
end
```

注意这里有一个 `section` 嵌套在另一个 `section` 中，以进一步限制两个新变量的作用域。

### 4.3.2. 合取

我们已经看到，合取引入用 `And.intro` 实现，消去规则是 `And.left` 和 `And.right`。

```lean
section
  variable (h1 : A) (h2 : B)

  example : A ∧ B := And.intro h1 h2
end

section
  variable (h : A ∧ B)

  example : A := And.left h
  example : B := And.right h
end
```

### 4.3.3. 析取

析取引入规则由 `Or.inl` 和 `Or.inr` 给出。

```lean
section
  variable (h : A)

  example : A ∨ B := Or.inl h
end

section
  variable (h : B)

  example : A ∨ B := Or.inr h
end
```

消去规则比较 tricky。要从 `A ∨ B` 证明 `C`，你需要三个参数：`A ∨ B` 的证明 `h`、从 `A` 证明 `C` 的证明、以及从 `B` 证明 `C` 的证明。利用换行和缩进来突出分情况证明的结构，我们可以写成如下形式：

```lean
variable (h : A ∨ B) (ha : A → C) (hb : B → C)
example : C :=
Or.elim h
  (fun h1 : A ↦
    show C from ha h1)
  (fun h1 : B ↦
    show C from hb h1)
```

注意我们可以在每个分支中复用标签 `h1`，因为概念上两个分支是不相交的。

### 4.3.4. 否定

在内部，否定 `¬ A` 被定义为 `A → False`，你可以把它理解为 `A` 蕴涵某种不可能的东西。因此否定的规则类似于蕴涵的规则。要证明 `¬ A`，假设 `A` 并推出矛盾。

```lean
example : ¬ A :=
fun h : A ↦
show False from sorry
```

如果你已经证明了否定 `¬ A`，把它应用于 `A` 的证明就可以得到矛盾。

```lean
variable (h1 : ¬ A) (h2 : A)

example : False := h1 h2
```

### 4.3.5. 真与假

*ex falso* 规则在 Lean 中称为 `False.elim`：

```lean
variable (h : False)

example : A := False.elim h
```

关于 `True` 没有太多可说的，除了它平凡地为真：

```lean
example : True := trivial
```

### 4.3.6. 双向蕴涵

“当且仅当”的引入规则是 `Iff.intro`。

```lean
example : A ↔ B :=
Iff.intro
  (fun h : A ↦
    show B from sorry)
  (fun h : B ↦
    show A from sorry)
```

和往常一样，我们选择缩进来使结构清晰。注意同一个标签 `h` 可以在两个分支中使用，在每个分支中有不同的含义，因为 `fun` 的作用域仅限于它出现的表达式。

消去规则是 `Iff.mp` 和 `Iff.mpr`，分别代表“modus ponens”和“modus ponens（反向）”：

```lean
section
  variable (h1 : A ↔ B)
  variable (h2 : A)

  example : B := Iff.mp h1 h2
end

section
  variable (h1 : A ↔ B)
  variable (h2 : B)

  example : A := Iff.mpr h1 h2
end
```

### 4.3.7. 示例

在上一章中，我们构造了从 \(A \to B\) 和 \(B \to C\) 证明 \(A \to C\) 的如下证明：

![推理规则 4](https://leanprover-community.github.io/logic_and_proof/_static/propositional_logic_in_lean.3.png)

在 Lean 中可以如下建模：

```lean
variable (h1 : A → B)
variable (h2 : B → C)

example : A → C :=
fun h : A ↦
show C from h2 (h1 h)
```

注意自然演绎证明中未被取消的假设，在 Lean 版本中被声明为变量。

我们还构造了下面的证明：

![推理规则 5](https://leanprover-community.github.io/logic_and_proof/_static/propositional_logic_in_lean.4.png)

在 Lean 中写成：

```lean
example (A B C : Prop) : (A → (B → C)) → (A ∧ B → C) :=
  fun h1 : A → (B → C) ↦
  fun h2 : A ∧ B ↦
  show C from h1 (And.left h2) (And.right h2)
```

这之所以有效，是因为 `And.left h2` 是 `A` 的证明，`And.right h2` 是 `B` 的证明。

最后，我们构造了 \(A \land (B \lor C) \to (A \land B) \lor (A \land C)\) 的如下证明：

![推理规则 6](https://leanprover-community.github.io/logic_and_proof/_static/propositional_logic_in_lean.5.png)

在 Lean 中的一个版本：

```lean
example (A B C : Prop) : A ∧ (B ∨ C) → (A ∧ B) ∨ (A ∧ C) :=
fun h1 : A ∧ (B ∨ C) ↦
Or.elim (And.right h1)
  (fun h2 : B ↦
    show (A ∧ B) ∨ (A ∧ C) from Or.inl (And.intro (And.left h1) h2))
  (fun h2 : C ↦
    show (A ∧ B) ∨ (A ∧ C) from Or.inr (And.intro (And.left h1) h2))
```

事实上，记住 `fun` 是符号 `λ` 的替代语法，并且 Lean 通常能推断假设的类型，我们可以把证明写得非常简短：

```lean
example (A B C : Prop) : A ∧ (B ∨ C) → (A ∧ B) ∨ (A ∧ C) :=
λ h1 ↦ Or.elim (And.right h1)
  (λ h2 ↦ Or.inl (And.intro (And.left h1) h2))
  (λ h2 ↦ Or.inr (And.intro (And.left h1) h2))
```

但这个证明很 cryptic。使用这种风格会使证明难写、难读、难理解、难维护、难调试。Tactic 模式是缓解这些问题的一种方式。

## 4.4. 策略模式

到目前为止，我们只解释了 Lean 中写证明的一种模式，即“term mode”（项模式）。在项模式中，我们可以直接把证明写成语法表达式。本节我们介绍“tactic mode”（策略模式），它让我们可以更交互地写证明，把 tactic 当作构建证明的指令。在任意时刻要证明的陈述称为**目标**（goal），指令通过把目标转化为更容易证明的东西来推进。一旦 tactic 模式证明完成，Lean 应该能够按照指令把它转换回证明项。

Tactic 可以是非常强大的工具，承担大量繁琐工作，让我们能写短得多的证明。我们将在后续逐步介绍它们。

我们可以通过 `:=` 后面写关键字 `by` 进入 tactic 模式：

```lean
-- term mode
example (A B C : Prop) : A ∧ (B ∨ C) → (A ∧ B) ∨ (A ∧ C) :=
fun h1 : A ∧ (B ∨ C) ↦
Or.elim (And.right h1)
  (fun h2 : B ↦
    show (A ∧ B) ∨ (A ∧ C) from Or.inl (And.intro (And.left h1) h2))
  (fun h2 : C ↦
    show (A ∧ B) ∨ (A ∧ C)
      from Or.inr (And.intro (And.left h1) h2))

-- tactic mode
example (A B C : Prop) : A ∧ (B ∨ C) → (A ∧ B) ∨ (A ∧ C) := by
  intro (h1 : A ∧ (B ∨ C))
  cases h1 with
  | intro h1 h2 => cases h2 with
    | inl h2 =>
      apply Or.inl
      apply And.intro
      exact h1
      exact h2
    | inr h2 =>
      apply Or.inr
      apply And.intro
      exact h1
      exact h2
```

我们用 `intro (h1 : A ∧ (B ∨ C))` 来“引入”假设 `h1`，而不是 `fun h1 ↦ h2`，然后给出关于 `h2` 的指令。

我们用 `cases h1 with` 代替 `Or.elim h` 和 `And.elim h`，并用 `|` 列出证明 `h` 可能构造方式的各种情况，然后在每种情况下继续证明。对于合取，`h` 只有一种可能的构造方式，即 `And.intro h1 h2`（Lean 只允许写成 `intro h1 h2`）。对于析取，有两种情况，`h` 可能是 `Or.inl h1` 或 `Or.inr h2`（同样我们必须写成 `inl h1` 和 `inr h2`）。

我们不是立刻给 `Or.inl`、`Or.inr` 和 `And.intro` 提供所有参数，而是可以（例如）先 `apply Or.inl`，然后再填补缺失部分。事实上，Lean 把 `Or.inl : A → A ∨ B` 看作一个条件证明，对于任何 `h : A → B`，`apply h` 会把目标从 `B` 变成 `A`。我们可以把它理解为“既然 `A` 蕴涵 `B`，要证明 `B` 只需证明 `A`”。最后，当我们的目标是 `A` 且 `h1 : A` 时，可以写 `exact h1` 来关闭目标。

我们会根据需要将 tactic 和项混合使用。在本书中我们会慢慢引入越来越多的 tactic。

注意 tactic 模式证明对缩进和换行敏感。另一方面，项模式证明对空白不敏感。我们可以把每个项模式证明都写在一行内。对于两种模式，我们都会采用能展示证明结构、使其更易读的缩进和换行约定。

## 4.5. 前向推理

Lean 支持前向推理，允许你使用 `have` 写证明，`have` 既可以作为项模式表达式，也可以作为 tactic。注意 `show` 同样也可以作为 tactic。

```lean
variable (h1 : A → B)
variable (h2 : B → C)

-- term mode
example : A → C :=
  fun h : A ↦
  have h3 : B := h1 h
  show C from h2 h3

-- tactic mode
example : A → C := by
  intro (h : A)
  have h3 : B := h1 h
  show C
  exact h2 h3
```

`have h : A := expr` 这一行把名字 `h` 赋给（可能很长的）证明表达式 `expr`，后者证明 `A`。在证明的其余部分，完整的证明表达式 `expr` 和它的名字 `h` 可以互换使用，含义完全相同。因此上一证明的最后一行可以看作 `exact h2 (h1 h)` 的缩写，因为 `h3` 是 `h1 h` 的缩写。这种缩写在证明表达式很长且被反复使用时尤其重要。

使用 `have` 有很多好处。首先，它使证明更易读：上面的例子明确把 `B` 作为一个辅助目标提出。它还能避免重复：`h3` 引入后可以被反复使用，无需复制证明。最后，它使构造和调试证明更容易：把 `B` 作为辅助目标提出，能让 Lean 在目标未正确满足时给出更有信息量的错误信息。

注意 `have` 和 `exact` 混合了项模式和 tactic 模式，因为表达式 `h1 h` 是 `B` 的项模式证明，`h2 h3` 是 `C` 的项模式证明。对于 `exact`，这正是该 tactic 的用途。对于 `have`，我们可以通过写 `have h3 : B := by ...` 切回 tactic 模式来证明辅助目标。

前面我们考虑过下面的陈述，这里我们把它部分翻译成 tactic 模式：

```lean
example (A B C : Prop) : (A → (B → C)) → (A ∧ B → C) :=
  fun h1 : A → (B → C) ↦
  fun h2 : A ∧ B ↦
  show C from h1 (And.left h2) (And.right h2)

example (A B C : Prop) : (A → (B → C)) → (A ∧ B → C) := by
  intro (h1 : A → (B → C)) (h2 : A ∧ B)
  exact h1 (And.left h2) (And.right h2)
```

注意 `intro` 可以一次引入多个假设。使用 `have`，它可以写得更清晰：

```lean
example (A B C : Prop) : (A → (B → C)) → (A ∧ B → C) := by
  intro (h1 : A → (B → C)) (h2 : A ∧ B)
  have h3 : A := And.left h2
  have h4 : B := And.right h2
  exact h1 h3 h4
```

我们还可以更啰嗦，再加一行：

```lean
example (A B C : Prop) : (A → (B → C)) → (A ∧ B → C) := by
  intro (h1 : A → (B → C)) (h2 : A ∧ B)
  have h3 : A := And.left h2
  have h4 : B := And.right h2
  have h5 : B → C := h1 h3
  show C
  exact h5 h4
```

增加更多信息并不总使证明更易读；当各个表达式很小、容易理解时，把它们详细展开反而会引入 clutter。随着你学习使用 Lean，你需要发展自己的风格，并运用判断力决定哪些步骤要显式做出。

下面是一些基本推理用 `have` 展开后的样子。在合取引入规则中，就是先分别证明每个合取支，再把它们合在一起：

```lean
example (A B : Prop) : A ∧ B → B ∧ A := by
  intro (h1 : A ∧ B)
  have h2 : A := And.left h1
  have h3 : B := And.right h1
  show B ∧ A
  exact And.intro h3 h2
```

与这个版本比较，后者先声明我们将使用 `And.intro` 规则，然后显式列出产生的两个子目标：

```lean
example (A B : Prop) : A ∧ B → B ∧ A := by
  intro (h1 : A ∧ B)
  apply And.intro
  . show B
    exact And.right h1
  . show A
    exact And.left h1
```

注意这里用 `.` 分隔两个剩余目标；它对缩进敏感。

再次强调，涉及的可读性问题。Lean 对下面这个简短的项模式版本同样处理得很好：

```lean
example (A B : Prop) : A ∧ B → B ∧ A :=
λ h ↦ And.intro (And.right h) (And.left h)
```

使用析取消去规则时，显式陈述相关析取常常最清晰：

```lean
example (A B C : Prop) : C := by
have h : A ∨ B := sorry
show C
apply Or.elim h
. intro (hA : A)
  sorry
. intro (hB : B)
  sorry
```

下面是上一节一个例子的 `have` 结构化呈现：

```lean
-- tactic mode
example (A B C : Prop) : A ∧ (B ∨ C) → (A ∧ B) ∨ (A ∧ C) := by
intro (h1 : A ∧ (B ∨ C))
have h2 : A := And.left h1
have h3 : B ∨ C := And.right h1
show (A ∧ B) ∨ (A ∧ C)
apply Or.elim h3
. intro (h4 : B)
  have h5 : A ∧ B := And.intro h2 h4
  show (A ∧ B) ∨ (A ∧ C)
  exact Or.inl h5
. intro (h4 : C)
  have h5 : A ∧ C := And.intro h2 h4
  show (A ∧ B) ∨ (A ∧ C)
  exact Or.inr h5

-- term mode
example (A B C : Prop) : A ∧ (B ∨ C) → (A ∧ B) ∨ (A ∧ C) :=
fun h1 : A ∧ (B ∨ C) ↦
have h2 : A := And.left h1
have h3 : B ∨ C := And.right h1
show (A ∧ B) ∨ (A ∧ C) from
  Or.elim h3
    (fun h4 : B ↦
      have h5 : A ∧ B := And.intro h2 h4
      show (A ∧ B) ∨ (A ∧ C) from Or.inl h5)
    (fun h4 : C ↦
      have h5 : A ∧ C := And.intro h2 h4
      show (A ∧ B) ∨ (A ∧ C) from Or.inr h5)
```

## 4.6. 定义与定理

Lean 允许我们为定义和定理命名，以便后续使用。例如，下面是一个新“联结词”的定义：

```lean
def triple_and (A B C : Prop) : Prop :=
A ∧ (B ∧ C)
```

与 `example` 命令一样，参数 `A`、`B`、`C` 是事先用 `variable` 声明，还是随定义本身一起给出，都没有关系。然后我们可以把这个定义应用于任意表达式：

```lean
variable (D E F G : Prop)

#check triple_and (D ∨ E) (¬ F → G) (¬ D)
```

后面我们会看到更有趣的定义例子，比如下面这个从自然数到自然数的函数，它把输入翻倍：

```lean
import Mathlib.Data.Nat.Defs

def double (n : ℕ) : ℕ := n + n
```

目前更有趣的是，Lean 还允许我们为定理命名，并在之后作为推理规则使用。例如，考虑下面的定理：

```lean
theorem and_commute (A B : Prop) : A ∧ B → B ∧ A :=
fun h ↦ And.intro (And.right h) (And.left h)
```

一旦定义了它，我们就可以自由使用：

```lean
variable (C D E : Prop)
variable (h1 : C ∧ ¬ D)
variable (h2 : ¬ D ∧ C → E)

example : E := h2 (and_commute C (¬ D) h1)
```

这个例子中令人烦恼的是，我们必须显式给出参数 `C` 和 `¬ D`，因为它们已经隐含在 `h1` 中了。事实上，Lean 允许我们在 `and_commute` 的定义中说明这一点：

```lean
theorem and_commute {A B : Prop} : A ∧ B → B ∧ A :=
fun h ↦ And.intro (And.right h) (And.left h)
```

这里的花括号表示参数 `A` 和 `B` 是**隐含的**（implicit），也就是说，Lean 应在使用该定理时根据上下文推断它们。然后我们可以改写成：

```lean
variable (C D E : Prop)
variable (h1 : C ∧ ¬ D)
variable (h2 : ¬ D ∧ C → E)

example : E := h2 (and_commute h1)
```

事实上，Lean 的库中有一个以完全相同方式定义的定理 `and_comm`。

两种定义产生相同的结果。

定义和定理在数学中很重要；它们使我们能够从基本原理出发构建复杂理论。Lean 也接受用 `lemma` 代替 `theorem`。

有趣的是，在交互式定理证明中，我们甚至可以定义熟悉的推理模式。例如，上一章提到的所有以下推理：

```lean
namespace hidden

variable {A B : Prop}

theorem Or_resolve_left (h1 : A ∨ B) (h2 : ¬ A) : B :=
Or.elim h1
  (fun h3 : A ↦ show B from False.elim (h2 h3))
  (fun h3 : B ↦ show B from h3)

theorem Or_resolve_right (h1 : A ∨ B) (h2 : ¬ B) : A :=
Or.elim h1
  (fun h3 : A ↦ show A from h3)
  (fun h3 : B ↦ show A from False.elim (h2 h3))

theorem absurd (h1 : ¬ A) (h2 : A) : B :=
False.elim (h1 h2)

end hidden
```

事实上，Lean 的库定义了 `Or.resolve_left`、`Or.resolve_right` 和 `absurd`。我们使用 `namespace` 命令来避免命名冲突，否则会产生错误。

当你被要求用 Lean 证明命题逻辑的基本事实时，我们的目标是让你学会使用 Lean 的原语。因此，对于这些练习，你不应使用库中的事实。然而，当我们迈向真正的数学时，你可以更自由地使用库中的事实。

## 4.7. 额外语法

本节我们为高级用户介绍 Lean 的一些额外语法特性。这些语法工具通常很方便，有时还能让证明看起来更漂亮。

首先，你可以用反斜杠输入下标数字。例如，输入 `h\1` 可以写出 `h₁`。标签对 Lean 来说无关紧要，所以区别仅在于外观。

另一个特性是，你可以在 `fun` 和 `intro` 中省略标签，提供一个“匿名”假设。在 tactic 模式中，你可以用 tactic `assumption` 调用这个匿名假设：

```lean
example : A → A ∨ B := by
  intro
  show A ∨ B
  apply Or.inl
  assumption
```

在项模式中，你可以用 French quotes 调用匿名假设，French quotes 通过输入 `\f<` 和 `\f>` 得到。

```lean
example : A → A ∨ B :=
fun _ ↦ Or.inl ‹A›
```

你也可以在使用 `have` 时不给标签，并用同样的约定回头引用它们。下面是一个使用这些特性的例子：

```lean
theorem my_theorem {A B C : Prop} :
    A ∧ (B ∨ C) → (A ∧ B) ∨ (A ∧ C) := by
  intro (h : A ∧ (B ∨ C))
  have : A := And.left h
  have : (B ∨ C) := And.right h
  show (A ∧ B) ∨ (A ∧ C)
  apply Or.elim ‹B ∨ C›
  . intro
    have : A ∧ B := And.intro ‹A› ‹B›
    show (A ∧ B) ∨ (A ∧ C)
    apply Or.inl
    assumption
  . intro
    have : A ∧ C := And.intro ‹A› ‹C›
    show (A ∧ B) ∨ (A ∧ C)
    apply Or.inr
    assumption
```

另一个技巧是，当 `h` 是合取时，你可以用 `h.left` 和 `h.right` 代替 `And.left h` 和 `And.right h`；并且当 Lean 能推断出你要证明的是一个合取时，你可以用 `⟨h1, h2⟩`（通过输入 `\<` 和 `\>`，注意与 French quotes 的区别）代替 `And.intro h1 h2`。利用这些约定，你可以写：

```lean
example (A B : Prop) : A ∧ B → B ∧ A :=
fun h : A ∧ B ↦
show B ∧ A from ⟨h.right, h.left⟩
```

这不过是下面写法的简写：

```lean
example (A B : Prop) : A ∧ B → B ∧ A :=
fun h : A ∧ B ↦
show B ∧ A from And.intro (And.right h) (And.left h)
```

更简洁地，你可以这样写：

```lean
example (A B : Prop) : A ∧ B → B ∧ A :=
fun h ↦ ⟨h.right, h.left⟩
```

你甚至可以在 `fun` 中拆解合取，因此这样也成立：

```lean
example (A B : Prop) : A ∧ B → B ∧ A :=
fun ⟨h₁, h₂⟩ ↦ ⟨h₂, h₁⟩
```

类似地，如果 `h` 是双向蕴涵，你可以用 `h.mp` 和 `h.mpr` 代替 `Iff.mp h` 和 `Iff.mpr h`，并且可以用 `⟨h1, h2⟩` 代替 `Iff.intro h1 h2`。因此，Lean 能理解这些证明：

```lean
example (A B : Prop) : B ∧ (A ↔ B) → A :=
fun ⟨hB, hAB⟩ ↦
hAB.mpr hB

example (A B : Prop) : A ∧ B ↔ B ∧ A :=
⟨fun ⟨h₁, h₂⟩ ↦ ⟨h₂, h₁⟩, fun ⟨h₁, h₂⟩ ↦ ⟨h₂, h₁⟩⟩
```

最后，你可以用两种方式给证明添加注释。首先，双横线 `--` 之后的任何文本直到行末都会被 Lean 处理器忽略。其次，`/-` 和 `-/` 之间的任何文本表示块注释，同样被忽略。块注释可以嵌套。

```lean
/- This is a block comment.
 It can fill multiple lines. -/

example (A : Prop) : A → A :=
fun a : A ↦      -- assume the antecedent
show A from a     -- use it to establish the conclusion
```

## 4.8. 练习

请用项模式和 tactic 模式分别证明下列命题：

```lean
example : A ∧ (A → B) → B :=
sorry

example : A → ¬ (¬ A ∧ B) :=
sorry

example : ¬ (A ∧ B) → (A → ¬ B) :=
sorry

example (h₁ : A ∨ B) (h₂ : A → C) (h₃ : B → D) : C ∨ D :=
sorry

example (h : ¬ A ∧ ¬ B) : ¬ (A ∨ B) :=
sorry

example : ¬ (A ↔ ¬ A) :=
sorry
```
