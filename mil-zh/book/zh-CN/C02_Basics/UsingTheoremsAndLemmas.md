# 使用定理和引理

重写（rewriting）很适合证明等式，其他定理呢？例如如何在 \(b \le c\) 时证明 \(a + e^b \le a + e^c\)？我们已看到定理可应用于参数与假设，`apply` 与 `exact` 可解决目标。本节将充分运用这些工具。

考虑库定理 `le_refl` 与 `le_trans`：

```lean
#check (le_refl : ∀ a : ℝ, a ≤ a)
#check (le_trans : a ≤ b → b ≤ c → a ≤ c)
```

如第 3 章将详述，`le_trans` 的隐式括号右结合，应读作 `a ≤ b → (b ≤ c → a ≤ c)`。库设计者将 `a`、`b`、`c` 设为隐式，Lean 一般不允许显式提供（除非执意如此，稍后讨论），而期望从使用上下文推断。当上下文有 `h : a ≤ b` 与 `h' : b ≤ c` 时，下列均可：

```lean
section
variable (h : a ≤ b) (h' : b ≤ c)

#check (le_refl : ∀ a : Real, a ≤ a)
#check (le_refl a : a ≤ a)
#check (le_trans : a ≤ b → b ≤ c → a ≤ c)
#check (le_trans h : b ≤ c → a ≤ c)
#check (le_trans h h' : a ≤ c)

end
```

`apply` 接受一般陈述或蕴含的证明，尝试将结论与当前目标匹配，若有假设则留下为新目标。若给定证明与目标完全一致（模**定义相等**），可用 `exact` 代替 `apply`：

```lean
example (x y z : ℝ) (h₀ : x ≤ y) (h₁ : y ≤ z) : x ≤ z := by
  apply le_trans
  · apply h₀
  · apply h₁

example (x y z : ℝ) (h₀ : x ≤ y) (h₁ : y ≤ z) : x ≤ z := by
  apply le_trans h₀
  apply h₁

example (x y z : ℝ) (h₀ : x ≤ y) (h₁ : y ≤ z) : x ≤ z :=
  le_trans h₀ h₁

example (x : ℝ) : x ≤ x := by
  apply le_refl

example (x : ℝ) : x ≤ x :=
  le_refl x
```

第一例中 `apply le_trans` 产生两个目标，用点号标明各子证明起点。点号可选，但有助于**聚焦**目标：点号引入的块内只可见一个目标，须在该块结束前完成。第三、五例完全避免进入策略模式。

更多库定理：

```lean
#check (le_refl : ∀ a, a ≤ a)
#check (le_trans : a ≤ b → b ≤ c → a ≤ c)
#check (lt_of_le_of_lt : a ≤ b → b < c → a < c)
#check (lt_of_lt_of_le : a < b → b ≤ c → a < c)
#check (lt_trans : a < b → b < c → a < c)
```

用它们配合 `apply`、`exact` 证明：

```lean
example (h₀ : a ≤ b) (h₁ : b < c) (h₂ : c ≤ d) (h₃ : d < e) : a < e := by
  sorry
```

Lean 有自动处理这类情形的 `linarith` 策略，专为**线性算术**（linear arithmetic）设计：

```lean
example (h₀ : a ≤ b) (h₁ : b < c) (h₂ : c ≤ d) (h₃ : d < e) : a < e := by
  linarith
```

```lean
section

example (h : 2 * a ≤ 3 * b) (h' : 1 ≤ a) (h'' : d = 2) : d + a ≤ 5 * b := by
  linarith

end
```

除上下文中的等式与不等式外，`linarith` 还可使用你传入的额外不等式。下例中 `exp_le_exp.mpr h'` 是 `exp b ≤ exp c` 的证明。Lean 中写 `f x` 表示将函数 `f` 应用于 `x`，与将事实 `h` 应用于 `x` 写 `h x` 相同。仅复合参数需括号，否则 `f x + y` 解析为 `(f x) + y`。

```lean
example (h : 1 ≤ a) (h' : b ≤ c) : 2 + a + exp b ≤ 3 * a + exp c := by
  linarith [exp_le_exp.mpr h']
```

库中还有更多建立实数不等式的定理：

```lean
#check (exp_le_exp : exp a ≤ exp b ↔ a ≤ b)
#check (exp_lt_exp : exp a < exp b ↔ a < b)
#check (log_le_log : 0 < a → a ≤ b → log a ≤ log b)
#check (log_lt_log : 0 < a → a < b → log a < log b)
#check (add_le_add : a ≤ b → c ≤ d → a + c ≤ b + d)
#check (add_le_add_right : a ≤ b → ∀ c, c + a ≤ c + b)
#check (add_le_add_left : a ≤ b → ∀ c, a + c ≤ b + c)
#check (add_lt_add_of_le_of_lt : a ≤ b → c < d → a + c < b + d)
#check (add_lt_add_of_lt_of_le : a < b → c ≤ d → a + c < b + d)
#check (add_lt_add_right : a < b → ∀ c, c + a < c + b)
#check (add_lt_add_left : a < b → ∀ c, a + c < b + c)
#check (add_nonneg : 0 ≤ a → 0 ≤ b → 0 ≤ a + b)
#check (add_pos : 0 < a → 0 < b → 0 < a + b)
#check (add_pos_of_pos_of_nonneg : 0 < a → 0 ≤ b → 0 < a + b)
#check (exp_pos : ∀ a, 0 < exp a)
#check add_le_add_right
```

`exp_le_exp`、`exp_lt_exp` 使用**双向蕴含**（bi-implication，「当且仅若」），VS Code 可用 `\lr` 或 `\iff` 输入。可用 `rw` 将目标重写为等价形式：

```lean
example (h : a ≤ b) : exp a ≤ exp b := by
  rw [exp_le_exp]
  exact h
```

若 `h : A ↔ B`，则 `h.mp` 表正向 `A → B`，`h.mpr` 表反向 `B → A`（modus ponens / modus ponens reverse）。也可用 `h.1`、`h.2` 代替 `h.mp`、`h.mpr`：

```lean
example (h₀ : a ≤ b) (h₁ : c < d) : a + exp c + e < b + exp d + e := by
  apply add_lt_add_of_lt_of_le
  · apply add_lt_add_of_le_of_lt h₀
    apply exp_lt_exp.mpr h₁
  apply le_refl
```

试做下列例子；中间例展示 `norm_num` 可解决具体数值目标：

```lean
example (h₀ : d ≤ e) : c + exp (a + d) ≤ c + exp (a + e) := by sorry

example : (0 : ℝ) < 1 := by norm_num

example (h : a ≤ b) : log (1 + exp a) ≤ log (1 + exp b) := by
  have h₀ : 0 < 1 + exp a := by sorry
  apply log_le_log h₀
  sorry
```

形式化中，**找到所需库定理**是重要技能。可用策略包括：

- 浏览 Mathlib [GitHub 仓库](https://github.com/leanprover-community/mathlib4)
- 使用 Mathlib [API 文档](https://leanprover-community.github.io/mathlib4_docs/)
- 使用 [Loogle](https://loogle.lean-lang.org) 按模式搜索
- 依赖 Mathlib 命名约定与编辑器 Ctrl-space（Mac 为 Cmd-space）补全猜测定理名。Lean 中 `A_of_B_of_C` 通常表示从 `B`、`C` 形式假设推出 `A`；建立 `x + y ≤ ...` 的定理可能以 `add_le` 开头。连按两次 Ctrl-space 显示更多补全信息
- 在 VS Code 中右键定理名可跳转到定义文件，在附近找类似定理
- 使用 `apply?` 策略尝试在库中查找相关定理

```lean
example : 0 ≤ a ^ 2 := by
  -- apply?
  exact sq_nonneg a
```

可删去 `exact`、取消注释 `apply?` 试用。用这些技巧完成：

```lean
example (h : a ≤ b) : c - exp b ≤ c - exp a := by
  sorry
```

确认 `linarith` 也可完成该题。

另一不等式例子：

```lean
example : 2*a*b ≤ a^2 + b^2 := by
  have h : 0 ≤ a^2 - 2*a*b + b^2
  calc
    a^2 - 2*a*b + b^2 = (a - b)^2 := by ring
    _ ≥ 0 := by apply pow_two_nonneg

  calc
    2*a*b = 2*a*b + 0 := by ring
    _ ≤ 2*a*b + (a^2 - 2*a*b + b^2) := add_le_add (le_refl _) h
    _ = a^2 + b^2 := by ring
```

Mathlib 常在 `*`、`^` 等二元运算两侧加空格，但本例压缩格式更易读。注意 `s ≥ t` 与 `t ≤ s` **定义相等**，但部分自动化不认等价，故 Mathlib 倾向用 `≤`。我们大量使用 `ring`，它是真正的省时工具。第二个 `calc` 的第二行可直接写证明项 `add_le_add (le_refl _) h`，不必写 `by exact ...`。

本证明的巧妙之处在找出假设 `h`；有了它，第二段计算只是线性算术，`linarith` 可处理：

```lean
example : 2*a*b ≤ a^2 + b^2 := by
  have h : 0 ≤ a^2 - 2*a*b + b^2
  calc
    a^2 - 2*a*b + b^2 = (a - b)^2 := by ring
    _ ≥ 0 := by apply pow_two_nonneg
  linarith
```

挑战：证明下列定理，可用 `abs_le'.mpr`，还需 `constructor` 将合取拆为两个目标（见第 3 章合取部分）：

```lean
example : |a*b| ≤ (a^2 + b^2)/2 := by
  sorry

#check abs_le'.mpr
```