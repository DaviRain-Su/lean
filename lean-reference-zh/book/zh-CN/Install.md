# 安装 Lean

> 对应英文：[Install Lean](https://lean-lang.org/install/)，抓取日期：2026-06-16。

安装 Lean 的推荐方式是使用 VS Code 和官方 Lean 4 VS Code 扩展。该扩展为 Lean 提供完整的开发环境，包括语法高亮、代码补全和交互式反馈。若需要不用扩展自动流程，也可以参考官网的[手动安装步骤](https://lean-lang.org/install/manual/)。

## 第一步：安装 VS Code

Lean 最适合搭配 VS Code 使用。VS Code 是轻量但功能完整的代码编辑器。

- 官网入口：[Install VS Code](https://code.visualstudio.com/)

## 第二步：安装 Lean 4 扩展

在 VS Code 中安装官方 Lean 4 扩展，或从 VS Code Marketplace 下载。

- Marketplace：[Lean 4 VS Code extension](https://marketplace.visualstudio.com/items?itemName=leanprover.lean4)
- VS Code 直达：`vscode:extension/leanprover.lean4`

## 第三步：完成扩展设置

Lean 4 VS Code 扩展会继续引导后续设置。它提供分步骤向导，帮助安装 Lean 工具链并配置编辑器。

- VS Code 设置向导：`vscode://leanprover.lean4/setup-guide`

## 手动安装说明

官网强烈建议优先使用上述推荐安装流程。手动安装指南主要通过命令行安装 Lean 和 VS Code，但不同系统环境可能需要自行调整。

手动指南也包含 VS Code 的安装步骤。如果你更偏好其他编辑器，Neovim 与 `lean.nvim` 对 Lean 开发支持较好。VSCodium 和 Cursor 也可通过 Open VSX Registry 上的 Lean 4 扩展获得非官方支持；具体安装方式应以各自官网为准。

## macOS 依赖

Lean 需要系统中安装 `git` 和 `curl`。在 macOS 10.9 及更高版本中，首次激活 `git` 命令时，Xcode Command Line Tools 会自动提示安装 `git`。

在终端运行：

```bash
git --version
```

如果已安装，它会输出 `git` 版本；否则系统会提示安装。