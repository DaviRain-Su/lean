# 归纳类型声明

> 对应英文：[Inductive Type Declarations](https://lean-lang.org/doc/reference/latest/The-Type-System/Inductive-Types/#inductive-declarations)，抓取日期：2026-06-16。

归纳类型用 `inductive` 声明。它定义：

- 一个新的 type constructor
- 若干 constructor
- 与之匹配的 recursor / eliminator
- 相应 reduction 行为

## 基本语法

```lean
inductive Name params (: resultType)? where
  | ctor1 : ...
  | ctor2 : ...
  deriving ...
```

从类型论角度看，这不只是“列出几个构造子”，而是在向内核说明：

- 这种值如何生成；
- 之后允许如何对它做 case analysis 和递归。

## constructor

每个 constructor 都说明“怎样构造该类型的一个值”。构造子既可：

- 作为普通 term 中的函数使用；
- 也会影响归纳证明和递归函数的 recursor 形状。

## deriving

归纳类型可直接带 `deriving` 子句，为其自动生成：

- `Repr`
- `BEq`
- `DecidableEq`
- `Inhabited`
- 等等

这让很多日常数据类型无需手写基础实例。

## 匿名构造子语法

对单构造子或结构体风格的数据，Lean 还支持匿名构造子语法 `⟨ ... ⟩`。不过这只是高层语法糖；底层仍是普通 constructor 应用。

## 使用建议

- 设计归纳类型时，先想清楚它的 constructor 是否正好表达“最小生成规则”；
- 若只有一个 constructor 且明显是记录型数据，通常优先用 `structure`。