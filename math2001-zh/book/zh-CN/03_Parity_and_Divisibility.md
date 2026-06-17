# 第 3 章 奇偶与整除

> 本译文对应原书 [Parity and divisibility](https://hrmacbeth.github.io/math2001/03_Parity_and_Divisibility.html)；英文 Sphinx 源：`03_Parity_and_Divisibility.rst.txt`。

本章问题涉及自然数与整数的一些初等性质：**奇偶**（parity，即一个数是**偶**（even）还是**奇**（odd））、**整除**（divisibility），以及**模同余**（congruence modulo）$n$。

本章没有 $\lor$、$\exists$ 等新逻辑符号，推理工具箱也没有重大增补（例如中间步骤或引理的新用法）。因此本章在艰苦的 [第 2 章](02_Proofs_with_Structure.md) 与 [第 4 章](04_Proofs_with_Structure_II.md) 之间起到缓冲作用，让你巩固已学内容。

## 3.1 定义；奇偶

### 3.1.1 例题

数学术语首次引入时会给出定义。

**定义**

整数 $a$ 是**奇**（odd）的，若存在整数 $k$，使得 $a=2k+1$。

在 Lean 中定义如下。

```lean
def Odd (a : ℤ) : Prop := ∃ k, a = 2 * k + 1
```

在纸笔证明中，你必须记住每个定义；这对运用它们至关重要。在 Lean 中，若你想核对某术语的定义，可右键（Windows）/双指点击（Mac）选择「Go to Definition」（转到定义），会跳转到 Lean 代码中该定义所在处。（快捷键 `Ctrl`-`-` 可从定义处返回先前的工作位置。）

**问题**

证明 $7$ 是奇数。

**解**

$7=2\cdot 3+1$，故 $7$ 是奇数。

本题在 Lean 中如下。

```lean
example : Odd (7:ℤ) := by
  sorry
```

初始目标状态为：

```
⊢ Odd 7
```

可在证明中用 `dsimp`（「definitional-simplify」，定义化简）策略核对定义。此处可在证明中输入 `dsimp [Odd]`，将「奇」的定义展开：

```lean
example : Odd (7:ℤ) := by
  dsimp [Odd]
```

之后目标用「奇」的定义而非单词「odd」显示：

```
⊢ ∃ (k : ℤ), 7 = 2 * k + 1
```

这是可选的；若删除 `dsimp` 行，证明仍可完成。

下面是该解的完整 Lean 翻译。

```lean
example : Odd (7 : ℤ) := by
  dsimp [Odd]
  use 3
  numbers
```

若你不太跟得上证明——无论是文字版还是 Lean 版——请重读 [第 2.5 节](02_Proofs_with_Structure.md#25-存在exists证明) 的一些例题，例如 [例题 2.5.3](02_Proofs_with_Structure.md#253-例题)。

### 3.1.2 例题

下面是一个类似例题。

**问题**

证明 $-3$ 是奇数。

```lean
example : Odd (-3 : ℤ) := by
  sorry
```

你应证明 $-3=2k+1$ 对某个整数 $k$ 成立。但哪个 $k$ 可行？

### 3.1.3 例题

**问题**

设 $n$ 为整数。证明若 $n$ 为奇，则 $3n+2$ 为奇。

**解**

设 $n$ 为奇。则存在整数 $k$ 使得 $n = 2k+1$。于是

$$
\begin{aligned}
3 n + 2 &= 3 (2 k + 1) + 2 \\
&= 2 (3 k + 2) + 1,
\end{aligned}
$$

故 $3n+2$ 为奇。

Lean 版问题初始目标状态如下。

```
n : ℤ
hn : Odd n
⊢ Odd (3 * n + 2)
```

若想在目标中展开定义 `Odd`，可用 `dsimp [Odd]`，如 [例题 3.1.1](#311-例题) 所述。若想在处处（目标与假设）展开 `Odd`，可用 `dsimp [Odd] at *`。之后目标状态为：

```
n : ℤ
hn : ∃ (k : ℤ), n = 2 * k + 1
⊢ ∃ (k : ℤ), 3 * n + 2 = 2 * k + 1
```

这是我们首次遇到可能令人困惑之处。存在量词内的变量是「一次性」变量，只在该句存续期间存在。因此同一变量可能在目标状态中多次出现，却未必指同一事物。此处假设 `hn` 中的 `k` 与目标中的 `k` 不同；它们只是展开「奇」的定义时的默认名称。

```lean
example {n : ℤ} (hn : Odd n) : Odd (3 * n + 2) := by
  dsimp [Odd] at *
  obtain ⟨k, hk⟩ := hn
  use 3 * k + 2
  calc
    3 * n + 2 = 3 * (2 * k + 1) + 2 := by rw [hk]
    _ = 2 * (3 * k + 2) + 1 := by ring
```

再次说明，`dsimp` 行在解中并非必需。

### 3.1.4 例题

**问题**

设 $n$ 为整数。证明若 $n$ 为奇，则 $7n-4$ 为奇。

```lean
example {n : ℤ} (hn : Odd n) : Odd (7 * n - 4) := by
  sorry
```

### 3.1.5 例题

**问题**

证明若整数 $x$ 与 $y$ 均为奇，则 $x+y+1$ 为奇。

**解**

因 $x$ 与 $y$ 为奇，存在整数 $a$ 使得 $x=2a+1$，且存在整数 $b$ 使得 $y=2b+1$。则

$$
\begin{aligned}
x + y + 1 &= (2 a + 1) + (2 b + 1) + 1 \\
&= 2  (a + b + 1) + 1,
\end{aligned}
$$

故 $x+y+1$ 为奇。

```lean
example {x y : ℤ} (hx : Odd x) (hy : Odd y) : Odd (x + y + 1) := by
  obtain ⟨a, ha⟩ := hx
  obtain ⟨b, hb⟩ := hy
  use a + b + 1
  calc
    x + y + 1 = 2 * a + 1 + (2 * b + 1) + 1 := by rw [ha, hb]
    _ = 2 * (a + b + 1) + 1 := by ring
```

### 3.1.6 例题

**问题**

证明若整数 $x$ 与 $y$ 均为奇，则 $xy+2y$ 为奇。

**解**

因 $x$ 与 $y$ 为奇，存在整数 $a$ 使得 $x=2a+1$，且存在整数 $b$ 使得 $y=2b+1$。则

$$
\begin{aligned}
x y + 2 y &= (2 a + 1)  (2 b + 1) + 2 (2 b + 1) \\
&= 2  (2 a b + 3 b + a + 1) + 1,
\end{aligned}
$$

故 $xy+2y$ 为奇。

```lean
example {x y : ℤ} (hx : Odd x) (hy : Odd y) : Odd (x * y + 2 * y) := by
  sorry
```

### 3.1.7 例题

你大概能猜出「偶」的定义。

**定义**

整数 $a$ 是**偶**（even）的，若存在整数 $k$，使得 $a=2k$。

```lean
def Even (a : ℤ) : Prop := ∃ k, a = 2 * k
```

**问题**

设 $m$ 为整数。证明若 $m$ 为奇，则 $3m-5$ 为偶。

**解**

因 $m$ 为奇，存在整数 $t$ 使得 $m = 2t+1$。于是

$$
\begin{aligned}
3 m-5 &= 3 (2 t + 1) - 5 \\
&= 2 (3 t - 1),
\end{aligned}
$$

故 $3m-5$ 为偶。

```lean
example {m : ℤ} (hm : Odd m) : Even (3 * m - 5) := by
  sorry
```

### 3.1.8 例题

**问题**

设 $n$ 为偶整数。证明 $n ^ 2 + 2 n - 5$ 为奇。

```lean
example {n : ℤ} (hn : Even n) : Odd (n ^ 2 + 2 * n - 5) := by
  sorry
```

### 3.1.9 例题

事实上每个整数或为偶或为奇；我们稍后在 [例题 4.2.9](04_Proofs_with_Structure_II.md#429-例题) 讨论如何证明这一点。

在 Lean 中该事实可作为引理 `Int.even_or_odd` 调用：

```lean
lemma Int.even_or_odd (n : ℤ) : Even n ∨ Odd n :=
```

**问题**

设 $n$ 为整数。证明 $n ^ 2 + n + 4$ 为偶。

**解**

我们分两种情形，取决于 $n$ 为偶还是奇。

若 $n$ 为偶，则存在整数 $x$ 使得 $n=2x$。则

$$
\begin{aligned}
n ^ 2 + n + 4 &= (2 x) ^ 2 + 2  x + 4\\
&= 2  (2 x ^ 2 + x + 2),
\end{aligned}
$$

故 $n ^ 2 + n + 4$ 为偶。

若 $n$ 为奇，则存在整数 $x$ 使得 $n=2x+1$。则

$$
\begin{aligned}
n ^ 2 + n + 4 &= (2  x + 1) ^ 2 + (2  x + 1) + 4 \\
&= 2 (2  x ^ 2 + 3 x + 3),
\end{aligned}
$$

故 $n ^ 2 + n + 4$ 仍为偶。

```lean
example (n : ℤ) : Even (n ^ 2 + n + 4) := by
  obtain hn | hn := Int.even_or_odd n
  · obtain ⟨x, hx⟩ := hn
    use 2 * x ^ 2 + x + 2
    calc
      n ^ 2 + n + 4 = (2 * x) ^ 2 + 2 * x + 4 := by rw [hx]
      _ = 2 * (2 * x ^ 2 + x + 2) := by ring
  · obtain ⟨x, hx⟩ := hn
    use 2 * x ^ 2 + 3 * x + 3
    calc
      n ^ 2 + n + 4 = (2 * x + 1) ^ 2 + (2 * x + 1) + 4 := by rw [hx]
      _ = 2 * (2 * x ^ 2 + 3 * x + 3) := by ring
```

### 3.1.10 练习

1. 证明 $-9$ 为奇。

```lean
example : Odd (-9 : ℤ) := by
  sorry
```

2. 证明 $26$ 为偶。

```lean
example : Even (26 : ℤ) := by
  sorry
```

3. 设 $m$ 为奇整数，$n$ 为偶整数。证明 $n + m$ 为奇。

```lean
example {m n : ℤ} (hm : Odd m) (hn : Even n) : Odd (n + m) := by
  sorry
```

4. 设 $p$ 为奇整数，$q$ 为偶整数。证明 $p - q - 4$ 为奇。

```lean
example {p q : ℤ} (hp : Odd p) (hq : Even q) : Odd (p - q - 4) := by
  sorry
```

5. 设 $a$ 为偶整数，$b$ 为奇整数。证明 $3a + b - 3$ 为偶。

```lean
example {a b : ℤ} (ha : Even a) (hb : Odd b) : Even (3 * a + b - 3) := by
  sorry
```

6. 证明若整数 $r$ 与 $s$ 均为奇，则 $3r-5s$ 为偶。

```lean
example {r s : ℤ} (hr : Odd r) (hs : Odd s) : Even (3 * r - 5 * s) := by
  sorry
```

7. 设 $x$ 为整数。证明若 $x$ 为奇，则 $x^3$ 为奇。

```lean
example {x : ℤ} (hx : Odd x) : Odd (x ^ 3) := by
  sorry
```

8. 设 $n$ 为奇整数。证明 $n^2-3n+2$ 为偶。

```lean
example {n : ℤ} (hn : Odd n) : Even (n ^ 2 - 3 * n + 2) := by
  sorry
```

9. 设 $a$ 为整数，且 $a$ 为奇。证明 $a^2+2a-4$ 为奇。

```lean
example {a : ℤ} (ha : Odd a) : Odd (a ^ 2 + 2 * a - 4) := by
  sorry
```

10. 设 $p$ 为奇整数。证明 $p^2+3p-5$ 为奇。

```lean
example {p : ℤ} (hp : Odd p) : Odd (p ^ 2 + 3 * p - 5) := by
  sorry
```

11. 设 $x$ 与 $y$ 为奇整数。证明 $xy$ 为奇。

```lean
example {x y : ℤ} (hx : Odd x) (hy : Odd y) : Odd (x * y) := by
  sorry
```

12. 设 $n$ 为整数。证明 $3n^2+3n- 1$ 为奇。

```lean
example (n : ℤ) : Odd (3 * n ^ 2 + 3 * n - 1) := by
  sorry
```

13. 设 $n$ 为整数。证明存在整数 $m\geq n$ 为奇。

```lean
example (n : ℤ) : ∃ m ≥ n, Odd m := by
  sorry
```

14. 设 $a$、$b$ 与 $c$ 为整数。证明 $a-b$、$a+c$ 或 $b-c$ 中至少有一个为偶。[^1]

```lean
example (a b c : ℤ) : Even (a - b) ∨ Even (a + c) ∨ Even (b - c) := by
  sorry
```

[^1]: 练习取自 Hammack，《[Book of Proof](https://www.people.vcu.edu/~rhammack/BookOfProof/)》第 9 章。

## 3.2 整除

### 3.2.1 例题

你可能以前见过整除的定义。

**定义**

自然数 $b$ **可被**（is divisible by）另一自然数 $a$ **整除**，若存在自然数 $c$，使得 $b=ac$。

例如，

**问题**

证明自然数 88 可被 11 整除。

**解**

$88 = 11 \cdot 8$。

整除是非常重要的概念，有多种不同说法。下列表述含义相同：

- $b$ **可被** $a$ **整除**
- $b$ **是** $a$ **的倍数**
- $a$ **是** $b$ **的约数**（divisor）
- $a$ **是** $b$ **的因子**（factor）
- $a$ **整除** $b$

我们最常用最后一种——「$a$ **整除** $b$」——因为它最简洁。还有标准记号 $a \mid b$，我们也会频繁使用。

在 Lean 中，整除的定义已在库中，并附带许多相关定理。我们通常在 Lean 中用记号 `∣` 处理该定义，在 Lean 中可输入 `\|` 或 `\mid`。（一般地，在 VSCode 中用鼠标悬停在符号上可查看如何输入。）注意：这与键盘上视觉相似的符号 `|` 不同，后者用于 `obtain` 语句。

如在 [第 3.1 节](#31-定义奇偶) 中对 `dsimp [Odd]` 所做，可在 Lean 证明中途展开整除的定义以提醒自己当前语境下的含义。可写 `dsimp [Dvd.dvd]`（这是 Lean 中整除记号 $\mid$ 的文本名），或 `dsimp [(· ∣ ·)]`——遗憾的是，不带点与括号的 `dsimp [∣]` 不起作用。与 [第 3.1 节](#31-定义奇偶) 例题一样，这种展开是可选的——没有它证明仍成立。

```lean
example : (11 : ℕ) ∣ 88 := by
  dsimp [(· ∣ ·)]
  use 8
  numbers
```

### 3.2.2 例题

该定义的另一个特点是：虽在上面针对自然数陈述，我们也常要考虑整数的整除。整数情形定义如下：

**定义**

整数 $b$ **可被**另一整数 $a$ **整除**，若存在整数 $c$，使得 $b=ac$。

整数整除也使用上述所有变体术语及同一记号 $a \mid b$。

**问题**

证明整数 6 可被 $-2$ 整除。

**解**

$6 = -2 \cdot -3$。

```lean
example : (-2 : ℤ) ∣ 6 := by
  sorry
```

### 3.2.3 例题

**问题**

设 $a$ 与 $b$ 为整数，且 $a \mid b$。证明 $a \mid b^2+2b$。

**解**

因 $a \mid b$，存在整数 $k$ 使得 $b=ak$。则

$$
\begin{aligned}
b ^ 2 + 2 b &= (a k) ^ 2 + 2 (a k) \\
&= a (k (a k + 2)).
\end{aligned}
$$

故 $a \mid b^2+2b$。

```lean
example {a b : ℤ} (hab : a ∣ b) : a ∣ b ^ 2 + 2 * b := by
  obtain ⟨k, hk⟩ := hab
  use k * (a * k + 2)
  calc
    b ^ 2 + 2 * b = (a * k) ^ 2 + 2 * (a * k) := by rw [hk]
    _ = a * (k * (a * k + 2)) := by ring
```

### 3.2.4 例题

**问题**

设 $a$、$b$ 与 $c$ 为自然数，且 $a \mid b$、$b ^2\mid c$。证明 $a^2 \mid c$。

**解**

因 $a \mid b$，存在自然数 $x$ 使得 $b=ax$。因 $b^2 \mid c$，存在自然数 $y$ 使得 $c=b^2y$。则

$$
\begin{aligned}
c &= b ^ 2 y \\
&= (a x) ^ 2 y\\
&= a ^ 2 (x ^ 2 y).
\end{aligned}
$$

故 $a ^2 \mid c$。

将该解翻译成 Lean。如愿意，可用 `dsimp [(· ∣ ·)] at *` 在目标状态中处处展开 $\mid$ 的定义，但这不影响证明的正确性。

```lean
example {a b c : ℕ} (hab : a ∣ b) (hbc : b ^ 2 ∣ c) : a ^ 2 ∣ c := by
  sorry
```

### 3.2.5 例题

**问题**

设 $x$、$y$ 与 $z$ 为自然数，且 $xy \mid z$。证明 $x \mid z$。

**解**

因 $xy \mid z$，存在自然数 $t$ 使得 $z=(xy)t$。则

$$
\begin{aligned}
z &= (xy)t \\
&= x(yt).
\end{aligned}
$$

故 $x \mid z$。

```lean
example {x y z : ℕ} (h : x * y ∣ z) : x ∣ z := by
  sorry
```

### 3.2.6 例题

你可能想知道如何证明一个数**不**被另一数整除。一个便利的判别法是本书稍后将在 [例题 4.5.8](04_Proofs_with_Structure_II.md#458-例题) 证明的定理：若整数 $a$ 严格介于整数 $b$ 的两个连续倍数之间，则 $a$ 不是 $b$ 的倍数。更形式地，若存在整数 $q$ 使得 $bq<a<b(q + 1)$，则 $a$ 不是 $b$ 的倍数。下面是应用该判别的一个例子：

**问题**

证明 12 不能被 5 整除。

**解**

$5 \cdot 2 < 12 < 5 \cdot (2 + 1)$。

在 Lean 中，该判别以引理 `Int.not_dvd_of_exists_lt_and_lt` 提供：

```lean
lemma Int.not_dvd_of_exists_lt_and_lt (a b : ℤ)
  (h : ∃ q, b * q < a ∧ a < b * (q + 1)) :
  ¬b ∣ a :=
```

下面是同一解的 Lean 写法。

```lean
example : ¬(5 : ℤ) ∣ 12 := by
  apply Int.not_dvd_of_exists_lt_and_lt
  use 2
  constructor
  · numbers -- show `5 * 2 < 12`
  · numbers -- show `12 < 5 * (2 + 1)`
```

### 3.2.7 例题

**问题**

设 $a$ 与 $b$ 为自然数，$b$ 为正，且 $a$ 整除 $b$。证明 $a \le b$。

**解**

因 $a \mid b$，存在自然数 $k$ 使得 $b=ak$。

我们首先注意到

$$0 < b =ak$$

故 $0<k$。于是事实上 $1 \le k$。

现在，

$$
\begin{aligned}
a &= a \cdot 1 \\
&\le a k \\
&= b.
\end{aligned}
$$

```lean
example {a b : ℕ} (hb : 0 < b) (hab : a ∣ b) : a ≤ b := by
  obtain ⟨k, hk⟩ := hab
  have H1 :=
    calc
      0 < b := hb
      _ = a * k := hk
  cancel a at H1
  have H : 1 ≤ k := H1
  calc
    a = a * 1 := by ring
    _ ≤ a * k := by rel [H]
    _ = b := by rw [hk]
```

该引理在主 Lean 库中名为 `Nat.le_of_dvd`。

### 3.2.8 例题

**问题**

设 $a$ 与 $b$ 为自然数，$b$ 为正，且 $a$ 整除 $b$。证明 $a$ 为正。

**解**

因 $a \mid b$，存在自然数 $k$ 使得 $b=ak$。

我们有

$$0 < b = a k,$$

故 $0<a$。

```lean
example {a b : ℕ} (hab : a ∣ b) (hb : 0 < b) : 0 < a := by
  sorry
```

该引理在主 Lean 库中名为 `Nat.pos_of_dvd_of_pos`。

### 3.2.9 练习

1. 证明 0 可被每个整数 $t$ 整除。

```lean
example (t : ℤ) : t ∣ 0 := by
  sorry
```

2. 证明 $-10$ 不能被 3 整除。

```lean
example : ¬(3 : ℤ) ∣ -10 := by
  sorry
```

3. 设 $x$ 与 $y$ 为整数，且 $x \mid y$。证明 $x \mid 3y-4y^2$。

```lean
example {x y : ℤ} (h : x ∣ y) : x ∣ 3 * y - 4 * y ^ 2 := by
  sorry
```

4. 设 $m$ 与 $n$ 为整数，且 $m \mid n$。证明 $m \mid 2n^3+n$。

```lean
example {m n : ℤ} (h : m ∣ n) : m ∣ 2 * n ^ 3 + n := by
  sorry
```

5. 设 $a$ 与 $b$ 为整数，且 $a \mid b$。证明 $a \mid 2b^3-b^2+3b$。

```lean
example {a b : ℤ} (hab : a ∣ b) : a ∣ 2 * b ^ 3 - b ^ 2 + 3 * b := by
  sorry
```

6. 设 $k$、$l$ 与 $m$ 为整数，且 $k$ 整除 $l$、$l^3$ 整除 $m$。证明 $k^3$ 整除 $m$。

```lean
example {k l m : ℤ} (h1 : k ∣ l) (h2 : l ^ 3 ∣ m) : k ^ 3 ∣ m := by
  sorry
```

7. 设 $p$、$q$ 与 $r$ 为整数，且 $p^3$ 整除 $q$、$q^2$ 整除 $r$。证明 $p^6$ 整除 $r$。

```lean
example {p q r : ℤ} (hpq : p ^ 3 ∣ q) (hqr : q ^ 2 ∣ r) : p ^ 6 ∣ r := by
  sorry
```

8. 证明存在自然数 $n>0$，使得 $9$ 是 $2^n-1$ 的因子。

```lean
example : ∃ n : ℕ, 0 < n ∧ 9 ∣ 2 ^ n - 1 := by
  sorry
```

9. 证明存在整数 $a$ 与 $b$，且 $0<b<a$，使得 $a-b \mid a+b$。

```lean
example : ∃ a b : ℤ, 0 < b ∧ b < a ∧ a - b ∣ a + b := by
  sorry
```

## 3.3 模算术：理论

**定义**

整数 $a$ 与 $b$ **模** $n$ **同余**（congruent modulo $n$），若 $n\mid (a - b)$。

我们用记号 $a\equiv b \mod n$ 表示 $a$ 与 $b$ 模 $n$ 同余。

```lean
def Int.ModEq (n a b : ℤ) : Prop := n ∣ a - b

notation:50 a " ≡ " b " [ZMOD " n "]" => Int.ModEq n a b
```

### 3.3.1 例题

**问题**

证明 $11\equiv 3 \mod 4$。

**解**

$11-3=4\cdot 2$，故 $4\mid(11-3)$。

```lean
example : 11 ≡ 3 [ZMOD 4] := by
  use 2
  numbers
```

### 3.3.2 例题

**问题**

证明 $-5\equiv 1 \mod 3$。

**解**

$-5-1=3\cdot -2$，故 $3\mid(-5-1)$。

```lean
example : -5 ≡ 1 [ZMOD 3] := by
  sorry
```

### 3.3.3 例题

**引理**（模算术加法法则）

设 $a$、$b$、$c$、$d$ 与 $n$ 为整数，且 $a\equiv b \mod n$、$c\equiv d \mod n$。则 $a+c\equiv b+d \mod n$。

**证明**

因 $a\equiv b \mod n$，存在整数 $x$ 使得 $a-b=nx$。因 $c\equiv d \mod n$，存在整数 $y$ 使得 $c-d=ny$。则

$$
\begin{aligned}
a + c - (b + d) &= (a - b) + (c - d) \\
&= n x + n y \\
&= n (x + y),
\end{aligned}
$$

故 $a+c\equiv b+d \mod n$。

```lean
theorem Int.ModEq.add {n a b c d : ℤ} (h1 : a ≡ b [ZMOD n]) (h2 : c ≡ d [ZMOD n]) :
    a + c ≡ b + d [ZMOD n] := by
  dsimp [Int.ModEq] at *
  obtain ⟨x, hx⟩ := h1
  obtain ⟨y, hy⟩ := h2
  use x + y
  calc
    a + c - (b + d) = a - b + (c - d) := by ring
    _ = n * x + n * y := by rw [hx, hy]
    _ = n * (x + y) := by ring
```

### 3.3.4 练习

**引理**（模算术减法法则）

设 $a$、$b$、$c$、$d$ 与 $n$ 为整数，且 $a\equiv b \mod n$、$c\equiv d \mod n$。则 $a-c\equiv b-d \mod n$。

```lean
theorem Int.ModEq.sub {n a b c d : ℤ} (h1 : a ≡ b [ZMOD n]) (h2 : c ≡ d [ZMOD n]) :
    a - c ≡ b - d [ZMOD n] := by
  sorry
```

### 3.3.5 练习

**引理**（模算术取负法则）

设 $a$、$b$ 与 $n$ 为整数，且 $a\equiv b \mod n$。则 $-a\equiv -b \mod n$。

```lean
theorem Int.ModEq.neg {n a b : ℤ} (h1 : a ≡ b [ZMOD n]) : -a ≡ -b [ZMOD n] := by
  sorry
```

### 3.3.6 例题

**引理**（模算术乘法法则）

设 $a$、$b$、$c$、$d$ 与 $n$ 为整数，且 $a\equiv b \mod n$、$c\equiv d \mod n$。则 $ac\equiv bd \mod n$。

**证明**

因 $a\equiv b \mod n$，存在整数 $x$ 使得 $a-b=nx$。因 $c\equiv d \mod n$，存在整数 $y$ 使得 $c-d=ny$。则

$$
\begin{aligned}
a c - b d &= (a - b) c + b (c - d) \\
&= (n x)  c + b  (n y) \\
&= n (x c + b y),
\end{aligned}
$$

故 $ac\equiv bd \mod n$。

```lean
theorem Int.ModEq.mul {n a b c d : ℤ} (h1 : a ≡ b [ZMOD n]) (h2 : c ≡ d [ZMOD n]) :
    a * c ≡ b * d [ZMOD n] := by
  obtain ⟨x, hx⟩ := h1
  obtain ⟨y, hy⟩ := h2
  use x * c + b * y
  calc
    a * c - b * d = (a - b) * c + b * (c - d) := by ring
    _ = n * x * c + b * (n * y) := by rw [hx, hy]
    _ = n * (x * c + b * y) := by ring
```

### 3.3.7 例题

注意：模算术**没有**「除法法则」！

**问题**

可以存在整数 $a$、$b$、$c$、$d$ 与 $n$，使得 $a\equiv b \mod n$、$c\equiv d \mod n$，但 $\frac{a}{c}\not\equiv \frac{b}{d} \mod n$。

**解**

可取 $a=10$、$b=18$、$c=2$、$d=6$。事实上，

- $10-18=4\cdot -2$，故 $10\equiv 18 \mod 4$；
- $2-6=4\cdot -1$，故 $2\equiv 6 \mod 4$；
- $\frac{10}{2}-\frac{18}{6}=2$ 介于 4 的连续倍数 $4 \cdot 0$ 与 $4 \cdot (0 + 1)$ 之间，故 $\frac{10}{2}\not\equiv \frac{18}{6} \mod 4$。

注意此处我们用了 [例题 3.2.6](#326-例题) 中的不可整除判别法。

### 3.3.8 例题

**引理**（模算术平方法则）

设 $a$、$b$ 与 $n$ 为整数，且 $a\equiv b \mod n$。则 $a^2\equiv b^2 \mod n$。

**证明**

因 $a\equiv b \mod n$，存在整数 $x$ 使得 $a-b=nx$。则

$$
\begin{aligned}
a ^ 2 - b ^ 2 &= (a - b)  (a + b) \\
&= (n x) (a + b) \\
&= n  (x  (a + b)).
\end{aligned}
$$

```lean
theorem Int.ModEq.pow_two (h : a ≡ b [ZMOD n]) : a ^ 2 ≡ b ^ 2 [ZMOD n] := by
  obtain ⟨x, hx⟩ := h
  use x * (a + b)
  calc
    a ^ 2 - b ^ 2 = (a - b) * (a + b) := by ring
    _ = n * x * (a + b) := by rw [hx]
    _ = n * (x * (a + b)) := by ring
```

### 3.3.9 练习

**引理**（模算术立方法则）

设 $a$、$b$ 与 $n$ 为整数，且 $a\equiv b \mod n$。则 $a^3\equiv b^3 \mod n$。

```lean
theorem Int.ModEq.pow_three (h : a ≡ b [ZMOD n]) : a ^ 3 ≡ b ^ 3 [ZMOD n] := by
  sorry
```

事实上对任意幂次都成立，尽管我们尚无工具证明它。稍后在 [例题 6.1.3](06_Induction.md#613-例) 会回到这一点。

**引理**（模算术幂法则）

设 $k$ 为自然数，$a$、$b$ 与 $n$ 为整数，且 $a\equiv b \mod n$。则 $a^k\equiv b^k \mod n$。

```lean
theorem Int.ModEq.pow (k : ℕ) (h : a ≡ b [ZMOD n]) : a ^ k ≡ b ^ k [ZMOD n] :=
  sorry -- we'll prove this later in the book
```

### 3.3.10 例题

**引理**（模算术自反法则）

设 $a$ 与 $n$ 为整数。则 $a\equiv a \mod n$。

**证明**

$a-a=n\cdot 0$，故 $n\mid a - a$。

```lean
theorem Int.ModEq.refl (a : ℤ) : a ≡ a [ZMOD n] := by
  use 0
  ring
```

### 3.3.11 例题

呼！引理真不少。但它们会派上用场，你马上就能看到。假设我们现在遇到与以前同类型、非常具体的模算术问题：模 $n$ 下两个表达式同余，二者差异像「找不同」式改写。例如，

**问题**

设 $a$ 与 $b$ 为整数，且 $a\equiv 2 \mod 4$。证明 $a b ^ 2 + a ^ 2 b + 3 a \equiv 2 b ^ 2 + 2 ^ 2 \cdot b + 3 \cdot 2 \mod 4$。

我们可以直接从定义求解，这相当费力：

```lean
example {a b : ℤ} (ha : a ≡ 2 [ZMOD 4]) :
    a * b ^ 2 + a ^ 2 * b + 3 * a ≡ 2 * b ^ 2 + 2 ^ 2 * b + 3 * 2 [ZMOD 4] := by
  obtain ⟨x, hx⟩ := ha
  use x * (b ^ 2 + a * b + 2 * b + 3)
  calc
    a * b ^ 2 + a ^ 2 * b + 3 * a - (2 * b ^ 2 + 2 ^ 2 * b + 3 * 2) =
        (a - 2) * (b ^ 2 + a * b + 2 * b + 3) :=
      by ring
    _ = 4 * x * (b ^ 2 + a * b + 2 * b + 3) := by rw [hx]
    _ = 4 * (x * (b ^ 2 + a * b + 2 * b + 3)) := by ring
```

或者更好的是，按正确顺序组合已证引理。这需要少得多的思考：

```lean
example {a b : ℤ} (ha : a ≡ 2 [ZMOD 4]) :
    a * b ^ 2 + a ^ 2 * b + 3 * a ≡ 2 * b ^ 2 + 2 ^ 2 * b + 3 * 2 [ZMOD 4] := by
  apply Int.ModEq.add
  apply Int.ModEq.add
  apply Int.ModEq.mul
  apply ha
  apply Int.ModEq.refl
  apply Int.ModEq.mul
  apply Int.ModEq.pow
  apply ha
  apply Int.ModEq.refl
  apply Int.ModEq.mul
  apply Int.ModEq.refl
  apply ha
```

### 3.3.12 练习

1. 证明 $34\equiv 104 \mod 5$。

```lean
example : 34 ≡ 104 [ZMOD 5] := by
  sorry
```

2. （模算术对称法则）设 $a$、$b$ 与 $n$ 为整数，且 $a\equiv b \mod n$。证明 $b\equiv a \mod n$。

```lean
theorem Int.ModEq.symm (h : a ≡ b [ZMOD n]) : b ≡ a [ZMOD n] := by
  sorry
```

3. （模算术传递法则）设 $a$、$b$、$c$ 与 $n$ 为整数，且 $a\equiv b \mod n$、$b\equiv c \mod n$。证明 $a\equiv c \mod n$。

```lean
theorem Int.ModEq.trans (h1 : a ≡ b [ZMOD n]) (h2 : b ≡ c [ZMOD n]) :
    a ≡ c [ZMOD n] := by
  sorry
```

4. 设 $a$、$c$ 与 $n$ 为整数。证明 $a+nc\equiv a \mod n$。

```lean
example : a + n * c ≡ a [ZMOD n] := by
  sorry
```

5. 给出 [例题 3.3.7](#337-例题) 的另一种解（即用不同数字）。

6. 设 $a$ 与 $b$ 为整数，且 $a \equiv b \mod 5$。证明 $2a+3 \equiv 2b+3 \mod 5$。

   给出两种解，仿照 [例题 3.3.11](#3311-例题) 中两种解的风格。

```lean
example {a b : ℤ} (h : a ≡ b [ZMOD 5]) : 2 * a + 3 ≡ 2 * b + 3 [ZMOD 5] := by
  sorry
```

7. 设 $m$ 与 $n$ 为整数，且 $m \equiv n \mod 4$。证明 $3m-1 \equiv 3n-1 \mod 4$。

   给出两种解，仿照 [例题 3.3.11](#3311-例题) 中两种解的风格。

```lean
example {m n : ℤ} (h : m ≡ n [ZMOD 4]) : 3 * m - 1 ≡ 3 * n - 1 [ZMOD 4] := by
  sorry
```

8. 设 $k$ 为整数，且 $k\equiv 3 \mod 5$。证明 $4 k + k ^ 3 + 3\equiv 4 \cdot 3 + 3 ^ 3 + 3 \mod 5$。

   给出两种解，仿照 [例题 3.3.11](#3311-例题) 中两种解的风格。

```lean
example {k : ℤ} (hb : k ≡ 3 [ZMOD 5]) :
    4 * k + k ^ 3 + 3 ≡ 4 * 3 + 3 ^ 3 + 3 [ZMOD 5] := by
  sorry
```

## 3.4 模算术：计算

### 3.4.1 例题

回顾 [例题 3.3.11](#3311-例题) 中的问题。

**问题**

设 $a$ 与 $b$ 为整数，且 $a\equiv 2 \mod 4$。证明 $a b ^ 2 + a ^ 2 b + 3 a \equiv 2 b ^ 2 + 2 ^ 2 \cdot b + 3 \cdot 2 \mod 4$。

在解完本题及 [第 3.3 节](#33-模算术理论) 中许多类似问题后，你大概觉得这类陈述一眼就能核对正确性。这很好！当理论积累到某类陈述可以一眼核对时，我们就不再要求详细证明。因此从现在起，我们将默认接受这类陈述。

这也通常是编写 Lean 策略以自动核对某类陈述的恰当时机。我正是这样做的：更新策略 `rel` 以覆盖这类陈述。本书不讨论策略编写，但实质上，该策略现在会把引理 `Int.ModEq.add`、`Int.ModEq.neg`、`Int.ModEq.sub`、`Int.ModEq.mul`、`Int.ModEq.pow`、`Int.ModEq.refl` 以及给定假设投向陈述，直到（a）目标解决，或（b）这些引理都不再适用。这正是我们在纸面上核对问题时头脑中所做的。

```lean
example {a b : ℤ} (ha : a ≡ 2 [ZMOD 4]) :
    a * b ^ 2 + a ^ 2 * b + 3 * a ≡ 2 * b ^ 2 + 2 ^ 2 * b + 3 * 2 [ZMOD 4] := by
  rel [ha]
```

### 3.4.2 例题

从现在起，我们将解更有趣的模算术问题，把像 [例题 3.3.11](#3311-例题) 那样的步骤压缩到一行。

**问题**

设 $a$ 与 $b$ 为整数，$a \equiv 4\mod 5$、$b \equiv 3\mod 5$。证明 $ab+b^3+3 \equiv 2\mod 5$。

**解**

$$
\begin{aligned}
a b + b ^ 3 + 3  &\equiv 4 b + b ^ 3 + 3  \mod 5\\
&\equiv 4 \cdot 3 + 3 ^ 3 + 3  \mod 5\\
&=2+5 \cdot 8\\
&\equiv 2\mod 5.
\end{aligned}
$$

```lean
example {a b : ℤ} (ha : a ≡ 4 [ZMOD 5]) (hb : b ≡ 3 [ZMOD 5]) :
    a * b + b ^ 3 + 3 ≡ 2 [ZMOD 5] :=
  calc
    a * b + b ^ 3 + 3 ≡ 4 * b + b ^ 3 + 3 [ZMOD 5] := by rel [ha]
    _ ≡ 4 * 3 + 3 ^ 3 + 3 [ZMOD 5] := by rel [hb]
    _ = 2 + 5 * 8 := by numbers
    _ ≡ 2 [ZMOD 5] := by extra
```

### 3.4.3 例题

**问题**

证明存在整数 $a$，使得 $6a \equiv 4\mod 11$。

**解**

整数 8 具有该性质。事实上，

$$
\begin{aligned}
6 \cdot 8 &= 4 + 4 \cdot 11\\
&\equiv 4\mod 11.
\end{aligned}
$$

```lean
example : ∃ a : ℤ, 6 * a ≡ 4 [ZMOD 11] := by
  use 8
  calc
    (6:ℤ) * 8 = 4 + 4 * 11 := by numbers
    _ ≡ 4 [ZMOD 11] := by extra
```

### 3.4.4 例题

**问题**

设 $x$ 为整数。证明 $x ^ 3 \equiv x\mod 3$。

**解**

我们按 $x$ 模 3 的余数分情形讨论。

**情形 1**（$x\equiv 0\mod 3$）：

$$
\begin{aligned}
x^3 &\equiv 0^3\mod 3\\
&= 0\\
&\equiv x\mod 3.
\end{aligned}
$$

**情形 2**（$x\equiv 1\mod 3$）：

$$
\begin{aligned}
x^3 &\equiv 1^3\mod 3\\
&= 1\\
&\equiv x\mod 3.
\end{aligned}
$$

**情形 3**（$x\equiv 2\mod 3$）：

$$
\begin{aligned}
x^3 &\equiv 2^3\mod 3\\
&= 2 + 3 \cdot 2\\
&\equiv 2\mod 3\\
&\equiv x\mod 3.
\end{aligned}
$$

```lean
example {x : ℤ} : x ^ 3 ≡ x [ZMOD 3] := by
  mod_cases hx : x % 3
  calc
    x ^ 3 ≡ 0 ^ 3 [ZMOD 3] := by rel [hx]
    _ = 0 := by numbers
    _ ≡ x [ZMOD 3] := by rel [hx]
  calc
    x ^ 3 ≡ 1 ^ 3 [ZMOD 3] := by rel [hx]
    _ = 1 := by numbers
    _ ≡ x [ZMOD 3] := by rel [hx]
  calc
    x ^ 3 ≡ 2 ^ 3 [ZMOD 3] := by rel [hx]
    _ = 2 + 3 * 2 := by numbers
    _ ≡ 2 [ZMOD 3] := by extra
    _ ≡ x [ZMOD 3] := by rel [hx]
```

### 3.4.5 练习

1. 设 $n$ 为整数，且 $n\equiv 1\mod 3$。证明 $n^3+7n\equiv 2\mod 3$。

```lean
example {n : ℤ} (hn : n ≡ 1 [ZMOD 3]) : n ^ 3 + 7 * n ≡ 2 [ZMOD 3] :=
  sorry
```

2. 设 $a$ 为整数，且 $a\equiv 3\mod 4$。证明 $a^3+4a^2+2\equiv 1\mod 4$。

```lean
example {a : ℤ} (ha : a ≡ 3 [ZMOD 4]) :
    a ^ 3 + 4 * a ^ 2 + 2 ≡ 1 [ZMOD 4] :=
  sorry
```

3. 设 $a$ 与 $b$ 为整数。证明 $(a + b)^3\equiv a^3+b^3\mod 3$。

```lean
example (a b : ℤ) : (a + b) ^ 3 ≡ a ^ 3 + b ^ 3 [ZMOD 3] :=
  sorry
```

4. 证明存在整数 $a$，使得 $4a\equiv 1\mod 7$。

```lean
example : ∃ a : ℤ, 4 * a ≡ 1 [ZMOD 7] := by
  sorry
```

5. 证明存在整数 $k$，使得 $5k\equiv 6\mod 8$。

```lean
example : ∃ k : ℤ, 5 * k ≡ 6 [ZMOD 8] := by
  sorry
```

6. 设 $n$ 为整数。证明 $5n^2+3n+7\equiv 1\mod 2$。

```lean
example (n : ℤ) : 5 * n ^ 2 + 3 * n + 7 ≡ 1 [ZMOD 2] := by
  sorry
```

7. 设 $x$ 为整数。证明 $x^5\equiv x\mod 5$。

```lean
example {x : ℤ} : x ^ 5 ≡ x [ZMOD 5] := by
  sorry
```

## 3.5 Bézout 恒等式

### 3.5.1 例题

**问题**

设 $n$ 为整数，且 $5n$ 是 $8$ 的倍数。证明 $n$ 也是 $8$ 的倍数。

**解**

因 $8\mid 5n$，存在整数 $a$ 使得 $5n=8a$。则

$$
\begin{aligned}
n &= -3  (5  n) + 16 n \\
&= -3  (8  a) + 16  n \\
&= 8 (-3 a + 2  n),
\end{aligned}
$$

故 $8\mid n$。

```lean
example {n : ℤ} (hn : 8 ∣ 5 * n) : 8 ∣ n := by
  obtain ⟨a, ha⟩ := hn
  use -3 * a + 2 * n
  calc
    n = -3 * (5 * n) + 16 * n := by ring
    _ = -3 * (8 * a) + 16 * n := by rw [ha]
    _ = 8 * (-3 * a + 2 * n) := by ring
```

这类问题通常有许多不同解。下面是另一种解。

**解**

因 $8\mid 5n$，存在整数 $a$ 使得 $5n=8a$。则

$$
\begin{aligned}
n &= 5 (5  n) - 24 n \\
&= 5  (8  a) -24  n \\
&= 8 (5 a - 3  n),
\end{aligned}
$$

故 $8\mid n$。

试在 Lean 中输入该变体解。

```lean
example {n : ℤ} (hn : 8 ∣ 5 * n) : 8 ∣ n := by
  sorry
```

### 3.5.2 例题

**问题**

证明若对某整数 $n$ 有 $5$ 整除 $3n$，则 $5$ 也整除 $n$。

**解**

因 $5\mid 3n$，存在整数 $x$ 使得 $3n=5x$。则

$$
\begin{aligned}
n &= 2  (3  n) - 5 n \\
&= 2  (5  x) - 5  n \\
&= 5 (2x -  n),
\end{aligned}
$$

故 $5\mid n$。

```lean
example {n : ℤ} (h1 : 5 ∣ 3 * n) : 5 ∣ n := by
  sorry
```

### 3.5.3 例题

**问题**

设 $m$ 为可被 8 与 5 整除的整数。证明它也可被 40 整除。

**解**

因 $8\mid m$，存在整数 $a$ 使得 $m=8a$。因 $5\mid m$，存在整数 $b$ 使得 $m=5b$。则

$$
\begin{aligned}
m &= -15 m + 16 m\\
&= -15 (8 a) + 16  m \\
&= -15 (8  a) + 16  (5  b) \\
&= 40 (-3  a + 2  b),
\end{aligned}
$$

故 $40\mid m$。

```lean
example {m : ℤ} (h1 : 8 ∣ m) (h2 : 5 ∣ m) : 40 ∣ m := by
  obtain ⟨a, ha⟩ := h1
  obtain ⟨b, hb⟩ := h2
  use -3 * a + 2 * b
  calc
    m = -15 * m + 16 * m := by ring
    _ = -15 * (8 * a) + 16 * m := by rw [ha]
    _ = -15 * (8 * a) + 16 * (5 * b) := by rw [hb]
    _ = 40 * (-3 * a + 2 * b) := by ring
```

### 3.5.4 练习

1. 证明若 6 整除 $11n$，则它整除 $n$。

```lean
example {n : ℤ} (hn : 6 ∣ 11 * n) : 6 ∣ n := by
  sorry
```

2. 设 $a$ 为整数，且 $5a$ 是 $7$ 的倍数。证明 $a$ 也是 $7$ 的倍数。

```lean
example {a : ℤ} (ha : 7 ∣ 5 * a) : 7 ∣ a := by
  sorry
```

3. 设 7 与 9 都是某整数 $n$ 的因子。证明 63 也是 $n$ 的因子。

```lean
example {n : ℤ} (h1 : 7 ∣ n) (h2 : 9 ∣ n) : 63 ∣ n := by
  sorry
```

4. 设 $n$ 为可被 5 与 13 整除的整数。证明它也可被 65 整除。

```lean
example {n : ℤ} (h1 : 5 ∣ n) (h2 : 13 ∣ n) : 65 ∣ n := by
  sorry
```
