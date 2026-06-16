# 第 3 章：命题逻辑的自然演绎

> 本译文对应原书 [Natural Deduction for Propositional Logic](https://leanprover.github.io/logic_and_proof/natural_deduction_for_propositional_logic.html)；英文 Sphinx 源：`natural_deduction_for_propositional_logic.rst`。

回顾上一章的论证，直观地说，有些推理是**有效的**（valid），有些则不是。例如，如果在推理链中我们已经确立了“\(A\) 并且 \(B\)”，那么得出 \(B\) 似乎非常合理。如果我们已经确立了 \(A\)、\(B\) 以及“如果 \(A\) 并且 \(B\) 那么 \(C\)”，那么得出 \(C\) 也是合理的。另一方面，如果我们只确立了“\(A\) 或 \(B\)”，在没有进一步信息的情况下，我们无权得出 \(B\)。

符号逻辑的任务是发展一个精确的数学理论，解释哪些推理是有效的以及为什么有效。阐明有效性概念有两种一般方法。本章我们将考虑**演绎**方法：一个推理是有效的，如果它能被基本推理规则证明，而这些规则反映了所涉及逻辑项的意义。在[第 6 章](semantics_of_propositional_logic.md)我们将考虑“语义”方法：一个推理是有效的，如果它是一个模式的实例，该模式在前提为真时总是产生真的结论。

## 3.1. 自然演绎中的推导

我们已经看到，命题逻辑的语言允许我们用命题变量 \(A, B, C, \ldots\) 和命题联结词 \(\rightarrow\)、\(\land\)、\(\lor\)、\(\neg\) 来构造表达式。现在我们将考虑一种形式演绎系统，用来**证明**命题公式。这样的系统有很多；我们将使用的是由 Gerhard Gentzen 在 1930 年代设计的**自然演绎**（natural deduction）。

在自然演绎中，每个证明都是从一个**假设**集出发的证明。换言之，在任何证明中，都有一个有限假设集 \(\{ B, C, \ldots \}\) 和一个结论 \(A\)；证明所表明的是 \(A\) 从 \(B, C, \ldots\) 推出。

与公式一样，证明也是按照规则把较小的证明组合起来而构成的。例如，合取引入规则

![推理规则 1](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.1.png)

应这样理解：如果你有一个从某些假设证明 \(A\) 的证明 \(P_{1}\)，以及一个从某些假设证明 \(B\) 的证明 \(P_{2}\)，那么你可以用这条规则把它们组合起来，得到一个证明 \(A \land B\) 的证明，它使用 \(P_{1}\) 和 \(P_{2}\) 中的所有假设。例如，下面是一个从三个假设 \(A\)、\(B\)、\(C\) 证明 \((A \land B) \land (A \land C)\) 的证明：

![推理规则 2](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.2.png)

在某些自然演绎的表述中，证明被写成一行行的序列，每一行都可以引用前面的任意行作为依据。但这里我们采用严格的二维图式格式，每个推理的前提都直接出现在结论上方。这样便于审阅证明并检查其正确性：每个推理都应当是把某条规则中的字母用特定公式实例化的结果。

自然演绎令人困惑的一点是，当你以这种方式组合证明时，假设可以被消去，或者如我们所说，被**取消**（canceled）。例如，我们可以对上面的最后一个证明应用蕴涵引入规则，得到下面这个只从**两个**假设 \(A\) 和 \(C\) 证明 \(B \to (A \land B) \land (A \land C)\) 的证明：

![推理规则 3](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.3.png)

这里我们用标签 1 标示假设 \(B\) 被取消的位置。任何标签都可以，不过我们倾向于用数字。

我们可以继续取消假设 \(A\)：

![推理规则 4](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.4.png)

结果是一个只使用假设 \(C\) 的证明。我们还可以继续取消这个假设：

![推理规则 5](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.5.png)

最终得到的证明不使用任何假设。换言之，它无条件地确立了结论。

注意，在第二步中，我们取消了两个假设 \(A\) 的“副本”。在自然演绎中，我们可以选择取消哪些假设；也可以只取消其中一个，而让另一个假设保持**开放**。事实上，我们还可以在执行蕴涵引入规则时取消**零个**假设。例如，下面是从假设 \(B\) 证明 \(A \to B\) 的一个简短证明：

![推理规则 6](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.6.png)

在这个证明中，零个 \(A\) 的副本被取消。

还要注意，虽然我们上面用 \(A\)、\(B\)、\(C\) 等字母作为命题变量，但在这些证明中我们可以用任意命题公式替换它们。例如，我们可以把每个 \(A\) 替换为公式 \((D \lor E)\)，仍然得到正确的证明。在某些逻辑表述中，命题变量和任意命题公式使用不同的字母，但我们将继续模糊这一区分。你可以把 \(A\)、\(B\)、\(C\) 看作命题变量或公式，随你喜欢。如果你把它们看作命题变量，只需记住：在任何规则或证明中，你都可以把每个变量替换成不同的公式，仍然得到有效的规则或证明。

最后还要注意，在这些例子中，我们默认了一条特殊的规则作为构建证明的起点。它称为**假设规则**（assumption rule），形式如下：

![推理规则 7](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.7.png)

它的意思是，在任何时候我们都可以自由地假设一个公式 \(A\)。单个公式 \(A\) 就构成一个只有一行的证明，其读法是：假设 \(A\)，我们已证明了 \(A\)。

上一章给出的其余推理规则总结如下。

_蕴涵：_

![推理规则 8](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.8.png)

_合取：_

![推理规则 9](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.9.png)

_否定：_

![推理规则 10](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.10.png)

_析取：_

![推理规则 11](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.11.png)

_真与假：_

![推理规则 12](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.12.png)

_双向蕴涵：_

![推理规则 13](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.13.png)

_归谬法（反证法）：_

![推理规则 14](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.14.png)

## 3.2. 示例

让我们再看一些自然演绎证明的例子。每个例子中，你都应该思考公式在说什么，以及每一步使用了哪条推理规则。同时密切注意每个阶段取消了哪些假设。如果你看证明树的任何一个节点，那么在该点已确立的是：该断言从它上方所有尚未被取消的假设推出。

下面是从 \(A \to B\) 和 \(B \to C\) 证明 \(A \to C\) 的一个证明：

![推理规则 15](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.15.png)

直观上，公式

$$
(A \to B) \land (B \to C) \to (A \to C)
$$

“内化”了前一个证明的结论。符号 \(\land\) 用来组合假设，符号 \(\to\) 用来表达右边是左边的后承。下面是该公式的一个证明：

![推理规则 16](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.16.png)

下一个证明表明，如果一个结论 \(C\) 从 \(A\) 和 \(B\) 推出，那么它也从它们的合取推出。

![推理规则 17](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.17.png)

下一个证明的结论可以解释为：如果不是 \(A\) 或 \(B\) 中至少一个为真，那么它们都为假。它展示了否定规则的使用。

![推理规则 18](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.19.png)

最后，下面两个例子展示了 *ex falso* 规则的使用。第一个是从 \(\neg A\) 和 \(A\) 推导出任意公式 \(B\)：

![推理规则 19](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.20.png)

第二个表明 \(B\) 从 \(A\) 和 \(\neg A \lor B\) 推出：

![推理规则 20](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.21.png)

在某些证明系统中，这些规则被当作系统的一部分。但在我们的系统中不需要这样做：这两个例子表明，这些规则可以从我们的其他规则中**推导**出来。

## 3.3. 前向与后向推理

自然演绎旨在刻画我们进行推理和论证时的理想化模式，例如上一章解逻辑谜题时的模式。显然存在差异：我们用符号和二维图式描述自然演绎证明，而非正式论证则用词语和段落写成。但值得反思的是，这个模型**确实**捕捉到了什么。自然演绎应当澄清我们逻辑论证的**形式**和**结构**，描述证明结论的恰当方式，并解释我们所用规则在何种意义上有效。

构造自然演绎证明可能令人困惑，但思考一下**为什么**会困惑是有帮助的。例如，我们可以断定自然演绎不是逻辑推理的好模型。或者，我们也可能得出结论：自然演绎令人困惑的特征恰恰告诉我们关于日常论证的一些有趣事实。

在“官方”描述中，自然演绎证明是通过把小证明组合成大证明来构造的。要证明 \(A \land B \to B \land A\)，我们从假设 \(A \land B\) 出发。然后我们分别构造下面两个证明：

![推理规则 21](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.22.png)

然后用这两个证明构造下面的证明：

![推理规则 22](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.23.png)

最后，我们对这个证明应用蕴涵引入规则，取消假设，得到期望的结论：

![推理规则 23](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.24.png)

这个过程类似于非正式论证中发生的情况：我们从一些假设出发，向前推进，直到得出结论。

---

假设 Susan 很高，并且 John 很高兴。

那么，特别地，John 很高兴。

同时，Susan 很高。

所以 John 很高兴并且 Susan 很高。

因此我们已经证明：如果 Susan 很高并且 John 很高兴，那么 John 很高兴并且 Susan 很高。

---

然而，当我们**阅读**自然演绎证明时，我们通常**倒着**读。首先，我们看底部，看要证明什么。然后我们看用于证明它的规则，以及该规则要求哪些前提。然后我们看这些断言又是如何证明的，依此类推。同样，当我们**构造**自然演绎证明时，我们通常也**倒着**进行：从我们要证明的断言出发，把它放在底部，然后寻找可应用的规则。

有时这个过程会受阻。假设剩下的目标是一个单独的命题变量 \(A\)。没有引入规则可以应用，所以除非 \(A\) 是假设，否则它必须来自消去规则。但这个问题是不确定的：也许 \(A\) 来自对 \(A \land B\) 应用合取消去规则，或者来自对 \(C\) 和 \(C \to A\) 应用蕴涵消去规则。此时，我们转向假设，开始**向前**推进。例如，如果我们的假设是 \(C\) 和 \(C \to A \land B\)，我们会向前推进，先得到 \(A \land B\)，再得到 \(A\)。

因此，在自然演绎中证明定理有一个一般性启发式：

1. 从结论出发**向后**工作，使用引入规则。例如，如果你要证明形如 \(A \to B\) 的陈述，把 \(A\) 加入假设列表并尝试推导 \(B\)。如果你要证明形如 \(A \land B\) 的陈述，使用合取引入规则把任务归结为证明 \(A\)，然后证明 \(B\)。

2. 当第一步无事可做时，使用消去规则**向前**工作。如果你有假设 \(A \to B\) 和 \(A\)，应用 modus ponens 推出 \(B\)。如果你有假设 \(A \lor B\)，使用析取消去规则分情况讨论，一种情况考虑 \(A\)，另一种情况考虑 \(B\)。

在[第 5 章](classical_reasoning.md)我们会给这个列表再增加一条：如果其他方法都失败了，尝试反证法。

前向与后向推理之间的张力也存在于非正式论证中，无论是在数学还是其他领域。当我们证明一个定理时，我们通常向前推理，使用假设、定义和背景知识。但我们也牢记目标，这帮助我们理解前向步骤的意义。

当我们转向交互式定理证明时，我们会看到 *Lean* 有支持前向和后向推理的机制。它们在非正式论证风格与自然演绎模型之间架起桥梁，从而更清楚地展现正在发生的事情。

自然演绎证明的另一个令人困惑的特征是，每个假设都有一个**作用域**（scope），也就是说，只有证明中的某些点，一个假设才是可用的。当然，这也是非正式数学论证的特征。假设某段以“设 \(x\) 是任意小于 100 的数”开头，论证 \(x\) 至多五个素因子，并得出结论“因此我们已经证明每个小于 100 的数至多五个因子”。引用“\(x\)”以及它小于 100 的假设，只在段落的作用域内有效。如果下一段以“现在假设 \(x\) 是任意大于 100 的数”开头，那么 \(x\) 小于 100 的假设当然不再适用。

在自然演绎中，一个假设从它被假设的点开始可用，直到它被取消的点为止。我们将会看到，交互式定理证明语言也有确定引用和假设作用域的机制，这些机制也能澄清非正式数学中的作用域问题。

## 3.4. 分情况讨论

析消去规则令人困惑，但我们可以通过一个例子来理解它。考虑下面的非正式论证：

---

George 要么在家，要么在校园。

如果他在家，他在学习。

如果他在校园，他和朋友在一起。

因此，George 要么在学习，要么和朋友在一起。

---

设 \(A\) 表示“George 在家”，\(B\) 表示“George 在校园”，\(C\) 表示“George 在学习”，\(D\) 表示“George 和朋友在一起”。那么上述论证的模式是：从 \(A \lor B\)、\(A \to C\) 和 \(B \to D\) 推出 \(C \lor D\)。在自然演绎中，我们不能一步就得出这个结论，但把它充实为一个正确证明并不太费事。非正式地，我们必须这样论证：

---

George 要么在家，要么在校园。

> 情况 1：假设他在家。我们知道如果他在家，那么他在学习。所以，在这种情况下，他在学习。因此，在这种情况下，他要么在学习，要么和朋友在一起。
>
> 情况 2：假设他在校园。我们知道如果他在校园，那么他和朋友在一起。所以，在这种情况下，他和朋友在一起。因此，在这种情况下，他要么在学习，要么和朋友在一起。

无论哪种情况，George 要么在学习，要么和朋友在一起。

---

自然演绎证明如下：

![推理规则 24](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.25.png)

你应该思考这个证明的结构如何反映上面的非正式分情况论证。

再举一个例子，下面是 \(A \land (B \lor C) \to (A \land B) \lor (A \land C)\) 的一个证明：

![推理规则 25](https://leanprover-community.github.io/logic_and_proof/_static/natural_deduction_for_propositional_logic.18.png)

## 3.5. 若干逻辑恒等式

如果两个命题公式 \(A\) 和 \(B\) 满足 \(A \leftrightarrow B\) 可证，则称它们是**逻辑等价**的（logically equivalent）。逻辑等价类似于代数中的恒等式，例如 \(x + y = y + x\)。特别地，可以证明：如果两个公式等价，那么可以在任何公式中把一个替换为另一个，结果仍然等价。（某些证明系统把这一点当作基本规则，交互式定理证明器也能支持它，但我们不会把替换等价式当作自然演绎的基本规则。）

作为参考，下面列出了一些常用的命题等价式，以及一些值得注意的公式。请直观思考它们为什么应当为真。

1. 合取交换律：\(A \land B \leftrightarrow B \land A\)
2. 析取交换律：\(A \lor B \leftrightarrow B \lor A\)
3. 合取结合律：\((A \land B) \land C \leftrightarrow A \land (B \land C)\)
4. 析取结合律：\((A \lor B) \lor C \leftrightarrow A \lor (B \lor C)\)
5. 合取对析取的分配律：\(A \land (B \lor C) \leftrightarrow (A \land B) \lor (A \land C)\)
6. 析取对合取的分配律：\(A \lor (B \land C) \leftrightarrow (A \lor B) \land (A \lor C)\)
7. \((A \to (B \to C)) \leftrightarrow (A \land B \to C)\)
8. \((A \to B) \to ((B \to C) \to (A \to C))\)
9. \(((A \lor B) \to C) \leftrightarrow (A \to C) \land (B \to C)\)
10. \(\neg (A \lor B) \leftrightarrow \neg A \land \neg B\)
11. \(\neg (A \land B) \leftrightarrow \neg A \lor \neg B\)
12. \(\neg (A \land \neg A)\)
13. \(\neg (A \to B) \leftrightarrow A \land \neg B\)
14. \(\neg A \to (A \to B)\)
15. \((\neg A \lor B) \leftrightarrow (A \to B)\)
16. \(A \lor \bot \leftrightarrow A\)
17. \(A \land \bot \leftrightarrow \bot\)
18. \(A \lor \neg A\)
19. \(\neg (A \leftrightarrow \neg A)\)
20. \((A \to B) \leftrightarrow (\neg B \to \neg A)\)
21. \((A \to C \lor D) \to ((A \to C) \lor (A \to D))\)
22. \((((A \to B) \to A) \to A)\)

所有这些都可以用[第 3.1 节](#31-自然演绎中的推导)列出的基本规则在自然演绎中推导出来。但其中一些需要使用 *reductio ad absurdum* 规则，即反证法，我们尚未详细讨论。我们将在[第 5 章](classical_reasoning.md)讨论这条规则以及其他经典逻辑模式的使用。

## 3.6. 练习

在自然演绎中构造证明时，**只准**使用[第 3.1 节](#31-自然演绎中的推导)给出的规则列表。

1. 从假设 \(B \land A\) 给出 \(A \land B\) 的自然演绎证明。
2. 从假设 \(Q\) 给出 \((Q \to R) \to R\) 的自然演绎证明。
3. 给出 \(\neg (A \land B) \to (A \to \neg B)\) 的自然演绎证明。
4. 从假设 \((P \land Q) \land R\) 和 \(S \land T\) 给出 \(Q \land S\) 的自然演绎证明。
5. 给出 \((A \to C) \land (B \to \neg C) \to \neg (A \land B)\) 的自然演绎证明。
6. 给出 \((A \land B) \to ((A \to C) \to \neg (B \to \neg C))\) 的自然演绎证明。
7. 再看一下上一章的练习 3。用命题变量 \(A\)、\(B\)、\(C\) 分别表示“Alan 喜欢袋鼠”“Betty 喜欢青蛙”“Carl 喜欢仓鼠”，把三个假设表示为符号公式，然后在自然演绎中从它们推出矛盾。
8. 给出 \(A \lor B \to B \lor A\) 的自然演绎证明。
9. 给出 \(\neg A \land \neg B \to \neg (A \lor B)\) 的自然演绎证明。
10. 从 \(\neg A \lor \neg B\) 给出 \(\neg (A \land B)\) 的自然演绎证明。（不需要使用反证法。）
11. 给出 \(\neg (A \leftrightarrow \neg A)\) 的自然演绎证明。
12. 从假设 \(A \leftrightarrow B\) 给出 \((\neg A \leftrightarrow \neg B)\) 的自然演绎证明。
13. 从假设 \((P \lor Q) \to R\) 给出 \(P \to R\) 的自然演绎证明。它与证明 \(((P \lor Q) \to R) \to (P \to R)\) 有何不同？
14. 从假设 \(A \lor B\) 给出 \(C \to (A \lor B) \land C\) 的自然演绎证明。
15. 从假设 \(W \to X\) 和 \(Y \to Z\) 给出 \(W \lor Y \to X \lor Z\) 的自然演绎证明。
16. 给出 \((A \lor (B \land A)) \to A\) 的自然演绎证明。
