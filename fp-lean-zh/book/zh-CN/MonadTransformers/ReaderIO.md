# 组合 IO 与 Reader

读者单子（reader monad）有用的一种情形是：应用程序存在某种「当前配置」的概念，该配置需要在许多递归调用中传递下去。
这类程序的一个例子是 {lit}`tree`，它递归地打印当前目录及其子目录中的文件，并用字符标示目录的树形结构。
本章中的 {lit}`tree` 版本称为 {lit}`doug`，得名于点缀北美西海岸的雄伟花旗松（Douglas Fir）；在标示目录结构时，它可以选择使用 Unicode 制表符或等价的 ASCII 字符。


例如，以下命令会在名为 {lit}`doug-demo` 的目录中创建目录结构和一些空文件：
```commands doug "doug-demo"
$$ cd doug-demo
$ mkdir -p a/b/c
$ mkdir -p a/d
$ mkdir -p a/e/f
$ touch a/b/hello
$ touch a/d/another-file
$ touch a/e/still-another-file-again
```
运行 {lit}`doug` 会得到以下输出：
```commands doug "doug-demo"
$ doug
├── doug-demo/
│   ├── a/
│   │   ├── b/
│   │   │   ├── c/
│   │   │   ├── hello
│   │   ├── d/
│   │   │   ├── another-file
│   │   ├── e/
│   │   │   ├── f/
│   │   │   ├── still-another-file-again
```

# 实现

在内部，{lit}`doug` 在递归遍历目录结构时向下传递一个配置值。
该配置包含两个字段：{anchorName Config}`useASCII` 决定使用 Unicode 制表符还是 ASCII 竖线和短横线来标示结构，{anchorName Config}`currentPrefix` 包含要添加到每行输出前面的字符串。
随着当前目录层级加深，前缀字符串会累积表示「处于某个目录中」的标记。
配置是一个结构体：

```anchor Config
structure Config where
  useASCII : Bool := false
  currentPrefix : String := ""
```
该结构体为两个字段都提供了默认值。
默认的 {anchorName Config}`Config` 使用 Unicode 显示，且没有前缀。

:::paragraph
调用 {lit}`doug` 的用户需要能够传入命令行参数。
用法信息如下：

```anchor usage
def usage : String :=
  "Usage: doug [--ascii]
Options:
\t--ascii\tUse ASCII characters to display the directory structure"
```
据此，可以通过检查命令行参数列表来构造配置：

```anchor configFromArgs
def configFromArgs : List String → Option Config
  | [] => some {} -- both fields default
  | ["--ascii"] => some {useASCII := true}
  | _ => none
```
:::

{anchorName OldMain}`main` 函数是对内部工作函数 {anchorName OldMain}`dirTree` 的包装，后者使用配置来显示目录内容。
在调用 {anchorName OldMain}`dirTree` 之前，{anchorName OldMain}`main` 负责处理命令行参数。
它还必须向操作系统返回适当的退出码：

```anchor OldMain
def main (args : List String) : IO UInt32 := do
  match configFromArgs args with
  | some config =>
    dirTree config (← IO.currentDir)
    pure 0
  | none =>
    IO.eprintln s!"Didn't understand argument(s) {" ".separate args}\n"
    IO.eprintln usage
    pure 1
```
{anchorName OldMain}`IO.eprintln` 是 {anchorName OldShowFile}`IO.println` 的一个变体，输出到标准错误。

并非所有路径都应在目录树中显示。
特别是，名为 {lit}`.` 或 {lit}`..` 的文件应被跳过，因为它们实际上是用于导航的特性，而非严格意义上的文件。
在应当显示的文件中，有两种：普通文件和目录：

```anchor Entry
inductive Entry where
  | file : String → Entry
  | dir : String → Entry
```
要判断某个文件是否应显示，以及它属于哪种条目，{lit}`doug` 使用 {anchorName toEntry}`toEntry`：

```anchor toEntry
def toEntry (path : System.FilePath) : IO (Option Entry) := do
  match path.components.getLast? with
  | none => pure (some (.dir ""))
  | some "." | some ".." => pure none
  | some name =>
    pure (some (if (← path.isDir) then .dir name else .file name))
```
{anchorName names}`System.FilePath.components` 将路径转换为路径分量列表，在目录分隔符处拆分名称。
若没有最后一个分量，则该路径是根目录。
若最后一个分量是特殊的导航文件（{lit}`.` 或 {lit}`..`），则应排除该文件。
否则，目录和文件分别用对应的构造子包装。

Lean 的逻辑无法知道目录树是有限的。
事实上，某些系统允许构造循环的目录结构。
因此，{anchorName OldDirTree}`dirTree` 被声明为 {kw}`partial`：

```anchor OldDirTree
partial def dirTree (cfg : Config) (path : System.FilePath) : IO Unit := do
  match ← toEntry path with
  | none => pure ()
  | some (.file name) => showFileName cfg name
  | some (.dir name) =>
    showDirName cfg name
    let contents ← path.readDir
    let newConfig := cfg.inDirectory
    doList (contents.qsort dirLT).toList fun d =>
      dirTree newConfig d.path
```
对 {anchorName OldDirTree}`toEntry` 的调用是一个 {ref "nested-actions"}[嵌套动作]——在箭头不可能有其他含义的位置（例如 {kw}`match`），括号是可选的。
当文件名不对应树中的条目时（例如因为它是 {lit}`..`），{anchorName OldDirTree}`dirTree` 什么也不做。
当文件名指向普通文件时，{anchorName OldDirTree}`dirTree` 调用辅助函数，用当前配置显示它。
当文件名指向目录时，先用辅助函数显示它，然后在其内容中递归显示；此时使用新配置，其中前缀已扩展以反映进入了新目录。
目录内容会排序，以使输出具有确定性，比较依据是 {anchorName compareEntries'}`dirLT`。
```anchor compareEntries'
def dirLT (e1 : IO.FS.DirEntry) (e2 : IO.FS.DirEntry) : Bool :=
  e1.fileName < e2.fileName
```

用 {anchorName OldShowFile}`showFileName` 和 {anchorName OldShowFile}`showDirName` 来显示文件和目录的名称：

```anchor OldShowFile
def showFileName (cfg : Config) (file : String) : IO Unit := do
  IO.println (cfg.fileName file)

def showDirName (cfg : Config) (dir : String) : IO Unit := do
  IO.println (cfg.dirName dir)
```
这两个辅助函数都委托给 {anchorName filenames}`Config` 上的函数，这些函数会考虑 ASCII 与 Unicode 的设置：

```anchor filenames
def Config.preFile (cfg : Config) :=
  if cfg.useASCII then "|--" else "├──"

def Config.preDir (cfg : Config) :=
  if cfg.useASCII then "|  " else "│  "

def Config.fileName (cfg : Config) (file : String) : String :=
  s!"{cfg.currentPrefix}{cfg.preFile} {file}"

def Config.dirName (cfg : Config) (dir : String) : String :=
  s!"{cfg.currentPrefix}{cfg.preFile} {dir}/"
```
类似地，{anchorName inDirectory}`Config.inDirectory` 用目录标记扩展前缀：

```anchor inDirectory
def Config.inDirectory (cfg : Config) : Config :=
  {cfg with currentPrefix := cfg.preDir ++ " " ++ cfg.currentPrefix}
```

使用 {anchorName doList}`doList` 对目录内容列表迭代执行 IO 动作。
由于 {anchorName doList}`doList` 会执行列表中的所有动作，且不会根据任何动作返回的值来做控制流决策，因此并不需要 {anchorName ConfigIO}`Monad` 的全部能力，它对任意 {anchorName doList}`Applicative` 都适用：

```anchor doList
def doList [Applicative f] : List α → (α → f Unit) → f Unit
  | [], _ => pure ()
  | x :: xs, action =>
    action x *>
    doList xs action
```


# 使用自定义单子

虽然 {lit}`doug` 的这一实现可以工作，但手动传递配置既冗长又容易出错。
例如，类型系统不会捕获向下传递了错误配置的情况。
读者效应确保同一配置会传递给所有递归调用（除非手动覆盖），并有助于使代码不那么冗长。

要创建一个既是 {anchorName ConfigIO}`IO` 又是 {anchorName ConfigIO}`Config` 的读者的版本，首先按照 {ref "custom-environments"}[求值器示例] 中的做法定义类型及其 {anchorName ConfigIO}`Monad` 实例：

```anchor ConfigIO
def ConfigIO (α : Type) : Type :=
  Config → IO α

instance : Monad ConfigIO where
  pure x := fun _ => pure x
  bind result next := fun cfg => do
    let v ← result cfg
    next v cfg
```
这个 {anchorName ConfigIO}`Monad` 实例与 {anchorName Reader (module := Examples.Monads.Class)}`Reader` 的实例之间的区别在于：前者在 {anchorName ConfigIO}`bind` 返回的函数体中使用 {anchorName ConfigIO}`IO` 单子的 {kw}`do` 记法，而不是将 {anchorName ConfigIO}`next` 直接应用于 {anchorName ConfigIO}`result` 返回的值。
{anchorName ConfigIO}`result` 执行的任何 {anchorName ConfigIO}`IO` 效应都必须在调用 {anchorName ConfigIO}`next` 之前发生，这由 {anchorName ConfigIO}`IO` 单子的 {anchorName ConfigIO}`bind` 运算符保证。
{anchorName ConfigIO}`ConfigIO` 不是宇宙多态的，因为底层的 {anchorName ConfigIO}`IO` 类型也不是宇宙多态的。

运行 {anchorName ConfigIO}`ConfigIO` 动作涉及通过提供配置将其转换为 {anchorName ConfigIO}`IO` 动作：

```anchor ConfigIORun
def ConfigIO.run (action : ConfigIO α) (cfg : Config) : IO α :=
  action cfg
```
这个函数并非真正必要，因为调用者可以直接提供配置。
然而，为这一操作命名有助于更清楚地看出代码的哪些部分意在哪个单子中运行。

下一步是定义一种在 {anchorName ConfigIO}`ConfigIO` 中访问当前配置的方式：

```anchor currentConfig
def currentConfig : ConfigIO Config :=
  fun cfg => pure cfg
```
这与 {ref "custom-environments"}[求值器示例] 中的 {anchorName Reader (module := Examples.Monads.Class)}`read` 类似，只不过它使用 {anchorName ConfigIO}`IO` 的 {anchorName ConfigIO}`pure` 来返回值，而不是直接返回。
由于进入目录会修改递归调用作用域内的当前配置，因此需要一种覆盖配置的方式：

```anchor locally
def locally (change : Config → Config) (action : ConfigIO α) : ConfigIO α :=
  fun cfg => action (change cfg)
```

{lit}`doug` 中使用的许多代码并不需要配置，{lit}`doug` 还调用了标准库中显然不需要 {anchorName ConfigIO}`Config` 的普通 Lean {anchorName ConfigIO}`IO` 动作。
可以使用 {anchorName runIO}`runIO` 运行普通 {anchorName ConfigIO}`IO` 动作，它会忽略配置参数：

```anchor runIO
def runIO (action : IO α) : ConfigIO α :=
  fun _ => action
```

有了这些组件，可以更新 {anchorName MedShowFileDir}`showFileName` 和 {anchorName MedShowFileDir}`showDirName`，使它们通过 {anchorName ConfigIO}`ConfigIO` 单子隐式获取配置参数。
它们使用 {ref "nested-actions"}[嵌套动作] 来检索配置，并使用 {anchorName runIO}`runIO` 来实际执行对 {anchorName MedShowFileDir}`IO.println` 的调用：

```anchor MedShowFileDir
def showFileName (file : String) : ConfigIO Unit := do
  runIO (IO.println ((← currentConfig).fileName file))

def showDirName (dir : String) : ConfigIO Unit := do
  runIO (IO.println ((← currentConfig).dirName dir))
```

在新版 {anchorName MedDirTree}`dirTree` 中，对 {anchorName MedDirTree}`toEntry` 和 {anchorName MedDirTree}`readDir` 的调用被包在 {anchorName runIO}`runIO` 中。
此外，它不再构造新配置然后要求程序员跟踪该把哪一个传给递归调用，而是使用 {anchorName MedDirTree}`locally` 自然地将修改后的配置限定在程序的一小块区域中；在该区域内，它是_唯一_有效的配置：

```anchor MedDirTree
partial def dirTree (path : System.FilePath) : ConfigIO Unit := do
  match ← runIO (toEntry path) with
    | none => pure ()
    | some (.file name) => showFileName name
    | some (.dir name) =>
      showDirName name
      let contents ← runIO path.readDir
      locally (·.inDirectory)
        (doList (contents.qsort dirLT).toList fun d =>
          dirTree d.path)
```

新版 {anchorName MedMain}`main` 使用 {anchorName ConfigIORun}`ConfigIO.run` 以初始配置调用 {anchorName MedMain}`dirTree`：

```anchor MedMain
def main (args : List String) : IO UInt32 := do
    match configFromArgs args with
    | some config =>
      (dirTree (← IO.currentDir)).run config
      pure 0
    | none =>
      IO.eprintln s!"Didn't understand argument(s) {" ".separate args}\n"
      IO.eprintln usage
      pure 1
```

与手动传递配置相比，这个自定义单子有若干优势：

 1. 更容易确保配置原样向下传递，除非确实需要修改
 2. 向下传递配置的关切与打印目录内容的关切更加清晰地分离
 3. 随着程序增长，会有越来越多只做配置传播而不使用配置的中间层；当配置逻辑变化时，这些层无需重写

然而，也存在一些明显的缺点：

 1. 随着程序演进、单子需要更多特性，{anchorName locally}`locally` 和 {anchorName currentConfig}`currentConfig` 等基本运算符都需要更新
 2. 用 {anchorName runIO}`runIO` 包装普通 {anchorName ConfigIO}`IO` 动作既嘈杂，又干扰程序流程
 3. 手写单子实例很重复，而向另一个单子添加读者效应的技术是一种需要文档和沟通开销的设计模式

使用称为_单子变换器（monad transformers）_的技术，可以解决所有这些缺点。
单子变换器接受一个单子作为参数，并返回一个新单子。
单子变换器包括：
 1. 变换器本身的定义，通常是从类型到类型的函数
 2. 一个 {anchorName ConfigIO}`Monad` 实例，假定内部类型已经是单子
 3. 一个将内部单子的动作「提升」到变换后单子的运算符，类似于 {anchorName runIO}`runIO`

# 为任意单子添加 Reader

向 {anchorName ConfigIO}`IO` 添加读者效应是在 {anchorName ConfigIO}`ConfigIO` 中通过将 {anchorTerm ConfigIO}`IO α` 包装在函数类型中完成的。
Lean 标准库包含一个可以对_任意_多态类型执行此操作的函数，称为 {anchorName MyReaderT}`ReaderT`：

```anchor MyReaderT
def ReaderT (ρ : Type u) (m : Type u → Type v) (α : Type u) :
    Type (max u v) :=
  ρ → m α
```
其参数如下：
 * {anchorName MyReaderT}`ρ` 是读者可访问的环境
 * {anchorName MyReaderT}`m` 是被变换的单子，例如 {anchorName ConfigIO}`IO`
 * {anchorName MyReaderT}`α` 是单子计算返回的值的类型
{anchorName MyReaderT}`α` 和 {anchorName MyReaderT}`ρ` 处于同一宇宙，因为单子中检索环境的运算符的类型将是 {anchorTerm MyReaderTread}`m ρ`。

:::paragraph
有了 {anchorName MyReaderT}`ReaderT`，{anchorName ConfigIO}`ConfigIO` 变为：

```anchor ReaderTConfigIO
abbrev ConfigIO (α : Type) : Type := ReaderT Config IO α
```
它是 {kw}`abbrev`，因为 {anchorName ReaderTConfigIO}`ReaderT` 在标准库中有许多有用特性；若用不可展开的定义，这些特性会被隐藏。
与其直接为 {anchorName ConfigIO}`ConfigIO` 负责让这些特性工作，不如简单地让 {anchorName ReaderTConfigIO}`ConfigIO` 与 {anchorTerm ReaderTConfigIO}`ReaderT Config IO` 行为完全一致。
:::

:::paragraph
手动编写的 {anchorName currentConfig}`currentConfig` 从读者中取出环境。
这一效应可以为所有 {anchorName MyReaderTread}`ReaderT` 用法以通用形式定义，名称为 {anchorName MonadReader}`read`：

```anchor MyReaderTread
def read [Monad m] : ReaderT ρ m ρ :=
   fun env => pure env
```
然而，并非每个提供读者效应的单子都是用 {anchorName MyReaderT}`ReaderT` 构建的。
类型类 {anchorName MonadReader}`MonadReader` 允许任意单子提供 {anchorName MonadReader}`read` 运算符：

```anchor MonadReader
class MonadReader (ρ : outParam (Type u)) (m : Type u → Type v) :
    Type (max (u + 1) v) where
  read : m ρ

instance [Monad m] : MonadReader ρ (ReaderT ρ m) where
  read := fun env => pure env

export MonadReader (read)
```
类型 {anchorName MonadReader}`ρ` 是输出参数，因为任意给定单子通常只通过读者提供一种环境类型；在已知单子时自动选择它，会使程序写起来更方便。
:::

{anchorName MyReaderT}`ReaderT` 的 {anchorName ConfigIO}`Monad` 实例与 {anchorName ConfigIO}`ConfigIO` 的 {anchorName ConfigIO}`Monad` 实例基本相同，只不过 {anchorName ConfigIO}`IO` 被替换为某个任意单子参数 {anchorName MonadMyReaderT}`m`：

```anchor MonadMyReaderT
instance [Monad m] : Monad (ReaderT ρ m) where
  pure x := fun _ => pure x
  bind result next := fun env => do
    let v ← result env
    next v env
```


下一步是消除对 {anchorName runIO}`runIO` 的使用。
当 Lean 遇到单子类型不匹配时，会自动尝试使用名为 {anchorName MyMonadLift}`MonadLift` 的类型类，将实际的单子变换为期望的单子。
这一过程类似于强制转换的使用。
{anchorName MyMonadLift}`MonadLift` 定义如下：

```anchor MyMonadLift
class MonadLift (m : Type u → Type v) (n : Type u → Type w) where
  monadLift : {α : Type u} → m α → n α
```
方法 {anchorName MyMonadLift}`monadLift` 从单子 {anchorName MyMonadLift}`m` 转换到单子 {anchorName MyMonadLift}`n`。
这一过程称为「提升（lifting）」，因为它将嵌入单子中的动作变成外围单子中的动作。
在本例中，它将用于从 {anchorName ConfigIO}`IO`「提升」到 {anchorTerm ReaderTConfigIO}`ReaderT Config IO`，不过该实例对_任意_内部单子 {anchorName MonadLiftReaderT}`m` 都适用：

```anchor MonadLiftReaderT
instance : MonadLift m (ReaderT ρ m) where
  monadLift action := fun _ => action
```
{anchorName MonadLiftReaderT}`monadLift` 的实现与 {anchorName runIO}`runIO` 非常相似。
事实上，足以在不使用 {anchorName runIO}`runIO` 的情况下定义 {anchorName showFileAndDir}`showFileName` 和 {anchorName showFileAndDir}`showDirName`：

```anchor showFileAndDir
def showFileName (file : String) : ConfigIO Unit := do
  IO.println s!"{(← read).currentPrefix} {file}"

def showDirName (dir : String) : ConfigIO Unit := do
  IO.println s!"{(← read).currentPrefix} {dir}/"
```

原始 {anchorName ConfigIO}`ConfigIO` 中还有一个操作需要转换为 {anchorName MyReaderT}`ReaderT` 的用法：{anchorName locally}`locally`。
该定义可以直接翻译为 {anchorName MyReaderT}`ReaderT`，但 Lean 标准库提供了更通用的版本。
标准版本称为 {anchorName MyMonadWithReader}`withReader`，它是类型类 {anchorName MyMonadWithReader}`MonadWithReader` 的一部分：

```anchor MyMonadWithReader
class MonadWithReader (ρ : outParam (Type u)) (m : Type u → Type v) where
  withReader {α : Type u} : (ρ → ρ) → m α → m α
```
与 {anchorName MonadReader}`MonadReader` 一样，环境 {anchorName MyMonadWithReader}`ρ` 是 {anchorName MyMonadWithReader}`outParam`。
{anchorName exportWithReader}`withReader` 操作被导出，因此不必在它前面写上类型类名称：

```anchor exportWithReader
export MonadWithReader (withReader)
```
{anchorName ReaderTWithReader}`ReaderT` 的实例与 {anchorName locally}`locally` 的定义基本相同：

```anchor ReaderTWithReader
instance : MonadWithReader ρ (ReaderT ρ m) where
  withReader change action :=
    fun cfg => action (change cfg)
```

有了这些定义，就可以编写新版 {anchorName readerTDirTree}`dirTree`：

```anchor readerTDirTree
partial def dirTree (path : System.FilePath) : ConfigIO Unit := do
  match ← toEntry path with
    | none => pure ()
    | some (.file name) => showFileName name
    | some (.dir name) =>
      showDirName name
      let contents ← path.readDir
      withReader (·.inDirectory)
        (doList (contents.qsort dirLT).toList fun d =>
          dirTree d.path)
```
除了用 {anchorName readerTDirTree}`withReader` 替换 {anchorName locally}`locally` 之外，它与之前相同。


用 {anchorName MonadMyReaderT}`ReaderT` 替换自定义的 {anchorName ConfigIO}`ConfigIO` 类型，在本节中并没有节省大量代码行数。
然而，使用标准库组件重写代码确实有长期好处。
首先，了解 {anchorName MyReaderT}`ReaderT` 的读者不必花时间理解 {anchorName ConfigIO}`ConfigIO` 的 {anchorName ConfigIO}`Monad` 实例，再倒推单子的含义。
相反，他们可以对自己的初步理解充满信心。
其次，向单子添加更多效应（例如用状态效应统计每个目录中的文件数并在末尾显示计数）时，代码需要的修改少得多，因为库中提供的单子变换器和 {anchorName MonadLiftReaderT}`MonadLift` 实例能够很好地协同工作。
最后，借助标准库中的一组类型类，可以编写多态代码，使其适用于多种单子，而不必关心单子变换器应用顺序等细节。
正如有些函数可以在任意单子中工作一样，另一些函数可以在提供某种状态或某种异常的任意单子中工作，而不必具体描述某个具体单子_以何种方式_提供状态或异常。

# 练习

## 控制点文件的显示

名称以点字符（{lit}`'.'`）开头的文件通常表示应当隐藏的文件，例如版本控制元数据和配置文件。
修改 {lit}`doug`，增加一个选项来控制是否显示以点开头的文件名。
该选项应通过命令行参数 {lit}`-a` 控制。

## 将起始目录作为参数

修改 {lit}`doug`，使其接受一个额外的命令行参数作为起始目录。