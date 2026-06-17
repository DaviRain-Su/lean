# 第 7 章 数论

> 本译文对应原书 [Number theory](https://hrmacbeth.github.io/math2001/07_Number_Theory.html)；英文 Sphinx 源：`07_Number_Theory.rst`。

本章的风格与本书其他章节不同。这里的事实都是著名定理，它们的证明需要一次性、巧妙的想法。这些特定的想法不会再次出现在作业或考试中。不妨把本章视为一个**顶点**：我们探索用本书目前为止发展的推理工具和理论，能够达到什么样的数学陈述。

## 7.1. 素数无穷多

**定理**

存在无穷多个素数。

这是一个[非常古老](https://en.wikipedia.org/wiki/Euclid%27s_theorem)的定理，最早的已知证明写于约公元前 300 年欧几里得的《几何原本》中。

**证明**

我们证明：对任意给定的自然数 $N$，存在素数 $p \ge N$。

考虑 $N!$，即 $N$ 的阶乘。由[6.2 节](06_Induction.md#62-递推关系)的一个练习，$0 < N!$，所以 $2 \le N! + 1$。因此，由[例 6.4.2](06_Induction.md#642-例)，存在素数 $p$ 是 $N! + 1$ 的因子。

设 $k$ 是自然数使得 $N! + 1 = pk$。这个 $k$ 不能为零，因为若为零，则

$$
\begin{split} 0 &< N! + 1 \\ &= p \cdot 0 \\ &= 0, \end{split}
$$

矛盾。因此 $k > 0$，所以 $k$ 具有 $l + 1$ 的形式（$l$ 为某个自然数），且 $N! + 1 = p(l + 1)$。

现在我们证明 $p$ 不是 $N!$ 的因子，方法是证明 $N!$ 落在 $p$ 的两个相邻倍数 $pl$ 和 $p(l+1)$ 之间。（这就是[例 4.5.8](04_Proofs_with_Structure_II.md#458-练习)中的判别法。）事实上，

$$
\begin{split} pl + p &= p(l + 1) \\ &= N! + 1 \\ &< N! + p, \end{split}
$$

所以 $pl < N!$；且

$$
\begin{split} N! &< N! + 1 \\ &= p(l + 1). \end{split}
$$

如果 $p \le N$，则由[例 6.2.5](06_Induction.md#625-例)，$p$ 将是 $N!$ 的因子，这与我们刚才证明的相矛盾。因此 $p > N$。这就给出了所要求的大于等于 $N$ 的素数。

在 Lean 中，[6.2 节](06_Induction.md#62-递推关系)练习中的引理名为 `factorial_pos`，[例 6.4.2](06_Induction.md#642-例)名为 `exists_prime_factor`，[例 4.5.8](04_Proofs_with_Structure_II.md#458-练习)名为 `Nat.not_dvd_of_exists_lt_and_lt`，[例 6.2.5](06_Induction.md#625-例)名为 `dvd_factorial`。

```lean
example (N : ℕ) : ∃ p ≥ N, Prime p := by
  have hN0 : 0 < N ! := by apply factorial_pos
  have hN2 : 2 ≤ N ! + 1 := by addarith [hN0]
  -- `N! + 1` has a prime factor, `p`
  obtain ⟨p, hp, hpN⟩ : ∃ p : ℕ, Prime p ∧ p ∣ N ! + 1 := exists_prime_factor hN2
  have hp2 : 2 ≤ p
  · obtain ⟨hp', hp''⟩ := hp
    apply hp'
  obtain ⟨k, hk⟩ := hpN
  match k with
  | 0 => -- if `k` is zero, contradiction
    have k_contra :=
    calc 0 < N ! + 1 := by extra
      _ = p * 0 := hk
      _ = 0 := by ring
    numbers at k_contra
  | l + 1 => -- so `k = l + 1` for some `l`
    -- the key fact: `p` is not a factor of `N!`
    have key : ¬ p ∣ (N !)
    · apply Nat.not_dvd_of_exists_lt_and_lt (N !)
      use l
      constructor
      · have :=
        calc p * l + p = p * (l + 1) := by ring
          _ = N ! + 1 := by rw [hk]
          _ < N ! + p := by addarith [hp2]
        addarith [this]
      · calc N ! < N ! + 1 := by extra
          _ = p * (l + 1) := by rw [hk]
    -- so `p` is a prime number greater than or equal to `N`, as we sought
    use p
    constructor
    · obtain h_le | h_gt : p ≤ N ∨ N < p := le_or_lt p N
      · have : p ∣ (N !)
        · apply dvd_factorial
          · extra
          · addarith [h_le]
        contradiction
      · addarith [h_gt]
    · apply hp
```

## 7.2. 高斯引理与欧几里得引理

**定理（高斯引理）**

设 $a$、$b$、$d$ 是整数。假设 $ab$ 是 $d$ 的倍数，且 $\operatorname{gcd}(a,d) = 1$。则 $b$ 是 $d$ 的倍数。

这个引理是我们在[例 3.5.1](03_Parity_and_Divisibility.md#例-351)、[例 3.5.2](03_Parity_and_Divisibility.md#例-352)等特殊情形中反复使用的论证的“最终形式”。和这些特殊情形一样，技巧是找到联系 $a$ 和 $d$ 的“贝祖恒等式”：$a$ 和 $d$ 的倍数相差 1。在特殊情形中我们可以显式找到这样的倍数；在一般情形中，这样的倍数的存在性由[例 6.7.6](06_Induction.md#676-例)保证。

**证明**

由[例 6.7.6](06_Induction.md#676-例)（贝祖恒等式），存在整数 $x$、$y$ 使得 $xa + yd = \operatorname{gcd}(a, d)$。由于 $ab$ 是 $d$ 的倍数，存在整数 $z$ 使得 $ab = dz$。于是

$$
\begin{split} b &= b \cdot 1 \\ &= b \cdot \operatorname{gcd}(a, d) \\ &= b(xa + yd) \\ &= x(ab) + byd \\ &= x(dz) + byd \\ &= d(xz + by), \end{split}
$$

所以 $b$ 是 $d$ 的倍数。

```lean
theorem gauss_lemma {d a b : ℤ} (h1 : d ∣ a * b) (h2 : gcd a d = 1) : d ∣ b := by
  obtain ⟨x, y, h⟩ := bezout a d
  obtain ⟨z, hz⟩ := h1
  use x * z + b * y
  calc b = b * 1 := by ring
    _ = b * gcd a d := by rw [h2]
    _ = b * (x * a + y * d) := by rw [h]
    _ = x * (a * b) + b * y * d := by ring
    _ = x * (d * z) + b * y * d := by rw [hz]
    _ = d * (x * z + b * y) := by ring
```

**定理（欧几里得引理）**

设 $a$、$b$、$p$ 是自然数，$p$ 为素数。假设 $ab$ 是 $p$ 的倍数。则 $a$ 或 $b$ 中至少有一个是 $p$ 的倍数。

这个引理[同样可追溯](https://en.wikipedia.org/wiki/Euclid%27s_lemma)到欧几里得的《几何原本》。

**证明**

由[例 6.7.2](06_Induction.md#672-例)，$\operatorname{gcd}(a,p) \ge 0$，所以 $\operatorname{gcd}(a,p)$（先验是一个整数）可以视为自然数。我们把这个自然数记为 $d$。则

* 由[例 6.7.3](06_Induction.md#673-例)，$d \mid a$ 且 $d \mid p$；
* $(\star)$ 由高斯引理，若 $p \mid ab$ 且 $d = 1$，则 $p \mid b$。

这些可整除性陈述先验都是关于 $a$、$b$、$p$、$d$ 作为整数的陈述，但它们与关于自然数的相应可整除性陈述等价。

现在开始正式证明。由于 $p$ 是素数且 $d \mid p$，要么 $d = 1$，要么 $d = p$。

**情形 1**（$d = 1$）：则由 $(\star)$，$p \mid b$。

**情形 2**（$d = p$）：则由于 $d \mid a$，有 $p \mid a$。

在 Lean 中写下这个证明需要一些技巧来处理整数与自然数之间的交互。这些技巧不会再被使用，不必细看。

* 在把关于整数的引理（`gcd_dvd_left`、`gcd_dvd_right`、`gauss_lemma`、`gcd_nonneg`）应用于自然数输入时，我们把自然数输入**强制转换**为整数，如 `(a:ℤ)`——这不总是必要，但可以避免歧义。（转换后会在 InfoView 中以箭头显示，如 `↑a` 等。）
* 一旦得到假设 `0 ≤ gcd (a:ℤ) (p:ℤ)`，就可以使用 Lean 策略 `lift` 引入一个自然数 `d`，它转换为整数后等于 `gcd (a:ℤ) (p:ℤ)`。
* 最后，我们可以在所有假设上运行策略 `norm_cast`，它把关于“转换为整数的自然数”的陈述转换为关于自然数的相应陈述，如果这在数学上合法的话。例如，`↑d ∣ ↑a` 会转换为 `d ∣ a`。

```lean
theorem euclid_lemma {a b p : ℕ} (hp : Prime p) (H : p ∣ a * b) : p ∣ a ∨ p ∣ b := by
  -- write down everything we know about `gcd (a:ℤ) (p:ℤ)`
  have hap1 : gcd (a:ℤ) (p:ℤ) ∣ (a:ℤ) := gcd_dvd_left (a:ℤ) (p:ℤ)
  have hap2 : gcd (a:ℤ) (p:ℤ) ∣ (p:ℤ) := gcd_dvd_right (a:ℤ) (p:ℤ)
  have h_gauss : (p:ℤ) ∣ (a:ℤ) * (b:ℤ) → gcd (a:ℤ) (p:ℤ) = 1 → (p:ℤ) ∣ (b:ℤ) :=
    gauss_lemma
  have hgcd : 0 ≤ gcd (a:ℤ) (p:ℤ) := gcd_nonneg (a:ℤ) (p:ℤ)
  -- convert to `ℕ` facts
  lift gcd a p to ℕ using hgcd with d hd
  norm_cast at hap1 hap2 h_gauss
  -- actually prove the theorem
  dsimp [Prime] at hp
  obtain ⟨hp1, hp2⟩ := hp
  obtain hgcd_1 | hgcd_p : d = 1 ∨ d = p := hp2 d hap2
  · right
    apply h_gauss H hgcd_1
  · left
    rw [← hgcd_p]
    apply hap1
```

**推论**

设 $a$、$p$、$k$ 是自然数，$p$ 为素数，$k \ge 1$。如果 $a^k$ 是 $p$ 的倍数，则 $a$ 是 $p$ 的倍数。

**证明**

我们对 $k$ 从 1 开始用归纳法证明。

**基础情形：** 若 $a^1$ 是 $p$ 的倍数，则由于 $a^1 = a$，得出 $a$ 是 $p$ 的倍数。

**归纳步骤：** 设 $t$ 是自然数，并假设若 $a^t$ 是 $p$ 的倍数则 $a$ 也是。$(\star)$

现在假设 $a^{t+1}$ 是 $p$ 的倍数。由于 $a^{t+1} = a \cdot a^t$，这意味着 $a \cdot a^t$ 是 $p$ 的倍数。

因此，由欧几里得引理，要么 $a$ 是 $p$ 的倍数（此时已证毕），要么 $a^t$ 是 $p$ 的倍数（此时由归纳假设 $(\star)$ 已证毕）。

```lean
theorem euclid_lemma_pow (a k p : ℕ) (hp : Prime p) (hk : 1 ≤ k) (H : p ∣ a ^ k) :
    p ∣ a := by
  induction_from_starting_point k, hk with t ht IH
  · have ha : a ^ 1 = a := by ring
    rw [ha] at H
    apply H
  have ha : a ^ (t + 1) = a * a ^ t := by ring
  rw [ha] at H
  have key : p ∣ a ∨ p ∣ a ^ t := euclid_lemma hp H
  obtain h1 | h2 := key
  · apply h1
  · apply IH
    apply h2
```

## 7.3. 根号 2

**定理**

不存在自然数 $a$、$b$ 满足 $b \ne 0$ 且 $a^2 = 2b^2$。

这又是一个可追溯至古希腊人的定理，这次是[毕达哥拉斯学派](https://en.wikipedia.org/wiki/Square_root_of_2)，约公元前 450 年。

这个定理几乎完成了“$\sqrt{2}$ 是无理数”的证明，即不是有理数（$\mathbb{Q}$）。我们在这里还不能得出这个结论，因为我们尚未精确定义有理数，但稍后会在本书中回到这一点。

**证明**

我们将证明一个逻辑等价的事实：对所有满足 $b \ne 0$ 的自然数 $a$、$b$，都有 $a^2 \ne 2b^2$。我们对 $b$ 用强归纳法证明。

设 $a$、$b$ 是自然数，并假设对所有满足 $s < b$ 且 $s \ne 0$ 的自然数 $r$、$s$，都有 $r^2 \ne 2s^2$。

假设 $a^2 = 2b^2$。则 $a^2$ 是偶数，所以由[6.1 节](06_Induction.md#61-归纳法)的一个练习，$a$ 是偶数。设 $k$ 是自然数使得 $a = 2k$。则

$$
\begin{split} 2 b^2 &= a^2 \\ &= (2k)^2 \\ &= 2(2k^2), \end{split}
$$

所以 $b^2 = 2k^2$。于是

$$
\begin{split} 0 &< b^2 \\ &= 2k^2 \\ &= k(2k), \end{split}
$$

所以 $k > 0$，即 $k \ne 0$。

因此我们对 $r = b$、$s = k$ 调用归纳假设。（注意

$$
\begin{split} k^2 &< k^2 + k^2 \\ &= 2k^2 \\ &= b^2, \end{split}
$$

所以 $k < b$，归纳是良基的。）归纳假设给出 $b^2 \ne 2k^2$，矛盾。所以不可能有 $a^2 = 2b^2$。

在 Lean 中，我们把这一论证拆成三部分。引理 `irrat_aux_wf` 是强归纳法良基性的依据。和[定义 6.7.1](06_Induction.md#671-定义)一样，我们用 `@[decreasing]` 标记这个良基性引理，以便后续强归纳法使用。

```lean
@[decreasing] theorem irrat_aux_wf (b k : ℕ) (hb : k ≠ 0) (hab : b ^ 2 = 2 * k ^ 2) :
    k < b := by
  have h :=
  calc k ^ 2 < k ^ 2 + k ^ 2 := by extra
    _ = 2 * k ^ 2 := by ring
    _ = b ^ 2 := by rw [hab]
  cancel 2 at h
```

引理 `irrat_aux` 是用强归纳法证明的结论，包含证明的核心论证。在 Lean 中，[6.1 节](06_Induction.md#61-归纳法)中本步使用的练习名为 `Nat.even_of_pow_even`。

```lean
theorem irrat_aux (a b : ℕ) (hb : b ≠ 0) : a ^ 2 ≠ 2 * b ^ 2 := by
  intro hab
  have H : Nat.Even a
  · apply Nat.even_of_pow_even (n := 2)
    use b ^ 2
    apply hab
  obtain ⟨k, hk⟩ := H
  have hbk :=
    calc 2 * b ^ 2 = a ^ 2 := by rw [hab]
      _ = (2 * k) ^ 2 := by rw [hk]
      _ = 2 * (2 * k ^ 2) := by ring
  cancel 2 at hbk
  have hk' :=
    calc 0 < b ^ 2 := by extra
      _ = 2 * k ^ 2 := by rw [hbk]
      _ = k * (2 * k) := by ring
  cancel 2 * k at hk'
  have hk'' : k ≠ 0 := ne_of_gt hk'
  have IH := irrat_aux b k -- inductive hypothesis
  have : b ^ 2 ≠ 2 * k ^ 2 := IH hk''
  contradiction
termination_by _ => b
```

最后，主定理与 `irrat_aux` 逻辑等价，其证明在于建立这一逻辑等价性。

```lean
example : ¬ ∃ a b : ℕ, b ≠ 0 ∧ a ^ 2 = 2 * b ^ 2 := by
  intro h
  obtain ⟨a, b, hb, hab⟩ := h
  have := irrat_aux a b hb
  contradiction
```

很有趣……我们再来一次！下面是同一个定理的另一种证明。或者，*几乎*同一个定理——这个证明对整数更友好。（把整数版本转换为自然数版本或反之，在技术上有些繁琐，但本质上不难，使用[7.2 节](#72-高斯引理与欧几里得引理)中的技巧即可。）

**定理**

不存在整数 $a$、$b$ 满足 $b \ne 0$ 且 $a^2 = 2b^2$。

**证明**

假设存在整数 $a$、$b$ 满足 $b \ne 0$ 且 $a^2 = 2b^2$。

令 $d = \operatorname{gcd}(a,b)$。由[例 6.7.3](06_Induction.md#673-例)，$d \mid a$ 且 $d \mid b$。设 $k$、$l$ 是整数使得 $a = dk$、$b = dl$。

又由[例 6.7.6](06_Induction.md#676-例)（贝祖恒等式），存在整数 $x$、$y$ 使得 $xa + yb = d$。

关键计算如下（$\dagger$）：

$$
\begin{split} (2ky + lx)^2 \cdot d^2 &= (2(dk)y + (dl)x)^2 \\ &= (2ay + bx)^2 \\ &= 2(xa + yb)^2 + (x^2 - 2y^2)(b^2 - 2a^2) \\ &= 2d^2 + (x^2 - 2y^2)(b^2 - b^2) \\ &= 2 \cdot d^2 \end{split}
$$

我们有 $d \ne 0$，因为否则

$$
\begin{split} b &= dl \\ &= 0 \cdot l \\ &= 0, \end{split}
$$

矛盾。因此由 $(\dagger)$，

$$
(2ky + lx)^2 = 2.
$$

但由[例 2.3.5](02_Proofs_with_Structure.md#235-例题)，没有整数的平方等于 2，所以这是不可能的。

注意上述关键计算中间使用了婆罗摩笈多恒等式（Brahmagupta’s identity，见[例 1.1.3](01_Proofs_by_Calculation.md#113-例题)）。

```lean
example : ¬ ∃ a b : ℤ, b ≠ 0 ∧ b ^ 2 = 2 * a ^ 2 := by
  intro h
  obtain ⟨a, b, hb, hab⟩ := h
  have Ha : gcd a b ∣ a := gcd_dvd_left a b
  have Hb : gcd a b ∣ b := gcd_dvd_right a b
  obtain ⟨k, hk⟩ := Ha
  obtain ⟨l, hl⟩ := Hb
  obtain ⟨x, y, h⟩ := bezout a b
  set d := gcd a b
  have key :=
  calc (2 * k * y + l * x) ^ 2 * d ^ 2
      = (2 * (d * k) * y + (d * l) * x) ^ 2 := by ring
    _ = (2 * a * y + b * x) ^ 2 := by rw [hk, hl]
    _ = 2 * (x * a + y * b) ^ 2 + (x ^ 2 - 2 * y ^ 2) * (b ^ 2 - 2 * a ^ 2) := by ring
    _ = 2 * d ^ 2 + (x ^ 2 - 2 * y ^ 2) * (b ^ 2 - b ^ 2) := by rw [h, hab]
    _ = 2 * d ^ 2 := by ring
  have hd : d ≠ 0
  · intro hd
    have :=
    calc b = d * l := hl
      _ = 0 * l := by rw [hd]
      _ = 0 := by ring
    contradiction
  cancel d ^ 2 at key
  have := sq_ne_two (2 * k * y + l * x)
  contradiction
```
