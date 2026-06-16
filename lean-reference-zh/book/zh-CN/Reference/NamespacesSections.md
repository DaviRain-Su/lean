# 命名空间与 section

> 对应英文：[Namespaces and Sections](https://lean-lang.org/doc/reference/latest/Namespaces-and-Sections/)，抓取日期：2026-06-16。

Lean 中的名称组织在层级命名空间中。命名空间是一组名称的集合，也是 Lean 中组织 API 的主要方式：它们把相关项分组，为操作和对象提供一套概念结构。此外，syntax extension、instance 和 attribute 的效果也可以附着到某个命名空间；这并不是通过把它们作为普通名称放入命名空间完成的。

从全局角度看，把操作分到命名空间中可以组织库的概念结构。不过，某个具体 Lean 文件通常不会同等使用所有全局可用名称。section 提供了局部视图：它可以安排当前文件如何看待全局名称集合，也可以精确控制 compiler option、language extension、instance 和 attribute 的作用域。section 还允许把多个声明共享的参数集中声明，并在需要时通过 `variable` command 自动传播。

## 6.1 命名空间

包含句点 `.` 的名称（如果句点不在双书名号 `«...»` 内）是 hierarchical name；句点分隔名称的各个 component。除最后一个 component 外，其余 component 组成 namespace；最后一个 component 是名称本身。

namespace 用于把相关 definition、theorem、type 和其他 declaration 分组。当某个 namespace 对应一个 type 的名称时，可以使用 generalized field notation 访问其中内容。除了组织名称，namespace 也组织 syntax extension、attribute 和 instance。

namespace 与 module 正交：module 是一起 elaborated、compiled 和 loaded 的代码单元，但 module 名称与它提供的名称之间没有必然关系。一个 module 可以包含任意 namespace 中的名称；层级 module 的嵌套结构也与层级 namespace 的嵌套结构无关。

Lean 有一个 root namespace，通常通过省略 namespace 表示。也可以用 `_root_` 显式指出。若某个名称否则会被解释为相对于周围 namespace（例如 section scope）或 local scope，则可能需要 `_root_`。

例如，在 `Forest` namespace 中，普通 `color` 会优先解析为 `Forest.color`；若要引用 root namespace 中的 `color`，应写 `_root_.color`。

## 6.1.1 命名空间与 section scope

每个 section scope 都有当前 namespace，由 `namespace` command 决定。section scope 内声明的名称会加入当前 namespace。如果声明名有多个 component，那么它的 namespace 会嵌套在当前 namespace 下；声明 body 的当前 namespace 则是这个嵌套 namespace。

section scope 还包含一组 opened namespace。opened namespace 中的内容可以不写额外限定名而直接使用。把 identifier 解析为具体名称时，Lean 会考虑当前 namespace 和 opened namespace。不过，`protected` declaration 不会因为其 namespace 被 `open` 而进入作用域。identifier 解析规则还会在 Terms 章节的 identifier 小节中说明。

定义 inductive type 时，constructor 会放入该 type 的 namespace。例如：

```lean
inductive HotDrink where
  | coffee
  | tea
  | cocoa
```

constructor 的完整名称是 `HotDrink.coffee`、`HotDrink.tea` 和 `HotDrink.cocoa`。在 namespace 外部，除非打开该 namespace，否则需要写限定名。

```lean
#check HotDrink.tea

section
  open HotDrink
  #check tea
end
```

如果直接在 `HotDrink` namespace 中定义函数，则函数 body 会在当前 namespace 为 `HotDrink` 的状态下 elaborated，因此 constructor 可直接使用。

### `open`

`open` command 打开 namespace，使其内容在当前 section scope 中可用。它有多种形式，用来灵活管理局部作用域。

```lean
open Some.Namespace.Path1 Some.Namespace.Path2
```

打开所有非 `protected` 名称，使 `Some.Namespace.Path1.x` 和 `Some.Namespace.Path2.y` 可以分别写成 `x` 和 `y`。

```lean
open Some.Namespace.Path hiding def1 def2
```

打开 namespace 中除 `def1` 和 `def2` 之外的所有非 `protected` 名称。

```lean
open Some.Namespace.Path (def1 def2)
```

只把列出的名称带入作用域。即使 `def1` 和 `def2` 是 `protected`，这种形式也可使用。

```lean
open Some.Namespace.Path renaming def1 → def1', def2 → def2'
```

只带入列出的名称，但在当前 scope 中使用新名称。ASCII 箭头 `->` 也可代替 Unicode 箭头 `→`。

```lean
open scoped Some.Namespace.Path1 Some.Namespace.Path2
```

只打开这些 namespace 中的 scoped instance、notation 和 attribute，不带入普通名称。

```lean
open Some.Namespace.Path in
  theorem exampleName : ... := ...
```

`in` 形式让 `open` 的效果只作用于下一个 command 或 expression。

当给出一串 namespace identifier 时，Lean 会依次处理它们。每个 namespace 都会相对于当前 opened namespace 解释，并在处理下一个 namespace 前打开得到的 namespace 集合。

### 导出名称

`export` command 把其他 namespace 中的名称导出到当前 namespace。和普通 definition 不同，这个 alias 完全透明：使用时会直接解析到原始名称。从 kernel 角度看，只有原始名称存在；alias 由 elaborator 在 identifier 解析时处理。

```lean
export Some.Namespace (name1 name2)
```

把名称导出到 root namespace 可以让它们无需限定名即可使用。Lean 标准库用这种方式暴露了一些名称，例如 `Option` 的 constructor 和 `get` 等关键 type class method。

当当前 namespace 被打开时，导出的名称也会进入作用域。

## 6.2 Section scope

许多 command 会对当前 section scope 产生效果。每个 Lean module 都有一个 section scope。`namespace`、`section` 和 `in` command combinator 会创建嵌套 scope。

section scope 跟踪以下数据：

### 当前 namespace

当前 namespace 是新 declaration 将被定义到的 namespace。此外，全局名称解析时会把当前 namespace 的所有前缀也纳入考虑。

### 已打开的 namespace

打开 namespace 后，其中名称可以不写显式前缀而使用。打开 namespace 中的 scoped attribute 和 scoped syntax extension 也会在当前 section scope 中生效。

### Option

compiler option 在修改它们的 scope 结束时恢复到原值。

### Section variable

section variable 是自动添加到 declaration 的参数。若它们出现在 theorem statement 中，也会作为全称量化假设加入 theorem。

## 6.2.1 控制 section scope

`section` command 创建新的 section scope，但不会改变当前 namespace、opened namespace 或 section variable。对 scope 所做修改会在 section 结束时恢复。

section 还可以让一组 modifier 默认应用到该 section 内的所有 declaration。section 可以有可选名称；关闭具名 section 的 `end` command 必须使用相同名称。如果 section 名称有多个 component（包含 `.` 分隔名称），会引入多个嵌套 section。section 名称除此之外没有其他效果，只用于提高可读性。

```lean
section
  -- declarations
end

section MySection
  -- declarations
end MySection
```

section header 可以修改 section 中的 declaration：

```lean
section noncomputable
  -- definitions here are noncomputable
end
```

如果 header 包含 `noncomputable`，则该 section 中的 definition 都被视为 noncomputable，不会为它们生成编译代码。这用于依赖 choice 等非计算推理原则的 definition。

其他 header modifier 主要用于 module：`@[expose]` 让 section 中所有 definition exposed；`public` 让 public section 中的 declaration 默认 public 而非 private；`meta` 把 section declaration 放入 meta phase。

### `namespace`

`namespace` command 创建新的 section scope，并把当前 namespace 修改为给定 identifier。该 identifier 会相对于外层当前 namespace 解释。和 section 一样，scope 结束时修改会恢复。

```lean
namespace My.Namespace
  -- declarations in My.Namespace
end My.Namespace
```

关闭 namespace 时，`end` 后的 identifier 必须是当前 namespace 的后缀；关闭后，该后缀会从当前 namespace 移除。由对应 `namespace` command 引入的 section scope 会一起关闭。

不带 identifier 的 `end` 关闭最近打开的匿名 section。带 identifier 的 `end` 关闭最近打开的 section 或 namespace。`mutual` block 的 `end` 属于 `mutual` 语法，而不是这里的 `end` command。

### 单 command 局部 scope：`in`

如果只想为单个 command 打开局部 scope，可以使用 `in` combinator。`in` 是右结合的，因此可以叠加多个 scope 修改。

```lean
open Nat in
#check succ
```

## 6.2.2 Section variable

section variable 是会自动添加到提及它们的 declaration 中的参数。无论 `autoImplicit` 选项是否为 true，这都会发生。section variable 可以是 implicit、strict implicit 或 explicit；instance implicit section variable 有特殊处理。

在非 theorem declaration 中遇到某个 section variable 名称时，Lean 会把它加入参数列表。任何提到该变量的 instance implicit section variable 也会加入。如果加入的变量依赖其他变量，那么依赖变量也会加入；这个过程迭代直到没有新依赖。所有 section variable 按声明顺序加入，并且放在其他参数之前。

对于 theorem，section variable 只有出现在 theorem statement 中时才会加入。否则，修改 theorem 的 proof 可能因为 proof term 使用了 section variable 而改变 theorem statement。

声明 section variable 使用 `variable` command：

```lean
section
  variable {α : Type u}      -- implicit
  variable (a : α)           -- explicit
  variable [instBEq : BEq α] -- named instance implicit
  variable [Hashable α]      -- anonymous instance implicit

  def isEqual (b : α) : Bool :=
    a == b
end
```

`variable` 后允许的 bracketed binder 与 definition header 中的参数语法匹配。已经声明的 variable 也可以改变绑定方式，例如把显式变量 `x` 改为 implicit：

```lean
variable {x}
```

如果希望即使某个 section variable 没有在 theorem statement 中显式出现，也加入 theorem，可以用 `include` 标记该变量。所有被标记为 include 的变量都会加入后续 theorem。`omit` command 可移除 inclusion 标记；通常建议配合 `in` 使用，以限制影响范围。