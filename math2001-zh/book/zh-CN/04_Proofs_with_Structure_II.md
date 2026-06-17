# 第 4 章 结构化证明 II

> 本译文对应原书 [Proofs with structure, II](https://hrmacbeth.github.io/math2001/04_Proofs_with_Structure_II.html)；英文 Sphinx 源：`04_Proofs_with_Structure_II.rst`。

在[第 2 章](02_Proofs_with_Structure.md)中，我们学习了逻辑符号 $\lor$、$\land$ 和 $\exists$，它们使得复杂的数学陈述可以由更简单的陈述构造出来。对每一个这样的符号，我们学习了它的“语法”：当它出现在假设中时如何使用，当它出现在目标中时如何使用。这种语法称为[自然演绎](https://en.wikipedia.org/wiki/Natural_deduction)。

本章完成自[第 2 章](02_Proofs_with_Structure.md)开始的工作。我们将学习其余逻辑符号的语法：$\forall$、$\to$ 和 $\lnot$。我们还将学习另外两个逻辑符号 $\leftrightarrow$ 和 $\exists!$ 的语法，它们不那么基本，因为可以用其他符号定义。

## 4.1. “对所有”与蕴涵

### 4.1.1. 例

**问题**

设 $a$ 是实数，且假设对所有实数 $x$ 都有 $a \le x^2 - 2x$。证明 $a \le -1$。

![抛物线 $y = x^2 - 2x$](https://hrmacbeth.github.io/math2001/_images/04_logic_01_parabola.png)

**图 4.1** 抛物线 $y = x^2 - 2x$。

指明一个公式或谓词对所有变量 $x$ 的值都成立，如上述问题中的 $a \le x^2 - 2x$，称为对变量 $x$ 做**全称量化**。它用符号 `∀` 表示。

要使用带有全称量词的假设，你可以把它“特殊化”到某个特定的变量。例如，在下面的解法中，我们使用假设在 $x$ 取 1 时的特例。

**解法**

$$
\begin{split} a &\le 1^2 - 2 \cdot 1 \\ &= -1. \end{split}
$$

在 Lean 中，用 `apply` 策略完成这种特殊化。

```lean
example {a : ℝ} (h : ∀ x, a ≤ x ^ 2 - 2 * x) : a ≤ -1 :=
  calc
    a ≤ 1 ^ 2 - 2 * 1 := by apply h
    _ = -1 := by numbers
```

### 4.1.2. 例

**问题**

设 $n$ 是自然数，且 $n$ 是每个自然数 $m$ 的因子。证明 $n = 1$。

**解法**

由于 $n$ 是每个自然数的因子，它也是 $1$ 的因子。又注意到 $1$ 是正数。因此我们可以调用[例 3.2.7](03_Parity_and_Divisibility.md#例-327)和[例 3.2.8](03_Parity_and_Divisibility.md#例-328)中讨论的因子大小界：$n \le 1$ 且 $1 \le n$。因此 $n = 1$。

在 Lean 证明中，我们回忆[例 3.2.7](03_Parity_and_Divisibility.md#例-327)中的界在 Lean 中名为 `Nat.le_of_dvd`，[例 3.2.8](03_Parity_and_Divisibility.md#例-328)中的界名为 `Nat.pos_of_dvd_of_pos`。

```lean
example {n : ℕ} (hn : ∀ m, n ∣ m) : n = 1 := by
  have h1 : n ∣ 1 := by apply hn
  have h2 : 0 < 1 := by numbers
  apply le_antisym
  · apply Nat.le_of_dvd h2 h1
  · apply Nat.pos_of_dvd_of_pos h1 h2
```

### 4.1.3. 例

**问题**

设 $a$ 和 $b$ 是实数，假设每个实数 $x$ 要么至少为 $a$，要么至多为 $b$。证明 $a \le b$。

**解法**

考虑实数 $\dfrac{a+b}{2}$。它要么至少为 $a$，要么至多为 $b$。

**情形 1：** $\dfrac{a+b}{2} \ge a$。则

$$
\begin{split} b &= 2 \left(\frac{a+b}{2}\right) - a \\ &\ge 2 \cdot a - a \\ &= a. \end{split}
$$

**情形 2：** $\dfrac{a+b}{2} \le b$。则

$$
\begin{split} a &= 2 \left(\frac{a+b}{2}\right) - b \\ &\le 2 \cdot b - b \\ &= b. \end{split}
$$

```lean
example {a b : ℝ} (h : ∀ x, x ≥ a ∨ x ≤ b) : a ≤ b := by
  sorry
```

### 4.1.4. 例

**问题**

设 $a$ 是平方不超过 2 的实数，且 $a$ 大于或等于任何平方不超过 2 的实数。 [^1] 设 $b$ 是具有同样两个性质的另一个实数。证明 $a = b$。

考虑本题中“$a$ 大于或等于任何平方不超过 2 的实数”这一假设。它隐含有全称量化（“任何实数”），以及一个**蕴涵**。更啰嗦的版本是：

> 对所有实数 $y$，如果 $y^2 \le 2$，那么 $y \le a$。

我们可以把这样的假设特殊化到任何特定的 $y$，只要其**前件** $y^2 \le 2$ 为真。

**解法**

由于 $a^2 \le 2$，且 $b$ 大于或等于任何平方不超过 2 的实数，所以 $a \le b$。

由于 $b^2 \le 2$，且 $a$ 大于或等于任何平方不超过 2 的实数，所以 $b \le a$。

因此 $a = b$。

在 Lean 中，蕴涵用符号 `→` 表示。`apply` 策略也适用于带有蕴涵的假设。在下面的证明中，使用 `apply hb2` 之前的目标状态是

```
a b : ℝ
ha1 : a ^ 2 ≤ 2
hb1 : b ^ 2 ≤ 2
ha2 : ∀ (y : ℝ), y ^ 2 ≤ 2 → y ≤ a
hb2 : ∀ (y : ℝ), y ^ 2 ≤ 2 → y ≤ b
⊢ a ≤ b
```

使用之后的目标状态是

```
a b : ℝ
ha1 : a ^ 2 ≤ 2
hb1 : b ^ 2 ≤ 2
ha2 : ∀ (y : ℝ), y ^ 2 ≤ 2 → y ≤ a
hb2 : ∀ (y : ℝ), y ^ 2 ≤ 2 → y ≤ b
⊢ a ^ 2 ≤ 2
```

假设 `∀ (y : ℝ), y ^ 2 ≤ 2 → y ≤ b` 被应用于目标 `a ≤ b`，留下 hopefully 更容易的目标 `a ^ 2 ≤ 2`：即证明蕴涵的前件。

请补全证明的第二部分。

```lean
example {a b : ℝ} (ha1 : a ^ 2 ≤ 2) (hb1 : b ^ 2 ≤ 2) (ha2 : ∀ y, y ^ 2 ≤ 2 → y ≤ a)
    (hb2 : ∀ y, y ^ 2 ≤ 2 → y ≤ b) :
    a = b := by
  apply le_antisym
  · apply hb2
    apply ha1
  · sorry
```

### 4.1.5. 例

**问题**

证明存在实数 $b$，使得对每个实数 $x$ 都有 $b \le x^2 - 2x$。

注意本题的目标中出现了一个全称量词命题：“对每个实数 $x$，……”。

**解法**

我们证明 $-1$ 具有这个性质。事实上，设 $x$ 是实数；则

$$
\begin{split} -1 &\le -1 + (x-1)^2 \\ &= x^2 - 2x. \end{split}
$$

我们通过形式上引入一个特定的、任意的实数 $x$（“设 $x$ 为实数”），并证明对该 $x$ 的所需陈述来解决问题。在 Lean 中，这一论证由 `intro` 策略完成。使用该策略之前，目标状态为

```
⊢ ∀ (x : ℝ), -1 ≤ x ^ 2 - 2 * x
```

使用之后，目标状态为

```
x : ℝ
⊢ -1 ≤ x ^ 2 - 2 * x
```

```lean
example : ∃ b : ℝ, ∀ x : ℝ, b ≤ x ^ 2 - 2 * x := by
  use -1
  intro x
  calc
    -1 ≤ -1 + (x - 1) ^ 2 := by extra
    _ = x ^ 2 - 2 * x := by ring
```

### 4.1.6. 例

**问题**

证明存在实数 $c$，使得对所有实数 $x$ 和 $y$，如果 $x^2 + y^2 \le 4$，则 $x + y \ge c$。

这里目标包含对 $x$ 和 $y$ 的全称量化，以及一个蕴涵：“如果 $x^2 + y^2 \le 4$，那么 ……”。在解题时，我们形式上引入变量 $x$ 和 $y$，以及它们被假设满足的条件 $x^2 + y^2 \le 4$：

**解法**

我们证明 $-3$ 具有这个性质。事实上，设 $x$、$y$ 是实数且假设 $x^2 + y^2 \le 4$。则

$$
\begin{split} (x + y)^2 &\le (x + y)^2 + (x - y)^2 \\ &= 2(x^2 + y^2) \\ &\le 2 \cdot 4 \\ &\le 3^2. \end{split}
$$

所以 $x + y \ge -3$（且也有 $x + y \le 3$）。

在 Lean 中，引入变量 $x$、$y$ 以及假设 $x^2 + y^2 \le 4$ 都由 `intro` 策略完成。要从 $(x + y)^2 \le 3^2$ 推出 $-3 \le x + y$ 和 $x + y \le 3$，你需要使用引理

```lean
lemma abs_le_of_sq_le_sq' (h : x ^ 2 ≤ y ^ 2) (hy : 0 ≤ y) : -y ≤ x ∧ x ≤ y :=
```

我们之前在[例 2.4.2](02_Proofs_with_Structure.md#例-242)中见过它。

```lean
example : ∃ c : ℝ, ∀ x y, x ^ 2 + y ^ 2 ≤ 4 → x + y ≥ c := by
  sorry
```

### 4.1.7. 例

**定义**

如果一个性质对所有足够大的整数 $n$ 成立，即存在某个整数 $N$，使得该性质对所有 $n \ge N$ 的整数都成立，则称该性质对所有**足够大的整数** $n$ 成立。

对有理数、实数等类似。

**问题**

证明对所有足够大的整数 $n$，有 $n^3 \ge 4n^2 + 7$。

在下面的解法中，“对所有 $n \ge 5$”是“设 $n$ 是整数并假设 $n \ge 5$”的简写。

**解法**

对所有 $n \ge 5$，

$$
\begin{split} n^3 &= n \cdot n^2 \\ &\ge 5 n^2 \\ &= 4 n^2 + n^2 \\ &\ge 4 n^2 + 5^2 \\ &= 4 n^2 + 7 + 18 \\ &\ge 4 n^2 + 7. \end{split}
$$

我提供了记号 `forall_sufficiently_large` 来表达这个以及类似的 Lean 问题。

```lean
example : forall_sufficiently_large n : ℤ, n ^ 3 ≥ 4 * n ^ 2 + 7 := by
  dsimp
  use 5
  intro n hn
  calc
    n ^ 3 = n * n ^ 2 := by ring
    _ ≥ 5 * n ^ 2 := by rel [hn]
    _ = 4 * n ^ 2 + n ^ 2 := by ring
    _ ≥ 4 * n ^ 2 + 5 ^ 2 := by rel [hn]
    _ = 4 * n ^ 2 + 7 + 18 := by ring
    _ ≥ 4 * n ^ 2 + 7 := by extra
```

### 4.1.8. 例

**定义**

自然数 $p$ 是**素数**，如果它至少为 2，且 $p$ 的因子只有 $1$ 和 $p$。

```lean
def Prime (p : ℕ) : Prop :=
  2 ≤ p ∧ ∀ m : ℕ, m ∣ p → m = 1 ∨ m = p
```

**问题**

证明 2 是素数。

**解法**

显然 $2 \le 2$。设 $m$ 是 2 的因子。由于 2 是正数，根据[例 3.2.7](03_Parity_and_Divisibility.md#例-327)和[例 3.2.8](03_Parity_and_Divisibility.md#例-328)讨论的因子大小界，有 $m \le 2$ 且 $1 \le m$。满足 $m \le 2$ 且 $1 \le m$ 的自然数只有 $1$ 和 $2$，所以按要求 $m = 1$ 或 $m = 2$。

这个解法中使用了一个新技巧：从自然数的数值界（如这里的 $m \le 2$ 和 $1 \le m$）看出只有有限多种可能（这里 $m = 1$ 或 $m = 2$）。在 Lean 中，我们用 `interval_cases` 策略处理这类论证。它对整数也有效，但对有理数或实数无效——为什么？

```lean
example : Prime 2 := by
  constructor
  · numbers -- show `2 ≤ 2`
  intro m hmp
  have hp : 0 < 2 := by numbers
  have hmp_le : m ≤ 2 := Nat.le_of_dvd hp hmp
  have h1m : 1 ≤ m := Nat.pos_of_dvd_of_pos hmp hp
  interval_cases m
  · left
    numbers -- show `1 = 1`
  · right
    numbers -- show `2 = 2`
```

这个引理在 Lean 中以后以 `prime_two` 的名字可用。

### 4.1.9. 例

你可能想知道如何证明一个自然数 $p$ **不是**素数。思路是证明它可以表示为一个非平凡乘积。

**问题**

证明 6 不是素数。

**解法**

$6 = 2 \cdot 3$，所以 $2 \mid 6$。但 $2 \ne 1$ 且 $2 \ne 6$。

我们将在[例 4.5.7](#例-457)中仔细证明这个判别法。现在可以随意使用它。在 Lean 中引理名为 `not_prime`。

```lean
example : ¬ Prime 6 := by
  apply not_prime 2 3
  · numbers -- show `2 ≠ 1`
  · numbers -- show `2 ≠ 6`
  · numbers -- show `6 = 2 * 3`
```

### 4.1.10. 练习

1. 设 $a$ 是有理数，假设对所有有理数 $b$ 都有 $a \ge -3 + 4b - b^2$。证明 $a \ge 1$。

   ```lean
   example {a : ℚ} (h : ∀ b : ℚ, a ≥ -3 + 4 * b - b ^ 2) : a ≥ 1 :=
     sorry
   ```

2. 设 $n$ 是整数，假设 1 到 5 之间的每个整数 $m$ 都是 $n$ 的因子。证明 15 是 $n$ 的因子。（你可能需要复习[3.5 节](03_Parity_and_Divisibility.md#35-bézout-恒等式)。）

   ```lean
   example {n : ℤ} (hn : ∀ m, 1 ≤ m → m ≤ 5 → m ∣ n) : 15 ∣ n := by
     sorry
   ```

3. 证明存在自然数 $n$，使得每个自然数 $m$ 都至少为 $n$。

   ```lean
   example : ∃ n : ℕ, ∀ m : ℕ, n ≤ m := by
     sorry
   ```

4. 证明存在实数 $a$，使得对所有实数 $b$，存在实数 $c$，使得 $a + b < c$。

   ```lean
   example : ∃ a : ℝ, ∀ b : ℝ, ∃ c : ℝ, a + b < c := by
     sorry
   ```

5. 证明对所有足够大的实数 $x$，有 $x^3 + 3x \ge 7x^2 + 12$。

   ```lean
   example : forall_sufficiently_large x : ℝ, x ^ 3 + 3 * x ≥ 7 * x ^ 2 + 12 := by
     sorry
   ```

6. 证明 45 不是素数。

   你可以像[例 4.1.9](#例-419)那样使用 Lean 引理 `not_prime`。

   ```lean
   example : ¬(Prime 45) := by
     sorry
   ```

[^1]: 也就是说，$a$ 是“平方不超过 2 的实数集合中的最大元”。

## 4.2. “当且仅当”

### 4.2.1. 例

**问题**

设 $a$ 是有理数。证明 $3a + 1 \le 7$ 当且仅当 $a \le 2$。

短语“当且仅当”的意思就是字面意思。在这个问题中，我们需要证明 (1) 如果 $3a + 1 \le 7$ 则 $a \le 2$；(2) 如果 $a \le 2$ 则 $3a + 1 \le 7$。

**解法**

首先，假设 $3a + 1 \le 7$。则

$$
\begin{split} a &= \frac{(3a+1)-1}{3} \\ &\le \frac{7-1}{3} \\ &= 2. \end{split}
$$

反过来，假设 $a \le 2$。则

$$
\begin{split} 3a + 1 &\le 3 \cdot 2 + 1 \\ &= 7. \end{split}
$$

在手写作业中，常用符号 $\Rightarrow$ 和 $\Leftarrow$ 分别标注两个方向：

**解法**

$\Rightarrow$ 假设 $3a + 1 \le 7$。则 ……

$\Leftarrow$ 假设 $a \le 2$。则 ……

这在作业、考试、黑板书写等场合是推荐的。在更正式的写作（如本书）中，我们省略这些符号，改用“首先”和“反过来”等词来标示证明的不同部分。

在 Lean 中，“当且仅当”用双向蕴涵符号 `↔` 表示。由于本质上“当且仅当”是一个“且”命题，我们对“且”型目标使用相同的策略 `constructor`。

```lean
example {a : ℚ} : 3 * a + 1 ≤ 7 ↔ a ≤ 2 := by
  constructor
  · intro h
    calc a = ((3 * a + 1) - 1) / 3 := by ring
      _ ≤ (7 - 1) / 3 := by rel [h]
      _ = 2 := by numbers
  · intro h
    calc 3 * a + 1 ≤ 3 * 2 + 1 := by rel [h]
      _ = 7 := by numbers
```

### 4.2.2. 例

让我们把[例 3.5.1](03_Parity_and_Divisibility.md#例-351)修改成一个“当且仅当”问题。现在有两件事要证明，其中一件我们之前已经做过。

**问题**

设 $n$ 是整数。证明 $8 \mid 5n$ 当且仅当 $8 \mid n$。

**解法**

假设 $8 \mid 5n$。则存在整数 $a$ 使得 $5n = 8a$。所以

$$
\begin{split} n &= -3(5n) + 16n \\ &= -3(8a) + 16n \\ &= 8(-3a + 2n), \end{split}
$$

因此 $8 \mid n$。

反过来，假设 $8 \mid n$。则存在整数 $a$ 使得 $n = 8a$。所以

$$
\begin{split} 5n &= 5(8a) \\ &= 8(5a), \end{split}
$$

因此 $8 \mid 5n$。

```lean
example {n : ℤ} : 8 ∣ 5 * n ↔ 8 ∣ n := by
  constructor
  · intro hn
    obtain ⟨a, ha⟩ := hn
    use -3 * a + 2 * n
    calc
      n = -3 * (5 * n) + 16 * n := by ring
      _ = -3 * (8 * a) + 16 * n := by rw [ha]
      _ = 8 * (-3 * a + 2 * n) := by ring
  · intro hn
    obtain ⟨a, ha⟩ := hn
    use 5 * a
    calc 5 * n = 5 * (8 * a) := by rw [ha]
      _ = 8 * (5 * a) := by ring
```

### 4.2.3. 例

**问题**

证明整数 $n$ 是奇数当且仅当 $n$ 模 2 同余于 1。

**解法**

首先，假设 $n$ 是奇数。则存在整数 $k$ 使得 $n = 2k + 1$。因此 $n - 1 = 2k$，所以 $n - 1$ 被 2 整除，即 $n \equiv 1 \pmod 2$。

反过来，假设 $n \equiv 1 \pmod 2$。则 $2 \mid n - 1$，所以存在整数 $k$ 使得 $n - 1 = 2k$。于是 $n = 2k + 1$，所以 $n$ 是奇数。

我们将这个例子命名为 `Int.odd_iff_modEq` 供以后使用。

```lean
theorem odd_iff_modEq (n : ℤ) : Odd n ↔ n ≡ 1 [ZMOD 2] := by
  constructor
  · intro h
    obtain ⟨k, hk⟩ := h
    dsimp [Int.ModEq]
    dsimp [(· ∣ ·)]
    use k
    addarith [hk]
  · sorry
```

### 4.2.4. 例

现在对偶数做同样的刻画。

**问题**

证明整数 $n$ 是偶数当且仅当 $n$ 模 2 同余于 0。

```lean
theorem even_iff_modEq (n : ℤ) : Even n ↔ n ≡ 0 [ZMOD 2] := by
  constructor
  · intro h
    obtain ⟨k, hk⟩ := h
    dsimp [Int.ModEq]
    dsimp [(· ∣ ·)]
    use k
    addarith [hk]
  · sorry
```

### 4.2.5. 例

高中数学中“解方程”的概念就是一个“当且仅当”问题：要解一个方程，你列出一组数，并证明它们满足该方程，且没有其他数满足。

**问题**

设 $x$ 是实数。证明 $x^2 + x - 6 = 0$ 当且仅当 $x = -3$ 或 $x = 2$。

**解法**

首先，假设 $x^2 + x - 6 = 0$。则

$$
\begin{split} (x+3)(x-2) &= x^2 + x - 6 \\ &= 0, \end{split}
$$

所以要么 $x + 3 = 0$，要么 $x - 2 = 0$。若是前者，$x = -3$；若是后者，$x = 2$。

反过来，如果 $x = -3$，则

$$
\begin{split} x^2 + x - 6 &= (-3)^2 + (-3) - 6 \\ &= 0, \end{split}
$$

如果 $x = 2$，则

$$
\begin{split} x^2 + x - 6 &= 2^2 + 2 - 6 \\ &= 0. \end{split}
$$

```lean
example {x : ℝ} : x ^ 2 + x - 6 = 0 ↔ x = -3 ∨ x = 2 := by
  sorry
```

### 4.2.6. 例

**问题**

设 $a$ 是整数。证明 $a^2 - 5a + 5 \le -1$ 当且仅当 $a$ 是 2 或 3。

**解法**

首先，假设 $a^2 - 5a + 5 \le -1$。则

$$
\begin{split} (2a - 5)^2 &= 4(a^2 - 5a + 5) + 5 \\ &\le 4 \cdot (-1) + 5 \\ &= 1^2, \end{split}
$$

所以 $-1 \le 2a - 5 \le 1$。因此 $2 \cdot 2 \le 2a$，即 $2 \le a$；类似地 $2a \le 2 \cdot 3$，即 $a \le 3$。由于 $2 \le a \le 3$，所以 $a$ 是 2 或 3。

反过来，如果 $a = 2$，则

$$
\begin{split} a^2 - 5a + 5 &= 2^2 - 5 \cdot 2 + 5 \\ &\le -1, \end{split}
$$

如果 $a = 3$，则

$$
\begin{split} a^2 - 5a + 5 &= 3^2 - 5 \cdot 3 + 5 \\ &\le -1. \end{split}
$$

```lean
example {a : ℤ} : a ^ 2 - 5 * a + 5 ≤ -1 ↔ a = 2 ∨ a = 3 := by
  sorry
```

### 4.2.7. 例

有些库引理具有“当且仅当”形式。这很方便，因为它们可以替代两个普通引理，每个方向一个。

**问题**

设 $n$ 是整数，假设 $n^2 - 10n + 24 = 0$。证明 $n$ 是偶数。

**解法**

我们有

$$
\begin{split} (n-4)(n-6) &= n^2 - 10n + 24 \\ &= 0, \end{split}
$$

所以要么 $n - 4 = 0$，要么 $n - 6 = 0$。若是前者，则 $n = 2 \cdot 2$，所以 $n$ 是偶数；若是后者，则 $n = 2 \cdot 3$，所以 $n$ 是偶数。

在这个问题中，我们需要把 $(n-4)(n-6) = 0$ 这一事实转化为“$n - 4 = 0$ 或 $n - 6 = 0$”。以前（如[例 2.3.4](02_Proofs_with_Structure.md#例-234)），我们在 Lean 中会把这一事实直接代入引理

```lean
theorem eq_zero_or_eq_zero_of_mul_eq_zero {a b : ℤ} (h : a * b = 0) : a = 0 ∨ b = 0 :=
```

得到如下证明结构：

```lean
example {n : ℤ} (hn : n ^ 2 - 10 * n + 24 = 0) : Even n := by
  have hn1 :=
    calc (n - 4) * (n - 6) = n ^ 2 - 10 * n + 24 := by ring
      _ = 0 := hn
  have hn2 := eq_zero_or_eq_zero_of_mul_eq_zero hn1
  sorry
```

（练习：补全证明。）

但 Lean 库中也有一个 `↔` 形式的引理，它把 `eq_zero_or_eq_zero_of_mul_eq_zero` 与其逆命题结合在一起：

```lean
theorem mul_eq_zero {a b : ℤ} : a * b = 0 ↔ a = 0 ∨ b = 0 :=
```

我们可以在 Lean 中用 `rw` 策略使用 `↔` 引理；它把假设（或目标）中形如 `↔` 左边的式子转化为右边的形式。

```lean
example {n : ℤ} (hn : n ^ 2 - 10 * n + 24 = 0) : Even n := by
  have hn1 :=
    calc (n - 4) * (n - 6) = n ^ 2 - 10 * n + 24 := by ring
      _ = 0 := hn
  rw [mul_eq_zero] at hn1 -- `hn1 : n - 4 = 0 ∨ n - 6 = 0`
  sorry
```

### 4.2.8. 例

上面在[例 4.2.3](#例-423)中，我们证明了整数是奇数当且仅当它模 2 同余于 1，并把它记为 `Int.odd_iff_modEq`。现在它也是一个方便的“当且仅当”库引理，可用于用模算术解决奇偶性问题。例如，让我们重新做[例 3.1.5](03_Parity_and_Divisibility.md#例-315)中的问题。

**问题**

证明如果整数 $x$ 和 $y$ 都是奇数，则 $x + y + 1$ 是奇数。

**解法**

我们要证明如果 $x \equiv 1 \pmod 2$ 且 $y \equiv 1 \pmod 2$，则 $x + y + 1 \equiv 1 \pmod 2$。事实上，

$$
\begin{split} x + y + 1 &\equiv 1 + 1 + 1 \pmod 2 \\ &= 2 \cdot 1 + 1 \\ &\equiv 1 \pmod 2. \end{split}
$$

```lean
example {x y : ℤ} (hx : Odd x) (hy : Odd y) : Odd (x + y + 1) := by
  rw [Int.odd_iff_modEq] at *
  calc x + y + 1 ≡ 1 + 1 + 1 [ZMOD 2] := by rel [hx, hy]
    _ = 2 * 1 + 1 := by ring
    _ ≡ 1 [ZMOD 2] := by extra
```

### 4.2.9. 例

我们还可以用模算术对奇偶性的刻画来证明[例 3.1.9](03_Parity_and_Divisibility.md#例-319)中我们跳过证明的那个定理。

**定理**

每个整数要么是偶数，要么是奇数。

**证明**

设 $n$ 是整数。我们按 $n$ 模 2 的余数分情况。

如果 $n \equiv 0 \pmod 2$，则 $n$ 是偶数，证毕。

如果 $n \equiv 1 \pmod 2$，则 $n$ 是奇数，证毕。

在 Lean 中，使用[例 4.2.3](#例-423)和[例 4.2.4](#例-424)中的引理 `Int.odd_iff_modEq` 和 `Int.even_iff_modEq`，以及 `mod_cases` 策略。我已写好开头。

```lean
example (n : ℤ) : Even n ∨ Odd n := by
  mod_cases hn : n % 2
  · left
    rw [Int.even_iff_modEq]
    apply hn
  · sorry
```

### 4.2.10. 练习

1. 设 $x$ 是实数。证明 $2x - 1 = 11$ 当且仅当 $x = 6$。

   ```lean
   example {x : ℝ} : 2 * x - 1 = 11 ↔ x = 6 := by
     sorry
   ```

2. 设 $n$ 是整数。证明 63 是 $n$ 的因子当且仅当 7 和 9 都是。

   ```lean
   example {n : ℤ} : 63 ∣ n ↔ 7 ∣ n ∧ 9 ∣ n := by
     sorry
   ```

3. 设 $a$ 和 $n$ 是整数。证明 $a$ 是 $n$ 的倍数当且仅当 $a \equiv 0 \pmod n$。

   ```lean
   theorem dvd_iff_modEq {a n : ℤ} : n ∣ a ↔ a ≡ 0 [ZMOD n] := by
     sorry
   ```

4. 设 $a$ 和 $b$ 是整数且 $a \mid b$。证明 $a \mid 2b^3 - b^2 + 3b$。

   注意这已经在[3.2 节](03_Parity_and_Divisibility.md#32-整除性)的练习中出现过。但现在，使用上一题证明的引理 `Int.dvd_iff_modEq`，这类问题变得容易得多。

   ```lean
   example {a b : ℤ} (hab : a ∣ b) : a ∣ 2 * b ^ 3 - b ^ 2 + 3 * b := by
     sorry
   ```

5. 设 $k$ 是自然数。证明 $k^2 \le 6$ 当且仅当 $k$ 是 0、1 或 2。

   ```lean
   example {k : ℕ} : k ^ 2 ≤ 6 ↔ k = 0 ∨ k = 1 ∨ k = 2 := by
     sorry
   ```

## 4.3. “存在唯一”

### 4.3.1. 例

**问题**

证明存在唯一的实数 $a$，使得 $3a + 1 = 7$。

**解法**

我们证明 2 是具有这个性质的唯一实数。

首先，证明 2 具有这个性质。事实上，$3 \cdot 2 + 1 = 7$。

现在，设 $y$ 是满足 $3y + 1 = 7$ 的实数。则

$$
\begin{split} y &= \frac{(3y + 1) - 1}{3} \\ &= \frac{7 - 1}{3} \\ &= 2. \end{split}
$$

```lean
example : ∃! a : ℝ, 3 * a + 1 = 7 := by
  use 2
  dsimp
  constructor
  · numbers
  intro y hy
  calc
    y = (3 * y + 1 - 1) / 3 := by ring
    _ = (7 - 1) / 3 := by rw [hy]
    _ = 2 := by numbers
```

### 4.3.2. 例

**问题**

证明存在唯一的有理数 $x$，使得对每个介于 1 和 3 之间的有理数 $a$，都有 $(a - x)^2 \le 1$。

**解法**

我们证明 2 是具有这个性质的唯一有理数。

首先，如果 $a$ 是介于 1 和 3 之间的有理数，则 $-1 \le a - 2 \le 1$，所以根据[例 2.1.7](02_Proofs_with_Structure.md#例-217)（在 Lean 中结果为 `sq_le_sq'`），

$$
\begin{split} (a - 2)^2 &\le 1^2 \\ &= 1. \end{split}
$$

现在，设 $y$ 是有理数，使得对每个介于 1 和 3 之间的有理数 $a$，都有 $(a - y)^2 \le 1$。

由于 1 介于 1 和 3 之间，有 $(1 - y)^2 \le 1$；由于 3 也介于 1 和 3 之间，有 $(3 - y)^2 \le 1$。

所以

$$
\begin{split} (y - 2)^2 &= \frac{(1 - y)^2 + (3 - y)^2 - 2}{2} \\ &\le \frac{1 + 1 - 2}{2} \\ &= 0. \end{split}
$$

又 $(y - 2)^2 \ge 0$，因为平方非负。于是 $(y - 2)^2 = 0$，所以 $y - 2 = 0$，即 $y = 2$。

```lean
example : ∃! x : ℚ, ∀ a, a ≥ 1 → a ≤ 3 → (a - x) ^ 2 ≤ 1 := by
  sorry
```

### 4.3.3. 例

**问题**

设 $x$ 是有理数，假设存在唯一的有理数 $a$ 使得 $a^2 = x$。证明 $x = 0$。

更通俗地说：唯一具有唯一平方根的有理数是 0。

**解法**

我们先证明 $-a = a$。事实上，

$$
\begin{split} (-a)^2 &= a^2 \\ &= x, \end{split}
$$

且由于 $a$ 是唯一满足 $a^2 = x$ 的有理数，这意味着 $-a = a$。

于是

$$
\begin{split} a &= \frac{a - (-a)}{2} \\ &= \frac{a - a}{2} \\ &= 0. \end{split}
$$

所以 $x = 0$ 也成立：

$$
\begin{split} x &= a^2 \\ &= 0^2 \\ &= 0. \end{split}
$$

```lean
example {x : ℚ} (hx : ∃! a : ℚ, a ^ 2 = x) : x = 0 := by
  obtain ⟨a, ha1, ha2⟩ := hx
  have h1 : -a = a
  · apply ha2
    calc
      (-a) ^ 2 = a ^ 2 := by ring
      _ = x := ha1
  have h2 :=
    calc
      a = (a - -a) / 2 := by ring
      _ = (a - a) / 2 := by rw [h1]
      _ = 0 := by ring
  calc
    x = a ^ 2 := by rw [ha1]
    _ = 0 ^ 2 := by rw [h2]
    _ = 0 := by ring
```

### 4.3.4. 例

下列是关于整数的一个重要定理，我们将在本书后面[6.6 节](06_Induction.md#66-除法算法)的练习中证明它。

**定理（带余除法）**

设 $a$、$b$ 是整数，$b$ 为正。则存在唯一的整数 $r$，满足 $0 \le r < b$ 且 $a \equiv r \pmod b$。

这个引理使我们能够按模 $b$ 的同余类分情况讨论（Lean 中的 `mod_cases` 策略）。但它实际上更强大，因为陈述中的“唯一性”部分提供了额外信息。

在 Lean 库中，它以下列形式可用：

```lean
lemma Int.existsUnique_modEq_lt (a b : ℤ) (h : 0 < b) :
  ∃! r : ℤ, 0 ≤ r ∧ r < b ∧ a ≡ r [ZMOD b] :=
```

为了更好地理解这个定理，让我们证明它的无穷多个特例中的一个。

**问题**

证明存在唯一的整数 $r$，使得 $0 \le r < 5$ 且 $14 \equiv r \pmod 5$。

**解法**

我们证明具有这个性质的唯一整数是 4。

首先，证明 4 具有这个性质。显然 $0 \le 4 < 5$，且由于 $14 - 4 = 5 \cdot 2$，所以 $14 \equiv r \pmod 5$。

现在，设 $r$ 是满足 $0 \le r < 5$ 且 $14 \equiv r \pmod 5$ 的整数。则存在整数 $q$ 使得 $14 - r = 5q$。

我们有

$$
\begin{split} 5 &\cdot 1 < 14 - r \\ &= 5q, \end{split}
$$

所以由于 5 是正数，$1 < q$。类似地，

$$
\begin{split} 5q &= 14 - r \\ &< 5 \cdot 3, \end{split}
$$

所以 $q < 3$。

因此 $q$ 必为 2，即唯一严格介于 1 和 3 之间的整数。所以 $r = 14 - 5 \cdot 2 = 4$。

```lean
example : ∃! r : ℤ, 0 ≤ r ∧ r < 5 ∧ 14 ≡ r [ZMOD 5] := by
  use 4
  dsimp
  constructor
  · constructor
    · numbers
    constructor
    · numbers
    use 2
    numbers
  intro r hr
  obtain ⟨hr1, hr2, q, hr3⟩ := hr
  have :=
    calc
      5 * 1 < 14 - r := by addarith [hr2]
      _ = 5 * q := by rw [hr3]
  cancel 5 at this
  have :=
    calc
      5 * q = 14 - r := by rw [hr3]
      _ < 5 * 3 := by addarith [hr1]
  cancel 5 at this
  interval_cases q
  addarith [hr3]
```

### 4.3.5. 练习

1. 证明存在唯一的有理数 $x$，使得 $4x - 3 = 9$。

   ```lean
   example : ∃! x : ℚ, 4 * x - 3 = 9 := by
     sorry
   ```

2. 证明存在唯一的自然数 $n$，使得对所有自然数 $a$ 都有 $n \le a$。

   ```lean
   example : ∃! n : ℕ, ∀ a, n ≤ a := by
     sorry
   ```

3. 证明存在唯一的整数 $r$，使得 $0 \le r < 3$ 且 $11 \equiv r \pmod 3$。

   ```lean
   example : ∃! r : ℤ, 0 ≤ r ∧ r < 3 ∧ 11 ≡ r [ZMOD 3] := by
     sorry
   ```

## 4.4. 矛盾的假设

### 4.4.1. 例

有时，我们会遇到两个矛盾假设的情形。此时无需再证明任何东西。两个矛盾的假设意味着我们所假设的情形实际上不可能发生。

在用分情况证明时很常见：你可能把问题归结为若干情形，在某些情形中证明目标，并证明其他情形不可能。

下面是一个这类推理的例子。我故意写得很学究，以便把观点说清楚。

**引理**

设 $x$、$y$ 是实数，假设 $0 < xy$ 且 $0 \le x$。证明 $0 < y$。

我们以前多次用过这个事实——它是 `cancel` 策略所依赖的事实之一。

**证明**

我们分两种情况，取决于 $y$ 是否为正。

**情形 1**（$y \le 0$）：由于 $0 \le x$，有

$$
\begin{split} 0 &= x \cdot 0 \\ &\ge xy, \end{split}
$$

所以 $0 < xy$ 不成立。这与假设 $0 < xy$ 矛盾，因此这种情形不可能发生。

**情形 2**（$0 < y$）：这正是我们要证明的，证毕。

在 Lean 中，`contradiction` 策略通过指出两个矛盾假设来结束（部分）证明。在下面的 Lean 翻译中，注意使用它之前的目标状态是

```
y x : ℝ
h : 0 < x * y
hx : 0 ≤ x
hneg : y ≤ 0
this : ¬0 < x * y
⊢ 0 < y
```

其中包含矛盾假设 `h : 0 < x * y` 和 `this : ¬0 < x * y`。（记住 `¬` 是“非”的逻辑符号。如果你不给假设命名，Lean 会把它标为 `this`。）

```lean
example {y : ℝ} (x : ℝ) (h : 0 < x * y) (hx : 0 ≤ x) : 0 < y := by
  obtain hneg | hpos : y ≤ 0 ∨ 0 < y := le_or_lt y 0
  · -- the case `y ≤ 0`
    have : ¬0 < x * y
    · apply not_lt_of_ge
      calc
        0 = x * 0 := by ring
        _ ≥ x * y := by rel [hneg]
    contradiction
  · -- the case `0 < y`
    apply hpos
```

### 4.4.2. 例

得到矛盾的一种非常常见的方式是证明假设蕴涵某个“显然错误”的数值事实，其错误性可用 `numbers` 检查。

**问题**

设 $t$ 是小于 3 的整数，假设 $t - 1 = 6$。证明 $t = 13$。

**解法**

我们有

$$
\begin{split} 7 &= t \\ &< 3. \end{split}
$$

但显然 $7 < 3$ 不成立，矛盾。所以任何结论（包括 $t = 13$）都成立。

你可以像前面的例子一样，在 Lean 中直接用 `contradiction` 策略写出这个证明：

```lean
example {t : ℤ} (h2 : t < 3) (h : t - 1 = 6) : t = 13 := by
  have H :=
  calc
    7 = t := by addarith [h]
    _ < 3 := h2
  have : ¬(7 : ℤ) < 3 := by numbers
  contradiction
```

但这个模式足够常见，在 Lean 中有简写。如果 `H` 是一个假设，其否定可以用 `numbers` 证明，那么写 `numbers at H` 就会关闭目标。

```lean
example {t : ℤ} (h2 : t < 3) (h : t - 1 = 6) : t = 13 := by
  have H :=
  calc
    7 = t := by addarith [h]
    _ < 3 := h2
  numbers at H -- this is a contradiction!
```

### 4.4.3. 例

**问题**

证明如果 $n^2 + n + 1 \equiv 1 \pmod 3$，则 $n \equiv 0 \pmod 3$ 或 $n \equiv 2 \pmod 3$。

**解法**

我们按 $n$ 模 3 的余数分情况。如果 $n \equiv 0 \pmod 3$ 或 $n \equiv 2 \pmod 3$，则证毕。否则，$n \equiv 1 \pmod 3$，所以

$$
\begin{split} 0 &\equiv 0 + 3 \cdot 1 \pmod 3 \\ &= 1^2 + 1 + 1 \\ &\equiv n^2 + n + 1 \pmod 3 \\ &\equiv 1 \pmod 3, \end{split}
$$

矛盾。

注意在上面的证明中，我们做了一些额外工作来得到矛盾的 $0 \equiv 1 \pmod 3$，而不是更容易得到的 $3 \equiv 1 \pmod 3$：

$$
\begin{split} 3 &= 1^2 + 1 + 1 \\ &\equiv \ldots \end{split}
$$

就本书而言，我们只把 $0 \le i < n$ 且 $0 \le j < n$ 的同余 $i \equiv j \pmod n$ 视为“显然真/假”。我们要求涉及更大数字的同余必须显式地对 $n$ 取模，如这里我们把 $3 = 1^2 + 1 + 1$ 对 3 取模化为 $0 + 3 \cdot 1$，从而化为 $0$。

其数学依据是[例 4.3.4](#例-434)中讨论的唯一性引理 `Int.existsUnique_modEq_lt`。

```lean
example (n : ℤ) (hn : n ^ 2 + n + 1 ≡ 1 [ZMOD 3]) :
    n ≡ 0 [ZMOD 3] ∨ n ≡ 2 [ZMOD 3] := by
  mod_cases h : n % 3
  · -- case 1: `n ≡ 0 [ZMOD 3]`
    left
    apply h
  · -- case 2: `n ≡ 1 [ZMOD 3]`
    have H :=
      calc 0 ≡ 0 + 3 * 1 [ZMOD 3] := by extra
      _ = 1 ^ 2 + 1 + 1 := by numbers
      _ ≡ n ^ 2 + n + 1 [ZMOD 3] := by rel [h]
      _ ≡ 1 [ZMOD 3] := hn
    numbers at H -- contradiction!
  · -- case 3: `n ≡ 2 [ZMOD 3]`
    right
    apply h
```

### 4.4.4. 例

我们在[例 4.1.8](#例-418)中定义了素数，并证明了 2 是素数。现在来证明定义的稍强形式，它在证明其他数是素数时会很方便。

**引理**

设 $p \ge 2$ 是自然数。假设对所有满足 $1 < m < p$ 的自然数 $m$，$m$ 都不是 $p$ 的因子。证明 $p$ 是素数。

**证明**

由于已知 $2 \le p$，剩下只需证明“素数”定义的第二部分：设 $m$ 是 $p$ 的因子（$\star$）；我们必须证明 $m = 1$ 或 $m = p$。

由于 $m$ 是 $p$ 的因子，有 $1 \le m$。所以要么 $m = 1$，要么 $1 < m$；我们相应地分情况。

**情形 1**（$m = 1$）：这直接给出目标 $m = 1$ 或 $m = p$。

**情形 2**（$1 < m$）：由于 $m$ 是 $p$ 的因子，有 $m \le p$。所以要么 $m = p$，要么 $m < p$；我们再分情况。

**情形 2(i)**（$m = p$）：这直接给出目标 $m = 1$ 或 $m = p$。

**情形 2(ii)**（$m < p$）：我们现在已经确立了 $1 < m < p$，而根据题设条件，这意味着 $m$ 不是 $p$ 的因子。这与前面的陈述（$\star$）矛盾。

我在 Lean 中已填好大约一半证明；请补全其余部分，包括最后的矛盾。如果你需要查找因子大小界的 Lean 名称，它们已在[例 3.2.7](03_Parity_and_Divisibility.md#例-327)和[例 3.2.8](03_Parity_and_Divisibility.md#例-328)中证明。

```lean
example {p : ℕ} (hp : 2 ≤ p) (H : ∀ m : ℕ, 1 < m → m < p → ¬m ∣ p) : Prime p := by
  constructor
  · apply hp -- show that `2 ≤ p`
  intro m hmp
  have hp' : 0 < p := by extra
  have h1m : 1 ≤ m := Nat.pos_of_dvd_of_pos hmp hp'
  obtain hm | hm_left : 1 = m ∨ 1 < m := eq_or_lt_of_le h1m
  · -- the case `m = 1`
    left
    addarith [hm]
  -- the case `1 < m`
  sorry
```

我们以 Lean 名 `prime_test` 记录此引理供以后使用。

下面是一个使用该素数检验引理的例子。

**问题**

证明 5 是素数。

**解法**

显然 $2 \le 5$。设 $m$ 是满足 $1 < m < 5$ 的自然数。我们要证明 5 不是 $m$ 的倍数。有三种情形要检查：

**情形 1**（$m = 2$）：由于 5 介于 2 的连续倍数 $2 \cdot 2$ 和 $2 \cdot 3$ 之间，它不是 2 的倍数。

**情形 2**（$m = 3$）：由于 5 介于 3 的连续倍数 $3 \cdot 1$ 和 $3 \cdot 2$ 之间，它不是 3 的倍数。

**情形 3**（$m = 4$）：由于 5 介于 4 的连续倍数 $4 \cdot 1$ 和 $4 \cdot 2$ 之间，它不是 4 的倍数。

```lean
example : Prime 5 := by
  apply prime_test
  · numbers
  intro m hm_left hm_right
  apply Nat.not_dvd_of_exists_lt_and_lt
  interval_cases m
  · use 2
    constructor <;> numbers
  · use 1
    constructor <;> numbers
  · use 1
    constructor <;> numbers
```

这里 `constructor <;> numbers` 是

```lean
constructor
· numbers
· numbers
```

的简写。更一般地，`<;>` 连接两个策略，把第二个策略应用于第一个策略所产生的每个目标。

### 4.4.5. 例

这里有一个更难的例子，有很多情形。

**问题**

设 $a$、$b$、$c$ 是满足 $a^2 + b^2 = c^2$ 的正自然数。证明 $3 \le a$。

满足这个方程的三个数称为**勾股数**，因为根据勾股定理，这意味着它们构成直角三角形的三条边。自然数 3、4、5 满足这个方程：$3^2 + 4^2 = 5^2$。还有其他解，如 5、12、13，但我们在本题中要证明 3、4、5 是最小解。

**解法**

要么 $a \le 2$，要么 $3 \le a$。如果 $3 \le a$ 则证毕。我们将证明若 $a \le 2$ 会导出矛盾。

要么 $b \le 1$，要么 $2 \le b$。我们分别考虑这两种情形。

**情形 1**（$b \le 1$）：

我们有

$$
\begin{split} c^2 &= a^2 + b^2 \\ &\le 2^2 + 1^2 \\ &< 3^2. \end{split}
$$

这意味着 $c < 3$。我们现在有上界 $a \le 2$、$b \le 1$、$c < 3$，所以 $a$ 是 1 或 2，$b$ 是 1，$c$ 是 1 或 2。我们可以分析所有这些情形并检查它们不成立：

$$
\begin{split} 1^2 + 1^2 &\ne 1^2, \\ 2^2 + 1^2 &\ne 1^2, \\ 1^2 + 1^2 &\ne 2^2, \\ 2^2 + 1^2 &\ne 2^2. \end{split}
$$

**情形 2**（$2 \le b$）：

我们有

$$
\begin{split} b^2 &< a^2 + b^2 \\ &= c^2, \end{split}
$$

所以 $b < c$，所以 $b + 1 \le c$。但又有

$$
\begin{split} c^2 &= a^2 + b^2 \\ &\le 2^2 + b^2 \\ &= b^2 + 2 \cdot 2 \\ &\le b^2 + 2b \\ &< b^2 + 2b + 1 \\ &= (b + 1)^2, \end{split}
$$

所以 $c < b + 1$，所以 $b + 1 \le c$ 不成立。这两个事实互相矛盾。

请在 Lean 中写出这个证明。它会很长；我的版本有 27 行。

```lean
example {a b c : ℕ} (ha : 0 < a) (hb : 0 < b) (hc : 0 < c)
    (h_pyth : a ^ 2 + b ^ 2 = c ^ 2) : 3 ≤ a := by
  sorry
```

### 4.4.6. 练习

1. 设 $x$、$y$ 是实数，$x$ 非负，$n$ 是正自然数。证明如果 $y^n \le x^n$ 则 $y \le x$。

   我们以前用过这个事实；它是 `cancel` 策略所依赖的另一个引理。

   ```lean
   example {x y : ℝ} (n : ℕ) (hx : 0 ≤ x) (hn : 0 < n) (h : y ^ n ≤ x ^ n) :
       y ≤ x := by
     sorry
   ```

2. 证明如果 $n^2 \equiv 4 \pmod 5$ 则 $n \equiv 2 \pmod 5$ 或 $n \equiv 3 \pmod 5$。

   ```lean
   example (n : ℤ) (hn : n ^ 2 ≡ 4 [ZMOD 5]) : n ≡ 2 [ZMOD 5] ∨ n ≡ 3 [ZMOD 5] := by
     sorry
   ```

3. 证明 7 是素数。

   ```lean
   example : Prime 7 := by
     sorry
   ```

4. 用本节思想给出[2.1 节](02_Proofs_with_Structure.md#21-策略模式)练习中一个问题的不同证明：设 $x$ 是平方为 4 且大于 1 的有理数。证明 $x = 2$。

   不使用 `cancel` 策略，而是用本节思想直接证明：分两种情况，然后排除其中一种。（你会发现推导数值矛盾很方便。）

   ```lean
   example {x : ℚ} (h1 : x ^ 2 = 4) (h2 : 1 < x) : x = 2 := by
     have h3 :=
       calc
         (x + 2) * (x - 2) = x ^ 2 + 2 * x - 2 * x - 4 := by ring
         _ = 0 := by addarith [h1]
     rw [mul_eq_zero] at h3
     sorry
   ```

5. 证明素数要么是 2，要么是奇数。

   ```lean
   example (p : ℕ) (h : Prime p) : p = 2 ∨ Odd p := by
     sorry
   ```

## 4.5. 反证法

### 4.5.1. 例

**问题**

证明并非对所有实数 $x$ 都有 $x^2 \ge x$。

**解法**

假设对所有实数 $x$ 都有 $x^2 \ge x$。那么特别地 $0.5^2 \ge 0.5$，但这是假的，矛盾。

```lean
example : ¬ (∀ x : ℝ, x ^ 2 ≥ x) := by
  intro h
  have : 0.5 ^ 2 ≥ 0.5 := h 0.5
  numbers at this
```

### 4.5.2. 例

**问题**

证明 13 不是 3 的倍数。

过去我们用 `Nat.not_dvd_of_exists_lt_and_lt` 定理来建立不可整除性。但现在我们终于有了从头做这件事的工具。

**解法**

假设 13 是 3 的倍数。则存在自然数 $k$ 使得 $13 = 3k$。

情形 1，$k \le 4$：则

$$
\begin{split} 13 &= 3k \\ &\le 3 \cdot 4, \end{split}
$$

矛盾。

情形 2，$k \ge 5$：则

$$
\begin{split} 13 &= 3k \\ &\ge 3 \cdot 5, \end{split}
$$

矛盾。

```lean
example : ¬ 3 ∣ 13 := by
  intro H
  obtain ⟨k, hk⟩ := H
  obtain h4 | h5 := le_or_succ_le k 4
  · have h :=
    calc 13 = 3 * k := hk
      _ ≤ 3 * 4 := by rel [h4]
    numbers at h
  · sorry
```

### 4.5.3. 例

**问题**

设 $x$、$y$ 是实数且 $x + y = 0$。证明 $x$ 和 $y$ 不可能同时为正。

**解法**

假设 $x$ 和 $y$ 都为正。则

$$
\begin{split} 0 &= x + y \\ &> 0, \end{split}
$$

矛盾。

```lean
example {x y : ℝ} (h : x + y = 0) : ¬(x > 0 ∧ y > 0) := by
  intro h
  obtain ⟨hx, hy⟩ := h
  have H :=
  calc 0 = x + y := by rw [h]
    _ > 0 := by extra
  numbers at H
```

### 4.5.4. 例

**问题**

证明不存在自然数 $n$ 使得 $n^2 = 2$。

（与[例 2.3.2](02_Proofs_with_Structure.md#例-232)比较。）

**解法**

假设某个整数 $n$ 满足 $n^2 = 2$。

情形 1，$n \le 1$：则

$$
\begin{split} 2 &= n^2 \\ &\le 1^2, \end{split}
$$

矛盾。

情形 2，$n \ge 2$：则

$$
\begin{split} 2 &= n^2 \\ &\ge 2^2, \end{split}
$$

矛盾。

```lean
example : ¬ (∃ n : ℕ, n ^ 2 = 2) := by
  sorry
```

### 4.5.5. 例

**引理**

证明整数 $n$ 是偶数当且仅当它不是奇数。

**证明**

首先，设 $n$ 是偶数，并假设它也是奇数。则 $n \equiv 0 \pmod 2$ 但又 $n \equiv 1 \pmod 2$。所以

$$
\begin{split} 0 &\equiv n \pmod 2 \\ &\equiv 1 \pmod 2, \end{split}
$$

矛盾。

现在，设 $n$ 不是奇数。由于 $n$ 要么是偶数要么是奇数，所以它是偶数。

我们以 Lean 名 `Int.even_iff_not_odd` 记录此结果供以后使用。

```lean
example (n : ℤ) : Int.Even n ↔ ¬ Int.Odd n := by
  constructor
  · intro h1 h2
    rw [Int.even_iff_modEq] at h1
    rw [Int.odd_iff_modEq] at h2
    have h :=
    calc 0 ≡ n [ZMOD 2] := by rel [h1]
      _ ≡ 1 [ZMOD 2] := by rel [h2]
    numbers at h -- contradiction!
  · intro h
    obtain h1 | h2 := Int.even_or_odd n
    · apply h1
    · contradiction
```

现在重复上述过程来刻画“非偶数”。

**引理**

证明整数 $n$ 是奇数当且仅当它不是偶数。

```lean
example (n : ℤ) : Int.Odd n ↔ ¬ Int.Even n := by
  sorry
```

### 4.5.6. 例

**问题**

设 $n$ 是整数。证明 $n^2 \not\equiv 2 \pmod 3$。

**解法**

假设 $n^2 \equiv 2 \pmod 3$。我们按 $n$ 模 3 的余数分情况。

如果 $n \equiv 0 \pmod 3$，则

$$
\begin{split} 0 &= 0^2 \\ &\equiv n^2 \pmod 3 \\ &\equiv 2 \pmod 3, \end{split}
$$

矛盾。

如果 $n \equiv 1 \pmod 3$，则

$$
\begin{split} 1 &= 1^2 \\ &\equiv n^2 \pmod 3 \\ &\equiv 2 \pmod 3, \end{split}
$$

矛盾。

最后，如果 $n \equiv 2 \pmod 3$，则

$$
\begin{split} 1 &\equiv 1 + 3 \cdot 1 \pmod 3 \\ &= 2^2 \\ &\equiv n^2 \pmod 3 \\ &\equiv 2 \pmod 3, \end{split}
$$

矛盾。

```lean
example (n : ℤ) : ¬(n ^ 2 ≡ 2 [ZMOD 3]) := by
  intro h
  mod_cases hn : n % 3
  · have h :=
    calc (0:ℤ) = 0 ^ 2 := by numbers
      _ ≡ n ^ 2 [ZMOD 3] := by rel [hn]
      _ ≡ 2 [ZMOD 3] := h
    numbers at h -- contradiction!
  · have h :=
    calc (1:ℤ) = 1 ^ 2 := by numbers
      _ ≡ n ^ 2 [ZMOD 3] := by rel [hn]
      _ ≡ 2 [ZMOD 3] := h
    numbers at h -- contradiction!
  · have h :=
    calc (1:ℤ) ≡ 1 + 3 * 1 [ZMOD 3] := by extra
      _ = 2 ^ 2 := by numbers
      _ ≡ n ^ 2 [ZMOD 3] := by rel [hn]
      _ ≡ 2 [ZMOD 3] := h
    numbers at h -- contradiction!
```

### 4.5.7. 例

**引理**

设 $p$ 是自然数。证明 $p$ 不是素数当且仅当存在自然数 $a$ 和 $b$，满足 $1 < a < p$、$1 < b < p$ 且 $p = ab$。

**证明**

首先，假设 $p$ 不是素数。根据素数定义，存在自然数 $m$ 使得 $m \mid p$ 且 $m \ne 1$、$m \ne p$。由于 $m \mid p$，存在自然数 $k$ 使得 $p = mk$。取 $a = m$，$b = k$，则 $p = ab$。我们只需验证 $1 < a < p$ 且 $1 < b < p$。

由于 $m \ne 1$ 且 $m \mid p$，有 $1 \le m$ 且 $m \ne 1$，所以 $1 < m = a$。又由于 $m \ne p$ 且 $m \mid p$，有 $m \le p$ 且 $m \ne p$，所以 $m < p$，即 $a < p$。

同理，由于 $p = ab$ 且 $a > 1$，有 $b = p/a < p$。又 $b$ 是自然数且 $p = ab$，$b = 1$ 将意味着 $a = p$，矛盾。所以 $b > 1$。

反过来，假设存在自然数 $a$、$b$ 满足 $1 < a < p$、$1 < b < p$ 且 $p = ab$。则 $a \mid p$ 但 $a \ne 1$、$a \ne p$。根据素数定义，$p$ 不是素数。

```lean
example (p : ℕ) : ¬ Prime p ↔ ∃ a b : ℕ, 1 < a ∧ a < p ∧ 1 < b ∧ b < p ∧ p = a * b := by
  constructor
  · intro hp
    rw [Nat.prime_def_lt] at hp
    push_neg at hp
    obtain ⟨m, hm1, hm2, hm3⟩ := hp
    have hmp : m ∣ p := hm1
    obtain ⟨k, hk⟩ := hmp
    use m, k
    constructor
    · -- show `1 < m`
      by_contra h
      push_neg at h
      have : m = 1 := by linarith
      contradiction
    constructor
    · -- show `m < p`
      apply hm3
    constructor
    · -- show `1 < k`
      by_contra h
      push_neg at h
      have : k = 1 := by linarith
      have : p = m := by
        rw [hk, this]
        ring
      linarith [hm3, this]
    constructor
    · -- show `k < p`
      nlinarith [hk, hm2]
    · -- show `p = m * k`
      rw [hk]
  · intro h
    obtain ⟨a, b, ha1, ha2, hb1, hb2, hpab⟩ := h
    rw [Nat.prime_def_lt]
    push_neg
    use a
    constructor
    · -- show `a ∣ p`
      use b
      rw [hpab]
    constructor
    · -- show `1 < a`
      apply ha1
    constructor
    · -- show `a < p`
      apply ha2
    · -- show `a ≠ p`
      linarith
```

### 4.5.8. 练习

1. 证明并非每个整数都是正的。

   ```lean
   example : ¬ (∀ n : ℤ, n > 0) := by
     sorry
   ```

2. 证明不存在实数 $x$ 使得对所有实数 $y$ 都有 $x \le y$ 且 $y \le x$。

   等等，重新表述：存在这样的 $x$ 吗？那 $x = y$ 时呢？这个陈述需要更仔细地阅读：它说存在某个特定的 $x$，使得对所有 $y$ 都有 $x \le y$ 且 $y \le x$。如果取 $y = x + 1$，则 $x \le x + 1$ 成立但 $x + 1 \le x$ 不成立。所以不存在这样的 $x$。

   ```lean
   example : ¬ (∃ x : ℝ, ∀ y : ℝ, x ≤ y ∧ y ≤ x) := by
     sorry
   ```

3. 设 $a$ 是整数。证明 $a$ 不是偶数当且仅当 $a$ 是奇数。

   这在[例 4.5.5](#例-455)中已证明，只是方向互换。

   ```lean
   example (a : ℤ) : ¬ Int.Even a ↔ Int.Odd a := by
     sorry
   ```

4. 证明不存在整数 $n$ 使得 $n^2 \equiv 3 \pmod 4$。

   ```lean
   example : ¬ (∃ n : ℤ, n ^ 2 ≡ 3 [ZMOD 4]) := by
     sorry
   ```

5. 设 $a$、$b$ 是实数，$a$ 非零。证明方程 $ax + b = 0$ 有唯一解。

   ```lean
   example {a b : ℝ} (ha : a ≠ 0) : ∃! x : ℝ, a * x + b = 0 := by
     sorry
   ```

6. 证明如果 $n$ 是整数，则 $n^2 \not\equiv 2 \pmod 4$ 且 $n^2 \not\equiv 3 \pmod 4$。

   ```lean
   example (n : ℤ) : ¬(n ^ 2 ≡ 2 [ZMOD 4]) ∧ ¬(n ^ 2 ≡ 3 [ZMOD 4]) := by
     sorry
   ```

7. 证明如果 $p$ 是素数且 $p \ge 5$，则 $p \equiv 1 \pmod 6$ 或 $p \equiv 5 \pmod 6$。

   ```lean
   example {p : ℕ} (hp : Prime p) (hp2 : p ≥ 5) :
       p ≡ 1 [ZMOD 6] ∨ p ≡ 5 [ZMOD 6] := by
     sorry
   ```

