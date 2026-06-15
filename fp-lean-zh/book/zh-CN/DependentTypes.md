# 用依赖类型编程（Programming with Dependent Types）

在大多数静态类型编程语言中，类型世界与程序世界之间存在一道严密的屏障。
类型和程序有不同的语法，并在不同时刻使用。
类型通常在编译时使用，用于检查程序是否遵守某些不变量。
程序在运行时使用，用于实际执行计算。
当两者交互时，通常以类型情形运算符的形式出现，例如 `instance-of` 检查或强制转换运算符，向类型检查器提供原本无法获得的、在运行时才验证的信息。
换句话说，这种交互是类型被插入程序世界，在那里获得有限的运行时含义。

Lean 不强制这种严格分离。
在 Lean 中，程序可以计算类型，类型也可以包含程序。
将程序放入类型中，允许在编译时充分利用它们的计算能力；从函数返回类型的能力使类型成为编程过程中的头等参与者。

**依赖类型（dependent types）**是包含非类型表达式的类型。
依赖类型的一个常见来源是函数的命名参数。
例如，函数 {anchorName natOrStringThree}`natOrStringThree` 根据传入的 {anchorName natOrStringThree}`Bool` 返回自然数或字符串：

```anchor natOrStringThree
def natOrStringThree (b : Bool) : if b then Nat else String :=
  match b with
  | true => (3 : Nat)
  | false => "three"
```

依赖类型的更多示例包括：
 * {ref "polymorphism"}[多态性入门]中的 {anchorName posOrNegThree (module:= Examples.Intro)}`posOrNegThree`，其返回类型取决于参数的值。
 * {ref "literal-numbers"}[{anchorName OfNat (module := Examples.Classes)}`OfNat` 类型类] 取决于所使用的具体自然数字面量。
 * {ref "validated-input"}[验证器示例中的 {anchorName CheckedInput (module := Examples.FunctorApplicativeMonad)}`CheckedInput` 结构体] 取决于发生验证的年份。
 * {ref "subtypes"}[子类型] 包含引用特定值的命题。
 * 几乎所有有趣的命题，包括决定 {ref "props-proofs-indexing"}[数组索引记法]有效性的那些，都是包含值的类型，因此是依赖类型。

依赖类型大大增强了类型系统的表达能力。
返回类型随参数值分支的灵活性，使得可以编写在其他类型系统中难以赋予类型的程序。
同时，依赖类型允许类型签名限制函数可以返回哪些值，从而在编译时强制执行强不变量。

然而，用依赖类型编程可能相当复杂，需要在函数式编程之上掌握一整套技能。
富有表现力的规约可能难以满足，确实存在把自己绕进死结、无法完成程序的风险。
另一方面，这个过程可以带来新的理解，并体现在可以满足的精炼类型中。
本章只是触及依赖类型编程的表面，这是一个值得单独成书的深奥主题。

## 本章目录

- [索引族](DependentTypes/IndexedFamilies.md)（Indexed Families）
- [宇宙模式](DependentTypes/UniversePattern.md)（The Universe Pattern）
- [类型化查询](DependentTypes/TypedQueries.md)（Typed Queries）
- [索引、参数与宇宙](DependentTypes/IndicesParametersUniverses.md)（Indices, Parameters, and Universes）
- [常见陷阱](DependentTypes/Pitfalls.md)（Pitfalls）
- [小结](DependentTypes/Summary.md)（Summary）