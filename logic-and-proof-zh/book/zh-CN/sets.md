# 第 11 章：集合

> 本译文对应原书 [Sets](https://leanprover.github.io/logic_and_proof/sets.html)；英文 Sphinx 源：`sets.rst`。

我们已经到达了这本教材的一个转折点。从此以后，在大多数情况下我们将放弃自然演绎，转而关注普通数学证明。我们仍将继续思考非正式数学如何能用符号表示，以及自然演绎规则在非正式环境中如何体现。但重点将放在撰写普通数学论证上，而不是设计证明树。Lean 将继续作为非正式领域与形式领域之间的桥梁。

在本章中，我们考虑一个在数学推理中扮演基础角色的概念，即“集合”。

## 11.1. 集合论基础

1895 年，德国数学家 Georg Cantor 在期刊 *Mathematische Annalen* 上发表文章，给出了**集合**（set，他用德语 *Menge*）这一概念的如下刻画：

> 所谓**集合**，是指把我们直觉或思维中确定的、相异的对象（称为该集合的**元素**）汇集为一个整体而形成的任何集合 M。

从那时起，集合的概念被用来统一各种各样的抽象与构造。公理化集合论——我们将在后面一章讨论——为数学提供了一种基础，其中一切都可以被看作集合。

从广义上讲，**任何**汇集都可以是一个集合；例如，我们可以考虑一个集合，其元素是 Ringo Starr、数字 7 以及唯一成员是帝国大厦的集合。但如此宽泛的集合概念要求我们谨慎：Russell 悖论让我们考虑所有不属于自身的集合构成的集合 $S$，当我们问 $S$ 是否属于自身时就会导致矛盾。（试试看！）集合论的公理告诉我们哪些集合存在，并且被精心设计以避免像 Russell 悖论中那样的悖论集合。

在实践中，数学家使用集合时并不如此随心所欲。通常，人们固定一个论域，例如自然数，然后考虑该论域的子集。换言之，我们考虑数的集合、点的集合、线的集合等，而不是任意的“集合”。在本文中，我们将采用这一约定：当我们谈论集合时，我们总是隐含地谈论某个论域中元素的集合。

给定某个论域中的集合 $A$ 和一个对象 $x$，我们写 $x \in A$ 表示 $x$ 是 $A$ 的元素。Cantor 的刻画表明，只要我们有一个论域上的某种性质 $P$，就可以形成具有该性质的元素组成的集合。这用“集合构造记号”表示为 $\{ x \mid P(x) \}$。例如，我们可以考虑以下所有自然数集合：

- $\{ n \mid n \text{ 是偶数} \}$
- $\{ n \mid n \text{ 是素数} \}$
- $\{ n \mid n \text{ 是素数且大于 } 2 \}$
- $\{ n \mid n \text{ 可以写成平方和} \}$
- $\{ n \mid n \text{ 等于 } 1, 2 \text{ 或 } 3 \}$

最后一个集合可以更简单地写成 $\{ 1, 2, 3 \}$。如果论域从上下文中不显然，我们可以显式指明，例如写成 $\{ n \in \mathbb{N} \mid n \text{ 是偶数} \}$。

利用集合构造记号，我们可以定义许多常见集合与运算。**空集** $\emptyset$ 是没有元素的集合：

$$
\emptyset = \{ x \mid \text{false} \}.
$$

对偶地，我们可以定义**全集** $U$ 为包含论域中每个元素的集合：

$$
U = \{ x \mid \text{true} \}.
$$

给定两个集合 $A$ 和 $B$，我们定义它们的**并集**为属于其中之一的元素组成的集合：

$$
A \cup B = \{ x \mid x \in A \text{ 或 } x \in B \}.
$$

我们定义它们的**交集**为同时属于两者的元素组成的集合：

$$
A \cap B = \{ x \mid x \in A \text{ 且 } x \in B \}.
$$

我们定义集合 $A$ 的**补集**为不属于 $A$ 的元素组成的集合：

$$
\overline{A} = \{ x \mid x \notin A \}.
$$

我们定义两个集合 $A$ 和 $B$ 的**差集**为在 $A$ 中但不在 $B$ 中的元素组成的集合：

$$
A \setminus B = \{ x \mid x \in A \text{ 且 } x \notin B \}.
$$

如果两个集合的元素完全相同，则称它们相等。如果 $A$ 和 $B$ 是集合，$A$ 是 $B$ 的**子集**，记作 $A \subseteq B$，当 $A$ 的每个元素都是 $B$ 的元素。注意，$A$ 等于 $B$ 当且仅当 $A$ 是 $B$ 的子集且 $B$ 是 $A$ 的子集。

还要注意，我们到目前为止关于集合所说的一切都可以很容易地用符号逻辑表示。我们可以把基本集合和构造子的定义性质表示如下：

- $\forall x (x \in \emptyset \leftrightarrow \bot)$
- $\forall x (x \in U \leftrightarrow \top)$
- $\forall x (x \in A \cup B \leftrightarrow x \in A \lor x \in B)$
- $\forall x (x \in A \cap B \leftrightarrow x \in A \land x \in B)$
- $\forall x (x \in \overline{A} \leftrightarrow x \notin A)$
- $\forall x (x \in A \setminus B \leftrightarrow x \in A \land x \notin B)$

断言 $A$ 是 $B$ 的子集可以写成 $\forall x (x \in A \to x \in B)$，$A$ 等于 $B$ 可以写成 $\forall x (x \in A \leftrightarrow x \in B)$。这些都是**全称**陈述，即前面带有全称量词、后面跟着基本断言和命题联结词的陈述。这意味着，形式化地推理集合通常只需要使用量词规则加上命题逻辑规则。

逻辑学家有时把普通数学证明描述为**非正式的**，以区别于自然演绎中的**形式证明**。撰写非正式证明时，重点是可读性。下面是一个例子。

---

**定理。** 设 $A$、$B$、$C$ 为某个论域中元素的集合。则 $A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$。

**证明。** 设 $x$ 是任意的，并假设 $x \in A \cap (B \cup C)$。那么 $x \in A$，并且要么 $x \in B$，要么 $x \in C$。在第一种情况下，$x \in A$ 且 $x \in B$，因此 $x \in A \cap B$。在第二种情况下，$x \in A$ 且 $x \in C$，因此 $x \in A \cap C$。无论哪种情况，我们都有 $x \in (A \cap B) \cup (A \cap C)$。

反过来，假设 $x \in (A \cap B) \cup (A \cap C)$。现在有两种情况。

首先，假设 $x \in A \cap B$。那么 $x \in A$ 且 $x \in B$。由于 $x \in B$，所以 $x \in B \cup C$，因此 $x \in A \cap (B \cup C)$。

第二种情况类似：假设 $x \in A \cap C$。那么 $x \in A$ 且 $x \in C$，因此 $x \in B \cup C$。故在这种情况下也有 $x \in A \cap (B \cup C)$，证毕。

---

注意，这个证明看起来一点也不像符号逻辑中的证明。首先，普通证明倾向于使用文字而非符号。当然，数学中一直使用符号，但不会用符号代替“并且”“不是”这样的词；你极少在数学教科书中看到符号 $\land$ 和 $\neg$，除非是一本专门讲逻辑的教科书。

类似地，非正式证明的结构通过普通段落和标点来传达。不要依赖图示、换行和缩进来表达证明结构。相反，你应该依靠诸如路标和伏笔这样的文学手法。在深入细节之前先给出证明大纲或关键思想往往很有帮助，一个段落的开头句可以像说明文一样引导读者的预期。

尽管如此，你应该能够在上面的证明中隐式地看到自然演绎的元素。用形式术语来说，该定理等价于断言

$$
\forall x (x \in A \cap (B \cup C) \leftrightarrow x \in (A \cap B) \cup (A \cap C)),
$$

证明也相应地展开。短语“设 $x$ 是任意的”是 $\forall$ 引入规则的代码，其余证明的形式是 $\leftrightarrow$ 引入。说 $x \in A \cap (B \cup C)$ 隐式地是一个“并且”，论证中使用 $\land$ 消去得到 $x \in A$ 和 $x \in B \cup C$。说 $x \in B \cup C$ 隐式地是一个“或”，然后证明分情况讨论，取决于 $x \in B$ 还是 $x \in C$。

除了把交集和并集的定义按“并且”和“或”展开之外，上面证明的“仅当”方向可以用自然演绎表示如下：

![推理规则 1](https://leanprover-community.github.io/logic_and_proof/_static/sets.1.png)

在下一章中，我们将看到这种逻辑结构在 Lean 中如何显现。但用自然演绎写长证明并不是传达数学思想的最有效方式。因此，我们在这里的目标是教你用自然演绎规则思考，但用普通英语表达步骤。

下面是另一个例子。

---

**定理。** $(A \setminus B) \setminus C = A \setminus (B \cup C)$。

**证明。** 设 $x$ 是任意的，并假设 $x \in (A \setminus B) \setminus C$。那么 $x \in A \setminus B$ 且 $x \notin C$，因此 $x \in A$ 但 $x \notin B$ 且 $x \notin C$。这意味着 $x \in A$ 但 $x \notin B \cup C$，所以 $x \in A \setminus (B \cup C)$。

反过来，假设 $x \in A \setminus (B \cup C)$。那么 $x \in A$ 但 $x \notin B \cup C$。特别地，$x$ 既不在 $B$ 中也不在 $C$ 中，否则它就会在 $B \cup C$ 中。所以 $x \in A \setminus B$，因此 $x \in (A \setminus B) \setminus C$。

---

也许非正式证明与形式证明之间最大的区别在于细节程度。非正式证明经常会跳过被认为是“直接”或“显然”的细节，把更多精力放在展开新颖或出乎意料的推理上。

写一个好的证明就像写一篇好的文章。为了让读者相信结论正确，你必须让他们理解论证，同时又不能用不必要的细节压垮他们。心中要有特定的读者对象。试着大声对朋友、室友和家人讲这个论证；如果他们的眼神变得茫然，那么期望匿名读者做得更好是不现实的。

学习写好证明的最佳方法之一是**阅读**好证明，并注意其写作风格。挑选一本你觉得特别清晰、引人入胜的教科书，思考是什么让它如此清晰。

自然演绎和形式验证可以帮助你理解使证明**正确**的组成部分，但你必须培养一种直觉，知道什么使证明易于阅读、令人愉悦。

## 11.2. 集合运算

计算是数学的核心，数学证明常常涉及执行一系列计算。事实上，一个计算本身就可以看作一个证明，证明两个表达式描述同一个实体。

在高中代数中，学生经常被要求证明如下恒等式：

---

**命题。** 对每个自然数 $n$，$\frac{n(n+1)}{2} + (n+1) = \frac{(n+1)(n+2)}{2}$。

---

在某些地方，学生被要求这样写证明：

---

**证明。**

$$
\frac{n(n+1)}{2} + (n+1) \stackrel{?}{=} \frac{(n+1)(n+2)}{2} \\
\frac{n^2 + n}{2} + \frac{2n + 2}{2} \stackrel{?}{=} \frac{n^2 + 3n + 2}{2} \\
\frac{n^2 + n + 2n + 2}{2} \stackrel{?}{=} \frac{n^2 + 3n + 2}{2} \\
\frac{n^2 + 3n + 2}{2} = \frac{n^2 + 3n + 2}{2}.
$$}

---

数学家看到这种写法通常会皱眉。**不要这样做！**它看起来像是正向推理，从一个复杂恒等式出发最终证明 $x = x$。当然，真正想表达的是每一行都由下一行推出。有一种表达方式可以说明这一点，即使用短语“只需证明”。下面的表述更接近数学用语：

---

**证明。** 我们想证明

$$
\frac{n(n+1)}{2} + (n+1) = \frac{(n+1)(n+2)}{2}.
$$

为此，只需证明

$$
\frac{n^2 + n}{2} + \frac{2n + 2}{2} = \frac{n^2 + 3n + 2}{2}.
$$

为此，只需证明

$$
\frac{n^2 + n + 2n + 2}{2} = \frac{n^2 + 3n + 2}{2}.
$$

但最后一个等式显然为真。

---

然而，这样的叙述流畅性不好。有时在证明中反向工作是合理的，但在这个例子中，很容易以更正向的方式呈现证明。下面是一个例子：

---

**证明。** 计算左边，我们有

$$
\frac{n(n+1)}{2} + (n+1) = \frac{n^2 + n}{2} + \frac{2n + 2}{2} = \frac{n^2 + n + 2n + 2}{2} = \frac{n^2 + 3n + 2}{2}.
$$

右边，我们也有

$$
\frac{(n+1)(n+2)}{2} = \frac{n^2 + 3n + 2}{2}.
$$

所以 $\frac{n(n+1)}{2} + (n+1) = \frac{n^2 + 3n + 2}{2}$，证毕。

---

数学家在这种情况下经常使用缩写“LHS”和“RHS”分别表示“left-hand side”和“right-hand side”。事实上，这里我们可以很容易地把证明写成一条正向计算链：

---

**证明。**

$$
\frac{n(n+1)}{2} + (n+1) = \frac{n^2 + n}{2} + \frac{2n + 2}{2} = \frac{n^2 + n + 2n + 2}{2} = \frac{n^2 + 3n + 2}{2} = \frac{(n+1)(n+2)}{2}.
$$

---

这样的证明清晰、紧凑、易读。读者面临的主要挑战是弄清楚每一步的理由。数学家有时会用额外信息注释这样的计算，或在计算前后的文本中加入几句话解释。但理想情况是把计算分成足够小的步骤，使每一步都是直接的，无需解释。（再次强调，什么是“直接的”取决于谁在阅读证明。）

我们说过，两个集合相等当且仅当它们有相同的元素。在上一节中，我们通过推理每个集合的元素来证明两个集合相等，但我们常常可以更高效。假设 $A$、$B$、$C$ 是某个论域 $U$ 的子集，以下恒等式成立：

- $A \cup \overline{A} = U$
- $A \cap \overline{A} = \emptyset$
- $\overline{\overline{A}} = A$
- $A \cup A = A$
- $A \cap A = A$
- $A \cup \emptyset = A$
- $A \cap \emptyset = \emptyset$
- $A \cup U = U$
- $A \cap U = A$
- $A \cup B = B \cup A$
- $A \cap B = B \cap A$
- $(A \cup B) \cup C = A \cup (B \cup C)$
- $(A \cap B) \cap C = A \cap (B \cap C)$
- $\overline{A \cap B} = \overline{A} \cup \overline{B}$
- $\overline{A \cup B} = \overline{A} \cap \overline{B}$
- $A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$
- $A \cup (B \cap C) = (A \cup B) \cap (A \cup C)$
- $A \cap (A \cup B) = A$
- $A \cup (A \cap B) = A$

这使我们能够通过计算证明更多恒等式。下面是一个例子。

---

**定理。** 设 $A$ 和 $B$ 是某个论域 $U$ 的子集。则 $(A \cap \overline{B}) \cup B = A \cup B$。

**证明。**

$$
(A \cap \overline{B}) \cup B = (A \cup B) \cap (\overline{B} \cup B) = (A \cup B) \cap U = A \cup B.
$$

---

下面是另一个例子。

---

**定理。** 设 $A$ 和 $B$ 是某个论域 $U$ 的子集。则 $(A \setminus B) \cup (B \setminus A) = (A \cup B) \setminus (A \cap B)$。

**证明。**

$$
\begin{aligned}
(A \setminus B) \cup (B \setminus A)
&= (A \cap \overline{B}) \cup (B \cap \overline{A}) \\
&= ((A \cap \overline{B}) \cup B) \cap ((A \cap \overline{B}) \cup \overline{A}) \\
&= ((A \cup B) \cap (\overline{B} \cup B)) \cap ((A \cup \overline{A}) \cap (\overline{B} \cup \overline{A})) \\
&= ((A \cup B) \cap U) \cap (U \cap \overline{A \cap B}) \\
&= (A \cup B) \cap \overline{A \cap B} \\
&= (A \cup B) \setminus (A \cap B).
\end{aligned}
$$

---

你可能已经注意到，经典地，命题在逻辑等价下满足与集合类似的恒等式。这并非巧合；两者都是**布尔代数**的实例。以下是上面恒等式翻译成布尔代数语言的结果：

- $A \lor \neg A = \top$
- $A \land \neg A = \bot$
- $\neg\neg A = A$
- $A \lor A = A$
- $A \land A = A$
- $A \lor \bot = A$
- $A \land \bot = \bot$
- $A \lor \top = \top$
- $A \land \top = A$
- $A \lor B = B \lor A$
- $A \land B = B \land A$
- $(A \lor B) \lor C = A \lor (B \lor C)$
- $(A \land B) \land C = A \land (B \land C)$
- $\neg(A \land B) = \neg A \lor \neg B$
- $\neg(A \lor B) = \neg A \land \neg B$
- $A \land (B \lor C) = (A \land B) \lor (A \land C)$
- $A \lor (B \land C) = (A \lor B) \land (A \lor C)$
- $A \land (A \lor B) = A$
- $A \lor (A \land B) = A$

翻译成布尔代数语言后，上面的第一个定理如下：

---

**定理。** 设 $A$ 和 $B$ 是布尔代数的元素。则 $(A \land \neg B) \lor B = A \lor B$。

**证明。**

$$
(A \land \neg B) \lor B = (A \lor B) \land (\neg B \lor B) = (A \lor B) \land \top = A \lor B.
$$

---

## 11.3. 集合的指标族

如果 $I$ 是一个集合，我们有时希望考虑一个由 $I$ 中元素**索引**的集合族 $(A_i)_{i \in I}$。例如，我们可能关注由自然数索引的集合序列

$$
A_0, A_1, A_2, \ldots
$$

这个概念最好用一些例子说明。

- 对每个自然数 $n$，我们可以定义 $A_n$ 为今天活着的年龄为 $n$ 的人的集合。每个年龄都有对应的集合。一个 20 岁的人是集合 $A_{20}$ 的元素，而一个新生儿是 $A_0$ 的元素。集合 $A_{200}$ 是空的。这个族 $(A_n)_{n \in \mathbb{N}}$ 是一个由自然数索引的集合族。
- 对每个实数 $r$，我们可以定义 $B_r = \{ x \in \mathbb{R} \mid x > r \text{ 且 } x > 0 \}$ 为大于 $r$ 的正实数集合。那么 $(B_r)_{r \in \mathbb{R}}$ 是一个由实数索引的集合族。
- 对每个自然数 $n$，我们可以定义 $C_n = \{ k \in \mathbb{N} \mid k \text{ 是 } n \text{ 的因子} \}$ 为 $n$ 的因子集合。

给定一个由 $I$ 索引的集合族 $(A_i)_{i \in I}$，我们可以形成它的**并集**：

$$
\bigcup_{i \in I} A_i = \{ x \mid x \in A_i \text{ 对某个 } i \in I \}.
$$

我们也可以形成集合族的**交集**：

$$
\bigcap_{i \in I} A_i = \{ x \mid x \in A_i \text{ 对每个 } i \in I \}.
$

所以元素 $x$ 属于 $\bigcup_{i \in I} A_i$ 当且仅当 $x$ 属于某个 $A_i$（$i \in I$），而 $x$ 属于 $\bigcap_{i \in I} A_i$ 当且仅当 $x$ 属于每个 $A_i$（$i \in I$）。这些运算在符号逻辑中分别由存在量词和全称量词表示。我们有：

- $\forall x (x \in \bigcup_{i \in I} A_i \leftrightarrow \exists i \in I (x \in A_i))$
- $\forall x (x \in \bigcap_{i \in I} A_i \leftrightarrow \forall i \in I (x \in A_i))$

回到上面的例子，我们可以计算每个集合族的并集和交集。对第一个例子，$\bigcup_{n \in \mathbb{N}} A_n$ 是所有活着的人的集合，$\bigcap_{n \in \mathbb{N}} A_n = \emptyset$。此外，$\bigcup_{r \in \mathbb{R}} B_r = \mathbb{R}_{> 0}$（所有正实数的集合），$\bigcap_{r \in \mathbb{R}} B_r = \emptyset$。对最后一个例子，$\bigcup_{n \in \mathbb{N}} C_n = \mathbb{N}$，$\bigcap_{n \in \mathbb{N}} C_n = \{ 1 \}$，因为 1 是每个自然数的因子。

假设 $I$ 只包含两个元素，比如 $I = \{ c, d \}$。设 $(A_i)_{i \in I}$ 是由 $I$ 索引的集合族。由于 $I$ 有两个元素，这个族只由两个集合 $A_c$ 和 $A_d$ 组成。那么这个集合族的并集和交集就是两个集合的并集和交集：

$$
\bigcup_{i \in I} A_i = A_c \cup A_d, \quad \bigcap_{i \in I} A_i = A_c \cap A_d.
$$

这意味着两个集合的并集和交集只是集合族并集和交集的特例。

对于集合族的并集和交集，我们也有一些等式。以下是其中几个：

- $A \cap \bigcup_{i \in I} B_i = \bigcup_{i \in I} (A \cap B_i)$
- $A \cup \bigcap_{i \in I} B_i = \bigcap_{i \in I} (A \cup B_i)$
- $\overline{\bigcap_{i \in I} A_i} = \bigcup_{i \in I} \overline{A_i}$
- $\overline{\bigcup_{i \in I} A_i} = \bigcap_{i \in I} \overline{A_i}$
- $\bigcup_{i \in I} \bigcup_{j \in J} A_{i,j} = \bigcup_{j \in J} \bigcup_{i \in I} A_{i,j}$
- $\bigcap_{i \in I} \bigcap_{j \in J} A_{i,j} = \bigcap_{j \in J} \bigcap_{i \in I} A_{i,j}$

在最后两行中，$A_{i,j}$ 由两个集合 $I$ 和 $J$ 索引。这意味着对每个 $i \in I$ 和 $j \in J$ 都有一个集合 $A_{i,j}$。对前四个等式，试着想想如果指标集 $I$ 包含两个元素，规则是什么意思。

让我们证明第一个恒等式。注意断言 $x \in A \cap \bigcup_{i \in I} B_i$ 和 $x \in \bigcup_{i \in I} (A \cap B_i)$ 的逻辑形式如何决定证明结构。

---

**定理。** 设 $A$ 是某个论域 $U$ 的任意子集，$(B_i)_{i \in I}$ 是由 $I$ 索引的 $U$ 的子集族。则

$$
A \cap \bigcup_{i \in I} B_i = \bigcup_{i \in I} (A \cap B_i).
$$

**证明。** 假设 $x \in A \cap \bigcup_{i \in I} B_i$。那么 $x \in A$ 且存在某个 $j \in I$ 使 $x \in B_j$。所以 $x \in A \cap B_j$，因此 $x \in \bigcup_{i \in I} (A \cap B_i)$。

反过来，假设 $x \in \bigcup_{i \in I} (A \cap B_i)$。那么对某个 $j \in I$，$x \in A \cap B_j$。因此 $x \in A$，并且由于 $x \in B_j$，所以 $x \in \bigcup_{i \in I} B_i$。故 $x \in A \cap \bigcup_{i \in I} B_i$，证毕。

---

## 11.4. 笛卡尔积与幂集

两个对象 $a$ 和 $b$ 的**有序对**记作 $(a, b)$。我们说 $a$ 是该对的**第一分量**，$b$ 是**第二分量**。两个对相等当且仅当第一分量相等且第二分量相等。用符号表示，$(a, b) = (c, d)$ 当且仅当 $a = c$ 且 $b = d$。

给定两个集合 $A$ 和 $B$，我们定义这两个集合的**笛卡尔积** $A \times B$ 为所有第一分量属于 $A$、第二分量属于 $B$ 的对组成的集合。用集合构造记号，这意味着

$$
A \times B = \{ (a, b) \mid a \in A \text{ 且 } b \in B \}.
$$

注意，如果 $A$ 和 $B$ 是某个特定论域 $U$ 的子集，$A \times B$ 不一定是同一论域 $U$ 的子集。然而，它总是 $U \times U$ 的子集。

有些公理化基础把有序对的概念作为原始的。在公理化集合论中，通常把有序对**定义**为一个特定的集合，即

$$
(a, b) = \{ \{ a \}, \{ a, b \} \}.
$$

注意，如果 $a = b$，这个集合只有一个元素：

$$
(a, a) = \{ \{ a \}, \{ a, a \} \} = \{ \{ a \}, \{ a \} \} = \{ \{ a \} \}.
$$

下面的定理表明这个定义是合理的。

---

**定理。** 使用上面的有序对定义，$(a, b) = (c, d)$ 当且仅当 $a = c$ 且 $b = d$。

**证明。** 如果 $a = c$ 且 $b = d$，那么显然 $(a, b) = (c, d)$。对另一个方向，假设 $(a, b) = (c, d)$，即

$$
\underbrace{\{ \{ a \}, \{ a, b \} \}}_{L} = \underbrace{\{ \{ c \}, \{ c, d \} \}}_{R}.
$$

首先假设 $a = b$。那么 $L = \{ \{ a \} \}$。这意味着 $\{ c \} = \{ a \}$ 且 $\{ c, d \} = \{ a \}$，由此得出 $c = a$ 且 $d = a = b$。

现在假设 $a \neq b$。如果 $\{ c \} = \{ a, b \}$，那么我们得出 $a$ 和 $b$ 都等于 $c$，与 $a \neq b$ 矛盾。由于 $\{ c \} \in L$，$\{ c \}$ 必须等于 $\{ a \}$，这意味着 $a = c$。我们知道 $\{ a, b \} \in R$，并且由于已知 $\{ a, b \} \neq \{ c \}$，我们得出 $\{ a, b \} = \{ c, d \}$。这意味着 $b \in \{ c, d \}$，由于 $b \neq a = c$，我们得出 $b = d$。

因此在两种情况下我们都得出 $a = c$ 且 $b = d$，证毕。

---

使用有序对，我们可以定义三个对象 $a$、$b$、$c$ 的**有序三元组** $(a, b, c)$ 为 $(a, (b, c))$。然后我们可以证明 $(a, b, c) = (d, e, f)$ 当且仅当 $a = d$、$b = e$、$c = f$，这是练习之一。类似地，我们也可以定义有序 $n$ 元组，即 $n$ 个对象的序列。

给定一个集合 $A$，我们可以定义 $A$ 的**幂集** $\mathcal{P}(A)$ 为 $A$ 的所有子集组成的集合。用集合构造记号可以写成

$$
\mathcal{P}(A) = \{ B \mid B \subseteq A \}.
$$

如果 $A$ 是 $U$ 的子集，$\mathcal{P}(A)$ 可能不是 $U$ 的子集，但它总是 $\mathcal{P}(U)$ 的子集。

## 11.5. 练习

1. 证明以下定理：设 $A$、$B$、$C$ 为某个论域中元素的集合。则 $A \cup (B \cap C) = (A \cup B) \cap (A \cup C)$。（今后，如果我们没有特别说明使用自然演绎或 Lean，“证明”“说明”意味着给出普通数学证明，使用普通数学语言而非符号逻辑。）

2. 证明以下定理：设 $A$ 和 $B$ 为某个论域中元素的集合。则 $\overline{A} \setminus B = \overline{A} \cup B$。

3. 如果两个集合 $A$ 和 $B$ 没有共同元素，则称它们**不交**（disjoint）。证明如果 $A$ 和 $B$ 不交，$C \subseteq A$，$D \subseteq B$，那么 $C$ 和 $D$ 不交。

4. 设 $A$ 和 $B$ 为集合。证明 $(A \setminus B) \cup (B \setminus A) = (A \cup B) \setminus (A \cap B)$，通过证明两边有相同的元素。

5. 设 $A$、$B$、$C$ 为某个论域 $U$ 的子集。用上面的恒等式计算证明 $A \setminus (B \cup C) = (A \setminus B) \setminus C$。同时注意一般地 $C \setminus D = C \cap \overline{D}$。

6. 类似地，计算证明 $(A \setminus B) \cup (A \cap B) = A$。

7. 计算证明下列各式：

   - $A \setminus B = A \setminus (A \cap B)$
   - $A \setminus B = (A \cup B) \setminus B$
   - $(A \cap B) \setminus C = (A \setminus C) \cap B$

8. 证明如果 $(A_{i,j})_{i \in I, j \in J}$ 是由两个集合 $I$ 和 $J$ 索引的族，那么

   $$
   \bigcup_{i \in I} \bigcap_{j \in J} A_{i,j} \subseteq \bigcap_{j \in J} \bigcup_{i \in I} A_{i,j}.
   $$

   并找一个族 $(A_{i,j})_{i \in I, j \in J}$ 使得反向包含不成立。

9. 用计算推理证明

   $$
   \left( \bigcup_{i \in I} A_i \right) \cap \left( \bigcup_{j \in J} B_j \right) = \bigcup_{i \in I, j \in J} (A_i \cap B_j).
   $$

   记号 $\bigcup_{i \in I, j \in J} (A_i \cap B_j)$ 表示 $\bigcup_{i \in I} \bigcup_{j \in J} (A_i \cap B_j)$。

10. 使用定义 $(a, b, c) = (a, (b, c))$，证明 $(a, b, c) = (d, e, f)$ 当且仅当 $a = d$、$b = e$、$c = f$。

11. 证明 $A \times (B \cup C) = (A \times B) \cup (A \times C)$。

12. 证明 $(A \cap B) \times (C \cap D) = (A \times C) \cap (B \times D)$。为 $(A \cup B) \times (C \cup D)$ 找一个由笛卡尔积的并组成的表达式，并证明你的表达式正确。

13. 证明 $A \subseteq B$ 当且仅当 $\mathcal{P}(A) \subseteq \mathcal{P}(B)$。
