# universe

> 对应英文：[Universes](https://lean-lang.org/doc/reference/latest/The-Type-System/Universes/)，抓取日期：2026-06-16。

类型本身也有类型；这些“类型的类型”就是 universe，也常称为 sort。Lean 用 universe 避免“类型属于自己”带来的悖论。

## 基本记法

- `Prop = Sort 0`
- `Type u = Sort (u + 1)`

所以：

- `Type` 是 `Type 0`
- `Type 1` 是更高一级 universe

每个 universe 都属于下一个更大的 universe，因此：

- `Sort 4 : Sort 5`
- `Type : Type 1`

但 universe **不累积**：一个类型只属于精确的某一个 universe，不会自动同时属于更高层。

## predicativity 与 impredicativity

### `Prop` 是 impredicative

命题可以量化任意 universe 中的类型，函数类型若结果在 `Prop` 中，则整体仍可留在 `Prop`。

### `Type u` 是 predicative

普通数据 universe 中，函数类型的 universe 是参数 universe 与结果 universe 的最小上界，因此不能任意“往回压低”。

## universe polymorphism

Lean 支持 universe polymorphism：常量和定义可以带 universe 参数，使用时再实例化。

例如：

- 显式写在名字后：`foo.{u,v}`
- 或通过 `universe u v` 提前声明 universe 变量

即使开启 `autoImplicit`，有些只出现在定义右侧的 universe 参数仍需要显式 `universe` 才会被量化。

## level expression

universe level 不只是变量或常数，还能写成表达式，例如：

- `u + 1`
- `max u v`
- `imax u v`

其中 `imax` 用于实现 `Prop` 的 impredicative 量化规则。

## universe lifting

当某类型所在 universe 太低，无法直接放进需要更高 universe 的位置时，可以使用：

- `PLift`
- `ULift`

### `PLift`

把任意类型（包括 proposition）提升一层。特别地，它可把 proof 放进数据结构中。

### `ULift`

把非 proposition 类型提升到任意更高 universe。

## 使用建议

- 普通用户多数时候只会遇到 `Type` / `Type u` / `Prop`；
- 一旦开始写 universe-polymorphic 库，就需要显式思考 level 参数；
- 遇到 universe mismatch 时，优先区分：是需要 `PLift`/`ULift`，还是定义本身该做 universe polymorphism。