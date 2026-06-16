# 使用命令

Lean 4 VS Code 扩展提供多条命令，用于与扩展本身及 Lean 4 交互。

在尚未选中任何 Lean 4 文档时，只能使用不依赖已打开 Lean 文件的命令，例如[创建项目](ManagingProjects.md#creating-projects)、[打开项目](ManagingProjects.md#opening-projects)、[排错信息](Troubleshooting.md)、[管理 Lean 版本](ManagingVersions.md)以及打开本手册等文档命令。

一旦选中过 Lean 4 文档，即可使用只能在 Lean 文件上下文中运行的命令，例如[重启文件](InteractingWithFiles.md#file-restarting)、[重启 Lean](Troubleshooting.md#restarting-lean)、[切换 InfoView](InteractingWithFiles.md#infoview)、对当前文件所属项目执行[项目操作](ManagingProjects.md#project-actions)等。这些命令作用于 VS Code 中**最后获得焦点的** Lean 4 文档。

扩展提供的具体命令见后文各节。

## 命令菜单

打开任意文本文档时，VS Code 会在当前文档右上角显示 ∀ 符号。点击该符号打开 Lean 4 扩展的命令菜单。

菜单列出当前上下文中可用的全部扩展命令。若尚未选中 Lean 4 文档，只显示不依赖 Lean 文件的命令；选中过后显示全部命令。

若在未打开 Lean 4 文档时不想显示 ∀ 符号，可关闭「Lean 4: Always Show Title Bar Menu」设置。

| ![](images/command-menu.png) |
| :--: |
| *Lean 4 扩展命令菜单* |

## 命令面板

所有命令都可通过[命令面板](command:workbench.action.showCommands)访问：「查看」>「命令面板…」，或 `Ctrl+Shift+P`（`Cmd+Shift+P`）。输入「Lean 4」可筛选扩展命令。若尚未选中 Lean 4 文档，只显示不依赖 Lean 文件的命令。

| ![](images/command-palette.png) |
| :--: |
| *VS Code 命令面板* |

## 组合键（Chords）

VS Code 中许多命令绑定为组合键：需依次按下多个键。常见形式为 `Ctrl+K Ctrl+<某键>`（`Cmd+K Cmd+<某键>`）——按住 `Ctrl`（`Cmd`），按 `K`，松开 `K`，再按另一键。

## 配置键盘快捷键

所有命令的快捷键可在「文件」>「首选项」>「键盘快捷方式」中配置，或打开[键盘快捷方式](command:workbench.action.openGlobalKeybindings)。输入「Lean 4」可筛选扩展命令。

| ![](images/shortcut-settings.png) |
| :--: |
| *VS Code 键盘快捷方式设置* |