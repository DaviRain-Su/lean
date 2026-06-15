# 更多便利特性

# 嵌套操作

{lit}`feline` 中的许多函数都呈现一种重复模式：先给 {anchorName dump}`IO` 操作的结果起一个名字，然后立刻且只使用一次。例如，在 {moduleName}`dump` 中：

```lean
partial def dump (stream : IO.FS.Stream) : IO Unit := do
  let buf ← stream.read bufsize
  if buf.isEmpty then
    pure ()
  else
    let stdout ← IO.getStdout
    stdout.write buf
    dump stream
```

这种模式也出现在 {moduleName (anchor:=stdoutBind)}`stdout` 上：

```lean
    let stdout ← IO.getStdout
    stdout.write buf
```

类似地，{moduleName}`fileStream` 包含以下片段：

```lean
  let fileExists ← filename.pathExists
  if not fileExists then
```

当 Lean 编译 {moduleTerm}`do` 块时，紧跟在括号下的左箭头表达式会被提升到最近的封闭 {moduleTerm}`do` 中，其结果绑定到一个唯一的名字。这个唯一的名字会取代该表达式的原始位置。这意味着 {moduleName (module := Examples.Cat)}`dump` 也可以写成如下形式：

```lean
partial def dump (stream : IO.FS.Stream) : IO Unit := do
  let buf ← stream.read bufsize
  if buf.isEmpty then
    pure ()
  else
    (← IO.getStdout).write buf
    dump stream
```

这个版本的 {anchorName dump (module := Examples.Cat)}`dump` 避免了引入只使用一次的名字，从而可以大大简化程序。Lean 从嵌套表达式上下文中提升出来的 {moduleName (module := Examples.Cat)}`IO` 操作称为**嵌套操作**（nested actions）。

{moduleName (module := Examples.Cat)}`fileStream` 也可以用同样的技巧简化：

```lean
def fileStream (filename : System.FilePath) : IO (Option IO.FS.Stream) := do
  if not (← filename.pathExists) then
    (← IO.getStderr).putStrLn s!"File not found: {filename}"
    pure none
  else
    let handle ← IO.FS.Handle.mk filename IO.FS.Mode.read
    pure (some (IO.FS.Stream.ofHandle handle))
```

在这种情况下，{anchorName fileStream (module := Examples.Cat)}`handle` 的局部名字本也可以用嵌套操作消除，但得到的表达式会又长又复杂。尽管使用嵌套操作通常是好的风格，但有时给中间结果命名仍然很有帮助。

然而，重要的是要记住，嵌套操作只是出现在外部 {moduleTerm (module := Examples.Cat)}`do` 块中的 {moduleName (module := Examples.Cat)}`IO` 操作的一种更简短写法。执行它们所涉及的副作用仍然按相同顺序发生，副作用的执行不会与表达式求值交错进行。因此，嵌套操作不能从 {kw}`if` 的分支中提升出来。

为了说明这可能令人困惑的地方，考虑下面两个辅助定义，它们会先向世界宣告自己已被执行，然后再返回数据：

```lean
def getNumA : IO Nat := do
  (← IO.getStdout).putStrLn "A"
  pure 5
```

```lean
def getNumB : IO Nat := do
  (← IO.getStdout).putStrLn "B"
  pure 7
```

这些定义意在代表更复杂的 {anchorName getNumB (module:=Examples.Cat)}`IO` 代码，例如验证用户输入、读取数据库或打开文件。

一个当数字 A 等于 5 时打印 {moduleTerm (module := Examples.Cat)}`0`，否则打印数字 B 的程序，可能会写成如下形式：

```lean
def test : IO Unit := do
  let a : Nat := if (← getNumA) == 5 then 0 else (← getNumB)
  (← IO.getStdout).putStrLn s!"The answer is {a}"
```

这个程序等价于：

```lean
def test : IO Unit := do
  let x ← getNumA
  let y ← getNumB
  let a : Nat := if x == 5 then 0 else y
  (← IO.getStdout).putStrLn s!"The answer is {a}"
```

也就是说，无论 {moduleName (module := Examples.Cat)}`getNumA` 的结果是否等于 {moduleTerm (module := Examples.Cat)}`5`，{moduleName (module := Examples.Cat)}`getNumB` 都会执行。为了避免这种困惑，Lean 不允许在本身不是 {moduleTerm (module := Examples.Cat)}`do` 中一行的 {kw}`if` 里使用嵌套操作，并会给出如下错误信息：

```text
invalid use of `(<- ...)`, must be nested inside a 'do' expression
```

# {lit}`do` 的灵活布局

在 Lean 中，{moduleTerm (module := Examples.Cat)}`do` 表达式对空白敏感。{moduleTerm (module := Examples.Cat)}`do` 中的每个 {moduleName (module := Examples.Cat)}`IO` 操作或局部绑定都应该独占一行，并且具有相同的缩进。几乎所有 {moduleTerm (module := Examples.Cat)}`do` 的使用都应该这样书写。然而，在某些罕见情况下，可能需要手动控制空白和缩进，或者把多个小操作放在同一行会更方便。此时，可以用分号代替换行，用花括号代替缩进。

例如，下面所有程序都是等价的：

```lean
-- This version uses only whitespace-sensitive layout
def main : IO Unit := do
  let stdin ← IO.getStdin
  let stdout ← IO.getStdout

  stdout.putStrLn "How would you like to be addressed?"
  let name := (← stdin.getLine).trim
  stdout.putStrLn s!"Hello, {name}!"
```

```lean
-- This version is as explicit as possible
def main : IO Unit := do {
  let stdin ← IO.getStdin;
  let stdout ← IO.getStdout;

  stdout.putStrLn "How would you like to be addressed?";
  let name := (← stdin.getLine).trim;
  stdout.putStrLn s!"Hello, {name}!"
}
```

```lean
-- This version uses a semicolon to put two actions on the same line
def main : IO Unit := do
  let stdin ← IO.getStdin; let stdout ← IO.getStdout

  stdout.putStrLn "How would you like to be addressed?"
  let name := (← stdin.getLine).trim
  stdout.putStrLn s!"Hello, {name}!"
```

地道的 Lean 代码很少把花括号与 {moduleTerm (module := Examples.Cat)}`do` 一起使用。

# 用 {kw}`#eval` 运行 {lit}`IO` 操作

Lean 的 {moduleTerm (module := Examples.Cat)}`#eval` 命令可以用来执行 {moduleName (module := Examples.Cat)}`IO` 操作，而不仅仅是求值。通常，在 Lean 文件中添加 {moduleTerm (module := Examples.Cat)}`#eval` 命令会让 Lean 对给定表达式求值，将结果转换为字符串，并在工具提示和信息窗口中显示该字符串。{moduleName (module := Examples.Cat)}`IO` 操作无法转换为字符串，但 {moduleTerm (module := Examples.Cat)}`#eval` 不会因此失败，而是会执行它们，并产生相应的副作用。如果执行结果是 {moduleName (module := Examples.Cat)}`Unit` 值 {moduleTerm (module := Examples.Cat)}`()`，则不显示结果字符串；但如果结果是可以转换为字符串的类型，Lean 就会显示该值。

这意味着，给定前面定义的 {moduleName (module := Examples.HelloWorld)}`countdown` 和 {moduleName (module := Examples.HelloWorld)}`runActions`，

```lean
#eval runActions (countdown 3)
```

会显示

```text
3
2
1
Blast off!
```

这是运行 {moduleName (module := Examples.HelloWorld)}`IO` 操作所产生的输出，而不是该操作本身的某种不透明表示。换句话说，对于 {moduleName (module := Examples.HelloWorld)}`IO` 操作，{moduleTerm (module := Examples.HelloWorld)}`#eval` 既对给定表达式进行**求值**（evaluates），又执行（executes）得到的动作值。

用 {moduleTerm (module := Examples.HelloWorld)}`#eval` 快速测试 {moduleName (module := Examples.HelloWorld)}`IO` 操作比编译并运行整个程序要方便得多。不过，它也有一些限制。例如，从标准输入读取只会返回空输入。此外，每当 Lean 需要更新提供给用户的诊断信息时，{moduleName (module := Examples.HelloWorld)}`IO` 操作就会被重新执行，而这可能在不可预测的时刻发生。例如，读写文件的操作可能会在意想不到的时候进行。
