# 第 8 章：一阶逻辑的自然演绎

> 本译文对应原书 [Natural Deduction for First Order Logic](https://leanprover.github.io/logic_and_proof/natural_deduction_for_first_order_logic.html)；英文 Sphinx 源：`natural_deduction_for_first_order_logic.rst`。

## 8.1. 推理规则

在上一章中，我们讨论了一阶逻辑的语言及其使用规则。这里我们总结如下：

_全称量词：_

![推理规则 1](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_first_order_logic.1.png)

在引入规则中，$x$ 不应在任何未取消的假设中自由出现。在消去规则中，$t$ 可以是任何不与 $A$ 中约束变量冲突的项。

_存在量词：_

![推理规则 2](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_first_order_logic.2.png)

在引入规则中，$t$ 可以是任何不与 $A$ 中约束变量冲突的项。在消去规则中，$y$ 不应在 $B$ 或任何未取消的假设中自由出现。

_相等：_

![推理规则 3](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_first_order_logic.3.png)

严格来说，只有 $refl$ 和第二条替换规则是必需的，其他规则都可以从它们推导出来。

## 8.2. 全称量词

下面的自然演绎证明例子表明：如果对每个 $x$，$A(x)$ 成立，并且对每个 $x$，$B(x)$ 成立，那么对每个 $x$，它们都成立：

![推理规则 4](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_first_order_logic.4.png)

注意假设 1 和 2 都没有提到 $y$，因此在引入全称量词时，$y$ 确实是“任意的”。

这是另一个例子：

![推理规则 5](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_first_order_logic.5.png)

作为练习，试证明：

$$
\forall x (A(x) \to B(x)) \to (\forall x A(x) \to \forall x B(x)).
$$

这里有一个更具挑战性的练习。假设我告诉你，在某个镇上有一个（男）理发师，他给所有且只给那些不给自己刮脸的男人刮脸。你可以证明这是一个矛盾，非正式地论证如下：

> 根据假设，理发师给自己刮脸当且仅当他不给自己刮脸。称此陈述为 (*)。
>
> 假设理发师给自己刮脸。由 (*)，这蕴涵他不给自己刮脸，矛盾。所以，理发师不给自己刮脸。
>
> 但再次使用 (*)，这蕴涵理发师给自己刮脸，与我们刚刚证明的事实——即理发师不给自己刮脸——矛盾。

试把这个论证转化为自然演绎中的形式证明。

让我们回到自然数的例子，看看演绎概念如何在其中发挥作用。假设我们以某种方式定义了 $\mathit{even}$ 和 $\mathit{odd}$，使得我们可以证明：

- $\forall n (\neg \mathit{even}(n) \to \mathit{odd}(n))$
- $\forall n (\mathit{odd}(n) \to \neg \mathit{even}(n))$

那么我们可以继续推导 $\forall n (\mathit{even}(n) \lor \mathit{odd}(n))$：

![推理规则 6](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_first_order_logic.6.png)

我们还可以证明 $\forall n \neg(\mathit{even}(n) \land \mathit{odd}(n))$：

![推理规则 7](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_first_order_logic.7.png)

随着我们从建模基本推理规则转向建模实际数学证明，我们将倾向于把注意力从自然演绎转移到 Lean 中的形式证明。自然演绎有其用处：作为逻辑推理的模型，它为我们提供了一种方便的手段来研究可靠性和完全性等元理论性质。然而，对于在系统内**实际工作**而言，像 Lean 这样的证明语言往往更具可扩展性，并能产生更可读的证明。

## 8.3. 存在量词

记住，存在量词消去规则背后的直觉是：如果我们知道 $\exists x A(x)$，我们可以暂时对一个满足 $A(y)$ 的任意元素 $y$ 进行推理，以证明一个不依赖于 $y$ 的结论。这里有一个如何使用它的例子。下一个证明表明，如果我们知道存在同时满足 $A$ 和 $B$ 的东西，那么我们就知道，特别地，存在满足 $A$ 的东西。

![推理规则 8](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_first_order_logic.8.png)

下面的证明表明，如果存在满足 $A$ 或 $B$ 的东西，那么要么存在满足 $A$ 的东西，要么存在满足 $B$ 的东西。

![推理规则 9](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_first_order_logic.9.png)

下面的例子更复杂一些：

![推理规则 10](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_first_order_logic.10.png)

在这个证明中，存在消去规则（标号为 3 的那一行）被用来同时取消两个假设。注意，当应用这条规则时，假设 $\forall x (A(x) \to \neg B(x))$ 尚未被取消。因此我们必须确保这个公式不包含自由出现的变量 $x$。但这是没问题的，因为这个假设只把 $x$ 作为约束变量。

另一个例子是，如果 $x$ 不在 $P$ 中出现，那么 $\exists x P$ 等价于 $P$：

![推理规则 11](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_first_order_logic.11.png)

这个证明很短但有点 tricky，让我们仔细过一遍。左边，我们假设 $\exists x P$ 来得出 $P$。我们假设 $P$，现在可以立即通过存在消去取消这个假设，因为 $x$ 不在 $P$ 中出现，所以它不在任何假设或结论中自由出现。右边我们用存在引入从 $P$ 推出 $\exists x P$。

## 8.4. 相等

回顾一下自然演绎中的相等规则：

![推理规则 12](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_first_order_logic.12.png)

记住，我们隐式地固定了某个一阶语言，$r$、$s$、$t$ 是该语言中的任意项。还要记住，我们已经采用了对项使用函数记法的做法。例如，如果我们把 $r(x)$ 看作算术语言中的项 $(x + y) \times (z + 0)$，那么 $r(0)$ 是项 $(0 + y) \times (z + 0)$，$r(u + v)$ 是 $((u + v) + y) \times (z + 0)$。所以第二行第一个推理的一个例子是：

![推理规则 13](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_first_order_logic.13.png)

同一行第二个公理类似，只是现在 $P(x)$ 代表任意**公式**，如下推理所示：

![推理规则 14](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_first_order_logic.13a.png)

注意我们把自反性公理 $t = t$ 写成了一个没有前提的规则。如果你在证明中使用它，它不算作假设；它内建于逻辑中。

事实上，我们可以把第二行第一个推理看作第二个推理的特例。例如，考虑公式 $((u + v) + y) \times (z + 0) = (x + y) \times (z + 0)$。如果我们把 $u + v$ 代入 $x$，就得到自反性的一个实例。如果我们代入 $0$，就得到上面第一个例子的结论。因此，以下只用自反性和上面第二条替换规则就能推导出第一个推理：

![推理规则 15](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_first_order_logic.14.png)

粗略地说，我们在自反性的一个实例中把第二个 $u + v$ 替换为 $0$，以得到我们想要的结论。

相等规则使我们能够在符号逻辑中进行计算。这通常包括使用我们已经讨论过的相等规则，以及一系列一般恒等式。例如，以下恒等式对任意实数 $x$、$y$、$z$ 成立：

- 加法交换律：$x + y = y + x$
- 加法结合律：$(x + y) + z = x + (y + z)$
- 加法单位元：$x + 0 = 0 + x = x$
- 加法逆元：$-x + x = x + -x = 0$
- 乘法单位元：$x \cdot 1 = 1 \cdot x = x$
- 乘法交换律：$x \cdot y = y \cdot x$
- 乘法结合律：$(x \cdot y) \cdot z = x \cdot (y \cdot z)$
- 分配律：$x \cdot (y + z) = x \cdot y + x \cdot z$，$(x + y) \cdot z = x \cdot z + y \cdot z$

你应该想象每个陈述前面都有隐式的全称量词，断言该陈述对 $x$、$y$、$z$ 的**任意**取值成立。注意 $x$、$y$、$z$ 特别地也可以是整数或有理数。涉及实数、有理数或整数的计算通常都涉及这样的恒等式。

策略是使用全称量词消去规则来实例化一般恒等式，必要时使用对称性把等式调整到正确方向，然后使用相等的替换规则来改变先前结果中的某部分。例如，下面是一个简单恒等式 $\forall x, y, z ((x + y) + z = (x + z) + y)$ 的自然演绎证明，只使用加法的交换律和结合律。我们用简短的名字表示相关恒等式，并把全称量词引入和消去的多个实例合并为一步。

![推理规则 16](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_first_order_logic.15.png)

在自然演绎中进行这样的计算通常没有什么值得学习的，但你可以试一两个例子来掌握要领，然后就可以欣慰地知道这是可能的。

## 8.5. 反例与相对化量词

考虑陈述：

> 每个素数都是奇数。

在一阶逻辑中，我们可以把它形式化为 $\forall p (\mathit{prime}(p) \to \mathit{odd}(p))$。这个陈述是假的，因为存在一个偶素数，即数字 2。这称为该陈述的一个**反例**（counterexample）。

更一般地，给定公式 $\forall x A(x)$，一个反例是一个值 $t$，使得 $\neg A(t)$ 成立。这样的反例表明原公式为假，因为我们有如下等价关系：$\neg \forall x A(x) \leftrightarrow \exists x \neg A(x)$。所以如果我们找到一个值 $t$ 使得 $\neg A(t)$ 成立，那么根据存在引入规则我们可以推出 $\exists x \neg A(x)$，再由上述等价关系就有 $\neg \forall x A(x)$。下面是该等价关系的证明：

![推理规则 17](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_first_order_logic.16.png)

关于这个证明有一个说明：在标号为 4 的那一步，我们**不能**使用存在引入规则，因为那时我们唯一的假设是 $\neg \forall x A(x)$，而从这个假设我们无法证明某个特定项 $t$ 满足 $\neg A(t)$。所以我们在那里使用反证法。

作为练习，自己证明其对偶等价：$\neg \exists x A(x) \leftrightarrow \forall x \neg A(x)$。这可以在不使用反证法的情况下完成。

在[第 7 章](first_order_logic.md)中，我们看到了如何用相对化来限制全称量词的作用域。假设我们想说“每个素数都大于 1”。在一阶逻辑中这可以写成 $\forall n (\mathit{prime}(n) \to n > 1)$。原因是原陈述等价于“对每个自然数，如果它是素数，那么它大于 1”。类似地，假设我们想说“存在一个大于 100 的素数”。这等价于“存在一个自然数，它是素数且大于 100”，可以表达为 $\exists n (\mathit{prime}(n) \land n > 100)$。

作为练习，你可以证明关于量词否定的上述结果对相对化量词也成立。具体地，证明以下陈述：

- $\neg \exists x (A(x) \land B(x)) \leftrightarrow \forall x (A(x) \to \neg B(x))$
- $\neg \forall x (A(x) \to B(x)) \leftrightarrow \exists x (A(x) \land \neg B(x))$

作为参考，下面是一组涉及量词的有效句子：

- $\forall x A \leftrightarrow A$，若 $x$ 不在 $A$ 中自由出现
- $\exists x A \leftrightarrow A$，若 $x$ 不在 $A$ 中自由出现
- $\forall x (A(x) \land B(x)) \leftrightarrow \forall x A(x) \land \forall x B(x)$
- $\exists x (A(x) \land B) \leftrightarrow \exists x A(x) \land B$，若 $x$ 不在 $B$ 中自由出现
- $\exists x (A(x) \lor B(x)) \leftrightarrow \exists x A(x) \lor \exists x B(x)$
- $\forall x (A(x) \lor B) \leftrightarrow \forall x A(x) \lor B$，若 $x$ 不在 $B$ 中自由出现
- $\forall x (A(x) \to B) \leftrightarrow (\exists x A(x) \to B)$，若 $x$ 不在 $B$ 中自由出现
- $\exists x (A(x) \to B) \leftrightarrow (\forall x A(x) \to B)$，若 $x$ 不在 $B$ 中自由出现
- $\forall x (A \to B(x)) \leftrightarrow (A \to \forall x B(x))$，若 $x$ 不在 $A$ 中自由出现
- $\exists x (A(x) \to B) \leftrightarrow (A(x) \to \exists x B)$，若 $x$ 不在 $B$ 中自由出现
- $\exists x A(x) \leftrightarrow \neg \forall x \neg A(x)$
- $\forall x A(x) \leftrightarrow \neg \exists x \neg A(x)$
- $\neg \exists x A(x) \leftrightarrow \forall x \neg A(x)$
- $\neg \forall x A(x) \leftrightarrow \exists x \neg A(x)$

所有这些都可以在自然演绎中推导出来。最后两条允许我们把否定向内推进，从而继续把一阶公式化为否定范式。其他规则允许我们把量词移到公式最前面，不过一般来说会有多种方式。例如，公式

$$
\forall x A(x) \to \exists y \forall z B(y, z)
$$

等价于

$$
\exists x, y \forall z (A(x) \to B(y, z))
$$

也等价于

$$
\exists y \forall z \exists x (A(x) \to B(y, z)).
$$

所有量词都在前面的公式称为**前束范式**（prenex form）。

## 8.6. 练习

1. 给出

$$
\forall x (A(x) \to B(x)) \to (\forall x A(x) \to \forall x B(x))
$$

的自然演绎证明。

2. 从假设 $\forall x (A(x) \lor B(x))$ 和 $\forall y \neg A(y)$ 给出 $\forall x B(x)$ 的自然演绎证明。

3. 从假设 $\forall x (\mathit{even}(x) \lor \mathit{odd}(x))$ 和 $\forall x (\mathit{odd}(x) \to \mathit{even}(s(x)))$ 给出 $\forall x (\mathit{even}(x) \lor \mathit{even}(s(x)))$ 的自然演绎证明。（可以把 $s(x)$ 看作由 $s(x) = x + 1$ 定义的函数。）

4. 给出 $\exists x A(x) \lor \exists x B(x) \to \exists x (A(x) \lor B(x))$ 的自然演绎证明。

5. 从假设 $\exists x (A(x) \land B(x))$ 和 $\forall x (A(x) \land B(x) \to C(x))$ 给出 $\exists x (A(x) \land C(x))$ 的自然演绎证明。

6. 证明上一节中的其他一些等价式。

7. 考虑用一阶逻辑表达“没有人信任政客”的各种方式：

   - $\forall x (\mathit{politician}(x) \to \forall y (\neg \mathit{trusts}(y, x)))$
   - $\forall x, y (\mathit{politician}(x) \to \neg \mathit{trusts}(y, x))$
   - $\neg \exists x, y (\mathit{politician}(x) \land \mathit{trusts}(y, x))$
   - $\forall x, y (\mathit{trusts}(y, x) \to \neg \mathit{politician}(x))$

   它们在逻辑上是等价的。请为第二个和第四个给出从对方出发的自然演绎证明。（作为捷径，在 $\forall$ 引入和消去规则中，你可以一步引入/消去两个变量。）

8. 形式化以下陈述，并给出一个自然演绎证明，其中前三条陈述作为（未取消的）假设出现，最后一行是结论：

   - 每个年轻且健康的人都喜欢棒球。
   - 每个活跃的人都是健康的。
   - 有人既年轻又活跃。
   - 因此，有人喜欢棒球。

   使用 $Y(x)$ 表示“年轻”，$H(x)$ 表示“健康”，$A(x)$ 表示“活跃”，$B(x)$ 表示“喜欢棒球”。

9. 使用 [8.4 节](natural_deduction_for_first_order_logic.md#84-相等) 中的相等规则，给出 $\forall x, y, z (x = z \to (y = z \to x = y))$ 的自然演绎证明。

10. 仅使用以下两个假设（不使用新的相等规则），给出 $\forall x, y (x = y \to y = x)$ 的自然演绎证明：

    - $\forall x (x = x)$
    - $\forall u, v, w (u = w \to (v = w \to u = v))$

    （提示：仔细选择 $u$、$v$、$w$ 的实例。你可以一步实例化所有全称量词，如上次作业那样。）

11. 给出 $\neg \exists x (A(x) \land B(x)) \leftrightarrow \forall x (A(x) \to \neg B(x))$ 的自然演绎证明。

12. 给出 $\neg \forall x (A(x) \to B(x)) \leftrightarrow \exists x (A(x) \land \neg B(x))$ 的自然演绎证明。

13. 记住以下两种形式都表达 $\exists! x A(x)$，即存在唯一的 $x$ 满足 $A(x)$：

    - $\exists x (A(x) \land \forall y (A(y) \to y = x))$
    - $\exists x A(x) \land \forall y \forall y' (A(y) \land A(y') \to y = y')$

    完成以下任务：

    - 假设第一个成立，给出第二个的自然演绎证明。
    - 假设第二个成立，给出第一个的自然演绎证明。

    （警告：这些证明很长。）
