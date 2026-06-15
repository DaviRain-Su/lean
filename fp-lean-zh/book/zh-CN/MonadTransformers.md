# 单子变换器（Monad Transformers）

单子（monad）是一种在纯语言中编码某类副作用的方式。
不同的单子提供不同的效应，例如状态和错误处理。
许多单子甚至提供大多数语言中都没有的有用效应，例如非确定性搜索、读者（reader）乃至延续（continuation）。

典型应用会有一组易于测试的核心函数（不依赖单子编写），再配以外层包装，用单子编码必要的应用逻辑。
这些单子由众所周知的组件构造而成。例如：
 * 可变状态通过函数参数和相同类型的返回值来编码
 * 错误处理通过类似 {moduleName}`Except` 的返回类型来编码，带有表示成功和失败的构造子
 * 日志记录通过将返回值与日志配对来编码

然而，手写每个单子很繁琐，需要为各种类型类编写样板定义。
这些组件中的每一个也可以提取为一个定义，用于修改某个其他单子以添加额外的效应。
这样的定义称为**单子变换器（monad transformer）**。
具体单子可以由一组单子变换器构建，从而实现更多的代码复用。

## 本章目录

- [组合 IO 与 Reader](MonadTransformers/ReaderIO.md)（Combining IO and Reader）
- [单子构造工具箱](MonadTransformers/Transformers.md)（A Monad Construction Kit）
- [单子变换器的顺序](MonadTransformers/Order.md)（Ordering Monad Transformers）
- [单子变换器的 {kw}`do` 记法](MonadTransformers/Do.md)（{kw}`do`-Notation for Monad Transformers）
- [更多便利特性](MonadTransformers/Conveniences.md)（Additional Conveniences）
- [小结](MonadTransformers/Summary.md)（Summary）