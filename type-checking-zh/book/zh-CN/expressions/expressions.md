# 表达式

## 完整语法

关于表达式的具体解释稍后会更详细展开，这里先完整列出表达式的所有语法形式（包括字符串和自然数字面量扩展）：

```
Expr ::= 
  | boundVariable 
  | freeVariable 
  | const 
  | sort 
  | app 
  | lambda 
  | forall 
  | let 
  | proj 
  | literal

BinderInfo ::= Default | Implicit | InstanceImplicit | StrictImplicit

const ::= Name, Level*
sort ::= Level
app ::= Expr Expr
-- a deBruijn index
boundVariable ::= Nat
lambda ::= Name, (binderType : Expr), BinderInfo, (body : Expr)
forall ::= Name, (binderType : Expr), BinderInfo, (body : Expr)
let ::= Name, (binderType : Expr), (val : Expr) (body : Expr)
proj ::= Name Nat Expr
literal ::= natLit | stringLit

-- 任意精度无符号整数
natLit ::= Nat
-- UTF-8 字符串
stringLit ::= String

-- fvarId 可以通过唯一命名或deBruijn层级来实现; 
-- 唯一命名更通用，deBruijn层级有更好的缓存性能
freeVariable ::= Name, Expr, BinderInfo, fvarId
```
一些说明：

* 用于自然数字面量的 `Nat` 应该是任意精度自然数（大整数）。

* 带绑定器的表达式（lambda、pi、let、自由变量）可以将三个参数（绑定器名称 binder\_name、绑定器类型 binder\_type、绑定器风格 binder\_style）合并成一个参数 `Binder`，其中 `Binder ::= Name BinderInfo Expr`。在其他伪代码中，我通常会假设它们具有这种属性，因为这样更易读。

* 自由变量的标识符可以是唯一标识符，也可以是 deBruijn 层级。

* Lean 内部使用的表达式类型还有一个 `mdata` 构造子，用于声明附带元数据的表达式。这些元数据不会影响内核中表达式的行为，因此这里不包含该构造子。

## 绑定器信息（Binder information）

由 lambda、pi、let 和自由变量构造的表达式都包含绑定器信息，表现为名称、绑定器“风格”和绑定器类型。绑定器的名称和风格仅供美化打印器使用，不影响推断、归约或等价性检查等核心过程。不过美化打印器会根据绑定器风格和打印选项来调整输出，比如用户可能希望显示或隐藏隐式参数或实例隐式（类型类变量）。

### Sort

`sort` 只是对层级的包装，允许其作为表达式使用。

### 绑定变量（Bound variables）

绑定变量以自然数实现，表示 [deBruijn 索引](https://en.wikipedia.org/wiki/De_Bruijn_index)。

### 自由变量（Free variables）

自由变量用来在绑定器不可用的情况下，传递有关绑定变量的信息。通常这是因为内核已经进入绑定表达式的主体部分，选择不携带结构化的绑定上下文，而是临时用自由变量替换绑定变量，待需要时再用新的（可能不同的）绑定变量重构绑定器。

这种“不可用”的描述或许模糊，但直观来说，表达式是以树结构实现的，且没有任何指向父节点的指针，因此当我们深入子节点（尤其是函数边界）时，会丢失对当前表达式中“上方”元素的直接访问。

当对一个开放表达式通过重构绑定器进行闭合时，绑定关系可能已经改变，导致之前有效的 deBruijn 索引失效。使用唯一名称或 deBruijn 层级可以在重闭绑定时补偿这些变化，确保重绑定变量的新 deBruijn 索引相对于重建的望远镜是有效的（详见[实现自由变量抽象](./kernel_concepts.md#implementing-free-variable-abstraction)部分）。

今后，我们可能会用“自由变量标识符”一词来泛指实现中使用的对象，无论是唯一 ID 还是 deBruijn 层级。

### `Const`

`const` 构造子表示表达式中对环境中另一个声明的引用，必须通过名称引用。

例如，下面代码：

```lean
def plusOne : Nat -> Nat := fun x => x + 1

theorem plusOne_eq_succ (n : Nat) : plusOne n = n.succ := rfl 
```

其中 `def plusOne` 创建了一个 `Definition` 声明，经检查后加入环境。声明不能直接嵌入表达式中，因此当 `plusOne_eq_succ` 的类型使用之前声明的 `plusOne` 时，必须通过名称调用。于是产生表达式：

```
Expr.const (plusOne, [])
```

内核遇到该 `const` 表达式时，会在环境中查找名称为 `plusOne` 的声明。

用 `const` 构造的表达式还携带一个层级列表，这些层级会替换环境中对应定义的宇宙参数。例如，推断 `const List [Level.param(x)]` 的类型时，会查找当前环境中的 `List` 声明，获取其类型和宇宙参数，然后用 `x` 替换 `List` 最初声明时的宇宙参数。

### Lambda、Pi

`lambda` 和 `pi` 表达式分别表示函数抽象和“forall”绑定器（依赖函数类型）。Lean 内部将 `pi` 命名为 `forallE`。

```
  binderName      body
      |            |
fun (foo : Bar) => 0 
            |         
        binderType    

-- `BinderInfo` is reflected by the style of brackets used to
-- surround the binder.
```

### Let

`let` 就是字面意思的 let 表达式。虽然 `let` 表达式是绑定器，但它们没有显式的 `BinderInfo`，其绑定信息被视为默认（`Default`）。

```
  binderName      val
      |            |
let (foo : Bar) := 0; foo
            |          |
        binderType     .... body
```

### App

`app` 表达式表示函数对参数的应用。`app` 节点是二叉的（只有两个子节点：一个函数和一个参数），因此表达式 `f x_0 x_1 ... x_N` 会被表示为嵌套的形式：

```
App(App(App(f, x_0), x_1) ..., x_N)
```

也可以用树状结构来形象表示：

```
                App
                / \
              ...  x_N
              /
            ...
           App
          / \
       App  x_1
       / \
     f  x_0

```

操作表达式时，内核中一个非常常见的操作是 **折叠（folding）** 与 **展开（unfolding）** 一系列函数应用。它可以将上文中的树形结构转换成 `(f, [x_0, x_1, ..., x_N])` 的形式，或者反向将 `(f, [x_0, x_1, ..., x_N])` 折叠成那样的树形结构。

### 投影（Projections）

`proj` 构造子表示结构体字段的投影。非递归、只有一个构造子且无指标（indices）的归纳类型可以被视为结构体。

`proj` 接受三个参数：

* 类型的名称；
* 一个自然数，表示要投影的字段索引；
* 要应用投影的实际结构表达式。

需要注意的是，内核中的投影索引是 **从 0 开始计数** 的，而 Lean 表层语言中是从 1 开始的，且 0 表示跳过构造子参数后的第一个非参数参数。

例如，内核表达式：

```lean
proj Prod 0 (@Prod.mk A B a b)
```

会投影字段 `a`，因为它是跳过参数 `A` 和 `B` 后的第 0 个字段。

虽然使用类型的递归器（recursor）也能实现 `proj` 的功能，但 `proj` 能更高效地处理内核中的常用操作。

### 字面量（Literals）

Lean 内核可选支持任意精度的自然数（Nat）和字符串（String）字面量。

* 内核可以将自然数字面量 `n` 转换为 `Nat.zero` 或 `Nat.succ m` 形式；
* 字符串字面量 `s` 则可转换为 `String.mk List.nil` 或 `String.mk (List.cons (Char.ofNat _) ...)`。

字符串字面量采用惰性转换成字符列表，用于定义等价性测试以及递归器归约时的主要前提。

自然数字面量可用在与字符串相同的场合（定义等价性和递归器的主要前提），除此之外，内核还支持对自然数字面量的加法、乘法、指数运算、减法、模运算、除法，以及布尔型的等于和“小于等于”比较操作。
