# 计算

我们通常做数学计算时，并不把它们看作证明。但当我们为计算的每一步给出理由——正如 Lean 所要求的——整体结果就是：等式左边等于右边的证明。

在 Lean 中，陈述定理就等于陈述一个**目标**（goal），即证明该定理的目标。Lean 提供重写策略 `rw`，用恒等式右边替换目标中的左边。若 `a`、`b`、`c` 为实数，`mul_assoc a b c` 是恒等式 `a * b * c = a * (b * c)`，`mul_comm a b` 是 `a * b = b * a`。Lean 的自动化通常使我们不必显式引用这类事实，但为说明起见它们很有用。在 Lean 中乘法左结合，故 `mul_assoc` 左边也可写成 `(a * b) * c`；但一般应留意 Lean 的记法约定，在 Lean 省略括号时也省略括号。

我们来试试 `rw`：

```lean
example (a b c : ℝ) : a * b * c = b * (a * c) := by
  rw [mul_comm a b]
  rw [mul_assoc b a c]
```

关联例题文件开头的 `import` 行从 Mathlib 导入实数理论及实用自动化。为简洁，教材中通常省略这类信息。

欢迎修改并观察效果。在 VS Code 中可用 `\R` 或 `\real` 输入 `ℝ` 字符，按空格或 Tab 后才会显示。阅读 Lean 文件时悬停符号可看到输入语法。若好奇所有可用缩写，可按 Ctrl-Shift-P，输入 abbreviations，选择 `Lean 4: Show Unicode Input Abbreviations`。若键盘不易输入反斜杠，可修改 `lean4.input.leader` 设置。

当光标位于策略证明中间时，Lean 在 *Lean Infoview* 窗口报告当前**证明状态**。逐行移动光标可看到状态变化。典型的证明状态可能如下：

```
1 goal
x y : ℕ,
h₁ : Prime x,
h₂ : ¬Even x,
h₃ : y > x
⊢ y ≥ 4
```

以 `⊢` 开头的行之前是**上下文**（context）：当前可用的对象与假设。本例包括自然数 `x`、`y`，以及标记为 `h₁`、`h₂`、`h₃` 的三条假设。Lean 中上下文里的一切都有标识符；可用 `h\1`、`h\2`、`h\3` 输入下标，也可用 `h1`、`h2`、`h3` 或 `foo`、`bar`、`baz`。最后一行是**目标**，即待证事实。有时人们用 *target* 指待证事实，*goal* 指上下文与目标的组合；实践中含义通常清楚。

试证明下列恒等式，将 `sorry` 替换为策略证明。使用 `rw` 时，可用左箭头（`\l`）反转恒等式方向，例如 `rw [← mul_assoc a b c]` 在目标中用 `a * b * c` 替换 `a * (b * c)`。注意左箭头指恒等式从右到左的方向，与目标左右无关。

```lean
example (a b c : ℝ) : c * b * a = b * (a * c) := by
  sorry

example (a b c : ℝ) : a * (b * c) = b * (a * c) := by
  sorry
```

也可不给参数地使用 `mul_assoc`、`mul_comm` 等恒等式；此时 `rw` 会尝试将左边与目标中第一个匹配的模式对应：

```lean
example (a b c : ℝ) : a * b * c = b * c * a := by
  rw [mul_assoc]
  rw [mul_comm]
```

还可提供**部分**信息。例如 `mul_comm a` 匹配 `a * ?` 形式并重写为 `? * a`。第一个例子尽量不提供任何参数，第二个只提供一个参数：

```lean
example (a b c : ℝ) : a * (b * c) = b * (c * a) := by
  sorry

example (a b c : ℝ) : a * (b * c) = b * (a * c) := by
  sorry
```

还可用局部上下文中的事实做 `rw`：

```lean
example (a b c d e f : ℝ) (h : a * b = c * d) (h' : e = f) : a * (b * e) = c * (d * f) := by
  rw [h']
  rw [← mul_assoc]
  rw [h]
  rw [mul_assoc]
```

试做下列练习，第二个可用定理 `sub_self`：

```lean
example (a b c d e f : ℝ) (h : b * c = e * f) : a * b * c * d = a * e * f * d := by
  sorry

example (a b c d : ℝ) (hyp : c = b * a - d) (hyp' : d = a * b) : c = 0 := by
  sorry
```

多条重写可在方括号内用逗号分隔，一次完成：

```lean
example (a b c d e f : ℝ) (h : a * b = c * d) (h' : e = f) : a * (b * e) = c * (d * f) := by
  rw [h', ← mul_assoc, h, mul_assoc]
```

将光标放在逗号后可仍看到增量进展。

另一技巧是在 `example` 或 `theorem` 外一次性声明变量，Lean 会自动包含它们：

```lean
section

variable (a b c d e f : ℝ)

example (h : a * b = c * d) (h' : e = f) : a * (b * e) = c * (d * f) := by
  rw [h', ← mul_assoc, h, mul_assoc]

end
```

检查上述证明开始处的策略状态，可确认 Lean 确实包含了所有变量。可用 `section ... end` 限定声明作用域。回顾引言，`#check` 可确定表达式类型：

```lean
section
variable (a b c : ℝ)

#check a
#check a + b
#check (a : ℝ)
#check mul_comm a b
#check (mul_comm a b : a * b = b * a)
#check mul_assoc c a b
#check mul_comm a
#check mul_comm

end
```

`#check` 对对象和事实都适用。`#check a` 报告 `a` 的类型为 `ℝ`；`#check mul_comm a b` 报告它是 `a * b = b * a` 的证明。`#check (a : ℝ)` 声明我们期望 `a` 的类型为 `ℝ`，否则 Lean 报错。最后三个 `#check` 的输出稍后解释；不妨先自行实验。

再试几个例子。定理 `two_mul a` 说 `2 * a = a + a`；`add_mul`、`mul_add` 表达乘法对加法的分配律，`add_assoc` 表达加法结合律。用 `#check` 查看精确陈述。

```lean
section
variable (a b : ℝ)

example : (a + b) * (a + b) = a * a + 2 * (a * b) + b * b := by
  rw [mul_add, add_mul, add_mul]
  rw [← add_assoc, add_assoc (a * a)]
  rw [mul_comm b a, ← two_mul]
```

在编辑器中逐步执行可以理解证明，但单独阅读较难。Lean 提供用 `calc` 关键字写得更结构化的证明：

```lean
example : (a + b) * (a + b) = a * a + 2 * (a * b) + b * b :=
  calc
    (a + b) * (a + b) = a * a + b * a + (a * b + b * b) := by
      rw [mul_add, add_mul, add_mul]
    _ = a * a + (b * a + a * b) + b * b := by
      rw [← add_assoc, add_assoc (a * a)]
    _ = a * a + 2 * (a * b) + b * b := by
      rw [mul_comm b a, ← two_mul]
```

注意证明**不以** `by` 开头：以 `calc` 开头的表达式是**证明项**。`calc` 也可用在策略证明内部，Lean 会将其解释为用所得证明项解决目标。`calc` 语法较挑剔：下划线与理由须按上述格式。Lean 用缩进判断策略块或 `calc` 块的起止；可尝试修改缩进观察效果。

写 `calc` 证明的一种方法是先用 `sorry` 搭骨架，确认 Lean 接受后再用策略填充各步：

```lean
example : (a + b) * (a + b) = a * a + 2 * (a * b) + b * b :=
  calc
    (a + b) * (a + b) = a * a + b * a + (a * b + b * b) := by
      sorry
    _ = a * a + (b * a + a * b) + b * b := by
      sorry
    _ = a * a + 2 * (a * b) + b * b := by
      sorry
```

试分别用纯 `rw` 证明和更结构化的 `calc` 证明下列恒等式：

```lean
section
variable (a b c d : ℝ)

example : (a + b) * (c + d) = a * c + a * d + b * c + b * d := by
  sorry

example (a b : ℝ) : (a + b) * (a - b) = a ^ 2 - b ^ 2 := by
  sorry

#check pow_two a
#check mul_sub a b c
#check add_mul a b c
#check add_sub a b c
#check sub_sub a b c
#check add_zero a
```

还可在上下文中的假设上做重写。`rw [mul_comm a b] at hyp` 在假设 `hyp` 中用 `b * a` 替换 `a * b`：

```lean
section
variable (a b c d : ℝ)

example (a b c d : ℝ) (hyp : c = d * a + b) (hyp' : b = a * d) : c = 2 * a * d := by
  rw [hyp'] at hyp
  rw [mul_comm d a] at hyp
  rw [← two_mul (a * d)] at hyp
  rw [← mul_assoc 2 a d] at hyp
  exact hyp
```

最后一步，`exact` 策略可用 `hyp` 解决目标，因为此时 `hyp` 与目标完全一致。

Mathlib 提供有用的 `ring` 策略，专为证明任意交换环（commutative ring）中仅由环公理推出、不依赖局部假设的恒等式而设计：

```lean
example : c * b * a = b * (a * c) := by
  ring

example : (a + b) * (a + b) = a * a + 2 * (a * b) + b * b := by
  ring

example : (a + b) * (a - b) = a ^ 2 - b ^ 2 := by
  ring

example (hyp : c = d * a + b) (hyp' : b = a * d) : c = 2 * a * d := by
  rw [hyp, hyp']
  ring
```

导入 `Mathlib.Data.Real.Basic` 时会间接导入 `ring`；下一节将看到它也可用于实数以外的结构。也可显式 `import Mathlib.Tactic`。类似策略还覆盖其他常见代数结构。

`rw` 的变体 `nth_rw` 可只替换目标中表达式的特定出现；匹配从 1 开始编号：

```lean
example (a b c : ℕ) (h : a + b = c) : (a + b) * (a + b) = a * c + b * c := by
  nth_rw 2 [h]
  rw [add_mul]
```