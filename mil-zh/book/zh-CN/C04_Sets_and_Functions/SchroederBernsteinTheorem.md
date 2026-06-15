# 施罗德-伯恩斯坦定理

本章以集合论中一个初等但非平凡的定理收束。设 \(\alpha\)、\(\beta\) 为集合（形式化中为类型）。若 \(f : \alpha \to \beta\) 与 \(g : \beta \to \alpha\) 均单射，直观上 \(\alpha\) 不比 \(\beta\) 大、反之亦然。有限时这蕴含相同基数，即存在双射。十九世纪 Cantor 断言无穷情形亦然，后由 Dedekind、Schröder、Bernstein 各自证明。

形式化会引入一些新方法，后续章节将详述；此处略快也没关系。目标是表明你已具备为真实数学结果的形式化证明做贡献的技能。

## 证明思路

考虑 \(g\) 在 \(\alpha\) 中的像。在该像上 \(g^{-1}\) 有定义且与 \(\beta\) 构成双射。问题是若 \(g\) 不满射，双射不包含图中阴影区域（非空）。另一种做法是只用 \(f\) 映整个 \(\alpha\) 到 \(\beta\)，但若 \(f\) 不满射会遗漏 \(\beta\) 中一些元素。

考虑复合 \(g \circ f : \alpha \to \alpha\)。因复合单射，它在 \(\alpha\) 与其像之间构成双射，在 \(\alpha\) 内部得到缩小的副本。该复合将内层阴影环映到更小的同心环，如此往复，得到同心阴影环序列，每环与下一环双射对应。将每环映到下一环、非阴影部分保持不动，即得 \(\alpha\) 与 \(g\) 的像的双射；再与 \(g^{-1}\) 复合，得 \(\alpha\) 与 \(\beta\) 之间的所需双射。

更简洁地描述：令 \(A\) 为阴影区域序列的并，定义 \(h : \alpha \to \beta\)：

\[
h(x) = \begin{cases}
f(x) & \text{若 } x \in A \\
g^{-1}(x) & \text{否则}
\end{cases}
\]

即在阴影部分用 \(f\)，其余用 \(g^{-1}\)。\(h\) 单射，因各分量单射且像不交。为证满射，给定 \(y \in \beta\)，考虑 \(g(y)\)。若 \(g(y) \in A\)，它不能在第一环，故有 \(g(y) = g(f(x))\) 对某 \(x\) 于前一环；由 \(g\) 单射，\(h(x) = f(x) = y\)。若 \(g(y) \notin A\)，由 \(h\) 的定义 \(h(g(y)) = y\)。无论哪种，\(y\) 在 \(h\) 的像中。

论证可信，细节微妙。形式化不仅增强对结果的信心，也加深理解。证明用经典逻辑，故声明定义一般不可计算：

```lean
noncomputable section
open Classical
variable {α β : Type*} [Nonempty β]
```

`[Nonempty β]` 指定 \(\beta\) 非空；构造 \(g^{-1}\) 的 Mathlib 原语需要它。\(\beta\) 为空的情形平凡，本书不专门推广。具体地，需要 `[Nonempty β]` 以使用 `invFun`：给定 `x : α`，`invFun g x` 若有原像则选 \(\beta\) 中一个，否则返回 \(\beta\) 的任意元。`g` 单射时 `invFun g` 恒为左逆；满射时为右逆。

定义阴影区域序列的并：

```lean
section
variable (f : α → β) (g : β → α)

def sbAux : ℕ → Set α
  | 0 => univ \ g '' univ
  | n + 1 => g '' (f '' sbAux n)

def sbSet :=
  ⋃ n, sbAux f g n
```

`sbAux` 是**递归定义**（下一章详述），定义序列

\[
S_0 = \alpha \setminus g(\beta), \quad S_{n+1} = g(f(S_n)).
\]

`sbSet` 对应证明草图中的 \(A = \bigcup_{n \in \mathbb{N}} S_n\)。上述 \(h\) 定义为：

```lean
def sbFun (x : α) : β :=
  if x ∈ sbSet f g then f x else invFun g x
```

需在 \(A\) 的补集上说明 \(g^{-1}\) 为右逆：最外环 \(S_0 = \alpha \setminus g(\beta)\)，故 \(A\) 的补集含于 \(g(\beta)\)，补集中每个 \(x\) 有 \(y\) 使 \(g(y) = x\)（由 \(g\) 单射，\(y\) 唯一；下一定理只言 `invFun g x` 返回某满足 `g y = x` 的 \(y\)）。

逐步执行下列证明，理解流程并补全缺失部分；结尾需 `invFun_eq`。对 `sbAux` 重写会将 `sbAux f g 0` 换为对应定义式右端：

```lean
theorem sb_right_inv {x : α} (hx : x ∉ sbSet f g) : g (invFun g x) = x := by
  have : x ∈ g '' univ := by
    contrapose! hx
    rw [sbSet, mem_iUnion]
    use 0
    rw [sbAux, mem_diff]
    sorry
  have : ∃ y, g y = x := by sorry
  sorry
```

## 单射性

非形式地：设 \(h(x_1) = h(x_2)\)。若 \(x_1 \in A\)，则 \(h(x_1) = f(x_1)\)。若 \(x_2 \notin A\)，则 \(h(x_2) = g^{-1}(x_2)\)；由 \(f(x_1) = h(x_1) = h(x_2)\) 得 \(g(f(x_1)) = x_2\)；由 \(A\) 的定义，\(x_1 \in A\) 蕴含 \(x_2 \in A\)，矛盾。故若 \(x_1 \in A\) 则 \(x_2 \in A\)，从而 \(f(x_1) = h(x_1) = h(x_2) = f(x_2)\)，由 \(f\) 单射得 \(x_1 = x_2\)。对称论证处理 \(x_2 \in A\)。若两者都不在 \(A\)，则 \(g^{-1}(x_1) = h(x_1) = h(x_2) = g^{-1}(x_2)\)，两边用 \(g\) 得 \(x_1 = x_2\)。

在 Lean 中逐步跟进，用 `sb_right_inv` 完成：

```lean
theorem sb_injective (hf : Injective f) : Injective (sbFun f g) := by
  set A := sbSet f g with A_def
  set h := sbFun f g with h_def
  intro x₁ x₂ (hxeq : h x₁ = h x₂)
  show x₁ = x₂
  simp only [h_def, sbFun, ← A_def] at hxeq
  by_cases xA : x₁ ∈ A ∨ x₂ ∈ A
  · wlog x₁A : x₁ ∈ A generalizing x₁ x₂ hxeq xA
    · symm
      apply this hxeq.symm xA.symm (xA.resolve_left x₁A)
    have x₂A : x₂ ∈ A := by
      apply _root_.not_imp_self.mp
      intro (x₂nA : x₂ ∉ A)
      rw [if_pos x₁A, if_neg x₂nA] at hxeq
      rw [A_def, sbSet, mem_iUnion] at x₁A
      have x₂eq : x₂ = g (f x₁) := by sorry
      rcases x₁A with ⟨n, hn⟩
      rw [A_def, sbSet, mem_iUnion]
      use n + 1
      simp [sbAux]
      exact ⟨x₁, hn, x₂eq.symm⟩
    sorry
  push_neg at xA
  sorry
```

**`set`** 为 `sbSet f g`、`sbFun f g` 引入缩写 `A`、`h` 及定义式 `A_def`、`h_def`；缩写是定义性的，Lean 有时自动展开，但 `rw` 时常需显式 `A_def`、`h_def`。**`wlog`**（without loss of generality）封装非形式证明中的对称论证；悬停可查看文档。

## 满射性

给定 \(y \in \beta\)，分 \(g(y) \in A\) 与否。若在 \(A\) 中，不能在 \(S_0\)（与 \(g\) 的像不交），故 \(g(y) \in S_{n+1}\) 对某 \(n\)，即 \(g(y) = g(f(x))\) 对某 \(x \in S_n\)；由 \(g\) 单射，\(f(x) = y\)。若 \(g(y)\) 在 \(A\) 的补集，立即有 \(h(g(y)) = y\)。

`rcases n with _ | n` 分 `g y ∈ sbAux f g 0` 与 `g y ∈ sbAux f g (n + 1)`；`simp [sbAux]` 应用 `sbAux` 的对应定义式：

```lean
theorem sb_surjective (hg : Injective g) : Surjective (sbFun f g) := by
  set A := sbSet f g with A_def
  set h := sbFun f g with h_def
  intro y
  by_cases gyA : g y ∈ A
  · rw [A_def, sbSet, mem_iUnion] at gyA
    rcases gyA with ⟨n, hn⟩
    rcases n with _ | n
    · simp [sbAux] at hn
    simp [sbAux] at hn
    rcases hn with ⟨x, xmem, hx⟩
    use x
    have : x ∈ A := by
      rw [A_def, sbSet, mem_iUnion]
      exact ⟨n, xmem⟩
    rw [h_def, sbFun, if_pos this]
    apply hg hx
  use g y
  rw [h_def, sbFun, if_neg gyA]
  apply leftInverse_invFun hg
```

## 定理陈述

```lean
theorem schroeder_bernstein {f : α → β} {g : β → α} (hf : Injective f) (hg : Injective g) :
    ∃ h : α → β, Bijective h :=
  ⟨sbFun f g, sb_injective f g hf, sb_surjective f g hg⟩
```

`Bijective h` 展开为 `Injective h ∧ Surjective h`。

辅助检查：

```lean
section
variable (g : β → α) (x : α)

#check (invFun g : α → β)
#check (leftInverse_invFun : Injective g → LeftInverse (invFun g) g)
#check (leftInverse_invFun : Injective g → ∀ y, invFun g (g y) = y)
#check (invFun_eq : (∃ y, g y = x) → g (invFun g x) = x)

end
```

原书配图（同心环构造）见 [在线英文版](https://leanprover-community.github.io/mathematics_in_lean/C04_Sets_and_Functions.html#the-schroder-bernstein-theorem)。