# learn_proof

NNG 风格的自然数 tactic 练习项目，源码注释会同步到学习站「证明练习笔记」。

## 快速开始

```bash
cd learn_proof
lake build
code .   # 或 cursor .
```

在 VS Code / Cursor 中打开 `LearnProof/Basic.lean`，光标放在 `by` 后的 tactic 行，右侧 InfoView 显示当前目标。

## 文件

| 路径 | 说明 |
| --- | --- |
| `LearnProof/Basic.lean` | 示例 1–19：rfl、rw、calc、归纳法（加/乘） |
| `LearnProof/Natural.lean` | 自定义 `MyNat` 与标准 `Nat` 对照 |

## 与学习站同步

仓库根目录执行：

```bash
cd lean_learning_site && npm run build
```

`scripts/sync-learn-proof.mjs` 会把 `Basic.lean` 里的 `--` 注释与代码块拆成 5 篇 Markdown（`books/data/learn-proof/`）。

## 配合阅读

- 本站 [证明练习笔记](../lean_learning_site/books/data/learn-proof/INDEX.md)
- [Natural Number Game](https://www.ma.imperial.ac.uk/~buzzard/xena/natural_number_game/)
- [定理证明（TPIL）](../tpil-zh/book/zh-CN/INDEX.md)