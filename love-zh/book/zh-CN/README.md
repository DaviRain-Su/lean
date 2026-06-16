# 关于《逻辑验证漫游指南》

**The Hitchhiker's Guide to Logical Verification**（2025 版，常简称 **LoVe**）是面向研究生水平的交互式定理证明课程教材，由 Lean Forward 维护，在 [lean-lang.org/learn](https://lean-lang.org/learn/) 的 Further reading 中推荐。

## 本书讲什么

LoVe 在命题逻辑、一阶逻辑、自然演绎与公理化推理的基础上，用 Lean 4 讲授：

- 依赖类型与 Curry–Howard 对应
- 策略式证明与自动化
- 归纳类型、归纳证明与程序提取
- 集合论、关系与函数的形式化
- 面向软件与数学验证的证明工程实践

风格介于入门教程与研究生讲义之间：比 [定理证明](https://lean-lang.org/theorem_proving_in_lean4/)（TPIL）更偏逻辑与验证课程脉络，比 [数学形式化](https://leanprover-community.github.io/mathematics_in_lean/)（MIL）更偏逻辑基础而非 Mathlib 专题。

## 建议学习顺序

若你已读完本站的 **TPIL** 与 **MIL** 前几章，LoVe 适合作为「逻辑与验证」方向的加深阅读。若刚接触 Lean，可先完成 [自然数游戏 NNG4](https://nng4.leanprover.cn) 与 TPIL 前四章，再阅读 LoVe。

## 如何获取中文版

- **PDF（推荐）**：[Lean-zh/LoVe-zh](https://github.com/Lean-zh/LoVe-zh) 提供《逻辑验证漫游指南 2026 版》桌面版与 Pad 版 PDF。
- **英文 PDF**：[logical_verification_2025](https://github.com/lean-forward/logical_verification_2025) 仓库中的 `hitchhikers_guide_2025_*.pdf`。
- **Lean 练习**：英文仓库与 LoVe-zh 均含 `lean/` 项目，用 VS Code 打开该文件夹即可做章节练习。

## 本站 Markdown 译文的计划

原书以 PDF 发布，尚无官方 Verso/Markdown 源。本仓库 `love-zh` 将随 Lean-zh 与社区进展，逐步把章节转为 Markdown 并接入 [Lean 4 学习工作台](https://github.com/leanprover-community/mathlib4) 阅读器；当前以导读与外链 PDF 为主。

## 相关资源

- 学习工作台中的 **Lean 常见问题（FAQ）** 与 **VS Code Lean 4 手册** — 做练习前建议先读
- [Metaprogramming in Lean 4](https://leanprover.cn/mp-lean-zh/)（Lean-zh）— 进阶扩展 Lean