# 第 3 章：命题与证明

> 本译文对应原书 [Propositions and Proofs](https://lean-lang.org/theorem_proving_in_lean4/Propositions-and-Proofs/)；英文 Verso 源：`book/TPiL/PropositionsAndProofs.lean`。

至此你已见过在 Lean 中定义对象与函数的若干方式。本章开始说明如何在依赖类型论的语言中书写数学断言与证明。

## 3.1 命题即类型

在依赖类型论中为已定义对象证明断言，一种做法是：在定义语言之上再叠一层断言语言与证明语言。但没必要叠这么多语言——依赖类型论足够灵活、富有表达力，完全可以在同一框架中表示断言与证明。

例如，可引入新类型 `Prop` 表示命题，并引入构造子从其他命题构造新命题：

```lean
def Implies (p q : Prop) : Prop := p → q
------
#check And     -- And (a b : Prop) : Prop

#check Or      -- Or (a b : Prop) : Prop

#check Not     -- Not (a : Prop) : Prop

#check Implies -- Implies (p q : Prop) : Prop

variable (p q r : Prop)

#check And p q                      -- p ∧ q : Prop

#check Or (And p q) r               -- p ∧ q ∨ r : Prop

#check Implies (And p q) (And q p)  -- Implies (p ∧ q) (q ∧ p) : Prop
```

（上文代码块前，Lean 环境中已声明 `variable (p : Prop)`、`structure Proof (p : Prop) : Type where proof : p`、`variable (t : p) (q r : Prop)`、`def Implies (p q : Prop) : Prop := p → q`、`universe u`、`variable (t1 t2 : p) {α : Type u} {β : Type v}`。）

接着，对每个 `p : Prop`，可再引入类型 `Proof p`，表示 `p` 的证明类型。「公理」就是此类类型的一个常量：

```lean
def Implies (p q : Prop) : Prop := p → q
structure Proof (p : Prop) : Type where
  proof : p
------
#check Proof   -- Proof (p : Prop) : Type

axiom and_commut (p q : Prop) : Proof (Implies (And p q) (And q p))

variable (p q : Prop)

#check and_commut p q     -- and_commut p q : Proof (Implies (p ∧ q) (q ∧ p))
```

除公理外，还需要从旧证明构造新证明的规则。例如，许多命题逻辑证明系统有**假言推理**（modus ponens）规则：

> 由 `Implies p q` 的证明与 `p` 的证明，可得 `q` 的证明。

可表示为：

```lean
def Implies (p q : Prop) : Prop := p → q
structure Proof (p : Prop) : Type where
  proof : p
------
axiom modus_ponens (p q : Prop) :
  Proof (Implies p q) → Proof p →
  Proof q
```

命题逻辑的自然演绎系统通常还依赖如下规则：

> 假设在假设 `p` 成立时可证 `q`，则「取消」该假设，可得 `Implies p q` 的证明。

可表示为：

```lean
def Implies (p q : Prop) : Prop := p → q
structure Proof (p : Prop) : Type where
  proof : p
------
axiom implies_intro (p q : Prop) :
  (Proof p → Proof q) → Proof (Implies p q)
```

这一路线能合理搭建断言与证明。判断表达式 `t` 是否为断言 `p` 的正确证明，只需检查 `t` 是否具有类型 `Proof p`。

然而可以简化。首先，不必反复写 `Proof`，可把 `Proof p` 与 `p` 本身等同：每当有 `p : Prop`，就把 `p` 解释为类型——即其证明的类型。于是 `t : p` 可读作：`t` 是 `p` 的证明。

一旦如此等同，蕴含规则表明可在 `Implies p q` 与 `p → q` 之间来回转换。换言之，命题 `p` 与 `q` 之间的蕴含，对应于把 `p` 的任意元素映到 `q` 的元素的函数。因此单独引入 `Implies` 完全多余：可直接用依赖类型论中惯用的函数空间构造子 `p → q` 作为蕴含。

构造演算采用这一做法，Lean 亦然。自然演绎中蕴含规则与函数的抽象、应用规则一一对应，这是 **Curry-Howard 同构**（Curry-Howard isomorphism），亦称 **命题即类型**（propositions-as-types）范式。事实上，类型 `Prop` 是 `Sort 0` 的语法糖，即上一章所述类型层次的最底层；`Type u` 也是 `Sort (u+1)` 的语法糖。`Prop` 有些特殊性质，但与其他类型宇宙一样，在箭头构造子下封闭：若 `p q : Prop`，则 `p → q : Prop`。

关于命题即类型，至少有两种理解。持构造主义逻辑与数学观的人，认为这是命题含义的忠实刻画：命题 `p` 表示一种数据类型，即构成证明的数据类型规约；`p` 的证明就是类型正确的对象 `t : p`。

不认同该意识形态的人，可把它看作一种编码技巧：对每个命题 `p` 关联一个类型——若 `p` 为假则空，若为真则恰有一个元素，记作 `*`。后一种情况称（与 `p` 关联的）类型是**可居留的**（inhabited）。函数应用与抽象的规则恰好便于追踪 `Prop` 中哪些元素可居留。构造 `t : p` 即表明 `p` 为真；可把 `p` 的居留元看作「`p` 为真这一事实」。`p → q` 的证明用「`p` 为真」得出「`q` 为真」。

事实上，对任意 `p : Prop`，Lean 内核把任意两个 `t1 t2 : p` 视为定义相等，就像把 `(fun x => t) s` 与 `t[s/x]` 视为定义相等一样。这称为**证明无关性**（proof irrelevance），与上段编码解释一致：尽管可把证明 `t : p` 当作依赖类型论语言中的普通对象，它们除「`p` 为真」外不携带信息。

上述两种理解在根本上不同。构造主义视角下，证明是抽象数学对象，由依赖类型论中合适的表达式**指称**；编码技巧视角下，表达式本身并不指称有趣的东西——能写下并类型检查通过，才保证命题为真；表达式**本身**就是证明。

下文叙述会在两种说法间切换：有时说表达式「构造」「产生」「返回」某命题的证明，有时直接说它就是该证明。这与计算机科学家偶尔模糊语法与语义类似：有时说程序「计算」某函数，有时又说程序「就是」该函数。

无论如何，底线很清楚：要在依赖类型论中形式表达数学断言，需给出项 `p : Prop`；要**证明**该断言，需给出项 `t : p`。Lean 作为证明助手，任务是帮助我们构造这样的项 `t`，并验证其良构且类型正确。

## 3.2 把命题当作类型来用

在命题即类型范式下，只涉及 `→` 的定理可用 lambda 抽象与应用证明。Lean 中 **`theorem`** 命令引入新定理：

```lean
set_option linter.unusedVariables false
---
variable {p : Prop}
variable {q : Prop}

theorem t1 : p → q → p := fun hp : p => fun hq : q => hp
```

将此证明与类型为 `α → β → α` 的表达式 `fun x : α => fun y : β => x` 比较，其中 `α`、`β` 为数据类型。它描述的是：取类型为 `α`、`β` 的参数 `x`、`y`，返回 `x`。`t1` 的证明形式相同，只是 `p`、`q` 是 `Prop` 的元素而非 `Type`。直观上，`p → q → p` 的证明假设 `p`、`q` 为真，用第一个假设（平凡地）建立结论 `p` 为真。

注意 **`theorem`** 命令实质上是 **`def`** 的一种：`theorem` 与类型对应下，证明 `p → q → p` 就是定义关联类型的元素。对内核类型检查器，二者无别。

定义与定理在实践上有几处差别。通常不必「展开」定理的「定义」；由证明无关性，该定理的任意两个证明定义相等。证明完成后，一般只需知道证明存在，具体是哪一个并不重要。因此 Lean 把证明标为**不可约**（irreducible），提示解析器（更精确地说，**elaborator**）处理文件时通常不必展开它们。Lean 常能并行处理、检查证明，因为判定一个证明是否正确不必知道另一个的细节。此外，定义体中引用的 section 变量会自动加为参数，而定理类型中引用的变量才会加为参数——因为证明方式不应影响被证陈述。

与定义一样，**`#print`** 会显示定理的证明：

```lean
set_option linter.unusedVariables false
variable {p : Prop}
variable {q : Prop}
------
theorem t1 : p → q → p := fun hp : p => fun hq : q => hp

#print t1 -- theorem t1 : ∀ {p q : Prop}, p → q → p := fun {p q} hp hq => hp
```

lambda 抽象 `hp : p`、`hq : q` 可视为 `t1` 证明中的临时假设。Lean 也允许用 **`show`** 显式标注最终项 `hp` 的类型：

```lean
set_option linter.unusedVariables false
variable {p : Prop}
variable {q : Prop}
------
theorem t1 : p → q → p :=
  fun hp : p =>
  fun hq : q =>
  show p from hp
```

这类额外信息可提高证明清晰度、帮助发现错误。**`show`** 仅标注类型；内部所见各版 `t1` 产生相同项。

与普通定义一样，可把 lambda 抽象变量移到冒号左侧：

```lean
set_option linter.unusedVariables false
variable {p : Prop}
variable {q : Prop}
------
theorem t1 (hp : p) (hq : q) : p := hp

#print t1    -- theorem t1 : ∀ {p q : Prop}, p → q → p := fun {p q} hp hq => hp
```

可像函数应用一样使用定理 `t1`：

```lean
set_option linter.unusedVariables false
variable {p : Prop}
variable {q : Prop}
------
theorem t1 (hp : p) (hq : q) : p := hp

axiom hp : p

theorem t2 : q → p := t1 hp
```

**`axiom`** 声明假定给定类型存在元素，可能损害逻辑一致性。例如可假定空类型 `False` 有元素：

```lean
axiom unsound : False
-- Everything follows from false
theorem ex : 1 = 0 :=
  False.elim unsound
```

（上文 `axiom hp : p` 等价于声明 `p` 为真，见证为 `hp`。把定理 `t1 : p → q → p` 用于事实 `hp : p`，得定理 `t1 hp : q → p`。）

还可把定理 `t1` 写成：

```lean
set_option linter.unusedVariables false
------
theorem t1 {p q : Prop} (hp : p) (hq : q) : p := hp

#print t1
```

此时 `t1` 的类型为 `∀ {p q : Prop}, p → q → p`，可读作「对每对命题 `p`、`q`，有 `p → q → p`」。例如把所有参数移到冒号右侧：

```lean
set_option linter.unusedVariables false
------
theorem t1 : ∀ {p q : Prop}, p → q → p :=
  fun {p q : Prop} (hp : p) (hq : q) => hp
```

若 `p`、`q` 已声明为变量，Lean 会自动泛化：

```lean
variable {p q : Prop}

theorem t1 : p → q → p := fun (hp : p) (hq : q) => hp
```

这样泛化后，可把 `t1` 用于不同命题对，得到一般定理的不同实例：

```lean
set_option linter.unusedVariables false
------
theorem t1 (p q : Prop) (hp : p) (hq : q) : p := hp

variable (p q r s : Prop)

#check t1 p q                -- t1 p q : p → q → p
#check t1 r s                -- t1 r s : r → s → r
#check t1 (r → s) (s → r)    -- t1 (r → s) (s → r) : (r → s) → (s → r) → r → s

variable (h : r → s)

#check t1 (r → s) (s → r) h  -- t1 (r → s) (s → r) h : (s → r) → r → s
```

再次借助命题即类型对应，类型为 `r → s` 的变量 `h` 可视为前提：`r → s` 成立。

再看上一章讨论的复合函数，这次用命题代替类型：

```lean
variable (p q r s : Prop)

theorem t2 (h₁ : q → r) (h₂ : p → q) : p → r :=
  fun h₃ : p =>
  show r from h₁ (h₂ h₃)
```

作为命题逻辑定理，`t2` 说的是什么？

注意假设常用数字 Unicode 下标，输入 `\0`、`\1`、`\2` 等，如本例。

## 3.3 命题逻辑

Lean 定义了所有标准逻辑联结词与记号。命题联结词记号如下：

| ASCII | Unicode | 编辑器快捷键 | 定义 |
|-------|---------|-------------|------|
| `True` | （无） | （无） | `True` |
| `False` | （无） | （无） | `False` |
| `Not` | `¬` | `\not`、`\neg` | `Not` |
| `/\` | `∧` | `\and` | `And` |
| `\/` | `∨` | `\or` | `Or` |
| `->` | `→` | `\to`、`\r`、`\imp` | （函数类型） |
| `<->` | `↔` | `\iff`、`\lr` | `Iff` |

它们都取值于 `Prop`。

```lean
variable (p q : Prop)

#check p → q → p ∧ q

#check ¬p → p ↔ False

#check p ∨ q → q ∨ p
```

运算优先级：一元否定 `¬` 最强，然后 `∧`，然后 `∨`，然后 `→`，最后 `↔`。例如 `a ∧ b → c ∨ d ∧ e` 表示 `(a ∧ b) → (c ∨ (d ∧ e))`。记住 `→` 右结合（参数是 `Prop` 元素而非其他 `Type` 时亦然），其他二元联结词亦然。故 `p q r : Prop` 时，`p → q → r` 读作「若 `p`，则若 `q`，则 `r`」——即 `p ∧ q → r` 的「柯里化」形式。

上一章我们看到 lambda 抽象可视为 `→` 的「引入规则」；当前语境下，它说明如何引入、建立蕴含。应用可视为「消去规则」，说明如何在证明中使用蕴含。其他命题联结词在 Lean 库中定义并自动导入；每个联结词都有规范的引入与消去规则。

### 3.3.1 合取

（环境中有 `variable (p q : Prop) (h1 : p) (h2 : q)`。）

表达式 `And.intro h1 h2` 用证明 `h1 : p`、`h2 : q` 构造 `p ∧ q` 的证明。常称 `And.intro` 为**合取引入**（and-introduction）规则。下例用 `And.intro` 构造 `p → q → p ∧ q` 的证明：

```lean
variable (p q : Prop)

example (hp : p) (hq : q) : p ∧ q := And.intro hp hq

#check fun (hp : p) (hq : q) => And.intro hp hq
```

**`example`** 命令陈述定理但不命名、不存入永久环境；实质上只检查给定项是否具有所示类型，便于说明，下文会常用。

（环境中有 `variable (p q : Prop) (h : p ∧ q)`。）

`And.left h` 从 `h : p ∧ q` 得 `p` 的证明；`And.right h` 得 `q` 的证明。常称左右**合取消去**（and-elimination）规则。

```lean
variable (p q : Prop)

example (h : p ∧ q) : p := And.left h
example (h : p ∧ q) : q := And.right h
```

现可用下列证明项证 `p ∧ q → q ∧ p`：

```lean
variable (p q : Prop)

example (h : p ∧ q) : q ∧ p :=
  And.intro (And.right h) (And.left h)
```

（环境中有 `variable (p q : Prop) (hp : p) (hq : q) (α β : Type) (a : α) (b : β)`。）

合取引入与消去类似笛卡尔积的配对与投影。区别是：给定 `hp : p`、`hq : q`，`And.intro hp hq` 的类型为 `p ∧ q : Prop`；给定 `a : α`、`b : β`，`Prod.mk a b` 的类型为 `α × β : Type`。`Prod` 不能用于 `Prop`，`And` 不能用于 `Type`。`∧` 与 `×` 的相似是 Curry-Howard 同构的又一例；但与蕴含和函数空间不同，Lean 将 `∧` 与 `×` 分开处理。按类比，刚构造的证明类似交换一对元素次序的函数。

第 9 章「结构体与记录」将看到，Lean 中某些类型是**结构体**（structure）：用单一规范**构造子**从合适参数序列构造类型元素。对每个 `p q : Prop`，`p ∧ q` 即如此：规范构造方式是向 `And.intro` 传入 `hp : p`、`hq : q`。Lean 允许在归纳类型且类型可由上下文推断时使用**匿名构造子**记法 `⟨arg1, arg2, ...⟩`；常可写 `⟨hp, hq⟩` 代替 `And.intro hp hq`：

```lean
variable (p q : Prop)
variable (hp : p) (hq : q)

#check (⟨hp, hq⟩ : p ∧ q)
```

尖括号输入 `\<`、`\>`。

Lean 还有实用语法：对归纳类型 `Foo`（可能带参数）的表达式 `e`，记法 `e.bar` 是 `Foo.bar e` 的简写，便于不打开命名空间访问函数。例如下列两式等价：

```lean
variable (xs : List Nat)

#check List.length xs

#check xs.length
```

因此给定 `h : p ∧ q`，可写 `h.left` 表 `And.left h`，`h.right` 表 `And.right h`。上例可简洁重写为：

```lean
variable (p q : Prop)

example (h : p ∧ q) : q ∧ p :=
  ⟨h.right, h.left⟩
```

简洁与晦涩之间需权衡；省略信息有时反而难读。但对 `h` 的类型与构造目标都清楚时，如上例，该记法干净有效。

常需迭代「And」类构造。Lean 允许压平右结合的嵌套构造子，故下列两证明等价：

```lean
variable (p q : Prop)

example (h : p ∧ q) : q ∧ p ∧ q :=
  ⟨h.right, ⟨h.left, h.right⟩⟩

example (h : p ∧ q) : q ∧ p ∧ q :=
  ⟨h.right, h.left, h.right⟩
```

这往往也很有用。

### 3.3.2 析取

（环境中有 `variable (p q : Prop) (hp : p) (hq : q)`。）

`Or.intro_left q hp` 从 `hp : p` 构造 `p ∨ q` 的证明；`Or.intro_right p hq` 从 `hq : q` 构造。这是左右**析取引入**（or-introduction）规则。

```lean
variable (p q : Prop)
example (hp : p) : p ∨ q := Or.intro_left q hp
example (hq : q) : p ∨ q := Or.intro_right p hq
```

（环境中有 `variable (p q r : Prop) (hpq : p ∨ q) (hpr : p → r) (hqr : q → r)`。）

**析取消去**（or-elimination）稍复杂：要由 `p ∨ q` 证 `r`，需证 `p` 可推出 `r`，且 `q` 可推出 `r`——即分情形证明。`Or.elim hpq hpr hqr` 中，`Or.elim` 取 `hpq : p ∨ q`、`hpr : p → r`、`hqr : q → r`，产出 `r` 的证明。下例用 `Or.elim` 证 `p ∨ q → q ∨ p`：

```lean
variable (p q r : Prop)

example (h : p ∨ q) : q ∨ p :=
  Or.elim h
    (fun hp : p =>
      show q ∨ p from Or.intro_right q hp)
    (fun hq : q =>
      show q ∨ p from Or.intro_left p hq)
```

多数情况下 `Or.intro_right`、`Or.intro_left` 的第一个参数可由 Lean 自动推断。Lean 提供 `Or.inr`、`Or.inl`，可视为 `Or.intro_right _`、`Or.intro_left _` 的简写。上例证明项可更简洁：

```lean
variable (p q r : Prop)

example (h : p ∨ q) : q ∨ p :=
  Or.elim h (fun hp => Or.inr hp) (fun hq => Or.inl hq)
```

完整表达式中信息足够让 Lean 推断 `hp`、`hq` 的类型；带类型标注的长版更易读，也便于排错。

（环境中有 `variable (h : p ∨ q)`。）

`Or` 有两个构造子，不能用匿名构造子记法；但可写 `h.elim` 代替 `Or.elim h`：

```lean
variable (p q r : Prop)

example (h : p ∨ q) : q ∨ p :=
  h.elim (fun hp => Or.inr hp) (fun hq => Or.inl hq)
```

是否采用此类缩写，需自行判断可读性。

### 3.3.3 否定与假

（环境中有 `variable (p q : Prop) (hnp : ¬ p) (hp : p)`。）

否定 `¬p` 实际定义为 `p → False`，故由 `p` 导出矛盾可得 `¬p`。表达式 `hnp hp` 由 `hp : p` 与 `hnp : ¬p` 产出 `False` 的证明。下例用这两条规则证 `(p → q) → ¬q → ¬p`。（符号 `¬` 输入 `\not` 或 `\neg`。）

```lean
variable (p q : Prop)

example (hpq : p → q) (hnq : ¬q) : ¬p :=
  fun hp : p =>
  show False from hnq (hpq hp)
```

联结词 `False` 只有一条消去规则 `False.elim`，表达矛盾可推出任意结论；有时称 **ex falso**（*ex falso sequitur quodlibet*）或**爆炸原理**（principle of explosion）。

```lean
variable (p q : Prop)

example (hp : p) (hnp : ¬p) : q := False.elim (hnp hp)
```

由矛盾推出的任意事实 `q` 在 `False.elim` 中是隐式参数并自动推断。从矛盾假设推出任意结论的模式很常见，由 **`absurd`** 表示：

```lean
variable (p q : Prop)

example (hp : p) (hnp : ¬p) : q := absurd hp hnp
```

例如 `¬p → q → (q → p) → r` 的证明：

```lean
variable (p q r : Prop)

example (hnp : ¬p) (hq : q) (hqp : q → p) : r :=
  absurd (hqp hq) hnp
```

顺便，`False` 只有消去规则；`True` 只有引入规则 `True.intro : True`。换言之，`True` 就是真，有规范证明 `True.intro`。

### 3.3.4 逻辑等价

（环境中有 `variable (p q : Prop) (h1 : p → q) (h2 : q → p) (h : p ↔ q)`。）

`Iff.intro h1 h2` 由 `h1 : p → q`、`h2 : q → p` 产出 `p ↔ q` 的证明。`Iff.mp h` 由 `h : p ↔ q` 得 `p → q`；`Iff.mpr h` 得 `q → p`。下面是 `p ∧ q ↔ q ∧ p` 的证明：

```lean
variable (p q : Prop)

theorem and_swap : p ∧ q ↔ q ∧ p :=
  Iff.intro
    (fun h : p ∧ q =>
     show q ∧ p from And.intro (And.right h) (And.left h))
    (fun h : q ∧ p =>
     show p ∧ q from And.intro (And.right h) (And.left h))

#check and_swap p q    -- and_swap p q : p ∧ q ↔ q ∧ p

variable (h : p ∧ q)
example : q ∧ p := Iff.mp (and_swap p q) h
```

可用匿名构造子从正、反方向证明构造 `p ↔ q`，也可用 `.` 记法配合 `mp`、`mpr`。上例可简洁写成：

```lean
variable (p q : Prop)

theorem and_swap : p ∧ q ↔ q ∧ p :=
  ⟨ fun h => ⟨h.right, h.left⟩, fun h => ⟨h.right, h.left⟩ ⟩

example (h : p ∧ q) : q ∧ p := (and_swap p q).mp h
```

## 3.4 引入辅助子目标

此处适合介绍 Lean 的另一结构工具：**`have`**，在证明中引入辅助子目标。下例改编自上一节：

```lean
variable (p q : Prop)

example (h : p ∧ q) : q ∧ p :=
  have hp : p := h.left
  have hq : q := h.right
  show q ∧ p from And.intro hq hp
```

（环境中有 `variable (p q : Prop) (s : p) (t : q)`。）

内部，`have h : p := s; t` 产生项 `(fun (h : p) => t) s`。即 `s` 是 `p` 的证明，在假设 `h : p` 下 `t` 是期望结论的证明，二者经 lambda 抽象与应用组合。长证明中可用中间 **`have`** 作垫脚石。

Lean 还支持从目标**反向**推理的结构化方式，对应日常数学中的「只需证」。下例只是把上证明最后两行对调：

```lean
variable (p q : Prop)

example (h : p ∧ q) : q ∧ p :=
  have hp : p := h.left
  suffices hq : q from And.intro hq hp
  show q from And.right h
```

写 `suffices hq : q` 会留下两个目标：先证在附加假设 `hq : q` 下原目标 `q ∧ p`（即确实「只需证 `q`」）；再证 `q`。

## 3.5 经典逻辑

迄今所见引入、消去规则都是**构造性**的，反映基于命题即类型对应的、对逻辑联结词的计算理解。经典命题逻辑在此基础上加入**排中律**（law of the excluded middle）`p ∨ ¬p`。要用该原理，须 `open Classical`：

```lean
open Classical

variable (p : Prop)

#check em p
```

（环境中有 `variable (p q RH : Prop)`。）

直观上，构造性「或」很强：断言 `p ∨ q` 意味着知道哪一边成立。若 `RH` 表示黎曼猜想，经典数学家愿意断言 `RH ∨ ¬RH`，尽管我们还不能断言任一析取支。

排中律的一个推论是**双重否定消去**（double-negation elimination）：

```lean
open Classical

theorem dne {p : Prop} (h : ¬¬p) : p :=
  Or.elim (em p)
    (fun hp : p => hp)
    (fun hnp : ¬p => absurd hnp h)
```

双重否定消去允许：假设 `¬p` 并推出 `False`，即可证任意命题 `p`——即证 `¬¬p`。换言之，它允许**反证法**（proof by contradiction），构造逻辑中一般不可行。练习：试证逆命题，即由 `dne` 可证 `em`。

经典公理还带来可诉诸 `em` 的其他证明模式，例如分情形：

```lean
open Classical
variable (p : Prop)

example (h : ¬¬p) : p :=
  byCases
    (fun h1 : p => h1)
    (fun h1 : ¬p => absurd h1 h)
```

或反证法：

```lean
open Classical
variable (p : Prop)

example (h : ¬¬p) : p :=
  byContradiction
    (fun h1 : ¬p =>
     show False from h h1)
```

若不习惯构造性思维，弄清何处用到经典推理可能需要时间。下例需要经典推理，因为从构造性角度看，知道 `p`、`q` 不能同真，未必能断定哪一为假：

```lean
open Classical
variable (p q : Prop)
------
example (h : ¬(p ∧ q)) : ¬p ∨ ¬q :=
  Or.elim (em p)
    (fun hp : p =>
      Or.inr
        (show ¬q from
          fun hq : q =>
          h ⟨hp, hq⟩))
    (fun hp : ¬p =>
      Or.inl hp)
```

后文将看到，构造逻辑中**有些**情境允许排中律、双重否定消去；Lean 在这些语境支持经典推理而不依赖排中律。

Lean 支持经典推理所用的完整公理列表见第 12 章「公理与计算」。

## 3.6 命题永真式示例

（环境中有 `variable (p q r s : Prop)`。）

Lean 标准库含许多命题逻辑永真式的证明，可在自己的证明中自由使用。下列为常见恒等式。

**交换律：**

1. `p ∧ q ↔ q ∧ p`
2. `p ∨ q ↔ q ∨ p`

**结合律：**

3. `(p ∧ q) ∧ r ↔ p ∧ (q ∧ r)`
4. `(p ∨ q) ∨ r ↔ p ∨ (q ∨ r)`

**分配律：**

5. `p ∧ (q ∨ r) ↔ (p ∧ q) ∨ (p ∧ r)`
6. `p ∨ (q ∧ r) ↔ (p ∨ q) ∧ (p ∨ r)`

**其他性质：**

7. `(p → (q → r)) ↔ (p ∧ q → r)`
8. `((p ∨ q) → r) ↔ (p → r) ∧ (q → r)`
9. `¬(p ∨ q) ↔ ¬p ∧ ¬q`
10. `¬p ∨ ¬q → ¬(p ∧ q)`
11. `¬(p ∧ ¬p)`
12. `p ∧ ¬q → ¬(p → q)`
13. `¬p → (p → q)`
14. `(¬p ∨ q) → (p → q)`
15. `p ∨ False ↔ p`
16. `p ∧ False ↔ False`
17. `¬(p ↔ ¬p)`
18. `(p → q) → (¬q → ¬p)`

**下列需经典推理：**

19. `(p → r ∨ s) → ((p → r) ∨ (p → s))`
20. `¬(p ∧ q) → ¬p ∨ ¬q`
21. `¬(p → q) → p ∧ ¬q`
22. `(p → q) → (¬p ∨ q)`
23. `(¬q → ¬p) → (p → q)`
24. `p ∨ ¬p`
25. `(((p → q) → p) → p)`

标识符 **`sorry`** 可「神奇地」产出任意命题的证明，或任意数据类型的对象；作为证明方法它不健全——例如可用来证 `False`——Lean 对使用或依赖 `sorry` 的定理会给出严重警告。但它对增量构造长证明很有用：自上而下写证明，用 `sorry` 填子证明；确保 Lean 接受带全部 `sorry` 的项，否则先改错；再逐个换成真实证明，直至没有 `sorry`。

另一技巧：不用 `sorry`，用下划线 `_` 作占位符。回忆这告诉 Lean 该参数是隐式的、应自动填充。若 Lean 尝试失败，会报错「don't know how to synthesize placeholder」，并给出期望类型及上下文中可用对象与假设。对每个未解析占位符，Lean 报告该处须填的子目标；可据此增量构造证明。

供参考，下面给出列表中两条永真式的样例证明：

```lean
open Classical

-- distributivity
example (p q r : Prop) : p ∧ (q ∨ r) ↔ (p ∧ q) ∨ (p ∧ r) :=
  Iff.intro
    (fun h : p ∧ (q ∨ r) =>
      have hp : p := h.left
      Or.elim (h.right)
        (fun hq : q =>
          show (p ∧ q) ∨ (p ∧ r) from Or.inl ⟨hp, hq⟩)
        (fun hr : r =>
          show (p ∧ q) ∨ (p ∧ r) from Or.inr ⟨hp, hr⟩))
    (fun h : (p ∧ q) ∨ (p ∧ r) =>
      Or.elim h
        (fun hpq : p ∧ q =>
          have hp : p := hpq.left
          have hq : q := hpq.right
          show p ∧ (q ∨ r) from ⟨hp, Or.inl hq⟩)
        (fun hpr : p ∧ r =>
          have hp : p := hpr.left
          have hr : r := hpr.right
          show p ∧ (q ∨ r) from ⟨hp, Or.inr hr⟩))

-- an example that requires classical reasoning
example (p q : Prop) : ¬(p ∧ ¬q) → (p → q) :=
  fun h : ¬(p ∧ ¬q) =>
  fun hp : p =>
  show q from
    Or.elim (em q)
      (fun hq : q => hq)
      (fun hnq : ¬q => absurd (And.intro hp hnq) h)
```

## 3.7 练习

证明下列恒等式，将 `sorry` 替换为真实证明。

```lean
variable (p q r : Prop)

-- commutativity of ∧ and ∨
example : p ∧ q ↔ q ∧ p := sorry
example : p ∨ q ↔ q ∨ p := sorry

-- associativity of ∧ and ∨
example : (p ∧ q) ∧ r ↔ p ∧ (q ∧ r) := sorry
example : (p ∨ q) ∨ r ↔ p ∨ (q ∨ r) := sorry

-- distributivity
example : p ∧ (q ∨ r) ↔ (p ∧ q) ∨ (p ∧ r) := sorry
example : p ∨ (q ∧ r) ↔ (p ∨ q) ∧ (p ∨ r) := sorry

-- other properties
example : (p → (q → r)) ↔ (p ∧ q → r) := sorry
example : ((p ∨ q) → r) ↔ (p → r) ∧ (q → r) := sorry
example : ¬(p ∨ q) ↔ ¬p ∧ ¬q := sorry
example : ¬p ∨ ¬q → ¬(p ∧ q) := sorry
example : ¬(p ∧ ¬p) := sorry
example : p ∧ ¬q → ¬(p → q) := sorry
example : ¬p → (p → q) := sorry
example : (¬p ∨ q) → (p → q) := sorry
example : p ∨ False ↔ p := sorry
example : p ∧ False ↔ False := sorry
example : (p → q) → (¬q → ¬p) := sorry
```

下列恒等式也需经典推理，将 `sorry` 替换为真实证明：

```lean
open Classical

variable (p q r : Prop)

example : (p → q ∨ r) → ((p → q) ∨ (p → r)) := sorry
example : ¬(p ∧ q) → ¬p ∨ ¬q := sorry
example : ¬(p → q) → p ∧ ¬q := sorry
example : (p → q) → (¬p ∨ q) := sorry
example : (¬q → ¬p) → (p → q) := sorry
example : p ∨ ¬p := sorry
example : (((p → q) → p) → p) := sorry
```

在不使用经典逻辑的前提下，证明 `¬(p ↔ ¬p)`。