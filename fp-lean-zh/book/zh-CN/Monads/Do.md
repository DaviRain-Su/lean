# 单子的 {kw}`do` 记法

基于单子的 API 非常强大，但显式使用 {lit}`>>=` 配合匿名函数仍然有些冗长。
正如使用中缀运算符代替对 {anchorName names}`HAdd.hAdd` 的显式调用，Lean 为单子提供了一种称为_{kw}`do` 记法_的语法，可以使使用单子的程序更易于阅读和编写。
这与用于在 {anchorName names}`IO` 中编写程序的 {kw}`do` 记法完全相同，而 {anchorName names}`IO` 也是一个单子。

在 {ref "hello-world"}[Hello, World!] 中，{kw}`do` 语法用于组合 {anchorName names}`IO` 动作，但这些程序的含义是直接解释的。
理解如何用单子编程，意味着现在可以在它如何翻译为底层单子运算符的使用这一意义上来解释 {kw}`do`。

{kw}`do` 的第一种翻译用于 {kw}`do` 中唯一的语句是单个表达式 {anchorName doSugar1a}`E` 的情况。
在这种情况下，{kw}`do` 会被移除，因此
```anchor doSugar1a
do E
```
翻译为
```anchor doSugar1b
E
```

第二种翻译用于 {kw}`do` 的第一条语句是带箭头的 {kw}`let`，绑定局部变量时。
这翻译为对 {lit}`>>=` 的使用，以及一个绑定同一变量的函数，因此
```anchor doSugar2a
 do let x ← E₁
    Stmt
    …
    Eₙ
```
翻译为
```anchor doSugar2b
E₁ >>= fun x =>
  do Stmt
     …
     Eₙ
```

当 {kw}`do` 块的第一条语句是表达式时，它被视为返回 {anchorName names}`Unit` 的单子动作，因此函数匹配 {anchorName names}`Unit` 构造子，且
```anchor doSugar3a
  do E₁
     Stmt
     …
     Eₙ
```
翻译为
```anchor doSugar3b
E₁ >>= fun () =>
  do Stmt
     …
     Eₙ
```

最后，当 {kw}`do` 块的第一条语句是使用 {lit}`:=` 的 {kw}`let` 时，翻译后的形式是普通 {kw}`let` 表达式，因此
```anchor doSugar4a
do let x := E₁
   Stmt
   …
   Eₙ
```
翻译为
```anchor doSugar4b
let x := E₁
do Stmt
   …
   Eₙ
```

:::paragraph
使用 {anchorName firstThirdFifthSeventhMonad (module := Examples.Monads.Class)}`Monad` 类的 {anchorName firstThirdFifthSeventhMonad (module := Examples.Monads.Class)}`firstThirdFifthSeventh` 定义如下：

```anchor firstThirdFifthSeventhMonad (module := Examples.Monads.Class)
def firstThirdFifthSeventh [Monad m] (lookup : List α → Nat → m α)
    (xs : List α) : m (α × α × α × α) :=
  lookup xs 0 >>= fun first =>
  lookup xs 2 >>= fun third =>
  lookup xs 4 >>= fun fifth =>
  lookup xs 6 >>= fun seventh =>
  pure (first, third, fifth, seventh)
```
使用 {kw}`do` 记法，它会变得显著更易读：
```anchor firstThirdFifthSeventhDo
def firstThirdFifthSeventh [Monad m] (lookup : List α → Nat → m α)
    (xs : List α) : m (α × α × α × α) := do
  let first ← lookup xs 0
  let third ← lookup xs 2
  let fifth ← lookup xs 4
  let seventh ← lookup xs 6
  pure (first, third, fifth, seventh)
```
:::

:::paragraph
没有 {anchorName mapM}`Monad` 类型类时，为树的节点编号的函数 {anchorName numberMonadicish (module := Examples.Monads)}`number` 是这样写的：

```anchor numberMonadicish (module := Examples.Monads)
def number (t : BinTree α) : BinTree (Nat × α) :=
  let rec helper : BinTree α → State Nat (BinTree (Nat × α))
    | BinTree.leaf => ok BinTree.leaf
    | BinTree.branch left x right =>
      helper left ~~> fun numberedLeft =>
      get ~~> fun n =>
      set (n + 1) ~~> fun () =>
      helper right ~~> fun numberedRight =>
      ok (BinTree.branch numberedLeft (n, x) numberedRight)
  (helper t 0).snd
```
有了 {anchorName mapM}`Monad` 和 {kw}`do`，其定义要简洁得多：

```anchor numberDo
def number (t : BinTree α) : BinTree (Nat × α) :=
  let rec helper : BinTree α → State Nat (BinTree (Nat × α))
    | BinTree.leaf => pure BinTree.leaf
    | BinTree.branch left x right => do
      let numberedLeft ← helper left
      let n ← get
      set (n + 1)
      let numberedRight ← helper right
      ok (BinTree.branch numberedLeft (n, x) numberedRight)
  (helper t 0).snd
```
:::

{kw}`do` 与 {anchorName names}`IO` 配合使用的所有便利特性，在与其他单子一起使用时也同样可用。
例如，嵌套操作在任何单子中都可以使用。
{anchorName mapM (module:=Examples.Monads.Class)}`mapM` 的原始定义是：

```anchor mapM (module := Examples.Monads.Class)
def mapM [Monad m] (f : α → m β) : List α → m (List β)
  | [] => pure []
  | x :: xs =>
    f x >>= fun hd =>
    mapM f xs >>= fun tl =>
    pure (hd :: tl)
```
使用 {kw}`do` 记法，它可以写成：

```anchor mapM
def mapM [Monad m] (f : α → m β) : List α → m (List β)
  | [] => pure []
  | x :: xs => do
    let hd ← f x
    let tl ← mapM f xs
    pure (hd :: tl)
```
使用嵌套操作使它几乎与原始的非单子版 {anchorName names}`map` 一样简短：

```anchor mapMNested
def mapM [Monad m] (f : α → m β) : List α → m (List β)
  | [] => pure []
  | x :: xs => do
    pure ((← f x) :: (← mapM f xs))
```
使用嵌套操作，{anchorName numberDoShort}`number` 可以变得更简洁：

```anchor numberDoShort
def increment : State Nat Nat := do
  let n ← get
  set (n + 1)
  pure n

def number (t : BinTree α) : BinTree (Nat × α) :=
  let rec helper : BinTree α → State Nat (BinTree (Nat × α))
    | BinTree.leaf => pure BinTree.leaf
    | BinTree.branch left x right => do
      pure
        (BinTree.branch
          (← helper left)
          ((← increment), x)
          (← helper right))
  (helper t 0).snd
```

# 练习

 * 使用 {kw}`do` 记法改写 {anchorName evaluateM (module:=Examples.Monads.Class)}`evaluateM`、其辅助函数以及不同的具体用例，而不是显式调用 {lit}`>>=`。
 * 使用嵌套操作改写 {anchorName firstThirdFifthSeventhDo}`firstThirdFifthSeventh`。