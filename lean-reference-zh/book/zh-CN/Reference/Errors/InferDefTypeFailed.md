# inferDefTypeFailed

> 对应英文：[About: inferDefTypeFailed](https://lean-lang.org/doc/reference/latest/Error-Explanations/About___--inferDefTypeFailed/)，抓取日期：2026-06-16。

错误码：`lean.inferDefTypeFailed`

含义：无法推断 definition 的 type。

严重性：Error。起始版本：4.23.0。

这个错误发生在 definition 的 type 没有完整指定，而 Lean 无法从已有信息推断其 type。若 definition 有参数，此错误只指冒号后 resulting type 无法推断；参数 type 无法推断时对应的是 `lean.inferBinderTypeFailed`。

## 修复方向

最直接的修复是在 definition header 中显式写出 resulting type：

```lean
def emptyNats : List Nat := []
```

也可以在 body 中提供更多 type 信息，例如显式给出 implicit type argument，或给 `let` binder 加 type annotation，让 Lean 能推断整个 definition type。

## 注意

一旦提供显式 resulting type，Lean 就不会再用 body 来推断 definition 或参数 type。因此，添加 resulting type 有时也要求给参数补充 type annotation。

对于 theorem，必须显式给出 type：theorem syntax 要求 type annotation，elaborator 不会用 theorem body 推断要证明的 proposition。

## 常见例子

```lean
def emptyNats := []
```

这里 Lean 不知道 `List` 的元素类型。可以写成：

```lean
def emptyNats : List Nat := []
```

或在 body 中显式指定 constructor 的 implicit 参数：

```lean
def emptyNats := @List.nil Nat
```

`let` 里补类型信息有时也能带动整个定义：

```lean
def pair := let x : Nat := 1; (x, x)   -- 可推断为 Nat × Nat
```
