# 实践示例：{lit}`cat`

标准的 Unix 工具 {lit}`cat` 接收若干命令行选项，以及零个或多个输入文件。
如果没有提供文件，或者其中某个文件是短横线（{lit}`-`），那么它会将对应输入视为标准输入而非读取文件。
输入的内容会依次写入标准输出。
如果某个指定的输入文件不存在，则在标准错误中记录该情况，但 {lit}`cat` 会继续连接剩余的输入。
只要有任何一个输入文件不存在，就返回非零退出码。

本节介绍一个简化版的 {lit}`cat`，名为 {lit}`feline`。
与常见版本的 {lit}`cat` 不同，{lit}`feline` 没有用于行号、显示不可打印字符或显示帮助文本等功能的命令行选项。
此外，它无法从与终端设备关联的标准输入中多次读取。

为了最大程度地从本节受益，请自己动手跟着做。
可以复制粘贴代码示例，但最好亲手输入。
这样更容易学会输入代码的机械过程、从错误中恢复以及解读编译器的反馈。

# 开始

实现 {lit}`feline` 的第一步是创建一个包，并确定如何组织代码。
由于这个程序非常简单，本例中所有代码都放在 {lit}`Main.lean` 中。
第一步是运行 {lit}`lake new feline`。
编辑 Lakefile 以移除库部分，并删除生成的库代码以及 {lit}`Main.lean` 中对其的引用。
完成后，{lit}`lakefile.toml` 应包含：

```plainFile "feline/1/lakefile.toml"
name = "feline"
version = "0.1.0"
defaultTargets = ["feline"]

[[lean_exe]]
name = "feline"
root = "Main"
```

而 {lit}`Main.lean` 应包含类似如下的内容：

```plainFile "feline/1/Main.lean"
def main : IO Unit :=
  IO.println s!"Hello, cats!"
```

或者，运行 {lit}`lake new feline exe` 会指示 {lit}`lake` 使用不包含库部分的模板，从而无需编辑该文件。

通过运行 {command feline1 "feline/1"}`lake build` 确保代码可以成功构建。

# 连接流

现在程序的基本骨架已经搭建完成，是时候实际输入代码了。
{lit}`cat` 的恰当实现应当能用于无限 IO 流，例如 {lit}`/dev/random`，这意味着它不能在输出之前把输入全部读入内存。
此外，它也不应该逐字符处理，因为那样会导致慢得令人沮丧的性能。
相反，更好的做法是一次性读取连续的数据块，并逐个数据块地输出到标准输出。

第一步是决定每次读取多大的数据块。
为简单起见，本实现采用一个保守的 20 千字节块。
{anchorName bufsize}`USize` 类似于 C 语言中的 {c}`size_t`——它是一种无符号整数类型，足以表示所有合法的数组大小。

```module (anchor:=bufsize)
def bufsize : USize := 20 * 1024
```

## 流

{lit}`feline` 的主要工作由 {anchorName dump}`dump` 完成，它每次读取一个数据块，将结果转储到标准输出，直到输入结束。
输入结束的标志是 {anchorName dump}`read` 返回一个空的字节数组：

```module (anchor:=dump)
partial def dump (stream : IO.FS.Stream) : IO Unit := do
  let buf ← stream.read bufsize
  if buf.isEmpty then
    pure ()
  else
    let stdout ← IO.getStdout
    stdout.write buf
    dump stream
```

{anchorName dump}`dump` 函数被声明为 {anchorTerm dump}`partial`，因为它递归调用了自身，而输入并不是明显小于某个参数的。
当一个函数被声明为 partial 时，Lean 不再要求证明它终止。
但另一方面，partial 函数也不太容易进行正确性证明，因为如果在 Lean 的逻辑中允许无限循环，就会使系统不一致。
然而，我们无法证明 {anchorName dump}`dump` 终止，因为无限输入（例如来自 {lit}`/dev/random`）意味着它实际上不会终止。
在这种情况下，除了将该函数声明为 {anchorTerm dump}`partial` 之外别无选择。

类型 {anchorName dump}`IO.FS.Stream` 表示一个 POSIX 流。
在底层，它被表示为一个结构体，每个 POSIX 流操作对应一个字段。
每个操作都被表示为一个提供相应操作的 IO 动作：

```anchor Stream (module := Examples.Cat)
structure Stream where
  flush   : IO Unit
  read    : USize → IO ByteArray
  write   : ByteArray → IO Unit
  getLine : IO String
  putStr  : String → IO Unit
  isTty   : BaseIO Bool
```

类型 {anchorName Stream (module:=Examples.Cat)}`BaseIO` 是 {anchorName Stream (module:=Examples.Cat)}`IO` 的一种变体，它排除了运行时错误。
Lean 编译器提供了 {anchorName Stream (module:=Examples.Cat)}`IO` 动作（例如 {anchorName dump}`IO.getStdout`，在 {anchorName dump}`dump` 中被调用）来获取代表标准输入、标准输出和标准错误的流。
这些之所以是 {anchorName Stream (module:=Examples.Cat)}`IO` 动作而不是普通定义，是因为 Lean 允许在进程中替换这些标准 POSIX 流，这样就可以通过编写自定义的 {anchorName dump}`IO.FS.Stream` 来捕获程序的输出到字符串中，从而更加方便。

{anchorName dump}`dump` 中的控制流本质上是一个 {lit}`while` 循环。
调用 {anchorName dump}`dump` 时，如果流已经到达文件末尾，{anchorTerm dump}`pure ()` 会通过返回 {anchorName dump}`Unit` 的构造子来终止函数。
如果尚未到达文件末尾，则读取一个数据块，并将其内容写入 {anchorName dump}`stdout`，然后 {anchorName dump}`dump` 直接调用自身。
递归调用会一直持续，直到 {anchorTerm dump}`stream.read` 返回一个空的字节数组，这表示文件末尾。

当 {kw}`if` 表达式作为 {kw}`do` 中的语句出现时，如 {anchorName dump}`dump` 中所示，{kw}`if` 的每个分支都会隐式地拥有各自的 {kw}`do`。
换句话说，{kw}`else` 之后的一系列步骤会被视为一系列要执行的 {anchorName dump}`IO` 动作，就好像它们开头也有一个 {kw}`do` 一样。
在 {kw}`if` 分支中用 {kw}`let` 引入的名字只在其所在分支内可见，在 {kw}`if` 外部不在作用域中。

调用 {anchorName dump}`dump` 时没有栈空间耗尽的危险，因为递归调用发生在函数的最后一步，并且其结果被直接返回，而不是被操作或进一步计算。
这种递归称为 _尾递归_，本书 {ref "tail-recursion"}[后面的章节] 会更详细地介绍它。
由于编译后的代码不需要保留任何状态，Lean 编译器可以将递归调用编译为跳转。

如果 {lit}`feline` 只将标准输入重定向到标准输出，那么 {anchorName dump}`dump` 就足够了。
但它还需要能够打开作为命令行参数提供的文件，并输出其内容。
当参数是一个存在的文件名时，{anchorName fileStream}`fileStream` 返回一个读取该文件内容的流。
当参数不是一个文件时，{anchorName fileStream}`fileStream` 会输出一个错误并返回 {anchorName fileStream}`none`。

```module (anchor:=fileStream)
def fileStream (filename : System.FilePath) : IO (Option IO.FS.Stream) := do
  let fileExists ← filename.pathExists
  if not fileExists then
    let stderr ← IO.getStderr
    stderr.putStrLn s!"File not found: {filename}"
    pure none
  else
    let handle ← IO.FS.Handle.mk filename IO.FS.Mode.read
    pure (some (IO.FS.Stream.ofHandle handle))
```

将文件作为流打开需要两步。
首先，以读取模式打开文件，创建一个文件句柄。
Lean 文件句柄跟踪一个底层的文件描述符。
当没有任何引用指向该文件句柄值时，终结器会关闭文件描述符。
其次，使用 {anchorName fileStream}`IO.FS.Stream.ofHandle` 给文件句柄提供与 POSIX 流相同的接口，它用适用于文件句柄的对应 {anchorName fileStream}`IO` 动作填充 {anchorName Names}`Stream` 结构体的每个字段。

## 处理输入

{lit}`feline` 的主循环是另一个尾递归函数，名为 {anchorName process}`process`。
为了在有任何输入无法读取时返回非零退出码，{anchorName process}`process` 接收一个参数 {anchorName process}`exitCode`，表示整个程序的当前退出码。
此外，它还接收一个待处理输入文件的列表。

```module (anchor:=process)
def process (exitCode : UInt32) (args : List String) : IO UInt32 := do
  match args with
  | [] => pure exitCode
  | "-" :: args =>
    let stdin ← IO.getStdin
    dump stdin
    process exitCode args
  | filename :: args =>
    let stream ← fileStream ⟨filename⟩
    match stream with
    | none =>
      process 1 args
    | some stream =>
      dump stream
      process exitCode args
```

与 {kw}`if` 一样，作为 {kw}`do` 中语句使用的 {kw}`match` 的每个分支也会隐式地拥有各自的 {kw}`do`。

共有三种可能。
第一种是没有更多文件需要处理，此时 {anchorName process}`process` 原样返回错误码。
第二种是指定的文件名是 {anchorTerm process}`"-"`，此时 {anchorName process}`process` 会转储标准输入的内容，然后处理剩余的文件名。
第三种是指定了一个真正的文件名。
这种情况下，使用 {anchorName process}`fileStream` 尝试将该文件作为 POSIX 流打开。
其参数被包裹在 {lit}`⟨ ... ⟩` 中，因为 {anchorName Names}`FilePath` 是一个单字段结构体，里面包含一个字符串。
如果文件无法打开，则跳过它，并对 {anchorName process}`process` 的递归调用将退出码设置为 {anchorTerm process}`1`。
如果可以打开，则转储其内容，并对 {anchorName process}`process` 的递归调用保持退出码不变。

{anchorName process}`process` 不需要标记为 {kw}`partial`，因为它是结构递归的。
每次递归调用都传入输入列表的尾部，而所有 Lean 列表都是有限的。
因此，{anchorName process}`process` 不会引入任何不终止的情况。

## 主函数

最后一步是编写 {anchorName main}`main` 动作。
与之前的示例不同，{lit}`feline` 中的 {anchorName main}`main` 是一个函数。
在 Lean 中，{anchorName main}`main` 可以有三种类型之一：

 * {anchorTerm Names}`main : IO Unit` 对应无法读取命令行参数、且总是以退出码 {anchorTerm Names}`0` 表示成功的程序；
 * {anchorTerm Names}`main : IO UInt32` 对应 C 语言中的 {c}`int main(void)`，用于不带参数但返回退出码的程序；
 * {anchorTerm Names}`main : List String → IO UInt32` 对应 C 语言中的 {c}`int main(int argc, char **argv)`，用于接收参数并指示成功或失败的程序。

如果没有提供参数，{lit}`feline` 应当从标准输入读取，就像被调用时带有一个单独的 {anchorTerm main}`"-"` 参数一样。
否则，应逐个处理这些参数。

```module (anchor:=main)
def main (args : List String) : IO UInt32 :=
  match args with
  | [] => process 0 ["-"]
  | _ =>  process 0 args
```

# 喵！

要检查 {lit}`feline` 是否能工作，第一步是用 {command feline2 "feline/2"}`lake build` 构建它。
首先，当不带参数调用时，它应该输出从标准输入收到的内容。
验证

```command feline2 "feline/2" (shell := true)
echo "It works!" | lake exe feline
```

会输出 {commandOut feline2}`echo "It works!" | lake exe feline`。

其次，当以文件作为参数调用时，它应该打印这些文件。
如果文件 {lit}`test1.txt` 包含

```plainFile "feline/2/test1.txt"
It's time to find a warm spot
```

而 {lit}`test2.txt` 包含

```plainFile "feline/2/test2.txt"
and curl up!
```

那么命令

{command feline2 "feline/2" "lake exe feline test1.txt test2.txt"}

应该输出

```commandOut feline2 "lake exe feline test1.txt test2.txt"
It's time to find a warm spot
and curl up!
```

最后，{lit}`-` 参数应当被正确处理。

```command feline2 "feline/2" (shell := true)
echo "and purr" | lake exe feline test1.txt - test2.txt
```

应该产生

```commandOut feline2 "echo \"and purr\" | lake exe feline test1.txt - test2.txt"
It's time to find a warm spot
and purr
and curl up!
```

# 练习

扩展 {lit}`feline`，使其支持使用信息。
扩展版本应当接受命令行参数 {lit}`--help`，该参数会将可用命令行选项的文档写入标准输出。
