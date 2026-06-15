# 索引、参数与宇宙

%%%
tag := "indices-parameters-universe-levels"
%%%

归纳类型的索引与参数之间的区别，不仅仅是在描述那些在各构造子之间变化或不变化的类型参数。
一个归纳类型的参数究竟是参数还是索引，在确定它们的宇宙层级关系时同样重要。
具体而言，归纳类型可以与参数处于同一宇宙层级，但必须处于比其索引更大的宇宙中。
这一限制是必要的，以确保 Lean 既能作为定理证明器，又能作为编程语言——没有它，Lean 的逻辑将是不一致的。
通过实验错误信息，是说明这些规则以及判定类型参数究竟是参数还是索引的精确规则的好方法。

一般而言，归纳类型的定义在冒号之前写参数，在冒号之后写索引。
参数像函数参数一样命名，而索引只描述其类型。
这一点可以在 {anchorName Vect (module := Examples.DependentTypes)}`Vect` 的定义中看到：

```anchor Vect (module := Examples.DependentTypes)
inductive Vect (α : Type u) : Nat → Type u where
   | nil : Vect α 0
   | cons : α → Vect α n → Vect α (n + 1)
```
在这个定义中，{anchorName Vect (module:=Examples.DependentTypes)}`α` 是参数，{anchorName Vect (module:=Examples.DependentTypes)}`Nat` 是索引。
参数可以在整个定义中被引用（例如，{anchorName consNotLengthN (module:=Examples.DependentTypes)}`Vect.cons` 将其第一个参数的类型设为 {anchorName Vect (module:=Examples.DependentTypes)}`α`），但它们必须始终一致地使用。
由于索引预期会变化，它们在各个构造子处被赋予各自的值，而不是在数据类型定义的顶部作为参数提供。


一个非常简单的带参数的数据类型是 {anchorName WithParameter}`WithParameter`：

```anchor WithParameter
inductive WithParameter (α : Type u) : Type u where
  | test : α → WithParameter α
```
宇宙层级 {anchorTerm WithParameter}`u` 可以同时用于参数和归纳类型本身，这说明参数不会提高数据类型的宇宙层级。
类似地，当有多个参数时，归纳类型取其中较大的宇宙层级：

```anchor WithTwoParameters
inductive WithTwoParameters (α : Type u) (β : Type v) : Type (max u v) where
  | test : α → β → WithTwoParameters α β
```
由于参数不会提高数据类型的宇宙层级，它们往往更便于使用。
Lean 会尝试识别那些写法像索引（在冒号之后）、用法却像参数的参数，并将它们转为参数：
以下两个归纳数据类型都把参数写在冒号之后：

```anchor WithParameterAfterColon
inductive WithParameterAfterColon : Type u → Type u where
  | test : α → WithParameterAfterColon α
```

```anchor WithParameterAfterColon2
inductive WithParameterAfterColon2 : Type u → Type u where
  | test1 : α → WithParameterAfterColon2 α
  | test2 : WithParameterAfterColon2 α
```

当参数在初始数据类型声明中未命名时，各个构造子中可以使用不同的名称，只要用法一致即可。
以下声明是可以接受的：

```anchor WithParameterAfterColonDifferentNames
inductive WithParameterAfterColonDifferentNames : Type u → Type u where
  | test1 : α → WithParameterAfterColonDifferentNames α
  | test2 : β → WithParameterAfterColonDifferentNames β
```
然而，这种灵活性并不延伸到显式声明参数名称的数据类型：
```anchor WithParameterBeforeColonDifferentNames
inductive WithParameterBeforeColonDifferentNames (α : Type u) : Type u where
  | test1 : α → WithParameterBeforeColonDifferentNames α
  | test2 : β → WithParameterBeforeColonDifferentNames β
```
```anchorError WithParameterBeforeColonDifferentNames
Mismatched inductive type parameter in
  WithParameterBeforeColonDifferentNames β
The provided argument
  β
is not definitionally equal to the expected parameter
  α

Note: The value of parameter `α` must be fixed throughout the inductive declaration. Consider making this parameter an index if it must vary.
```
类似地，试图命名一个索引会导致错误：
```anchor WithNamedIndex
inductive WithNamedIndex (α : Type u) : Type (u + 1) where
  | test1 : WithNamedIndex α
  | test2 : WithNamedIndex α → WithNamedIndex α → WithNamedIndex (α × α)
```
```anchorError WithNamedIndex
Mismatched inductive type parameter in
  WithNamedIndex (α × α)
The provided argument
  α × α
is not definitionally equal to the expected parameter
  α

Note: The value of parameter `α` must be fixed throughout the inductive declaration. Consider making this parameter an index if it must vary.
```

使用适当的宇宙层级并将索引放在冒号之后，可以得到一个可接受的声明：

```anchor WithIndex
inductive WithIndex : Type u → Type (u + 1) where
  | test1 : WithIndex α
  | test2 : WithIndex α → WithIndex α → WithIndex (α × α)
```


尽管 Lean 有时可以根据各构造子中的一致用法，判定归纳类型声明中冒号之后的参数实际上是参数，但所有参数仍必须出现在所有索引之前。
试图把参数放在索引之后，会导致该参数本身被视为索引，从而要求数据类型的宇宙层级提高：
```anchor ParamAfterIndex
inductive ParamAfterIndex : Nat → Type u → Type u where
  | test1 : ParamAfterIndex 0 γ
  | test2 : ParamAfterIndex n γ → ParamAfterIndex k γ → ParamAfterIndex (n + k) γ
```
```anchorError ParamAfterIndex
Invalid universe level in constructor `ParamAfterIndex.test1`: Parameter `γ` has type
  Type u
at universe level
  u+2
which is not less than or equal to the inductive type's resulting universe level
  u+1
```

参数不必是类型。
这个例子表明，像 {anchorName NatParamFour}`Nat` 这样的普通数据类型也可以用作参数：
```anchor NatParamFour
inductive NatParam (n : Nat) : Nat → Type u where
  | five : NatParam 4 5
```
```anchorError NatParamFour
Mismatched inductive type parameter in
  NatParam 4 5
The provided argument
  4
is not definitionally equal to the expected parameter
  n

Note: The value of parameter `n` must be fixed throughout the inductive declaration. Consider making this parameter an index if it must vary.
```
按建议把 {anchorName NatParam}`n` 用起来，声明就可以被接受：

```anchor NatParam
inductive NatParam (n : Nat) : Nat → Type u where
  | five : NatParam n 5
```




从这些实验中能得出什么结论？
参数与索引的规则如下：
 1. 参数必须在每个构造子类型中完全相同地使用。
 2. 所有参数必须出现在所有索引之前。
 3. 被定义的数据类型的宇宙层级必须至少与最大参数的宇宙层级一样大，并且严格大于最大索引的宇宙层级。
 4. 冒号之前写出的命名参数始终是参数，而冒号之后的参数通常是索引。如果冒号之后的参数在所有构造子中一致使用，并且不位于任何索引之后，Lean 可能根据其用法判定它们是参数。

如有疑问，可以使用 Lean 命令 {kw}`#print` 来检查数据类型的参数有多少个。
例如，对于 {anchorTerm printVect}`Vect`，它会指出参数个数为 1：
```anchor printVect
#print Vect
```
```anchorInfo printVect
inductive Vect.{u} : Type u → Nat → Type u
number of parameters: 1
constructors:
Vect.nil : {α : Type u} → Vect α 0
Vect.cons : {α : Type u} → {n : Nat} → α → Vect α n → Vect α (n + 1)
```

在选择数据类型参数顺序时，值得思考哪些参数应该是参数、哪些应该是索引。
尽可能让多的参数成为参数，有助于控制宇宙层级，这可以使复杂程序更容易通过类型检查。
实现这一点的一种方法是确保参数列表中所有参数都出现在所有索引之前。

此外，尽管 Lean 能够根据用法判定冒号之后的参数实际上是参数，但最好还是用显式名称来写参数。
这样意图对读者更清晰，而且如果该参数在各构造子中被误用得不一致，Lean 也会报错。