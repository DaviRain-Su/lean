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
theorem three_eq_succ_two : (3 : Nat) = Nat.succ 2 := rfl  -- 3 = succ 2
theorem four_eq_succ_three : (4 : Nat) = Nat.succ 3 := rfl   -- 4 = succ 3

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

-- 示例 10：证明 2 + 2 = 4
--
-- 浏览器 NNG 证法：
--   nth_rewrite 2 [two_eq_succ_one]  -- 只改第二个 2 → succ 1
--   rw [add_succ]
--   rw [one_eq_succ_zero]
--   rw [add_succ, add_zero]
--   rw [← three_eq_succ_two]
--   rw [← four_eq_succ_three]
--   rfl
--
-- 本地修复要点：
--   1. nth_rewrite 在标准 Lean 4 不可用 → 用 rw (occs := .pos [2]) 或 conv
--   2. add_succ / add_zero → Nat.add_succ / Nat.add_zero
--   3. 需补充 three_eq_succ_two、four_eq_succ_three
--   4. 本地会自动化简，rw 链可能第一步就结束；calc 可逐步看到过程

-- 10a：浏览器 rw 链（NNG 里逐步执行；本地第一步后常已证完）
-- example : 2 + 2 = 4 := by
--   rw (occs := .pos [2]) [two_eq_succ_one]  -- 等价于 nth_rewrite 2
--   rw [Nat.add_succ]
--   rw [one_eq_succ_zero]
--   rw [Nat.add_succ, Nat.add_zero]
--   rw [← three_eq_succ_two]
--   rw [← four_eq_succ_three]
--   rfl

-- 10b：本地可编译的 calc 证法（对应 NNG 每一步）
example : 2 + 2 = 4 := by
  calc 2 + 2 = 2 + Nat.succ 1 := by
         -- 只改第二个 2（nth_rewrite 2 的本地写法）
         rw (occs := .pos [2]) [two_eq_succ_one]
       _ = Nat.succ (2 + 1) := by rw [Nat.add_succ]
       _ = Nat.succ (2 + Nat.succ 0) := by rw [one_eq_succ_zero]
       _ = Nat.succ (Nat.succ (2 + 0)) := by rw [Nat.add_succ]
       _ = Nat.succ (Nat.succ 2) := by rw [Nat.add_zero]
       _ = Nat.succ 3 := by rw [← three_eq_succ_two]
       _ = 4 := by rw [← four_eq_succ_three]

-- 示例 11：归纳法证明 zero_add —— 0 + n = n
--
-- Nat.add_succ n m : n + succ m = succ (n + m)
-- 它改写的是「n + succ m」这种形状，要用在当前目标上，不是随便用在假设上。
--
-- 常见错误：rw [Nat.add_succ] at hd
--   hd 的类型是 0 + d = d，左边是 0 + d（d 不一定是 succ 形式），
--   匹配不到 ?n + Nat.succ ?m，所以报错。
--
-- 正确思路（succ 步）：
--   目标：0 + (d + 1) = d + 1
--   rw [Nat.add_succ]     →  succ (0 + d) = d + 1
--   rw [hd]               →  用归纳假设 0 + d = d
--   rfl

theorem zero_add (n : Nat) : 0 + n = n := by
  induction n with
  | zero => rw [Nat.add_zero]   -- 基础步：0 + 0 = 0
  | succ d hd =>
    trace_state                 -- ⊢ 0 + (d + 1) = d + 1
    rw [Nat.add_succ]           -- ⊢ succ (0 + d) = d + 1
    trace_state
    rw [hd]                     -- 用归纳假设 hd : 0 + d = d
    trace_state                 -- ⊢ succ d = d + 1，随后自动完成

-- 示例 12：归纳法证明 succ_add —— succ a + b = succ (a + b)
--
-- 浏览器 NNG 写法（对 b 归纳）：
--   induction b with
--   | zero => rw [add_zero, add_zero]; rfl
--   | succ d hd =>
--       rw [add_succ]    -- 改左边：succ a + (d+1) → succ (succ a + d)
--       rw [add_succ]    -- 改右边：a + (d+1) → succ (a + d)
--       rw [hd]          -- 用归纳假设 succ a + d = succ (a + d)
--       rfl
--
-- 两种本地写法等价，差别只在 succ 步「先改哪边」：
-- ┌────────┬──────────────────────────────────────────────────────────────┐
-- │ 12a    │ 浏览器风格：两次正向 add_succ（左一次、右一次），再 rw [hd]  │
-- ├────────┼──────────────────────────────────────────────────────────────┤
-- │ 12b    │ 先 add_succ + hd，再用 ← add_succ 对齐右边（多一步反向改写）│
-- └────────┴──────────────────────────────────────────────────────────────┘

-- 12a：浏览器风格（推荐，与 NNG 一致）
theorem succ_add (a b : Nat) : Nat.succ a + b = Nat.succ (a + b) := by
  induction b with
  | zero =>
    trace_state                 -- ⊢ succ a + 0 = succ (a + 0)
    rw [Nat.add_zero, Nat.add_zero]
    trace_state                 -- ⊢ succ a = succ a，随后自动完成
  | succ d hd =>
    trace_state                 -- ⊢ succ a + (d + 1) = succ (a + (d + 1))
    rw [Nat.add_succ]           -- 改左边：⊢ succ (succ a + d) = succ (a + (d + 1))
    trace_state
    rw [Nat.add_succ]           -- 改右边：⊢ succ (succ a + d) = succ (succ (a + d))
    trace_state
    rw [hd]                     -- hd : succ a + d = succ (a + d)
    trace_state                 -- ⊢ succ (succ (a + d)) = succ (succ (a + d))，随后自动完成

-- 12b：等价证法（先归纳假设，再反向展开右边）
theorem succ_add' (a b : Nat) : Nat.succ a + b = Nat.succ (a + b) := by
  induction b with
  | zero => rw [Nat.add_zero, Nat.add_zero]
  | succ d hd =>
    rw [Nat.add_succ]
    rw [hd]
    rw [← Nat.add_succ]         -- 本地这一步后仍需 rfl（浏览器用两次 add_succ 代替）
    rfl

-- 示例 13：归纳法证明 add_comm —— a + b = b + a
--
-- 依赖前面证过的 zero_add、succ_add（浏览器里先证 add_succ 再证 add_comm）。
--
-- 基础步 b = 0：a + 0 = 0 + a
--   rw [Nat.add_zero, zero_add]   -- a + 0 → a，0 + a → a
--
-- succ 步（hd : a + d = d + a）：
--   rw [Nat.add_succ]   -- a + (d+1) → succ (a + d)
--   rw [hd]             -- succ (a + d) → succ (d + a)
--   rw [succ_add]       -- 右边 d+1+a 里的 succ d + a 与左边对齐
--   （本地 rw [succ_add] 后常已自动完成，无需 rfl；浏览器里可能要写 rfl）
--
-- 常见报错：最后 rfl 报「No goals to be solved」→ 删掉 rfl 即可，不是证法错了。

theorem add_comm (a b : Nat) : a + b = b + a := by
  induction b with
  | zero =>
    trace_state                 -- ⊢ a + 0 = 0 + a
    rw [Nat.add_zero, zero_add]
    trace_state                 -- ⊢ a = a，随后自动完成
  | succ d hd =>
    trace_state                 -- ⊢ a + (d + 1) = (d + 1) + a
    rw [Nat.add_succ]           -- ⊢ succ (a + d) = (d + 1) + a
    trace_state
    rw [hd]                     -- hd : a + d = d + a
    trace_state                 -- ⊢ succ (d + a) = (d + 1) + a
    rw [succ_add]               -- 用 succ_add d a 对齐右边
    trace_state                 -- ⊢ succ (d + a) = succ (d + a)，随后自动完成

-- 示例 14：归纳法证明 add_assoc —— (a + b) + c = a + (b + c)
--
-- Lean 里 a + b + c 表示 (a + b) + c（左结合）。
-- 对 c 归纳；等式两边最外层同步展开 (d + 1)。
--
-- 基础步 c = 0：
--   (a + b) + 0 = a + (b + 0)  →  rw [add_zero, add_zero]  →  a + b = a + b
--
-- succ 步（hd : (a + b) + d = a + (b + d)）：
--   rw [add_succ, add_succ, add_succ]  -- 两边各展开一次 d+1
--   rw [hd]                            -- 用归纳假设对齐内层

theorem add_assoc (a b c : Nat) : a + b + c = a + (b + c) := by
  induction c with
  | zero =>
    trace_state                 -- ⊢ a + b + 0 = a + (b + 0)
    rw [Nat.add_zero, Nat.add_zero]
    trace_state                 -- ⊢ a + b = a + b，随后自动完成
  | succ d hd =>
    trace_state                 -- ⊢ a + b + (d + 1) = a + (b + (d + 1))
    rw [Nat.add_succ, Nat.add_succ, Nat.add_succ]
    trace_state                 -- ⊢ succ (a + b + d) = succ (a + (b + d))
    rw [hd]                     -- hd : a + b + d = a + (b + d)
    trace_state                 -- ⊢ succ (a + (b + d)) = succ (a + (b + d))，随后自动完成

-- 示例 15：add_right_comm —— a + b + c = a + c + b（右边 b、c 可交换）
--
-- 不直接对 b、c 归纳，而是复用已证的 add_assoc、add_comm：
--   ① add_assoc    把左边 (a+b)+c 括号改成 a+(b+c)
--   ② add_comm b c 把中间的 b+c 换成 c+b
--   ③ ← add_assoc   把右边 a+c+b 括号改成 a+(c+b)，与左边一致
--
-- 三步对应目标变化：
--   a + b + c = a + c + b
--   → a + (b + c) = a + c + b
--   → a + (c + b) = a + c + b
--   → a + (c + b) = a + (c + b)

theorem add_right_comm (a b c : Nat) : a + b + c = a + c + b := by
  trace_state                 -- ⊢ (a + b) + c = a + c + b
  rw [add_assoc]              -- ① 左边结合律：⊢ a + (b + c) = a + c + b
  trace_state
  rw [add_comm b c]           -- ② 交换 b、c：⊢ a + (c + b) = a + c + b
  trace_state
  rw [← add_assoc]            -- ③ 右边结合律反向：⊢ a + (c + b) = a + (c + b)
  trace_state                 -- 随后自动完成

-- 示例 16：mul_one —— m * 1 = m
--
-- 思路：先把 1 展开成 succ 0，再用乘法引理化成加法，最后用 zero_add。
--
-- 目标变化：
--   m * 1 = m
--   → m * succ 0 = m          （one_eq_succ_zero）
--   → m * 0 + m = m           （mul_succ）
--   → 0 + m = m               （mul_zero）
--   → m = m                     （zero_add）

theorem mul_one (m : Nat) : m * 1 = m := by
  trace_state                 -- ⊢ m * 1 = m
  rw [one_eq_succ_zero]       -- 1 → succ 0
  trace_state                 -- ⊢ m * succ 0 = m
  rw [Nat.mul_succ]           -- m * succ 0 → m * 0 + m
  trace_state                 -- ⊢ m * 0 + m = m
  rw [Nat.mul_zero]           -- m * 0 → 0
  trace_state                 -- ⊢ 0 + m = m
  rw [zero_add]               -- 用已证的 zero_add
  trace_state                 -- ⊢ m = m，随后自动完成

-- 示例 17：归纳法证明 zero_mul —— 0 * m = 0
--
-- 浏览器 NNG 证法（对 m 归纳）：
--   | zero  => rw [mul_zero]; rfl
--   | succ d hd =>
--       rw [mul_succ]    -- 0 * (d+1) = 0 * d + 0
--       rw [hd]          -- 0 + 0 = 0
--       rw [add_zero]    -- 0 = 0   ← 浏览器需要，本地常可省略
--       rfl              --         ← 浏览器需要，本地常可省略
--
-- 本地 vs 浏览器：
-- ┌──────────┬────────────────────────────────────────────────────────┐
-- │ 浏览器多出的步骤 │ 原因                                              │
-- ├──────────┼────────────────────────────────────────────────────────┤
-- │ 基础步 rfl     │ NNG 里 rw [mul_zero] 后目标为 0 = 0，需 rfl 收尾   │
-- ├──────────┼────────────────────────────────────────────────────────┤
-- │ rw [add_zero]  │ rw [hd] 后得 0 + 0 = 0，浏览器需再化简为 0 = 0     │
-- ├──────────┼────────────────────────────────────────────────────────┤
-- │ succ 步 rfl    │ add_zero 后 0 = 0，浏览器需 rfl                    │
-- └──────────┴────────────────────────────────────────────────────────┘

-- 17a：本地版（浏览器 succ 步的 add_zero、rfl 在这里通常可省略）
theorem zero_mul (m : Nat) : 0 * m = 0 := by
  induction m with
  | zero =>
    trace_state                 -- ⊢ 0 * 0 = 0
    rw [Nat.mul_zero]
    trace_state                 -- ⊢ 0 = 0（浏览器此处要 rfl）
  | succ d hd =>
    trace_state                 -- ⊢ 0 * (d + 1) = 0
    rw [Nat.mul_succ]           -- ⊢ 0 * d + 0 = 0
    trace_state
    rw [hd]                     -- hd : 0 * d = 0，⊢ 0 + 0 = 0
    trace_state                 -- 浏览器此处还要 rw [add_zero]; rfl

-- 17b：浏览器完整版（NNG 里逐步执行；本地勿直接跑，add_zero/rfl 会报 No goals）
-- theorem zero_mul (m : Nat) : 0 * m = 0 := by
--   induction m with
--   | zero => rw [Nat.mul_zero]; rfl
--   | succ d hd =>
--       rw [Nat.mul_succ]
--       rw [hd]
--       rw [Nat.add_zero]
--       rfl

-- 示例 18：归纳法证明 succ_mul —— succ a * b = a * b + b
--
-- 对 b 归纳（NNG 乘法世界标准证法）：
--
-- 基础步 b = 0：
--   succ a * 0 = 0，a * 0 + 0 = 0 + 0 = 0  →  mul_zero + zero_add
--
-- succ 步（hd : succ a * d = a * d + d）目标：succ a * (d+1) = a * (d+1) + (d+1)
--   ① mul_succ ×2   两边展开 (d+1)
--   ② rw [hd]       左边 succ a * d 换成 a * d + d
--   ③ add_assoc ×2  调整括号，把 d+a.succ 凑在一起
--   ④ add_succ      d + succ a → succ (d + a)
--   ⑤ add_comm d a  d + a → a + d
--   ⑥ ← add_succ     a + (d+1) 展开，与右边对齐
--
-- 更简写法（18b）：succ 步一行 rw 写完 ②–⑥

-- 18a：分步版（便于 trace_state 观察）
theorem succ_mul (a b : Nat) : Nat.succ a * b = a * b + b := by
  induction b with
  | zero =>
    trace_state                 -- ⊢ succ a * 0 = a * 0 + 0
    rw [Nat.mul_zero, Nat.mul_zero, zero_add]
    trace_state                 -- ⊢ 0 = 0，随后自动完成
  | succ d hd =>
    trace_state                 -- ⊢ succ a * (d + 1) = a * (d + 1) + (d + 1)
    rw [Nat.mul_succ, Nat.mul_succ]
    trace_state                 -- ⊢ succ a * d + succ a = a * d + a + (d + 1)
    rw [hd]                     -- hd : succ a * d = a * d + d
    trace_state                 -- ⊢ a * d + d + succ a = a * d + a + (d + 1)
    rw [add_assoc, add_assoc]   -- 括号调整
    trace_state                 -- ⊢ a * d + (d + succ a) = a * d + (a + (d + 1))
    rw [Nat.add_succ]           -- d + succ a → succ (d + a)
    trace_state                 -- ⊢ a * d + succ (d + a) = a * d + (a + (d + 1))
    rw [add_comm d a]           -- succ (d + a) 里 d+a → a+d
    trace_state                 -- ⊢ a * d + succ (a + d) = a * d + (a + (d + 1))
    rw [← Nat.add_succ]         -- 右边 a + (d+1) 展开
    trace_state                 -- ⊢ a * d + succ (a + d) = a * d + succ (a + d)，随后自动完成

-- 18b：简洁版（逻辑与 18a 相同）
theorem succ_mul' (a b : Nat) : Nat.succ a * b = a * b + b := by
  induction b with
  | zero => rw [Nat.mul_zero, Nat.mul_zero, zero_add]
  | succ d hd =>
    rw [Nat.mul_succ, Nat.mul_succ, hd, add_assoc, add_assoc,
        Nat.add_succ, add_comm d a, ← Nat.add_succ]


-- 示例 19：归纳法证明 mul_comm —— a * b = b * a
--
-- 对 b 归纳，复用 zero_mul、succ_mul：
--
-- 基础步 b = 0：
--   a * 0 = 0 = 0 * a  →  rw [mul_zero, zero_mul]
--
-- succ 步（hd : a * d = d * a）：
--   rw [mul_succ]   -- a * (d+1) = a * d + a
--   rw [hd]         -- a * d → d * a，得 d * a + a = (d+1) * a
--   rw [succ_mul]   -- (d+1) * a = d * a + a（Lean 推断 succ_mul d a）
--
-- 更简写法（19b）：succ 步 rw [mul_succ, hd, succ_mul]

theorem mul_comm (a b : Nat) : a * b = b * a := by
  induction b with
  | zero =>
    trace_state                 -- ⊢ a * 0 = 0 * a
    rw [Nat.mul_zero, zero_mul]
    trace_state                 -- ⊢ 0 = 0，随后自动完成
  | succ d hd =>
    trace_state                 -- ⊢ a * (d + 1) = (d + 1) * a
    rw [Nat.mul_succ]           -- ⊢ a * d + a = (d + 1) * a
    trace_state
    rw [hd]                     -- hd : a * d = d * a
    trace_state                 -- ⊢ d * a + a = (d + 1) * a
    rw [succ_mul]               -- 右边 (d+1)*a → d*a + a
    trace_state                 -- ⊢ d * a + a = d * a + a，随后自动完成

-- 19b：简洁版
theorem mul_comm' (a b : Nat) : a * b = b * a := by
  induction b with
  | zero => rw [Nat.mul_zero, zero_mul]
  | succ d hd => rw [Nat.mul_succ, hd, succ_mul]

-- ============================================================================
-- 简写速查：本地 Lean 4 可编译的紧凑证法
-- ============================================================================
-- 说明：带 trace_state 的分步版用于学习；下面是与之一致的「能短则短」写法。
-- 浏览器 NNG 里往往还要多写 rfl / add_zero，见各示例的浏览器注释。
--
-- ┌──────────────┬────────────────────────────────────────────────────────────┐
-- │ 定理         │ 简写                                                       │
-- ├──────────────┼────────────────────────────────────────────────────────────┤
-- │ 示例 8       │ rw [Nat.add_zero, Nat.add_zero]                            │
-- │ succ_eq_add_one │ rfl（本地定义相等；浏览器用 rw 链，见 9b）              │
-- │ 示例 10      │ calc 五步（已是最短可读形式）                              │
-- │ zero_add     │ induction n <;> first | rw [Nat.add_zero] | rw [Nat.add_succ, hd] │
-- │ succ_add     │ 见 12c（浏览器风格一行 succ 步）                           │
-- │ add_comm     │ 见 13b                                                     │
-- │ add_assoc    │ 见 14b                                                     │
-- │ add_right_comm │ rw [add_assoc, add_comm b c, ← add_assoc]              │
-- │ mul_one      │ rw [one_eq_succ_zero, Nat.mul_succ, Nat.mul_zero, zero_add] │
-- │ zero_mul     │ induction m <;> first | rw [Nat.mul_zero] | rw [Nat.mul_succ, hd] │
-- │ succ_mul     │ 见 18b                                                     │
-- │ mul_comm     │ 见 19b                                                     │
-- └──────────────┴────────────────────────────────────────────────────────────┘

-- 8c：add_zero 练习简写
example (a b c : Nat) : a + (b + 0) + (c + 0) = a + b + c := by
  rw [Nat.add_zero, Nat.add_zero]

-- 9c：本地一行（浏览器需 9a 注释中的 rw 链）
theorem succ_eq_add_one' (n : Nat) : Nat.succ n = n + 1 := rfl

-- 11b
theorem zero_add' (n : Nat) : 0 + n = n := by
  induction n with
  | zero => rw [Nat.add_zero]
  | succ d hd => rw [Nat.add_succ, hd]

-- 12c：succ_add 浏览器风格简写（succ 步一行）
theorem succ_add'' (a b : Nat) : Nat.succ a + b = Nat.succ (a + b) := by
  induction b with
  | zero => rw [Nat.add_zero, Nat.add_zero]
  | succ d hd => rw [Nat.add_succ, Nat.add_succ, hd]

-- 13b
theorem add_comm' (a b : Nat) : a + b = b + a := by
  induction b with
  | zero => rw [Nat.add_zero, zero_add]
  | succ d hd => rw [Nat.add_succ, hd, succ_add]

-- 14b
theorem add_assoc' (a b c : Nat) : a + b + c = a + (b + c) := by
  induction c with
  | zero => rw [Nat.add_zero, Nat.add_zero]
  | succ d hd => rw [Nat.add_succ, Nat.add_succ, Nat.add_succ, hd]

-- 15b
theorem add_right_comm' (a b c : Nat) : a + b + c = a + c + b := by
  rw [add_assoc, add_comm b c, ← add_assoc]

-- 16b
theorem mul_one' (m : Nat) : m * 1 = m := by
  rw [one_eq_succ_zero, Nat.mul_succ, Nat.mul_zero, zero_add]

-- 17c
theorem zero_mul' (m : Nat) : 0 * m = 0 := by
  induction m with
  | zero => rw [Nat.mul_zero]
  | succ d hd => rw [Nat.mul_succ, hd]
