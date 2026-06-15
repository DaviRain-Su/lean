# 序列与收敛

我们已有足够工具做真正的数学。Lean 中将实数列 \(s_0, s_1, s_2, \ldots\) 表示为函数 `s : ℕ → ℝ`。若对每个 \(\varepsilon > 0\)，存在 \(N\) 使得对所有 \(n \ge N\) 有 \(|s_n - a| < \varepsilon\)，则称该序列**收敛**（converge）于 \(a\)：

```lean
def ConvergesTo (s : ℕ → ℝ) (a : ℝ) :=
  ∀ ε > 0, ∃ N, ∀ n ≥ N, |s n - a| < ε
```

记法 `∀ ε > 0, ...` 是 `∀ ε, ε > 0 → ...` 的便捷缩写；`∀ n ≥ N, ...` 同理。且 `ε > 0` 定义为 `0 < ε`，`n ≥ N` 定义为 `N ≤ n`。

本节建立收敛的一些性质。先讨论三个处理等式的有用策略。

**`ext`**（extensionality）用于证明两函数相等。设 \(f(x) = x+1\)、\(g(x) = 1+x\)，则 \(f = g\)，因对所有 \(x\) 返回值相同。`ext` 通过证明各参数处值相等来证函数等式：

```lean
example : (fun x y : ℝ ↦ (x + y) ^ 2) = fun x y : ℝ ↦ x ^ 2 + 2 * x * y + y ^ 2 := by
  ext
  ring
```

`ext` 其实更一般，也可指定变量名（如将 `ext` 换为 `ext u v` 试上一证明）。

**`congr`** 通过协调不同的部分来证明两表达式相等：

```lean
example (a b : ℝ) : |a| = |a - b + b| := by
  congr
  ring
```

`congr` 剥去两侧的 `abs`，留下证 `a = a - b + b`。

**`convert`** 在定理结论与目标不完全匹配时仍应用定理。欲从 `1 < a` 证 `a < a * a`，库中 `mul_lt_mul_iff_left₀` 可证 `1 * a < a * a`；`convert` 按原样应用定理，留下使目标匹配的等式子目标：

```lean
example {a : ℝ} (h : 1 < a) : a < a * a := by
  convert (mul_lt_mul_iff_left₀ _).2 h
  · rw [one_mul]
  exact lt_trans zero_lt_one h
```

对带下划线的表达式，Lean 无法自动填充时会留作新目标。

常数列 \(a, a, a, \ldots\) 收敛于 \(a\)：

```lean
theorem convergesTo_const (a : ℝ) : ConvergesTo (fun _x : ℕ ↦ a) a := by
  intro ε εpos
  use 0
  intro n nge
  rw [sub_self, abs_zero]
  apply εpos
```

Lean 的 **`simp`** 策略常可省去手写 `rw [sub_self, abs_zero]` 等步骤。

更有趣的定理：若 `s` 收敛于 `a`、`t` 收敛于 `b`，则 `fun n ↦ s n + t n` 收敛于 `a + b`。形式化前宜先有清晰的纸笔证明：给定 \(\varepsilon > 0\)，由假设得 \(N_s\) 使此后 `s` 在 \(\varepsilon/2\) 内接近 `a`，\(N_t\) 使此后 `t` 在 \(\varepsilon/2\) 内接近 `b`；当 \(n \ge \max(N_s, N_t)\) 时，和序列应在 \(\varepsilon\) 内接近 \(a+b\)。试完成下列证明开头：

```lean
theorem convergesTo_add {s t : ℕ → ℝ} {a b : ℝ}
      (cs : ConvergesTo s a) (ct : ConvergesTo t b) :
    ConvergesTo (fun n ↦ s n + t n) (a + b) := by
  intro ε εpos
  dsimp
  have ε2pos : 0 < ε / 2 := by linarith
  rcases cs (ε / 2) ε2pos with ⟨Ns, hs⟩
  rcases ct (ε / 2) ε2pos with ⟨Nt, ht⟩
  use max Ns Nt
  sorry
```

提示：`le_of_max_le_left`、`le_of_max_le_right`；`norm_num` 可证 `ε / 2 + ε / 2 = ε`；用 `congr` 将 `|s n + t n - (a + b)|` 化为 `|(s n - a) + (t n - b)|` 以便用三角不等式。变量 `s`、`t`、`a`、`b` 标为隐式，因可从假设推断。

乘法情形更棘手。先证：若 `s` 收敛于 `a`，则 `fun n ↦ c * s n` 收敛于 `c * a`；按 `c = 0` 与否分情形（零情形已处理，请完成 `c ≠ 0`）：

```lean
theorem convergesTo_mul_const {s : ℕ → ℝ} {a : ℝ} (c : ℝ) (cs : ConvergesTo s a) :
    ConvergesTo (fun n ↦ c * s n) (c * a) := by
  by_cases h : c = 0
  · convert convergesTo_const 0
    · rw [h]
      ring
    rw [h]
    ring
  have acpos : 0 < |c| := abs_pos.mpr h
  sorry
```

下一定理：收敛序列在绝对值意义下**最终有界**（eventually bounded）：

```lean
theorem exists_abs_le_of_convergesTo {s : ℕ → ℝ} {a : ℝ} (cs : ConvergesTo s a) :
    ∃ N b, ∀ n, N ≤ n → |s n| < b := by
  rcases cs 1 zero_lt_one with ⟨N, h⟩
  use N, |a| + 1
  sorry
```

该定理可加强为对所有 `n` 有界；当前版本对本节目的已足够，且可更一般地成立。

辅助引理：若 `s` 收敛于 `a`、`t` 收敛于 `0`，则 `fun n ↦ s n * t n` 收敛于 `0`。用上一定理得超越某点 \(N_0\) 的界 \(B\)，试理解策略并完成：

```lean
theorem aux {s t : ℕ → ℝ} {a : ℝ} (cs : ConvergesTo s a) (ct : ConvergesTo t 0) :
    ConvergesTo (fun n ↦ s n * t n) 0 := by
  intro ε εpos
  dsimp
  rcases exists_abs_le_of_convergesTo cs with ⟨N₀, B, h₀⟩
  have Bpos : 0 < B := lt_of_le_of_lt (abs_nonneg _) (h₀ N₀ (le_refl _))
  have pos₀ : ε / B > 0 := div_pos εpos Bpos
  rcases ct _ pos₀ with ⟨N₁, h₁⟩
  sorry
```

由此可得乘积收敛：

```lean
theorem convergesTo_mul {s t : ℕ → ℝ} {a b : ℝ}
      (cs : ConvergesTo s a) (ct : ConvergesTo t b) :
    ConvergesTo (fun n ↦ s n * t n) (a * b) := by
  have h₁ : ConvergesTo (fun n ↦ s n * (t n + -b)) 0 := by
    apply aux cs
    convert convergesTo_add ct (convergesTo_const (-b))
    ring
  have := convergesTo_add h₁ (convergesTo_mul_const b cs)
  convert convergesTo_add h₁ (convergesTo_mul_const b cs) using 1
  · ext; ring
  ring
```

挑战练习：极限唯一性（可删去证明骨架从头证）：

```lean
theorem convergesTo_unique {s : ℕ → ℝ} {a b : ℝ}
      (sa : ConvergesTo s a) (sb : ConvergesTo s b) :
    a = b := by
  by_contra abne
  have : |a - b| > 0 := by sorry
  let ε := |a - b| / 2
  have εpos : ε > 0 := by
    change |a - b| / 2 > 0
    linarith
  rcases sa ε εpos with ⟨Na, hNa⟩
  rcases sb ε εpos with ⟨Nb, hNb⟩
  let N := max Na Nb
  have absa : |s N - a| < ε := by sorry
  have absb : |s N - b| < ε := by sorry
  have : |a - b| < |a - b| := by sorry
  exact lt_irrefl _ this
```

证明可推广：我们只用自然数带有 `min`、`max` 的偏序结构。将处处 `ℕ` 换为任意线性序 `α` 仍成立：

```lean
section
variable {α : Type*} [LinearOrder α]

def ConvergesTo' (s : α → ℝ) (a : ℝ) :=
  ∀ ε > 0, ∃ N, ∀ n ≥ N, |s n - a| < ε

end
```

第 11 章（滤子）将看到 Mathlib 以远更一般的方式处理收敛，不仅对定义域、值域抽象，也对收敛类型本身抽象。