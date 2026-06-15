# 常见陷阱

%%%
tag := "dependent-type-pitfalls"
%%%

依赖类型的灵活性使类型检查器能接受更多有用的程序，因为类型语言足够富有表现力，能够描述表达能力较弱的类型系统无法描述的变体。
与此同时，依赖类型表达非常细粒度规约的能力，也使类型检查器能拒绝更多有 bug 的程序。
这种能力是有代价的。

像 {anchorName Row (module:=Examples.DependentTypes.DB)}`Row` 这样返回类型的函数，其内部实现与所产生的类型之间紧密耦合，这体现了一个更大的困难：当函数被用在类型中时，函数接口与实现之间的区分开始瓦解。
通常，只要不改变函数的类型签名或输入输出行为，所有重构都是有效的。
函数可以改写为使用更高效的算法和数据结构，可以修复 bug，可以提高代码清晰度，而不会破坏客户端代码。
然而，当函数被用在类型中时，函数实现的内部就成了类型的一部分，从而成为另一个程序的 _接口_ 的一部分。

举个例子，来看 {anchorName plusL}`Nat` 上加法的以下两种实现。
{anchorName plusL}`Nat.plusL` 对其第一个参数递归：

```anchor plusL
def Nat.plusL : Nat → Nat → Nat
  | 0, k => k
  | n + 1, k => plusL n k + 1
```
另一方面，{anchorName plusR}`Nat.plusR` 对其第二个参数递归：

```anchor plusR
def Nat.plusR : Nat → Nat → Nat
  | n, 0 => n
  | n, k + 1 => plusR n k + 1
```
两种加法实现都忠实于底层的数学概念，因此在给定相同参数时会返回相同结果。

然而，当它们被用在类型中时，这两种实现呈现出相当不同的接口。
举个例子，考虑一个拼接两个 {anchorName appendL}`Vect` 的函数。
该函数应返回一个 {anchorName appendL}`Vect`，其长度等于两个参数长度之和。
由于 {anchorName appendL}`Vect` 本质上是一个类型信息更丰富的 {anchorName moreNames}`List`，按 {anchorName moreNames}`List.append` 的方式编写这个函数是合理的，即对第一个参数进行模式匹配和递归。
从类型签名和对占位符的初始模式匹配开始，会产生两条消息：
```anchor appendL1
def appendL : Vect α n → Vect α k → Vect α (n.plusL k)
  | .nil, ys => _
  | .cons x xs, ys => _
```
第一条消息，在 {anchorName moreNames}`nil` 情形下，说明占位符应替换为长度为 {lit}`plusL 0 k` 的 {anchorName appendL}`Vect`：
```anchorError appendL1
don't know how to synthesize placeholder
context:
α : Type u_1
n k : Nat
ys : Vect α k
⊢ Vect α (Nat.plusL 0 k)
```
第二条消息，在 {anchorName moreNames}`cons` 情形下，说明占位符应替换为长度为 {lit}`plusL (n✝ + 1) k` 的 {anchorName appendL}`Vect`：
```anchorError appendL2
don't know how to synthesize placeholder
context:
α : Type u_1
n k n✝ : Nat
x : α
xs : Vect α n✝
ys : Vect α k
⊢ Vect α ((n✝ + 1).plusL k)
```
{lit}`n` 后面的符号称为 _dagger（匕首记号）_，用于表示 Lean 在内部发明的名称。
在幕后，对第一个 {anchorName appendL1}`Vect` 进行模式匹配，也隐式地细化了第一个 {anchorName plusL}`Nat` 的值，因为构造子 {anchorName moreNames}`cons` 上的索引是 {anchorTerm Vect (module:=Examples.DependentTypes)}`n + 1`，而 {anchorName appendL}`Vect` 的尾部长度为 {anchorTerm Vect (module:=Examples.DependentTypes)}`n`。
这里，{lit}`n✝` 表示比参数 {anchorName appendL1}`n` 小 1 的 {anchorName moreNames}`Nat`。

# 定义相等性

%%%
tag := "definitional-equality"
%%%

在 {anchorName appendL3}`plusL` 的定义中，有一个模式分支 {anchorTerm plusL}`0, k => k`。
它适用于第一个占位符所用的长度，因此另一种写法是把下划线处的类型 {anchorTerm moreNames}`Vect α (Nat.plusL 0 k)` 写成 {anchorTerm moreNames}`Vect α k`。
类似地，{anchorName plusL}`plusL` 包含模式分支 {anchorTerm plusL}`n + 1, k => plusL n k + 1`。
这意味着第二个下划线处的类型也可以等价地写成 {lit}`Vect α (plusL n✝ k + 1)`。

为了揭示幕后发生的事情，第一步是显式写出 {anchorName plusL}`Nat` 参数，这也会产生没有匕首记号的错误消息，因为名称现在显式写在程序中了：
```anchor appendL3
def appendL : (n k : Nat) → Vect α n → Vect α k → Vect α (n.plusL k)
  | 0, k, .nil, ys => _
  | n + 1, k, .cons x xs, ys => _
```
```anchorError appendL3
don't know how to synthesize placeholder
context:
α : Type u_1
k : Nat
ys : Vect α k
⊢ Vect α (Nat.plusL 0 k)
```
```anchorError appendL4
don't know how to synthesize placeholder
context:
α : Type u_1
n k : Nat
x : α
xs : Vect α n
ys : Vect α k
⊢ Vect α ((n + 1).plusL k)
```
用简化后的类型标注下划线不会引入类型错误，这意味着程序中写出的类型与 Lean 自己找到的类型是等价的：
```anchor appendL5
def appendL : (n k : Nat) → Vect α n → Vect α k → Vect α (n.plusL k)
  | 0, k, .nil, ys => (_ : Vect α k)
  | n + 1, k, .cons x xs, ys => (_ : Vect α (n.plusL k + 1))
```
```anchorError appendL5
don't know how to synthesize placeholder
context:
α : Type u_1
k : Nat
ys : Vect α k
⊢ Vect α k
```
```anchorError appendL6
don't know how to synthesize placeholder
context:
α : Type u_1
n k : Nat
x : α
xs : Vect α n
ys : Vect α k
⊢ Vect α (n.plusL k + 1)
```

第一种情形要求一个 {anchorTerm appendL5}`Vect α k`，而 {anchorName appendL5}`ys` 具有该类型。
这与把空列表拼接到任何其他列表上都会返回那个其他列表的方式是平行的。
用 {anchorName appendL7}`ys` 替换第一个下划线来细化定义，会得到一个只剩一个下划线待填写的程序：
```anchor appendL7
def appendL : (n k : Nat) → Vect α n → Vect α k → Vect α (n.plusL k)
  | 0, k, .nil, ys => ys
  | n + 1, k, .cons x xs, ys => (_ : Vect α (n.plusL k + 1))
```
```anchorError appendL7
don't know how to synthesize placeholder
context:
α : Type u_1
n k : Nat
x : α
xs : Vect α n
ys : Vect α k
⊢ Vect α (n.plusL k + 1)
```

这里发生了非常重要的事情。
在 Lean 期望 {anchorTerm moreNames}`Vect α (Nat.plusL 0 k)` 的上下文中，它收到了 {anchorTerm moreNames}`Vect α k`。
然而，{anchorName plusL}`Nat.plusL` 不是 {kw}`abbrev`，因此看起来它似乎不应该在类型检查期间运行。
另有他事正在发生。

理解这一切的关键在于，Lean 在类型检查期间不仅仅展开 {kw}`abbrev`。
它还可以在检查两个类型是否彼此等价时进行计算，使得一种类型的任何表达式都可以用在期望另一种类型的上下文中。
这一性质称为 {deftech}_定义相等性（definitional equality）_，它很微妙。

当然，写法完全相同的两种类型被视为定义相等的——{anchorName moreNames}`Nat` 与 {anchorName moreNames}`Nat`，或 {anchorTerm moreNames}`List String` 与 {anchorTerm moreNames}`List String`，都应被视为相等。
由不同数据类型构造的任何两个具体类型都不相等，因此 {anchorTerm moreNames}`List Nat` 不等于 {anchorName moreNames}`Int`。
此外，仅因内部名称重命名而不同的类型是相等的，因此 {anchorTerm moreNames}`(n : Nat) → Vect String n` 与 {anchorTerm moreNames}`(k : Nat) → Vect String k` 相同。
由于类型可以包含普通数据，定义相等性也必须描述数据何时相等。
相同构造子的使用是相等的，因此 {anchorTerm moreNames}`0` 等于 {anchorTerm moreNames}`0`，{anchorTerm moreNames}`[5, 3, 1]` 等于 {anchorTerm moreNames}`[5, 3, 1]`。

然而，类型不仅仅包含函数箭头、数据类型和构造子。
它们还包含 _变量_ 和 _函数_。
变量的定义相等性相对简单：每个变量只等于它自身，因此 {anchorTerm moreNames}`(n k : Nat) → Vect Int n` 与 {anchorTerm moreNames}`(n k : Nat) → Vect Int k` 在定义上不相等。
另一方面，函数更复杂。
虽然数学上认为两个函数在输入输出行为完全相同时相等，但没有高效算法来检查这一点，而定义相等性的全部意义就在于让 Lean 检查两种类型是否可以互换。
相反，Lean 认为函数在以下情况下定义相等：它们都是具有定义相等函数体的 {kw}`fun` 表达式。
换句话说，两个函数必须使用 _相同的算法_，调用 _相同的辅助函数_，才被视为定义相等。
这通常不太有用，因此函数的定义相等性主要在两种类型中出现完全相同的已定义函数时使用。

当函数在类型中被 _调用_ 时，检查定义相等性可能涉及化简函数调用。
类型 {anchorTerm moreNames}`Vect String (1 + 4)` 与类型 {anchorTerm moreNames}`Vect String (3 + 2)` 定义相等，因为 {anchorTerm moreNames}`1 + 4` 与 {anchorTerm moreNames}`3 + 2` 定义相等。
为了检查它们的相等性，两者都化简为 {anchorTerm moreNames}`5`，然后可以使用构造子规则五次。
可以先检查应用于数据的函数的定义相等性，看它们是否已经相同——毕竟，没有必要把 {anchorTerm moreNames}`["a", "b"] ++ ["c"]` 化简来检查它是否等于 {anchorTerm moreNames}`["a", "b"] ++ ["c"]`。
如果不是，就调用函数并用其值替换，然后可以检查该值。

并非所有函数参数都是具体数据。
例如，类型中可能包含并非由 {anchorName moreNames}`zero` 和 {anchorName moreNames}`succ` 构造子构造的 {anchorName moreNames}`Nat`。
在类型 {anchorTerm moreFun}`(n : Nat) → Vect String n` 中，变量 {anchorName moreFun}`n` 是 {anchorName moreFun}`Nat`，但在函数被调用之前，不可能知道它究竟是 _哪个_ {anchorName moreFun}`Nat`。
事实上，函数可能先以 {anchorTerm moreNames}`0` 调用，再以 {anchorTerm moreNames}`17` 调用，再以 {anchorTerm moreNames}`33` 调用。
正如 {anchorName appendL}`appendL` 的定义中所见，类型为 {anchorName moreFun}`Nat` 的变量也可能被传给像 {anchorName appendL}`plusL` 这样的函数。
事实上，类型 {anchorTerm moreFun}`(n : Nat) → Vect String n` 与类型 {anchorTerm moreNames}`(n : Nat) → Vect String (Nat.plusL 0 n)` 定义相等。

{anchorName againFun}`n` 与 {anchorTerm againFun}`Nat.plusL 0 n` 定义相等的原因是，{anchorName plusL}`plusL` 的模式匹配检查其 _第一个_ 参数。
这有问题：{anchorTerm moreFun}`(n : Nat) → Vect String n` _不_ 与 {anchorTerm stuckFun}`(n : Nat) → Vect String (Nat.plusL n 0)` 定义相等，尽管零应该是加法的左单位和右单位。
这是因为模式匹配遇到变量时会卡住。
在 {anchorName stuckFun}`n` 的实际值变得已知之前，没有办法知道应选择 {anchorTerm stuckFun}`Nat.plusL n 0` 的哪个分支。

查询示例中的 {anchorName Row (module:=Examples.DependentTypes.DB)}`Row` 函数也出现了同样的问题。
类型 {anchorTerm RowStuck (module:=Examples.DependentTypes.DB)}`Row (c :: cs)` 不会化简为任何数据类型，因为 {anchorName RowStuck (module:=Examples.DependentTypes.DB)}`Row` 的定义对单元素列表和至少有两个元素的列表有单独的分支。
换句话说，当试图把变量 {anchorName RowStuck (module:=Examples.DependentTypes.DB)}`cs` 与具体的 {anchorName moreNames}`List` 构造子匹配时，它会卡住。
这就是为什么几乎每个拆解或构造 {anchorName RowStuck (module:=Examples.DependentTypes.DB)}`Row` 的函数，都需要匹配与 {anchorName RowStuck (module:=Examples.DependentTypes.DB)}`Row` 本身相同的三种情形：让它不再卡住，才能揭示可用于模式匹配或构造子的具体类型。

{anchorName appendL8}`appendL` 中缺失的情形需要一个 {lit}`Vect α (Nat.plusL n k + 1)`。
索引中的 {lit}`+ 1` 表明下一步应使用 {anchorName consNotLengthN (module:=Examples.DependentTypes)}`Vect.cons`：
```anchor appendL8
def appendL : (n k : Nat) → Vect α n → Vect α k → Vect α (n.plusL k)
  | 0, k, .nil, ys => ys
  | n + 1, k, .cons x xs, ys => .cons x (_ : Vect α (n.plusL k))
```
```anchorError appendL8
don't know how to synthesize placeholder
context:
α : Type u_1
n k : Nat
x : α
xs : Vect α n
ys : Vect α k
⊢ Vect α (n.plusL k)
```
对 {anchorName appendL9}`appendL` 的递归调用可以构造出具有所需长度的 {anchorName appendL9}`Vect`：

```anchor appendL9
def appendL : (n k : Nat) → Vect α n → Vect α k → Vect α (n.plusL k)
  | 0, k, .nil, ys => ys
  | n + 1, k, .cons x xs, ys => .cons x (appendL n k xs ys)
```
现在程序已经完成，去掉对 {anchorName appendL9}`n` 和 {anchorName appendL9}`k` 的显式匹配，会使它更易读，也更容易调用该函数：

```anchor appendL
def appendL : Vect α n → Vect α k → Vect α (n.plusL k)
  | .nil, ys => ys
  | .cons x xs, ys => .cons x (appendL xs ys)
```

使用定义相等性来比较类型，意味着定义相等性所涉及的一切——包括函数定义的内部——都成了使用依赖类型和索引族的程序的 _接口_ 的一部分。
在类型中暴露函数的内部，意味着重构被暴露的程序可能导致使用它的程序不再能通过类型检查。
具体而言，{anchorName appendL}`plusL` 被用在 {anchorName appendL}`appendL` 的类型中，这意味着 {anchorName appendL}`plusL` 的定义不能被替换为否则等价的 {anchorName plusR}`plusR`。

# 加法卡住

%%%
tag := "stuck-addition"
%%%

如果用 {anchorName appendR}`plusR` 而不是 {anchorName plusL}`plusL` 来定义 append，会发生什么？
以同样的方式开始，在各情形中使用显式长度和占位下划线，会揭示以下有用的错误消息：
```anchor appendR1
def appendR : (n k : Nat) → Vect α n → Vect α k → Vect α (n.plusR k)
  | 0, k, .nil, ys => _
  | n + 1, k, .cons x xs, ys => _
```
```anchorError appendR1
don't know how to synthesize placeholder
context:
α : Type u_1
k : Nat
ys : Vect α k
⊢ Vect α (Nat.plusR 0 k)
```
```anchorError appendR2
don't know how to synthesize placeholder
context:
α : Type u_1
n k : Nat
x : α
xs : Vect α n
ys : Vect α k
⊢ Vect α ((n + 1).plusR k)
```
然而，试图在第一个占位符周围放置 {anchorTerm appendR3}`Vect α k` 类型标注，会导致类型不匹配错误：
```anchor appendR3
def appendR : (n k : Nat) → Vect α n → Vect α k → Vect α (n.plusR k)
  | 0, k, .nil, ys => (_ : Vect α k)
  | n + 1, k, .cons x xs, ys => _
```
```anchorError appendR3
Type mismatch
  ?m.11
has type
  Vect α k
but is expected to have type
  Vect α (Nat.plusR 0 k)
```
这条错误指出 {anchorTerm plusRinfo}`Nat.plusR 0 k` 与 {anchorName plusRinfo}`k` _不_ 定义相等。

:::paragraph
这是因为 {anchorName plusR}`plusR` 有如下定义：

```anchor plusR
def Nat.plusR : Nat → Nat → Nat
  | n, 0 => n
  | n, k + 1 => plusR n k + 1
```
它的模式匹配发生在 _第二个_ 参数上，而不是第一个参数上，这意味着该位置上变量 {anchorName plusRinfo}`k` 的存在阻止了它化简。
Lean 标准库中的 {anchorName plusRinfo}`Nat.add` 等价于 {anchorName plusRinfo}`plusR`，而不是 {anchorName plusRinfo}`plusL`，因此试图在这个定义中使用它，会产生完全相同的困难：
```anchor appendR4
def appendR : (n k : Nat) → Vect α n → Vect α k → Vect α (n + k)
  | 0, k, .nil, ys => (_ : Vect α k)
  | n + 1, k, .cons x xs, ys => _
```
```anchorError appendR4
Type mismatch
  ?m.15
has type
  Vect α k
but is expected to have type
  Vect α (0 + k)
```

加法在变量上 _卡住_ 了。
让它不再卡住需要 {ref "equality-and-ordering"}[命题相等性]。
:::

# 命题相等性

%%%
tag := "propositional-equality"
%%%

命题相等性是数学陈述，说明两个表达式相等。
定义相等性是一种 Lean 在需要时自动检查的环境事实，而命题相等性的陈述则需要显式证明。
一旦证明了相等命题，就可以在程序中使用它来修改类型，把等式的一边替换为另一边，从而让类型检查器不再卡住。

定义相等性之所以如此受限，是为了让它能被算法检查。
命题相等性丰富得多，但计算机通常无法检查两个表达式是否在命题上相等，不过它可以验证一个声称的证明是否确实是证明。
定义相等性与命题相等性之间的分工，代表了人与机器之间的劳动分工：最乏味的相等性作为定义相等性的一部分自动检查，解放人的心智去处理命题相等性中更有趣的问题。
类似地，定义相等性由类型检查器自动调用，而命题相等性必须被专门援引。


在 {ref "props-proofs-indexing"}[命题、证明与索引] 中，一些相等性陈述使用 {tactic}`decide` 来证明。
这些相等性陈述都是命题相等性实际上已经是定义相等性的那些。
通常，命题相等性的陈述是先把它化成要么是定义相等、要么足够接近已有证明相等性的形式，然后使用 {tactic}`decide` 或 {tactic}`simp` 等工具处理简化后的情形。
{tactic}`simp` 策略相当强大：在幕后，它使用许多快速自动化工具来构造证明。
一个更简单的策略 {kw}`rfl` 专门使用定义相等性来证明命题相等性。
名称 {kw}`rfl` 是 _reflexivity_（自反性）的缩写，即相等性的性质：一切都等于它自身。

让 {anchorName appendR}`appendR` 不再卡住，需要证明 {anchorTerm plusR_zero_left1}`k = Nat.plusR 0 k`，这不是定义相等性，因为 {anchorName plusR}`plusR` 在其第二个参数上的变量处卡住了。
要让它计算，{anchorName plusR_zero_left1}`k` 必须变成具体构造子。
这是模式匹配的工作。

:::paragraph
具体而言，因为 {anchorName plusR_zero_left1}`k` 可以是 _任意_ {anchorName plusR_zero_left1}`Nat`，这项任务需要一个函数，能为 _任意_ {anchorName plusR_zero_left1}`k` 返回 {anchorTerm plusR_zero_left1}`k = Nat.plusR 0 k` 的证据。
这应该是一个返回相等性证明的函数，类型为 {anchorTerm plusR_zero_left1}`(k : Nat) → k = Nat.plusR 0 k`。
用初始模式和占位符开始，会产生以下消息：
```anchor plusR_zero_left1
def plusR_zero_left : (k : Nat) → k = Nat.plusR 0 k
  | 0 => _
  | k + 1 => _
```
```anchorError plusR_zero_left1
don't know how to synthesize placeholder
context:
⊢ 0 = Nat.plusR 0 0
```
```anchorError plusR_zero_left2
don't know how to synthesize placeholder
context:
k : Nat
⊢ k + 1 = Nat.plusR 0 (k + 1)
```
通过模式匹配把 {anchorName plusR_zero_left1}`k` 细化为 {anchorTerm plusR_zero_left1}`0` 后，第一个占位符代表一个定义上确实成立的陈述的证据。
{kw}`rfl` 策略可以处理它，只留下第二个占位符：
```anchor plusR_zero_left3
def plusR_zero_left : (k : Nat) → k = Nat.plusR 0 k
  | 0 => by rfl
  | k + 1 => _
```
:::

第二个占位符有点棘手。
表达式 {anchorTerm plusRStep}`Nat.plusR 0 k + 1` 与 {anchorTerm plusRStep}`Nat.plusR 0 (k + 1)` 定义相等。
这意味着目标也可以写成 {anchorTerm plusR_zero_left4}`k + 1 = Nat.plusR 0 k + 1`：
```anchor plusR_zero_left4
def plusR_zero_left : (k : Nat) → k = Nat.plusR 0 k
  | 0 => by rfl
  | k + 1 => (_ : k + 1 = Nat.plusR 0 k + 1)
```
```anchorError plusR_zero_left4
don't know how to synthesize placeholder
context:
k : Nat
⊢ k + 1 = Nat.plusR 0 k + 1
```

:::paragraph
在相等陈述两边的 {anchorTerm plusR_zero_left4}`+ 1` 之下，是函数自身返回内容的另一个实例。
换句话说，对 {anchorName plusR_zero_left4}`k` 的递归调用会返回 {anchorTerm plusR_zero_left4}`k = Nat.plusR 0 k` 的证据。
相等性若不是相等性，就不能应用于函数参数。
换句话说，如果 {anchorTerm congr}`x = y`，那么 {anchorTerm congr}`f x = f y`。
标准库包含函数 {anchorName congr}`congrArg`，它接受一个函数和一个相等性证明，返回函数已应用于相等式两边的新证明。
在这种情况下，函数是 {anchorTerm plusR_zero_left_done}`(· + 1)`：

```anchor plusR_zero_left_done
def plusR_zero_left : (k : Nat) → k = Nat.plusR 0 k
  | 0 => by rfl
  | k + 1 =>
    congrArg (· + 1) (plusR_zero_left k)
```
:::

:::paragraph
因为这实际上是一个命题的证明，它应该声明为 {kw}`theorem`：

```anchor plusR_zero_left_thm
theorem plusR_zero_left : (k : Nat) → k = Nat.plusR 0 k
  | 0 => by rfl
  | k + 1 =>
    congrArg (· + 1) (plusR_zero_left k)
```
:::

命题相等性可以在程序中使用右向三角运算符 {anchorTerm appendRsubst}`▸` 来部署。
以其第一个参数为相等性证明、第二个参数为其他表达式时，该运算符会在第二个参数的类型中，把相等式一边的实例替换为另一边。
换句话说，以下定义不包含类型错误：
```anchor appendRsubst
def appendR : (n k : Nat) → Vect α n → Vect α k → Vect α (n.plusR k)
  | 0, k, .nil, ys => plusR_zero_left k ▸ (_ : Vect α k)
  | n + 1, k, .cons x xs, ys => _
```
第一个占位符具有预期类型：
```anchorError appendRsubst
don't know how to synthesize placeholder
context:
α : Type u_1
k : Nat
ys : Vect α k
⊢ Vect α k
```
现在可以用 {anchorName appendR5}`ys` 来填写：
```anchor appendR5
def appendR : (n k : Nat) → Vect α n → Vect α k → Vect α (n.plusR k)
  | 0, k, .nil, ys => plusR_zero_left k ▸ ys
  | n + 1, k, .cons x xs, ys => _
```

填写剩余占位符需要让另一个加法实例不再卡住：
```anchorError appendR5
don't know how to synthesize placeholder
context:
α : Type u_1
n k : Nat
x : α
xs : Vect α n
ys : Vect α k
⊢ Vect α ((n + 1).plusR k)
```
这里，要证明的陈述是 {anchorTerm plusR_succ_left}`Nat.plusR (n + 1) k = Nat.plusR n k + 1`，它可以与 {anchorTerm appendRsubst}`▸` 一起使用，把 {anchorTerm appendRsubst}`+ 1` 提到表达式顶部，使其与 {anchorName Vect}`cons` 的索引匹配。

证明是一个递归函数，对 {anchorName appendR}`plusR` 的第二个参数，即 {anchorName appendR5}`k` 进行模式匹配。
这是因为 {anchorName appendR5}`plusR` 本身对其第二个参数进行模式匹配，因此证明可以通过模式匹配让它“不再卡住”，暴露计算行为。
证明的骨架与 {anchorName appendR}`plusR_zero_left` 的非常相似：
```anchor plusR_succ_left_0
theorem plusR_succ_left (n : Nat) :
    (k : Nat) → Nat.plusR (n + 1) k = Nat.plusR n k + 1
  | 0 => by rfl
  | k + 1 => _
```

剩余情形的类型与 {anchorTerm congr}`Nat.plusR (n + 1) k + 1 = Nat.plusR n (k + 1) + 1` 定义相等，因此可以像 {anchorName plusR_zero_left_thm}`plusR_zero_left` 中那样用 {anchorName congr}`congrArg` 解决：
```anchorError plusR_succ_left_2
don't know how to synthesize placeholder
context:
n k : Nat
⊢ (n + 1).plusR (k + 1) = n.plusR (k + 1) + 1
```
这产生了一个完成的证明：

```anchor plusR_succ_left
theorem plusR_succ_left (n : Nat) :
    (k : Nat) → Nat.plusR (n + 1) k = Nat.plusR n k + 1
  | 0 => by rfl
  | k + 1 => congrArg (· + 1) (plusR_succ_left n k)
```

完成的证明可以用来让 {anchorName appendR}`appendR` 的第二种情形不再卡住：

```anchor appendR
def appendR : (n k : Nat) → Vect α n → Vect α k → Vect α (n.plusR k)
  | 0, k, .nil, ys =>
    plusR_zero_left k ▸ ys
  | n + 1, k, .cons x xs, ys =>
    plusR_succ_left n k ▸ .cons x (appendR n k xs ys)
```
再次把 {anchorName appendR}`appendR` 的长度参数隐式化时，它们不再显式命名以供证明援引。
然而，Lean 的类型检查器有足够的信息在幕后自动填写它们，因为没有其他值能让类型匹配：

```anchor appendRImpl
def appendR : Vect α n → Vect α k → Vect α (n.plusR k)
  | .nil, ys => plusR_zero_left _ ▸ ys
  | .cons x xs, ys => plusR_succ_left _ _ ▸ .cons x (appendR xs ys)
```

# 利弊

%%%
tag := "dependent-types-pros-and-cons"
%%%

索引族有一个重要性质：对它们进行模式匹配会影响定义相等性。
例如，在对 {anchorTerm Vect}`Vect` 的 {kw}`match` 表达式中的 {anchorName Vect}`nil` 情形，长度简单地 _变成_ {anchorTerm moreNames}`0`。
定义相等性可能非常方便，因为它始终处于活动状态，不需要显式调用。

然而，将定义相等性与依赖类型和模式匹配一起使用，在软件工程上有严重的缺点。
首先，函数必须专门编写以便用在类型中，而方便用在类型中的函数可能不使用最高效的算法。
一旦函数通过在类型中使用而被暴露，其实现就成了接口的一部分，导致未来重构困难。
其次，定义相等性可能很慢。
当被要求检查两个表达式是否定义相等时，如果相关函数复杂且有许多抽象层，Lean 可能需要运行大量代码。
第三，由定义相等性失败导致的错误消息并不总是很容易理解，因为它们可能用函数的内部来表述。
并不总是容易理解错误消息中表达式的来源。
最后，用一组索引族和依赖类型函数来编码非平凡不变量，往往很脆弱。
当函数暴露的化简行为不能提供方便的定义相等性时，常常需要更改系统中的早期定义。
另一种选择是在程序中到处援引相等性证明，但这些证明可能变得相当笨重。

在惯用的 Lean 代码中，索引数据类型并不常用。
相反，通常使用子类型和显式命题来强制执行重要不变量。
这种方法涉及许多显式证明，而很少援引定义相等性。
作为交互式定理证明器，Lean 的设计目标是让显式证明方便。
一般而言，在大多数情况下应优先采用这种方法。

然而，理解索引族数据类型很重要。
像 {anchorName plusR_zero_left_thm}`plusR_zero_left` 和 {anchorName plusR_succ_left}`plusR_succ_left` 这样的递归函数，实际上是 _数学归纳证明_。
递归的基础情形对应归纳的基础情形，递归调用代表对归纳假设的援引。
更一般地，Lean 中的新命题通常被定义为证据的归纳类型，而这些归纳类型通常有索引。
证明定理的过程，实际上是在幕后构造具有这些类型的表达式，这一过程与本节中的证明并无太大不同。
此外，索引数据类型有时恰好是合适的工具。
熟练运用它们，是知道何时使用它们的重要部分。



# 练习

%%%
tag := "dependent-type-pitfalls-exercises"
%%%

 * 使用 {anchorName plusR_succ_left}`plusR_succ_left` 风格的递归函数，证明对所有 {anchorName moreNames}`Nat` {anchorName exercises}`n` 和 {anchorName exercises}`k`，{anchorTerm exercises}`n.plusR k = n + k`。
 * 编写一个 {anchorName moreNames}`Vect` 上的函数，其中 {anchorName plusR}`plusR` 比 {anchorName plusL}`plusL` 更自然，而 {anchorName plusL}`plusL` 需要在定义中使用证明。