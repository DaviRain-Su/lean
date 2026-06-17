-- 自然数：从零和后继构造子出发的归纳定义
--
-- 放在 `MyNat` 命名空间里，避免与 Lean 标准库的 `Nat` 冲突。
-- `Basic.lean` 里的练习仍用标准库 `Nat`；本文件展示「自然数从哪来」。

namespace MyNat

/-!
## 归纳类型

自然数 `Nat` 只有两个构造子：

- `zero`：起点，表示 0
- `succ`：后继，把任意自然数 n 变成「下一个」数

反复应用 `succ` 就得到 1、2、3……
例如：`succ (succ zero)` 就是 2。
-/

inductive Nat : Type where
  | zero : Nat
  | succ (n : Nat) : Nat
deriving Repr

-- 查看类型与构造子
#check Nat
#check Nat.zero
#check Nat.succ
#print Nat

/-!
## 递归定义加法

固定 `m`，在 `n` 上递归：

- `m + 0 = m`
- `m + succ n = succ (m + n)`
-/

def add (m n : Nat) : Nat :=
  match n with
  | Nat.zero   => m
  | Nat.succ n => Nat.succ (add m n)

/-!
## 递归定义乘法

- `m * 0 = 0`
- `m * succ n = m * n + m`（即 `add m (mul m n)`）
-/

def mul (m n : Nat) : Nat :=
  match n with
  | Nat.zero   => Nat.zero
  | Nat.succ n => add m (mul m n)

-- 让 `+` 和 `*` 在本命名空间里指向我们的定义
instance : Add Nat where
  add := add

instance : Mul Nat where
  mul := mul

-- 按定义成立的等式（证明一步 `rfl` 即可）
theorem add_zero (m : Nat) : m + Nat.zero = m := rfl
theorem add_succ (m n : Nat) : m + Nat.succ n = Nat.succ (m + n) := rfl
theorem mul_zero (m : Nat) : m * Nat.zero = Nat.zero := rfl
theorem mul_succ (m n : Nat) : m * Nat.succ n = m + m * n := rfl

-- 示例：计算与化简
#eval add (Nat.succ (Nat.succ Nat.zero)) (Nat.succ Nat.zero)   -- 3
#eval mul (Nat.succ Nat.zero) (Nat.succ (Nat.succ Nat.zero))   -- 6
#reduce Nat.succ (Nat.succ Nat.zero)                            -- 2

end MyNat

-- 命名空间外，`Nat` 仍指标准库；要访问自定义版本需加前缀 `MyNat.`
#check Nat
#check MyNat.Nat
#print MyNat.Nat
