# 类型推断

类型推断（Type Inference）是确定给定表达式类型的过程，是 Lean 内核的核心功能之一。通过类型推断，我们可以确定 `Nat.zero` 属于类型 `Nat`，或者表达式 `(fun (x : Char) => var(0))` 属于类型 `Char -> Char`。

本节首先介绍最简单完整的类型推断过程，随后介绍更高效但稍复杂的实现版本。

同时，我们还将了解 Lean 内核在类型推断过程中进行的一些额外正确性断言。

## 绑定变量

如果你参照 Lean 的实现并采用局部无名（locally nameless）方法，类型推断时通常不会直接遇到绑定变量，因为所有开放的绑定器都会被相应的自由变量实例化替代。

遇到绑定器时，我们需要深入其主体来确定主体的类型。保持绑定器类型信息的主要方法有两种：

* Lean 内核采用的方法是：创建一个自由变量，携带绑定器的类型信息；然后用该自由变量实例化（替换）相应的绑定变量，最后进入主体。这种方式的好处是无需维护一个独立的类型上下文状态。

* 另一种基于闭包的实现则通常会维护一个单独的类型上下文，用于记录开放绑定器；遇到绑定变量时，则从上下文中索引获取该变量的类型。

## 自由变量

创建自由变量时，会赋予其所代表绑定器的类型信息，因此类型推断时可以直接使用该类型信息作为推断结果。

```lean
infer FVar id binder:
  binder.type
```

## 函数应用

```lean
infer App(f, arg):
  match (whnf $ infer f) with
  | Pi binder body => 
    assert! defEq(binder.type, infer arg)
    instantiate(body, arg)
  | _ => error
```

这里还需要额外断言：`arg` 的类型必须与 `binder` 的类型匹配。比如对于表达式 ``(fun (n : Nat) => 2 * n) 10`` 我们需要断言 ``defEq(Nat, infer(10))``。

虽然现有实现通常会直接在当前流程中执行此检查，但也可以将该等价性断言存储起来，供后续流程统一处理。

## Lambda

```lean
infer Lambda(binder, body):
  assert! infersAsSort(binder.type)
  let binderFvar := fvar(binder)
  let bodyType := infer $ instantiate(body, binderFVar)
  Pi binder (abstract bodyType binderFVar)
```

# Pi

```lean
infer Pi binder body:
  let l := inferSortOf binder
  let r := inferSortOf $ instantiate body (fvar(binder))
  imax(l, r)

inferSortOf e:
  match (whnf (infer e)) with
  | sort level => level
  | _ => error
```

## Sort

`Sort n` 的类型是 `Sort (n+1)` 。

```lean
infer Sort level:
  Sort (succ level)
```

## Const

`const` 表达式用于通过名称引用其他声明，而被引用的声明必须是之前已经声明并完成类型检查的。因此，我们可以直接在环境中查找该声明的类型。不过需要注意的是，必须将当前声明的宇宙层级参数替换到被引用定义的宇宙参数中。


```lean
infer Const name levels:
  let knownType := environment[name].type
  substituteLevels (e := knownType) (ks := knownType.uparams) (vs := levels)
```

## Let

```lean
infer Let binder val body:
  assert! inferSortOf binder
  assert! defEq(infer(val), binder.type)
  infer (instantiate body val)
```

## Proj

我们尝试推断类似表达式 ``Proj (projIdx := 0) (structure := Prod.mk A B (a : A) (b : B))`` 的类型。

首先推断所提供的结构体的类型；由此我们可以获得结构体名称，并在环境中查找该结构体及其构造子类型。

接着遍历构造子类型的望远镜（telescope），将 `Prod.mk` 的参数替换进构造子类型的望远镜中。比如，我们查到的构造子类型为：``A -> B -> (a : A) -> (b : B) -> Prod A B`` ，替换 `A` 和 `B` 后，望远镜变为：``(a : A) -> (b : B) -> Prod A B``

构造子望远镜剩余部分即为结构体的字段，它们的类型信息包含在绑定器中，因此我们只需查看 `telescope[projIdx]` 并取出对应绑定器的类型即可。

但这里还有一点需要注意：由于后续结构字段可能依赖于前面的字段，我们必须对望远镜剩余部分（每一步的主体）进行实例化，替换成形式如 `proj thisFieldIdx s` 的表达式，其中 `s` 是我们当前尝试推断的原始结构体表达式。

```lean
infer Projection(projIdx, structure):
  let structType := whnf (infer structure)
  let (const structTyName levels) tyArgs := structType.unfoldApps
  let InductiveInfo := env[structTyName]
  -- This inductive should only have the one constructor since it's claiming to be a structure.
  let ConstructorInfo := env[InductiveInfo.constructorNames[0]]

  let mut constructorType := substLevels ConstructorInfo.type (newLevels := levels)

  for tyArg in tyArgs.take constructorType.numParams
    match (whnf constructorType) with
      | pi _ body => inst body tyArg
      | _ => error

  for i in [0:projIdx]
    match (whnf constructorType) with
      | pi _ body => inst body (proj i structure)
      | _ => error

  match (whnf constructorType) with
    | pi binder _=> binder.type
    | _ => error 
```

## Nat 字面量

Nat 字面量推断为引用声明 `Nat` 的常量表达式。

```lean
infer NatLiteral _:
  Const(Nat, [])
```

## String 字面量

字符串字面量推断为引用声明 `String` 的常量表达式。

```lean
infer StringLiteral _:
  Const(String, [])
```

