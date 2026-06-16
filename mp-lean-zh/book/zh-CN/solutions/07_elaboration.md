```lean
import Lean
```

```lean
open Lean Elab Command Term Meta
```

```lean
/- ## Elaboration: Solutions -/
```

```lean
/- ### 1. -/
```

```lean
elab n:term "♥" a:"♥"? b:"♥"? : term => do
```

```lean
let nExpr : Expr ← elabTermEnsuringType n (mkConst `Nat)
```

```lean
if let some a := a then
```

```lean
if let some b := b then
```

```lean
return Expr.app (Expr.app (Expr.const `Nat.add []) nExpr) (mkNatLit 3)
```

```lean
else
```

```lean
return Expr.app (Expr.app (Expr.const `Nat.add []) nExpr) (mkNatLit 2)
```

```lean
else
```

```lean
return Expr.app (Expr.app (Expr.const `Nat.add []) nExpr) (mkNatLit 1)
```

```lean
#eval 7 ♥ -- 8
```

```lean
#eval 7 ♥♥ -- 9
```

```lean
#eval 7 ♥♥♥ -- 10
```

```lean
/- ### 2. -/
```

```lean
-- a) using `syntax` + `@[command_elab alias] def elabOurAlias : CommandElab`
```

```lean
syntax (name := aliasA) (docComment)? "aliasA " ident " ← " ident* : command
```

```lean
@[command_elab «aliasA»]
```

```lean
def elabOurAlias : CommandElab := λ stx =>
```

```lean
match stx with
```

```lean
| `(aliasA $x:ident ← $ys:ident*) =>
```

```lean
for y in ys do
```

```lean
Lean.logInfo y
```

```lean
| _ =>
```

```lean
throwUnsupportedSyntax
```

```lean
aliasA hi.hello ← d.d w.w nnn
```

```lean
-- b) using `syntax` + `elab_rules`.
```

```lean
syntax (name := aliasB) (docComment)? "aliasB " ident " ← " ident* : command
```

```lean
elab_rules : command
```

```lean
| `(command | aliasB $m:ident ← $ys:ident*) =>
```

```lean
for y in ys do
```

```lean
Lean.logInfo y
```

```lean
aliasB hi.hello ← d.d w.w nnn
```

```lean
-- c) using `elab`
```

```lean
elab "aliasC " x:ident " ← " ys:ident* : command =>
```

```lean
for y in ys do
```

```lean
Lean.logInfo y
```

```lean
aliasC hi.hello ← d.d w.w nnn
```

```lean
/- ### 3. -/
```

```lean
open Parser.Tactic
```

```lean
-- a) using `syntax` + `@[tactic nthRewrite] def elabNthRewrite : Lean.Elab.Tactic.Tactic`.
```

```lean
syntax (name := nthRewriteA) "nth_rewriteA " (config)? num rwRuleSeq (ppSpace location)? : tactic
```

```lean
@[tactic nthRewriteA] def elabNthRewrite : Lean.Elab.Tactic.Tactic := fun stx => do
```

```lean
match stx with
```

```lean
| `(tactic| nth_rewriteA $[$cfg]? $n $rules $_loc) =>
```

```lean
Lean.logInfo "rewrite location!"
```

```lean
| `(tactic| nth_rewriteA $[$cfg]? $n $rules) =>
```

```lean
Lean.logInfo "rewrite target!"
```

```lean
| _ =>
```

```lean
throwUnsupportedSyntax
```

```lean
-- b) using `syntax` + `elab_rules`.
```

```lean
syntax (name := nthRewriteB) "nth_rewriteB " (config)? num rwRuleSeq (ppSpace location)? : tactic
```

```lean
elab_rules (kind := nthRewriteB) : tactic
```

```lean
| `(tactic| nth_rewriteB $[$cfg]? $n $rules $_loc) =>
```

```lean
Lean.logInfo "rewrite location!"
```

```lean
| `(tactic| nth_rewriteB $[$cfg]? $n $rules) =>
```

```lean
Lean.logInfo "rewrite target!"
```

```lean
-- c) using `elab`.
```

```lean
elab "nth_rewriteC " (config)? num rwRuleSeq loc:(ppSpace location)? : tactic =>
```

```lean
if let some loc := loc then
```

```lean
Lean.logInfo "rewrite location!"
```

```lean
else
```

```lean
Lean.logInfo "rewrite target!"
```

```lean
example : 2 + 2 = 4 := by
```

```lean
nth_rewriteC 2 [← add_zero] at h
```

```lean
nth_rewriteC 2 [← add_zero]
```

```lean
sorry
```
