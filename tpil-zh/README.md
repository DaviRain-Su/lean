# Theorem Proving in Lean 4（中文版）

本仓库是 [Theorem Proving in Lean 4](https://lean-lang.org/theorem_proving_in_lean4/)（Jeremy Avigad、Leonardo de Moura、Soonho Kong、Sebastian Ullrich 著，Lean 社区贡献）的中文翻译项目。

原书源码在 [leanprover/theorem_proving_in_lean4](https://github.com/leanprover/theorem_proving_in_lean4)，以 Apache License 2.0 发布，使用 Verso 从 `.lean` 源文件构建在线书。

## 项目结构

```
tpil-zh/
├── README.md              # 本文件
└── book/
    ├── TPiL.lean          # 原书目录与元信息备份
    ├── TPiL/              # 各章英文 Verso 源备份（.lean）
    └── zh-CN/             # 中文 Markdown 译文
        ├── INDEX.md
        └── …
```

## 关于获取原书

```bash
git clone https://github.com/leanprover/theorem_proving_in_lean4.git
cd theorem_proving_in_lean4/book
lake exe tpil   # 本地构建 HTML，输出在 _out/html-multi
```

## 翻译原则

与 [fp-lean-zh](../fp-lean-zh/)、[mil-zh](../mil-zh/) 保持一致：

1. **保留代码原样**：Lean 代码、`#check`、`#eval`、策略名等保持英文，便于在 VS Code 中复制运行。
2. **术语对照**：重要术语首次出现时附英文，例如 dependent type theory（依赖类型论）、tactic（策略）、elaboration（类型 elaboration）。
3. **渐进式讲解**：保持原书 step-by-step 风格；Verso 中的 `:::setup` 等块在译文中用说明性文字交代上下文。

## 本地阅读

译文为 Markdown。建议从 [book/zh-CN/INDEX.md](book/zh-CN/INDEX.md) 开始。

## 原书信息

- 在线版：[lean-lang.org/theorem_proving_in_lean4](https://lean-lang.org/theorem_proving_in_lean4/)
- 源码：[github.com/leanprover/theorem_proving_in_lean4](https://github.com/leanprover/theorem_proving_in_lean4)
- Lean 3 版：[leanprover.github.io/theorem_proving_in_lean](https://leanprover.github.io/theorem_proving_in_lean/)
- 已有社区中文版：[leanprover.cn/tp-lean-zh](https://www.leanprover.cn/tp-lean-zh/)（Sphinx 站点，与本项目的 Markdown 阅读体验不同）

## 翻译进度

- [x] 第 1 章：引言
- [ ] 第 2–12 章：待译

| 章 | 英文源文件 | 状态 |
|----|-----------|------|
| 1 引言 | `Intro.lean` | 已完成 |
| 2 依赖类型论 | `DependentTypeTheory.lean` | 待译 |
| 3 命题与证明 | `PropositionsAndProofs.lean` | 待译 |
| 4 量词与相等 | `QuantifiersEquality.lean` | 待译 |
| 5 策略 | `Tactics.lean` | 待译 |
| 6 与 Lean 交互 | `InteractingWithLean.lean` | 待译 |
| 7 归纳类型 | `InductiveTypes.lean` | 待译 |
| 8 归纳与递归 | `InductionAndRecursion.lean` | 待译 |
| 9 结构体与记录 | `StructuresAndRecords.lean` | 待译 |
| 10 类型类 | `TypeClasses.lean` | 待译 |
| 11 转换策略模式 | `Conv.lean` | 待译 |
| 12 公理与计算 | `AxiomsComputation.lean` | 待译 |