# 特殊类型

%%%
tag := "runtime-special-types"
%%%

理解数据在内存中的表示非常重要。
通常，表示方式可以从数据类型的定义中理解。
每个构造子对应内存中的一个对象，其头部包含一个标签和一个引用计数。
构造子的各个参数都由指向其他对象的指针表示。
换句话说，{anchorName all}`List` 确实就是一个链表，而从 {kw}`structure` 中提取字段确实只是追逐一个指针。

然而，这条规则有一些重要的例外。
编译器会特殊处理若干类型。
例如，类型 {anchorName all}`UInt32` 被定义为 {anchorTerm all}`Fin (2 ^ 32)`，但在运行时被替换为基于机器字的实际原生实现。
类似地，尽管 {anchorName all}`Nat` 的定义暗示了一种类似于 {anchorTerm all}`List Unit` 的实现，实际的运行时表示对足够小的数使用立即机器字，对较大的数使用高效的任意精度算术库。
Lean 编译器把使用模式匹配的定义翻译成适合这种表示的操作，对加法和减法等操作的调用则被映射到底层算术库中的快速操作。
毕竟，加法不应花费与加数大小成线性关系的时间。

某些类型具有特殊表示这一事实也意味着使用它们时需要谨慎。
这些类型中的大多数由编译器特殊处理的 {kw}`structure` 组成。
对于这些结构体，直接使用构造子或字段访问器可能会触发从高效表示到便于证明的慢速表示的昂贵转换。
例如，{anchorName all}`String` 被定义为一个包含字符列表的结构体，但字符串的运行时表示使用 UTF-8，而不是指向字符的链表。
把构造子应用于字符列表会创建一个以 UTF-8 编码它们的字节数组，而访问结构体的字段则需要花费与字符串长度成线性关系的时间来解码 UTF-8 表示并分配链表。
数组的表示方式类似。
从逻辑角度看，数组是包含数组元素列表的结构体，但运行时表示是动态大小的数组。
在运行时，构造子把列表翻译成数组，字段访问器则从数组分配链表。
编译器会把各种数组操作替换为尽可能就地修改数组的高效版本，而不是分配新数组。

类型本身以及命题的证明在编译后的代码中会被完全擦除。
换句话说，它们不占用任何空间，作为证明一部分可能执行的任何计算也同样被擦除。
这意味着证明可以利用字符串和数组作为归纳定义的列表的便捷接口，包括使用归纳来证明关于它们的事实，而不会在程序运行时强加缓慢的转换步骤。
对于这些内置类型，数据的便捷逻辑表示并不意味着程序必须很慢。

如果结构体类型只有一个非类型、非证明字段，那么构造子本身在运行时就会消失，被其唯一的参数所取代。
换句话说，子类型在内存中的表示与其底层类型完全相同，而不是多一层间接引用。
类似地，{anchorName all}`Fin` 在内存中就是 {anchorName all}`Nat`，可以创建单字段结构体来跟踪 {anchorName all}`Nat` 或 {anchorName all}`String` 的不同用途，而不会付出性能代价。
如果构造子没有非类型、非证明参数，那么构造子也会消失，在原本使用指针的地方被替换为常量值。
这意味着 {anchorName all}`true`、{anchorName all}`false` 和 {anchorName all}`none` 是常量值，而不是指向堆分配对象的指针。


以下类型具有特殊表示：

:::table +header
*
  * 类型
  * 逻辑表示
  * 运行时表示

*
  * {anchorName all}`Nat`
  * 一元表示，每个 {anchorTerm all}`Nat.succ` 有一个指针
  * 高效的任意精度整数

*
  * {anchorName all}`Int`
  * 和类型，构造子分别表示正数或负数，各包含一个 {anchorName all}`Nat`
  * 高效的任意精度整数

*
  * {anchorTerm all}`BitVec w`
  * 具有适当上界 $`2^w` 的 {anchorName all}`Fin`
  * 高效的任意精度整数

*
  * {anchorName all}`UInt8`、{anchorName all}`UInt16`、{anchorName all}`UInt32`、{anchorName all}`UInt64`、{anchorName all}`USize`
  * 正确位宽的位向量
  * 定宽机器整数

*
  * {anchorName all}`Int8`、{anchorName all}`Int16`、{anchorName all}`Int32`、{anchorName all}`Int64`、{anchorName all}`ISize`
  * 相同位宽的包装无符号整数
  * 定宽机器整数

*
  * {anchorName all}`Char`
  * 与证明其为有效码点的 {anchorName all}`UInt32` 配对
  * 普通字符

*
  * {anchorName all}`String`
  * 在名为 {anchorTerm StringDetail}`data` 的字段中包含 {anchorTerm all}`List Char` 的结构体
  * UTF-8 编码字符串

*
  * {anchorTerm sequences}`Array α`
  * 在名为 {anchorName sequences}`toList` 的字段中包含 {anchorTerm sequences}`List α` 的结构体
  * 指向 {anchorName sequences}`α` 值的指针组成的紧凑数组

*
  * {anchorTerm all}`Sort u`
  * 类型
  * 完全擦除

*
  * 命题的证明
  * 把命题当作证据类型时所暗示的任何数据
  * 完全擦除
:::


# 练习
%%%
tag := "runtime-special-types-exercise"
%%%

{ref "positive-numbers"}[{anchorName Pos (module := Examples.Classes)}`Pos` 的定义] 没有利用 Lean 把 {anchorName all}`Nat` 编译为高效类型这一点。
在运行时，它本质上是一个链表。
另一种做法是定义子类型，使得内部可以使用 Lean 的快速 {anchorName all}`Nat` 类型，如 {ref "subtypes"}[关于子类型的最初一节] 中所述。
在运行时，证明会被擦除。
由于所得结构体只有一个数据字段，它被表示为该字段，这意味着 {anchorName Pos (module := Examples.Classes)}`Pos` 的这种新表示与 {anchorName all}`Nat` 的表示完全相同。

在证明定理 {anchorTerm all}`∀ {n k : Nat}, n ≠ 0 → k ≠ 0 → n + k ≠ 0` 之后，为这个新的 {anchorName Pos (module := Examples.Classes)}`Pos` 表示定义 {anchorName all}`ToString` 和 {anchorName all}`Add` 的实例。然后定义 {anchorName all}`Mul` 的实例，并证明任何必要的定理。