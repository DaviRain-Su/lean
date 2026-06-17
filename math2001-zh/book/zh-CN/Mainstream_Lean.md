# 过渡到主流 Lean

> 本译文对应原书 [Transitioning to mainstream Lean](https://hrmacbeth.github.io/math2001/Mainstream_Lean.html)；英文 Sphinx 源：`Mainstream_Lean.rst`。

若你喜欢本书，可能希望继续深入 Lean，例如通读 [Mathematics in Lean](https://leanprover-community.github.io/mathematics_in_lean/)（[Lean 中的数学](https://leanprover.cn/mathematics-in-lean/)），或启动一个[独立形式化项目](https://github.com/leanprover-community/mathlib4/wiki/Using-mathlib4-as-a-dependency)。

你会发现本书使用的 Lean「方言」与库 [mathlib](https://github.com/leanprover-community/mathlib4) 及其配套文献（如 *Mathematics in Lean*）所使用的主流数学 Lean 有所不同。为帮助你过渡，本附录概述主要差异。

本书使用的某些策略是 mathlib 中对应策略的刻意弱化版本：我这样做是为了限制 Lean 的某些能力，因为本书层次的散文证明通常会把手算细节写全。这些刻意弱化的策略包括：

| mathlib 策略 | 本书弱化版本 | 差异 |
| --- | --- | --- |
| `norm_num` | `numbers` | `norm_num` 可完成本书要求读者手算的一些计算，包括模 $n$ 化简、处理逻辑，以及检验整除性与素性 |
| `gcongr` | `rel` | `gcongr` 不要求你指明正在代入哪些假设 |
| `linarith` | `addarith` | `linarith` 可对线性不等式取常数倍、加减常数，可合并多条线性不等式，且不要求指明所用假设 |
| `duper` | `exhaust` | `duper` 可处理含量词的逻辑任务，而不只是无量词的情形 |

本书使用的某些策略在 mathlib 中没有直接对应物。它们通常是对一小撮引理的封装；在 mathlib 中这些引理会按名称调用。

| 本书策略 | 封装的引理 |
| --- | --- |
| `extra` | `Int.modEq_fac_zero`、`le_add_of_nonneg_right`、`lt_add_of_pos_right` 等，配合策略 `positivity` |
| `cancel` | `mul_left_cancel₀`、`lt_of_pow_lt_pow`、`pos_of_mul_pos_left` 等，配合策略 `positivity` |
| `simple_induction`<br>`induction_from_starting_point`<br>`two_step_induction`<br>`two_step_induction_from_starting_point` | `Nat.le_induction`、`Nat.twoStepInduction` 等，配合策略 `induction` 或 `induction'` |

本书许多题目在 mathlib 风格的 Lean 中会高效得多，因为有些步骤序列可被超出本书数学范围的进阶算法一步完成。需注意的这类策略包括：

| 算法 | mathlib 策略 | 可替代的步骤类型 |
| --- | --- | --- |
| [Fourier–Motzkin 消元](https://en.wikipedia.org/wiki/Fourier%E2%80%93Motzkin_elimination) | `linarith` | `addarith`、`rel`、`ring`、`numbers` |
| [Gröbner 基](https://en.wikipedia.org/wiki/Gr%C3%B6bner_basis) | `polyrith` | `rw`、`ring` |
| [叠加演算](https://en.wikipedia.org/wiki/Superposition_calculus) | `duper` | 证明或子证明末尾的逻辑策略 |

本书未涉及的另一点是如何与库交互。mathlib 包含逾百万行 Lean 代码，要弄清你想要的引理是否已在库中并不总是容易！本书通过事先告诉你我期望你使用的引理名称来回避这一问题。

与库交互时需注意的几点：

* [在线文档](https://leanprover-community.github.io/mathlib4_docs/) 通常比源码更易读：可搜索，且有内部超链接。
* 引理常以极高一般性陈述……例如 $(a - b) + c = a - (b - c)$ [被陈述为](https://leanprover-community.github.io/mathlib4_docs/Mathlib/Algebra/Group/Basic.html#sub_sub)对 `SubtractionCommMonoid` 成立，而非对 $\mathbb{R}$。学完抽象代数与点集拓扑入门课后，你可能更容易与库打交道。
* 若能猜出引理的精确陈述，策略 `exact?` 会在库中找到它。

以上只是皮毛：Lean 还有许多功能可助你在数学探索中前进。*Mathematics in Lean*、[社区网站](https://leanprover-community.github.io/)与[社区讨论板](https://leanprover.zulipchat.com/)提供更多探索线索。祝玩得开心！