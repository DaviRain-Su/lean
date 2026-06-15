# 数据类型与模式匹配

结构体使多个独立的数据片段能够组合成一个连贯的整体，并由一个全新的类型表示。
像结构体这样把一组值组合在一起的类型称为**积类型**（product types）。
然而，许多领域概念无法自然地用结构体表示。
例如，一个应用可能需要跟踪用户权限，其中一些用户是文档所有者，一些可以编辑文档，而另一些只能阅读。
计算器有多种二元运算符，如加法、减法和乘法。
结构体无法提供一种简单的方式来编码多种选择。

类似地，虽然结构体是跟踪固定字段集的绝佳方式，但许多应用需要可能包含任意数量元素的数据。
大多数经典数据结构，例如树和列表，都具有递归结构：列表的尾部本身也是一个列表，二叉树的左右分支本身也是二叉树。
在前述计算器中，表达式本身的结构也是递归的。
例如，加法表达式中的加数本身可能是乘法表达式。

允许选择的类型称为**和类型**（sum types），可以包含自身实例的类型称为**递归数据类型**（recursive datatypes）。
递归和类型称为**归纳数据类型**（inductive datatypes），因为可以用数学归纳法来证明关于它们的命题。
在编程时，归纳数据类型通过模式匹配和递归函数来消费。

许多内建类型实际上都是标准库中的归纳数据类型。
例如，`{anchorName Bool}Bool` 就是一个归纳数据类型：

```anchor Bool
inductive Bool where
  | false : Bool
  | true : Bool
```

这个定义有两个主要部分。
第一行给出新类型 `{anchorName Bool}Bool` 的名字，其余每行描述一个构造子。
与结构体构造子一样，归纳数据类型的构造子只是被动的数据接收器和容器，而不是插入任意初始化和验证代码的地方。
与结构体不同，归纳数据类型可以有多个构造子。
这里有两个构造子 `{anchorName Bool}true` 和 `{anchorName Bool}false`，它们都不带任何参数。
就像结构体声明会将其名字放入以声明类型命名的命名空间一样，归纳数据类型会将其构造子的名字放入一个命名空间。
在 Lean 标准库中，`{anchorName BoolNames}true` 和 `{anchorName BoolNames}false` 被重新导出到这个命名空间之外，因此可以单独书写，而不必写成 `{anchorName BoolNames}Bool.true` 和 `{anchorName BoolNames}Bool.false`。

从数据建模的角度来看，归纳数据类型在许多与“密封抽象类”相同的场景中使用。
在 C# 或 Java 等语言中，一个人可能会这样定义 `{anchorName Bool}Bool`：

```CSharp
abstract class Bool {}
class True : Bool {}
class False : Bool {}
```

然而，这些表示的具体细节相当不同。
特别是，每个非抽象类都会创建一个新类型以及新的数据分配方式。
在面向对象的例子中，`{CSharp}True` 和 `{CSharp}False` 都是比 `{CSharp}Bool` 更具体的类型，而 Lean 的定义只引入了新类型 `{anchorName Bool}Bool`。

非负整数类型 `{anchorName Nat}Nat` 也是一个归纳数据类型：

```anchor Nat
inductive Nat where
  | zero : Nat
  | succ (n : Nat) : Nat
```

这里，`{anchorName NatNames}zero` 表示 0，而 `{anchorName NatNames}succ` 表示某个其他数的后继。
`{anchorName NatNames}succ` 声明中提到的 `{anchorName Nat}Nat` 正是正在定义的类型 `{anchorName Nat}Nat` 本身。
**后继**的意思是“比……大 1”，所以 5 的后继是 6，32,185 的后继是 32,186。
使用这个定义，`{anchorEvalStep four 1}4` 被表示为 `{anchorEvalStep four 0}Nat.succ (Nat.succ (Nat.succ (Nat.succ Nat.zero)))`。
这个定义几乎与 `{anchorName even}Bool` 的定义相同，只是名字略有不同。
唯一的真正区别是 `{anchorName NatNames}succ` 后面跟着 `{anchorTerm Nat}(n : Nat)`，它指定构造子 `{anchorName NatNames}succ` 接受一个名为 `{anchorName Nat}n` 的 `{anchorName Nat}Nat` 参数。
名字 `{anchorName NatNames}zero` 和 `{anchorName NatNames}succ` 位于以其类型命名的命名空间中，因此必须分别称为 `{anchorName NatNames}Nat.zero` 和 `{anchorName NatNames}Nat.succ`。

参数名如 `{anchorName Nat}n` 可能出现在 Lean 的错误信息中，以及编写数学证明时的反馈中。
Lean 还有一种按名提供参数的可选语法。
一般来说，参数名的选择不如结构体字段名的选择重要，因为它不构成 API 的很大一部分。

在 C# 或 Java 中，`{CSharp}Nat` 可以定义如下：

```CSharp
abstract class Nat {}
class Zero : Nat {}
class Succ : Nat {
    public Nat n;
    public Succ(Nat pred) {
        n = pred;
    }
}
```

与上面的 `{anchorName Bool}Bool` 例子一样，这比 Lean 等价物定义了更多的类型。
此外，这个例子凸显了 Lean 数据类型构造子更像抽象类的子类，而不像 C# 或 Java 中的构造子，因为这里的构造子包含了要执行的初始化代码。

和类型也类似于在 TypeScript 中使用字符串标签编码可辨识联合（discriminated unions）。
在 TypeScript 中，`{typescript}Nat` 可以定义如下：

```typescript
interface Zero {
    tag: "zero";
}

interface Succ {
    tag: "succ";
    predecessor: Nat;
}

type Nat = Zero | Succ;
```

与 C# 和 Java 一样，这种编码最终得到的类型比 Lean 多，因为 `{typescript}Zero` 和 `{typescript}Succ` 各自都是一个类型。
这也说明了 Lean 的构造子对应于 JavaScript 或 TypeScript 中包含标识内容标签的对象。

## 模式匹配

%%%
tag := "pattern-matching"
%%%

在许多语言中，消费这类数据的第一步是使用 `instance-of` 运算符检查收到的是哪个子类，然后读取该子类可用字段的值。
`instance-of` 检查决定运行哪段代码，确保该代码所需的数据可用，而字段本身提供数据。
在 Lean 中，这两个目的同时由**模式匹配**（pattern matching）实现。

一个使用模式匹配的函数例子是 `{anchorName isZero}isZero`，当参数是 `{anchorName isZero}Nat.zero` 时返回 `{anchorName isZero}true`，否则返回 false。

```anchor isZero
def isZero (n : Nat) : Bool :=
  match n with
  | Nat.zero => true
  | Nat.succ k => false
```

`{kw}match` 表达式被提供了函数参数 `{anchorName isZero}n` 用于解构。
如果 `{anchorName isZero}n` 是由 `{anchorName isZero}Nat.zero` 构造的，则采用模式匹配的第一个分支，结果是 `{anchorName isZero}true`。
如果 `{anchorName isZero}n` 是由 `{anchorName isZero}Nat.succ` 构造的，则采用第二个分支，结果是 `{anchorName isZero}false`。

`{anchorEvalStep isZeroZeroSteps 0}isZero Nat.zero` 的逐步求值如下：

```anchorEvalSteps  isZeroZeroSteps
isZero Nat.zero
===>
match Nat.zero with
| Nat.zero => true
| Nat.succ k => false
===>
true
```

`{anchorEvalStep isZeroFiveSteps 0}isZero 5` 的求值类似：

```anchorEvalSteps  isZeroFiveSteps
isZero 5
===>
isZero (Nat.succ (Nat.succ (Nat.succ (Nat.succ (Nat.succ Nat.zero)))))
===>
match Nat.succ (Nat.succ (Nat.succ (Nat.succ (Nat.succ Nat.zero)))) with
| Nat.zero => true
| Nat.succ k => false
===>
false
```

`isZero` 模式第二个分支中的 `{anchorName isZero}k` 并不是装饰性的。
它使作为 `{anchorName isZero}Nat.succ` 参数的那个 `{anchorName isZero}Nat` 变得可见，并使用了提供的名字。
然后可以用这个更小的数来计算表达式的最终结果。

正如某个数 $`n` 的后继是 $`n + 1`，一个数的前驱比它小 1。
如果 `{anchorName pred}pred` 是一个找出 `{anchorName pred}Nat` 前驱的函数，那么以下例子应该得到预期结果：

```anchor  predFive
#eval pred 5
```

```anchorInfo predFive
4
```

```anchor predBig
#eval pred 839
```

```anchorInfo predBig
838
```

因为 `{anchorName Nat}Nat` 不能表示负数，所以 `{anchorName NatNames}Nat.zero` 有点棘手。
通常，在使用 `{anchorName Nat}Nat` 时，那些通常会产生负数的运算符会被重新定义成返回 `{anchorName NatNames}zero` 本身：

```anchor predZero
#eval pred 0
```

```anchorInfo predZero
0
```

要找 `{anchorName pred}Nat` 的前驱，第一步是检查它是用哪个构造子创建的。
如果是 `{anchorName pred}Nat.zero`，结果就是 `{anchorName pred}Nat.zero`。
如果是 `{anchorName pred}Nat.succ`，则用名字 `{anchorName pred}k` 指代它下面的 `{anchorName plus}Nat`。
而这个 `{anchorName pred}Nat` 就是所求的前驱，所以 `{anchorName pred}Nat.succ` 分支的结果是 `{anchorName pred}k`。

```anchor pred
def pred (n : Nat) : Nat :=
  match n with
  | Nat.zero => Nat.zero
  | Nat.succ k => k
```

把这个函数应用到 `{anchorTerm predFiveSteps}5` 上，得到以下步骤：

```anchorEvalSteps  predFiveSteps
pred 5
===>
pred (Nat.succ 4)
===>
match Nat.succ 4 with
| Nat.zero => Nat.zero
| Nat.succ k => k
===>
4
```

模式匹配也可以用于结构体，以及和类型。
例如，从 `{anchorName depth}Point3D` 中提取第三维的函数可以写成：

```anchor depth
def depth (p : Point3D) : Float :=
  match p with
  | { x:= h, y := w, z := d } => d
```

在这种情况下，直接使用 `{anchorName fragments}Point3D.z` 访问器会简单得多，但结构体模式偶尔是编写函数的最简单方式。

## 递归函数

%%%
tag := "recursive-functions"
%%%

引用被定义名字的定义称为**递归定义**（recursive definitions）。
归纳数据类型允许是递归的；事实上，`{anchorName Nat}Nat` 就是这样的数据类型，因为 `{anchorName Nat}succ` 要求另一个 `{anchorName Nat}Nat`。
递归数据类型可以表示任意大的数据，仅受可用内存等技术因素限制。
就像不可能在数据类型定义中为每个自然数写一个构造子一样，也不可能为每种可能写一个模式匹配分支。

递归数据类型与递归函数相得益彰。
一个关于 `{anchorName even}Nat` 的简单递归函数检查其参数是否为偶数。
这里，`{anchorName even}Nat.zero` 是偶数。
像这样的非递归分支称为**基础情形**（base cases）。
奇数的后继是偶数，偶数的后继是奇数。
这意味着用 `{anchorName even}Nat.succ` 构造的数是偶数，当且仅当它的参数不是偶数。

```anchor even
def even (n : Nat) : Bool :=
  match n with
  | Nat.zero => true
  | Nat.succ k => not (even k)
```

这种思考模式是编写 `{anchorName even}Nat` 递归函数的典型方式。
首先，确定对 `{anchorName even}Nat.zero` 做什么。
然后，确定如何把任意 `{anchorName even}Nat` 的结果转化为它的后继的结果，并将这个变换应用于递归调用的结果。
这种模式称为**结构递归**（structural recursion）。

与许多语言不同，Lean 默认确保每个递归函数最终都会到达基础情形。
从编程角度看，这排除了意外的无限循环。
但在证明定理时，这个特性尤为重要，因为无限循环会造成重大困难。
其结果是，Lean 不会接受试图在原始数字上递归调用自己的 `{anchorName even}even` 版本：

```anchor evenLoops
def evenLoops (n : Nat) : Bool :=
  match n with
  | Nat.zero => true
  | Nat.succ k => not (evenLoops n)
```

错误信息的关键部分是，Lean 无法确定该递归函数总是到达基础情形（因为它确实不会）。

```anchorError evenLoops
fail to show termination for
  evenLoops
with errors
failed to infer structural recursion:
Not considering parameter n of evenLoops:
  it is unchanged in the recursive calls
no parameters suitable for structural recursion

well-founded recursion cannot be used, `evenLoops` does not take any (non-fixed) arguments
```

即使加法接受两个参数，也只需要检查其中一个。
要把零加到数 $`n` 上，只需返回 $`n`。
要把 $`k` 的后继加到 $`n` 上，返回把 $`k` 加到 $`n` 上的结果的后继。

```anchor plus
def plus (n : Nat) (k : Nat) : Nat :=
  match k with
  | Nat.zero => n
  | Nat.succ k' => Nat.succ (plus n k')
```

在 `{anchorName plus}plus` 的定义中，名字 `{anchorName plus}k'` 的选择表示它与参数 `{anchorName plus}k` 相关但不相同。
例如，逐步求值 `{anchorEvalStep plusThreeTwo 0}plus 3 2` 得到以下步骤：

```anchorEvalSteps  plusThreeTwo
plus 3 2
===>
plus 3 (Nat.succ (Nat.succ Nat.zero))
===>
match Nat.succ (Nat.succ Nat.zero) with
| Nat.zero => 3
| Nat.succ k' => Nat.succ (plus 3 k')
===>
Nat.succ (plus 3 (Nat.succ Nat.zero))
===>
Nat.succ (match Nat.succ Nat.zero with
| Nat.zero => 3
| Nat.succ k' => Nat.succ (plus 3 k'))
===>
Nat.succ (Nat.succ (plus 3 Nat.zero))
===>
Nat.succ (Nat.succ (match Nat.zero with
| Nat.zero => 3
| Nat.succ k' => Nat.succ (plus 3 k')))
===>
Nat.succ (Nat.succ 3)
===>
5
```

一种理解加法的方式是：$`n + k` 把 `{anchorName times}Nat.succ` 应用 $`k` 次到 $`n` 上。
类似地，乘法 $`n × k` 把 $`n` 加 $`k` 次到自己上，减法 $`n - k` 把 $`n` 取前驱 $`k` 次。

```anchor times
def times (n : Nat) (k : Nat) : Nat :=
  match k with
  | Nat.zero => Nat.zero
  | Nat.succ k' => plus n (times n k')
```

```anchor minus
def minus (n : Nat) (k : Nat) : Nat :=
  match k with
  | Nat.zero => n
  | Nat.succ k' => pred (minus n k')
```

并非每个函数都能容易地用结构递归编写。
把加法理解为迭代 `{anchorName plus}Nat.succ`、乘法理解为迭代加法、减法理解为迭代前驱，这提示我们可以把除法实现为迭代减法。
在这种情况下，如果分子小于除数，结果为零；否则，结果是分子减除数后再除以除数的商的后继。

```anchor div
def div (n : Nat) (k : Nat) : Nat :=
  if n < k then
    0
  else Nat.succ (div (n - k) k)
```

只要第二个参数不是 `{anchorTerm div}0`，这个程序就会终止，因为它总是朝着基础情形取得进展。
然而，它不是结构递归的，因为它不遵循“为零找结果，然后把较小 `{anchorName div}Nat` 的结果转化为它的后继的结果”的模式。
特别是，函数的递归调用应用于另一个函数调用的结果，而不是输入构造子的参数。
因此，Lean 用以下信息拒绝它：

```anchorError div
fail to show termination for
  div
with errors
failed to infer structural recursion:
Not considering parameter k of div:
  it is unchanged in the recursive calls
Cannot use parameter k:
  failed to eliminate recursive application
    div (n - k) k


failed to prove termination, possible solutions:
  - Use `have`-expressions to prove the remaining goals
  - Use `termination_by` to specify a different well-founded relation
  - Use `decreasing_by` to specify your own tactic for discharging this kind of goal
k n : Nat
h✝ : ¬n < k
⊢ n - k < n
```

这条信息意味着 `{anchorName div}div` 需要手动的终止性证明。
这个主题在 {ref "division-as-iterated-subtraction"}[最后一章] 中探讨。
