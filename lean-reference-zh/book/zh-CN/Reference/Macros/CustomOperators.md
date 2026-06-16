# 自定义运算符

> 对应英文：[Custom Operators](https://lean-lang.org/doc/reference/latest/Notations-and-Macros/Custom-Operators/)，抓取日期：2026-06-16。

Lean 支持自定义 infix、prefix 和 postfix operator。任意 Lean 库都可以添加新 operator；这些 operator 与语言内建 operator 具有同等地位。每个 operator 都会被赋予一个作为函数的解释，operator 的使用会被翻译为函数调用。这个把 operator 翻译成函数调用的过程称为 expansion。

如果被调用的函数是 type class method，那么这个 operator 就可以通过定义 class instance 实现 overloading。

## Precedence 与 associativity

所有 operator 都有 precedence。precedence 决定不加括号的 expression 中 operation 的组合顺序。例如乘法优先级高于加法，因此 `2 + 3 * 4` 等价于 `2 + (3 * 4)`，而 `2 * 3 + 4` 等价于 `(2 * 3) + 4`。

infix operator 还具有 associativity，用于决定多个相同 precedence operator 连续出现时如何嵌套。

- **Left-associative**：向左嵌套。加法是 left-associative，因此 `2 + 3 + 4 + 5` 等价于 `((2 + 3) + 4) + 5`。
- **Right-associative**：向右嵌套。product type 是 right-associative，因此 `Nat × String × Unit × Option Int` 等价于 `Nat × (String × (Unit × Option Int))`。
- **Non-associative**：连续使用是语法错误，必须显式加括号。等号是 non-associative，因此 `1 + 2 = 3 = 2 + 1` 是错误。

## 定义 operator

Lean 提供以下 command 定义 operator：

```lean
infix:prec   " op " => f    -- non-associative infix
infixl:prec  " op " => f    -- left-associative infix
infixr:prec  " op " => f    -- right-associative infix
prefix:prec  "op "  => f    -- prefix
postfix:prec " op"  => f    -- postfix
```

这些 command 可以带 documentation comment 和 attribute。documentation comment 会在用户 hover operator 时显示；attribute 可以像其他 declaration 一样触发 compile-time metaprogram。`inherit_doc` attribute 会复用实现该 operator 的函数文档。

operator 与 section scope 的交互方式和 attribute 相同。默认情况下，operator 在传递 import 定义它的 module 后可用；也可以声明为 `scoped` 或 `local`，分别限制为打开当前 namespace 时可用或仅当前 section scope 可用。

custom operator 必须写 precedence specifier；没有默认 precedence。

## 名称与优先级

operator 可以显式命名。这个名称表示 Lean syntax extension，主要用于 metaprogramming。如果没有显式提供名称，Lean 会根据 operator 自动生成。不要依赖自动生成名称的具体形式：算法可能变化，上游依赖中类似 operator 也可能导致冲突。

当多个 operator 共享相同 syntax 时，parser 会尝试所有可能。若不止一个成功，Lean 会先选择使用最多输入的 parse，也就是 local longest-match rule。若多个 parse 覆盖相同输入范围，则用 operator priority 选择。若 priority 仍相同，parser 会保存所有结果，交给 elaborator 逐个尝试；只有恰好一个能 elaboration 成功时才接受。

## Operator 字符串限制

operator 由 string literal 给出，并须满足：

- 至少包含一个字符；
- 第一个字符不能是单引号或双引号，除非 operator 是 `''`；
- 不能以反引号加可能作为 quoted name 前缀的字符开始；
- 不能以数字开始；
- 不能包含内部 whitespace。

operator string 可以以空格开头或结尾。这些空格不是 operator syntax 的一部分，也不要求使用 operator 时必须留空格；它们只影响 Lean 向用户显示 operator 时是否插入空格。

## Expansion 与输出

operator 的含义写在 `=>` 后，可以是任意 Lean term。operator 使用会被 desugar 为函数应用：prefix/postfix operator 把单个参数作为显式参数传给该 term；infix operator 按左、右顺序传参。implicit 和 instance-implicit 参数在每个使用位置解析，因此 operator 可以由 type class method 定义。

如果 `=>` 后的 term 是全局函数名，或是全局函数名加若干参数的应用，Lean 会自动为该 operator 生成 unexpander。这样 proof state、error message 和其他输出中原本会显示函数调用的位置，会尽量显示为 operator。Lean 不记录用户原来是否写了 operator；它会在所有可能位置使用 operator 显示。
