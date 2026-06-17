# 第 8 章 函数

> 本译文对应原书 [Functions](https://hrmacbeth.github.io/math2001/08_Functions.html)；英文 Sphinx 源：`08_Functions.rst`。

到目前为止，本书研究的是数的性质（一个数是奇数、正数、素数；一个数是否能被另一个数整除）以及数的运算（加法、最大公因子）。

本章我们上升一个抽象层次，研究函数的性质与运算。这些新性质包括：函数是否是**单射**、**满射**、**双射**；一个函数是否是另一个函数的**逆**；以及**复合**运算。

我们还将视野扩展到本书早期使用的数值类型（$\mathbb{N}$、$\mathbb{Z}$、$\mathbb{Q}$、$\mathbb{R}$）之外，开始处理更广泛的类型，包括函数类型、有限归纳类型和积类型。

## 8.1. 单射与满射

### 8.1.1. 例

我们之前研究过一些具体的函数。例如，[例 6.3.3](06_Induction.md#例-633)中的斐波那契数列就是一个从 $\mathbb{N}$ 到 $\mathbb{Z}$ 的函数：它接受一个自然数，比如 5，并输出一个整数，这里是 8（数列的第 5 项）。

```lean
def F : ℕ → ℤ
  | 0 => 1
  | 1 => 1
  | n + 2 => F (n + 1) + F n

#eval F 5 -- infoview 显示 8
```

函数的**定义域**是函数接受输入值的类型，函数的** codomain** 是函数输出值的类型。例如，斐波那契数列的定义域是 $\mathbb{N}$，codomain 是 $\mathbb{Z}$。定义域为 $\mathbb{N}$、codomain 为 $\mathbb{Z}$ 的函数类型记作 $\mathbb{N} \to \mathbb{Z}$。Lean 会确认斐波那契数列 `F` 具有这个类型：

```lean
#check @F -- infoview 显示 F : ℕ → ℤ
```

定义函数的另一种方式是使用显式公式。例如，“设 $q:\mathbb{R}\to\mathbb{R}$ 是由 $q(x)=x+3$ 定义的函数。”在 Lean 中可以写成：

```lean
def q (x : ℝ) : ℝ := x + 3
```

这个函数的定义域是 $\mathbb{R}$，codomain 也是 $\mathbb{R}$——我在定义它时甚至已经说明了 $q$ 的类型是 $\mathbb{R}\to\mathbb{R}$。让我们检查一下这个 Lean 对象确实具有这个类型：

```lean
#check @q -- infoview 显示 q : ℝ → ℝ
```

定义函数的第三种方式是使用记号 $\mapsto$：如果我们只想用一次，不想浪费一个名字，可以称“从 $\mathbb{R}$ 到 $\mathbb{R}$ 的函数 $x \mapsto x^2$”。下面是 Lean 中的相同记号：

```lean
#check fun (x : ℝ) ↦ x ^ 2 -- infoview 显示 fun x ↦ x ^ 2 : ℝ → ℝ
```

### 8.1.2. 定义

现在我们有了 $X \to Y$ 表示“从 $X$ 到 $Y$ 的函数类型”的记号，就可以像之前引入数的性质（如“奇数”、“素数”）一样引入函数的性质。这是第一个。

**定义**

函数 $f : X \to Y$ 是**单射**（injective），如果对 $X$ 中所有 $x_1$、$x_2$，若 $f(x_1)=f(x_2)$，则 $x_1=x_2$。

```lean
def Injective (f : X → Y) : Prop := ∀ {x1 x2 : X}, f x1 = f x2 → x1 = x2
```

### 8.1.3. 例

**问题**

证明[例 8.1.1](#例-811)中的函数 $q:\mathbb{R}\to\mathbb{R}$ 是单射。

**解法**

设 $x_1$、$x_2$ 是实数，假设 $q(x_1)=q(x_2)$。则 $x_1+1=x_2+1$，所以 $x_1=x_2$。

下面是该解法在 Lean 中的写法。注意，用命令 `dsimp [Injective]` 展开“单射”定义后，目标状态显示为

```
⊢ ∀ ⦃x1 x2 : ℝ⦄, q x1 = q x2 → x1 = x2
```

这就是针对当前问题的“单射”定义。

```lean
example : Injective q := by
  dsimp [Injective]
  intro x1 x2 h
  dsimp [q] at h
  addarith [h]
```

### 8.1.4. 例

**问题**

证明从 $\mathbb{R}$ 到 $\mathbb{R}$ 的函数 $x \mapsto x^2$ 不是单射。

**解法**

我们必须证明存在实数 $x_1$、$x_2$ 使得 $x_1^2=x_2^2$ 且 $x_1 \ne x_2$。事实上，$-1$ 和 $1$ 就具有这些性质。

证明的第一句话是否定归约：我展开了“单射”定义，并将其否定重新表述为一个逻辑等价但更方便的形式。回忆一下，在 Lean 中我们使用 `push_neg` 策略来完成这件事。使用 `push_neg` 后的目标状态为

```
⊢ ∃ x1 x2, x1 ^ 2 = x2 ^ 2 ∧ x1 ≠ x2
```

下面是完整的 Lean 证明。

```lean
example : ¬ Injective (fun x : ℝ ↦ x ^ 2) := by
  dsimp [Injective]
  push_neg
  use -1, 1
  constructor
  · numbers
  · numbers
```

### 8.1.5. 定义

**定义**

函数 $f : X \to Y$ 是**满射**（surjective），如果对 $Y$ 中所有 $y$，存在 $X$ 中的 $x$ 使得 $f(x)=y$。

```lean
def Surjective (f : X → Y) : Prop := ∀ y : Y, ∃ x : X, f x = y
```

### 8.1.6. 例

**问题**

考虑函数 $s:\mathbb{Q}\to\mathbb{Q}$，定义为 $s(a)=3a+2$。证明 $s$ 是满射。

**解法**

设 $y$ 是有理数。则

$$
\begin{split} s\left(\frac{y-2}{3}\right) &= 3\left(\frac{y-2}{3}\right) + 2 \\ &= y. \end{split}
$$

下面是该解法在 Lean 中的写法。展开“满射”定义后的目标状态为

```
⊢ ∀ (y : ℚ), ∃ x, s x = y
```

这确认了我们需证明什么，以及为什么上面文本证明中的写法足够。

```lean
def s (a : ℚ) : ℚ := 3 * a + 2

example : Surjective s := by
  dsimp [Surjective]
  intro y
  use (y - 2) / 3
  calc s ((y - 2) / 3) = 3 * ((y - 2) / 3) + 2 := by rw [s]
    _ = y := by ring
```

### 8.1.7. 例

**问题**

证明从 $\mathbb{R}$ 到 $\mathbb{R}$ 的函数 $x \mapsto x^2$ 不是满射。

**解法**

我们将证明存在实数 $y$，使得对所有实数 $x$ 都有 $x^2 \ne y$。

事实上，我们证明 $-1$ 具有这个性质。设 $x$ 是实数。则

$$
\begin{split} -1 &\u003c 0 \\ &\le x^2, \end{split}
$$

所以 $x^2 \ne -1$。

与[例 8.1.4](#例-814)一样，第一句话构成了本情境下“满射”定义的否定归约。实际上，我们陈述的就是 Lean 证明中 `push_neg` 之后的目标状态。

```
⊢ ∃ y, ∀ (x : ℝ), x ^ 2 ≠ y
```

下面是完整的 Lean 证明。

```lean
example : ¬ Surjective (fun x : ℝ ↦ x ^ 2) := by
  dsimp [Surjective]
  push_neg
  use -1
  intro x
  apply ne_of_gt
  calc -1 < 0 := by numbers
    _ ≤ x ^ 2 := by extra
```

### 8.1.8. 例

到目前为止，我们见过数值类型，如整数 $\mathbb{Z}$ 和实数 $\mathbb{R}$，以及函数类型，如 $\mathbb{Z}\to\mathbb{R}$（从 $\mathbb{Z}$ 到 $\mathbb{R}$ 的函数）。

构造类型的另一种方式是作为一个有限选项集合。有限类型对概念性例子很有用，因为一切都是显式且可检查的。

```lean
inductive Musketeer
  | athos
  | porthos
  | aramis
  deriving DecidableEq
```

下面是如何定义一个定义域为给定有限归纳类型的函数。

```lean
def f : Musketeer → Musketeer
  | athos => aramis
  | porthos => aramis
  | aramis => athos
```

**问题**

证明函数 $f$ 不是单射。

![musketeer1a](https://hrmacbeth.github.io/math2001/_images/musketeer1a.png)

```lean
example : ¬ Injective f := by
  dsimp [Injective]
  push_neg
  use athos, porthos
  dsimp [f] -- optional
  exhaust
```

这里 `exhaust` 策略是新的。在使用它的地方，目标状态是

```
aramis = aramis ∧ athos ≠ porthos
```

也就是逻辑上等价于 `True` 的命题。`exhaust` 策略可以做这种命题逻辑推理，无论复杂度如何。

特别地，`exhaust` 可以证明归纳类型中任何（为真的）无变量陈述。本章我们将这样使用它。我们在[第 9 章](09_Sets.md)开始更认真地使用 `exhaust`。

### 8.1.9. 例

**问题**

证明[例 8.1.8](#例-818)中定义的函数 $f$ 不是满射。

![musketeer1b](https://hrmacbeth.github.io/math2001/_images/musketeer1b.png)

我们可以用 `cases` 策略对有限归纳类型中的变量 `a` 进行分情况检查。

```lean
example : ¬ Surjective f := by
  dsimp [Surjective]
  push_neg
  use porthos
  intro a
  cases a
  · exhaust
  · exhaust
  · exhaust
```

这种证明可能变得重复，你可能希望使用我们之前见过的技巧（例如[例 4.4.4](04_Proofs_with_Structure_II.md#例-444)、[例 4.5.9](04_Proofs_with_Structure_II.md#例-459)、[例 6.6.2](06_Induction.md#例-662)、[例 6.7.2](06_Induction.md#例-672)）：当 `cases` 等策略产生多个目标，且这些目标都可以用同一个策略证明时，你可以写 `<;>` 把该策略应用到所有这些目标上。

```lean
-- better (more automated) version of the previous proof
example : ¬ Surjective f := by
  dsimp [Surjective]
  push_neg
  use porthos
  intro a
  cases a <;> exhaust
```

你也可以验证 `cases a <;> exhaust` 这一行是必要的；`exhaust` 不能单独关闭目标。如[例 8.1.8](#例-818)中所讨论，`exhaust` 可以证明归纳类型中任何（为真的）**无变量**陈述，但在 `cases a <;> exhaust` 之前目标状态是

```
a : Musketeer
⊢ f a ≠ porthos
```

其中包含一个变量 `a`。

### 8.1.10. 例

设 $g$ 是从 Musketeer 类型到自身的如下函数：

```lean
def g : Musketeer → Musketeer
  | athos => porthos
  | porthos => aramis
  | aramis => athos
```

![musketeer2](https://hrmacbeth.github.io/math2001/_images/musketeer2.png)

**问题**

证明函数 $g$ 是单射。

这个证明中有很多情况——准确地说，$3 \times 3 = 9$ 种。幸运的是 `exhaust` 可以证明所有情况！

```lean
example : Injective g := by
  dsimp [Injective]
  intro x1 x2 hx
  cases x1 <;> cases x2 <;> exhaust
```

### 8.1.11. 例

**问题**

证明[例 8.1.10](#例-8110)中定义的函数 $g$ 是满射。

```lean
example : Surjective g := by
  dsimp [Surjective]
  intro y
  cases y
  · use aramis
    exhaust
  · use athos
    exhaust
  · use porthos
    exhaust
```

### 8.1.12. 例

我们以一个相对较难的例子结束本节。这里的证明高效且自洽，但动机不太明显。另一种（可能更直观的）方法，是把本节最后一个练习（关于**严格单调**函数的那个）与[例 2.1.8](02_Proofs_with_Structure.md#例-218)中的想法结合起来。

**问题**

证明从 $\mathbb{R}$ 到 $\mathbb{R}$ 的函数 $x \mapsto x^3$ 是单射。

**解法**

设 $x_1$、$x_2$ 是实数，假设 $x_1^3=x_2^3$。则

$$
\begin{split} (x_1-x_2)(x_1^2+x_1x_2+x_2^2) &= x_1^3-x_2^3 \\ &= x_1^3-x_1^3 \\ &= 0, \end{split}
$$

所以要么 $x_1-x_2=0$（此时已证毕），要么 $x_1^2+x_1x_2+x_2^2=0$（以下假设此情形）。

我们进一步按 $x_1$ 是否为 0 分情况。

**情形 1**（$x_1=0$）：则

$$
\begin{split} x_2^3 &= x_1^3 \\ &= 0^3 \\ &= 0, \end{split}
$$

所以 $x_2=0$。于是 $x_1=0=x_2$，如所要求。

**情形 2**（$x_1 \ne 0$）：则

$$
\begin{split} 0 &\u003c x_1^2 + \left((x_1+x_2)^2+x_2^2\right) \\ &= 2(x_1^2+x_1x_2+x_2^2) \\ &= 2 \cdot 0 \\ &= 0, \end{split}
$$

矛盾。

```lean
example : Injective (fun (x:ℝ) ↦ x ^ 3) := by
  intro x1 x2 hx
  dsimp at hx
  have H : (x1 - x2) * (x1 ^ 2 + x1 * x2 + x2 ^ 2) = 0
  · calc (x1 - x2) * (x1 ^ 2 + x1 * x2 + x2 ^ 2) = x1 ^ 3 - x2 ^ 3 := by ring
      _ = x1 ^ 3 - x1 ^ 3 := by rw [hx]
      _ = 0 := by ring
  rw [mul_eq_zero] at H
  obtain H1 | H2 := H
  · -- case 1: x1 - x2 = 0
    addarith [H1]
  · -- case 2: x1 ^2 + x1 * x2 + x2 ^ 2  = 0
    by_cases hx1 : x1 = 0
    · -- case 2a: x1 = 0
      have hx2 :=
      calc x2 ^ 3 = x1 ^ 3 := by rw [hx]
        _ = 0 ^ 3 := by rw [hx1]
        _ = 0 := by numbers
      cancel 3 at hx2
      calc x1 = 0 := by rw [hx1]
        _ = x2 := by rw [hx2]
    · -- case 2b: x1 ≠ 0
      have :=
      calc 0 < x1 ^ 2 + ((x1 + x2) ^ 2 + x2 ^ 2) := by extra
          _ = 2 * (x1 ^ 2 + x1 * x2 + x2 ^ 2) := by ring
          _ = 2 * 0 := by rw [H2]
          _ = 0 := by ring
      numbers at this -- contradiction!
```

### 8.1.13. 练习

1. 证明或反驳：从 $\mathbb{Q}$ 到 $\mathbb{Q}$ 的函数 $x \mapsto x-12$ 是单射。

   （若你认为为真，证明第一个版本；若认为为假，证明第二个版本。）

   ```lean
   example : Injective (fun (x : ℚ) ↦ x - 12) := by
     sorry

   example : ¬ Injective (fun (x : ℚ) ↦ x - 12) := by
     sorry
   ```

2. 证明或反驳：从 $\mathbb{R}$ 到 $\mathbb{R}$ 的函数 $x \mapsto 3$ 是单射。

   ```lean
   example : Injective (fun (x : ℝ) ↦ 3) := by
     sorry

   example : ¬ Injective (fun (x : ℝ) ↦ 3) := by
     sorry
   ```

3. 证明或反驳：从 $\mathbb{Q}$ 到 $\mathbb{Q}$ 的函数 $x \mapsto 3x-1$ 是单射。

   ```lean
   example : Injective (fun (x : ℚ) ↦ 3 * x - 1) := by
     sorry

   example : ¬ Injective (fun (x : ℚ) ↦ 3 * x - 1) := by
     sorry
   ```

4. 证明或反驳：从 $\mathbb{Z}$ 到 $\mathbb{Z}$ 的函数 $x \mapsto 3x-1$ 是单射。

   ```lean
   example : Injective (fun (x : ℤ) ↦ 3 * x - 1) := by
     sorry

   example : ¬ Injective (fun (x : ℤ) ↦ 3 * x - 1) := by
     sorry
   ```

5. 证明或反驳：从 $\mathbb{R}$ 到 $\mathbb{R}$ 的函数 $x \mapsto 2x$ 是满射。

   ```lean
   example : Surjective (fun (x : ℝ) ↦ 2 * x) := by
     sorry

   example : ¬ Surjective (fun (x : ℝ) ↦ 2 * x) := by
     sorry
   ```

6. 证明或反驳：从 $\mathbb{Z}$ 到 $\mathbb{Z}$ 的函数 $x \mapsto 2x$ 是满射。

   ```lean
   example : Surjective (fun (x : ℤ) ↦ 2 * x) := by
     sorry

   example : ¬ Surjective (fun (x : ℤ) ↦ 2 * x) := by
     sorry
   ```

7. 证明或反驳：从 $\mathbb{N}$ 到 $\mathbb{N}$ 的函数 $n \mapsto n^2$ 是满射。

   ```lean
   example : Surjective (fun (n : ℕ) ↦ n ^ 2) := by
     sorry

   example : ¬ Surjective (fun (n : ℕ) ↦ n ^ 2) := by
     sorry
   ```

8. 考虑如下有限归纳类型 White，以及从 Musketeer 类型（见[例 8.1.8](#例-818)）到 White 类型的函数 $h$。证明或反驳 $h$ 是单射。

   ```lean
   inductive White
     | meg
     | jack
     deriving DecidableEq

   open White

   def h : Musketeer → White
     | athos => jack
     | porthos => meg
     | aramis => jack

   example : Injective h := by
     sorry

   example : ¬ Injective h := by
     sorry
   ```

9. 证明或反驳上一例子中的函数 $h$ 是满射。

   ```lean
   example : Surjective h := by
     sorry

   example : ¬ Surjective h := by
     sorry
   ```

10. 考虑如下从 White 类型（见前两个问题）到 Musketeer 类型（见[例 8.1.8](#例-818)）的函数 $l$。证明或反驳 $l$ 是单射。

    ```lean
    def l : White → Musketeer
      | meg => aramis
      | jack => porthos

    example : Injective l := by
      sorry

    example : ¬ Injective l := by
      sorry
    ```

11. 证明或反驳上一例子中的函数 $l$ 是满射。

    ```lean
    example : Surjective l := by
      sorry

    example : ¬ Surjective l := by
      sorry
    ```

12. 设 $f : X \to Y$ 是函数。证明 $f$ 是单射当且仅当对 $X$ 中所有 $x_1$、$x_2$，若 $x_1 \ne x_2$ 则 $f(x_1) \ne f(x_2)$。

    你需要使用能处理更微妙否定的策略（如 `push_neg` 或 `by_cases`）。

    ```lean
    example (f : X → Y) : Injective f ↔ ∀ x1 x2 : X, x1 ≠ x2 → f x1 ≠ f x2 := by
      sorry
    ```

13. 证明或反驳：对所有函数 $f:\mathbb{Q}\to\mathbb{Q}$，若 $f$ 是单射，则从 $\mathbb{Q}$ 到 $\mathbb{Q}$ 的函数 $x \mapsto f(x)+1$ 也是单射。

    ```lean
    example : ∀ (f : ℚ → ℚ), Injective f → Injective (fun x ↦ f x + 1) := by
      sorry

    example : ¬ ∀ (f : ℚ → ℚ), Injective f → Injective (fun x ↦ f x + 1) := by
      sorry
    ```

14. 证明或反驳：对所有函数 $f:\mathbb{Q}\to\mathbb{Q}$，若 $f$ 是单射，则从 $\mathbb{Q}$ 到 $\mathbb{Q}$ 的函数 $x \mapsto f(x)+x$ 也是单射。

    ```lean
    example : ∀ (f : ℚ → ℚ), Injective f → Injective (fun x ↦ f x + x) := by
      sorry

    example : ¬ ∀ (f : ℚ → ℚ), Injective f → Injective (fun x ↦ f x + x) := by
      sorry
    ```

15. 证明或反驳：对所有函数 $f:\mathbb{Z}\to\mathbb{Z}$，若 $f$ 是满射，则从 $\mathbb{Z}$ 到 $\mathbb{Z}$ 的函数 $x \mapsto 2f(x)$ 也是满射。

    ```lean
    example : ∀ (f : ℤ → ℤ), Surjective f → Surjective (fun x ↦ 2 * f x) := by
      sorry

    example : ¬ ∀ (f : ℤ → ℤ), Surjective f → Surjective (fun x ↦ 2 * f x) := by
      sorry
    ```

16. 证明或反驳：对所有实数 $c$，从 $\mathbb{R}$ 到 $\mathbb{R}$ 的函数 $x \mapsto cx$ 是满射。

    ```lean
    example : ∀ c : ℝ, Surjective (fun x ↦ c * x) := by
      sorry

    example : ¬ ∀ c : ℝ, Surjective (fun x ↦ c * x) := by
      sorry
    ```

17. 设 $f:\mathbb{Q}\to\mathbb{Q}$ 是**严格单调**函数；即对所有满足 $x < y$ 的实数 $x$、$y$，都有 $f(x) < f(y)$。证明 $f$ 是单射。

    你可能希望使用引理 `lt_trichotomy`：

    ```lean
    lemma lt_trichotomy (x y : ℚ) : x < y ∨ x = y ∨ x < y :=
    ```

    它对两个实数的大小关系给出了一种情况划分。

    ```lean
    example {f : ℚ → ℚ} (hf : ∀ x y, x < y → f x < f y) : Injective f := by
      sorry
    ```

18. 设 $f:X\to\mathbb{N}$ 是函数，$x_0$ 是 $X$ 中满足 $f(x_0)=0$ 的元素，$i:X\to X$ 是满足对所有 $x$ 都有 $f(i(x))=f(x)+1$ 的函数。证明 $f$ 是满射。我建议用归纳法。

    我们以 `surjective_of_intertwining` 的名字记录这个定理供以后使用。

    ```lean
    example {f : X → ℕ} {x0 : X} (h0 : f x0 = 0) {i : X → X}
        (hi : ∀ x, f (i x) = f x + 1) : Surjective f := by
      sorry
    ```

## 8.2. 双射

### 8.2.1. 定义

**定义**

函数是**双射**（bijective），如果它既是单射又是满射。

```lean
def Bijective (f : X → Y) : Prop := Injective f ∧ Surjective f
```

### 8.2.2. 例

**问题**

设 $p:\mathbb{R}\to\mathbb{R}$ 是由 $p(x)=2x-5$ 定义的函数。证明 $p$ 是双射。

**解法**

我们必须证明 $p$ 既是单射又是满射。

对于单射性，设 $x_1$、$x_2$ 是实数并假设 $p(x_1)=p(x_2)$。这意味着 $2x_1-5=2x_2-5$。所以

$$
\begin{split} x_1 &= \frac{(2x_1-5)+5}{2} \\ &= \frac{(2x_2-5)+5}{2} \\ &= x_2. \end{split}
$$

对于满射性，设 $y$ 是实数。则

$$
\begin{split} p\left(\frac{y+5}{2}\right) &= 2\left(\frac{y+5}{2}\right) - 5 \\ &= y. \end{split}
$$

```lean
def p (x : ℝ) : ℝ := 2 * x - 5

example : Bijective p := by
  dsimp [Bijective]
  constructor
  · dsimp [Injective]
    intro x1 x2 hx
    dsimp [p] at hx
    calc x1 = ((2 * x1 - 5) + 5) / 2 := by ring
      _ = ((2 * x2 - 5) + 5) / 2 := by rw [hx]
      _ = x2 := by ring
  · dsimp [Surjective]
    intro y
    use (y + 5) / 2
    calc p ((y + 5) / 2) = 2 * ((y + 5) / 2) - 5 := by rfl
      _ = y := by ring
```

### 8.2.3. 例

**问题**

设 $a:\mathbb{R}\to\mathbb{R}$ 是由 $a(t)=t^3-t$ 定义的函数。证明 $a$ 不是双射。

**解法**

我们证明 $a$ 不是单射。事实上，注意到 $0 \ne 1$ 但

$$
\begin{split} a(0) &= 0^3 - 0 \\ &= 1^3 - 1 \\ &= a(1). \end{split}
$$

```lean
def a (t : ℝ) : ℝ := t ^ 3 - t

example : ¬ Bijective a := by
  dsimp [Bijective]
  push_neg
  left
  dsimp [Injective]
  push_neg
  use 0, 1
  constructor
  · calc a 0 = 0 ^ 3 - 0 := by rfl
      _ = 1 ^ 3 - 1 := by numbers
      _ = a 1 := by rfl
  · numbers
```

### 8.2.4. 例

考虑如下有限归纳类型 Celestial 和 Subatomic：

```lean
inductive Celestial
  | sun
  | moon
  deriving DecidableEq

inductive Subatomic
  | proton
  | neutron
  | electron
  deriving DecidableEq
```

考虑如下从 Celestial 类型到 Subatomic 类型的函数 $f$。

```lean
def f : Celestial → Subatomic
  | sun => proton
  | moon => electron
```

**问题**

证明函数 $f$ 不是双射。

![celestial_subatomic](https://hrmacbeth.github.io/math2001/_images/celestial_subatomic.png)

```lean
example : ¬ Bijective f := by
  dsimp [Bijective]
  push_neg
  right
  dsimp [Surjective]
  push_neg
  use neutron
  intro x
  cases x <;> exhaust
```

### 8.2.5. 例

**定理**

函数 $f:X\to Y$ 是双射，当且仅当对 $Y$ 中所有 $y$，存在唯一的 $X$ 中 $x$ 使得 $f(x)=y$。

**证明**

首先，假设 $f$ 是双射。设 $y$ 是 $Y$ 中元素。由于 $f$ 是满射，存在 $X$ 中 $x$ 使得 $f(x)=y$。我们将证明这个 $x$ 是唯一的。事实上，对任何其他满足 $f(x')=y$ 的 $x'$，有

$$
\begin{split} f(x') &= y \\ &= f(x), \end{split}
$$

所以由 $f$ 的单射性，$x'=x$。

反过来，假设对 $Y$ 中所有 $y$，存在唯一的 $X$ 中 $x$ 使得 $f(x)=y$。$(\star)$ 我们必须证明 $f$ 是单射和满射。

对于单射性，设 $x_1$、$x_2$ 是 $X$ 中元素，假设 $f(x_1)=f(x_2)$。将 $(\star)$ 应用于 $y=f(x_1)$，存在唯一的 $X$ 中 $x$ 使得 $f(x)=f(x_1)$。所以由唯一性，$x_1=x$；又由于 $f(x_2)=f(x_1)=f(x)$，也有 $x_2=x$。综合得 $x_1=x_2$。

对于满射性，设 $y$ 是 $Y$ 中元素。由 $(\star)$，存在（唯一的）$X$ 中 $x$ 使得 $f(x)=y$。

```lean
example {f : X → Y} : Bijective f ↔ ∀ y, ∃! x, f x = y := by
  constructor
  · -- if `f` is bijective then `∀ y, ∃! x, f x = y`
    intro h y
    obtain ⟨h_inj, h_surj⟩ := h
    obtain ⟨x, hx⟩ := h_surj y
    use x
    dsimp
    constructor
    · apply hx
    · intro x' hx'
      apply h_inj
      calc f x' = y := by rw [hx']
        _ = f x := by rw [hx]
  · -- if `∀ y, ∃! x, f x = y` then `f` is bijective
    intro h
    constructor
    · -- `f` is injective
      intro x1 x2 hx1x2
      obtain ⟨x, hx, hx'⟩ := h (f x1)
      have hxx1 : x1 = x
      · apply hx'
        rfl
      have hxx2 : x2 = x
      · apply hx'
        rw [hx1x2]
      calc x1 = x := by rw [hxx1]
        _ = x2 := by rw [hxx2]
    · -- `f` is surjective
      intro y
      obtain ⟨x, hx, hx'⟩ := h y
      use x
      apply hx
```

### 8.2.6. 例

**问题**

证明对所有从 Celestial 类型（[例 8.2.4](#例-824)）到自身的函数 $f$，若 $f$ 是单射则它是双射。

我们通过对所有从 Celestial 类型到自身的函数 $f$ 进行穷举分析来证明这一点。这样的函数共有四个。我在下面处理了前两种情况；请你自己补全后两种情况。

```lean
example : ∀ f : Celestial → Celestial, Injective f → Bijective f := by
  intro f hf
  constructor
  · -- `f` is injective by assumption
    apply hf
  -- show that `f` is surjective
  match h_sun : f sun, h_moon : f moon with
  | sun, sun =>
    have : sun = moon
    · apply hf
      rw [h_sun, h_moon]
    contradiction
  | sun, moon =>
    intro y
    cases y
    · use sun
      apply h_sun
    · use moon
      apply h_moon
  | moon, sun => sorry
  | moon, moon => sorry
```

### 8.2.7. 例

**问题**

证明并非对所有函数 $f:\mathbb{N}\to\mathbb{N}$，若 $f$ 是单射则它是双射。

**解法**

我们必须证明存在函数 $f:\mathbb{N}\to\mathbb{N}$，它是单射但不是双射。

事实上，考虑函数 $f(n)=n+1$。这个函数是单射，因为对所有自然数 $n_1$、$n_2$，若 $n_1+1=n_2+1$ 则 $n_1=n_2$。

然而，这个函数不是满射，因此也不是双射。要看到这一点，注意到对所有自然数 $n$，有 $f(n)=n+1 > 0$，因此 $f(n) \ne 0$。

```lean
example : ¬ ∀ f : ℕ → ℕ, Injective f → Bijective f := by
  push_neg
  use fun n ↦ n + 1
  constructor
  · -- the function is injective
    intro n1 n2 hn
    addarith [hn]
  · -- the function is not bijective
    dsimp [Bijective]
    push_neg
    right
    -- specifically, it's not surjective
    dsimp [Surjective]
    push_neg
    use 0
    intro n
    apply ne_of_gt
    extra
```

### 8.2.8. 练习

1. 证明或反驳：从 $\mathbb{R}$ 到 $\mathbb{R}$ 的函数 $x \mapsto 4-3x$ 是双射。

   ```lean
   example : Bijective (fun (x : ℝ) ↦ 4 - 3 * x) := by
     sorry

   example : ¬ Bijective (fun (x : ℝ) ↦ 4 - 3 * x) := by
     sorry
   ```

2. 证明或反驳：从 $\mathbb{R}$ 到 $\mathbb{R}$ 的函数 $x \mapsto x^2+2x$ 是双射。

   ```lean
   example : Bijective (fun (x : ℝ) ↦ x ^ 2 + 2 * x) := by
     sorry

   example : ¬ Bijective (fun (x : ℝ) ↦ x ^ 2 + 2 * x) := by
     sorry
   ```

3. 考虑如下有限归纳类型 Element，以及从 Element 类型到自身的函数 $e$。证明或反驳 $e$ 是双射。

   ```lean
   inductive Element
     | fire
     | water
     | earth
     | air
     deriving DecidableEq

   open Element

   def e : Element → Element
     | fire => earth
     | water => air
     | earth => fire
     | air => water

   example : Bijective e := by
     sorry

   example : ¬ Bijective e := by
     sorry
   ```

4. 证明对所有从 Subatomic 类型（[例 8.2.4](#例-824)）到自身的函数 $f$，若 $f$ 是单射则它是双射。

   这类似于[例 8.2.6](#例-826)，但要检查更多情况。

   ```lean
   example : ∀ f : Subatomic → Subatomic, Injective f → Bijective f := by
     sorry
   ```

5. 考虑前面练习中的有限归纳类型 Element。证明对所有从 Element 类型到自身的函数 $f$，若 $f$ 是单射则它是双射。

   这类似于[例 8.2.6](#例-826)和上一练习，但要检查的情况更多（老实说，太多了……）。

   ```lean
   example : ∀ f : Element → Element, Injective f → Bijective f := by
     sorry
   ```

## 8.3. 函数的复合

### 8.3.1. 定义

**定义**

函数 $g : Y \to Z$ 与函数 $f : X \to Y$ 的**复合**是从 $X$ 到 $Z$ 的函数，它把 $x$ 映到 $g(f(x))$。

```lean
def comp (f : X → Y) (g : Y → Z) (x : X) : Z := g (f x)
```

$g : Y \to Z$ 与 $f : X \to Y$ 的复合记作 $g \circ f$（在 Lean 中是 `g ∘ f`）。

### 8.3.2. 例

**问题**

设 $f:\mathbb{R}\to\mathbb{R}$ 是由 $f(a)=a+3$ 定义的函数，$g:\mathbb{R}\to\mathbb{R}$ 是由 $g(b)=2b$ 定义的函数，$h:\mathbb{R}\to\mathbb{R}$ 是由 $h(c)=2c+6$ 定义的函数。

证明 $g \circ f = h$。

**解法**

设 $x$ 是实数。则

$$
\begin{split} (g \circ f)(x) &= g(f(x)) \\ &= 2(x+3) \\ &= 2x+6 \\ &= h(x). \end{split}
$$

在 Lean 证明中，注意新策略 `ext`。要证明两个函数相等，我们必须证明它们在每个输入上都相等。这就是 `ext` 策略所做的。（名称代表“外延性”（extensionality）。）使用它之前，目标状态是

```
⊢ g ∘ f = h
```

使用之后，目标状态是

```
x : ℝ
⊢ (g ∘ f) x = h x
```

下面是完整的 Lean 证明。

```lean
def f (a : ℝ) : ℝ := a + 3
def g (b : ℝ) : ℝ := 2 * b
def h (c : ℝ) : ℝ := 2 * c + 6

example : g ∘ f = h := by
  ext x
  calc (g ∘ f) x = g (f x) := by rfl
    _ = 2 * (x + 3) := by rfl
    _ = 2 * x + 6 := by ring
    _ = h x := by rfl
```

### 8.3.3. 定义

**定义**

**恒等函数** $\operatorname{Id}_X : X \to X$ 是把 $X$ 中每个 $x$ 映到自身的函数。

### 8.3.4. 例

**问题**

设 $s:\mathbb{R}\to\mathbb{R}$ 是由 $s(x)=5-x$ 定义的函数。

证明 $s \circ s = \operatorname{Id}_\mathbb{R}$。

**解法**

设 $x$ 是实数。我们必须证明 $5-(5-x)=x$，这是成立的。

```lean
def s (x : ℝ) : ℝ := 5 - x

example : s ∘ s = id := by
  ext x
  dsimp [s]
  ring
```

### 8.3.5. 定义

**定义**

函数 $g : Y \to X$ 是 $f : X \to Y$ 的**逆**，如果 $g \circ f = \operatorname{Id}_X$ 且 $f \circ g = \operatorname{Id}_Y$。

```lean
def Inverse (f : X → Y) (g : Y → X) : Prop := g ∘ f = id ∧ f ∘ g = id
```

### 8.3.6. 例

考虑如下有限归纳类型 Humour：

```lean
inductive Humour
  | melancholic
  | choleric
  | phlegmatic
  | sanguine
  deriving DecidableEq
```

考虑如下从 Humour 类型到自身的函数 $p$。

```lean
def p : Humour → Humour
  | melancholic => choleric
  | choleric => sanguine
  | phlegmatic => phlegmatic
  | sanguine => melancholic
```

![humour](https://hrmacbeth.github.io/math2001/_images/humour.png)

**问题**

定义一个从 Humour 类型到自身的函数 $q$，使其成为 $p$ 的逆，并证明这一点。

```lean
def q : Humour → Humour
  | melancholic => sanguine
  | choleric => melancholic
  | phlegmatic => phlegmatic
  | sanguine => choleric

example : Inverse p q := by
  constructor
  · ext x
    cases x <;> exhaust
  · ext x
    cases x <;> exhaust
```

### 8.3.7. 例

**命题**

设 $f : X \to Y$ 是双射函数。则存在函数 $g : Y \to X$ 是 $f$ 的逆。

**证明**

如下定义函数 $g : Y \to X$：给定 $Y$ 中 $y$，由 $f$ 的满射性，存在 $X$ 中 $x$ 使得 $f(x)=y$，我们令 $g(y)$ 就是这个 $x$。于是对所有 $y$，都有 $f(g(y))=y$。$(\star)$

这立即表明 $f \circ g = \operatorname{Id}_Y$。要证明 $g \circ f = \operatorname{Id}_X$，设 $x$ 是 $X$ 中元素。由 $(\star)$，有

$$
\begin{split} f((g \circ f)(x)) &= f(g(f(x))) \\ &= f(x) \\ &= f(\operatorname{Id}_X(x)), \end{split}
$$

所以由 $f$ 的单射性，$(g \circ f)(x) = \operatorname{Id}_X(x)$。

要在 Lean 中写出这个证明，我们需要一个策略 `choose`[^1]，本书其他地方不会使用它。这个策略按上述文本证明第一段描述的方式构造函数 $g : Y \to X$。更准确地说，给定假设

```
h_surj: ∀ (b : Y), ∃ a, f a = b
```

策略调用 `choose g hg using h_surj` 会创建一个函数，它为每个 `b` “选择”一个 `a`：

```
g : Y → X
hg : ∀ (b : Y), f (g b) = b
```

下面是完整的 Lean 证明。

```lean
theorem exists_inverse_of_bijective {f : X → Y} (hf : Bijective f) :
    ∃ g : Y → X, Inverse f g := by
  dsimp [Bijective] at hf
  obtain ⟨h_inj, h_surj⟩ := hf
  dsimp [Surjective] at h_surj
  choose g hg using h_surj
  use g
  dsimp [Inverse]
  constructor
  · -- prove `g ∘ f = id`
    ext x
    dsimp [Injective] at h_inj
    apply h_inj
    calc f ((g ∘ f) x) = f (g (f x)) := by rfl
      _ = f x := by apply hg
      _ = f (id x) := by rfl
  · -- prove `f ∘ g = id`
    ext y
    apply hg
```

### 8.3.8. 例

**命题**

设 $f : X \to Y$ 和 $g : Y \to X$ 是函数，且 $g : Y \to X$ 是 $f : X \to Y$ 的逆。则 $f : X \to Y$ 是双射。

**证明**

我们首先证明 $f$ 是单射。事实上，设 $x_1$、$x_2$ 是 $X$ 中元素，假设 $f(x_1)=f(x_2)$。则

$$
\begin{split} x_1 &= \operatorname{Id}_X(x_1) \\ &= (g \circ f)(x_1) \\ &= g(f(x_1)) \\ &= g(f(x_2)) \\ &= (g \circ f)(x_2) \\ &= \operatorname{Id}_X(x_2) \\ &= x_2. \end{split}
$$

现在我们证明 $f$ 是满射。事实上，设 $y$ 是 $Y$ 中元素。则

$$
\begin{split} f(g(y)) &= (f \circ g)(y) \\ &= \operatorname{Id}_Y(y) \\ &= y. \end{split}
$$

```lean
theorem bijective_of_inverse {f : X → Y} {g : Y → X} (h : Inverse f g) :
    Bijective f := by
  dsimp [Inverse] at h
  obtain ⟨hgf, hfg⟩ := h
  constructor
  · -- `f` is injective
    intro x1 x2 hx
    calc x1 = id x1 := by rfl
      _ = (g ∘ f) x1 := by rw [hgf]
      _ = g (f x1) := by rfl
      _ = g (f x2) := by rw [hx]
      _ = (g ∘ f) x2 := by rfl
      _ = id x2 := by rw [hgf]
      _ = x2 := by rfl
  · -- `f` is surjective
    intro y
    use g y
    calc f (g y) = (f ∘ g) y := by rfl
      _ = id y := by rw [hfg]
      _ = y := by rfl
```

### 8.3.9. 例

**定理**

设 $f : X \to Y$ 是函数。则 $f$ 是双射，当且仅当存在函数 $g : Y \to X$ 是 $f$ 的逆。

**证明**

一个方向由[例 8.3.7](#例-837)给出，另一方向由[例 8.3.8](#例-838)给出。

```lean
theorem bijective_iff_exists_inverse (f : X → Y) :
    Bijective f ↔ ∃ g : Y → X, Inverse f g := by
  constructor
  · apply exists_inverse_of_bijective
  · intro h
    obtain ⟨g, H⟩ := h
    apply bijective_of_inverse H
```

### 8.3.10. 练习

1. 考虑如下从 Humour 类型（见[例 8.3.6](#例-836)）到自身的函数 $a$ 和 $b$。写出一个从 Humour 类型到自身的函数 $c$，使得 $b \circ a = c$。

   当你写出正确的函数后，附带的证明会生效。

   ```lean
   def a : Humour → Humour
     | melancholic => sanguine
     | choleric => choleric
     | phlegmatic => phlegmatic
     | sanguine => melancholic

   def b : Humour → Humour
     | melancholic => phlegmatic
     | choleric => phlegmatic
     | phlegmatic => melancholic
     | sanguine => sanguine

   def c : Humour → Humour
     | melancholic => sorry
     | choleric => sorry
     | phlegmatic => sorry
     | sanguine => sorry

   example : b ∘ a = c := by
     ext x
     cases x <;> exhaust
   ```

2. 考虑函数 $u:\mathbb{R}\to\mathbb{R}$，定义为 $u(x)=5x+1$。写出一个函数 $v:\mathbb{R}\to\mathbb{R}$ 使其是 $u$ 的逆，并证明它。

   ```lean
   def u (x : ℝ) : ℝ := 5 * x + 1

   noncomputable def v (x : ℝ) : ℝ := sorry

   example : Inverse u v := by
     sorry
   ```

3. 设 $f : X \to Y$ 和 $g : Y \to Z$ 是单射函数。证明 $g \circ f$ 也是单射。

   ```lean
   example {f : X → Y} (hf : Injective f) {g : Y → Z} (hg : Injective g) :
       Injective (g ∘ f) := by
     sorry
   ```

4. 设 $f : X \to Y$ 和 $g : Y \to Z$ 是满射函数。证明 $g \circ f$ 也是满射。

   ```lean
   example {f : X → Y} (hf : Surjective f) {g : Y → Z} (hg : Surjective g) :
       Surjective (g ∘ f) := by
     sorry
   ```

5. 设 $f : X \to Y$ 是满射函数。证明存在函数 $g : Y \to X$ 使得 $f \circ g = \operatorname{Id}_Y$。

   ```lean
   example {f : X → Y} (hf : Surjective f) : ∃ g : Y → X, f ∘ g = id := by
     sorry
   ```

6. 设 $f : X \to Y$ 和 $g : Y \to X$ 是函数，$g$ 是 $f$ 的逆。证明 $f$ 也是 $g$ 的逆。

   ```lean
   example {f : X → Y} {g : Y → X} (h : Inverse f g) : Inverse g f := by
     sorry
   ```

7. 设 $f : X \to Y$ 和 $g_1, g_2 : Y \to X$ 是函数，$g_1$ 和 $g_2$ 都是 $f$ 的逆。证明 $g_1 = g_2$。

   这个问题说明：若函数 $f$ 有逆，则其逆唯一。

   ```lean
   example {f : X → Y} {g1 g2 : Y → X} (h1 : Inverse f g1) (h2 : Inverse f g2) :
       g1 = g2 := by
     sorry
   ```

[^1] 专家会认出这是[选择公理](https://en.wikipedia.org/wiki/Axiom_of_choice)。

## 8.4. 积类型

### 8.4.1. 例

**问题**

考虑函数 $q:\mathbb{Z}\to\mathbb{Z}^2$，定义为 $q(m)=(m+1, 2-m)$。证明 $q$

1. 是单射；
2. 不是满射。

**解法**

1. 设 $m_1$、$m_2$ 是整数并假设 $q(m_1)=q(m_2)$。则按定义

   $$(m_1+1, 2-m_1) = (m_2+1, 2-m_2),$$

   所以 $m_1+1=m_2+1$ 且 $2-m_1=2-m_2$，故 $m_1=m_2$。

2. 我们将证明存在 $\mathbb{Z}^2$ 中的 $(a,b)$，使得对所有整数 $m$ 都有 $q(m) \ne (a,b)$。事实上，我们证明 $(0,1)$ 具有这个性质。假设 $m$ 是整数且 $q(m)=(0,1)$。则按定义

   $$(m+1, 2-m) = (0,1),$$

   所以 $m+1=0$ 且 $2-m=1$，因此

   $$
   \begin{split} 1 &= (m+1)+(2-m)-2 \\ &= 0+1-2 \\ &= -1, \end{split}
   $$

   矛盾。

要在 Lean 中写出这些证明，注意在单射性问题中使用 `obtain` 策略，把积类型中的等式假设

```
hm : (m1 + 1, 2 - m1) = (m2 + 1, 2 - m2)
```

转换成两个分量中的等式假设：

```
hm' : m1 + 1 = m2 + 1
hm'' : 2 - m1 = 2 - m2
```

这与你对积类型中相等的理解一致：两个有序对相等，当且仅当左部分相等**且**右部分相等。所以我们使用与逻辑运算符“且”相同的策略和语法。

```lean
def q (m : ℤ) : ℤ × ℤ := (m + 1, 2 - m)

example : Injective q := by
  dsimp [Injective]
  intro m1 m2 hm
  dsimp [q] at hm
  obtain ⟨hm', hm''⟩ := hm
  addarith [hm']
```

`obtain` 策略在非满射性问题中类似地用于分解积类型中的等式假设

```
hm : (m + 1, 2 - m) = (0, 1)
```

该假设在该问题中出现。

```lean
example : ¬ Surjective q := by
  dsimp [Surjective]
  push_neg
  use (0, 1)
  intro m hm
  dsimp [q] at hm
  obtain ⟨hm1, hm2⟩ := hm
  have H : 1 = -1 := by addarith [hm1, hm2]
  numbers at H
```

### 8.4.2. 例

**问题**

考虑函数 $(m,n) \mapsto (m+n, m+2n)$ 从 $\mathbb{Z}^2$ 到 $\mathbb{Z}^2$。证明这个函数是双射。

通常，证明函数是双射最有效的方式是构造它的逆。这足够是因为我们在[例 8.3.9](#例-839)中证明的定理。想出这个逆应该在草稿纸上完成，而不是在 Lean 中。例如，在这个问题中，你可以建立一个关于 $(a,b)$ 的方程，即逆必须满足：

$$(a,b) = (m+n, m+2n)$$

并化简为一个整数方程组，然后解出 $m$ 和 $n$：

$$
\begin{split} a &= m+n \\ b &= m+2n \\ b-a &= (m+2n)-(m+n) \\ &= n \\ n &= b-a \\ a &= m+n \\ &= m+(b-a) \\ a-(b-a) &= m \\ 2a-b &= m \\ m &= 2a-b \end{split}
$$

从而得出结论：一个好的逆候选是从 $\mathbb{Z}^2$ 到 $\mathbb{Z}^2$ 的函数 $(a,b) \mapsto (2a-b, b-a)$。但这些草稿工作不会出现在正式书写中，无论是纸笔还是 Lean。相反，直接把逆拿出来，然后验证它可行。

**解法**

由[例 8.3.9](#例-839)，只需证明这个函数有逆。我们将证明函数 $(a,b) \mapsto (2a-b, b-a)$ 是它的逆。

首先，对 $\mathbb{Z}^2$ 中任意 $(m,n)$，有

$$\bigl(2(m+n)-(m+2n), (m+2n)-(m+n)\bigr) = (m, n).$$

其次，对 $\mathbb{Z}^2$ 中任意 $(a,b)$，有

$$\bigl((2a-b)+(b-a), (2a-b)+2(b-a)\bigr) = (a, b).$$

在 Lean 中，注意

* 引理 `bijective_iff_exists_inverse`，即[例 8.3.9](#例-839)中定理的 Lean 名称；
* 使用 `ext` 策略（回忆[例 8.3.2](#例-832)）通过证明两个函数在任意输入上相等来证明它们相等。

```lean
example : Bijective (fun ((m, n) : ℤ × ℤ) ↦ (m + n, m + 2 * n)) := by
  rw [bijective_iff_exists_inverse]
  use fun (a, b) ↦ (2 * a - b, b - a)
  constructor
  · ext ⟨m, n⟩
    dsimp
    ring
  · ext ⟨a, b⟩
    dsimp
    ring
```

### 8.4.3. 例

[例 8.4.2](#例-842)中的想法可以相当灵活地调整，特别是在有理数和实数上。你自己试试这个。

**问题**

考虑函数 $(m,n) \mapsto (m+n, m-n)$ 从 $\mathbb{R}^2$ 到 $\mathbb{R}^2$。证明这个函数是双射。

```lean
example : Bijective (fun ((m, n) : ℝ × ℝ) ↦ (m + n, m - n)) := by
  sorry
```

但在整数上，麻烦可能会出现。你会发现上一题的逆涉及除法，在 $\mathbb{R}$ 上没问题，但在 $\mathbb{Z}$ 上不行。事实上，在这种情况下，这个函数作为从 $\mathbb{Z}^2$ 到 $\mathbb{Z}^2$ 的映射**不是**双射。

**问题**

考虑函数 $(m,n) \mapsto (m+n, m-n)$ 从 $\mathbb{Z}^2$ 到 $\mathbb{Z}^2$。证明这个函数不是双射。

**解法**

我们证明这个函数不是满射。事实上，我们证明对所有 $\mathbb{Z}^2$ 中的 $(m,n)$，$(m+n, m-n) \ne (0,1)$。设 $(m,n)$ 在 $\mathbb{Z}^2$ 中并假设 $(m+n, m-n)=(0,1)$。则 $m+n=0$ 且 $m-n=1$，所以

$$
\begin{split} 0 &\equiv 2m \pmod 2 \\ &= (m-n)+(m+n) \\ &= 1+0 \\ &= 1, \end{split}
$$

矛盾。

这个问题的最后部分可以有不同的展开方式。假设 $m+n=0$ 和 $m-n=1$ 显然矛盾（对整数而言），所以你有多种不同的方式可以产生矛盾，而不必像我这里那样用数值矛盾 $0 \equiv 1 \pmod 2$。

```lean
example : ¬ Bijective (fun ((m, n) : ℤ × ℤ) ↦ (m + n, m - n)) := by
  dsimp [Bijective, Injective, Surjective]
  push_neg
  right
  use (0, 1)
  intro (m, n) h
  dsimp at h
  obtain ⟨h1, h2⟩ := h
  have :=
  calc 0 ≡ 2 * m [ZMOD 2] := by extra
    _ = (m - n) + (m + n) := by ring
    _ = 1 + 0 := by rw [h1, h2]
    _ = 1 := by numbers
  numbers at this
```

### 8.4.4. 例

**问题**

考虑函数 $(x,y) \mapsto (x+y, x-y, y)$ 从 $\mathbb{R}^2$ 到 $\mathbb{R}^3$。证明这个函数是单射。

**解法**

设 $(x_1,y_1)$ 和 $(x_2,y_2)$ 是 $\mathbb{R}^2$ 中的点，假设

$$(x_1+y_1, x_1-y_1, y_1) = (x_2+y_2, x_2-y_2, y_2).$$

则逐坐标检查，有

$$
\begin{split} x_1+y_1 &= x_2+y_2 \\ x_1-y_1 &= x_2-y_2 \\ y_1 &= y_2 \end{split}
$$

用第一个方程减去第三个方程，也有 $x_1=x_2$。所以 $(x_1,y_1)=(x_2,y_2)$。

在 Lean 中，注意使用 `constructor` 策略把积类型中的等式目标

```
⊢ (x1, y1) = (x2, y2)
```

化简为两个更简单的目标，每个坐标一个：

```
⊢ x1 = x2
⊢ y1 = y2
```

与对积类型中等式假设使用 `obtain`（回忆[例 8.4.1](#例-841)）一样，关键是积类型中的等式实际上是一个关于第一坐标和第二坐标都相等的“且”陈述。

```lean
example : Injective (fun ((x, y) : ℝ × ℝ) ↦ (x + y, x - y, y)) := by
  intro (x1, y1) (x2, y2) h
  dsimp at h
  obtain ⟨h, h', hy⟩ := h
  constructor
  · addarith [h, hy]
  · apply hy
```

### 8.4.5. 例

**问题**

考虑函数 $(x,y) \mapsto x+y$ 从 $\mathbb{R}^2$ 到 $\mathbb{R}$。证明这个函数

1. 不是单射；
2. 是满射。

**解法**

1. 我们将证明存在 $\mathbb{R}^2$ 中的点 $(x_1,y_1)$ 和 $(x_2,y_2)$ 使得 $x_1+y_1=x_2+y_2$ 且 $(x_1,y_1) \ne (x_2,y_2)$。事实上，考虑点 $(0,0)$ 和 $(1,-1)$。我们有 $0+0=1+(-1)$ 且 $(0,0) \ne (1,-1)$。

2. 设 $a$ 是实数。我们必须证明存在 $\mathbb{R}^2$ 中的点 $(x,y)$ 使得 $x+y=a$。事实上，$a+0=a$，所以 $(a,0)$ 具有这个性质。

```lean
example : ¬ Injective (fun ((x, y) : ℝ × ℝ) ↦ x + y) := by
  dsimp [Injective]
  push_neg
  use (0, 0), (1, -1)
  dsimp
  constructor
  · numbers
  · numbers

example : Surjective (fun ((x, y) : ℝ × ℝ) ↦ x + y) := by
  intro a
  use (a, 0)
  dsimp
  ring
```

### 8.4.6. 例

**问题**

考虑函数 $(m,n) \mapsto 5m+8n$ 从 $\mathbb{Z}^2$ 到 $\mathbb{Z}$。证明这个函数

1. 不是单射；
2. 是满射。

**解法**

1. 我们将证明存在 $\mathbb{Z}^2$ 中的对 $(m_1,n_1)$ 和 $(m_2,n_2)$ 使得 $5m_1+8n_1=5m_2+8n_2$ 且 $(m_1,n_1) \ne (m_2,n_2)$。事实上，考虑对 $(0,0)$ 和 $(8,-5)$。我们有 $5 \cdot 0 + 8 \cdot 0 = 5 \cdot 8 + 8 \cdot (-5)$ 且 $(0,0) \ne (8,-5)$。

2. 设 $a$ 是整数。我们必须证明存在 $\mathbb{Z}^2$ 中的对 $(m,n)$ 使得 $5m+8n=a$。事实上，$5(-3a)+8(2a)=a$，所以 $(-3a, 2a)$ 具有这个性质。

（证明第二部分时，$-3$ 和 $2$ 的想法从何而来？与[例 3.5.1](03_Parity_and_Divisibility.md#例-351)和[例 3.5.3](03_Parity_and_Divisibility.md#例-353)比较。）

```lean
example : ¬ Injective (fun ((m, n) : ℤ × ℤ) ↦ 5 * m + 8 * n) := by
  dsimp [Injective]
  push_neg
  use (0, 0), (8, -5)
  constructor
  · numbers
  · numbers

example : Surjective (fun ((m, n) : ℤ × ℤ) ↦ 5 * m + 8 * n) := by
  intro a
  use (-3 * a, 2 * a)
  dsimp
  ring
```

### 8.4.7. 例

**问题**

考虑函数 $(m,n) \mapsto 5m+10n$ 从 $\mathbb{Z}^2$ 到 $\mathbb{Z}$。证明这个函数

1. 不是单射；
2. 不是满射。

非单射性的证明留作练习；它与前面两个问题的证明类似。

**解法**

（非满射性）我们将证明存在整数 $x$，使得对所有整数对 $(m,n)$ 都有 $5m+10n \ne x$。事实上，我们证明 1 具有这个性质。设 $(m,n)$ 是整数对并假设 $5m+10n=1$。则

$$
\begin{split} 0 &\equiv 5(m+2n) \pmod 5 \\ &= 5m+10n \\ &= 1, \end{split}
$$

矛盾。

```lean
example : ¬ Injective (fun ((m, n) : ℤ × ℤ) ↦ 5 * m + 10 * n) := by
  sorry

example : ¬ Surjective (fun ((m, n) : ℤ × ℤ) ↦ 5 * m + 10 * n) := by
  dsimp [Surjective]
  push_neg
  use 1
  intro (m, n) h
  dsimp at h
  have :=
  calc 0 ≡ 5 * (m + 2 * n) [ZMOD 5] := by extra
    _ = 5 * m + 10 * n := by ring
    _ = 1 := h
  numbers at this
```

### 8.4.8. 例

**问题**

考虑函数 $g:\mathbb{R}^2\to\mathbb{R}^2$，定义为 $g(x,y)=(y,x)$。证明 $g \circ g = \operatorname{Id}_{\mathbb{R}^2}$。

**解法**

设 $(x,y)$ 是 $\mathbb{R}^2$ 中的点。则

$$
\begin{split} g(g(x,y)) &= g(y,x) \\ &= (x,y). \end{split}
$$

```lean
def g : ℝ × ℝ → ℝ × ℝ
  | (x, y) => (y, x)

example : g ∘ g = id := by
  ext ⟨x, y⟩
  dsimp [g]
```

### 8.4.9. 例

**定理**

存在从 $\mathbb{N}^2$ 到 $\mathbb{N}$ 的双射。

首先回顾[例 6.2.4](06_Induction.md#例-624)中的数列 $A_n$；我们先证明一个关于它的引理。

```lean
def A : ℕ → ℕ
  | 0 => 0
  | n + 1 => A n + n + 1

theorem A_mono {n m : ℕ} (h : n ≤ m) : A n ≤ A m := by
  induction_from_starting_point m, h with k hk IH
  · extra
  · calc A n ≤ A k := IH
      _ ≤ A k + (k + 1) := by extra
      _ = A k + k + 1 := by ring
      _ = A (k + 1) := by rw [A]
```

还有一个更困难的推论。

```lean
theorem of_A_add_mono {a1 a2 b1 b2 : ℕ} (h : A (a1 + b1) + b1 ≤ A (a2 + b2) + b2) :
    a1 + b1 ≤ a2 + b2 := by
  obtain h' | h' : _ ∨ a2 + b2 + 1 ≤ a1 + b1 := le_or_lt (a1 + b1) (a2 + b2)
  · apply h'
  rw [← not_lt] at h
  have :=
  calc A (a2 + b2) + b2
     < A (a2 + b2) + b2 + (a2 + 1) := by extra
    _ = A (a2 + b2) + (a2 + b2) + 1 := by ring
    _ = A ((a2 + b2) + 1) := by rw [A]
    _ = A (a2 + b2 + 1) := by ring
    _ ≤ A (a1 + b1) := A_mono h'
    _ ≤ A (a1 + b1) + b1 := by extra
  contradiction
```

我们用数列 $A_n$ 定义函数 $p:\mathbb{N}^2\to\mathbb{N}$，它将是我们所求的双射：$p(a,b)=A_{a+b}+b$。

```lean
def p : ℕ × ℕ → ℕ
  | (a, b) => A (a + b) + b
```

最后我们证明这个函数 $p$ 确实是双射。我们为 $p$ 设置一个“交织”映射 $i$，并调用[8.1 节](#81-单射与满射)练习中证明的引理 `surjective_of_intertwining`。

```lean
def i : ℕ × ℕ → ℕ × ℕ
  | (0, b) => (b + 1, 0)
  | (a + 1, b) => (a, b + 1)

theorem p_comp_i (x : ℕ × ℕ) : p (i x) = p x + 1 := by
  match x with
  | (0, b) =>
    calc p (i (0, b)) = p (b + 1, 0) := by rw [i]
      _ = A ((b + 1) + 0) + 0 := by dsimp [p]
      _ = A (b + 1) := by ring
      _ = A b + b + 1 := by rw [A]
      _ = (A (0 + b) + b) + 1 := by ring
      _ = p (0, b) + 1 := by dsimp [p]
  | (a + 1, b) =>
    calc p (i (a + 1, b)) = p (a, b + 1) := by rw [i] ; rfl -- FIXME
      _ = A (a + (b + 1)) + (b + 1) := by dsimp [p]
      _ = (A ((a + 1) + b) + b) + 1 := by ring
      _ = p (a + 1, b) + 1 := by rw [p]

example : Bijective p := by
  constructor
  · intro (a1, b1) (a2, b2) hab
    dsimp [p] at hab
    have H : a1 + b1 = a2 + b2
    · apply le_antisym
      · apply of_A_add_mono
        rw [hab]
      · apply of_A_add_mono
        rw [hab]
    have hb : b1 = b2
    · zify at hab ⊢
      calc (b1:ℤ) = A (a2 + b2) + b2 - A (a1 + b1) := by addarith [hab]
        _ = A (a2 + b2) + b2 - A (a2 + b2) := by rw [H]
        _ = b2 := by ring
    constructor
    · zify at hb H ⊢
      addarith [H, hb]
    · apply hb
  · apply surjective_of_intertwining (x0 := (0, 0)) (i := i)
    · calc p (0, 0) = A (0 + 0) + 0 := by dsimp [p]
        _ = A 0 := by ring
        _ = 0 := by rw [A]
    · intro x
      apply p_comp_i
```

### 8.4.10. 练习

1. 考虑函数 $(r,s) \mapsto (s, r-s)$ 从 $\mathbb{Q}^2$ 到 $\mathbb{Q}^2$。证明这个函数是双射。

   ```lean
   example : Bijective (fun ((r, s) : ℚ × ℚ) ↦ (s, r - s)) := by
     rw [bijective_iff_exists_inverse]
     sorry
   ```

2. 考虑函数 $(x,y) \mapsto x-2y-1$ 从 $\mathbb{Z}^2$ 到 $\mathbb{Z}$。证明这个函数

   1. 不是单射；
   2. 是满射。

   ```lean
   example : ¬ Injective (fun ((x, y) : ℤ × ℤ) ↦ x - 2 * y - 1) := by
     sorry

   example : Surjective (fun ((x, y) : ℤ × ℤ) ↦ x - 2 * y - 1) := by
     sorry
   ```

3. 考虑函数 $(x,y) \mapsto x^2+y^2$ 从 $\mathbb{Q}^2$ 到 $\mathbb{Q}$。证明这个函数不是满射。

   ```lean
   example : ¬ Surjective (fun ((x, y) : ℚ × ℚ) ↦ x ^ 2 + y ^ 2) := by
     sorry
   ```

4. 考虑函数 $(x,y) \mapsto x^2-y^2$ 从 $\mathbb{Q}^2$ 到 $\mathbb{Q}$。证明这个函数是满射。

   ```lean
   example : Surjective (fun ((x, y) : ℚ × ℚ) ↦ x ^ 2 - y ^ 2) := by
     sorry
   ```

5. 考虑函数 $(a,b) \mapsto a^b$ 从 $\mathbb{Q} \times \mathbb{N}$ 到 $\mathbb{Q}$。证明这个函数是满射。

   ```lean
   example : Surjective (fun ((a, b) : ℚ × ℕ) ↦ a ^ b) := by
     sorry
   ```

6. 考虑函数 $(x,y,z) \mapsto (x+y+z, x+2y+3z)$ 从 $\mathbb{R}^3$ 到 $\mathbb{R}^2$。证明这个函数不是单射。

   ```lean
   example : ¬ Injective
       (fun ((x, y, z) : ℝ × ℝ × ℝ) ↦ (x + y + z, x + 2 * y + 3 * z)) := by
     sorry
   ```

7. 考虑函数 $(x,y) \mapsto (x+y, x+2y, x+3y)$ 从 $\mathbb{R}^2$ 到 $\mathbb{R}^3$。证明这个函数是单射。

   ```lean
   example : Injective (fun ((x, y) : ℝ × ℝ) ↦ (x + y, x + 2 * y, x + 3 * y)) := by
     sorry
   ```

8. 考虑函数 $h:\mathbb{R}^3\to\mathbb{R}^3$，定义为 $h(x,y,z)=(y,z,x)$。证明 $h \circ h \circ h = \operatorname{Id}_{\mathbb{R}^3}$。

   ```lean
   def h : ℝ × ℝ × ℝ → ℝ × ℝ × ℝ
     | (x, y, z) => (y, z, x)

   example : h ∘ h ∘ h = id := by
     sorry
   ```
