## 通过繁饰嵌入 DSL

在本章中，我们将学习如何通过繁饰（elaboration）来构建一个领域特定语言（DSL）。我们不会全面探索 `MetaM` 的全部功能，而是简单地演示如何访问这个底层机制。

更具体地说，我们将使 Lean 理解 [IMP](http://concrete-semantics.org/concrete-semantics.pdf) 的语法。IMP 是一个简单的命令式语言，通常用于教学操作和指称语义。

我们不会完全按照书中的编码方式来定义所有内容。比如，书中定义了算术表达式和布尔表达式。而我们将走一条不同的路径，只定义接受一元或二元运算符的通用表达式。

这意味着我们将允许出现像 `1 + true` 这样的奇怪表达式！不过这会简化编码、语法以及元编程的教学过程。

### 定义抽象语法树（AST）

我们首先定义我们的原子字面量：

```lean
import Lean
```

```lean
open Lean Elab Meta
```

```lean
inductive IMPLit
```

```lean
| nat  : Nat  → IMPLit
```

```lean
| bool : Bool → IMPLit
```

```lean
/- 这是我们唯一的一个一元运算符： -/
```

```lean
inductive IMPUnOp
```

```lean
| not
```

```lean
/- 接下来是我们的二元运算符： -/
```

```lean
inductive IMPBinOp
```

```lean
| and | add | less
```

```lean
/- 现在我们定义我们要处理的表达式： -/
```

```lean
inductive IMPExpr
```

```lean
| lit : IMPLit → IMPExpr
```

```lean
| var : String → IMPExpr
```

```lean
| un  : IMPUnOp → IMPExpr → IMPExpr
```

```lean
| bin : IMPBinOp → IMPExpr → IMPExpr → IMPExpr
```

```lean
/-
最后，我们定义语言中的命令。我们遵循书中的结构，表示「程序的每个部分也是一个程序」：
-/
```

```lean
inductive IMPProgram
```

```lean
| Skip   : IMPProgram
```

```lean
| Assign : String → IMPExpr → IMPProgram
```

```lean
| Seq    : IMPProgram → IMPProgram → IMPProgram
```

```lean
| If     : IMPExpr → IMPProgram → IMPProgram → IMPProgram
```

```lean
| While  : IMPExpr → IMPProgram → IMPProgram
```

```lean
/-
### 繁饰字面量

现在我们已经定义了数据类型，接下来我们将 `Syntax` 转换为 `Expr` 类型的项。我们从定义字面量的语法和繁饰函数开始。
-/
```

```lean
declare_syntax_cat imp_lit
```

```lean
syntax num       : imp_lit
```

```lean
syntax "true"    : imp_lit
```

```lean
syntax "false"   : imp_lit
```

```lean
def elabIMPLit : Syntax → MetaM Expr
```

```lean
-- `mkAppM` 由给定函数 `Name` 和参数，创建一个 `Expr.app`，
```

```lean
-- `mkNatLit` 由一个 `Nat` 创建一个 `Expr`
```

```lean
| `(imp_lit| $n:num) => mkAppM ``IMPLit.nat  #[mkNatLit n.getNat]
```

```lean
| `(imp_lit| true  ) => mkAppM ``IMPLit.bool #[.const ``Bool.true []]
```

```lean
| `(imp_lit| false ) => mkAppM ``IMPLit.bool #[.const ``Bool.false []]
```

```lean
| _ => throwUnsupportedSyntax
```

```lean
elab "test_elabIMPLit " l:imp_lit : term => elabIMPLit l
```

```lean
#reduce test_elabIMPLit 4     -- IMPLit.nat 4
```

```lean
#reduce test_elabIMPLit true  -- IMPLit.bool true
```

```lean
#reduce test_elabIMPLit false -- IMPLit.bool true
```

```lean
/-
### 繁饰表达式

为了繁饰表达式，我们还需要繁饰一元和二元运算符：

请注意，这些实际上可以是纯函数（`Syntax → Expr`），但我们选择在 `MetaM` 中处理，因为这样可以更方便地抛出匹配完成的错误。
-/
```

```lean
declare_syntax_cat imp_unop
```

```lean
syntax "not"     : imp_unop
```

```lean
def elabIMPUnOp : Syntax → MetaM Expr
```

```lean
| `(imp_unop| not) => return .const ``IMPUnOp.not []
```

```lean
| _ => throwUnsupportedSyntax
```

```lean
declare_syntax_cat imp_binop
```

```lean
syntax "+"       : imp_binop
```

```lean
syntax "and"     : imp_binop
```

```lean
syntax "<"       : imp_binop
```

```lean
def elabIMPBinOp : Syntax → MetaM Expr
```

```lean
| `(imp_binop| +)   => return .const ``IMPBinOp.add []
```

```lean
| `(imp_binop| and) => return .const ``IMPBinOp.and []
```

```lean
| `(imp_binop| <)   => return .const ``IMPBinOp.less []
```

```lean
| _ => throwUnsupportedSyntax
```

```lean
/-现在我们定义表达式的语法：-/
```

```lean
declare_syntax_cat                   imp_expr
```

```lean
syntax imp_lit                     : imp_expr
```

```lean
syntax ident                       : imp_expr
```

```lean
syntax imp_unop imp_expr           : imp_expr
```

```lean
syntax imp_expr imp_binop imp_expr : imp_expr
```

```lean
/-我们还允许括号表示解析的优先级：-/
```

```lean
syntax "(" imp_expr ")" : imp_expr
```

```lean
/-
最后，我们定义递归繁饰表达式的函数：注意，表达式可以是递归的。这意味着我们的 `elabIMPExpr` 函数需要是递归的！我们需要使用 `partial`，因为 Lean 不能仅凭 `Syntax` 的消耗来证明终止性。
-/
```

```lean
partial def elabIMPExpr : Syntax → MetaM Expr
```

```lean
| `(imp_expr| $l:imp_lit) => do
```

```lean
let l ← elabIMPLit l
```

```lean
mkAppM ``IMPExpr.lit #[l]
```

```lean
-- `mkStrLit` 由一个 `String` 创建一个 `Expr`
```

```lean
| `(imp_expr| $i:ident) => mkAppM ``IMPExpr.var #[mkStrLit i.getId.toString]
```

```lean
| `(imp_expr| $b:imp_unop $e:imp_expr) => do
```

```lean
let b ← elabIMPUnOp b
```

```lean
let e ← elabIMPExpr e -- 递归!
```

```lean
mkAppM ``IMPExpr.un #[b, e]
```

```lean
| `(imp_expr| $l:imp_expr $b:imp_binop $r:imp_expr) => do
```

```lean
let l ← elabIMPExpr l -- 递归!
```

```lean
let r ← elabIMPExpr r -- 递归!
```

```lean
let b ← elabIMPBinOp b
```

```lean
mkAppM ``IMPExpr.bin #[b, l, r]
```

```lean
| `(imp_expr| ($e:imp_expr)) => elabIMPExpr e
```

```lean
| _ => throwUnsupportedSyntax
```

```lean
elab "test_elabIMPExpr " e:imp_expr : term => elabIMPExpr e
```

```lean
#reduce test_elabIMPExpr a
```

```lean
-- IMPExpr.var "a"
```

```lean
#reduce test_elabIMPExpr a + 5
```

```lean
-- IMPExpr.bin IMPBinOp.add (IMPExpr.var "a") (IMPExpr.lit (IMPLit.nat 5))
```

```lean
#reduce test_elabIMPExpr 1 + true
```

```lean
-- IMPExpr.bin IMPBinOp.add (IMPExpr.lit (IMPLit.nat 1)) (IMPExpr.lit (IMPLit.bool true))
```

```lean
/-
### 繁饰程序

现在我们有了繁饰 IMP 程序所需的一切！
-/
```

```lean
declare_syntax_cat           imp_program
```

```lean
syntax "skip"              : imp_program
```

```lean
syntax ident ":=" imp_expr : imp_program
```

```lean
syntax imp_program ";;" imp_program : imp_program
```

```lean
syntax "if" imp_expr "then" imp_program "else" imp_program "fi" : imp_program
```

```lean
syntax "while" imp_expr "do" imp_program "od" : imp_program
```

```lean
partial def elabIMPProgram : Syntax → MetaM Expr
```

```lean
| `(imp_program| skip) => return .const ``IMPProgram.Skip []
```

```lean
| `(imp_program| $i:ident := $e:imp_expr) => do
```

```lean
let i : Expr := mkStrLit i.getId.toString
```

```lean
let e ← elabIMPExpr e
```

```lean
mkAppM ``IMPProgram.Assign #[i, e]
```

```lean
| `(imp_program| $p₁:imp_program ;; $p₂:imp_program) => do
```

```lean
let p₁ ← elabIMPProgram p₁
```

```lean
let p₂ ← elabIMPProgram p₂
```

```lean
mkAppM ``IMPProgram.Seq #[p₁, p₂]
```

```lean
| `(imp_program| if $e:imp_expr then $pT:imp_program else $pF:imp_program fi) => do
```

```lean
let e ← elabIMPExpr e
```

```lean
let pT ← elabIMPProgram pT
```

```lean
let pF ← elabIMPProgram pF
```

```lean
mkAppM ``IMPProgram.If #[e, pT, pF]
```

```lean
| `(imp_program| while $e:imp_expr do $pT:imp_program od) => do
```

```lean
let e ← elabIMPExpr e
```

```lean
let pT ← elabIMPProgram pT
```

```lean
mkAppM ``IMPProgram.While #[e, pT]
```

```lean
| _ => throwUnsupportedSyntax
```

```lean
/-
然后我们就可以测试完整的繁饰流程了。遵循以下语法：
-/
```

```lean
elab ">>" p:imp_program "<<" : term => elabIMPProgram p
```

```lean
#reduce >>
```

```lean
a := 5;;
```

```lean
if not a and 3 < 4 then
```

```lean
c := 5
```

```lean
else
```

```lean
a := a + 1
```

```lean
fi;;
```

```lean
b := 10
```

```lean
<<
```

```lean
-- IMPProgram.Seq (IMPProgram.Assign "a" (IMPExpr.lit (IMPLit.nat 5)))
```

```lean
--   (IMPProgram.Seq
```

```lean
--     (IMPProgram.If
```

```lean
--       (IMPExpr.un IMPUnOp.not
```

```lean
--         (IMPExpr.bin IMPBinOp.and (IMPExpr.var "a")
```

```lean
--           (IMPExpr.bin IMPBinOp.less (IMPExpr.lit (IMPLit.nat 3)) (IMPExpr.lit (IMPLit.nat 4)))))
```

```lean
--       (IMPProgram.Assign "c" (IMPExpr.lit (IMPLit.nat 5)))
```

```lean
--       (IMPProgram.Assign "a" (IMPExpr.bin IMPBinOp.add (IMPExpr.var "a") (IMPExpr.lit (IMPLit.nat 1)))))
```

```lean
--     (IMPProgram.Assign "b" (IMPExpr.lit (IMPLit.nat 10))))
```
