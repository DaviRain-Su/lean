# 逐步执行

{moduleTerm}`do` 代码块可以逐行执行。从前一节的程序开始：

```anchor block1
  let stdin ← IO.getStdin
  let stdout ← IO.getStdout
  stdout.putStrLn "How would you like to be addressed?"
  let input ← stdin.getLine
  let name := input.dropRightWhile Char.isWhitespace
  stdout.putStrLn s!"Hello, {name}!"
```

## 标准 IO

第一行是 {anchor line1}`let stdin ← IO.getStdin`，其余部分是：

```anchor block2
  let stdout ← IO.getStdout
  stdout.putStrLn "How would you like to be addressed?"
  let input ← stdin.getLine
  let name := input.dropRightWhile Char.isWhitespace
  stdout.putStrLn s!"Hello, {name}!"
```

要执行使用 {anchorTerm block2}`←` 的 {kw}`let` 语句，首先要计算箭头右侧的表达式（在本例中是 {moduleTerm}`IO.getStdin`）。因为这个表达式只是一个变量，所以查找它的值。得到的值是一个内建的原语 {moduleTerm}`IO` 动作。下一步是执行这个 {moduleTerm}`IO` 动作，得到一个代表标准输入流的值，其类型为 {moduleTerm}`IO.FS.Stream`。随后，标准输入会在 {moduleTerm}`do` 块的剩余部分与箭头左侧的名字（此处为 {anchorTerm line1}`stdin`）关联起来。

执行第二行 {anchor line2}`let stdout ← IO.getStdout` 的过程类似。首先，计算表达式 {moduleTerm}`IO.getStdout`，得到一个会返回标准输出的 {moduleTerm}`IO` 动作。接着，执行这个动作，实际返回标准输出。最后，这个值会在 {moduleTerm}`do` 块的剩余部分与名字 {anchorTerm line2}`stdout` 关联起来。

## 提出问题

既然已经得到了 {anchorTerm line1}`stdin` 和 {anchorTerm line2}`stdout`，块的剩余部分就由一个提问和一个回答组成：

```anchor block3
  stdout.putStrLn "How would you like to be addressed?"
  let input ← stdin.getLine
  let name := input.dropRightWhile Char.isWhitespace
  stdout.putStrLn s!"Hello, {name}!"
```

块中的第一条语句 {anchor line3}`stdout.putStrLn "How would you like to be addressed?"` 是一个表达式。要执行一个表达式，首先要对它求值。在本例中，{moduleTerm}`IO.FS.Stream.putStrLn` 的类型是 {moduleTerm}`IO.FS.Stream → String → IO Unit`，也就是说它是一个接受一个流和一个字符串、并返回一个 {moduleTerm}`IO` 动作的函数。该表达式使用 {ref "behind-the-scenes"}[accessor notation] 进行函数调用。这个函数被应用到两个参数上：标准输出流和一个字符串。该表达式的值是一个 {moduleTerm}`IO` 动作，它会将字符串和一个换行符写入输出流。得到这个值后，下一步就是执行它，从而将字符串和换行符实际写入 {anchorTerm setup}`stdout`。仅由表达式构成的语句不会引入任何新变量。

块中的下一条语句是 {anchor line4}`let input ← stdin.getLine`。{moduleTerm}`IO.FS.Stream.getLine` 的类型是 {moduleTerm}`IO.FS.Stream → IO String`，也就是说它是一个从流到会返回字符串的 {moduleTerm}`IO` 动作的函数。这同样是一个 accessor notation 的例子。这个 {moduleTerm}`IO` 动作被执行后，程序会等待用户输入完整的一行。假设用户输入了“{lit}`David`”。得到的行（{lit}`"David\n"`）会与 {anchorTerm block5}`input` 关联起来，其中转义序列 {lit}`\n` 表示换行符。

```anchor block5
  let name := input.dropRightWhile Char.isWhitespace
  stdout.putStrLn s!"Hello, {name}!"
```

下一行 {anchor line5}`let name := input.dropRightWhile Char.isWhitespace` 是一条 {kw}`let` 语句。与本程序中其他 {kw}`let` 语句不同，它使用的是 {anchorTerm block5}`:=` 而不是 {anchorTerm line4}`←`。这意味着该表达式会被求值，但得到的值不必是一个 {moduleTerm}`IO` 动作，也不会被执行。在本例中，{moduleTerm}`String.dropRightWhile` 接受一个字符串和一个关于字符的谓词，并返回一个新字符串，其中原字符串末尾所有满足该谓词的字符都已被移除。例如，

```anchorTerm dropBang (module := Examples.HelloWorld)
#eval "Hello!!!".dropRightWhile (· == '!')
```

得到

```anchorInfo dropBang (module := Examples.HelloWorld)
"Hello"
```

而

```anchorTerm dropNonLetter (module := Examples.HelloWorld)
#eval "Hello...   ".dropRightWhile (fun c => not (c.isAlphanum))
```

得到

```anchorInfo dropNonLetter (module := Examples.HelloWorld)
"Hello"
```

其中所有非字母数字字符都从字符串右侧被移除了。在本程序的当前行中，输入字符串右侧的空白字符（包括换行符）被移除，得到 {moduleTerm (module := Examples.HelloWorld)}`"David"`，并在块的剩余部分与 {anchorTerm block5}`name` 关联起来。

## 问候用户

在 {moduleTerm}`do` 块中，剩下要执行的只有一条语句：

```anchor line6
  stdout.putStrLn s!"Hello, {name}!"
```

{anchorTerm line6}`putStrLn` 的字符串参数是通过字符串插值构造的，得到字符串 {moduleTerm (module := Examples.HelloWorld)}`"Hello, David!"`。因为这条语句是一个表达式，所以对它求值会得到一个 {moduleTerm}`IO` 动作，该动作会把这个字符串连同换行符一起打印到标准输出。表达式求值完成后，再执行得到的 {moduleTerm}`IO` 动作，从而产生问候。

## {lit}`IO` 动作作为值

在上面的描述中，可能很难理解为什么必须区分表达式求值与执行 {moduleTerm}`IO` 动作。毕竟，每个动作在产生之后都会立即被执行。为什么不能像其他语言那样，在求值过程中直接产生副作用呢？

答案有两方面。首先，将求值与执行分开意味着程序必须明确哪些函数可能产生副作用。由于程序中没有副作用的部分更容易进行数学推理——无论是在程序员的脑海中，还是利用 Lean 的形式化证明工具——这种分离有助于减少 bug。其次，并非所有 {moduleTerm}`IO` 动作都必须在产生时立即执行。能够引用一个动作而不实际执行它，使得普通函数可以被用作控制结构。

例如，函数 {anchorName twice (module:=Examples.HelloWorld)}`twice` 接受一个 {moduleTerm}`IO` 动作作为参数，返回一个新的动作，该动作会把参数动作执行两次。

```anchor twice (module := Examples.HelloWorld)
def twice (action : IO Unit) : IO Unit := do
  action
  action
```

执行

```anchorTerm twiceShy (module := Examples.HelloWorld)
twice (IO.println "shy")
```

结果是

```anchorInfo twiceShy (module := Examples.HelloWorld)
shy
shy
```

被打印出来。这可以推广到一个能够执行底层动作任意次数的版本：

```anchor nTimes (module := Examples.HelloWorld)
def nTimes (action : IO Unit) : Nat → IO Unit
  | 0 => pure ()
  | n + 1 => do
    action
    nTimes action n
```

在 {moduleTerm (module := Examples.HelloWorld)}`Nat.zero` 的基本情况下，结果是 {moduleTerm (module := Examples.HelloWorld)}`pure ()`。函数 {moduleTerm (module := Examples.HelloWorld)}`pure` 创建一个没有副作用、但返回 {moduleTerm (module := Examples.HelloWorld)}`pure` 的参数的 {moduleTerm (module := Examples.HelloWorld)}`IO` 动作，在本例中该参数是 {moduleTerm (module := Examples.HelloWorld)}`Unit` 的构造器。作为一个什么都不做、也返回无趣结果的动作，{moduleTerm (module := Examples.HelloWorld)}`pure ()` 既极其无聊又非常有用。在递归步骤中，使用一个 {moduleTerm (module := Examples.HelloWorld)}`do` 块来创建一个动作，它先执行 {moduleTerm (module := Examples.HelloWorld)}`action`，再执行递归调用的结果。执行 {anchor nTimes3 (module := Examples.HelloWorld)}`#eval nTimes (IO.println "Hello") 3` 会产生如下输出：

```anchorInfo nTimes3 (module := Examples.HelloWorld)
Hello
Hello
Hello
```

除了把函数用作控制结构外，{moduleTerm (module := Examples.HelloWorld)}`IO` 动作是一等值这一事实也意味着它们可以被保存在数据结构中，留待以后执行。例如，函数 {moduleName (module := Examples.HelloWorld)}`countdown` 接受一个 {moduleTerm (module := Examples.HelloWorld)}`Nat`，并返回一个尚未执行的 {moduleTerm (module := Examples.HelloWorld)}`IO` 动作列表，每个 {moduleTerm (module := Examples.HelloWorld)}`Nat` 对应一个动作：

```anchor countdown (module := Examples.HelloWorld)
def countdown : Nat → List (IO Unit)
  | 0 => [IO.println "Blast off!"]
  | n + 1 => IO.println s!"{n + 1}" :: countdown n
```

这个函数没有副作用，也不会打印任何内容。例如，可以把它应用于一个参数，然后检查得到的动作列表的长度：

```anchor from5  (module := Examples.HelloWorld)
def from5 : List (IO Unit) := countdown 5
```

这个列表包含六个元素（每个数字一个，再加上一个对应零的 {moduleTerm (module := Examples.HelloWorld)}`"Blast off!"` 动作）：

```anchorTerm from5length (module := Examples.HelloWorld)
#eval from5.length
```

```anchorInfo from5length (module := Examples.HelloWorld)
6
```

函数 {moduleTerm (module := Examples.HelloWorld)}`runActions` 接受一个动作列表，并构造出一个按顺序依次执行它们的单一动作：

```anchor runActions (module := Examples.HelloWorld)
def runActions : List (IO Unit) → IO Unit
  | [] => pure ()
  | act :: actions => do
    act
    runActions actions
```

它的结构与 {moduleName (module := Examples.HelloWorld)}`nTimes` 基本相同，只是不是为每个 {moduleName (module := Examples.HelloWorld)}`Nat.succ` 执行一个动作，而是要执行每个 {moduleName (module := Examples.HelloWorld)}`List.cons` 下的动作。同样，{moduleName (module := Examples.HelloWorld)}`runActions` 本身并不会运行这些动作。它创建了一个会运行它们的新动作，而这个新动作必须被放在一个会作为 {moduleName (module := Examples.HelloWorld)}`main` 的一部分被执行的位置上：

```anchor main (module := Examples.HelloWorld)
def main : IO Unit := runActions from5
```

运行这个程序会得到如下输出：

```commands countdownFromFive ""
$ countdown
5
4
3
2
1
Blast off!
```

这个程序运行时发生了什么？第一步是求值 {moduleName (module := Examples.HelloWorld)}`main`。过程如下：

```anchorEvalSteps evalMain  (module := Examples.HelloWorld)
main
===>
runActions from5
===>
runActions (countdown 5)
===>
runActions
  [IO.println "5",
   IO.println "4",
   IO.println "3",
   IO.println "2",
   IO.println "1",
   IO.println "Blast off!"]
===>
do IO.println "5"
   IO.println "4"
   IO.println "3"
   IO.println "2"
   IO.println "1"
   IO.println "Blast off!"
   pure ()
```

得到的 {moduleTerm (module := Examples.HelloWorld)}`IO` 动作是一个 {moduleTerm (module := Examples.HelloWorld)}`do` 块。然后，{moduleTerm (module := Examples.HelloWorld)}`do` 块中的每一步都被依次执行，产生预期的输出。最后一步 {moduleTerm (module := Examples.HelloWorld)}`pure ()` 没有任何副作用，它之所以存在，只是因为 {moduleTerm (module := Examples.HelloWorld)}`runActions` 的定义需要一个基本情况。

## 练习

在纸上逐步推演下面程序的执行过程：

```anchor ExMain (module := Examples.HelloWorld)
def main : IO Unit := do
  let englishGreeting := IO.println "Hello!"
  IO.println "Bonjour!"
  englishGreeting
```

在逐步推演程序执行时，请指出何时在对表达式求值，何时在执行 {moduleTerm (module := Examples.HelloWorld)}`IO` 动作。当执行 {moduleTerm (module := Examples.HelloWorld)}`IO` 动作产生副作用时，把它记下来。完成这些后，用 Lean 运行该程序，并仔细核对你对副作用的预测是否正确。
