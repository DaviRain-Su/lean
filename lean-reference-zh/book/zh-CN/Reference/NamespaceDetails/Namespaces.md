# namespace

> 对应英文：[Namespaces](https://lean-lang.org/doc/reference/latest/Namespaces-and-Sections/#namespaces)，抓取日期：2026-06-16。

Lean 中的名称组织在层级命名空间里。命名空间是组织 API 的主要手段：它把相关定义、定理、类型和其他声明聚在一起，同时也为 syntax extension、instance、attribute 等效果提供附着点。

## 层级名称

一个包含点号 `.` 的名字（若点号不在 `«...»` 中）称为 **hierarchical name**。除最后一个 component 外，其余部分构成 namespace；最后一个 component 才是具体名称。

因此：

- `Nat.add` 的 namespace 是 `Nat`
- `Foo.Bar.baz` 的 namespace 是 `Foo.Bar`

## namespace 与 module 的关系

namespace 与 module 是正交概念：

- **module**：一起 elaboration、编译、加载的代码单元
- **namespace**：逻辑上的名称组织方式

一个 module 可以向任意 namespace 添加名称；层级 module 的嵌套结构也不必对应 namespace 的层级结构。

## root namespace

Lean 有一个 root namespace。通常省略 namespace 就是在 root 中；若需要显式指出，可用：

```lean
_root_.name
```

这在某些上下文中很重要：例如当前处于某个 namespace 或 local scope 下，而你想明确引用 root 中的名字。

## namespace 与 section scope

每个 section scope 都有一个 **current namespace**。在该作用域里声明的新名字，会被加入 current namespace。

若声明本身已有多个 component，则它的 namespace 会嵌套到 current namespace 之下；而声明体内部的 current namespace 也会相应变成这个嵌套结果。

## 使用建议

- 公共 API 设计应优先通过 namespace 建立稳定层级；
- 不要把“文件路径长什么样”与“namespace 长什么样”想成同一件事；
- 需要明确跳出当前 namespace 时，使用 `_root_`。