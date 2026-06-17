# universe lifting

> 对应英文：[Universe Lifting](https://lean-lang.org/doc/reference/latest/The-Type-System/Universes/#The-Lean-Language-Reference--The-Type-System--Universes--Polymorphism--Universe-Lifting)，抓取日期：2026-06-16。

当某个类型所在 universe 太低，无法直接用于当前上下文时，Lean 提供两种 lifting 结构：

- `PLift`
- `ULift`

## `PLift`

`PLift` 可以把任意类型——包括 proposition——提升一层。它尤其适合：

- 想把 proof 放进普通数据结构时；
- 需要把 `Prop` 中的东西搬到数据 universe 时。

常见接口：

- `PLift.up`
- `down`

## `ULift`

`ULift` 用于把**非 proposition** 类型提升到任意更高的 universe。它不会改变值本身，只是改变“这个值所在类型被放在哪个 universe 里看待”。

常见接口：

- `ULift.up`
- `down`

## 何时需要 lifting

通常在以下场景才会显式遇到：

- universe-polymorphic 定义中出现不匹配；
- 想把较低 universe 的值嵌入到要求更高 universe 的结构里；
- 处理依赖类型库、元编程工具或高阶抽象时。

## 使用建议

- 普通应用代码很少需要显式写 `PLift` / `ULift`；
- 一旦出现 universe mismatch，可先问自己：这里需要的是真正不同的数学对象，还是只需要换个 universe 外壳；若是后者，lifting 往往正是答案。