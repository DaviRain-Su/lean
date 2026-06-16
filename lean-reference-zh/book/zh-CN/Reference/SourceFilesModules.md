# 源文件与模块

> 对应英文：[Source Files and Modules](https://lean-lang.org/doc/reference/latest/Source-Files-and-Modules/)，抓取日期：2026-06-16。本页先翻译导言与高频基础小节。

Lean 中最小的编译单元是单个源文件。源文件可以根据文件名导入其他源文件。换言之，在 Lean 代码中，文件名和文件夹结构具有语义意义。

每个源文件都有一个 import name。这个名称由文件名以及 Lean 的启动方式共同决定：Lean 有一组 root directory，用来查找代码；源文件的 import name 是从 root 到文件名之间各级目录的名称，用点号 `.` 连接，并去掉 `.lean` 后缀。例如，如果 Lean 以 `Projects/MyLib/src` 为 root，那么文件 `Projects/MyLib/src/Literature/Novel/SciFi.lean` 可以通过 `Literature.Novel.SciFi` 导入。

## 编码与表示

Lean 源文件是 UTF-8 编码的 Unicode 文本文件。行尾可以是换行符 `\n`，也可以是 `\r\n`。不过 Lean 在解析或比较文件时会规范化行尾，因此所有文件都会按行尾为 `\n` 的形式进行比较。

## 具体语法

Lean 的 concrete syntax 是可扩展的。对于 Lean 这样的语言，无法一次性完整描述所有语法，因为库可以在定义新常量或归纳类型之外继续定义新语法。因此参考手册不会在此穷尽语言语法，而是描述总体框架；各语言构造的具体语法则在对应章节中说明。

### 空白

Lean token 之间可以由任意数量的 whitespace sequence 分隔。空白可以是空格、合法换行序列或注释。制表符以及未跟随换行的回车符都不是合法的空白序列。

### 注释

注释是文件中的一段文本。虽然它不是空白字符，但会被当作空白处理。Lean 有两种注释语法：

- **行注释**：不作为 token 一部分出现的 `--` 开始一条行注释。从开头的 `-` 到换行符之间的所有字符都会被当作空白。
- **块注释**：不作为 token 一部分出现、且后面没有紧跟 `-` 的 `/-` 开始一条块注释。块注释一直持续到匹配的 `-/`。块注释可以嵌套；只有此前所有嵌套的 `/-` 都已由匹配的 `-/` 结束时，某个 `-/` 才会结束当前注释。

`/--` 和 `/-!` 开始的是 documentation，而不是普通注释；它们同样由 `-/` 结束，并且可以包含嵌套块注释。虽然 documentation 看起来像注释，但它属于自己的语法类别；有效放置位置由 Lean 语法决定。

### 关键字与标识符

identifier 由一个或多个 identifier component 组成，component 之间用 `.` 分隔。

identifier component 由一个字母、类字母字符或下划线 `_` 开始，后面跟零个或多个 identifier continuation character。字母包括大小写英文字母；类字母字符包括一系列非英语字母文字，例如 Lean 中常用的希腊字母、Coptic 字母、Unicode letter-like symbol block 中的字符（包括 `ℕ`、`ℤ` 等双线字符和缩写）、Latin-1 补充字母（但不包括 `×` 和 `÷`）以及 Latin Extended-A。后续字符可以是字母、类字母字符、下划线 `_`、感叹号 `!`、问号 `?`、下标和单引号 `'`。例外：单独的下划线不是合法标识符。

identifier component 也可以用双书名号 `«` 和 `»` 包围。这样的 component 可以包含除 `»` 外的任何字符，甚至可以包含 `«`、`.` 和换行。书名号本身不是最终 identifier component 的一部分，因此 `«x»` 和 `x` 表示同一个标识符。另一方面，`«Nat.add»` 是只有一个 component 的标识符，而 `Nat.add` 有两个 component。

某些潜在的 identifier component 可能是保留关键字。具体保留关键字集合取决于当前启用的语法扩展，也可能取决于导入的文件和当前打开的 namespace，因此无法为整个 Lean 枚举。多数语法位置中，若要把这些关键字当作 identifier component 使用，也必须用双书名号引用。某些 raw identifier context 允许关键字不加书名号直接作为标识符使用，例如归纳类型的构造子名。

包含一个或多个 `.` 的标识符称为 hierarchical identifier。它既用于表示 import name，也用于表示 namespace 中的名称。

## 结构

源文件由文件头和一系列 command 组成：

```lean
module ::= header command*
```

如果源文件的 header 以 `module` 开始，则该文件称为 module。module 可以更精细地控制暴露给客户端的信息。

### Header

module header 列出在当前 module 之前需要 elaboration 的 module。它们的声明在当前 module 中可见。

header 由可选的 `module` 关键字加一系列 `import` 语句构成：

```lean
header ::= module? import*
```

可选的 `prelude` 关键字只应在 Lean 源码自身中使用。它表示当前文件属于 Lean prelude 的实现，也就是无需显式 import 即可使用的代码。它不应在 Lean 实现之外使用。

所有源文件都可以使用普通 import：

```lean
import ident
```

在不是 module 的源文件中，这会导入指定的 Lean 文件。导入文件会使该文件内容以及它传递导入的内容在当前源文件中可用。

源文件名不一定对应 namespace。源文件可以向任何 namespace 添加名称，导入某个源文件不会改变当前打开的 namespace 集合。

import name 会通过把其中的点号 `.` 替换为目录分隔符，并追加 `.lean` 或 `.olean` 来转换成文件名。Lean 会在 include path 中搜索对应的中间构建产物或可导入 module 文件。

### Command

command 是 Lean 的顶层语句。例如归纳类型声明、定理、函数定义、`open` 或 `variable` 等 namespace 相关修改，以及 `#check` 这样的交互查询。command 的语法可由用户扩展，甚至 command 本身也可以添加新语法来解析后续 command。具体 command 会在本手册对应章节中说明，而不是在这里集中列出。