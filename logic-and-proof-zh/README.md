# Logic and Proof（中文版）

本仓库是 [Logic and Proof](https://leanprover.github.io/logic_and_proof/)（Jeremy Avigad、Joseph Hua、Robert Y. Lewis、Floris van Doorn 著）的中文翻译项目。

原书以 Sphinx 从 `.rst` 源文件构建在线书，源码在 [leanprover-community/logic_and_proof](https://github.com/leanprover-community/logic_and_proof)，以 Apache License 2.0 发布。

## 项目结构

```
logic-and-proof-zh/
├── README.md              # 本文件
└── book/
    └── zh-CN/             # 中文 Markdown 译文
        ├── INDEX.md
        ├── introduction.md
        ├── propositional_logic.md
        └── …
```

## 翻译原则

与 [tpil-zh](../tpil-zh/)、[fp-lean-zh](../fp-lean-zh/)、[mil-zh](../mil-zh/) 保持一致：

1. **保留代码原样**：Lean 代码、`#check`、`#eval`、策略名、定理名等保持英文，便于在 VS Code 中复制运行。
2. **术语对照**：重要术语首次出现时附英文，例如 natural deduction（自然演绎）、propositional logic（命题逻辑）、first-order logic（一阶逻辑）。
3. **渐进式讲解**：保持原书 step-by-step 风格；原书中的练习与证明示例保留原样，仅对 surrounding text 做中文翻译。

## 本地阅读

译文为 Markdown。建议从 [book/zh-CN/INDEX.md](book/zh-CN/INDEX.md) 开始。

## 原书信息

- 在线版：[leanprover.github.io/logic_and_proof](https://leanprover.github.io/logic_and_proof/)
- 源码：[github.com/leanprover-community/logic_and_proof](https://github.com/leanprover-community/logic_and_proof)
- Lean 3 版：[leanprover.github.io/logic_and_proof_lean3](https://leanprover.github.io/logic_and_proof_lean3/index.html)

## 翻译进度

- [x] 第 1 章：引言
- [x] 第 2 章：命题逻辑
- [x] 第 3 章：命题逻辑的自然演绎
- [x] 第 4 章：Lean 中的命题逻辑
- [x] 第 5 章：经典推理
- [x] 第 6 章：命题逻辑的语义
- [x] 第 7 章：一阶逻辑
- [x] 第 8 章：一阶逻辑的自然演绎
- [x] 第 9 章：Lean 中的一阶逻辑
- [x] 第 10 章：一阶逻辑的语义
- [x] 第 11 章：集合
- [x] 第 12 章：Lean 中的集合
- [x] 第 13 章：关系
- [x] 第 14 章：Lean 中的关系
- [x] 第 15 章：函数
- [x] 第 16 章：Lean 中的函数
- [x] 第 17 章：数论基础
- [x] 第 18 章：组合数学
- [x] 第 19 章：实数
- [x] 第 20 章：无穷
- [ ] 第 23 章：公理化基础
- [ ] 第 24 章：附录：自然演绎规则
