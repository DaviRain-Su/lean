# 在 Lean 项目中导航

本节介绍在 Lean 项目中高效导航的常用工具。

## 转到定义、声明与类型定义

['Go to Definition'](command:editor.action.revealDefinition)：光标在标识符上按 `F12`、右键或 `Shift`+点击。对类型类投影或产生投影的宏可能提供多个备选；对可约定义会穿透到底层声明。对 `import` 语句会跳到被导入文件。

['Go to Declaration'](command:editor.action.revealDeclaration)（右键）包含「Go to Definition」的所有备选，外加解析器与 elaborator。

['Go to Type Definition'](command:editor.action.goToTypeDefinition)（右键）跳到标识符的类型；复合类型会列出组成类型常量。

| ![](images/identifier-context-menu.png) |
| :--: |
| *标识符右键菜单* |

## 调用层次

['Calls: Show Call Hierarchy'](command:references-view.showCallHierarchy)：右键「Show Call Hierarchy」或 `Alt+Shift+H`，列出项目中使用该标识符的所有声明；展开可递归查看「使用的使用」。右上电话图标或 ['Calls: Show Outgoing Calls'](command:references-view.showOutgoingCalls) 可改为显示该声明内部使用的标识符。可对已检查项点 X 删除。

| ![](images/call-hierarchy.png) |
| :--: |
| *入向调用层次* |

| ![](images/call-hierarchy-outgoing.png) |
| :--: |
| *出向调用层次* |

## 查找引用

['References: Find All References'](command:references-view.findReferences)：右键或 `Alt+Shift+F12`。类似调用层次，但按文件组织、显示代码片段，不能递归遍历。

| ![](images/find-references.png) |
| :--: |
| *「查找所有引用」视图* |

## 工作区符号搜索

['Go to Symbol in Workspace…'](command:workbench.action.showAllSymbols)：`Ctrl+T`（`Cmd+T`），或 `Ctrl+P`（`Cmd+P`）后输入 `#`。模糊搜索项目中所有标识符并跳到声明处，通常比纯文本搜索更少误报。

| ![](images/workspace-symbol-search.png) |
| :--: |
| *工作区符号搜索* |

## 项目文本搜索

['Search: Find in Files'](command:workbench.action.findInFiles)：`Ctrl+Shift+F`。须先用 ['File: Open Folder…'](command:workbench.action.files.openFolder) 打开项目根目录。

搜索框右侧可切换：区分大小写（`Alt+C`）、全词匹配（`Alt+W`）、正则（`Alt+R`）。「要包含/排除的文件」可限制范围；书本图标可仅限已打开文件。树形视图按钮可按目录层次显示结果。可展开「替换」批量替换；正则捕获组用 `$1`、`$2` 等。可对单项点 X 删除。搜索编辑器视图（文件图标按钮）在编辑器中显示结果。

| ![](images/project-search.png) |
| :--: |
| *启用树形显示的搜索视图* |

## 模块层次

当前 Lean 文件中 `Alt+Shift+M` 执行 ['Module Hierarchy: Show Imports'](command:lean4.leanModuleHierarchy.showModuleHierarchy)，以当前模块为根显示 import 树。`Alt+Shift+N` 的 ['Show Inverse Module Hierarchy'](command:lean4.leanModuleHierarchy.showInverseModuleHierarchy) 显示「被谁 import」。

使用 `module` 关键字时也会显示 import 修饰符。视图右上可在 import / imported-by 间切换，并可 Refresh、Collapse All。

| ![](images/module-hierarchy.png) |
| :--: |
| *模块 `Main` 的 import 层次* |

## 复制模块名

['Copy Module Name'](command:lean4.copyModuleName) 将当前文件的 Lean 模块名复制到剪贴板，例如 `Mathlib/Tactic/Ring.lean` → `Mathlib.Tactic.Ring`。可在命令面板或 Lean 文件标签右键菜单使用。

## 转到文件

`Ctrl+P`（`Cmd+P`）打开 ['Go to File'](command:workbench.action.quickOpen)，按文件名快速打开。须先打开项目文件夹。

| ![](images/go-to-file.png) |
| :--: |
| *「转到文件」* |

## 资源管理器

`Ctrl+Shift+E`（`Cmd+Shift+E`）打开 ['View: Show Explorer'](command:workbench.view.explorer)。支持创建、删除、复制、重命名等。默认会随当前编辑器展开对应文件；点右上第四按钮 ['Collapse Folders in Explorer'](command:workbench.files.action.collapseExplorerFolders) 可全部折叠。`Ctrl`/`Cmd` 多选两个文件后右键可「Compare Selected」打开 diff。

| ![](images/file-explorer.png) |
| :--: |
| *VS Code 资源管理器* |