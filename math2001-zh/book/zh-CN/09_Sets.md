# 第 9 章 集合

> 本译文对应原书 [Sets](https://hrmacbeth.github.io/math2001/09_Sets.html)；英文 Sphinx 源：`09_Sets.rst`。

本章引入**集合**的语言——这是一种便利的方式，用来推理某个类型中具有某种性质的对象。这种语言包括：元素**属于**集合的概念、一个集合是另一个集合的**子集**这一性质，以及一整套集合运算（如**交集**、**并集**和**补集**），其中每一种运算都是对底层性质之间逻辑联结词的封装。

在本章最后一节 [9.3](#93-幂集)，我们把一个类型中的集合全体本身作为一个类型来研究。

## 9.1. 集合

### 9.1.1. 例

在本书的逻辑基础——类型论中，类型 $X$ 中的**集合**由 $X$ 上的一个谓词指定。例如，“满足 $n\le 3$ 的整数 $n$ 的集合”是 $\mathbb{Z}$ 中的一个集合。

由谓词指定的集合有一种标准记号。例如，上面描述的集合记作 $\{n:\mathbb{Z} \mid n\le 3\}$。下面是 Lean 中的该集合。

```lean
#check {n : ℤ | n ≤ 3}
```

注意 infoview 确认该表达式的类型是 `Set ℤ`，即整数集合。

类型 $X$ 的一个项**属于** $X$ 中由某谓词指定的集合，当且仅当该谓词对该项成立。

**问题**

证明整数 1 属于整数集合 $\{n:\mathbb{Z} \mid n\le 3\}$。

**解法**

$1\le 3$。

关于这一概念，你可能还会看到其他表述：1 **是**集合 $\{n:\mathbb{Z} \mid n\le 3\}$ 的**成员**，或 1 **在** $\{n:\mathbb{Z} \mid n\le 3\}$ **中**。记号是 $1\in \{n:\mathbb{Z} \mid n\le 3\}$。

下面是 Lean 中的该证明：

```lean
example : 1 ∈ {n : ℤ | n ≤ 3} := by
  dsimp
  numbers
```

策略 `dsimp` 展开集合及其属于关系的定义，将目标化简为

```
⊢ 1 ≤ 3
```

再由 `numbers` 解决。

### 9.1.2. 例

符号 $\notin$ 表示 $\in$ 的否定。

**问题**

证明 $10\notin \{n:\mathbb{N} \mid n\text{ 是奇数}\}$。

**解法**

由于 $10=2\cdot 5$，故 10 是偶数，因此不是奇数。

在下面的 Lean 证明中，策略 `dsimp` 将目标清理为

```
⊢ ¬Odd 10
```

然后可用通用方法解决。

```lean
example : 10 ∉ {n : ℕ | Odd n} := by
  dsimp
  rw [← even_iff_not_odd]
  use 5
  numbers
```

### 9.1.3. 例

**定义**

设 $U$ 与 $V$ 是类型 $X$ 中的集合。若对 $X$ 中所有 $x$，由 $x\in U$ 可推出 $x\in V$，则称 $U$ **是** $V$ 的**子集**。

陈述“$U$ **是** $V$ 的**子集**”的记号是 $U \subseteq V$。

在 Lean 中，定义如下：

```lean
def Set.Subset (U V : Set α) : Prop := ∀ ⦃x⦄, x ∈ U → x ∈ V
```

记号是 `U ⊆ V`。

**问题**

证明 $\{a:\mathbb{N} \mid 4\mid a\}\subseteq\{b:\mathbb{N} \mid 2\mid b\}$。

**解法**

我们将证明：对所有自然数 $a$，若 $4\mid a$，则 $2\mid a$。事实上，设 $a$ 为自然数并假设 $4\mid a$。则存在自然数 $k$ 使得 $a=4k$，故

$$
\begin{split}a&=4k\\ &=2(2k),\end{split}
$$

所以 $2\mid a$。

下面是 Lean 中的该解法。注意，用 `dsimp` 展开定义后，目标状态化简为

```
⊢ ∀ (x : ℕ), 4 ∣ x → 2 ∣ x
```

```lean
example : {a : ℕ | 4 ∣ a} ⊆ {b : ℕ | 2 ∣ b} := by
  dsimp [Set.subset_def] -- optional
  intro a ha
  obtain ⟨k, hk⟩ := ha
  use 2 * k
  calc a = 4 * k := hk
    _ = 2 * (2 * k) := by ring
```

你也可以验证，省略 `dsimp` 那一行证明照样通过。

### 9.1.4. 例

记号 $\not\subseteq$ 表示“不是子集”。

**问题**

证明 $\{x:\mathbb{R} \mid 0 \le x^2\}\not\subseteq \{t:\mathbb{R} \mid 0\le t\}$。

**解法**

我们将证明存在实数 $x$，使得 $0\le x^2$ 且 $x<0$。事实上，$0\le (-3)^2$ 且 $-3<0$。

在 Lean 中，展开定义并做否定正规化后，目标显示为

```
⊢ ∃ x, 0 ≤ x ^ 2 ∧ x < 0
```

这正是我们在文本证明第一句话中所陈述的改写。

```lean
example : {x : ℝ | 0 ≤ x ^ 2} ⊈ {t : ℝ | 0 ≤ t} := by
  dsimp [Set.subset_def]
  push_neg
  use -3
  constructor
  · numbers
  · numbers
```

### 9.1.5. 例

要在 Lean 中证明两个集合相等，我们证明某物属于其中一个当且仅当它属于另一个。这称为**集合外延性**性质——可与[例 8.3.2](08_Functions.md#例-832)中讨论的**函数外延性**性质相比较。

**问题**

证明 $\{x:\mathbb{Z} \mid x\text{ 是奇数}\}= \{a:\mathbb{Z} \mid \exists k:\mathbb{Z}, a = 2k - 1\}$。

**解法**

设 $x$ 为整数。我们必须证明 $x$ 是奇数当且仅当存在整数 $k$ 使得 $x=2k-1$。

首先，假设 $x$ 是奇数。则存在整数 $l$ 使得 $x=2l+1$。故

$$
\begin{split}x&=2l+1\\ &=2(l+1)-1.\end{split}
$$

反过来，假设存在整数 $k$ 使得 $x=2k-1$。则

$$
\begin{split}x&=2k-1\\ &=2(k-1)+1,\end{split}
$$

所以 $x$ 是奇数。

在 Lean 中，照例我们用策略 `ext` 调用外延性性质。展开定义后，目标显示为

```
⊢ Int.Odd x ↔ ∃ k, x = 2 * k - 1
```

这正是我们在文本证明第一段中所陈述的问题改写。

下面是完整的 Lean 证明。

```lean
example : {x : ℤ | Int.Odd x} = {a : ℤ | ∃ k, a = 2 * k - 1} := by
  ext x
  dsimp
  constructor
  · intro h
    obtain ⟨l, hl⟩ := h
    use l + 1
    calc x = 2 * l + 1 := by rw [hl]
      _ = 2 * (l + 1) - 1 := by ring
  · intro h
    obtain ⟨k, hk⟩ := h
    use k - 1
    calc x = 2 * k - 1 := by rw [hk]
      _ = 2 * (k - 1) + 1 := by ring
```

### 9.1.6. 例

要在 Lean 中证明两个集合不相等，我们给出一个属于其中一个却不属于另一个的元素。

**问题**

证明 $\{a:\mathbb{N} \mid 4\mid a\}\ne\{b:\mathbb{N} \mid 2\mid b\}$。

**解法**

我们将证明存在自然数 $x$，使得 $2\mid x$ 且 $4\nmid x$。

事实上，我们来证明 $6$ 具有这一性质。我们有 $6=2\cdot 3$，故 $2\mid 6$，且 $4\cdot 1 < 6 < 4 \cdot 2$，故 $4\nmid 6$。

在 Lean 中，应用集合外延性、展开定义并做否定正规化后，目标状态显示为

```
⊢ ∃ x, 4 ∣ x ∧ ¬2 ∣ x ∨ ¬4 ∣ x ∧ 2 ∣ x
```

此时我们指定见证 6，并说明将证明右支，即 `¬4 ∣ 6 ∧ 2 ∣ 6`。

```lean
example : {a : ℕ | 4 ∣ a} ≠ {b : ℕ | 2 ∣ b} := by
  ext
  dsimp
  push_neg
  use 6
  right
  constructor
  · apply Nat.not_dvd_of_exists_lt_and_lt
    use 1
    constructor <;> numbers
  · use 3
    numbers
```

### 9.1.7. 例

**问题**

证明或反驳 $\{k:\mathbb{Z} \mid 8\mid 5k\}=\{l:\mathbb{Z} \mid 8\mid l\}$。

**解法**

该陈述为真。

设 $n$ 为整数。我们将证明 $5n$ 是 8 的倍数当且仅当 $n$ 是。

首先，假设 $8\mid 5n$。则存在整数 $a$ 使得 $5n=8a$。故

$$
\begin{split}n &= -3 (5 n) + 16 n \\ &= -3 (8 a) + 16 n \\ & = 8 (-3 a + 2 n),\end{split}
$$

所以 $8\mid n$。

反过来，假设 $8\mid n$。则存在整数 $a$ 使得 $n=8a$。故

$$
\begin{split}5n &= 5(8a) \\ &= 8(5a),\end{split}
$$

所以 $8\mid 5n$。

这道题原来是[例 4.2.2](04_Proofs_with_Structure_II.md#例-422)的伪装版本！

```lean
example : {k : ℤ | 8 ∣ 5 * k} = {l : ℤ | 8 ∣ l} := by
  ext n
  dsimp
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

### 9.1.8. 例

有一种特殊记号 $\{1,2,3\}$ 用来指称一个有限集合，其唯一元素就是所列出的那些，此处为 1、2 和 3。按定义，$\{1,2,3\}$ 表示 $\{x \mid x = 1 \lor x = 2 \lor x = 3\}$。（类型，如 $\mathbb{N}$ 或 $\mathbb{R}$，通常由上下文推断。）

**问题**

证明 $\{x:\mathbb{R} \mid x^2-x-2=0\}=\{-1, 2\}$。

**解法**

设 $x$ 为实数。我们必须证明 $x ^ 2 - x - 2 = 0$ 当且仅当 $x=-1$ 或 $x=2$。

首先，假设 $x ^ 2 - x - 2 = 0$。则

$$
\begin{split}(x+1)(x-2)&=x ^ 2 - x - 2\\ &=0,\end{split}
$$

所以 $x+1=0$ 或 $x-2=0$。若前者，$x=-1$；若后者，$x=2$。

反过来，假设 $x=-1$ 或 $x=2$。

**情形 1**（$x=-1$）：则

$$
\begin{split}x^2-x-2&=(-1)^2-(-1)-2\\ &=0.\end{split}
$$

**情形 2**（$x=2$）：则

$$
\begin{split}x^2-x-2&=2^2-2-2\\ &=0.\end{split}
$$

在 Lean 中，应用集合外延性并展开定义后，目标为

```
x ^ 2 - x - 2 = 0 ↔ x = -1 ∨ x = 2
```

我们在书面证明开头说明了这一点。

```lean
example : {x : ℝ | x ^ 2 - x - 2 = 0} = {-1, 2} := by
  ext x
  dsimp
  constructor
  · intro h
    have hx :=
    calc
      (x + 1) * (x - 2) = x ^ 2 - x - 2 := by ring
        _ = 0 := by rw [h]
    rw [mul_eq_zero] at hx
    obtain hx | hx := hx
    · left
      addarith [hx]
    · right
      addarith [hx]
  · intro h
    obtain h | h := h
    · calc x ^ 2 - x - 2 = (-1) ^ 2 - (-1) - 2 := by rw [h]
        _ = 0 := by numbers
    · calc x ^ 2 - x - 2 = 2 ^ 2 - 2 - 2 := by rw [h]
        _ = 0 := by numbers
```

### 9.1.9. 例

**问题**

证明 $\{1,3,6\} \subseteq\{t:\mathbb{Q} \mid t<10\}$。

**解法**

我们必须证明：对所有有理数 $t$，若 $t=1$ 或 $t=3$ 或 $t=6$，则 $t<10$。事实上，$1<10$、$3<10$ 且 $6<10$。

```lean
example : {1, 3, 6} ⊆ {t : ℚ | t < 10} := by
  dsimp [Set.subset_def]
  intro t ht
  obtain h1 | h3 | h6 := ht
  · addarith [h1]
  · addarith [h3]
  · addarith [h6]
```

### 9.1.10. 练习

1. 证明或反驳 $4\in \{a:\mathbb{Q} \mid a<3\}$。

   ```lean
   example : 4 ∈ {a : ℚ | a < 3} := by
     sorry

   example : 4 ∉ {a : ℚ | a < 3} := by
     sorry
   ```

2. 证明或反驳 $6\in \{n:\mathbb{N} \mid n\mid 42\}$。

   ```lean
   example : 6 ∈ {n : ℕ | n ∣ 42} := by
     sorry

   example : 6 ∉ {n : ℕ | n ∣ 42} := by
     sorry
   ```

3. 证明或反驳 $8\in \{k:\mathbb{Z} \mid 5\mid k\}$。

   ```lean
   example : 8 ∈ {k : ℤ | 5 ∣ k} := by
     sorry

   example : 8 ∉ {k : ℤ | 5 ∣ k} := by
     sorry
   ```

4. 证明或反驳 $11\in \{n:\mathbb{N} \mid n\text{ 是奇数}\}$。

   ```lean
   example : 11 ∈ {n : ℕ | Odd n} := by
     sorry

   example : 11 ∉ {n : ℕ | Odd n} := by
     sorry
   ```

5. 证明或反驳 $-3\in \{x:\mathbb{R} \mid \forall y :\mathbb{R}, x\le y^2\}$。

   ```lean
   example : -3 ∈ {x : ℝ | ∀ y : ℝ, x ≤ y ^ 2} := by
     sorry

   example : -3 ∉ {x : ℝ | ∀ y : ℝ, x ≤ y ^ 2} := by
     sorry
   ```

6. 证明或反驳 $\{a:\mathbb{N} \mid 20\mid a\}\subseteq \{x:\mathbb{N} \mid 5 \mid x\}$。

   ```lean
   example : {a : ℕ | 20 ∣ a} ⊆ {x : ℕ | 5 ∣ x} := by
     sorry

   example : {a : ℕ | 20 ∣ a} ⊈ {x : ℕ | 5 ∣ x} := by
     sorry
   ```

7. 证明或反驳 $\{a:\mathbb{N} \mid 5\mid a\}\subseteq \{x:\mathbb{N} \mid 20 \mid x\}$。

   ```lean
   example : {a : ℕ | 5 ∣ a} ⊆ {x : ℕ | 20 ∣ x} := by
     sorry

   example : {a : ℕ | 5 ∣ a} ⊈ {x : ℕ | 20 ∣ x} := by
     sorry
   ```

8. 证明或反驳 $\{r:\mathbb{Z} \mid 3\mid r\}\subseteq \{s:\mathbb{Z} \mid 0 \le s\}$。

   ```lean
   example : {r : ℤ | 3 ∣ r} ⊆ {s : ℤ | 0 ≤ s} := by
     sorry

   example : {r : ℤ | 3 ∣ r} ⊈ {s : ℤ | 0 ≤ s} := by
     sorry
   ```

9. 证明或反驳 $\{m:\mathbb{Z} \mid m\ge 10\}\subseteq \{n:\mathbb{Z} \mid n^3-7n^2\geq 4n\}$。

   ```lean
   example : {m : ℤ | m ≥ 10} ⊆ {n : ℤ | n ^ 3 - 7 * n ^ 2 ≥ 4 * n} := by
     sorry

   example : {m : ℤ | m ≥ 10} ⊈ {n : ℤ | n ^ 3 - 7 * n ^ 2 ≥ 4 * n} := by
     sorry
   ```

10. 证明或反驳 $\{n:\mathbb{Z} \mid n\text{ 是偶数}\}=\{a:\mathbb{Z} \mid a\equiv 6\mod 2\}$。

    ```lean
    example : {n : ℤ | Even n} = {a : ℤ | a ≡ 6 [ZMOD 2]} := by
      sorry

    example : {n : ℤ | Even n} ≠ {a : ℤ | a ≡ 6 [ZMOD 2]} := by
      sorry
    ```

11. 证明或反驳 $\{t:\mathbb{R} \mid t^2-5t+4=0\}=\{4\}$。

    ```lean
    example : {t : ℝ | t ^ 2 - 5 * t + 4 = 0} = {4} := by
      sorry

    example : {t : ℝ | t ^ 2 - 5 * t + 4 = 0} ≠ {4} := by
      sorry
    ```

12. 证明或反驳 $\{k:\mathbb{Z} \mid 8\mid 6k\}=\{l:\mathbb{Z} \mid 8\mid l\}$。

    ```lean
    example : {k : ℤ | 8 ∣ 6 * k} = {l : ℤ | 8 ∣ l} := by
      sorry

    example : {k : ℤ | 8 ∣ 6 * k} ≠ {l : ℤ | 8 ∣ l} := by
      sorry
    ```

13. 证明或反驳 $\{k:\mathbb{Z} \mid 7\mid 9k\}=\{l:\mathbb{Z} \mid 7\mid l\}$。

    ```lean
    example : {k : ℤ | 7 ∣ 9 * k} = {l : ℤ | 7 ∣ l} := by
      sorry

    example : {k : ℤ | 7 ∣ 9 * k} ≠ {l : ℤ | 7 ∣ l} := by
      sorry
    ```

14. 证明或反驳 $\{1,2,3\}=\{1,2\}$。

    ```lean
    example : {1, 2, 3} = {1, 2} := by
      sorry

    example : {1, 2, 3} ≠ {1, 2} := by
      sorry
    ```

15. 证明 $\{x:\mathbb{R} \mid x^2+3x+2=0\}=\{-1, -2\}$。

    ```lean
    example : {x : ℝ | x ^ 2 + 3 * x + 2 = 0} = {-1, -2} := by
      sorry
    ```

## 9.2. 集合运算

### 9.2.1. 例

**定义**

类型 $X$ 中两个集合 $U$ 与 $V$ 的**并集**，记作 $U \cup V$，是 $\{x : X \mid x \in U \lor x \in V\}$。

**问题**

设 $t$ 为实数。证明 $t\in\{x:\mathbb{R}\mid-1<x\}\cup \{x:\mathbb{R}\mid x < 1\}$。

**解法**

我们必须证明 $-1<t$ 或 $t<1$。

**情形 1**（$t\le 0$）：则 $t<1$。

**情形 2**（$t> 0$）：则 $-1<t$。

在本题中展开定义后，目标是证明

```
⊢ -1 < t ∨ t < 1
```

下面是 Lean 中的完整证明。

```lean
example (t : ℝ) : t ∈ {x : ℝ | -1 < x} ∪ {x : ℝ | x < 1} := by
  dsimp
  obtain h | h := le_or_lt t 0
  · right
    addarith [h]
  · left
    addarith [h]
```

### 9.2.2. 例

**问题**

证明 $\{1,2\}\cup\{2,4\}=\{1,2,4\}$。

应用集合外延性并在本题中展开定义后，目标状态为

```
n : ℕ
⊢ (n = 1 ∨ n = 2) ∨ n = 2 ∨ n = 4 ↔ n = 1 ∨ n = 2 ∨ n = 4
```

可以直接证明——这样一个证明的开头如下所示。

```lean
example : {1, 2} ∪ {2, 4} = {1, 2, 4} := by
  ext n
  dsimp
  constructor
  · intro h
    obtain (h | h) | (h | h) := h
    · left
      apply h
    · right
      left
      apply h
  -- and much, much more
    · sorry
    · sorry
  · sorry
```

但有更好的办法：这是纯命题逻辑，正是策略 `exhaust`（见[例 8.1.8](08_Functions.md#例-818)）所针对的情形。

```lean
example : {2, 1} ∪ {2, 4} = {1, 2, 4} := by
  ext n
  dsimp
  exhaust
```

### 9.2.3. 例

**定义**

类型 $X$ 中两个集合 $U$ 与 $V$ 的**交集**，记作 $U \cap V$，是 $\{x : X \mid x \in U \land x \in V\}$。

**问题**

证明 $\{-2,3\}\cap \{x:\mathbb{Q}\mid x^2=9\}\subseteq \{a:\mathbb{Q}\mid 0<a\}$。

**解法**

我们将证明：对所有有理数 $t$，若 $t$ 是 $-2$ 或 $3$ 且 $t^2=9$，则 $0<t$。

事实上，设 $t$ 为有理数，并假设 $t$ 是 $-2$ 或 $3$ 且 $t^2=9$。

**情形 1**（$t=-2$）：则我们有

$$
\begin{split}(-2)^2&=t^2\\ &=9,\end{split}
$$

矛盾。

**情形 2**（$t=3$）：则 $0<t$，正如所需。

```lean
example : {-2, 3} ∩ {x : ℚ | x ^ 2 = 9} ⊆ {a : ℚ | 0 < a} := by
  dsimp [Set.subset_def]
  intro t h
  obtain ⟨(h1 | h1), h2⟩ := h
  · have :=
    calc (-2) ^ 2 = t ^ 2 := by rw [h1]
      _ = 9 := by rw [h2]
    numbers at this
  · addarith [h1]
```

### 9.2.4. 例

**问题**

证明 $\{n:\mathbb{N}\mid 4\le n\}\cap \{n:\mathbb{N}\mid n<7\}\subseteq\{4,5,6\}$。

```lean
example : {n : ℕ | 4 ≤ n} ∩ {n : ℕ | n < 7} ⊆ {4, 5, 6} := by
  dsimp [Set.subset_def]
  intro n h
  obtain ⟨h1, h2⟩ := h
  interval_cases n <;> exhaust
```

### 9.2.5. 例

**定义**

类型 $X$ 中集合 $U$ 的**补集**，记作 $U^{c}$，是 $\{x : X \mid x \notin U\}$。

**问题**

证明 $\{n:\mathbb{Z}\mid n\text{ 是偶数}\}^{c}=\{n:\mathbb{Z}\mid n\text{ 是奇数}\}$。

**解法**

设 $n$ 为整数。我们必须证明 $n$ 是奇数当且仅当它不是偶数。这正是[例 4.5.5](04_Proofs_with_Structure_II.md#例-455)。

```lean
example : {n : ℤ | Even n}ᶜ = {n : ℤ | Odd n} := by
  ext n
  dsimp
  rw [odd_iff_not_even]
```

### 9.2.6. 例

类型 $X$ 中的**空集**是没有元素的集合。这有点非形式：下面是严格定义。

**定义**

类型 $X$ 中的**空集**，记作 $\emptyset$，是 $\{x : X \mid \operatorname{False}\}$。

由纯逻辑可知，类型 $X$ 的任何元素都不属于 $X$ 中的空集，且 $X$ 中的空集是 $X$ 中每个集合的子集。

```lean
example (x : ℤ) : x ∉ ∅ := by
  dsimp
  exhaust

example (U : Set ℤ) : ∅ ⊆ U := by
  dsimp [Set.subset_def]
  intro x
  exhaust
```

要证明 $X$ 中的集合 $U$ 等于空集，你必须证明 $U$ 没有元素。

**问题**

证明 $\{n:\mathbb{Z}\mid n\equiv 1\mod 5\}\cap\{n:\mathbb{Z}\mid n\equiv 2\mod 5\}=\emptyset$。

先看 Lean 证明。我们可以这样写：

```lean
example : {n : ℤ | n ≡ 1 [ZMOD 5]} ∩ {n : ℤ | n ≡ 2 [ZMOD 5]} = ∅ := by
  ext x
  dsimp
  constructor
  · intro hx
    obtain ⟨hx1, hx2⟩ := hx
    have :=
    calc 1 ≡ x [ZMOD 5] := by rel [hx1]
      _ ≡ 2 [ZMOD 5] := by rel [hx2]
    numbers at this
  · intro hx
    contradiction
```

但证明中有相当一部分（`constructor`，以及证明第二支中的 `intro`/`contradiction`）只是逻辑上的摆弄。既然我们已熟悉 `exhaust` 策略的全部威力，就可以精简这类证明。看看 `dsimp` 之后的目标状态：

```
⊢ x ≡ 1 [ZMOD 5] ∧ x ≡ 2 [ZMOD 5] ↔ False
```

你或许会心里把它化简为逻辑等价的

```
⊢ ¬ (x ≡ 1 [ZMOD 5] ∧ x ≡ 2 [ZMOD 5])
```

这一改写可在 Lean 中用咒语

```lean
suffices ¬(x ≡ 1 [ZMOD 5] ∧ x ≡ 2 [ZMOD 5]) by exhaust
```

来完成。下面是用这一方法的完整 Lean 证明。

```lean
example : {n : ℤ | n ≡ 1 [ZMOD 5]} ∩ {n : ℤ | n ≡ 2 [ZMOD 5]} = ∅ := by
  ext x
  dsimp
  suffices ¬(x ≡ 1 [ZMOD 5] ∧ x ≡ 2 [ZMOD 5]) by exhaust
  intro hx
  obtain ⟨hx1, hx2⟩ := hx
  have :=
  calc 1 ≡ x [ZMOD 5] := by rel [hx1]
    _ ≡ 2 [ZMOD 5] := by rel [hx2]
  numbers at this
```

下面是用文字写的该证明。我们把集合外延性、定义展开以及逻辑等价改写合并成一段铺垫。

**解法**

设 $x$ 为整数。我们将证明：并非同时有 $x\equiv 1\mod 5$ 与 $x\equiv 2\mod 5$。

事实上，假设 $x\equiv 1\mod 5$ 且 $x\equiv 2\mod 5$。则

$$
\begin{split}1&\equiv x\mod 5\\ &\equiv 2\mod 5,\end{split}
$$

矛盾。

### 9.2.7. 例

类型 $X$ 中的**全集**是包含 $X$ 中一切元素的集合。这同样有点非形式：下面是严格定义。

**定义**

类型 $X$ 中的**全集**是 $\{x : X \mid \operatorname{True}\}$。

由纯逻辑可知，类型 $X$ 的所有元素都属于 $X$ 中的全集，且 $X$ 中的每个集合都是 $X$ 中全集的子集。

```lean
example (x : ℤ) : x ∈ univ := by dsimp

example (U : Set ℤ) : U ⊆ univ := by
  dsimp [Set.subset_def]
  intro x
  exhaust
```

注意，在 Lean 中全集记作 `univ`。在纸面上，我们也常把 $X$ 的全集称为 $X$（尽管这并不严格正确）。

要证明 $X$ 中的集合 $U$ 等于全集，你必须证明 $U$ 包含 $X$ 的所有元素。这里我们把[例 9.2.1](#例-921)改编成关于全集的问题。

**问题**

证明 $\{x:\mathbb{R}\mid-1<x\}\cup \{x:\mathbb{R}\mid x < 1\}=\mathbb{R}$。

**解法**

我们必须证明：对所有实数 $t$，要么 $-1<t$，要么 $t<1$。

**情形 1**（$t\le 0$）：则 $t<1$。

**情形 2**（$t> 0$）：则 $-1<t$。

```lean
example : {x : ℝ | -1 < x} ∪ {x : ℝ | x < 1} = univ := by
  ext t
  dsimp
  suffices -1 < t ∨ t < 1 by exhaust
  obtain h | h := le_or_lt t 0
  · right
    addarith [h]
  · left
    addarith [h]
```

### 9.2.8. 练习

对前五道题，我提供了一个策略 `check_equality_of_explicit_sets`：只要你表述正确，它就能证明该陈述。该策略依次运行 `ext`、`dsimp`、`exhaust`：

```lean
macro "check_equality_of_explicit_sets" : tactic => `(tactic| (ext; dsimp; exhaust))
```

1. 写出一个无重复、显式列出的有限集合，或 $\emptyset$，使其等于 $\{-1,2,4,4\}\cup\{3,-2,2\}$。答案正确时，给定的 Lean 证明即可通过。

   ```lean
   example : {-1, 2, 4, 4} ∪ {3, -2, 2} = sorry := by check_equality_of_explicit_sets
   ```

2. 写出一个无重复、显式列出的有限集合，或 $\emptyset$，使其等于 $\{0, 1, 2, 3, 4\}\cap\{0, 2, 4, 6, 8\}$。答案正确时，给定的 Lean 证明即可通过。

   ```lean
   example : {0, 1, 2, 3, 4} ∩ {0, 2, 4, 6, 8} = sorry := by
     check_equality_of_explicit_sets
   ```

3. 写出一个无重复、显式列出的有限集合，或 $\emptyset$，使其等于 $\{1,2\}\cap\{3\}$。答案正确时，给定的 Lean 证明即可通过。

   ```lean
   example : {1, 2} ∩ {3} = sorry := by check_equality_of_explicit_sets
   ```

4. 写出一个无重复、显式列出的有限集合，或 $\emptyset$，使其等于 $\{3,4,5\}^c\cap\{1,3,5,7,9\}$。答案正确时，给定的 Lean 证明即可通过。

   ```lean
   example : {3, 4, 5}ᶜ ∩ {1, 3, 5, 7, 9} = sorry := by
     check_equality_of_explicit_sets
   ```

5. 证明 $\{r:\mathbb{Z}\mid r\equiv 7\mod 10\}\subseteq \{s:\mathbb{Z}\mid s\equiv 1\mod 2\}\cap\{t:\mathbb{Z}\mid t\equiv 2\mod 5\}$。

   ```lean
   example : {r : ℤ | r ≡ 7 [ZMOD 10] }
       ⊆ {s : ℤ | s ≡ 1 [ZMOD 2]} ∩ {t : ℤ | t ≡ 2 [ZMOD 5]} := by
     sorry
   ```

6. 证明 $\{n:\mathbb{Z}\mid 5\mid n\}\cap \{n:\mathbb{Z}\mid 8\mid n\}\subseteq\{n:\mathbb{Z}\mid 40\mid n\}$。

   ```lean
   example : {n : ℤ | 5 ∣ n} ∩ {n : ℤ | 8 ∣ n} ⊆ {n : ℤ | 40 ∣ n} := by
     sorry
   ```

7. 证明 $\{n:\mathbb{Z}\mid 3\mid n\}\cup \{n:\mathbb{Z}\mid 2\mid n\}\subseteq\{n:\mathbb{Z}\mid n^2\equiv 1\mod 6\}^{c}$。

   ```lean
   example :
       {n : ℤ | 3 ∣ n} ∪ {n : ℤ | 2 ∣ n} ⊆ {n : ℤ | n ^ 2 ≡ 1 [ZMOD 6]}ᶜ := by
     sorry
   ```

8. 设类型 $X$ 中的集合 $s$ **至少有二**个元素，若 $s$ 中存在不同的 $x_1$ 与 $x_2$；**至少有三个**元素，若 $s$ 中存在两两不同的 $x_1$、$x_2$ 与 $x_3$。

   设 $s$ 与 $t$ 是某类型 $X$ 中至少各有二个元素的集合，并假设 $s \cap t$ 不具有至少二个元素。证明 $s\cup t$ 至少有三个元素。

   这道题情形很多。请大胆使用 `exhaust` 消去子情形。

   ```lean
   def SizeAtLeastTwo (s : Set X) : Prop := ∃ x1 x2 : X, x1 ≠ x2 ∧ x1 ∈ s ∧ x2 ∈ s
   def SizeAtLeastThree (s : Set X) : Prop :=
     ∃ x1 x2 x3 : X, x1 ≠ x2 ∧ x1 ≠ x3 ∧ x2 ≠ x3 ∧ x1 ∈ s ∧ x2 ∈ s ∧ x3 ∈ s

   example {s t : Set X} (hs : SizeAtLeastTwo s) (ht : SizeAtLeastTwo t)
       (hst : ¬ SizeAtLeastTwo (s ∩ t)) :
       SizeAtLeastThree (s ∪ t) := by
     sorry
   ```

## 9.3. 幂集

### 9.3.1. 定义

设 $X$ 为类型。$X$ 中所有集合的全体本身可以视为一个类型。这个类型有时记作 $\mathcal{P}(X)$。[^1] 例如，$\{3,4,5\}$、$\{n:\mathbb{N}\mid 8<n\}$ 与 $\{k:\mathbb{N}\mid\exists \ a, a^2=k\}$ 都是自然数集合，因而它们都具有类型 $\mathcal{P}(\mathbb{N})$。

在 Lean 中，对类型 `X`，`X` 中集合的类型记作 `Set X`。Lean 会确认上面描述的三个对象都具有类型 `Set ℕ`：

```lean
#check {3, 4, 5} -- `{3, 4, 5} : Set ℕ`
#check {n : ℕ | 8 < n} -- `{n | 8 < n} : Set ℕ`
#check {k : ℕ | ∃ a, a ^ 2 = k} -- `{k | ∃ a, a ^ 2 = k} : Set ℕ`
```

这一运算可以迭代：你可以有“集合的集合”，依此类推。

```lean
#check {{3, 4}, {4, 5, 6}} -- `{{3, 4}, {4, 5, 6}} : Set (Set ℕ)`
#check {s : Set ℕ | 3 ∈ s} -- `{s | 3 ∈ s} : Set (Set ℕ)`
```

**练习**：写出一个类型为 `Set (Set (Set ℕ))` 的对象。

### 9.3.2. 例

**问题**

证明 $\{n:\mathbb{N}\mid n\text{ 是偶数}\}\notin\{s:\mathcal{P}(\mathbb{N})\mid 3 \in s\}$。

**解法**

我们必须证明 3 不是偶数。只需证明 3 是奇数。事实上，$3=2\cdot 1+1$。

```lean
example : {n : ℕ | Nat.Even n} ∉ {s : Set ℕ | 3 ∈ s} := by
  dsimp
  rw [← Nat.odd_iff_not_even]
  use 1
  numbers
```

### 9.3.3. 例

既然 $\mathcal{P}(X)$——$X$ 中集合的类型——本身是一个类型，我们就可以考虑从它出发或到达它的函数。

例如，给定自然数集合 $s$，我们可以构造新集合 $\{n:\mathbb{N}\mid n+1 \in s\}$。Lean 确认这一运算（设其名为 $p$）是从 $\mathcal{P}(\mathbb{N})$ 到 $\mathcal{P}(\mathbb{N})$ 的函数。

```lean
def p (s : Set ℕ) : Set ℕ := {n : ℕ | n + 1 ∈ s}

#check @p -- `p : Set ℕ → Set ℕ`
```

**问题**

证明函数 $p$ 不是单射。

**解法**

我们必须证明存在集合 $s$ 与 $t$，使得
(i) $\{n:\mathbb{N}\mid n+1 \in s\} = \{n:\mathbb{N}\mid n+1 \in t\}$，且
(ii) $s \ne t$。

事实上，我们来证明集合 $\{0\}$ 与 $\emptyset$ 具有这一性质。我们必须证明：
(i) $\{n:\mathbb{N}\mid n+1 = 0\} = \emptyset$，且
(ii) $\{0\} \ne \emptyset$。

对第一个陈述，设 $x$ 为自然数。我们必须证明 $x+1 \ne 0$，这成立，因为 $x+1 > 0$。

对第二个陈述，我们必须证明存在自然数 $k$，使得 $k\in\{0\}$ 且 $k\notin\emptyset$，或反之。事实上，$k=0$ 具有这一性质。

```lean
example : ¬ Injective p := by
  dsimp [Injective, p]
  push_neg
  use {0}, ∅
  dsimp
  constructor
  · ext x
    dsimp
    suffices x + 1 ≠ 0 by exhaust
    apply ne_of_gt
    extra
  · ext
    push_neg
    use 0
    dsimp
    exhaust
```

### 9.3.4. 例

**问题**

考虑函数 $q : \mathcal{P}(\mathbb{Z})\to \mathcal{P}(\mathbb{Z})$，定义为 $q(s)=\{n:\mathbb{Z}\mid n+1\in s\}$。证明函数 $q$ 是单射。

**解法**

我们必须证明：对所有集合 $s$ 与 $t$，若 $\{n:\mathbb{Z}\mid n+1 \in s\} = \{n:\mathbb{Z}\mid n+1 \in t\}$，则 $s = t$。

事实上，设 $s$ 与 $t$ 为集合，并假设 $\{n:\mathbb{Z}\mid n+1 \in s\} = \{n:\mathbb{Z}\mid n+1 \in t\}$。

设 $k$ 为整数。我们必须证明 $k\in s$ 当且仅当 $k\in t$。事实上，由假设，
$k -1\in\{n:\mathbb{Z}\mid n+1 \in s\}$ 当且仅当 $k-1\in \{n:\mathbb{Z}\mid n+1 \in t\}$。
化简得 $k -1+1 \in s$ 当且仅当 $k-1+1\in t$，因而 $k \in s$ 当且仅当 $k\in t$。

```lean
def q (s : Set ℤ) : Set ℤ := {n : ℤ | n + 1 ∈ s}

example : Injective q := by
  dsimp [Injective, q]
  intro s t hst
  ext k
  have hk : k - 1 ∈ {n | n + 1 ∈ s} ↔ k - 1 ∈ {n | n + 1 ∈ t} := by rw [hst]
  dsimp at hk
  conv at hk => ring
  apply hk
```

### 9.3.5. 例

**问题**

设 $X$ 为类型。证明不存在从 $X$ 到 $\mathcal{P}(X)$ 的满射函数。

**解法**

为求矛盾，假设某个函数 $f:X\to\mathcal{P}(X)$ 是满射。我们引入 $X$ 中的如下集合：

$$
s :=\{x:X\mid x\notin f(x)\}.
$$

由于 $f$ 是满射，存在某 $x$（类型 $X$）使得 $f(x)=s$。我们按 $x\in s$ 是否成立分情形讨论。

**情形 1**（$x\in s$）：则由 $s$ 的定义，$x\notin f(x)$ 为真，又因 $f(x)=s$，故 $x\notin s$，矛盾。

**情形 2**（$x\notin s$）：则由 $s$ 的定义，$x\notin f(x)$ 为假，又因 $f(x)=s$，故 $x\notin s$ 为假，矛盾。

```lean
example : ¬ ∃ f : X → Set X, Surjective f := by
  intro h
  obtain ⟨f, hf⟩ := h
  let s : Set X := {x | x ∉ f x}
  obtain ⟨x, hx⟩ := hf s
  by_cases hxs : x ∈ s
  · have hfx : x ∉ f x := hxs
    rw [hx] at hfx
    contradiction
  · have hfx : ¬ x ∉ f x := hxs
    rw [hx] at hfx
    contradiction
```

这一曲折证明背后的思想有时称为**理发师悖论**。下面是带理发师的版本：某镇有一位理发师，他给所有不给自己刮胡子的男人刮胡子。悖论：这位理发师给自己刮胡子吗？

### 9.3.6. 练习

1. 考虑函数 $r : \mathcal{P}(\mathbb{N})\to \mathcal{P}(\mathbb{N})$，定义为 $r(s)=s\cup \{3\}$。证明 $r$ 不是单射。

   ```lean
   def r (s : Set ℕ) : Set ℕ := s ∪ {3}

   example : ¬ Injective r := by
     sorry
   ```

2. 考虑整数集合的序列 $U_n$，由下列递推定义：

   $$
   \begin{split}U_0&=\mathbb{Z} \\
   \text{对 }n:\mathbb{N},\quad U_{n+1} &=\{x:\mathbb{Z}\mid \exists \ y\in U_n, x = 2y \}\end{split}
   $$

   证明对所有自然数 $n$，$U_n=\{x:\mathbb{Z}\mid 2^n\mid x\}$。

   ```lean
   def U : ℕ → Set ℤ
     | 0 => univ
     | n + 1 => {x : ℤ | ∃ y ∈ U n, x = 2 * y}

   example (n : ℕ) : U n = {x : ℤ | (2:ℤ) ^ n ∣ x} := by
     simple_induction n with k hk
     · rw [U]
       sorry
     · rw [U]
       ext x
       dsimp
       sorry
   ```

[^1]: 在本书不作为逻辑基础的集合论中，$\mathcal{P}(X)$ 称为 $X$ 的**幂集**。也许在类型论中我们应称之为 $X$ 的“幂类型”……？
