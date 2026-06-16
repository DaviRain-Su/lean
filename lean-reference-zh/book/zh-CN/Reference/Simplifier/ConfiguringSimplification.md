# 配置 simplification

> 对应英文：[Configuring Simplification](https://lean-lang.org/doc/reference/latest/The-Simplifier/Configuring-Simplification/)，抓取日期：2026-06-16。

`simp` 主要通过命名参数 `config := ...` 或简写配置项来调整行为。核心配置结构是 `Lean.Meta.Simp.Config`；`dsimp` 使用相关的 `Lean.Meta.DSimp.Config`。

## 常见配置项

英文页列出了大量字段，其中最常用、最值得记住的包括：

- `maxSteps`：最多访问多少子表达式。
- `contextual`：在简化 `p → q` 时，把 `p` 暂时加入 simp set。
- `memoize`：缓存子表达式的简化结果。
- `singlePass`：只做一轮简化，而不是反复迭代。
- `zeta`：展开 `let` / `have`。
- `beta`：化简 `fun` 应用。
- `iota`：化简 constructor discriminant 的 `match`。
- `proj`：化简结构体 projection。
- `decide`：尝试把 proposition 判成 `True` 或 `False`。
- `arith`：启用简单算术简化。
- `autoUnfold`：更激进地展开函数定义，`simp!` 会打开它。
- `failIfUnchanged`：若没有进展就失败。
- `zetaDelta`：展开局部定义。
- `suggestions`：让 `simp?` 调用库建议引擎。
- `locals`：允许展开当前文件中的定义。

## 相关选项和 trace

英文页还列出了一组与调试 simplifier 有关的 option：

- `simprocs`
- `tactic.simp.trace`
- `linter.unnecessarySimpa`
- `trace.Meta.Tactic.simp.rewrite`
- `trace.Meta.Tactic.simp.discharge`

这些选项有助于回答：

- `simp` 用了哪些规则？
- 为什么 side condition 被 discharge / 没有被 discharge？
- 某个 `simpa` 是否其实不必要？

## 使用建议

- 只在需要时修改 config；默认行为通常已经是最佳折中。
- 若 `simp` 变慢，先看 `maxSteps`、`contextual`、`autoUnfold` 是否过于激进。
- 想调试 `simp` 的行为时，优先开 trace，而不是盲目增加更多 lemma。
