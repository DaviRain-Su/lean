# 结构体与继承

%%%
tag := "structure-inheritance"
%%%

要理解 {anchorName ApplicativeLaws}`Functor`、{anchorName ApplicativeLaws}`Applicative` 和 {anchorName ApplicativeLaws}`Monad` 的完整定义，还需要了解 Lean 的另一项特性：**结构体继承**（structure inheritance）。
结构体继承允许一种结构体类型提供另一种结构体的接口，并附带额外的字段。
当为具有清晰分类关系的概念建模时，这会很有用。
例如，考虑一个神话生物的模型。
其中一些体型庞大，另一些则体型娇小：

```anchor MythicalCreature
structure MythicalCreature where
  large : Bool
deriving Repr
```

在幕后，定义 {anchorName MythicalCreature}`MythicalCreature` 结构体会创建一个带单个构造子 {anchorName MythicalCreatureMore}`mk` 的归纳类型：

```anchor MythicalCreatureMk
#check MythicalCreature.mk
```

```anchorInfo MythicalCreatureMk
MythicalCreature.mk (large : Bool) : MythicalCreature
```

类似地，会创建一个函数 {anchorName MythicalCreatureLarge}`MythicalCreature.large`，它实际上从构造子中提取该字段：

```anchor MythicalCreatureLarge
#check MythicalCreature.large
```

```anchorInfo MythicalCreatureLarge
MythicalCreature.large (self : MythicalCreature) : Bool
```

在大多数古老的故事中，每种怪物都有某种可以被击败的方式。
对怪物的描述应包含这一信息，以及它是否体型庞大：

```anchor Monster
structure Monster extends MythicalCreature where
  vulnerability : String
deriving Repr
```

标题中的 {anchorTerm Monster}`extends MythicalCreature` 表明每个怪物也都是神话生物。
要定义一个 {anchorName Monster}`Monster`，需要同时提供 {anchorName Monster}`MythicalCreature` 的字段和 {anchorName Monster}`Monster` 的字段。
巨魔是一种体型庞大、惧怕阳光的怪物：

```anchor troll
def troll : Monster where
  large := true
  vulnerability := "sunlight"
```

在幕后，继承是通过组合实现的。
构造子 {anchorName MonsterMk}`Monster.mk` 接受一个 {anchorName Monster}`MythicalCreature` 作为参数：

```anchor MonsterMk
#check Monster.mk
```

```anchorInfo MonsterMk
Monster.mk (toMythicalCreature : MythicalCreature) (vulnerability : String) : Monster
```

除了为每个新字段定义提取函数外，还会定义一个类型为 {anchorTerm MonsterToCreature}`Monster → MythicalCreature` 的函数 {anchorTerm MonsterToCreature}`Monster.toMythicalCreature`。
它可以用来提取底层的神话生物。

在 Lean 中沿继承层次向上移动，与面向对象语言中的**向上转型**（upcasting）不是一回事。
向上转型运算符会使派生类的值被当作父类的实例来对待，但该值仍保留其身份和结构。
然而在 Lean 中，沿继承层次向上移动实际上会擦除底层信息。
要亲眼看到这一点，可以考虑求值 {anchorTerm evalTrollCast}`troll.toMythicalCreature` 的结果：

```anchor evalTrollCast
#eval troll.toMythicalCreature
```

```anchorInfo evalTrollCast
{ large := true }
```

只剩下 {anchorName MythicalCreature}`MythicalCreature` 的字段。


与 {kw}`where` 语法一样，带字段名的花括号记法也适用于结构体继承：

```anchor troll2
def troll : Monster := {large := true, vulnerability := "sunlight"}
```

然而，委托给底层构造子的匿名尖括号记法会暴露内部细节：

```anchor wrongTroll1
def troll : Monster := ⟨true, "sunlight"⟩
```

```anchorError wrongTroll1
Application type mismatch: The argument
  true
has type
  Bool
but is expected to have type
  MythicalCreature
in the application
  Monster.mk true
```

需要额外一对尖括号，它会在 {anchorName troll3}`true` 上调用 {anchorName MythicalCreatureMk}`MythicalCreature.mk`：

```anchor troll3
def troll : Monster := ⟨⟨true⟩, "sunlight"⟩
```


Lean 的**点号记法**（dot notation）能够考虑继承关系。
换句话说，已有的 {anchorName trollLargeNoDot}`MythicalCreature.large` 可以用于 {anchorName Monster}`Monster`，Lean 会在调用 {anchorName trollLargeNoDot}`MythicalCreature.large` 之前自动插入对 {anchorTerm MonsterToCreature}`Monster.toMythicalCreature` 的调用。
然而，这只在使用点号记法时发生；用普通函数调用语法应用字段查找函数会导致类型错误：

```anchor trollLargeNoDot
#eval MythicalCreature.large troll
```

```anchorError trollLargeNoDot
Application type mismatch: The argument
  troll
has type
  Monster
but is expected to have type
  MythicalCreature
in the application
  MythicalCreature.large troll
```

点号记法对用户定义的函数也能考虑继承关系。
体型娇小的生物是指不是庞大的生物：

```anchor small
def MythicalCreature.small (c : MythicalCreature) : Bool := !c.large
```

求值 {anchorTerm smallTroll}`troll.small` 得到 {anchorTerm smallTroll}`false`，而尝试求值 {anchorTerm smallTrollWrong}`MythicalCreature.small troll` 会导致：

```anchorError smallTrollWrong
Application type mismatch: The argument
  troll
has type
  Monster
but is expected to have type
  MythicalCreature
in the application
  MythicalCreature.small troll
```

# 多重继承

%%%
tag := "multiple-structure-inheritance"
%%%

帮手（helper）是一种神话生物，在得到正确报酬时能够提供协助：

```anchor Helper
structure Helper extends MythicalCreature where
  assistance : String
  payment : String
deriving Repr
```

例如，_nisse_ 是一种体型娇小、以在得到美味粥作为报酬时帮忙做家务而闻名的精灵：

```anchor elf
def nisse : Helper where
  large := false
  assistance := "household tasks"
  payment := "porridge"
```

如果被驯化，巨魔会成为出色的帮手。
它们强壮到能在一夜之间犁完整片田地，不过需要玩具山羊来让它们对生活感到满足。
怪物助手（monstrous assistant）既是怪物又是帮手：

```anchor MonstrousAssistant
structure MonstrousAssistant extends Monster, Helper where
deriving Repr
```

该结构体类型的值必须填写两个父结构体的所有字段：

```anchor domesticatedTroll
def domesticatedTroll : MonstrousAssistant where
  large := true
  assistance := "heavy labor"
  payment := "toy goats"
  vulnerability := "sunlight"
```

两个父结构体类型都继承自 {anchorName MythicalCreature}`MythicalCreature`。
如果多重继承被天真地实现，就可能导致**菱形问题**（diamond problem），即不清楚从给定的 {anchorName MonstrousAssistant}`MonstrousAssistant` 应沿哪条路径到达 {anchorName MythicalCreature}`large`。
它应该从容纳的 {anchorName Monster}`Monster` 中取 {lit}`large`，还是从容纳的 {anchorName Helper}`Helper` 中取？
在 Lean 中，答案是采用最先指定的通往祖父结构体的路径，而额外父结构体的字段会被复制，而不是让新结构体直接包含两个父结构体。

这可以通过检查 {anchorName MonstrousAssistant}`MonstrousAssistant` 构造子的签名看出：

```anchor checkMonstrousAssistantMk
#check MonstrousAssistant.mk
```

```anchorInfo checkMonstrousAssistantMk
MonstrousAssistant.mk (toMonster : Monster) (assistance payment : String) : MonstrousAssistant
```

它接受一个 {anchorName Monster}`Monster` 作为参数，以及 {anchorName Helper}`Helper` 在 {anchorName MythicalCreature}`MythicalCreature` 之上引入的两个字段。
类似地，虽然 {anchorName MonstrousAssistantMore}`MonstrousAssistant.toMonster` 只是从构造子中提取 {anchorName Monster}`Monster`，但 {anchorName printMonstrousAssistantToHelper}`MonstrousAssistant.toHelper` 并没有可提取的 {anchorName Helper}`Helper`。
{kw}`#print` 命令会暴露其实现：

```anchor printMonstrousAssistantToHelper
#print MonstrousAssistant.toHelper
```

```anchorInfo printMonstrousAssistantToHelper
@[reducible] def MonstrousAssistant.toHelper : MonstrousAssistant → Helper :=
fun self => { toMythicalCreature := self.toMythicalCreature, assistance := self.assistance, payment := self.payment }
```

该函数从 {anchorName MonstrousAssistant}`MonstrousAssistant` 的字段构造一个 {anchorName Helper}`Helper`。
{lit}`@[reducible]` 属性与写 {kw}`abbrev` 具有相同效果。

## 默认声明

%%%
tag := "inheritance-defaults"
%%%

当一个结构体继承自另一个结构体时，可以使用默认字段定义，根据子结构体的字段来实例化父结构体的字段。
如果需要的体型信息比“是否庞大”更具体，可以使用描述体型的专用数据类型，并结合继承，得到一个从 {anchorName SizedCreature}`size` 字段的内容计算 {anchorName MythicalCreature}`large` 字段的结构体：

```anchor SizedCreature
inductive Size where
  | small
  | medium
  | large
deriving BEq

structure SizedCreature extends MythicalCreature where
  size : Size
  large := size == Size.large
```

然而，这个默认定义只是默认定义。
与 C# 或 Scala 等语言中的**属性继承**（property inheritance）不同，子结构体中的定义只在没有为 {anchorName MythicalCreature}`large` 提供具体值时才使用，而且可能出现荒谬的结果：

```anchor nonsenseCreature
def nonsenseCreature : SizedCreature where
  large := false
  size := .large
```

如果子结构体不应偏离父结构体，有几种选择：

 1. 记录这种关系，就像对 {anchorName SizedCreature}`BEq` 和 {anchorName MonstrousAssistantMore}`Hashable` 所做的那样
 2. 定义一个命题，说明字段以适当方式相关联，并设计 API，在关键位置要求提供该命题为真的证据
 3. 完全不使用继承

第二种选择可以如下所示：

```anchor sizesMatch
abbrev SizesMatch (sc : SizedCreature) : Prop :=
  sc.large = (sc.size == Size.large)
```

注意，单个等号用于表示相等_命题_，而双等号用于表示检查相等并返回 {anchorName MythicalCreature}`Bool` 的函数。
{anchorName sizesMatch}`SizesMatch` 被定义为 {kw}`abbrev`，因为它应在证明中自动展开，以便 {tactic}`decide` 能看到需要证明的相等式。

_huldre_ 是一种中等体型的神话生物——事实上，它们与人类体型相同。
{anchorName huldresize}`huldre` 上的两个与体型相关的字段彼此一致：

```anchor huldresize
def huldre : SizedCreature where
  size := .medium

example : SizesMatch huldre := by
  decide
```


## 类型类继承

%%%
tag := "type-class-inheritance"
%%%

在幕后，类型类就是结构体。
定义新的类型类会定义一个新的结构体，定义实例则会创建该结构体类型的一个值。
然后它们会被加入 Lean 的内部表中，以便 Lean 在需要时查找实例。
其后果是，类型类可以继承自其他类型类。

因为它使用完全相同的语言特性，**类型类继承**（type class inheritance）支持结构体继承的所有特性，包括多重继承、父类型方法的默认实现，以及菱形问题的自动消解。
这在许多与 Java、C# 和 Kotlin 等语言中多重接口继承有用的情形中同样有用。
通过精心设计类型类继承层次，程序员可以同时获得两全其美：一组可独立实现的细粒度抽象，以及从这些更大型、更通用的抽象自动构造这些具体抽象的能力。