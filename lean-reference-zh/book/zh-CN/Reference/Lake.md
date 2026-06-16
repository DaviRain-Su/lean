# Lake 概念与工作区

> 对应英文：[Lake](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/)，抓取日期：2026-06-16。本页先翻译 Lake 导言与核心概念。

Lake 是 Lean 的标准构建工具。它负责：

- 配置构建并构建 Lean 代码；
- 获取并构建外部依赖；
- 与 Reservoir（Lean 包服务器）集成；
- 运行测试、linter 和其他开发工作流。

Lake 是可扩展的。它提供丰富的 API，可用于为非 Lean 软件产物定义增量构建任务、自动化管理任务，并集成外部工作流。对于不需要这些功能的构建配置，Lake 提供声明式配置语言，可以写成 TOML，也可以写成 Lean 文件。

本节描述 Lake 的命令行界面、配置文件和内部 API。三者共享一组概念和术语。

## package

package 是 Lean 代码分发的基本单位。单个 package 可以包含多个 library 或 executable program。一个 package 由一个目录组成，其中包含 package configuration file 和源代码。

package 可以 require 其他 package；这些依赖 package 的代码，更准确地说是它们的 target，会对当前 package 可用。一个 package 直接 require 的依赖称为 direct dependency；direct dependency 及其传递依赖合在一起称为 transitive dependency。

package 可以来自 Reservoir，也可以来自手动指定的位置。Git dependency 通过 Git 仓库 URL 和 revision（branch、tag 或 hash）指定，并且必须在构建前克隆到本地；local path dependency 通过相对于当前 package 目录的路径指定。

## workspace

workspace 是磁盘上的一个目录，包含某个 package 的源码工作副本，以及所有不是 local path 的传递依赖源码。创建 workspace 的 package 称为 root package。workspace 也包含该 package 的构建产物，以支持增量构建。

依赖和构建产物即使还不存在，目录也可以被视为 workspace；`lake update` 和 `lake build` 等命令会在缺失时生成它们。Lake 通常在 workspace 中使用。`lake init` 和 `lake new` 是例外，因为它们用于创建 workspace。

典型 workspace 布局如下：

- `lean-toolchain`：toolchain 文件。
- `lakefile.toml` 或 `lakefile.lean`：root package 的配置文件。
- `lake-manifest.json`：root package 的 manifest。
- `.lake/`：Lake 管理的中间状态，例如构建产物和依赖源码。
- `.lake/lakefile.olean`：缓存后的 root package 配置。
- `.lake/packages/`：workspace 的 package 目录，包含 root package 所有非本地传递依赖的副本，以及这些依赖自己的 `.lake` 构建产物。
- `.lake/build/`：root package 的构建目录。
- `.lake/build/bin`：二进制目录，包含构建出的可执行文件。
- `.lake/build/lib`：库目录，包含已构建库和 `.olean` 文件。
- `.lake/build/ir`：中间结果目录，主要包含生成的 C 代码等中间产物。

## package configuration file

package configuration file 指定 package 的依赖、设置和 target。package 可以指定应用到其所有 target 的配置选项。配置文件可用两种格式编写：

- TOML 格式（`lakefile.toml`）：用于完全声明式的 package 配置。
- Lean 格式（`lakefile.lean`）：额外允许用 Lean 代码配置 package，以表达声明式选项无法覆盖的配置。

## manifest

manifest 记录 package 使用的其他 package 的具体版本。manifest 与 package configuration file 共同指定 package 的唯一传递依赖集合。

构建前，Lake 会把每个依赖的本地副本同步到 manifest 中指定的版本。如果没有 manifest，Lake 会获取每个依赖最新的匹配版本，并创建 manifest。如果 manifest 中列出的 package 名称与 package 配置中使用的名称不一致，则这是错误；必须在构建前用 `lake update` 更新 manifest。

manifest 应被视为 package 代码的一部分，通常应提交到版本控制。

## target 与 artifact

target 表示用户可以请求的输出。持久化的构建输出，例如 object code、可执行二进制文件或 `.olean` 文件，称为 artifact。

在产生某个 artifact 的过程中，Lake 可能需要先产生其他 artifact。例如，把 Lean 程序编译为 executable，需要先把它和依赖编译为 object file；object file 又来自 C 源文件；C 源文件来自 Lean 源文件的 elaboration 和 `.olean` 文件生成。链条中的每个环节都是 target，Lake 会安排它们按顺序构建。

初始 target 包括：

- package：作为一个单元分发的 Lean 代码；
- library：一个或多个 module root 下层级组织的 Lean module 集合；
- executable：定义 `main` 的单个 module；
- external library：将链接到当前 package 及其依赖二进制中的非 Lean 静态库；
- custom target：使用 Lake 内部 API 编写的任意构建任务。

## build

产生某个目标 artifact（例如 `.olean` 文件或可执行二进制文件）称为 build。build 由 `lake build` 触发，也可由需要 artifact 已存在的其他命令触发，例如 `lake exe`。

build 包含四类步骤：

1. **配置 package**：如果配置文件比缓存的 `lakefile.olean` 新，或缓存文件缺失，或传入 `--reconfigure`/`-R`，则重新 elaboration package 配置。
2. **计算依赖**：确定为了产生请求输出所需的 artifact、target 和 facet，递归得到依赖图。
3. **回放 trace**：Lake 使用保存的 trace 文件判断哪些 artifact 需要重建，能复用的输出会被回放。
4. **构建 artifact**：当依赖图中未修改的部分已回放完成后，Lake 运行相应构建工具，保存 artifact 和 trace 文件。

Lake 对文本文件 hash 前会规范化换行，因此仅平台换行差异不同的文件会得到相同 hash；其他文件则不做规范化。