# 声明

声明（Declarations）是核心关键部分，也是我们需要定义的最后一类领域元素。

```
declarationInfo ::= Name, (universe params : List Level), (type : Expr)

declar ::= 
  Axiom declarationInfo
  | Definition declarationInfo (value : Expr) ReducibilityHint
  | Theorem declarationInfo (value : Expr) 
  | Opaque declarationInfo (value : Expr) 
  | Quot declarationInfo
  | InductiveType 
      declarationInfo
      is_recursive: Bool
      num_params: Nat
      num_indices: Nat
      -- The name of this type, and any others in a mutual block
      allIndNames: Name+
      -- The names of the constructors for *this* type only, 
      -- not including the constructors for mutuals that may 
      -- be in this block.
      constructorNames: Name*
      
  | Constructor 
      declarationInfo 
      (inductiveName : Name) 
      (numParams : Nat) 
      (numFields : Nat)

  | Recursor 
        declarationInfo 
        numParams : Nat
        numIndices : Nat
        numMotives : Nat
        numMinors : Nat
        RecRule+
        isK : Bool

RecRule ::= (constructor name : Name), (number of constructor args : Nat), (val : Expr)
```

## 声明检查

对于所有声明，除针对某些声明类型的额外检查外，都会先执行以下初步检查：

* 声明中 `declarationInfo` 的宇宙参数不得有重复。例如，声明 `def Foo.{u, v, u} ...` 是不允许的。
* 声明的类型不得包含自由变量；所有“完成”的声明中的变量都必须对应某个绑定器。
* 声明的类型必须是一个类型（即 `infer declarationInfo.type` 必须产生 `Sort`）。在 Lean 中，声明 `def Foo : Nat.succ := ..` 不被允许，因为 `Nat.succ` 是一个值，而非类型。

### 公理

对公理的检查仅限于上述所有声明通用的检查，确保其 `declarationInfo` 合法。如果公理的宇宙参数有效且类型无自由变量，则可被加入环境。

### 商类型

`Quot` 声明包括 `Quot`、`Quot.mk`、`Quot.ind` 和 `Quot.lift`。这些声明有预定的类型，在 Lean 理论中被认为是合理的。因此环境中商类型声明必须完全匹配这些类型。它们在内核实现中是硬编码的，因为它们复杂度不高。

### 定义、定理与不透明声明

定义、定理和不透明声明（opaque）都同时包含一个类型和值。检查这些声明时，会先推断声明值的类型，然后断言推断出的类型与 `declarationInfo` 中指定的类型定义等价。

对于定理：

* `declarationInfo` 中的类型是用户声称的类型，即用户试图证明的命题；
* 值是用户提供的该命题的证明。

推断该值的类型即是验证该证明实际证明了什么，而定义等价断言保证了该证明的命题正是用户声称要证明的命题。

#### 可展性提示

可展性提示（Reducibility hints）包含声明应该如何展开的信息：

* `abbreviation` 通常总是会被展开；
* `opaque` 不会被展开；
* `regular N` 是否展开则依赖于 `N` 的值。

`regular` 的可展性提示对应于定义的“高度”，指定义自身依赖的声明数量。若定义 `x` 的值中引用了定义 `y`，则 `x` 的高度必定大于 `y`。