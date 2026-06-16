# 函数应用

> 对应英文：[Function Application](https://lean-lang.org/doc/reference/latest/Terms/Function-Application/)，抓取日期：2026-06-16。

普通函数应用通过并置书写：函数后面放参数，二者之间至少有一个空格。

```lean
f x
```

在 Lean 核心类型论里，所有函数都只接收一个参数并返回一个值；多参数应用通过 currying 表达。高层 term language 则把函数和一个或多个参数当作一个整体，并支持 implicit、optional、automatic 和 named argument。

## 参数如何插入

对函数类型中的每个参数，Lean 会依次决定实参来源：

- 若有同名 named argument，则使用它；
- 若参数是普通 implicit，则创建 fresh metavariable；
- 若是 instance implicit，则创建 instance metavariable，稍后交给 synthesis；
- 若是 strict implicit 且后面仍有命名或位置参数未消耗，也会创建 fresh metavariable；
- 若是显式参数，则消耗下一个位置参数；若没有位置参数：
  - optional parameter 用默认值；
  - automatic parameter 执行 tactic script；
  - 否则若没有省略号，则创建 fresh variable；有省略号则按 implicit 处理。

最后 Lean 会推断整个应用的类型，并尽可能求解 metavariable，再做 instance synthesis。

## Named argument

函数参数可用名字指定：

```lean
f (x := t)
```

Lean 根据函数类型里参数名把该参数放到正确位置。

## `optParam` 与 `autoParam`

optional 和 automatic parameter 不是 Lean 核心类型论的一部分；它们由两个 gadget 编码：

- `optParam α default`
- `autoParam α tactic`

它们只影响 elaboration，不改变底层理论。

## Generalized field notation

field notation 写成：

```lean
term.ident
```

若点号前 expression 的 type 是某个常量应用，Lean 会在该常量 namespace 中查找 `ident`；找到后，点号前 expression 会作为该函数的**第一个不会导致类型错误的显式参数**插入。这就是 generalized field notation。

它不要求点号前值真的是 structure；只要其 type namespace 中存在匹配函数即可。

当 type 不是常量应用（例如 universe 或未确定 metavariable）时，generalized field notation 不能使用。

pretty printer 选项 `pp.fieldNotation` 控制显示时是否使用 field notation；`@[pp_nodot]` 可禁止某函数以点号形式打印。

## Pipeline syntax

Lean 提供 pipeline 语法：

- `x |> f`：把左边值喂给右边函数；
- `f <| x`：把右边值喂给左边函数；
- `x |>.f arg`：等价于 `(x).f arg`。

pipeline 让一连串函数应用更易读，减少显式括号。
