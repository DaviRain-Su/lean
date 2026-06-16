# toolchain 存放位置

> 对应英文：[Toolchain Locations](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Managing-Toolchains-with-Elan/#The-Lean-Language-Reference--Build-Tools-and-Distribution--Managing-Toolchains-with-Elan--Toolchain-Locations)，抓取日期：2026-06-16。

默认情况下，Elan 把：

- 已安装 toolchain 放在 `~/.elan/toolchains`
- proxy 可执行文件放在 `~/.elan/bin`

安装 Elan 时，`.elan/bin` 会被加入 `PATH`。

## `ELAN_HOME`

环境变量 `ELAN_HOME` 可改变 Elan 文件的根目录位置。若你要使用它：

- 应在安装 Elan **之前**设置；
- 之后每个使用 Lean 的 session 也应保持一致。

否则，Elan 可能在不同位置查找自己的 toolchain、proxy 和配置，导致行为不一致。

## 何时需要修改位置

常见场景：

- 想把 Lean 工具链放到更大的磁盘分区；
- 在受限环境中需要固定工具目录；
- 多用户或沙箱环境想显式分离 Elan 状态。

## 使用建议

- 普通本地开发默认位置即可；
- 若要改 `ELAN_HOME`，尽早统一，避免一台机器上混用多个 Elan 根目录；
- CI / 容器环境里可显式设置 `ELAN_HOME`，便于缓存和可复现配置。
