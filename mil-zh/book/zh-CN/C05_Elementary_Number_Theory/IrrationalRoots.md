# 无理根

我们从古希腊人已知的事实开始：√2 是无理数（irrational）。若假设相反，可将 √2 写成最简分数 a/b。两边平方得 a² = 2b²，故 a 为偶数。设 a = 2c，则 4c² = 2b²，即 b² = 2c²，故 b 也是偶数，与 a/b 已约分矛盾。

说 a/b 是最简分数，即 a 与 b 没有公因子，亦即它们 **互素**（coprime）。Mathlib 用谓词 `Nat.Coprime m n` 表示 `Nat.gcd m n = 1`。借助 Lean 的匿名投影记号，若 `s`、`t` 为 `Nat` 类型表达式，可写 `s.Coprime t` 代替 `Nat.Coprime s t`，`Nat.gcd` 同理。通常 Lean 会在需要时自动展开 `Nat.Coprime` 的定义，也可手动用标识符 `Nat.Coprime` 重写或化简。`norm_num` 策略能计算具体数值：

```lean
#print Nat.Coprime

example (m n : Nat) (h : m.Coprime n) : m.gcd n = 1 :=
  h

example (m n : Nat) (h : m.Coprime n) : m.gcd n = 1 := by
  rw [Nat.Coprime] at h
  exact h

example : Nat.Coprime 12 7 := by norm_num

example : Nat.gcd 12 8 = 4 := by norm_num
```

我们在[apply 和 rw 的更多例子](../C02_Basics/MoreOnOrderAndDivisibility.md)中已见过 `gcd` 函数。整数上也有 `gcd` 版本；下文会再讨论不同数系的关系。还有适用于一般代数结构的泛型 `gcd` 以及泛型的 `Prime`、`Coprime` 概念。下一章会说明 Lean 如何管理这种泛化；本节仍只关注自然数。

我们还需要 **素数**（prime number）概念 `Nat.Prime`。定理 `Nat.prime_def_lt` 给出一种常见刻画，`Nat.Prime.eq_one_or_self_of_dvd` 给出另一种：

```lean
#check Nat.prime_def_lt

example (p : ℕ) (prime_p : Nat.Prime p) : 2 ≤ p ∧ ∀ m : ℕ, m < p → m ∣ p → m = 1 := by
  rwa [Nat.prime_def_lt] at prime_p

#check Nat.Prime.eq_one_or_self_of_dvd

example (p : ℕ) (prime_p : Nat.Prime p) : ∀ m : ℕ, m ∣ p → m = 1 ∨ m = p :=
  prime_p.eq_one_or_self_of_dvd

example : Nat.Prime 17 := by norm_num

-- commonly used
example : Nat.Prime 2 :=
  Nat.prime_two

example : Nat.Prime 3 :=
  Nat.prime_three
```

在自然数中，素数不能写成非平凡因子的乘积。在更一般的数学语境里，满足此性质的环元素称为 **不可约**（irreducible）；若某元素整除一个乘积则必整除其中一个因子，则称为 **素元**（prime）。自然数上二者等价，由此得到定理 `Nat.Prime.dvd_mul`。

可用此事实建立上述论证的关键一步：若某数的平方为偶数，则该数本身为偶数。Mathlib 在 `Algebra.Group.Even` 中定义谓词 `Even`，但下文为清晰起见，直接用 `2 ∣ m` 表示 m 为偶数：

```lean
#check Nat.Prime.dvd_mul
#check Nat.Prime.dvd_mul Nat.prime_two
#check Nat.prime_two.dvd_mul

theorem even_of_even_sqr {m : ℕ} (h : 2 ∣ m ^ 2) : 2 ∣ m := by
  rw [pow_two, Nat.prime_two.dvd_mul] at h
  cases h <;> assumption

example {m : ℕ} (h : 2 ∣ m ^ 2) : 2 ∣ m :=
  Nat.Prime.dvd_of_dvd_pow Nat.prime_two h
```

继续学习时，需要熟练查找所需事实。若已导入相关库并能猜出名称前缀，可用 Tab 补全（有时需 `ctrl-tab`）。对任意标识符 `ctrl-click` 可跳转到定义处，便于浏览附近定义与定理。还可用 [Lean 社区网站](https://leanprover-community.github.io/) 的搜索引擎；实在不行可在 [Zulip](https://leanprover.zulipchat.com/) 提问：

```lean
example (a b c : Nat) (h : a * b = a * c) (h' : a ≠ 0) : b = c :=
  -- apply? suggests the following:
  (mul_right_inj' h').mp h
```

证明 √2 无理性的核心在下列定理中。请尝试补全证明草稿，使用 `even_of_even_sqr` 与定理 `Nat.dvd_gcd`：

```lean
example {m n : ℕ} (coprime_mn : m.Coprime n) : m ^ 2 ≠ 2 * n ^ 2 := by
  intro sqr_eq
  have : 2 ∣ m := by
    sorry
  obtain ⟨k, meq⟩ := dvd_iff_exists_eq_mul_left.mp this
  have : 2 * (2 * k ^ 2) = 2 * n ^ 2 := by
    rw [← sqr_eq, meq]
    ring
  have : 2 * k ^ 2 = n ^ 2 :=
    sorry
  have : 2 ∣ n := by
    sorry
  have : 2 ∣ m.gcd n := by
    sorry
  have : 2 ∣ 1 := by
    sorry
  norm_num at this
```

稍加修改，可将 `2` 换为任意素数。下一例请自行完成；末尾需从 `p ∣ 1` 导出矛盾，可用 `Nat.Prime.two_le`（任意素数 ≥ 2）与 `Nat.le_of_dvd`：

```lean
example {m n p : ℕ} (coprime_mn : m.Coprime n) (prime_p : p.Prime) : m ^ 2 ≠ p * n ^ 2 := by
  sorry
```

## 因子分解方法

另有一种思路：若 p 为素数，则 m² ≠ p n²。假设 m² = p n²，将 m、n 作素因子分解，则 p 在等式左边出现偶数次、右边奇数次，矛盾。该论证要求 n（从而 m）非零；下面形式化确认此假设足够。

唯一分解定理：除零外，每个自然数可唯一地写成素数乘积。Mathlib 用函数 `Nat.primeFactorsList` 形式化，返回非降序的素因子列表。库证明列表中元素均为素数、n > 0 时 n 等于其因子之积，且若 n 等于另一素数列表之积，则该列表是 `Nat.primeFactorsList n` 的置换：

```lean
#check Nat.primeFactorsList
#check Nat.prime_of_mem_primeFactorsList
#check Nat.prod_primeFactorsList
#check Nat.primeFactorsList_unique
```

可浏览这些定理及附近内容，尽管尚未讨论列表成员、乘积或置换。本节任务不需要那些。我们将用 `Nat.factorization`：与上述数据同构的函数表示。`Nat.factorization n p`（亦可写 `n.factorization p`）返回 p 在 n 的素因子分解中的 **重数**（multiplicity）。下面三个事实将用到：

```lean
theorem factorization_mul' {m n : ℕ} (mnez : m ≠ 0) (nnez : n ≠ 0) (p : ℕ) :
    (m * n).factorization p = m.factorization p + n.factorization p := by
  rw [Nat.factorization_mul mnez nnez]
  rfl

theorem factorization_pow' (n k p : ℕ) :
    (n ^ k).factorization p = k * n.factorization p := by
  rw [Nat.factorization_pow]
  rfl

theorem Nat.Prime.factorization' {p : ℕ} (prime_p : p.Prime) :
    p.factorization p = 1 := by
  rw [prime_p.factorization]
  simp
```

实际上 `n.factorization` 在 Lean 中定义为有限支撑函数，故证明中会出现特殊记号；暂不必深究，本节可将上述三定理当作黑箱。

下一例表明化简器能将 `n^2 ≠ 0` 化为 `n ≠ 0`。`simpa` 即先 `simp` 再 `assumption`。请用上述恒等式补全证明：

```lean
example {m n p : ℕ} (nnz : n ≠ 0) (prime_p : p.Prime) : m ^ 2 ≠ p * n ^ 2 := by
  intro sqr_eq
  have nsqr_nez : n ^ 2 ≠ 0 := by simpa
  have eq1 : Nat.factorization (m ^ 2) p = 2 * m.factorization p := by
    sorry
  have eq2 : (p * n ^ 2).factorization p = 2 * n.factorization p + 1 := by
    sorry
  have : 2 * m.factorization p % 2 = (2 * n.factorization p + 1) % 2 := by
    rw [← eq1, sqr_eq, eq2]
  rw [add_comm, Nat.add_mul_mod_self_left, Nat.mul_mod_right] at this
  norm_num at this
```

此证明的优点是易推广：2 并无特殊之处；稍作修改即可说明，对 m^k = r · n^k，r 中任意素数 p 的重数必是 k 的倍数。

对 r · n^k 使用 `Nat.count_factors_mul_of_pos` 需 r 为正。r = 0 时下列定理平凡，化简器易证，故分情形证明。`rcases r with _ | r` 将目标分为 r 为 0 与 r 为 r + 1 两版；第二版可用 `r.succ_ne_zero` 得 r + 1 ≠ 0。

注意 `have : npow_nz` 一行用短证明项证 n^k ≠ 0。可换为策略证明，再思考策略如何描述该证明项。请补全下面证明；末尾可用 `Nat.dvd_sub` 与 `Nat.dvd_mul_right` 收尾。本例不假设 p 为素数；p 非素数时结论平凡（`r.factorization p` 按定义为 0），证明仍成立：

```lean
example {m n k r : ℕ} (nnz : n ≠ 0) (pow_eq : m ^ k = r * n ^ k) {p : ℕ} :
    k ∣ r.factorization p := by
  sorry
```

## 展望

这些结果尚有多种改进方向。证明 √2 无理应谈及实数或复数中的 √2，并说明无有理数等于它；还应把本节定理推广到整数——数学上显然，若 √2 可表为两整数之商则可表为两自然数之商，但形式化需一定工作量。

Mathlib 中自然数、整数、有理数、实数、复数由不同数据类型表示。分域处理常有帮助：自然数上归纳方便，不涉及实数时讨论整除更简单；但要在各域之间衔接则较繁琐，本章后文会再遇，本节末尾也会提及。

还应期望将最后定理的结论加强为 r 本身是 k 次幂——因其 k 次根恰为 r 的各素因子按重数除以 k 后取幂再相乘。为此需要更好的有限集上积与和推理，后文也会回到。

本节结果在 Mathlib 的 `Data.Real.Irrational` 中有更一般版本；**重数** 对任意交换幺半群定义，取值于扩展自然数 `enat`（在自然数上加无穷）。下一章将开始理解 Lean 如何支持这种泛化：

```lean
#check multiplicity
```

```lean
#check Rat.num
#check Rat.den

section
variable (r : ℚ)

#check r.num
#check r.den
#check r.pos
#check r.reduced

end
```