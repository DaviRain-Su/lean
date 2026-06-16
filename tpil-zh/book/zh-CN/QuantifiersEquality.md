# 第 4 章：量词与相等

> 本译文对应原书 [Quantifiers and Equality](https://lean-lang.org/theorem_proving_in_lean4/Quantifiers-and-Equality/)；英文 Verso 源：`book/TPiL/QuantifiersEquality.lean`。

（本章开头 Lean 环境中已声明 `variable {α : Type u} (p : α → Prop) (x y t : α) (r : α → α → Prop) {β : α → Type v}`。）

上一章介绍了构造含命题联结词陈述之证明的方法。本章将逻辑构造扩展到全称量词、存在量词与相等关系。

## 4.1 全称量词

若 `α` 为任意类型，可将 `α` 上的一元谓词 `p` 表示为 `α → Prop` 的对象。此时给定 `x : α`，`p x` 表示 `p` 对 `x` 成立。类似地，`r : α → α → Prop` 表示 `α` 上的二元关系：给定 `x y : α`，`r x y` 表示 `x` 与 `y` 相关。

全称量词 `∀ x : α, p x` 应表示断言「对每个 `x : α`，`p x` 成立」。与命题联结词一样，自然演绎系统中「forall」由引入与消去规则管辖。非形式地，引入规则为：

> 在 `x : α` 任意的上下文中，由 `p x` 的证明，可得 `∀ x : α, p x` 的证明。

消去规则为：

> 给定 `∀ x : α, p x` 的证明与任意项 `t : α`，可得 `p t` 的证明。

与蕴含情形一样，命题即类型解释在此发挥作用。回忆依赖箭头类型的引入与消去规则：

（环境中有 `variable {α : Type u} (p : α → Prop) (x y : α) (r : α → α → Prop) {β : α → Type v} {t : {x : α} → β x}`。）

> 在 `x : α` 任意的上下文中，给定类型 `β x` 的项 `t`，有 `(fun x : α => t) : (x : α) → β x`。

（环境中有 `variable {α : Type u} (p : α → Prop) (x y : α) (r : α → α → Prop) {β : α → Type v} {t : α} {s : (x : α) → β x}`。）

消去规则为：

> 给定 `s : (x : α) → β x` 与任意项 `t : α`，有 `s t : β t`。

当 `p x` 的类型为 `Prop` 时，若把 `(x : α) → β x` 换成 `∀ x : α, p x`，即可读出全称量词证明的正确规则。

（环境中有 `variable {α : Type u} {β : Type v} {p : {x : α} → Prop} (q : Prop)`。）

构造演算因此以这种方式把依赖箭头类型与 forall 表达式等同。对任意表达式 `p`，`∀ x : α, p` 不过是 `(x : α) → p` 的替代记号；当 `p` 为命题时前者更自然。通常 `p` 依赖 `x : α`。回忆：普通函数空间 `α → β` 可视为 `(x : α) → β` 的特例，其中 `β` 不依赖 `x`。类似地，命题间蕴含 `p → q` 可视为 `∀ x : p, q` 的特例，其中 `q` 不依赖 `x`。

下面是命题即类型对应付诸实践的例子：

```lean
example (α : Type) (p q : α → Prop) :
    (∀ x : α, p x ∧ q x) → ∀ y : α, p y :=
  fun h : ∀ x : α, p x ∧ q x =>
  fun y : α =>
  show p y from (h y).left
```

作为记号约定，全称量词取尽可能宽的作用域，故上例中须用括号把对 `x` 的量词限制在假设内。证 `∀ y : α, p y` 的规范方式是：取任意 `y`，证 `p y`——这是引入规则。给定 `h` 的类型为 `∀ x : α, p x ∧ q x`，表达式 `h y` 的类型为 `p y ∧ q y`——这是消去规则。取左合取支即得期望结论 `p y`。

（环境中有 `variable {x z : α}`。）

记住：仅绑定变量重命名而不同的表达式视为等价。故可在假设与结论中用同一变量 `x`，在证明中用不同变量 `z` 实例化：

```lean
example (α : Type) (p q : α → Prop) :
    (∀ x : α, p x ∧ q x) → ∀ x : α, p x :=
  fun h : ∀ x : α, p x ∧ q x =>
  fun z : α =>
  show p z from And.left (h z)
```

另一例：关系 `r` 的传递性：

```lean
variable (α : Type) (r : α → α → Prop)
variable (trans_r : ∀ x y z, r x y → r y z → r x z)

variable (a b c : α)
variable (hab : r a b) (hbc : r b c)

#check trans_r    -- trans_r : ∀ (x y z : α), r x y → r y z → r x z

#check trans_r a b c -- trans_r a b c : r a b → r b c → r a c

#check trans_r a b c hab -- trans_r a b c hab : r b c → r a c

#check trans_r a b c hab hbc -- trans_r a b c hab hbc : r a c
```

想想这里发生了什么。把 `trans_r` 实例化到 `a b c`，得到 `r a b → r b c → r a c` 的证明。把它用于假设 `hab : r a b`，得蕴含 `r b c → r a c` 的证明。再用于假设 `hbc`，得结论 `r a c` 的证明。

此类情形中，当 `a b c` 可从 `hab hbc` 推断时，逐一提供它们可能繁琐。因此常把这些参数隐式化：

```lean
variable (α : Type) (r : α → α → Prop)
variable (trans_r : ∀ {x y z}, r x y → r y z → r x z)

variable (a b c : α)
variable (hab : r a b) (hbc : r b c)

#check trans_r

#check trans_r hab

#check trans_r hab hbc
```

好处是可简单写 `trans_r hab hbc` 作为 `r a c` 的证明。缺点是 Lean 在表达式 `trans_r`、`trans_r hab` 中信息不足，无法推断参数类型。第一个 `#check` 的输出为 `r ?m.1 ?m.2 → r ?m.2 ?m.3 → r ?m.1 ?m.3`，表明隐式参数在此未指定。

下面用等价关系做初等推理的例子：

```lean
variable (α : Type) (r : α → α → Prop)

variable (refl_r : ∀ x, r x x)
variable (symm_r : ∀ {x y}, r x y → r y x)
variable (trans_r : ∀ {x y z}, r x y → r y z → r x z)

example (a b c d : α) (hab : r a b) (hcb : r c b) (hcd : r c d) : r a d :=
  trans_r (trans_r hab (symm_r hcb)) hcd
```

为熟悉全称量词，应尝试本节末尾的练习。

（环境中有 `universe i j`、`variable (α : Sort i) (β : {x : α} → Sort j) {x : α}`。）

依赖箭头类型——尤其是全称量词——的 typing 规则，是 `Prop` 与其他类型的区别所在。设 `α : Sort i`、`β : Sort j`，其中 `β` 可依赖 `x : α`。则 `(x : α) → β` 是 `Sort (imax i j)` 的元素，其中 `imax i j` 在 `j` 不为 `0` 时为 `i` 与 `j` 的最大值，否则为 `0`。

思路如下。若 `j` 不为 `0`，则 `(x : α) → β` 是 `Sort (max i j)` 的元素——从 `α` 到 `β` 的依赖函数类型「住在」指数为 `i`、`j` 最大值的宇宙。但若 `β` 为 `Sort 0`（即 `Prop` 的元素），则无论 `α` 住在哪个类型宇宙，`(x : α) → β` 都是 `Sort 0` 的元素。换言之，若 `β` 是依赖 `α` 的命题，则 `∀ x : α, β` 仍是命题。这反映 `Prop` 作为命题而非数据的解释，并使 `Prop` 成为**非直谓的**（impredicative）。

「**直谓的**」（predicative）一词源于二十世纪初的基础研究：Poincaré、Russell 等逻辑学家把集合论悖论归咎于在包含被定义性质本身的集合上量词定义性质所产生的「恶性循环」。注意对任意类型 `α`，可形成 `α → Prop`（`α` 的「幂类型」）。`Prop` 的非直谓性意味着可形成量化 `α → Prop` 的命题；特别地，可通过对 `α` 上所有谓词量化来定义 `α` 上的谓词——这正是曾被视为有问题的循环类型。

## 4.2 相等

现在转向 Lean 库中定义的最基本关系之一：相等。第 7 章「归纳类型」将说明相等如何从 Lean 逻辑框架的原语定义；此处先说明如何使用。

相等的基本性质之一是它为等价关系：

```lean
#check Eq.refl    -- Eq.refl.{u_1} {α : Sort u_1} (a : α) : a = a

#check Eq.symm    -- Eq.symm.{u} {α : Sort u} {a b : α} (h : a = b) : b = a

#check Eq.trans   -- Eq.trans.{u} {α : Sort u} {a b c : α} (h₁ : a = b) (h₂ : b = c) : a = c
```

可让 Lean 不插入隐式参数（此处显示为元变量），使输出更易读：

```lean
universe u

#check @Eq.refl.{u}   -- @Eq.refl : ∀ {α : Sort u} (a : α), a = a

#check @Eq.symm.{u}   -- @Eq.symm : ∀ {α : Sort u} {a b : α}, a = b → b = a

#check @Eq.trans.{u}  -- @Eq.trans : ∀ {α : Sort u} {a b c : α}, a = b → b = c → a = c
```

记号 `.{u}` 告诉 Lean 在宇宙 `u` 上实例化这些常量。

例如，可把上一节例子特化到相等关系：

```lean
variable (α : Type) (a b c d : α)
variable (hab : a = b) (hcb : c = b) (hcd : c = d)

example : a = d :=
  Eq.trans (Eq.trans hab (Eq.symm hcb)) hcd
```

也可用投影记法：

```lean
variable (α : Type) (a b c d : α)
variable (hab : a = b) (hcb : c = b) (hcd : c = d)
------
example : a = d := (hab.trans hcb.symm).trans hcd
```

自反性比表面更强。回忆构造演算中的项有计算解释，逻辑框架把有共同可归约项的项视为相同。因此一些非平凡恒等式可用自反性证明：

```lean
variable (α β : Type)

example (f : α → β) (a : α) : (fun x => f x) a = f a := Eq.refl _
example (a : α) (b : β) : (a, b).1 = a := Eq.refl _
example : 2 + 3 = 5 := Eq.refl _
```

该框架特性十分重要，库为此定义记号 `rfl` 表示 `Eq.refl _`：

```lean
variable (α β : Type)
------
example (f : α → β) (a : α) : (fun x => f x) a = f a := rfl
example (a : α) (b : β) : (a, b).1 = a := rfl
example : 2 + 3 = 5 := rfl
```

（环境中有 `variable {a b : α} {p : α → Prop} {h1 : a = b} {h2 : p a}`。）

然而相等远不止等价关系。它有重要性质：每个断言都尊重等价——可用相等表达式替换而不改真假。即给定 `h1 : a = b` 与 `h2 : p a`，可用替换构造 `p b` 的证明：`Eq.subst h1 h2`。

```lean
example (α : Type) (a b : α) (p : α → Prop)
        (h1 : a = b) (h2 : p a) : p b :=
  Eq.subst h1 h2

example (α : Type) (a b : α) (p : α → Prop)
    (h1 : a = b) (h2 : p a) : p b :=
  h1 ▸ h2
```

第二种写法中的三角是建在 `Eq.subst` 与 `Eq.symm` 之上的宏，输入 `\t`。

规则 `Eq.subst` 用于定义下列辅助规则，进行更显式的替换；它们针对应用项，即形如 `s t` 的项。具体地，`congrArg` 可替换参数，`congrFun` 可替换被应用的项，`congr` 可同时替换二者。

```lean
variable (α : Type)
variable (a b : α)
variable (f g : α → Nat)
variable (h₁ : a = b)
variable (h₂ : f = g)

example : f a = f b := congrArg f h₁
example : f a = g a := congrFun h₂ a
example : f a = g b := congr h₂ h₁
```

Lean 库含大量常见恒等式，例如：

```lean
variable (a b c : Nat)

example : a + 0 = a := Nat.add_zero a
example : 0 + a = a := Nat.zero_add a
example : a * 1 = a := Nat.mul_one a
example : 1 * a = a := Nat.one_mul a
example : a + b = b + a := Nat.add_comm a b
example : a + b + c = a + (b + c) := Nat.add_assoc a b c
example : a * b = b * a := Nat.mul_comm a b
example : a * b * c = a * (b * c) := Nat.mul_assoc a b c
example : a * (b + c) = a * b + a * c := Nat.mul_add a b c
example : a * (b + c) = a * b + a * c := Nat.left_distrib a b c
example : (a + b) * c = a * c + b * c := Nat.add_mul a b c
example : (a + b) * c = a * c + b * c := Nat.right_distrib a b c
```

注意 `Nat.mul_add` 与 `Nat.add_mul` 分别是 `Nat.left_distrib`、`Nat.right_distrib` 的别名。上列性质针对自然数（类型 `Nat`）。

下面是自然数中结合替换、结合律与分配律的计算例子：

```lean
example (x y : Nat) :
    (x + y) * (x + y) =
    x * x + y * x + x * y + y * y :=
  have h1 : (x + y) * (x + y) = (x + y) * x + (x + y) * y :=
    Nat.mul_add (x + y) x y
  have h2 : (x + y) * (x + y) = x * x + y * x + (x * y + y * y) :=
    (Nat.add_mul x y x) ▸ (Nat.add_mul x y y) ▸ h1
  h2.trans (Nat.add_assoc (x * x + y * x) (x * y) (y * y)).symm
```

（环境中有 `variable {α : Type u}`。）

注意 `Eq.subst` 的第二个隐式参数给出替换发生的语境，类型为 `α → Prop`。推断该谓词需要**高阶合一**（higher-order unification）的实例。一般情形下，判定高阶合一子是否存在是不可判定的，Lean 至多提供不完美的近似解。因此 `Eq.subst` 并不总能如你所愿。宏 `h ▸ e` 用更有效的启发式计算该隐式参数，常在 `Eq.subst` 失败时成功。

等式推理常见且重要，Lean 提供多种机制更有效支持。下一节给出更自然、清晰的计算式证明语法；更重要的是，等式推理由项重写器、简化器及其他自动化支持。重写器与简化器下一节简述，第 5 章详述。

## 4.3 计算式证明

计算式证明（calculational proof）是由中间结果组成的链，拟用相等传递性等基本原则组合。Lean 中以关键字 **`calc`** 开始，语法如下：

```
calc
  <expr>_0  'op_1'  <expr>_1  ':='  <proof>_1
  '_'       'op_2'  <expr>_2  ':='  <proof>_2
  ...
  '_'       'op_n'  <expr>_n  ':='  <proof>_n
```

注意 `calc` 中各关系缩进相同。每个 `<proof>_i` 是 `<expr>_{i-1} op_i <expr>_i` 的证明。

也可在第一个关系（紧跟 `<expr>_0` 之后）使用 `_`，便于对齐关系/证明对序列：

```
calc <expr>_0
    '_' 'op_1' <expr>_1 ':=' <proof>_1
    '_' 'op_2' <expr>_2 ':=' <proof>_2
    ...
    '_' 'op_n' <expr>_n ':=' <proof>_n
```

示例：

```lean
variable (a b c d e : Nat)

theorem T
    (h1 : a = b)
    (h2 : b = c + 1)
    (h3 : c = d)
    (h4 : e = 1 + d) :
    a = e :=
  calc
    a = b      := h1
    _ = c + 1  := h2
    _ = d + 1  := congrArg Nat.succ h3
    _ = 1 + d  := Nat.add_comm d 1
    _ = e      := Eq.symm h4
```

这种写法与 **`simp`**、**`rw`** 策略配合最有效；第 5 章详述。例如用 `rw` 重写，上证明可写成：

```lean
variable (a b c d e : Nat)
------
theorem T
    (h1 : a = b)
    (h2 : b = c + 1)
    (h3 : c = d)
    (h4 : e = 1 + d) :
    a = e :=
  calc
    a = b      := by rw [h1]
    _ = c + 1  := by rw [h2]
    _ = d + 1  := by rw [h3]
    _ = 1 + d  := by rw [Nat.add_comm]
    _ = e      := by rw [h4]
```

实质上 **`rw`** 用给定相等（假设、定理名或复杂项）「重写」目标。若将目标化为恒等式 `t = t`，策略用自反性证明。

重写可顺序应用，上证明可缩短为：

```lean
variable (a b c d e : Nat)
------
theorem T
    (h1 : a = b)
    (h2 : b = c + 1)
    (h3 : c = d)
    (h4 : e = 1 + d) :
    a = e :=
  calc
    a = d + 1  := by rw [h1, h2, h3]
    _ = 1 + d  := by rw [Nat.add_comm]
    _ = e      := by rw [h4]
```

甚至：

```lean
variable (a b c d e : Nat)
------
theorem T
    (h1 : a = b)
    (h2 : b = c + 1)
    (h3 : c = d)
    (h4 : e = 1 + d) :
    a = e :=
  by rw [h1, h2, h3, Nat.add_comm, h4]
```

**`simp`** 则通过在项中任意适用处反复、任意顺序应用给定恒等式来重写目标；还使用先前向系统声明的其他规则，并明智运用交换律避免循环。因此也可这样证定理：

```lean
variable (a b c d e : Nat)
------
theorem T
    (h1 : a = b)
    (h2 : b = c + 1)
    (h3 : c = d)
    (h4 : e = 1 + d) :
    a = e :=
  by simp [h1, h2, h3, Nat.add_comm, h4]
```

`rw` 与 `simp` 的变体见第 5 章。

**`calc`** 可为支持某种传递性的任意关系配置，甚至可组合不同关系：

```lean
variable (a b c d : Nat)
example (h1 : a = b) (h2 : b ≤ c) (h3 : c + 1 < d) : a < d :=
  calc
    a = b     := h1
    _ < b + 1 := Nat.lt_succ_self b
    _ ≤ c + 1 := Nat.succ_le_succ h2
    _ < d     := h3
```

可通过为 **`Trans`** 类型类添加新实例，向 **`calc`**「教授」新传递性定理。类型类后文介绍；下面小例演示如何用新 `Trans` 实例扩展 `calc` 记法：

```lean
def divides (x y : Nat) : Prop :=
  ∃ k, k*x = y

def divides_trans (h₁ : divides x y) (h₂ : divides y z) : divides x z :=
  let ⟨k₁, d₁⟩ := h₁
  let ⟨k₂, d₂⟩ := h₂
  ⟨k₁ * k₂, by rw [Nat.mul_comm k₁ k₂, Nat.mul_assoc, d₁, d₂]⟩

def divides_mul (x : Nat) (k : Nat) : divides x (k*x) :=
  ⟨k, rfl⟩

instance : Trans divides divides divides where
  trans := divides_trans

example (h₁ : divides x y) (h₂ : y = z) : divides x (2*z) :=
  calc
    divides x y     := h₁
    _ = z           := h₂
    divides _ (2*z) := divides_mul ..

infix:50 " | " => divides

example (h₁ : divides x y) (h₂ : y = z) : divides x (2*z) :=
  calc
    x | y   := h₁
    _ = z   := h₂
    _ | 2*z := divides_mul ..
```

上例也说明：即使关系没有中缀记号也可使用 `calc`。Lean 已含整除的标准 Unicode 记号（`∣`，输入 `\dvd` 或 `\mid`），故上例用普通竖线避免冲突；实践中不宜如此，易与 `match ... with` 中的 ASCII `|` 混淆。

借助 `calc`，可把上一节证明写得更自然：

```lean
variable (x y : Nat)

example : (x + y) * (x + y) = x * x + y * x + x * y + y * y :=
  calc
    (x + y) * (x + y) = (x + y) * x + (x + y) * y  :=
      by rw [Nat.mul_add]
    _ = x * x + y * x + (x + y) * y                :=
      by rw [Nat.add_mul]
    _ = x * x + y * x + (x * y + y * y)            :=
      by rw [Nat.add_mul]
    _ = x * x + y * x + x * y + y * y              :=
      by rw [←Nat.add_assoc]
```

当第一个表达式较长时，可考虑替代 `calc` 记法：在第一个关系用 `_` 自然对齐各关系：

```lean
variable (x y : Nat)

example : (x + y) * (x + y) = x * x + y * x + x * y + y * y :=
  calc (x + y) * (x + y)
    _ = (x + y) * x + (x + y) * y       :=
      by rw [Nat.mul_add]
    _ = x * x + y * x + (x + y) * y     :=
      by rw [Nat.add_mul]
    _ = x * x + y * x + (x * y + y * y) :=
      by rw [Nat.add_mul]
    _ = x * x + y * x + x * y + y * y   :=
      by rw [←Nat.add_assoc]
```

`Nat.add_assoc` 前的左箭头告诉 rewrite 反向使用该恒等式（输入 `\l` 或 ASCII `<-`）。若追求简洁，`rw` 与 `simp` 可单独完成：

```lean
variable (x y : Nat)
example : (x + y) * (x + y) = x * x + y * x + x * y + y * y := by
  rw [Nat.mul_add, Nat.add_mul, Nat.add_mul, ←Nat.add_assoc]

example : (x + y) * (x + y) = x * x + y * x + x * y + y * y := by
  simp [Nat.mul_add, Nat.add_mul, Nat.add_assoc]
```

## 4.4 存在量词

最后考虑存在量词，可写作 `exists x : α, p x` 或 `∃ x : α, p x`。二者都是较长表达式 `Exists (fun x : α => p x)` 的便利缩写，在 Lean 库中定义。

如你所料，库含引入与消去规则。引入规则直接：要证 `∃ x : α, p x`，提供合适项 `t` 与 `p t` 的证明即可。例如：

```lean
example : ∃ x : Nat, x > 0 :=
  have h : 1 > 0 := Nat.zero_lt_succ 0
  Exists.intro 1 h

example (x : Nat) (h : x > 0) : ∃ y, y < x :=
  Exists.intro 0 h

example (x y z : Nat) (hxy : x < y) (hyz : y < z) : ∃ w, x < w ∧ w < z :=
  Exists.intro y (And.intro hxy hyz)

#check @Exists.intro -- @Exists.intro : ∀ {α : Sort u_1} {p : α → Prop} (w : α), p w → Exists p
```

（环境中有 `variable {t : α} {p : α → Prop} (h : p t)`。）

类型由上下文清楚时，可用匿名构造子 `⟨t, h⟩` 表示 `Exists.intro t h`：

```lean
example : ∃ x : Nat, x > 0 :=
  have h : 1 > 0 := Nat.zero_lt_succ 0
  ⟨1, h⟩

example (x : Nat) (h : x > 0) : ∃ y, y < x :=
  ⟨0, h⟩

example (x y z : Nat) (hxy : x < y) (hyz : y < z) : ∃ w, x < w ∧ w < z :=
  ⟨y, hxy, hyz⟩
```

（环境中有 `variable (p : α → Prop) (g : Nat → Nat → Nat) (hg : g 0 0 = 0)`。）

注意 `Exists.intro` 有隐式参数：Lean 须在结论 `∃ x, p x` 中推断谓词 `p : α → Prop`，并非易事。例如有 `hg : g 0 0 = 0` 并写 `Exists.intro 0 hg`，`p` 有许多可能值，对应 `∃ x, g x x = x`、`∃ x, g x x = 0`、`∃ x, g x 0 = x` 等定理。Lean 用上下文推断合适者。下例设 `pp.explicit` 为 true，让 pretty-printer 显示隐式参数：

```lean
variable (g : Nat → Nat → Nat)

theorem gex1 (hg : g 0 0 = 0) : ∃ x, g x x = x := ⟨0, hg⟩
theorem gex2 (hg : g 0 0 = 0) : ∃ x, g x 0 = x := ⟨0, hg⟩
theorem gex3 (hg : g 0 0 = 0) : ∃ x, g 0 0 = x := ⟨0, hg⟩
theorem gex4 (hg : g 0 0 = 0) : ∃ x, g x x = 0 := ⟨0, hg⟩

set_option pp.explicit true  -- display implicit arguments

#print gex1

#print gex2

#print gex3

#print gex4
```

（环境中有 `variable (q : Prop) (α : Type u) (p : α → Prop) (w : α) (x : α)`。）

可把 `Exists.intro` 视为信息隐藏操作，因为它隐藏见证而只暴露断言体。存在消去规则 `Exists.elim` 做相反操作：由 `∃ x : α, p x` 证命题 `q`，须证对任意值 `w`，`q` 由 `p w` 推出。粗略说，既然知道存在满足 `p x` 的 `x`，可给它起名，如 `w`。若 `q` 不提及 `w`，则证 `q` 由 `p w` 推出，等价于证 `q` 由任何这样的 `x` 的存在推出。示例：

```lean
variable (α : Type) (p q : α → Prop)

example (h : ∃ x, p x ∧ q x) : ∃ x, q x ∧ p x :=
  Exists.elim h
    (fun w =>
     fun hw : p w ∧ q w =>
     show ∃ x, q x ∧ p x from ⟨w, hw.right, hw.left⟩)
```

（环境中有 `variable {α : Type u} (p : α → Prop) {β : α → Type} (a : α) (h : p a) (h' : β a)`。）

将存在消去与析取消去比较有帮助：断言 `∃ x : α, p x` 可视为当 `a` 遍历 `α` 中所有元素时，命题 `p a` 的大析取。注意匿名构造子 `⟨w, hw.right, hw.left⟩` 缩写嵌套构造子应用；也可写 `⟨w, ⟨hw.right, hw.left⟩⟩`。

注意存在命题与依赖类型一节中的 sigma 类型非常相似：存在命题是**命题**，sigma 类型是**类型**；除此以外很相似。给定谓词 `p : α → Prop` 与类型族 `β : α → Type`，对项 `a : α` 及 `h : p a`、`h' : β a`，`Exists.intro a h` 的类型为 `(∃ x : α, p x) : Prop`，而 `Sigma.mk a h'` 的类型为 `(Σ x : α, β x)`。`∃` 与 `Σ` 的相似是 Curry-Howard 同构的又一例。

Lean 用 **`match`** 表达式更方便地从存在量词消去：

```lean
variable (α : Type) (p q : α → Prop)

example (h : ∃ x, p x ∧ q x) : ∃ x, q x ∧ p x :=
  match h with
  | ⟨w, hw⟩ => ⟨w, hw.right, hw.left⟩
```

**`match`** 是 Lean 函数定义系统的一部分，提供定义复杂函数的便利、富有表达力的方式。再次借助 Curry-Howard 同构，我们可借用它写证明。`match` 语句把存在断言「解构」为分量 `w`、`hw`，再在体中用于证命题。可为清晰标注 match 中使用的类型：

```lean
variable (α : Type) (p q : α → Prop)
------
example (h : ∃ x, p x ∧ q x) : ∃ x, q x ∧ p x :=
  match h with
  | ⟨(w : α), (hw : p w ∧ q w)⟩ => ⟨w, hw.right, hw.left⟩
```

甚至可在 match 中同时解构合取：

```lean
variable (α : Type) (p q : α → Prop)
------
example (h : ∃ x, p x ∧ q x) : ∃ x, q x ∧ p x :=
  match h with
  | ⟨w, hpw, hqw⟩ => ⟨w, hqw, hpw⟩
```

Lean 还提供模式匹配 **`let`** 表达式：

```lean
variable (α : Type) (p q : α → Prop)
------
example (h : ∃ x, p x ∧ q x) : ∃ x, q x ∧ p x :=
  let ⟨w, hpw, hqw⟩ := h
  ⟨w, hqw, hpw⟩
```

这实质上是上例 `match` 的替代记号。Lean 甚至允许在 **`fun`** 表达式中使用隐式 `match`：

```lean
variable (α : Type) (p q : α → Prop)
------
example : (∃ x, p x ∧ q x) → ∃ x, q x ∧ p x :=
  fun ⟨w, hpw, hqw⟩ => ⟨w, hqw, hpw⟩
```

第 8 章「归纳与递归」将看到，这些变体都是更一般模式匹配构造的实例。

（环境中有 `def IsEven (a : Nat) := ∃ b, a = 2 * b`、`variable (a : Nat)`。）

下例定义 `IsEven a` 为 `∃ b, a = 2 * b`，并证两偶数之和为偶数：

```lean
def IsEven (a : Nat) := ∃ b, a = 2 * b

theorem even_plus_even (h1 : IsEven a) (h2 : IsEven b) :
    IsEven (a + b) :=
  Exists.elim h1 (fun w1 (hw1 : a = 2 * w1) =>
  Exists.elim h2 (fun w2 (hw2 : b = 2 * w2) =>
    Exists.intro (w1 + w2)
      (calc a + b
        _ = 2 * w1 + 2 * w2 := by rw [hw1, hw2]
        _ = 2 * (w1 + w2)   := by rw [Nat.mul_add])))
```

借助本章介绍的 match、匿名构造子与 **`rewrite`** 策略，可简洁写成：

```lean
def IsEven (a : Nat) := ∃ b, a = 2 * b
------
theorem even_plus_even (h1 : IsEven a) (h2 : IsEven b) :
    IsEven (a + b) :=
  match h1, h2 with
  | ⟨w1, hw1⟩, ⟨w2, hw2⟩ =>
    ⟨w1 + w2, by rw [hw1, hw2, Nat.mul_add]⟩
```

正如构造性「或」强于经典「或」，构造性「存在」也强于经典「存在」。例如下列蕴含需经典推理：从构造性角度看，知道并非每个 `x` 都满足 `¬ p`，不同于有特定 `x` 满足 `p`。

```lean
open Classical
variable (p : α → Prop)

example (h : ¬ ∀ x, ¬ p x) : ∃ x, p x :=
  byContradiction
    (fun h1 : ¬ ∃ x, p x =>
      have h2 : ∀ x, ¬ p x :=
        fun x =>
        fun h3 : p x =>
        have h4 : ∃ x, p x := ⟨x, h3⟩
        show False from h1 h4
      show False from h h2)
```

下列为涉及存在量词的常见恒等式。练习中鼓励尽可能多证；也留给你判断哪些是非构造性的、因而需某种经典推理。

```lean
open Classical

variable (α : Type) (p q : α → Prop)
variable (r : Prop)

example : (∃ x : α, r) → r := sorry
example (a : α) : r → (∃ x : α, r) := sorry
example : (∃ x, p x ∧ r) ↔ (∃ x, p x) ∧ r := sorry
example : (∃ x, p x ∨ q x) ↔ (∃ x, p x) ∨ (∃ x, q x) := sorry

example : (∀ x, p x) ↔ ¬ (∃ x, ¬ p x) := sorry
example : (∃ x, p x) ↔ ¬ (∀ x, ¬ p x) := sorry
example : (¬ ∃ x, p x) ↔ (∀ x, ¬ p x) := sorry
example : (¬ ∀ x, p x) ↔ (∃ x, ¬ p x) := sorry

example : (∀ x, p x → r) ↔ (∃ x, p x) → r := sorry
example (a : α) : (∃ x, p x → r) ↔ (∀ x, p x) → r := sorry
example (a : α) : (∃ x, r → p x) ↔ (r → ∃ x, p x) := sorry
```

注意第二个例子与最后两个例子需要假定类型 `α` 中至少有一个元素 `a`。

下面是较难两条的解答：

```lean
open Classical

variable (α : Type) (p q : α → Prop)
variable (a : α)
variable (r : Prop)

example : (∃ x, p x ∨ q x) ↔ (∃ x, p x) ∨ (∃ x, q x) :=
  Iff.intro
    (fun ⟨a, (h1 : p a ∨ q a)⟩ =>
      Or.elim h1
        (fun hpa : p a => Or.inl ⟨a, hpa⟩)
        (fun hqa : q a => Or.inr ⟨a, hqa⟩))
    (fun h : (∃ x, p x) ∨ (∃ x, q x) =>
      Or.elim h
        (fun ⟨a, hpa⟩ => ⟨a, (Or.inl hpa)⟩)
        (fun ⟨a, hqa⟩ => ⟨a, (Or.inr hqa)⟩))

example : (∃ x, p x → r) ↔ (∀ x, p x) → r :=
  Iff.intro
    (fun ⟨b, (hb : p b → r)⟩ =>
     fun h2 : ∀ x, p x =>
     show r from hb (h2 b))
    (fun h1 : (∀ x, p x) → r =>
     show ∃ x, p x → r from
       byCases
         (fun hap : ∀ x, p x => ⟨a, λ h' => h1 hap⟩)
         (fun hnap : ¬ ∀ x, p x =>
          byContradiction
            (fun hnex : ¬ ∃ x, p x → r =>
              have hap : ∀ x, p x :=
                fun x =>
                byContradiction
                  (fun hnp : ¬ p x =>
                    have hex : ∃ x, p x → r := ⟨x, (fun hp => absurd hp hnp)⟩
                    show False from hnex hex)
              show False from hnap hap)))
```

## 4.5 证明语言的更多内容

我们已看到 **`fun`**、**`have`**、**`show`** 等关键字可写出与非形式数学证明结构镜像的形式证明项。本节讨论证明语言中常便利的附加特性。

首先，可用匿名 **`have`** 引入辅助目标而无需标签；可用关键字 **`this`** 引用以此方式引入的最后一个表达式：

```lean
variable (f : Nat → Nat)
variable (h : ∀ x : Nat, f x ≤ f (x + 1))

example : f 0 ≤ f 3 :=
  have : f 0 ≤ f 1 := h 0
  have : f 0 ≤ f 2 := Nat.le_trans this (h 1)
  show f 0 ≤ f 3 from Nat.le_trans this (h 2)
```

证明常从一个事实过渡到下一个，这可有效减少大量标签的杂乱。

当目标可推断时，也可让 Lean 用 **`by assumption`** 填证明：

```lean
variable (f : Nat → Nat)
variable (h : ∀ x : Nat, f x ≤ f (x + 1))
------
example : f 0 ≤ f 3 :=
  have : f 0 ≤ f 1 := h 0
  have : f 0 ≤ f 2 := Nat.le_trans (by assumption) (h 1)
  show f 0 ≤ f 3 from Nat.le_trans (by assumption) (h 2)
```

这告诉 Lean 使用 **`assumption`** 策略，该策略在局部上下文中找合适假设以证明目标。第 5 章将详述 **`assumption`**。

（环境中有 `variable {p : Prop} (prf : p)`。）

也可写 **`‹p›`**，让 Lean 在上下文中找命题 `p` 的证明。角引号输入 `\f<`、`\f>`。字母「f」表「French」，因该 Unicode 符号也可作法语引号。该记号在 Lean 中定义如下：

```lean
notation "‹" p "›" => show p by assumption
```

这比 `by assumption` 更稳健，因为须推断的假设类型被显式给出；也使证明更易读。更 elaborate 的例子：

```lean
variable (f : Nat → Nat)
variable (h : ∀ x : Nat, f x ≤ f (x + 1))

example : f 0 ≥ f 1 → f 1 ≥ f 2 → f 0 = f 2 :=
  fun _ : f 0 ≥ f 1 =>
  fun _ : f 1 ≥ f 2 =>
  have : f 0 ≥ f 2 := Nat.le_trans ‹f 1 ≥ f 2› ‹f 0 ≥ f 1›
  have : f 0 ≤ f 2 := Nat.le_trans (h 0) (h 1)
  show f 0 = f 2 from Nat.le_antisymm this ‹f 0 ≥ f 2›
```

记住：可用法式引号这种方式引用上下文中**任何**东西，不限于匿名引入的；也不限于命题，用于数据略怪：

```lean
example (n : Nat) : Nat := ‹Nat›
```

后文将说明如何用 Lean 宏系统扩展证明语言。

## 4.6 练习

1. 证明下列等价：

    ```lean
    variable (α : Type) (p q : α → Prop)

    example : (∀ x, p x ∧ q x) ↔ (∀ x, p x) ∧ (∀ x, q x) := sorry
    example : (∀ x, p x → q x) → (∀ x, p x) → (∀ x, q x) := sorry
    example : (∀ x, p x) ∨ (∀ x, q x) → ∀ x, p x ∨ q x := sorry
    ```

   也应理解为何最后一个例子的逆蕴含不可证。

2. 当公式某成分不依赖量化变量时，常可把它提到全称量词外。试证下列（第二个的某一方向需经典逻辑）：

    ```lean
    variable (α : Type) (p q : α → Prop)
    variable (r : Prop)

    example : α → ((∀ x : α, r) ↔ r) := sorry
    example : (∀ x, p x ∨ r) ↔ (∀ x, p x) ∨ r := sorry
    example : (∀ x, r → p x) ↔ (r → ∀ x, p x) := sorry
    ```

3. 考虑「理发师悖论」：某镇有一位（男性）理发师，他给所有且仅给不给自己刮脸的男人刮脸。证明这是矛盾：

    ```lean
    variable (men : Type) (barber : men)
    variable (shaves : men → men → Prop)

    example (h : ∀ x : men, shaves barber x ↔ ¬ shaves x x) : False :=
      sorry
    ```

4. （环境中有 `variable {n : Nat}`。）记住：无任何参数时，`Prop` 类型的表达式只是断言。填写下面 `prime`、`Fermat_prime` 等的定义，并构造各给定断言。例如可说存在无穷多素数：断言对每个自然数 `n`，存在大于 `n` 的素数。哥德巴赫弱猜想（Goldbach's weak conjecture）称每个大于 5 的奇数是三个素数之和。必要时查阅费马素数等定义。

    ```lean
    def even (n : Nat) : Prop := sorry

    def prime (n : Nat) : Prop := sorry

    def infinitely_many_primes : Prop := sorry

    def Fermat_prime (n : Nat) : Prop := sorry

    def infinitely_many_Fermat_primes : Prop := sorry

    def goldbach_conjecture : Prop := sorry

    def Goldbach's_weak_conjecture : Prop := sorry

    def Fermat's_last_theorem : Prop := sorry
    ```

5. 尽可能多证「存在量词」一节所列恒等式。