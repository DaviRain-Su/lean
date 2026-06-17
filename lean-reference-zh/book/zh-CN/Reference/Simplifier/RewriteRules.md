# simplifier 的重写规则

> 对应英文：[Rewrite Rules](https://lean-lang.org/doc/reference/latest/The-Simplifier/Rewrite-Rules/)，抓取日期：2026-06-16。

simplifier 主要使用三类重写规则，此外还有内建 reduction（由 `config` 控制）。

## 1. 要展开的声明

默认情况下，simplifier 只自动展开 **reducible** 定义。若显式把某个 semireducible 或 irreducible 定义加入 simp 规则，那么 `simp` 也可展开它。

- **`dsimp`**：只做 definitional unfolding，把定义名替换成定义体；
- **普通 `simp`**：展开后还会使用 equation compiler 生成的 **equational lemma** 继续化简。

```lean
-- 显式让 simp 展开某定义（即使不在默认 simp set）
example (n : Nat) : n + 0 = n := by simp [Nat.add_zero]
```

## 2. 等式引理

`simp` 可以把任意等式证明当作重写规则：把等式左边换成右边。等式引理可以带参数，simplifier 会：

1. 先匹配目标中的左侧模式；
2. 再尝试用 proof search 填补额外参数。

由于 **propositional extensionality**，命题也能被改写成逻辑等价的更简单形式。若目标被改写成 `True`，`simp` 会自动关闭该目标。

非等式命题也可标记为 rewrite rule；预处理后会变成「把该命题重写为 `True`」。

### 命题重写示例

对等式 `(w, x) = (y, z)`，`simp` 可能用 `Prod.mk.injEq` 把它化成合取：

```lean
-- 目标：⊢ (w, x) = (y, z)
-- simp 后：⊢ w = y ∧ x = z
```

这类 **injEq** 引理在标准库 `[simp]` set 里很常见。

## 3. Simproc

**Simproc**（simplification procedure）用 Lean 元编程实现，适合「难以用单条等式高效表达」的化简。标准库为许多内建类型的重要运算提供了 simproc。

若某种化简依赖复杂计算或特殊判别，而不是 `lhs = rhs`，应考虑 simproc 而非手写等式。

## 内建 reduction

即使 simp set 为空，`simp` 仍可能做下列 reduction（由 `Simp.Config` 的 `zeta`、`beta`、`iota`、`proj` 等开关控制）：

| 行为 | 典型例子 |
| --- | --- |
| `zeta` | 把 `let` 绑定变量替换为其值 |
| `beta` | `(fun x => t) a` 归约为 `t[a/x]` |
| `iota` | 对 constructor discriminant 的 `match` 求值 |
| `proj` | 对 constructor 做 structure projection 化简 |

因此「没有 lemma」并不等于「什么也不做」。

## 写 simp lemma 的要点

- 右侧尽量接近你希望的 **normal form**；
- 带 side condition 的引理，`simp` 会尝试 discharge 子目标；
- 用 `attribute [simp]` 加入默认 set，或只在单次 `simp [myLemma]` 里使用；
- 若引理方向反了，用 `← myLemma` 或 `@[simp] theorem ...` 时写好 `symm` 版本。

## 调试

```lean
set_option trace.Meta.Tactic.simp.rewrite true
```

可查看 `simp` 实际用了哪些规则。配合 `simp?` 可得到更小的 `simp only [...]` 建议。