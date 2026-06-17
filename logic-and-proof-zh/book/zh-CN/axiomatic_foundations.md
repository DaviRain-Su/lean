# 第 23 章：公理化基础

> 本译文对应原书 [Axiomatic Foundations](https://leanprover.github.io/logic_and_proof/axiomatic_foundations.html)；英文 Sphinx 源：`axiomatic_foundations.rst`。

在最后一章里，我们的故事画上了句号。我们从符号逻辑出发，用命题联结词来刻画「并且」「或者」「并非」「蕴涵」等逻辑项；继而引入一阶逻辑的量词、函数符号与关系符号。再往后，我们转向集合、函数与关系——它们在现代数学中无处不在；自然数与归纳法；以及数论、组合数学、实数、无穷等主题。此处我们回到符号逻辑，看看它如何为全部数学提供形式化基础。

具体而言，我们将考察一种称为 **Zermelo-Fraenkel 集合论**（Zermelo-Fraenkel set theory，简称 ZF）的公理化框架，它于二十世纪初提出。在集合论视角下，每个数学对象都是一个集合。公理断言具有各种性质的集合的存在性。从所有集合的汇集出发，我们刻画出数学宇宙中常见的对象——不仅是前面讨论过的各种数系，还有序对、有限序列、关系、函数等等。这为自[第 11 章](sets.md)以来所做的一切提供了理想化的基础。

本章末尾，我们将简要介绍另一种公理化框架——**依赖类型论**（dependent type theory），即 Lean 所采用的框架。我们将看到，它为数学对象与构造提供了另一种视角，但仍可与集合论观点相互解释。

## 23.1. 集合的基本公理

集合论公理用一阶逻辑表述，语言中只有一个二元关系符号 $\in$。我们把整个数学宇宙想象成仅由集合构成；若 $x$ 和 $y$ 是集合，则 $x \in y$ 表示 $x$ 是 $y$ 的元素。第一条公理说，两个集合相等当且仅当它们有相同的元素。

$$\text{外延公理（Extensionality）：} \;\; \forall x, y \; (x = y \leftrightarrow \forall z (z \in x \leftrightarrow z \in y))$$

下一条公理告诉我们，宇宙中至少有一个「有意思」的集合，即没有任何元素的集合。

$$\text{空集公理（Empty set）：} \;\; \exists x \; \forall y \; y \notin x$$

当然，$x \notin y$ 是 $\neg (x \in y)$ 的缩写。由外延公理，这条公理所断言存在的集合是唯一的：换言之，若 $x_1$ 和 $x_2$ 都没有元素，则空真地，任何元素属于其中一个当且仅当属于另一个，故 $x_1 = x_2$。这为在短语「空集」中使用定冠词「该」提供了依据。给定这一事实，引入新符号 $\emptyset$ 来表示满足该描述的集合，似乎并无害处。事实上可以证明确实如此：在精确意义上，向一阶语言做这类扩展可视为不过是一种方便的表达方式，更大语言中的语句可以翻译回原语言，且所有期望的推理仍成立。此处我们不展开细节，而直接承认这一事实。使用新符号后，空集公理告诉我们空集满足性质 $\forall y \; y \notin \emptyset$。

第三条公理说，给定两个集合 $x$ 和 $y$，我们可以形成一个新集合 $z$，其元素恰好是 $x$ 和 $y$。

$$\text{配对公理（Pairing）：} \;\; \forall x, y \; \exists z \; \forall w \; (w \in z \leftrightarrow w = x \vee w = y)$$

这条公理附近藏着一个不显眼的用法：公理并不要求 $x$ 和 $y$ 不同，因此例如我们可以都取空集。这告诉我们集合 $\{ \emptyset \}$——其唯一元素是空集——存在。更一般地，公理告诉我们：对任意 $x$，存在集合 $\{ x \}$，其唯一元素是 $x$；对任意 $x$ 和 $y$，存在 $\{x, y\}$，如上所述。再次由外延公理，满足这些描述的集合唯一，故使用相应记法是合理的。我们起步了！现在已有以下集合，以及更多：

$$\emptyset, \;\; \{ \emptyset \}, \; \; \{ \{ \emptyset \} \}, \;\; \{ \emptyset, \{ \emptyset \} \}, \;\; \{ \{ \{ \emptyset \} \} \}, \;\; \ldots$$

尽管如此，用这种方式永远无法形成元素多于两个的集合。为此，添加一条断言对每个 $x$ 和 $y$ 都存在 $x \cup y$ 的公理是合理的。但我们可以做得更好。回忆若 $x$ 是任意集合，$\bigcup x$ 表示 $x$ 中所有集合的并。换言之，对任意集合 $z$，$z \in \bigcup x$ 当且仅当 $z$ 属于 $x$ 中某个集合 $w$。下列公理断言该集合存在。

$$\text{并集公理（Union）：} \;\; \forall x \; \exists y \; \forall z \; (z \in y \leftrightarrow \exists w \; (w \in x \wedge z \in w))$$

这再次为 $\bigcup$ 记法提供了依据。结合配对公理，我们得到通常的二元并：$x \cup y = \bigcup \{ x, y \}$。

此时，引入我们在非形式集合论中首次使用的一些额外记法会很有用。若 $A$ 是集合论语言中的任意一阶公式，$\forall x \in y \; A$ 缩写 $\forall x \; (x \in y \rightarrow A)$，$\exists x \in y \; A$ 缩写 $\exists x \; (x \in y \wedge A)$，即如[第 7 章](first_order_logic.md)所述的相对化量词。表达式 $x \subseteq y$ 缩写 $\forall z \in x \; (z \in y)$，如你所料。

下一条公理断言，对每个集合 $x$，幂集 $\mathcal{P}(x)$ 存在。

$$\text{幂集公理（Power Set）：} \;\; \forall x \; \exists y \; \forall z \; (z \in y \leftrightarrow z \subseteq x)$$

我们已开始用基本集合构造填充宇宙。然而，真正赋予集合论非凡灵活性的是下一条公理。严格说，它不是单条公理，而是一个**公理模式**（schema）——由单一模板给出的无穷多条公理。该模式旨在为 [第 11 章](sets.md)中无处不在的集合构造记法 $\{ w \mid \ldots \}$ 提供依据。首先要回答的问题是：省略号处允许写什么。在非形式集合论中，我们说可用任意性质定义集合，但这恰恰引出问题：什么算「性质」。公理化集合论给出简单而有力的答案：可使用集合论语言中的任意一阶公式。

另一顾虑围绕 Russell 悖论，如[第 11 章](sets.md)初等集合论部分所讨论。任何允许我们定义集合 $\{ w \mid w \notin w \}$ 的理论都不一致，因为若称该集合为 $z$，则可证 $z \in z$ 当且仅当 $z \notin z$，矛盾。集合论再次给出简单而优雅的解：对任意公式 $A(z)$ 和集合 $y$，我们可形成集合 $\{ w \in y \mid A(w) \}$，由 $y$ 中满足 $A$ 的元素组成。换言之，须先用集合论其他公理形成足够大的集合 $y$，以包含我们想考虑的所有元素，再用公式 $A$ 挑出所需者。

我们需要的公理模式称为**分离公理**（separation），因为我们用它从更大集合中分离出想要的元素。

$$\text{分离公理（Separation）：} \;\; \forall x_1, x_2, \ldots, x_n, y \; \exists z \; \forall w \; (w \in z \leftrightarrow w \in y \wedge A(w,x_1, x_2, \ldots, x_n))$$

此处 $A$ 可以是任意公式；所列变量 $x_1, \ldots, x_n$ 表示 $A$ 可有参数，此时形成的集合依赖这些值。例如，在普通数学中，给定数 $m$，可形成集合 $\{ n \in \mathbb{N} \mid \mathit{prime}(n) \wedge n > m\}$。此例中描述涉及 $m$ 和 $n$，所定义集合依赖 $m$。

我们可用分离公理简化前面的公理。例如，只要知道*某个*集合 $x$ 存在，就可把空集定义为 $\{ y \in x \mid \bot \}$。类似地，在配对公理中，断言存在包含 $x$ 和 $y$ 作为元素的集合即可，然后用分离公理分离出元素恰好为 $x$ 和 $y$ 的集合。

这些只是集合论的前六条公理；还有四条。但仅这些公理就已为关于集合、关系、函数的推理提供基础，如我们在[第 11 章](sets.md)、[第 13 章](relations.md)、[第 15 章](functions.md)所做。例如，我们已定义并运算，可把集合交 $x \cap y$ 定义为 $\{ z \in x \cup y \mid z \in x \wedge z \in y \}$。我们无法定义任意集合补；例如，练习要求你证明在集合论中可证不存在包含所有集合的集合，故空集的补不存在。但对任意两个集合 $x$ 和 $y$，可定义差 $x \setminus y$ 为 $\{ z \in x \mid z \notin y \}$。下面练习要求你证明，一旦发展了函数概念，也可定义带指标族的并和交。

我们希望把 $x$ 与 $y$ 之间的二元关系定义为 $x \times y$ 的子集，但须先定义笛卡尔积 $x \times y$。回忆在[第 11 章](sets.md)中我们定义有序对 $(u, v)$ 为集合 $\{ \{ u \}, \{ u, v \} \}$。因此可用分离公理定义

$$x \times y = \{ z \in \ldots \mid \exists u \in x \; \exists v \in y \; (z = (u, v)) \}$$

只要我们能证明足够大的集合存在以填入「……」。下面练习要求你证明集合 $\mathcal P (\mathcal P (x \cup y))$ 包含所有相关有序对。$x$ 与 $y$ 上的二元关系 $r$ 就是 $x \times y$ 的子集，我们把 $r(u, v)$ 解释为 $(u, v) \in r$。可把来自集合 $x$、$y$、$z$ 的有序三元组看作 $x \times (y \times z)$ 的元素，依此类推，得到三元关系、四元关系等。

现在可说函数 $f : x \to y$ 实为满足 $\forall u \in x \; \exists! v \in y \; f(u, v)$ 的二元关系，当 $v$ 是唯一满足 $f(u, v)$ 的元素时，记 $f(u) = v$。从集合 $x$、$y$、$z$ 取参、返回 $w$ 中元素的函数 $f$ 可解释为函数 $f : x \times y \times z \to w$，依此类推。

有了集合、关系与函数，我们具备了做数学的基本基础设施。此时所缺的是一些有意思的集合与结构。例如，拥有我们所期望全部性质的自然数集 $\mathbb{N}$ 会很有用。下面转向这一点。

## 23.2. 无穷公理

凭借目前的公理，我们可以形成大量有限集：从 $\emptyset$ 出发，反复运用配对、并集、幂集与分离构造，得到诸如

$$\emptyset, \{ \emptyset \}, \{ \{ \emptyset \} \}, \{ \emptyset, \{ \emptyset \} \}, \{ \{ \{ \emptyset \} \} \}, \ldots$$

的集合。但迄今公理不允许我们定义比这些更有趣的集合。特别地，没有任何公理给出无穷集。因此需要进一步公理来断言这样的集合存在。

回忆在[第 17 章](elementary_number_theory.md)中，我们把自然数刻画为具有特指元素 $0$、单射运算 $\mathit{succ}$、并满足归纳原理与递归定义原理的集合。在集合论中，一切都是集合，故若要在该框架中表示自然数，须把它们与特定集合等同。$0$ 有自然选择，即空集 $\emptyset$。后继运算我们将用函数 $\mathit{succ}$，定义为 $\mathit{succ}(x) = x \cup \{ x \}$。这个选择有点取巧；最好的辩护是它管用。按此定义，前几个自然数为：

$$0 = \emptyset, \;\; 1 = \{ \emptyset \}, \;\; 2 = \{ \emptyset, \{ \emptyset \} \}, \;\; 3 = \{ \emptyset, \{ \emptyset \}, \{ \emptyset, \{ \emptyset \} \} \}, \;\; \ldots$$

更清楚地可写为：

$$0 = \emptyset, \;\; 1 = \{ 0 \}, \;\; 2 = \{ 0, 1 \}, \;\; 3 = \{ 0, 1, 2 \}, \;\; 4 = \{ 0, 1, 2, 3 \}, \;\; \ldots$$

一般地，$n+1$ 由集合 $\{ 0, 1, \ldots, n \}$ 表示，此时 $m \in n$ 与 $m < n$ 相同。这只是我们编码的附带性质，却颇为雅致。

回忆自然数集可如下刻画：

- 存在元素 $0 \in \mathbb{N}$，存在单射函数 $\mathit{succ} : \mathbb{N} \to \mathbb{N}$，且对 $\mathbb{N}$ 中任意 $x$ 有 $\mathit{succ}(x) \ne 0$。

- 集合 $\mathbb{N}$ 满足归纳原理：若 $x$ 是 $\mathbb{N}$ 的子集，包含 $0$ 且对 $\mathit{succ}$ 封闭（即每当 $z \in x$，则 $\mathit{succ}(z) \in x$），则 $x = \mathbb{N}$。

我们已确定 $0$ 与 $\mathit{succ}$ 的定义，但尚无同时包含前者且对后者封闭的集合。无穷公理恰好断言这样的集合存在。

$$\text{无穷公理（Infinity）：} \;\; \exists x \; (\emptyset \in x \wedge \forall y \; (y \in x \rightarrow y \cup \{ y \} \in x))$$

称集合 $x$ 是**归纳的**（inductive），若它满足存在量词后的性质，即包含空集且对我们的后继运算封闭。注意，我们仍在形式定义的自然数集具有此性质。无穷公理断言*某个*归纳集存在，但不一定是自然数本身；归纳集还可包含其他元素。某种意义上，归纳原理说自然数是*最小*的归纳集。因此需要从无穷公理所断言的集合中分离出该集。

设 $x$ 为无穷公理所断言存在的任意归纳集。令

$$y = \bigcap \{ z \subseteq x \mid \text{$z$ 是归纳的} \}.$$

此处 $z \subseteq x$ 也可写为 $z \in \mathcal P(x)$，故内部集合由分离公理保证存在。按此定义，$y$ 是 $x$ 的每个归纳子集的交，故元素 $w \in y$ 当且仅当 $w$ 属于 $x$ 的每个归纳子集。我们断言 $y$ 本身也是归纳的。首先，$\emptyset \in y$，因为空集是每个归纳集的元素。其次，设 $w \in y$，则 $w$ 属于 $x$ 的每个归纳子集。但每个归纳集对后继封闭，故 $\mathit{succ}(w)$ 属于 $x$ 的每个归纳子集。所以 $\mathit{succ}(w)$ 属于 $x$ 的所有归纳子集的交——即 $y$！

由此立即推出 $y$ 是*每个*归纳集的子集。设 $z$ 归纳，可验证 $z \cap x$ 归纳，故 $y \subseteq z \cap x \subseteq z$。

更有趣的是，$y$ 也满足归纳原理。设 $u \subseteq y$ 包含空集且对 $\mathit{succ}$ 封闭，则 $u$ 归纳；因 $y$ 是每个归纳集的子集，有 $y \subseteq u$。又假设 $u \subseteq y$，故 $u = y$，正是所需。

概括而言，我们已证明存在包含 $0$、对后继运算封闭且满足归纳公理的集合。而且这样的集合唯一：若 $y_1$ 和 $y_2$ 都具有此性质，则 $y_1 \cap y_2$ 亦然，由归纳原理该交必等于 $y_1$ 和 $y_2$，故 $y_1 = y_2$。于是称具有这些性质的唯一集合为**自然数**，记作 $\mathbb{N}$ 是合理的。

拼图还缺一块。由定义显然 $0$ 不是任何数的后继，但尚不清楚后继函数是否单射。可先注意到，按我们的定义，自然数有奇特性质：若 $z$ 是自然数，$y \in z$，$x \in y$，则 $x \in z$。这恰说明 $\in$ 关系在自然数上是传递的，并不意外，因为我们已注意到在此表示下自然数上的 $\in$ 与 $<$ 重合。为形式证明该断言，称集合 $z$ 是**传递的**（transitive），若它具有刚述性质，即 $z$ 的元素的每个元素都属于 $z$。这等价于：对每个 $y \in z$，有 $y \subseteq z$。

---

**引理.** 每个自然数都是传递的。

**证明.** 对自然数归纳。显然 $\emptyset$ 传递。设 $x$ 传递，设 $y \in \mathit{succ}(x)$ 且 $z \in y$。因 $\mathit{succ}(x) = x \cup \{ x \}$，有 $y \in x$ 或 $y \in \{x\}$。若 $y \in x$，由归纳假设 $z \in x$，故 $z \in \mathit{succ}(x)$。否则 $y \in \{ x \}$，故 $y = x$，此时仍有 $z \in x$，故 $z \in \mathit{succ}(x)$。

---

下一条引理说明，在传递集上，并集的作用类似前驱运算。

---

**引理.** 若 $x$ 传递，则 $\bigcup \mathit{succ}(x) = x$。

**证明.** 设 $y \in \bigcup \mathit{succ}(x) = \bigcup (x \cup \{ x \})$。则或对某个 $z \in x$ 有 $y \in z$，或 $y \in x$。第一种情形，因 $x$ 传递，亦有 $y \in x$。

反之，设 $y \in x$，则 $y \in \bigcup \mathit{succ}(x)$，因 $x \in \mathit{succ}(x)$。

**定理.** $\mathit{succ}$ 在 $\mathbb{N}$ 上是单射的。

**证明.** 设 $x, y \in \mathbb{N}$ 且 $\mathit{succ}(x) = \mathit{succ}(y)$。则 $x$ 和 $y$ 都传递，且 $x = \bigcup \mathit{succ}(x) = \bigcup \mathit{succ}(y) = y$。

---

至此我们起步了。虽此处不展开细节，用归纳原理可为递归定义原理提供依据；进而可定义算术基本运算并推导其性质，如[第 17 章](elementary_number_theory.md)所做；还可定义整数、有理数、实数，如[第 19 章](the_real_numbers.md)所述，并发展数论、组合数学等，如[第 17 章](elementary_number_theory.md)、[第 18 章](combinatorics.md)所述。事实上，似乎任何合理的数学分支都可在公理化集合论基础上形式地发展。也有陷阱，例如与大类集合有关：正如断言全体集合的集合存在会导致不一致，同样不存在「所有偏序」或「所有群」的汇集。因此在解释某些数学断言时，有时须小心限制到足够大的此类对象汇集。但这很少超出仔细记账的范围；值得注意的是，在大多数情况下，集合论公理足够灵活有力，足以支撑大多数普通数学构造。

## 23.3. 其余公理

我们已见的七条公理相当有力，足以表示数学的大部分。此处讨论 Zermelo-Fraenkel 集合论的其余公理。

迄今所见公理均未排除集合 $x$ 可以是自身的元素，即 $x \in x$ 的可能。下列公理排除此种情况。

$$\text{基础公理（Foundation）：} \;\; \forall x \; (\exists y \; y \in x \to \exists y \in x \; \forall z \in x \; z \notin y))$$

公理说，若 $x$ 非空，则 $x$ 中有元素 $y$，使得 $y$ 的任何元素都不是 $x$ 的元素。这蕴含我们不能有下降链，其中每个集合是前一个的元素：

$$x_1 \ni x_2 \ni x_3 \ni \ldots$$

对集合 $\{x_1, x_2, x_3, \ldots\}$ 应用基础公理，知某个 $x_i$ 不包含任何其他元素，这仅当序列在 $x_i$ 处终止才可能。换言之，公理蕴含（且事实上等价于）属于关系是**良基的**（well founded），这解释了其名称。

前一节所列公理讲述了集合如何产生：从空集出发，反复运用幂集、并集、分离等构造。集合论家常把集合层次想象成大写的 V，空集在底部，较高层的集合以其元素为出现在更低层的集合。在精确意义上（此处不展开），基础公理说每个集合都以这种方式产生。

现在考虑下列集合序列：

$$\mathbb{N}, \;\; \mathcal P(\mathbb{N}), \;\; \mathcal P(\mathcal P(\mathbb{N})), \;\; \mathcal P (\mathcal P (\mathcal P (\mathbb{N}))), \;\; \ldots$$

它与迄今所有公理一致，即数学宇宙中的每个集合都是其中之一的一个元素。这仍给出大量集合，但既然我们已描述该序列，同样可以设想包含它们全部的集合：

$$\{ \mathbb{N}, \;\; \mathcal P(\mathbb{N}), \;\; \mathcal P(\mathcal P(\mathbb{N})), \;\; \mathcal P (\mathcal P (\mathcal P (\mathbb{N}))), \;\; \ldots \}.$$

下列公理蕴含此类集合的存在。

$$\text{替换公理（Replacement）：} \;\; \forall x, y_1, \ldots, y_n \;\; (\forall z \in x \; \exists ! w \; A(z, w, y_1, \ldots, y_n) \rightarrow \\
\exists u \; \forall w \; (w \in u \leftrightarrow \exists z \in x \; A(z, w, y_1, \ldots, y_n)))$$

与分离公理一样，这实为公理模式，即对每个公式 $A$ 各有一条公理。此处 $y_1, y_2, \ldots, y_n$ 是可在 $A$ 中出现的自由变量。理解公理时，最易把它们看作背景中固定的参数而忽略。公理说，若对每个 $z \in x$ 存在唯一的 $w$ 满足 $A(z,w)$，则存在单一集合 $u$，由每个这样的 $z$ 所对应的 $w$ 组成。换言之，若把 $A$ 看作定义域为 $x$ 的函数，公理断言该函数的值域存在。上例中，$x$ 是自然数，$A(z, w)$ 表示 $w$ 是 $\mathbb{N}$ 的幂集的 $z$ 次迭代。

迄今所列九条公理构成所谓 **Zermelo-Fraenkel 集合论**（ZF）。还有一条额外公理——**选择公理**（axiom of choice），通常单独列出，有历史原因：它曾被视为有争议，早期数学家认为追踪证明中是否实际用到它很重要。有许多等价表述，下面是最直白之一。

$$\text{选择公理（Choice）：} \;\; \forall x \; (\emptyset \notin x \rightarrow \exists f : x \to \bigcup x \; \forall y \in x \; f(y) \in y)$$

公理说，对任意非空集合的汇集 $x$，存在函数 $f$ 从每个集合中选取一个元素。我们在[第 15 章](functions.md)非形式地用过该公理，以证明每个满射都有右逆。事实上，在其余公理基础上，该陈述可与选择公理等价。

概括而言，带选择公理的 Zermelo-Fraenkel 集合论（ZFC）公理如下：

1. **外延公理：**

    $$\forall x, y \; (x = y \leftrightarrow \forall z (z \in x \leftrightarrow z \in y))$$

2. **空集公理：**

    $$\exists x \; \forall y \; y \notin x$$

3. **配对公理：**

    $$\forall x, y \; \exists z \; \forall w \; (w \in z \leftrightarrow w = x \vee w = y)$$

4. **并集公理：**

    $$\forall x \; \exists y \; \forall z \; (z \in y \leftrightarrow \exists w \; (w \in x \wedge z \in w))$$

5. **幂集公理：**

    $$\forall x \; \exists y \; \forall z \; (z \in y \leftrightarrow z \subseteq x)$$

6. **分离公理：**

    $$\forall x_1, x_2, \ldots, x_n, y \; \exists z \; \forall w \; (w \in z \leftrightarrow w \in y \wedge A(w,x_1, x_2, \ldots, x_n))$$

7. **无穷公理：**

    $$\exists x \; (\emptyset \in x \wedge \forall y \; (y \in x \rightarrow y \cup \{ y \} \in x))$$

8. **基础公理：**

    $$\forall x \; (\exists y \; y \in x \to \exists y \in x \; \forall z \in x \; z \notin y))$$

9. **替换公理：**

    $$\forall x, y_1, \ldots, y_n \;\; (\forall z \in x \; \exists ! w \; A(z, w, y_1, \ldots, y_n) \rightarrow \\
    \exists u \; \forall w \; (w \in u \leftrightarrow \exists z \in x \; A(z, w, y_1, \ldots, y_n)))$$

10. **选择公理：**

    $$\forall x \; (\emptyset \notin x \rightarrow \exists f : x \to \bigcup x \; \forall y \in x \; f(y) \in y)$$

## 23.4. 类型论

作为数学基础，Zermelo-Fraenkel 集合论很有吸引力。底层逻辑——一阶逻辑——为量词与逻辑联结词提供基本框架。在其上，理论描述单一、直观自然的概念：元素的集合。公理合情合理，且极为可信。值得注意的是，几乎全部现代数学都可归约为如此简单的术语。

然而还有其他基础可供选择。它们大体上与集合论相互可解释。毕竟，集合论语言如今已渗透日常数学，任何合理的基础都应能理解这种语言。另一方面，我们已注意到集合论表达力与稳健性惊人，故其他基础方法常可在集合论术语下理解，这并不意外。

这对**依赖类型论**尤其成立，它是 Lean 定理证明器的基础。类型论的语法比集合论复杂。在集合论中只有一种对象；正式地说，一切都是集合。相比之下，在类型论中，Lean 的每个合式表达式都有**类型**（type），定义类型的词汇丰富。

事实上，Lean 基于称为**归纳构造演算**（Calculus of Inductive Constructions）的公理化框架的一个版本，它提供以下全部内容：

- 类型宇宙的层次：`Type 0`、`Type 1`、`Type 2`、……以及特殊类型 `Prop`。表达式 `Type` 缩写 `Type 0`，说 `T : Type` 可解释为 `T` 是数据类型。类型 `Prop` 是命题的类型。

- **依赖函数类型** `Π x : A, B x`。该类型的元素 `f` 是把 `A` 的任意元素 `a` 映到类型 `B a` 的元素 `f a` 的函数。输出类型依赖输入类型，故称函数「依赖」。当输出类型不依赖输入时，得到简单函数类型 `A → B`。

- **归纳类型**，如自然数，由**构造子**（constructors）如 zero 与 successor 指定。每种此类类型带有归纳与递归原理。

这些构造既涵盖断言的底层逻辑（即命题），也涵盖宇宙中的对象——普通类型的元素。

把类型论解释进集合论是直截了当的，因为可把每个类型看作一个集合。类型宇宙只是集合的大汇集，依赖函数类型与归纳类型可用集合论构造说明。可把 `Prop` 看作真值集合 $\{ \top, \bot \}$，正如我们为命题逻辑描述真值表语义时那样。

既如此，交互式定理证明为何不用集合论而用类型论？有些交互式证明器确实如此。但类型论有一些优势：

- 形成表达式的规则如此严格，使系统更容易识别笔误并提供有用反馈。在类型论中，若 `f` 的类型是 `ℕ → ℕ`，则只能应用于自然数；若参数类型错误，定理证明器可报错。在集合论中，任何东西都可应用于任何东西，无论是否有意义。

- 同样，因形成规则严格，系统可从表达式的组成部分推断有用信息，而集合论要求我们显式给出此类信息。例如，对如上 `f`，定理证明器可推断 `f x` 中变量 `x` 应有类型 `ℕ`，且结果表达式再有类型 `ℕ`。在集合论中，$x \in \mathbb{N}$ 须作为显式假设陈述，$f(x) \in \mathbb{N}$ 才是定理。

- 把命题编码为特定类型的形式，使我们可用同一语言定义数学对象并书写数学证明。例如，我们以应用函数于参数的同样方式，把定理应用于某些假设。

- 依赖类型论足够纯粹部分的表达式有计算解释，因此逻辑框架告诉我们如何根据其定义求值阶乘函数。在集合论中，计算解释须事后独立指定。

这些事实呼应我们在[第 1 章](introduction.md)提出的关切分离：不同公理基础提供数学活动的不同理想化描述，可针对不同目的设计。若想要干净、简单的理论以涵盖绝大多数数学证明，集合论难以超越。若寻求以计算为中心、或以函数而非集合为基本概念的基础，类型论各变体各有魅力。对交互式定理证明，实现与可用性等务实问题也起作用。重要的是认识到，这些理想化描述的共同点在于：它们都旨在建模数学语言与证明的重要方面。我们的目标是帮助你反思赋予数学特殊品格的那些特征，并更好理解它们如何运作。

## 23.5. 练习

1. 用类似 Russell 悖论的论证证明不存在「所有集合的集合」，即不存在包含每个其他集合作为其元素的集合。

2. 设 $x$ 是非空集合，例如包含元素 $y$。用分离公理证明集合 $\bigcap x$ 存在。（记住：$w \in \bigcap x$ 当且仅当 $w$ 属于 $x$ 的每个元素。）

3. 证明[23.1 节](#231-集合的基本公理)中的断言：$x \times y$ 的每个元素都是 $\mathcal P (\mathcal P (x \cup y))$ 的元素。

4. 给定集合 $x$ 和函数 $A : x \to y$，用集合论公理证明 $\bigcup_{i \in x} A(i)$ 的存在性。