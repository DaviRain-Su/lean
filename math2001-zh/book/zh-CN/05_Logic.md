# 第 5 章 逻辑

> 本译文对应原书 [Logic](https://hrmacbeth.github.io/math2001/05_Logic.html)；英文 Sphinx 源：`05_Logic.rst`。

在[第 2 章](02_Proofs_with_Structure.md)和[第 4 章](04_Proofs_with_Structure_II.md)中，我们学习了各种逻辑符号——如 $\land$、$\forall$ 和 $\to$——的“语法”。在那些章节里，逻辑推理发生在相当具体的数学情境中：关于自然数、有理数等中的等式与不等式的问题。

本章采取更抽象的观点，专门研究逻辑推理过程本身。核心概念是**逻辑等价**：对陈述的逻辑结构做变换，这些变换总是有效的，因为变换的“之前”与“之后”可以仅凭抽象的逻辑推理彼此推出，而不依赖手头的具体数学情境。

最重要的逻辑等价是本章最后一节[5.3 节](#53-否定的范式)所涵盖的那些。它们把否定符号（$\lnot$）在逻辑陈述中推向更深层的位置。把这些变换合在一起，就给了我们一种推迟并尽量减少与 $\lnot$——最棘手的逻辑符号——打交道的方式。

## 5.1. 逻辑等价

### 5.1.1. 例

若你把数字、定义、等式与不等式都抽象掉，剩下的就是纯粹的逻辑问题。而像 `obtain`、`apply`、`constructor` 等纯逻辑策略仍然可以使用。

```lean
example {P Q : Prop} (h1 : P ∨ Q) (h2 : ¬ Q) : P := by
  obtain hP | hQ := h1
  · apply hP
  · contradiction
```

用语言文字来写这类证明几乎不值得。这里的 $P$ 和 $Q$ 是抽象命题（`Prop`），这只是一场符号操纵。

```lean
example (P Q : Prop) : P → (P ∨ ¬ Q) := by
  intro hP
  left
  apply hP
```

### 5.1.2. 例

我们可以这样理解命题逻辑陈述：想象每个变量（如 $P$）要么为“真”，要么为“假”。真与假在逻辑运算下按固定规则组合。例如，$P \land Q$ 在 $P$ 与 $Q$ 都为真时为真，否则为假。我们可以把这一信息记录在称为**真值表**的表格中：

| P | Q | (P ∧ Q) |
|---|---|---------|
| 真 | 真 | 真 |
| 假 | 真 | 假 |
| 真 | 假 | 假 |
| 假 | 假 | 假 |

同样，$\lnot P$ 的规则是：它与 $P$ 相反。

| P | ¬P |
|---|-----|
| 真 | 假 |
| 假 | 真 |

利用基本运算的规则，我们可以根据一个较复杂陈述由哪些运算构成，逐步求出它的真值表。例如，求 $\lnot(P \land \lnot Q)$ 的真值表：先算 $\lnot Q$ 的表，再算 $P \land \lnot Q$，最后算 $\lnot(P \land \lnot Q)$。

| P | Q | ¬Q | (P ∧ ¬Q) | ¬(P ∧ ¬Q) |
|---|---|-----|----------|-----------|
| 真 | 真 | 假 | 假 | 真 |
| 假 | 真 | 假 | 假 | 真 |
| 真 | 假 | 真 | 真 | 假 |
| 假 | 假 | 真 | 假 | 真 |

你应当练习手算；Lean 命令 `#truth_table` 也会自动完成。

```lean
#truth_table ¬(P ∧ ¬ Q)
```

这些图就是这样生成的！`#truth_table` 命令由 Joseph Rotella 编写，Ryan Edmonds 亦有贡献；两人都是布朗大学的学生。

### 5.1.3. 练习

其余基本逻辑运算的规则如下：

| P | Q | (P ∨ Q) |
|---|---|---------|
| 真 | 真 | 真 |
| 假 | 真 | 真 |
| 真 | 假 | 真 |
| 假 | 假 | 假 |

| P | Q | (P → Q) |
|---|---|---------|
| 真 | 真 | 真 |
| 假 | 真 | 真 |
| 真 | 假 | 假 |
| 假 | 假 | 真 |

| P | Q | (P ↔ Q) |
|---|---|---------|
| 真 | 真 | 真 |
| 假 | 真 | 假 |
| 真 | 假 | 假 |
| 假 | 假 | 真 |

**问题**

求 $P \leftrightarrow (\lnot P \lor Q)$ 的真值表。

然后在 Lean 中核对。

```lean
#truth_table P ↔ (¬ P ∨ Q)
```

### 5.1.4. 例

两个命题逻辑公式称为**逻辑等价**，若它们之间的“当且仅当”可以在 Lean 中证明。例如，

**问题**

证明 $P \lor P$ 与 $P$ 逻辑等价。

```lean
example (P : Prop) : (P ∨ P) ↔ P := by
  constructor
  · intro h
    obtain h1 | h2 := h
    · apply h1
    · apply h2
  · intro h
    left
    apply h
```

这里有一个重要提醒：还有一种逻辑策略尚未介绍（见[5.2 节](#52-排中律)）。因此，有些命题逻辑公式对在逻辑上等价，但我们尚无法用 Lean 演示。

### 5.1.5. 例

**问题**

证明 $P \land (Q \lor R)$ 与 $(P \land Q) \lor (P \land R)$ 逻辑等价。

这一条较长。第一个方向我已写好，第二个方向留给你。

```lean
example (P Q R : Prop) : (P ∧ (Q ∨ R)) ↔ ((P ∧ Q) ∨ (P ∧ R)) := by
  constructor
  · intro h
    obtain ⟨h1, h2 | h2⟩ := h
    · left
      constructor
      · apply h1
      · apply h2
    · right
      constructor
      · apply h1
      · apply h2
  · sorry
```

本书不证明这一点，但命题逻辑中两个陈述逻辑等价，当且仅当它们有相同的真值表。例如，比较下面两条 Lean 命令的输出：

```lean
#truth_table P ∧ (Q ∨ R)
#truth_table (P ∧ Q) ∨ (P ∧ R)
```

### 5.1.6. 例

涉及量词时，我们也可以玩这种抽象逻辑游戏。

```lean
example {P Q : α → Prop} (h1 : ∀ x : α, P x) (h2 : ∀ x : α, Q x) :
    ∀ x : α, P x ∧ Q x := by
  intro x
  constructor
  · apply h1
  · apply h2
```

这里的 $P$ 和 $Q$ 是**谓词**，即含变量（此处记为 $x$）的陈述的抽象。关于量化谓词的陈述有时称为**一阶逻辑**。

下面是另一个涉及量词的抽象逻辑推理例子。

```lean
example {P : α → β → Prop} (h : ∃ x : α, ∀ y : β, P x y) :
    ∀ y : β, ∃ x : α, P x y := by
  obtain ⟨x, hx⟩ := h
  intro y
  use x
  apply hx
```

逻辑等价的概念在这一设定下仍然有意义。

**问题**

证明 $\lnot\exists x, P(x)$ 与 $\forall x, \lnot P(x)$ 逻辑等价。

```lean
example (P : α → Prop) : ¬ (∃ x, P x) ↔ ∀ x, ¬ P x := by
  constructor
  · intro h a ha
    have : ∃ x, P x
    · use a
      apply ha
    contradiction
  · intro h h'
    obtain ⟨x, hx⟩ := h'
    have : ¬ P x := h x
    contradiction
```

### 5.1.7. 练习

1. 证明下列命题逻辑陈述：

```lean
example {P Q : Prop} (h : P ∧ Q) : P ∨ Q := by
  sorry
```

2. 证明下列命题逻辑陈述：

```lean
example {P Q R : Prop} (h1 : P → Q) (h2 : P → R) (h3 : P) : Q ∧ R := by
  sorry
```

3. 证明下列命题逻辑陈述：

```lean
example (P : Prop) : ¬(P ∧ ¬ P) := by
  sorry
```

4. 证明下列命题逻辑陈述：

```lean
example {P Q : Prop} (h1 : P ↔ ¬ Q) (h2 : Q) : ¬ P := by
  sorry
```

5. 证明下列命题逻辑陈述：

```lean
example {P Q : Prop} (h1 : P ∨ Q) (h2 : Q → P) : P := by
  sorry
```

6. 证明下列命题逻辑陈述：

```lean
example {P Q R : Prop} (h : P ↔ Q) : (P ∧ R) ↔ (Q ∧ R) := by
  sorry
```

7. 证明 $P \land P$ 与 $P$ 逻辑等价。

```lean
example (P : Prop) : (P ∧ P) ↔ P := by
  sorry
```

8. 证明 $P \lor Q$ 与 $Q \lor P$ 逻辑等价。

```lean
example (P Q : Prop) : (P ∨ Q) ↔ (Q ∨ P) := by
  sorry
```

9. 证明 $\lnot(P \lor Q)$ 与 $\lnot P \land \lnot Q$ 逻辑等价。

该定理在库中名为 `not_or`。它是[“德摩根律”](https://en.wikipedia.org/wiki/De_Morgan%27s_laws)之一。

```lean
example (P Q : Prop) : ¬(P ∨ Q) ↔ (¬P ∧ ¬Q) := by
  sorry
```

10. 证明下列一阶逻辑陈述：

```lean
example {P Q : α → Prop} (h1 : ∀ x, P x → Q x) (h2 : ∀ x, P x) : ∀ x, Q x := by
  sorry
```

11. 证明下列一阶逻辑陈述：

```lean
example {P Q : α → Prop} (h : ∀ x, P x ↔ Q x) : (∃ x, P x) ↔ (∃ x, Q x) := by
  sorry
```

12. 证明 $\exists x \ y, P(x, y)$ 与 $\exists y \ x, P(x, y)$ 逻辑等价。

```lean
example (P : α → β → Prop) : (∃ x y, P x y) ↔ ∃ y x, P x y := by
  sorry
```

13. 证明 $\forall x \ y, P(x, y)$ 与 $\forall y \ x, P(x, y)$ 逻辑等价。

```lean
example (P : α → β → Prop) : (∀ x y, P x y) ↔ ∀ y x, P x y := by
  sorry
```

14. 证明 $(\exists x, P(x)) \land Q$ 与 $\exists x, (P(x) \land Q)$ 逻辑等价。

```lean
example (P : α → Prop) (Q : Prop) : ((∃ x, P x) ∧ Q) ↔ ∃ x, (P x ∧ Q) := by
  sorry
```

## 5.2. 排中律

给某一类数起一个略显滑稽名字的传统[可追溯到](https://en.wikipedia.org/wiki/Perfect_number)[古希腊](https://en.wikipedia.org/wiki/Amicable_numbers)，以便研究时定理陈述更简短。本着这种精神，本节仅此一次引入——**超幂数**！

**定义**

自然数 $k$ 称为**超幂的**（superpowered），若对每个自然数 $n$，数 $k^{k^n} + 1$ 都是素数。

```lean
def Superpowered (k : ℕ) : Prop := ∀ n : ℕ, Prime (k ^ k ^ n + 1)
```

### 5.2.1. 例

0 是超幂的吗？$0^{0^0}+1=1$，$0^{0^1}+1=2$，$0^{0^2}+1=2$，$0^{0^3}+1=2$。我们也可以在 Lean 中计算：

```lean
#eval 0 ^ 0 ^ 0 + 1 -- 1
#eval 0 ^ 0 ^ 1 + 1 -- 2
#eval 0 ^ 0 ^ 2 + 1 -- 2
```

第一个不是素数，其余是，但合在一起，定义中的“对所有”不成立。形式地：

**引理**

0 不是超幂的。

**证明**

假设 0 是超幂的。则特别地 $0^{0^0}+1=1$ 应是素数，矛盾，因为 1 不是素数。

在 Lean 中，我们使用引理 `not_prime_one`，它来自[第 4 章](04_Proofs_with_Structure_II.md) [4.5 节](04_Proofs_with_Structure_II.md#45-反证法)的练习。

```lean
theorem not_superpowered_zero : ¬ Superpowered 0 := by
  intro h
  have one_prime : Prime (0 ^ 0 ^ 0 + 1) := h 0
  conv at one_prime => numbers -- simplifies that statement to `Prime 1`
  have : ¬ Prime 1 := not_prime_one
  contradiction
```

不必太在意上面证明里陌生的策略 `conv`——本节之外我们不会再用它。只要比较使用该策略前后的目标状态，并确认你直观上同意所发生的化简即可。

### 5.2.2. 例

1 是超幂的吗？

```lean
#eval 1 ^ 1 ^ 0 + 1 -- 2
#eval 1 ^ 1 ^ 1 + 1 -- 2
#eval 1 ^ 1 ^ 2 + 1 -- 2
```

**引理**

1 是超幂的。

**证明**

设 $n$ 为自然数。则 $1^{1^n}+1=1^1+1=2$，而 2 是素数。

在 Lean 中，我们使用引理 `prime_two`，它来自[例 4.1.8](04_Proofs_with_Structure_II.md#例-418)。

```lean
theorem superpowered_one : Superpowered 1 := by
  intro n
  conv => ring -- simplifies goal from `Prime (1 ^ 1 ^ n + 1)` to `Prime 2`
  apply prime_two
```

### 5.2.3. 例

2 是超幂的吗？

```lean
#eval 2 ^ 2 ^ 0 + 1 -- 3
#eval 2 ^ 2 ^ 1 + 1 -- 5
#eval 2 ^ 2 ^ 2 + 1 -- 17
#eval 2 ^ 2 ^ 3 + 1 -- 257
#eval 2 ^ 2 ^ 4 + 1 -- 65537
```

这些数碰巧都是素数。但用我们常用的引理 `better_prime_test` 在 Lean 里验证 257 是素数，大概要写足足 30 行计算；至于 65537，我实在没有那份耐心。下一个会更糟。2 的问题暂且搁置。

### 5.2.4. 例

3 是超幂的吗？

```lean
#eval 3 ^ 3 ^ 0 + 1 -- 4
#eval 3 ^ 3 ^ 1 + 1 -- 28
#eval 3 ^ 3 ^ 2 + 1 -- 19684
```

不是！第一步就失败了。

**引理**

3 不是超幂的。

**证明**

假设 3 是超幂的。则特别地 $3^{3^0}+1=4$ 应是素数，矛盾，因为 $4=2\cdot 2$。

记住在 Lean 中用引理 `not_prime`，通过给出一个因子来证明某数不是素数。

```lean
theorem not_superpowered_three : ¬ Superpowered 3 := by
  intro h
  dsimp [Superpowered] at h
  have four_prime : Prime (3 ^ 3 ^ 0 + 1) := h 0
  conv at four_prime => numbers -- simplifies that statement to `Prime 4`
  have four_not_prime : ¬ Prime 4
  · apply not_prime 2 2
    · numbers -- show `2 ≠ 1`
    · numbers -- show `2 ≠ 4`
    · numbers -- show `4 = 2 * 2`
  contradiction
```

### 5.2.5. 例

以上都是热身。下面才是我真正想研究的问题。

**问题**

证明存在自然数 $k$，使得 $k$ 是超幂的而 $k+1$ 不是。

**解法**

我们分两种情形，取决于 2 是否超幂。

若 2 是超幂的，则 $k=2$ 具有所需性质，因为 2 超幂而 3 不超幂。

若否，则 $k=1$ 具有所需性质，因为 1 超幂而 2 不超幂。[^1]

这一证明的要点在于：即使我们不知道 2 是否超幂，它仍然成立。无论哪种情况，我们都有办法解决问题。

任何陈述（例如“2 是超幂的”）必真或必假，这是数学的一条公理，称为**排中律**（law of the excluded middle）。因此，在证明中这样分情形总是合法的，尽管实际需要这样做的情况相对少见。

在 Lean 中，可用策略 `by_cases` 按某陈述的真假分情形。在下面的证明里，使用该策略会把目标状态从

```
⊢ ∃ k, Superpowered k ∧ ¬ Superpowered (k + 1)
```

变为有两个子目标的状态：一个在假设 `Superpowered 2` 下，一个在假设 `¬ Superpowered 2` 下。

```
h2 : Superpowered 2
⊢ ∃ k, Superpowered k ∧ ¬ Superpowered (k + 1)

h2 : ¬ Superpowered 2
⊢ ∃ k, Superpowered k ∧ ¬ Superpowered (k + 1)
```

下面是 Lean 中的完整证明。

```lean
example : ∃ k : ℕ, Superpowered k ∧ ¬ Superpowered (k + 1) := by
  by_cases h2 : Superpowered 2
  · use 2
    constructor
    · apply h2
    · apply not_superpowered_three
  · use 1
    constructor
    · apply superpowered_one
    · apply h2
```

### 5.2.6. 例

如上所述，在证明中需要排中律的情况相对少见。下面再举一个需要的例子，这次来自命题逻辑：“负负得正”。

```lean
example {P : Prop} (hP : ¬¬P) : P := by
  by_cases hP : P
  · apply hP
  · contradiction
```

### 5.2.7. 练习

1. 称实数 $x$ 为**部落平衡的**（tribalanced），若对每个自然数 $n$，不等式 $\left(1+\frac{x}{n}\right)^n<3$ 成立。证明存在实数 $x$，使得 $x$ 部落平衡而 $x+1$ 不是。

```lean
def Tribalanced (x : ℝ) : Prop := ∀ n : ℕ, (1 + x / n) ^ n < 3

example : ∃ x : ℝ, Tribalanced x ∧ ¬ Tribalanced (x + 1) := by
  sorry
```

2. 证明 $\lnot P \to \lnot Q$ 与 $Q \to P$ 逻辑等价。你需要使用排中律。

这一逻辑等价称为**逆否命题原理**（principle of contraposition）。不妨比较它们的真值表作核对。

```lean
example (P Q : Prop) : (¬P → ¬Q) ↔ (Q → P) := by
  sorry
```

3. 若你仍在好奇：2 **不是**超幂的。这一问题由数学家 Pierre de Fermat 于 1650 年提出；他像我们一样观察到 3、5、17、257 和 65537 都是素数。1732 年 Leonhard Euler 证明序列中的下一个数 $2^{2^5}+1=4294967297$ 等于 $641 \times 6700417$，因此不是素数。

利用 Euler 的发现，对[例 5.2.5](#例-525)中的问题给出一个无需情形划分的证明。

```lean
example : ∃ k : ℕ, Superpowered k ∧ ¬ Superpowered (k + 1) := by
  sorry
```

[^1]: 行家会注意到，这个证明改编自一个更著名的问题：证明存在无理数的无理数次幂是有理数。

## 5.3. 否定的范式

### 5.3.1. 例

有一族重要的逻辑等价，允许我们把否定在逻辑陈述中向“内”推。例如，我们在[例 5.1.6](#例-516)中证明了否定 $\exists$ 的规则（$\lnot\exists x, P(x)$ 与 $\forall x, \lnot P(x)$ 等价），在[5.1 节](#51-逻辑等价)的练习中又证明了否定 $\lor$ 的规则（$\lnot(P \lor Q)$ 与 $\lnot P \land \lnot Q$ 等价）。

我们再做一个同类型的规则：否定 $\land$。这一条需要排中律。第一个方向我已写好，第二个方向留给你。

**问题**

证明 $\lnot(P \land Q)$ 与 $\lnot P \lor \lnot Q$ 逻辑等价。

```lean
example (P Q : Prop) : ¬ (P ∧ Q) ↔ (¬ P ∨ ¬ Q) := by
  constructor
  · intro h
    by_cases hP : P
    · right
      intro hQ
      have hPQ : P ∧ Q
      · constructor
        · apply hP
        · apply hQ
      contradiction
    · left
      apply hP
  · sorry
```

下面是完整的规则集合，连同它们在 Lean 中的引理名。其余证明留作本节练习。

**表 5.1** 否定的逻辑等价

| 运算 | 否定在外 | 否定在内 | Lean 名称 | 证明 |
|------|----------|----------|-----------|------|
| $\lnot$ | $\lnot(\lnot P)$ | $P$ | `not_not` | [练习 5.3.6](#536-练习) |
| $\lor$ | $\lnot(P \lor Q)$ | $\lnot P \land \lnot Q$ | `not_or` | [练习 5.1.7](#517-练习) |
| $\land$ | $\lnot(P \land Q)$ | $\lnot P \lor \lnot Q$ | `not_and_or` | [例 5.3.1](#例-531) |
| $\to$ | $\lnot(P \to Q)$ | $P \land \lnot Q$ | `not_imp` | [练习 5.3.6](#536-练习) |
| $\exists$ | $\lnot(\exists x, P(x))$ | $\forall x, \lnot P(x)$ | `not_exists` | [例 5.1.6](#例-516) |
| $\forall$ | $\lnot(\forall x, P(x))$ | $\exists x, \lnot P(x)$ | `not_forall` | [练习 5.3.6](#536-练习) |

### 5.3.2. 例

依次应用这些规则，任何数学陈述都可以化为“否定在内”的形式。这通常是证明中最方便的形式（可比较[第 4 章](04_Proofs_with_Structure_II.md) [4.4 节](04_Proofs_with_Structure_II.md#44-矛盾的假设)与[4.5 节](04_Proofs_with_Structure_II.md#45-反证法)中反证法的别扭，与更早各节中的证明）。

下面是一个化简过程的例子。

**问题**

证明 $\lnot(\forall m :\mathbb{Z}, m\ne 2 \to \exists n:\mathbb{Z},n^2 = m)$ 与 $\exists m :\mathbb{Z},  m\ne 2\land \forall n :\mathbb{Z},n^2 \ne m$ 逻辑等价。

我们可以在 Lean 中用 `calc` 配合 `rel` 策略证明，每一步按[表 5.1](#例-531)中的一条规则重写。

```lean
example :
    ¬(∀ m : ℤ, m ≠ 2 → ∃ n : ℤ, n ^ 2 = m) ↔ ∃ m : ℤ, m ≠ 2 ∧ ∀ n : ℤ, n ^ 2 ≠ m :=
  calc ¬(∀ m : ℤ, m ≠ 2 → ∃ n : ℤ, n ^ 2 = m)
      ↔ ∃ m : ℤ, ¬(m ≠ 2 → ∃ n : ℤ, n ^ 2 = m) := by rel [not_forall]
    _ ↔ ∃ m : ℤ, m ≠ 2 ∧ ¬(∃ n : ℤ, n ^ 2 = m) := by rel [not_imp]
    _ ↔ ∃ m : ℤ, m ≠ 2 ∧ ∀ n : ℤ, n ^ 2 ≠ m := by rel [not_exists]
```

### 5.3.3. 例

自己动手试试！

**问题**

证明 $\lnot(\forall n :\mathbb{Z}, \exists m : \mathbb{Z}, n^2 < m < (n+1)^2)$ 与 $\exists n :\mathbb{Z}, \forall m : \mathbb{Z}, n^2 \geq m \lor m \geq (n+1)^2$ 逻辑等价。

本题除[表 5.1](#例-531)中的规则外，还需要引理 `not_lt`，把 $<$ 的否定化为 $\geq$。

还要注意 $n^2 < m < (n+1)^2$ 是 $n^2 < m \land m < (n+1)^2$ 的简写。我们以前在[例 1.4.4](01_Proofs_by_Calculation.md#144-例题)中遇到过这一点。

```lean
example : ¬(∀ n : ℤ, ∃ m : ℤ, n ^ 2 < m ∧ m < (n + 1) ^ 2)
    ↔ ∃ n : ℤ, ∀ m : ℤ, n ^ 2 ≥ m ∨ m ≥ (n + 1) ^ 2 :=
  sorry
```

### 5.3.4. 例

这一过程显然非常机械。你应当学会在脑中完成。照例，当证明过程机械时，Lean 就有策略代劳：`push_neg`。下面是对最近两个例子的演示及输出：

```lean
#push_neg ¬(∀ m : ℤ, m ≠ 2 → ∃ n : ℤ, n ^ 2 = m)
  -- ∃ m : ℤ, m ≠ 2 ∧ ∀ (n : ℤ), n ^ 2 ≠ m

#push_neg ¬(∀ n : ℤ, ∃ m : ℤ, n ^ 2 < m ∧ m < (n + 1) ^ 2)
  -- ∃ n : ℤ, ∀ m : ℤ, m ≤ n ^ 2 ∨ (n + 1) ^ 2 ≤ m
```

在脑中化简下列否定，再用 Lean 输出核对。

```lean
#push_neg ¬(∃ m n : ℤ, ∀ t : ℝ, m < t ∧ t < n)
#push_neg ¬(∀ a : ℕ, ∃ x y : ℕ, x * y ∣ a → x ∣ a ∧ y ∣ a)
#push_neg ¬(∀ m : ℤ, m ≠ 2 → ∃ n : ℤ, n ^ 2 = m)
```

本节末尾还有更多同风格的练习。

### 5.3.5. 例

下面说明把否定向内推在常规证明中如何有用。我们回到[例 4.5.4](04_Proofs_with_Structure_II.md#例-454)中的问题。

**问题**

证明不存在自然数 $n$ 使得 $n^2=2$。

当时我们注意到，这个问题的解法似乎与[例 2.3.2](02_Proofs_with_Structure.md#232-例题)非常相似。

**问题**

设 $n$ 为任意自然数。证明 $n ^ 2 \ne 2$。

现在我们可以理解原因：两个问题的陈述逻辑等价！两个解法中的数学思想相同，但[例 2.3.2](02_Proofs_with_Structure.md#232-例题)的解法在概念上更简单，因为它不涉及反证法。我们可以把[例 4.5.4](04_Proofs_with_Structure_II.md#例-454)改写成[例 2.3.2](02_Proofs_with_Structure.md#232-例题)的形式，再写出后者的解法，从而给出更易理解的解答。

**解法**

只需证明：对任意自然数 $n$，有 $n ^ 2 \ne 2$。

我们分别考虑 $n \le 1$ 与 $2 \le n$ 两种情形。

**情形 1**（$n \le 1$）：只需证 $n ^ 2 < 2$。事实上，

$$
\begin{split}n ^ 2 &\le 1 ^ 2\\
&<2.\end{split}
$$

**情形 2**（$2 \le n$）：只需证 $n ^ 2 > 2$。事实上，

$$
\begin{split}2 &< 2 ^ 2\\
& \le n ^ 2.\end{split}
$$

下面是 Lean 中的写法。我留了一小段给你。

```lean
example : ¬ (∃ n : ℕ, n ^ 2 = 2) := by
  push_neg
  intro n
  have hn := le_or_succ_le n 1
  obtain hn | hn := hn
  · apply ne_of_lt
    calc
      n ^ 2 ≤ 1 ^ 2 := by rel [hn]
      _ < 2 := by numbers
  · sorry
```

### 5.3.6. 练习

1. 证明 $\lnot(\lnot P)$ 与 $P$ 逻辑等价。

本练习的目的是证明[表 5.1](#例-531)中的引理 `not_not`。因此不要使用该引理，也不要使用依赖它的策略 `push_neg`；请从头证明。你需要排中律。

```lean
example (P : Prop) : ¬ (¬ P) ↔ P := by
  sorry
```

2. 证明 $\lnot(P \to Q)$ 与 $P \land \lnot Q$ 逻辑等价。

本练习的目的是证明[表 5.1](#例-531)中的引理 `not_imp`。因此不要使用该引理或 `push_neg`；请从头证明。你需要排中律。

```lean
example (P Q : Prop) : ¬ (P → Q) ↔ (P ∧ ¬ Q) := by
  sorry
```

3. 证明 $\lnot\forall x, P(x)$ 与 $\exists x, \lnot P(x)$ 逻辑等价。

本练习的目的是证明[表 5.1](#例-531)中的引理 `not_forall`。因此不要使用该引理或 `push_neg`；请从头证明。你需要排中律。

```lean
example (P : α → Prop) : ¬ (∀ x, P x) ↔ ∃ x, ¬ P x := by
  sorry
```

4. 用[表 5.1](#例-531)中的规则逐步证明 $\lnot(\forall a b :\mathbb{Z}, ab=1 \to a = 1 \lor b = 1)$ 与 $\exists a b :\mathbb{Z},  ab = 1\land a \ne 1 \land b \ne 1$ 逻辑等价。

```lean
example : (¬ ∀ a b : ℤ, a * b = 1 → a = 1 ∨ b = 1)
    ↔ ∃ a b : ℤ, a * b = 1 ∧ a ≠ 1 ∧ b ≠ 1 :=
  sorry
```

5. 用[表 5.1](#例-531)中的规则逐步证明 $\lnot(\exists x:\mathbb{R},\forall y:\mathbb{R}, y \le x)$ 与 $\forall x:\mathbb{R},\exists y:\mathbb{R}, y > x$ 逻辑等价。

```lean
example : (¬ ∃ x : ℝ, ∀ y : ℝ, y ≤ x) ↔ (∀ x : ℝ, ∃ y : ℝ, y > x) :=
  sorry
```

6. 用[表 5.1](#例-531)中的规则逐步证明 $\lnot(\exists m:\mathbb{Z},\forall n:\mathbb{Z},m=n+5)$ 与 $\forall m:\mathbb{Z},\exists n:\mathbb{Z},m\ne n+5$ 逻辑等价。

```lean
example : ¬ (∃ m : ℤ, ∀ n : ℤ, m = n + 5) ↔ ∀ m : ℤ, ∃ n : ℤ, m ≠ n + 5 :=
  sorry
```

7. 在脑中化简下列否定，再用 Lean 输出核对。

```lean
#push_neg ¬(∀ n : ℕ, n > 0 → ∃ k l : ℕ, k < n ∧ l < n ∧ k ≠ l)
#push_neg ¬(∀ m : ℤ, m ≠ 2 → ∃ n : ℤ, n ^ 2 = m)
#push_neg ¬(∃ x : ℝ, ∀ y : ℝ, ∃ m : ℤ, x < y * m ∧ y * m < m)
#push_neg ¬(∃ x : ℝ, ∀ q : ℝ, q > x → ∃ m : ℕ, q ^ m > x)
```

8. 证明并非对所有实数 $x$ 都有 $x^2\geq x$。

（我们已在[例 4.5.1](04_Proofs_with_Structure_II.md#例-451)中解决过，但这次请从 `push_neg` 开始证明。）

```lean
example : ¬ (∀ x : ℝ, x ^ 2 ≥ x) := by
  push_neg
  sorry
```

9. 证明不存在实数 $t$，使得 $t \le 4$ 且 $t\geq 5$。

（我们已在[第 4 章](04_Proofs_with_Structure_II.md) [4.5 节](04_Proofs_with_Structure_II.md#45-反证法)的练习中解决过，但这次请从 `push_neg` 开始。）

```lean
example : ¬ (∃ t : ℝ, t ≤ 4 ∧ t ≥ 5) := by
  push_neg
  sorry
```

10. 证明 7 不是偶数。

（我们已在[第 4 章](04_Proofs_with_Structure_II.md) [4.5 节](04_Proofs_with_Structure_II.md#45-反证法)的练习中解决过，但这次请从 `push_neg` 开始。）

```lean
example : ¬ Int.Even 7 := by
  dsimp [Int.Even]
  push_neg
  sorry
```

11. 设 $p$ 和 $k$ 为自然数，$k\ne 1$，$k\ne p$，且 $k\mid p$。证明 $p$ 不是素数。

（我们已在[例 4.5.7](04_Proofs_with_Structure_II.md#例-457)中解决过，但这次请从 `push_neg` 开始。）

```lean
example {p : ℕ} (k : ℕ) (hk1 : k ≠ 1) (hkp : k ≠ p) (hk : k ∣ p) : ¬ Prime p := by
  dsimp [Prime]
  push_neg
  sorry
```

12. 证明下列陈述不真：存在整数 $a$，使得对所有整数 $n$，$2a^3 \geq na+7$。

建议结构：从否定范式化开始证明。

不妨与[第 2 章](02_Proofs_with_Structure.md) [2.5 节](02_Proofs_with_Structure.md#25-存在exists证明)练习 8 比较：为何该陈述为假，而那一题为真？

```lean
example : ¬ ∃ a : ℤ, ∀ n : ℤ, 2 * a ^ 3 ≥ n * a + 7 := by
  sorry
```

13. 设 $p \geq 2$ 为不是素数的自然数。证明存在自然数 $2 \le m < p$，它是 $p$ 的因子。

我们在库中把这一引理记为 `exists_factor_of_not_prime` 以备后用。

建议结构：先设立中间目标——并非每个满足 $2 \le m < p$ 的自然数都不是 $p$ 的因子——用[例 4.4.4](04_Proofs_with_Structure_II.md#例-444)中的引理 `prime_test` 反证证明它，再对该结果做否定范式化。

```lean
example {p : ℕ} (hp : ¬ Prime p) (hp2 : 2 ≤ p) : ∃ m, 2 ≤ m ∧ m < p ∧ m ∣ p := by
  have H : ¬ (∀ (m : ℕ), 2 ≤ m → m < p → ¬m ∣ p)
  · intro H
    sorry
  sorry
```