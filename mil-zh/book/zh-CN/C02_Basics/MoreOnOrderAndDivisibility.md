# apply 和 rw 的更多例子

实数上的 `min` 函数由下列三条性质唯一刻画：

```lean
section
variable (a b c d : ℝ)

#check (min_le_left a b : min a b ≤ a)
#check (min_le_right a b : min a b ≤ b)
#check (le_min : c ≤ a → c ≤ b → c ≤ min a b)

end
```

你能猜出刻画 `max` 的类似定理名吗？

注意须写 `min a b` 而非 `min (a, b)`。形式上 `min` 的类型是 `ℝ → ℝ → ℝ`；多箭头类型右结合，故解释为 `ℝ → (ℝ → ℝ)`。若 `a`、`b : ℝ`，则 `min a : ℝ → ℝ`，`min a b : ℝ`，故 `min` 像二元函数一样工作。这种处理多参数的方式称为**柯里化**（currying，以逻辑学家 Haskell Curry 命名）。

Lean 的运算优先级也需适应：函数应用比中缀运算绑定更紧，故 `min a b + c` 解析为 `(min a b) + c`。

用 `le_antisymm` 可证：若两实数互相小于等于则相等。由此可证 `min` 交换：

```lean
example : min a b = min b a := by
  apply le_antisymm
  · show min a b ≤ min b a
    apply le_min
    · apply min_le_right
    apply min_le_left
  · show min b a ≤ min a b
    apply le_min
    · apply min_le_right
    apply min_le_left
```

我们用点号分隔不同目标的证明；外层对两目标都用点号与缩进，内层嵌套证明只在剩余单一目标前用点号——两种约定都合理有用。还用 `show` 策略标明各块所证内容；去掉 `show` 证明仍成立，但加上更易读易维护。

证明有重复。为避免重复，可陈述局部引理再使用：

```lean
example : min a b = min b a := by
  have h : ∀ x y : ℝ, min x y ≤ min y x := by
    intro x y
    apply le_min
    apply min_le_right
    apply min_le_left
  apply le_antisymm
  apply h
  apply h
```

全称量词稍后详述；这里 `h` 说对任意 `x`、`y` 不等式成立，`intro` 引入任意 `x`、`y` 以建立结论。`le_antisymm` 后第一个 `apply` 隐式用 `h a b`，第二个用 `h b a`。

另一解法是 `repeat` 策略，尽可能多次应用策略（或策略块）：

```lean
example : min a b = min b a := by
  apply le_antisymm
  repeat
    apply le_min
    apply min_le_right
    apply min_le_left
```

建议作为练习证明下列命题，第一个可用上述技巧缩短：

```lean
example : max a b = max b a := by
  sorry

example : min (min a b) c = min a (min b c) := by
  sorry
```

欢迎证明 `max` 的结合律。

有趣的是，`min` 对 `max` 的分配方式类似乘法对加法的分配，反之亦然：实数上有 `min a (max b c) = max (min a b) (min a c)`，交换 `min`/`max` 也有对应版本。但下一节将看到，这不能仅从 `≤` 的传递性、自反性及上述 `min`/`max` 刻画性质推出，还需 `≤` 为**全序**（total order），即 `∀ x y, x ≤ y ∨ y ≤ x`（`∨` 表示「或」）。分情形推理见第 3 章析取部分；这里仍用不需分情形的例子：

```lean
theorem aux : min a b + c ≤ min (a + c) (b + c) := by
  apply le_min
  · apply add_le_add_left
    apply min_le_left
  apply add_le_add_left
  apply min_le_right

example : min a b + c = min (a + c) (b + c) := by
  sorry
```

`aux` 给出等式所需的一个不等式方向；将其用于合适值可得另一方向。提示：可用 `add_neg_cancel_right` 与 `linarith`。

Lean 命名约定在三角不等式上体现得很清楚：

```lean
#check (abs_add_le : ∀ a b : ℝ, |a + b| ≤ |a| + |b|)
```

用它证明变体，还需 `add_sub_cancel_right`：

```lean
example : |a| - |b| ≤ |a - b| :=
  sorry
```

试试三行以内完成，可用 `sub_add_cancel`。

另一重要关系是自然数上的**整除**（divisibility）`x ∣ y`。注意整除符号不是普通键盘竖线，而是 VS Code 中 `\|` 输入的 Unicode 字符。Mathlib 定理名中用 `dvd` 指代：

```lean
section
variable (w x y z : ℕ)

example (h₀ : x ∣ y) (h₁ : y ∣ z) : x ∣ z :=
  dvd_trans h₀ h₁

example : x ∣ y * x * z := by
  apply dvd_mul_of_dvd_left
  apply dvd_mul_left

example : x ∣ x ^ 2 := by
  apply dvd_mul_left

end
```

最后一例中指数是自然数，`dvd_mul_left` 迫使 Lean 将 `x^2` 展开为 `x^1 * x`。猜定理所证：

```lean
example (h : x ∣ w) : x ∣ y * (x * z) + x ^ 2 + w ^ 2 := by
  sorry
```

关于整除，**最大公约数** `gcd` 与**最小公倍数** `lcm` 分别类似 `min` 与 `max`。每个数整除 `0`，故 `0` 在整除意义下实为最大元：

```lean
section
variable (m n : ℕ)

#check (Nat.gcd_zero_right n : Nat.gcd n 0 = n)
#check (Nat.gcd_zero_left n : Nat.gcd 0 n = n)
#check (Nat.lcm_zero_right n : Nat.lcm n 0 = 0)
#check (Nat.lcm_zero_left n : Nat.lcm 0 n = 0)

example : Nat.gcd m n = Nat.gcd n m := by
  sorry

end
```

提示：可用 `dvd_antisymm`，但 Lean 可能在泛型定理与自然数版本 `Nat.dvd_antisymm` 之间歧义；可用 `_root_.dvd_antisymm` 指定泛型版本，任一均可。