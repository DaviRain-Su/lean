# 更多归纳

在[归纳与递归](InductionAndRecursion.md)中，我们已见如何用自然数递归定义阶乘：

```lean
def fac : ℕ → ℕ
  | 0 => 1
  | n + 1 => (n + 1) * fac n
```

也见过用 `induction'` 策略证明定理：

```lean
theorem fac_pos (n : ℕ) : 0 < fac n := by
  induction' n with n ih
  · rw [fac]
    exact zero_lt_one
  rw [fac]
  exact mul_pos n.succ_pos ih
```

`induction` 策略（无撇号）提供更结构化的语法：

```lean
example (n : ℕ) : 0 < fac n := by
  induction n
  case zero =>
    rw [fac]
    exact zero_lt_one
  case succ n ih =>
    rw [fac]
    exact mul_pos n.succ_pos ih

example (n : ℕ) : 0 < fac n := by
  induction n with
  | zero =>
    rw [fac]
    exact zero_lt_one
  | succ n ih =>
    rw [fac]
    exact mul_pos n.succ_pos ih
```

可对 `induction` 悬停阅读文档。情形名 `zero`、`succ` 取自 `ℕ` 的定义。`succ` 情形可为归纳变量与归纳假设自由命名（此处 `n`、`ih`）。甚至可用与递归函数定义相同的记号证明定理：

```lean
theorem fac_pos' : ∀ n, 0 < fac n
  | 0 => by
    rw [fac]
    exact zero_lt_one
  | n + 1 => by
    rw [fac]
    exact mul_pos n.succ_pos (fac_pos' n)
```

注意无 `:=`、冒号后的 `∀ n`、各情形中的 `by`，以及归纳步中对 `fac_pos' n` 的递归调用——定理仿佛 n 的递归函数，归纳步即递归调用。

这种定义风格非常灵活。Lean 为递归函数与归纳证明内置了丰富机制。例如可用多个基例定义 Fibonacci 函数：

```lean
@[simp] def fib : ℕ → ℕ
  | 0 => 0
  | 1 => 1
  | n + 2 => fib n + fib (n + 1)
```

`@[simp]` 表示化简器使用这些定义等式；也可 `rw [fib]`。下面为 `n + 2` 情形命名：

```lean
theorem fib_add_two (n : ℕ) : fib (n + 2) = fib n + fib (n + 1) := rfl

example (n : ℕ) : fib (n + 2) = fib n + fib (n + 1) := by rw [fib]
```

用 Lean 的递归函数记号，可对自然数做与 `fib` 定义镜像的归纳证明。下一例给出第 n 个 Fibonacci 数用黄金比 φ 及其共轭 φ' 的显式公式。实数上的算术不可计算，故需告诉 Lean 不期望这些定义生成可执行代码。

将用 `grind` 策略做计算，并令其使用 `phi`、`phi'` 的定义及归纳假设 `fib_eq n`、`fib_eq (n+1)`：

```lean
noncomputable section

def phi  : ℝ := (1 + √5) / 2
def phi' : ℝ := (1 - √5) / 2

theorem fib_eq : ∀ n, fib n = (phi^n - phi'^n) / √5
  | 0   => by simp
  | 1   => by unfold fib; grind [phi, phi']
  | n+2 => by unfold fib; simp [fib_eq n, fib_eq (n+1), phi, phi']; grind

end
```

涉及 Fibonacci 的归纳证明不必都呈此形。下面复现 Mathlib 中相邻 Fibonacci 数互素的证明：

```lean
theorem fib_coprime_fib_succ (n : ℕ) : Nat.Coprime (fib n) (fib (n + 1)) := by
  induction n with
  | zero => simp
  | succ n ih =>
    simp only [fib, Nat.coprime_add_self_right]
    exact ih.symm
```

借助 Lean 的计算解释，可求 Fibonacci 数值：

```lean
#eval fib 6
#eval List.range 20 |>.map fib
```

`fib` 的直接实现计算效率低，运行时间对其参数呈指数级。（可自行思考原因。）Lean 中可实现下列 **尾递归**（tail-recursive）版本，运行时间与 n 线性，并证明其与原函数相同：

```lean
def fib' (n : Nat) : Nat :=
  aux n 0 1
where aux
  | 0,   x, _ => x
  | n+1, x, y => aux n y (x + y)

theorem fib'.aux_eq (m n : ℕ) : fib'.aux n (fib m) (fib (m + 1)) = fib (n + m) := by
  induction n generalizing m with
  | zero => simp [fib'.aux]
  | succ n ih => rw [fib'.aux, ←fib_add_two, ih, add_assoc, add_comm 1]

theorem fib'_eq_fib : fib' = fib := by
  ext n
  erw [fib', fib'.aux_eq 0 n]; rfl

#eval fib' 10000
```

注意 `fib'.aux_eq` 证明中的 `generalizing` 关键字：它在归纳假设前插入 `∀ m`，使归纳步中 m 可取不同值。单步执行可见，此情形下归纳步需将 m 实例化为 m + 1。

注意用 `erw`（extended rewrite）而非 `rw`：重写目标 `fib'.aux_eq` 时须将 `fib 0`、`fib 1` 化为 0、1。`erw` 比 `rw` 更积极地在匹配参数时展开定义；并非总有益，某些情形会浪费大量时间，宜 sparingly 使用。

下面是 `generalizing` 的另一用例，证明 Mathlib 中的另一恒等式。非形式证明见 [ProofWiki](https://proofwiki.org/wiki/Fibonacci_Number_in_terms_of_Smaller_Fibonacci_Numbers)。我们给出两种形式化变体：

```lean
theorem fib_add (m n : ℕ) : fib (m + n + 1) = fib m * fib n + fib (m + 1) * fib (n + 1) := by
  induction n generalizing m with
  | zero => simp
  | succ n ih =>
    specialize ih (m + 1)
    rw [add_assoc m 1 n, add_comm 1 n] at ih
    simp only [fib_add_two, ih]
    ring

theorem fib_add' : ∀ m n, fib (m + n + 1) = fib m * fib n + fib (m + 1) * fib (n + 1)
  | _, 0     => by simp
  | m, n + 1 => by
    have := fib_add' (m + 1) n
    rw [add_assoc m 1 n, add_comm 1 n] at this
    simp only [fib_add_two, this]
    ring
```

练习：用 `fib_add` 证明：

```lean
example (n : ℕ): (fib n) ^ 2 + (fib (n + 1)) ^ 2 = fib (2 * n + 1) := by
  sorry
```

Lean 的递归定义机制足够灵活，允许任意递归调用，只要参数按某 **良基**（well-founded）测度下降即可。下一例证明每个自然数 n ≠ 1 有素因子，依据：n 非零且非素数时有更小因子。（Mathlib 的 `Nat` 命名空间有同名定理，证明不同。）

```lean
#check (@Nat.not_prime_iff_exists_dvd_lt :
  ∀ {n : ℕ}, 2 ≤ n → (¬Nat.Prime n ↔ ∃ m, m ∣ n ∧ 2 ≤ m ∧ m < n))

theorem ne_one_iff_exists_prime_dvd : ∀ {n}, n ≠ 1 ↔ ∃ p : ℕ, p.Prime ∧ p ∣ n
  | 0 => by simpa using Exists.intro 2 Nat.prime_two
  | 1 => by simp [Nat.not_prime_one]
  | n + 2 => by
    have hn : n + 2 ≠ 1 := by omega
    simp only [Ne, not_false_iff, true_iff, hn]
    by_cases h : Nat.Prime (n + 2)
    · use n + 2, h
    · have : 2 ≤ n + 2 := by omega
      rw [Nat.not_prime_iff_exists_dvd_lt this] at h
      rcases h with ⟨m, mdvdn, mge2, -⟩
      have : m ≠ 1 := by omega
      rw [ne_one_iff_exists_prime_dvd] at this
      rcases this with ⟨p, primep, pdvdm⟩
      use p, primep
      exact pdvdm.trans mdvdn
```

`rw [ne_one_iff_exists_prime_dvd] at this` 像魔术：在证明中使用了正在证明的定理本身。之所以能工作，是因为归纳调用在 m 上实例化，当前情形为 n + 2，且上下文有 m < n + 2。Lean 能找到假设并说明归纳良基。Lean 较擅长判断何者在下降；此例中定理陈述里的 n 与小于关系较显然。更复杂情形可显式提供信息，见 [Lean 参考手册中的良基递归](https://lean-lang.org/doc/reference/latest//Definitions/Recursive-Definitions/#well-founded-recursion)。

有时证明中只需按自然数 n 为零或后继分情形，后继情形不需要归纳假设。可用 `cases` 与 `rcases`：

```lean
theorem zero_lt_of_mul_eq_one (m n : ℕ) : n * m = 1 → 0 < n ∧ 0 < m := by
  cases n <;> cases m <;> simp

example (m n : ℕ) : n*m = 1 → 0 < n ∧ 0 < m := by
  rcases m with (_ | m); simp
  rcases n with (_ | n) <;> simp
```

这是实用技巧：关于自然数 n 的定理若零情形容易，对 n 分情形并快速处理零情形后，余下目标中 n 已换为 n + 1。