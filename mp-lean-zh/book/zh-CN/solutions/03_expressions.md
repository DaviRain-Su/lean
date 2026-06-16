```lean
import Lean
```

```lean
open Lean Meta
```

```lean
/- # Solutions -/
/- ## Expressions: Solutions -/
```

```lean
/- ### 1. -/
```

```lean
def one : Expr :=
```

```lean
Expr.app (Expr.app (Expr.const `Nat.add []) (mkNatLit 1)) (mkNatLit 2)
```

```lean
elab "one" : term => return one
```

```lean
#check one  -- Nat.add 1 2 : Nat
```

```lean
#reduce one -- 3
```

```lean
/- ### 2. -/
```

```lean
def two : Expr :=
```

```lean
Lean.mkAppN (Expr.const `Nat.add []) #[mkNatLit 1, mkNatLit 2]
```

```lean
elab "two" : term => return two
```

```lean
#check two  -- Nat.add 1 2 : Nat
```

```lean
#reduce two -- 3
```

```lean
/- ### 3. -/
```

```lean
def three : Expr :=
```

```lean
Expr.lam `x (Expr.const `Nat [])
```

```lean
(Lean.mkAppN (Expr.const `Nat.add []) #[Lean.mkNatLit 1, Expr.bvar 0])
```

```lean
BinderInfo.default
```

```lean
elab "three" : term => return three
```

```lean
#check three    -- fun x => Nat.add 1 x : Nat → Nat
```

```lean
#reduce three 6 -- 7
```

```lean
/- ### 4. -/
```

```lean
def four : Expr :=
```

```lean
Expr.lam `a (Expr.const `Nat [])
```

```lean
(
```

```lean
Expr.lam `b (Expr.const `Nat [])
```

```lean
(
```

```lean
Expr.lam `c (Expr.const `Nat [])
```

```lean
(
```

```lean
Lean.mkAppN
```

```lean
(Expr.const `Nat.add [])
```

```lean
#[
```

```lean
(Lean.mkAppN (Expr.const `Nat.mul []) #[Expr.bvar 1, Expr.bvar 2]),
```

```lean
(Expr.bvar 0)
```

```lean
]
```

```lean
)
```

```lean
BinderInfo.default
```

```lean
)
```

```lean
BinderInfo.default
```

```lean
)
```

```lean
BinderInfo.default
```

```lean
elab "four" : term => return four
```

```lean
#check four -- fun a b c => Nat.add (Nat.mul b a) c : Nat → Nat → Nat → Nat
```

```lean
#reduce four 666 1 2 -- 668
```

```lean
/- ### 5. -/
```

```lean
def five :=
```

```lean
Expr.lam `x (Expr.const `Nat [])
```

```lean
(
```

```lean
Expr.lam `y (Expr.const `Nat [])
```

```lean
(Lean.mkAppN (Expr.const `Nat.add []) #[Expr.bvar 1, Expr.bvar 0])
```

```lean
BinderInfo.default
```

```lean
)
```

```lean
BinderInfo.default
```

```lean
elab "five" : term => return five
```

```lean
#check five      -- fun x y => Nat.add x y : Nat → Nat → Nat
```

```lean
#reduce five 4 5 -- 9
```

```lean
/- ### 6. -/
```

```lean
def six :=
```

```lean
Expr.lam `x (Expr.const `String [])
```

```lean
(Lean.mkAppN (Expr.const `String.append []) #[Lean.mkStrLit "Hello, ", Expr.bvar 0])
```

```lean
BinderInfo.default
```

```lean
elab "six" : term => return six
```

```lean
#check six        -- fun x => String.append "Hello, " x : String → String
```

```lean
#eval six "world" -- "Hello, world"
```

```lean
/- ### 7. -/
```

```lean
def seven : Expr :=
```

```lean
Expr.forallE `x (Expr.sort Lean.Level.zero)
```

```lean
(Expr.app (Expr.app (Expr.const `And []) (Expr.bvar 0)) (Expr.bvar 0))
```

```lean
BinderInfo.default
```

```lean
elab "seven" : term => return seven
```

```lean
#check seven  -- ∀ (x : Prop), x ∧ x : Prop
```

```lean
#reduce seven -- ∀ (x : Prop), x ∧ x
```

```lean
/- ### 8. -/
```

```lean
def eight : Expr :=
```

```lean
Expr.forallE `notUsed
```

```lean
(Expr.const `Nat []) (Expr.const `String [])
```

```lean
BinderInfo.default
```

```lean
elab "eight" : term => return eight
```

```lean
#check eight  -- Nat → String : Type
```

```lean
#reduce eight -- Nat → String
```

```lean
/- ### 9. -/
```

```lean
def nine : Expr :=
```

```lean
Expr.lam `p (Expr.sort Lean.Level.zero)
```

```lean
(
```

```lean
Expr.lam `hP (Expr.bvar 0)
```

```lean
(Expr.bvar 0)
```

```lean
BinderInfo.default
```

```lean
)
```

```lean
BinderInfo.default
```

```lean
elab "nine" : term => return nine
```

```lean
#check nine  -- fun p hP => hP : ∀ (p : Prop), p → p
```

```lean
#reduce nine -- fun p hP => hP
```

```lean
/- ### 10. -/
```

```lean
def ten : Expr :=
```

```lean
Expr.sort (Nat.toLevel 7)
```

```lean
elab "ten" : term => return ten
```

```lean
#check ten  -- Type 6 : Type 7
```

```lean
#reduce ten -- Type 6
```
