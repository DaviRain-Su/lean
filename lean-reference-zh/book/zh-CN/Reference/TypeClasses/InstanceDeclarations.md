# instance 声明

> 对应英文：[Instance Declarations](https://lean-lang.org/doc/reference/latest/Type-Classes/Instance-Declarations/)，抓取日期：2026-06-16。

`instance` 声明的语法几乎和普通定义相同，只是把关键字 `def` 换成了 `instance`，并且名字可以省略。

## 三种常见写法

### 1. `where` 风格

最常见：直接给每个 method 提供实现。

```lean
instance : SomeClass α where
  method1 := ...
  method2 := ...
```

### 2. `:= term`

因为 type class 本质上是 inductive type，也可以直接用一个适当类型的表达式构造实例：

```lean
instance : SomeClass α :=
  ⟨..., ...⟩
```

实际中常见于：

- 匿名构造子 `⟨...⟩`
- `inferInstanceAs` 把定义上等价的类型实例“搬过来”

### 3. pattern matching 风格

```lean
instance ...
| pat => ...
```

这种写法存在，但除 `Decidable` 等特定场景外并不常见。

## 命名与注册

若省略实例名，Lean 会自动生成一个名字。虽然技术上可以直接引用这个生成名，但不建议依赖它：名字生成算法未来可能变化。只要某个实例会被其他代码显式引用，就应给它明确命名。

elaboration 成功后，新的实例会自动注册为 instance search 候选。除此之外，也可对普通已定义常量手工加 `instance` attribute，把它注册成候选实例。

## 递归实例

默认 `where` 风格方法定义**不是递归**的；因此给递归归纳类型写实例时，常见惯用法是：

1. 先定义一个单独的递归辅助函数；
2. 再在 `instance` 中引用它。

此外，实例在定义期间**不会**参与自己的 instance synthesis。对于嵌套递归类型，有时需要在递归辅助函数里临时放一个 local instance，借助 local context 中的绑定来继续搜索。

## class inductive 的实例

对 class inductive，实例通常本身就是函数：它会根据输入模式选择不同构造子。因此这种实例往往更像普通函数定义，而不像简单地填 method 表。

## 优先级

实例可带优先级：

- 数字优先级
- `default`
- `low`
- `mid`
- `high`
- 以及优先级表达式如 `default + 2`

instance search 会优先尝试高优先级实例；同优先级时，较新的声明优先。

## `default_instance`

`default_instance` 表示“当信息不足，普通实例又无法确定时，可作为后备方案使用”的实例。它常用来填补弱约束场景，但若滥用，容易让 instance search 变得难以预测。

## 使用建议

- 大多数实例优先写成 `where` 风格。
- 只要实例会被显式引用，就给它命名。
- 递归实例先想清楚是否需要单独辅助函数。
- 优先级和 `default_instance` 都应谨慎使用，因为它们会直接影响全局搜索行为。