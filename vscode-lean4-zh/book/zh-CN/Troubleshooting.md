# 故障排除

本节介绍诊断 Lean 环境、扩展与 Lean 本身问题的工具。

## 安装诊断

扩展在启动 Lean 前会检查环境是否正常，分**全局**与**项目**两级。

**全局诊断**（首次打开 Lean 文件时）— 若有错误级问题，Lean 相关功能不会激活：

1. 是否安装 [Curl](https://curl.se/) 与 [Git](https://git-scm.com/)（错误）
2. 能否找到 Lean（错误）
3. [Elan](https://github.com/leanprover/elan/blob/master/README.md) 是否安装且较新（警告）
4. 操作系统版本是否足够新（警告）
5. VS Code 是否足够新以自动更新扩展（警告）

**项目诊断**（打开某项目首个 Lean 文件时）— 若有错误级问题，该项目不会启动 Lean，但若全局无错误，其他 Lean 功能仍可用：

1. 是否在未保存的未命名文件中运行 Lean（警告）
2. 项目是否有 `lean-toolchain`（警告）
3. 能否找到 Lean（错误）
4. 是否为 Lean 3 项目（错误）
5. 是否使用首个 Lean 4 稳定版之前的版本（警告）
6. 能否找到 [Lake](https://github.com/leanprover/lean4/blob/master/src/lake/README.md)（错误）

全局错误时，右下角通知的「Retry」可重试扩展启动。项目级错误时，切换文件标签再切回即可重新检查。可用「Lean 4: Show Setup Warnings」关闭所有安装警告。

## 收集环境信息

['Troubleshooting: Show Setup Information'](command:lean4.troubleshooting.showSetupInformation) 收集最后聚焦 Lean 文件上下文下的环境信息，包括操作系统、CPU、内存、VS Code 与扩展版本、Curl/Git/Elan/Lean 状态、项目路径、`lean-toolchain`、可用 Elan 版本等。输出为 Markdown，可复制到 [Lean Zulip](https://leanprover.zulipchat.com) 等支持 Markdown 的工具。

| ![](images/setup-information.png) |
| :--: |
| *环境信息输出* |

## 输出视图

Lean 交互错误或外部命令输出显示在「Lean: Editor」输出视图，有助于排错。用 ['Troubleshooting: Show Output'](command:lean4.troubleshooting.showOutput) 打开。

| ![](images/output-view.png) |
| :--: |
| *「Lean: Editor」输出视图* |

## 重启 Lean

若 Lean 交互严重异常（例如 Lean 内部 bug），可用 ['Server: Restart Server'](command:lean4.restartServer) 完全重启 Lean 服务器。若是扩展本身 bug，可尝试重启 VS Code。