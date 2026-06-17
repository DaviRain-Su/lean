# 配置 simplification

> 对应英文：[Configuring Simplification](https://lean-lang.org/doc/reference/latest/The-Simplifier/Configuring-Simplification/)，抓取日期：2026-06-16。

`simp` 通过命名参数 `config := ...` 或简写配置项调整行为。核心结构是 `Lean.Meta.Simp.Config`；`dsimp` 使用 `Lean.Meta.DSimp.Config`。

## 常见配置项

| 字段 | 作用 |
| --- | --- |
| `maxSteps` | 最多访问多少子表达式；过大易慢或栈溢出 |
| `contextual` | 简化 `p → q` 时，把 `p` 暂时加入 simp set |
| `memoize` | 缓存子表达式的简化结果 |
| `singlePass` | 只做一轮，不反复迭代 |
| `zeta` | 展开 `let` / `have` |
| `beta` | 化简 `fun` 应用 |
| `iota` | 化简 constructor discriminant 的 `match` |
| `proj` | 化简结构体 projection |
| `decide` | 尝试把命题判成 `True` 或 `False` |
| `arith` | 启用简单算术简化（`simp_arith` 族） |
| `autoUnfold` | 更激进展开定义；`simp!` 会打开 |
| `failIfUnchanged` | 若无进展则失败 |
| `zetaDelta` | 展开局部定义 |
| `suggestions` | 让 `simp?` 调用库建议引擎 |
| `locals` | 允许展开当前文件中的定义 |

## 写法示例

提高步数上限：

```lean
example (n : Nat) : n + 0 = n := by
  simp (config := { maxSteps := 100000 })
```

关闭 contextual（避免在蕴含式里把前提当 simp 假设）：

```lean
-- 某些逻辑证明里会显式设 contextual := false
```

只做 definitional 步骤（接近 `dsimp`）：

```lean
example (n : Nat) : (let x := n; x + 0) = n := by
  dsimp
```

`simp!` 等价于打开 `autoUnfold` 的 `simp`，适合需要多展开一层定义时；也可能更慢、更不可控。

## 调试 trace 与 linter

| 选项 | 用途 |
| --- | --- |
| `set_option trace.Meta.Tactic.simp true` | 总体 trace |
| `set_option trace.Meta.Tactic.simp.rewrite true` | 每条 rewrite |
| `set_option trace.Meta.Tactic.simp.discharge true` | side condition 如何 discharge |
| `set_option simprocs true` | simproc 参与情况 |
| `linter.unnecessarySimpa` | 提示可简化的 `simpa` |

## 使用建议

- 默认 config 对多数目标已是较好折中，只在卡死或太慢时改；
- 变慢时先查 `maxSteps`、`contextual`、`autoUnfold`，再查是否加入了过多 `[simp]` 引理；
- 调试优先开 trace + `simp?`，而不是盲目堆 lemma；
- 库代码里用 `simp only [...]` 固定规则集，可减少对默认 simp set 变动的敏感。