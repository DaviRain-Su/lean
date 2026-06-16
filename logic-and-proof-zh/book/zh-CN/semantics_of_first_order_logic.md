# 第 10 章：一阶逻辑的语义

> 本译文对应原书 [Semantics of First Order Logic](https://leanprover.github.io/logic_and_proof/semantics_of_first_order_logic.html)；英文 Sphinx 源：`semantics_of_first_order_logic.rst`。

在[第 6 章](semantics_of_propositional_logic.md)中，我们强调了命题逻辑中**句法**与**语义**的区别。句法问题涉及公式的形式结构以及不同类型的公式可以在什么条件下被推导出来。另一方面，语义问题涉及一个公式相对于某个真值赋值的**真**。

正如你可能预期的那样，在一阶逻辑的设定中我们也可以做出类似的区分。前两章主要关注句法，但一些语义思想已经悄悄渗入。回想一下我们以 $\mathbb{N}$ 为论域的运行示例，常量符号 $0, 1, 2, 3$，函数符号 $\mathit{add}$ 和 $\mathit{mul}$，以及谓词符号 $\mathit{even}, \mathit{prime}, \mathit{equals}, \mathit{le}$ 等。我们知道，如果 $\mathit{le}$ 被解释为自然数上的小于等于关系，那么句子 $\forall y \, \mathit{le}(0, y)$ 在这个例子中为真。但如果我们把论域改为 $\mathbb{Z}$ 而不是 $\mathbb{N}$，同一个公式就变成假的。句子 $\forall y \, \mathit{lt}(0, y)$ 在论域为 $\mathbb{N}$ 时也是假的，但如果我们（有点反常地）把谓词 $\mathit{lt}(x, y)$ 解释为自然数上的“$x$ 大于 $y$”关系，它反而会变成真的。

这表明，一阶句子的真假可以依赖于我们如何解释语言中的量词和基本关系。但有些公式在任何解释下都为真：例如，$\forall y (\mathit{le}(0, y) \to \mathit{le}(0, y))$ 在上面考虑的所有解释下都为真，实际上，在我们选择的任何解释下都为真。这样的句子称为**有效的**（valid）；它是命题逻辑中重言式在一阶逻辑中的对应物，即在每个可能的真值赋值下都为真。

我们可以扩展这个类比：一阶逻辑中的“模型”类似于命题逻辑中的真值赋值。在命题情形中，选择一个真值赋值使我们能够给语言中的所有公式指派真值；现在，选择一个模型将使我们能够给一阶语言中的所有句子指派真值。下一节的目标是让这个概念更精确。

## 10.1. 解释

我们运行示例中的语言符号——$0, 1, \mathit{add}, \mathit{prime}$ 等——具有非常明显的暗示性名称。当我们在论域 $\mathbb{N}$ 上解释这种语言的句子时，很清楚地知道对于哪些域元素 $\mathit{prime}$“应该”为真，对于哪些“应该”为假。但让我们考虑一种只有两个一元谓词符号 $\mathit{fancy}$ 和 $\mathit{tall}$ 的一阶语言。如果我们的论域是 $\mathbb{N}$，那么句子 $\forall x (\mathit{fancy}(x) \to \mathit{tall}(x))$ 是真还是假？

答案当然是我们没有足够的信息来判断。谓词 $\mathit{fancy}$ 和 $\mathit{tall}$ 没有明显的意义，至少当把它们应用到自然数时是如此。要理解这个句子的意义，我们需要知道哪些数是 fancy，哪些数是 tall。也许 10 的倍数是 fancy，偶数是 tall；在这种情况下，公式为真，因为每个 10 的倍数都是偶数。也许素数是 fancy，奇数是 tall；那么公式为假，因为 2 是 fancy 但不是 tall。

我们把每一种这样的描述称为谓词符号 $\mathit{fancy}$ 和 $\mathit{tall}$ 在论域 $\mathbb{N}$ 中的**解释**（interpretation）。形式上，一元谓词 $P$ 在论域 $D$ 中的解释是 $D$ 中使 $P$ 为真的元素组成的集合。例如，我们上面使用的 $\mathit{prime}$ 在 $\mathbb{N}$ 中的标准解释就是所有素数自然数组成的集合。

我们可以用类似的方式解释常量符号、函数符号和关系符号。常量符号 $c$ 在论域 $D$ 中的解释是 $D$ 中的一个元素。一个 $n$ 元函数符号 $f$ 的解释是一个把 $n$ 个 $D$ 中元素映射到 $D$ 中另一个元素的函数。一个 $n$ 元关系符号 $R$ 的解释是使 $R$ 为真的 $D$ 中 $n$ 元组组成的集合。

重要的是要强调句法谓词符号（或函数符号、常量符号）与它被解释到的语义谓词（或函数、对象）之间的区别。前者是一个符号，与其他符号相关联，在我们指定解释之前本身没有意义。严格来说，写 $\mathit{prime}(3)$ 是没有意义的，其中 $\mathit{prime}$ 是谓词符号而 $3$ 是自然数，因为 $\mathit{prime}$ 的参数应该是一个句法项。有时我们可能会模糊这种区别，例如上面我们指定了一种带有常量符号 $0, 1, 2$ 的语言。但域中的对象与我们用来表示它们的符号之间仍然存在根本区别。

有时，当我们在一个特定论域中解释一种语言时，隐式地引入新的常量符号来表示该论域的元素会很有用。具体地，对论域中的每个元素 $a$，我们引入一个常量符号 $\bar{a}$，它被解释为 $a$。那么表达式 $\mathit{prime}(\bar{3})$ 就有意义了。按自然方式解释谓词符号 $\mathit{prime}$，这个表达式将求值为真。我们把 $\bar{3}$ 看作代表自然数 3 的语言“名字”，就像短语“Aristotle”是代表古希腊哲学家的名字一样。

## 10.2. 模型中的真

固定一种一阶语言。假设我们已经选择了一个论域 $D$ 来解释该语言，并且在该语言每个符号的 $D$ 中都指定了解释。我们把这种结构——论域 $D$ 加上解释——称为该语言的**模型**（model）。一阶语言的模型直接类似于命题逻辑中的真值赋值，因为它提供了确定语言中每个句子真值所需的全部信息。

根据模型来评估一个句子真假的过程正如你所想，但形式描述很微妙。回想一下我们在[第 4 章](propositional_logic_in_lean.md)中做出的**项**与**断言**之间的区别。项，如 $a$、$x + y$ 或 $f(c)$，旨在表示对象。项没有真值，因为（例如）问 3 是真还是假是没有意义的。断言，如 $P(a)$、$R(x, f(y))$ 或 $a + b > a \land \mathit{prime}(c)$，把谓词或关系符号应用于项，产生可能为真或为假的陈述。

一个项在模型中的解释是该模型论域中的一个元素。模型直接指定了如何解释常量符号。要解释通过把函数符号应用于另一个项而创建的项 $f(t)$，我们先解释项 $t$，然后把 $f$ 的解释应用于这个项。（这个过程有意义，因为 $f$ 的解释是论域上的一个函数。）这以显然的方式推广到更高元的函数。我们还不解释包含自由变量如 $x$ 和 $y$ 的项，因为这些项不能确定论域中的唯一元素。（变量 $x$ 可能指任何对象。）

例如，假设我们有一种语言，有两个常量符号 $a$ 和 $b$，一个一元函数符号 $f$，以及一个二元函数符号 $g$。设 $\mathcal{M}$ 是以 $\mathbb{N}$ 为论域的模型，其中 $a$ 和 $b$ 分别被解释为 $3$ 和 $5$，$f(x)$ 被解释为把任何自然数 $n$ 映射到 $n^2$ 的函数，$g$ 是加法函数。那么项 $g(f(a), b)$ 表示自然数 $3^2 + 5 = 14$。

类似地，一个断言的解释是一个值 $\mathbf{T}$ 或 $\mathbf{F}$。为了简洁，这里我们引入新的记号：如果 $A$ 是一个断言，$\mathcal{M}$ 是 $A$ 的语言的一个模型，我们写 $\mathcal{M} \vDash A$ 表示 $A$ 在 $\mathcal{M}$ 中求值为 $\mathbf{T}$，写 $\mathcal{M} \not\vDash A$ 表示 $A$ 求值为 $\mathbf{F}$。（你可以把符号 $\vDash$ 读作“建模”“满足”或“验证”。）

要解释应用于某些项的谓词或关系，我们首先把这些项解释为论域中的对象，然后看关系符号的解释是否对这些对象成立。继续上面的例子，假设我们的语言还有一个关系符号 $R$，我们扩展 $\mathcal{M}$ 把 $R$ 解释成大于等于关系。那么有 $\mathcal{M} \not\vDash R(a, b)$，因为 3 不大于 5，但 $\mathcal{M} \vDash R(g(f(a), b), b)$，因为 14 大于 5。

使用逻辑联结词 $\land$、$\lor$、$\to$、$\neg$ 来解释表达式的方式与命题情形完全相同。$\mathcal{M} \vDash A \land B$ 当且仅当 $\mathcal{M} \vDash A$ 且 $\mathcal{M} \vDash B$，等等。

我们还需要解释存在和全称表达式。我们看到 $\exists x A$ 的直观意义是，存在论域中的某个元素，当我们把变量 $x$“替换”为这个元素时，$A$ 为真。为了更精确，我们说 $\mathcal{M} \vDash \exists x A$ 当且仅当存在 $\mathcal{M}$ 论域中的一个元素 $a$，使得当我们把 $x$ 解释为 $a$ 时，$\mathcal{M} \vDash A$。继续上面的例子，我们有 $\mathcal{M} \vDash \exists x R(x, b)$，因为当我们把 $x$ 解释为 6 时，$\mathcal{M} \vDash R(x, b)$。

更简洁地说，我们可以说 $\mathcal{M} \vDash \exists x A$ 当存在 $\mathcal{M}$ 论域中的 $a$ 使得 $\mathcal{M} \vDash A[\bar{a}/x]$。记号 $A[\bar{a}/x]$ 表示 $A$ 中 $x$ 的每次出现都被符号 $\bar{a}$ 替换。

最后，记住 $\forall x A$ 意味着 $A$ 对 $x$ 的所有可能取值都为真。我们精确地说：$\mathcal{M} \vDash \forall x A$ 当且仅当对 $\mathcal{M}$ 论域中的每个元素 $a$，把 $x$ 解释为 $a$ 都给出 $\mathcal{M} \vDash A$。等价地，$\mathcal{M} \vDash \forall x A$ 当对论域中的每个 $a$，都有 $\mathcal{M} \vDash A[\bar{a}/x]$。在上面的例子中，$\mathcal{M} \not\vDash \forall x R(x, b)$，因为当我们把 $x$ 解释为 2 时，没有 $\mathcal{M} \vDash R(x, b)$。

这些规则使我们能够确定任何**句子**在模型中的真值。（记住，句子是没有自由变量的公式。）有一些微妙之处：例如，我们隐含地假设公式不会两次量化同一个变量，如 $\forall x \exists x A$。但大多数情况下，解释过程告诉我们把公式“读作”直接谈论论域中的对象。

## 10.3. 例子

考虑一种简单的语言，没有常量符号，一个关系符号 $\leq$，一个二元函数符号 $+$。我们的模型 $\mathcal{M}$ 以 $\mathbb{N}$ 为论域，符号被解释为标准的小于等于关系和加法函数。

在阅读下面答案之前，先思考以下问题。记住，我们的论域是 $\mathbb{N}$，不是 $\mathbb{Z}$ 或任何其他数系。

1. $\mathcal{M} \vDash \exists x (x \leq x)$ 是否为真？$\mathcal{M} \vDash \forall x (x \leq x)$ 呢？
2. 类似地，$\mathcal{M} \vDash \exists x (x + x \leq x)$ 呢？$\mathcal{M} \vDash \forall x (x + x \leq x)$ 呢？
3. 句子 $\exists x \forall y (x \leq y)$ 和 $\forall x \exists y (x \leq y)$ 意思相同吗？它们是真还是假？
4. 你能想出一种这个语言中的公式 $A$，带一个自由变量 $x$，使得 $\mathcal{M} \vDash \forall x A$ 但 $\mathcal{M} \not\vDash \exists x A$ 吗？

这些问题表明了全称量词和存在量词之间一种微妙且常常 tricky 的相互作用。想了一会儿后，阅读答案：

1. 这两个陈述都为真。对前者，我们可以（例如）把 $x$ 解释为自然数 0。那么 $\mathcal{M} \vDash x \leq x$，所以存在量为真。对后者，任取一个自然数 $n$；当我们把 $x$ 解释为 $n$ 时，仍然有 $\mathcal{M} \vDash x \leq x$。
2. 第一个陈述为真，因为我们可以把 $x$ 解释为 0。但第二个陈述为假。当我们把 $x$ 解释为 1（或实际上任何非 0 自然数）时，会看到 $\mathcal{M} \not\vDash x + x \leq x$。
3. 这两个句子**不**意思相同，尽管在指定模型中两者都为真。第一个表达存在某个自然数小于等于每个自然数。这是真的：0 小于等于每个自然数。第二个句子说对每个自然数，都存在另一个自然数至少与它一样大。这再次为真：每个自然数 $a$ 都小于等于 $a$。如果我们把论域改为 $\mathbb{Z}$ 而不是 $\mathbb{N}$，第一个句子会为假，而第二个仍然为真。
4. 在我们的模型中，所描述的情况不可能发生。如果 $\mathcal{M} \vDash \forall x A$，那么 $\mathcal{M} \vDash A[\bar{0}/x]$，这蕴涵 $\mathcal{M} \vDash \exists x A$。这种情况唯一可能发生的时候是模型的论域为空。

现在考虑另一种语言，有常量符号 $2$、谓词符号 $\mathit{prime}$ 和 $\mathit{odd}$，以及二元关系 $\u003c$，按自然方式在论域 $\mathbb{N}$ 上解释。句子 $\forall x (2 < x \land \mathit{prime}(x) \to \mathit{odd}(x))$ 表达每个大于 2 的素数都是奇数这一事实。它是**相对化**的一个例子，在[7.4 节](first_order_logic.md#74-相对化与类)中讨论过。我们现在可以从语义上看到相对化如何工作。这个句子在我们的模型中为真，如果对每个自然数 $n$，把 $x$ 解释为 $n$ 都使句子为真。如果我们把 $x$ 解释为 0、1 或 2，或任何非素数，蕴涵的前件为假，因此 $2 < x \land \mathit{prime}(x) \to \mathit{odd}(x)$ 为真。否则，如果我们把 $x$ 解释为一个大于 2 的素数，蕴涵的前件和后件都为真，$2 < x \land \mathit{prime}(x) \to \mathit{odd}(x)$ 再次为真。因此全称陈述成立。正是这样的例子部分 motivation 了我们在[第 3 章](natural_deduction_for_propositional_logic.md)中对蕴涵语义的选择；任何其他选择都会使相对化不可能。

下一个例子，我们考虑由矩形“点”网格给出的模型。每个点有一种颜色（红、蓝或绿）和一种大小（小或大）。我们用字母 $R$ 表示大红点，$r$ 表示小红点，对 $G, g, B, b$ 类似。

描述我们点世界的逻辑语言有谓词 $\mathit{red}$、$\mathit{green}$、$\mathit{blue}$、$\mathit{small}$ 和 $\mathit{large}$，按显而易见的方式解释。关系 $\mathit{adj}(x, y)$ 为真当 $x$ 和 $y$ 所指的点相邻，不包括对角线。关系 $\mathit{same\text{-}color}(x, y)$、$\mathit{same\text{-}size}(x, y)$、$\mathit{same\text{-}row}(x, y)$ 和 $\mathit{same\text{-}column}(x, y)$ 也自解释。关系 $\mathit{left\text{-}of}(x, y)$ 为真当 $x$ 所指的点在 $y$ 所指的点的左边，无论这些点在哪一行。$\mathit{right\text{-}of}$、$\mathit{above}$、$\mathit{below}$ 的解释类似。

考虑以下句子：

1. $\forall x (\mathit{green}(x) \lor \mathit{blue}(x))$
2. $\exists x, y (\mathit{adj}(x, y) \land \mathit{green}(x) \land \mathit{green}(y))$
3. $\exists x ((\exists z \, \mathit{right\text{-}of}(z, x)) \land (\forall y (\mathit{left\text{-}of}(x, y) \to \mathit{blue}(y) \lor \mathit{small}(y))))$
4. $\forall x (\mathit{large}(x) \to \exists y (\mathit{small}(y) \land \mathit{adj}(x, y)))$
5. $\forall x (\mathit{green}(x) \to \exists y (\mathit{same\text{-}row}(x, y) \land \mathit{blue}(y)))$
6. $\forall x, y (\mathit{same\text{-}row}(x, y) \land \mathit{same\text{-}column}(x, y) \to x = y)$
7. $\exists x \forall y (\mathit{adj}(x, y) \to \neg \mathit{same\text{-}size}(x, y))$
8. $\forall x \exists y (\mathit{adj}(x, y) \land \mathit{same\text{-}color}(x, y))$
9. $\exists y \forall x (\mathit{adj}(x, y) \land \mathit{same\text{-}color}(x, y))$
10. $\exists x (\mathit{blue}(x) \land \exists y (\mathit{green}(y) \land \mathit{above}(x, y)))$

我们可以在下面这个特定模型中评估它们：

```
R r g b
R b G b
B B B b
```

它们在这个模型中的真值如下：

1. false
2. true
3. true
4. false
5. true
6. true
7. false
8. true
9. false
10. true

对每个句子，试着找一个使它为真的模型，再找另一个使它为假的模型。作为额外挑战，试着让所有句子同时为真。注意你可以使用任意数量的行和列。

## 10.4. 有效性与逻辑后承

我们已经看到，一个公式是真是假常常取决于我们选择的模型。但有些公式在每个可能的模型中都为真。我们之前看到的一个例子是 $\forall y (\mathit{le}(0, y) \to \mathit{le}(0, y))$。为什么这个句子是有效的？假设 $\mathcal{M}$ 是该语言的任意模型，$a$ 是 $\mathcal{M}$ 论域中的任意元素。要么 $\mathcal{M} \vDash \mathit{le}(0, \bar{a})$，要么 $\mathcal{M} \vDash \neg \mathit{le}(0, \bar{a})$。无论哪种情况，蕴涵的命题语义都保证 $\mathcal{M} \vDash \mathit{le}(0, \bar{a}) \to \mathit{le}(0, \bar{a})$。我们经常写 $\vDash A$ 表示 $A$ 是有效的。

在命题情形中，有一种简单方法判断一个公式是否是重言式。写出真值表并检查是否有以 $\mathbf{F}$ 结尾的行，这是算法化的，而且从一开始我们就知道真值表会有多大。不幸的是，我们不能对一阶公式做同样的事。任何语言都有无穷多个模型，所以“一阶”真值表会无限长。更糟糕的是，即使检查一个公式在单个模型中是否为真也可能是一个非算法任务。要判断像 $\forall x P(x)$ 这样的全称陈述在一个具有无限论域的模型中是否为真，我们可能需要检查 $P$ 对无穷多个元素是否为真。

这并不是说我们就**永远**无法判断一个一阶句子是否是重言式。例如，我们已经论证过 $\forall y (\mathit{lt}(0, y) \to \mathit{lt}(0, y))$ 是一个重言式。只是这比命题逻辑更困难。

与命题逻辑一样，我们可以把有效性概念扩展为逻辑后承概念。固定一种一阶语言 $L$。假设 $\Gamma$ 是 $L$ 中的一组句子，$A$ 是 $L$ 中的一个句子。我们说 $A$ **是** $\Gamma$ **的逻辑后承**，如果每个 $\Gamma$ 的模型都是 $A$ 的模型。这是说明 $A$ 是 $\Gamma$ 的“必然后承”的一种方式：在任何解释下，如果假设 $\Gamma$ 为真，那么 $A$ 也为真。

## 10.5. 可靠性与完全性

在命题逻辑中，我们看到可证公式与重言式之间有密切联系——具体地，一个公式可证当且仅当它是重言式。更一般地，我们说公式 $A$ 是一组假设 $\Gamma$ 的逻辑后承，当且仅当存在从 $\Gamma$ 到 $A$ 的自然演绎证明。事实证明，类似的陈述对一阶逻辑也成立。

“可靠性”方向——即如果 $A$ 可从 $\Gamma$ 证明，那么 $A$ 在 $\Gamma$ 的任何模型中都为真——成立的原因与命题情形类似。具体地，证明通过展示自然演绎的每条规则都保持模型中的真值来进行。

一阶逻辑的完全性定理由 Kurt Gödel 在 1929 年的博士论文中首次证明。后来 Leon Henkin 给出了另一个更简单的证明。

---

**定理。** 如果公式 $A$ 是一组句子 $\Gamma$ 的逻辑后承，那么 $A$ 可从 $\Gamma$ 证明。

---

与命题逻辑版本相比，一阶完全性定理更难证明。这里我们不会深入太多细节，但会指出一些主要思想。一组句子如果不能从这些假设证明出矛盾，就称为**一致的**。Henkin 证明中的大部分工作由以下“模型存在性”定理完成：

---

**定理。** 每个一致的句子集合都有一个模型。

---

从这个定理很容易推出完全性定理。假设不存在从 $\Gamma$ 到 $A$ 的证明。那么集合 $\Gamma \cup \{ \neg A \}$ 是一致的。（如果我们能从 $\Gamma \cup \{ \neg A \}$ 证明出 $⊥$，那么根据 *reductio ad absurdum* 规则，我们就能从 $\Gamma$ 证明出 $A$。）根据模型存在性定理，这意味着存在 $\Gamma \cup \{ \neg A \}$ 的一个模型 $\mathcal{M}$。但这是 $\Gamma$ 的一个模型却不是 $A$ 的模型，也就是说 $A$ 不是 $\Gamma$ 的逻辑后承。

模型存在性定理的证明很复杂。不知何故，我们必须从一组一致的句子构造一个模型。策略是用句法实体来构造模型，换言之，用扩展语言中的项作为论域的元素。

这里的寓意与命题逻辑大致相同。因为我们心中已有某种语义而发展了句法规则，所以两者展示了同一枚硬币的不同面：可证的句子恰好是在所有模型中为真的句子，从一组假设可证的句子恰好是在这些假设的所有模型中为真的句子。

因此我们有另一种方式来回答上一节提出的问题。要证明一个句子是有效的，无需检查它在每个可能模型中的真值；相反，给出一个证明就足够了。

## 10.6. 练习

1. 在带二元关系 $R(x, y)$ 的一阶语言中，考虑以下句子：

   - $\exists x \forall y R(x, y)$
   - $\exists y \forall x R(x, y)$
   - $\forall x, y (R(x, y) \land x \neq y \to \exists z (R(x, z) \land R(z, y) \land x \neq z \land y \neq z))$

   对以下每个结构，判断这些句子中哪些为真、哪些为假。

   - 结构 $(\mathbb{N}, \leq)$，即在自然数中把 $R$ 解释为 $\leq$
   - 结构 $(\mathbb{Z}, \leq)$
   - 结构 $(\mathbb{Q}, \leq)$
   - 结构 $(\mathbb{N}, \mid)$，即在自然数中把 $R$ 解释为“整除”关系
   - 结构 $(\mathcal{P}(\mathbb{N}), \subseteq)$，即变量取值于自然数集合，$R$ 解释为子集关系

2. 创建一个 $4 \times 4$ 的“点”世界，使以下所有句子都为真：

   - $\forall x (\mathit{green}(x) \lor \mathit{blue}(x))$
   - $\exists x, y (\mathit{adj}(x, y) \land \mathit{green}(x) \land \mathit{green}(y))$
   - $\exists x (\exists z \, \mathit{right\text{-}of}(z, x) \land \forall y (\mathit{left\text{-}of}(x, y) \to \mathit{blue}(y) \lor \mathit{small}(y)))$
   - $\forall x (\mathit{large}(x) \to \exists y (\mathit{small}(y) \land \mathit{adj}(x, y)))$
   - $\forall x (\mathit{green}(x) \to \exists y (\mathit{same\text{-}row}(x, y) \land \mathit{blue}(y)))$
   - $\forall x, y (\mathit{same\text{-}row}(x, y) \land \mathit{same\text{-}column}(x, y) \to x = y)$
   - $\exists x \forall y (\mathit{adj}(x, y) \to \neg \mathit{same\text{-}size}(x, y))$
   - $\forall x \exists y (\mathit{adj}(x, y) \land \mathit{same\text{-}color}(x, y))$
   - $\exists y \forall x (\mathit{adj}(x, y) \to \mathit{same\text{-}color}(x, y))$
   - $\exists x (\mathit{blue}(x) \land \exists y (\mathit{green}(y) \land \mathit{above}(x, y)))$

3. 固定一种一阶语言 $L$，设 $A$ 和 $B$ 是 $L$ 中的任意两个句子。记住 $\vDash A$ 表示 $A$ 有效。展开定义，证明如果 $\vDash A \land B$，那么 $\vDash A$ 且 $\vDash B$。

4. 给出一个具体例子说明 $\vDash A \lor B$ 不一定蕴涵 $\vDash A$ 或 $\vDash B$。换言之，选择一种语言 $L$ 和特定的句子 $A$、$B$，使得 $A \lor B$ 有效但 $A$ 和 $B$ 都无效。

5. 考虑三个公式 $\forall x R(x, x)$、$\forall x \forall y (R(x, y) \to R(y, x))$、$\forall x \forall y \forall z (R(x, y) \land R(y, z) \to R(x, z))$。这些句子分别说 $R$ 是自反的、对称的、传递的。对每对句子，找一个模型使这两个句子为真而第三个为假。这表明这些句子在逻辑上是独立的：没有一个能被其他句子推出。

6. 证明如果一组公式 $\{ \psi_1, \ldots, \psi_n \}$ 是语义不一致的，那么它推出每个公式 $\phi$。反过来也成立吗？

7. 给出一个公式 $\psi$，使得集合 $\{ P(c), \neg P(D), \psi \}$ 一致，并且集合 $\{ P(c), \neg P(D), \neg \psi \}$ 也一致。

8. 对以下每个公式，判断它是有效的、可满足的，还是不可满足的。

   - $\exists x \forall y (R(y, x) \land R(x, y))$
   - $(\exists x \forall y R(x, y)) \to (\exists x \exists y R(x, y))$
   - $(\exists x P(x)) \land (\exists x \neg P(x))$
