# 第 11 章：转换策略模式

> 本译文对应原书 [The Conversion Tactic Mode](https://lean-lang.org/theorem_proving_in_lean4/The-Conversion-Tactic-Mode/)；英文 Verso 源：`book/TPiL/Conv.lean`。

在策略块内，可用关键字 **`conv`** 进入**转换模式**（conversion mode）。该模式允许在假设与目标内部导航——甚至进入函数抽象与依赖箭头内部——以应用重写或化简步骤。

## 11.1 基本导航与重写

作为第一个例子，证明 `(a b c : Nat) : a * (b * c) = a * (c * b)`（本章例子略人工，因其他策略可立即完成）。朴素尝试是进入策略模式并 `rw [Nat.mul_comm]`，但这会把目标变成 `b * c * a = a * (c * b)`——交换了项中第一次出现的乘法。有多种修复方式，其一是用更精确的工具：转换模式。下列代码块展示每行之后的当前目标：

```lean
#guard_msgs (drop all) in
example (a b c : Nat) : a * (b * c) = a * (c * b) := by
  rw [Nat.mul_comm]
  -- ^ PROOF_STATE: oops

example (a b c : Nat) : a * (b * c) = a * (c * b) := by
  conv =>
--  ^ PROOF_STATE: conv1
    lhs
--  ^ PROOF_STATE: conv2
    congr
--  ^ PROOF_STATE: conv3
    rfl
--  ^ PROOF_STATE: conv4
    rw [Nat.mul_comm]
```

上段展示三个导航命令：

- **`lhs`** 导航到关系的左端（此处为相等）。还有 **`rhs`** 导航到右端。
- **`congr`** 为当前头部函数（此处为乘法）的每个（非依赖且显式）参数各创建一个目标。
- **`rfl`** 用自反性关闭目标。

到达相关目标后，可像在普通策略模式中一样使用 **`rw`**。

使用转换模式的第二个主要原因是**在绑定子下重写**。设要证 `(fun x : Nat => 0 + x) = (fun x => x)`。朴素尝试 `rw [Nat.zero_add]` 会失败：

```
error: tactic 'rewrite' failed, did not find instance of the pattern
       in the target expression
  0 + ?n
⊢ (fun x => 0 + x) = fun x => x
```

解法是：

```lean
example : (fun x : Nat => 0 + x) = (fun x => x) :=  by
  conv =>
    lhs
    intro x
    rw [Nat.zero_add]
```

其中 **`intro x`** 是进入 `fun` 绑定子内部的导航命令。此例略人工，也可：

```lean
example : (fun x : Nat => 0 + x) = (fun x => x) := by
  funext x; rw [Nat.zero_add]
```

或：

```lean
example : (fun x : Nat => 0 + x) = (fun x => x) := by
  simp
```

**`conv`** 也可用 **`conv at h`** 重写局部上下文中的假设 `h`。

## 11.2 模式匹配

用上述命令导航可能繁琐。可用模式匹配快捷：

```lean
example (a b c : Nat) : a * (b * c) = a * (c * b) := by
  conv in b * c =>
    rw [Nat.mul_comm]
```

这仅是下列的语法糖：

```lean
example (a b c : Nat) : a * (b * c) = a * (c * b) := by
  conv =>
    pattern b * c
    rw [Nat.mul_comm]
```

当然允许通配符：

```lean
example (a b c : Nat) : a * (b * c) = a * (c * b) := by
  conv in _ * c => rw [Nat.mul_comm]
```

## 11.3 组织转换策略

在 **`conv`** 模式中也可用花括号与 **`.`** 组织策略：

```lean
example (a b c : Nat) : (0 + a) * (b * c) = a * (c * b) := by
  conv =>
    lhs
    congr
    . rw [Nat.zero_add]
    . rw [Nat.mul_comm]
```

## 11.4 转换模式中的其他策略

- **`arg i`** 进入应用的第 `i` 个非依赖显式参数。

  ```lean
  example (a b c : Nat) : a * (b * c) = a * (c * b) := by
    conv =>
    -- ^ PROOF_STATE: arg1
      lhs
    -- ^ PROOF_STATE: arg2
      arg 2
    -- ^ PROOF_STATE: arg3
      rw [Nat.mul_comm]
  ```

- **`args`** 是 **`congr`** 的别名。

- **`simp`** 对当前目标应用简化器，支持与常规策略模式相同的选项。

  ```lean
  def f (x : Nat) :=
    if x > 0 then x + 1 else x + 2

  example (g : Nat → Nat)
      (h₁ : g x = x + 1) (h₂ : x > 0) :
      g x = f x := by
    conv =>
      rhs
      simp [f, h₂]
    exact h₁
  ```

- **`enter [1, x, 2, y]`** 用给定参数迭代 **`arg`** 与 **`intro`**。

- **`done`** 若有未解决目标则失败。

- **`trace_state`** 显示当前策略状态。

- **`whnf`** 将项置于弱头范式。

- **`tactic => <tactic sequence>`** 回到常规策略模式。用于处理 **`conv`** 模式不支持的目标，并应用自定义同余与外延引理。

  ```lean
  example (g : Nat → Nat → Nat)
          (h₁ : ∀ x, x ≠ 0 → g x x = 1)
          (h₂ : x ≠ 0)
          : g x x + x = 1 + x := by
    conv =>
      lhs
  --  ^    PROOF_STATE: convTac1
      arg 1
  --  ^    PROOF_STATE: convTac2
      rw [h₁]
      . skip
      . tactic =>
    --  ^    PROOF_STATE: convTac4
         exact h₂
  ```

- **`apply <term>`** 是 **`tactic => apply <term>`** 的语法糖。

  ```lean
  example (g : Nat → Nat → Nat)
          (h₁ : ∀ x, x ≠ 0 → g x x = 1)
          (h₂ : x ≠ 0)
          : g x x + x = 1 + x := by
    conv =>
      lhs
      arg 1
      rw [h₁]
      . skip
      . apply h₂
  ```