# 第 10 章：类型类

> 本译文对应原书 [Type Classes](https://lean-lang.org/theorem_proving_in_lean4/Type-Classes/)；英文 Verso 源：`book/TPiL/TypeClasses.lean`。

类型类（type classes）最初是为在函数式编程语言中实现特设多态（ad-hoc polymorphism）而引入的一种原则性方法。我们首先观察到：若一个特设多态函数（例如加法）只需把类型特定的加法实现作为参数，再在其余参数上调用该实现，那么实现起来会很容易。例如，假设在 Lean 中声明一个结构体来保存加法的实现：

```lean
namespace Ex
------
structure Add (α : Type) where
  add : α → α → α

#check @Add.add -- @Add.add : {α : Type} → Add α → α → α → α
------
end Ex
```

（环境中有 `namespace Ex`、`structure Add (α : Type) where add : α → α → α`、`variable {n : Nat}`。）

在上述 Lean 代码中，字段 `add` 的类型为 `Add.add : {α : Type} → Add α → α → α → α`，其中类型 `α` 周围的花括号表示它是隐式参数。我们可以这样实现 `double`：

```lean
namespace Ex
structure Add (α : Type) where
  add : α → α → α
------
def double (s : Add α) (x : α) : α :=
  s.add x x

#eval double { add := Nat.add } 10 -- 20

#eval double { add := Nat.mul } 10 -- 100

#eval double { add := Int.add } 10 -- 20
------
end Ex
```

注意，可以用 `double { add := Nat.add } n` 把自然数 `n` 加倍。当然，让用户以这种方式手动传递实现会非常繁琐，而且这几乎会抵消特设多态的大部分潜在好处。

类型类背后的主要思想是：把诸如 `Add α` 之类的参数变为隐式的，并利用用户定义的实例数据库，通过称为**类型类推断**（typeclass resolution）的过程自动合成所需实例。在 Lean 中，把上例中的 `structure` 改为 `class`，`Add.add` 的类型就变成：

```lean
namespace Ex
------
class Add (α : Type) where
  add : α → α → α

#check @Add.add -- @Add.add : {α : Type} → [self : Add α] → α → α → α
------
end Ex
```

其中方括号表示类型为 `Add α` 的参数是**实例隐式**（instance implicit）的，即应通过类型类推断来合成。这个版本的 `add` 是 Haskell 项 `add :: Add a => a -> a -> a` 在 Lean 中的对应物。类似地，我们可以这样注册实例：

```lean
namespace Ex
class Add (α : Type) where
  add : α → α → α
------
instance : Add Nat where
  add := Nat.add

instance : Add Int where
  add := Int.add

instance : Add Float where
  add := Float.add
------
end Ex
```

（环境中有 `namespace Ex`、`class Add`、`instance : Add Nat/Int/Float`、`variable (n m : Nat)`。）

于是对 `n : Nat` 和 `m : Nat`，项 `Add.add n m` 会触发类型类推断，目标是 `Add Nat`，类型类推断会合成上面对 `Nat` 的实例。我们现在可以用实例隐式重新实现 `double`：

```lean
namespace Ex
class Add (α : Type) where
  add : α → α → α
instance : Add Nat where
 add := Nat.add
instance : Add Int where
 add := Int.add
instance : Add Float where
 add := Float.add
------
def double [Add α] (x : α) : α :=
  Add.add x x

#check @double -- @double : {α : Type} → [Add α] → α → α

#eval double 10 -- 20

#eval double (10 : Int) -- 20

#eval double (7 : Float) -- 14.000000

#eval double (239.0 + 2) -- 482.000000

------
end Ex
```

一般而言，实例可能以复杂方式依赖其他实例。例如，可以声明一个实例：若 `α` 有加法，则 `Array α` 也有加法：

```lean
instance [Add α] : Add (Array α) where
  add x y := Array.zipWith (· + ·) x y

#eval Add.add #[1, 2] #[3, 4] -- #[4, 6]

#eval #[1, 2] + #[3, 4] -- #[4, 6]
```

注意 `(· + ·)` 是 Lean 中 `fun x y => x + y` 的记法。

（环境中有 `def head [Inhabited α] (xs : List α) : α := default`、`variable {α : Type u} {x : α} {xs : List α} [Inhabited α]`。）

上例展示了类型类如何用于重载记法。现在我们探索另一种应用。我们常常需要给定类型的任意元素。回忆：在 Lean 中，类型可能没有任何元素。我们经常希望定义在「边角情况」下返回类型的任意元素。例如，我们可能希望当 `xs` 的类型为 `List α` 时，表达式 `head xs` 的类型为 `α`。类似地，许多定理在类型非空的附加假设下成立。例如，若 `α` 是类型，则 `∃ x : α, x = x` 仅当 `α` 非空时为真。标准库定义了类型类 `Inhabited`，使类型类推断能为有元素的类型推断一个「默认」元素。让我们从上面程序的第一步开始，声明合适的类：

```lean
namespace Ex
------
class Inhabited (α : Type u) where
  default : α

#check @Inhabited.default -- @Inhabited.default : {α : Type u_1} → [self : Inhabited α] → α
------
end Ex
```

注意 `Inhabited.default` 没有任何显式参数。

类 `Inhabited α` 的元素就是形如 `Inhabited.mk x` 的表达式，其中 `x : α`。投影 `Inhabited.default` 允许我们从 `Inhabited α` 的元素中「提取」`α` 的这样一个元素。现在我们用若干实例填充该类：

```lean
namespace Ex
class Inhabited (a : Type _) where
 default : a
------
instance : Inhabited Bool where
  default := true

instance : Inhabited Nat where
  default := 0

instance : Inhabited Unit where
  default := ()

instance : Inhabited Prop where
  default := True

#eval (Inhabited.default : Nat) -- 0

#eval (Inhabited.default : Bool) -- true
--------
end Ex
```

可以用命令 `export` 为 `Inhabited.default` 创建别名 `default`：

```lean
namespace Ex
class Inhabited (a : Type _) where
 default : a
instance : Inhabited Bool where
 default := true
instance : Inhabited Nat where
 default := 0
instance : Inhabited Unit where
 default := ()
instance : Inhabited Prop where
 default := True
------
export Inhabited (default)

#eval (default : Nat) -- 0

#eval (default : Bool) -- true
------
end Ex
```

## 10.1 链接实例

若类型类推断仅此而已，它并不那么令人印象深刻；那不过是让 elaborator 在查找表中寻找实例列表的机制。类型类推断的强大之处在于可以**链接**（chain）实例：实例声明本身可以依赖类型类的隐式实例。这会使类推断递归地穿过实例，必要时回溯，进行类似 Prolog 的搜索。

例如，下列定义表明：若两个类型 `α` 和 `β` 有元素，则它们的积也有：

```lean
instance [Inhabited α] [Inhabited β] : Inhabited (α × β) where
  default := (default, default)
```

把这一点加入先前的实例声明后，类型类推断可以推断出例如 `Nat × Bool` 的默认元素：

```lean
namespace Ex
class Inhabited (α : Type u) where
 default : α
instance : Inhabited Bool where
 default := true
instance : Inhabited Nat where
 default := 0
opaque default [Inhabited α] : α :=
 Inhabited.default
------
instance [Inhabited α] [Inhabited β] : Inhabited (α × β) where
  default := (default, default)

#eval (default : Nat × Bool) -- (0, true)
------
end Ex
```

类似地，我们可以用合适的常值函数使函数类型有元素：

```lean
instance [Inhabited β] : Inhabited (α → β) where
  default := fun _ => default
```

作为练习，试着为其他类型（如 `List` 和 `Sum`）定义默认实例。

（环境中有 `universe u`、`set_option checkBinderAnnotations false`。）

Lean 标准库包含定义 `inferInstance`，其类型为 `{α : Sort u} → [i : α] → α`，在期望类型为实例时用于触发类型类推断过程。

```lean
#check (inferInstance : Inhabited Nat) -- inferInstance : Inhabited Nat

def foo : Inhabited (Nat × Nat) :=
  inferInstance

theorem ex : foo.default = (default, default) :=
  rfl
```

可以用命令 `#print` 查看 `inferInstance` 有多简单：

```lean
#print inferInstance
```

## 10.2 ToString

（环境中有 `universe u`。）

多态方法 `toString` 的类型为 `{α : Type u} → [ToString α] → α → String`。你可以为自己的类型实现实例，并通过链接把复杂值转换为字符串。Lean 为大多数内建类型提供了 `ToString` 实例。

```lean
structure Person where
  name : String
  age  : Nat

instance : ToString Person where
  toString p := p.name ++ "@" ++ toString p.age

#eval toString { name := "Leo", age := 542 : Person } -- "Leo@542"

#eval toString ({ name := "Daniel", age := 18 : Person }, "hello") -- "(Daniel@18, hello)"
```

## 10.3 数字字面量

数字字面量在 Lean 中是多态的。可以用数字字面量（例如 `2`）表示实现了类型类 `OfNat` 的任意类型的元素。

```lean
structure Rational where
  num : Int
  den : Nat
  inv : den ≠ 0

instance : OfNat Rational n where
  ofNat := { num := n, den := 1, inv := by decide }

instance : ToString Rational where
  toString r := s!"{r.num}/{r.den}"

#eval (2 : Rational) -- 2/1

#check (2 : Rational) -- 2 : Rational

#check (2 : Nat)      -- 2 : Nat
```

（环境中有 `structure Rational`、`instance : OfNat Rational n`、`instance : ToString Rational`。）

Lean 把项 `(2 : Nat)` 和 `(2 : Rational)` 分别展开为 `@OfNat.ofNat Nat 2 (@instOfNatNat 2)` 和 `@OfNat.ofNat Rational 2 (@instOfNatRational 2)`。我们说展开后项中出现的数字字面量 `2` 是**原始**自然数。可以用宏 `nat_lit 2` 输入原始自然数 `2`。

```lean
#check nat_lit 2  -- 2 : Nat
```

原始自然数**不是**多态的。

`OfNat` 实例对数字字面量是参数化的。因此可以为特定数字字面量定义实例。第二个参数常是变量（如上例），或是**原始**自然数。

```lean
class Monoid (α : Type u) where
  unit : α
  op   : α → α → α

instance [s : Monoid α] : OfNat α (nat_lit 1) where
  ofNat := s.unit

def getUnit [Monoid α] : α :=
  1
```

## 10.4 输出参数

（环境中有 `universe u`、`variable (T : Type u)`。）

默认情况下，仅当项 `T` 已知且不包含缺失部分时，Lean 才会尝试合成实例 `Inhabited T`。下列命令会产生错误 `typeclass instance problem is stuck, it is often due to metavariables`，因为类型含有缺失部分（即 `_`）。

```lean
/--
error: typeclass instance problem is stuck, it is often due to metavariables
  Inhabited (Nat × ?m.2)
-/
#guard_msgs (error) in
#eval (inferInstance : Inhabited (Nat × _))
```

可以把类型类 `Inhabited` 的参数视为类型类合成器的**输入**值。当类型类有多个参数时，可以把其中一些标为**输出参数**（output parameters）。即使这些参数有缺失部分，Lean 也会启动类型类合成器。下例用输出参数定义**异构**多态乘法。

```lean
namespace Ex
------
class HMul (α : Type u) (β : Type v) (γ : outParam (Type w)) where
  hMul : α → β → γ

export HMul (hMul)

instance : HMul Nat Nat Nat where
  hMul := Nat.mul

instance : HMul Nat (Array Nat) (Array Nat) where
  hMul a bs := bs.map (fun b => hMul a b)

#eval hMul 4 3           -- 12

#eval hMul 4 #[2, 3, 4]  -- #[8, 12, 16]
------
end Ex
```

参数 `α` 和 `β` 被视为输入参数，`γ` 被视为输出参数。给定应用 `hMul a b`，在 `a` 和 `b` 的类型已知后，类型类合成器被调用，所得类型来自输出参数 `γ`。上例中我们定义了两个实例：第一个是自然数的齐次乘法，第二个是数组的标量乘法。注意你可以链接实例并推广第二个实例。

```lean
namespace Ex
------
class HMul (α : Type u) (β : Type v) (γ : outParam (Type w)) where
  hMul : α → β → γ

export HMul (hMul)

instance : HMul Nat Nat Nat where
  hMul := Nat.mul

instance : HMul Int Int Int where
  hMul := Int.mul

instance [HMul α β γ] : HMul α (Array β) (Array γ) where
  hMul a bs := bs.map (fun b => hMul a b)

#eval hMul 4 3                    -- 12

#eval hMul 4 #[2, 3, 4]           -- #[8, 12, 16]

#eval hMul (-2) #[3, -1, 4]       -- #[-6, 2, -8]

#eval hMul 2 #[#[2, 3], #[0, 4]]  -- #[#[4, 6], #[0, 8]]
------
end Ex
```

只要你有实例 `HMul α β γ`，就可以在类型为 `Array β` 的数组上对类型为 `α` 的标量使用新的标量数组乘法实例。在最后一个 `#eval` 中，注意该实例在数组的数组上被使用了两次。

输出参数在实例合成时会被忽略。即使实例合成发生在输出参数值已确定的上下文中，它们的值也会被忽略。一旦用输入参数找到实例，Lean 会确保已知的输出参数值与找到的实例一致。

Lean 还有**半输出参数**（semi-output parameters），兼具输入参数与输出参数的部分特征。与输入参数一样，半输出参数在选择实例时会被考虑；与输出参数一样，它们可用于实例化未知值，但并非唯一地这样做。带半输出参数的实例合成更难预测，因为考虑实例的顺序可能决定选中哪一个，但也更灵活。

## 10.5 默认实例

在类 `HMul` 中，参数 `α` 和 `β` 被当作输入值。因此，仅在这两个类型已知后类型类合成才会启动。这往往过于严格。

```lean
namespace Ex
------
class HMul (α : Type u) (β : Type v) (γ : outParam (Type w)) where
  hMul : α → β → γ

export HMul (hMul)

instance : HMul Int Int Int where
  hMul := Int.mul

def xs : List Int := [1, 2, 3]

/--
error: typeclass instance problem is stuck
  HMul Int ?m.2 (?m.11 y)

Note: Lean will not try to resolve this typeclass instance problem because the second type argument to `HMul` is a metavariable. This argument must be fully determined before Lean will try to resolve the typeclass.

Hint: Adding type annotations and supplying implicit arguments to functions can give Lean more information for typeclass resolution. For example, if you have a variable `x` that you intend to be a `Nat`, but Lean reports it as having an unresolved type like `?m`, replacing `x` with `(x : Nat)` can get typeclass resolution un-stuck.
-/
#guard_msgs (error) in
#eval fun y => xs.map (fun x => hMul x y)
------
end Ex
```

Lean 不会合成 `HMul` 实例，因为 `y` 的类型尚未提供。然而，在这种情形下自然可以假设 `y` 与 `x` 类型相同。我们可以用**默认实例**（default instances）实现这一点。

```lean
namespace Ex
------
class HMul (α : Type u) (β : Type v) (γ : outParam (Type w)) where
  hMul : α → β → γ

export HMul (hMul)

@[default_instance]
instance : HMul Int Int Int where
  hMul := Int.mul

def xs : List Int := [1, 2, 3]

#check fun y => xs.map (fun x => hMul x y)  -- fun y => List.map (fun x => hMul x y) xs : Int → List Int
------
end Ex
```

（环境中有 `variable {α : Type u} {β : Type v} {γ : Type w} {a : α} {b : β} {n : Nat}`、`variable [HAdd α β γ] [HSub α β γ] [HMul α β γ] [HDiv α β γ] [HMod α β γ]`。）

通过给上例实例加上属性 `[default_instance]`，我们指示 Lean 在待解决的类型类合成问题上使用该实例。Lean 的实际实现为算术运算符定义了齐次与异构类。此外，`a + b`、`a * b`、`a - b`、`a / b` 和 `a % b` 是异构版本的记法。实例 `OfNat Nat n` 是 `OfNat` 类的默认实例（优先级 100），这就是为什么在期望类型未知时数字字面量 `2` 的类型为 `Nat`。可以定义更高优先级的默认实例来覆盖内建实例。

```lean
structure Rational where
  num : Int
  den : Nat
  inv : den ≠ 0

@[default_instance 200]
instance : OfNat Rational n where
  ofNat := { num := n, den := 1, inv := by decide }

instance : ToString Rational where
  toString r := s!"{r.num}/{r.den}"

#check 2 -- 2 : Rational
```

（环境中有 `variable {α : Type u} {xs : List α} [Mul α] [OfNat α 2]`。）

优先级也有助于控制不同默认实例之间的交互。例如，假设 `xs` 的类型为 `List α`。在展开 `xs.map (fun x => 2 * x)` 时，我们希望齐次乘法实例比 `OfNat α 2` 的默认实例有更高优先级。当我们只实现了 `HMul α α α` 而未实现 `HMul Nat α α` 时，这一点尤其重要。现在我们揭示记法 `a * b` 在 Lean 中如何定义。

```lean
namespace Ex
------
class OfNat (α : Type u) (n : Nat) where
  ofNat : α

@[default_instance]
instance (n : Nat) : OfNat Nat n where
  ofNat := n

class HMul (α : Type u) (β : Type v) (γ : outParam (Type w)) where
  hMul : α → β → γ

class Mul (α : Type u) where
  mul : α → α → α

@[default_instance 10]
instance [Mul α] : HMul α α α where
  hMul a b := Mul.mul a b

infixl:70 " * " => HMul.hMul
------
end Ex
```

`Mul` 类便于只实现齐次乘法的类型。

## 10.6 局部实例

类型类在 Lean 中通过属性实现。因此可以用修饰符 `local` 表示它们仅在当前 `section` 或 `namespace` 关闭前、或当前文件结束前有效。

```lean
structure Point where
  x : Nat
  y : Nat

section

local instance : Add Point where
  add a b := { x := a.x + b.x, y := a.y + b.y }

def double (p : Point) :=
  p + p

end -- instance `Add Point` is not active anymore

/--
error: failed to synthesize
  HAdd Point Point ?m.5

Hint: Additional diagnostic information may be available using
the `set_option diagnostics true` command.
-/
#guard_msgs in
def triple (p : Point) :=
  p + p + p
```

也可以用 `attribute` 命令暂时禁用实例，直到当前 `section` 或 `namespace` 关闭，或直到当前文件结束。

```lean
structure Point where
  x : Nat
  y : Nat

instance addPoint : Add Point where
  add a b := { x := a.x + b.x, y := a.y + b.y }

def double (p : Point) :=
  p + p

attribute [-instance] addPoint

/--
error: failed to synthesize
  HAdd Point Point ?m.5

Hint: Additional diagnostic information may be available using
the `set_option diagnostics true` command.
-/
#guard_msgs in
def triple (p : Point) :=
  p + p + p  -- Error: failed to synthesize instance
```

我们建议仅用这个命令来诊断问题。

## 10.7 作用域实例

也可以在命名空间中声明**作用域实例**（scoped instances）。这类实例仅在命名空间内部或 `open` 该命名空间时有效。

```lean
structure Point where
  x : Nat
  y : Nat

namespace Point

scoped instance : Add Point where
  add a b := { x := a.x + b.x, y := a.y + b.y }

def double (p : Point) :=
  p + p

end Point
-- instance `Add Point` is not active anymore

/--
error: failed to synthesize
  HAdd Point Point ?m.3

Hint: Additional diagnostic information may be available using
the `set_option diagnostics true` command.
-/
#guard_msgs (error) in
#check fun (p : Point) => p + p + p

namespace Point
-- instance `Add Point` is active again
#check fun (p : Point) => p + p + p

end Point

open Point -- activates instance `Add Point`
#check fun (p : Point) => p + p + p
```

可以用命令 `open scoped <namespace>` 激活作用域属性，但不会「打开」命名空间中的名称。

```lean
structure Point where
  x : Nat
  y : Nat

namespace Point

scoped instance : Add Point where
  add a b := { x := a.x + b.x, y := a.y + b.y }

def double (p : Point) :=
  p + p

end Point

open scoped Point -- activates instance `Add Point`
#check fun (p : Point) => p + p + p

/--
error: Unknown identifier `double`
-/
#guard_msgs (error) in
#check fun (p : Point) => double p
```

## 10.8 可判定命题

让我们考虑标准库中定义的另一个类型类例子，即可判定（`Decidable`）命题的类型类。粗略地说，`Prop` 的元素称为可判定的，是指我们能判定它为真还是为假。这一区分在构造数学中才有用；在经典数学中，每个命题都是可判定的。但若用经典原理（例如）通过分情形定义函数，该函数将不可计算。从算法角度看，`Decidable` 类型类可用于推断能有效判定命题是否为真的过程。因此，该类型类在可能时支持这种计算性定义，同时又便于过渡到经典定义与经典推理。

在标准库中，`Decidable` 形式地定义如下：

```lean
namespace Hidden
------
class inductive Decidable (p : Prop) where
  | isFalse (h : ¬p) : Decidable p
  | isTrue  (h : p)  : Decidable p
------
end Hidden
```

（环境中有 `variable {p : Prop} (t : Decidable p) (t' : p ∨ ¬p) (a b : α)`。）

从逻辑上说，拥有元素 `t : Decidable p` 强于拥有 `t' : p ∨ ¬p`；它使我们能根据 `p` 的真值定义任意类型的值。例如，要使表达式 `if p then a else b` 有意义，需要知道 `p` 是可判定的。该表达式是 `ite p a b` 的语法糖，其中 `ite` 定义如下：

```lean
namespace Hidden
------
def ite {α : Sort u}
    (c : Prop) [h : Decidable c]
    (t e : α) : α :=
  h.casesOn (motive := fun _ => α) (fun _ => e) (fun _ => t)
------
end Hidden
```

标准库还包含 `ite` 的变体 `dite`，即依赖 if-then-else 表达式，定义如下：

```lean
namespace Hidden
------
def dite {α : Sort u}
    (c : Prop) [h : Decidable c]
    (t : c → α) (e : Not c → α) : α :=
  Decidable.casesOn (motive := fun _ => α) h e t
------
end Hidden
```

（环境中有 `variable {c : Prop} [Decidable c] (t : c → α) (e : ¬c → α) (hc : c) (hnc : ¬c)`。）

也就是说，在 `dite c t e` 中，我们可以在「then」分支假设 `hc : c`，在「else」分支假设 `hnc : ¬c`。为便于使用 `dite`，Lean 允许我们写 `if h : c then t else e`，而不是 `dite c (fun h : c => t h) (fun h : ¬c => e h)`。

没有经典逻辑，我们无法证明每个命题都可判定。但可以证明**某些**命题可判定。例如可以证明自然数与整数上相等与比较等基本运算的可判定性。此外，可判定性在命题联结词下保持：

```lean
#check @instDecidableAnd -- @instDecidableAnd : {p q : Prop} → [dp : Decidable p] → [dq : Decidable q] → Decidable (p ∧ q)

#check @instDecidableOr
#check @instDecidableNot
```

因此我们可以对自然数上的可判定谓词进行分情形定义：

```lean
def step (a b x : Nat) : Nat :=
  if x < a ∨ x > b then 0 else 1

set_option pp.explicit true
#print step
```

打开隐式参数可见，elaborator 已通过应用适当实例推断出命题 `x < a ∨ x > b` 的可判定性。

借助经典公理，我们可以证明每个命题都可判定。可以导入经典公理，并通过打开 `Classical` 命名空间使可判定性的通用实例可用：

```lean
open Classical
```

（环境中有 `open Classical`、`variable {p : Prop}`。）

此后对每个 `p`，`Decidable p` 都有实例。因此，当要以经典方式推理时，库中依赖可判定性假设的所有定理都可自由使用。在第 12 章「公理与计算」中，我们将看到用排中律定义函数可能阻止它们在计算中使用。因此，标准库给 `propDecidable` 实例赋予低优先级。

```lean
namespace Hidden
------
open Classical
noncomputable scoped
instance (priority := low) propDecidable (a : Prop) : Decidable a :=
  choice <| match em a with
    | Or.inl h => ⟨isTrue h⟩
    | Or.inr h => ⟨isFalse h⟩
------
end Hidden
```

这保证 Lean 会优先尝试其他实例，仅在推断可判定性的其他尝试都失败后才回退到 `propDecidable`。

`Decidable` 类型类还为证明定理提供一点小规模自动化。标准库引入了策略 `decide`，它用 `Decidable` 实例解决简单目标，以及函数 `decide`，它用 `Decidable` 实例计算相应的 `Bool`。

```lean
example : 10 < 5 ∨ 1 > 0 := by
  decide

example : ¬(True ∧ False) := by
  decide

example : 10 * 20 = 200 := by
  decide

theorem ex : True ∧ 2 = 1 + 1 := by
  decide

#print ex

#check @of_decide_eq_true -- @of_decide_eq_true : ∀ {p : Prop} [inst : Decidable p], decide p = true → p

#check @decide -- decide : (p : Prop) → [h : Decidable p] → Bool
```

（环境中有 `variable {p : Prop} [Decidable p]`。）

它们的工作方式如下。表达式 `decide p` 尝试为 `p` 推断判定过程，若成功则求值为 `true` 或 `false`。特别地，若 `p` 是真闭表达式，`decide p` 会在定义上化简为布尔值 `true`。在假设 `decide p = true` 成立时，`of_decide_eq_true` 产生 `p` 的证明。策略 `decide` 把它们组合起来证明目标 `p`。由前述观察，`decide` 在推断出的判定过程有足够信息能在定义上化简为 `isTrue` 情形时都会成功。

## 10.9 管理类型类推断

若你处于需要显式提供 Lean 本可通过类型类推断得到的表达式的情形，可以要求 Lean 用 `inferInstance` 执行推断：

```lean
def foo : Add Nat := inferInstance
def bar : Inhabited (Nat → Nat) := inferInstance

#check @inferInstance -- @inferInstance : {α : Sort u_1} → [i : α] → α
```

（环境中有 `variable (t : T)`。）

事实上，可以用 Lean 的 `(t : T)` 记法简洁指定要找哪个类的实例：

```lean
#check (inferInstance : Add Nat)
```

也可以用辅助定义 `inferInstanceAs`：

```lean
#check inferInstanceAs (Add Nat)

#check @inferInstanceAs -- inferInstanceAs : (α : Sort u_1) → [i : α] → α
```

有时 Lean 找不到实例，因为类被埋在定义之下。例如 Lean 找不到 `Inhabited (Set α)` 的实例。我们可以显式声明一个：

```lean
def Set (α : Type u) := α → Prop

/--
error: failed to synthesize
  Inhabited (Set α)

Hint: Additional diagnostic information may be available using
the `set_option diagnostics true` command.
-/
#guard_msgs in
example : Inhabited (Set α) :=
  inferInstance

instance : Inhabited (Set α) :=
  inferInstanceAs (Inhabited (α → Prop))
```

有时你会发现类型类推断找不到期望的实例，或更糟的是陷入无限循环并超时。为帮助调试，Lean 允许你请求搜索轨迹：

```lean
set_option trace.Meta.synthInstance true
```

若使用 VS Code，可将鼠标悬停在相关定理或定义上，或用 `Ctrl` `Shift` `Enter` 打开消息窗口来阅读结果。

也可以用下列选项限制搜索：

```lean
set_option synthInstance.maxHeartbeats 10000
set_option synthInstance.maxSize 400
```

选项 `synthInstance.maxHeartbeats` 指定每个类型类解析问题的最大心跳数。心跳是（小）内存分配次数（以千计），0 表示无限制。选项 `synthInstance.maxSize` 是类型类实例合成过程中构造解所用实例的最大数量。

也请记住，在 VS Code 与 Emacs 编辑模式中，`set_option` 的 Tab 补全可帮助你找到合适选项。

如上所述，给定上下文中的类型类实例构成类似 Prolog 的程序，从而引发回溯搜索。程序的效率与找到的解都可能取决于系统尝试实例的顺序。最后声明的实例会最先尝试。此外，若实例在其他模块中声明，尝试顺序还取决于打开命名空间的顺序。较晚打开的命名空间中声明的实例会较早尝试。

可以通过给实例分配**优先级**来改变类型类实例的尝试顺序。声明实例时会被赋予默认优先级值。定义实例时可以指定其他优先级。下例说明如何操作：

```lean
class Foo where
  a : Nat
  b : Nat

instance (priority := default + 1) i1 : Foo where
  a := 1
  b := 1

instance i2 : Foo where
  a := 2
  b := 2

example : Foo.a = 1 :=
  rfl

instance (priority := default + 2) i3 : Foo where
  a := 3
  b := 3

example : Foo.a = 3 :=
  rfl
```

## 10.10 用类型类实现强制转换

（环境中有 `variable {n : Nat} {α : Type u} {as : List α}`、`def Set (α : Type u) := α → Prop`。）

最基本的强制转换类型把一种类型的元素映射到另一种类型。例如，从 `Nat` 到 `Int` 的强制转换允许我们把任意 `n : Nat` 视为 `Int` 的元素。但有些强制转换依赖参数；例如对任意类型 `α`，我们可以把任意 `as : List α` 视为 `Set α` 的元素，即列表中出现的元素构成的集合。相应的强制转换定义在由 `α` 参数化的类型「族」`List α` 上。）

Lean 允许声明三种强制转换：

- 从一族类型到另一族类型
- 从一族类型到 sort 类
- 从一族类型到函数类型类

第一类强制转换允许我们把源族任意成员的元素视为目标族对应成员的元素。第二类允许我们把源族任意成员的元素视为类型。第三类允许我们把源族任意成员的元素视为函数。我们依次考虑每一种。

（环境中有 `variable {α : Type u} {β : Type v} [Coe α β]`。）

在 Lean 中，强制转换建立在类型类推断框架之上。通过声明 `Coe α β` 的实例来定义从 `α` 到 `β` 的强制转换。例如可以这样定义从 `Bool` 到 `Prop` 的强制转换：

```lean
instance : Coe Bool Prop where
  coe b := b = true
```

这使我们可以在 `if`-`then`-`else` 表达式中使用布尔项：

```lean
#eval if true then 5 else 3

#eval if false then 5 else 3
```

我们可以如下定义从 `List α` 到 `Set α` 的强制转换：

```lean
def Set (α : Type u) := α → Prop
def Set.empty {α : Type u} : Set α := fun _ => False
def Set.mem (a : α) (s : Set α) : Prop := s a
def Set.singleton (a : α) : Set α := fun x => x = a
def Set.union (a b : Set α) : Set α := fun x => a x ∨ b x
notation "{ " a " }" => Set.singleton a
infix:55 " ∪ " => Set.union
------
def List.toSet : List α → Set α
  | []    => Set.empty
  | a::as => {a} ∪ as.toSet

instance : Coe (List α) (Set α) where
  coe a := a.toSet

def s : Set Nat := {1}

#check s ∪ [2, 3] -- s ∪ [2, 3].toSet : Set Nat
```

可以用记法 `↑` 在特定位置强制引入强制转换。它也有助于表明意图，并绕过强制转换解析系统的限制。

```lean
def Set (α : Type u) := α → Prop
def Set.empty {α : Type u} : Set α := fun _ => False
def Set.mem (a : α) (s : Set α) : Prop := s a
def Set.singleton (a : α) : Set α := fun x => x = a
def Set.union (a b : Set α) : Set α := fun x => a x ∨ b x
notation "{ " a " }" => Set.singleton a
infix:55 " ∪ " => Set.union
def List.toSet : List α → Set α
  | []    => Set.empty
  | a::as => {a} ∪ as.toSet
instance : Coe (List α) (Set α) where
  coe a := a.toSet
------
def s : Set Nat := {1}

#check let x := ↑[2, 3]; s ∪ x -- let x := [2, 3].toSet; s ∪ x : Set Nat

#check let x := [2, 3]; s ∪ x -- let x := [2, 3]; s ∪ x.toSet : Set Nat
```

Lean 还用类型类 `CoeDep` 支持依赖强制转换。例如不能把任意命题强制转换为 `Bool`，只有实现了 `Decidable` 类型类的命题可以。

```lean
instance (p : Prop) [Decidable p] : CoeDep Prop p Bool where
  coe := decide p
```

Lean 还会按需链接（非依赖）强制转换。实际上，类型类 `CoeT` 是 `Coe` 的传递闭包。

现在考虑第二类强制转换。所谓 **sort 类**，指宇宙 `Type u` 的集合。第二类强制转换形如：

```
    c : (x1 : A1) → ... → (xn : An) → F x1 ... xn → Type u
```

其中 `F` 是如上的一族类型。这允许我们在 `t` 的类型为 `F a₁ ... aₙ` 时写 `s : t`。换言之，该强制转换允许我们把 `F a₁ ... aₙ` 的元素视为类型。这在定义代数结构时非常有用，其中分量之一——结构的载体——是 `Type`。例如可以这样定义半群：

```lean
structure Semigroup where
  carrier : Type u
  mul : carrier → carrier → carrier
  mul_assoc (a b c : carrier) : mul (mul a b) c = mul a (mul b c)

instance (S : Semigroup) : Mul S.carrier where
  mul a b := S.mul a b
```

（环境中有 `structure Semigroup`、`instance (S : Semigroup) : Mul S.carrier`、`variable {S : Semigroup} (a b : S.carrier)`、`instance : CoeSort Semigroup (Type u)`、`universe u`。）

换言之，半群由类型 `carrier` 与乘法 `mul` 组成，且乘法满足结合律。`instance` 命令允许我们在有 `a b : S.carrier` 时写 `a * b` 而不是 `Semigroup.mul S a b`；注意 Lean 能从 `a` 和 `b` 的类型推断参数 `S`。函数 `Semigroup.carrier` 把类 `Semigroup` 映射到 sort `Type u`：

```lean
structure Semigroup where
  carrier : Type u
  mul : carrier → carrier → carrier
  mul_assoc (a b c : carrier) : mul (mul a b) c = mul a (mul b c)
instance (S : Semigroup) : Mul S.carrier where
  mul a b := S.mul a b
------
#check Semigroup.carrier -- Semigroup.carrier.{u} (self : Semigroup) : Type u
```

若把该函数声明为强制转换，则每当有半群 `S : Semigroup` 时，我们可以写 `a : S` 而不是 `a : S.carrier`：

```lean
structure Semigroup where
  carrier : Type u
  mul : carrier → carrier → carrier
  mul_assoc (a b c : carrier) : mul (mul a b) c = mul a (mul b c)
instance (S : Semigroup) : Mul S.carrier where
  mul a b := S.mul a b
------
instance : CoeSort Semigroup (Type u) where
  coe s := s.carrier

example (S : Semigroup) (a b c : S) : (a * b) * c = a * (b * c) :=
  Semigroup.mul_assoc _ a b c
```

正是该强制转换使我们能写 `(a b c : S)`。注意我们定义的是 `CoeSort Semigroup (Type u)` 的实例，而不是 `Coe Semigroup (Type u)`。

（环境中有 `variable (B : Type u) (C : Type v)`。）

所谓**函数类型类**，指 Pi 类型 `(z : B) → C` 的集合。第三类强制转换形如：

```
    c : (x₁ : A₁) → ... → (xₙ : Aₙ) → (y : F x₁ ... xₙ) → (z : B) → C
```

其中 `F` 又是一族类型，`B` 和 `C` 可以依赖 `x₁, ..., xₙ, y`。这使得当 `t` 是 `F a₁ ... aₙ` 的元素时，可以写 `t s`。换言之，该强制转换使我们能把 `F a₁ ... aₙ` 的元素视为函数。继续上例，可以定义半群 `S1` 与 `S2` 之间的**态射**概念，即从 `S1` 的载体到 `S2` 的载体（注意隐式强制转换）的函数，且保持乘法。投影 `Morphism.mor` 把态射映到底层函数：

```lean
structure Semigroup where
  carrier : Type u
  mul : carrier → carrier → carrier
  mul_assoc (a b c : carrier) : mul (mul a b) c = mul a (mul b c)
instance (S : Semigroup) : Mul S.carrier where
  mul a b := S.mul a b
instance : CoeSort Semigroup (Type u) where
  coe s := s.carrier
------
structure Morphism (S1 S2 : Semigroup) where
  mor : S1 → S2
  resp_mul : ∀ a b : S1, mor (a * b) = (mor a) * (mor b)

#check @Morphism.mor
```

因此，它是第三类强制转换的主要候选。

```lean
structure Semigroup where
  carrier : Type u
  mul : carrier → carrier → carrier
  mul_assoc (a b c : carrier) : mul (mul a b) c = mul a (mul b c)
instance (S : Semigroup) : Mul S.carrier where
  mul a b := S.mul a b
instance : CoeSort Semigroup (Type u) where
  coe s := s.carrier
structure Morphism (S1 S2 : Semigroup) where
  mor : S1 → S2
  resp_mul : ∀ a b : S1, mor (a * b) = (mor a) * (mor b)
------
instance (S1 S2 : Semigroup) :
    CoeFun (Morphism S1 S2) (fun _ => S1 → S2) where
  coe m := m.mor

theorem resp_mul {S1 S2 : Semigroup} (f : Morphism S1 S2) (a b : S1)
        : f (a * b) = f a * f b :=
  f.resp_mul a b

example (S1 S2 : Semigroup) (f : Morphism S1 S2) (a : S1) :
      f (a * a * a) = f a * f a * f a :=
  calc f (a * a * a)
    _ = f (a * a) * f a := by rw [resp_mul f]
    _ = f a * f a * f a := by rw [resp_mul f]
```

有了该强制转换，我们可以写 `f (a * a * a)` 而不是 `f.mor (a * a * a)`。当在期望函数的地方使用 `Morphism` `f` 时，Lean 会插入强制转换。与 `CoeSort` 类似，我们还有另一个类 `CoeFun` 用于这类强制转换。参数 `γ` 用于指定要强制转换到的函数类型，该类型可能依赖被强制转换的类型。