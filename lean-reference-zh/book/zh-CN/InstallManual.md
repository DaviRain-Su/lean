# 手动安装 Lean

> 对应英文：[Manual Installation](https://lean-lang.org/install/manual/)，抓取日期：2026-06-16。

官方强烈建议使用推荐安装流程来安装 Lean。本指南给出主要通过命令行手动安装 Lean 和 VS Code 的详细步骤；不过这些说明并不能在所有环境中都可靠工作，你可能需要根据自己的系统做相应调整。

本手动指南也包含安装 VS Code 的步骤。如果你更偏好其他编辑器，Neovim 和 `lean.nvim` 插件对 Lean 开发支持较好。其他选择包括 VSCodium 和 Cursor；它们可以通过 Open VSX Registry 上的 Lean 4 扩展获得非官方编辑器支持。具体安装方式请以各自官网为准。

## Linux / macOS / Windows

官网手动安装页按系统分为 Linux、macOS 和 Windows 标签页。以下是 macOS 标签页当前可见的核心步骤；其他系统的具体命令应以英文原页为准。

## 安装依赖

Lean 需要系统中安装 `git` 和 `curl`。在 macOS 10.9 及更高版本中，Xcode Command Line Tools 会在首次激活 `git` 命令时自动安装 `git`。打开终端并运行：

```bash
git --version
```

这会返回已安装的 `git` 版本；如果尚未安装，系统会提示安装 `git`。

## 安装 Homebrew 和 elan

手动安装流程随后会安装 Homebrew 与 `elan`。`elan` 是 Lean toolchain manager，用于安装、选择和调用 Lean 版本。普通项目通常通过项目根目录的 `lean-toolchain` 文件固定 Lean 版本。

## 安装 VS Code 和 Lean 4 扩展

手动流程仍建议安装 VS Code 与官方 Lean 4 扩展。扩展提供 Lean 文件编辑、交互式 goal/state 显示、诊断信息和命令入口。

## 创建新的 Lean 项目

安装完成后，可以用 Lake 创建新的 Lean 项目。项目通常包含：

- `lean-toolchain`：指定 Lean toolchain；
- `lakefile.toml` 或 `lakefile.lean`：Lake 配置；
- `lake-manifest.json`：依赖锁定文件；
- 源码目录和 `.lean` 文件。

## 打开已有 Lean 项目

打开已有项目时，应从项目根目录打开 VS Code，使 Lean 扩展能找到 `lean-toolchain` 和 Lake 配置。若项目依赖 Mathlib 或其他包，首次打开或构建时可能需要下载依赖和缓存。

## 更新 Mathlib

依赖 Mathlib 的项目通常通过 Lake 管理依赖版本。更新 Mathlib 时，需要同步 Lake manifest，并确保项目 Lean toolchain 与 Mathlib 版本兼容。具体命令和流程会随 Mathlib 版本变化，应以项目 README 或英文官方页面为准。