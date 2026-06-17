# simp normal form

> 对应英文：[Simp Normal Forms](https://lean-lang.org/doc/reference/latest/The-Simplifier/Simp-Normal-Forms/)，抓取日期：2026-06-16。

在某一 simp set 下对表达式反复应用 `simp`，直到没有规则可用，得到的结果称为该 set 下的 **simp normal form**。

## 重要限制

`simp` **不保证合流**（confluence）：同一表达式可能因规则顺序、优先级不同而停在不同形态。因此：

- 库作者要为每类概念选定**单一规范写法**；
- 证明脚本不要依赖「偶然」的 simp 顺序，应用 `simp only` 固定规则集。

## 设计原则

### 1. 等式右侧应已是 normal form

```lean
-- 欠佳：右边 n + 0 还会被 Nat.add_zero 再改
-- @[simp] theorem bad (n : Nat) : n = n + 0 := ...

-- 较好：右边是「最终形态」
@[simp] theorem add_zero (n : Nat) : n + 0 = n := rfl
```

若 RHS 仍会被其他 `[simp]` 规则继续改写，往往说明 lemma 方向或形式需调整。

### 2. 同一概念只保留一种规范表达

例如自然数加法，应统一用 `n + m` 还是 `Nat.add n m`、是否展开 `succ`，并在 simp set 里**只朝一个方向**化简。若 `lemma A` 把 `f x` 化成 `g x`，`lemma B` 又把 `g x` 化成 `h x`，而目标里需要的是 `f x`，就可能出现「_simp 不动」的死角。

### 3. 默认 simp set = 库接口

用户 `import MyLib` 后，`simp` 的默认行为应与文档一致。意外加入的 `[simp]` 会导致：

- 证明变短但不可维护；
- 或目标被化成无法继续的形。

## 可预测性检查清单

| 问题 | 做法 |
| --- | --- |
| 这条 lemma 的 RHS 还会被 simp 吗？ | `simp only [thisLemma]` 看一步结果 |
| 与现有 `[simp]` 冲突吗？ | `set_option trace.Meta.Tactic.simp.rewrite true` |
| 下游证明是否过度依赖？ | 在库外写 `simp only [MyLib.lemmas]` 测试 |
| 是否应进默认 set？ | 仅放「安全、稳定、常用」的规则 |

## 对库作者

- 不属于本库稳定接口的规则 → 自定义 simp set 或局部 `simp only`；
- 为复杂域封装 `my_simp` / `my_simp?` tactic，而不是无限膨胀默认 set；
- 把「`simp` 之后长什么样」写进设计文档或模块注释。

## 与 `dsimp` / `simp!` 的区别

- **normal form** 讨论的是**带 rewrite 规则**的 `simp`；
- `dsimp` 主要做 definitional unfolding，normal form 概念较弱；
- `simp!` 更激进展开定义，normal form 更不可预测，库接口中应少用。