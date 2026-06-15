# 单子变换器的 {kw}`do` 记法

Lean 的 {kw}`do` 记法提供了一种编写单子程序的语法，形似命令式编程语言。
除了为单子程序提供便利语法外，{kw}`do` 记法还提供了使用某些单子变换器的语法。

# 单分支 {kw}`if`

在单子中工作时，一种常见模式是仅当某个条件为真时才执行副作用。
例如，{anchorName countLettersModify (module := Examples.MonadTransformers.Defs)}`countLetters` 包含对元音或辅音的检查，而既不是元音也不是辅音的字母对状态没有影响。
这通过让 {kw}`else` 分支求值为 {anchorTerm countLettersModify (module := Examples.MonadTransformers.Defs)}`pure ()` 来体现，它没有副作用：

```anchor countLettersModify (module := Examples.MonadTransformers.Defs)
def countLetters (str : String) : StateT LetterCounts (Except Err) Unit :=
  let rec loop (chars : List Char) := do
    match chars with
    | [] => pure ()
    | c :: cs =>
      if c.isAlpha then
        if vowels.contains c then
          modify fun st => {st with vowels := st.vowels + 1}
        else if consonants.contains c then
          modify fun st => {st with consonants := st.consonants + 1}
        else -- modified or non-English letter
          pure ()
      else throw (.notALetter c)
      loop cs
  loop str.toList
```

当 {kw}`if` 是 {kw}`do` 块中的一条语句，而不是一个表达式时，{anchorTerm countLettersModify (module:=Examples.MonadTransformers.Defs)}`else pure ()` 可以省略，Lean 会自动插入。
以下 {anchorName countLettersNoElse}`countLetters` 的定义完全等价：

```anchor countLettersNoElse
def countLetters (str : String) : StateT LetterCounts (Except Err) Unit :=
  let rec loop (chars : List Char) := do
    match chars with
    | [] => pure ()
    | c :: cs =>
      if c.isAlpha then
        if vowels.contains c then
          modify fun st => {st with vowels := st.vowels + 1}
        else if consonants.contains c then
          modify fun st => {st with consonants := st.consonants + 1}
      else throw (.notALetter c)
      loop cs
  loop str.toList
```
使用状态单子统计列表中满足某个单子检查的条目数的程序可以这样写：

```anchor count
def count [Monad m] [MonadState Nat m] (p : α → m Bool) : List α → m Unit
  | [] => pure ()
  | x :: xs => do
    if ← p x then
      modify (· + 1)
    count p xs
```

类似地，{lit}`if not E1 then STMT...` 也可以写成 {lit}`unless E1 do STMT...`。
{anchorName count}`count` 的反面——统计不满足单子检查的条目——可以通过把 {kw}`if` 换成 {kw}`unless` 来写：

```anchor countNot
def countNot [Monad m] [MonadState Nat m] (p : α → m Bool) : List α → m Unit
  | [] => pure ()
  | x :: xs => do
    unless ← p x do
      modify (· + 1)
    countNot p xs
```

理解单分支 {kw}`if` 和 {kw}`unless` 不需要考虑单子变换器。
它们只是把缺失的分支替换为 {anchorTerm count}`pure ()`。
不过，本节其余扩展需要 Lean 自动改写 {kw}`do` 块，在编写 {kw}`do` 块所用的单子之上添加局部变换器。

# 提前返回

标准库包含函数 {anchorName findHuh}`List.find?`，它返回列表中第一个满足某个检查的条目。
一个不利用 {anchorName findHuh}`Option` 是单子这一事实的简单实现，使用递归函数遍历列表，并用 {kw}`if` 在找到所需条目时停止循环：

```anchor findHuhSimple
def List.find? (p : α → Bool) : List α → Option α
  | [] => none
  | x :: xs =>
    if p x then
      some x
    else
      find? p xs
```

命令式语言通常提供 {kw}`return` 关键字，用于中止函数的执行，立即向调用者返回某个值。
在 Lean 中，这在 {kw}`do` 记法中可用，{kw}`return` 会中止 {kw}`do` 块的执行，{kw}`return` 的参数就是从单子返回的值。
换言之，{anchorName findHuhFancy}`List.find?` 可以这样写：

```anchor findHuhFancy
def List.find? (p : α → Bool) : List α → Option α
  | [] => failure
  | x :: xs => do
    if p x then return x
    find? p xs
```

命令式语言中的提前返回有点像一种只能导致当前栈帧被展开的异常。
提前返回和异常都会终止一段代码的执行，实际上用抛出的值替换周围的代码。
在幕后，Lean 中的提前返回是通过 {anchorName runCatch}`ExceptT` 的一个版本来实现的。
每个使用提前返回的 {kw}`do` 块都被包装在一个异常处理器中（就函数 {anchorName MonadExcept (module:=Examples.MonadTransformers.Defs)}`tryCatch` 的意义而言）。
提前返回被翻译为将值作为异常抛出，处理器捕获抛出的值并立即返回。
换言之，{kw}`do` 块原来的返回值类型也被用作异常类型。

更具体地说，辅助函数 {anchorName runCatch}`runCatch` 在异常类型与返回类型相同时，从单子变换器栈顶剥离一层 {anchorName runCatch}`ExceptT`：

```anchor runCatch
def runCatch [Monad m] (action : ExceptT α m α) : m α := do
  match ← action with
  | Except.ok x => pure x
  | Except.error x => pure x
```
{anchorName findHuh}`List.find?` 中使用提前返回的 {kw}`do` 块，通过将其包装在 {anchorName desugaredFindHuh}`runCatch` 的使用中，并把提前返回替换为 {anchorName desugaredFindHuh}`throw`，被翻译为不使用提前返回的 {kw}`do` 块：

```anchor desugaredFindHuh
def List.find? (p : α → Bool) : List α → Option α
  | [] => failure
  | x :: xs =>
    runCatch do
      if p x then throw x else pure ()
      monadLift (find? p xs)
```

提前返回有用的另一种情形是命令行应用在参数或输入不正确时提前终止。
许多程序开头都有一段验证参数和输入的代码，然后才进入程序主体。
以下版本的 {ref "running-a-program"}[问候程序 {lit}`hello-name`] 会检查是否没有提供命令行参数：
```anchor main (module := EarlyReturn)
def main (argv : List String) : IO UInt32 := do
  let stdin ← IO.getStdin
  let stdout ← IO.getStdout
  let stderr ← IO.getStderr

  unless argv == [] do
    stderr.putStrLn s!"Expected no arguments, but got {argv.length}"
    return 1

  stdout.putStrLn "How would you like to be addressed?"
  stdout.flush

  let name := (← stdin.getLine).trim
  if name == "" then
    stderr.putStrLn s!"No name provided"
    return 1

  stdout.putStrLn s!"Hello, {name}!"

  return 0
```
不带参数运行并输入名字 {lit}`David`，会得到与先前版本相同的结果：
```commands «early-return» "early-return"
$ expect -f ./run # lean --run EarlyReturn.lean
How would you like to be addressed?
David
Hello, David!
```

把名字作为命令行参数提供，而不是作为输入回答，会导致错误：
```commands «early-return» "early-return"
$ expect -f ./too-many-args # lean --run EarlyReturn.lean David
Expected no arguments, but got 1
```

不提供名字则会导致另一种错误：
```commands «early-return» "early-return"
$ expect -f ./no-name # lean --run EarlyReturn.lean
How would you like to be addressed?

No name provided
```

使用提前返回的程序避免了嵌套控制流的需要，如下这个不使用提前返回的版本所示：
```anchor nestedmain (module := EarlyReturn)
def main (argv : List String) : IO UInt32 := do
  let stdin ← IO.getStdin
  let stdout ← IO.getStdout
  let stderr ← IO.getStderr

  if argv != [] then
    stderr.putStrLn s!"Expected no arguments, but got {argv.length}"
    pure 1
  else
    stdout.putStrLn "How would you like to be addressed?"
    stdout.flush

    let name := (← stdin.getLine).trim
    if name == "" then
      stderr.putStrLn s!"No name provided"
      pure 1
    else
      stdout.putStrLn s!"Hello, {name}!"
      pure 0
```

Lean 中的提前返回与命令式语言中的提前返回之间有一个重要区别：Lean 的提前返回只适用于当前的 {kw}`do` 块。
当函数的整个定义都在同一个 {kw}`do` 块中时，这一区别无关紧要。
但如果 {kw}`do` 出现在其他结构之下，区别就会显现出来。
例如，给定以下 {anchorName greet}`greet` 的定义：

```anchor greet
def greet (name : String) : String :=
  "Hello, " ++ Id.run do return name
```
表达式 {anchorTerm greetDavid}`greet "David"` 求值为 {anchorTerm greetDavid}`"Hello, David"`，而不仅仅是 {anchorTerm greetDavid}`"David"`。

# 循环

正如每个带可变状态的程序都可以改写为把状态作为参数传递的程序，每个循环都可以改写为递归函数。
从一个角度看，{anchorName findHuh}`List.find?` 作为递归函数最清晰。
毕竟，它的定义反映了列表的结构：如果头部通过检查，就应返回它；否则在尾部查找。
当没有更多条目时，答案是 {anchorName findHuhSimple}`none`。
从另一个角度看，{anchorName findHuh}`List.find?` 作为循环最清晰。
毕竟，程序按顺序查阅条目，直到找到令人满意的条目，然后终止。
如果循环终止时还没有返回，答案是 {anchorName findHuhSimple}`none`。

## 用 ForM 循环

Lean 包含一个描述在某个单子中遍历容器类型的类型类。
这个类称为 {anchorName ForM}`ForM`：

```anchor ForM
class ForM (m : Type u → Type v) (γ : Type w₁)
    (α : outParam (Type w₂)) where
  forM [Monad m] : γ → (α → m PUnit) → m PUnit
```
这个类相当通用。
参数 {anchorName ForM}`m` 是具有所需效应的单子，{anchorName ForM}`γ` 是要遍历的集合，{anchorName ForM}`α` 是集合中元素的类型。
通常，{anchorName ForM}`m` 可以是任意单子，但也可能有数据结构只支持在例如 {anchorName printArray}`IO` 中循环。
方法 {anchorName ForM}`forM` 接受一个集合、一个对集合中每个元素执行的单子动作，然后负责运行这些动作。

{anchorName ListForM}`List` 的实例允许 {anchorName ListForM}`m` 为任意单子，将 {anchorName ForM}`γ` 设为 {anchorTerm ListForM}`List α`，并将类型类的 {anchorName ForM}`α` 设为列表中的同一个 {anchorName ListForM}`α`：

```anchor ListForM
def List.forM [Monad m] : List α → (α → m PUnit) → m PUnit
  | [], _ => pure ()
  | x :: xs, action => do
    action x
    forM xs action

instance : ForM m (List α) α where
  forM := List.forM
```
{ref "reader-io-implementation"}[{lit}`doug` 中的函数 {anchorName doList (module := DirTree)}`doList`] 就是列表的 {anchorName ForM}`forM`。
因为 {anchorName countLettersForM}`forM` 旨在在 {kw}`do` 块中使用，它使用 {anchorName ForM}`Monad` 而不是 {anchorName OptionTExec}`Applicative`。
{anchorName ForM}`forM` 可以用来让 {anchorName countLettersForM}`countLetters` 短得多：

```anchor countLettersForM
def countLetters (str : String) : StateT LetterCounts (Except Err) Unit :=
  forM str.toList fun c => do
    if c.isAlpha then
      if vowels.contains c then
        modify fun st => {st with vowels := st.vowels + 1}
      else if consonants.contains c then
        modify fun st => {st with consonants := st.consonants + 1}
    else throw (.notALetter c)
```


{anchorName ManyForM}`Many` 的实例非常相似：

```anchor ManyForM
def Many.forM [Monad m] : Many α → (α → m PUnit) → m PUnit
  | Many.none, _ => pure ()
  | Many.more first rest, action => do
    action first
    forM (rest ()) action

instance : ForM m (Many α) α where
  forM := Many.forM
```

因为 {anchorName ForM}`γ` 可以是任意类型，{anchorName ForM}`ForM` 可以支持非多态的集合。
一种非常简单的集合是小于某个给定数的自然数，按逆序排列：

```anchor AllLessThan
structure AllLessThan where
  num : Nat
```
它的 {anchorName ForM}`ForM` 运算符对每一个较小的 {anchorName ListCount}`Nat` 应用所提供的动作：

```anchor AllLessThanForM
def AllLessThan.forM [Monad m]
    (coll : AllLessThan) (action : Nat → m Unit) :
    m Unit :=
  let rec countdown : Nat → m Unit
    | 0 => pure ()
    | n + 1 => do
      action n
      countdown n
  countdown coll.num

instance : ForM m AllLessThan Nat where
  forM := AllLessThan.forM
```
对小于五的每个数字运行 {anchorName AllLessThanForMRun}`IO.println` 可以用 {anchorName ForM}`ForM` 完成：
```anchor AllLessThanForMRun
#eval forM { num := 5 : AllLessThan } IO.println
```
```anchorInfo AllLessThanForMRun
4
3
2
1
0
```

一个只在特定单子中工作的 {anchorName ForM}`ForM` 实例示例，是遍历从 IO 流（例如标准输入）读取的各行：
```anchor LinesOf (module := ForMIO)
structure LinesOf where
  stream : IO.FS.Stream

partial def LinesOf.forM
    (readFrom : LinesOf) (action : String → IO Unit) :
    IO Unit := do
  let line ← readFrom.stream.getLine
  if line == "" then return ()
  action line
  forM readFrom action

instance : ForM IO LinesOf String where
  forM := LinesOf.forM
```
{anchorName ForM}`ForM` 的定义被标记为 {kw}`partial`，因为无法保证流是有限的。
在这种情况下，{anchorName ranges}`IO.FS.Stream.getLine` 只在 {anchorName countToThree}`IO` 单子中工作，因此不能用于其他单子进行循环。

这个示例程序使用这一循环构造来过滤掉不包含字母的行：
```anchor main (module := ForMIO)
def main (argv : List String) : IO UInt32 := do
  if argv != [] then
    IO.eprintln "Unexpected arguments"
    return 1

  forM (LinesOf.mk (← IO.getStdin)) fun line => do
    if line.any (·.isAlpha) then
      IO.print line

  return 0
```
```commands formio "formio" (show := false)
$ ls
expected
test-data
$ cp ../ForMIO.lean .
$ ls
ForMIO.lean
expected
test-data
```
文件 {lit}`test-data` 包含：
```file formio "formio/test-data"
Hello!
!!!!!
12345
abc123

Ok
```
调用这个存储在 {lit}`ForMIO.lean` 中的程序，会产生以下输出：
```commands formio "formio"
$ lean --run ForMIO.lean < test-data
Hello!
abc123
Ok
```

## 停止迭代

用 {anchorName ForM}`ForM` 提前终止循环很困难。
编写一个函数，遍历 {anchorName AllLessThan}`AllLessThan` 中的 {anchorName AllLessThan}`Nat`，但只遍历到达到 {anchorTerm OptionTcountToThree}`3` 为止，需要一种在循环中途停止的手段。
实现这一点的一种方法是将 {anchorName ForM}`ForM` 与 {anchorName OptionTExec}`OptionT` 单子变换器一起使用。
第一步是定义 {anchorName OptionTExec}`OptionT.exec`，它丢弃关于返回值以及变换后的计算是否成功的信息：

```anchor OptionTExec
def OptionT.exec [Applicative m] (action : OptionT m α) : m Unit :=
  action *> pure ()
```
然后，{anchorName OptionTExec}`OptionT` 的 {anchorName AlternativeOptionT (module:=Examples.MonadTransformers.Defs)}`Alternative` 实例中的失败可以用来提前终止循环：

```anchor OptionTcountToThree
def countToThree (n : Nat) : IO Unit :=
  let nums : AllLessThan := ⟨n⟩
  OptionT.exec (forM nums fun i => do
    if i < 3 then failure else IO.println i)
```
快速测试表明这一方案有效：
```anchor optionTCountSeven
#eval countToThree 7
```
```anchorInfo optionTCountSeven
6
5
4
3
```

不过，这段代码不太容易阅读。
提前终止循环是常见任务，Lean 提供了更多语法糖来简化这一过程。
同一个函数也可以这样写：

```anchor countToThree
def countToThree (n : Nat) : IO Unit := do
  let nums : AllLessThan := ⟨n⟩
  for i in nums do
    if i < 3 then break
    IO.println i
```
测试表明它与先前版本效果相同：
```anchor countSevenFor
#eval countToThree 7
```
```anchorInfo countSevenFor
6
5
4
3
```

{kw}`for`{lit}` ...`{kw}`in`{lit}` ...`{kw}`do`{lit}` ...` 语法会脱糖为使用称为 {anchorName ForInIOAllLessThan}`ForIn` 的类型类，它是 {anchorName ForM}`ForM` 的某种更复杂版本，会跟踪状态和提前终止。
标准库提供了一个适配器，将 {anchorName ForM}`ForM` 实例转换为 {anchorName ForInIOAllLessThan}`ForIn` 实例，称为 {anchorName ForInIOAllLessThan}`ForM.forIn`。
要基于 {anchorName ForM}`ForM` 实例启用 {kw}`for` 循环，添加类似下面的内容，并对 {anchorName AllLessThan}`AllLessThan` 和 {anchorName AllLessThan}`Nat` 做适当替换：

```anchor ForInIOAllLessThan
instance : ForIn m AllLessThan Nat where
  forIn := ForM.forIn
```
不过请注意，这一适配器只适用于保持单子不受约束的 {anchorName ForM}`ForM` 实例，大多数实例都是如此。
这是因为适配器使用 {anchorName SomeMonads (module:=Examples.MonadTransformers.Defs)}`StateT` 和 {anchorName SomeMonads (module:=Examples.MonadTransformers.Defs)}`ExceptT`，而不是底层单子。

{kw}`for` 循环支持提前返回。
将带提前返回的 {kw}`do` 块翻译为使用异常单子变换器，在 {anchorName ForM}`ForM` 之下同样适用，就像先前用 {anchorName OptionTExec}`OptionT` 停止迭代那样。
这个版本的 {anchorName findHuh}`List.find?` 同时使用了两者：

```anchor findHuh
def List.find? (p : α → Bool) (xs : List α) : Option α := do
  for x in xs do
    if p x then return x
  failure
```

除了 {kw}`break`，{kw}`for` 循环还支持 {kw}`continue`，用于在一次迭代中跳过循环体的其余部分。
{anchorName findHuhCont}`List.find?` 的另一种（但令人困惑的）写法会跳过不满足检查的元素：

```anchor findHuhCont
def List.find? (p : α → Bool) (xs : List α) : Option α := do
  for x in xs do
    if not (p x) then continue
    return x
  failure
```

{anchorName ranges}`Std.Range` 是一个由起始数、结束数和步长组成的结构。
它表示一个自然数序列，从起始数到结束数，每次增加步长。
Lean 有构造范围的特殊语法，由方括号、数字和冒号组成，共有四种形式。
终止点必须始终提供，而起点和步长可选，分别默认为 {anchorTerm ranges}`0` 和 {anchorTerm ranges}`1`：

:::table +header
*
 *  表达式
 *  起点
 *  终点
 *  步长
 *  作为列表

*
 *  {anchorTerm rangeStopContents}`[:10]`
 *  {anchorTerm ranges}`0`
 *  {anchorTerm rangeStop}`10`
 *  {anchorTerm ranges}`1`
 *  {anchorInfo rangeStopContents}`[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]`

*
 *  {anchorTerm rangeStartStopContents}`[2:10]`
 *  {anchorTerm rangeStartStopContents}`2`
 *  {anchorTerm rangeStartStopContents}`10`
 *  {anchorTerm ranges}`1`
 *  {anchorInfo rangeStartStopContents}`[2, 3, 4, 5, 6, 7, 8, 9]`

*
 *  {anchorTerm rangeStopStepContents}`[:10:3]`
 *  {anchorTerm ranges}`0`
 *  {anchorTerm rangeStartStopContents}`10`
 *  {anchorTerm rangeStopStepContents}`3`
 *  {anchorInfo rangeStopStepContents}`[0, 3, 6, 9]`

*
 *  {anchorTerm rangeStartStopStepContents}`[2:10:3]`
 *  {anchorTerm rangeStartStopStepContents}`2`
 *  {anchorTerm rangeStartStopStepContents}`10`
 *  {anchorTerm rangeStartStopStepContents}`3`
 *  {anchorInfo rangeStartStopStepContents}`[2, 5, 8]`

:::

注意起始数_会_包含在范围内，而终止数则不会。
三个参数都是 {anchorName three}`Nat`，这意味着范围不能倒数——起点大于或等于终点的范围根本不包含任何数字。

范围可以与 {kw}`for` 循环一起使用，从范围中取出数字。
这个程序统计从四到八的偶数：

```anchor fourToEight
def fourToEight : IO Unit := do
  for i in [4:9:2] do
    IO.println i
```
运行它得到：
```anchorInfo fourToEightOut
4
6
8
```


最后，{kw}`for` 循环支持并行遍历多个集合，方法是用逗号分隔 {kw}`in` 子句。
当第一个集合用尽元素时循环停止，因此声明：

```anchor parallelLoop
def parallelLoop := do
  for x in ["currant", "gooseberry", "rowan"], y in [4:8] do
    IO.println (x, y)
```
产生三行输出：
```anchor parallelLoopOut
#eval parallelLoop
```
```anchorInfo parallelLoopOut
(currant, 4)
(gooseberry, 5)
(rowan, 6)
```

许多数据结构实现了 {anchorName ForInIOAllLessThan}`ForIn` 类型类的增强版本，向循环体添加元素来自集合的证据。
可以通过在元素名之前为证据提供一个名称来使用它们。
这个函数打印数组的所有元素及其索引，编译器能够确定所有数组查找都是安全的，因为有证据 {anchorName printArray}`h`：

```anchor printArray
def printArray [ToString α] (xs : Array α) : IO Unit := do
  for h : i in [0:xs.size] do
    IO.println s!"{i}:\t{xs[i]}"
```
在这个例子中，{anchorName printArray}`h` 是 {lit}`i ∈ [0:xs.size]` 的证据，检查 {anchorTerm printArray}`xs[i]` 是否安全的策略能够将其转化为 {lit}`i < xs.size` 的证据。

# 可变变量

除了提前 {kw}`return`、无 {kw}`else` 的 {kw}`if` 和 {kw}`for` 循环，Lean 还支持 {kw}`do` 块内的局部可变变量。
在幕后，这些可变变量脱糖为等价于 {anchorName twoStateT}`StateT` 的代码，而不是由真正的可变变量实现。
再一次，函数式编程被用来模拟命令式编程。

局部可变变量用 {kw}`let mut` 引入，而不是普通的 {kw}`let`。
定义 {anchorName two}`two` 使用恒等单子 {anchorName sameBlock}`Id` 来启用 {kw}`do` 语法而不引入任何效应，计数到 {anchorTerm ranges}`2`：

```anchor two
def two : Nat := Id.run do
  let mut x := 0
  x := x + 1
  x := x + 1
  return x
```
这段代码等价于一个使用 {anchorName twoStateT}`StateT` 两次加 {anchorTerm twoStateT}`1` 的定义：

```anchor twoStateT
def two : Nat :=
  let block : StateT Nat Id Nat := do
    modify (· + 1)
    modify (· + 1)
    return (← get)
  let (result, _finalState) := block 0
  result
```

局部可变变量与 {kw}`do` 记法中所有其他为单子变换器提供便利语法的特性配合良好。
定义 {anchorName three}`three` 统计一个三元素列表中的条目数：

```anchor three
def three : Nat := Id.run do
  let mut x := 0
  for _ in [1, 2, 3] do
    x := x + 1
  return x
```
类似地，{anchorName six}`six` 对列表中的条目求和：

```anchor six
def six : Nat := Id.run do
  let mut x := 0
  for y in [1, 2, 3] do
    x := x + y
  return x
```

{anchorName ListCount}`List.count` 统计列表中满足某个检查的条目数：

```anchor ListCount
def List.count (p : α → Bool) (xs : List α) : Nat := Id.run do
  let mut found := 0
  for x in xs do
    if p x then found := found + 1
  return found
```

局部可变变量可能比显式局部使用 {anchorName twoStateT}`StateT` 更方便、更易读。
不过，它们没有命令式语言中无限制可变变量的全部能力。
特别是，它们只能在引入它们的 {kw}`do` 块中修改。
这意味着，例如，{kw}`for` 循环不能替换为在其他方面等价的递归辅助函数。
这个版本的 {anchorName nonLocalMut}`List.count`：
```anchor nonLocalMut
def List.count (p : α → Bool) (xs : List α) : Nat := Id.run do
  let mut found := 0
  let rec go : List α → Id Unit
    | [] => pure ()
    | y :: ys => do
      if p y then found := found + 1
      go ys
  return found
```
在尝试修改 {anchorName nonLocalMut}`found` 时会产生以下错误：
```anchorError nonLocalMut
`found` cannot be mutated, only variables declared using `let mut` can be mutated. If you did not intend to mutate but define `found`, consider using `let found` instead
```
这是因为递归函数写在恒等单子中，只有引入变量的 {kw}`do` 块所在的单子会用 {anchorName twoStateT}`StateT` 变换。

# 什么算作一个 {kw}`do` 块？

{kw}`do` 记法的许多特性只适用于单个 {kw}`do` 块。
提前返回会终止当前块，可变变量只能在定义它们的块中修改。
要有效使用它们，重要的是知道什么算作“同一个块”。

一般而言，{kw}`do` 关键字之后的缩进块算作一个块，其正下方的语句序列属于该块。
独立块中的语句，尽管包含在某个块中，也不被视为该块的一部分。
不过，决定什么算作同一个块的规则略有微妙，因此需要一些例子。
规则的确切性质可以通过设置一个带可变变量的程序，观察在何处允许修改来测试。
这个程序中的修改显然与可变变量在同一个块中：

```anchor sameBlock
example : Id Unit := do
  let mut x := 0
  x := x + 1
```

当修改发生在属于用 {lit}`:=` 定义名称的 {kw}`let` 语句的 {kw}`do` 块中时，它不被视为该块的一部分：
```anchor letBodyNotBlock
example : Id Unit := do
  let mut x := 0
  let other := do
    x := x + 1
  other
```
```anchorError letBodyNotBlock
`x` cannot be mutated, only variables declared using `let mut` can be mutated. If you did not intend to mutate but define `x`, consider using `let x` instead
```
不过，出现在用 {lit}`←` 定义名称的 {kw}`let` 语句之下的 {kw}`do` 块被视为周围块的一部分。
以下程序被接受：

```anchor letBodyArrBlock
example : Id Unit := do
  let mut x := 0
  let other ← do
    x := x + 1
  pure other
```

类似地，作为函数参数出现的 {kw}`do` 块与其周围块独立。
以下程序不被接受：
```anchor funArgNotBlock
example : Id Unit := do
  let mut x := 0
  let addFour (y : Id Nat) := Id.run y + 4
  addFour do
    x := 5
```
```anchorError funArgNotBlock
`x` cannot be mutated, only variables declared using `let mut` can be mutated. If you did not intend to mutate but define `x`, consider using `let x` instead
```

如果 {kw}`do` 关键字完全多余，则它不会引入新块。
这个程序被接受，与本节第一个程序等价：

```anchor collapsedBlock
example : Id Unit := do
  let mut x := 0
  do x := x + 1
```

{kw}`do` 之下分支的内容（例如由 {kw}`match` 或 {kw}`if` 引入的）被视为周围块的一部分，无论是否添加了多余的 {kw}`do`。
以下程序都被接受：

```anchor ifDoSame
example : Id Unit := do
  let mut x := 0
  if x > 2 then
    x := x + 1
```

```anchor ifDoDoSame
example : Id Unit := do
  let mut x := 0
  if x > 2 then do
    x := x + 1
```

```anchor matchDoSame
example : Id Unit := do
  let mut x := 0
  match true with
  | true => x := x + 1
  | false => x := 17
```

```anchor matchDoDoSame
example : Id Unit := do
  let mut x := 0
  match true with
  | true => do
    x := x + 1
  | false => do
    x := 17
```
类似地，作为 {kw}`for` 和 {kw}`unless` 语法一部分出现的 {kw}`do` 只是其语法的一部分，不会引入新的 {kw}`do` 块。
这些程序也被接受：

```anchor doForSame
example : Id Unit := do
  let mut x := 0
  for y in [1:5] do
   x := x + y
```

```anchor doUnlessSame
example : Id Unit := do
  let mut x := 0
  unless 1 < 5 do
    x := x + 1
```


# 命令式还是函数式编程？

Lean 的 {kw}`do` 记法提供的命令式特性，使许多程序与 Rust、Java 或 C# 等语言中的对应程序非常相似。
在把命令式算法翻译成 Lean 时，这种相似性非常方便，有些任务天然就是以命令式方式思考的。
单子和单子变换器的引入使命令式程序可以在纯函数式语言中编写，而 {kw}`do` 记法作为单子（可能局部变换）的专用语法，让函数式程序员兼得两者之长：不可变性带来的强推理原则，以及通过类型系统对可用效应的严格控制，与让使用效应的程序看起来熟悉且易读的语法和库相结合。
单子和单子变换器使函数式与命令式编程成为视角问题。


# 练习

 * 改写 {lit}`doug`，用 {kw}`for` 代替 {anchorName doList (module:=DirTree)}`doList` 函数。
 * 是否还有其他机会使用本节介绍的特性来改进代码？如果有，请使用它们！