# 函数

> 对应英文：[Functions](https://lean-lang.org/doc/reference/latest/Terms/Functions/)，抓取日期：2026-06-16。

具有函数类型的 term 可以通过 abstraction 构造，关键字是 `fun`。在不同社区里，它也常被称为 lambda 或 anonymous function。Lean 核心类型论中的 abstraction 一次只绑定一个变量，但高层 Lean syntax 为函数 term 提供了更灵活的写法。

## 基本形式

```lean
fun x => body
```

这会引入一个局部变量 `x` 作为参数。elaboration 时，Lean 必须知道函数的 domain；一种提供方式是显式加 type ascription：

```lean
fun x : α => body
```

## Curried function

`fun` 后可以接多个参数名：

```lean
fun x y z => body
```

这等价于嵌套写法：

```lean
fun x => fun y => fun z => body
```

若多个参数需要不同 type，则应使用带括号 binder：

```lean
fun (x : α) (y : β) => body
```

## 不同 binder 形式

`fun` 的最一般形式接受一串 `funBinder`。可用 binder 包括：

- 单个 identifier；
- `(x y : α)` 这种带 type 的参数组；
- `{x : α}` 普通 implicit 参数；
- `⦃x : α⦄` strict implicit 参数；
- `[inst : C α]` 或 `[C α]` instance implicit 参数；
- `_` 匿名参数。

`=>` 也可以写成 `↦`。

## 隐式参数

Lean 支持三类隐式参数：

### Ordinary implicit

```lean
{x : α}
```

Lean 在每个调用点通过 unification 试图找到唯一使函数调用类型正确的参数值。

### Strict implicit

```lean
⦃x : α⦄
```

它和普通 implicit 相同，但只有在后续显式参数出现时 Lean 才会尝试推断。

### Instance implicit

```lean
[inst : C α]
```

该参数通过 type class synthesis 获得。通常即使不给名字，函数体中也能使用该 synthesized instance。

## 重要事实

Lean 核心语言并不区分显式、隐式和 instance implicit 参数；它们在核心中是 definitionally equal 的。区别只在 elaboration 阶段表现出来。

另外，如果函数的 expected type 自带隐式参数，而 `fun` binder 没显式写出来，Lean 可能自动补出额外参数。因此最终函数参数个数可能多于源码中直接写出的 binder 数量。
