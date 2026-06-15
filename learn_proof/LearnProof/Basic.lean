def hello := "world"

-- 调试与查看工具速查：
-- ┌─────────────┬──────────────────────────────────────────────────────────┐
-- │ 方法        │ 作用                                                     │
-- ├─────────────┼──────────────────────────────────────────────────────────┤
-- │ trace_state │ 打印当前目标 ⊢ ...（运行 lake build 可在终端看到）       │
-- ├─────────────┼──────────────────────────────────────────────────────────┤
-- │ dbg_trace   │ 打印自定义文字，如 dbg_trace "执行 rw 之前"              │
-- ├─────────────┼──────────────────────────────────────────────────────────┤
-- │ show        │ 确认当前目标形状；类型不对会报错，相当于「断言」         │
-- ├─────────────┼──────────────────────────────────────────────────────────┤
-- │ have        │ 给中间结果起名，如 have h := ...，便于查看和复用         │
-- ├─────────────┼──────────────────────────────────────────────────────────┤
-- │ calc        │ 把每一步等式写进证明，过程本身可见                       │
-- ├─────────────┼──────────────────────────────────────────────────────────┤
-- │ sorry       │ 故意留空，暂停在该步；Infoview 显示剩余目标（学完删掉）  │
-- ├─────────────┼──────────────────────────────────────────────────────────┤
-- │ #check      │ 查看表达式/引理的类型                                    │
-- ├─────────────┼──────────────────────────────────────────────────────────┤
-- │ #eval       │ 计算表达式的值（如 #eval 1 + 1 得 2）                    │
-- ├─────────────┼──────────────────────────────────────────────────────────┤
-- │ #reduce     │ 查看定义展开/化简后的结果                                │
-- ├─────────────┼──────────────────────────────────────────────────────────┤
-- │ Infoview    │ 光标放在 tactic 行，右侧看 Goals，无需运行 build         │
-- └─────────────┴──────────────────────────────────────────────────────────┘

-- 示例 1：rfl 战术
-- rfl（reflexivity）用于证明「两边完全相同」的等式，即 X = X 的形式。
example (x q : Nat) : 37 * x + q = 37 * x + q := by
  trace_state  -- 初始目标
  rfl           -- 左右两边一模一样，直接 reflexivity 得证

-- 示例 2：rw 战术（用假设改写目标）
-- rw [h] 会把目标里出现的 h 左边，替换成 h 右边。
example (x y : Nat) (h : y = x + 7) : 2 * y = 2 * (x + 7) := by
  trace_state  -- ⊢ 2 * y = 2 * (x + 7)
  rw [h]       -- 把 y 改写为 x + 7
  trace_state  -- ⊢ 2 * (x + 7) = 2 * (x + 7)，随后自动完成

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

-- 示例 3a：浏览器第二步——把 succ 1 中的 1 改写为 succ 0
theorem step_succ_one : Nat.succ 1 = Nat.succ (Nat.succ 0) := by
  trace_state  -- ⊢ Nat.succ 1 = (Nat.succ 0).succ
  rw [one_eq_succ_zero]
  trace_state  -- ⊢ (Nat.succ 0).succ = (Nat.succ 0).succ，随后自动完成

-- 示例 3b：证明 2 = succ (succ 0)（正向改写，从左边的 2 出发）
-- 浏览器中的证法：
--   rw [two_eq_succ_one]   -- 2 = succ (succ 0)  →  succ 1 = succ (succ 0)
--   rw [one_eq_succ_zero]  -- succ 1 = succ (succ 0)  →  succ (succ 0) = succ (succ 0)
--   rfl
example : 2 = Nat.succ (Nat.succ 0) := by
  trace_state        -- ⊢ 2 = (Nat.succ 0).succ
  rw [two_eq_succ_one]
  trace_state        -- 本地 Lean 4 此处通常已自动完成；浏览器里此时为 ⊢ succ 1 = succ (succ 0)

-- 示例 3c：calc 写法（把中间等式写进证明里，过程一目了然）
example : 2 = Nat.succ (Nat.succ 0) := by
  calc 2 = Nat.succ 1 := two_eq_succ_one
       _ = Nat.succ (Nat.succ 0) := by
            trace_state
            rw [one_eq_succ_zero]
            trace_state

-- 示例 4：从右边往回改写（反向 rw）
-- 浏览器中的证法：
--   rw [← one_eq_succ_zero]  -- 2 = succ (succ 0)  →  2 = succ 1
--   rw [← two_eq_succ_one]   -- 2 = succ 1          →  2 = 2
--   rfl
example : 2 = Nat.succ (Nat.succ 0) := by
  trace_state                              -- ⊢ 2 = (Nat.succ 0).succ
  rw [← one_eq_succ_zero, ← two_eq_succ_one]
  trace_state                              -- 改写完成后自动得证

-- 示例 5：调试工具演示（show / dbg_trace / have）
example : 2 = Nat.succ (Nat.succ 0) := by
  show 2 = Nat.succ (Nat.succ 0)           -- 确认当前目标；写错形状会报错
  dbg_trace "── 正向改写开始 ──"
  have after_two : 2 = Nat.succ 1 := two_eq_succ_one  -- 给中间结果命名
  dbg_trace "── 已得到 2 = succ 1 ──"
  trace_state
  rw [after_two]
  trace_state

-- 示例 6：在证明外查看类型和值（#check / #eval / #reduce）
#check one_eq_succ_zero          -- 查看引理类型：1 = Nat.succ 0
#check two_eq_succ_one           -- 查看引理类型：2 = Nat.succ 1
#eval 1 + 1                      -- 计算得 2
#reduce Nat.succ (Nat.succ 0)    -- 化简得 2

-- 示例 7：sorry 暂停观察（仅学习时用，提交前必须删掉）
-- 用法：在某一步后写 sorry，光标停在该行，Infoview 显示还没证完的目标。
-- example : 2 = Nat.succ (Nat.succ 0) := by
--   rw [two_eq_succ_one]
--   sorry   -- 停在这里：浏览器中此时目标为 ⊢ succ 1 = succ (succ 0)

-- 示例 8：add_zero —— 依赖类型的引理（定理是「函数」）
--
-- 引理签名：Nat.add_zero (a : Nat) : a + 0 = a
-- add_zero a 是「a + 0 = a」的一个证明。
--
-- 摘要：
-- add_zero 实际上是一个函数：接收一个自然数 a，返回关于 a 的定理证明。
-- 例如 Nat.add_zero 37 是 37 + 0 = 37 的证明。
--
-- rw 与省略参数：
-- rw [Nat.add_zero] 时不必手写 a，Lean 会根据目标里出现的 a + 0 自动推断该填哪个数。
--
-- 详细理解（数学家视角）：
-- add_zero 也可以看作「一件事」——∀ n ∈ ℕ, n + 0 = n 的证明。
-- 等价地说：对任意 n，都能拿出一个 n + 0 = n 的证明；所以它是一个
-- Nat → Prop 的函数（依赖类型：输入 n，输出类型为 n + 0 = n 这个命题的证明）。
#check Nat.add_zero              -- Nat.add_zero (n : Nat) : n + 0 = n
#check Nat.add_zero 37           -- Nat.add_zero 37 : 37 + 0 = 37
#check @Nat.add_zero             -- ∀ (n : Nat), n + 0 = n

-- 同一目标的两种证法（结论相同，写法侧重不同）：
-- ┌────────┬────────────────────────────────────────────────────────────────┐
-- │ 证法   │ 说明                                                           │
-- ├────────┼────────────────────────────────────────────────────────────────┤
-- │ 8a     │ 两次都省略参数，Lean 自动推断先改 b + 0、再改 c + 0            │
-- ├────────┼────────────────────────────────────────────────────────────────┤
-- │ 8b     │ 先显式写 Nat.add_zero c，再省略参数改 b + 0                    │
-- │        │ 适合理解「定理是函数」：先看清函数调用，再练习自动推断         │
-- └────────┴────────────────────────────────────────────────────────────────┘
-- 改写顺序可以互换（先 b 后 c，或先 c 后 b），因为两个 + 0 互不依赖。

-- 示例 8a：两次省略参数（Lean 自动推断）
example (a b c : Nat) : a + (b + 0) + (c + 0) = a + b + c := by
  trace_state                    -- ⊢ a + (b + 0) + (c + 0) = a + b + c
  rw [Nat.add_zero]              -- 推断 add_zero b：b + 0 → b
  trace_state                    -- ⊢ a + b + (c + 0) = a + b + c
  rw [Nat.add_zero]              -- 推断 add_zero c：c + 0 → c
  trace_state                    -- ⊢ a + b + c = a + b + c，随后自动完成

-- 示例 8b：显式传参 + 省略参数（先 c 后 b）
example (a b c : Nat) : a + (b + 0) + (c + 0) = a + b + c := by
  trace_state                    -- ⊢ a + (b + 0) + (c + 0) = a + b + c
  rw [Nat.add_zero c]            -- 显式：Nat.add_zero c 即 c + 0 = c 的证明
  trace_state                    -- ⊢ a + (b + 0) + c = a + b + c
  rw [Nat.add_zero]              -- 省略：Lean 从 b + 0 推断 add_zero b
  trace_state                    -- ⊢ a + b + c = a + b + c，随后自动完成

-- 示例 9：证明 succ n = n + 1
--
-- 浏览器 NNG 证法（你的思路，逻辑正确）：
--   rw [one_eq_succ_zero]  -- succ n = n + 1       →  succ n = n + succ 0
--   rw [Nat.add_succ]      -- succ n = n + succ 0   →  succ n = succ (n + 0)
--   rw [Nat.add_zero]      -- succ n = succ (n + 0) →  succ n = succ n
--   rfl
--
-- 本地 Lean 4 为何报错「No goals to be solved」？
-- 执行完第一步 rw [one_eq_succ_zero] 后，Lean 会把 n + succ 0 立刻化简为 succ n，
-- 目标已经证完，后面的 rw [Nat.add_succ] 就没有目标可改了。
-- 这不是你思路错了，而是本地环境自动化简比浏览器更激进。
--
-- 引理方向提醒：
--   one_eq_succ_zero : 1 = succ 0        →  rw 会把 1 换成 succ 0
--   Nat.add_succ n m : n + succ m = succ (n + m)
--   Nat.add_zero n   : n + 0 = n

-- 9a：浏览器风格 rw 证法（在 NNG 里逐步执行；本地勿直接跑，第一步后目标已自动关闭）
-- theorem succ_eq_add_one (n : Nat) : Nat.succ n = n + 1 := by
--   rw [one_eq_succ_zero]
--   rw [Nat.add_succ]
--   rw [Nat.add_zero]
--   rfl

-- 9b：本地可逐步看到过程的 calc 证法（symm 后从 n + 1 一侧推到 succ n）
theorem succ_eq_add_one (n : Nat) : Nat.succ n = n + 1 := by
  symm
  calc n + 1 = n + Nat.succ 0 := by
         trace_state
         rw [one_eq_succ_zero]    -- 1 → succ 0
         trace_state
       _ = Nat.succ (n + 0) := by
         trace_state
         rw [Nat.add_succ]        -- n + succ 0 → succ (n + 0)
         trace_state
       _ = Nat.succ n := by
         trace_state
         rw [Nat.add_zero]        -- n + 0 → n
         trace_state
