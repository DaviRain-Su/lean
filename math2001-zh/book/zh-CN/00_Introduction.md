# 前言

> 本译文对应原书 [Preface](https://hrmacbeth.github.io/math2001/00_Introduction.html)；英文 Sphinx 源：`00_Introduction.rst.txt`。

## 关于本书

本书讲授如何书写严谨、有条理的数学证明，并配套计算机形式化语言 [Lean](https://leanprover.github.io/about/) 中的代码。

本书侧重**技巧**而非**理论建构**：证明的定理并不多，也很少在后面反复引用。核心在于**例题**——正文中有两百多道带解答的例题，还有数百道留作读者练习。每道题及其解答都以标准数学文字和 Lean 两种形式呈现（阅读时应打开电脑，打开对应的 Lean 源文件）。对初学证明的学生而言，这两种「语言」几乎同样陌生，因此多数解答都附有非形式化的旁注说明。

## 为什么用 Lean？

人们用语言文字表达数学论证已有数千年，数学语言如今也已高度标准化，诸多约定让数学家能高效、无歧义地交流。本书的首要目标是教会你阅读与书写**标准数学英文散文**（standard mathematical English prose）。

称为**交互式定理证明器**（interactive theorem provers，亦称**证明助手** proof assistants 或**形式化** formalization 系统）的计算机系统，提供了表达数学论证的另一种方式。[Lean](https://leanprover.github.io/) 是自 2013 年起在 Microsoft Research 等地开发的开源项目，但这类系统自[计算机早期](https://en.wikipedia.org/wiki/Automath)就已存在。

像 Lean 这样的交互式定理证明系统这些年越来越易用，但还谈不上真正**容易**：它们和任何编程语言一样挑剔、不容差错。那为什么本书建议你在**第一次**接触证明时就使用这样的系统？

**第一**，名副其实——在交互式定理证明器中写证明是**交互**的。证明的每一步，你都能看到**证明状态**（proof state）的可视化：已知什么（**假设** hypotheses）、当前要证什么（**目标** goal(s)）。若你刚学写数学证明，可能会惊讶：在纸上交替使用前向与后向推理几步之后，就很难分清假设与目标；分情况讨论时也很容易丢掉某个分支。Lean 实时更新的证明状态可视化，让你不必把这些都记在脑子里。

**第二**，形式化系统毕竟是挑剔的编程语言，一旦出错就会报语法错误。反馈是即时的，你可以反复修改直到通过。在 Lean 中写出的解答保证**完全正确**：不会在减号下误代不等式、不会除以零、不会在代数中漏项。这对基于证明的数学尤其有用：微积分题做到一半犯个小错，后面解答往往变化不大；证明做到一半犯个小错，后面可能就全废了。

**第三**，你与 Lean 的交互通过**策略**（tactics）进行，每个策略对应某种推理模式中的单一步骤。本书讲授的策略（部分为本书定制）在本书所构建的推理世界里，各自构成一个允许的推理「原子」。这使原本在纯文字教材中往往主观的问题变得客观：**什么算充分详细的证明**。此外，这些「原子」的设计会引导你采用标准数学散文中常见、但学生往往学得较慢的论证结构[^1]。

这是一本**以 Lean 为工具的数学书**。设计上让 Lean 的学习曲线比数学更平缓[^2]——一部分靠精心选题，一部分靠使用我为本书写的 Lean「方言」，词汇有限[^3]，又刚好够本书数学之需。（与常规 Lean 的主要差异见附录 [过渡到主流 Lean](Mainstream_Lean.md)。）我希望你在解题时把主要智力投入放在数学上，而不是 Lean 的实现细节或语法怪癖。

## 内容与预备知识

若你（1）熟练掌握高中代数，且（2）有过学习并执行复杂数学算法的经验，就可以阅读本书。典型读者是刚修完微积分 II 的一、二年级大学生，但本书**并不使用**微积分。

本书的主要新意是「双语」呈现：数学散文与 Lean 代码并列。为配合这种呈现方式而做的设计选择，也影响了全书的其他安排。

[第 1 章 计算式证明](01_Proofs_by_Calculation.md) 对「计算式证明」（calculational proofs）的处理格外细致。这类证明是全书自然的起点（因为它们容易翻译成 Lean），本身也是这一层次学生常感困难的专题[^4]。

[第 2 章 结构化证明](02_Proofs_with_Structure.md) 与 [第 4 章 结构化证明 II](04_Proofs_with_Structure_II.md) 缓慢推进[自然演绎](https://en.wikipedia.org/wiki/Natural_deduction)规则，在关于 $\mathbb{N}$、$\mathbb{Z}$、$\mathbb{Q}$、$\mathbb{R}$ 的题目中逐步引入更多逻辑连接词与量词。必须把一切翻译成 Lean，使这些章节保持严格诚实——典型的入门证明教材没有这道护栏，常会在这里略有滥用，例如给出分情况证明的好例子，却隐含使用了尚未讲过的技巧（如为存在量词填见证）。

逻辑直到 [第 5 章 逻辑](05_Logic.md) 才显式讲授；到那时读者已熟悉各种连接词/量词，并能在文字与符号之间来回翻译。这使逻辑章可以相对简短，侧重**逻辑等价**（主要用自然演绎呈现，与第 2、4 章衔接，而非真值表）[^5]。

其余章节更接近常见入门证明课的主题。此时读者已具备足够的 Lean 熟练度，数学呈现不再受形式化约束。

[第 3 章 奇偶与整除](03_Parity_and_Divisibility.md) 涵盖初等数论的基本概念。本章只用有限的推理工具箱，以便放在第 2 章与第 4 章之间作缓冲。数论定义与定理在后续章节仍作为例题出现；该主题的完整呈现则在 [第 7 章 数论](07_Number_Theory.md)，包括素数无穷、欧几里得引理、$\sqrt{2}$ 的无理性等希腊数学的重要结果。

[第 6 章 归纳法](06_Induction.md) 涵盖归纳法，处理相当全面，包括在 $\mathbb{Z}$、$\mathbb{N}\times \mathbb{N}$、$\mathbb{Z}\times \mathbb{Z}$ 上相对于各种非平凡良基关系的归纳与递归。

最后，[第 8 章 函数](08_Functions.md)、[第 9 章 集合](09_Sets.md)、[第 10 章 关系](10_Relations.md) 依次讨论函数、集合与关系——我们采用类型论观点：函数是原始概念，集合与关系定义为取值于 $\left[\operatorname{true}/\operatorname{false}\right]$ 的函数。

## 致教师

本书基于我 2023 年春季在 Fordham University 讲授的课程讲义。班上有 20 名学生，多为一、二年级，数学背景中位数约为微积分 II；不少人还修过一门计算机编程入门课。

课程每周两次、每次 75 分钟，共 13 周，期间覆盖了本书约 80% 的内容。典型课堂结构可能是：

* 25 分钟传统黑板讲授；
* 5 分钟屏幕共享，在 Lean 中做同样题目；
* 20 分钟两人一组在 Lean 中练习，教师巡视；
* 25 分钟传统黑板讲授，可能比第一段更偏理论。

课程作业可应要求提供。作业量相对较少（每周 5–7 题），但要求学生几乎每题都同时交书面版与 Lean 版。多数学生需要 office hour 或邮件支持才能完成作业。

课程还在第 5、10 周进行口试：20 分钟一对一，考查 Lean 熟练度——学生当场解答未见过的 Lean 练习（每人题目不同），并口头说明推理。成绩构成：作业 25%、口试 20%、传统笔试 55%（期中期末均完全不使用 Lean）。

显然，课内巡视、作业辅导与口试加起来，需要大量与单个学生（或小组）互动的时间。20:1 的师生比是可持续的。若比例更高，可能需要基础很强的学生，或经验丰富、热情的助教。

学生在云开发环境中运行 Lean，以免在本机安装。我使用 [Gitpod](https://www.gitpod.io/)（亦可选用 [GitHub Codespaces](https://github.com/features/codespaces)）——见本书[代码仓库](https://github.com/hrmacbeth/math2001) README 中如何启动 Gitpod 的简要说明。Lean 作业通过 [Gradescope](https://www.gradescope.com/) 自动批改（亦可选用 [GitHub Classroom](https://classroom.github.com/)）。Lean 社区的[教学建议页面](https://leanprover-community.github.io/teaching/) 提供搭建此类课程基础设施的说明与排错指引。

## 致谢

衷心感谢：

* Microsoft Research 的[资助](https://www.microsoft.com/en-us/research/academic-program/microsoft-research-lean-award-program/)，支持了本书写作；
* Fordham 我所在的院系，允许我讲授这门实验课程，本书由此生长；
* 该课程 Math 2001 L01 Spring 2023 的勇敢学生们，热情与机智令人难忘；
* Matthew Hertz，搭建本书 Sphinx 基础设施并排版最初几章；
* [mathlib 社区](https://leanprover-community.github.io/)，尤其 Mario Carneiro、Gabriel Ebner、Scott Morrison、Thomas Murrills、David Renshaw，在 2022 秋与 2023 冬优先移植课程所需的 Lean 3 → Lean 4 库部分；
* Mario Carneiro（再次）在马拉松式 hacking 中实现了本书最有趣的定制策略；
* Jeremy Avigad、Rob Lewis、Patrick Massot，分享基于 Lean 课程的技术基础设施，并就「用 Lean 教数学」的梦想进行了许多对话。

---

### 脚注

[^1]: 例如，大部分代数推理使用 calculation 块，并偏好前向而非后向推理。

[^2]: 若你想要相反方向，[Mathematics in Lean](https://leanprover-community.github.io/mathematics_in_lean/) 是数学 Lean 的标准入门。但那一本期望的数学经验比本书更多：要写地道的 Lean 代码，即便证明初等命题，也需要一定的数学成熟度。

[^3]: 代数推理的策略词汇 `ring`、`rw`、`numbers`（即 `norm_num`）、`rel`（本书定制，现已在 mathlib 中）、`extra`（本书定制）与 `cancel`（本书定制），足以处理整数上几乎所有代数推理，包括非线性不等式。第 1 章中从「在 Lean 中证明等式」到「策略模式」的训练，使后续不必按名调用无穷无尽的引理，例如 `mul_le_mul_of_nonneg_left`、`pow_pos`、`le_of_pow_le_pow`。其他定制自动化轻量处理了归纳原理、良基性论证、积类型与集合。全书按名调用的引理不到五十条。

[^4]: 许多入门证明课可以在不真正掌握这一模式的情况下完成以**等式**为主的推理，但要推理**不等式**几乎不可能不掌握计算式证明；入门课没学好这项技能的人，学到实分析时还会再碰到它。

[^5]: 专业读者或可欣赏 [第 5 章](05_Logic.md) 中引入经典推理的一节习题：据我所知这些题目是新的，且比常见教材例子更初等。