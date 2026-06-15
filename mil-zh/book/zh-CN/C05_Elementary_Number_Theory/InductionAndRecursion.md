# 归纳与递归

自然数集 ℕ = {0, 1, 2, …} 本身至关重要，也在构造新数学对象时居核心地位。Lean 的基础允许我们声明 **归纳类型**（inductive types）：由给定 **构造子**（constructors）列表归纳生成的类型。Lean 中自然数声明如下：

```lean
inductive Nat where
  | zero : Nat
  | succ (n : Nat) : Nat
```

在库中可写 `#check Nat` 再对 `Nat` 使用 `ctrl-click` 查看。该命令说明 `Nat` 由两个构造子 `zero : Nat` 与 `succ : Nat → Nat` 自由归纳生成。库引入记号 `ℕ` 与 `0` 分别表示 `Nat` 与 `zero`。（数字译为二进制表示，细节暂可略。）

对数学家而言，“自由”指 `Nat` 有元素 `zero` 与单射的后继函数 `succ`，其像不包含 `zero`：

```lean
example (n : Nat) : n.succ ≠ Nat.zero :=
  Nat.succ_ne_zero n

example (m n : Nat) (h : m.succ = n.succ) : m = n :=
  Nat.succ.inj h
```

“归纳”指自然数带有 **归纳原理**（principle of induction）与 **递归定义**（definition by recursion）。本节展示如何使用它们。

下面是阶乘函数的递归定义：

```lean
def fac : ℕ → ℕ
  | 0 => 1
  | n + 1 => (n + 1) * fac n
```

语法需适应：首行无 `:=`。后两行给出递归定义的基例与归纳步。这些等式按定义成立，也可手动将 `fac` 交给 `simp` 或 `rw`：

```lean
example : fac 0 = 1 :=
  rfl

example : fac 0 = 1 := by
  rw [fac]

example : fac 0 = 1 := by
  simp [fac]

example (n : ℕ) : fac (n + 1) = (n + 1) * fac n :=
  rfl

example (n : ℕ) : fac (n + 1) = (n + 1) * fac n := by
  rw [fac]

example (n : ℕ) : fac (n + 1) = (n + 1) * fac n := by
  simp [fac]
```

阶乘在 Mathlib 中已定义为 `Nat.factorial`。可 `#check Nat.factorial` 并 `ctrl-click` 跳转；示例中仍用 `fac`。`Nat.factorial` 定义前的 `@[simp]` 注解表示该定义等式会加入化简器默认恒等式库。

归纳原理：要证关于自然数的一般命题，只需证其对 0 成立，且若对 n 成立则对 n + 1 成立。下面证明中 `induction' n with n ih` 产生两个目标：第一证 `0 < fac 0`；第二在假设 `ih : 0 < fac n` 下证 `0 < fac (n + 1)`。`with n ih` 为归纳变量与归纳假设命名，名称可自定：

```lean
theorem fac_pos (n : ℕ) : 0 < fac n := by
  induction' n with n ih
  · rw [fac]
    exact zero_lt_one
  rw [fac]
  exact mul_pos n.succ_pos ih
```

`induction'` 会将依赖归纳变量的假设纳入归纳假设。请单步执行下一例以观察其行为：

```lean
theorem dvd_fac {i n : ℕ} (ipos : 0 < i) (ile : i ≤ n) : i ∣ fac n := by
  induction' n with n ih
  · exact absurd ipos (not_lt_of_ge ile)
  rw [fac]
  rcases Nat.of_le_succ ile with h | h
  · apply dvd_mul_of_dvd_right (ih h)
  rw [h]
  apply dvd_mul_right
```

下一例给出阶乘的粗下界。先分情形较易，使证明从 n = 1 情形开始。请用 `pow_succ` 或 `pow_succ'` 完成归纳部分：

```lean
theorem pow_two_le_fac (n : ℕ) : 2 ^ (n - 1) ≤ fac n := by
  rcases n with _ | n
  · simp [fac]
  sorry
```

## 有限和与积

归纳常用于证明涉及有限和与积的恒等式。Mathlib 定义 `Finset.sum s f`，其中 `s : Finset α` 为类型 `α` 的有限集，`f` 为 `α` 上函数；`f` 的值域须支持带零元的交换结合加法。导入 `Algebra.BigOperators.Ring` 并 `open BigOperators` 后，可用记号 `∑ x ∈ s, f x`；有限积有类似运算与记号。

`Finset` 类型及其运算将在下一节及后章讨论。此处只用 `Finset.range n`，即小于 n 的自然数有限集：

```lean
variable {α : Type*} (s : Finset ℕ) (f : ℕ → ℕ) (n : ℕ)

#check Finset.sum s f
#check Finset.prod s f

open BigOperators
open Finset

example : s.sum f = ∑ x ∈ s, f x :=
  rfl

example : s.prod f = ∏ x ∈ s, f x :=
  rfl

example : (range n).sum f = ∑ x ∈ range n, f x :=
  rfl

example : (range n).prod f = ∏ x ∈ range n, f x :=
  rfl
```

`Finset.sum_range_zero` 与 `Finset.sum_range_succ` 给出求和到 n 的递归描述，积同理：

```lean
example (f : ℕ → ℕ) : ∑ x ∈ range 0, f x = 0 :=
  Finset.sum_range_zero f

example (f : ℕ → ℕ) (n : ℕ) : ∑ x ∈ range n.succ, f x = ∑ x ∈ range n, f x + f n :=
  Finset.sum_range_succ f n

example (f : ℕ → ℕ) : ∏ x ∈ range 0, f x = 1 :=
  Finset.prod_range_zero f

example (f : ℕ → ℕ) (n : ℕ) : ∏ x ∈ range n.succ, f x = (∏ x ∈ range n, f x) * f n :=
  Finset.prod_range_succ f n
```

每对中的第一个恒等式按定义成立，证明可换为 `rfl`。

下列将所定义阶乘表为乘积：

```lean
example (n : ℕ) : fac n = ∏ i ∈ range n, (i + 1) := by
  induction' n with n ih
  · simp [fac]
  simp [fac, ih, prod_range_succ, mul_comm]
```

将 `mul_comm` 作为化简规则值得说明： ordinarily `x * y = y * x` 会无限循环，但 Lean 化简器能识别并在结果项按某固定序更“小”时才应用。下一例表明用 `mul_assoc`、`mul_comm`、`mul_left_comm` 化简可识别仅括号与变量顺序不同的乘积：

```lean
example (a b c d e f : ℕ) : a * (b * c * f * (d * e)) = d * (a * f * e) * (c * b) := by
  simp [mul_comm, mul_left_comm]
```

大致做法是把括号推向右侧，再重排两侧直至同一规范序。配合加法的对应规则，这是实用技巧。

回到求和恒等式：建议单步执行下列证明——自然数 0 到 n（含 n）之和为 n(n + 1)/2。第一步消去分母；形式化恒等式时这通常有用，因除法计算常有副作用。（自然数上类似地宜尽量避免减法。）

```lean
theorem sum_id (n : ℕ) : ∑ i ∈ range (n + 1), i = n * (n + 1) / 2 := by
  symm; apply Nat.div_eq_of_eq_mul_right (by norm_num : 0 < 2)
  induction' n with n ih
  · simp
  rw [Finset.sum_range_succ, mul_add 2, ← ih]
  ring
```

鼓励你证明平方和等类似恒等式，或网上查到的其他恒等式：

```lean
theorem sum_sqr (n : ℕ) : ∑ i ∈ range (n + 1), i ^ 2 = n * (n + 1) * (2 * n + 1) / 6 := by
  sorry
```

## MyNat 练习

Lean 核心库中加法与乘法本身也由递归定义，基本性质靠归纳建立。若喜欢基础话题，可在下面自然数副本上证明乘、加交换结合律及乘法对加法的分配律。注意对 `MyNat` 可用 `induction` 策略；Lean 会使用相应归纳原理（与 `Nat` 相同）。

从加法交换律开始。经验法则：因加、乘在第二参数上递归定义，归纳宜针对该位置的变量。结合律证明中选哪个变量略需斟酌。

没有惯用 0、1、+、× 记号时易混淆；后文会学如何定义记号。在 `MyNat` 命名空间内可写 `zero`、`succ` 而非 `MyNat.zero`、`MyNat.succ`，且这些解释优先于其他同名。命名空间外，下面 `add` 的全名为 `MyNat.add`。

若特别喜欢这类练习，可定义截断减法、幂并证明其性质。截断减法在 0 处截断；可先定义前驱函数 `pred`：对非零数减 1，零保持为 0，用简单递归即可：

```lean
inductive MyNat where
  | zero : MyNat
  | succ : MyNat → MyNat

namespace MyNat

def add : MyNat → MyNat → MyNat
  | x, zero => x
  | x, succ y => succ (add x y)

def mul : MyNat → MyNat → MyNat
  | _, zero => zero
  | x, succ y => add (mul x y) x

theorem zero_add (n : MyNat) : add zero n = n := by
  induction' n with n ih
  · rfl
  rw [add, ih]

theorem succ_add (m n : MyNat) : add (succ m) n = succ (add m n) := by
  induction' n with n ih
  · rfl
  rw [add, ih]
  rfl

theorem add_comm (m n : MyNat) : add m n = add n m := by
  induction' n with n ih
  · rw [zero_add]
    rfl
  rw [add, succ_add, ih]

theorem add_assoc (m n k : MyNat) : add (add m n) k = add m (add n k) := by
  sorry

theorem mul_add (m n k : MyNat) : mul m (add n k) = add (mul m n) (mul m k) := by
  sorry

theorem zero_mul (n : MyNat) : mul zero n = zero := by
  sorry

theorem succ_mul (m n : MyNat) : mul (succ m) n = add (mul m n) n := by
  sorry

theorem mul_comm (m n : MyNat) : mul m n = mul n m := by
  sorry

end MyNat
```