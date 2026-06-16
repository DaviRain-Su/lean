# 管理 Lean 项目

本节介绍如何用 Lean 4 VS Code 扩展管理项目。这些命令是包管理器 [Lake](https://github.com/leanprover/lean4/blob/master/src/lake/README.md) 的前端。

## 创建项目

通过[命令面板](Commands.md#command-palette)或[命令菜单](Commands.md#command-menu)的「New Project…」子菜单：

1. **['Project: Create Standalone Project…'](command:lean4.project.createStandaloneProject)** — 创建无额外依赖的新项目，使用 `leanprover/lean4:stable`，初始化 Git 并做初始提交。
2. **['Project: Create Project Using Mathlib…'](command:lean4.project.createMathlibProject)** — 创建依赖 [Mathlib](https://github.com/leanprover-community/mathlib4) 的项目，使用 Mathlib 的 Lean 版本，下载安装当前 Mathlib 构建缓存，初始化 Git 并提交。

## 打开项目

「Open Project…」子菜单：

1. **['Project: Open Local Project…'](command:lean4.project.open)** — 选择文件夹打开，类似「打开文件夹」，并确认其为 Lean 4 项目。
2. **['Project: Download Project…'](command:lean4.project.clone)** — 从 URL 克隆到指定目录；若项目为 Mathlib 或依赖 Mathlib，会安装构建缓存。

## 项目操作

「Project Actions…」子菜单（须已有 Lean 项目）：

1. **['Project: Build Project'](command:lean4.project.build)** — 构建整个项目；Mathlib 相关会先拉缓存。
2. **['Project: Clean Project'](command:lean4.project.clean)** — 清除构建产物；Mathlib 相关可随后重装缓存。
3. **['Project: Update Dependency…'](command:lean4.project.updateDependency)** — 选择并更新依赖；Mathlib 相关会拉缓存；若 Lean 版本变化可提示更新项目 `lean-toolchain`。
4. **['Project: Fetch Mathlib Build Cache'](command:lean4.project.fetchCache)** — 为整个 Mathlib 依赖拉缓存。
5. **['Project: Fetch Mathlib Build Cache For Open Files'](command:lean4.project.fetchOpenFileCaches)** — 为选中已打开文件及其 import 拉缓存。
6. **['Project: Fetch Mathlib Build Cache For All Open Files'](command:lean4.project.fetchAllOpenFileCaches)** — 为所有已打开文件及其 import 拉缓存。
7. **['Project: Fetch Mathlib Build Cache For Current File'](command:lean4.project.fetchFileCache)** — 为当前文件及其 import 拉缓存。
8. **['Project: Select Project Lean Version…'](command:lean4.project.selectProjectToolchain)** — 选择 Lean 版本并写入 `lean-toolchain`。

| ![](images/update-dependency.png) |
| :--: |
| *「Update Dependency…」对话框* |

| ![](images/select-project-lean-version.png) |
| :--: |
| *「Select Project Lean Version…」对话框* |

## 编辑 Lakefile

编辑 `lakefile.toml` 时，扩展（依赖 [Even Better TOML](https://marketplace.visualstudio.com/items?itemName=tamasfe.even-better-toml)）提供 Lake 配置的 schema 校验、补全与悬停文档。

## 终端

若扩展命令不够用，`` Ctrl+Shift+` ``（`` Cmd+Shift+` ``）或 ['Terminal: Create New Terminal'](command:workbench.action.terminal.new) 打开集成终端，可运行任意 [Lake](https://github.com/leanprover/lean4/blob/master/src/lake/README.md) 命令。

| ![](images/terminal-view.png) |
| :--: |
| *VS Code 终端* |