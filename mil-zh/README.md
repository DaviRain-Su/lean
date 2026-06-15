# Mathematics in Lean（中文版）

本仓库是 [Mathematics in Lean](https://leanprover-community.github.io/mathematics_in_lean/) 的中文翻译项目。

原书由 Lean 社区维护，源码在 [avigad/mathematics_in_lean_source](https://github.com/avigad/mathematics_in_lean_source)，用户仓库为 [leanprover-community/mathematics_in_lean](https://github.com/leanprover-community/mathematics_in_lean)，以 Apache License 2.0 发布。

## 项目结构

```
mil-zh/
├── README.md              # 本文件
└── book/
    ├── MIL/               # 原书各节英文 .lean 备份
    │   ├── C01_Introduction/
    │   └── C02_Basics/
    └── zh-CN/             # 中文翻译内容
        ├── INDEX.md       # 中文翻译目录
        ├── README.md      # 原书 README 的中文翻译
        ├── C01_Introduction.md
        ├── C01_Introduction/
        ├── C02_Basics.md
        ├── C02_Basics/
        ├── C03_Logic.md
        └── C03_Logic/
```

## 关于获取原书

本项目采用 `gh api` 从上游源码仓库获取 `.lean` 文件，建立英文备份后翻译正文。

若本地网络可正常克隆，可执行：

```bash
git clone https://github.com/leanprover-community/mathematics_in_lean.git mil-original
```

正文源码（文学化 Lean 格式）在：

```bash
git clone https://github.com/avigad/mathematics_in_lean_source.git mil-source
```

## 翻译原则

与 [fp-lean-zh](../fp-lean-zh/) 保持一致：

1. **保留代码原样**：Lean 代码、命令、证明状态示例均保持英文，便于复制到 VS Code 中运行。
2. **术语对照**：重要术语首次出现时附英文，例如：
   - dependent type theory：依赖类型论
   - tactic：策略
   - proof state：证明状态
   - ring：环
3. **渐进式讲解**：保持原书 step-by-step 风格，对关键代码块给出中文说明。

## 本地阅读

所有翻译文件均为 Markdown 格式。建议从 [book/zh-CN/INDEX.md](book/zh-CN/INDEX.md) 开始浏览。

## 原书信息

- 在线版：[leanprover-community.github.io/mathematics_in_lean](https://leanprover-community.github.io/mathematics_in_lean/)
- 用户仓库：[leanprover-community/mathematics_in_lean](https://github.com/leanprover-community/mathematics_in_lean)
- 正文源码：[avigad/mathematics_in_lean_source](https://github.com/avigad/mathematics_in_lean_source)
- 已有社区中文版：[leanprover.cn/math-in-lean-zh](https://www.leanprover.cn/math-in-lean-zh/)（Sphinx 站点，与本项目的 Markdown 阅读体验不同）

## 翻译进度

- [x] 第 1 章：引言（2 节）
- [x] 第 2 章：基础（5 节）
- [x] 第 3 章：逻辑（6 节）
- [ ] 第 4–13 章：待译