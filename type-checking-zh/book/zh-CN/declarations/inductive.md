# 归纳类型的秘密生活

### 归纳声明

为了清晰起见，所谓“一个归纳声明”（Inductive）包括一个类型、一组构造子列表和一组递归器（recursors）。声明的类型和构造子由用户指定，递归器则由这两者派生。每个递归器还附带一组“递归规则”（也称计算规则），它们是用于 ι-归约（即模式匹配）的值级表达式。后续内容中，我们会尽量区分“归纳类型”和“归纳声明”这两个概念。

Lean 内核原生支持互归纳声明（mutual inductive declarations），此时有一组（类型，构造子列表）配对。对于嵌套归纳声明，内核会临时将其转化为互归纳声明（下文详述）。

### 归纳类型（Inductive types）

内核要求归纳声明中的“归纳类型”必须是真正的类型，而非值（`infer ty` 必须返回某个 `sort <n>`）。对于互归纳，所有声明的类型必须处于同一宇宙层级，且参数一致。

### 构造子

内核对归纳类型的每个构造子（Constructor）执行以下检查：

* 构造子的类型/望远镜（telescope）必须与归纳类型的参数相同。
* 构造子类型望远镜中非参数部分的绑定变量类型必须是类型（推断结果应为 `Sort _`）。
* 构造子类型望远镜中任一非参数部分推断出的层级必须小于或等于归纳类型的层级，或者归纳类型本身是 `Prop`。
* 构造子的参数中不得包含对正在声明类型的非正向（non-positive）出现（关于严格正性可参见[这里](https://counterexamples.org/strict-positivity.html?highlight=posi#positivity-strict-and-otherwise)）。
* 构造子望远镜的结尾必须是对被声明归纳类型的合法参数应用。例如，要求 `List.cons` 的结尾是 `.. -> List A`，若结尾为 `.. -> Nat` 则是错误。

#### 嵌套归纳

检查嵌套归纳（Nested inductives）较为繁琐，需要临时将嵌套部分专门化为互归纳声明，从而只处理一组“普通”的互归纳，完成类型检查后再还原专门化声明。

以包含嵌套构造 `Array Sexpr` 的 S 表达式定义为例：

```lean
inductive Sexpr
| atom (c : Char) : Sexpr
| ofArray : Array Sexpr -> Sexpr
```

检查过程概括为三步：

1. 将嵌套归纳转为互归纳，通过专门化“容器类型”（container types）实现。若容器类型本身依赖其他类型，则需对其递归专门化。例中，`Array` 是容器类型，而 `Array` 定义依赖于 `List`，所以需同时将 `Array` 和 `List` 视为容器类型。
2. 对互归纳类型执行常规检查与构造步骤。
3. 将专门化的嵌套类型还原为原始形式，并将还原后的声明加入环境。

上述定义的专门化示例如下：

```lean
mutual
  inductive Sexpr
    | atom : Char -> Sexpr
    | ofList : ListSexpr -> Sexpr

  inductive ListSexpr 
    | nil : ListSexpr
    | cons : Sexpr -> ListSexpr -> ListSexpr 

  inductive ArraySexpr
    | mk : ListSexpr -> ArraySexpr
end
```

之后，在检查这些类型时还原成原始的嵌套声明。需注意，“专门化”是指新定义的 `ListSexpr` 和 `ArraySexpr` 类型仅表示 `Sexpr` 的列表和数组，而非像普通 `List` 类型那样对任意类型泛化。

### 递归器

递归器（Recursors）相关内容请参见[归约章节中的ι-归约](../type_checking/reduction.md#iota-reduction-pattern-matching)。