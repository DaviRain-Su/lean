# Coercion

> 对应英文：[Coercions](https://lean-lang.org/doc/reference/latest/Coercions/)，抓取日期：2026-06-16。

当 Lean elaborator 期望某个 type，却产生了不同 type 的 term 时，它会尝试自动插入 coercion。coercion 是从该 term 的 type 到期望 type 的、被特殊标记的函数。

coercion 使得可以用更具体的 type 表示数据，同时仍能与期望较少信息的 API 交互。它也让数学形式化能遵循通常的“punning”习惯：同一个符号既表示代数结构，也表示其 carrier set；具体含义由上下文决定。

Lean 标准库和元编程 API 定义了许多 coercion。例如：

- 可以在期望 `Int` 的地方使用 `Nat`；
- 可以在期望 `Nat` 的地方使用 `Fin`；
- 可以在期望 `Option α` 的地方使用 `α`，coercion 会用 `some` 包装该值；
- 可以在期望 `Thunk α` 的地方使用 `α`，coercion 会把 term 包在函数中以延迟求值；
- 当某个 syntax category `c1` 嵌入另一 category `c2` 时，从 `TSyntax c1` 到 `TSyntax c2` 的 coercion 会执行必要包装，构造有效 syntax tree。

coercion 通过 type class synthesis 查找。可以通过添加相应 type class 的 instance 来扩展 coercion 集合。

## 示例

下面的例子都依赖 coercion：

```lean
example (n : Nat) : Int := n
example (n : Fin k) : Nat := n
example (x : α) : Option α := x

def th (f : Int → String) (x : Nat) : Thunk String := f x

open Lean in
example (n : Ident) : Term := n
```

对 `th`，用 `#print` 可以看到函数应用的求值被延迟到 thunk 的值被请求时：

```lean
#print th
```

可能显示为：

```lean
def th : (Int → String) → Nat → Thunk String :=
fun f x => { fn := fun x_1 => f ↑x }
```

## Coercion 不用于 generalized field notation

coercion 不用于解析 generalized field notation；field 查找只考虑该 term 的 inferred type。不过，可以添加 type ascription，触发到具有目标 generalized field 的 type 的 coercion。

例如，`Nat.bdiv` 没有定义，但 `Int.bdiv` 存在。从 `Nat` 到 `Int` 的 coercion 不会在查找 field `bdiv` 时被考虑：

```lean
-- 错误：Lean 会尝试查找 Nat.bdiv
example (n : Nat) := n.bdiv 2
```

原因是 coercion 只在 expected type 与 inferred type 不匹配时插入，而 generalized field 会根据点号前 term 的 inferred type 解析。

可以通过 type ascription 触发 coercion：

```lean
example (n : Nat) := (n : Int).bdiv 2
```

此时整个 ascription term 的 inferred type 是 `Int`，因此可以找到 `Int.bdiv`。

## Coercion 与 `OfNat`

coercion 也不用于解析 `OfNat` instance。即使存在默认 `OfNat Nat` instance，也不能仅通过从 `Nat` 到 `α` 的 coercion，让 natural number literal 用于 `α`。

例如，可以定义二进制数：

```lean
inductive Bin where
  | done
  | zero : Bin → Bin
  | one : Bin → Bin
```

再定义从 `Nat` 到 `Bin` 的转换，并把它注册为 coercion：

```lean
def Bin.ofNat (n : Nat) : Bin :=
  match n with
  | 0 => .done
  | n + 1 => (Bin.ofNat n).succ

attribute [coe] Bin.ofNat

instance : Coe Nat Bin where
  coe := Bin.ofNat
```

即使如此，数字 literal 也不能直接用作 `Bin`，因为这不是 type mismatch，而是无法 synthesize `OfNat Bin n` instance。

正确方式是用 coercion 定义 `OfNat Bin` instance：

```lean
instance : OfNat Bin n where
  ofNat := n
```

## 定义 coercion

多数新 coercion 可以通过声明 `Coe` type class 的 instance，并把执行 coercion 的函数标记为 `coe` attribute 来定义。

例如，可把十进制数字定义为 digit 数组：

```lean
structure Decimal where
  digits : Array (Fin 10)
```

然后定义到 `Nat` 的 coercion：

```lean
@[coe]
def Decimal.toNat (d : Decimal) : Nat :=
  d.digits.foldl (init := 0) fun n d => n * 10 + d.val

instance : Coe Decimal Nat where
  coe := Decimal.toNat
```

添加该 coercion 后，`Decimal` 可用于期望 `Nat` 的上下文，也可用于任何 `Nat` 能 coercion 到的 type 的上下文，例如 `Int`。

## `Coe`

`Coe α β` 是从 `α` 到 `β` 的 coercion type class。它可以和其他 `Coe` instance 传递链接。当 `x` 的 type 是 `α`，但它被用于期望 `β` 的上下文时，Lean 会自动使用 coercion。

可以用 `↑x` 显式触发 coercion，也可以通过双重 type ascription 触发：

```lean
((x : α) : β)
```

`Coe` 的核心 method 是：

```lean
coe : α → β
```

它把类型为 `α` 的值转换为类型为 `β` 的值。

## 后续小节

英文参考手册随后把本章展开为：

- 11.1 Coercion Insertion
- 11.2 Coercing Between Types
- 11.3 Coercing to Sorts
- 11.4 Coercing to Function Types
- 11.5 Implementation Details