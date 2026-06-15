def hello := "world"

-- 示例 1：rfl 战术
-- rfl（reflexivity）用于证明「两边完全相同」的等式，即 X = X 的形式。
example (x q : Nat) : 37 * x + q = 37 * x + q := by
  rfl  -- 左右两边一模一样，直接 reflexivity 得证

-- 示例 2：rw 战术（用假设改写目标）
-- rw [h] 会把目标里出现的 h 左边，替换成 h 右边。
example (x y : Nat) (h : y = x + 7) : 2 * y = 2 * (x + 7) := by
  rw [h]  -- 由 h : y = x + 7，把目标中的 y 改写为 x + 7，然后 rfl 自动完成

-- rw 方向速查（h : a = b 时）：
-- ┌──────────┬────────────────────────────────────────────┐
-- │ 写法     │ 含义                                       │
-- ├──────────┼────────────────────────────────────────────┤
-- │ rw [h]   │ 用 h 从左改到右（h : a = b 时把 a 换成 b） │
-- ├──────────┼────────────────────────────────────────────┤
-- │ rw [← h] │ 反向，把 b 换成 a                          │
-- └──────────┴────────────────────────────────────────────┘
-- 提示：键盘可输入 ←（Mac：输入 2190 后按 Option+Enter），或直接写 <- 。

-- 辅助引理（Natural Number Game 风格）
-- 在浏览器教程里，1 和 2 不能直接使用 succ 形式，需要先证明这两个等式。
theorem one_eq_succ_zero : (1 : Nat) = Nat.succ 0 := rfl  -- 1 = succ 0
theorem two_eq_succ_one : (2 : Nat) = Nat.succ 1 := rfl    -- 2 = succ 1

-- 示例 3：证明 2 = succ (succ 0)
-- 思路：从左边的具体数字 2 出发，逐步展开成 succ 链，去匹配右边。
-- 浏览器中的证法：
--   rw [two_eq_succ_one]   -- 2 = succ (succ 0)  →  succ 1 = succ (succ 0)
--   rw [one_eq_succ_zero]  -- succ 1 = succ (succ 0)  →  succ (succ 0) = succ (succ 0)
--   rfl
-- 本地 Lean 4 中 1、2 定义上就是 succ 形式，所以用 calc 分步写出同样的逻辑。
example : 2 = Nat.succ (Nat.succ 0) := by
  calc 2 = Nat.succ 1 := two_eq_succ_one              -- 第一步：把 2 改写为 succ 1
       _ = Nat.succ (Nat.succ 0) := by rw [one_eq_succ_zero]  -- 第二步：把 1 改写为 succ 0

-- 示例 4：另一种证法——从右边往回改写（反向 rw）
-- 用 ← 表示反向使用引理：把 succ 0 改回 1，再把 succ 1 改回 2。
-- 浏览器中的证法：
--   rw [← one_eq_succ_zero]  -- 2 = succ (succ 0)  →  2 = succ 1
--   rw [← two_eq_succ_one]   -- 2 = succ 1          →  2 = 2
--   rfl
-- 本地 Lean 4 会自动化简，一行 rw 即可完成（无需 rfl）。
example : 2 = Nat.succ (Nat.succ 0) := by
  rw [← one_eq_succ_zero, ← two_eq_succ_one]
