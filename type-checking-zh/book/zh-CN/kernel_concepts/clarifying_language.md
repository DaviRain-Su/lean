# 术语解释

## Type、Sort 与 Prop

* `Prop` 即为 `Sort 0`。
* `Type n` 即为 `Sort (n+1)`。
* 内核中实际表示这些概念的是统一的 `Sort n`，用户始终可以直接使用它。

之所以有时使用 `Type <N>` 或者 `Prop` 而非统一使用 `Sort n`，是因为 `Type <N>` 中的元素具有一些重要的性质与行为，是 `Prop` 中元素所不具备的，反之亦然。

例如：`Prop` 中元素具有 **定义性的证明无关性（definitional proof irrelevance）** ，而 `Type _` 中的元素可直接使用 **大消去（large elimination）** ，无需满足其他额外条件。

## Level/universe 与 Sort

* 术语“level”（层级）和“universe”（宇宙）实际上是同义的，指的都是内核中同一种对象。

偶尔有一种细微的区别，即“宇宙参数”（universe parameter）通常暗含着特指变量形式的层级。这是因为：

* “宇宙参数”特指在 Lean 声明中用作参数化的层级集合，而这些只能是变量名（identifiers）。
* 例如，一个 Lean 声明可以写成：

  ```lean
  def Foo.{u} ..
  ```

  这里的含义是「定义 Foo，以宇宙变量 u 为参数化」。

  但不能直接写成：

  ```lean
  def Foo.{1} ..
  ```

  因为 `1` 是一个明确的宇宙层级，而非参数（parameter）。

另一方面，`Sort _` 则是表示某个宇宙层级的表达式。

## 值与类型

Lean 中的表达式可以是 **值** 或者 **类型**。

* 用户可能熟悉的例子：

  * `Nat.zero` 是一个 **值**；
  * `Nat` 是一个 **类型**。

具体而言，对于表达式 `e`：

* 若 `infer e ≠ Sort _`，则称为 **值表达式**。
* 若 `infer e = Sort _`，则称为 **类型表达式**。

## 参数与指标

参数（parameter）与指标（index）的区别在处理归纳类型时尤为重要。

简单来说，在 Lean 中的归纳类型声明里，「冒号之前」的参数列表为 **参数**，「冒号之后」为 **指标**：

```lean
         -- 参数 ----v         v---- 指标
inductive Nat.le (n : Nat) : Nat → Prop
```

这一差别在内核中至关重要：

* 参数在单个归纳声明的定义中是固定不变的；
* 而指标则在具体构造中并不固定。