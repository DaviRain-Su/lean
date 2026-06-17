# 第 10 章 关系

> 本译文对应原书 [Relations](https://hrmacbeth.github.io/math2001/10_Relations.html)；英文 Sphinx 源：`10_Relations.rst`。

正如集合为某个类型中对象的性质提供了便利的语言，**关系**（relations）则为该类型中**对象对**的性质提供了便利的语言。这听起来可能枯燥而抽象，但这类性质在数学中无处不在：一个实数小于另一个；一个整数模 5 与另一个同余；一个集合是另一个的子集；一个函数与另一个互为逆。

本章介绍关系本身可以具有的一些重要性质：关系可以是**自反的**（reflexive）、**对称的**（symmetric）、**反对称的**（antisymmetric）或**传递的**（transitive），也可以是这些性质的任意组合。

## 10.1. 自反、对称、反对称、传递

### 10.1.1. 例

**定义**

类型 $X$ 上的关系 $\sim$ 是**自反的**，若对所有类型 $X$ 的 $x$，都有 $x\sim x$。

**问题**

证明 $\mathbb{N}$ 上的关系 $|$（整除）是自反的。

**解法**

我们必须证明：对所有自然数 $x$，都有 $x\mid x$。设 $x$ 为自然数；则 $x=x\cdot 1$。

```lean
example : Reflexive ((·:ℕ) ∣ ·) := by
  dsimp [Reflexive]
  intro x
  use 1
  ring
```

**定义**

类型 $X$ 上的关系 $\sim$ 是**对称的**，若对所有类型 $X$ 的 $x$ 与 $y$，若 $x\sim y$，则 $y\sim x$。

**问题**

证明 $\mathbb{N}$ 上的关系 $|$ 不是对称的。

**解法**

我们必须证明：存在自然数 $x$ 与 $y$，使得 $x\mid y$ 且 $y\nmid x$。事实上，$2=1\cdot 2$，故 $1\mid 2$；又 $2\cdot 0<1<2\cdot 1$，故 $2\nmid 1$。

```lean
example : ¬ Symmetric ((·:ℕ) ∣ ·) := by
  dsimp [Symmetric]
  push_neg
  use 1, 2
  constructor
  · use 2
    numbers
  · apply Nat.not_dvd_of_exists_lt_and_lt
    use 0
    constructor
    · numbers
    · numbers
```

**定义**

类型 $X$ 上的关系 $\sim$ 是**反对称的**，若对所有类型 $X$ 的 $x$ 与 $y$，若 $x\sim y$ 且 $y\sim x$，则 $x=y$。

**问题**

证明 $\mathbb{N}$ 上的关系 $|$ 是反对称的。

**解法**

我们首先注意以下事实（$\star$）：若 $m$ 与 $n$ 为自然数，$m=0$ 且 $m\mid n$，则 $m=n$。事实上，由于 $m\mid n$，存在自然数 $k$ 使得 $n=mk$，于是

$$
\begin{aligned}
m&=0\\
&=0\cdot k\\
&=mk\\
&=n.
\end{aligned}
$$

现在回到原问题。我们必须证明：对所有自然数 $x$ 与 $y$，若 $x\mid y$ 且 $y\mid x$，则 $x=y$。设 $x$ 与 $y$ 为自然数，并设 $x\mid y$ 且 $y\mid x$。若 $x=0$，则由（$\star$）即得结论；若 $y=0$ 同理。否则 $x>0$，由于 $y\mid x$ 有 $y\le x$；又 $y>0$，由于 $x\mid y$ 有 $x\le y$。合起来得 $x=y$。

```lean
example : AntiSymmetric ((·:ℕ) ∣ ·) := by
  have H : ∀ {m n}, m = 0 → m ∣ n → m = n
  · intro m n h1 h2
    obtain ⟨k, hk⟩ := h2
    calc m = 0 := by rw [h1]
      _ = 0 * k := by ring
      _ = m * k := by rw [h1]
      _ = n := by rw [hk]
  dsimp [AntiSymmetric]
  intro x y h1 h2
  obtain hx | hx := Nat.eq_zero_or_pos x
  · apply H hx h1
  obtain hy | hy := Nat.eq_zero_or_pos y
  · have : y = x := by apply H hy h2
    rw [this]
  apply le_antisymm
  · apply Nat.le_of_dvd hy h1
  · apply Nat.le_of_dvd hx h2
```

**定义**

类型 $X$ 上的关系 $\sim$ 是**传递的**，若对所有类型 $X$ 的 $x$、$y$ 与 $z$，若 $x\sim y$ 且 $y\sim z$，则 $x\sim z$。

**问题**

证明 $\mathbb{N}$ 上的关系 $|$ 是传递的。

**解法**

我们必须证明：对所有自然数 $a$、$b$ 与 $c$，若 $a\mid b$ 且 $b\mid c$，则 $a\mid c$。

设 $a$、$b$ 与 $c$ 为具有这些性质的自然数。由于 $a\mid b$，存在自然数 $k$ 使得 $b=ak$；由于 $b\mid c$，存在自然数 $l$ 使得 $c=bl$。于是

$$
\begin{aligned}
c&=bl\\
&=(ak)l\\
&=a(kl),
\end{aligned}
$$

故 $a\mid c$。

```lean
example : Transitive ((·:ℕ) ∣ ·) := by
  dsimp [Transitive]
  intro a b c hab hbc
  obtain ⟨k, hk⟩ := hab
  obtain ⟨l, hl⟩ := hbc
  use k * l
  calc c = b * l := by rw [hl]
    _ = (a * k) * l := by rw [hk]
    _ = a * (k * l) := by ring
```

### 10.1.2. 例

**问题**

判断 $\mathbb{R}$ 上的关系 $=$ 具有下列哪些性质：

1. 自反；
2. 对称；
3. 反对称；
4. 传递。

```lean
example : Reflexive ((·:ℝ) = ·) := by
  dsimp [Reflexive]
  intro x
  ring

example : Symmetric ((·:ℝ) = ·) := by
  dsimp [Symmetric]
  intro x y h
  rw [h]

example : AntiSymmetric ((·:ℝ) = ·) := by
  dsimp [AntiSymmetric]
  intro x y h1 h2
  rw [h1]

example : Transitive ((·:ℝ) = ·) := by
  dsimp [Transitive]
  intro x y z h1 h2
  rw [h1, h2]
```

### 10.1.3. 例

**问题**

判断 $\mathbb{R}$ 上由「$x\sim y$ 当且仅当 $(x-y)^2\le 1$」定义的关系 $\sim$ 具有下列哪些性质：

1. 自反；
2. 对称；
3. 反对称；
4. 传递。

```lean
local infix:50 "∼" => fun (x y : ℝ) ↦ (x - y) ^ 2 ≤ 1

example : Reflexive (· ∼ ·) := by
  dsimp [Reflexive]
  intro x
  calc (x - x) ^ 2 = 0 := by ring
    _ ≤ 1 := by numbers

example : Symmetric (· ∼ ·) := by
  dsimp [Symmetric]
  intro x y h
  calc (y - x) ^ 2 = (x - y) ^ 2 := by ring
    _ ≤ 1 := by rel [h]

example : ¬ AntiSymmetric (· ∼ ·) := by
  dsimp [AntiSymmetric]
  push_neg
  use 1, 1.1
  constructor
  · numbers
  constructor
  · numbers
  · numbers

example : ¬ Transitive (· ∼ ·) := by
  dsimp [Transitive]
  push_neg
  use 1, 1.9, 2.5
  constructor
  · numbers
  constructor
  · numbers
  · numbers
```

### 10.1.4. 例

考虑如下有限归纳类型 `Hand`。

```lean
inductive Hand
  | rock
  | paper
  | scissors
```

考虑 `Hand` 类型上的如下关系 $\prec$。

```lean
@[reducible] def r : Hand → Hand → Prop
  | rock, rock => False
  | rock, paper => True
  | rock, scissors => False
  | paper, rock => False
  | paper, paper => False
  | paper, scissors => True
  | scissors, rock => True
  | scissors, paper => False
  | scissors, scissors => False

local infix:50 " ≺ " => r
```

![石头剪刀布](https://hrmacbeth.github.io/math2001/_images/rock-paper-scissors.svg)

**问题**

判断关系 $\prec$ 具有下列哪些性质：

1. 自反；
2. 对称；
3. 反对称；
4. 传递。

```lean
example : ¬ Reflexive (· ≺ ·) := by
  dsimp [Reflexive]
  push_neg
  use rock
  exhaust

example : ¬ Symmetric (· ≺ ·) := by
  dsimp [Symmetric]
  push_neg
  use rock, paper
  exhaust

example : AntiSymmetric (· ≺ ·) := by
  dsimp [AntiSymmetric]
  intro x y
  cases x <;> cases y <;> exhaust

example : ¬ Transitive (· ≺ ·) := by
  dsimp [Transitive]
  push_neg
  use rock, paper, scissors
  exhaust
```

### 10.1.5. 练习

1. 证明 $\mathbb{R}$ 上的关系 $<$ 不是对称的。

```lean
example : ¬ Symmetric ((·:ℝ) < ·) := by
  sorry
```

2. 证明 $\mathbb{Z}$ 上由「$x\sim y$ 当且仅当 $x\equiv y \mod 2$」定义的关系 $\sim$ 不是反对称的。

```lean
local infix:50 "∼" => fun (x y : ℤ) ↦ x ≡ y [ZMOD 2]

example : ¬ AntiSymmetric (· ∼ ·) := by
  sorry
```

3. 考虑如下有限归纳类型 `Little`，以及 `Little` 类型上的如下关系 $\sim$。判断关系 $\sim$ 具有下列哪些性质：

   1. 自反；
   2. 对称；
   3. 反对称；
   4. 传递。

```lean
section
inductive Little
  | meg
  | jo
  | beth
  | amy
  deriving DecidableEq

open Little

@[reducible] def s : Little → Little → Prop
  | meg, meg => True
  | meg, jo => True
  | meg, beth => True
  | meg, amy => True
  | jo, meg => True
  | jo, jo => True
  | jo, beth => True
  | jo, amy => False
  | beth, meg => True
  | beth, jo => True
  | beth, beth => False
  | beth, amy => True
  | amy, meg => True
  | amy, jo => False
  | amy, beth => True
  | amy, amy => True

local infix:50 " ∼ " => s
```

![Meg、Jo、Beth、Amy](https://hrmacbeth.github.io/math2001/_images/meg-jo-beth-amy.svg)

```lean
example : Reflexive (· ∼ ·) := by
  sorry

example : ¬ Reflexive (· ∼ ·) := by
  sorry

example : Symmetric (· ∼ ·) := by
  sorry

example : ¬ Symmetric (· ∼ ·) := by
  sorry

example : AntiSymmetric (· ∼ ·) := by
  sorry

example : ¬ AntiSymmetric (· ∼ ·) := by
  sorry

example : Transitive (· ∼ ·) := by
  sorry

example : ¬ Transitive (· ∼ ·) := by
  sorry
```

4. 判断 $\mathbb{Z}$ 上由「$x\sim y$ 当且仅当 $y\equiv x+1 \mod 5$」定义的关系 $\sim$ 具有下列哪些性质：

   1. 自反；
   2. 对称；
   3. 反对称；
   4. 传递。

   并画出该关系（有代表性的部分）作为有向图的草图。

```lean
local infix:50 "∼" => fun (x y : ℤ) ↦ y ≡ x + 1 [ZMOD 5]

example : Reflexive (· ∼ ·) := by
  sorry

example : ¬ Reflexive (· ∼ ·) := by
  sorry

example : Symmetric (· ∼ ·) := by
  sorry

example : ¬ Symmetric (· ∼ ·) := by
  sorry

example : AntiSymmetric (· ∼ ·) := by
  sorry

example : ¬ AntiSymmetric (· ∼ ·) := by
  sorry

example : Transitive (· ∼ ·) := by
  sorry

example : ¬ Transitive (· ∼ ·) := by
  sorry
```

5. 判断 $\mathbb{Z}$ 上由「$x\sim y$ 当且仅当 $x+y\equiv 0 \mod 3$」定义的关系 $\sim$ 具有下列哪些性质：

   1. 自反；
   2. 对称；
   3. 反对称；
   4. 传递。

   并画出该关系（有代表性的部分）作为有向图的草图。

```lean
local infix:50 "∼" => fun (x y : ℤ) ↦ x + y ≡ 0 [ZMOD 3]

example : Reflexive (· ∼ ·) := by
  sorry

example : ¬ Reflexive (· ∼ ·) := by
  sorry

example : Symmetric (· ∼ ·) := by
  sorry

example : ¬ Symmetric (· ∼ ·) := by
  sorry

example : AntiSymmetric (· ∼ ·) := by
  sorry

example : ¬ AntiSymmetric (· ∼ ·) := by
  sorry

example : Transitive (· ∼ ·) := by
  sorry

example : ¬ Transitive (· ∼ ·) := by
  sorry
```

6. 判断 $\mathcal{P}(\mathbb{N})$（自然数集合的类型）上的关系 $\subseteq$ 具有下列哪些性质：

   1. 自反；
   2. 对称；
   3. 反对称；
   4. 传递。

   并画出该关系（有代表性的部分）作为有向图的草图。

```lean
example : Reflexive ((· : Set ℕ) ⊆ ·) := by
  sorry

example : ¬ Reflexive ((· : Set ℕ) ⊆ ·) := by
  sorry

example : Symmetric ((· : Set ℕ) ⊆ ·) := by
  sorry

example : ¬ Symmetric ((· : Set ℕ) ⊆ ·) := by
  sorry

example : AntiSymmetric ((· : Set ℕ) ⊆ ·) := by
  sorry

example : ¬ AntiSymmetric ((· : Set ℕ) ⊆ ·) := by
  sorry

example : Transitive ((· : Set ℕ) ⊆ ·) := by
  sorry

example : ¬ Transitive ((· : Set ℕ) ⊆ ·) := by
  sorry
```

7. 判断 $\mathbb{R}^2$ 上由「$(x_1, y_1) \prec (x_2,y_2)$ 当且仅当 $x_1\le x_2$ 且 $y_1\le y_2$」定义的关系 $\prec$ 具有下列哪些性质：

   1. 自反；
   2. 对称；
   3. 反对称；
   4. 传递。

```lean
local infix:50 "≺" => fun ((x1, y1) : ℝ × ℝ) (x2, y2) ↦ (x1 ≤ x2 ∧ y1 ≤ y2)

example : Reflexive (· ≺ ·) := by
  sorry

example : ¬ Reflexive (· ≺ ·) := by
  sorry

example : Symmetric (· ≺ ·) := by
  sorry

example : ¬ Symmetric (· ≺ ·) := by
  sorry

example : AntiSymmetric (· ≺ ·) := by
  sorry

example : ¬ AntiSymmetric (· ≺ ·) := by
  sorry

example : Transitive (· ≺ ·) := by
  sorry

example : ¬ Transitive (· ≺ ·) := by
  sorry
```

## 10.2. 等价关系

### 10.2.1. 例

**定义**

一个关系是**等价关系**（equivalence relation），若它是自反、对称且传递的。

**问题**

设 $n$ 为整数。证明 $\mathbb{Z}$ 上由「$x\sim y$ 当且仅当 $x\equiv y \mod n$」定义的关系 $\sim$ 是等价关系。

**解法**

由[例题 3.3.10](03_Parity_and_Divisibility.md#3310-例题)，关系 $\sim$ 是自反的。

由[第 3.3 节](03_Parity_and_Divisibility.md#33-模算术理论)练习中的两条，关系 $\sim$ 是对称且传递的。

```lean
variable (n : ℤ)

local infix:50 "∼" => fun (x y : ℤ) ↦ x ≡ y [ZMOD n]

example : Reflexive (· ∼ ·) := by
  dsimp [Reflexive]
  apply Int.ModEq.refl

example : Symmetric (· ∼ ·) := by
  dsimp [Symmetric]
  apply Int.ModEq.symm

example : Transitive (· ∼ ·) := by
  dsimp [Transitive]
  apply Int.ModEq.trans
```

让我们把这个关系画成有向图（画一部分），例如取 $n=3$。

![模 3 同余（详图）](https://hrmacbeth.github.io/math2001/_images/mod3alt.png)

图很乱，但仍能辨认出一种模式：数字形成若干**团**（clique），例如 …、$-5$、$-2$、$1$、$4$、$7$、… 彼此相连，且不与任何其他数相连。我们对这类有向图引入如下视觉简写：当节点涂上不同颜色时，表示该有向图中，给定颜色的所有节点与该颜色所有节点（包括自身）双向相连，且不与任何其他节点相连。

![模 3 同余（着色简图）](https://hrmacbeth.github.io/math2001/_images/mod3.png)

### 10.2.2. 例

**问题**

证明 $\mathbb{Z}$ 上由「$a\sim b$ 当且仅当 $a^2=b^2$」定义的关系 $\sim$ 是等价关系。

**解法**

对所有整数 $x$，有 $x^2=x^2$，故 $x\sim x$。因此关系 $\sim$ 是自反的。

对所有整数 $x$ 与 $y$，若 $x\sim y$，则 $x^2=y^2$，故 $y^2=x^2$，从而 $y\sim x$。因此关系 $\sim$ 是对称的。

对所有整数 $x$、$y$ 与 $z$，若 $x\sim y$ 且 $y\sim z$，则 $x^2=y^2$ 且 $y^2=z^2$，于是

$$
\begin{aligned}
x^2&=y^2\\
&=z^2,
\end{aligned}
$$

故 $x\sim z$。因此关系 $\sim$ 是传递的。

```lean
local infix:50 "∼" => fun (x y : ℤ) ↦ x ^ 2 = y ^ 2

example : Reflexive (· ∼ ·) := by
  dsimp [Reflexive]
  intro x
  ring

example : Symmetric (· ∼ ·) := by
  dsimp [Symmetric]
  intro x y hxy
  rw [hxy]

example : Transitive (· ∼ ·) := by
  dsimp [Transitive]
  intro x y z hxy hyz
  calc x ^ 2 = y ^ 2 := by rw [hxy]
    _ = z ^ 2 := by rw [hyz]
```

若你尝试画出该关系的有向图，会发现它与上一个关系有相同的「团」行为。画完有向图后，再画多色「团」简图。

### 10.2.3. 例

你大概已经猜到：对任何等价关系，这种着色都可以一致地进行。让我们把这说得数学上严格一些。

设 $r$ 为类型 $\alpha$ 上的关系，中缀记作 $\sim$。

**定义**

对 $\alpha$ 中的 $a$，$a$ 的**等价类**（equivalence class，记作 $[a]$）是 $\{b:\alpha\mid a\sim b\}$。

**定理**

若关系 $r$ 是对称且传递的，则对所有 $a_1$ 与 $a_2$，若 $a_1\sim a_2$，则 $[a_1]=[a_2]$。

**证明**

我们必须证明：对所有 $\alpha$ 中的 $b$，$a_1\sim b$ 当且仅当 $a_2\sim b$。

首先，设 $a_1\sim b$。由于 $a_1\sim a_2$，由对称性 $a_2\sim a_1$，再由传递性 $a_2\sim a_1\sim b$。

反之，设 $a_2\sim b$。则由于 $a_1\sim a_2$，由传递性 $a_1\sim a_2\sim b$。

```lean
notation:arg "⦍" a "⦐" => { b | a ∼ b }

theorem EquivalenceClass.eq_of_rel (h_symm : @Symmetric α r) (h_trans : @Transitive α r)
    {a1 a2 : α} (ha : a1 ∼ a2) :
    ⦍a1⦐ = ⦍a2⦐ := by
  ext b
  dsimp
  constructor
  · intro ha1b
    apply h_trans (y := a1)
    · apply h_symm ha
    · apply ha1b
  · intro ha2b
    apply h_trans ha ha2b
```

**定理**

若关系 $r$ 是自反的，则每个 $a$ 都是其自身等价类的元素：$a\in [a]$。

**证明**

我们必须证明：对所有 $a$，$a\sim a$ 成立，而这正是自反性的定义。

```lean
theorem EquivalenceClass.mem_self (h_refl : @Reflexive α r) (a : α) :
    a ∈ { b : α | a ∼ b } := by
  dsimp
  apply h_refl
```

### 10.2.4. 例

考虑 $\mathbb{Z}$ 上的关系 $=$。它是等价关系，见[例 10.1.2](#例-1012)。

**练习**：画出该关系：沿一条直线画出（一部分）底层类型 $\mathbb{Z}$，再用不同颜色标出每个等价类。

### 10.2.5. 例

**问题**

证明 $\mathbb{Z}\times\mathbb{N}$ 上由「$(a,b)\sim(c,d)$ 当且仅当 $a(d+1)=c(b+1)$」定义的关系 $\sim$ 是等价关系。

**解法**

对所有 $(a,b)\in \mathbb{Z}\times\mathbb{N}$，有 $a(b+1)=a(b+1)$，故 $(a,b)\sim (a,b)$。因此 $\sim$ 是自反的。

对所有 $(a,b)$ 与 $(c,d)\in \mathbb{Z}\times\mathbb{N}$，若 $(a,b)\sim (c,d)$，则 $a(d+1)=c(b+1)$，故 $c(b+1)=a(d+1)$，从而 $(c,d)\sim (a,b)$。因此 $\sim$ 是对称的。

对所有 $(a,b)$、$(c,d)$ 与 $(e,f)\in \mathbb{Z}\times\mathbb{N}$，若 $(a,b)\sim (c,d)$ 且 $(c,d)\sim (e,f)$，则 $a(d+1)=c(b+1)$ 且 $c(f+1)=e(d+1)$。我们将证明 $a(f+1)=e(b+1)$，从而 $(a,b)\sim (e,f)$，这就证明了 $\sim$ 的传递性。

由于 $d+1>0$，只需证明 $(d+1)\left[a(f+1)\right]=(d+1)\left[e(b+1)\right]$。令 $B:= b+1$、$D:= d+1$、$F:= f+1$：则已知 $aD=cB$ 且 $cF=eD$，需证 $D(aF)=D(eB)$。

事实上，

$$
\begin{aligned}
D (a F) &= (a D) F \\
& = (c B) F \\
& = (c F) B \\
& = (e D) B \\
& = D (e B).
\end{aligned}
$$

```lean
local infix:50 "∼" => fun ((a, b) : ℤ × ℕ) (c, d) ↦ a * (d + 1) = c * (b + 1)

example : Reflexive (· ∼ ·) := by
  dsimp [Reflexive]
  intro (a, b)
  dsimp

example : Symmetric (· ∼ ·) := by
  dsimp [Symmetric]
  intro (a, b) (c, d) h
  dsimp at *
  rw [h]

example : Transitive (· ∼ ·) := by
  dsimp [Transitive]
  intro (a, b) (c, d) (e, f) h1 h2
  dsimp at *
  set B := (b:ℤ) + 1
  set D := (d:ℤ) + 1
  set F := (f:ℤ) + 1
  have :=
  calc D * (a * F) = (a * D) * F := by ring
    _ = (c * B) * F := by rw [h1]
    _ = (c * F) * B := by ring
    _ = (e * D) * B := by rw [h2]
    _ = D * (e * B) := by ring
  cancel D at this
```

现在画出关系 $\sim$：在平面上画出（一部分）底层类型 $\mathbb{Z}\times\mathbb{N}$，再用不同颜色标出每个等价类。

### 10.2.6. 例

**定理**

0 级类型上由「$\alpha\sim\beta$ 当且仅当存在双射 $f:\alpha\to\beta$」定义的关系 $\sim$ 是等价关系。

```lean
local infix:50 "∼" => fun (α β : Type) ↦ ∃ f : α → β, Bijective f

example : Reflexive (· ∼ ·) := by
  dsimp [Reflexive]
  intro α
  use id
  rw [bijective_iff_exists_inverse]
  use id
  constructor
  · rfl
  · rfl

example : Symmetric (· ∼ ·) := by
  dsimp [Symmetric]
  intro α β h
  obtain ⟨f, hf⟩ := h
  rw [bijective_iff_exists_inverse] at hf
  obtain ⟨g, hfg1, hfg2⟩ := hf
  use g
  rw [bijective_iff_exists_inverse]
  use f
  constructor
  · apply hfg2
  · apply hfg1

example : Transitive (· ∼ ·) := by
  dsimp [Transitive]
  intro α β γ h1 h2
  obtain ⟨f1, hf1a, hf1b⟩ := h1
  obtain ⟨f2, hf2a, hf2b⟩ := h2
  use f2 ∘ f1
  constructor
  · apply Injective.comp
    · apply hf2a
    · apply hf1a
  · apply Surjective.comp
    · apply hf2b
    · apply hf1b
```

### 10.2.7. 练习

1. 考虑 $\mathbb{Z}$ 上由「$a\sim b$ 当且仅当存在正整数 $m$ 与 $n$ 使得 $am=bn$」定义的关系 $\sim$。

   * 证明 $\sim$ 是等价关系。

   * 画出关系 $\sim$：沿一条直线画出（一部分）底层类型 $\mathbb{Z}$，再用不同颜色标出每个等价类。

```lean
local infix:50 "∼" => fun (a b : ℤ) ↦ ∃ m n, m > 0 ∧ n > 0 ∧ a * m = b * n

example : Reflexive (· ∼ ·) := by
  sorry

example : Symmetric (· ∼ ·) := by
  sorry

example : Transitive (· ∼ ·) := by
  sorry
```

2. 考虑 $\mathbb{N}^2$ 上由「$(a,b)\sim(c,d)$ 当且仅当 $a+d=b+c$」定义的关系 $\sim$。

   * 证明 $\sim$ 是等价关系。

   * 画出关系 $\sim$：在平面上画出（一部分）底层类型 $\mathbb{N}^2$，再用不同颜色标出每个等价类。

```lean
local infix:50 "∼" => fun ((a, b) : ℕ × ℕ) (c, d) ↦ a + d = b + c

example : Reflexive (· ∼ ·) := by
  sorry

example : Symmetric (· ∼ ·) := by
  sorry

example : Transitive (· ∼ ·) := by
  sorry
```

3. 考虑 $\mathbb{Z}^2$ 上由「$(a,b)\sim(c,d)$ 当且仅当存在正整数 $m$ 与 $n$ 使得 $mb(b^2-3a^2)=nd(d^2-3c^2)$」定义的关系 $\sim$。

   * 证明 $\sim$ 是等价关系。

   * 画出关系 $\sim$：在平面上画出（一部分）底层类型 $\mathbb{Z}^2$，再用不同颜色标出每个等价类。

```lean
local infix:50 "∼" => fun ((a, b) : ℤ × ℤ) (c, d) ↦
  ∃ m n, m > 0 ∧ n > 0 ∧ m * b * (b ^ 2 - 3 * a ^ 2) = n * d * (d ^ 2 - 3 * c ^ 2)

example : Reflexive (· ∼ ·) := by
  sorry

example : Symmetric (· ∼ ·) := by
  sorry

example : Transitive (· ∼ ·) := by
  sorry
```