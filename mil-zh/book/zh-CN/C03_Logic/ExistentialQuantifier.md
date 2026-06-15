# 存在量词

存在量词（existential quantifier）在 VS Code 中可用 `\ex` 输入，表示「存在」。Lean 中 `∃ x : ℝ, 2 < x ∧ x < 3` 表示存在 2 与 3 之间的实数（合取 `∧` 见[合取与双向蕴含](ConjunctionAndIff.md)）。标准证法是给出一个实数并证明其具有所述性质。数 `5/2`（上下文无法推断实数时可写 `(5 : ℝ) / 2`）满足要求，`norm_num` 可证明。

目标以存在量词开头时，**`use`** 策略提供对象，留下证明性质的子目标：

```lean
example : ∃ x : ℝ, 2 < x ∧ x < 3 := by
  use 5 / 2
  norm_num
```

`use` 也可同时给出证明：

```lean
example : ∃ x : ℝ, 2 < x ∧ x < 3 := by
  have h1 : 2 < (5 : ℝ) / 2 := by norm_num
  have h2 : (5 : ℝ) / 2 < 3 := by norm_num
  use 5 / 2, h1, h2
```

`use` 也会自动尝试使用上下文中可用假设：

```lean
example : ∃ x : ℝ, 2 < x ∧ x < 3 := by
  have h : 2 < (5 : ℝ) / 2 ∧ (5 : ℝ) / 2 < 3 := by norm_num
  use 5 / 2
```

也可用 Lean 的**匿名构造子**（anonymous constructor）记法：

```lean
example : ∃ x : ℝ, 2 < x ∧ x < 3 :=
  have h : 2 < (5 : ℝ) / 2 ∧ (5 : ℝ) / 2 < 3 := by norm_num
  ⟨5 / 2, h⟩
```

此处无 `by`，是直接给出证明项。尖括号 `\<\>` 告诉 Lean 用当前目标所需的构造方式组装数据：

```lean
example : ∃ x : ℝ, 2 < x ∧ x < 3 :=
  ⟨5 / 2, by norm_num⟩
```

若已知存在具有某性质的对象，应能为某个具体对象命名并推理。回忆 `FnUb`、`FnLb`；用存在量词可说「`f` 有界」而不指定界：

```lean
def FnUb (f : ℝ → ℝ) (a : ℝ) : Prop :=
  ∀ x, f x ≤ a

def FnLb (f : ℝ → ℝ) (a : ℝ) : Prop :=
  ∀ x, a ≤ f x

def FnHasUb (f : ℝ → ℝ) :=
  ∃ a, FnUb f a

def FnHasLb (f : ℝ → ℝ) :=
  ∃ a, FnLb f a
```

用上一节的 `fnUb_add` 可证：若 `f`、`g` 有上界，则 `fun x ↦ f x + g x` 也有：

```lean
theorem fnUb_add {f g : ℝ → ℝ} {a b : ℝ} (hfa : FnUb f a) (hgb : FnUb g b) :
    FnUb (fun x ↦ f x + g x) (a + b) :=
  fun x ↦ add_le_add (hfa x) (hgb x)

section
variable {f g : ℝ → ℝ}

example (ubf : FnHasUb f) (ubg : FnHasUb g) : FnHasUb fun x ↦ f x + g x := by
  rcases ubf with ⟨a, ubfa⟩
  rcases ubg with ⟨b, ubgb⟩
  use a + b
  apply fnUb_add ubfa ubgb
```

**`rcases`** 拆包存在量词中的信息；`⟨a, ubfa⟩` 等称为**模式**（patterns）。`rcases ubf with ⟨a, ubfa⟩` 将上界 `a` 及性质 `ubfa` 加入上下文，目标不变，但可用新对象与新假设证明目标。这是数学中常见推理：从假设中拆出断言存在的对象，再用以建立其他存在性。

试用此法建立下列结论：

```lean
example (lbf : FnHasLb f) (lbg : FnHasLb g) : FnHasLb fun x ↦ f x + g x := by
  sorry

example {c : ℝ} (ubf : FnHasUb f) (h : c ≥ 0) : FnHasUb fun x ↦ c * f x := by
  sorry
```

`rcases` 的 "r" 表示 recursive，可用复杂模式拆嵌套数据。**`rintro`** 结合 `intro` 与 `rcases`：

```lean
example : FnHasUb f → FnHasUb g → FnHasUb fun x ↦ f x + g x := by
  rintro ⟨a, ubfa⟩ ⟨b, ubgb⟩
  exact ⟨a + b, fnUb_add ubfa ubgb⟩
```

Lean 在表达式与证明项中也支持模式匹配 `fun`：

```lean
example : FnHasUb f → FnHasUb g → FnHasUb fun x ↦ f x + g x :=
  fun ⟨a, ubfa⟩ ⟨b, ubgb⟩ ↦ ⟨a + b, fnUb_add ubfa ubgb⟩
```

拆包假设很重要，Lean/Mathlib 提供多种方式。**`obtain`** 语法更直观：

```lean
example (ubf : FnHasUb f) (ubg : FnHasUb g) : FnHasUb fun x ↦ f x + g x := by
  obtain ⟨a, ubfa⟩ := ubf
  obtain ⟨b, ubgb⟩ := ubg
  exact ⟨a + b, fnUb_add ubfa ubgb⟩
```

`rcases`、`obtain` 对其参数进行 **destruct**（解构）。Lean 也支持类似其他函数式语言的语法：

```lean
example (ubf : FnHasUb f) (ubg : FnHasUb g) : FnHasUb fun x ↦ f x + g x := by
  cases ubf
  case intro a ubfa =>
    cases ubg
    case intro b ubgb =>
      exact ⟨a + b, fnUb_add ubfa ubgb⟩

example (ubf : FnHasUb f) (ubg : FnHasUb g) : FnHasUb fun x ↦ f x + g x := by
  cases ubf
  next a ubfa =>
    cases ubg
    next b ubgb =>
      exact ⟨a + b, fnUb_add ubfa ubgb⟩

example (ubf : FnHasUb f) (ubg : FnHasUb g) : FnHasUb fun x ↦ f x + g x := by
  match ubf, ubg with
    | ⟨a, ubfa⟩, ⟨b, ubgb⟩ =>
      exact ⟨a + b, fnUb_add ubfa ubgb⟩

example (ubf : FnHasUb f) (ubg : FnHasUb g) : FnHasUb fun x ↦ f x + g x :=
  match ubf, ubg with
    | ⟨a, ubfa⟩, ⟨b, ubgb⟩ =>
      ⟨a + b, fnUb_add ubfa ubgb⟩
```

本书其余部分优先用 `rcases`、`rintro`、`obtain`；了解替代语法也有益，尤其与计算机科学家共事时。

经典结论：若整数 `x`、`y` 各自可表为两平方和，则积 `x * y` 亦然；对任意交换环成立：

```lean
section
variable {α : Type*} [CommRing α]

def SumOfSquares (x : α) :=
  ∃ a b, x = a ^ 2 + b ^ 2

theorem sumOfSquares_mul {x y : α} (sosx : SumOfSquares x) (sosy : SumOfSquares y) :
    SumOfSquares (x * y) := by
  rcases sosx with ⟨a, b, xeq⟩
  rcases sosy with ⟨c, d, yeq⟩
  rw [xeq, yeq]
  use a * c - b * d, a * d + b * c
  ring

end
```

**高斯整数** \(a + bi\)（\(a,b\) 为整数）的范数为 \(a^2 + b^2\)；范数乘积等于乘积的范数。形式化最易的证明未必最透彻；第 7 章将构造高斯整数并给出另一证明。

存在量词内等式的拆包与重写很常见；`rcases` 可用关键字 `rfl` 代替新标识符以自动重写（对模式匹配 λ 无效）：

```lean
theorem sumOfSquares_mul' {x y : α} (sosx : SumOfSquares x) (sosy : SumOfSquares y) :
    SumOfSquares (x * y) := by
  rcases sosx with ⟨a, b, rfl⟩
  rcases sosy with ⟨c, d, rfl⟩
  use a * c - b * d, a * d + b * c
  ring
```

与全称量词类似，存在量词也处处隐藏。**整除**隐含「存在」：

```lean
section
variable {a b c : ℕ}

example (divab : a ∣ b) (divbc : b ∣ c) : a ∣ c := by
  rcases divab with ⟨d, beq⟩
  rcases divbc with ⟨e, ceq⟩
  rw [ceq, beq]
  use d * e; ring

example (divab : a ∣ b) (divac : a ∣ c) : a ∣ b + c := by
  sorry

end
```

试在证明中用 `rcases` 配合 `rfl`。

函数 \(f : \alpha \to \beta\) **满射**（surjective）若对每个值域中的 \(y\)，存在定义域中的 \(x\) 使 \(f(x) = y\)。该陈述含全称与存在量词，故下例同时用 `intro` 与 `use`：

```lean
section
open Function

example {c : ℝ} : Surjective fun x ↦ x + c := by
  intro y
  use y - c
  dsimp; ring

example {c : ℝ} (h : c ≠ 0) : Surjective fun x ↦ c * x := by
  sorry

end
```

可用定理 `mul_div_cancel₀`。**`field_simp`** 策略常有助于清理分母，可与 `ring` 联用：

```lean
example (x y : ℝ) (h : x - y ≠ 0) : (x ^ 2 - y ^ 2) / (x - y) = x + y := by
  field_simp [h]
  ring
```

满射假设可应用于合适值；`rcases` 可用于任意表达式，不限于假设：

```lean
example {f : ℝ → ℝ} (h : Surjective f) : ∃ x, f x ^ 2 = 4 := by
  rcases h 2 with ⟨x, hx⟩
  use x
  rw [hx]
  norm_num
```

试证满射函数的复合仍满射：

```lean
section
open Function
variable {α : Type*} {β : Type*} {γ : Type*}
variable {g : β → γ} {f : α → β}

example (surjg : Surjective g) (surjf : Surjective f) : Surjective fun x ↦ g (f x) := by
  sorry

end
```