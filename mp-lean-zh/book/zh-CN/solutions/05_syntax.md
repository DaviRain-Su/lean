```lean
import Lean
```

```lean
import Lean.Parser.Syntax
```

```lean
import Batteries.Util.ExtendedBinder
```

```lean
open Lean Elab Command Term
```

```lean
/- ## `Syntax`: Solutions -/
```

```lean
/- ### 1. -/
```

```lean
namespace a
```

```lean
scoped notation:71 lhs:50 " 💀 " rhs:72 => lhs - rhs
```

```lean
end a
```

```lean
namespace b
```

```lean
set_option quotPrecheck false
```

```lean
scoped infixl:71 " 💀 " => fun lhs rhs => lhs - rhs
```

```lean
end b
```

```lean
namespace c
```

```lean
scoped syntax:71 term:50 " 💀 " term:72 : term
```

```lean
scoped macro_rules | `($l:term 💀 $r:term) => `($l - $r)
```

```lean
end c
```

```lean
open a
```

```lean
#eval 5 * 8 💀 4 -- 20
```

```lean
#eval 8 💀 6 💀 1 -- 1
```

```lean
/- ### 2. -/
```

```lean
syntax "good" "morning" : term
```

```lean
syntax "hello" : command
```

```lean
syntax "yellow" : tactic
```

```lean
-- Note: the following are highlighted in red, however that's just because we haven't implemented the semantics ("elaboration function") yet - the syntax parsing stage works.
```

```lean
#check_failure good morning -- the syntax parsing stage works
```

```lean
/-- error: elaboration function for 'commandHello' has not been implemented -/
```

```lean
hello -- the syntax parsing stage works
```

```lean
/-- error: tactic 'tacticYellow' has not been implemented -/
```

```lean
example : 2 + 2 = 4 := by
```

```lean
yellow -- the syntax parsing stage works
```

```lean
#check_failure yellow -- error: `unknown identifier 'yellow'`
```

```lean
/- ### 3. -/
```

```lean
syntax (name := colors) (("blue"+) <|> ("red"+)) num : command
```

```lean
@[command_elab colors]
```

```lean
def elabColors : CommandElab := fun stx => Lean.logInfo "success!"
```

```lean
blue blue 443
```

```lean
red red red 4
```

```lean
/- ### 4. -/
```

```lean
syntax (name := help) "#better_help" "option" (ident)? : command
```

```lean
@[command_elab help]
```

```lean
def elabHelp : CommandElab := fun stx => Lean.logInfo "success!"
```

```lean
#better_help option
```

```lean
#better_help option pp.r
```

```lean
#better_help option some.other.name
```

```lean
/- ### 5. -/
```

```lean
-- Note: Batteries has to be in dependencies of your project for this to work.
```

```lean
syntax (name := bigsumin) "∑ " Batteries.ExtendedBinder.extBinder "in " term "," term : term
```

```lean
@[term_elab bigsumin]
```

```lean
def elabSum : TermElab := fun stx tp =>
```

```lean
return mkNatLit 666
```

```lean
#eval ∑ x in { 1, 2, 3 }, x^2
```

```lean
def hi := (∑ x in { "apple", "banana", "cherry" }, x.length) + 1
```

```lean
#eval hi
```
