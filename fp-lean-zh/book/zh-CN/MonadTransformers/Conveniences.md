# 更多便利特性

%%%
tag := "monad-transformer-conveniences"
%%%

# 管道运算符
%%%
tag := "pipe-operators"
%%%

函数通常写在参数之前。
从左到右阅读程序时，这促进了一种以函数_输出_为首要的视角——函数有一个要实现的目标（即要计算的值），并接收参数来支持这一过程。
但有些程序从输入被逐步精炼以产生输出的角度来理解会更轻松。
对于这些情况，Lean 提供了一种_管道_运算符，它与 F# 提供的类似。
管道运算符的适用场景与 Clojure 的 threading 宏类似。

管道 {anchorTerm pipelineShort}`E₁ |> E₂` 是 {anchorTerm pipelineShort}`E₂ E₁` 的简写。
例如，求值：
```anchor some5
#eval some 5 |> toString
```
结果为：
```anchorInfo some5
"(some 5)"
```
虽然这种侧重点的转变可以使某些程序更便于阅读，但当管道包含许多组件时，管道才真正发挥威力。

在如下定义下：

```anchor times3
def times3 (n : Nat) : Nat := n * 3
```
下面的管道：
```anchor itIsFive
#eval 5 |> times3 |> toString |> ("It is " ++ ·)
```
产生：
```anchorInfo itIsFive
"It is 15"
```
更一般地，一系列管道 {anchorTerm pipeline}`E₁ |> E₂ |> E₃ |> E₄` 是嵌套函数应用 {anchorTerm pipeline}`E₄ (E₃ (E₂ E₁))` 的简写。

管道也可以反向书写。
在这种情况下，它们不会把数据变换的主体放在首位；不过，在许多嵌套括号给读者带来困难的情况下，它们可以澄清应用的步骤。
前面的例子也可以等价地写成：
```anchor itIsAlsoFive
#eval ("It is " ++ ·) <| toString <| times3 <| 5
```
它是如下形式的简写：
```anchor itIsAlsoFiveParens
#eval ("It is " ++ ·) (toString (times3 5))
```

Lean 的方法点记法使用点号前的类型名称来解析点号后的运算符所在的命名空间，这与管道有类似的目的。
即使没有管道运算符，也可以写 {anchorTerm listReverse}`[1, 2, 3].reverse` 而不是 {anchorTerm listReverse}`List.reverse [1, 2, 3]`。
不过，在使用许多带点记法的函数时，管道运算符也很有用。
{anchorTerm listReverseDropReverse}`([1, 2, 3].reverse.drop 1).reverse` 也可以写成 {anchorTerm listReverseDropReverse}`[1, 2, 3] |> List.reverse |> List.drop 1 |> List.reverse`。
这个版本避免了仅仅因为表达式接受参数就必须给它们加括号，并恢复了像 Kotlin 或 C# 这类语言中方法调用链的便利。
不过，它仍然需要手动提供命名空间。
作为最后的便利，Lean 提供了“管道点”运算符，它像管道一样组合函数，但使用类型名称来解析命名空间。
使用“管道点”时，该例子可以改写为 {anchorTerm listReverseDropReversePipe}`[1, 2, 3] |>.reverse |>.drop 1 |>.reverse`。

# 无限循环
%%%
tag := "infinite-loops"
%%%

在 {kw}`do` 块中，{kw}`repeat` 关键字引入一个无限循环。
例如，一个不断输出字符串 {anchorTerm spam}`"Spam!"` 的程序可以使用它：

```anchor spam
def spam : IO Unit := do
  repeat IO.println "Spam!"
```
{kw}`repeat` 循环支持 {kw}`break` 和 {kw}`continue`，就像 {kw}`for` 循环一样。

来自 {ref "streams"}[{lit}`feline` 的实现] 的 {anchorName dump (module := FelineLib)}`dump` 函数使用递归函数来永远运行：
```anchor dump (module := FelineLib)
partial def dump (stream : IO.FS.Stream) : IO Unit := do
  let buf ← stream.read bufsize
  if buf.isEmpty then
    pure ()
  else
    let stdout ← IO.getStdout
    stdout.write buf
    dump stream
```
使用 {kw}`repeat` 可以大大缩短这个函数：

```anchor dump
def dump (stream : IO.FS.Stream) : IO Unit := do
  let stdout ← IO.getStdout
  repeat do
    let buf ← stream.read bufsize
    if buf.isEmpty then break
    stdout.write buf
```

{anchorName spam}`spam` 和 {anchorName dump}`dump` 都不需要声明为 {kw}`partial`，因为它们本身并不是无限递归的。
相反，{kw}`repeat` 使用了一个其 {anchorTerm names}`ForM` 实例为 {kw}`partial` 的类型。
偏函数性不会“传染”给调用函数。

# {kw}`while` 循环
%%%
tag := "while-loops"
%%%

在使用局部可变性的编程中，{kw}`while` 循环可以是带有 {kw}`if` 守卫的 {kw}`break` 的 {kw}`repeat` 的一种便利替代：

```anchor dumpWhile
def dump (stream : IO.FS.Stream) : IO Unit := do
  let stdout ← IO.getStdout
  let mut buf ← stream.read bufsize
  while not buf.isEmpty do
    stdout.write buf
    buf ← stream.read bufsize
```
在幕后，{kw}`while` 只是 {kw}`repeat` 的一种更简单的记法。