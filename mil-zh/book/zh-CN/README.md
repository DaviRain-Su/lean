# Mathematics in Lean

本教程基于 Lean 4、VS Code 和 Mathlib。

你可以在[在线 HTML 版](https://leanprover-community.github.io/mathematics_in_lean/)或[本仓库 PDF](https://leanprover-community.github.io/mathematics_in_lean/mathematics_in_lean.pdf)中阅读教材；更推荐的做法是在本机克隆仓库副本，边读边在 VS Code 中做练习。

本书面向 [Lean 4](https://leanprover.github.io/) 与 [Mathlib](https://github.com/leanprover-community/mathlib4)。Lean 3 版本见 [mathematics_in_lean3](https://github.com/leanprover-community/mathematics_in_lean3)。

## 在本机使用

1. 按[安装说明](https://lean-lang.org/install/)安装 Lean 4 与 VS Code。
2. 在 VS Code 右上角点击 ∀ 符号，选择 `Open Project` → `Download Project` → `Mathematics in Lean` 拉取仓库。
3. 书中每一节都有对应的 Lean 文件，位于 `MIL` 文件夹，按章组织。强烈建议**复制**该文件夹后再做练习，这样原文件保持不变，也便于日后 `git pull` 更新。

然后可在浏览器打开[在线教材](https://leanprover-community.github.io/mathematics_in_lean/)，同时在 VS Code 中编辑 `MIL` 里的文件。

也可以在云端使用 [Codespaces](https://github.com/codespaces) 或 Gitpod 运行 Lean 与 VS Code，详见 [mathematics_in_lean 项目页](https://github.com/leanprover-community/mathematics_in_lean)。同样建议复制 `MIL` 文件夹。

## 更新仓库

教材与仓库仍在持续更新。在 `mathematics_in_lean` 目录执行：

```bash
git pull
lake exe cache get
```

（若未修改原始 `MIL` 文件夹内容，更新会更顺利——这也是建议先复制一份的原因。）

## 贡献

PR 与 issue 请提交到上游[源码仓库](https://github.com/avigad/mathematics_in_lean_source)。