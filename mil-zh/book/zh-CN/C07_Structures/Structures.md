# 定义结构体

最广义的 **结构**（structure）是对一组数据的说明，可能附带数据须满足的约束。**实例**（instance）是满足这些约束的具体数据包。例如可规定一个点是三个实数的元组：

```lean
@[ext]
structure Point where
  x : ℝ
  y : ℝ
  z : ℝ
```

`@[ext]` 注解告诉 Lean 自动生成定理：当各分量相等时可证两结构实例相等，该性质称为 **外延性**（extensionality）：

```lean
#check Point.ext

example (a b : Point) (hx : a.x = b.x) (hy : a.y = b.y) (hz : a.z = b.z) : a = b := by
  ext
  repeat' assumption
```

可多种方式定义 `Point` 的特定实例：

```lean
def myPoint1 : Point where
  x := 2
  y := -1
  z := 4

def myPoint2 : Point :=
  { x := 2, y := -1, z := 4 }

def myPoint3 : Point :=
  ⟨2, -1, 4⟩

def myPoint4 :=
  Point.mk 2 (-1) 4
```

第一例中字段显式命名。`myPoint4` 用到的 `Point.mk` 是 `Point` 的 **构造子**（constructor），用于构造元素；也可换名，如 `build`：

```lean
structure Point' where build ::
  x : ℝ
  y : ℝ
  z : ℝ

#check Point'.build 2 (-1) 4
```

下面展示如何在结构上定义函数。第二例显式使用 `Point.mk`，第一例用匿名构造子以简写。Lean 可从 `add` 的指定期望类型推断相应构造子。惯例是将与 `Point` 相关的定义与定理放在同名命名空间；`open Point` 后 `add` 的全名为 `Point.add`；未 open 时需用全名。常可用 **匿名投影记号**（anonymous projection notation）写 `a.add b` 代替 `Point.add a b`，因 `a` 的类型为 `Point`：

```lean
namespace Point

def add (a b : Point) : Point :=
  ⟨a.x + b.x, a.y + b.y, a.z + b.z⟩

def add' (a b : Point) : Point where
  x := a.x + b.x
  y := a.y + b.y
  z := a.z + b.z

#check add myPoint1 myPoint2
#check myPoint1.add myPoint2

end Point

#check Point.add myPoint1 myPoint2
#check myPoint1.add myPoint2
```

下文继续在相应命名空间放定义，但引用代码块中省略 `namespace` 命令。证明加法性质可用 `rw` 展开定义、`ext` 将两结构元素之间的等式化为分量等式。下面用 `protected`，使定理名为 `Point.add_comm`，即使 open 命名空间也如此，避免与泛型 `add_comm` 歧义：

```lean
protected theorem add_comm (a b : Point) : add a b = add b a := by
  rw [add, add]
  ext <;> dsimp
  repeat' apply add_comm

example (a b : Point) : add a b = add b a := by simp [add, add_comm]
```

Lean 可在内部展开定义并化简投影，有时所需等式按定义成立：

```lean
theorem add_x (a b : Point) : (a.add b).x = a.x + b.x :=
  rfl
```

也可用 **模式匹配**（pattern matching）定义结构上的函数，类似[归纳与递归](../C05_Elementary_Number_Theory/InductionAndRecursion.md)中的递归函数。`addAlt` 与 `addAlt'` 本质相同，第二例用匿名构造子记号。虽有时方便，且结构 η-归约使二者定义等价，但后续证明可能更麻烦：`rw [addAlt]` 会留下含 `match` 的较乱目标：

```lean
def addAlt : Point → Point → Point
  | Point.mk x₁ y₁ z₁, Point.mk x₂ y₂ z₂ => ⟨x₁ + x₂, y₁ + y₂, z₁ + z₂⟩

def addAlt' : Point → Point → Point
  | ⟨x₁, y₁, z₁⟩, ⟨x₂, y₂, z₂⟩ => ⟨x₁ + x₂, y₁ + y₂, z₁ + z₂⟩

theorem addAlt_x (a b : Point) : (a.addAlt b).x = a.x + b.x := by
  rfl

theorem addAlt_comm (a b : Point) : addAlt a b = addAlt b a := by
  rw [addAlt, addAlt]
  ext <;> dsimp
  repeat' apply add_comm
```

数学构造常涉及拆开再重组信息；Lean 与 Mathlib 为此提供多种高效手段。练习：证 `Point.add` 结合律；定义点的 **标量乘法**（scalar multiplication）并证其对加法分配：

```lean
protected theorem add_assoc (a b c : Point) : (a.add b).add c = a.add (b.add c) := by
  sorry

def smul (r : ℝ) (a : Point) : Point :=
  sorry

theorem smul_distrib (r : ℝ) (a b : Point) :
    (smul r a).add (smul r b) = smul r (a.add b) := by
  sorry
```

使用结构体只是代数抽象的第一步。我们尚不能把 `Point.add` 与泛型 `+` 符号、把 `Point.add_comm`/`Point.add_assoc` 与泛型 `add_comm`/`add_assoc` 联系起来——这属于使用结构的 **代数** 层面，下一节说明。目前可将结构体视为捆绑对象与信息的方式。

结构体尤其有用之处：不仅可指定数据类型，还可指定数据须满足的约束；后者在 Lean 中表示为类型 `Prop` 的字段。例如 **标准 2-单纯形**（standard 2-simplex）为满足 x ≥ 0、y ≥ 0、z ≥ 0 且 x + y + z = 1 的点 (x, y, z)。不熟悉者可画图：这是三维空间中顶点为 (1,0,0)、(0,1,0)、(0,0,1) 的等边三角形及其内部。Lean 中可表示为：

```lean
structure StandardTwoSimplex where
  x : ℝ
  y : ℝ
  z : ℝ
  x_nonneg : 0 ≤ x
  y_nonneg : 0 ≤ y
  z_nonneg : 0 ≤ z
  sum_eq : x + y + z = 1
```

后四个字段引用前三个字段 x、y、z。可定义交换 x、y 的单纯形自映射：

```lean
def swapXy (a : StandardTwoSimplex) : StandardTwoSimplex
    where
  x := a.y
  y := a.x
  z := a.z
  x_nonneg := a.y_nonneg
  y_nonneg := a.x_nonneg
  z_nonneg := a.z_nonneg
  sum_eq := by rw [add_comm a.y a.x, a.sum_eq]
```

更有趣的是计算单纯形上两点的 **中点**（midpoint）。文件开头已加 `noncomputable section` 以便在实数上使用除法：

```lean
noncomputable section

def midpoint (a b : StandardTwoSimplex) : StandardTwoSimplex
    where
  x := (a.x + b.x) / 2
  y := (a.y + b.y) / 2
  z := (a.z + b.z) / 2
  x_nonneg := div_nonneg (add_nonneg a.x_nonneg b.x_nonneg) (by norm_num)
  y_nonneg := div_nonneg (add_nonneg a.y_nonneg b.y_nonneg) (by norm_num)
  z_nonneg := div_nonneg (add_nonneg a.z_nonneg b.z_nonneg) (by norm_num)
  sum_eq := by field_simp; linarith [a.sum_eq, b.sum_eq]
```

`x_nonneg`、`y_nonneg`、`z_nonneg` 用简洁证明项建立，`sum_eq` 用 `by` 的策略模式建立。

给定满足 0 ≤ λ ≤ 1 的参数 λ，可取标准 2-单纯形上两点 a、b 的 **加权平均** λa + (1−λ)b。请仿照 `midpoint` 定义该函数：

```lean
def weightedAverage (lambda : Real) (lambda_nonneg : 0 ≤ lambda) (lambda_le : lambda ≤ 1)
    (a b : StandardTwoSimplex) : StandardTwoSimplex :=
  sorry
```

## 参数化结构与纯性质

结构可依赖参数。可将标准 2-单纯形推广为任意 n 的 **标准 n-单纯形**。此阶段只需知道 `Fin n` 有 n 个元素且 Lean 会对其求和：

```lean
open BigOperators

structure StandardSimplex (n : ℕ) where
  V : Fin n → ℝ
  NonNeg : ∀ i : Fin n, 0 ≤ V i
  sum_eq_one : (∑ i, V i) = 1

namespace StandardSimplex

def midpoint (n : ℕ) (a b : StandardSimplex n) : StandardSimplex n
    where
  V i := (a.V i + b.V i) / 2
  NonNeg := by
    intro i
    apply div_nonneg
    · linarith [a.NonNeg i, b.NonNeg i]
    norm_num
  sum_eq_one := by
    simp [div_eq_mul_inv, ← Finset.sum_mul, Finset.sum_add_distrib,
      a.sum_eq_one, b.sum_eq_one]
    norm_num

end StandardSimplex
```

练习：定义标准 n-单纯形上两点的加权平均；可用 `Finset.sum_add_distrib` 与 `Finset.mul_sum` 处理相关和。

结构体既可捆绑数据与性质，也可只捆绑性质而无数据。例如 `IsLinear` 将线性性的两个组成部分捆在一起：

```lean
structure IsLinear (f : ℝ → ℝ) where
  is_additive : ∀ x y, f (x + y) = f x + f y
  preserves_mul : ∀ x c, f (c * x) = c * f x

section
variable (f : ℝ → ℝ) (linf : IsLinear f)

#check linf.is_additive
#check linf.preserves_mul

end
```

值得指出：结构体并非捆绑数据的唯一方式。`Point` 可用泛型积定义，`IsLinear` 可用简单 `and`：

```lean
def Point'' :=
  ℝ × ℝ × ℝ

def IsLinear' (f : ℝ → ℝ) :=
  (∀ x y, f (x + y) = f x + f y) ∧ ∀ x c, f (c * x) = c * f x
```

泛型类型构造甚至可替代分量之间有依赖的结构。**子类型**（subtype）将一条数据与一条性质合并；可把下一例中的 `PReal` 视为正实数类型。任何 `x : PReal` 有两部分：值，以及为正的性质。可访问为 `x.val`（类型 `ℝ`）与 `x.property`（事实 `0 < x.val`）：

```lean
def PReal :=
  { y : ℝ // 0 < y }

section
variable (x : PReal)

#check x.val
#check x.property
#check x.1
#check x.2

end
```

也可用子类型定义标准 2-单纯形及任意 n 的标准 n-单纯形：

```lean
def StandardTwoSimplex' :=
  { p : ℝ × ℝ × ℝ // 0 ≤ p.1 ∧ 0 ≤ p.2.1 ∧ 0 ≤ p.2.2 ∧ p.1 + p.2.1 + p.2.2 = 1 }

def StandardSimplex' (n : ℕ) :=
  { v : Fin n → ℝ // (∀ i : Fin n, 0 ≤ v i) ∧ (∑ i, v i) = 1 }
```

类似地，**Σ 类型**（Sigma types）是有序对的推广，第二分量的类型依赖第一分量：

```lean
def StdSimplex := Σ n : ℕ, StandardSimplex n

section
variable (s : StdSimplex)

#check s.fst
#check s.snd

#check s.1
#check s.2

end
```

对 `s : StdSimplex`，第一分量 `s.fst` 是自然数，第二分量是对应单纯形 `StandardSimplex s.fst` 的元素。Σ 类型与子类型的区别在于：Σ 的第二分量是数据而非命题。

即使用积、子类型、Σ 类型替代结构体，使用结构体仍有诸多优点：定义结构体抽象掉底层表示，并为访问分量的函数提供定制名称，使证明更稳健——只依赖结构体接口的证明在改定义后通常仍有效，只要用新定义重写旧访问器。此外，Lean 支持将结构体编织成丰富互联的层次并管理其交互（下一节与第 8 章展开）。