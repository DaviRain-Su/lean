# 重载与类型类（Overloading and Type Classes）

在许多语言中，内置数据类型享有特殊待遇。
例如，在 C 和 Java 中，{lit}`+` 可用于相加 {c}`float` 和 {c}`int`，但不能用于第三方库的任意精度数。
类似地，数值字面量可以直接用于内置类型，却不能用于用户定义的数字类型。
其他语言为运算符提供**重载（overloading）**机制，使同一运算符可以赋予新类型新的含义。
在这些语言中，如 C++ 和 C#，多种内置运算符都可以重载，编译器利用类型检查器选择具体的实现。

除了数值字面量和运算符之外，许多语言还允许重载函数或方法。
在 C++、Java、C# 和 Kotlin 中，允许多个方法实现，参数的数量和类型各不相同。
编译器根据参数数量及其类型来确定意图调用哪个重载。

函数和运算符重载有一个关键限制：多态函数无法将其类型参数限制为存在给定重载的类型。
例如，某个重载方法可能为字符串、字节数组和文件指针定义，但无法编写一个适用于其中任意类型的第二个方法。
相反，这个第二个方法必须本身为拥有原始方法重载的每种类型都进行重载，从而产生许多样板定义，而不是一个多态定义。
这一限制的另一个后果是，某些运算符（如 Java 中的相等性）最终会为_每一种_参数组合定义，即使这样做并不合理。
如果程序员不够谨慎，这可能导致程序在运行时崩溃，或静默计算出错误结果。

Lean 使用称为**类型类（type class）**的机制实现重载，该机制由 Haskell 首创，允许以与多态性良好配合的方式重载运算符、函数和字面量。
类型类描述一组可重载的运算。
要为新类型重载这些运算，需要创建一个**实例（instance）**，其中包含该新类型上每个运算的实现。
例如，名为 {anchorName chapterIntro}`Add` 的类型类描述允许加法的类型，而 {anchorTerm chapterIntro}`Add` 针对 {anchorTerm chapterIntro}`Nat` 的实例提供了 {anchorTerm chapterIntro}`Nat` 的加法实现。

对于习惯面向对象语言的人来说，术语"class"和"instance"可能令人困惑，因为它们与面向对象语言中的类和实例并不密切相关。
不过，它们确实有共同的词源：在日常语言中，"class"指的是共享某些共同属性的一群事物。
面向对象编程中的类当然描述具有共同属性的对象群，但该术语还指编程语言中描述这样一群事物的特定机制。
类型类也是描述共享共同属性（即某些运算的实现）的类型的一种手段，但它们与面向对象编程中的类并无太多其他共同点。

Lean 类型类更接近 Java 或 C# 的**接口（interface）**。
类型类和接口都描述概念上相关的一组运算，这些运算为某个类型或类型集合实现。
类似地，类型类的实例类似于 Java 或 C# 类中由所实现接口规定的代码，而不是 Java 或 C# 类的实例。
与 Java 或 C# 的接口不同，类型可以为类型作者无法访问的类型类提供实例。
在这方面，它们与 Rust 的 trait 非常相似。

## 本章目录

- [正数](TypeClasses/Pos.md)（Positive Numbers）
- [类型类中的多态性](TypeClasses/Polymorphism.md)（Polymorphism in Type Classes）
- [输出参数](TypeClasses/OutParams.md)（Output Parameters）
- [索引](TypeClasses/Indexing.md)（Indexing）
- [标准类型类](TypeClasses/StandardClasses.md)（Standard Type Classes）
- [强制转换](TypeClasses/Coercions.md)（Coercions）
- [更多便利特性](TypeClasses/Conveniences.md)（Additional Conveniences）
- [小结](TypeClasses/Summary.md)（Summary）