# universe polymorphism

> 对应英文：[Polymorphism](https://lean-lang.org/doc/reference/latest/The-Type-System/Universes/#The-Lean-Language-Reference--The-Type-System--Universes--Polymorphism)，抓取日期：2026-06-16。

Lean 支持 **universe polymorphism**：环境中的常量和定义可以带 universe 参数，使用时再把这些参数实例化成具体 level。

## 基本形式

显式写法通常在名字后带 universe 参数：

```text
foo.{u, v}
```

这表示 `foo` 并不是只活在某个固定 universe，而是一个“可按不同 level 重复使用”的 schematic definition。

## level expression

universe 参数不只可直接作为变量使用，还能出现在 level expression 中，例如：

- `u + 1`
- `max u v`
- `imax u v`

其中 `imax` 主要服务 `Prop` 的 impredicative 规则。

## `universe` 命令

除了显式写在声明名后，也可以先用：

```lean
universe u v
```

在当前 scope 中引入 universe 变量。即便 `autoImplicit = false`，这样声明的 universe 名也会继续参与量化。

## 与 `autoImplicit` 的关系

当 `autoImplicit = true` 时，Lean 会尽量自动插入 universe 参数；但如果某 universe 变量只出现在定义右侧，而不出现在 header 中，自动机制不一定能把它加入参数，此时仍应显式 `universe ...`。

## definitional equality

同一 universe-polymorphic 定义在不同 level 实例下得到的是**不同对象**。也就是说，不同 universe 实例化并不会自动彼此 definitionally equal。

## 使用建议

- 写可复用抽象库时，优先考虑 universe polymorphism。
- 遇到 `Type ?u` 之类推断异常时，先检查是不是应该显式绑定 universe 变量。
- 若定义只在单一 universe 使用，不必过度泛化。