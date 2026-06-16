# Lake 命令行接口

> 对应英文：[Command-Line Interface](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/#lake-cli)，抓取日期：2026-06-16。

Lake 的命令行接口围绕几个高频工作流组织：创建 package、构建与运行、测试与 lint、依赖管理、脚本、缓存与配置转换。

## 常见全局选项

- `--version`
- `--help` / `-h`
- `--dir` / `-d`
- `--file` / `-f`
- `--update`
- `--reconfigure` / `-R`
- `--no-build`
- `--no-cache`
- `--try-cache`

## 输出控制

- `--quiet` / `-q`
- `--verbose` / `-v`
- `--ansi` / `--no-ansi`
- `--log-level`
- `--fail-level`
- `--iofail`
- `--wfail`

## 高价值命令分组

### 创建 package

- `lake new`
- `lake init`

### 构建与运行

- `lake build`
- `lake check-build`
- `lake query`
- `lake exe`
- `lake clean`
- `lake env`
- `lake lean`
- `lake shake`

### 测试与开发工具

- `lake test`
- `lake lint`
- `lake check-test`
- `lake check-lint`
- `lake serve`

### 依赖与分发

- `lake update`
- `lake upload`
- `lake pack`
- `lake unpack`
- `lake cache ...`
- `lake translate-config`

## 经验规则

- 新项目：`lake new` / `lake init`
- 日常编译：`lake build`
- 跑可执行：`lake exe`
- 测试与 lint：`lake test` / `lake lint`
- 依赖升级：`lake update`
- 调试环境：`lake env` 或 `lake lean`

## 环境变量

Lake 还识别若干环境变量，例如：

- `LAKE`
- `LAKE_HOME`
- `LEAN_SYSROOT`
- `LAKE_OVERRIDE_LEAN`
- `LAKE_NO_CACHE`
- `LAKE_ARTIFACT_CACHE`

这些变量主要影响 Lake 自身位置、Lean toolchain 路径、缓存策略和构建环境。
