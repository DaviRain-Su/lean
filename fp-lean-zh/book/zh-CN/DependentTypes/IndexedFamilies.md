# 索引族

%%%
tag := "indexed-families"
%%%

多态归纳类型接受类型参数。
例如，{moduleName}`List` 接受一个参数来决定列表中条目的类型，而 {moduleName}`Except` 接受参数来决定异常或值的类型。
这些类型参数在数据类型的每个构造子中都相同，称为**参数**（parameters）。

然而，归纳类型的参数不必在每个构造子中都相同。
参数随构造子选择而变化的归纳类型称为**索引族**（indexed families），而会变化的那些参数称为**索引**（indices）。
索引族的「Hello World」是一种在条目类型之外还把列表长度编码进类型的列表，通常称为「向量」（vectors）：

```anchor Vect
inductive Vect (α : Type u) : Nat → Type u where
   | nil : Vect α 0
   | cons : α → Vect α n → Vect α (n + 1)
```

三个 {anchorName vect3}`String` 向量的类型本身就包含「它含有三个 {anchorName vect3}`String`」这一事实：

```anchor vect3
example : Vect String 3 :=
  .cons "one" (.cons "two" (.cons "three" .nil))
```


函数声明可以在冒号之前接受一些参数，表示它们在整段定义中都可用；也可以在冒号之后接受一些参数，表示希望对其做模式匹配、并逐情形定义函数。
归纳数据类型有类似的原则：参数 {anchorName Vect}`α` 在数据类型声明顶部、冒号之前命名，表示它是必须在定义中所有 {anchorName Vect}`Vect` 出现处都作为第一个参数提供的参数；而 {anchorName Vect}`Nat` 参数出现在冒号之后，表示它是可以变化的索引。
事实上，在 {anchorName Vect}`nil` 和 {anchorName Vect}`cons` 构造子声明中，{anchorName Vect}`Vect` 的三处出现都一致地把 {anchorName Vect}`α` 作为第一个参数，而第二个参数在每种情形下都不同。



{anchorName Vect}`nil` 的声明表明它是类型为 {anchorTerm Vect}`Vect α 0` 的构造子。
这意味着在期望 {anchorTerm nilNotLengthThree}`Vect String 3` 的上下文中使用 {anchorName nilNotLengthThree}`Vect.nil` 是类型错误，就像 {anchorTerm otherEx}`[1, 2, 3]` 在期望 {anchorTerm otherEx}`List String` 的上下文中是类型错误一样：
```anchor nilNotLengthThree
example : Vect String 3 := Vect.nil
```
```anchorError nilNotLengthThree
Type mismatch
  Vect.nil
has type
  Vect ?m.3 0
but is expected to have type
  Vect String 3
```
本例中 {anchorTerm Vect}`0` 与 {anchorTerm nilNotLengthThree}`3` 的不匹配，与任何其他类型不匹配所起的作用完全相同，尽管 {anchorTerm Vect}`0` 和 {anchorTerm nilNotLengthThree}`3` 本身并不是类型。
错误信息中的元变量可以忽略，因为它的存在表明 {anchorName otherEx}`Vect.nil` 可以具有任意元素类型。

索引族之所以称为类型的**族**（families），是因为不同的索引值会使不同的构造子可用。
在某种意义上，索引族本身并不是一个类型；它是一组相关类型的集合，选择索引值也就是从该集合中选出一个类型。
为 {anchorName Vect}`Vect` 选择索引 {anchorTerm otherEx}`5` 意味着只有构造子 {anchorName Vect}`cons` 可用，而选择索引 {anchorTerm Vect}`0` 意味着只有 {anchorName Vect}`nil` 可用。

如果索引尚不可知（例如因为它是变量），那么在它变得可知之前，任何构造子都不能使用。
把长度写成 {anchorName nilNotLengthN}`n` 时，既不能使用 {anchorName otherEx}`Vect.nil`，也不能使用 {anchorName consNotLengthN}`Vect.cons`，因为无法知道变量 {anchorName nilNotLengthN}`n` 究竟应对应匹配 {anchorTerm Vect}`0` 的 {anchorName Vect}`Nat`，还是对应 {anchorTerm Vect}`n + 1`：
```anchor nilNotLengthN
example : Vect String n := Vect.nil
```
```anchorError nilNotLengthN
Type mismatch
  Vect.nil
has type
  Vect ?m.2 0
but is expected to have type
  Vect String n
```
```anchor consNotLengthN
example : Vect String n := Vect.cons "Hello" (Vect.cons "world" Vect.nil)
```
```anchorError consNotLengthN
Type mismatch
  Vect.cons "Hello" (Vect.cons "world" Vect.nil)
has type
  Vect String (0 + 1 + 1)
but is expected to have type
  Vect String n
```

把列表长度作为类型的一部分，意味着类型变得更加有信息量。
例如，{anchorName replicateStart}`Vect.replicate` 是一个函数，用于创建包含给定值若干副本的 {anchorName replicateStart}`Vect`。
精确表达这一点的类型是：
```anchor replicateStart
def Vect.replicate (n : Nat) (x : α) : Vect α n := _
```
参数 {anchorName replicateStart}`n` 出现在结果的长度位置上。
与下划线占位符关联的消息描述了手头的任务：
```anchorError replicateStart
don't know how to synthesize placeholder
context:
α : Type u_1
n : Nat
x : α
⊢ Vect α n
```

在处理索引族时，只有当 Lean 能看出构造子的索引与期望类型中的索引匹配时，才能应用构造子。
然而，两个构造子的索引都不匹配 {anchorName replicateStart}`n`——{anchorName Vect}`nil` 匹配 {anchorName otherEx}`Nat.zero`，而 {anchorName Vect}`cons` 匹配 {anchorName otherEx}`Nat.succ`。
就像前面的类型错误示例一样，变量 {anchorName Vect}`n` 可能代表其中任一种，取决于向函数提供了哪个 {anchorName Vect}`Nat` 参数。
解决办法是使用模式匹配来考虑两种可能情形：
```anchor replicateMatchOne
def Vect.replicate (n : Nat) (x : α) : Vect α n :=
  match n with
  | 0 => _
  | k + 1 => _
```
由于 {anchorName replicateStart}`n` 出现在期望类型中，对 {anchorName replicateStart}`n` 做模式匹配会在 `match` 的两个分支中**细化**（refine）期望类型。
在第一个下划线处，期望类型已变为 {lit}`Vect α 0`：
```anchorError replicateMatchOne
don't know how to synthesize placeholder
context:
α : Type u_1
n : Nat
x : α
⊢ Vect α 0
```
在第二个下划线处，它已变为 {lit}`Vect α (k + 1)`：
```anchorError replicateMatchTwo
don't know how to synthesize placeholder
context:
α : Type u_1
n : Nat
x : α
k : Nat
⊢ Vect α (k + 1)
```
当模式匹配不仅发现值的结构，还细化程序的类型时，就称为**依赖模式匹配**（dependent pattern matching）。

细化后的类型使得可以应用构造子。
第一个下划线匹配 {anchorName otherEx}`Vect.nil`，第二个匹配 {anchorName consNotLengthN}`Vect.cons`：
```anchor replicateMatchFour
def Vect.replicate (n : Nat) (x : α) : Vect α n :=
  match n with
  | 0 => .nil
  | k + 1 => .cons _ _
```
{anchorName replicateMatchFour}`.cons` 下面的第一个下划线应具有类型 {anchorName replicateMatchFour}`α`。
有一个可用的 {anchorName replicateMatchFour}`α`，即 {anchorName replicateMatchFour}`x`：
```anchorError replicateMatchFour
don't know how to synthesize placeholder
context:
α : Type u_1
n : Nat
x : α
k : Nat
⊢ α
```
第二个下划线应是一个 {lit}`Vect α k`，可以通过对 {anchorName replicate}`replicate` 的递归调用来产生：
```anchorError replicateMatchFive
don't know how to synthesize placeholder
context:
α : Type u_1
n : Nat
x : α
k : Nat
⊢ Vect α k
```
以下是 {anchorName replicate}`replicate` 的最终定义：

```anchor replicate
def Vect.replicate (n : Nat) (x : α) : Vect α n :=
  match n with
  | 0 => .nil
  | k + 1 => .cons x (replicate k x)
```

除了在编写函数时提供帮助之外，{anchorName replicate}`Vect.replicate` 的有信息量的类型还允许客户端代码在不阅读源代码的情况下排除许多意料之外的函数。
列表版本的 {anchorName listReplicate}`replicate` 可能产生长度错误的列表：

```anchor listReplicate
def List.replicate (n : Nat) (x : α) : List α :=
  match n with
  | 0 => []
  | k + 1 => x :: x :: replicate k x
```
然而，对 {anchorName replicateOops}`Vect.replicate` 犯这种错误会导致类型错误：
```anchor replicateOops
def Vect.replicate (n : Nat) (x : α) : Vect α n :=
  match n with
  | 0 => .nil
  | k + 1 => .cons x (.cons x (replicate k x))
```
```anchorError replicateOops
Application type mismatch: The argument
  cons x (replicate k x)
has type
  Vect α (k + 1)
but is expected to have type
  Vect α k
in the application
  cons x (cons x (replicate k x))
```


函数 {anchorName otherEx}`List.zip` 通过把第一个列表的第 1 项与第二个列表的第 1 项配对、把第一个列表的第 2 项与第二个列表的第 2 项配对，依此类推，来组合两个列表。
{anchorName otherEx}`List.zip` 可用于把美国俄勒冈州三座最高峰与丹麦三座最高峰配对：
```anchorTerm zip1
["Mount Hood",
 "Mount Jefferson",
 "South Sister"].zip ["Møllehøj", "Yding Skovhøj", "Ejer Bavnehøj"]
```
结果是一个包含三对的列表：
```anchorTerm zip1
[("Mount Hood", "Møllehøj"),
 ("Mount Jefferson", "Yding Skovhøj"),
 ("South Sister", "Ejer Bavnehøj")]
```
当两个列表长度不同时，究竟该如何处理尚不太清楚。
与许多语言一样，Lean 选择忽略其中一个列表中多出来的条目。
例如，把俄勒冈州五座最高峰的高度与丹麦三座最高峰的高度组合，会得到三对。
特别地，
```anchorTerm zip2
[3428.8, 3201, 3158.5, 3075, 3064].zip [170.86, 170.77, 170.35]
```
求值为
```anchorTerm zip2
[(3428.8, 170.86), (3201, 170.77), (3158.5, 170.35)]
```

这种方法很方便，因为它总能返回答案，但当列表无意中长度不同时，就有丢弃数据的风险。
F# 采取了不同做法：它的 {fsharp}`List.zip` 版本在长度不匹配时会抛出异常，如下面的 {lit}`fsi` 会话所示：
```fsharp
> List.zip [3428.8; 3201.0; 3158.5; 3075.0; 3064.0] [170.86; 170.77; 170.35];;
```
```fsharpError
System.ArgumentException: The lists had different lengths.
list2 is 2 elements shorter than list1 (Parameter 'list2')
   at Microsoft.FSharp.Core.DetailedExceptions.invalidArgDifferentListLength[?](String arg1, String arg2, Int32 diff) in /builddir/build/BUILD/dotnet-v3.1.424-SDK/src/fsharp.3ef6f0b514198c0bfa6c2c09fefe41a740b024d5/src/fsharp/FSharp.Core/local.fs:line 24
   at Microsoft.FSharp.Primitives.Basics.List.zipToFreshConsTail[a,b](FSharpList`1 cons, FSharpList`1 xs1, FSharpList`1 xs2) in /builddir/build/BUILD/dotnet-v3.1.424-SDK/src/fsharp.3ef6f0b514198c0bfa6c2c09fefe41a740b024d5/src/fsharp/FSharp.Core/local.fs:line 918
   at Microsoft.FSharp.Primitives.Basics.List.zip[T1,T2](FSharpList`1 xs1, FSharpList`1 xs2) in /builddir/build/BUILD/dotnet-v3.1.424-SDK/src/fsharp.3ef6f0b514198c0bfa6c2c09fefe41a740b024d5/src/fsharp/FSharp.Core/local.fs:line 929
   at Microsoft.FSharp.Collections.ListModule.Zip[T1,T2](FSharpList`1 list1, FSharpList`1 list2) in /builddir/build/BUILD/dotnet-v3.1.424-SDK/src/fsharp.3ef6f0b514198c0bfa6c2c09fefe41a740b024d5/src/fsharp/FSharp.Core/list.fs:line 466
   at <StartupCode$FSI_0006>.$FSI_0006.main@()
Stopped due to error
```
这避免了意外丢弃信息，但让程序崩溃也有其自身的困难。
Lean 的等价做法会使用 {anchorName otherEx}`Option` 或 {anchorName otherEx}`Except` 单子，从而引入一种未必值得为此付出的负担。

:::paragraph
然而，使用 {anchorName Vect}`Vect`，可以编写一个类型要求两个参数长度相同的 {anchorName VectZip}`zip` 版本：

```anchor VectZip
def Vect.zip : Vect α n → Vect β n → Vect (α × β) n
  | .nil, .nil => .nil
  | .cons x xs, .cons y ys => .cons (x, y) (zip xs ys)
```

这个定义只为两种情形提供模式：要么两个参数都是 {anchorName otherEx}`Vect.nil`，要么两个参数都是 {anchorName consNotLengthN}`Vect.cons`，而 Lean 接受该定义，不会出现类似于为 {anchorName otherEx}`List` 写出类似定义时那样的「缺少情形」错误：
```anchor zipMissing
def List.zip : List α → List β → List (α × β)
  | [], [] => []
  | x :: xs, y :: ys => (x, y) :: zip xs ys
```
```anchorError zipMissing
Missing cases:
(List.cons _ _), []
[], (List.cons _ _)
```
:::

这是因为第一个模式中使用的构造子，{anchorName Vect}`nil` 或 {anchorName Vect}`cons`，会**细化**类型检查器关于长度 {anchorName VectZip}`n` 的知识。
当第一个模式是 {anchorName Vect}`nil` 时，类型检查器还能进一步确定长度为 {anchorTerm VectZipLen}`0`，因此第二个模式的唯一可能选择是 {anchorName Vect}`nil`。
类似地，当第一个模式是 {anchorName Vect}`cons` 时，类型检查器能确定长度为 {anchorTerm VectZipLen}`k+1`，其中 {anchorName VectZipLen}`k` 是某个 {anchorName VectZipLen}`Nat`，因此第二个模式的唯一可能选择是 {anchorName Vect}`cons`。
事实上，添加一个同时使用 {anchorName Vect}`nil` 和 {anchorName Vect}`cons` 的情形是类型错误，因为长度不匹配：
```anchor zipExtraCons
def Vect.zip : Vect α n → Vect β n → Vect (α × β) n
  | .nil, .nil => .nil
  | .nil, .cons y ys => .nil
  | .cons x xs, .cons y ys => .cons (x, y) (zip xs ys)
```
```anchorError zipExtraCons
Type mismatch
  Vect.cons y ys
has type
  Vect ?m.10 (?m.16 + 1)
but is expected to have type
  Vect β 0
```
把 {anchorName VectZipLen}`n` 变成显式参数，就能观察到这种长度细化：

```anchor VectZipLen
def Vect.zip : (n : Nat) → Vect α n → Vect β n → Vect (α × β) n
  | 0, .nil, .nil => .nil
  | k + 1, .cons x xs, .cons y ys => .cons (x, y) (zip k xs ys)
```

# 练习
%%%
tag := "indexed-families-exercises"
%%%


培养用依赖类型编程的感觉需要经验，本节练习非常重要。
对于每个练习，请边写边实验代码，试着看看类型检查器能抓住哪些错误、抓不住哪些错误。
这也是熟悉错误信息的好方法。

 * 再次确认 {anchorName VectZip}`Vect.zip` 在组合俄勒冈州三座最高峰与丹麦三座最高峰时能给出正确答案。
   由于 {anchorName Vect}`Vect` 没有像 {anchorName otherEx}`List` 那样的语法糖，先定义 {anchorTerm exerciseDefs}`oregonianPeaks : Vect String 3` 和 {anchorTerm exerciseDefs}`danishPeaks : Vect String 3` 会很有帮助。

 * 定义类型为 {anchorTerm exerciseDefs}`(α → β) → Vect α n → Vect β n` 的函数 {anchorName exerciseDefs}`Vect.map`。

 * 定义函数 {anchorName exerciseDefs}`Vect.zipWith`，它一次一个条目地把 {anchorName Vect}`Vect` 中的元素与某个函数组合起来。
   它的类型应为 {anchorTerm exerciseDefs}`(α → β → γ) → Vect α n → Vect β n → Vect γ n`。

 * 定义函数 {anchorName exerciseDefs}`Vect.unzip`，它把一个成对 {anchorName Vect}`Vect` 拆成一对 {anchorName Vect}`Vect`。
   它的类型应为 {anchorTerm exerciseDefs}`Vect (α × β) n → Vect α n × Vect β n`。

 * 定义函数 {anchorName exerciseDefs}`Vect.push`，它把一个条目添加到 {anchorName Vect}`Vect` 的**末尾**。
   它的类型应为 {anchorTerm exerciseDefs}`Vect α n → α → Vect α (n + 1)`，并且 {anchorTerm snocSnowy}`#eval Vect.push (.cons "snowy" .nil) "peaks"` 应求值为 {anchorInfo snocSnowy}`Vect.cons "snowy" (Vect.cons "peaks" (Vect.nil))`。

 * 定义函数 {anchorName exerciseDefs}`Vect.reverse`，它反转 {anchorName Vect}`Vect` 中条目的顺序。

 * 定义类型为 {anchorTerm exerciseDefs}`(n : Nat) → Vect α (k + n) → Vect α k` 的函数 {anchorName exerciseDefs}`Vect.drop`。
   通过检查 {anchorTerm ejerBavnehoej}`#eval danishPeaks.drop 2` 是否求值为 {anchorInfo ejerBavnehoej}`Vect.cons "Ejer Bavnehøj" (Vect.nil)` 来验证它是否有效。

 * 定义类型为 {anchorTerm take}`(n : Nat) → Vect α (k + n) → Vect α n` 的函数 {anchorName take}`Vect.take`，它返回 {anchorName Vect}`Vect` 的前 {anchorName take}`n` 个条目。
   在一个示例上检查它是否有效。