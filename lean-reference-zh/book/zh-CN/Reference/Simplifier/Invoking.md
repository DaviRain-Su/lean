# 调用 simplifier

> 对应英文：[Invoking the Simplifier](https://lean-lang.org/doc/reference/latest/The-Simplifier/Invoking-the-Simplifier/)，抓取日期：2026-06-16。

Lean 提供一族基于 simplifier 的 tactic。它们的名字通常都包含 `simp`，并通过前缀和后缀表达行为差异。

## 常见命名规则

- `!` 后缀：把 `autoUnfold` 打开，允许展开更多 definition。
- `?` 后缀：记录 simplification 中真正使用的规则，并尝试给出更小的 `simp` 参数建议。
- `_arith` 后缀：启用线性算术相关 simplification rule。
- `d` 前缀：只使用 definitional simplification，也就是 `dsimp` 风格。
- `_all` 后缀：反复简化所有假设和目标，直到无法继续。

此外还有：

- `simpa`
- `simpa!`

它们会同时简化目标和某个 proof term / assumption，再尝试直接 closing the goal，因此通常比“先 `have` 再 `simp`”更稳。

## 参数语法

简化类 tactic 的基本形态可以概括为：

```lean
simp optConfig only? ([ ... ])? (at ...)?
```

也就是说，一个 `simp` 调用可以包含：

1. **配置项**：例如 `simp (maxSteps := 100000)`。
2. `only`：从空的 simp set 开始，而不是默认 simp set。
3. **规则列表**：增加或移除 simp lemma，或加入整个 simp set。
4. `at ...`：指定作用位置。

## 规则列表中的元素

规则列表里常见的元素包括：

- `*`：把 proof state 中所有 assumptions 加入 simp set。
- `-h`：从 simp set 中移除 lemma / rule `h`。
- 普通 lemma 名、simp set 名或 term。
- `↓` / `↑`：控制某条规则在进入子项前还是后应用。
- `←`：把等式 lemma 反向使用。

## 位置说明

`at` 后可指定：

- 某个 assumption 名：只简化该 assumption 的 type。
- `⊢`：只简化目标。
- `*`：简化所有 assumptions 和目标。

不写 `at` 时，默认只简化目标。

## 实用建议

- 目标清理优先 `simp`；
- 只想做 definitional unfolding 优先 `dsimp`；
- 需要限制规则时用 `simp only [...]`；
- 想让 proof 对默认 simp set 变动更稳时，多考虑 `simpa`。

## 示例

只简化目标（默认）：

```lean
example (n : Nat) : n + 0 = n := by simp
```

只动假设 `h`：

```lean
example (n : Nat) (h : n + 0 = n) : n = n := by simp at h <;> rw [h]
```

从空 simp set 起步，避免默认库规则：

```lean
example (n : Nat) : n + 0 = n := by simp only [Nat.add_zero]
```

`simpa` 一步简化并关闭：

```lean
example (n : Nat) (h : n + 0 = n) : n = n := by simpa using h
```

`simp?` 在复杂目标上可打印「实际用到的规则」，便于收窄为 `simp only [...]`。
