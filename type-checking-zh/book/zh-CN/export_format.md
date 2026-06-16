# 导出格式

导出器（exporter）是一种程序，它以内核语言导出 Lean 中的声明，以便外部的类型检查器使用。生成一个导出文件即意味着完全脱离了 Lean 生态系统；文件中的数据可由完全外部的软件进行检查，且导出器自身并不是一个可信组件。用户无需直接查看导出文件，以确认导出的声明是否符合开发者的原意；相反，导出的声明将由外部检查器检查，再通过美观打印器（pretty printer）以更易读的形式展示给用户。读者可以（且被鼓励）自行编写外部检查器来处理 Lean 的导出文件。

官方的导出器为：[lean4export](https://github.com/leanprover/lean4export)。

官方导出器的 master 分支沿用了 Lean 3 的基本格式（参见 [此处](https://github.com/leanprover/lean3/blob/master/doc/export_format.md)），但增加了 Lean 4 新增的内容，包括 **投影（projections）** 、 **字面量（literals）** 和显式的 let 表达式（let expressions）支持。这些新增内容已在 lean4export 的 readme 中详细描述。

另外，[此 lean4export 的 fork 版本](https://github.com/ammkrn/lean4export/tree/format2024)对导出格式进行了轻微修改，具体说明如下：该版本新增了对 **可约性提示（reducibility hints）** 、 **商类型声明（quotient declarations）** 、递归器（recursors）**以及** ι-化简规则（rec rules）的导出支持。这些新增导出特性旨在提供更大的实现灵活性与更好的性能表现，同时也便于开发更为简洁的软件，以便于试验；并能简化类型检查器的自举（bootstrapping）及测试过程。

此外，社区也在[持续讨论](https://github.com/leanprover/lean4export/issues/3)如何更好地优化导出格式。

## (ver 0.1.2)

为了清晰起见，下述复合元素标记了名称，例如 `(name : T)`，但在实际导出文件中，它们仅表现为类型 `T` 的元素，不包含额外标记。

互递归（mutual）与嵌套（nested）归纳类型的导出方案如下：

* `Inductive.inductiveNames` 包含 `mutual ... end` 区块中所有归纳类型的名称。不包括任何其他嵌套（但非互递归）构造中的归纳类型名称。
* `Inductive.constructorNames` 仅包含对应归纳类型自身的所有构造子（constructor）名称，不含其他类型的构造子（即不含互递归区块中其他类型的构造子，也不含嵌套构造中的构造子）。

**注意**：自己编写解析器和检查器的读者应注意初始化 `names[0]` 为匿名名称（anonymous name），并初始化 `levels[0]` 为宇宙层级零（universe zero），因为导出器不会显式导出它们，但会假定它们分别占据索引 0 的名称和层级位置。

```lean
File ::= ExportFormatVersion Item*

ExportFormatVersion ::= nat '.' nat '.' nat

Item ::= Name | Universe | Expr | RecRule | Declaration

Declaration ::= 
    | Axiom 
    | Quotient 
    | Definition 
    | Theorem 
    | Inductive 
    | Constructor 
    | Recursor

nidx, uidx, eidx, ridx ::= nat

Name ::=
  | nidx "#NS" nidx string
  | nidx "#NI" nidx nat

Universe ::=
  | uidx "#US"  uidx
  | uidx "#UM"  uidx uidx
  | uidx "#UIM" uidx uidx
  | uidx "#UP"  nidx

Expr ::=
  | eidx "#EV"  nat
  | eidx "#ES"  uidx
  | eidx "#EC"  nidx uidx*
  | eidx "#EA"  eidx eidx
  | eidx "#EL"  Info nidx eidx eidx
  | eidx "#EP"  Info nidx eidx eidx
  | eidx "#EZ"  Info nidx eidx eidx eidx
  | eidx "#EJ"  nidx nat eidx
  | eidx "#ELN" nat
  | eidx "#ELS" (hexhex)*
  -- metadata node w/o extensions
  | eidx "#EM" mptr eidx

Info ::= "#BD" | "#BI" | "#BS" | "#BC"

Hint ::= "O" | "A" | "R" nat

RecRule ::= ridx "#RR" (ctorName : nidx) (nFields : nat) (val : eidx)

Axiom ::= "#AX" (name : nidx) (type : eidx) (uparams : uidx*)

Def ::= "#DEF" (name : nidx) (type : eidx) (value : eidx) (hint : Hint) (uparams : uidx*)
  
Theorem ::= "#THM" (name : nidx) (type : eidx) (value : eidx) (uparams: uidx*)

Quotient ::= "#QUOT" (name : nidx) (type : eidx) (uparams : uidx*)

Inductive ::= 
  "#IND"
  (name : nidx) 
  (type : eidx) 
  (isRecursive: 0 | 1)
  (isNested : 0 | 1)
  (numParams: nat) 
  (numIndices: nat)
  (numInductives: nat)
  (inductiveNames: nidx {numInductives})
  (numConstructors : nat) 
  (constructorNames : nidx {numConstructors}) 
  (uparams: uidx*)

Constructor ::= 
  "#CTOR"
  (name : nidx) 
  (type : eidx) 
  (parentInductive : nidx) 
  (constructorIndex : nat)
  (numParams : nat)
  (numFields : nat)
  (uparams: uidx*)

Recursor ::= 
  "#REC"
  (name : nidx)
  (type : eidx)
  (numInductives : nat)
  (inductiveNames: nidx {numInductives})
  (numParams : nat)
  (numIndices : nat)
  (numMotives : nat)
  (numMinors : nat)
  (numRules : nat)
  (recRules : ridx {numRules})
  (k : 1 | 0)
  (uparams : uidx*)
```
