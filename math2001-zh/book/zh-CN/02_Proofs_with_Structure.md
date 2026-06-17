# 第 2 章 结构化证明

> 本译文对应原书 [Proofs with structure](https://hrmacbeth.github.io/math2001/02_Proofs_with_Structure.html)；英文 Sphinx 源：`02_Proofs_with_Structure.rst.txt`。

[第 1 章](01_Proofs_by_Calculation.md) 的计算式证明，从某种角度看都是**一步证明**（one-step proof）。本章逐步引入多步证明的要素：建立稍后会被引用的「**中间**」事实、调用自己或他人事先证明的**命名引理**（named lemma），以及用逻辑符号 $\lor$、$\land$、$\exists$ 把由更简单命题拼成的复杂数学陈述拆开处理。

本章还介绍 Lean 语言的关键交互特性：实时更新的 **infoview**（信息视图），持续显示你当前的**假设**（hypotheses）与**目标**（goals）。

本章内容在（中间插入其他章节之后）于 [第 4 章](04_Proofs_with_Structure_II.md) 继续。

## 2.1 中间步骤

### 2.1.1 例题

迄今见过的证明都是单一计算。更典型地，证明会有更复杂的结构：早期建立一些事实，并不马上用到，而是留到后面。

例如，下面是 [例题 1.3.3](01_Proofs_by_Calculation.md#133-例题) 中的代数题。

**问题**

设 $a$、$b$ 为实数，且 $a-5b=4$、$b+2=3$。证明 $a=9$。

我们曾用一条长计算解过：

$$
\begin{aligned}
a &= \ldots\\
&= \ldots\\
&= 9.
\end{aligned}
$$

但另一种表述——也许更自然，也更接近高中解法——是先解出 $b$，再代入以帮助解出 $a$。

**解**

由 $b+2=3$，得 $b=1$。因此

$$
\begin{aligned}
a &= (a - 5b) + 5b\\
&= 4 + 5 \cdot 1 \\
&= 9.
\end{aligned}
$$

这是我们第一次见到带文字的证明。句子

> 由 $b+2=3$，得 $b=1$。

运用了 [第 1.5 节](01_Proofs_by_Calculation.md#15-一种捷径) 讨论的推理：在心理上从假设 $b+2=3$ 两边减去 2 推出 $b=1$，这被认为足够显然，除指明所用假设外不必再解释。

至此我们在本题已知事实列表中又多了 $b=1$，并做一条计算式证明，其中用到该事实（在步骤 $(a - 5b) + 5b = 4 + 5 \cdot 1$ 处，与 $a-5b=4$ 一并代入）。「因此」（同义词：「于是」「所以」）引出这条计算式证明；其含义是：刚证出的事实将在后续推理中使用。

下面看该论证在 Lean 中的样子。我们用关键字 `have hb` 陈述 $b=1$，紧接证明该事实的推理：从假设 $b+2=3$（本题中名为 `h2`）两边加减。然后照常给出计算式证明，其中某处用到 $b=1$（名为 `hb`）。

```lean
example {a b : ℝ} (h1 : a - 5 * b = 4) (h2 : b + 2 = 3) : a = 9 := by
  have hb : b = 1 := by addarith [h2]
  calc
    a = a - 5 * b + 5 * b := by ring
    _ = 4 + 5 * 1 := by rw [h1, hb]
    _ = 9 := by ring
```

逐步读 Lean 代码并不难理解该证明。但 Lean 还提供理解多步证明的利器：**Lean Infoview** 窗口——我们现在首次使用。Infoview 把自然演绎（natural deduction）中的**逆向推理**（backward reasoning，从目标往回想）与**正向推理**（forward reasoning，从假设往前推）同时可视化：左侧列出假设，右侧（`⊢` 后）显示当前目标。下面随做题过程看 infoview 能告诉我们什么。

1. 把光标放在行

```lean
have hb : b = 1
```

开头，查看 Lean Infoview。我们看到：

```
a b : ℝ
h1 : a - 5 * b = 4
h2 : b + 2 = 3
⊢ a = 9
```

这正是起始问题的竖排版本：

```lean
example {a b : ℝ} (h1 : a - 5 * b = 4) (h2 : b + 2 = 3) :
  a = 9 :=
```

它列出题中所有变量与假设；符号 `⊢` 旁显示我们的**目标**：证 $a = 9$。

2. 接着把光标移到行

```lean
calc
  a = (a - 5 * b) + 5 * b := by ring
```

开头。新证事实 `hb`（即 $b = 1$）已加入 infoview 的假设列表：

```
a b : ℝ
h1 : a - 5 * b = 4
h2 : b + 2 = 3
hb : b = 1
⊢ a = 9
```

3. 最后把光标移到最后一行代码下方的

```lean
_ = 9 := by ring
```

开头。infoview 不再显示待办目标，而是显示

```
No goals
```

这是对 `calc` 块已解决目标、从而完成本题的视觉确认。

### 2.1.2 例题

下面是另一例：先建立中间陈述，再做主证明。

**问题**

设 $m$、$n$ 为整数，且 $m+3\le 2n-1$、$n\le 5$。证明 $m\le 6$。

**解**

我们有

$$
\begin{aligned}
m+3&\le 2n-1\\
&\le 2\cdot 5-1\\
&= 9,
\end{aligned}
$$

所以 $m \le 6$。

这里的中间步骤是事实 $m+3\le 9$，可从「我们有」之后的计算式证明读出：计算左上为 $m+3$，右下为 $9$，中间各步关系 $\le$、$\le$、$=$ 合起来建立 $m+3$ 与 $9$ 之间的 $\le$。

我们在 [例题 2.1.1](#211-例题) 讨论过「因此/于是/所以」的含义。此处文字

> 所以 $m \le 6$。

表示刚证事实（$m+3\le 9$）蕴含 $m \le 6$，其证明过于直接不必细写；本题又是 [第 1.5 节](01_Proofs_by_Calculation.md#15-一种捷径) 所述两边加减推理的一例。

Lean 中同一证明如下。用于建立中间步骤的计算块用 `have` 引入并命名：

```lean
example {m n : ℤ} (h1 : m + 3 ≤ 2 * n - 1) (h2 : n ≤ 5) : m ≤ 6 := by
  have h3 :=
  calc
    m + 3 ≤ 2 * n - 1 := by rel [h1]
    _ ≤ 2 * 5 - 1 := by rel [h2]
    _ = 9 := by numbers
  addarith [h3]
```

注意，在最后一行

```lean
addarith [h3]
```

开头，infoview 中的**目标状态**（goal state）为

```
m n : ℤ
h1 : m + 3 ≤ 2 * n - 1
h2 : n ≤ 5
h3 : m + 3 ≤ 9
⊢ m ≤ 6
```

由 `calc` 块建立并命名为 `h3` 的事实 $m + 3 ≤ 9$ 现已可作为额外事实在后续步骤使用；下一步确实用到了（`addarith [h3]`）。

### 2.1.3 例题

再重做一题，这次是 [例题 1.4.2](01_Proofs_by_Calculation.md#142-例题)。题目为：

**问题**

设 $r$、$s$ 为有理数，且 $s+3\geq r$、$s+r \leq 3$。证明 $r\leq 3$。

我们曾用一条巧妙的长计算完成，但下面解法虽更长，也许更易想到。

**解**

由 $s + 3 \geq r$ 得 $r \leq 3 + s$，由 $s + r \leq 3$ 得 $r \leq 3 - s$。因此

$$
\begin{aligned}
r&=\frac{r+r}{2}\\
&\leq \frac{(3+s)+(3-s)}{2}\\
&=3.
\end{aligned}
$$

本题有两个中间步骤：证 $r \leq 3 + s$ 与 $r \leq 3 - s$。

**练习：** 下面是本题的 Lean 框架：已写出所述中间步骤（尚未证明），以及作为最后一步的所述计算式证明轮廓。填好所有 `sorry`。并试着预测证明各位置 infoview 的显示，再与实际对照。

```lean
example {r s : ℚ} (h1 : s + 3 ≥ r) (h2 : s + r ≤ 3) : r ≤ 3 := by
  have h3 : r ≤ 3 + s := by sorry -- justify with one tactic
  have h4 : r ≤ 3 - s := by sorry -- justify with one tactic
  calc
    r = (r + r) / 2 := by sorry -- justify with one tactic
    _ ≤ (3 - s + (3 + s)) / 2 := by sorry -- justify with one tactic
    _ = 3 := by sorry -- justify with one tactic
```

### 2.1.4 例题

下一题出现一种新的推理形式。

**问题**

设 $t$ 为实数，且 $t^2=3t$、$t \geq 1$。证明事实上 $t\geq 2$。

**解**

我们有

$$
\begin{aligned}
t\cdot t&=t^2\\
&=3t,
\end{aligned}
$$

所以 $t=3$。于是 $t\geq 2$。

证明第一步是建立中间陈述 $t\cdot t=3t$ 的计算。接着用

> 所以 $t=3$

从 $t\cdot t=3t$ 两边消去 $t$，建立另一中间陈述 $t=3$。最后推出目标 $t\geq 2$。

Lean 中用策略 `cancel` 做消去推理。下面证明中，在 `cancel t at h3` 之前，目标状态含假设

```
h3 : t * t = 3 * t
```

该行之后变为

```
h3 : t = 3
```

完整 Lean 证明：

```lean
example {t : ℝ} (h1 : t ^ 2 = 3 * t) (h2 : t ≥ 1) : t ≥ 2 := by
  have h3 :=
  calc t * t = t ^ 2 := by ring
    _ = 3 * t := by rw [h1]
  cancel t at h3
  addarith [h3]
```

此处有数学细节：只有公因子已知非零时，才能从等式两边消去该因子。本题中 Lean 能推出公因子 `t` 非零。为什么？

### 2.1.5 例题

再一题：先建立中间事实，再化简。

**问题**

设 $a$、$b$ 为实数，且 $a ^ 2 = b ^ 2 + 1$，$a$ 非负。证明 $a \geq 1$。

**解**

我们有

$$
\begin{aligned}
a ^ 2&= b^2 +1\\
&\geq 1\\
&=1^2,
\end{aligned}
$$

所以 $a\geq 1$。

从 $a ^ 2 \geq 1 ^ 2$ 推出 $a \geq 1$ 同样可用 `cancel` 策略。注意 Lean 会静默检查其有效性条件（$a\geq 0$）。若删除假设 `h2 : a ≥ 0`，消去步骤会在 Lean 中失败——请验证。

```lean
example {a b : ℝ} (h1 : a ^ 2 = b ^ 2 + 1) (h2 : a ≥ 0) : a ≥ 1 := by
  have h3 :=
  calc
    a ^ 2 = b ^ 2 + 1 := by rw [h1]
    _ ≥ 1 := by extra
    _ = 1 ^ 2 := by ring
  cancel 2 at h3
```

### 2.1.6 例题

本节以若干练习收尾：把文字证明译成 Lean。难点是从文字中辨认中间陈述有哪些。

先再重做 [例题 1.4.1](01_Proofs_by_Calculation.md#141-例题)。题目为：

**问题**

设 $x$、$y$ 为整数，且 $x + 3 \le 2$、$y + 2x\geq 3$。证明 $y>3$。

下面是用中间步骤的解。

**解**

由 $x + 3 \le 2$，得 $x \leq -1$。所以

$$
\begin{aligned}
y&\geq 3-2x\\
&\geq 3-2\cdot (-1)\\
&>3.
\end{aligned}
$$

**练习：** 指出中间步骤，并把该解写成 Lean。

```lean
example {x y : ℤ} (hx : x + 3 ≤ 2) (hy : y + 2 * x ≥ 3) : y > 3 := by
  sorry
```

### 2.1.7 例题

这题数学上稍难。

**问题**

设 $a$、$b$ 为实数，且 $-b \le a \le b$。证明 $a ^ 2 \le b ^ 2$。

**解**

由假设前半，$0 \le b + a$；由后半，$0 \le b - a$。因此 $(b + a)(b - a)$ 非负，所以

$$
\begin{aligned}
a ^ 2  &\le a ^ 2 + (b+a)(b-a)\\
&= b ^ 2.
\end{aligned}
$$

**练习：** 指出两个中间步骤，并把该解写成 Lean。（注意 Lean 此处比人更强：不必为步骤

> 因此 $(b + a)(b - a)$ 非负，

单独写 Lean 翻译；Lean 会在需要处自行推出。）

```lean
example (a b : ℝ) (h1 : -b ≤ a) (h2 : a ≤ b) : a ^ 2 ≤ b ^ 2 := by
  sorry
```

### 2.1.8 例题

**问题**

设 $a$、$b$ 为实数，且 $a \le b$。证明 $a ^ 3 \le b ^ 3$。

注意并未假设 $a$、$b$ 为正，故不等式在乘法/乘方下的简便技巧不适用。

**解**

由 $a \le b$，得 $0 \le b - a$。因此 $\frac{(b - a)\left[(b - a)^2+3(b+a)^2\right]}{4}$ 非负，所以

$$
\begin{aligned}
a ^ 3 &\le a ^ 3 + \frac{(b - a)\left[(b - a)^2+3(b+a)^2\right]}{4}\\
&= b ^ 3.
\end{aligned}
$$

**练习：** 指出中间步骤，并把该解写成 Lean。

```lean
example (a b : ℝ) (h : a ≤ b) : a ^ 3 ≤ b ^ 3 := by
  sorry
```

### 2.1.9 练习

1. 设 $x$ 为有理数，平方为 4，且大于 1。证明 $x=2$。

   建议步骤：先证 $x(x+2)=2(x+2)$，再消去得 $x=2$。

```lean
example {x : ℚ} (h1 : x ^ 2 = 4) (h2 : 1 < x) : x = 2 := by
  sorry
```

2. 设 $n$ 为整数，满足 $n^2+4=4n$。证明 $n=2$。

   建议步骤：先证 $(n-2)^2=0$，消去平方得 $n-2=0$，再收尾。

```lean
example {n : ℤ} (hn : n ^ 2 + 4 = 4 * n) : n = 2 := by
  sorry
```

3. 设 $x$、$y$ 为有理数，且 $xy=1$、$x \ge 1$。证明 $y \le 1$。

   建议步骤：先证 $0<xy$，消去 $x$ 得 $0<y$，再计算证目标。

```lean
example (x y : ℚ) (h : x * y = 1) (h2 : x ≥ 1) : y ≤ 1 := by
  sorry
```

## 2.2 调用引理

### 2.2.1 例题

下面是一种新题型：目标是**不等式命题**（disequality）$x\ne 1$，而非等式（$=$）或不等式（$\le$、$<$、$\ge$、$>$）。

**问题**

设 $x$ 为有理数，且 $3x=2$。证明 $x\ne 1$。

**解**

只需证 $x< 1$。事实上，

$$
\begin{aligned}
x &= (3x)/3 \\
&=2/3 \\
&< 1.
\end{aligned}
$$

本题发生了什么？我们用了一条「常识」：一个数严格小于另一个数，则二者不能相等。这感觉像常识——但实质上是一条**引理**（lemma）：已由我们或他人证明、可在证明中调用的事实。[^1]

在 Lean 中要这样调用引理，必须**按名称指出**。Lean 数学库中早有人证明该事实并命名为 `ne_of_lt`：[^2]

```lean
lemma ne_of_lt {a b : ℚ} (h : a < b) : a ≠ b :=
```

可用策略 `apply` 在本题中调用该引理。开始做题时，

```lean
example {x : ℚ} (hx : 3 * x = 2) : x ≠ 1 := by
```

目标状态为：

```
x : ℚ
hx : 3 * x = 2
⊢ x ≠ 1
```

`apply` 该引理后（光标在该行末尾），

```lean
example {x : ℚ} (hx : 3 * x = 2) : x ≠ 1 := by
  apply ne_of_lt
```

目标状态变为：

```
x : ℚ
hx : 3 * x = 2
⊢ x < 1
```

故 `apply ne_of_lt` 只改变**目标**：把 `x ≠ 1` 变为 `x < 1`，再用惯常不等式方法解决。

```lean
example {x : ℚ} (hx : 3 * x = 2) : x ≠ 1 := by
  apply ne_of_lt
  calc
    x = 3 * x / 3 := by ring
    _ = 2 / 3 := by rw [hx]
    _ < 1 := by numbers
```

对照文字证明与 Lean 证明，调用引理时的表述很不同。文字中我说：

> 只需证 $x< 1$。事实上，……

即实际上说明了新目标是什么，让读者自己推断用了哪条常识来改变目标。Lean 中不必说明新目标——读者可查目标状态。但必须显式写出引理名：

```lean
apply ne_of_lt
```

因为「这是常识！」对 Lean 来说不够精确，无法自动找到。

### 2.2.2 例题

类似题目：通过证明左边**更大**（而非上题中**更小**）来证明不等式命题。

**问题**

设 $y$ 为实数。证明 $y ^ 2 +  1\ne 0$。

**解**

只需证 $0 < y ^ 2 + 1$，而平方非负，故显然。

**练习：** 把本题解写成 Lean。

```lean
example {y : ℝ} : y ^ 2 + 1 ≠ 0 := by
  sorry
```

使用引理 `ne_of_gt`：

```lean
lemma ne_of_gt {a b : ℝ} (h : a > b) : a ≠ b :=
```

### 2.2.3 例题

**问题**

设 $a$、$b$ 为实数，且 $a^2+b^2=0$。证明 $a ^ 2 = 0$。

**解**

只需同时证 $a ^ 2 \le 0$ 与 $a ^ 2 ≥ 0$。后者因平方非负而显然。对前者，

$$
\begin{aligned}
a ^ 2 &\le a ^ 2 + b ^ 2\\
&=0.
\end{aligned}
$$

Lean 中使用引理——「$\le$ 关系的**反对称性**」（antisymmetry）：

```lean
lemma le_antisymm {a b : α} (h1 : a ≤ b) (h2 : b ≤ a) : a = b :=
```

完整 Lean 证明：

```lean
example {a b : ℝ} (h1 : a ^ 2 + b ^ 2 = 0) : a ^ 2 = 0 := by
  apply le_antisymm
  calc
    a ^ 2 ≤ a ^ 2 + b ^ 2 := by extra
    _ = 0 := h1
  extra
```

注意，`apply` 引理后 infoview 显示**两个**目标！

```
2 goals
a b : ℝ
h1 : a ^ 2 + b ^ 2 = 0
⊢ a ^ 2 ≤ 0
a b : ℝ
h1 : a ^ 2 + b ^ 2 = 0
⊢ 0 ≤ a ^ 2
```

数学上不意外：引理有两个前提，都需证明。Lean 中完全可以有多个目标——任意时刻可有多个；你写的代码作用于列表中第一个目标（解决后再做第二个，依此类推）。

### 2.2.4 练习

1. 设 $m$ 为整数，且 $m + 1=5$。证明 $3m\ne 6$。

   可用事实：第一个数大于第二个则二者不等（需引理 `ne_of_gt`，见 [例题 2.2.2](#222-例题)）。

```lean
example {m : ℤ} (hm : m + 1 = 5) : 3 * m ≠ 6 := by
  sorry
```

2. 设 $s$ 为有理数，且 $3s ≤ -6$、$2s \ge -4$。证明 $s=-2$。

   大概会用到引理 `le_antisymm`：若 $x\le y$ 且 $x\ge y$，则 $x = y$。

```lean
example {s : ℚ} (h1 : 3 * s ≤ -6) (h2 : 2 * s ≥ -4) : s = -2 := by
  sorry
```

[^1]: 本例中，作为有理数上 $<$ 关系定义之推论。

[^2]: 此处 `ne` 表「不等」， `lt` 表「小于」，`of` 表示从 `lt` 陈述推出 `ne` 陈述。标准 Lean 数学库有许多此类命名惯例，你不必遵循；自己的引理可叫 `foo`、`banana`。

## 2.3 或（$\lor$）与分情形证明

### 2.3.1 例题

数学中「或」（逻辑符号 $\lor$）可连接两个陈述。下面一题假设是「或」陈述。

**问题**

设 $x$、$y$ 为实数，且 $x=1$ 或 $y=-1$。证明 $xy+x=y + 1$。

假设

> $x=1$ 或 $y=-1$

表示备选 $x=1$、$y=-1$ 中至少一个成立（两者可同时成立，无需特别处理）。故解本题只需依次考虑这两种备选——这叫**分情形证明**（proof by cases）。

**解**

若 $x=1$，则

$$
\begin{aligned}
xy+x&=1\cdot y+1\\
&= y+1,
\end{aligned}
$$

若 $y=-1$，则

$$
\begin{aligned}
xy+x&=x\cdot (-1)+x\\
&=-1+1\\
&=y+1.
\end{aligned}
$$

Lean 中「或」陈述用逻辑符号 `∨` 表示。本题开始时 infoview 显示一个任务：假设 `h` 为「或」陈述，目标为证 $xy+x=y + 1$。

```
x y : ℝ
h : x = 1 ∨ y = -1
⊢ x * y + x = y + 1
```

对「或」假设的两种情形依次考虑，用策略 `obtain`。应用后 infoview 显示两个更简单的任务：目标仍为证 $xy+x=y + 1$，但假设变为左备选 `x = 1`（第一任务）或右备选 `y = -1`（第二任务）。

```
x y : ℝ
hx : x = 1
⊢ x * y + x = y + 1

x y : ℝ
hy : y = -1
⊢ x * y + x = y + 1
```

然后逐个解决，各给一条计算式证明。

```lean
example {x y : ℝ} (h : x = 1 ∨ y = -1) : x * y + x = y + 1 := by
  obtain hx | hy := h
  calc
    x * y + x = 1 * y + 1 := by rw [hx]
    _ = y + 1 := by ring
  calc
    x * y + x = x * -1 + x := by rw [hy]
    _ = -1 + 1 := by ring
    _ = y + 1 := by rw [hy]
```

### 2.3.2 例题

更常见的是：假设并非直接的「或」陈述，你自己建立并证明一条「或」形式的中间陈述，再分情形。

**问题**

设 $n$ 为任意自然数。证明 $n ^ 2 \ne 2$。

本题对「或」陈述

> $n \le 1$ 或 $2 \le n$

分情形。纸上可不证而直接陈述，实则来自关于自然数的引理：一般地，$n$ 要么 $\le$ 某自然数，要么 $\ge$ 其 successor。分情形后解题容易。

**解**

分别考虑 $n \le 1$ 与 $2 \le n$。

**情形 1**（$n \le 1$）：只需证 $n ^ 2 < 2$。事实上，

$$
\begin{aligned}
n ^ 2 & \le 1 ^ 2\\
&<2.
\end{aligned}
$$

**情形 2**（$2 \le n$）：只需证 $n ^ 2 > 2$。事实上，

$$
\begin{aligned}
2 &< 2 ^ 2\\
& \le n ^ 2.
\end{aligned}
$$

Lean 中把该「或」陈述显式建为中间事实，即调用引理

```lean
lemma le_or_succ_le (a b : ℕ) : a ≤ b ∨ b + 1 ≤ a :=
```

我们尚未以这种方式调用引理。语法用 `have`：

```lean
have hn := le_or_succ_le n 1
```

该行后 infoview 显示想要的或陈述：

```
hn : n ≤ 1 ∨ 2 ≤ n
```

建立中间事实后，对该事实分情形，剩下对应两种情形的两个任务：

```
n : ℕ
hn : n ≤ 1
⊢ n ^ 2 ≠ 2

n : ℕ
hn : 2 ≤ n
⊢ n ^ 2 ≠ 2
```

**练习：** 第一情形已写成 Lean。补全第二情形。

```lean
example {n : ℕ} : n ^ 2 ≠ 2 := by
  have hn := le_or_succ_le n 1
  obtain hn | hn := hn
  apply ne_of_lt
  calc
    n ^ 2 ≤ 1 ^ 2 := by rel [hn]
    _ < 2 := by numbers
  sorry
```

### 2.3.3 例题

迄今讨论的是假设中出现「或」陈述。若**目标**是「或」陈述，则较易：须证其中一备选，宣布选哪一个，再证明即可。

**问题**

设 $x$ 为实数，且 $2x+1=5$。证明 $x=1$ 或 $x=2$。

**解**

我们将证 $x=2$。事实上，

$$
\begin{aligned}
x &=\frac{(2x+1)-1}{2}\\
&=\frac{5-1}{2}\\
&=2.
\end{aligned}
$$

Lean 中用策略 `right` 宣布证目标的右备选（左备选用 `left`）。这会改变 infoview 中的目标：应用前

```
⊢ x = 1 ∨ x = 2
```

应用后

```
⊢ x = 2
```

```lean
example {x : ℝ} (hx : 2 * x + 1 = 5) : x = 1 ∨ x = 2 := by
  right
  calc
    x = (2 * x + 1 - 1) / 2 := by ring
    _ = (5 - 1) / 2 := by rw [hx]
    _ = 2 := by numbers
```

### 2.3.4 例题

一题同时用到两种逻辑推理。解二次方程——经典地结果含「或」。将用到引理：两数乘积为 0，则其中一为 0。

**问题**

设 $x$ 为实数，且 $x^2-3x+2=0$。证明 $x=1$ 或 $x=2$。

**解**

我们有

$$
\begin{aligned}
(x-1)(x-2) &= x ^ 2 - 3x+2\\
&=0.
\end{aligned}
$$

所以 $x-1=0$ 或 $x-2=0$。

若 $x-1=0$，则 $x=1$。

若 $x-2=0$，则 $x=2$。

本解中分情形写得比前面随意：「若 $x-1=0$」「若 $x-2=0$」静默引入两种情形，读者自行观察 $x=1$ 是「$x=1$ 或 $x=2$」的左备选，从而完成第一情形（第二情形类似）。

我已写好 Lean 论证的第一部分：计算得 $(x-1)(x-2)=0$，再调用引理 `eq_zero_or_eq_zero_of_mul_eq_zero` 得到「或」假设。目标状态同时有「或」假设与「或」目标：

```lean
x : ℝ
hx : x ^ 2 - 3 * x + 2 = 0
h1 : (x - 1) * (x - 2) = 0
h2 : x - 1 = 0 ∨ x - 2 = 0
⊢ x = 1 ∨ x = 2
```

**练习：** 补全 Lean 论证其余部分。

```lean
example {x : ℝ} (hx : x ^ 2 - 3 * x + 2 = 0) : x = 1 ∨ x = 2 := by
  have h1 :=
    calc
    (x - 1) * (x - 2) = x ^ 2 - 3 * x + 2 := by ring
    _ = 0 := by rw [hx]
  have h2 := eq_zero_or_eq_zero_of_mul_eq_zero h1
  sorry
```

### 2.3.5 例题

[例题 2.3.2](#232-例题) 证了没有自然数平方为 2。整数亦然，但涉及负数时序关系更复杂，证明需**情形之中再分情形**。

**问题**

设 $n$ 为任意整数。证明 $n ^ 2 \ne 2$。

**解**

分别考虑 $n \le 0$ 与 $1 \le n$。

**情形 1**（$n \le 0$）：此时 $0 \le -n$。再分别考虑 $-n \le 1$ 与 $2 \le -n$。

**情形 1(i)**（$-n \le 1$）：只需证 $n ^ 2 < 2$。事实上，

$$
\begin{aligned}
n ^ 2 &= (-n) ^ 2\\
& \le 1 ^ 2\\
&<2.
\end{aligned}
$$

**情形 1(ii)**（$2 \le -n$）：只需证 $n ^ 2 > 2$。事实上，

$$
\begin{aligned}
2 &< 2 ^ 2\\
&\le (-n) ^ 2\\
& = n ^ 2.
\end{aligned}
$$

**情形 2**（$1 \le n$）：再分别考虑 $n \le 1$ 与 $2 \le n$。

**情形 2(i)**（$n \le 1$）：只需证 $n ^ 2 < 2$。事实上，

$$
\begin{aligned}
n ^ 2 & \le 1 ^ 2\\
&<2.
\end{aligned}
$$

**情形 2(ii)**（$2 \le n$）：只需证 $n ^ 2 > 2$。事实上，

$$
\begin{aligned}
2 &< 2 ^ 2\\
& \le n ^ 2.
\end{aligned}
$$

证明如此复杂时，可用符号 `·` 标出每个子证明起点，如下。

```lean
example {n : ℤ} : n ^ 2 ≠ 2 := by
  have hn0 := le_or_succ_le n 0
  obtain hn0 | hn0 := hn0
  · have : 0 ≤ -n := by addarith [hn0]
    have hn := le_or_succ_le (-n) 1
    obtain hn | hn := hn
    · apply ne_of_lt
      calc
        n ^ 2 = (-n) ^ 2 := by ring
        _ ≤ 1 ^ 2 := by rel [hn]
        _ < 2 := by numbers
    · apply ne_of_gt
      calc
        (2:ℤ) < 2 ^ 2 := by numbers
        _ ≤ (-n) ^ 2 := by rel [hn]
        _ = n ^ 2 := by ring
  · have hn := le_or_succ_le n 1
    obtain hn | hn := hn
    · apply ne_of_lt
      calc
        n ^ 2 ≤ 1 ^ 2 := by rel [hn]
        _ < 2 := by numbers
    · apply ne_of_gt
      calc
        (2:ℤ) < 2 ^ 2 := by numbers
        _ ≤ n ^ 2 := by rel [hn]
```

我们将该定理记为 `sq_ne_two` 供日后使用。

### 2.3.6 练习

1. 设 $x$ 为有理数，且 $x=4$ 或 $x=-4$。证明 $x^2+1=17$。

```lean
example {x : ℚ} (h : x = 4 ∨ x = -4) : x ^ 2 + 1 = 17 := by
  sorry
```

2. 设 $x$ 为实数，且 $x=1$ 或 $x=2$。证明 $x^2-3x+2=0$。

```lean
example {x : ℝ} (h : x = 1 ∨ x = 2) : x ^ 2 - 3 * x + 2 = 0 := by
  sorry
```

3. 设 $t$ 为有理数，且 $t=-2$ 或 $t=3$。证明 $t^2-t-6=0$。

```lean
example {t : ℚ} (h : t = -2 ∨ t = 3) : t ^ 2 - t - 6 = 0 := by
  sorry
```

4. 设 $x$、$y$ 为实数，且 $x=2$ 或 $y=-2$。证明 $x^2+2x=2y+4$。

```lean
example {x y : ℝ} (h : x = 2 ∨ y = -2) : x * y + 2 * x = 2 * y + 4 := by
  sorry
```

5. 设 $s$、$t$ 为有理数，且 $s = 3 - t$。证明 $s + t = 3$ 或 $s + t = 5$。

```lean
example {s t : ℚ} (h : s = 3 - t) : s + t = 3 ∨ s + t = 5 := by
  sorry
```

6. 设 $a$、$b$ 为有理数，且 $a + 2b < 0$。证明 $b < a / 2$ 或 $b < -a/2$。

```lean
example {a b : ℚ} (h : a + 2 * b < 0) : b < a / 2 ∨ b < - a / 2 := by
  sorry
```

7. 设 $x$、$y$ 为实数，且 $y = 2x+1$。证明 $x<y/2$ 或 $x>y/2$。

```lean
example {x y : ℝ} (h : y = 2 * x + 1) : x < y / 2 ∨ x > y / 2 := by
  sorry
```

8. 设 $x$ 为实数，且 $x^2+2x-3=0$。证明 $x=-3$ 或 $x=1$。

   大概会用到与 [例题 2.3.4](#234-例题) 相同的引理。

```lean
example {x : ℝ} (hx : x ^ 2 + 2 * x - 3 = 0) : x = -3 ∨ x = 1 := by
  sorry
```

9. 设 $a$、$b$ 为实数，且 $a^2+2b^2=3ab$。证明 $a=b$ 或 $a=2b$。

   大概会用到与 [例题 2.3.4](#234-例题) 相同的引理。

```lean
example {a b : ℝ} (hab : a ^ 2 + 2 * b ^ 2 = 3 * a * b) : a = b ∨ a = 2 * b := by
  sorry
```

10. 设 $t$ 为实数，且 $t^3=t^2$。证明 $t=1$ 或 $t=0$。

    大概会用到 [例题 2.3.4](#234-例题) 的引理，以及 `cancel` 策略。

```lean
example {t : ℝ} (ht : t ^ 3 = t ^ 2) : t = 1 ∨ t = 0 := by
  sorry
```

11. 设 $n$ 为任意自然数。证明 $n ^ 2 \ne 7$。

    大概会用到与 [例题 2.3.2](#232-例题) 相同的引理。

```lean
example {n : ℕ} : n ^ 2 ≠ 7 := by
  sorry
```

12. 设 $x$ 为任意整数。证明 $2x \ne 3$。

    大概会用到与 [例题 2.3.2](#232-例题) 相同的引理。

```lean
example {x : ℤ} : 2 * x ≠ 3 := by
  sorry
```

13. 设 $t$ 为任意整数。证明 $5t \ne 18$。

    大概会用到与 [例题 2.3.2](#232-例题) 相同的引理。

```lean
example {t : ℤ} : 5 * t ≠ 18 := by
  sorry
```

14. 设 $m$ 为任意自然数。证明 $m ^ 2 +4m\ne 46$。

    大概会用到与 [例题 2.3.2](#232-例题) 相同的引理。

```lean
example {m : ℕ} : m ^ 2 + 4 * m ≠ 46 := by
  sorry
```

## 2.4 与（$\land$）

### 2.4.1 例题

数学中「与」（逻辑符号 $\land$）像「或」一样可连接陈述。下面假设是「与」陈述。

**问题**

设 $x$、$y$ 为整数，且 $2x-y=4$、$y-x+1=2$。证明 $x=5$。

事实上我们在 [例题 1.3.6](01_Proofs_by_Calculation.md#136-例题) 做过这题，当时视为两个独立假设：

- $2x-y=4$
- $y-x+1=2$

现在为讨论方便，视为单一假设：

- $2x-y=4$ 与 $y-x+1=2$。

差别很学究，文字上几乎看不出。Lean 中更明显：可能遇到显式含 `∧` 的假设，如

```
x y : ℤ
h : 2 * x - y = 4 ∧ y - x + 1 = 2
⊢ x = 5
```

此时策略 `obtain` 把「与」假设拆成两部分：

```
x y : ℤ
h1 : 2 * x - y = 4
h2 : y - x + 1 = 2
⊢ x = 5
```

然后按需分别使用，本题实质上回到 [例题 1.3.6](01_Proofs_by_Calculation.md#136-例题) 的设定。

```lean
example {x y : ℤ} (h : 2 * x - y = 4 ∧ y - x + 1 = 2) : x = 5 := by
  obtain ⟨h1, h2⟩ := h
  calc
    x = 2 * x - y + (y - x + 1) - 1 := by ring
    _ = 4 + 2 - 1 := by rw [h1, h2]
    _ = 5 := by ring
```

### 2.4.2 例题

「与」假设在实战中相对少见。一种情形是：单一假设有两个自然推论，在引理中配对给出。例如若某正数 $y$ 满足 $x^2 \le y^2$，可推出 $-y \le x \le y$，这是简写（回忆 [例题 1.4.4](01_Proofs_by_Calculation.md#144-例题)）表示「$-y\leq x$ 与 $x\le y$」。

**问题**

设 $p$ 为有理数，且 $p^2\le 8$。证明 $p\ge -5$。

**解**

我们有

$$
\begin{aligned}
p^2&\le 9\\
&= 3^2,
\end{aligned}
$$

且 3 为正，故 $-3\le p\le 3$。于是

$$
\begin{aligned}
p&\ge -3\\
&\ge -5.
\end{aligned}
$$

Lean 中用引理 `abs_le_of_sq_le_sq'`。该引理由 Fordham 学生 Ben Davidson 加入库。注意引理结论中的 `∧`。

```lean
theorem abs_le_of_sq_le_sq' {x y : ℚ} (h1 : x ^ 2 ≤ y ^ 2) (h2 : 0 ≤ y) :
    -y ≤ x ∧ x ≤ y :=
```

**练习：** 我已把证明写到中间事实 `hp' : -3 ≤ p ∧ p ≤ 3` 的部分。处理该「与」假设并完成 Lean 证明。

```lean
example {p : ℚ} (hp : p ^ 2 ≤ 8) : p ≥ -5 := by
  have hp' : -3 ≤ p ∧ p ≤ 3
  · apply abs_le_of_sq_le_sq'
    calc
      p ^ 2 ≤ 9 := by addarith [hp]
      _ = 3 ^ 2 := by numbers
    numbers
  sorry
```

注意 Lean 新语法：像

```lean
have hp' : -3 ≤ p ∧ p ≤ 3
```

这样一行**没有** justification 时，Lean 会要求你补证明——出现新目标，即证该陈述。

```
2 goals
p : ℚ
hp : p ^ 2 ≤ 8
⊢ -3 ≤ p ∧ p ≤ 3
p : ℚ
hp : p ^ 2 ≤ 8
hp' : -3 ≤ p ∧ p ≤ 3
⊢ p ≥ -5
```

补完证明（如我此处所做）后，回到先前状态，但 `hp'` 已是完全 justify 的中间事实，可供使用。

### 2.4.3 例题

有时**目标**含「与」陈述。例如联立方程组，要求所有变量的值。下面是 [例题 1.3.3](01_Proofs_by_Calculation.md#133-例题) 见过的方程组，但题述改为求 $a$ **与** $b$ 的值。

**问题**

设 $a$、$b$ 为实数，且 $a-5b=4$、$b+2=3$。证明 $a=9$ 且 $b=1$。

一种解法是**完全独立**建立所求两个事实：

**解**

我们有，

$$
\begin{aligned}
a
&= 4 + 5b \\
&= -6 + 5(b + 2) \\
&= -6 + 5 \cdot 3 \\
&= 9,
\end{aligned}
$$

且由 $b+2=3$，得 $b=1$。

Lean 中用策略 `constructor`：目标为「与」陈述时，

```lean
a b : ℝ
h1 : a - 5 * b = 4
h2 : b + 2 = 3
⊢ a = 9 ∧ b = 1
```

化为两个更简单的任务，各对应「与」的一部分：

```lean
a b : ℝ
h1 : a - 5 * b = 4
h2 : b + 2 = 3
⊢ a = 9
a b : ℝ
h1 : a - 5 * b = 4
h2 : b + 2 = 3
⊢ b = 1
```

然后依次为两任务写 Lean 证明。

```lean
example {a b : ℝ} (h1 : a - 5 * b = 4) (h2 : b + 2 = 3) : a = 9 ∧ b = 1 := by
  constructor
  · calc
      a = 4 + 5 * b := by addarith [h1]
      _ = -6 + 5 * (b + 2) := by ring
      _ = -6 + 5 * 3 := by rw [h2]
      _ = 9 := by ring
  · addarith [h2]
```

另一种做法：先记下中间事实，再在证明两部分时都用。例如先解出 $b$，以缩短求 $a$ 的工作。

**解**

由 $b+2=3$，得 $b=1$。因此

$$
\begin{aligned}
a
&= 4 + 5b \\
&= 4 + 5 \cdot 1 \\
&= 9.
\end{aligned}
$$

通常留给读者自行核对：所需目标的两个部分 $a=9$ 与 $b=1$ 都在某处建立。

Lean 中：若某事实要在证明**两部分**都用（此处为 $b=1$），须在 `constructor` **之前**建立。`constructor` 之后，迄今建立的一切事实对由此产生的两个任务都可用：

```
a b : ℝ
h1 : a - 5 * b = 4
h2 : b + 2 = 3
hb : b = 1
⊢ a = 9
a b : ℝ
h1 : a - 5 * b = 4
h2 : b + 2 = 3
hb : b = 1
⊢ b = 1
```

```lean
example {a b : ℝ} (h1 : a - 5 * b = 4) (h2 : b + 2 = 3) : a = 9 ∧ b = 1 := by
  have hb : b = 1 := by addarith [h2]
  constructor
  · calc
      a = 4 + 5 * b := by addarith [h1]
      _ = 4 + 5 * 1 := by rw [hb]
      _ = 9 := by ring
  · apply hb
```

### 2.4.4 例题

再一题目标含「与」。

**问题**

设 $a$、$b$ 为实数，且 $a^2+b^2=0$。证明 $a=0$ 且 $b=0$。

**解**

先证 $a^2=0$。（$\star$）事实上，

$$
\begin{aligned}
a ^ 2 &\le a ^ 2 + b ^ 2\\
&=0.
\end{aligned}
$$

又平方非负，故 $a^2\geq 0$。

由（$\star$），$a=0$。又由（$\star$），

$$
\begin{aligned}
b ^ 2 &= a ^ 2 + b ^ 2\\
&=0,
\end{aligned}
$$

所以 $b=0$。

这部分可能似曾相识：中间目标 $a^2=0$ 的证明重复了 [例题 2.2.3](#223-例题)。

下面是 Lean 题述及从 [例题 2.2.3](#223-例题) 复制的 $a^2=0$ 中间证明。补全其余部分。策略 `cancel` 在由平方为 0 推出量为 0 时很有用。

```lean
example {a b : ℝ} (h1 : a ^ 2 + b ^ 2 = 0) : a = 0 ∧ b = 0 := by
  have h2 : a ^ 2 = 0
  · apply le_antisymm
    calc
      a ^ 2 ≤ a ^ 2 + b ^ 2 := by extra
      _ = 0 := by rw [h1]
    extra
  sorry
```

### 2.4.5 练习

1. 设 $a$、$b$ 为有理数，且 $a \le 1$、$a + b \le 3$。证明 $2a+b \le 4$。

```lean
example {a b : ℚ} (H : a ≤ 1 ∧ a + b ≤ 3) : 2 * a + b ≤ 4 := by
  sorry
```

2. 设 $r$、$s$ 为实数，且 $r + s \le 1$、$r - s \le 5$。证明 $2r \le 6$。

```lean
example {r s : ℝ} (H : r + s ≤ 1 ∧ r - s ≤ 5) : 2 * r ≤ 6 := by
  sorry
```

3. 设 $m$、$n$ 为整数，且 $n \le 8$、$m + 5 \le n$。证明 $m \le 3$。

```lean
example {m n : ℤ} (H : n ≤ 8 ∧ m + 5 ≤ n) : m ≤ 3 := by
  sorry
```

4. 设 $p$ 为整数，且 $p + 2 \ge 9$。证明 $p^2\geq 49$ 且 $7 \le p$。

```lean
example {p : ℤ} (hp : p + 2 ≥ 9) : p ^ 2 ≥ 49 ∧ 7 ≤ p := by
  sorry
```

5. 设 $a$ 为有理数，且 $a - 1 \ge 5$。证明 $a \ge 6$ 且 $3a \ge 10$。

```lean
example {a : ℚ} (h : a - 1 ≥ 5) : a ≥ 6 ∧ 3 * a ≥ 10 := by
  sorry
```

6. 设 $x$、$y$ 为有理数，且 $x + y = 5$、$x + 2y = 7$。证明 $x=3$ 且 $y=2$。

```lean
example {x y : ℚ} (h : x + y = 5 ∧ x + 2 * y = 7) : x = 3 ∧ y = 2 := by
  sorry
```

7. 设 $a$、$b$ 为实数，且 $ab=a$、$ab=b$。证明 $a=b=0$ 或 $a=b=1$。

   大概需要 [例题 2.3.4](#234-例题) 中的引理 `eq_zero_or_eq_zero_of_mul_eq_zero`。

```lean
example {a b : ℝ} (h1 : a * b = a) (h2 : a * b = b) :
    a = 0 ∧ b = 0 ∨ a = 1 ∧ b = 1 := by
  sorry
```

## 2.5 存在（$\exists$）证明

### 2.5.1 例题

本节讲**存在量词**（existential quantifier），英文表述为

> 存在……使得……

例如，假设中含存在量词的一题：

**问题**

设 $a$ 为有理数，且存在有理数 $b$ 使得 $a=b^2+1$。证明 $a>0$。

假设「存在有理数 $b$ 使得 $a=b^2+1$」可立刻拆开，得到存在性的**见证**（witness）：满足 $a=b^2+1$ 的有理数 $b$（可能不止一个，这里只选一个见证）。然后做涉及见证 $b$ 的常规计算式证明。

**解**

取有理数 $b$ 使 $a=b^2+1$。我们有，

$$
\begin{aligned}
a &=b^2+1\\
&>0.
\end{aligned}
$$

存在性的逻辑符号是 $\exists$。Lean 中用策略 `obtain` 把存在假设拆成见证与关于见证的假设；语法与拆「与」相同（见 [第 2.4 节](#24-与land)）。

```lean
example {a : ℚ} (h : ∃ b : ℚ, a = b ^ 2 + 1) : a > 0 := by
  obtain ⟨b, hb⟩ := h
  calc
    a = b ^ 2 + 1 := hb
    _ > 0 := by extra
```

本题初始目标视图为

```lean
a : ℚ
h : ∃ b, a = b ^ 2 + 1
⊢ a > 0
```

`obtain` 后存在性被拆开，见证单独出现在变量列表中，可在后续证明中使用：

```lean
a b : ℚ
hb : a = b ^ 2 + 1
⊢ a > 0
```

### 2.5.2 例题

另一存在假设题：「存在实数 $a$ 使得 $at<0$」。照旧拆开，再用前面方法。

**问题**

设 $t$ 为实数，且存在实数 $a$ 使得 $at<0$。证明 $t\ne 0$。

**解**

取实数 $x$ 使 $xt<0$。分别考虑 $x\le 0$ 与 $0<x$。

**情形 1**（$x \le 0$）：有 $0<(-x)t$ 且 $0 \le -x$，故 $0 < t$，所以 $t\ne 0$。

**情形 2**（$0<x$）：有

$$
\begin{aligned}
0&<-xt\\
&=x(-t)
\end{aligned}
$$

且 $0 \le x$，故 $0 < -t$，所以 $t<0$，故 $t\ne 0$。

下面是 Lean 部分解（先用 `obtain` 拆存在性，再分情形；情形 2 缺失，请自补）。

```lean
example {t : ℝ} (h : ∃ a : ℝ, a * t < 0) : t ≠ 0 := by
  obtain ⟨x, hxt⟩ := h
  have H := le_or_gt x 0
  obtain hx | hx := H
  · have hxt' : 0 < (-x) * t := by addarith [hxt]
    have hx' : 0 ≤ -x := by addarith [hx]
    cancel -x at hxt'
    apply ne_of_gt
    apply hxt'
  · sorry
```

### 2.5.3 例题

若**目标**含存在性，须自己提供见证，再验证该见证满足要求。

**问题**

证明存在整数 $n$ 使得 $12n=84$。

**解**

整数 $7$ 具有该性质。事实上，$12 \cdot 7=84$。

Lean 中用策略 `use` 声明所选见证。

```lean
example : ∃ n : ℤ, 12 * n = 84 := by
  use 7
  numbers
```

初始目标为

```
⊢ ∃ n : ℤ, 12 * n = 84
```

`use 7` 后目标变为验证见证 7 是否成立：

```
⊢ 12 * 7 = 84
```

由 `numbers` 检查。

### 2.5.4 例题

常为存在目标想见证需要创造力。本节其余部分练习构造见证。

**问题**

设 $x$ 为实数。证明存在实数 $y$ 使得 $y>x$。

**解**

实数 $x + 1$ 具有该性质。事实上，$x+1>x$。

```lean
example (x : ℝ) : ∃ y : ℝ, y > x := by
  use x + 1
  extra
```

### 2.5.5 例题

**问题**

证明存在整数 $m$、$n$ 使得 $m^2-n^2=11$。

**解**

可取 $m=6$、$n=5$。事实上，

$$
\begin{aligned}
6^2-5^2&=36-25\\
&=11.
\end{aligned}
$$

```lean
example : ∃ m n : ℤ, m ^ 2 - n ^ 2 = 11 := by
  sorry
```

### 2.5.6 例题

有时可省略「可取……」这类显式说明见证的句子；此时应格外严格地按题述形式验证所需性质。

**问题**

设 $a$ 为整数。证明存在整数 $m$、$n$ 使得 $m^2-n^2=2a+1$。

**解**

$$(a+1)^2-a^2=2a+1.$$

Lean 中仍须用 `use` 声明见证。

```lean
example (a : ℤ) : ∃ m n : ℤ, m ^ 2 - n ^ 2 = 2 * a + 1 := by
  sorry
```

### 2.5.7 例题

**问题**

设 $p$、$q$ 为实数，且 $p<q$。证明存在实数 $x$ 使得 $p<x<q$。

**解**

我们将证 $\frac{p+q}{2}$ 具有该性质。事实上，

$$
\begin{aligned}
p&=\frac{p+p}{2}\\
&<\frac{p+q}{2},
\end{aligned}
$$

且

$$
\begin{aligned}
\frac{p+q}{2} &<\frac{q+q}{2}\\
&=q.
\end{aligned}
$$

```lean
example {p q : ℝ} (h : p < q) : ∃ x, p < x ∧ x < q := by
  sorry
```

### 2.5.8 例题

> 我记得有一次去 Putney 看望病中的他 [Ramanujan]。我乘的出租车号是 1729，我说这数似乎相当乏味，希望不是坏兆头。「不，」他回答，「这是个很有意思的数；它是能表示为两个立方和的最小整数，且有两种不同表示。」
> —G. H. Hardy，《Ramanujan: Twelve lectures on subjects suggested by his life and work》

**问题**

证明存在自然数 $a$、$b$、$c$、$d$ 使得 $a^3+b^3=1729=c^3+d^3$，但 $a\ne c$ 且 $a\ne d$。[^3]

**解**

$1^3+12^3=1729=9^3+10^3$，且 $1\ne 9$、$1\ne 10$。

```lean
example : ∃ a b c d : ℕ,
    a ^ 3 + b ^ 3 = 1729 ∧ c ^ 3 + d ^ 3 = 1729 ∧ a ≠ c ∧ a ≠ d := by
  use 1, 12, 9, 10
  constructor
  numbers
  constructor
  numbers
  constructor
  numbers
  numbers
```

### 2.5.9 练习

1. 证明存在有理数 $t$ 使得 $t^2=1.69$。

```lean
example : ∃ t : ℚ, t ^ 2 = 1.69 := by
  sorry
```

2. 证明存在整数 $m$、$n$ 使得 $m^2+n^2=85$。

```lean
example : ∃ m n : ℤ, m ^ 2 + n ^ 2 = 85 := by
  sorry
```

3. 证明存在实数 $x$ 使得 $x<0$ 且 $x^2<1$。

```lean
example : ∃ x : ℝ, x < 0 ∧ x ^ 2 < 1 := by
  sorry
```

4. 证明存在自然数 $a$、$b$ 使得 $2 ^ a = 5b+1$。

```lean
example : ∃ a b : ℕ, 2 ^ a = 5 * b + 1 := by
  sorry
```

5. 设 $x$ 为有理数。证明存在有理数 $y$ 使得 $y^2>x$。

```lean
example (x : ℚ) : ∃ y : ℚ, y ^ 2 > x := by
  sorry
```

6. 设 $t$ 为实数，且存在实数 $a$ 使得 $at+1<a+t$。证明 $t\ne 1$。

   如 [例题 2.5.2](#252-例题)，可用引理 `le_or_gt`：若 $s$、$t$ 为实数，则 $s \le t$ 或 $t < s$；作分情形很有用。

```lean
example {t : ℝ} (h : ∃ a : ℝ, a * t + 1 < a + t) : t ≠ 1 := by
  sorry
```

7. 设 $m$ 为整数，且存在整数 $a$ 使得 $2a=m$。证明 $m\ne 5$。

```lean
example {m : ℤ} (h : ∃ a, 2 * a = m) : m ≠ 5 := by
  sorry
```

8. 设 $n$ 为整数。证明存在整数 $a$ 使得 $2a^3 ≥ na+7$。

```lean
example {n : ℤ} : ∃ a, 2 * a ^ 3 ≥ n * a + 7 := by
  sorry
```

9. 设 $a$、$b$、$c$ 为实数，且 $a\le b+c$、$b\le a+c$、$c\le a+b$。证明存在非负实数 $x$、$y$、$z$ 使得 $a=y+z$、$b=x+z$、$c=x+y$。

```lean
example {a b c : ℝ} (ha : a ≤ b + c) (hb : b ≤ a + c) (hc : c ≤ a + b) :
    ∃ x y z, x ≥ 0 ∧ y ≥ 0 ∧ z ≥ 0 ∧ a = y + z ∧ b = x + z ∧ c = x + y := by
  sorry
```

[^3]: 例题改编自 Hammack，《[Book of Proof](https://www.people.vcu.edu/~rhammack/BookOfProof/)》第 7.3 节。