# {moduleName}`IO` 单子

{anchorName names}`IO` 作为单子可以从两个角度来理解，这两个角度在 {ref "running-a-program"}[运行程序] 一节中已经介绍过。
每一种角度都有助于理解 {anchorName names}`IO` 的 {anchorName names}`pure` 和 {anchorName names}`bind` 的含义。

从第一个角度来看，{anchorName names}`IO` 动作是对 Lean 运行时系统的一条指令。
例如，这条指令可能是“从这个文件描述符读取一个字符串，然后用该字符串重新调用纯 Lean 代码”。
这种视角是_外部_视角，从操作系统的角度观察程序。
在这种情况下，{anchorName names}`pure` 是一个不向 RTS 请求任何效果的 {anchorName names}`IO` 动作，而 {anchorName names}`bind` 则指示 RTS 先执行一个可能带有效果的操作，然后用得到的结果调用程序的其余部分。

从第二个角度来看，{anchorName names}`IO` 动作会转换整个世界。
{anchorName names}`IO` 动作实际上是纯的，因为它们接收一个唯一的世界作为参数，然后返回变化后的世界。
这种视角是_内部_视角，与 {anchorName names}`IO` 在 Lean 内部的表示方式一致。
世界在 Lean 中表示为一个令牌，{anchorName names}`IO` 单子的结构确保每个令牌恰好被使用一次。

要理解这是如何工作的，逐层剥开一个定义会很有帮助。
{kw}`#print` 命令可以揭示 Lean 数据类型和定义的内部结构。
例如，
```anchor printNat
#print Nat
```
结果是
```anchorInfo printNat
inductive Nat : Type
number of parameters: 0
constructors:
Nat.zero : Nat
Nat.succ : Nat → Nat
```
而
```anchor printCharIsAlpha
#print Char.isAlpha
```
结果是
```anchorInfo printCharIsAlpha
def Char.isAlpha : Char → Bool :=
fun c => c.isUpper || c.isLower
```

有时，{kw}`#print` 的输出会包含本书尚未介绍过的 Lean 特性。
例如，
```anchor printListIsEmpty
#print List.isEmpty
```
会产生
```anchorInfo printListIsEmpty
def List.isEmpty.{u} : {α : Type u} → List α → Bool :=
fun {α} x =>
  match x with
  | [] => true
  | head :: tail => false
```
其中定义名后面带有 {lit}`.{u}`，类型被标注为 {anchorTerm names}`Type u` 而不仅仅是 {anchorTerm names}`Type`。
目前可以安全地忽略这些细节。

打印 {anchorName names}`IO` 的定义表明，它是用更简单的结构来定义的：
```anchor printIO
#print IO
```
```anchorInfo printIO
@[reducible] def IO : Type → Type :=
EIO IO.Error
```
{anchorName printIOError}`IO.Error` 表示 {anchorName names}`IO` 动作可能抛出的所有错误：
```anchor printIOError
#print IO.Error
```
```anchorInfo printIOError
inductive IO.Error : Type
number of parameters: 0
constructors:
IO.Error.alreadyExists : Option String → UInt32 → String → IO.Error
IO.Error.otherError : UInt32 → String → IO.Error
IO.Error.resourceBusy : UInt32 → String → IO.Error
IO.Error.resourceVanished : UInt32 → String → IO.Error
IO.Error.unsupportedOperation : UInt32 → String → IO.Error
IO.Error.hardwareFault : UInt32 → String → IO.Error
IO.Error.unsatisfiedConstraints : UInt32 → String → IO.Error
IO.Error.illegalOperation : UInt32 → String → IO.Error
IO.Error.protocolError : UInt32 → String → IO.Error
IO.Error.timeExpired : UInt32 → String → IO.Error
IO.Error.interrupted : String → UInt32 → String → IO.Error
IO.Error.noFileOrDirectory : String → UInt32 → String → IO.Error
IO.Error.invalidArgument : Option String → UInt32 → String → IO.Error
IO.Error.permissionDenied : Option String → UInt32 → String → IO.Error
IO.Error.resourceExhausted : Option String → UInt32 → String → IO.Error
IO.Error.inappropriateType : Option String → UInt32 → String → IO.Error
IO.Error.noSuchThing : Option String → UInt32 → String → IO.Error
IO.Error.unexpectedEof : IO.Error
IO.Error.userError : String → IO.Error
```
{anchorTerm names}`EIO ε α` 表示要么以类型 {anchorName names}`ε` 的错误终止、要么以类型 {anchorName names}`α` 的值成功完成的 {anchorName names}`IO` 动作。
这意味着，与 {anchorTerm names}`Except ε` 单子一样，{anchorName names}`IO` 单子也具备定义错误处理和异常的能力。

再剥开一层，{anchorName names}`EIO` 本身也是用更简单的结构来定义的：
```anchor printEIO
#print EIO
```
```anchorInfo printEIO
def EIO : Type → Type → Type :=
fun ε α => EST ε IO.RealWorld α
```
{anchorName printEStateM}`EST` 单子同时包含错误和状态——它类似于 {anchorName names}`Except` 与 {anchorName State (module := Examples.Monads)}`State` 的组合。
它是用另一个类型 {anchorName printEStateMResult}`EST.Out` 来定义的：
```anchor printEStateM
#print EST
```
```anchorInfo printEStateM
def EST : Type → Type → Type → Type :=
fun ε σ α => Void σ → EST.Out ε σ α
```
换句话说，类型为 {anchorTerm EStateMNames}`EST ε σ α` 的程序是一个接受类型 {anchorName EStateMNames}`σ` 的初始状态、并返回 {anchorTerm EStateMNames}`EST.Out ε σ α` 的函数。
状态被包装在类型 {anchorName VoidSigma}`Void` 中，这是一个内部原语，会使值在编译后的代码中被擦除；{anchorTerm VoidSigma}`Void σ` 与 {anchorName save (module:=Examples.Monads)}`Unit` 具有相同的表示。

{anchorName EStateMNames}`EST.Out` 与 {anchorName names}`Except` 的定义非常相似，有一个构造子表示成功终止，另一个构造子表示错误：
```anchor printEStateMResult
#print EST.Out
```
```anchorInfo printEStateMResult
inductive EST.Out : Type → Type → Type → Type
number of parameters: 3
constructors:
EST.Out.ok : {ε σ α : Type} → α → Void σ → EST.Out ε σ α
EST.Out.error : {ε σ α : Type} → ε → Void σ → EST.Out ε σ α
```
与 {anchorTerm Except (module:=Examples.Monads)}`Except ε α` 一样，{anchorName names (show := ok)}`EST.Out.ok` 构造子包含类型为 {anchorName Except (module:=Examples.Monads)}`α` 的结果，{anchorName names (show := error)}`EST.Out.error` 构造子包含类型为 {anchorName Except (module:=Examples.Monads)}`ε` 的异常。
与 {anchorName names}`Except` 不同的是，两个构造子都有一个额外的状态字段，其中包含计算的最终状态。

{anchorTerm names}`EST ε σ` 的 {anchorName names}`Monad` 实例需要 {anchorName names}`pure` 和 {anchorName names}`bind`。
与 {anchorName State (module:=Examples.Monads)}`State` 一样，{anchorName names}`EST` 的 {anchorName names}`pure` 实现接受一个初始状态并原样返回，而与 {anchorName names}`Except` 一样，它把参数放在 {anchorName names (show := ok)}`EST.Out.ok` 构造子中返回：
```anchor printEStateMpure
#print EST.pure
```
```anchorInfo printEStateMpure
protected def EST.pure : {α ε σ : Type} → α → EST ε σ α :=
fun {α ε σ} a s => EST.Out.ok a s
```
{kw}`protected` 意味着即使打开了 {anchorName names}`EST` 命名空间，也需要使用完整名称 {anchorName printEStateMpure}`EST.pure`。

类似地，{anchorName names}`EST` 的 {anchorName names}`bind` 也接受一个初始状态作为参数。
它把这个初始状态传给第一个动作。
与 {anchorName names}`Except` 的 {anchorName names}`bind` 一样，它随后检查结果是否为错误。
如果是，则原样返回该错误，{anchorName names}`bind` 的第二个参数保持未使用。
如果结果是成功，则把第二个参数同时应用于返回的值和得到的状态。
```anchor printEStateMbind
#print EST.bind
```
```anchorInfo printEStateMbind
protected def EST.bind : {ε σ α β : Type} → EST ε σ α → (α → EST ε σ β) → EST ε σ β :=
fun {ε σ α β} x f s =>
  match x s with
  | EST.Out.ok a s => f a s
  | EST.Out.error e s => EST.Out.error e s
```

把这些全部放在一起，{anchorName names}`IO` 是一个同时跟踪状态和错误的单子。
可用错误的集合由数据类型 {anchorName printIOError}`IO.Error` 给出，其构造子描述了程序中可能出错的许多情况。
状态是一个表示真实世界的类型，称为 {anchorTerm RealWorld}`IO.RealWorld`。
每个基本的 {anchorName names}`IO` 动作接收这个真实世界并返回另一个，与错误或结果配对。
在 {anchorName names}`IO` 中，{anchorName names}`pure` 原样返回世界，而 {anchorName names}`bind` 把从一个动作修改后的世界传递给下一个动作。

因为整个宇宙放不进计算机的内存，被传递的世界只是一个表示。
只要世界令牌不被重复使用，这种表示就是安全的。
类型 {anchorTerm RealWorld}`IO.RealWorld` 是一个平凡的原语类型，根本不需要任何表示，因为它只在 {anchorName VoidSigma}`Void` 内部使用。