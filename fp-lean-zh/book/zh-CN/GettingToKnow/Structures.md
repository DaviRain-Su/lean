# 结构体

编写程序的第一步通常是识别问题领域中的概念，然后在代码中为它们找到合适的表示方式。有时候，一个领域概念是若干更简单概念的集合。在这种情况下，将这些简单组件打包成一个单一的“包裹”，并赋予它一个有意义的名称会很方便。在 Lean 中，这可以通过 _结构体_ 实现，它类似于 C 或 Rust 中的 {c}`struct` 以及 C# 中的 {CSharp}`record`。

定义一个结构体会向 Lean 引入一个完全新的类型，它无法被归约为任何其他类型。这很有用，因为多个结构体可能代表不同的概念，但它们包含的数据却相同。例如，一个点可以用笛卡尔坐标或极坐标表示，二者都是一对浮点数。定义不同的结构体可以防止 API 使用者将二者混淆。

Lean 的浮点数类型称为 {anchorName zeroFloat}`Float`，浮点数按通常的记法书写。

```anchorTerm onePointTwo
#check 1.2
```


```anchorInfo onePointTwo
1.2 : Float
```


```anchorTerm negativeLots
#check -454.2123215
```


```anchorInfo negativeLots
-454.2123215 : Float
```


```anchorTerm zeroPointZero
#check 0.0
```


```anchorInfo zeroPointZero
0.0 : Float
```

当浮点数写成带小数点的形式时，Lean 会推断其类型为 {anchorName zeroFloat}`Float`。如果省略小数点，则可能需要类型注解。

```anchorTerm zeroNat
#check 0
```


```anchorInfo zeroNat
0 : Nat
```



```anchorTerm zeroFloat
#check (0 : Float)
```


```anchorInfo zeroFloat
0 : Float
```



一个笛卡尔点是包含两个 {anchorName zeroFloat}`Float` 字段的结构体，分别称为 {anchorName Point}`x` 和 {anchorName Point}`y`。这使用 {kw}`structure` 关键字声明。


```anchor Point
structure Point where
  x : Float
  y : Float
```

声明之后，{anchorName Point}`Point` 就是一个新的结构体类型。创建一个结构体类型值的典型方式是在花括号中提供所有字段的值。笛卡尔平面的原点是 {anchorName Point}`x` 和 {anchorName Point}`y` 都为零的位置：

```anchor origin
def origin : Point := { x := 0.0, y := 0.0 }
```

{anchorTerm originEval}`#eval origin` 的结果看起来与 {anchorName origin}`origin` 的定义非常相似。

```anchorInfo originEval
{ x := 0.000000, y := 0.000000 }
```


因为结构体的作用是将一组数据“打包”，命名并将其作为一个整体处理，所以能够提取结构体的各个字段也很重要。这通过点号记法完成，与 C、Python、Rust 或 JavaScript 中一样。

```anchorTerm originx
#eval origin.x
```

```anchorInfo originx
0.000000
```


```anchorTerm originy
#eval origin.y
```

```anchorInfo originy
0.000000
```

::::paragraph
这可以用来定义以结构体为参数的函数。例如，点的加法通过将其坐标值相加来实现。应当有

```anchorTerm addPointsEx
#eval addPoints { x := 1.5, y := 32 } { x := -8, y := 0.2 }
```

产生

```anchorInfo addPointsEx
{ x := -6.500000, y := 32.200000 }
```
::::

该函数本身接受两个 {anchorName Point}`Point` 参数，分别称为 {anchorName addPoints}`p1` 和 {anchorName addPoints}`p2`。结果点基于 {anchorName addPoints}`p1` 和 {anchorName addPoints}`p2` 的 {anchorName addPoints}`x` 和 {anchorName addPoints}`y` 字段：

```anchor addPoints
def addPoints (p1 : Point) (p2 : Point) : Point :=
  { x := p1.x + p2.x, y := p1.y + p2.y }
```


类似地，两点之间的距离可以写成它们 {anchorName Point}`x` 和 {anchorName Point}`y` 分量差值平方和的平方根：

```anchor distance
def distance (p1 : Point) (p2 : Point) : Float :=
  Float.sqrt (((p2.x - p1.x) ^ 2.0) + ((p2.y - p1.y) ^ 2.0))
```

例如，$`(1, 2)` 与 $`(5, -1)` 之间的距离为 $`5`：

```anchorTerm evalDistance
#eval distance { x := 1.0, y := 2.0 } { x := 5.0, y := -1.0 }
```

```anchorInfo evalDistance
5.000000
```



多个结构体可以拥有相同名称的字段。一个三维点数据类型可以共享 {anchorName Point3D}`x` 和 {anchorName Point3D}`y` 字段，并使用相同的字段名实例化：

```anchor Point3D
structure Point3D where
  x : Float
  y : Float
  z : Float
```

```anchor origin3D
def origin3D : Point3D := { x := 0.0, y := 0.0, z := 0.0 }
```

这意味着，使用花括号语法时，必须已知结构体的期望类型。如果类型未知，Lean 就无法实例化该结构体。例如，

```anchorTerm originNoType
#check { x := 0.0, y := 0.0 }
```

会导致错误

```anchorError originNoType
invalid {...} notation, expected type is not known
```


像往常一样，可以通过提供类型注解来解决。

```anchorTerm originWithAnnot
#check ({ x := 0.0, y := 0.0 } : Point)
```


```anchorInfo originWithAnnot
{ x := 0.0, y := 0.0 } : Point
```


为了使程序更简洁，Lean 还允许在花括号内部标注结构体类型。

```anchorTerm originWithAnnot2
#check { x := 0.0, y := 0.0 : Point}
```


```anchorInfo originWithAnnot2
{ x := 0.0, y := 0.0 } : Point
```


# 更新结构体

假设有一个函数 {anchorName zeroXBad}`zeroX`，它将 {anchorName zeroXBad}`Point` 的 {anchorName zeroXBad}`x` 字段替换为 {anchorTerm zeroX}`0`。在大多数编程语言社区中，这句话意味着 {anchorName Point}`x` 指向的内存位置将被新值覆盖。然而，Lean 是一门函数式编程语言。在函数式编程社区中，这类表述几乎总是意味着会分配一个新的 {anchorName Point}`Point`，其 {anchorName Point}`x` 字段指向新值，而所有其他字段都指向输入中的原始值。按照这一描述直译，可以写出 {anchorName zeroXBad}`zeroX`：为 {anchorName Point}`x` 填写新值，并手动保留 {anchorName Point}`y`：

```anchor zeroXBad
def zeroX (p : Point) : Point :=
  { x := 0, y := p.y }
```

然而，这种编程风格有缺点。首先，如果结构体新增了一个字段，那么所有更新任意字段的位置都必须修改，造成维护困难。其次，如果结构体包含多个相同类型的字段，复制粘贴代码很容易导致字段内容被重复或调换。最后，程序会变得冗长且繁琐。

Lean 提供了一种方便的语法，用于替换结构体中的某些字段而保持其他字段不变。这通过在结构体初始化中使用 {kw}`with` 关键字实现。未更改的字段来源放在 {kw}`with` 之前，新字段放在之后。例如，{anchorName zeroX}`zeroX` 可以只写新 {anchorName Point}`x` 值：

```anchor zeroX
def zeroX (p : Point) : Point :=
  { p with x := 0 }
```

请记住，这种结构体更新语法不会修改已有值——它会创建新值，并与旧值共享某些字段。给定点 {anchorName fourAndThree}`fourAndThree`：

```anchor fourAndThree
def fourAndThree : Point :=
  { x := 4.3, y := 3.4 }
```

先求值它，然后用 {anchorName zeroX}`zeroX` 求值它的更新，再重新求值它，结果仍是原始值：

```anchorTerm fourAndThreeEval
#eval fourAndThree
```


```anchorInfo fourAndThreeEval
{ x := 4.300000, y := 3.400000 }
```


```anchorTerm zeroXFourAndThreeEval
#eval zeroX fourAndThree
```


```anchorInfo zeroXFourAndThreeEval
{ x := 0.000000, y := 3.400000 }
```


```anchorTerm fourAndThreeEval
#eval fourAndThree
```


```anchorInfo fourAndThreeEval
{ x := 4.300000, y := 3.400000 }
```


结构体更新不会修改原始结构体的一个后果是，当新值由旧值计算得出时，推理变得更加容易。所有对旧结构体的引用在新值中仍指向相同的字段值。



# 幕后原理

每个结构体都有一个 _构造子_。这里，“构造子”一词可能会造成困惑。与 Java 或 Python 等语言中的构造子不同，Lean 中的构造子不是数据类型初始化时要运行的任意代码。相反，构造子只是收集要存储在新分配的数据结构中的数据。无法提供自定义构造子来预处理数据或拒绝无效参数。这实际上是“构造子”一词在两种语境中具有不同但相关含义的情况。


默认情况下，名为 {lit}`S` 的结构体的构造子名为 {lit}`S.mk`。这里，{lit}`S` 是命名空间限定符，{lit}`mk` 是构造子本身的名称。除了使用花括号初始化语法外，也可以直接应用构造子。

```anchorTerm checkPointMk
#check Point.mk 1.5 2.8
```

不过，这通常不被认为是好的 Lean 风格，而且 Lean 在反馈中也会使用标准的结构体初始化语法。

```anchorInfo checkPointMk
{ x := 1.5, y := 2.8 } : Point
```


构造子具有函数类型，这意味着它们可以在任何需要函数的地方使用。例如，{anchorName Pointmk}`Point.mk` 是一个接受两个 {anchorName Point}`Float`（分别为 {anchorName Point}`x` 和 {anchorName Point}`y`）并返回一个新 {anchorName Point}`Point` 的函数。

```anchorTerm Pointmk
#check (Point.mk)
```

```anchorInfo Pointmk
Point.mk : Float → Float → Point
```

要覆盖结构体的构造子名称，请在开头用两个冒号书写。例如，要使用 {anchorName PointCtorNameName}`Point.point` 而非 {anchorName Pointmk}`Point.mk`，可写为：

```anchor PointCtorName
structure Point where
  point ::
  x : Float
  y : Float
```

除了构造子外，结构体的每个字段还会定义一个访问器函数。这些函数与字段同名，位于结构体的命名空间中。对于 {anchorName Point}`Point`，会生成访问器函数 {anchorName Pointx}`Point.x` 和 {anchorName Pointy}`Point.y`。

```anchorTerm Pointx
#check (Point.x)
```

```anchorInfo Pointx
Point.x : Point → Float
```

```anchorTerm Pointy
#check (Point.y)
```

```anchorInfo Pointy
Point.y : Point → Float
```


事实上，正如花括号结构体构造语法在幕后会被转换为对结构体构造子的调用一样，之前 {anchorName addPoints}`addPoints` 定义中的 {anchorName addPoints}`x` 语法会被转换为对 {anchorName addPoints}`x` 访问器的调用。也就是说，{anchorTerm originx}`#eval origin.x` 和 {anchorTerm originx1}`#eval Point.x origin` 都会产生

```anchorInfo originx1
0.000000
```


访问器点号记法不仅可以用于结构体字段，也可以用于接受任意数量参数的函数。更一般地，访问器记法的形式为 {lit}`TARGET.f ARG1 ARG2 ...`。如果 {lit}`TARGET` 的类型为 {lit}`T`，则调用名为 {lit}`T.f` 的函数。{lit}`TARGET` 成为其类型为 {lit}`T` 的最左参数，这通常是第一个参数但不总是，{lit}`ARG1 ARG2 ...` 按顺序作为剩余参数传入。例如，可以从字符串出发用访问器记法调用 {anchorName stringAppend}`String.append`，即使 {anchorName Inline}`String` 不是带有 {anchorName stringAppendDot}`append` 字段的结构体。

```anchorTerm stringAppendDot
#eval "one string".append " and another"
```

```anchorInfo stringAppendDot
"one string and another"
```

在这个例子中，{lit}`TARGET` 代表 {anchorTerm stringAppendDot}`"one string"`，而 {lit}`ARG1` 代表 {anchorTerm stringAppendDot}`" and another"`。

函数 {anchorName modifyBoth}`Point.modifyBoth`（即在 {lit}`Point` 命名空间中定义的 {anchorName modifyBothTest}`modifyBoth`）将一个函数应用于 {anchorName Point}`Point` 的两个字段：

```anchor modifyBoth
def Point.modifyBoth (f : Float → Float) (p : Point) : Point :=
  { x := f p.x, y := f p.y }
```

即使 {anchorName Point}`Point` 参数位于函数参数之后，它也可以使用点号记法：

```anchorTerm modifyBothTest
#eval fourAndThree.modifyBoth Float.floor
```

```anchorInfo modifyBothTest
{ x := 4.000000, y := 3.000000 }
```

在这种情况下，{lit}`TARGET` 代表 {anchorName fourAndThree}`fourAndThree`，而 {lit}`ARG1` 是 {anchorName modifyBothTest}`Float.floor`。这是因为访问器记法的目标被用作类型匹配的第一个参数，而不一定是函数声明中的第一个参数。

# 练习

 * 定义一个名为 {anchorName RectangularPrism}`RectangularPrism` 的结构体，包含矩形棱柱的高、宽、深，每个字段均为 {anchorName RectangularPrism}`Float`。
 * 定义一个名为 {anchorTerm RectangularPrism}`volume : RectangularPrism → Float` 的函数，计算矩形棱柱的体积。
 * 定义一个名为 {anchorName RectangularPrism}`Segment` 的结构体，用其两个端点表示一条线段，并定义函数 {lit}`length : Segment → Float` 计算线段长度。{anchorName RectangularPrism}`Segment` 最多应有两个字段。
 * {anchorName RectangularPrism}`RectangularPrism` 的声明引入了哪些名称？
 * 下面 {anchorName Hamster}`Hamster` 和 {anchorName Book}`Book` 的声明引入了哪些名称？它们的类型是什么？

    ```anchor Hamster
    structure Hamster where
      name : String
      fluffy : Bool
    ```

    ```anchor Book
    structure Book where
      makeBook ::
      title : String
      author : String
      price : Float
    ```
