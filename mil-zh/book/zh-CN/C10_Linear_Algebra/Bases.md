# 矩阵、基与维数

## 矩阵

在讨论抽象向量空间的基之前，先回到更初等的设定：某域 $K$ 上的 $K^n$。主要对象是向量与矩阵（matrix）。具体向量可用 `![…]` 记号，分量用逗号分隔；具体矩阵用 `!![…]`，行用分号分隔、行内元素用逗号。当分量有可计算类型如 `ℕ` 或 `ℚ` 时，可用 `eval` 命令做基本运算。

```lean
section matrices

-- 向量加法
#eval ![1, 2] + ![3, 4]  -- ![4, 6]

-- 矩阵加法
#eval !![1, 2; 3, 4] + !![3, 4; 5, 6]  -- !![4, 6; 8, 10]

-- 矩阵乘法
#eval !![1, 2; 3, 4] * !![3, 4; 5, 6]  -- !![13, 16; 29, 36]
```

要理解：`#eval` 此处仅用于探索，不能替代 Sage 等计算机代数系统。这里的矩阵数据表示在计算上**毫无效率**——用函数而非数组，为证明而非计算优化。`#eval` 所用的虚拟机也未为此优化。

注意：矩阵记号**按行**列出，而向量记号既非行向量也非列向量。矩阵左（右）乘向量时，向量被解释为行（列）向量。对应运算为 `Matrix.vecMul`（记号 `ᵥ*`）与 `Matrix.mulVec`（记号 `*ᵥ`）。这些记号作用域在 `Matrix` 命名空间，须打开：

```lean
open Matrix

-- 矩阵左乘向量
#eval !![1, 2; 3, 4] *ᵥ ![1, 1] -- ![3, 7]

-- 左乘得到尺寸为一的矩阵
#eval !![1, 2] *ᵥ ![1, 1]  -- ![3]

-- 矩阵右乘向量
#eval  ![1, 1, 1] ᵥ* !![1, 2; 3, 4; 5, 6] -- ![9, 12]
```

要用向量指定相同行或列，用 `Matrix.replicateRow` 与 `Matrix.replicateCol`，参数为索引行或列的类型及向量。例如可得单行或单列矩阵（更精确地，行或列由 `Fin 1` 索引）：

```lean
#eval replicateRow (Fin 1) ![1, 2] -- !![1, 2]

#eval replicateCol (Fin 1) ![1, 2] -- !![1; 2]
```

其他熟悉运算包括向量点积、矩阵转置，对方阵还有行列式（determinant）与迹（trace）：

```lean
-- 向量点积
#eval ![1, 2] ⬝ᵥ ![3, 4] -- `11`

-- 矩阵转置
#eval !![1, 2; 3, 4]ᵀ -- `!![1, 3; 2, 4]`

-- 行列式
#eval !![(1 : ℤ), 2; 3, 4].det -- `-2`

-- 迹
#eval !![(1 : ℤ), 2; 3, 4].trace -- `5`
```

分量没有可计算类型时（如实数），`#eval` 帮不上忙。这类求值也不能轻易用于证明——会大幅扩大可信代码基（检查证明时须信任的那部分 Lean）。

因此证明中宜用 `simp` 与 `norm_num` 策略，或它们的命令版做快速探索：

```lean
#simp !![(1 : ℝ), 2; 3, 4].det -- `4 - 2*3`

#norm_num !![(1 : ℝ), 2; 3, 4].det -- `-2`

#norm_num !![(1 : ℝ), 2; 3, 4].trace -- `5`

variable (a b c d : ℝ) in
#simp !![a, b; c, d].det -- `a * d – b * c`
```

方阵的下一重要运算是**求逆**。与数的除法对除以零仍定义并返回人工值零类似，求逆对所有矩阵都有定义，对不可逆矩阵返回零矩阵。

更精确地，环上有通用函数 `Ring.inverse`；对矩阵 `A`，`A⁻¹` 定义为 `Ring.inverse A.det • A.adjugate`。按 Cramer 法则，当 `A` 行列式非零时这确实是 `A` 的逆：

```lean
#norm_num [Matrix.inv_def] !![(1 : ℝ), 2; 3, 4]⁻¹ -- !![-2, 1; 3 / 2, -(1 / 2)]
```

此定义仅对可逆矩阵真正有用。通用类型类 `Invertible` 帮助记录可逆性。下例中 `simp` 会用到带 `Invertible` 假设的 `inv_mul_of_invertible`，仅当类型类合成能找到该实例时触发。此处用 `have` 提供：

```lean
example : !![(1 : ℝ), 2; 3, 4]⁻¹ * !![(1 : ℝ), 2; 3, 4] = 1 := by
  have : Invertible !![(1 : ℝ), 2; 3, 4] := by
    apply Matrix.invertibleOfIsUnitDet
    norm_num
  simp
```

此完全具体情形也可用 `norm_num` 与 `apply?` 找最后一步：

```lean
example : !![(1 : ℝ), 2; 3, 4]⁻¹ * !![(1 : ℝ), 2; 3, 4] = 1 := by
  norm_num [Matrix.inv_def]
  exact one_fin_two.symm
```

上面具体矩阵的行、列都由某 `n` 的 `Fin n` 索引（行、列的 `n` 不必相同）。但有时用任意有限类型索引更方便，例如有限图的邻接矩阵自然以顶点为行、列索引。

事实上，若只想定义矩阵而不定义运算，甚至不需要指标有限、系数也可无代数结构。Mathlib 定义 `Matrix m n α` 为任意类型 `m`、`n`、`α` 上的 `m → n → α`；此前用的矩阵类型如 `Matrix (Fin 2) (Fin 2) ℝ`。代数运算对 `m`、`n`、`α` 有更多假设。

不直接用 `m → n → α` 的主要原因是让类型类系统理解我们的意图：对环 `R`，`n → R` 有点态乘法，而 `m → n → R` 上的这种乘法**不是**我们想要的矩阵乘法。

第一例中强迫 Lean 看穿 `Matrix` 定义并接受命题有意义，再逐元验证：

```lean
section

example : (fun _ ↦ 1 : Fin 2 → Fin 2 → ℤ) = !![1, 1; 1, 1] := by
  ext i j
  fin_cases i <;> fin_cases j <;> rfl

example : (fun _ ↦ 1 : Fin 2 → Fin 2 → ℤ) * (fun _ ↦ 1 : Fin 2 → Fin 2 → ℤ) = !![1, 1; 1, 1] := by
  ext i j
  fin_cases i <;> fin_cases j <;> rfl

example : !![1, 1; 1, 1] * !![1, 1; 1, 1] = !![2, 2; 2, 2] := by
  norm_num
```

为在不失去 `Matrix` 类型类好处的情况下把矩阵当函数定义，可用函数与矩阵之间的等价 `Matrix.of`（秘密地用 `Equiv.refl` 定义）。例如可定义与向量 `v` 对应的 Vandermonde 矩阵：

```lean
example {n : ℕ} (v : Fin n → ℝ) :
    Matrix.vandermonde v = Matrix.of (fun i j : Fin n ↦ v i ^ (j : ℕ)) :=
  rfl
end
end matrices
```

## 基

现在讨论向量空间的**基**（basis）。非形式地有多种定义：泛性质；线性无关且张成空间的向量族；或两者合并——每个向量可唯一写成基向量的线性组合；还可说基给出与底域 `K`（视为 `K` 上向量空间）的某次幂的线性同构。

Mathlib 底层实际采用同构版本，其他刻画由此证明。对无限基须稍小心「`K` 的幂」：此代数语境中只有有限线性组合有意义，参考空间不是 `K` 的直积而是直和。可用 `⨁ i : ι, K`（`ι` 为指标类型），但更专门的写法是 `ι →₀ K`，即「从 `ι` 到 `K` 的**有限支撑**（finite support）函数」——在 `ι` 的某个有限集外为零（该有限集依赖函数）。由基 `B` 得到的此类函数在向量 `v` 与 `i : ι` 处求值，即 `v` 在第 `i` 个基向量上的分量（坐标）。

由类型 `ι` 索引的 `V` 作为 `K` 向量空间的基的类型为 `Basis ι K V`；同构为 `Basis.repr`。

```lean
variable {K : Type*} [Field K] {V : Type*} [AddCommGroup V] [Module K V]

section

open Module

variable {ι : Type*} (B : Basis ι K V) (v : V) (i : ι)

-- 下标为 `i` 的基向量
#check (B i : V)

-- `B` 给出的与模型空间的线性同构
#check (B.repr : V ≃ₗ[K] ι →₀ K)

-- `v` 的分量函数
#check (B.repr v : ι →₀ K)

-- `v` 在 `i` 处的分量
#check (B.repr v i : K)
```

也可不从同构出发，而从线性无关且张成的向量族 `b` 出发，即 `Basis.mk`。张成写为 `⊤ ≤ Submodule.span K (Set.range b)`：这里 `⊤` 是 `V` 的顶子模，即把 `V` 看作自身的子模。这种写法略绕，但几乎按定义等价于更直观的 `∀ v, v ∈ Submodule.span K (Set.range b)`（下面片段中 `_` 指无用的 `v ∈ ⊤` 信息）：

```lean
noncomputable example (b : ι → V) (b_indep : LinearIndependent K b)
    (b_spans : ∀ v, v ∈ Submodule.span K (Set.range b)) : Basis ι K V :=
  Basis.mk b_indep (fun v _ ↦ b_spans v)

example (b : ι → V) (b_indep : LinearIndependent K b)
    (b_spans : ∀ v, v ∈ Submodule.span K (Set.range b)) (i : ι) :
    Basis.mk b_indep (fun v _ ↦ b_spans v) i = b i :=
  Basis.mk_apply b_indep (fun v _ ↦ b_spans v) i
```

特别地，模型向量空间 `ι →₀ K` 有所谓**典范基**（canonical basis），其 `repr` 在任意向量上为恒等同构，名为 `Finsupp.basisSingleOne`：`Finsupp` 指有限支撑函数，`basisSingleOne` 指基向量是除单个输入外处处为零的函数。更精确地，由 `i : ι` 索引的基向量为 `Finsupp.single i 1`——在 `i` 处取 `1`、其余处取 `0` 的有限支撑函数。

```lean
variable [DecidableEq ι]

example : Finsupp.basisSingleOne.repr = LinearEquiv.refl K (ι →₀ K) :=
  rfl

example (i : ι) : Finsupp.basisSingleOne i = Finsupp.single i 1 :=
  rfl
```

指标类型有限时不必纠缠有限支撑函数，可用更简单的 `Pi.basisFun`，给出整个 `ι → K` 的基：

```lean
example [Finite ι] (x : ι → K) (i : ι) : (Pi.basisFun K ι).repr x i = x i := by
  simp
```

回到抽象向量空间的一般基：可把任意向量表为基向量的线性组合。先看有限基的简易情形：

```lean
example [Fintype ι] : ∑ i : ι, B.repr v i • (B i) = v :=
  B.sum_repr v
```

当 `ι` 非有限时，上式先验无意义——不能对 `ι` 求和。但被求和函数的支撑有限（即 `B.repr v` 的支撑）。须用考虑这一点的构造。Mathlib 用需适应的专用函数 `Finsupp.linearCombination`（建立在更一般的 `Finsupp.sum` 上）。给定从 `ι` 到底域 `K` 的有限支撑函数 `c` 与从 `ι` 到 `V` 的函数 `f`，`Finsupp.linearCombination K f c` 是在 `c` 的支撑上对 `c • f` 求标量乘法后的和；特别地，可在包含 `c` 支撑的任意有限集上替换为该集上的和。

```lean
example (c : ι →₀ K) (f : ι → V) (s : Finset ι) (h : c.support ⊆ s) :
    Finsupp.linearCombination K f c = ∑ i ∈ s, c i • f i :=
  Finsupp.linearCombination_apply_of_mem_supported K h
```

也可假设 `f` 有限支撑仍得良定义的和；但 `Finsupp.linearCombination` 的选择与基讨论相关，因为它允许陈述 `Basis.sum_repr` 的推广：

```lean
example : Finsupp.linearCombination K B (B.repr v) = v :=
  B.linearCombination_repr v
```

可能疑惑为何 `K` 在此为显式参数——尽管可从 `c` 的类型推断。要点是部分应用 `Finsupp.linearCombination K f` 本身有趣：它不是裸函数 `ι →₀ K → V`，而是 `K`-线性映射：

```lean
variable (f : ι → V) in
#check (Finsupp.linearCombination K f : (ι →₀ K) →ₗ[K] V)
```

从数学角度，基下的向量表示在形式化数学中往往不如纸笔上好用；更常高效地直接用基的抽象性质。特别地，基连接代数中其他自由对象的泛性质，允许通过指定基向量的像来构造线性映射，即 `Basis.constr`。对任意 `K`-向量空间 `W`，基 `B` 给出从 `ι → W` 到 `V →ₗ[K] W` 的线性同构 `Basis.constr B K`。其特征：把任意 `u : ι → W` 映到把每个 `B i` 映到 `u i` 的线性映射。

```lean
section

variable {W : Type*} [AddCommGroup W] [Module K W]
         (φ : V →ₗ[K] W) (u : ι → W)

#check (B.constr K : (ι → W) ≃ₗ[K] (V →ₗ[K] W))

#check (B.constr K u : V →ₗ[K] W)

example (i : ι) : B.constr K u (B i) = u i :=
  B.constr_basis K u i
```

该性质确为特征性，因为线性映射由在基上的值决定：

```lean
example (φ ψ : V →ₗ[K] W) (h : ∀ i, φ (B i) = ψ (B i)) : φ = ψ :=
  B.ext h
```

若目标空间也有基 `B'`，可把线性映射与矩阵等同；该等同是 `K`-线性同构：

```lean
variable {ι' : Type*} (B' : Basis ι' K W) [Fintype ι] [DecidableEq ι] [Fintype ι'] [DecidableEq ι']

open LinearMap

#check (toMatrix B B' : (V →ₗ[K] W) ≃ₗ[K] Matrix ι' ι K)

open Matrix -- 使用矩阵与向量乘法的 ``*ᵥ`` 记号

example (φ : V →ₗ[K] W) (v : V) : (toMatrix B B' φ) *ᵥ (B.repr v) = B'.repr (φ v) :=
  toMatrix_mulVec_repr B B' φ v


variable {ι'' : Type*} (B'' : Basis ι'' K W) [Fintype ι''] [DecidableEq ι'']

example (φ : V →ₗ[K] W) : (toMatrix B B'' φ) = (toMatrix B' B'' .id) * (toMatrix B B' φ) := by
  simp

end
```

**练习**：证明保证自同态有良定义行列式定理的一部分——当两个基由同一类型索引时，它们赋予任一自同态的矩阵有相同行列式。完整结果还须用「各基的指标类型同构」补充。Mathlib 已知此事实，`simp` 可立即关闭目标，但不宜过早使用，应先用所给引理：

```lean
open Module LinearMap Matrix

#check toMatrix_comp
#check id_comp
#check comp_id
#check toMatrix_id

#check Matrix.det_mul
#check Matrix.det_one

example [Fintype ι] (B' : Basis ι K V) (φ : End K V) :
    (toMatrix B B φ).det = (toMatrix B' B' φ).det := by
  sorry
```

## 维数

回到单个向量空间：基也用于定义**维数**（dimension）。仍有有限维（finite-dimensional）的初等情形：期望维数为自然数，即 `Module.finrank`。底域为显式参数，因为同一 Abel 群可成为不同域上的向量空间。

```lean
section

#check (Module.finrank K V : ℕ)

-- `Fin n → K` 是 `K` 上维数为 `n` 的典范空间
example (n : ℕ) : Module.finrank K (Fin n → K) = n :=
  Module.finrank_fin_fun K

-- 作为自身上的向量空间，`ℂ` 维数为 1
example : Module.finrank ℂ ℂ = 1 :=
  Module.finrank_self ℂ

-- 作为实向量空间维数为 2
example : Module.finrank ℝ ℂ = 2 :=
  Complex.finrank_real_complex
```

`Module.finrank` 对任意向量空间都有定义；对无限维空间返回零，正如除以零返回零。

许多引理需要有限维假设，由 `FiniteDimensional` 类型类承担。想想没有该假设时下面例子如何失败：

```lean
example [FiniteDimensional K V] : 0 < Module.finrank K V ↔ Nontrivial V  :=
  Module.finrank_pos_iff
```

`Nontrivial V` 表示 `V` 至少有两个不同元素。`Module.finrank_pos_iff` 无显式参数；从左到右使用没问题，从右到左则 Lean 无法从 `Nontrivial V` 猜 `K`。此时可用命名参数语法（先确认引理在名为 `R` 的环上陈述），例如：

```lean
example [FiniteDimensional K V] (h : 0 < Module.finrank K V) : Nontrivial V := by
  apply (Module.finrank_pos_iff (R := K)).1
  exact h
```

此写法略怪——已有假设 `h`，可直接 `Module.finrank_pos_iff.1 h`——但更复杂情形时值得知道。

按定义，可从任意基读出 `FiniteDimensional K V`：

```lean
variable {ι : Type*} (B : Module.Basis ι K V)

example [Finite ι] : FiniteDimensional K V := Module.Basis.finiteDimensional_of_finite B

example [FiniteDimensional K V] : Finite ι :=
  (FiniteDimensional.fintypeBasisIndex B).finite
end
```

线性子空间对应的子类型有向量空间结构，故可谈子空间的维数：

```lean
section
variable (E F : Submodule K V) [FiniteDimensional K V]

open Module

example : finrank K (E ⊔ F : Submodule K V) + finrank K (E ⊓ F : Submodule K V) =
    finrank K E + finrank K F :=
  Submodule.finrank_sup_add_finrank_inf_eq E F

example : finrank K E ≤ finrank K V := Submodule.finrank_le E
```

第一式中的类型标注是为避免过早触发到 `Type*` 的强制。

**练习**：关于 `finrank` 与子空间的练习：

```lean
example (h : finrank K V < finrank K E + finrank K F) :
    Nontrivial (E ⊓ F : Submodule K V) := by
  sorry
end
```

现在转向一般维数理论：`finrank` 无用，但对同一向量空间的任意两个基，指标类型之间存在双射，故仍希望把**秩**（rank）定义为**基数**（cardinal）——即「在双射等价关系下类型的商」中的元素。

讨论基数时更难忽略本书其余处常回避的罗素悖论等基础问题：没有「所有类型的类型」，否则会逻辑矛盾；由**宇宙层次**（universe hierarchy）解决，我们通常尽量忽略。

每个类型有宇宙层次，行为类似自然数：有零层，对应宇宙 `Type 0` 即 `Type`，足以容纳几乎全部经典数学（`ℕ`、`ℝ` 的类型为 `Type`）。每层 `u` 有后继 `u + 1`，`Type u` 的类型为 `Type (u+1)`。

但宇宙层次不是自然数，性质不同、没有类型；不能在 Lean 中陈述 `u ≠ u + 1`——没有容纳它的类型。甚至 `Type u ≠ Type (u+1)` 也无意义，因二者类型不同。

写 `Type*` 时 Lean 插入名为 `u_n` 的宇宙层次变量，使定义与陈述可活在所有宇宙中。

给定宇宙 `u`，可在 `Type u` 上定义等价关系：类型 `α`、`β` 等价当且仅当存在双射。商类型 `Cardinal.{u}` 活在 `Type (u+1)`；花括号表示宇宙变量。`α : Type u` 在该商中的像为 `Cardinal.mk α : Cardinal.{u}`。

不能直接比较不同宇宙中的基数。技术上不能把向量空间 `V` 的秩定义为索引 `V` 的基的全体类型的基数；改为定义为 `V` 中所有线性无关集基数的**上确界** `Module.rank K V`。若 `V` 的宇宙层次为 `u`，其秩的类型为 `Cardinal.{u}`。

```lean
#check V -- Type u_2
#check Module.rank K V -- Cardinal.{u_2}
```

仍可将此定义与基联系：宇宙层次上有交换的 `max` 运算；给定 `u`、`v`，有 `Cardinal.lift.{u, v} : Cardinal.{v} → Cardinal.{max v u}` 把基数放到共同宇宙并陈述维数定理：

```lean
universe u v -- `u` 与 `v` 表示宇宙层次

variable {ι : Type u} (B : Module.Basis ι K V)
         {ι' : Type v} (B' : Module.Basis ι' K V)

example : Cardinal.lift.{v, u} (.mk ι) = Cardinal.lift.{u, v} (.mk ι') :=
  mk_eq_mk_of_basis B B'
```

可用自然数到有限基数的强制，把有限维情形与上述讨论联系起来（更精确地，是活在 `V` 的宇宙层次 `v` 中的有限基数）：

```lean
example [FiniteDimensional K V] :
    (Module.finrank K V : Cardinal) = Module.rank K V :=
  Module.finrank_eq_rank K V
```