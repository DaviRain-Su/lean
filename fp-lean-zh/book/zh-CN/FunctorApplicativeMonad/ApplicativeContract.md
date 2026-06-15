# 应用函子约定

%%%
tag := "applicative-laws"
%%%

与 {anchorName ApplicativeLaws}`Functor`、{anchorName ApplicativeLaws}`Monad`，以及实现了 {anchorName SizedCreature}`BEq` 和 {anchorName MonstrousAssistantMore}`Hashable` 的类型一样，{anchorName ApplicativeLaws}`Applicative` 也有一组所有实例都应遵守的规则。

应用函子应遵循四条规则：
1. 它应尊重恒等，即 {anchorTerm ApplicativeLaws}`pure id <*> v = v`
2. 它应尊重函数复合，即 {anchorTerm ApplicativeLaws}`pure (· ∘ ·) <*> u <*> v <*> w = u <*> (v <*> w)`
3. 对纯运算进行序列化应是空操作，即 {anchorTerm ApplicativeLaws}`pure f <*> pure x`{lit}` = `{anchorTerm ApplicativeLaws}`pure (f x)`
4. 纯运算的顺序无关紧要，即 {anchorTerm ApplicativeLaws}`u <*> pure x = pure (fun f => f x) <*> u`

要针对 {anchorTerm ApplicativeOption}`Applicative Option` 实例检查这些规则，先把 {anchorName ApplicativeLaws}`pure` 展开为 {anchorName ApplicativeOption}`some`。

第一条规则指出 {anchorTerm ApplicativeOptionLaws1}`some id <*> v = v`。
{anchorName ApplicativeOption}`Option` 的 {anchorName fakeSeq}`seq` 定义表明，这与 {anchorTerm ApplicativeOptionLaws1}`id <$> v = v` 相同，而后者是已经验证过的 {anchorName ApplicativeLaws}`Functor` 规则之一。

第二条规则指出 {anchorTerm ApplicativeOptionLaws2}`some (· ∘ ·) <*> u <*> v <*> w = u <*> (v <*> w)`。
如果 {anchorName ApplicativeOptionLaws2}`u`、{anchorName ApplicativeOptionLaws2}`v` 或 {anchorName ApplicativeOptionLaws2}`w` 中有任意一个是 {anchorName ApplicativeOption}`none`，则两边都是 {anchorName ApplicativeOption}`none`，因此该性质成立。
假设 {anchorName ApplicativeOptionLaws2}`u` 是 {anchorTerm OptionHomomorphism1}`some f`，{anchorName ApplicativeOptionLaws2}`v` 是 {anchorTerm OptionHomomorphism1}`some g`，{anchorName ApplicativeOptionLaws2}`w` 是 {anchorTerm OptionHomomorphism1}`some x`，那么这等价于说 {anchorTerm OptionHomomorphism}`some (· ∘ ·) <*> some f <*> some g <*> some x = some f <*> (some g <*> some x)`。
对两边求值得到相同结果：
```anchorEvalSteps OptionHomomorphism1
some (· ∘ ·) <*> some f <*> some g <*> some x
===>
some (f ∘ ·) <*> some g <*> some x
===>
some (f ∘ g) <*> some x
===>
some ((f ∘ g) x)
===>
some (f (g x))
```
```anchorEvalSteps OptionHomomorphism2
some f <*> (some g <*> some x)
===>
some f <*> (some (g x))
===>
some (f (g x))
```

第三条规则直接由 {anchorName fakeSeq}`seq` 的定义得出：
```anchorEvalSteps OptionPureSeq
some f <*> some x
===>
f <$> some x
===>
some (f x)
```

在第四种情况下，假设 {anchorName ApplicativeLaws}`u` 是 {anchorTerm OptionPureSeq}`some f`，因为如果它是 {anchorName AlternativeOption}`none`，等式两边都是 {anchorName AlternativeOption}`none`。
{anchorTerm OptionPureSeq}`some f <*> some x` 直接求值为 {anchorTerm OptionPureSeq}`some (f x)`，{anchorTerm OptionPureSeq2}`some (fun g => g x) <*> some f` 也是如此。


## 所有应用函子都是函子
%%%
tag := "applicatives-are-functors"
%%%

{anchorName ApplicativeMap}`Applicative` 的两个运算符足以定义 {anchorName ApplicativeMap}`map`：

```anchor ApplicativeMap
def map [Applicative f] (g : α → β) (x : f α) : f β :=
  pure g <*> x
```

然而，这只有在其 {anchorName ApplicativeLaws}`Applicative` 约定能保证 {anchorName ApplicativeLaws}`Functor` 约定时，才能用来实现 {anchorName ApplicativeLaws}`Functor`。
{anchorName ApplicativeLaws}`Functor` 的第一条规则是 {anchorTerm AppToFunTerms}`id <$> x = x`，它直接由 {anchorName ApplicativeLaws}`Applicative` 的第一条规则得出。
{anchorName ApplicativeLaws}`Functor` 的第二条规则是 {anchorTerm AppToFunTerms}`map (f ∘ g) x = map f (map g x)`。
在这里展开 {anchorName AppToFunTerms}`map` 的定义，得到 {anchorTerm AppToFunTerms}`pure (f ∘ g) <*> x = pure f <*> (pure g <*> x)`。
利用“对纯运算进行序列化是空操作”这条规则，左边可以改写为 {anchorTerm AppToFunTerms}`pure (· ∘ ·) <*> pure f <*> pure g <*> x`。
这正是应用函子尊重函数复合的那条规则。

这就为定义扩展 {anchorName ApplicativeLaws}`Functor` 的 {anchorName ApplicativeMap}`Applicative` 提供了依据，其中 {anchorTerm ApplicativeExtendsFunctorOne}`map` 的默认定义由 {anchorName ApplicativeExtendsFunctorOne}`pure` 和 {anchorName ApplicativeExtendsFunctorOne}`seq` 给出：

```anchor ApplicativeExtendsFunctorOne
class Applicative (f : Type → Type) extends Functor f where
  pure : α → f α
  seq : f (α → β) → (Unit → f α) → f β
  map g x := seq (pure g) (fun () => x)
```

## 所有单子都是应用函子
%%%
tag := "monads-are-applicative"
%%%

{anchorName MonadExtends}`Monad` 的实例已经要求实现 {anchorName MonadSeq}`pure`。
它与 {anchorName MonadExtends}`bind` 一起，足以定义 {anchorName MonadSeq}`seq`：

```anchor MonadSeq
def seq [Monad m] (f : m (α → β)) (x : Unit → m α) : m β := do
  let g ← f
  let y ← x ()
  pure (g y)
```
再次强调，验证 {anchorName MonadSeq}`Monad` 约定蕴含 {anchorName MonadExtends}`Applicative` 约定，将允许在 {anchorName MonadSeq}`Monad` 扩展 {anchorName MonadExtends}`Applicative` 时，把上述定义用作 {anchorTerm MonadExtends}`seq` 的默认实现。

本节其余部分论证：基于 {anchorName MonadExtends}`bind` 的 {anchorTerm MonadExtends}`seq` 实现确实满足 {anchorName MonadExtends}`Applicative` 约定。
函数式编程的美妙之处之一，就是这种论证可以在纸笔上完成，使用 {ref "evaluating"}[关于求值表达式的初始章节] 中的各类求值规则。
阅读这些论证时，思考各运算的含义有时有助于理解。

把 {kw}`do` 记法替换为对 {lit}`>>=` 的显式使用，更容易应用 {anchorName MonadSeqDesugar}`Monad` 规则：

```anchor MonadSeqDesugar
def seq [Monad m] (f : m (α → β)) (x : Unit → m α) : m β := do
  f >>= fun g =>
  x () >>= fun y =>
  pure (g y)
```


要验证该定义尊重恒等，需检查 {anchorTerm mSeqRespIdInit}`seq (pure id) (fun () => v) = v`。
左边等价于 {anchorTerm mSeqRespIdInit}`pure id >>= fun g => (fun () => v) () >>= fun y => pure (g y)`。
中间的单位函数可以立刻消去，得到 {anchorTerm mSeqRespIdInit}`pure id >>= fun g => v >>= fun y => pure (g y)`。
利用 {anchorName mSeqRespIdInit}`pure` 是 {anchorTerm mSeqRespIdInit}`>>=` 的左单位元这一事实，这与 {anchorTerm mSeqRespIdInit}`v >>= fun y => pure (id y)` 相同，也就是 {anchorTerm mSeqRespIdInit}`v >>= fun y => pure y`。
因为 {anchorTerm mSeqRespIdInit}`fun x => f x` 与 {anchorName mSeqRespIdInit}`f` 相同，这与 {anchorTerm mSeqRespIdInit}`v >>= pure` 相同，而 {anchorName mSeqRespIdInit}`pure` 是 {anchorTerm mSeqRespIdInit}`>>=` 的右单位元这一事实，可用来得到 {anchorName mSeqRespIdInit}`v`。

这类非形式推理经过适当排版后更易读。
在下面的图表中，把“{lit}`EXPR1 ={ REASON }= EXPR2`”读作“{lit}`EXPR1` 与 {lit}`EXPR2` 相同，因为 {lit}`REASON`”：

```anchorEqSteps mSeqRespId
pure id >>= fun g => v >>= fun y => pure (g y)
={
/-- `pure` is a left identity of `>>=` -/
by simp [LawfulMonad.pure_bind]
}=
v >>= fun y => pure (id y)
={
/-- Reduce the call to `id` -/
}=
v >>= fun y => pure y
={
/-- `fun x => f x` is the same as `f` -/
by
  have {α β } {f : α → β} : (fun x => f x) = (f) := rfl
  rfl
}=
v >>= pure
={
/-- `pure` is a right identity of `>>=` -/
by simp
}=
v
```



要验证它尊重函数复合，需检查 {anchorTerm ApplicativeLaws}`pure (· ∘ ·) <*> u <*> v <*> w = u <*> (v <*> w)`。
第一步是把 {lit}`<*>` 替换为上述 {anchorName MonadSeqDesugar}`seq` 定义。
之后，一系列（略长的）步骤，利用 {anchorName ApplicativeLaws}`Monad` 约定中的恒等律和结合律，就足以从一边推到另一边：
```anchorEqSteps mSeqRespComp
seq (seq (seq (pure (· ∘ ·)) (fun _ => u))
      (fun _ => v))
  (fun _ => w)
={
/-- Definition of `seq` -/
}=
((pure (· ∘ ·) >>= fun f =>
   u >>= fun x =>
   pure (f x)) >>= fun g =>
  v >>= fun y =>
  pure (g y)) >>= fun h =>
 w >>= fun z =>
 pure (h z)
={
/-- `pure` is a left identity of `>>=` -/
by simp only [LawfulMonad.pure_bind]
}=
((u >>= fun x =>
   pure (x ∘ ·)) >>= fun g =>
   v >>= fun y =>
  pure (g y)) >>= fun h =>
 w >>= fun z =>
 pure (h z)
={
/-- Insertion of parentheses for clarity -/
}=
((u >>= fun x =>
   pure (x ∘ ·)) >>= (fun g =>
   v >>= fun y =>
  pure (g y))) >>= fun h =>
 w >>= fun z =>
 pure (h z)
={
/-- Associativity of `>>=` -/
by simp only [LawfulMonad.bind_assoc]
}=
(u >>= fun x =>
  pure (x ∘ ·) >>= fun g =>
 v  >>= fun y => pure (g y)) >>= fun h =>
 w >>= fun z =>
 pure (h z)
={
/-- `pure` is a left identity of `>>=` -/
by simp only [LawfulMonad.pure_bind]
}=
(u >>= fun x =>
  v >>= fun y =>
  pure (x ∘ y)) >>= fun h =>
 w >>= fun z =>
 pure (h z)
={
/-- Associativity of `>>=` -/
by simp only [LawfulMonad.bind_assoc]
}=
u >>= fun x =>
v >>= fun y =>
pure (x ∘ y) >>= fun h =>
w >>= fun z =>
pure (h z)
={
/-- `pure` is a left identity of `>>=` -/
by simp [bind_pure_comp]; rfl
}=
u >>= fun x =>
v >>= fun y =>
w >>= fun z =>
pure ((x ∘ y) z)
={
/-- Definition of function composition -/
}=
u >>= fun x =>
v >>= fun y =>
w >>= fun z =>
pure (x (y z))
={
/--
Time to start moving backwards!
`pure` is a left identity of `>>=`
-/
by simp
}=
u >>= fun x =>
v >>= fun y =>
w >>= fun z =>
pure (y z) >>= fun q =>
pure (x q)
={
/-- Associativity of `>>=` -/
by simp
}=
u >>= fun x =>
v >>= fun y =>
 (w >>= fun p =>
  pure (y p)) >>= fun q =>
 pure (x q)
={
/-- Associativity of `>>=` -/
by simp
}=
u >>= fun x =>
 (v >>= fun y =>
  w >>= fun q =>
  pure (y q)) >>= fun z =>
 pure (x z)
={
/-- This includes the definition of `seq` -/
}=
u >>= fun x =>
seq v (fun () => w) >>= fun q =>
pure (x q)
={
/-- This also includes the definition of `seq` -/
}=
seq u (fun () => seq v (fun () => w))
```


要验证对纯运算进行序列化是空操作：
```anchorEqSteps mSeqPureNoOp
seq (pure f) (fun () => pure x)
={
/-- Replacing `seq` with its definition -/
}=
pure f >>= fun g =>
pure x >>= fun y =>
pure (g y)
={
/-- `pure` is a left identity of `>>=` -/
by simp
}=
pure f >>= fun g =>
pure (g x)
={
/-- `pure` is a left identity of `>>=` -/
by simp
}=
pure (f x)
```


最后，要验证纯运算的顺序无关紧要：
```anchorEqSteps mSeqPureNoOrder
seq u (fun () => pure x)
={
/-- Definition of `seq` -/
}=
u >>= fun f =>
pure x >>= fun y =>
pure (f y)
={
/-- `pure` is a left identity of `>>=` -/
by simp
}=
u >>= fun f =>
pure (f x)
={
/-- Clever replacement of one expression by an equivalent one that makes the rule match -/
}=
u >>= fun f =>
pure ((fun g => g x) f)
={
/-- `pure` is a left identity of `>>=` -/
by simp [LawfulMonad.pure_bind]
}=
pure (fun g => g x) >>= fun h =>
u >>= fun f =>
pure (h f)
={
/-- Definition of `seq` -/
}=
seq (pure (fun f => f x)) (fun () => u)
```


这就为定义扩展 {anchorName ApplicativeLaws}`Applicative` 的 {anchorName ApplicativeLaws}`Monad` 提供了依据，其中 {anchorTerm MonadExtends}`seq` 有默认定义：

```anchor MonadExtends
class Monad (m : Type → Type) extends Applicative m where
  bind : m α → (α → m β) → m β
  seq f x :=
    bind f fun g =>
    bind (x ()) fun y =>
    pure (g y)
```
{anchorName MonadExtends}`Applicative` 自己对 {anchorTerm ApplicativeExtendsFunctorOne}`map` 的默认定义意味着，每个 {anchorName MonadExtends}`Monad` 实例都会自动生成 {anchorName MonadExtends}`Applicative` 和 {anchorName ApplicativeExtendsFunctorOne}`Functor` 实例。

## 附加约定
%%%
tag := "additional-stipulations"
%%%

除了遵守与各个类型类相关的单独约定之外，{anchorName ApplicativeLaws}`Functor`、{anchorName ApplicativeLaws}`Applicative` 和 {anchorName ApplicativeLaws}`Monad` 的组合实现还应与这些默认实现等价地工作。
换言之，同时提供 {anchorName ApplicativeLaws}`Applicative` 和 {anchorName ApplicativeLaws}`Monad` 实例的类型，其 {anchorTerm MonadExtends}`seq` 实现不应与 {anchorName MonadSeq}`Monad` 实例生成的默认版本表现不同。
这很重要，因为多态函数可能被重构，把对 {lit}`>>=` 的使用替换为等价的 {lit}`<*>` 使用，或把对 {lit}`<*>` 的使用替换为等价的 {lit}`>>=` 使用。
这种重构不应改变使用这段代码的程序的含义。

这条规则解释了为什么不应使用 {anchorName ValidateAndThen}`Validate.andThen` 在 {anchorName ApplicativeLaws}`Monad` 实例中实现 {anchorName MonadExtends}`bind`。
就其本身而言，它遵守单子约定。
然而，当它被用来实现 {anchorTerm MonadExtends}`seq` 时，其行为与 {anchorTerm MonadExtends}`seq` 本身并不等价。
要看出它们在哪里不同，考虑两个都返回错误的计算的例子。
从一个应返回两个错误的例子开始：一个来自对函数的验证（也可能来自函数先前的参数），另一个来自对参数的验证：

```anchor counterexample
def notFun : Validate String (Nat → String) :=
  .errors { head := "First error", tail := [] }

def notArg : Validate String Nat :=
  .errors { head := "Second error", tail := [] }
```

用 {anchorName Validate}`Validate` 的 {anchorName ApplicativeValidate}`Applicative` 实例中的 {lit}`<*>` 版本组合它们，会把两个错误都报告给用户：
```anchorEvalSteps realSeq
notFun <*> notArg
===>
match notFun with
| .ok g => g <$> notArg
| .errors errs =>
  match notArg with
  | .ok _ => .errors errs
  | .errors errs' => .errors (errs ++ errs')
===>
match notArg with
| .ok _ =>
  .errors { head := "First error", tail := [] }
| .errors errs' =>
  .errors ({ head := "First error", tail := [] } ++ errs')
===>
.errors
  ({ head := "First error", tail := [] } ++
   { head := "Second error", tail := []})
===>
.errors {
  head := "First error",
  tail := ["Second error"]
}
```

使用用 {lit}`>>=` 实现的 {anchorName MonadSeqDesugar}`seq` 版本（这里改写为 {anchorName fakeSeq}`andThen`），则只有第一个错误可用：
```anchorEvalSteps fakeSeq
seq notFun (fun () => notArg)
===>
notFun.andThen fun g =>
notArg.andThen fun y =>
pure (g y)
===>
match notFun with
| .errors errs => .errors errs
| .ok val =>
  (fun g =>
    notArg.andThen fun y =>
    pure (g y)) val
===>
.errors { head := "First error", tail := [] }
```