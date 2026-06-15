<a id="starting-a-project"></a>

# 启动一个项目

随着用 Lean 编写的程序变得越来越严肃，使用基于提前编译（ahead-of-time compiler）的工作流来生成可执行文件会变得越来越有吸引力。
与其他语言一样，Lean 也提供了用于构建多文件包和管理依赖的工具。
Lean 标准的构建工具叫做 Lake（“Lean Make” 的缩写）。
Lake 通常使用 TOML 文件进行配置，以声明式方式指定依赖并描述要构建的内容。
对于高级用例，Lake 也可以用 Lean 本身来配置。

<a id="lake-new"></a>

## 第一步

要开始使用 Lake 项目，请在不包含名为 {lit}`greeting` 的文件或目录的目录中运行命令 {command lake "first-lake"}`lake new greeting`。
这会创建一个名为 {lit}`greeting` 的目录，其中包含以下文件：

 * {lit}`Main.lean` 是 Lean 编译器查找 {lit}`main` 动作的文件。
 * {lit}`Greeting.lean` 和 {lit}`Greeting/Basic.lean` 是程序支持库的脚手架。
 * {lit}`lakefile.toml` 包含 {lit}`lake` 构建应用程序所需的配置。
 * {lit}`lean-toolchain` 包含项目所用 Lean 具体版本的标识符。

此外，{lit}`lake new` 会将项目初始化为 Git 仓库，并配置 {lit}`.gitignore` 文件以忽略中间构建产物。
通常情况下，大部分应用程序逻辑会放在程序的多个库中，而 {lit}`Main.lean` 则包含一个围绕这些组件的小型包装层，负责解析命令行、执行核心应用程序逻辑等工作。
若要在已有目录中创建项目，请运行 {lit}`lake init` 而非 {lit}`lake new`。

默认情况下，库文件 {lit}`Greeting/Basic.lean` 包含单个定义：

```file lake "first-lake/greeting/Greeting/Basic.lean" "Greeting/Basic.lean"
def hello := "world"
```

库文件 {lit}`Greeting.lean` 会导入 {lit}`Greeting/Basic.lean`：

```file lake "first-lake/greeting/Greeting.lean" "Greeting.lean"
-- This module serves as the root of the `Greeting` library.
-- Import modules here that should be built as part of the library.
import Greeting.Basic
```

这意味着在 {lit}`Greeting/Basic.lean` 中定义的所有内容，对于导入了 {lit}`Greeting.lean` 的文件也是可用的。
在 {kw}`import` 语句中，点号被解释为磁盘上的目录。

可执行源文件 {lit}`Main.lean` 包含：

```file lake "first-lake/greeting/Main.lean" "Main.lean"
import Greeting

def main : IO Unit :=
  IO.println s!"Hello, {hello}!"
```

因为 {lit}`Main.lean` 导入了 {lit}`Greeting.lean`，而 {lit}`Greeting.lean` 又导入了 {lit}`Greeting/Basic.lean`，所以 {lit}`hello` 的定义在 {lit}`main` 中是可用的。

要构建这个包，请运行命令 {command lake "first-lake/greeting"}`lake build`。
在一系列构建命令滚动输出之后，生成的二进制文件会被放到 {lit}`.lake/build/bin` 中。
运行 {command lake "first-lake/greeting"}`./.lake/build/bin/greeting` 会得到 {commandOut lake}`./.lake/build/bin/greeting`。
除了直接运行二进制文件外，还可以使用命令 {lit}`lake exe` 在必要时构建二进制文件并运行它。
运行 {command lake "first-lake/greeting"}`lake exe greeting` 同样会得到 {commandOut lake}`lake exe greeting`。

<a id="lakefiles"></a>

## Lakefile

一个 {lit}`lakefile.toml` 描述了一个*包*（package），即一个可分发、组织一致的 Lean 代码集合，类似于 {lit}`npm` 或 {lit}`nuget` 包，或者 Rust 的 crate。
一个包可以包含任意数量的库或可执行文件。
[Lake 文档](https://lean-lang.org/doc/reference/latest/find/?domain=Verso.Genre.Manual.section&name=lake-config-toml) 描述了 Lake 配置中的可用选项。
生成的 {lit}`lakefile.toml` 包含以下内容：

```file lake "first-lake/greeting/lakefile.toml" "lakefile.toml"
name = "greeting"
version = "0.1.0"
defaultTargets = ["greeting"]

[[lean_lib]]
name = "Greeting"

[[lean_exe]]
name = "greeting"
root = "Main"
```

这个初始 Lake 配置由三部分组成：
 * 文件顶部的*包*（package）设置，
 * 一个名为 {lit}`Greeting` 的*库*（library）声明，以及
 * 一个名为 {lit}`greeting` 的*可执行文件*（executable）。

每个 Lake 配置文件恰好包含一个包，但可以包含任意数量的依赖、库或可执行文件。
按照惯例，包名和可执行文件名以小写字母开头，而库名以大写字母开头。
用 Lean 格式编写的 Lake 配置文件还可以包含*外部库*，即不是用 Lean 编写、但要与最终可执行文件静态链接的库；*自定义目标*，即不适合归入库/可执行文件分类的构建目标；以及*脚本*，它们本质上是 {moduleName}`IO` 动作（与 {moduleName}`main` 类似），但还可以访问包配置的元数据。
Lake 配置文件中各项内容允许配置源文件位置、模块层级结构、编译器标志等。
不过一般来说，默认设置是合理的。

库、可执行文件和自定义目标都称为*目标*（targets）。
默认情况下，{lit}`lake build` 会构建在 {lit}`defaultTargets` 列表中指定的目标。
要构建非默认目标，请在 {lit}`lake build` 后面指定目标名称作为参数。

<a id="libraries-and-imports"></a>

## 库与导入

Lean 库由按层级组织的一组源文件组成，这些文件中的名称可以被导入，称为*模块*（modules）。
默认情况下，一个库有一个与其名称匹配的根文件。
在本例中，库 {lit}`Greeting` 的根文件是 {lit}`Greeting.lean`。
{lit}`Main.lean` 的第一行 {moduleTerm}`import Greeting` 使得 {lit}`Greeting.lean` 中的内容在 {lit}`Main.lean` 中可用。

可以通过创建名为 {lit}`Greeting` 的目录并在其中放置文件来为库添加更多模块文件。
导入这些名称时，将目录分隔符替换为点号即可。
例如，创建文件 {lit}`Greeting/Smile.lean`，内容如下：

```file lake "second-lake/greeting/Greeting/Smile.lean" "Greeting/Smile.lean"
def Expression.happy : String := "a big smile"
```

这意味着 {lit}`Main.lean` 可以如下使用该定义：

```file lake "second-lake/greeting/Main.lean" "Main.lean"
import Greeting
import Greeting.Smile

open Expression

def main : IO Unit :=
  IO.println s!"Hello, {hello}, with {happy}!"
```

模块名称层级与命名空间层级是解耦的。
在 Lean 中，模块是代码分发的单位，而命名空间是代码组织的单位。
也就是说，在模块 {lit}`Greeting.Smile` 中定义的名称不会自动进入对应的命名空间 {lit}`Greeting.Smile`。
具体而言，{moduleName (module:=Greeting.Smile) (show:=happy)}`Expression.happy` 位于 {lit}`Expression` 命名空间中。
模块可以将其名称放入任何它们想要的命名空间中，导入它们的代码可以选择是否 {kw}`open` 该命名空间。
{kw}`import` 用于使源文件的内容可用，而 {kw}`open` 则用于将命名空间中的名称无前缀地引入当前上下文。

{moduleTerm}`open Expression` 这一行使得名称 {moduleName (module:=Greeting.Smile)}`Expression.happy` 在 {moduleName}`main` 中可以以 {moduleName}`happy` 的形式访问。
命名空间也可以*选择性地*打开，只让其中部分名称无需显式前缀即可使用。
做法是把想要的名称写在括号中。
例如，{moduleTerm (module:=Aux)}`Nat.toFloat` 将一个自然数转换为 {moduleTerm (module:=Aux)}`Float`。
可以通过 {moduleTerm (module:=Aux)}`open Nat (toFloat)` 使其以 {moduleName (module:=Aux)}`toFloat` 的形式可用。
