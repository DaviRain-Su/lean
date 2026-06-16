# 表达式的实现

针对有兴趣自行实现部分或完整内核的读者，这里有几点值得注意：

## 存储数据

表达式需要内联存储某些数据或缓存起来，以避免代价过高的重复计算。例如，创建一个表达式 `app x y` 时，需要计算并存储该应用表达式的哈希摘要（hash digest）。这一步应利用已缓存的 `x` 和 `y` 的哈希值，而非递归遍历整个 `x` 树来计算，再对 `y` 做同样操作。

通常你会想内联存储的数据包括：

* 哈希摘要
* 表达式中自由绑定变量（loose bound variables）的数量
* 表达式是否包含自由变量（has free variables）

后两者分别对实例化（instantiation）和抽象化（abstraction）优化非常有用。

举个“智能构造函数”示例，用于构造 `app` 表达式：

```lean
def mkApp x y:
  let hash := hash x.storedHash y.storedHash
  let numLooseBvars := max x.numLooseBvars y.numLooseBvars
  let hasFvars := x.hasFvars || y.hasFvars
  .app x y (cachedData := hash numLooseBVars hasFVars)
```

## 禁止深拷贝

表达式的实现应确保用于构造父表达式的子表达式不会被深拷贝。换句话说，创建 `app x y` 表达式时，不应递归复制 `x` 和 `y` 的所有元素，而应采用某种引用机制，如指针、整数索引、垃圾回收对象的引用、引用计数对象等（任意一种方案都能提供合理性能）。

如果你的默认表达式构造策略是深拷贝，将无法在内存允许范围内构造任何非平凡的环境。

## 自由绑定变量数量的示例实现

```lean
numLooseBVars e:
    match e with
    | Sort | Const | FVar | StringLit | NatLit => 0
    | Var dbjIdx => dbjIdx + 1,
    | App fun arg => max fun.numLooseBvars arg.numLooseBvars
    | Pi binder body | Lambda binder body => 
    |   max binder.numLooseBVars (body.numLooseBVars - 1)
    | Let binder val body =>
    |   max (max binder.numLooseBvars val.numLooseBvars) (body.numLooseBvars - 1)
    | Proj _ _ structure => structure.numLooseBvars
```

对于 `Var` 表达式，自由绑定变量的数量是其 deBruijn 索引加一。原因在于，我们计算的是该变量不再“松弛”（loose）所需包裹的绑定器数量，其中 `+1` 是因为 deBruijn 索引是从 0 开始计数的。

例如：

* 对于表达式 `Var(0)`，需要在该绑定变量之上包裹 1 个绑定器，变量才不再松弛。
* 对于表达式 `Var(3)`，需要包裹 4 个绑定器：

```lean
--  索引：3 2 1 0
fun a b c d => Var(3)
```

当我们创建一个新的绑定器（lambda、pi 或 let）时，可以对主体中的自由绑定变量数量执行饱和减 1（即自然数减法，但不会小于 0），因为主体相当于多包裹了一个绑定器。
