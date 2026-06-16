# 验证 Lean 证明

> 对应英文：[Validating a Lean Proof](https://lean-lang.org/doc/reference/latest/ValidatingProofs/)，抓取日期：2026-06-16。

本节讨论如何验证一个用 Lean 表达的证明。

根据具体场景，可能需要额外步骤来排除具有误导性的证明。特别重要的是区分两种情况：一种是诚实的证明尝试，只需要防范普通错误；另一种是可能带有恶意的证明尝试，会主动试图误导使用者。

这里把 **honest** 用于描述目标确实是创建有效证明的代码。它允许证明和元代码（tactic、attribute、command 等）中存在错误或 bug，但不包括显然只为绕过系统而写的代码，例如使用 `debug.skipKernelTC`。注意，API 函数上的 `unsafe` 标记与该 API 是否能被不诚实地使用无关。

相反，**malicious** 用于描述刻意欺骗或误导用户、利用 bug 或破坏系统的代码。这包括未经审查的 AI 生成证明和程序。

此外，还必须区分两个问题：

- “这个定理是否有一个有效证明？”
- “这个定理陈述到底是什么意思？”

下面按照强度递增给出一系列检查，并说明如何执行、这些检查意味着什么，以及它们能防范哪些错误或攻击。

## 蓝色双对勾

日常使用 Lean 时，通常只需要检查定理陈述旁边的蓝色双对勾，就足以确认该定理已经被证明。

### 操作

在 Lean 中交互工作时，一旦定理证明完成，代码左侧 gutter 中会出现蓝色双对勾。

### 意义

蓝色对勾表示：按照当前文件及其 imports 中定义的语法和 type class instance，定理陈述已经成功 elaboration；并且 Lean kernel 已经接受了该定理陈述的一个证明。这个证明依赖当前文件及其 imports 中声明的定义、定理和公理。

### 信任前提

如果你相信形式化定理陈述确实对应预期的非形式化含义，并且信任导入库的作者是诚实的：他们检查过库中的定理确实表达了预期含义，也没有声明并使用不可靠的公理，那么这个检查就是有意义的。

### 防护范围

这个检查可以防范：

- 当前定理证明不完整，例如仍有 goal 或 tactic 报错；
- 当前定理中显式使用 `sorry`；
- 元程序和 tactic 中的诚实 bug；
- 后台仍在检查证明。

### 备注

在 Visual Studio Code 扩展设置中，可以修改该符号。VS Code 之外的编辑器可能使用不同提示。

运行：

```bash
lake build +Module
```

其中 `Module` 指包含目标定理的文件。如果构建成功且没有错误或警告，它提供的保证与蓝色双对勾相同。

## 打印公理

即使定理的依赖中显式使用了 `sorry` 或存在不完整证明，蓝色双对勾仍可能出现。原因是 `sorry` 和不完整证明都会被 elaboration 为公理。要发现它们，可以列出某个证明依赖的公理。

### 操作

在定理声明之后写：

```lean
#print axioms thmName
```

把 `thmName` 替换为定理名，并检查输出中是否只包含 Lean 内建公理：

- `propext`
- `Classical.choice`
- `Quot.sound`

### 意义

该命令会打印目标定理以及它依赖的定理使用的公理集合。上面三个公理是 Lean 逻辑的标准公理，通常是良性的。

如果输出中有 `sorryAx`，说明该定理或其某个依赖使用了 `sorry`，或者仍有不完整证明。

如果输出中有 `Lean.trustCompiler`，说明使用了 native evaluation；见下文讨论。

任何其他公理都意味着有人声明并使用了自定义公理；此时定理只是在这些公理可靠的前提下才有效。

### 信任前提

如果你相信形式化定理陈述对应预期含义，并且信任导入库作者是诚实的，那么这个检查是有意义的。

### 防护范围

除了蓝色双对勾的防护外，它还防范：

- 依赖中的不完整证明；
- 显式使用 `sorry`；
- 自定义公理。

## 用 `lean4checker` 重新检查证明

有一小类 bug，以及一些不诚实展示证明的方式，可以通过重新检查项目构建时存入 `.olean` 文件的证明来发现。

### 操作

先构建项目：

```bash
lake build
```

然后对包含目标定理的 module 运行：

```bash
lean4checker --fresh Module
```

确认没有错误报告。

### 意义

`lean4checker` 会读取 Lean 构建时存储的声明和证明，也就是 `.olean` 文件，然后把它们重新交给 kernel 回放。它信任 `.olean` 文件的结构本身是正确的。

### 信任前提

如果你相信形式化定理陈述对应预期含义，并且相信导入库作者没有非常精心地作恶：没有破坏用户系统，也没有利用 Lean 的可扩展性改变定理陈述的解释，那么这个检查是有意义的。

### 防护范围

除了上面检查的防护外，它还防范：

- Lean core 处理 kernel 状态时的 bug，例如并行证明处理或 import 处理相关问题；
- 元程序或 tactic 故意绕过该状态，例如用底层功能加入未经检查的定理。

### 备注

由于 `lean4checker` 读取 `.olean` 文件但不验证其格式，这个检查可能受到攻击者构造非法 `.olean` 文件的影响，例如非法指针或字符串中的非法数据。

Lean tactic 和其他元代码运行时可以执行任意动作。若导入由恶意攻击者创建的库并在没有进一步保护的情况下构建，用户系统可能被破坏；一旦系统被破坏，后续检查都不再有可靠意义。

建议在 CI 中运行 `lean4checker`，以额外防范 Lean 声明处理中的 bug，并对简单攻击形成威慑。`lean-action` GitHub Action 可通过设置 `lean4checker: true` 提供这一功能。

若不使用 `--fresh`，该工具可以只检查部分 module，并假设其他 module 正确，例如把受信任库视为已检查，从而提高速度。

## 黄金标准：`comparator` 和外部检查器

若要防范严重恶意证明破坏 Lean 对定理陈述的解释，或破坏用户系统，就需要额外步骤。这通常只在高风险场景中才有必要，例如证明市场、高奖金证明竞赛或未对齐 AI。

### 操作

在受信任环境中写下定理陈述，也就是 “challenge”。然后把 challenge 和候选证明一起交给 `comparator` 工具，并按其文档启用外部检查器。

### 意义

`comparator` 会在沙箱环境中构建证明，以防构建步骤中的恶意代码。证明项会被导出为序列化格式。在沙箱之外、恶意代码无法触及的位置，它会验证导出格式，用 Lean kernel 和/或外部检查器回放证明，并确认被证明的定理陈述与受信任 challenge 文件中的陈述一致。

### 信任前提

如果受信任 challenge 文件中的定理陈述是正确的，并且用于构建可能恶意代码的沙箱是安全的，那么这个检查是有意义的。

### 防护范围

除了上面检查的防护外，它还防范：

- 主动恶意的证明；
- 只存在于某些检查器中、但不会同时存在于所有使用检查器中的实现 bug。

### 备注

截至英文原文写作时，`comparator` 支持使用官方 Lean kernel，以及独立开发、用 Rust 实现的外部检查器 `nanoda`。Lean Kernel Arena 中还有更多外部检查器，可以手动使用以获得更高信心。

## 仍然存在的问题

即使遵循 `comparator` 黄金标准检查证明，仍保留一些假设：

- Lean 逻辑本身是可靠的；
- `comparator` 工具提供的管线正确；
- `comparator` 使用的沙箱安全；
- 没有某个实现 bug 同时影响所有使用的检查器；
- 受信任 challenge 文件中没有人为错误，也没有误导性展示定理陈述。

如果怀疑定理的含义并不像表面那样，就必须仔细检查其陈述和所有引用定义，特别要关注自定义 notation 和 type class。有些外部检查器提供原始 pretty-printing 功能，不受源文件中 parser 或 notation 变化影响。

## 关于 `Lean.trustCompiler`（截至 Lean 4.28.0）

Lean 支持通过 native evaluation 证明。`decide +native` tactic 会使用它，某些 tactic 也会内部使用它，尤其是 `bv_decide`。它会生成证明项，调用已编译 Lean 代码完成计算，然后由 kernel 信任计算结果。

被诚实 tactic 包装的特定用法（例如 `bv_decide`）通常是可信的。此时 trusted code base 更大，因为它包含 Lean 编译工具链和标准库中的库注解，但这部分仍是固定且经过审查的。

一般用法（`decide +native` 或直接使用 `Lean.ofReduceBool`）可能在 native evaluation 与 kernel evaluation 对某个项结果不一致时创建无效证明。特别地，对库中每个 `implemented_by`/`extern` attribute 来说，替换实现与原语义等价也会成为 trusted code base 的一部分。

所有这些用法都会在 `#print axioms` 中显示为公理 `Lean.trustCompiler`。外部检查器（`lean4checker`、`comparator`）无法检查这类证明，因为它们不能访问 Lean 编译器。当需要这种级别的检查时，证明必须避免使用 native evaluation。

自 Lean 4.29.0 起，`decide +native` 和 `bv_decide` tactic 不再使用 `Lean.trustCompiler`，而是为每个由 native computation 断言的计算引入一个专门公理。`Lean.trustCompiler` 机制已经弃用，并最终会被移除。