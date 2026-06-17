# 第 6 章 归纳法

> 本译文对应原书 [Induction](https://hrmacbeth.github.io/math2001/06_Induction.html)；英文 Sphinx 源：`06_Induction.rst`。

本章介绍**归纳法**，一种适用于自然数以及其他离散类型（如整数或自然数对）的证明方法。我们还将介绍**递归**，一种定义数列（更一般地，从离散类型到某类型的函数）的方法；归纳法是证明关于递归定义对象的结果的标准方法。

在[6.1 节](#61-归纳法)到[6.3 节](#63-两步归纳)中，我们只使用最传统的归纳形式：通过把自然数 $n$ 的结果与 $n-1$ 的结果联系起来完成证明，以及这种形式的小变体。在[6.4 节](#64-强归纳)到[6.7 节](#67-欧几里得算法)中，我们介绍**强归纳法**，甚至更一般的**良基归纳法**。这些归纳原理更加灵活。

## 6.1. 归纳法

### 6.1.1. 例

**问题**

设 $n$ 是自然数。证明 $2^n \ge n + 1$。

**解法**

我们对 $n$ 用归纳法证明。基础情形 $2^0 \ge 0 + 1$ 显然成立。

现在假设对某个自然数 $k$，有 $2^k \ge k + 1$ 成立。则

$$
\begin{split} 2^{k+1} &= 2 \cdot 2^k \\ &\ge 2(k+1) \\ &= (k+1+1) + k \\ &\ge k+1+1. \end{split}
$$

在 Lean 中，`simple_induction` 策略会自动设置归纳证明。在写出 `simple_induction n with k IH` 之前，目标状态只有一个目标；使用该策略后，目标状态会分裂成两个目标：一个对应基础情形，一个对应归纳步骤。

```
⊢ 2 ^ 0 ≥ 0 + 1

k : ℕ
IH : 2 ^ k ≥ k + 1
⊢ 2 ^ (k + 1) ≥ k + 1 + 1
```

下面是完整的 Lean 证明。

```lean
example (n : ℕ) : 2 ^ n ≥ n + 1 := by
  simple_induction n with k IH
  · -- base case
    numbers
  · -- inductive step
    calc 2 ^ (k + 1) = 2 * 2 ^ k := by ring
      _ ≥ 2 * (k + 1) := by rel [IH]
      _ = (k + 1 + 1) + k := by ring
      _ ≥ k + 1 + 1 := by extra
```

### 6.1.2. 例

**定理**

设 $n$ 是自然数。则 $n$ 要么是偶数，要么是奇数。

（可与[例 3.1.9](03_Parity_and_Divisibility.md#例-319)、[例 4.2.9](04_Proofs_with_Structure_II.md#例-429)比较。）

**证明**

我们对 $n$ 用归纳法证明。

基础情形需要证明 0 是偶数或奇数。我们证明它是偶数。事实上，$0 = 2 \cdot 0$。

现在假设对某个自然数 $k$，$k$ 是偶数或奇数。

**情形 1**（$k$ 是偶数）：则存在整数 $x$ 使得 $k = 2x$，于是 $k + 1 = 2x + 1$，所以 $k + 1$ 是奇数。

**情形 2**（$k$ 是奇数）：则存在整数 $x$ 使得 $k = 2x + 1$，且

$$
\begin{split} k + 1 &= (2x + 1) + 1 \\ &= 2(x + 1), \end{split}
$$

所以 $k + 1$ 是偶数。

下面是该论证在 Lean 中的框架。请补全 `sorry`。

```lean
example (n : ℕ) : Even n ∨ Odd n := by
  simple_induction n with k IH
  · -- base case
    sorry
  · -- inductive step
    obtain ⟨x, hx⟩ | ⟨x, hx⟩ := IH
    · sorry
    · sorry
```

### 6.1.3. 例

**定理**

设 $a$、$b$、$d$ 是整数，且 $a \equiv b \pmod d$。设 $n$ 是自然数。则 $a^n \equiv b^n \pmod d$。

这是模算术的幂法则，即引理 `Int.ModEq.pow`，我们在[例 3.3.9](03_Parity_and_Divisibility.md#例-339)中未加证明地陈述过。它是 `rel` 策略模算术能力的组成部分之一。

**证明**

我们对 $n$ 用归纳法证明。

首先，$a^0 - b^0 = d \cdot 0$，所以 $d \mid a^0 - b^0$，即 $a^0 \equiv b^0 \pmod d$。这是基础情形。

现在，设 $k$ 是自然数，并假设 $a^k \equiv b^k \pmod d$。则存在整数 $x$ 使得 $a^k - b^k = dx$。又由假设 $a \equiv b \pmod d$，所以存在整数 $y$ 使得 $a - b = dy$。于是

$$
\begin{split} a^{k+1} - b^{k+1} &= a(a^k - b^k) + b^k(a - b) \\ &= a(dx) + b^k(dy) \\ &= d(ax + b^k y), \end{split}
$$

所以 $d \mid a^{k+1} - b^{k+1}$，即 $a^{k+1} \equiv b^{k+1} \pmod d$。

请在 Lean 中写出这个证明。

```lean
example {a b d : ℤ} (h : a ≡ b [ZMOD d]) (n : ℕ) : a ^ n ≡ b ^ n [ZMOD d] := by
  sorry
```

### 6.1.4. 例

**问题**

设 $n$ 是自然数。证明 $4^n$ 模 15 同余于 1 或 4。

**解法**

我们对 $n$ 用归纳法证明。首先，$4^0 = 1$，所以 $4^0 \equiv 1 \pmod{15}$。

现在，设 $k$ 是自然数，并假设已知 $4^k$ 模 15 同余于 1 或 4。

**情形 1**（$4^k \equiv 1 \pmod{15}$）：则

$$
\begin{split} 4^{k+1} &= 4 \cdot 4^k \\ &\equiv 4 \cdot 1 \pmod{15} \\ &= 4. \end{split}
$$

**情形 2**（$4^k \equiv 4 \pmod{15}$）：则

$$
\begin{split} 4^{k+1} &= 4 \cdot 4^k \\ &\equiv 4 \cdot 4 \pmod{15} \\ &= 15 \cdot 1 + 1 \\ &\equiv 1 \pmod{15}. \end{split}
$$

```lean
example (n : ℕ) : 4 ^ n ≡ 1 [ZMOD 15] ∨ 4 ^ n ≡ 4 [ZMOD 15] := by
  simple_induction n with k IH
  · -- base case
    left
    numbers
  · -- inductive step
    obtain hk | hk := IH
    · right
      calc (4:ℤ) ^ (k + 1) = 4 * 4 ^ k := by ring
        _ ≡ 4 * 1 [ZMOD 15] := by rel [hk]
        _ = 4 := by numbers
    · left
      calc (4:ℤ) ^ (k + 1) = 4 * 4 ^ k := by ring
        _ ≡ 4 * 4 [ZMOD 15] := by rel [hk]
        _ = 15 * 1 + 1 := by numbers
        _ ≡ 1 [ZMOD 15] := by extra
```

### 6.1.5. 例

我们也可以使用归纳法来证明关于所有大于等于某个给定数的自然数的结果，只需从该数开始归纳。

**问题**

设 $n$ 是大于等于 2 的自然数。证明 $3^n \ge 2^n + 5$。

**解法**

我们对 $n$ 从 2 开始用归纳法证明。基础情形 $3^2 \ge 2^2 + 5$ 显然成立。

现在假设对某个自然数 $k$，有 $3^k \ge 2^k + 5$ 成立。则

$$
\begin{split} 3^{k+1} &= 2 \cdot 3^k + 3^k \\ &\ge 2(2^k + 5) + 3^k \\ &= 2^{k+1} + 5 + (5 + 3^k) \\ &\ge 2^{k+1} + 5. \end{split}
$$

在 Lean 中，`induction_from_starting_point` 策略用于设置从指定起点开始的归纳证明。

```lean
example {n : ℕ} (hn : 2 ≤ n) : (3:ℤ) ^ n ≥ 2 ^ n + 5 := by
  induction_from_starting_point n, hn with k hk IH
  · -- base case
    numbers
  · -- inductive step
    calc (3:ℤ) ^ (k + 1) = 2 * 3 ^ k + 3 ^ k := by ring
      _ ≥ 2 * (2 ^ k + 5) + 3 ^ k := by rel [IH]
      _ = 2 ^ (k + 1) + 5 + (5 + 3 ^ k) := by ring
      _ ≥ 2 ^ (k + 1) + 5 := by extra
```

### 6.1.6. 例

从非零起点开始的归纳法对“足够大”的问题特别有用。

**问题**

证明对所有足够大的自然数 $n$，有 $2^n \ge n^2$。

**解法**

我们证明这对所有自然数 $n \ge 4$ 成立。

我们对 $n$ 从 4 开始用归纳法证明。基础情形 $2^4 \ge 4^2$ 显然成立。

现在假设对某个自然数 $k \ge 4$，有 $2^k \ge k^2$ 成立。则

$$
\begin{split} 2^{k+1} &= 2 \cdot 2^k \\ &\ge 2k^2 \\ &= k^2 + k \cdot k \\ &\ge k^2 + 4k \\ &= k^2 + 2k + 2k \\ &\ge k^2 + 2k + 2 \cdot 4 \\ &= (k+1)^2 + 7 \\ &\ge (k+1)^2. \end{split}
$$

下面是该论证在 Lean 中的框架。请补全 `sorry`。

```lean
example : forall_sufficiently_large n : ℕ, 2 ^ n ≥ n ^ 2 := by
  dsimp
  use 4
  intro n hn
  induction_from_starting_point n, hn with k hk IH
  · -- base case
    sorry
  · -- inductive step
    sorry
```

### 6.1.7. 练习

1. 设 $n$ 是自然数。证明 $3^n \ge n^2 + n + 1$。

   ```lean
   example (n : ℕ) : 3 ^ n ≥ n ^ 2 + n + 1 := by
     sorry
   ```

2. 设 $a \ge -1$ 是实数，$n$ 是自然数。证明 $(1 + a)^n \ge 1 + na$。

   这一事实称为**伯努利不等式**（Bernoulli’s inequality）。

   ```lean
   example {a : ℝ} (ha : -1 ≤ a) (n : ℕ) : (1 + a) ^ n ≥ 1 + n * a := by
     sorry
   ```

3. 设 $n$ 是自然数。证明 $5^n$ 模 8 同余于 1 或 5。

   ```lean
   example (n : ℕ) : 5 ^ n ≡ 1 [ZMOD 8] ∨ 5 ^ n ≡ 5 [ZMOD 8] := by
     sorry
   ```

4. 设 $n$ 是自然数。证明 $6^n$ 模 7 同余于 1 或 6。

   ```lean
   example (n : ℕ) : 6 ^ n ≡ 1 [ZMOD 7] ∨ 6 ^ n ≡ 6 [ZMOD 7] := by
     sorry
   ```

5. 设 $n$ 是自然数。证明 $4^n$ 模 7 同余于 1、2 或 4。

   ```lean
   example (n : ℕ) :
       4 ^ n ≡ 1 [ZMOD 7] ∨ 4 ^ n ≡ 2 [ZMOD 7] ∨ 4 ^ n ≡ 4 [ZMOD 7] := by
     sorry
   ```

6. 证明对所有足够大的自然数 $n$，有 $3^n \ge 2^n + 100$。

   ```lean
   example : forall_sufficiently_large n : ℕ, (3:ℤ) ^ n ≥ 2 ^ n + 100 := by
     dsimp
     sorry
   ```

7. 证明对所有足够大的自然数 $n$，有 $2^n \ge n^2 + 4$。

   ```lean
   example : forall_sufficiently_large n : ℕ, 2 ^ n ≥ n ^ 2 + 4 := by
     dsimp
     sorry
   ```

8. 证明对所有足够大的自然数 $n$，有 $2^n \ge n^3$。

   ```lean
   example : forall_sufficiently_large n : ℕ, 2 ^ n ≥ n ^ 3 := by
     dsimp
     sorry
   ```

9. 设 $a$ 是奇自然数。用归纳法证明对所有自然数 $n$，$a^n$ 都是奇数。

   进而推出：对所有自然数 $a$ 和 $n$，如果 $a^n$ 是偶数，则 $a$ 是偶数。（这部分不是归纳问题。）

   ```lean
   theorem Odd.pow {a : ℕ} (ha : Odd a) (n : ℕ) : Odd (a ^ n) := by
     sorry

   theorem Nat.even_of_pow_even {a n : ℕ} (ha : Even (a ^ n)) : Even a := by
     sorry
   ```

## 6.2. 递推关系

### 6.2.1. 例

**数列**是一个无限延伸的带索引列表。有些数列由显式公式定义。例如，$a_n = 2^n$ 定义了 2 的幂次组成的数列：

$$
\begin{split} a_0 &= 1 \\ a_1 &= 2 \\ a_2 &= 4 \\ a_3 &= 8 \\ a_4 &= 16 \\ a_5 &= 32 \\ &\ldots \end{split}
$$

在 Lean 中，我们会这样定义这个数列：

```lean
def a (n : ℕ) : ℕ := 2 ^ n
```

Lean 也能计算我们想要的任何一项：

```lean
#eval a 20 -- infoview 显示 1048576
```

然而，许多重要数列没有简单的显式公式。更灵活的定义方式是使用**递归定义**。例如，我们可以递归地定义数列 $(b_n)$：

> $$
> \begin{split} b_0 &= 3 \\ \text{对 } n:\mathbb{N},\quad b_{n+1} &= b_n^2 - 2. \end{split}
> $$

它的前几项是

$$
\begin{split} b_0 &= 3 \\ b_1 &= b_0^2 - 2 \\ &= 3^2 - 2 \\ &= 7 \\ b_2 &= b_1^2 - 2 \\ &= 7^2 - 2 \\ &= 47 \\ b_3 &= b_2^2 - 2 \\ &= 47^2 - 2 \\ &= 2207 \\ &\ldots \end{split}
$$

在 Lean 中，我们会这样定义这个数列：

```lean
def b : ℕ → ℤ
  | 0 => 3
  | n + 1 => b n ^ 2 - 2
```

Lean 也能计算我们想要的任何一项（在其计算能力范围内！）：

```lean
#eval b 7 -- infoview 显示 316837008400094222150776738483768236006420971486980607
```

当数列是递归定义时，用归纳法来推理它会很方便。

**问题**

证明对所有 $n$，整数 $b_n$ 都是奇数。

**解法**

我们对 $n$ 用归纳法证明。

首先，

$$
\begin{split} b_0 &= 3 \\ &= 2 \cdot 1 + 1, \end{split}
$$

所以 $b_0$ 是奇数。

现在，设 $k$ 是自然数并假设 $b_k$ 是奇数。则存在整数 $x$ 使得 $b_k = 2x + 1$。于是

$$
\begin{split} b_{k+1} &= b_k^2 - 2 \\ &= (2x + 1)^2 - 2 \\ &= 2(2x^2 + 2x - 1) + 1, \end{split}
$$

所以 $b_{k+1}$ 也是奇数。

下面是该解法在 Lean 中的写法；注意 `rw [b]` 的使用，它按需要展开 $b$ 的递归定义的两部分。

```lean
example (n : ℕ) : Odd (b n) := by
  simple_induction n with k hk
  · -- base case
    use 1
    calc b 0 = 3 := by rw [b]
      _ = 2 * 1 + 1 := by numbers
  · -- inductive step
    obtain ⟨x, hx⟩ := hk
    use 2 * x ^ 2 + 2 * x - 1
    calc b (k + 1) = b k ^ 2 - 2 := by rw [b]
      _ = (2 * x + 1) ^ 2 - 2 := by rw [hx]
      _ = 2 * (2 * x ^ 2 + 2 * x - 1) + 1 := by ring
```

你可以尝试用模算术刻画奇偶性的另一种证明；这在文本和 Lean 中都可行。

### 6.2.2. 例

下面是另一个递归定义的数列：

> $$
> \begin{split} x_0 &= 5 \\ \text{对 } n:\mathbb{N},\quad x_{n+1} &= 2x_n - 1. \end{split}
> $$

在 Lean 中定义如下：

```lean
def x : ℕ → ℤ
  | 0 => 5
  | n + 1 => 2 * x n - 1
```

自己计算这个数列的前几项（或让 Lean 帮你算！）。下面是可以证明的关于数列 $(x_n)$ 的一个性质：

**问题**

证明对所有自然数 $n$，$x_n \equiv 1 \pmod 4$。

**解法**

我们对 $n$ 用归纳法证明。

对于基础情形，注意到

$$
\begin{split} x_0 &= 5 \\ &= 4 \cdot 1 + 1 \\ &\equiv 1 \pmod 4. \end{split}
$$

对于归纳步骤，假设对某个自然数 $k$，$x_k \equiv 1 \pmod 4$。则

$$
\begin{split} x_{k+1} &= 2x_k - 1 \\ &\equiv 2 \cdot 1 - 1 \pmod 4 \\ &= 1 \end{split}
$$

也成立。

请在 Lean 中写出该证明的两个部分。

```lean
example (n : ℕ) : x n ≡ 1 [ZMOD 4] := by
  simple_induction n with k IH
  · -- base case
    sorry
  · -- inductive step
    sorry
```

### 6.2.3. 例

有时，递归定义的数列也可以给出**闭式表达式**。上一题中的数列 $(x_n)$ 就是一例。

**问题**

证明对所有自然数 $n$，$x_n = 2^{n+2} + 1$。

**解法**

我们对 $n$ 用归纳法证明。

对于基础情形，注意到如期望的那样，

$$
\begin{split} x_0 &= 5 \\ &= 2^{0+2} + 1. \end{split}
$$

对于归纳步骤，假设对某个自然数 $k$，$x_k = 2^{k+2} + 1$。则

$$
\begin{split} x_{k+1} &= 2x_k - 1 \\ &= 2(2^{k+2} + 1) - 1 \\ &= 2^{(k+1)+2} + 1. \end{split}
$$

```lean
example (n : ℕ) : x n = 2 ^ (n + 2) + 1 := by
  simple_induction n with k IH
  · -- base case
    calc x 0 = 5 := by rw [x]
      _ = 2 ^ (0 + 2) + 1 := by numbers
  · -- inductive step
    calc x (k + 1) = 2 * x k - 1 := by rw [x]
      _ = 2 * (2 ^ (k + 2) + 1) - 1 := by rw [IH]
      _ = 2 ^ ((k + 1) + 2) + 1 := by ring
```

### 6.2.4. 例

下面是另一个递归定义的数列：

> $$
> \begin{split} A_0 &= 0 \\ \text{对 } n:\mathbb{N},\quad A_{n+1} &= A_n + (n + 1). \end{split}
> $$

```lean
def A : ℕ → ℚ
  | 0 => 0
  | n + 1 => A n + (n + 1)
```

让我们计算这个数列的前几项：

$$
\begin{split} A_0 &= 0 \\ A_1 &= A_0 + 1 \\ &= 1 \\ A_2 &= A_1 + 2 \\ &= 1 + 2 \\ &= 3 \\ A_3 &= A_2 + 3 \\ &= 3 + 3 \\ &= 6 \\ A_4 &= A_3 + 4 \\ &= 6 + 4 \\ &= 10 \\ &\ldots \end{split}
$$

注意规律：我们先加 1，再加 2，再加 3，再加 4。所以事实上

$$
\begin{split} A_1 &= 1 \\ A_2 &= 1 + 2 \\ A_3 &= 1 + 2 + 3 \\ A_4 &= 1 + 2 + 3 + 4 \\ &\ldots \end{split}
$$

数列的项 $A_n$ 表示从 1 到 $n$ 的整数之和。

**问题**

证明对所有自然数 $n$，

$$
A_n = \frac{n(n+1)}{2}.
$$

**解法**

我们对 $n$ 用归纳法证明。首先注意到

$$
\begin{split} A_0 &= 0 \\ &= \frac{0(0+1)}{2}. \end{split}
$$

这建立了基础情形。现在，设 $k$ 是自然数并假设 $A_k = \dfrac{k(k+1)}{2}$。则

$$
\begin{split} A_{k+1} &= A_k + (k+1) \\ &= \frac{k(k+1)}{2} + (k+1) \\ &= \frac{k(k+1) + 2(k+1)}{2} \\ &= \frac{(k+1) \cdot [(k+1)+1]}{2}. \end{split}
$$

下面是它在 Lean 中的写法，步骤更少，因为 Lean 的代数比人类更强。

```lean
example (n : ℕ) : A n = n * (n + 1) / 2 := by
  simple_induction n with k IH
  · -- base case
    calc A 0 = 0 := by rw [A]
      _ = 0 * (0 + 1) / 2 := by numbers
  · -- inductive step
    calc
      A (k + 1) = A k + (k + 1) := by rw [A]
      _ = k * (k + 1) / 2 + (k + 1) := by rw [IH]
      _ = (k + 1) * (k + 1 + 1) / 2 := by ring
```

### 6.2.5. 例

前一个数列是逐项加 1、2、3 等构造的。如果做同样的事但改为乘法呢？这就得到了所谓的**阶乘**函数，“$n$ 阶乘”记作 $n!$。

> $$
> \begin{split} 0! &= 1 \\ \text{对 } n:\mathbb{N},\quad (n+1)! &= (n + 1) \cdot n! \end{split}
> $$

```lean
def factorial : ℕ → ℕ
  | 0 => 1
  | n + 1 => (n + 1) * factorial n

notation:10000 n "!" => factorial n
```

所以

$$
\begin{split} 1! &= 1 \\ 2! &= 2 \cdot 1 \\ 3! &= 3 \cdot 2 \cdot 1 \\ 4! &= 4 \cdot 3 \cdot 2 \cdot 1. \\ &\ldots \end{split}
$$

具体地，

$$
\begin{split} 0! &= 1 \\ 1! &= 1 \cdot 1 \\ &= 1 \\ 2! &= 2 \cdot 1 \\ &= 2 \\ 3! &= 3 \cdot 2 \\ &= 6 \\ 4! &= 4 \cdot 6 \\ &= 24 \\ &\ldots \end{split}
$$

**问题**

设 $n$ 是自然数。证明每个满足 $1 \le d \le n$ 的自然数 $d$ 都是 $n!$ 的因子。

**解法**

我们对 $n$ 用归纳法证明。对于基础情形 $n = 0$，命题是空虚成立的，因为不存在满足 $1 \le d \le 0$ 的自然数 $d$。

设 $k$ 是自然数并假设每个满足 $1 \le d \le k$ 的自然数 $d$ 都是 $k!$ 的因子。现在设 $d$ 是满足 $1 \le d \le k+1$ 的自然数。我们必须证明 $d$ 是 $(k+1)!$ 的因子。

**情形 1**（$d = k + 1$）：我们有

$$
\begin{split} (k+1)! &= (k+1) \cdot k! \\ &= d \cdot k!, \end{split}
$$

所以 $d$ 是 $(k+1)!$ 的因子。

**情形 2**（$d < k + 1$）：则 $d \le k$，所以由归纳假设，$d$ 是 $k!$ 的因子。因此存在自然数 $x$ 使得 $k! = dx$。于是

$$
\begin{split} (k+1)! &= (k+1) \cdot k! \\ &= (k+1) \cdot dx \\ &= d \cdot (k+1)x, \end{split}
$$

所以 $d$ 是 $(k+1)!$ 的因子。

下面是同一个证明在 Lean 中的写法。我们以 `dvd_factorial` 的名字记录它供以后使用。

```lean
example (n : ℕ) : ∀ d, 1 ≤ d → d ≤ n → d ∣ n ! := by
  simple_induction n with k IH
  · -- base case
    intro k hk1 hk
    interval_cases k
  · -- inductive step
    intro d hk1 hk
    obtain hk | hk : d = k + 1 ∨ d < k + 1 := eq_or_lt_of_le hk
    · -- case 1: `d = k + 1`
      sorry
    · -- case 2: `d < k + 1`
      sorry
```

### 6.2.6. 例

**问题**

证明对所有自然数 $n$，有 $(n+1)! \ge 2^n$。

**解法**

我们对 $n$ 用归纳法证明。

对于基础情形，

$$
\begin{split} (0+1)! &= (0+1) \cdot 0! \\ &= (0+1) \cdot 1 \\ &\ge 2^0. \end{split}
$$

对于归纳步骤，假设对某个自然数 $k$，$(k+1)! \ge 2^k$。则

$$
\begin{split} (k+1+1)! &= (k+1+1) \cdot (k+1)! \\ &\ge (k+1+1) \cdot 2^k \\ &= k \cdot 2^k + 2 \cdot 2^k \\ &\ge 2 \cdot 2^k \\ &= 2^{k+1}. \end{split}
$$

```lean
example (n : ℕ) : (n + 1)! ≥ 2 ^ n := by
  sorry
```

### 6.2.7. 练习

1. 考虑递归定义的数列 $(c_n)$：

   $$
   \begin{split} c_0 &= 7 \\ \text{对 } n:\mathbb{N},\quad c_{n+1} &= 3c_n - 10. \end{split}
   $$

   证明对所有自然数 $n$，整数 $c_n$ 都是奇数。

   ```lean
   def c : ℕ → ℤ
     | 0 => 7
     | n + 1 => 3 * c n - 10

   example (n : ℕ) : Odd (c n) := by
     sorry
   ```

2. 设数列 $(c_n)$ 如上题所定义。证明对所有 $n$，$c_n = 2 \cdot 3^n + 5$。

   ```lean
   example (n : ℕ) : c n = 2 * 3 ^ n + 5 := by
     sorry
   ```

3. 考虑递归定义的数列 $(y_n)$：

   $$
   \begin{split} y_0 &= 2 \\ \text{对 } n:\mathbb{N},\quad y_{n+1} &= y_n^2. \end{split}
   $$

   证明对所有自然数 $n$，$y_n = 2^{2^n}$。

   ```lean
   def y : ℕ → ℕ
     | 0 => 2
     | n + 1 => (y n) ^ 2

   example (n : ℕ) : y n = 2 ^ (2 ^ n) := by
     sorry
   ```

4. 考虑递归定义的数列 $(B_n)$：

   $$
   \begin{split} B_0 &= 0 \\ \text{对 } n:\mathbb{N},\quad B_{n+1} &= B_n + (n+1)^2. \end{split}
   $$

   因此 $B_n$ 表示和 $1^2 + 2^2 + 3^2 + \cdots + n^2$。证明对所有自然数 $n$，

   $$
   B_n = \frac{n(n+1)(2n+1)}{6}.
   $$

   ```lean
   def B : ℕ → ℚ
     | 0 => 0
     | n + 1 => B n + (n + 1 : ℚ) ^ 2

   example (n : ℕ) : B n = n * (n + 1) * (2 * n + 1) / 6 := by
     sorry
   ```

5. 考虑递归定义的数列 $(S_n)$：

   $$
   \begin{split} S_0 &= 1 \\ \text{对 } n:\mathbb{N},\quad S_{n+1} &= S_n + \frac{1}{2^{n+1}}. \end{split}
   $$

   因此 $S_n$ 表示和 $1 + \dfrac{1}{2} + \dfrac{1}{4} + \cdots + \dfrac{1}{2^n}$。证明对所有自然数 $n$，

   $$
   S_n = 2 - \frac{1}{2^n}.
   $$

   ```lean
   def S : ℕ → ℚ
     | 0 => 1
     | n + 1 => S n + 1 / 2 ^ (n + 1)

   example (n : ℕ) : S n = 2 - 1 / 2 ^ n := by
     sorry
   ```

6. 证明对所有自然数 $n$，$n!$ 严格为正。

   我们以 `factorial_pos` 的名字记录它供以后使用。

   ```lean
   example (n : ℕ) : 0 < n ! := by
     sorry
   ```

7. 证明对所有 $n \ge 2$，$n!$ 是偶数。使用从 2 开始的归纳法（参见[例 6.1.5](#615-例)）。

   ```lean
   example {n : ℕ} (hn : 2 ≤ n) : Nat.Even (n !) := by
     sorry
   ```

8. 证明对所有自然数 $n$，$(n+1)! \le (n+1)^n$。

   （可与[例 6.2.6](#626-例)比较。）

   ```lean
   example (n : ℕ) : (n + 1) ! ≤ (n + 1) ^ n := by
     sorry
   ```

## 6.3. 两步归纳

### 6.3.1. 例

上一节我们研究了每一项由前一项构造的递归数列。但也可以定义依赖前几项的递归数列。

例如，下面是一个依赖前两项的递归数列。

$$
\begin{split} a_0 &= 2 \\ a_1 &= 1 \\ \text{对 } n:\mathbb{N},\quad a_{n+2} &= a_{n+1} + 2a_n. \end{split}
$$

由于递推关系依赖前两项，我们需要给出数列的两个具体初始值（$a_0 = 2$ 和 $a_1 = 1$）。

这个数列的前几项是

$$
\begin{split} a_0 &= 2 \\ a_1 &= 1 \\ a_2 &= a_1 + 2a_0 \\ &= 1 + 2 \cdot 2 \\ &= 5 \\ a_3 &= a_2 + 2a_1 \\ &= 5 + 2 \cdot 1 \\ &= 7 \\ a_4 &= a_3 + 2a_2 \\ &= 7 + 2 \cdot 5 \\ &= 17 \end{split}
$$

在 Lean 中，我们会这样定义这个数列：

```lean
def a : ℕ → ℤ
  | 0 => 2
  | 1 => 1
  | n + 2 => a (n + 1) + 2 * a n
```

和上一节一样，Lean 会为我们计算数列的任何一项：

```lean
#eval a 5 -- infoview 显示 31
```

自己用纸笔或 Lean 计算更多项。你会开始发现一个规律：数列的每一项都比 2 的某个幂次少 1。我们可以用归纳法证明这个规律。

**问题**

证明对所有自然数 $n$，$a_n = 2^n + (-1)^n$。

注意下面的证明中有**两个**基础情形和**两个**归纳假设。想想为什么。

**解法**

我们对 $n$ 用归纳法证明。

我们有

$$
\begin{split} a_0 &= 2 \\ &= 2^0 + (-1)^0 \end{split}
$$

以及

$$
\begin{split} a_1 &= 1 \\ &= 2^1 + (-1)^1. \end{split}
$$

现在设 $k$ 是自然数并假设 $a_k = 2^k + (-1)^k$ 且 $a_{k+1} = 2^{k+1} + (-1)^{k+1}$。则

$$
\begin{split} a_{k+2} &= a_{k+1} + 2a_k \\ &= (2^{k+1} + (-1)^{k+1}) + 2(2^k + (-1)^k) \\ &= (2 \cdot 2^k - (-1)^k) + (2 \cdot 2^k + 2 \cdot (-1)^k) \\ &= 2^2 \cdot 2^k + (-1)^2 \cdot (-1)^k \\ &= 2^{k+2} + (-1)^{k+2}. \end{split}
$$

主要计算的前两步（使用递推关系和归纳假设）相对固定，但后面的“收官”步骤可能因你对指数法则和心算的熟练程度而有多有少。Lean 可以一步完成！

对这种有两个基础情形和两个归纳假设的归纳，我们使用 Lean 策略 `two_step_induction`。

```lean
example (n : ℕ) : a n = 2 ^ n + (-1) ^ n := by
  two_step_induction n with k IH1 IH2
  . calc a 0 = 2 := by rw [a]
      _ = 2 ^ 0 + (-1) ^ 0 := by numbers
  . calc a 1 = 1 := by rw [a]
      _ = 2 ^ 1 + (-1) ^ 1 := by numbers
  calc
    a (k + 2)
      = a (k + 1) + 2 * a k := by rw [a]
    _ = (2 ^ (k + 1) + (-1) ^ (k + 1)) + 2 * (2 ^ k + (-1) ^ k) := by rw [IH1, IH2]
    _ = (2 : ℤ) ^ (k + 2) + (-1) ^ (k + 2) := by ring
```

### 6.3.2. 例

**问题**

证明对所有自然数 $m \ge 1$，$a_m$ 模 6 同余于 1 或 5。

**解法**

我们将证明一个比题目更精确的结果：对所有自然数 $n \ge 1$，要么

* $a_n \equiv 1 \pmod 6$ 且 $a_{n+1} \equiv 5 \pmod 6$，要么
* $a_n \equiv 5 \pmod 6$ 且 $a_{n+1} \equiv 1 \pmod 6$。

我们对 $n$ 用归纳法证明。

对于基础情形 $n = 1$，注意到 $a_1 = 1$ 且 $a_2 = 5$，所以 $a_1 \equiv 1 \pmod 6$ 且 $a_2 \equiv 5 \pmod 6$。

对于归纳步骤，设 $k$ 是自然数并假设要么

* $a_k \equiv 1 \pmod 6$ 且 $a_{k+1} \equiv 5 \pmod 6$，要么
* $a_k \equiv 5 \pmod 6$ 且 $a_{k+1} \equiv 1 \pmod 6$。

**情形 1**（$a_k \equiv 1 \pmod 6$ 且 $a_{k+1} \equiv 5 \pmod 6$）：则

$$
\begin{split} a_{k+2} &= a_{k+1} + 2a_k \\ &\equiv 5 + 2 \cdot 1 \pmod 6 \\ &= 6 \cdot 1 + 1 \\ &\equiv 1 \pmod 6. \end{split}
$$

**情形 2**（$a_k \equiv 5 \pmod 6$ 且 $a_{k+1} \equiv 1 \pmod 6$）：则

$$
\begin{split} a_{k+2} &= a_{k+1} + 2a_k \\ &\equiv 1 + 2 \cdot 5 \pmod 6 \\ &= 6 \cdot 1 + 5 \\ &\equiv 5 \pmod 6. \end{split}
$$

你可能不太清楚为什么这些计算就是解决问题所需要的。文本中也没有直接点明其中相当多的底层逻辑操作。下面的 Lean 证明可能会让你更清楚地看到这些逻辑操作。

```lean
example {m : ℕ} (hm : 1 ≤ m) : a m ≡ 1 [ZMOD 6] ∨ a m ≡ 5 [ZMOD 6] := by
  have H : ∀ n : ℕ, 1 ≤ n →
      (a n ≡ 1 [ZMOD 6] ∧ a (n + 1) ≡ 5 [ZMOD 6])
    ∨ (a n ≡ 5 [ZMOD 6] ∧ a (n + 1) ≡ 1 [ZMOD 6])
  · intro n hn
    induction_from_starting_point n, hn with k hk IH
    · left
      constructor
      calc a 1 = 1 := by rw [a]
        _ ≡ 1 [ZMOD 6] := by extra
      calc a (1 + 1) = 1 + 2 * 2 := by rw [a, a, a]
        _ = 5 := by numbers
        _ ≡ 5 [ZMOD 6] := by extra
    · obtain ⟨IH1, IH2⟩ | ⟨IH1, IH2⟩ := IH
      · right
        constructor
        · apply IH2
        calc a (k + 1 + 1) = a (k + 1) + 2 * a k := by rw [a]
          _ ≡ 5 + 2 * 1 [ZMOD 6] := by rel [IH1, IH2]
          _ = 6 * 1 + 1 := by numbers
          _ ≡ 1 [ZMOD 6] := by extra
      · left
        constructor
        · apply IH2
        calc a (k + 1 + 1) = a (k + 1) + 2 * a k := by rw [a]
          _ ≡ 1 + 2 * 5 [ZMOD 6] := by rel [IH1, IH2]
          _ = 6 * 1 + 5 := by numbers
          _ ≡ 5 [ZMOD 6] := by extra
  obtain ⟨H1, H2⟩ | ⟨H1, H2⟩ := H m hm
  · left
    apply H1
  · right
    apply H1
```

### 6.3.3. 例

依赖前两项定义的递归数列中最著名的例子是**斐波那契数列**：每一项都是前两项之和。

$$
\begin{split} F_0 &= 1 \\ F_1 &= 1 \\ \text{对 } n:\mathbb{N},\quad F_{n+2} &= F_{n+1} + F_n. \end{split}
$$

```lean
def F : ℕ → ℤ
  | 0 => 1
  | 1 => 1
  | n + 2 => F (n + 1) + F n
```

用纸笔或 Lean 计算前 10 项。

**问题**

证明斐波那契数列 $(F_n)$ 满足：对所有自然数 $n$，$F_n \le 2^n$。

**解法**

我们对 $n$ 用归纳法证明。

对于 $n = 0$，我们有

$$
\begin{split} F_0 &= 1 \\ &\le 2^0. \end{split}
$$

对于 $n = 1$，我们有

$$
\begin{split} F_1 &= 1 \\ &\le 2^1. \end{split}
$$

设 $k$ 是自然数并假设 $F_k \le 2^k$ 且 $F_{k+1} \le 2^{k+1}$。则

$$
\begin{split} F_{k+2} &= F_{k+1} + F_k \\ &\le 2^{k+1} + 2^k \\ &\le 2^{k+1} + 2^k + 2^k \\ &= 2^{k+1} + 2^{k+1} \\ &= 2^{k+2}. \end{split}
$$

```lean
example (n : ℕ) : F n ≤ 2 ^ n := by
  two_step_induction n with k IH1 IH2
  · calc F 0 = 1 := by rw [F]
      _ ≤ 2 ^ 0 := by numbers
  · calc F 1 = 1 := by rw [F]
      _ ≤ 2 ^ 1 := by numbers
  · calc F (k + 2) = F (k + 1) + F k := by rw [F]
      _ ≤ 2 ^ (k + 1) + 2 ^ k := by rel [IH1, IH2]
      _ ≤ 2 ^ (k + 1) + 2 ^ k + 2 ^ k := by extra
      _ = 2 ^ (k + 2) := by ring
```

### 6.3.4. 例

**问题**

证明斐波那契数列 $(F_n)$ 满足：对所有自然数 $n$，

$$
F_{n+1}^2 - F_{n+1}F_n - F_n^2 = -(-1)^n.
$$

**解法**

我们对 $n$ 用归纳法证明。首先，

$$
\begin{split} F_1^2 - F_1F_0 - F_0^2 &= 1^2 - 1 \cdot 1 - 1^2 \\ &= -(-1)^0. \end{split}
$$

现在，设 $k$ 是自然数并假设 $F_{k+1}^2 - F_{k+1}F_k - F_k^2 = -(-1)^k$。则

$$
\begin{split} F_{k+2}^2 - F_{k+2}F_{k+1} - F_{k+1}^2 &= (F_{k+1} + F_k)^2 - (F_{k+1} + F_k)F_{k+1} - F_{k+1}^2 \\ &= -(F_{k+1}^2 - F_{k+1}F_k - F_k^2) \\ &= -(-(-1)^k) \\ &= -(-1)^{k+1}. \end{split}
$$

```lean
example (n : ℕ) : F (n + 1) ^ 2 - F (n + 1) * F n - F n ^ 2 = - (-1) ^ n := by
  simple_induction n with k IH
  · calc F 1 ^ 2 - F 1 * F 0 - F 0 ^ 2 = 1 ^ 2 - 1 * 1 - 1 ^ 2 := by rw [F, F]
      _ = - (-1) ^ 0 := by numbers
  · calc F (k + 2) ^ 2 - F (k + 2) * F (k + 1) - F (k + 1) ^ 2
        = (F (k + 1) + F k) ^ 2 - (F (k + 1) + F k) * F (k + 1)
            - F (k + 1) ^ 2 := by rw [F]
      _ = - (F (k + 1) ^ 2 - F (k + 1) * F k - F k ^ 2) := by ring
      _ = - -(-1) ^ k := by rw [IH]
      _ = -(-1) ^ (k + 1) := by ring
```

### 6.3.5. 例

到目前为止，我们已经见过简单归纳、从指定起点开始的归纳和两步归纳。不难想象，也可以从指定起点开始进行两步归纳。

考虑递归定义的数列 $(d_n)$：

> $$
> \begin{split} d_0 &= 3 \\ d_1 &= 1 \\ \text{对 } n:\mathbb{N},\quad d_{n+2} &= 3d_{n+1} + 5d_n. \end{split}
> $$

```lean
def d : ℕ → ℤ
  | 0 => 3
  | 1 => 1
  | k + 2 => 3 * d (k + 1) + 5 * d k
```

**问题**

证明对所有足够大的自然数 $n$，$d_n \ge 4^n$。

开始本题时，你可以先计算前几项，用手算或在 Lean 中。

```lean
#eval d 2 -- infoview 显示 18
#eval d 3 -- infoview 显示 59
#eval d 4 -- infoview 显示 267
#eval d 5 -- infoview 显示 1096
#eval d 6 -- infoview 显示 4623
#eval d 7 -- infoview 显示 19349
```

同样，你可以在 Lean 中计算 4 的前几个幂次。

```lean
#eval 4 ^ 2 -- infoview 显示 16
#eval 4 ^ 3 -- infoview 显示 64
#eval 4 ^ 4 -- infoview 显示 256
#eval 4 ^ 5 -- infoview 显示 1024
#eval 4 ^ 6 -- infoview 显示 4096
#eval 4 ^ 7 -- infoview 显示 16384
```

根据这有限的样本，看起来 $d_n$ 在 $n = 4$ 处超过 $4^n$。所以我们尝试从 4 开始归纳。

**解法**

我们证明这对所有自然数 $n \ge 4$ 成立。

对于 $n = 4$，我们有

$$
\begin{split} d_4 &= 267 \\ &\ge 4^4. \end{split}
$$

对于 $n = 5$，我们有

$$
\begin{split} d_5 &= 1096 \\ &\ge 4^5. \end{split}
$$

设 $k$ 是自然数并假设 $d_k \ge 4^k$ 且 $d_{k+1} \ge 4^{k+1}$。则

$$
\begin{split} d_{k+2} &= 3d_{k+1} + 5d_k \\ &\ge 3 \cdot 4^{k+1} + 5 \cdot 4^k \\ &= 16 \cdot 4^k + 4^k \\ &\ge 16 \cdot 4^k \\ &= 4^{k+2}. \end{split}
$$

在 Lean 中，我们可以使用策略 `two_step_induction_from_starting_point` 来处理这种论证。

```lean
example : forall_sufficiently_large n : ℕ, d n ≥ 4 ^ n := by
  dsimp
  use 4
  intro n hn
  two_step_induction_from_starting_point n, hn with k hk IH1 IH2
  · calc d 4 = 267 := by rfl
      _ ≥ 4 ^ 4 := by numbers
  · calc d 5 = 1096 := by rfl
      _ ≥ 4 ^ 5 := by numbers
  calc d (k + 2) = 3 * d (k + 1) + 5 * d k := by rw [d]
    _ ≥ 3 * 4 ^ (k + 1) + 5 * 4 ^ k := by rel [IH1, IH2]
    _ = 16 * 4 ^ k + 4 ^ k := by ring
    _ ≥ 16 * 4 ^ k := by extra
    _ = 4 ^ (k + 2) := by ring
```

### 6.3.6. 练习

1. 考虑递归定义的数列 $(b_n)$：

   $$
   \begin{split} b_0 &= 0 \\ b_1 &= 1 \\ \text{对 } n:\mathbb{N},\quad b_{n+2} &= 5b_{n+1} - 6b_n. \end{split}
   $$

   证明对所有自然数 $n$，$b_n = 3^n - 2^n$。

   ```lean
   def b : ℕ → ℤ
     | 0 => 0
     | 1 => 1
     | n + 2 => 5 * b (n + 1) - 6 * b n

   example (n : ℕ) : b n = 3 ^ n - 2 ^ n := by
     sorry
   ```

2. 考虑递归定义的数列 $(c_n)$：

   $$
   \begin{split} c_0 &= 3 \\ c_1 &= 2 \\ \text{对 } n:\mathbb{N},\quad c_{n+2} &= 4c_n. \end{split}
   $$

   证明对所有自然数 $n$，$c_n = 2 \cdot 2^n + (-2)^n$。

   ```lean
   def c : ℕ → ℤ
     | 0 => 3
     | 1 => 2
     | n + 2 => 4 * c n

   example (n : ℕ) : c n = 2 * 2 ^ n + (-2) ^ n := by
     sorry
   ```

3. 考虑递归定义的数列 $(t_n)$：

   $$
   \begin{split} t_0 &= 5 \\ t_1 &= 7 \\ \text{对 } n:\mathbb{N},\quad t_{n+2} &= 2t_{n+1} - t_n. \end{split}
   $$

   证明对所有自然数 $n$，$t_n = 2n + 5$。

   ```lean
   def t : ℕ → ℤ
     | 0 => 5
     | 1 => 7
     | n + 2 => 2 * t (n + 1) - t n

   example (n : ℕ) : t n = 2 * n + 5 := by
     sorry
   ```

4. 考虑递归定义的数列 $(q_n)$：

   $$
   \begin{split} q_0 &= 1 \\ q_1 &= 2 \\ \text{对 } n:\mathbb{N},\quad q_{n+2} &= 2q_{n+1} - q_n + 6n + 6. \end{split}
   $$

   证明对所有自然数 $n$，$q_n = n^3 + 1$。

   ```lean
   def q : ℕ → ℤ
     | 0 => 1
     | 1 => 2
     | n + 2 => 2 * q (n + 1) - q n + 6 * n + 6

   example (n : ℕ) : q n = (n:ℤ) ^ 3 + 1 := by
     sorry
   ```

5. 考虑递归定义的数列 $(s_n)$：

   $$
   \begin{split} s_0 &= 2 \\ s_1 &= 3 \\ \text{对 } n:\mathbb{N},\quad s_{n+2} &= 2s_{n+1} + 3s_n. \end{split}
   $$

   证明对所有自然数 $m$，$s_m$ 模 5 同余于 2 或 3。

   ```lean
   def s : ℕ → ℤ
     | 0 => 2
     | 1 => 3
     | n + 2 => 2 * s (n + 1) + 3 * s n

   example (m : ℕ) : s m ≡ 2 [ZMOD 5] ∨ s m ≡ 3 [ZMOD 5] := by
     sorry
   ```

6. 考虑递归定义的数列 $(p_n)$：

   $$
   \begin{split} p_0 &= 2 \\ p_1 &= 3 \\ \text{对 } n:\mathbb{N},\quad p_{n+2} &= 6p_{n+1} - p_n. \end{split}
   $$

   证明对所有自然数 $m \ge 1$，$p_m$ 模 7 同余于 2 或 3。

   ```lean
   def p : ℕ → ℤ
     | 0 => 2
     | 1 => 3
     | n + 2 => 6 * p (n + 1) - p n

   example (m : ℕ) : p m ≡ 2 [ZMOD 7] ∨ p m ≡ 3 [ZMOD 7] := by
     sorry
   ```

7. 考虑递归定义的数列 $(r_n)$：

   $$
   \begin{split} r_0 &= 2 \\ r_1 &= 0 \\ \text{对 } n:\mathbb{N},\quad r_{n+2} &= 2r_{n+1} + r_n. \end{split}
   $$

   证明对所有足够大的自然数 $n$，$r_n \ge 2^n$。

   ```lean
   def r : ℕ → ℤ
     | 0 => 2
     | 1 => 0
     | n + 2 => 2 * r (n + 1) + r n

   example : forall_sufficiently_large n : ℕ, r n ≥ 2 ^ n := by
     sorry
   ```

8. 证明斐波那契数列 $(F_n)$ 满足：对所有足够大的自然数 $n$，

   $$
   0.4 \cdot 1.6^n < F_n < 0.5 \cdot 1.7^n.
   $$

   ```lean
   example : forall_sufficiently_large n : ℕ,
       (0.4:ℚ) * 1.6 ^ n < F n ∧ F n < (0.5:ℚ) * 1.7 ^ n := by
     sorry
   ```

[^1] 本例改编自 Hammack，《[Book of Proof](https://www.people.vcu.edu/~rhammack/BookOfProof/)》第 10.5 节。

## 6.4. 强归纳

### 6.4.1. 例

我们遇到的归纳原理越来越复杂，从[例 6.1.1](#611-例)的“简单归纳”到[例 6.3.5](#635-例)这种相当小众的“从指定起点开始的两步归纳”。与其随着问题变得更复杂而发展越来越奇特的归纳原理，不如解释一种更一般的方法：**强归纳法**。这种方法让我们逐个证明自然数的命题，每一步不仅可以依赖紧邻的前一步，还可以依赖**任何**之前的步骤。

让我们用强归纳法重新做[例 6.3.3](#633-例)。差异在 Lean 中会更明显，但我们先从文本证明开始，其区别只是强调方式不同。

**问题**

证明对所有自然数 $n$，$F_n \le 2^n$。

**解法**

我们对 $n$ 用强归纳法证明。设 $n$ 是自然数，并假设对所有自然数 $m < n$，都有 $F_m \le 2^m$。$(\star)$

我们按 $n$ 是 0、1 还是某个自然数 $k$ 对应的 $k + 2$ 来分情况。

对于 $n = 0$，我们有

$$
\begin{split} F_0 &= 1 \\ &\le 2^0. \end{split}
$$

对于 $n = 1$，我们有

$$
\begin{split} F_1 &= 1 \\ &\le 2^1. \end{split}
$$

对于 $n = k + 2$，我们有 $k < k + 2$ 且 $k + 1 < k + 2$，所以由归纳假设 $(\star)$，$F_k \le 2^k$ 且 $F_{k+1} \le 2^{k+1}$。因此

$$
\begin{split} F_{k+2} &= F_{k+1} + F_k \\ &\le 2^{k+1} + 2^k \\ &\le 2^{k+1} + 2^k + 2^k \\ &= 2^{k+1} + 2^{k+1} \\ &= 2^{k+2}. \end{split}
$$

在 Lean 中，强归纳法几乎可以悄无声息地使用。我们先建立一个陈述我们想要证明的定理（这里是

> 对所有自然数 $n$，$F_n \le 2^n$

在 Lean 中我把它命名为 `F_bound`）。然后在证明内部我们可以引用定理本身！Lean 会替我们检查：我们只把定理用于比当前研究的值更小的输入值。

你可能会觉得这有循环论证之嫌。你可以自己验证一下：如果你尝试在值 $n$ 本身，或更大的值如 $n + 17$ 处调用引理 `F_bound`，Lean 会报错。

```lean
theorem F_bound (n : ℕ) : F n ≤ 2 ^ n := by
  match n with
  | 0 =>
      calc F 0 = 1 := by rw [F]
        _ ≤ 2 ^ 0 := by numbers
  | 1 =>
      calc F 1 = 1 := by rw [F]
        _ ≤ 2 ^ 1 := by numbers
  | k + 2  =>
      have IH1 := F_bound k -- first inductive hypothesis
      have IH2 := F_bound (k + 1) -- second inductive hypothesis
      calc F (k + 2) = F (k + 1) + F k := by rw [F]
        _ ≤ 2 ^ (k + 1) + 2 ^ k := by rel [IH1, IH2]
        _ ≤ 2 ^ (k + 1) + 2 ^ k + 2 ^ k := by extra
        _ = 2 ^ (k + 2) := by ring
```

### 6.4.2. 例

**定理**

设 $n \ge 2$ 是自然数。则存在素数 $p$ 是 $n$ 的因子。

**证明**

我们对 $n$ 用强归纳法证明。设 $n$ 是自然数，并假设对所有满足 $2 \le m < n$ 的自然数 $m$，都存在素数 $p$ 是 $m$ 的因子。$(\star)$

如果 $n$ 是素数，则 $n$ 本身就是 $n$ 的一个素因子，证毕。

如果 $n$ 不是素数，则由于 $n \ge 2$，存在自然数 $m$ 满足 $2 \le m < n$ 且 $m$ 是 $n$ 的因子。（这在[第 5.3 节](05_Logic.md#53-否定的范式)的一个练习中已经证明。）由归纳假设 $(\star)$，存在素数 $p$ 是 $m$ 的因子。

由于 $m \mid n$，存在自然数 $x$ 使得 $n = mx$。由于 $p \mid m$，存在自然数 $y$ 使得 $m = py$。则

$$
\begin{split} n &= mx \\ &= (py)x \\ &= p(xy), \end{split}
$$

所以 $p$ 也是 $n$ 的因子。

下面是同一个证明在 Lean 中的写法。[第 5.3 节](05_Logic.md#53-否定的范式)练习中的引理在 Lean 中名为 `exists_factor_of_not_prime`。

注意这又是一个强归纳证明：我们在为 $n$ 证明定理的过程中，调用了为 $m$ 实例化的定理 `exists_prime_factor`。此时 Lean 有一个可用的假设 $m < n$，所以这是合法的。

```lean
theorem exists_prime_factor {n : ℕ} (hn2 : 2 ≤ n) : ∃ p : ℕ, Prime p ∧ p ∣ n := by
  by_cases hn : Prime n
  . -- case 1: `n` is prime
    use n
    constructor
    · apply hn
    · use 1
      ring
  . -- case 2: `n` is not prime
    obtain ⟨m, hmn, _, ⟨x, hx⟩⟩ := exists_factor_of_not_prime hn hn2
    have IH : ∃ p, Prime p ∧ p ∣ m := exists_prime_factor hmn -- inductive hypothesis
    obtain ⟨p, hp, y, hy⟩ := IH
    use p
    constructor
    · apply hp
    · use x * y
      calc n = m * x := hx
        _ = (p * y) * x := by rw [hy]
        _ = p * (x * y) := by ring
```

### 6.4.3. 练习

1. 证明对所有自然数 $n > 0$，存在自然数 $a$ 和 $x$，其中 $x$ 为奇数，使得 $n = 2^a x$。

   建议方法：先按 $n$ 的奇偶性分情况，使用引理 `even_or_odd`。

   ```lean
   theorem extract_pow_two (n : ℕ) (hn : 0 < n) : ∃ a x, Odd x ∧ n = 2 ^ a * x := by
     sorry
   ```

## 6.5. 帕斯卡三角形

### 6.5.1. 定义

考虑递归定义的自然数族 $(P_{a,b})$：

$$
\begin{split} \text{对 } a:\mathbb{N},\quad P_{a,0} &= 1 \\ \text{对 } b:\mathbb{N},\quad P_{0,b+1} &= 1 \\ \text{对 } a,b:\mathbb{N},\quad P_{a+1,b+1} &= P_{a+1,b} + P_{a,b+1}. \end{split}
$$

这个定义是**良基的**，因为每一步定义只依赖于那些 $a + b$ 严格更小的先前项 $P_{a,b}$。

下面是它在 Lean 中的样子，良基性说明用语法 `termination_by` 表达。

```lean
def pascal : ℕ → ℕ → ℕ
  | a, 0 => 1
  | 0, b + 1 => 1
  | a + 1, b + 1 => pascal (a + 1) b + pascal a (b + 1)
termination_by _ a b => a + b
```

和往常一样，Lean 能计算我们要求的任何函数值。例如，

```lean
#eval pascal 2 4 -- infoview 显示 15
```

下面是 $a$ 和 $b$ 从 0 到 5 的所有值。

**表 6.1** 递归函数 `pascal` 的值

|       | 0 | 1 | 2 | 3 | 4 | 5 |
|-------|---|---|---|---|---|---|
| **0** | 1 | 1 | 1 | 1 | 1 | 1 |
| **1** | 1 | 2 | 3 | 4 | 5 | 6 |
| **2** | 1 | 3 | 6 | 10 | 15 | 21 |
| **3** | 1 | 4 | 10 | 20 | 35 | 56 |
| **4** | 1 | 5 | 15 | 35 | 70 | 126 |
| **5** | 1 | 6 | 21 | 56 | 126 | 252 |

从定义出发重新计算几个值，检验你的理解。

函数 `pascal` 的常规可视化方式是把上面的表旋转，形成一个三角形。

![帕斯卡三角形](https://hrmacbeth.github.io/math2001/_images/pascal.gif)

**图 6.1** 帕斯卡三角形（图片来源：[Wikimedia Commons](https://commons.wikimedia.org/wiki/File:PascalTriangleAnimated2.gif)）

### 6.5.2. 例

**定理**

对所有自然数 $a$ 和 $b$，$P_{a,b} \le (a+b)!$。

**证明**

我们对表达式 $a + b$ 使用强归纳法证明。

由[6.2 节](#62-递推关系)的一个练习，阶乘总是 $\ge 1$，所以对所有 $a$，

$$
\begin{split} P_{a,0} &= 1 \\ &\le (a+0)!, \end{split}
$$

且对所有 $b$，

$$
\begin{split} P_{0,b+1} &= 1 \\ &\le (0+(b+1))!. \end{split}
$$

现在设 $a$、$b$ 是自然数，并假设对所有满足 $x + y < (a+1) + (b+1)$ 的 $x$、$y$，都有 $P_{x,y} \le (x+y)!$。则特别地

$$
\begin{split} P_{a+1,b} &\le ((a+1)+b)! \\ P_{a,b+1} &\le (a+(b+1))!. \end{split}
$$

所以

$$
\begin{split} P_{a + 1,b + 1} &= P_{a + 1, b} + P_{a, b + 1} \\ &\le (a + 1 + b)! + (a + (b + 1))! \\ &\le (a + b)(a + b + 1)! + (a + 1 + b)! + (a + (b + 1))! \\ &= ((a + b + 1) + 1)(a + b + 1)! \\ &= ((a + b + 1) + 1)! \\ &= (a + 1 + (b + 1))!. \end{split}
$$

```lean
theorem pascal_le (a b : ℕ) : pascal a b ≤ (a + b)! := by
  match a, b with
  | a, 0 =>
      calc pascal a 0 = 1 := by rw [pascal]
        _ ≤ (a + 0)! := by apply factorial_pos
  | 0, b + 1 =>
      calc pascal 0 (b + 1) = 1 := by rw [pascal]
        _ ≤ (0 + (b + 1))! := by apply factorial_pos
  | a + 1, b + 1 =>
      have IH1 := pascal_le (a + 1) b -- inductive hypothesis
      have IH2 := pascal_le a (b + 1) -- inductive hypothesis
      calc pascal (a + 1) (b + 1) = pascal (a + 1) b + pascal a (b + 1) := by rw [pascal]
        _ ≤ (a + 1 + b) ! + (a + (b + 1)) ! := by rel [IH1, IH2]
        _ ≤ (a + b) * (a + b + 1) ! + (a + 1 + b) ! + (a + (b + 1)) !  := by extra
        _ = ((a + b + 1) + 1) * (a + b + 1)! := by ring
        _ = ((a + b + 1) + 1)! := by rw [factorial, factorial, factorial]
        _ = (a + 1 + (b + 1))! := by ring
termination_by _ a b => a + b
```

### 6.5.3. 例

通过更精细的计算，我们可以把[例 6.5.2](#652-例)中的界改进为一个精确公式。

**定理**

对所有自然数 $a$ 和 $b$，$P_{a,b} \cdot a! \cdot b! = (a+b)!$。

**证明**

我们对表达式 $a + b$ 使用强归纳法证明。

对所有 $a$，

$$
\begin{split} P_{a,0} &= 1 \\ &= (a+0)!, \end{split}
$$

且对所有 $b$，

$$
\begin{split} P_{0,b+1} &= 1 \\ &= (0+(b+1))!. \end{split}
$$

现在设 $a$、$b$ 是自然数，并假设对所有满足 $x + y < (a+1) + (b+1)$ 的 $x$、$y$，都有 $P_{x,y} \cdot x! \cdot y! = (x+y)!$。则特别地

$$
\begin{split} P_{a+1,b} \cdot (a+1)! \cdot b! &= ((a+1)+b)! \\ P_{a,b+1} \cdot a! \cdot (b+1)! &= (a+(b+1))!. \end{split}
$$

所以

$$
\begin{split} P_{a + 1, b + 1} \cdot (a + 1)! \cdot (b + 1)! &= (P_{a + 1, b} + P_{a, b + 1}) \cdot (a + 1)! \cdot (b + 1)! \\ &= P_{a + 1, b} \cdot (a + 1)! \cdot (b + 1)! + P_{a, b + 1} \cdot (a + 1)! \cdot (b + 1)! \\ &= P_{a + 1, b} \cdot (a + 1)! \cdot ((b + 1) b!) + P_{a, b + 1} \cdot ((a + 1) a!) \cdot (b + 1)! \\ &= (b + 1)(P_{a + 1, b} \cdot (a + 1)! \cdot b!) + (a + 1)(P_{a, b + 1} \cdot a! \cdot (b + 1)!) \\ &= (b + 1)((a + 1) + b)! + (a + 1)(a + (b + 1))! \\ &= ((1 + a + b) + 1)(1 + a + b)! \\ &= ((1 + a + b) + 1)! \\ &= ((a + 1) + (b + 1))!. \end{split}
$$

```lean
theorem pascal_eq (a b : ℕ) : pascal a b * a ! * b ! = (a + b)! := by
  match a, b with
  | a, 0 =>
    calc pascal _ 0 * a ! * 0! = 1 * a ! * 0! := by rw [pascal]
      _ = 1 * a ! * 1 := by rw [factorial]
      _ = (a + 0)! := by ring
  | 0, b + 1 =>
    calc pascal 0 (b + 1) * 0 ! * (b + 1)! = 1 * 0 ! * (b + 1)! := by rw [pascal]
      _ = 1 * 1 * (b + 1)! := by rw [factorial, factorial]
      _ = (0 + (b + 1))! := by ring
  | a + 1, b + 1 =>
    have IH1 := pascal_eq (a + 1) b -- inductive hypothesis
    have IH2 := pascal_eq a (b + 1) -- inductive hypothesis
    calc
      pascal (a + 1) (b + 1) * (a + 1)! * (b + 1)!
        = (pascal (a + 1) b + pascal a (b + 1)) * (a + 1)! * (b + 1)! := by rw [pascal]
      _ = pascal (a + 1) b * (a + 1)! * (b + 1)!
          + pascal a (b + 1) * (a + 1)! * (b + 1)! := by ring
      _ = pascal (a + 1) b * (a + 1)! * ((b + 1) * b !)
          + pascal a (b + 1) * ((a + 1) * a !) * (b + 1)! := by rw [factorial, factorial]
      _ = (b + 1) * (pascal (a + 1) b * (a + 1)! * b !)
          + (a + 1) * (pascal a (b + 1) * a ! * (b + 1)!) := by ring
      _ = (b + 1) * ((a + 1) + b) !
          + (a + 1) * (a + (b + 1)) ! := by rw [IH1, IH2]
      _ = ((1 + a + b) + 1) * (1 + a + b) ! := by ring
      _ = ((1 + a + b) + 1) ! := by rw [factorial]
      _ = ((a + 1) + (b + 1)) ! := by ring
termination_by _ a b => a + b
```

**推论**

对所有自然数 $a$ 和 $b$，

$$
P_{a,b} = \frac{(a+b)!}{a! \cdot b!}.
$$

这是上述定理的平凡变形，但 Lean 证明更复杂，因为涉及除法，而本书 largely 回避除法。这里不必纠结细节，也不需熟悉两个陌生策略 `field_simp` 和 `norm_cast`。

```lean
example (a b : ℕ) : (pascal a b : ℚ) = (a + b)! / (a ! * b !) := by
  have ha := factorial_pos a
  have hb := factorial_pos b
  field_simp [ha, hb]
  norm_cast
  calc pascal a b * (a ! * b !) = pascal a b * a ! * b ! := by ring
    _ = (a + b)! := by apply pascal_eq
```

### 6.5.4. 练习

1. 证明对所有自然数 $a$ 和 $b$，$P_{a,b} = P_{b,a}$。

   ```lean
   theorem pascal_symm (m n : ℕ) : pascal m n = pascal n m := by
     match m, n with
     | 0, 0 => sorry
     | a + 1, 0 => sorry
     | 0, b + 1 => sorry
     | a + 1, b + 1 => sorry
   termination_by _ a b => a + b
   ```

2. 用简单归纳法证明对所有自然数 $a$，$P_{a,1} = a + 1$。

   ```lean
   example (a : ℕ) : pascal a 1 = a + 1 := by
     sorry
   ```

## 6.6. 除法算法

### 6.6.1. 定义

考虑在整数上递归定义的函数 $\operatorname{mod}$ 和 $\operatorname{div}$：

$$
\begin{split} \operatorname{mod}(n, d) &= \begin{cases} \operatorname{mod}(n + d, d), & nd < 0 \\ \operatorname{mod}(n - d, d), & 0 < d(n-d) \\ 0, & n = d \\ n, & 0 \le nd \le d^2 \text{ 且 } n \ne d \end{cases} \\ \operatorname{div}(n, d) &= \begin{cases} \operatorname{div}(n + d, d) - 1, & nd < 0 \\ \operatorname{div}(n - d, d) + 1, & 0 < d(n-d) \\ 1, & n = d \\ 0, & 0 \le nd \le d^2 \text{ 且 } n \ne d \end{cases} \end{split}
$$

其思路是：$\operatorname{div}$ 计算 $n$ 除以 $d$ 的商（按小学算术意义，产生整数而不是继续进入小数位），$\operatorname{mod}$ 计算 $n$ 除以 $d$ 的余数。例如，

$$
\begin{align}
\begin{aligned}
& & &\qquad & &\operatorname{mod}(11,4) & &\qquad & &\operatorname{div}(11,4) \\
0 &< 4(11-4) & &\qquad & &= \operatorname{mod}(7,4) & &\qquad & &= \operatorname{div}(7,4) + 1 \\
0 &< 4(7-4) & &\qquad & &= \operatorname{mod}(3,4) & &\qquad & &= (\operatorname{div}(3,4) + 1) + 1 \\
0 \le 4 \cdot 3 \le 4^2, 4 &\ne 3 & &\qquad & &= 3 & &\qquad & &= (0 + 1) + 1 \\
& & & & & & & &= 2.
\end{aligned}
\end{align}
$$

（记住 $\operatorname{mod}(a,b)$ 是“余数”函数，在[定义 6.6.1](#661-定义)中定义。）

这些定义是**良基的**，因为每一步定义只依赖于那些表达式 $2n - d$ 的绝对值严格更小的先前项 $\operatorname{mod}(n, d)$、$\operatorname{div}(n, d)$。（这一点不太明显，尽管 Lean 能自动证明。作为合理性检查，

$$
\begin{split} 2 \cdot 11 - 4 &= 18 \\ 2 \cdot 7 - 4 &= 10 \\ 2 \cdot 3 - 4 &= 2 \end{split}
$$

确实严格递减。）下面是它在 Lean 中的样子，良基性说明同样用 `termination_by` 表达。

```lean
def fmod (n d : ℤ) : ℤ :=
  if n * d < 0 then
    fmod (n + d) d
  else if h2 : 0 < d * (n - d) then
    fmod (n - d) d
  else if h3 : n = d then
    0
  else
    n
termination_by _ n d => 2 * n - d

def fdiv (n d : ℤ) : ℤ :=
  if n * d < 0 then
    fdiv (n + d) d - 1
  else if 0 < d * (n - d) then
    fdiv (n - d) d + 1
  else if h3 : n = d then
    1
  else
    0
termination_by _ n d => 2 * n - d
```

让我们检查它们是否按预期工作：

```lean
#eval fmod 11 4 -- infoview 显示 3
#eval fdiv 11 4 -- infoview 显示 2
```

自己计算几个例子（用 Lean 检查），看看你是否相信 $\operatorname{div}$ 和 $\operatorname{mod}$ 分别产生“商”和“余数”。现在让我们把它严格化。

### 6.6.2. 例

**定理**

对任意整数 $n$ 和 $d$，有 $\operatorname{mod}(n, d) + d \cdot \operatorname{div}(n, d) = n$。

**证明**

我们对表达式 $2n - d$ 使用强归纳法证明。假设对所有满足 $|2m - c| < |2n - d|$ 的整数 $m$、$c$，都有 $\operatorname{mod}(m, c) + c \cdot \operatorname{div}(m, c) = m$。

**情形 1**（$nd < 0$）：则由归纳假设

$$
\operatorname{mod}(n+d, d) + d \cdot \operatorname{div}(n+d, d) = n+d,
$$

所以

$$
\begin{split} \operatorname{mod}(n, d) + d \cdot \operatorname{div}(n, d) &= \operatorname{mod}(n+d, d) + d \cdot (\operatorname{div}(n+d, d) - 1) \\ &= (\operatorname{mod}(n+d, d) + d \cdot \operatorname{div}(n+d, d)) - d \\ &= (n+d) - d \\ &= n. \end{split}
$$

**情形 2**（$0 < d(n-d)$）：则由归纳假设

$$
\operatorname{mod}(n-d, d) + d \cdot \operatorname{div}(n-d, d) = n-d,
$$

所以

$$
\begin{split} \operatorname{mod}(n, d) + d \cdot \operatorname{div}(n, d) &= \operatorname{mod}(n-d, d) + d \cdot (\operatorname{div}(n-d, d) + 1) \\ &= (\operatorname{mod}(n-d, d) + d \cdot \operatorname{div}(n-d, d)) + d \\ &= (n-d) + d \\ &= n. \end{split}
$$

**情形 3**（$n = d$）：则

$$
\begin{split} \operatorname{mod}(n, d) + d \cdot \operatorname{div}(n, d) &= 0 + d \cdot 1 \\ &= d \\ &= n. \end{split}
$$

**情形 4**：在此情形，

$$
\begin{split} \operatorname{mod}(n, d) + d \cdot \operatorname{div}(n, d) &= n + d \cdot 0 \\ &= n. \end{split}
$$

```lean
theorem fmod_add_fdiv (n d : ℤ) : fmod n d + d * fdiv n d = n := by
  rw [fdiv, fmod]
  split_ifs with h1 h2 h3 <;> push_neg at *
  · -- case `n * d < 0`
    have IH := fmod_add_fdiv (n + d) d -- inductive hypothesis
    calc fmod (n + d) d + d * (fdiv (n + d) d - 1)
        = (fmod (n + d) d + d * fdiv (n + d) d) - d := by ring
      _ = (n + d) - d := by rw [IH]
      _ = n := by ring
  · -- case `0 < d * (n - d)`
    have IH := fmod_add_fdiv (n - d) d -- inductive hypothesis
    calc fmod (n - d) d + d * (fdiv (n - d) d + 1)
        = (fmod (n - d) d + d * fdiv (n - d) d) + d := by ring
        _ = n := by addarith [IH]
  · -- case `n = d`
    calc 0 + d * 1 = d := by ring
      _ = n := by rw [h3]
  · -- last case
    ring
termination_by _ n d => 2 * n - d
```

### 6.6.3. 例

**定理**

对任意整数 $n$ 和 $d$，若 $d$ 为正，则 $\operatorname{mod}(n, d)$ 非负。

**证明**

我们对表达式 $2n - d$ 使用强归纳法证明。假设对所有满足 $c$ 为正且 $|2m - c| < |2n - d|$ 的整数 $m$、$c$，都有 $\operatorname{mod}(m, c)$ 非负。

**情形 1**（$nd < 0$）：则由归纳假设 $\operatorname{mod}(n, d) = \operatorname{mod}(n + d, d) \ge 0$。

**情形 2**（$0 < d(n-d)$）：则由归纳假设 $\operatorname{mod}(n, d) = \operatorname{mod}(n - d, d) \ge 0$。

**情形 3**（$n = d$）：则 $\operatorname{mod}(n, d) = 0$，所以 $\operatorname{mod}(n, d) \ge 0$。

**情形 4**（$0 \le nd \le d^2$ 且 $n \ne d$）：则由于 $0 \le nd$ 且由假设 $0 < d$，有 $\operatorname{mod}(n, d) = n \ge 0$。

```lean
theorem fmod_nonneg_of_pos (n : ℤ) {d : ℤ} (hd : 0 < d) : 0 ≤ fmod n d := by
  rw [fmod]
  split_ifs with h1 h2 h3 <;> push_neg at *
  · -- case `n * d < 0`
    have IH := fmod_nonneg_of_pos (n + d) hd -- inductive hypothesis
    apply IH
  · -- case `0 < d * (n - d)`
    have IH := fmod_nonneg_of_pos (n - d) hd -- inductive hypothesis
    apply IH
  · -- case `n = d`
    extra
  · -- last case
    cancel d at h1
termination_by _ n d hd => 2 * n - d
```

### 6.6.4. 例

**定理**

对任意整数 $n$ 和 $d$，若 $d$ 为正，则 $\operatorname{mod}(n, d) < d$。

**证明**

我们对表达式 $2n - d$ 使用强归纳法证明。假设对所有满足 $c$ 为正且 $|2m - c| < |2n - d|$ 的整数 $m$、$c$，都有 $\operatorname{mod}(m, c) < c$。

**情形 1**（$nd < 0$）：则由归纳假设 $\operatorname{mod}(n, d) = \operatorname{mod}(n + d, d) < d$。

**情形 2**（$0 < d(n-d)$）：则由归纳假设 $\operatorname{mod}(n, d) = \operatorname{mod}(n - d, d) < d$。

**情形 3**（$n = d$）：则 $\operatorname{mod}(n, d) = 0 < d$（由假设）。

**情形 4**（$0 \le nd \le d^2$ 且 $n \ne d$）：我们有 $n - d \le 0$，因为 $d(n-d) \le 0$ 且由假设 $0 < d$。因此 $n \le d$。又由假设 $n \ne d$。综合得 $n < d$。

```lean
theorem fmod_lt_of_pos (n : ℤ) {d : ℤ} (hd : 0 < d) : fmod n d < d := by
  rw [fmod]
  split_ifs with h1 h2 h3 <;> push_neg at *
  · -- case `n * d < 0`
    have IH := fmod_lt_of_pos (n + d) hd -- inductive hypothesis
    apply IH
  · -- case `0 < d * (n - d)`
    have IH := fmod_lt_of_pos (n - d) hd -- inductive hypothesis
    apply IH
  · -- case `n = d`
    apply hd
  · -- last case
    have h4 :=
    calc 0 ≤ - d * (n - d) := by addarith [h2]
      _ = d * (d - n) := by ring
    cancel d at h4
    apply lt_of_le_of_ne
    · addarith [h4]
    · apply h3
termination_by _ n d hd => 2 * n - d
```

### 6.6.5. 例

把这些合起来，我们可以证明如下定理。这个定理为 `mod_cases` 策略提供了依据，我们从[例 3.4.4](03_Parity_and_Divisibility.md#例-344)起就一直在使用它：可以把整数 $a$ 按正整数 $b$ 取模后只列出有限多种可能。

**定理**

设 $a$、$b$ 是整数，$b$ 为正。则存在整数 $r$ 满足 $0 \le r < b$ 且 $a \equiv r \pmod b$。

**证明**

我们证明整数 $\operatorname{mod}(a,b)$ 具有这个性质。事实上，由[例 6.6.3](#663-例)和[例 6.6.4](#664-例)，$0 \le \operatorname{mod}(a,b) < b$，且由[例 6.6.2](#662-例)，

$$
\operatorname{mod}(a, b) + b \cdot \operatorname{div}(a, b) = a,
$$

所以

$$
a - \operatorname{mod}(a, b) = b \cdot \operatorname{div}(a, b),
$$

所以

$$
a \equiv \operatorname{mod}(a, b) \pmod b.
$$

```lean
example (a b : ℤ) (h : 0 < b) : ∃ r : ℤ, 0 ≤ r ∧ r < b ∧ a ≡ r [ZMOD b] := by
  use fmod a b
  constructor
  · apply fmod_nonneg_of_pos a h
  constructor
  · apply fmod_lt_of_pos a h
  · use fdiv a b
    have Hab : fmod a b + b * fdiv a b = a := fmod_add_fdiv a b
    addarith [Hab]
```

### 6.6.6. 练习

1. 证明[例 6.6.4](#664-例)在 $d$ 为负数时的类似结论：对任意整数 $n$ 和 $d$，若 $d$ 为负，则 $d < \operatorname{mod}(n, d)$。

   ```lean
   theorem lt_fmod_of_neg (n : ℤ) {d : ℤ} (hd : d < 0) : d < fmod n d := by
     sorry
   ```

2. 考虑在整数上递归定义的函数 $T$：

   $$
   T(n)= \begin{cases} T(1-n)+2n-1, & 0 < n \\ T(-n), & n < 0 \\ 0 & n = 0. \end{cases}
   $$

   这个递归定义是良基的，因为其自引用在 $|3n-1|$ 上严格递减。

   证明对所有整数 $n$，$T(n) = n^2$。

   ```lean
   def T (n : ℤ) : ℤ :=
     if 0 < n then
       T (1 - n) + 2 * n - 1
     else if 0 < - n then
       T (-n)
     else
       0
   termination_by T n => 3 * n - 1

   theorem T_eq (n : ℤ) : T n = n ^ 2 := by
     sorry
   ```

3. 设 $a$、$b$ 是整数，$b$ 为正。证明存在唯一的整数 $r$ 满足 $0 \le r < b$ 且 $a \equiv r \pmod b$。

   这个定理是[例 6.6.5](#665-例)的加强版，同时断言唯一性和存在性。我们在[例 4.3.4](04_Proofs_with_Structure_II.md#例-434)中未加证明地陈述过它（Lean 名为 `Int.existsUnique_modEq_lt`），并且每当我们推出涉及“显然不同余”的矛盾时，都在隐式使用它，如[例 4.4.3](04_Proofs_with_Structure_II.md#例-443)。

   建议方法：先把下面的结论写成独立定理 `uniqueness` 并证明它，大致按照[例 4.3.4](04_Proofs_with_Structure_II.md#例-434)中特殊情形的证明：

   > 设 $a$、$b$ 是整数，$b$ 为正。设 $r$、$s$ 都是满足 $0 \le r < b$、$0 \le s < b$ 且都与 $a$ 模 $b$ 同余的整数。证明它们相等。

   然后把所有部分拼起来，结合[例 6.6.5](#665-例)的论证。

   ```lean
   theorem uniqueness (a b : ℤ) (h : 0 < b) {r s : ℤ}
       (hr : 0 ≤ r ∧ r < b ∧ a ≡ r [ZMOD b])
       (hs : 0 ≤ s ∧ s < b ∧ a ≡ s [ZMOD b]) : r = s := by
     sorry

   example (a b : ℤ) (h : 0 < b) : ∃! r : ℤ, 0 ≤ r ∧ r < b ∧ a ≡ r [ZMOD b] := by
     sorry
   ```

## 6.7. 欧几里得算法

### 6.7.1. 定义

**定义**

两个整数的 $\operatorname{gcd}$ 函数递归定义如下：

$$
\operatorname{gcd}(a,b)= \begin{cases} \operatorname{gcd}(b,\operatorname{mod}(a,b)) & 0 < b \\ \operatorname{gcd}(b,\operatorname{mod}(a,-b)) & b < 0 \\ a & b=0\text{ 且 }0\le a \\ -a & b=0\text{ 且 }a<0. \end{cases}
$$

让我们练习计算 $\operatorname{gcd}$ 函数。我们计算 $\operatorname{gcd}(-21, 15)$：

$$
\begin{align}
\begin{aligned}
\operatorname{mod}(-21,15) &= 9 & &\qquad & \operatorname{gcd}(-21,15) &= \operatorname{gcd}(15,9) \\
\operatorname{mod}(15,9) &= 6 & &\qquad & &= \operatorname{gcd}(9,6) \\
\operatorname{mod}(9,6) &= 3 & &\qquad & &= \operatorname{gcd}(6,3) \\
\operatorname{mod}(6,3) &= 0 & &\qquad & &= \operatorname{gcd}(3,0) \\
& & & & &= 3.
\end{aligned}
\end{align}
$$

（记住 $\operatorname{mod}(a,b)$ 是[定义 6.6.1](#661-定义)中定义的“余数”函数。）

与[定义 6.5.1](#651-定义)和[定义 6.6.1](#661-定义)一样，我们需要论证这个递归定义是**良基的**，即这个过程总会终止。和那几个小节一样，我们提供一个量，它随着过程进行在绝对值上严格减小。这里这个量就是 $b$，即两个数中的第二个（注意在上面的例子中 $b$ 依次是 15、9、6、3、0，确实在递减。）

这导致下面这个 $\operatorname{gcd}$ 的 Lean 定义尝试，其中子句 `termination_by _ a b => b` 表示 $b$ 是良基性的大小量。

```lean
def gcd (a b : ℤ) : ℤ :=
  if 0 < b then
    gcd b (fmod a b)
  else if b < 0 then
    gcd b (fmod a (-b))
  else if 0 ≤ a then
    a
  else
    -a
termination_by _ a b => b
```

但与[6.5 节](#65-帕斯卡三角形)和[6.6 节](#66-除法算法)不同，这个定义还不完整：$b$ 沿递归递减这一事实“不够显然”，需要显式证明。

**命题**

递归定义 $\operatorname{gcd}$ 是良基的。

**证明**

需要检查两件事：

1. **若 $0 < b$ 则 $-b < \operatorname{mod}(a,b) < b$**：由[例 6.6.3](#663-例)和[例 6.6.4](#664-例)，$0 \le \operatorname{mod}(a,b) < b$，上界直接成立；下界因为

   $$
   \begin{split} -b &< 0 \\ &\le \operatorname{mod}(a,b). \end{split}
   $$

2. **若 $b < 0$ 则 $b < \operatorname{mod}(a,-b) < -b$**：我们有 $0 < -b$，所以由[例 6.6.3](#663-例)和[例 6.6.4](#664-例)，$0 \le \operatorname{mod}(a,-b) < -b$，上界直接成立；下界因为

   $$
   \begin{split} b &< 0 \\ &\le \operatorname{mod}(a,-b). \end{split}
   $$

在 Lean 中，我们分别陈述并证明这些事实，并用属性 `@[decreasing]` 标记它们，这样后续定义 `gcd` 就可以调用它们来证明良基性。检查一下，如果省略它们，定义会报错。

```lean
@[decreasing] theorem lower_bound_fmod1 (a b : ℤ) (h1 : 0 < b) : -b < fmod a b := by
  have H : 0 ≤ fmod a b
  · apply fmod_nonneg_of_pos
    apply h1
  calc -b < 0 := by addarith [h1]
    _ ≤ _ := H

@[decreasing] theorem lower_bound_fmod2 (a b : ℤ) (h1 : b < 0) : b < fmod a (-b) := by
  have H : 0 ≤ fmod a (-b)
  · apply fmod_nonneg_of_pos
    addarith [h1]
  have h2 : 0 < -b := by addarith [h1]
  calc b < 0 := h1
    _ ≤ fmod a (-b) := H

@[decreasing] theorem upper_bound_fmod2 (a b : ℤ) (h1 : b < 0) : fmod a (-b) < -b := by
  apply fmod_lt_of_pos
  addarith [h1]

@[decreasing] theorem upper_bound_fmod1 (a b : ℤ) (h1 : 0 < b) : fmod a b < b := by
  apply fmod_lt_of_pos
  apply h1
```

之后，Lean 定义 `gcd` 就能成功通过。合理性检查：Lean 定义是否与我们上面手算的 $\operatorname{gcd}(-21, 15)$ 一致？

```lean
#eval gcd (-21) 15 -- infoview 显示 3
```

### 6.7.2. 例

关于 $\operatorname{gcd}$ 的每个事实都将用强归纳法证明，使用同样的良基性依据。

**命题**

对所有整数 $a$ 和 $b$，整数 $\operatorname{gcd}(a,b)$ 非负。

**证明**

我们对 $b$ 用强归纳法证明。假设对所有满足 $|y| < |b|$ 的整数 $x$、$y$，都有 $0 \le \operatorname{gcd}(x, y)$。

**情形 1**（$0 < b$）：则 $\operatorname{gcd}(a,b)$ 等于 $\operatorname{gcd}(b, \operatorname{mod}(a,b))$，由归纳假设它非负。

**情形 2**（$b < 0$）：则 $\operatorname{gcd}(a,b)$ 等于 $\operatorname{gcd}(b, \operatorname{mod}(a,-b))$，由归纳假设它非负。

**情形 3**（$b = 0$，$0 \le a$）：则 $\operatorname{gcd}(a,b) = a \ge 0$。

**情形 4**（$b = 0$，$a < 0$）：则 $\operatorname{gcd}(a,b) = -a \ge 0$。

```lean
theorem gcd_nonneg (a b : ℤ) : 0 ≤ gcd a b := by
  rw [gcd]
  split_ifs with h1 h2 ha <;> push_neg at *
  · -- case `0 < b`
    have IH := gcd_nonneg b (fmod a b) -- inductive hypothesis
    apply IH
  · -- case `b < 0`
    have IH := gcd_nonneg b (fmod a (-b)) -- inductive hypothesis
    apply IH
  · -- case `b = 0`, `0 ≤ a`
    apply ha
  · -- case `b = 0`, `a < 0`
    addarith [ha]
termination_by _ a b => b
```

### 6.7.3. 例

**命题**

对所有整数 $a$ 和 $b$，整数 $\operatorname{gcd}(a,b)$ 既是 $a$ 的因子也是 $b$ 的因子。

也就是说，$\operatorname{gcd}(a,b)$ 是 $a$ 和 $b$ 的一个**公因子**。我们稍后将证明（见练习）它事实上是 $a$ 和 $b$ 的**最大公因子**，因此缩写为 GCD。

**证明**

我们对 $b$ 用强归纳法证明。假设对所有满足 $|y| < |b|$ 的整数 $x$、$y$，都有 $0 \le \operatorname{gcd}(x, y)$。

**情形 1**（$0 < b$）：令 $q = \operatorname{div}(a,b)$，$r = \operatorname{mod}(a,b)$，所以 $a = r + bq$（由[例 6.6.2](#662-例)）。

则由递归定义，$\operatorname{gcd}(a,b)$ 等于 $\operatorname{gcd}(b,r)$，由归纳假设它整除 $b$ 和 $r$。我们需要证明它整除 $b$（这是显然的）和 $a$，下面转向后者。

由于 $\operatorname{gcd}(a,b) \mid b$，存在整数 $k$ 使得 $b = \operatorname{gcd}(a,b) k$；由于 $\operatorname{gcd}(a,b) \mid r$，存在整数 $l$ 使得 $r = \operatorname{gcd}(a,b) l$。于是

$$
\begin{split} a &= r + bq \\ &= \operatorname{gcd}(a,b) l + (\operatorname{gcd}(a,b) k) q \\ &= \operatorname{gcd}(a,b) \cdot (l + kq), \end{split}
$$

所以 $\operatorname{gcd}(a,b) \mid a$。

**情形 2**（$b < 0$）：令 $q = \operatorname{div}(a,-b)$，$r = \operatorname{mod}(a,-b)$，所以 $a = r + (-b)q$（由[例 6.6.2](#662-例)）。

则由递归定义，$\operatorname{gcd}(a,b)$ 等于 $\operatorname{gcd}(b,r)$，由归纳假设它整除 $b$ 和 $r$。我们需要证明它整除 $b$（这是显然的）和 $a$，下面转向后者。

由于 $\operatorname{gcd}(a,b) \mid b$，存在整数 $k$ 使得 $b = \operatorname{gcd}(a,b) k$；由于 $\operatorname{gcd}(a,b) \mid r$，存在整数 $l$ 使得 $r = \operatorname{gcd}(a,b) l$。于是

$$
\begin{split} a &= r + (-b)q \\ &= \operatorname{gcd}(a,b) l + (-\operatorname{gcd}(a,b) k) q \\ &= \operatorname{gcd}(a,b) \cdot (l - kq), \end{split}
$$

所以 $\operatorname{gcd}(a,b) \mid a$。

**情形 3**（$b = 0$，$0 \le a$）：则 $\operatorname{gcd}(a,b) = a$，它是 $a$ 的因子因为 $a \cdot 1 = a$；它也是 $b$ 的因子因为

$$
\begin{split} b &= 0 \\ &= 0 \cdot a. \end{split}
$$

**情形 4**（$b = 0$，$a < 0$）：则 $\operatorname{gcd}(a,b) = -a$，它是 $a$ 的因子因为 $-a \cdot -1 = a$；它也是 $b$ 的因子因为

$$
\begin{split} b &= 0 \\ &= 0 \cdot -a. \end{split}
$$

在 Lean 中，可以用“且”目标的结构来组织这个证明，如下：（`_` 只是占位符，展示基本结构。）

```lean
theorem gcd_dvd (a b : ℤ) : gcd a b ∣ b ∧ gcd a b ∣ a := by
  rw [gcd]
  split_ifs with h1 h2 <;> push_neg at *
  · -- case `0 < b`
    have IH : _ ∧ _ := gcd_dvd b (fmod a b) -- inductive hypothesis
    obtain ⟨IH_right, IH_left⟩ := IH
    constructor
    · -- prove that `gcd a b ∣ b`
      sorry
    · -- prove that `gcd a b ∣ a`
      sorry
  · -- case `b < 0`
    have IH : _ ∧ _ := gcd_dvd b (fmod a (-b)) -- inductive hypothesis
    obtain ⟨IH_right, IH_left⟩ := IH
    constructor
    · -- prove that `gcd a b ∣ b`
      sorry
    · -- prove that `gcd a b ∣ a`
      sorry
  · -- case `b = 0`, `0 ≤ a`
    constructor
    · -- prove that `gcd a b ∣ b`
      sorry
    · -- prove that `gcd a b ∣ a`
      sorry
  · -- case `b = 0`, `a < 0`
    constructor
    · -- prove that `gcd a b ∣ b`
      sorry
    · -- prove that `gcd a b ∣ a`
      sorry
termination_by gcd_dvd a b => b
```

但不断在“证明 $\operatorname{gcd}(a,b) \mid b$”和“证明 $\operatorname{gcd}(a,b) \mid a$”之间切换有点难以跟踪。更优雅的设置是用两个独立引理，一个证明 $\operatorname{gcd}(a,b) \mid b$，一个证明 $\operatorname{gcd}(a,b) \mid a$，结构如下：

```lean
theorem gcd_dvd_right (a b : ℤ) : gcd a b ∣ b := by
  rw [gcd]
  split_ifs with h1 h2 <;> push_neg at *
  · -- case `0 < b`
    have IH := gcd_dvd_left b (fmod a b) -- inductive hypothesis
  · -- case `b < 0`
    have IH := gcd_dvd_left b (fmod a (-b)) -- inductive hypothesis
  · -- case `b = 0`, `0 ≤ a`
    sorry
  · -- case `b = 0`, `a < 0`
    sorry

theorem gcd_dvd_left (a b : ℤ) : gcd a b ∣ a := by
  rw [gcd]
  split_ifs with h1 h2 <;> push_neg at *
  · -- case `0 < b`
    have IH1 := gcd_dvd_left b (fmod a b) -- inductive hypothesis
    have IH2 := gcd_dvd_right b (fmod a b) -- inductive hypothesis
    sorry
  · -- case `b < 0`
    have IH1 := gcd_dvd_left b (fmod a (-b)) -- inductive hypothesis
    have IH2 := gcd_dvd_right b (fmod a (-b)) -- inductive hypothesis
    sorry
  · -- case `b = 0`, `0 ≤ a`
    sorry
  · -- case `b = 0`, `a < 0`
    sorry
```

但现在强归纳结构变得复杂：`gcd_dvd_right` 的证明依赖于更小 $a,b$ 处的 `gcd_dvd_left`，而 `gcd_dvd_left` 的证明又依赖于更小 $a,b$ 处的 `gcd_dvd_right`。这称为**相互归纳**，在 Lean 中有特殊语法：两个定理放在 `mutual` 块中，末尾给出联合终止说明，如下：

```lean
mutual

theorem gcd_dvd_right (a b : ℤ) : gcd a b ∣ b := by
  ...

theorem gcd_dvd_left (a b : ℤ) : gcd a b ∣ a := by
  ...

end
termination_by gcd_dvd_right a b => b ; gcd_dvd_left a b => b
```

下面是完整的 Lean 证明。

```lean
mutual
theorem gcd_dvd_right (a b : ℤ) : gcd a b ∣ b := by
  rw [gcd]
  split_ifs with h1 h2 <;> push_neg at *
  · -- case `0 < b`
    apply gcd_dvd_left b (fmod a b) -- inductive hypothesis
  · -- case `b < 0`
    apply gcd_dvd_left b (fmod a (-b)) -- inductive hypothesis
  · -- case `b = 0`, `0 ≤ a`
    have hb : b = 0 := le_antisymm h1 h2
    use 0
    calc b = 0 := hb
      _ = a * 0 := by ring
  · -- case `b = 0`, `a < 0`
    have hb : b = 0 := le_antisymm h1 h2
    use 0
    calc b = 0 := hb
      _ = -a * 0 := by ring

theorem gcd_dvd_left (a b : ℤ) : gcd a b ∣ a := by
  rw [gcd]
  split_ifs with h1 h2 <;> push_neg at *
  · -- case `0 < b`
    have IH1 := gcd_dvd_left b (fmod a b) -- inductive hypothesis
    have IH2 := gcd_dvd_right b (fmod a b) -- inductive hypothesis
    obtain ⟨k, hk⟩ := IH1
    obtain ⟨l, hl⟩ := IH2
    have H : fmod a b + b * fdiv a b = a := fmod_add_fdiv a b
    set q := fdiv a b
    set r := fmod a b
    use l + k * q
    calc a = r + b * q := by rw [H]
      _ = gcd b r * l + (gcd b r * k) * q := by rw [← hk, ← hl]
      _ = gcd b r * (l + k * q) := by ring
  · -- case `b < 0`
    have IH1 := gcd_dvd_left b (fmod a (-b)) -- inductive hypothesis
    have IH2 := gcd_dvd_right b (fmod a (-b)) -- inductive hypothesis
    obtain ⟨k, hk⟩ := IH1
    obtain ⟨l, hl⟩ := IH2
    have H := fmod_add_fdiv a (-b)
    set q := fdiv a (-b)
    set r := fmod a (-b)
    use l - k * q
    calc a = r + (-b) * q := by rw [H]
      _ = gcd b r * l + (- (gcd b r * k)) * q := by rw [← hk, ← hl]
      _ = gcd b r * (l - k * q) := by ring
  · -- case `b = 0`, `0 ≤ a`
    use 1
    ring
  · -- case `b = 0`, `a < 0`
    use -1
    ring

end
termination_by gcd_dvd_right a b => b ; gcd_dvd_left a b => b
```

上面的证明中出现了一个新策略 `set`，它为一个长表达式引入一个短名字（通常是你厌倦反复完整输入的表达式）。注意使用前后目标状态的变化。

### 6.7.4. 定义

[定义 6.7.1](#671-定义)中描述的过程通常称为**欧几里得算法**。还有一种称为**扩展欧几里得算法**的过程，用于在计算 $\operatorname{gcd}(a,b)$ 的同时计算另外两个函数，我们称之为 $L(a,b)$ 和 $R(a,b)$。

**定义**

两个整数的函数 $L$ 和 $R$ 如下相互递归定义：

$$
\begin{split} L(a,b) &= \begin{cases} R(b,\operatorname{mod}(a,b)) & 0 < b \\ R(b,\operatorname{mod}(a,-b)) & b < 0 \\ 1 & b=0\text{ 且 }0\le a \\ -1 & b=0\text{ 且 }a < 0. \end{cases} \\ R(a,b) &= \begin{cases} L(b,\operatorname{mod}(a,b)) - \operatorname{div}(a,b) R(b,\operatorname{mod}(a,b)) & 0 < b \\ L(b,\operatorname{mod}(a,-b)) + \operatorname{div}(a,-b) R(b,\operatorname{mod}(a,-b)) & b < 0 \\ 0 & b=0. \end{cases} \\ \end{split}
$$

让我们在同一个例子（$a = -21$，$b = 15$）上练习同时计算 $\operatorname{gcd}(a,b)$、$L(a,b)$ 和 $R(a,b)$，与[定义 6.7.1](#671-定义)中的例子相同。

由于递归过程中同时需要 $\operatorname{div}$ 和 $\operatorname{mod}$，最好提前把它们一起算出来：

$$
\begin{split} -21 &= 9 + 15 \cdot (-2) \\ 15 &= 6 + 9 \cdot 1 \\ 9 &= 3 + 6 \cdot 1 \\ 6 &= 0 + 3 \cdot 2. \end{split}
$$

（这张表简记了 $\operatorname{div}(-21,15) = -2$、$\operatorname{mod}(-21,15) = 9$ 等。）我们立即得到

$$
\begin{split} \operatorname{gcd}(-21,15) &= \operatorname{gcd}(15,9) \\ &= \operatorname{gcd}(9,6) \\ &= \operatorname{gcd}(6,3) \\ &= \operatorname{gcd}(3,0) \\ &= 3, \end{split}
$$

和之前一样。为了计算 $L(a,b)$ 和 $R(a,b)$，反向推算更方便：

$$
\begin{align}
\begin{aligned}
L(3,0) &= 1 & \qquad R(3,0) &= 0 \\
L(6,3) &= R(3,0) & \qquad R(6,3) &= L(3,0) - \operatorname{div}(6,3) R(3,0) \\
&= 0 & \qquad &= 1 - 2 \cdot 0 \\
& & \qquad &= 1 \\
L(9,6) &= R(6,3) & \qquad R(9,6) &= L(6,3) - \operatorname{div}(9,6) R(6,3) \\
&= 1 & \qquad &= 0 - 1 \cdot 1 \\
& & \qquad &= -1 \\
L(15,9) &= R(9,6) & \qquad R(15,9) &= L(9,6) - \operatorname{div}(15,9) R(9,6) \\
&= -1 & \qquad &= 1 - 1 \cdot (-1) \\
& & \qquad &= 2 \\
L(-21,15) &= R(15,9) & \qquad R(-21,15) &= L(15,9) - \operatorname{div}(-21,15) R(15,9) \\
&= 2 & \qquad &= -1 - (-2) \cdot 2 \\
& & \qquad &= 3
\end{aligned}
\end{align}
$$

在 Lean 中，这种相互递归定义看起来与[例 6.7.3](#673-例)中的相互归纳证明类似；和那个例子一样，它被放在标记为 `mutual` 的块中。

```lean
mutual

def L (a b : ℤ) : ℤ :=
  if 0 < b then
    R b (fmod a b)
  else if b < 0 then
    R b (fmod a (-b))
  else if 0 ≤ a then
    1
  else
    -1

def R (a b : ℤ) : ℤ :=
  if 0 < b then
    L b (fmod a b) - (fdiv a b) * R b (fmod a b)
  else if b < 0 then
    L b (fmod a (-b)) + (fdiv a (-b)) * R b (fmod a (-b))
  else
    0

end
termination_by L a b => b ; R a b => b
```

合理性检查：Lean 定义是否与我们手算的 $L(-21,15)$ 和 $R(-21,15)$ 一致？

```lean
#eval L (-21) 15 -- infoview 显示 2
#eval R (-21) 15 -- infoview 显示 3
```

### 6.7.5. 例

定义 $L(a,b)$ 和 $R(a,b)$ 的原因是它们满足如下恒等式。

**定理**

对所有整数 $a$ 和 $b$，

$$
L(a,b)a + R(a,b)b = \operatorname{gcd}(a,b).
$$

**证明**

我们对 $b$ 用强归纳法证明。假设对所有满足 $|y| < |b|$ 的整数 $x$、$y$，都有 $0 \le \operatorname{gcd}(x, y)$。

**情形 1**（$0 < b$）：令 $q = \operatorname{div}(a,b)$，$r = \operatorname{mod}(a,b)$，所以 $a = r + bq$（由[例 6.6.2](#662-例)）。

则由递推定义，

$$
\begin{split} \operatorname{gcd}(a,b) &= \operatorname{gcd}(b,r) \\ L(a,b) &= R(b,r) \\ R(a,b) &= L(b,r) - qR(b,r) \end{split}
$$

且由归纳假设 $L(b,r)b + R(b,r)r = \operatorname{gcd}(b,r)$。所以

$$
\begin{split} L(a,b)a + R(a,b)b &= R(b,r)a + (L(b,r) - qR(b,r))b \\ &= R(b,r)(r + bq) + (L(b,r) - qR(b,r))b \\ &= R(b,r)r + L(b,r)b \\ &= \operatorname{gcd}(b,r) \\ &= \operatorname{gcd}(a,b). \end{split}
$$

**情形 2**（$b < 0$）：令 $q = \operatorname{div}(a,-b)$，$r = \operatorname{mod}(a,-b)$，所以 $a = r + (-b)q$（由[例 6.6.2](#662-例)）。

则由递推定义，

$$
\begin{split} \operatorname{gcd}(a,b) &= \operatorname{gcd}(b,r) \\ L(a,b) &= R(b,r) \\ R(a,b) &= L(b,r) + qR(b,r) \end{split}
$$

且由归纳假设 $L(b,r)b + R(b,r)r = \operatorname{gcd}(b,r)$。所以

$$
\begin{split} L(a,b)a + R(a,b)b &= R(b,r)a + (L(b,r) + qR(b,r))b \\ &= R(b,r)(r + (-b)q) + (L(b,r) + qR(b,r))b \\ &= R(b,r)r + L(b,r)b \\ &= \operatorname{gcd}(b,r) \\ &= \operatorname{gcd}(a,b). \end{split}
$$

**情形 3**（$b = 0$，$0 \le a$）：则由递推定义，$\operatorname{gcd}(a,b) = a$，$L(a,b) = 1$，$R(a,b) = 0$，所以

$$
\begin{split} L(a,b)a + R(a,b)b &= 1 \cdot a + 0 \cdot b \\ &= a \\ &= \operatorname{gcd}(a,b). \end{split}
$$

**情形 4**（$b = 0$，$a < 0$）：则由递推定义，$\operatorname{gcd}(a,b) = -a$，$L(a,b) = -1$，$R(a,b) = 0$，所以

$$
\begin{split} L(a,b)a + R(a,b)b &= -1 \cdot -a + 0 \cdot b \\ &= a \\ &= \operatorname{gcd}(a,b). \end{split}
$$

下面是同一个证明在 Lean 中的写法。

```lean
theorem L_mul_add_R_mul (a b : ℤ) : L a b * a + R a b * b = gcd a b := by
  rw [R, L, gcd]
  split_ifs with h1 h2 <;> push_neg at *
  · -- case `0 < b`
    have IH := L_mul_add_R_mul b (fmod a b) -- inductive hypothesis
    have H : fmod a b + b * fdiv a b = a := fmod_add_fdiv a b
    set q := fdiv a b
    set r := fmod a b
    calc R b r * a + (L b r - q * R b r) * b
        = R b r * (r + b * q) + (L b r - q * R b r) * b:= by rw [H]
      _ = L b r * b + R b r * r := by ring
      _ = gcd b r := IH
  · -- case `b < 0`
    have IH := L_mul_add_R_mul b (fmod a (-b)) -- inductive hypothesis
    have H : fmod a (-b) + (-b) * fdiv a (-b) = a := fmod_add_fdiv a (-b)
    set q := fdiv a (-b)
    set r := fmod a (-b)
    calc  R b r * a + (L b r + q * R b r) * b
        =  R b r * (r + -b * q) + (L b r + q * R b r) * b := by rw [H]
      _ = L b r * b + R b r * r := by ring
      _ = gcd b r := IH
  · -- case `b = 0`, `0 ≤ a`
    ring
  · -- case `b = 0`, `a < 0`
    ring
termination_by L_mul_add_R_mul a b => b
```

### 6.7.6. 例

我们在[例 6.7.5](#675-例)中证明了对任意整数 $a$ 和 $b$，整数 $L(a,b)$ 和 $R(a,b)$ 满足

$$
L(a,b)a + R(a,b)b = \operatorname{gcd}(a,b).
$$

例如，$L(7,5) = -2$，$R(7,5) = 3$，$\operatorname{gcd}(7,5) = 1$

```lean
#eval L 7 5 -- infoview 显示 -2
#eval R 7 5 -- infoview 显示 3
#eval gcd 7 5 -- infoview 显示 1
```

且 $(-2) \cdot 7 + 3 \cdot 5 = 1$。

但值得注意的是，这通常不是唯一具有该性质的整数对。例如，

$$
\begin{split} 3 \cdot 7 + (-4) \cdot 5 &= 1 \\ (-7) \cdot 7 + 10 \cdot 5 &= 1 \\ 8 \cdot 7 + (-11) \cdot 5 &= 1 \\ &\ldots \end{split}
$$

在应用中，通常只需要这个性质，而不需要 $L(a,b)$ 和 $R(a,b)$ 的特定构造。所以我们把它单独记录下来。这一事实称为**贝祖恒等式**（Bézout’s identity）。

**推论（贝祖恒等式）**

设 $a$、$b$ 是整数。则存在整数 $x$、$y$ 使得 $xa + yb = \operatorname{gcd}(a,b)$。

**证明**

由[例 6.7.5](#675-例)，整数 $L(a,b)$ 和 $R(a,b)$ 具有这个性质。

```lean
theorem bezout (a b : ℤ) : ∃ x y : ℤ, x * a + y * b = gcd a b := by
  use L a b, R a b
  apply L_mul_add_R_mul
```

### 6.7.7. 练习

1. 证明 $\operatorname{gcd}(a,b)$ 不仅是 $a$ 和 $b$ 的**公因子**（见[例 6.7.3](#673-例)），而且是它们的**最大公因子**：如果 $d$ 是同时整除 $a$ 和 $b$ 的整数，则 $d$ 也整除 $\operatorname{gcd}(a,b)$。

   这个问题不需要归纳；它是贝祖恒等式（[例 6.7.6](#676-例)）的直接推论。

   ```lean
   theorem gcd_maximal {d a b : ℤ} (ha : d ∣ a) (hb : d ∣ b) : d ∣ gcd a b := by
     sorry
   ```
