# structure 继承

> 对应英文：[Structure Inheritance](https://lean-lang.org/doc/reference/latest/The-Type-System/Inductive-Types/#structure-inheritance)，抓取日期：2026-06-16。

`structure` 支持 `extends`，用来把父结构的字段并入当前结构。它更像“字段复用”和“投影重用”，而不是面向对象语言里的运行时子类型机制。

## 基本形式

```lean
structure Child extends Parent where
  extra : ...
```

也可以同时继承多个结构。

## 继承带来的结果

- 父结构字段会成为子结构可用字段；
- 子结构会生成相应 projection；
- structure instance 语法和 `with` 更新语法也会把继承字段纳入考虑。

## 逻辑视角

从类型论角度看，子结构仍是一个新的单构造子归纳类型。`extends` 不会让 `Child` 自动成为“等同于”`Parent` 的值；它只是让 `Child` 具备足够信息，可投影回 `Parent` 的各字段。

## 使用建议

- 若只是想复用字段组织，`extends` 很方便；
- 若结构层级过深，应警惕字段名冲突和可读性下降；
- 若真正需要的是抽象接口与实例搜索，优先考虑 type class，而不是滥用 structure 继承。