# recursor 类型

> 对应英文：[Recursor Types](https://lean-lang.org/doc/reference/latest/The-Type-System/Inductive-Types/#recursor-types)，抓取日期：2026-06-16。

每个归纳类型都会自动生成一个 recursor。其类型并不是“随便某个高阶函数”，而是精确编码了：

- motive
- 每个 constructor 对应的分支
- 最终要消去的值

## motive

recursor 类型中最关键的一项是 **motive**。它描述“对被分析值，要得到什么类型的结果”。

- 若只是普通 case analysis，motive 可是常量函数；
- 若是依赖消去，motive 会随输入值变化。

也正因如此，归纳证明和依赖类型模式匹配最终都能统一为 recursor 应用。

## 每个 constructor 一支

recursor 会为每个 constructor 接收一段“如果值由这个 constructor 构造，该怎么办”的分支。若 constructor 自身递归地引用该归纳类型，recursor 分支中通常还会收到对子部分递归调用后的结果。

## 最终参数

在所有分支之后，recursor 再接收真正待分析的归纳值。也就是说，recursor 类型把“证明规则”编码成了普通函数的参数顺序。

## 为什么要理解它

高层写法如：

- `match`
- `induction`
- 递归 `def`

在 elaboration 之后都会落到 recursor。理解 recursor 类型，能帮助你：

- 读懂 elaboration 结果；
- 理解 dependent pattern matching 为什么有时需要 motive；
- 判断某个归纳定义的 elimination 能力到底有多强。