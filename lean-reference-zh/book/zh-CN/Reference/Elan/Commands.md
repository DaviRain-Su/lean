# Elan 命令行接口

> 对应英文：[Command-Line Interface](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Managing-Toolchains-with-Elan/#The-Lean-Language-Reference--Build-Tools-and-Distribution--Managing-Toolchains-with-Elan--Command-Line-Interface)，抓取日期：2026-06-16。

除了通过 proxy 自动选版本外，Elan 还提供独立命令行工具 `elan`，用于查询和配置 toolchain。

## 全局 flag

- `--help` / `-h`：显示当前子命令说明。
- `--verbose` / `-v`：显示更详细输出。
- `--version` / `-V`：显示 Elan 版本。

## 查询当前状态

### `elan show`

显示当前激活的 toolchain，以及所有已安装 toolchain。它非常适合回答：

- 当前目录到底在用哪个 Lean 版本？
- 这个版本是来自默认配置、`lean-toolchain` 还是 override？
- 本机已经装了哪些版本？

## 设置默认 toolchain

### `elan default`

设置默认 toolchain。当当前目录及其父目录都没有 `lean-toolchain` 或 override 时，Elan 会回退到这里指定的默认版本。

## 管理已安装 toolchain

### `elan toolchain list`

列出所有已安装 toolchain。

### `elan toolchain install`

安装指定 toolchain。

### `elan toolchain uninstall`

卸载指定 toolchain。

### `elan toolchain link`

把本地 Lean 构建注册成一个自定义 toolchain 名称。

### `elan toolchain gc`

清理未使用的 toolchain。常见选项：

- `--delete`
- `--json`

## 管理目录 override

### `elan override list`

列出当前配置的目录 override。

### `elan override set`

给某目录设置 override。常见选项：

- `--path`
- `--nonexistent`

### `elan override unset`

删除目录 override。

## 运行工具和命令

### `elan run`

在指定 toolchain 下运行命令。常见选项：

- `--install`：若缺少该 toolchain，则先安装。

### `elan which`

显示某工具在当前上下文中实际对应的可执行文件路径。调试“为什么调用到了这个版本”时非常有用。

## 管理 Elan 自身

### `elan self update`

升级 Elan 本身。

### `elan self uninstall`

卸载 Elan。

### `elan completions`

生成 shell completion。

## 使用建议

- 先用 `elan show` 看清楚当前状态，再决定是否改默认版本或 override。
- 团队项目改版本优先修改 `lean-toolchain`，不要靠 `elan default` 或 `override set` 代替。
- 本地调试 Lean 编译器版本时，优先 `toolchain link` + `override set`。