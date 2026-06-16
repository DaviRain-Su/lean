# 第 9 章：结构体与记录

> 本译文对应原书 [Structures and Records](https://lean-lang.org/theorem_proving_in_lean4/Structures-and-Records/)；英文 Verso 源：`book/TPiL/StructuresAndRecords.lean`。

我们已看到 Lean 的基础系统包含归纳类型。更值得注意的是：仅凭类型宇宙、依赖箭头类型与归纳类型，就能构筑可观的数学大厦；其余皆由此导出。Lean 标准库含许多归纳类型实例（如 `Nat`、`Prod`、`List`），连逻辑联结词也用归纳类型定义。

回忆：仅含一个构造子的非递归归纳类型称为**结构体**（structure）或**记录**（record）。积类型是结构体，依赖积（Sigma）类型亦然。一般地，定义结构体 `S` 时，通常定义**投影**（projection）函数，以便「解构」`S` 的每个实例、取出字段中的值。`Prod.fst`、`Prod.snd` 返回对的第一、第二元素，即此类投影的例子。

写程序或形式化数学时，常定义含许多字段的结构体。Lean 的 **`structure`** 命令为此提供基础设施。用该命令定义结构体时，Lean 自动生成所有投影函数；还允许基于已定义结构体定义新结构体。此外，Lean 为定义给定结构体的实例提供便利记号。

## 9.1 声明结构体

**`structure`** 命令实质上是定义归纳数据类型的「前端」。每个 **`structure`** 声明引入同名命名空间。一般形式：

```
    structure <name> <parameters> <parent-structures> where
      <constructor> :: <fields>
```

多数部分可选。示例：

```lean
structure Point (α : Type u) where
  mk ::
  x : α
  y : α
```

（环境中有 `structure Point (α : Type u) where mk :: x : α y : α`、`variable (p : Point α) (a b : α)`。）

类型 `Point` 的值用 `Point.mk a b` 创建；点 `p` 的字段用 `Point.x p`、`Point.y p` 访问（`p.x`、`p.y` 也可，见下）。**`structure`** 还生成有用的 recursor 与定理。下面是上声明生成的一些构造：

```lean
structure Point (α : Type u) where
  mk ::
  x : α
  y : α
------
-- a Type
#check Point

-- the eliminator
#check @Point.rec

-- the constructor
#check @Point.mk -- @Point.mk : {α : Type u_1} → α → α → Point α

-- a projection
#check @Point.x -- @Point.x : {α : Type u_1} → Point α → α

-- a projection
#check @Point.y -- @Point.y : {α : Type u_1} → Point α → α
```

若未提供构造子名，默认命名为 `mk`。

下面是使用生成构造的简单定理与表达式。照例可用 **`open Point`** 避免 `Point` 前缀：

```lean
structure Point (α : Type u) where
  x : α
  y : α
------
#eval Point.x (Point.mk 10 20) -- 10

#eval Point.y (Point.mk 10 20) -- 20

open Point

example (a b : α) : x (mk a b) = a :=
  rfl

example (a b : α) : y (mk a b) = b :=
  rfl
```

（环境中有 `structure Point (α : Type u) where x : α y : α`、`variable (p : Point Nat)`。）

给定 `p : Point Nat`，点记法 `p.x` 是 `Point.x p` 的简写，便于访问结构体字段。

```lean
structure Point (α : Type u) where
 x : α
 y : α
------
def p := Point.mk 10 20

#check p.x  -- p.x : Nat
#eval p.x   -- 10
#eval p.y   -- 20
```

点记法不仅便于访问记录投影，也便于应用同命名空间中定义的函数。回忆合取一节：若 `p` 有类型 `Point`，表达式 `p.foo` 解释为 `Point.foo p`，假定 `foo` 的第一个非隐式参数类型为 `Point`。下例中 `p.add q` 因此是 `Point.add p q` 的简写：

```lean
structure Point (α : Type u) where
  x : α
  y : α
deriving Repr

def Point.add (p q : Point Nat) :=
  mk (p.x + q.x) (p.y + q.y)

def p : Point Nat := Point.mk 1 2
def q : Point Nat := Point.mk 3 4

#eval p.add q  -- { x := 4, y := 6 }
```

（环境中有 `structure Point (α : Type u) where x : α y : α deriving Repr`、`variable {α : Type u}`。）

下一章将学习如何定义像 `add` 这样的函数，使其对 `Point α` 而不仅是 `Point Nat` 泛化工作，假定 `α` 有关联的加法运算。

更一般地，给定表达式 `p.foo x y z` 且 `p : Point`，Lean 会把 `p` 插入 `Point.foo` 的第一个类型为 `Point` 的参数。例如下面标量乘法的定义中，`p.smul 3` 解释为 `Point.smul 3 p`：

```lean
structure Point (α : Type u) where
 x : α
 y : α
 deriving Repr
------
def Point.smul (n : Nat) (p : Point Nat) :=
  Point.mk (n * p.x) (n * p.y)

def p : Point Nat := Point.mk 1 2

#eval p.smul 3  -- { x := 3, y := 6 }

example {p : Point Nat} : p.smul 3 = Point.smul 3 p := rfl
```

对 `List.map` 也常用类似技巧——它把列表作为第二个非隐式参数：

```lean
#check @List.map

def xs : List Nat := [1, 2, 3]
def f : Nat → Nat := fun x => x * x

#eval xs.map f  -- [1, 4, 9]

example {xs : List α} {f : α → β} :
    xs.map f = List.map f xs :=
  rfl
```

这里 `xs.map f` 解释为 `List.map f xs`。

## 9.2 对象

我们一直用构造子创建结构体类型的元素。对含许多字段的结构体，这常不便，因为须记住字段定义顺序。Lean 因此提供下列定义结构体类型元素的替代记号：

```
    { (<field-name> := <expr>)* : structure-type }
    or
    { (<field-name> := <expr>)* }
```

只要可从期望类型推断结构体名，后缀 `: structure-type` 可省略。例如用该记号定义「点」。字段指定顺序无关，下列表达式均定义同一点：

```lean
structure Point (α : Type u) where
  x : α
  y : α

#check { x := 10, y := 20 : Point Nat }  -- { x := 10, y := 20 } : Point Nat

#check { y := 20, x := 10 : Point _ } -- { x := 10, y := 20 } : Point Nat

#check ({ x := 10, y := 20 } : Point Nat) -- { x := 10, y := 20 } : Point Nat

example : Point Nat :=
  { y := 20, x := 10 }
```

字段可用花括号标为隐式；隐式字段成为构造子的隐式参数。

若未指定字段值，Lean 尝试推断。无法推断时 Lean 报错，指出对应占位符无法合成：

```lean
structure MyStruct where
    {α : Type u}
    {β : Type v}
    a : α
    b : β

#check { a := 10, b := true : MyStruct }
```

**记录更新**（record update）是另一常见操作：通过修改旧记录中一个或多个字段的值创建新记录对象。Lean 允许在字段赋值前加注解 `s with`（`s` 为先前定义的结构体对象），未赋值字段取自 `s`。若提供多个记录对象，按顺序访问直至找到含未指定字段的对象。访问完所有对象后仍有未指定字段名则报错。

```lean
structure Point (α : Type u) where
  x : α
  y : α
deriving Repr

def p : Point Nat :=
  { x := 1, y := 2 }

#eval { p with y := 3 }  -- { x := 1, y := 3 }

#eval { p with x := 4 }  -- { x := 4, y := 2 }

structure Point3 (α : Type u) where
  x : α
  y : α
  z : α

def q : Point3 Nat :=
  { x := 5, y := 5, z := 5 }

def r : Point3 Nat :=
  { p, q with x := 6 }

example : r.x = 6 := rfl
example : r.y = 2 := rfl
example : r.z = 5 := rfl
```

## 9.3 继承

可**扩展**已有结构体、添加新字段，以模拟一种**继承**（inheritance）：

```lean
structure Point (α : Type u) where
  x : α
  y : α

inductive Color where
  | red | green | blue

structure ColorPoint (α : Type u) extends Point α where
  c : Color
```

下例用多重继承定义结构体，再用父结构体的对象定义对象：

```lean
structure Point (α : Type u) where
  x : α
  y : α
  z : α

structure RGBValue where
  red : Nat
  green : Nat
  blue : Nat

structure RedGreenPoint (α : Type u) extends Point α, RGBValue where
  no_blue : blue = 0

def p : Point Nat :=
  { x := 10, y := 10, z := 20 }

def rgp : RedGreenPoint Nat :=
  { p with red := 200, green := 40, blue := 0, no_blue := rfl }

example : rgp.x   = 10 := rfl
example : rgp.red = 200 := rfl
```