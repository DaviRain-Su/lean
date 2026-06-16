# 与 Lean 文件交互

本节介绍如何用 Lean 4 VS Code 扩展阅读、导航并与单个 Lean 文件交互。

## 文件处理

打开 Lean 文件后，Lean 须先处理该文件才能提供大多数交互功能。由于处理过程可能执行文件中的任意自动化，代价可能较高。

处理进度在编辑器右侧滚动条上以橙色条显示：仍有橙色条的区域正在处理，橙色条消失的区域已处理完成。编辑器左侧的橙色条表示**当前可见行**中哪些仍在处理。

修改文件后，Lean 须重新处理所有可能依赖被改声明的声明；目前这意味着从修改点往下的代码都需重新处理。

正在处理的部分尚无法提供依赖处理信息的交互功能。例如未处理区域不显示[错误/警告/信息](InteractingWithFiles.md#errors-warnings-and-information)，[InfoView](InteractingWithFiles.md#infoview) 不显示当前目标，[悬停](InteractingWithFiles.md#hovers) 也不会弹出，直到处理推进到相应位置。

| ![](images/file-progress.png) |
| :--: |
| *文件处理进度：右侧为全文件，左侧为可见行* |

## 错误、警告与信息

VS Code 用波浪下划线在 Lean 文件中直接显示三种严重级别的诊断：

1. **错误** — 红色波浪线，表示处理该处时出错（如语法错误）。
2. **警告** — 橙色波浪线，表示潜在问题（如未使用变量）。
3. **信息** — 蓝色波浪线，表示额外信息（如 `#check 0` 会在 `#check` 下显示蓝线）。

悬停带波浪线的代码会在[悬停面板](InteractingWithFiles.md#hovers)中显示内容。光标放在该行时，[InfoView](InteractingWithFiles.md#infoview) 的「Messages」区也会显示可交互版本。「All Messages」显示整个文件的所有可交互诊断。

跨多行的诊断只在第一行画波浪线以减少视觉干扰，但光标在诊断完整范围内时都会在「Messages」中显示。

右侧滚动条上的红/橙/蓝区域标示对应严重级别的诊断位置。

左下角状态栏用符号显示所有已打开文件的诊断数量；点击可打开「问题」视图（`Ctrl+Shift+M` / `Cmd+Shift+M`），快速跳转到诊断位置。

扩展还提供额外装饰：

1. **错误/警告范围装饰** — 行号左侧显示叉号或警告图标；多行错误有红色竖线延伸。可通过「Lean 4 > Show Diagnostic Gutter Decorations」关闭。
2. **「未解决目标」装饰** — 在「unsolved goals」错误结束行显示进行中标记。可通过相关 Lean 4 设置关闭或改主题色。
3. **「目标已完成」装饰** — 无错误且无 `sorry` 的定理旁显示双勾。图标种类可配置。

安装 [Error Lens](command:extension.open?%5B%22usernamehw.errorlens%22%5D) 扩展可在行内高亮并内联显示诊断消息。

| ![](images/diagnostics.png) |
| :--: |
| *错误、警告、信息诊断及悬停/InfoView* |

| ![](images/problems-view.png) |
| :--: |
| *VS Code「问题」视图* |

## 重启文件

若 `Module.lean` 导入 `Submodule.lean`，对 `Submodule.lean` 的修改不会自动反映到 `Module.lean`，以免意外触发所有依赖方的昂贵构建。

须用 ['Server: Restart File'](command:lean4.restartFile) 手动更新依赖状态并构建已改依赖。可用 `Ctrl+Shift+X`（`Cmd+Shift+X`）、InfoView 的「Restart File」按钮、[命令菜单](Commands.md#command-menu)、[命令面板](Commands.md#command-palette)，或右键编辑器选择「Server: Restart File」。

依赖被编辑并保存时，VS Code 会显示错误级或信息级诊断。初次打开文件且依赖需重建才能最新时，会报错并拒绝[处理](InteractingWithFiles.md#file-processing)文件其余部分；文件已打开时依赖变化则只发信息级诊断，并继续用旧依赖状态处理。

启用「Lean 4: Automatically Build Dependency」可在打开文件时自动构建已改依赖，而非报错。

| ![](images/restart-file-infoview-button.png) |
| :--: |
| *InfoView 中的「Restart File」按钮* |

## Unicode 输入

Lean 代码大量使用 [Unicode 符号](https://home.unicode.org/) 提高可读性。输入方式为反斜杠加缩写标识符；缩写完整且不是更长缩写的前缀时，会自动替换为对应符号，例如 `\forall` → `∀`。

在缩写未完成时按 `Tab` 可触发 ['Input: Convert Current Abbreviation'](command:lean4.input.convert)，得到与已输入部分匹配的最短缩写对应符号。光标移开缩写位置也会提前替换。

完整缩写列表见命令 ['Docs: Show Unicode Input Abbreviations'](command:lean4.docs.showAbbreviations)（命令菜单「Documentation…」子菜单）。悬停 Unicode 符号也会显示可用缩写。

部分 Unicode 括号有特殊缩写，会同时插入配对的闭括号并把光标放在中间，例如 `\<>` → `⟨⟩`，`\[[]]` → `⟦⟧`，`\f<<>>` → `«»`，`\norm` → `‖‖`。

配置项包括：

- **Lean 4 > Input: Custom Translations** — 添加自定义缩写，如 `{"foo": "☺"}` 使 `\foo` → `☺`。
- **Lean 4 > Input: Eager Replacement Enabled** — 关闭后须用 `Tab` 手动替换完整缩写。
- **Lean 4 > Input: Enabled** — 关闭整个 Unicode 输入机制。
- **Lean 4 > Input: Languages** — 为其他 [VS Code 语言 ID](https://code.visualstudio.com/docs/languages/identifiers) 启用该机制。
- **Lean 4 > Input: Leader** — 将起始字符 `\` 换成其他字符。

| ![](images/abbreviation.png) |
| :--: |
| *`∀` 的未完成缩写* |

在搜索栏、查找框、设置等非编辑器处，可用 ['Input: Find Unicode Symbol...'](command:lean4.input.findSymbol) 打开符号选择器，复制或插入到活动编辑器。

两条直达命令跳过第二步对话框：

- ['Input: Insert Unicode Symbol...'](command:lean4.input.insertSymbol) — 编辑器聚焦时 `Ctrl+Alt+\`（`Cmd+Alt+\`）。
- ['Input: Copy Unicode Symbol...'](command:lean4.input.copySymbol) — 无编辑器聚焦时同上快捷键。

符号选择器的搜索框支持与编辑器相同的缩写；也可粘贴符号反查缩写。

## InfoView

InfoView 是 Lean 的主要交互组件，可查看证明目标、期望类型、[诊断](InteractingWithFiles.md#errors-warnings-and-information)，以及 Lean 代码渲染的自定义界面（[widgets](InteractingWithFiles.md#widgets)）。

打开 Lean 文档时 InfoView 会自动显示在文档旁。可用 ['Infoview: Toggle Infoview'](command:lean4.toggleInfoview) 或 `Ctrl+Shift+Enter`（`Cmd+Shift+Enter`）切换。关闭「Lean 4 > Infoview: Auto Open」可禁止自动打开。

右键 InfoView 标签选「Move into New Window」可移到独立窗口（适合第二显示器）。

样式可通过「Lean 4 > Infoview: Style」配置（[默认 CSS](https://github.com/leanprover/vscode-lean4/blob/master/lean4-infoview/src/infoview/index.css)）。

### 各区块

InfoView 分为多个区块，多数仅在光标位于特定位置时显示：

1. **Tactic state** — 光标在策略证明中时显示当前证明状态与开放目标；点击目标名可折叠。可用「Lean 4 > Infoview: Show Goal Names」隐藏目标名。
2. **Expected type** — 光标在项上时显示期望类型。
3. **Widget 区块** — 活跃 widget 可添加任意额外区块。
4. **Messages** — 光标在诊断范围内时显示该诊断的可交互版本。关闭「Lean 4 > Infoview: All Errors On Line」则只显示光标右侧的错误。
5. **All Messages** — 始终显示；包含文件中所有诊断的可交互版本，默认按与光标距离排序。可暂停、改排序；默认排序由「Lean 4 > Infoview: Message Order」控制。

点击区块标题可折叠；期望类型与 All Messages 也可用专用命令切换。可用「Lean 4: Infoview > Show Expected Type」默认折叠期望类型。

消息右上「Go to source location」可跳到代码位置。「Lean 4 > Infoview: Debounce Time」可调节光标移动时更新快慢。关闭「Lean 4 > Infoview: Auto Open Shows Goal」则自动打开时只显示 All Messages。

| ![](images/infoview.png) |
| :--: |
| *含 Tactic state、Messages、All Messages 的 InfoView* |

### 战术状态与期望类型

证明目标与期望类型以 `<name> : <type>` 列出假设与局部标识符，列表末尾用 `⊢` 分隔目标或期望类型。

不可访问名（自动生成、程序中不可用）标有 `✝` 并灰显。

因策略导致目标变化时，相应部分用红/绿高亮（即将删除/刚插入）。

右上齿轮可配置显示方式：目标在假设上方、隐藏类型/实例/不可访问假设、`let` 值、目标名、强调第一个目标等；默认项对应多项 Lean 4 Infoview 设置。可将当前设置保存为用户默认值。也可通过 InfoView 右键菜单访问。

### 状态栏

InfoView 右上两个按钮：

1. **Pin** — 固定当前光标处的战术状态、期望类型、消息与 widget；固定后可「Go to pinned location」或 Unpin。命令：['Infoview: Toggle Pin'](command:lean4.infoView.toggleStickyPosition)。
2. **Pause state** — 冻结上述区块；冻结后可 Refresh。命令：['Infoview: Toggle Updating'](command:lean4.infoView.toggleUpdating)。

### InfoView 悬停

悬停 InfoView 中的非局部标识符会显示类型与文档，可递归悬停类型中的标识符。点击标识符可固定悬停面板。可用「Lean 4 > Infoview: Show Tooltip On Hover」关闭悬停触发（点击仍可打开）。

| ![](images/infoview-hover.png) |
| :--: |
| *`Nat` 的 InfoView 悬停* |

### InfoView 中「转到定义」

右键非局部标识符选「Go to Definition」，或 `Ctrl`/`Cmd`+点击，跳到定义处。

| ![](images/infoview-go-to-definition.png) |
| :--: |
| *对 `Nat` 的「Go to Definition」* |

### Widgets

[用户 widget](https://lean-lang.org/lean4/doc/examples/widgets.lean.html) 可扩展 InfoView。`Shift`+点击子表达式可选为 widget 输入；右键子表达式选「Select」亦可。

内置示例：证明中调用 `simp?` 会在 InfoView 显示「Suggestions」及[代码动作](InteractingWithFiles.md#code-actions)链接，将 `simp?` 替换为列出所需定理的 `simp only`。

使用 Mathlib 并 `import Mathlib.Tactic.Widget.Conv` 后，`conv?` 策略下 `Shift`+点击证明目标中的子表达式可生成聚焦该子表达式的 `conv` 调用。

| ![](images/try-this.png) |
| :--: |
| *`simp?` 的「Try this」widget* |

### 主题

可通过颜色主题或「Workbench: Color Customization」设置 InfoView 部分颜色，例如 `lean4.infoView.hypothesisName`、`lean4.infoView.turnstile` 等。

### Trace 搜索

InfoView 中若诊断含 trace 输出（如 `set_option trace.Meta.Tactic.simp true`），消息标题会显示搜索图标；可过滤 trace 树并高亮匹配，便于在大 trace 中查找。右键 trace 消息也有 Show/Hide Search。

## 悬停（Hovers）

鼠标悬停代码时 VS Code 显示弹出信息：

1. **标识符** — 类型、文档、导入来源。
2. **诊断** — [波浪线](InteractingWithFiles.md#errors-warnings-and-information) 对应的错误/警告/信息。
3. **Unicode 符号** — 可用[缩写](InteractingWithFiles.md#unicode-input)。

关闭「Editor › Hover: Enabled」可禁用自动悬停（演示时有用）。`Ctrl+K Ctrl+I`（`Cmd+K Cmd+I`）或 ['Show or Focus Hover'](command:editor.action.showHover) 可在光标处触发。点击悬停面板可固定。

| ![](images/hover.png) |
| :--: |
| *固定的悬停面板* |

## 自动补全

`Ctrl+Space`（`Option+Esc`）或 ['Trigger Suggest'](command:editor.action.triggerSuggest) 可手动触发。上下文由 import 与局部声明决定。

Lean 4 中的补全类型：

1. **点补全** — `Namespace.`、`x.`、`(x+1).`、`|>.` 或单独的 `.` 后列出可插入的标识符。
2. **标识符补全** — 输入标识符并暂停后列出匹配项；多数情况须至少输入首字符。
3. **策略补全** — 策略证明空白处 `Ctrl+Space` 列出策略及文档。
4. **结构字段补全** — 结构实例 `{ }` 内列出可设字段。
5. **`end` 名补全** — `end` 后可关闭的命名空间/section 名。
6. **Import 补全** — 文件开头触发可 import 的文件（Lake 支持尚不完善时可能列出项目外文件）。

补全菜单显示类型与小箭头；再按 `Ctrl+Space` 或点箭头可看文档。弃用声明有删除线。

默认 `Enter`/`Tab` 接受补全；若干扰换行可将「Accept Suggestion On Enter」设为 off。将「Editor: Word Based Suggestions」设为 off 可关闭基于已打开文件文本的词补全。

| ![](images/completion.png) |
| :--: |
| *`x : Nat` 的点补全* |

## 代码动作（Code actions）

Lean 可在光标处建议修改；可用时显示灯泡图标。点击或 `Ctrl+.`（`Cmd+.`）选择后应用。用户代码也可定义代码动作。

示例：`#guard_msgs` 文档与输出不匹配时，灯泡可替换为实际输出。出现「unknown identifier」时可添加 import 或改为相似名称；另有源动作可一次性 import 文件中所有无歧义未知标识符。

[Batteries](https://github.com/leanprover-community/batteries) 库还提供例如 `instance : <class> := _` 生成实例骨架、`def f : ... := _` 生成 match、`induction`/`cases` 生成情形等。

| ![](images/code-action.png) |
| :--: |
| *`#guard_msgs` 的代码动作* |

## 签名帮助

输入函数应用时 VS Code 弹出剩余函数类型，避免反复悬停。`Ctrl+Shift+Space`（`Cmd+Shift+Space`）或 ['Trigger Parameter Hints'](command:editor.action.triggerParameterHints)。

## 内联提示（Inlay hints）

Lean 用灰色内联片段显式标出隐式信息，例如自动插入的隐式参数。悬停可看类型；双击可插入代码。

| ![](images/auto-implicit-inlay-hint.png) |
| :--: |
| *隐式参数 `α` 的内联提示* |

## 出现处高亮

光标放在标识符上会高亮文件中所有出现（须从左侧移入或点击，不能从右侧移入）。`do` 块中 `return` 会高亮所属 `do`。

| ![](images/occurrence-highlighting.png) |
| :--: |
| *参数 `x` 的出现处高亮* |

## 语义高亮

扩展默认可高亮注释、关键字、定义名、属性、`sorry`、字符串、数字、布尔值。用户自定义关键字等需 Lean 提供的**语义高亮**：关键字、投影、局部变量、函数声明名等。效果取决于所选颜色主题（`Ctrl+K Ctrl+T`）。

| ![](images/semantic-highlighting.png) |
| :--: |
| *证明中的语义高亮* |

## 转到符号

`Ctrl+Shift+O`（`Cmd+Shift+O`）打开 ['Go to Symbol in Editor'](command:workbench.action.gotoSymbol)，列出当前文档的声明、命名空间、section。输入 `:` 可分组。

| ![](images/go-to-symbol.png) |
| :--: |
| *「转到符号」面板* |

## 文档大纲

「查看」>「打开视图」>「大纲」或 ['Explorer: Focus on Outline View'](command:outline.focus) 显示命名空间、section、声明概览；点击跳转。

| ![](images/document-outline.png) |
| :--: |
| *文档大纲* |

## 面包屑

光标处编辑器顶部（标签栏下）显示语义位置：文件路径、命名空间、section、所在声明。点击任一层级可列出同级备选并跳转。`Ctrl+Shift+;`（`Cmd+Shift+;`）聚焦面包屑后用方向键与 `Enter` 导航。

| ![](images/breadcrumbs.png) |
| :--: |
| *展开的面包屑* |

## 可折叠代码块

悬停行号列左侧会对命名空间、section、声明显示折叠箭头；`Ctrl+K Ctrl+L`（`Cmd+K Cmd+L`）或 ['Toggle Fold'](command:editor.toggleFold) 可折叠/展开。`Ctrl+K Ctrl+0` 全部折叠，`Ctrl+K Ctrl+J` 全部展开。

| ![](images/code-folding.png) |
| :--: |
| *多处折叠的文档* |

## 粘性滚动（Sticky scroll）

滚动时编辑器顶部显示当前可见首行所属的命名空间、section、声明上下文；点击可跳到对应行。资源管理器与终端也支持粘性滚动。

| ![](images/sticky-scroll.png) |
| :--: |
| *编辑器顶部的粘性滚动* |