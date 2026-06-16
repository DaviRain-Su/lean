# 使用 Elan 管理工具链

> 对应英文：[Managing Toolchains with Elan](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Managing-Toolchains-with-Elan/)，抓取日期：2026-06-16。本页先翻译导言、toolchain 选择机制和常用命令。

Elan 是 Lean toolchain manager。它负责安装 toolchain，也负责运行 toolchain 中的程序。借助 Elan，可以在多个项目之间无缝切换；每个项目都可以指定自己要使用的 Lean 版本，而不需要用户手动安装和选择 toolchain。

每个项目通常会配置一个特定 Lean 版本。Elan 会在需要时透明安装该版本，并自动跟踪 Lean 版本变化。

## 选择 toolchain

使用 Elan 时，`PATH` 上每个 Lean 工具的版本都是一个 proxy。该 proxy 会根据当前上下文判断应该使用哪个 toolchain，确保它已经安装，然后调用对应 toolchain 中的真实程序。

可以通过在命令中传入带 `+` 前缀的参数来指定具体版本。例如：

```bash
lake +4.0.0 build
```

这会调用 Lean `4.0.0` 版本中的 `lake`，必要时先安装该版本。

## toolchain identifier

toolchain 通过 toolchain identifier 指定。identifier 可以是 channel，也可以是通过 `elan toolchain link` 建立的自定义 toolchain 名称。

常见 channel 包括：

- `stable`：最新稳定 Lean 版本。Elan 会跟踪稳定版本，并在有新版本时提示升级。
- `beta`：最新 release candidate。release candidate 是预期成为下一版稳定版本的构建，用于广泛测试。
- `nightly`：最新 nightly build。nightly 适合试验 Lean 新功能并向开发者反馈。
- 具体版本号或具体 nightly：例如 `4.17.0`、`v4.17.0` 或 `nightly-YYYY-MM-DD`。
- 自定义本地 toolchain：可用 `elan toolchain link` 为本地 Lean 构建建立名称，特别适合开发 Lean 编译器本身。

项目的 `lean-toolchain` 文件通常应包含一个具体 Lean 版本，而不是泛化 channel。这样更容易让协作者使用同一版本，也方便构建和测试旧版本项目。

identifier 还可以指定 origin。默认 origin 是官方 GitHub 仓库 `leanprover/lean4`。若指定 origin，它应出现在 channel 前，用冒号分隔；因此 `stable` 等价于 `leanprover/lean4:stable`。安装 nightly 时，origin 后会追加 `-nightly`，例如 `leanprover/lean4:nightly-2025-03-25` 会查询 `leanprover/lean4-nightly` 仓库。

## 当前 toolchain 如何确定

Elan 把 toolchain 与目录关联，并使用当前工作目录最近的、配置了 toolchain 的父目录。目录 toolchain 可以来自 `lean-toolchain` 文件，也可以来自 `elan override` 配置。

确定当前 toolchain 时，Elan 会从当前目录开始向父目录搜索：

1. 若目录有 toolchain override，则使用 override；
2. 否则若目录包含 `lean-toolchain` 文件，则使用该文件；
3. 更近的父目录优先于更远的祖先目录；
4. 同一目录同时有 override 和 `lean-toolchain` 时，override 优先；
5. 若没有找到目录 toolchain，则使用 Elan 的默认 toolchain。

最常见的配置方式是 `lean-toolchain` 文件。它是一个名为 `lean-toolchain` 的文本文件，内容为单行有效 toolchain identifier。该文件通常位于项目根目录，并随代码提交到版本控制，从而确保所有项目参与者使用同一 Lean 版本。

更新到新 Lean toolchain 通常只需编辑这个文件；下次打开或构建 Lean 文件时，新版本会自动下载并运行。

## toolchain 存放位置

默认情况下，Elan 把已安装 toolchain 存放在用户 home 目录下的 `.elan/toolchains` 中，把 proxy 放在 `.elan/bin` 中。安装 Elan 时，`.elan/bin` 会加入 `PATH`。

环境变量 `ELAN_HOME` 可用于修改该位置。若要修改，应在安装 Elan 之前设置，并在所有使用 Lean 的 session 中保持一致。

## 常用命令

### 查询 toolchain

```bash
elan show
```

显示当前 toolchain 以及已安装 toolchain。若当前项目有 `lean-toolchain` 文件，输出会说明当前 toolchain 是由该文件选择的。

### 设置默认 toolchain

```bash
elan default stable
elan default 4.17.0
```

设置没有 `lean-toolchain` 文件或 override 时使用的默认 toolchain。

### 管理已安装 toolchain

```bash
elan toolchain list
elan toolchain install 4.17.0
elan toolchain uninstall 4.17.0
elan toolchain link local-name /path/to/lean
elan toolchain gc
```

`elan toolchain gc` 会判断哪些已安装 toolchain 仍在使用，并提示清理未使用版本。出于安全原因，只有传入 `--delete` 时才会实际删除。

### 管理目录 override

```bash
elan override list
elan override set 4.17.0
elan override unset
```

override 是本地配置，优先级高于 `lean-toolchain` 文件。它适合测试本地构建的 Lean 编译器等高级场景，不应作为普通项目协作的默认方式。

### 在指定 toolchain 中运行命令

```bash
elan run --install 4.17.0 lake build
elan which lean
```

`elan run` 可临时用指定 toolchain 运行命令；`elan which` 显示某个命令在当前 toolchain 下对应的完整路径。