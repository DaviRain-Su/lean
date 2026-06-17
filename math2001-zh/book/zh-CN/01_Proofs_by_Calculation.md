# 第 1 章 计算式证明

> 本译文对应原书 [Proofs by calculation](https://hrmacbeth.github.io/math2001/01_Proofs_by_Calculation.html)；英文 Sphinx 源：`01_Proofs_by_Calculation.rst.txt`。

本书从熟悉的数的世界开始：$\mathbb{N}$（自然数，本书中包括 0）、$\mathbb{Z}$（整数）、$\mathbb{Q}$（有理数）和 $\mathbb{R}$（实数）。我们要解决的问题很像高中代数——从已知等式/不等式推出新的等式/不等式——但会用到高中代数里通常不教的一种技巧：构造一条从左边表达式连到右边表达式的**计算链**（chain of expressions）。

## 1.1 证明等式

### 1.1.1 例题

我们从证明等式开始。下面是前述技巧的一个典型例子。

**问题**

设 $a$、$b$ 为有理数，且 $a - b = 4$、$ab=1$。证明 $(a+b)^2=20$。

**解**

$$
\begin{aligned}
(a+b)^2 &=(a-b)^2+4ab\\
&=4^2+4\cdot 1\\
&=20.
\end{aligned}
$$

我们把上面的证明称为**计算式证明**（proof by calculation）。目标是证明 $(a+b)^2=20$，做法是把一串等式写下来：从表达式 $(a+b)^2$（左上）出发，到 $20$（右下）结束。这个证明隐含三步：

1. $\underline{\text{证明 }(a+b)^2=(a-b)^2+4ab}$：纯代数变形——展开并化简后，两边都是 $a^2+2ab+b^2$。

2. $\underline{\text{证明 }(a-b)^2+4ab=4^2+4\cdot 1}$：纯代入步骤，用到已知 $a-b=4$ 和 $ab=1$。

3. $\underline{\text{证明 }4^2+4\cdot 1=20}$：又一次纯代数步骤。

这是高等数学教材与研究论文中最常见的等式证明写法。权衡在于：用这种风格组织证明，作者往往要多费些功夫，但读者读起来短而易于核对——这是对读者的礼貌。

在 [第 1.3 节](#13-技巧与窍门) 我们会讨论如何想出这种风格的证明。眼下先专注于如何读懂它们。

### 1.1.2 例题

**问题**

设 $r$、$s$ 为实数，且 $r + 2 s = -1$、$s = 3$。证明 $r = -7$。

**解**

$$
\begin{aligned}
r &= (r + 2s) - 2s \\
&= -1 - 2s\\
&= -1 - 2 \cdot 3 \\
&= - 7.
\end{aligned}
$$

这个证明隐含四步，逐步把左边 $r$ 变成右边 $-7$：

1. $\underline{\text{证明 }r=(r+2s)-2s}$：纯代数变形。

2. $\underline{\text{证明 }(r+2s)-2s=-1 - 2s}$：纯代入，用到 $r + 2 s = -1$。

3. $\underline{\text{证明 }-1-2s=-1 - 2 \cdot 3}$：纯代入，用到 $s = 3$。

4. $\underline{\text{证明 }-1 - 2 \cdot 3=-7}$：纯代数步骤。

你可能会问：这种写法有多大灵活性？常见做法是把证明中每个表达式单独占一行，这样第一个表达式不会孤零零地留在左边。这完全可以接受；若表达式很长、需要额外空间，这样写尤其有用。

**解**

$$
\begin{aligned}
&r \\
&= (r + 2s) - 2s \\
&= -1 - 2s\\
&= -1 - 2 \cdot 3 \\
&= - 7.
\end{aligned}
$$

有时学生会想省略等号，或把等号放在右边。这非常不规范；不要这样做！

最后注意，计算以句号结束。整段计算被视为一个句子，句号收尾。

### 1.1.3 例题

下一个例子仍是「代数、代入、代数」的模式。请在脑中逐步核对。

**问题**

设 $a$、$b$、$m$、$n$ 为整数，且 $b^2=2a^2$、$am+bn=1$。证明 $(2an+bm)^2=2$。

**解**

$$
\begin{aligned}
(2an + bm) ^ 2 &= 2(am + bn) ^ 2 + (m ^ 2 - 2n ^ 2) (b ^ 2 - 2 a ^ 2) \\
&= 2 \cdot 1 ^ 2 + (m ^ 2 - 2n ^ 2) (2a ^ 2 - 2a ^ 2) \\
& = 2.
\end{aligned}
$$

此例第一步所需的代数

$$(2an + bm) ^ 2= 2(am + bn) ^ 2 + (m ^ 2 - 2n ^ 2) (b ^ 2 - 2 a ^ 2),$$

相当繁复。（该恒等式称为 [婆罗摩笈多恒等式](https://en.wikipedia.org/wiki/Brahmagupta%27s_identity)（Brahmagupta's identity），由约公元 628 年发现它的印度数学家命名。）你可选地多写几步中间等式，让读者用更简单的代数逐步核对。

**解**

$$
\begin{aligned}
(2an + bm) ^ 2 &=4a^2n^2+4anbm+b^2m^2\\
&=2(a^2m^2+2anbm+b^2n^2)+(4a^2n^2+b^2m^2-2a^2m^2-2b^2n^2)\\
&= 2(am + bn) ^ 2 + (m ^ 2 - 2n ^ 2) (b ^ 2 - 2 a ^ 2) \\
&= 2 \cdot 1 ^ 2 + (m ^ 2 - 2n ^ 2) (2a ^ 2 - 2a ^ 2) \\
& = 2.
\end{aligned}
$$

### 1.1.4 例题

再举一个例子。请在脑中逐步核对。注意：你可能会想先对 $a$、$f$「解出」$a=bc/d$、$f = de/c$，但这会引入关于 $d=0$、$c=0$ 的不必要分情况，反而更麻烦。直接计算式证明可以避免这些分情况。

**问题**

设 $a$、$b$、$c$、$d$、$e$、$f$ 为整数，且 $ad = bc$、$cf=de$。证明 $d(af - be) = 0$。

**解**

$$
\begin{aligned}
d(af - be) &= (ad)  f - dbe \\
&= (bc)  f - dbe \\
&= b (cf) - dbe \\
&= b (d e) - dbe \\
&= 0.
\end{aligned}
$$

## 1.2 在 Lean 中证明等式

本书中，每个证明都要写两遍：用文字——人类几千年来的方式——以及用称为**证明助手**（proof assistant）的计算机系统；后者自 [20 世纪 60 年代](https://en.wikipedia.org/wiki/Automath) 起有人尝试，至今仍不常见。我们使用自 2014 年起在 Microsoft Research 等地由 Leonardo de Moura 领导的团队开发的证明助手 [Lean 4](https://leanprover.github.io/)，及其标准数学库 [Mathlib](https://github.com/leanprover-community/mathlib4)。

本书后续每一节都有对应的 Lean 文件；阅读时请同时打开并动手实验。请前往 GitHub 仓库 [https://github.com/hrmacbeth/math2001](https://github.com/hrmacbeth/math2001)，按说明把代码下载到本机，或在 Gitpod 云端打开。初学者推荐 Gitpod——注册账号即可开始，无需本地安装 Lean。

Lean 代码应在**交互式开发环境**（interactive development environment，IDE）中编写，以便实时获得反馈。本书假定你使用 IDE **Visual Studio Code**——启动 Gitpod 时会自动打开。

入门时，在 Visual Studio Code 中打开与本节对应的文件 `Math2001/01_Proofs_by_Calculation/02_Proving_Equalities_in_Lean`。打开后可能出现名为「Lean Infoview」的第二面板；暂时可忽略甚至关闭。我们将在 [第 2 章](02_Proofs_with_Structure.md) 开始使用 Lean Infoview。

### 1.2.1 例题

文件中前两行重要代码如下：

```lean
example {a b : ℚ} (h1 : a - b = 4) (h2 : a * b = 1) : (a + b) ^ 2 = 20 :=
```

这是 [例题 1.1.1](#111-例题) 的 Lean 表述：

**问题**

设 $a$、$b$ 为有理数，且 $a - b = 4$、$ab=1$。证明 $(a+b)^2=20$。

代码 `{a b : ℚ}` 声明两个变量 `a`、`b`，类型为 `ℚ`，即有理数的标准记号（助记："quotients"，商）。

代码 `(h1 : a - b = 4) (h2 : a * b = 1)` 给出两个**假设**（hypotheses），对应题设中的 $a - b = 4$ 和 $ab=1$。Lean 中假设有名字，这里是 `h1`、`h2`，以便后面引用。注意乘法必须显式写出，用符号 `*`；纸上则常把两变量并写为 $ab$。

冒号 `:` 之后是**目标**（goal），即要证的命题：`(a + b) ^ 2 = 20`，即 $(a+b)^2=20$。Lean 用 `^` 表示乘方。

Lean 的核心特点是边写边检查证明，即时反馈是否正确。上一节纸面解答是一段计算：

$$
\begin{aligned}
(a+b)^2 &=(a-b)^2+4ab\\
&=4^2+4\cdot 1\\
&=20.
\end{aligned}
$$

在 Lean 中可用关键字 `calc` 写成「计算块」（calculation block）。计算各步的写法与纸上类似；每行末尾要给出该步有效的理由。上一节已说明三步各自为何成立：

1. $\underline{\text{证明 }(a+b)^2=(a-b)^2+4ab}$：代数变形

2. $\underline{\text{证明 }(a-b)^2+4ab=4^2+4\cdot 1}$：代入，用到 $a-b=4$ 和 $ab=1$

3. $\underline{\text{证明 }4^2+4\cdot 1=20}$：代数变形

在 Lean 中，代数变形用**策略**（tactic）`ring` 表示；代入用策略 `rw`（rewrite 的缩写）。代入时必须指明所用假设的名字。

```lean
example {a b : ℚ} (h1 : a - b = 4) (h2 : a * b = 1) : (a + b) ^ 2 = 20 :=
  calc
    (a + b) ^ 2 = (a - b) ^ 2 + 4 * (a * b) := by ring
    _ = 4 ^ 2 + 4 * 1 := by rw [h1, h2]
    _ = 20 := by ring
```

### 1.2.2 例题

下面是 [例题 1.1.2](#112-例题) 的 Lean 表述及其证明；纸面上为：

$$
\begin{aligned}
r &= (r + 2s) - 2s \\
&= -1 - 2s\\
&= -1 - 2 \cdot 3 \\
&= - 7.
\end{aligned}
$$

在四个标有 Lean 占位符 `sorry`[^1] 处，填入合适的 Lean 理由（`ring` 或带假设的 `rw`）。

```lean
example {r s : ℝ} (h1 : s = 3) (h2 : r + 2 * s = -1) : r = -7 :=
  calc
    r = r + 2 * s - 2 * s := by sorry
    _ = -1 - 2 * s := by sorry
    _ = -1 - 2 * 3 := by sorry
    _ = -7 := by sorry
```

填写理由时，你大概已发现 Lean 出错时会出现红色下划线。例如下列情况都会在某处出现红线下划线——不妨试一下！

- 拼写错误，如把 `ring` 写成 `rin`
- 标点错误，如 `rw [h2` 而不是 `rw [h2]`
- 理由策略用错，如该用 `rw` 却写了 `ring`
- 给策略的信息错误，如实际应代入 `h1` 却写了 `rw [h2]`
- 计算中数学错误，如写成 `1 - 2 * s` 而不是 `-1 - 2 * s`

若处处无红线下划线，则证明正确。有时红线很细，请仔细看。还可查看 VS Code 底部蓝色状态栏：符号「⊗」旁的数字表示文件中错误数；无错误时还会有勾号。

### 1.2.3 例题

下面是 [例题 1.1.3](#113-例题) 的 Lean 表述；纸面证明为：

$$
\begin{aligned}
(2an + bm) ^ 2 &= 2(am + bn) ^ 2 + (m ^ 2 - 2n ^ 2) (b ^ 2 - 2 a ^ 2) \\
&= 2 \cdot 1 ^ 2 + (m ^ 2 - 2n ^ 2) (2a ^ 2 - 2a ^ 2) \\
& = 2.
\end{aligned}
$$

与之前一样，在三处 `sorry` 填入合适的 Lean 理由。

```lean
example {a b m n : ℤ} (h1 : a * m + b * n = 1) (h2 : b ^ 2 = 2 * a ^ 2) :
    (2 * a * n + b * m) ^ 2 = 2 :=
  calc
    (2 * a * n + b * m) ^ 2
      = 2 * (a * m + b * n) ^ 2 + (m ^ 2 - 2 * n ^ 2) * (b ^ 2 - 2 * a ^ 2) := by sorry
    _ = 2 * 1 ^ 2 + (m ^ 2 - 2 * n ^ 2) * (2 * a ^ 2 - 2 * a ^ 2) := by sorry
    _ = 2 := by sorry
```

### 1.2.4 例题

最后是 [例题 1.1.4](#114-例题) 的 Lean 表述。纸面证明为：

$$
\begin{aligned}
d(af - be) &= (ad)  f - dbe \\
&= (bc)  f - dbe \\
&= b (cf) - dbe \\
&= b (d e) - dbe \\
&= 0.
\end{aligned}
$$

请把完整证明敲进 Lean，并填好每步理由。注意 Lean 对运算顺序非常敏感：例如 `(x * y) * z`、`x * (y * z)`、`(y * x) * z` 在 Lean 中含义不同[^2]。请仔细对照纸面每一步；重写（rewrite）时，括号必须恰好包住你要代入的那一小段表达式。

```lean
example {a b c d e f : ℤ} (h1 : a * d = b * c) (h2 : c * f = d * e) :
    d * (a * f - b * e) = 0 :=
  sorry
```

### 1.2.5 练习

下一节 [第 1.3 节](#13-技巧与窍门) 有许多计算式证明例题。暂不必细读该节数学，请先把其中一些例题按纸面证明敲成 Lean。下一节对应文件为 `Math2001/01_Proofs_by_Calculation/03_Tips_and_Tricks`。

[^1]: 你是在向 Lean「道歉」——尚未给出该断言的证明！

[^2]: 若无括号，如 `x * y * z`，Lean 会贪婪地从前方结合：`(x * y) * z`。

## 1.3 技巧与窍门

### 1.3.1 例题

本节介绍如何实际构造计算式证明的一些技巧。

**问题**

设 $a$、$b$ 为整数，且 $a = 2b + 5$、$b = 3$。证明 $a = 11$。

目标是 $a=11$，解的大致形状已知：

$$
\begin{aligned}
a&=\ldots\\
&=\ldots\\
&=11.
\end{aligned}
$$

环顾假设，$a = 2b + 5$ 左边正好是 $a$，故把它作为计算第一步，其余步骤自然跟上。

**解**

$$
\begin{aligned}
a &= 2b + 5 \\
&= 2 \cdot 3 + 5 \\
&= 11.
\end{aligned}
$$

```lean
example {a b : ℤ} (h1 : a = 2 * b + 5) (h2 : b = 3) : a = 11 :=
  sorry
```

### 1.3.2 例题

更常见的情况是：没有哪个假设的左端或右端恰好出现在目标里。例如：

**问题**

设 $x$ 为整数，且 $x+4=2$。证明 $x=-2$。

目标是 $x=-2$，解形如：

$$
\begin{aligned}
x&=\ldots\\
&=\ldots\\
&=-2.
\end{aligned}
$$

唯一假设左边是 $x+4$，于是在目标里「造出」$x+4$：对 $x$ 加 4 再减 4，即 $x=(x+4)-4$，其余就容易了。

**解**

$$
\begin{aligned}
x&=(x+4)-4\\
&=2-4\\
&=-2.
\end{aligned}
$$

```lean
example {x : ℤ} (h1 : x + 4 = 2) : x = -2 :=
  sorry
```

### 1.3.3 例题

有时要在目标里「造出」假设的一边，且不止一次。

**问题**

设 $a$、$b$ 为实数，且 $a-5b=4$、$b+2=3$。证明 $a=9$。

解的第一步「造出」$a-5b$；第三步再「造出」$b+2$。

**解**

$$
\begin{aligned}
a &= (a - 5b) + 5b\\
&= 4 + 5b \\
&= -6 + 5(b + 2) \\
&= -6 + 5 \cdot 3 \\
&= 9.
\end{aligned}
$$

```lean
example {a b : ℝ} (h1 : a - 5 * b = 4) (h2 : b + 2 = 3) : a = 9 :=
  sorry
```

### 1.3.4 例题

「造出」假设一边时，可能既要加减又要乘除。

**问题**

设 $w$ 为有理数，且 $3w+1=4$。证明 $w=1$。

**解**

$$
\begin{aligned}
w&=\frac{3w+1}{3}-\frac{1}{3}\\
&=\frac{4}{3}-\frac{1}{3}\\
&=1.
\end{aligned}
$$

```lean
example {w : ℚ} (h1 : 3 * w + 1 = 4) : w = 1 :=
  sorry
```

### 1.3.5 例题

这一技巧也适用于经典代数 I 型方程。例如：

**问题**

设 $x$ 为整数，且 $2x + 3 = x$。证明 $x=-3$。

你可能学过通过移项变形来解：

$$
\begin{aligned}
2x+3&=x\\
2x+3-x&=x-x\\
x + 3&= 0\\
x &=-3.
\end{aligned}
$$

但也可写成计算式证明：在目标里「造出」$2x+3$。

**解**

$$
\begin{aligned}
x&=(2x+3)-x-3\\
&=x-x-3\\
&=-3.
\end{aligned}
$$

```lean
example {x : ℤ} (h1 : 2 * x + 3 = x) : x = -3 :=
  sorry
```

### 1.3.6 例题

联立方程组也类似。例如：

**问题**

设 $x$、$y$ 为整数，且 $2x-y=4$、$y-x+1=2$。证明 $x=5$。

你可能学过通过加减方程消元，再解一元方程：

$$
\begin{aligned}
2x-y&=4 & \hspace{1cm}&(1)\\
y-x+1&=2 & \hspace{1cm}&(2)\\
(2x-y)+(y-x+1)&=4+2 & \hspace{1cm}&\text{将 (1) 与 (2) 相加}\\
x +1&=6 & \hspace{1cm}&\\
x&=5 & \hspace{1cm}&
\end{aligned}
$$

同一论证也可写成计算式证明，好处是无需神秘的「把 (1) 与 (2) 相加」一行及其说明。

**解**

$$
\begin{aligned}
x &=(2x-y)+(y-x+1)-1\\
&=4+2-1\\
&= 5.
\end{aligned}
$$

```lean
example {x y : ℤ} (h1 : 2 * x - y = 4) (h2 : y - x + 1 = 2) : x = 5 :=
  sorry
```

### 1.3.7 例题

再举一个通过巧妙组合假设解联立方程的例子。

**问题**

设 $u$、$v$ 为有理数，且 $u+2v=4$、$u-2v=6$。证明 $u=5$。

**解**

$$
\begin{aligned}
u &= \frac{(u+2v)+(u-2v)}{2}\\
&=\frac{4+6}{2}\\
&=5.
\end{aligned}
$$

```lean
example {u v : ℚ} (h1 : u + 2 * v = 4) (h2 : u - 2 * v = 6) : u = 5 :=
  sorry
```

### 1.3.8 例题

再一例——需结合前两例的技巧：给假设乘不同系数以消去 $y$，再除以剩下的 $x$ 的系数。

**问题**

设 $x$、$y$ 为实数，且 $x + y = 4$、$5x-3y=4$。证明 $x=2$。

**解**

$$
\begin{aligned}
x &= \frac{3(x+y)+(5x-3y)}{8}\\
&=\frac{3\cdot 4+4}{8}\\
&=2.
\end{aligned}
$$

```lean
example {x y : ℝ} (h1 : x + y = 4) (h2 : 5 * x - 3 * y = 4) : x = 2 :=
  sorry
```

### 1.3.9 例题

最后看几个次数高于 1 的方程。

**问题**

设 $a$、$b$ 为有理数，且 $a-3=2b$。证明 $a ^ 2 - a + 3 = 4 b ^ 2 + 10  b + 9$。

**解**

$$
\begin{aligned}
a ^ 2 - a + 3 &=\left[(a-3)^2+6a-9\right]-a+3\\
&=(a-3)^2+5a-6\\
&=(a-3)^2+5[(a-3)+3]-6\\
&=(a-3)^2+5(a-3)+9\\
&=(2b)^2+5(2b)+9\\
&=4b^2+10b+9.
\end{aligned}
$$

上面证明步数略多，是为了说明如何想出证明：先处理 $a^2$，引入 $(a-3)^2$ 并加减多余项；化简；再处理 $a$；再化简；再代入并化简。也可合并连续的纯代数步，尽量缩短：一大步代数、一步代入、再一步代数。

**解**

$$
\begin{aligned}
a ^ 2 - a + 3 &=(a-3)^2+5(a-3)+9\\
&=(2b)^2+5(2b)+9\\
&=4b^2+10b+9.
\end{aligned}
$$

```lean
example {a b : ℚ} (h1 : a - 3 = 2 * b) : a ^ 2 - a + 3 = 4 * b ^ 2 + 10 * b + 9 :=
  sorry
```

### 1.3.10 例题

又一个高次项的例子。

**问题**

设 $z$ 为实数，且 $z^2-2=0$。证明 $z ^ 4 - z ^ 3 - z ^ 2 + 2 z + 1=3$。

**解**

$$
\begin{aligned}
z ^ 4 - z ^ 3 - z ^ 2 + 2 z + 1 &=(z ^ 2 - z + 1) (z ^ 2 - 2)+3\\
&=(z^2-z+1)\cdot 0+3\\
&=3.
\end{aligned}
$$

似乎太「巧」了？我在草稿里用你可能学过的 [多项式长除](https://en.wikipedia.org/wiki/Polynomial_long_division)（polynomial long division）：$z ^ 4 - z ^ 3 - z ^ 2 + 2 z + 1$ 除以 $z^2-2$ 得商 $z ^ 2 - z + 1$、余数 $3$。但在证明里，发现

$$z ^ 4 - z ^ 3 - z ^ 2 + 2 z + 1=(z ^ 2 - z + 1) (z ^ 2 - 2)+3$$

用了什么方法并不重要——这是纯代数恒等式，展开化简即可核对，故可直接陈述结果而不写发现过程。

```lean
example {z : ℝ} (h1 : z ^ 2 - 2 = 0) : z ^ 4 - z ^ 3 - z ^ 2 + 2 * z + 1 = 3 :=
  sorry
```

### 1.3.11 练习

对下列各题给出计算式证明。

1. 设 $x$、$y$ 为实数，且 $x = 3$、$y = 4x - 3$。证明 $y = 9$。

```lean
example {x y : ℝ} (h1 : x = 3) (h2 : y = 4 * x - 3) : y = 9 :=
  sorry
```

2. 设 $a$、$b$ 为整数，且 $a-b=0$。证明 $a=b$。

```lean
example {a b : ℤ} (h : a - b = 0) : a = b :=
  sorry
```

3. 设 $x$、$y$ 为整数，且 $x-3y=5$、$y=3$。证明 $x=14$。

```lean
example {x y : ℤ} (h1 : x - 3 * y = 5) (h2 : y = 3) : x = 14 :=
  sorry
```

4. 设 $p$、$q$ 为有理数，且 $p-2q=1$、$q=-1$。证明 $p=-1$。

```lean
example {p q : ℚ} (h1 : p - 2 * q = 1) (h2 : q = -1) : p = -1 :=
  sorry
```

5. 设 $x$、$y$ 为有理数，且 $y+1=3$、$x+2y=3$。证明 $x=-1$。

```lean
example {x y : ℚ} (h1 : y + 1 = 3) (h2 : x + 2 * y = 3) : x = -1 :=
  sorry
```

6. 设 $p$、$q$ 为整数，且 $p+4q=1$、$q-1=2$。证明 $p=-11$。

```lean
example {p q : ℤ} (h1 : p + 4 * q = 1) (h2 : q - 1 = 2) : p = -11 :=
  sorry
```

7. 设 $a$、$b$、$c$ 为实数，且 $a+2b+3c=7$、$b+2c=3$、$c=1$。证明 $a=2$。

```lean
example {a b c : ℝ} (h1 : a + 2 * b + 3 * c = 7) (h2 : b + 2 * c = 3)
    (h3 : c = 1) : a = 2 :=
  sorry
```

8. 设 $u$、$v$ 为有理数，且 $4u+v=3$、$v=2$。证明 $u=1/4$。

```lean
example {u v : ℚ} (h1 : 4 * u + v = 3) (h2 : v = 2) : u = 1 / 4 :=
  sorry
```

9. 设 $c$ 为有理数，且 $4 c + 1 = 3 c - 2$。证明 $c = -3$。

```lean
example {c : ℚ} (h1 : 4 * c + 1 = 3 * c - 2) : c = -3 :=
  sorry
```

10. 设 $p$ 为实数，且 $5 p - 3 = 3 p + 1$。证明 $p = 2$。

```lean
example {p : ℝ} (h1 : 5 * p - 3 = 3 * p + 1) : p = 2 :=
  sorry
```

11. 设 $x$、$y$ 为整数，且 $2x+y=4$、$x+y=1$。证明 $x=3$。

```lean
example {x y : ℤ} (h1 : 2 * x + y = 4) (h2 : x + y = 1) : x = 3 :=
  sorry
```

12. 设 $a$、$b$ 为实数，且 $a + 2  b = 4$、$a - b = 1$。证明 $a = 2$。

```lean
example {a b : ℝ} (h1 : a + 2 * b = 4) (h2 : a - b = 1) : a = 2 :=
  sorry
```

13. 设 $u$、$v$ 为实数，且 $u+1=v$。证明 $u^2+3u+1=v^2+v-1$。

```lean
example {u v : ℝ} (h1 : u + 1 = v) : u ^ 2 + 3 * u + 1 = v ^ 2 + v - 1 :=
  sorry
```

14. 设 $t$ 为有理数，且 $t^2-4=0$。证明 $t^4 + 3t^3 - 3t^2 - 2 t - 2 = 10t+2$。

```lean
example {t : ℚ} (ht : t ^ 2 - 4 = 0) :
    t ^ 4 + 3 * t ^ 3 - 3 * t ^ 2 - 2 * t - 2 = 10 * t + 2 :=
  sorry
```

15. $^*$ 设 $x$、$y$ 为实数，且 $x + 3 = 5$、$2x - yx = 0$。证明 $y = 2$。

```lean
example {x y : ℝ} (h1 : x + 3 = 5) (h2 : 2 * x - y * x = 0) : y = 2 :=
  sorry
```

16. $^*$ 设 $p$、$q$、$r$ 为有理数，且 $p + q + r = 0$、$pq + pr + qr = 2$。证明 $p ^ 2 + q ^ 2 + r ^ 2 = -4$。

```lean
example {p q r : ℚ} (h1 : p + q + r = 0) (h2 : p * q + p * r + q * r = 2) :
    p ^ 2 + q ^ 2 + r ^ 2 = -4 :=
  sorry
```

## 1.4 证明不等式

### 1.4.1 例题

计算式证明也适合证不等式，即含 $<$、$\le$、$>$ 或 $\ge$ 的命题。请看下面完整例题：

**问题**

设 $x$、$y$ 为整数，且 $x + 3 \le 2$、$y + 2x\geq 3$。证明 $y>3$。

**解**

$$
\begin{aligned}
y&=(y+2x)-2x\\
&\geq 3 - 2x\\
&=9 - 2(x+3)\\
&\geq 9 - 2 \cdot 2\\
&> 3.
\end{aligned}
$$

目标是 $y>3$：写下一串不等式，从 $y$（左上）到 $3$（右下）。证明隐含五步：

1. $\underline{\text{证明 }y=(y+2x)-2x}$：代数变形。

2. $\underline{\text{证明 }(y+2x)-2x\geq 3-2x}$：用到 $y + 2x\geq 3$，以及一般规则：不等式在两边同减一数时保持（$A\geq B$ 推出 $A-C\geq B-C$）。

3. $\underline{\text{证明 }3-2x=9-2(x+3)}$：代数变形。

4. $\underline{\text{证明 }9-2(x+3)\geq 9-2\cdot 2}$：用到 $x + 3 \le 2$，以及：不等式乘以正数时保持（若 $C\geq 0$，则 $A\geq B$ 推出 $CA\geq CB$）；不等式被减去时反向（$A\geq B$ 推出 $C-B\geq C-A$）。

5. $\underline{\text{证明 }9-2\cdot 2>3}$：可直接计算比较的数值事实。

请仔细想第 2、4 步。它们很像等式计算式证明里的「代入步」（Lean 中用 `rw`）。例如：

- 第 2 步像把不等式 $y + 2x\geq 3$「代入」$(y+2x)-2x$ 得到 $(y+2x)-2x\geq 3-2x$；
- 第 4 步像把 $x + 3 \le 2$「代入」$9-2(x+3)$ 得到 $9-2(x+3)\geq 9-2\cdot 2$。

但它们不完全是代入，而是用到关于加减乘除下不等式保持或反向的全部规则。有些情形没有适用规则：例如由 $x \le y$ 一般既不能推出 $\sin x \le \sin y$，也不能推出 $\sin x \ge \sin y$。

还要注意每一步所用的**关系符号**：第一步是 $=$，第二步 $\geq$，第三步 $=$，第四步 $\geq$，最后 $>$。每步反映建立该步的推理。最终结果是 $>$，因为 $>$ 相对 $\geq$ 和 $=$ 更「强」（且 $\geq$ 强于 $=$）。即若 $A\geq B$ 且 $B>C$，则传递得 $A>C$。

下面在 Lean 中解同一题。

- 代数变形步仍用 `ring`。
- 类「代入」步用策略 `rel`，指明所「代入」的不等式——若没有关于相关运算下不等式保持/反向的规则，则会失败。
- 「数值事实」用策略 `numbers`。（它也可证等式型数值事实，如 $4^2+4\cdot 1=20$，此前我们用 `ring`。）

```lean
example {x y : ℤ} (hx : x + 3 ≤ 2) (hy : y + 2 * x ≥ 3) : y > 3 :=
  calc
    y = y + 2 * x - 2 * x := by ring
    _ ≥ 3 - 2 * x := by rel [hy]
    _ = 9 - 2 * (x + 3) := by ring
    _ ≥ 9 - 2 * 2 := by rel [hx]
    _ > 3 := by numbers
```

### 1.4.2 例题

再一个不等式计算式证明的完整例题。

**问题**

设 $r$、$s$ 为有理数，且 $s+3\geq r$、$s+r \leq 3$。证明 $r\leq 3$。

**解**

$$
\begin{aligned}
r&=\frac{(s+r)+r-s}{2}\\
&\leq \frac{3+(s+3)-s}{2}\\
&=3.
\end{aligned}
$$

目标是 $r\leq 3$；证明隐含三步：

1. $\underline{\text{证明 }r=\frac{(s+r)+r-s}{2}}$：代数变形。

2. $\underline{\text{证明 }\frac{(s+r)+r-s}{2}\leq \frac{3+(s+3)-s}{2}}$：「代入」已知 $s+3\geq r$ 与 $s+r \leq 3$，用到加法保持不等式、正数除法保持不等式（且隐含 2 为正）。

3. $\underline{\text{证明 }\frac{3+(s+3)-s}{2}=3}$：代数变形。

此次第一步为 $=$，第二步 $\leq$，第三步 $=$；「净结果」为 $\leq$。

**练习**：在下列 Lean 解答中把 `sorry` 换成正确理由。

```lean
example {r s : ℚ} (h1 : s + 3 ≥ r) (h2 : s + r ≤ 3) : r ≤ 3 :=
  calc
    r = (s + r + r - s) / 2 := by sorry
    _ ≤ (3 + (s + 3) - s) / 2 := by sorry
    _ = 3 := by sorry
```

### 1.4.3 例题

再一类似题目：

**问题**

设 $x$、$y$ 为实数，且 $y\leq x+5$、$x\leq -2$。证明 $x+y<2$。

**解**

$$
\begin{aligned}
x + y &\leq x + (x + 5)\\
&= 2x+5 \\
&\leq 2\cdot -2 +5\\
&< 2.
\end{aligned}
$$

**练习**：把该解写成 Lean 证明。

```lean
example {x y : ℝ} (h1 : y ≤ x + 5) (h2 : x ≤ -2) : x + y < 2 :=
  sorry
```

### 1.4.4 例题

下面题目用到简写，如 $0<A\leq 1$、$x,y\leq B$，把若干相关不等式紧凑写出。可对照后面的 Lean 表述看这些简写的精确含义。

**问题**

设 $u, v, x, y, A$、$B$ 为实数。已知 $0<A\leq 1$、$B\geq 1$、$x,y\leq B$、$0\leq u<A$、$0\leq v<A$。证明 $uy+vx+uv<3AB$。

**解**

$$
\begin{aligned}
uy+vx+uv&\leq uB+vB+uv\\
&\leq AB+AB+Av\\
&\leq AB+AB+1\cdot v\\
&\leq AB+AB+Bv\\
&<AB+AB+BA \\
&=3AB.
\end{aligned}
$$

本计算多次用到乘法下不等式保持的规则。例如第一步 $uy+vx+uv\leq uB+vB+uv$ 用到 $x\leq B$、$y\leq B$，以及 $\leq$ 在非负常数乘法下保持（此处常数为 $u$）。第二步 $uB+vB+uv\leq AB+AB+Av$ 用到 $u< A$、$v< A$，分别乘以非负常数 $B$、$v$。

一般而言，若所乘常数的非负性证明「显然」，可省略正式证明。例如此处 $B$ 的非负性来自 $B\geq 1$。Lean 策略 `rel` 也会自动推断这类「显然」的正性/非负性。

**练习**：在下列 Lean 解答中填好 `sorry`；需判断每步用到九个假设中的哪一个。

```lean
example {u v x y A B : ℝ} (h1 : 0 < A) (h2 : A ≤ 1) (h3 : 1 ≤ B) (h4 : x ≤ B)
    (h5 : y ≤ B) (h6 : 0 ≤ u) (h7 : 0 ≤ v) (h8 : u < A) (h9 : v < A) :
    u * y + v * x + u * v < 3 * A * B :=
  calc
    u * y + v * x + u * v
      ≤ u * B + v * B + u * v := by sorry
    _ ≤ A * B + A * B + A * v := by sorry
    _ ≤ A * B + A * B + 1 * v := by sorry
    _ ≤ A * B + A * B + B * v := by sorry
    _ < A * B + A * B + B * A := by sorry
    _ = 3 * A * B := by sorry
```

### 1.4.5 例题

一例带细微之处。

**问题**

设 $t$ 为实数且 $t\geq 10$，证明 $t^2-3t+17\geq 5$。

见到假设 $t\geq 10$，你可能想把它直接「代入」$t^2-3t+17$——这不是有效证明！由 $t\geq 10$ 可推出 $t^2\geq 10^2$（非负数平方保持不等式），以及 $3t\geq 3\cdot 10$（非负常数乘法保持不等式）。但取负后不等式反向：$-3t\leq -3\cdot 10$，故无法比较 $t^2-3t+17$ 与 $10^2-3\cdot 10+17$ 的大小。

有效解法是：不要立刻从 $t^2$ 降到 $10^2$，而是先降到 $10t$，再与 $-3t$ 合并为 $7t$（系数为正），从而可合法地再次代入 $t\geq 10$。

**解**

$$
\begin{aligned}
t^2-3t+17&=t\cdot t-3t+17\\
&\geq 10t-3t+17\\
&=7t+17\\
&\geq 7\cdot 10+17\\
&\geq 5.
\end{aligned}
$$

**练习**：在下列 Lean 解答中填好 `sorry`。也可把错误解法写成 Lean，确认 Lean 会报错。

```lean
example {t : ℚ} (ht : t ≥ 10) : t ^ 2 - 3 * t - 17 ≥ 5 :=
  calc
    t ^ 2 - 3 * t - 17
      = t * t - 3 * t - 17 := by sorry
    _ ≥ 10 * t - 3 * t - 17 := by sorry
    _ = 7 * t - 17 := by sorry
    _ ≥ 7 * 10 - 17 := by sorry
    _ ≥ 5 := by sorry
```

### 1.4.6 例题

又一容易出错的题目。

**问题**

设整数 $n\geq 5$。证明 $n ^ 2 > 2n + 11$。

「设 $n\geq 5$ 为整数」是「设 $n$ 为整数且 $n\geq 5$」的常见简写。

下面是通过「代入」的错误「解」：

$$
\begin{aligned}
n^2&\geq 5^2\\
&> 2 \cdot 5+11\\
&\leq 2n+11.
\end{aligned}
$$

错在哪里？每一步单独看都成立：

- $n^2\geq 5^2$
- $5^2> 2 \cdot 5+11$
- $2 \cdot 5+11\leq 2n+11$

但符号序列 $\geq$、$>$、$\leq$ 不能传递组合。（若 $A>B$ 且 $B\leq C$，无法判断 $A$ 与 $C$ 的大小。）

正确解：第一步仍要更细腻——先从 $n^2$ 只降到 $5n$，而不是 $5^2$。

**解**

$$
\begin{aligned}
n^2&=n\cdot n\\
&\geq 5n\\
&=2n+3n\\
&\geq 2n + 3 \cdot 5\\
&= 2n + 11 + 4\\
&>2n+11.
\end{aligned}
$$

**练习**：把该解写成 Lean；也可写错误解法并确认 Lean 报错。

写正确解时，你可能对最后一步感到困难——学完下一例题后再回来看那一步。

```lean
example {n : ℤ} (hn : n ≥ 5) : n ^ 2 > 2 * n + 11 :=
  sorry
```

### 1.4.7 例题

下一例有新技巧。

**问题**

设 $m$、$n$ 为整数，且 $m ^ 2 + n \le 2$。证明 $n \le 2$。

思路：平方非负，故 $n$ 必小于（严格说是小于等于）$m ^ 2 + n$。既然 $m ^ 2 + n$ 有上界 2，更小的 $n$ 也有同一上界。

**解**

$$
\begin{aligned}
n&\le m ^ 2 + n\\
&\le 2.
\end{aligned}
$$

Lean 知道平方非负，可静默处理这类论证。

```lean
example {m n : ℤ} (h : m ^ 2 + n ≤ 2) : n ≤ 2 :=
  calc
    n ≤ m ^ 2 + n := by extra
    _ ≤ 2 := by rel [h]
```

### 1.4.8 例题

利用平方非负性证不等式很常见。下例需巧妙加上恰好的平方：$(x-y)^2$。

**问题**

设 $x$、$y$ 为实数，且 $x ^ 2 + y ^ 2 \le 1$。证明 $(x + y) ^ 2 < 3$。

**解**

$$
\begin{aligned}
(x + y) ^ 2 &\le (x + y) ^ 2 + (x - y) ^ 2\\
&= 2 (x ^ 2 + y ^ 2)\\
&\le 2 \cdot 1\\
&< 3.
\end{aligned}
$$

**练习**：在下列 Lean 解答中填好 `sorry`。

```lean
example {x y : ℝ} (h : x ^ 2 + y ^ 2 ≤ 1) : (x + y) ^ 2 < 3 :=
  calc
    (x + y) ^ 2 ≤ (x + y) ^ 2 + (x - y) ^ 2 := by sorry
    _ = 2 * (x ^ 2 + y ^ 2) := by sorry
    _ ≤ 2 * 1 := by sorry
    _ < 3 := by sorry
```

### 1.4.9 例题

同一技巧再来一次……

**问题**

设 $a$、$b$ 为非负有理数，且 $a+b\leq 8$。证明 $3ab+a \leq 7b+72$。

**解**

$$
\begin{aligned}
3ab+a&\leq 2b^2+a^2+(3ab+a)\\
&=2(a+b)b+(a+b)a+a\\
&\leq 2\cdot 8b+8a+a\\
&=7b+9(a+b)\\
&\leq 7b+9\cdot 8\\
&=7b+72.
\end{aligned}
$$

**练习**：在下列 Lean 解答中填好 `sorry`。

```lean
example {a b : ℚ} (h1 : a ≥ 0) (h2 : b ≥ 0) (h3 : a + b ≤ 8) :
    3 * a * b + a ≤ 7 * b + 72 :=
  calc
    3 * a * b + a
      ≤ 2 * b ^ 2 + a ^ 2 + (3 * a * b + a) := by sorry
    _ = 2 * ((a + b) * b) + (a + b) * a + a := by sorry
    _ ≤ 2 * (8 * b) + 8 * a + a := by sorry
    _ = 7 * b + 9 * (a + b) := by sorry
    _ ≤ 7 * b + 9 * 8 := by sorry
    _ = 7 * b + 72 := by sorry
```

### 1.4.10 例题

最后是一个尤其「狂野」的例子[^3]，用到三个非负平方：$(a ^ 2 (b ^ 2 - c ^ 2)) ^ 2$、$(b ^ 4 - c ^ 4) ^ 2$、$(a ^ 2 b c - b ^ 2 c ^ 2) ^ 2$。

**问题**

设 $a$、$b$、$c$ 为实数。证明 $a ^ 2 (a ^ 6 + 8 b ^ 3 c ^ 3) \leq (a ^ 4 + b ^ 4 + c ^ 4) ^ 2$。

**解**

$$
\begin{aligned}
&a ^ 2 (a ^ 6 + 8 b ^ 3 c ^ 3)\\
&\le 2  (a ^ 2 (b ^ 2 - c ^ 2)) ^ 2 + (b ^ 4 - c ^ 4) ^ 2 +
      4(a ^ 2 b c - b ^ 2 c ^ 2) ^ 2 + a ^ 2 (a ^ 6 + 8 b ^ 3 c ^ 3) \\
&=(a ^ 4 + b ^ 4 + c ^ 4) ^ 2.
\end{aligned}
$$

```lean
example {a b c : ℝ} :
    a ^ 2 * (a ^ 6 + 8 * b ^ 3 * c ^ 3) ≤ (a ^ 4 + b ^ 4 + c ^ 4) ^ 2 :=
  calc
    a ^ 2 * (a ^ 6 + 8 * b ^ 3 * c ^ 3)
      ≤ 2 * (a ^ 2 * (b ^ 2 - c ^ 2)) ^ 2 + (b ^ 4 - c ^ 4) ^ 2
          + 4 * (a ^ 2 * b * c - b ^ 2 * c ^ 2) ^ 2
          + a ^ 2 * (a ^ 6 + 8 * b ^ 3 * c ^ 3) := by extra
    _ = (a ^ 4 + b ^ 4 + c ^ 4) ^ 2 := by ring
```

### 1.4.11 练习

1. 设 $x$、$y$ 为整数，且 $x+3 \geq 2y$、$1 \le y$。证明 $x \geq -1$。

```lean
example {x y : ℤ} (h1 : x + 3 ≥ 2 * y) (h2 : 1 ≤ y) : x ≥ -1 :=
  sorry
```

2. 设 $a$、$b$ 为有理数，且 $3 \leq a$、$a+2b\geq 4$。证明 $a+b\geq 3$。

```lean
example {a b : ℚ} (h1 : 3 ≤ a) (h2 : a + 2 * b ≥ 4) : a + b ≥ 3 :=
  sorry
```

3. 设整数 $x\geq 9$。证明 $x ^ 3 - 8x ^ 2 + 2x \geq 3$。

```lean
example {x : ℤ} (hx : x ≥ 9) : x ^ 3 - 8 * x ^ 2 + 2 * x ≥ 3 :=
  sorry
```

4. 设整数 $n\geq 10$。证明 $n ^ 4 - 2 n ^ 2 > 3 n ^ 3$。

```lean
example {n : ℤ} (hn : n ≥ 10) : n ^ 4 - 2 * n ^ 2 > 3 * n ^ 3 :=
  sorry
```

5. 设整数 $n\geq 5$。证明 $n ^ 2 - 2  n + 3 > 14$。

```lean
example {n : ℤ} (h1 : n ≥ 5) : n ^ 2 - 2 * n + 3 > 14 :=
  sorry
```

6. 设 $x$ 为有理数。证明 $x ^ 2 - 2  x \ge -1$。

```lean
example {x : ℚ} : x ^ 2 - 2 * x ≥ -1 :=
  sorry
```

7. 设 $a$、$b$ 为实数。证明 $a ^ 2 + b ^ 2 \ge 2ab$。

```lean
example (a b : ℝ) : a ^ 2 + b ^ 2 ≥ 2 * a * b :=
  sorry
```

[^3]: 改编自 [IMO 2001](https://www.imo-official.org/year_info.aspx?year=2001) 第 2 题。

## 1.5 一种捷径

迄今有些题目凭直觉就能解。例如 [例题 1.3.2](#132-例题)：

**问题**

设 $x$ 为整数，且 $x+4=2$。证明 $x=-2$。

我们用计算

$$
\begin{aligned}
x&=(x+4)-4\\
&=2-4\\
&=-2,
\end{aligned}
$$

来解，但老实说有点杀鸡用牛刀。

本书约定如下：若一个事实只需在两边加减项（不涉及乘除等）就能从另一事实推出，则不必写出完整计算式证明。

在 Lean 中可使用策略 `addarith` 完成这类简单推导。上例用法：

```lean
example {x : ℤ} (h1 : x + 4 = 2) : x = -2 := by addarith [h1]
```

再举几个只需加减项、因而不必写完整计算式证明的推论：

- 若 $a-2b=1$，则 $a=2b+1$。

```lean
example {a b : ℤ} (ha : a - 2 * b = 1) : a = 2 * b + 1 := by addarith [ha]
```

- 若 $x=2$ 且 $y ^ 2 = -7$，则 $x+y^2=-5$。

```lean
example {x y : ℚ} (hx : x = 2) (hy : y ^ 2 = -7) : x + y ^ 2 = -5 :=
  calc
    x + y ^ 2 = x - 7 := by addarith [hy]
    _ = -5 := by addarith [hx]
```

对不等式也一样：若不等式推导只涉及加减项，可以这样做。例如：

- 若 $t=4-st$，则 $t+st>0$。

```lean
example {s t : ℝ} (h : t = 4 - s * t) : t + s * t > 0 := by addarith [h]
```

- 若 $m \le 8 - n$，则 $10>m+n$。

```lean
example {m n : ℝ} (h1 : m ≤ 8 - n) : 10 > m + n := by addarith [h1]
```

但在 [例题 1.3.4](#134-例题) 中，推导需要除法而不只是加减：若 $3w+1=4$，则 $w=1$。

$$
\begin{aligned}
w&=\frac{3w+1}{3}-\frac{1}{3}\\
&=\frac{4}{3}-\frac{1}{3}\\
&=1.
\end{aligned}
$$

这类证明仍须完整写出。

请验证 `addarith` 无法验证该推导：

```lean
example {w : ℚ} (h1 : 3 * w + 1 = 4) : w = 1 := sorry
```