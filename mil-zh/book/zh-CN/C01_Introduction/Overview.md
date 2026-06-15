# 概述

简而言之，Lean 是在名为**依赖类型论**（dependent type theory）的形式语言中构造复杂表达式的工具。

每个表达式都有一个**类型**（type），可用 `#check` 命令打印。有些表达式的类型是 `ℕ` 或 `ℕ → ℕ`，它们表示数学对象：

```lean
#check 2 + 2

def f (x : ℕ) :=
  x + 3

#check f
```

有些表达式的类型是 `Prop`，它们表示数学命题：

```lean
#check 2 + 2 = 4

def FermatLastTheorem :=
  ∀ x y z n : ℕ, n > 2 ∧ x * y * z ≠ 0 → x ^ n + y ^ n ≠ z ^ n

#check FermatLastTheorem
```

有些表达式的类型是 `P`，而 `P` 本身的类型是 `Prop`。这样的表达式就是命题 `P` 的**证明**（proof）：

```lean
theorem easy : 2 + 2 = 4 :=
  rfl

#check easy

theorem hard : FermatLastTheorem :=
  sorry

#check hard
```

若你能构造出类型为 `FermatLastTheorem` 的表达式，且 Lean 接受它为该类型的项，你就完成了一件非常了不起的事。（使用 `sorry` 是作弊，Lean 知道这一点。）现在你明白了游戏规则，剩下要学的只是规则本身。

本书与配套教程 [*Theorem Proving in Lean*](https://leanprover.github.io/theorem_proving_in_lean4/) 互补；后者更系统地介绍 Lean 的底层逻辑框架与核心语法。*Theorem Proving in Lean* 适合喜欢先把用户手册从头到尾读完再开洗碗机的人。若你更喜欢直接按开始键、以后再摸索「锅刷」功能，从这里起步、必要时回头查阅 *Theorem Proving in Lean* 更合适。

*Mathematics in Lean* 与 *Theorem Proving in Lean* 的另一大区别是：本书更强调**策略**（tactics）的使用。我们要构造复杂表达式时，Lean 提供两种方式：直接写下表达式本身（即合适的文本描述），或给 Lean 提供**如何构造**它们的指令。例如，下列表达式证明：若 `n` 为偶数，则 `m * n` 也为偶数：

```lean
example : ∀ m n : Nat, Even n → Even (m * n) := fun m n ⟨k, (hk : n = k + k)⟩ ↦
  have hmn : m * n = m * k + m * k := by rw [hk, mul_add]
  show ∃ l, m * n = l + l from ⟨_, hmn⟩
```

这个**证明项**（proof term）可以压缩为一行：

```lean
example : ∀ m n : Nat, Even n → Even (m * n) :=
fun m n ⟨k, hk⟩ ↦ ⟨m * k, by rw [hk, mul_add]⟩
```

下面则是同一定理的**策略式证明**（tactic-style proof）；以 `--` 开头的行是注释，Lean 会忽略：

```lean
example : ∀ m n : Nat, Even n → Even (m * n) := by
  -- Say `m` and `n` are natural numbers, and assume `n = 2 * k`.
  rintro m n ⟨k, hk⟩
  -- We need to prove `m * n` is twice a natural number. Let's show it's twice `m * k`.
  use m * k
  -- Substitute for `n`,
  rw [hk]
  -- and now it's obvious.
  ring
```

在 VS Code 中输入这样证明的每一行时，Lean 会在单独窗口显示**证明状态**（proof state），告诉你已建立的事实和仍需完成的任务。你可以逐行回放证明，Lean 会持续显示光标所在位置的证明状态。在本例中，你会看到证明第一行引入了 `m` 和 `n`（若愿意，此时可重命名），并将假设 `Even n` 分解为某个 `k` 以及 `n = 2 * k`。第二行 `use m * k` 声明：将通过证明 `m * n = 2 * (m * k)` 来说明 `m * n` 为偶数。下一行用 `rw` 策略在目标中用 `2 * k` 替换 `n`（`rw` 表示 rewrite，重写），`ring` 策略则解决剩余目标 `m * (2 * k) = 2 * (m * k)`。

能够分小步构造证明并获得增量反馈，极其强大。因此策略证明往往比证明项更容易、更快写出。两者并非截然对立：策略证明可以嵌入证明项，如上例中的 `by rw [hk, mul_add]`。反之，在策略证明中间插入短证明项也很有用。本书将重点放在策略的使用上。

本例的策略证明也可压缩为一行：

```lean
example : ∀ m n : Nat, Even n → Even (m * n) := by
  rintro m n ⟨k, hk⟩; use m * k; rw [hk]; ring
```

这里我们用策略完成小步证明；它们也能提供 substantial 自动化，支撑较长计算和更大推理步。例如，可调用 Lean 的化简器（simplifier），配合关于奇偶性的规则自动证明该定理：

```lean
example : ∀ m n : Nat, Even n → Even (m * n) := by
  intros; simp [*, parity_simps]
```

两本入门书的另一大区别是：*Theorem Proving in Lean* 只依赖 Lean 核心与内置策略，而 *Mathematics in Lean* 建立在强大且持续增长的库 *Mathlib* 之上。因此我们可以展示如何使用库中的数学对象、定理和实用策略。本书并非 Mathlib 的完整概览；[社区网站](https://leanprover-community.github.io/) 有详尽文档。我们的目标是介绍形式化背后的思维方式，并指出基本入口，使你能够浏览库并自行查找内容。

交互式定理证明可能令人沮丧，学习曲线陡峭。但 Lean 社区对新来者非常友好，[Lean Zulip 聊天群](https://leanprover.zulipchat.com/) 全天候有人答疑。希望能在那里见到你；我们毫不怀疑，不久你也能回答这类问题，并为 *Mathlib* 的开发做贡献。

若你接受这一使命：深入阅读、完成练习、带着问题来到 Zulip、享受过程。但请有所准备：交互式定理证明会以根本性的新方式挑战你对数学与数学推理的思考，你的生活或许从此不同。

**致谢。** 我们感谢 Gabriel Ebner 搭建在 VS Code 中运行本教程的基础设施，感谢 Kim Morrison 与 Mario Carneiro 协助移植到 Lean 4，并感谢 Takeshi Abe、Julian Berman、Alex Best、Axel Boldt、Thomas Browning、Bulwi Cha、Hanson Char、Bryan Gin-ge Chen、Steven Clontz、Mauricio Collaris、Johan Commelin、Mark Czubin、Alexandru Duca、Pierpaolo Frasa、Denis Gorbachev、Winston de Greef、Darij Grinberg、Mathieu Guay-Paquet、Rik Heurter、Marc Huisinga、Benjamin Jones、Julian Külshammer、Victor Liu、Jimmy Lu、Martin C. Martin、Giovanni Mascellani、John McDowell、Joseph McKinsey、Bhavik Mehta、Sebastian Miele、Isaiah Mindich、Kabelo Moiloa、Hunter Monroe、Pietro Monticone、Oliver Nash、Emanuelle Natale、Filippo A. E. Nuccio、Pim Otte、Nicolas Rolland、Keith Rush、Yannick Seurin、Guilherme Silva、Bernardo Subercaseaux、Pedro Sánchez Terraf、Matthew Toohey、Alistair Tucker、Floris van Doorn、Veniamin Viflyantsev、Eric Wieser 等人的帮助与勘误。我们的工作部分得到 Hoskinson Center for Formal Mathematics 的支持。