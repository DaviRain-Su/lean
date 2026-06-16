```lean
import Lean.Elab.Tactic
```

```lean
open Lean Elab Tactic Meta
```

```lean
/- ### 1. -/
```

```lean
elab "step_1" : tactic => do
```

```lean
let mvarId ← getMainGoal
```

```lean
let goalType ← getMainTarget
```

```lean
let Expr.app (Expr.app (Expr.const `Iff _) a) b := goalType | throwError "Goal type is not of the form `a ↔ b`"
```

```lean
-- 1. Create new `_`s with appropriate types.
```

```lean
let mvarId1 ← mkFreshExprMVar (Expr.forallE `xxx a b .default) (userName := `red)
```

```lean
let mvarId2 ← mkFreshExprMVar (Expr.forallE `yyy b a .default) (userName := `blue)
```

```lean
-- 2. Assign the main goal to the expression `Iff.intro _ _`.
```

```lean
mvarId.assign (mkAppN (Expr.const `Iff.intro []) #[a, b, mvarId1, mvarId2])
```

```lean
-- 3. Report the new `_`s to Lean as the new goals.
```

```lean
modify fun _ => { goals := [mvarId1.mvarId!, mvarId2.mvarId!] }
```

```lean
elab "step_2" : tactic => do
```

```lean
let some redMvarId ← (← get).goals.findM? (fun mvarId => do
```

```lean
return (← mvarId.getDecl).userName == `red
```

```lean
) | throwError "No mvar with username `red`"
```

```lean
let some blueMvarId ← (← get).goals.findM? (fun mvarId => do
```

```lean
return (← mvarId.getDecl).userName == `blue
```

```lean
) | throwError "No mvar with username `blue`"
```

```lean
---- HANDLE `red` goal
```

```lean
let Expr.forallE _ redFrom redTo _ := (← redMvarId.getDecl).type | throwError "Goal type is not of the form `a → b`"
```

```lean
let handyRedMvarId ← withLocalDecl `hA BinderInfo.default redFrom (fun fvar => do
```

```lean
-- 1. Create new `_`s with appropriate types.
```

```lean
let mvarId1 ← mkFreshExprMVar redTo MetavarKind.syntheticOpaque `red
```

```lean
-- 2. Assign the main goal to the expression `fun hA => _`.
```

```lean
redMvarId.assign (← mkLambdaFVars #[fvar] mvarId1)
```

```lean
-- just a handy way to return a handyRedMvarId for the next code
```

```lean
return mvarId1.mvarId!
```

```lean
)
```

```lean
-- 3. Report the new `_`s to Lean as the new goals.
```

```lean
modify fun _ => { goals := [handyRedMvarId, blueMvarId] }
```

```lean
---- HANDLE `blue` goal
```

```lean
let Expr.forallE _ blueFrom _ _ := (← blueMvarId.getDecl).type | throwError "Goal type is not of the form `a → b`"
```

```lean
-- 1. Create new `_`s with appropriate types.
```

```lean
-- None needed!
```

```lean
-- 2. Assign the main goal to the expression `fun hB : q ∧ p => (And.intro hB.right hB.left)`.
```

```lean
Lean.Meta.withLocalDecl `hB .default blueFrom (fun hB => do
```

```lean
let body ← Lean.Meta.mkAppM `And.intro #[← Lean.Meta.mkAppM `And.right #[hB], ← Lean.Meta.mkAppM `And.left #[hB]]
```

```lean
blueMvarId.assign (← Lean.Meta.mkLambdaFVars #[hB] body)
```

```lean
)
```

```lean
-- 3. Report the new `_`s to Lean as the new goals.
```

```lean
modify fun _ => { goals := [handyRedMvarId] }
```

```lean
elab "step_3" : tactic => do
```

```lean
let mvarId ← getMainGoal
```

```lean
let goalType ← getMainTarget
```

```lean
let mainDecl ← mvarId.getDecl
```

```lean
let Expr.app (Expr.app (Expr.const `And _) q) p := goalType | throwError "Goal type is not of the form `And q p`"
```

```lean
-- 1. Create new `_`s with appropriate types.
```

```lean
let mvarId1 ← mkFreshExprMVarAt mainDecl.lctx mainDecl.localInstances q (userName := `red1)
```

```lean
let mvarId2 ← mkFreshExprMVarAt mainDecl.lctx mainDecl.localInstances p (userName := `red2)
```

```lean
-- 2. Assign the main goal to the expression `And.intro _ _`.
```

```lean
mvarId.assign (← mkAppM `And.intro #[mvarId1, mvarId2])
```

```lean
-- 3. Report the new `_`s to Lean as the new goals.
```

```lean
modify fun _ => { goals := [mvarId1.mvarId!, mvarId2.mvarId!] }
```

```lean
elab "step_4" : tactic => do
```

```lean
let some red1MvarId ← (← get).goals.findM? (fun mvarId => do
```

```lean
return (← mvarId.getDecl).userName == `red1
```

```lean
) | throwError "No mvar with username `red1`"
```

```lean
let some red2MvarId ← (← get).goals.findM? (fun mvarId => do
```

```lean
return (← mvarId.getDecl).userName == `red2
```

```lean
) | throwError "No mvar with username `red2`"
```

```lean
---- HANDLE `red1` goal
```

```lean
-- 1. Create new `_`s with appropriate types.
```

```lean
-- None needed!
```

```lean
-- 2. Assign the main goal to the expression `hA.right`.
```

```lean
let some hA := (← red1MvarId.getDecl).lctx.findFromUserName? `hA | throwError "No hypothesis with name `hA` (in goal `red1`)"
```

```lean
red1MvarId.withContext do
```

```lean
red1MvarId.assign (← mkAppM `And.right #[hA.toExpr])
```

```lean
-- 3. Report the new `_`s to Lean as the new goals.
```

```lean
modify fun _ => { goals := [red2MvarId] }
```

```lean
---- HANDLE `red2` goal
```

```lean
-- 1. Create new `_`s with appropriate types.
```

```lean
-- None needed!
```

```lean
-- 2. Assign the main goal to the expression `hA.left`.
```

```lean
let some hA := (← red2MvarId.getDecl).lctx.findFromUserName? `hA | throwError "No hypothesis with name `hA` (in goal `red2`)"
```

```lean
red2MvarId.withContext do
```

```lean
red2MvarId.assign (← mkAppM `And.left #[hA.toExpr])
```

```lean
-- 3. Report the new `_`s to Lean as the new goals.
```

```lean
modify fun _ => { goals := [] }
```

```lean
theorem gradual (p q : Prop) : p ∧ q ↔ q ∧ p := by
```

```lean
step_1
```

```lean
step_2
```

```lean
step_3
```

```lean
step_4
```

```lean
/- ### 2. -/
```

```lean
elab "forker_a" : tactic => do
```

```lean
liftMetaTactic fun mvarId => do
```

```lean
let (Expr.app (Expr.app (Expr.const `And _) p) q) ← mvarId.getType | Lean.Meta.throwTacticEx `forker mvarId ("Goal is not of the form P ∧ Q")
```

```lean
let mvarIdP ← mkFreshExprMVar p (userName := `red)
```

```lean
let mvarIdQ ← mkFreshExprMVar q (userName := `blue)
```

```lean
let proofTerm := mkAppN (Expr.const `And.intro []) #[p, q, mvarIdP, mvarIdQ]
```

```lean
mvarId.assign proofTerm
```

```lean
return [mvarIdP.mvarId!, mvarIdQ.mvarId!]
```

```lean
elab "forker_b" : tactic => do
```

```lean
let mvarId ← getMainGoal
```

```lean
let goalType ← getMainTarget
```

```lean
let (Expr.app (Expr.app (Expr.const `And _) p) q) := goalType | Lean.Meta.throwTacticEx `forker mvarId ("Goal is not of the form P ∧ Q")
```

```lean
mvarId.withContext do
```

```lean
let mvarIdP ← mkFreshExprMVar p (userName := `red)
```

```lean
let mvarIdQ ← mkFreshExprMVar q (userName := `blue)
```

```lean
let proofTerm := mkAppN (Expr.const `And.intro []) #[p, q, mvarIdP, mvarIdQ]
```

```lean
mvarId.assign proofTerm
```

```lean
setGoals ([mvarIdP.mvarId!, mvarIdQ.mvarId!] ++ (← getGoals).drop 1)
```

```lean
elab "forker_c" : tactic => do
```

```lean
let mvarId ← getMainGoal
```

```lean
let goalType ← getMainTarget
```

```lean
let (Expr.app (Expr.app (Expr.const `And _) p) q) := goalType | Lean.Meta.throwTacticEx `forker mvarId ("Goal is not of the form P ∧ Q")
```

```lean
mvarId.withContext do
```

```lean
let mvarIdP ← mkFreshExprMVar p (userName := `red)
```

```lean
let mvarIdQ ← mkFreshExprMVar q (userName := `blue)
```

```lean
let proofTerm := mkAppN (Expr.const `And.intro []) #[p, q, mvarIdP, mvarIdQ]
```

```lean
mvarId.assign proofTerm
```

```lean
replaceMainGoal [mvarIdP.mvarId!, mvarIdQ.mvarId!]
```

```lean
example (A B C : Prop) : A → B → C → (A ∧ B) ∧ C := by
```

```lean
intro hA hB hC
```

```lean
forker_a
```

```lean
forker_a
```

```lean
assumption
```

```lean
assumption
```

```lean
assumption
```

```lean
/- ### 3. -/
```

```lean
elab "introductor_a" : tactic => do
```

```lean
withMainContext do
```

```lean
liftMetaTactic fun mvarId => do
```

```lean
let (_, mvarIdNew) ← mvarId.introN 2
```

```lean
return [mvarIdNew]
```

```lean
elab "introductor_b" : tactic => do
```

```lean
withMainContext do
```

```lean
liftMetaTactic fun mvarId => do
```

```lean
let (_, mvarIdNew) ← mvarId.intro1P
```

```lean
return [mvarIdNew]
```

```lean
elab "introductor_c" : tactic => do
```

```lean
withMainContext do
```

```lean
liftMetaTactic fun mvarId => do
```

```lean
let (_, mvarIdNew) ← mvarId.intro `wow
```

```lean
return [mvarIdNew]
```

```lean
-- So:
```

```lean
-- `intro`   - **intro**, specify the name manually
```

```lean
-- `intro1`  - **intro**, make the name inacessible
```

```lean
-- `intro1P` - **intro**, preserve the original name
```

```lean
-- `introN`  - **intro many**, specify the names manually
```

```lean
-- `introNP` - **intro many**, preserve the original names
```

```lean
example (a b c : Nat) : (ab: a = b) → (bc: b = c) → (a = c) := by
```

```lean
introductor_a
```

```lean
-- introductor_b
```

```lean
-- introductor_c
```

```lean
sorry
```
