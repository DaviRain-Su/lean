# 管理 Lean 版本

本节介绍如何管理不同 Lean 版本。命令是版本管理器 [Elan](https://github.com/leanprover/elan/blob/master/README.md) 的前端，可通过[命令面板](Commands.md#command-palette)或命令菜单「Version Management…」访问。

## Elan

[Elan](https://github.com/leanprover/elan/blob/master/README.md) 是 Lean 的版本管理器。运行 `lean`、`lake` 等命令时，会根据当前工作目录自动安装所需 Lean 版本。

在含 `lean-toolchain` 的项目内，Elan 使用该文件指定的版本；项目外使用默认版本，可用 `elan default <version>` 配置。

版本可以是具体版本（如 `leanprover/lean4:v4.14.0`）或发布通道（如 `leanprover/lean4:stable`，也是 Elan 初次安装时的默认通道）。通道会解析到该通道下最新的具体版本。

Elan 4.0.0 之前，通道须显式安装，安装时解析到当时最新版，可用 `elan toolchain update <channel>` 手动更新。  
Elan 4.0.0 起，通道不能再「安装」，但使用时（例如默认 `leanprover/lean4:stable`）会自动解析到通道最新版，无需手动更新；无网络时会尝试回退到该通道上次安装的版本。

Elan 4.0.0 之前，扩展会像命令行一样自动安装缺失版本。  
Elan 4.0.0 起，可启用「Lean 4: Always Ask Before Installing Lean Versions」，每次安装前确认；且打开使用发布通道版本的文件时，若通道有新版可用，总会提示确认。

## 选择默认 Lean 版本

['Setup: Select Default Lean Version…'](command:lean4.setup.selectDefaultToolchain) 查询已安装版本并从 [release.lean-lang.org](https://release.lean-lang.org/) 获取可用版本列表。

| ![](images/select-default-lean-version.png) |
| :--: |
| *选择默认 Lean 版本* |

## 更新发布通道

['Setup: Update Release Channel Lean Version…'](command:lean4.setup.updateReleaseChannel) 手动安装 `leanprover/lean4:stable` 与 `leanprover/lean4:nightly` 的最新解析版本（若有更新则显示选择对话框）。

| ![](images/update-release-channel.png) |
| :--: |
| *更新发布通道* |

## 卸载 Lean 版本

['Setup: Uninstall Lean Versions…'](command:lean4.setup.uninstallLeanVersions) 用 Elan 垃圾回收找出未使用版本，并提供批量/单独卸载对话框。

| ![](images/uninstall-lean-versions.png) |
| :--: |
| *卸载 Lean 版本* |

## 安装、更新与卸载 Elan

- ['Setup: Install Elan'](command:lean4.setup.installElan)
- ['Setup: Update Elan'](command:lean4.setup.updateElan)
- ['Setup: Uninstall Elan'](command:lean4.setup.uninstallElan) — 移除 Elan 及所有已安装 Lean 版本。

安装 Elan 或从 4.0.0 之前升级后，扩展会询问是否启用「[Lean 4: Always Ask Before Installing Lean Versions](ManagingVersions.md#elan)」。