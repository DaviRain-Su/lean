# 更多便利特性

%%%
tag := "type-class-conveniences"
%%%

# 实例的构造子语法

%%%
tag := "instance-constructor-syntax"
%%%

在幕后，类型类是结构体类型，实例是这些类型的值。
唯一的区别是 Lean 会存储关于类型类的额外信息（例如哪些参数是输出参数），并且实例会被注册以供搜索。
具有结构体类型的值通常用 {lit}`⟨...⟩` 语法或花括号与字段来定义，实例通常用 {kw}`where` 定义，但两种语法对两种定义都适用。

:::paragraph
例如，林业应用可以这样表示树木：

```anchor trees
structure Tree : Type where
  latinName : String
  commonNames : List String

def oak : Tree :=
  ⟨"Quercus robur", ["common oak", "European oak"]⟩

def birch : Tree :=
  { latinName := "Betula pendula",
    commonNames := ["silver birch", "warty birch"]
  }

def sloe : Tree where
  latinName := "Prunus spinosa"
  commonNames := ["sloe", "blackthorn"]
```
这三种语法是等价的。
:::

:::paragraph
类似地，类型类实例可以用全部三种语法来定义：

```anchor Display
class Display (α : Type) where
  displayName : α → String

instance : Display Tree :=
  ⟨Tree.latinName⟩

instance : Display Tree :=
  { displayName := Tree.latinName }

instance : Display Tree where
  displayName t := t.latinName
```

实例通常使用 {kw}`where` 语法，而结构体使用花括号语法或 {kw}`where` 语法。
{lit}`⟨...⟩` 语法在强调结构体类型很像字段恰好有名称的元组、而此刻名称并不重要时很有用。
不过，在其他情况下使用其他替代方案也可能有意义。
特别是，库可能提供构造实例值的函数。
在实例声明中于 {lit}`:=` 之后放置对该函数的调用，是使用这类函数的最简便方式。
:::

# 示例

%%%
tag := "example-command"
%%%

在试验 Lean 代码时，定义可能比 {kw}`#eval` 或 {kw}`#check` 命令更方便。
首先，定义不会产生任何输出，这有助于让读者把注意力集中在最有趣的输出上。
其次，编写大多数 Lean 程序时，从类型签名开始最容易，这样 Lean 在编写程序本身时能提供更多帮助和更好的错误信息。
另一方面，{kw}`#eval` 和 {kw}`#check` 在 Lean 能从所提供的表达式确定类型时最容易使用。
第三，{kw}`#eval` 不能用于没有 {moduleName}`ToString` 或 {moduleName}`Repr` 实例的类型的表达式，例如函数。
最后，多步 {kw}`do` 块、{kw}`let` 表达式以及其他占用多行的语法形式，在 {kw}`#eval` 或 {kw}`#check` 中加上类型标注尤其困难，仅仅因为所需的括号化可能难以预料。

:::paragraph
为解决这些问题，Lean 支持在源文件中显式指明示例。
示例就像没有名称的定义。
例如，可以写出哥本哈根绿地中常见鸟类的一个非空列表：

```anchor birdExample
example : NonEmptyList String :=
  { head := "Sparrow",
    tail := ["Duck", "Swan", "Magpie", "Eurasian coot", "Crow"]
  }
```
:::

:::paragraph
示例可以通过接受参数来定义函数：

```anchor commAdd
example (n : Nat) (k : Nat) : Bool :=
  n + k == k + n
```
这会在幕后创建一个函数，但该函数没有名称，也无法被调用。
尽管如此，这对于演示库如何与某给定类型的任意或未知值一起使用仍然很有用。
在源文件中，{kw}`example` 声明最好配上解释该示例如何说明库概念的注释。
:::