# 入门指南

本书的目标是教你用 Lean 4 交互式证明助手（interactive proof assistant）形式化数学。我们假设你具备一些数学背景，但不要求很多；书中例子涵盖数论、测度论与分析等领域，但侧重这些领域较初等的部分——若不熟悉，可以在阅读过程中逐步掌握。我们也不预设你有形式化方法（formal methods）的背景。

形式化可以看作一种计算机编程：我们用一种规范的语言——类似编程语言——写下数学定义、定理和证明，Lean 能够理解这种语言。作为回报，Lean 会给出反馈与信息，解释表达式并保证它们形式良好，最终认证我们证明的正确性。

了解更多 Lean 信息，可访问 [Lean 项目主页](https://leanprover.github.io) 与 [Lean 社区网站](https://leanprover-community.github.io/)。本教程基于 Lean 庞大且持续增长的库 *Mathlib*。我们还强烈建议加入 [Lean Zulip 在线聊天群](https://leanprover.zulipchat.com/)——那里有热情友好的 Lean 爱好者，乐于答疑并提供支持。

虽然你可以在线阅读 PDF 或 HTML 版本，但本书设计为**交互式阅读**：在 VS Code 编辑器中运行 Lean。入门步骤如下：

1. 按[安装说明](https://lean-lang.org/install/)安装 Lean 4 与 VS Code。
2. 在 VS Code 右上角点击 ∀ 符号，选择 `Open Project` → `Download Project` → `Mathematics in Lean` 拉取仓库。
3. 书中每一节都有带例题与练习的 Lean 文件，位于 `MIL` 文件夹，按章组织。强烈建议**复制**该文件夹，在副本中实验和做练习。这样原文件保持完整，也便于仓库更新（见下文）。副本可命名为 `my_files` 等，也可在其中创建自己的 Lean 文件。

此时，你可以在 VS Code 侧边栏打开教材：

1. 按 `Ctrl-Shift-P`（macOS 为 `Command-Shift-P`）。
2. 在弹出栏输入 `Lean 4: Docs: Show Documentation Resources`，回车。
3. 在打开的窗口中点击 `Mathematics in Lean`。

也可以在云端用 [Codespaces](https://github.com/codespaces) 运行 Lean 与 VS Code；说明见 GitHub 上 [mathematics_in_lean 项目页](https://github.com/leanprover-community/mathematics_in_lean)。我们仍建议复制 `MIL` 文件夹，如上所述。

教材与关联仓库仍在完善中。在 `mathematics_in_lean` 目录执行 `git pull`，再执行 `lake exe cache get` 即可更新。（这假设你没有修改 `MIL` 文件夹内容，因此建议先复制一份。）

我们希望你**边读教材边在 `MIL` 文件夹中做练习**；教材包含解释、指示与提示。正文常会给出示例，例如：

```lean
#eval "Hello, World!"
```

你应能在对应的 Lean 文件中找到该示例。点击该行时，VS Code 会在 `Lean InfoView` 窗口显示 Lean 的反馈；将光标悬停在 `#eval` 上，会弹出 Lean 对该命令的响应。欢迎编辑文件并尝试自己的例子。

书中还提供大量有挑战性的练习。**不要匆匆跳过！** Lean 的核心是**交互式**做数学，而不只是阅读。完成练习是学习的中心环节。不必做完所有练习；当你觉得已掌握相关技能时，可以继续前进。可随时将解答与每节 `solutions` 文件夹中的参考答案对照。