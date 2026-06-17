# structure 声明

> 对应英文：[Structure Declarations](https://lean-lang.org/doc/reference/latest/The-Type-System/Inductive-Types/#structures)，抓取日期：2026-06-16。

`structure` 可视为“单构造子的归纳类型”，但 Lean 为它提供了更贴近记录类型的表面语法与工具。

## 基本形态

```lean
structure Name params where
  field1 : ...
  field2 : ...
```

它会自动生成：

- 一个构造子
- 每个字段的 projection
- 结构体实例语法 `{ ... }`
- `with` 更新语法

## 字段与构造子

字段是结构体最重要的接口。相比普通单构造子 `inductive`，`structure` 的优势是：

- 字段名直接成为投影接口；
- 用户通常不必显式记住构造子参数顺序；
- 默认值、字段更新、继承等语法更自然。

## 结构体参数与依赖投影

structure 同样可能带参数，也可能让某些字段类型依赖于前面字段的值。这意味着结构体不仅是“普通记录”，还可表达精细的依赖类型关系。

## 结构体继承

`extends` 允许一个 structure 继承其他 structure 的字段。这更多是“字段并入与投影重用”，而不是面向对象意义上的子类型机制。

## 何时用 structure

- 只有一个自然 constructor；
- 主要通过具名字段使用；
- 希望支持 `{ ... }` 和 `with` 风格构造与更新。

若存在多个互斥构造方式，仍应回到普通 `inductive`。