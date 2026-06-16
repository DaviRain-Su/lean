# 选择 toolchain

> 对应英文：[Selecting Toolchains](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Managing-Toolchains-with-Elan/#The-Lean-Language-Reference--Build-Tools-and-Distribution--Managing-Toolchains-with-Elan--Selecting-Toolchains)，抓取日期：2026-06-16。

Elan 安装到 `PATH` 上的 `lean`、`lake` 等工具并不是真正的编译器二进制，而是 **proxy**。当你调用这些命令时，proxy 会：

1. 判断当前上下文应使用哪个 toolchain；
2. 确保该 toolchain 已安装；
3. 调用该 toolchain 中真正的程序。

这让你可以在不同项目之间无缝切换，而不用手工安装、卸载或改 PATH。

## 用 `+版本` 强制选择

proxy 可以通过前缀参数临时指定版本：

```bash
lake +4.0.0 build
```

这会强制使用 Lean 4.0.0 对应的 `lake`。若本地没有该 toolchain，Elan 会先安装它。

## 为什么这很重要

- 同一台机器上可同时维护多个 Lean 项目；
- 每个项目可固定自己的 Lean 版本；
- 切换分支或打开旧项目时，Elan 会自动选择正确版本。

## 推荐实践

- 日常开发时，优先让项目根目录中的 `lean-toolchain` 文件决定版本；
- 只有在临时测试时，才用 `+版本` 覆盖当前选择；
- 不要长期依赖 shell alias 手工切换 Lean 版本，交给 Elan 管理更稳妥。
