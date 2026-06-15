# 证明代数结构中的恒等式

数学上，**环**（ring）由集合 \(R\)、运算 \(+\)、\(\times\)、常元 \(0\) 与 \(1\)，以及映射 \(x \mapsto -x\) 组成，满足：

- \(R\) 在 \(+\) 下为**阿贝尔群**（abelian group），\(0\) 为加法单位元，取负为逆元。
- 乘法结合，\(1\) 为乘法单位元，乘法对加法分配。

在 Lean 中，对象集合表示为类型 `R`，环公理如下：

```lean
section
variable (R : Type*) [Ring R]

#check (add_assoc : ∀ a b c : R, a + b + c = a + (b + c))
#check (add_comm : ∀ a b : R, a + b = b + a)
#check (zero_add : ∀ a : R, 0 + a = a)
#check (neg_add_cancel : ∀ a : R, -a + a = 0)
#check (mul_assoc : ∀ a b c : R, a * b * c = a * (b * c))
#check (mul_one : ∀ a : R, a * 1 = a)
#check (one_mul : ∀ a : R, 1 * a = a)
#check (mul_add : ∀ a b c : R, a * (b + c) = a * b + a * c)
#check (add_mul : ∀ a b c : R, (a + b) * c = a * c + b * c)

end
```

第一行方括号稍后解释；它给出类型 `R` 及其上的环结构。Lean 允许对 `R` 的元素使用通用环记法，并利用环定理库。

部分定理名应很熟悉：正是上一节在实数上用过的那些。Lean 不仅适合证明自然数、整数等具体结构，也适合证明环这类公理化抽象结构。Lean 支持对抽象与具体结构的**泛化推理**（generic reasoning），并能识别合适实例。因此环上的任何定理都可用于 `ℤ`、`ℚ`、`ℂ` 等，以及有序环、域等扩展环的实例。

并非实数的所有重要性质在任意环中都成立。例如实数乘法**交换**（commutative），一般环中未必。若学过线性代数，可知对每个 \(n\)，\(n \times n\) 实矩阵构成环，乘法通常不交换。若声明 `R` 为**交换环**（commutative ring，`CommRing`），上一节几乎所有定理在将 `ℝ` 换为 `R` 后仍成立：

```lean
section
variable (R : Type*) [CommRing R]
variable (a b c d : R)

example : c * b * a = b * (a * c) := by ring

example : (a + b) * (a + b) = a * a + 2 * (a * b) + b * b := by ring

example : (a + b) * (a - b) = a ^ 2 - b ^ 2 := by ring

example (hyp : c = d * a + b) (hyp' : b = a * d) : c = 2 * a * d := by
  rw [hyp, hyp']
  ring

end
```

其余证明可检查是否无需修改仍成立。短证明如 `by ring`、`by linarith`、`by sorry` 常与 `by` 写在同一行，这是常见且允许的写法。好的证明风格应在简洁与可读之间取得平衡。

本节目标是在上一节技能基础上，公理化地推理环。我们从上述公理出发推导其他事实；许多事实已在 Mathlib 中，我们给出版本与库中同名，以助于学习库内容与命名约定。

Lean 提供类似编程语言的组织机制：在命名空间 `bar` 中引入 `foo` 时，全名为 `bar.foo`；`open bar` 后可使用短名 `foo`。下一例将库定理的自有版本放在 `MyRing` 命名空间中。

下例说明 `add_zero`、`add_neg_cancel` 不必作为环公理，可由其他公理推出：

```lean
namespace MyRing
variable {R : Type*} [Ring R]

theorem add_zero (a : R) : a + 0 = a := by rw [add_comm, zero_add]

theorem add_neg_cancel (a : R) : a + -a = 0 := by rw [add_comm, neg_add_cancel]

#check MyRing.add_zero
#check add_zero

end MyRing
```

效果是我们可以临时重证库中定理，之后继续使用库版本。但请勿作弊！下列练习只应使用本节已证的一般环事实。

（细心者可能注意到我们将 `(R : Type*)` 的圆括号改为 `{R : Type*}`，声明 `R` 为**隐式参数**（implicit argument），稍后解释，暂时可忽略。）

有用定理：

```lean
namespace MyRing
variable {R : Type*} [Ring R]

theorem neg_add_cancel_left (a b : R) : -a + (a + b) = b := by
  rw [← add_assoc, neg_add_cancel, zero_add]
```

请证明对偶版本：

```lean
theorem add_neg_cancel_right (a b : R) : a + b + -b = a := by
  sorry
```

并用它们证明：

```lean
theorem add_left_cancel {a b c : R} (h : a + b = a + c) : b = c := by
  sorry

theorem add_right_cancel {a b c : R} (h : a + b = c + b) : a = c := by
  sorry
```

每个证明用三次重写即可。

**隐式参数**：设想上下文中有 `a`、`b`、`c` 及假设 `h : a + b = a + c`，要得出 `b = c`。可把定理应用于假设，故可能认为 `add_left_cancel a b c h` 是 `b = c` 的证明。但显式写 `a`、`b`、`c` 是冗余的，因为 `h` 已表明我们考虑的就是它们。复杂表达式时更显繁琐。Lean 允许将参数标为隐式，由后续参数与假设推断。`{a b c : R}` 中的花括号即为此意。故正确用法是 `add_left_cancel h`。

由此可证 `a * 0 = 0`：

```lean
theorem mul_zero (a : R) : a * 0 = 0 := by
  have h : a * 0 + a * 0 = a * 0 + 0 := by
    rw [← mul_add, add_zero, add_zero]
  rw [add_left_cancel h]
```

这里用了新技巧 `have`：它引入新目标 `a * 0 + a * 0 = a * 0 + 0`，上下文与原目标相同。下一行缩进表示 Lean 期待证明该子目标的策略块；缩进促进模块化证明风格。证明 `h` 后，回到原目标，且多了可用假设 `h`；此时目标正是 `add_left_cancel h` 的结果。

也可用 `apply add_left_cancel h` 或 `exact add_left_cancel h` 结束。`exact` 的参数须完全证明当前目标；`apply` 的参数不必完整，缺失部分由 Lean 推断或成为新目标。`exact` 技术上弱于 `apply`，但使证明脚本对人类更清晰、库演进时更易维护。

乘法一般不交换，故下一定理也需工作：

```lean
theorem zero_mul (a : R) : 0 * a = 0 := by
  sorry
```

接下来可将练习中的 `sorry` 替换为证明，仍只使用本节环事实及公理 `eq_symm`：

```lean
theorem neg_eq_of_add_eq_zero {a b : R} (h : a + b = 0) : -a = b := by
  sorry

theorem eq_neg_of_add_eq_zero {a b : R} (h : a + b = 0) : a = -b := by
  sorry

theorem neg_zero : (-0 : R) = 0 := by
  apply neg_eq_of_add_eq_zero
  rw [add_zero]

theorem neg_neg (a : R) : - -a = a := by
  sorry
```

第三定理须写 `(-0 : R)` 而非 `0`，否则 Lean 无法推断是哪个 `0`，默认会当作自然数。

在环中，减法可证等于加负元：

```lean
section
variable {R : Type*} [Ring R]

example (a b : R) : a - b = a + -b :=
  sub_eq_add_neg a b

end
```

在实数上，这是**定义**如此：

```lean
example (a b : ℝ) : a - b = a + -b :=
  rfl

example (a b : ℝ) : a - b = a + -b := by
  rfl
```

证明项 `rfl` 表示自反性（reflexivity）。作为 `a - b = a + -b` 的证明，它迫使 Lean 展开定义并识别两边相同。`rfl` 策略同理。这是 Lean 底层逻辑中的**定义相等**（definitional equality）：不仅可用 `sub_eq_add_neg` 重写，在处理实数时某些上下文下两边可互换。

由此可证上一节的 `self_sub`：

```lean
namespace MyRing
variable {R : Type*} [Ring R]

theorem self_sub (a : R) : a - a = 0 := by
  sorry

end MyRing
```

可用 `rw` 证明；若将任意环 `R` 换为实数，也可用 `apply` 或 `exact`。

Lean 知道任意环中 `1 + 1 = 2`。稍加努力可用此证上一节的 `two_mul`：

```lean
namespace MyRing
variable {R : Type*} [Ring R]

theorem one_add_one_eq_two : 1 + 1 = (2 : R) := by
  norm_num

theorem two_mul (a : R) : 2 * a = a + a := by
  sorry

end MyRing
```

本节末尾：上述加法与取负的部分事实不需要完整环公理，甚至不需要加法交换律。更弱的**群**（group）概念可公理化如下：

```lean
section
variable (A : Type*) [AddGroup A]

#check (add_assoc : ∀ a b c : A, a + b + c = a + (b + c))
#check (zero_add : ∀ a : A, 0 + a = a)
#check (neg_add_cancel : ∀ a : A, -a + a = 0)

end
```

群运算交换时常用加法记法，否则用乘法记法。Lean 同时定义乘法版本及阿贝尔变体 `AddCommGroup`、`CommGroup`：

```lean
section
variable {G : Type*} [Group G]

#check (mul_assoc : ∀ a b c : G, a * b * c = a * (b * c))
#check (one_mul : ∀ a : G, 1 * a = a)
#check (inv_mul_cancel : ∀ a : G, a⁻¹ * a = 1)

namespace MyGroup

theorem mul_inv_cancel (a : G) : a * a⁻¹ = 1 := by
  sorry

theorem mul_one (a : G) : a * 1 = a := by
  sorry

theorem mul_inv_rev (a b : G) : (a * b)⁻¹ = b⁻¹ * a⁻¹ := by
  sorry

end MyGroup

end
```

显式调用这些引理较繁琐，Mathlib 提供类似 `ring` 的策略：`group`（非交换乘法群）、`abel`（阿贝尔加法群）、`noncomm_ring`（非交换环）。代数结构名为 `Ring`、`CommRing`，而策略名为 `noncomm_ring`、`ring`，部分出于历史原因，也因为交换环策略更常用而采用较短名称。