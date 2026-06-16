# 查找定义与定理

本节介绍如何在 VS Code 中借助扩展在 [Mathlib](https://github.com/leanprover-community/mathlib4) 等库中查找定义与定理。

## LoogleView

[Loogle](https://loogle.lean-lang.org/) 可搜索 Lean 标准库及近期 Mathlib 中的定义与定理。在 VS Code 中用 ['Loogle: Search'](command:lean4.loogle.search)：`Ctrl+K Ctrl+S`（`Cmd+K Cmd+S`）、Lean 文件右键、[命令面板](Commands.md#command-palette)或[命令菜单](Commands.md#command-menu)。`Escape` 关闭。

调用前若在编辑器中选中文本，会立即搜索该文本。输入框支持与 Lean 文件相同的 [Unicode 输入](InteractingWithFiles.md#unicode-input)。点放大镜或 `Enter` 搜索；上下箭头浏览历史查询。语法说明见 LoogleView 内提示。

结果显示匹配列表（最多 200 条）或无结果时的建议列表；每项显示名称、模块与类型。点击名称在 VS Code 内打开该标识符文档；点击建议立即查询。

| ![](images/loogleview.png) |
| :--: |
| *LoogleView* |