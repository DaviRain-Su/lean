# 安装与设置

本手册介绍如何使用最新版 Lean 4 VS Code 扩展与最新版 Lean 4 交互。

## 安装 Lean 4

Lean 4 VS Code 扩展的「[安装指南](command:lean4.docs.showSetupGuide)」介绍如何安装 Lean 4。

## 配置设置

Lean 4 扩展与 VS Code 本身的设置可在 VS Code 的「[设置](command:workbench.action.openSettings2)」页配置：「文件」>「首选项」>「设置」，或按 `Ctrl+,`（`Cmd+,`）。在设置页中，Lean 4 扩展的设置位于「扩展」>「Lean 4」下。

Lean 4 扩展各项设置的细节见后文各节。

扩展为 Lean 4 文档预设了以下默认值：

- **Editor: Insert Spaces: true** — 按 `Tab` 插入空格。
- **Editor: Tab Size: 2** — 每次 `Tab` 插入两个空格。
- **Files: Encoding: UTF-8** — 文件使用 [UTF-8](https://en.wikipedia.org/wiki/UTF-8) 编码。
- **Files: Eol: \n** — 行尾统一为 `\n`，便于 Windows 与 Unix 一致。
- **Files: Insert Final Newline: true** — 文件末尾保留空行。
- **Files: Trim Final Newlines: true** — 文件末尾只保留一行空行。
- **Files: Trim Trailing Whitespace: true** — 删除行尾多余空白。

建议保持这些默认值。若需覆盖，可在设置页搜索 `@lang:lean4` 后修改对应项。

| ![](images/settings_page.png) |
| :--: |
| *VS Code 设置页* |