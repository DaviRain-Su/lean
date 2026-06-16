```lean
import Lean
```

```lean
open Lean Meta
```

```lean
/- ## `MetaM`: Solutions -/
```

```lean
/- ### 1. -/
```

```lean
#eval show MetaM Unit from do
```

```lean
let hi ← Lean.Meta.mkFreshExprMVar (Expr.const `Nat []) (userName := `hi)
```

```lean
IO.println s!"value in hi: {← instantiateMVars hi}" -- ?_uniq.1
```

```lean
hi.mvarId!.assign (Expr.app (Expr.const `Nat.succ []) (Expr.const ``Nat.zero []))
```

```lean
IO.println s!"value in hi: {← instantiateMVars hi}" -- Nat.succ Nat.zero
```

```lean
/- ### 2. -/
```

```lean
-- It would output the same expression we gave it - there were no metavariables to instantiate.
```

```lean
#eval show MetaM Unit from do
```

```lean
let instantiatedExpr ← instantiateMVars (Expr.lam `x (Expr.const `Nat []) (Expr.bvar 0) BinderInfo.default)
```

```lean
IO.println instantiatedExpr -- fun (x : Nat) => x
```

```lean
/- ### 3. -/
```

```lean
#eval show MetaM Unit from do
```

```lean
let oneExpr := Expr.app (Expr.const `Nat.succ []) (Expr.const ``Nat.zero [])
```

```lean
let twoExpr := Expr.app (Expr.const `Nat.succ []) oneExpr
```

```lean
-- Create `mvar1` with type `Nat`
```

```lean
let mvar1 ← Lean.Meta.mkFreshExprMVar (Expr.const `Nat []) (userName := `mvar1)
```

```lean
-- Create `mvar2` with type `Nat`
```

```lean
let mvar2 ← Lean.Meta.mkFreshExprMVar (Expr.const `Nat []) (userName := `mvar2)
```

```lean
-- Create `mvar3` with type `Nat`
```

```lean
let mvar3 ← Lean.Meta.mkFreshExprMVar (Expr.const `Nat []) (userName := `mvar3)
```

```lean
-- Assign `mvar1` to `2 + ?mvar2 + ?mvar3`
```

```lean
mvar1.mvarId!.assign (Lean.mkAppN (Expr.const `Nat.add []) #[(Lean.mkAppN (Expr.const `Nat.add []) #[twoExpr, mvar2]), mvar3])
```

```lean
-- Assign `mvar3` to `1`
```

```lean
mvar3.mvarId!.assign oneExpr
```

```lean
-- Instantiate `mvar1`, which should result in expression `2 + ?mvar2 + 1`
```

```lean
let instantiatedMvar1 ← instantiateMVars mvar1
```

```lean
IO.println instantiatedMvar1 -- Nat.add (Nat.add 2 ?_uniq.2) 1
```

```lean
/- ### 4. -/
```

```lean
elab "explore" : tactic => do
```

```lean
let mvarId : MVarId ← Lean.Elab.Tactic.getMainGoal
```

```lean
let metavarDecl : MetavarDecl ← mvarId.getDecl
```

```lean
IO.println "Our metavariable"
```

```lean
-- [anonymous] : 2 = 2
```

```lean
IO.println s!"\n{metavarDecl.userName} : {metavarDecl.type}"
```

```lean
IO.println "\nAll of its local declarations"
```

```lean
let localContext : LocalContext := metavarDecl.lctx
```

```lean
for (localDecl : LocalDecl) in localContext do
```

```lean
if localDecl.isImplementationDetail then
```

```lean
-- (implementation detail) red : 1 = 1 → 2 = 2 → 2 = 2
```

```lean
IO.println s!"\n(implementation detail) {localDecl.userName} : {localDecl.type}"
```

```lean
else
```

```lean
-- hA : 1 = 1
```

```lean
-- hB : 2 = 2
```

```lean
IO.println s!"\n{localDecl.userName} : {localDecl.type}"
```

```lean
theorem red (hA : 1 = 1) (hB : 2 = 2) : 2 = 2 := by
```

```lean
explore
```

```lean
sorry
```

```lean
/- ### 5. -/
```

```lean
-- The type of our metavariable `2 + 2`. We want to find a `localDecl` that has the same type, and `assign` our metavariable to that `localDecl`.
```

```lean
elab "solve" : tactic => do
```

```lean
let mvarId : MVarId ← Lean.Elab.Tactic.getMainGoal
```

```lean
let metavarDecl : MetavarDecl ← mvarId.getDecl
```

```lean
let localContext : LocalContext := metavarDecl.lctx
```

```lean
for (localDecl : LocalDecl) in localContext do
```

```lean
if ← Lean.Meta.isDefEq localDecl.type metavarDecl.type then
```

```lean
mvarId.assign localDecl.toExpr
```

```lean
theorem redSolved (hA : 1 = 1) (hB : 2 = 2) : 2 = 2 := by
```

```lean
solve
```

```lean
/- ### 6. -/
```

```lean
def sixA : Bool → Bool := fun x => x
```

```lean
-- .lam `x (.const `Bool []) (.bvar 0) (Lean.BinderInfo.default)
```

```lean
#eval Lean.Meta.reduce (Expr.const `sixA [])
```

```lean
def sixB : Bool := (fun x => x) ((true && false) || true)
```

```lean
-- .const `Bool.true []
```

```lean
#eval Lean.Meta.reduce (Expr.const `sixB [])
```

```lean
def sixC : Nat := 800 + 2
```

```lean
-- .lit (Lean.Literal.natVal 802)
```

```lean
#eval Lean.Meta.reduce (Expr.const `sixC [])
```

```lean
/- ### 7. -/
```

```lean
#eval show MetaM Unit from do
```

```lean
let litExpr := Expr.lit (Lean.Literal.natVal 1)
```

```lean
let standardExpr := Expr.app (Expr.const ``Nat.succ []) (Expr.const ``Nat.zero [])
```

```lean
let isEqual ← Lean.Meta.isDefEq litExpr standardExpr
```

```lean
IO.println isEqual -- true
```

```lean
/- ### 8. -/
```

```lean
-- a) `5 =?= (fun x => 5) ((fun y : Nat → Nat => y) (fun z : Nat => z))`
```

```lean
-- Definitionally equal.
```

```lean
def expr2 := (fun x => 5) ((fun y : Nat → Nat => y) (fun z : Nat => z))
```

```lean
#eval show MetaM Unit from do
```

```lean
let expr1 := Lean.mkNatLit 5
```

```lean
let expr2 := Expr.const `expr2 []
```

```lean
let isEqual ← Lean.Meta.isDefEq expr1 expr2
```

```lean
IO.println isEqual -- true
```

```lean
-- b) `2 + 1 =?= 1 + 2`
```

```lean
-- Definitionally equal.
```

```lean
#eval show MetaM Unit from do
```

```lean
let expr1 := Lean.mkAppN (Expr.const `Nat.add []) #[Lean.mkNatLit 2, Lean.mkNatLit 1]
```

```lean
let expr2 := Lean.mkAppN (Expr.const `Nat.add []) #[Lean.mkNatLit 1, Lean.mkNatLit 2]
```

```lean
let isEqual ← Lean.Meta.isDefEq expr1 expr2
```

```lean
IO.println isEqual -- true
```

```lean
-- c) `?a =?= 2`, where `?a` has a type `String`
```

```lean
-- Not definitionally equal.
```

```lean
#eval show MetaM Unit from do
```

```lean
let expr1 ← Lean.Meta.mkFreshExprMVar (Expr.const `String []) (userName := `expr1)
```

```lean
let expr2 := Lean.mkNatLit 2
```

```lean
let isEqual ← Lean.Meta.isDefEq expr1 expr2
```

```lean
IO.println isEqual -- false
```

```lean
-- d) `?a + Int =?= "hi" + ?b`, where `?a` and `?b` don't have a type
```

```lean
-- Definitionally equal.
```

```lean
-- `?a` is assigned to `"hi"`, `?b` is assigned to `Int`.
```

```lean
#eval show MetaM Unit from do
```

```lean
let a ← Lean.Meta.mkFreshExprMVar Option.none (userName := `a)
```

```lean
let b ← Lean.Meta.mkFreshExprMVar Option.none (userName := `b)
```

```lean
let expr1 := Lean.mkAppN (Expr.const `Nat.add []) #[a, Expr.const `Int []]
```

```lean
let expr2 := Lean.mkAppN (Expr.const `Nat.add []) #[Lean.mkStrLit "hi", b]
```

```lean
let isEqual ← Lean.Meta.isDefEq expr1 expr2
```

```lean
IO.println isEqual -- true
```

```lean
IO.println s!"a: {← instantiateMVars a}"
```

```lean
IO.println s!"b: {← instantiateMVars b}"
```

```lean
-- e) `2 + ?a =?= 3`
```

```lean
-- Not definitionally equal.
```

```lean
#eval show MetaM Unit from do
```

```lean
let a ← Lean.Meta.mkFreshExprMVar (Expr.const `Nat []) (userName := `a)
```

```lean
let expr1 := Lean.mkAppN (Expr.const `Nat.add []) #[Lean.mkNatLit 2, a]
```

```lean
let expr2 := Lean.mkNatLit 3
```

```lean
let isEqual ← Lean.Meta.isDefEq expr1 expr2
```

```lean
IO.println isEqual -- false
```

```lean
-- f) `2 + ?a =?= 2 + 1`
```

```lean
-- Definitionally equal.
```

```lean
-- `?a` is assigned to `1`.
```

```lean
#eval show MetaM Unit from do
```

```lean
let a ← Lean.Meta.mkFreshExprMVar (Expr.const `Nat []) (userName := `a)
```

```lean
let expr1 := Lean.mkAppN (Expr.const `Nat.add []) #[Lean.mkNatLit 2, a]
```

```lean
let expr2 := Lean.mkAppN (Expr.const `Nat.add []) #[Lean.mkNatLit 2, Lean.mkNatLit 1]
```

```lean
let isEqual ← Lean.Meta.isDefEq expr1 expr2
```

```lean
IO.println isEqual -- true
```

```lean
IO.println s!"a: {← instantiateMVars a}"
```

```lean
/- ### 9. -/
```

```lean
@[reducible] def reducibleDef     : Nat := 1 -- same as `abbrev`
```

```lean
@[instance] def instanceDef       : Nat := 2 -- same as `instance`
```

```lean
def defaultDef                    : Nat := 3
```

```lean
@[irreducible] def irreducibleDef : Nat := 4
```

```lean
@[reducible] def sum := [reducibleDef, instanceDef, defaultDef, irreducibleDef]
```

```lean
#eval show MetaM Unit from do
```

```lean
let constantExpr := Expr.const `sum []
```

```lean
Meta.withTransparency Meta.TransparencyMode.reducible do
```

```lean
let reducedExpr ← Meta.reduce constantExpr
```

```lean
dbg_trace (← ppExpr reducedExpr) -- [1, instanceDef, defaultDef, irreducibleDef]
```

```lean
Meta.withTransparency Meta.TransparencyMode.instances do
```

```lean
let reducedExpr ← Meta.reduce constantExpr
```

```lean
dbg_trace (← ppExpr reducedExpr) -- [1, 2, defaultDef, irreducibleDef]
```

```lean
Meta.withTransparency Meta.TransparencyMode.default do
```

```lean
let reducedExpr ← Meta.reduce constantExpr
```

```lean
dbg_trace (← ppExpr reducedExpr) -- [1, 2, 3, irreducibleDef]
```

```lean
Meta.withTransparency Meta.TransparencyMode.all do
```

```lean
let reducedExpr ← Meta.reduce constantExpr
```

```lean
dbg_trace (← ppExpr reducedExpr) -- [1, 2, 3, 4]
```

```lean
-- Note: if we don't set the transparency mode, we get a pretty strong `TransparencyMode.default`.
```

```lean
let reducedExpr ← Meta.reduce constantExpr
```

```lean
dbg_trace (← ppExpr reducedExpr) -- [1, 2, 3, irreducibleDef]
```

```lean
/- ### 10. -/
```

```lean
-- Non-idiomatic: we can only use `Lean.mkAppN`.
```

```lean
def tenA : MetaM Expr := do
```

```lean
let body := Lean.mkAppN (Expr.const `Nat.add []) #[Lean.mkNatLit 1, Expr.bvar 0]
```

```lean
return Expr.lam `x (Expr.const `Nat []) body BinderInfo.default
```

```lean
-- Idiomatic: we can use both `Lean.mkAppN` and `Lean.Meta.mkAppM`.
```

```lean
def tenB : MetaM Expr := do
```

```lean
Lean.Meta.withLocalDecl `x .default (Expr.const `Nat []) (fun x => do
```

```lean
-- let body := Lean.mkAppN (Expr.const `Nat.add []) #[Lean.mkNatLit 1, x]
```

```lean
let body ← Lean.Meta.mkAppM `Nat.add #[Lean.mkNatLit 1, x]
```

```lean
Lean.Meta.mkLambdaFVars #[x] body
```

```lean
)
```

```lean
#eval show MetaM _ from do
```

```lean
ppExpr (← tenA) -- fun x => Nat.add 1 x
```

```lean
#eval show MetaM _ from do
```

```lean
ppExpr (← tenB) -- fun x => Nat.add 1 x
```

```lean
/- ### 11. -/
```

```lean
def eleven : MetaM Expr :=
```

```lean
return Expr.forallE `yellow (Expr.const `Nat []) (Expr.bvar 0) BinderInfo.default
```

```lean
#eval show MetaM _ from do
```

```lean
dbg_trace (← eleven) -- forall (yellow : Nat), yellow
```

```lean
/- ### 12. -/
```

```lean
-- Non-idiomatic: we can only use `Lean.mkApp3`.
```

```lean
def twelveA : MetaM Expr := do
```

```lean
let nPlusOne := Expr.app (Expr.app (Expr.const `Nat.add []) (Expr.bvar 0)) (Lean.mkNatLit 1)
```

```lean
let forAllBody := Lean.mkApp3 (Expr.const ``Eq []) (Expr.const `Nat []) (Expr.bvar 0) nPlusOne
```

```lean
let forAll := Expr.forallE `n (Expr.const `Nat []) forAllBody BinderInfo.default
```

```lean
return forAll
```

```lean
-- Idiomatic: we can use both `Lean.mkApp3` and `Lean.Meta.mkEq`.
```

```lean
def twelveB : MetaM Expr := do
```

```lean
withLocalDecl `n BinderInfo.default (Expr.const `Nat []) (fun x => do
```

```lean
let nPlusOne := Expr.app (Expr.app (Expr.const `Nat.add []) x) (Lean.mkNatLit 1)
```

```lean
-- let forAllBody := Lean.mkApp3 (Expr.const ``Eq []) (Expr.const `Nat []) x nPlusOne
```

```lean
let forAllBody ← Lean.Meta.mkEq x nPlusOne
```

```lean
let forAll := mkForallFVars #[x] forAllBody
```

```lean
forAll
```

```lean
)
```

```lean
#eval show MetaM _ from do
```

```lean
ppExpr (← twelveA) -- (n : Nat) → Eq Nat n (Nat.add n 1)
```

```lean
#eval show MetaM _ from do
```

```lean
ppExpr (← twelveB) -- ∀ (n : Nat), n = Nat.add n 1
```

```lean
/- ### 13. -/
```

```lean
def thirteen : MetaM Expr := do
```

```lean
withLocalDecl `f BinderInfo.default (Expr.forallE `a (Expr.const `Nat []) (Expr.const `Nat []) .default) (fun y => do
```

```lean
let lamBody ← withLocalDecl `n BinderInfo.default (Expr.const `Nat []) (fun x => do
```

```lean
let fn := Expr.app y x
```

```lean
let fnPlusOne := Expr.app y (Expr.app (Expr.app (Expr.const `Nat.add []) (x)) (Lean.mkNatLit 1))
```

```lean
let forAllBody := mkApp3 (mkConst ``Eq []) (Expr.const `Nat []) fn fnPlusOne
```

```lean
let forAll := mkForallFVars #[x] forAllBody
```

```lean
forAll
```

```lean
)
```

```lean
let lam := mkLambdaFVars #[y] lamBody
```

```lean
lam
```

```lean
)
```

```lean
#eval show MetaM _ from do
```

```lean
ppExpr (← thirteen) -- fun f => (n : Nat) → Eq Nat (f n) (f (Nat.add n 1))
```

```lean
/- ### 14. -/
```

```lean
#eval show Lean.Elab.Term.TermElabM _ from do
```

```lean
let stx : Syntax ← `(∀ (a : Prop) (b : Prop), a ∨ b → b → a ∧ a)
```

```lean
let expr ← Elab.Term.elabTermAndSynthesize stx none
```

```lean
let (_, _, conclusion) ← forallMetaTelescope expr
```

```lean
dbg_trace conclusion -- And ?_uniq.10 ?_uniq.10
```

```lean
let (_, _, conclusion) ← forallMetaBoundedTelescope expr 2
```

```lean
dbg_trace conclusion -- (Or ?_uniq.14 ?_uniq.15) -> ?_uniq.15 -> (And ?_uniq.14 ?_uniq.14)
```

```lean
let (_, _, conclusion) ← lambdaMetaTelescope expr
```

```lean
dbg_trace conclusion -- forall (a.1 : Prop) (b.1 : Prop), (Or a.1 b.1) -> b.1 -> (And a.1 a.1)
```

```lean
/- ### 15. -/
```

```lean
#eval show MetaM Unit from do
```

```lean
let a ← Lean.Meta.mkFreshExprMVar (Expr.const `String []) (userName := `a)
```

```lean
let b ← Lean.Meta.mkFreshExprMVar (Expr.sort (Nat.toLevel 1)) (userName := `b)
```

```lean
-- ?a + Int
```

```lean
let c := Lean.mkAppN (Expr.const `Nat.add []) #[a, Expr.const `Int []]
```

```lean
-- "hi" + ?b
```

```lean
let d := Lean.mkAppN (Expr.const `Nat.add []) #[Lean.mkStrLit "hi", b]
```

```lean
IO.println s!"value in c: {← instantiateMVars c}" -- Nat.add ?_uniq.1 Int
```

```lean
IO.println s!"value in d: {← instantiateMVars d}" -- Nat.add String ?_uniq.2
```

```lean
let state : SavedState ← saveState
```

```lean
IO.println "\nSaved state\n"
```

```lean
if ← Lean.Meta.isDefEq c d then
```

```lean
IO.println true
```

```lean
IO.println s!"value in c: {← instantiateMVars c}"
```

```lean
IO.println s!"value in d: {← instantiateMVars d}"
```

```lean
restoreState state
```

```lean
IO.println "\nRestored state\n"
```

```lean
IO.println s!"value in c: {← instantiateMVars c}"
```

```lean
IO.println s!"value in d: {← instantiateMVars d}"
```
