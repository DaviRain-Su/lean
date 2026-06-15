# 无穷多素数

我们继续用归纳与递归探索另一数学经典：素数有无穷多个。一种表述是：对每个自然数 n，存在大于 n 的素数。证明：令 p 为 n! + 1 的任一素因子。若 p ≤ n，则 p 整除 n!；又整除 n! + 1，故整除 1，矛盾。故 p > n。

要形式化该证明，需说明每个 ≥ 2 的数有素因子，进而需证：每个不等于 0 或 1 的自然数 ≥ 2。形式化中这类“显然”陈述往往最烦人；下面试几种做法。

可用 `cases` 策略与后继函数保持自然数序的事实：

```lean
theorem two_le {m : ℕ} (h0 : m ≠ 0) (h1 : m ≠ 1) : 2 ≤ m := by
  cases m; contradiction
  case succ m =>
    cases m; contradiction
    repeat apply Nat.succ_le_succ
    apply zero_le
```

另一策略是 `interval_cases`：当问题变量落在自然数或整数区间内时，自动分情形。可悬停查看文档：

```lean
example {m : ℕ} (h0 : m ≠ 0) (h1 : m ≠ 1) : 2 ≤ m := by
  by_contra h
  push_neg at h
  interval_cases m <;> contradiction
```

`interval_cases m` 后的分号表示下一策略应用于其生成的每一情形。还可使用 `decide` 策略寻找判定过程。Lean 知道形如 `∀ x, x < n → …` 或 `∃ x, x < n ∧ …` 的 **有界量词**（bounded quantifier）语句，可对有限多实例逐一判定：

```lean
example {m : ℕ} (h0 : m ≠ 0) (h1 : m ≠ 1) : 2 ≤ m := by
  by_contra h
  push_neg at h
  revert h0 h1
  revert h m
  decide
```

有了 `two_le`，先证每个大于 2 的自然数有素因子。Mathlib 有 `Nat.minFac` 返回最小素因子；为学习库的其他部分，我们不用它而直接证明。

普通归纳不够，要用 **强归纳**（strong induction）：对每个 n，若 P 对所有小于 n 的值成立，则 P(n) 成立，从而每个自然数 n 满足 P。Lean 中该原理为 `Nat.strong_induction_on`；用 `using` 告诉归纳策略使用它。此时无单独基例，已并入一般归纳步。

论证如下：设 n ≥ 2。若 n 为素数，结束。否则由素数刻画，n 有非平凡因子 m，对 m 用归纳假设。请单步执行下一证明：

```lean
theorem exists_prime_factor {n : Nat} (h : 2 ≤ n) : ∃ p : Nat, p.Prime ∧ p ∣ n := by
  by_cases np : n.Prime
  · use n, np
  induction' n using Nat.strong_induction_on with n ih
  rw [Nat.prime_def_lt] at np
  push_neg at np
  rcases np h with ⟨m, mltn, mdvdn, mne1⟩
  have : m ≠ 0 := by
    intro mz
    rw [mz, zero_dvd_iff] at mdvdn
    linarith
  have mgt2 : 2 ≤ m := two_le this mne1
  by_cases mp : m.Prime
  · use m, mp
  · rcases ih m mltn mgt2 mp with ⟨p, pp, pdvd⟩
    use p, pp
    apply pdvd.trans mdvdn
```

现可证明定理的下列表述。请补全草稿，可用 `Nat.factorial_pos`、`Nat.dvd_factorial`、`Nat.dvd_sub'`：

```lean
theorem primes_infinite : ∀ n, ∃ p > n, Nat.Prime p := by
  intro n
  have : 2 ≤ Nat.factorial n + 1 := by
    sorry
  rcases exists_prime_factor this with ⟨p, pp, pdvd⟩
  refine ⟨p, ?_, pp⟩
  show p > n
  by_contra ple
  push_neg at ple
  have : p ∣ Nat.factorial n := by
    sorry
  have : p ∣ 1 := by
    sorry
  show False
  sorry
```

## 有限集表述

考虑上面证明的变体：不用阶乘，给定有限集 {p₁, …, pₙ}，考虑 ∏ᵢ pᵢ + 1 的素因子；该素因子必与每个 pᵢ 不同，故不存在包含全部素数的有限集。

形式化需讨论 **有限集**（finite sets）。Lean 中任意类型 `α` 的 `Finset α` 表示 `α` 的有限集。计算性推理 `α` 上需可判定相等，故下面片段假设 `[DecidableEq α]`。对 `ℕ`、`ℤ`、`ℚ` 等具体类型该假设自动满足；实数上可用经典逻辑并放弃计算解释。

`open Finset` 以使用较短定理名。与集合不同，多数关于 finsets 的等价不能按定义成立，需用 `Finset.subset_iff`、`Finset.mem_union`、`Finset.mem_inter`、`Finset.mem_sdiff` 等手动展开。`ext` 仍可证两有限集相等：逐元证明成员关系：

```lean
open Finset

section
variable {α : Type*} [DecidableEq α] (r s t : Finset α)

example : r ∩ (s ∪ t) ⊆ r ∩ s ∪ r ∩ t := by
  rw [subset_iff]
  intro x
  rw [mem_inter, mem_union, mem_union, mem_inter, mem_inter]
  tauto

example : r ∩ (s ∪ t) ⊆ r ∩ s ∪ r ∩ t := by
  simp [subset_iff]
  intro x
  tauto

example : r ∩ s ∪ r ∩ t ⊆ r ∩ (s ∪ t) := by
  simp [subset_iff]
  intro x
  tauto

example : r ∩ s ∪ r ∩ t = r ∩ (s ∪ t) := by
  ext x
  simp
  tauto

end
```

新技巧：`tauto`（及用经典逻辑的加强版 `tauto!`）可处理命题重言式。请用它们证明下面两例：

```lean
section
variable {α : Type*} [DecidableEq α] (r s t : Finset α)

example : (r ∪ s) ∩ (r ∪ t) = r ∪ s ∩ t := by
  sorry

example : (r \ s) \ t = r \ (s ∪ t) := by
  sorry

end
```

定理 `Finset.dvd_prod_of_mem`：若 n ∈ 有限集 s，则 n 整除 ∏ i ∈ s, i：

```lean
example (s : Finset ℕ) (n : ℕ) (h : n ∈ s) : n ∣ ∏ i ∈ s, i :=
  Finset.dvd_prod_of_mem _ h
```

还需知：n 为素数且 s 为素数集时，逆命题成立。下列引理可用 `Nat.Prime.eq_one_or_self_of_dvd` 证明：

```lean
theorem _root_.Nat.Prime.eq_of_dvd_of_prime {p q : ℕ}
      (prime_p : Nat.Prime p) (prime_q : Nat.Prime q) (h : p ∣ q) :
    p = q := by
  sorry
```

由此可证：素数 p 整除有限素数集之积，则 p 等于其中某一元。Mathlib 提供 **有限集归纳**（`Finset.induction_on`）：证性质对任意有限集 s 成立，先证对空集成立，再证向 s 加入新元 a ∉ s 时保持。告诉归纳策略使用时，可指定名称 a、s、假设 a ∉ s 的名称及归纳假设名。`Finset.insert a s` 表示 s 与单点 {a} 的并；`Finset.prod_empty`、`Finset.prod_insert` 给出积的重写规则。下面证明中第一个 `simp` 应用 `Finset.prod_empty`。请单步开头并补全：

```lean
theorem mem_of_dvd_prod_primes {s : Finset ℕ} {p : ℕ} (prime_p : p.Prime) :
    (∀ n ∈ s, Nat.Prime n) → (p ∣ ∏ n ∈ s, n) → p ∈ s := by
  sorry
```

还需有限集的一个性质：对 `s : Set α` 与谓词 P，[第 4 章集合](../C04_Sets_and_Functions/Sets.md) 中写 `{ x ∈ s | P x }` 表示 s 中满足 P 的元素集。对 `s : Finset α`，类似概念为 `s.filter P`：

```lean
example (s : Finset ℕ) (x : ℕ) : x ∈ s.filter Nat.Prime ↔ x ∈ s ∧ x.Prime :=
  mem_filter
```

现证明“无穷多素数”的另一种表述：对任意 `s : Finset ℕ`，存在素数 p 且 p ∉ s。反设所有素数都在 s 中，缩为 s' 恰含（且仅含）素数；取其积加 1 再取素因子，即得所需矛盾。第一个 `have` 的证明可用 `Finset.prod_pos`：

```lean
theorem primes_infinite' : ∀ s : Finset Nat, ∃ p, Nat.Prime p ∧ p ∉ s := by
  sorry
```

于是我们见到两种说法：素数不被任何 n 有界；素数不被任何有限集 s 包含。下面两证明说明二者等价。第二个为形成 `s.filter Q` 需可判定 Q；Lean 知 `Nat.Prime` 可判定。一般地 `open Classical` 后可去掉该假设。

Mathlib 中 `Finset.sup s f` 表示 f x 在 s 上取 **上确界**（supremum），s 为空且 f 值域为 `ℕ` 时返回 0。第一证明用 `s.sup id`（id 为恒等函数）指 s 中最大值：

```lean
theorem bounded_of_ex_finset (Q : ℕ → Prop) :
    (∃ s : Finset ℕ, ∀ k, Q k → k ∈ s) → ∃ n, ∀ k, Q k → k < n := by
  rintro ⟨s, hs⟩
  use s.sup id + 1
  intro k Qk
  apply Nat.lt_succ_of_le
  show id k ≤ s.sup id
  apply le_sup (hs k Qk)

theorem ex_finset_of_bounded (Q : ℕ → Prop) [DecidablePred Q] :
    (∃ n, ∀ k, Q k → k ≤ n) → ∃ s : Finset ℕ, ∀ k, Q k ↔ k ∈ s := by
  rintro ⟨n, hn⟩
  use (range (n + 1)).filter Q
  intro k
  simpa using hn k
```

## 模 4 同余的无穷多素数

对上述第二证明略作变体，可证存在无穷多 **模 4 余 3**（congruent to 3 modulo 4）的素数。论证概要：若 m·n ≡ 3 (mod 4)，则 m、n 中必有一个 ≡ 3 (mod 4)——二者皆奇，若皆 ≡ 1 (mod 4) 则积 ≡ 1 (mod 4)。由此可证：大于 2 且 ≡ 3 (mod 4) 的数有同样性质的素因子。

设模 4 余 3 的素数只有有限个 p₁, …, pₖ，不妨 p₁ = 3。考虑 4·∏ᵢ₌₂ᵏ pᵢ + 3，易见 ≡ 3 (mod 4)，故有素因子 p ≡ 3 (mod 4)。p 不能为 3：p 整除 4·∏ᵢ₌₂ᵏ pᵢ + 3，若 p = 3 则也整除 ∏ᵢ₌₂ᵏ pᵢ，故 p 等于某个 pᵢ（i = 2,…,k），而 3 已从列表排除。故 p 为其他 pᵢ 之一，于是 p 整除 4·∏ᵢ₌₂ᵏ pᵢ 从而整除 3，与 p ≠ 3 矛盾。

Lean 中 `n % m`（读作 n modulo m）为 n 除以 m 的余数：

```lean
example : 27 % 4 = 3 := by norm_num
```

“n ≡ 3 (mod 4)” 表为 `n % 4 = 3`。下列例子与定理汇总下文所需事实；第一个命名定理又是少量分情形推理的示例。第二个中，分号表示后续策略块应用于前一策略创建的所有目标：

```lean
example (n : ℕ) : (4 * n + 3) % 4 = 3 := by
  rw [add_comm, Nat.add_mul_mod_self_left]

theorem mod_4_eq_3_or_mod_4_eq_3 {m n : ℕ} (h : m * n % 4 = 3) : m % 4 = 3 ∨ n % 4 = 3 := by
  revert h
  rw [Nat.mul_mod]
  have : m % 4 < 4 := Nat.mod_lt m (by norm_num)
  interval_cases m % 4 <;> simp [-Nat.mul_mod_mod]
  have : n % 4 < 4 := Nat.mod_lt n (by norm_num)
  interval_cases n % 4 <;> simp

theorem two_le_of_mod_4_eq_3 {n : ℕ} (h : n % 4 = 3) : 2 ≤ n := by
  apply two_le <;>
    · intro neq
      rw [neq] at h
      norm_num at h
```

还需：若 m 为 n 的非平凡因子，则 n/m 也是。请用 `Nat.div_dvd_of_dvd` 与 `Nat.div_lt_self` 完成：

```lean
theorem aux {m n : ℕ} (h₀ : m ∣ n) (h₁ : 2 ≤ m) (h₂ : m < n) : n / m ∣ n ∧ n / m < n := by
  sorry
```

综合以上，证任意 ≡ 3 (mod 4) 的数有同样性质的素因子：

```lean
theorem exists_prime_factor_mod_4_eq_3 {n : Nat} (h : n % 4 = 3) :
    ∃ p : Nat, p.Prime ∧ p ∣ n ∧ p % 4 = 3 := by
  sorry
```

给定素数有限集 s，若含 3 则需从中删去 3；`Finset.erase` 处理此事：

```lean
example (m n : ℕ) (s : Finset ℕ) (h : m ∈ erase s n) : m ≠ n ∧ m ∈ s := by
  rwa [mem_erase] at h

example (m n : ℕ) (s : Finset ℕ) (h : m ∈ erase s n) : m ≠ n ∧ m ∈ s := by
  simp at h
  assumption
```

现证模 4 余 3 的素数无穷多。请补全下面缺失部分；解答中会用到 `Nat.dvd_add_iff_left` 与 `Nat.dvd_sub'`：

```lean
theorem primes_mod_4_eq_3_infinite : ∀ n, ∃ p > n, Nat.Prime p ∧ p % 4 = 3 := by
  sorry
```

若你完成了该证明，恭喜——这是相当重的形式化工作。