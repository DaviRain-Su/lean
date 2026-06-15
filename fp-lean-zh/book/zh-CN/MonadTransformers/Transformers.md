# 单子构造工具箱

{anchorName m}`ReaderT` 远非唯一有用的单子变换器。
本节介绍若干额外的变换器。
每个单子变换器都包含以下部分：
 1. 一个定义或数据类型 {anchorName general}`T`，它接受一个单子作为参数。
    它的类型应类似 {anchorTerm general}`(Type u → Type v) → Type u → Type v`，不过在接受单子之前可能还有额外参数。
 2. 一个针对 {anchorTerm general}`T m` 的 {anchorName general}`Monad` 实例，它依赖 {anchorTerm general}`Monad m` 的实例。这使得变换后的单子可以作为单子使用。
 3. 一个 {anchorName general}`MonadLift` 实例，它将类型为 {anchorTerm general}`m α` 的动作翻译为类型为 {anchorTerm general}`T m α` 的动作，对任意单子 {anchorName general}`m` 都成立。这使得底层单子的动作可以在变换后的单子中使用。

此外，变换器的 {anchorName general}`Monad` 实例应遵守 {anchorName general}`Monad` 的约定，至少在底层 {anchorName general}`Monad` 实例遵守该约定时也应如此。
另外，{anchorTerm general}`monadLift (pure x : m α)` 应与变换后单子中的 {anchorTerm general}`pure x` 等价，且 {anchorName general}`monadLift` 应分配于 {anchorName MonadStateT}`bind`，使得 {anchorTerm general}`monadLift (x >>= f : m α)` 与 {anchorTerm general}`(monadLift x : m α) >>= fun y => monadLift (f y)` 相同。

许多单子变换器还会以 {anchorName m}`MonadReader` 的风格定义类型类，来描述单子中实际可用的效应。
这可以提供更大的灵活性：它允许编写只依赖接口、而不把底层单子约束为必须由某个给定变换器实现的程序。
类型类是程序表达其需求的方式，而单子变换器则是满足这些需求的便捷手段。


# 用 {lit}`OptionT` 表示失败

失败由 {anchorName OptionExcept}`Option` 单子表示，异常由 {anchorName M1eval}`Except` 单子表示，它们都有对应的变换器。
就 {anchorName OptionTdef}`Option` 而言，可以通过让单子在原本应包含类型 {anchorName OptionTdef}`α` 的值之处，改为包含类型 {anchorTerm OptionTdef}`Option α` 的值，从而向单子添加失败。
例如，{anchorTerm m}`IO (Option α)` 表示并非总能返回类型 {anchorName m}`α` 的值的 {anchorName m}`IO` 动作。
这提示了单子变换器 {anchorName OptionTdef}`OptionT` 的定义：

```anchor OptionTdef
def OptionT (m : Type u → Type v) (α : Type u) : Type v :=
  m (Option α)
```

作为 {anchorName OptionTdef}`OptionT` 实际运作的一个例子，考虑一个向用户提问的程序。
函数 {anchorName getSomeInput}`getSomeInput` 请求一行输入，并去掉两端空白。
如果修剪后的输入非空，则返回它；若没有非空白字符，则函数失败：

```anchor getSomeInput
def getSomeInput : OptionT IO String := do
  let input ← (← IO.getStdin).getLine
  let trimmed := input.trim
  if trimmed == "" then
    failure
  else pure trimmed
```
这个具体应用用姓名和最喜欢的甲虫种类来记录用户：

```anchor UserInfo
structure UserInfo where
  name : String
  favoriteBeetle : String
```
向用户请求输入并不比只使用 {anchorName m}`IO` 的函数更啰嗦：

```anchor getUserInfo
def getUserInfo : OptionT IO UserInfo := do
  IO.println "What is your name?"
  let name ← getSomeInput
  IO.println "What is your favorite species of beetle?"
  let beetle ← getSomeInput
  pure ⟨name, beetle⟩
```
然而，因为该函数在 {anchorTerm getSomeInput}`OptionT IO` 上下文中运行，而不是仅在 {anchorName m}`IO` 中运行，第一次调用 {anchorName getSomeInput}`getSomeInput` 时的失败会导致整个 {anchorName getUserInfo}`getUserInfo` 失败，控制流永远不会到达关于甲虫的问题。
主函数 {anchorName interact}`interact` 在纯 {anchorName m}`IO` 上下文中调用 {anchorName interact}`getUserInfo`，从而可以通过匹配内部的 {anchorName m}`Option` 来检查调用是否成功：

```anchor interact
def interact : IO Unit := do
  match ← getUserInfo with
  | none =>
    IO.eprintln "Missing info"
  | some ⟨name, beetle⟩ =>
    IO.println s!"Hello {name}, whose favorite beetle is {beetle}."
```

## Monad 实例

编写 monad 实例会暴露出一个困难。
根据类型，{anchorName MonadExceptT}`pure` 应使用底层单子 {anchorName firstMonadOptionT}`m` 的 {anchorName MonadMissingUni}`pure` 与 {anchorName firstMonadOptionT}`some`。
正如 {anchorName m}`Option` 的 {anchorName firstMonadOptionT}`bind` 对第一个参数分支并传播 {anchorName firstMonadOptionT}`none`，{anchorName firstMonadOptionT}`OptionT` 的 {anchorName firstMonadOptionT}`bind` 应运行构成第一个参数的 monad 动作，对结果分支，然后传播 {anchorName firstMonadOptionT}`none`。
按这一草图可得如下定义，但 Lean 不接受它：
```anchor firstMonadOptionT
instance [Monad m] : Monad (OptionT m) where
  pure x := pure (some x)
  bind action next := do
    match (← action) with
    | none => pure none
    | some v => next v
```
错误信息显示了一个晦涩的类型不匹配：
```anchorError firstMonadOptionT
Application type mismatch: The argument
  some x
has type
  Option α✝
but is expected to have type
  α✝
in the application
  pure (some x)
```
问题在于 Lean 为外围的 {anchorName firstMonadOptionT}`pure` 选择了错误的 {anchorName firstMonadOptionT}`Monad` 实例。
对 {anchorName firstMonadOptionT}`bind` 的定义也会出现类似错误。
一种解决办法是使用类型注解，引导 Lean 选择正确的 {anchorName MonadOptionTAnnots}`Monad` 实例：

```anchor MonadOptionTAnnots
instance [Monad m] : Monad (OptionT m) where
  pure x := (pure (some x) : m (Option _))
  bind action next := (do
    match (← action) with
    | none => pure none
    | some v => next v : m (Option _))
```
虽然这一办法可行，但不够优雅，代码也会略显嘈杂。

另一种办法是定义类型签名能引导 Lean 选择正确实例的函数。
事实上，{anchorName OptionTStructure}`OptionT` 本可以定义为结构体：

```anchor OptionTStructure
structure OptionT (m : Type u → Type v) (α : Type u) : Type v where
  run : m (Option α)
```
这能解决问题，因为构造子 {anchorName OptionTStructuredefs}`OptionT.mk` 和字段访问器 {anchorName OptionTStructuredefs}`OptionT.run` 会引导类型类推断选择正确的实例。
这样做的缺点是，得到的代码更复杂，而且这些结构体可能使证明更难阅读。
两全其美的做法是定义与构造子 {anchorName OptionTStructuredefs}`OptionT.mk` 和字段 {anchorName OptionTStructuredefs}`OptionT.run` 起相同作用的函数，但能与直接定义配合使用：

```anchor FakeStructOptionT
def OptionT.mk (x : m (Option α)) : OptionT m α := x

def OptionT.run (x : OptionT m α) : m (Option α) := x
```
两个函数都原样返回其输入，但它们标出了旨在呈现 {anchorName FakeStructOptionT}`OptionT` 接口的代码，与旨在呈现底层单子 {anchorName FakeStructOptionT}`m` 接口的代码之间的边界。
借助这些辅助函数，{anchorName MonadOptionTFakeStruct}`Monad` 实例变得更易读：

```anchor MonadOptionTFakeStruct
instance [Monad m] : Monad (OptionT m) where
  pure x := OptionT.mk (pure (some x))
  bind action next := OptionT.mk do
    match ← action with
    | none => pure none
    | some v => next v
```
这里，{anchorName FakeStructOptionT}`OptionT.mk` 的使用表明其参数应被视为使用 {anchorName MonadOptionTFakeStruct}`m` 接口的代码，从而使 Lean 能选择正确的 {anchorName MonadOptionTFakeStruct}`Monad` 实例。

定义 monad 实例之后，最好检查 monad 约定是否满足。
第一步是证明 {anchorTerm OptionTFirstLaw}`bind (pure v) f` 与 {anchorTerm OptionTFirstLaw}`f v` 相同。
步骤如下：

```anchorEqSteps OptionTFirstLaw
bind (pure v) f
={ /-- 展开 `bind` 和 `pure` 的定义 -/
   by simp [bind, pure, OptionT.mk]
}=
OptionT.mk do
  match ← pure (some v) with
  | none => pure none
  | some x => f x
={
/-- 脱糖嵌套动作语法 -/
}=
OptionT.mk do
  let y ← pure (some v)
  match y with
  | none => pure none
  | some x => f x
={
/-- 脱糖 `do` 记法 -/
}=
OptionT.mk
  (pure (some v) >>= fun y =>
    match y with
    | none => pure none
    | some x => f x)
={
  /-- 使用 `m` 的第一条 monad 规则 -/
  by simp [LawfulMonad.pure_bind (m := m)]
}=
OptionT.mk
  (match some v with
   | none => pure none
   | some x => f x)
={
/-- 化简 `match` -/
}=
OptionT.mk (f v)
={
/-- `OptionT.mk` 的定义 -/
}=
f v
```

第二条规则指出 {anchorTerm OptionTSecondLaw}`bind w pure` 与 {anchorName OptionTSecondLaw}`w` 相同。
要证明这一点，展开 {anchorName OptionTSecondLaw}`bind` 和 {anchorName OptionTSecondLaw}`pure` 的定义，得到：
```anchorTerm OptionTSecondLaw
OptionT.mk do
    match ← w with
    | none => pure none
    | some v => pure (some v)
```
在这个模式匹配中，两个分支的结果都与被匹配的模式相同，只是外面包了 {anchorName OptionTSecondLaw}`pure`。
换句话说，它等价于 {anchorTerm OptionTSecondLaw}`w >>= fun y => pure y`，这是 {anchorName OptionTFirstLaw}`m` 的第二条 monad 规则的一个实例。

最后一条规则指出 {anchorTerm OptionTThirdLaw}`bind (bind v f) g` 与 {anchorTerm OptionTThirdLaw}`bind v (fun x => bind (f x) g)` 相同。
可以用同样方式验证：展开 {anchorName OptionTThirdLaw}`bind` 和 {anchorName OptionTSecondLaw}`pure` 的定义，然后委托给底层单子 {anchorName OptionTFirstLaw}`m`。

## {lit}`Alternative` 实例

使用 {anchorName OptionTdef}`OptionT` 的一种便捷方式是通过 {anchorName AlternativeOptionT}`Alternative` 类型类。
成功返回已经由 {anchorName AlternativeOptionT}`pure` 表示，而 {anchorName AlternativeOptionT}`Alternative` 的 {anchorName AlternativeOptionT}`failure` 和 {anchorName AlternativeOptionT}`orElse` 方法提供了一种编写程序的方式，该程序从若干子程序中返回第一个成功的结果：

```anchor AlternativeOptionT
instance [Monad m] : Alternative (OptionT m) where
  failure := OptionT.mk (pure none)
  orElse x y := OptionT.mk do
    match ← x with
    | some result => pure (some result)
    | none => y ()
```


## 提升

将动作从 {anchorName LiftOptionT}`m` 提升到 {anchorTerm LiftOptionT}`OptionT m` 只需用 {anchorName LiftOptionT}`some` 包裹计算结果：

```anchor LiftOptionT
instance [Monad m] : MonadLift m (OptionT m) where
  monadLift action := OptionT.mk do
    pure (some (← action))
```


# 异常

{anchorName ExceptT}`Except` 的单子变换器版本与 {anchorName m}`Option` 的单子变换器版本非常相似。
向某个类型为 {anchorTerm ExceptT}`m`{lit}` `{anchorTerm ExceptT}`α` 的 monad 动作添加类型为 {anchorName ExceptT}`ε` 的异常，可以通过向 {anchorName MonadExcept}`α` 添加异常来完成，得到类型 {anchorTerm ExceptT}`m (Except ε α)`：

```anchor ExceptT
def ExceptT (ε : Type u) (m : Type u → Type v) (α : Type u) : Type v :=
  m (Except ε α)
```
{anchorName OptionTdef}`OptionT` 提供了 {anchorName FakeStructOptionT}`OptionT.mk` 和 {anchorName FakeStructOptionT}`OptionT.run` 函数，以引导类型检查器选择正确的 {anchorName MonadOptionTFakeStruct}`Monad` 实例。
这一技巧对 {anchorName ExceptTFakeStruct}`ExceptT` 同样有用：

```anchor ExceptTFakeStruct
  def ExceptT.mk {ε α : Type u} (x : m (Except ε α)) : ExceptT ε m α := x

  def ExceptT.run {ε α : Type u} (x : ExceptT ε m α) : m (Except ε α) := x
```
{anchorName MonadExceptT}`ExceptT` 的 {anchorName MonadExceptT}`Monad` 实例也与 {anchorName MonadOptionTFakeStruct}`OptionT` 的实例非常相似。
唯一区别是它传播的是具体的错误值，而不是 {anchorName MonadOptionTFakeStruct}`none`：

```anchor MonadExceptT
instance {ε : Type u} {m : Type u → Type v} [Monad m] :
    Monad (ExceptT ε m) where
  pure x := ExceptT.mk (pure (Except.ok x))
  bind result next := ExceptT.mk do
    match ← result with
    | .error e => pure (.error e)
    | .ok x => next x
```

{anchorName ExceptTFakeStruct}`ExceptT.mk` 和 {anchorName ExceptTFakeStruct}`ExceptT.run` 的类型签名包含一个微妙细节：它们显式标注了 {anchorName ExceptTFakeStruct}`α` 和 {anchorName ExceptTFakeStruct}`ε` 的宇宙层级。
若不显式标注，Lean 会生成更一般的类型签名，其中它们具有不同的多态宇宙变量。
然而，{anchorName ExceptTFakeStruct}`ExceptT` 的定义要求它们处于同一宇宙，因为它们都可以作为参数传给 {anchorName ExceptTFakeStruct}`m`。
这可能导致 {anchorName MonadStateT}`Monad` 实例出现问题，宇宙层级求解器找不到可行解：

```anchor ExceptTNoUnis
def ExceptT.mk (x : m (Except ε α)) : ExceptT ε m α := x
```
```anchor MonadMissingUni
instance {ε : Type u} {m : Type u → Type v} [Monad m] :
    Monad (ExceptT ε m) where
  pure x := ExceptT.mk (pure (Except.ok x))
  bind result next := ExceptT.mk do
    match (← result) with
    | .error e => pure (.error e)
    | .ok x => next x
```
```anchorError MonadMissingUni
stuck at solving universe constraint
  max ?u.10439 ?u.10440 =?= u
while trying to unify
  ExceptT ε m β✝ : Type v
with
  ExceptT.{max ?u.10440 ?u.10439, v} ε m β✝ : Type v
```
这类错误信息通常由约束不足的宇宙变量引起。
诊断可能很棘手，但一个好的第一步是查找：某些定义中复用了宇宙变量，而其他定义中却没有复用。

与 {anchorName m}`Option` 不同，{anchorName m}`Except` 数据类型通常不当作数据结构使用。
它总是与其 {anchorName MonadExceptT}`Monad` 实例一起，作为控制结构使用。
这意味着将 {anchorTerm ExceptTLiftExcept}`Except ε` 动作提升到 {anchorTerm ExceptTLiftExcept}`ExceptT ε m` 是合理的，将底层单子 {anchorName ExceptTLiftExcept}`m` 的动作提升过去也同样合理。
将 {anchorName ExceptTLiftExcept}`Except` 动作提升到 {anchorName ExceptTLiftExcept}`ExceptT` 动作，是用 {anchorName ExceptTLiftExcept}`m` 的 {anchorName ExceptTLiftExcept}`pure` 包裹它们，因为只有异常效应、没有来自单子 {anchorName ExceptTLiftExcept}`m` 的效应的动作可以这样处理：

```anchor ExceptTLiftExcept
instance [Monad m] : MonadLift (Except ε) (ExceptT ε m) where
  monadLift action := ExceptT.mk (pure action)
```
因为来自 {anchorName ExceptTLiftExcept}`m` 的动作本身不含异常，其值应包裹在 {anchorName MonadExceptT}`Except.ok` 中。
这可以利用 {anchorName various}`Functor` 是 {anchorName various}`Monad` 的超类这一事实：对任何 monad 计算的结果应用函数，都可以用 {anchorName various}`Functor.map` 完成：

```anchor ExceptTLiftM
instance [Monad m] : MonadLift m (ExceptT ε m) where
  monadLift action := ExceptT.mk (.ok <$> action)
```

## 异常的类型类

异常处理从根本上包含两个运算：抛出异常的能力，以及从异常中恢复的能力。
到目前为止，这分别通过 {anchorName m}`Except` 的构造子和模式匹配来完成。
然而，这会把使用异常的程序绑定到某一种特定的异常处理效应编码。
用类型类捕获这些运算，则使用异常的程序可以在_任何_支持抛出与捕获的 monad 中使用。

抛出异常应接受一个异常作为参数，并且应允许在请求 monad 动作的任何上下文中使用。
规范中的“任何上下文”部分可以写成类型 {anchorTerm MonadExcept}`m α`——因为没有办法产生任意类型的值，{anchorName MonadExcept}`throw` 运算必定在做某种使控制流离开程序那一部分的事情。
捕获异常应接受任意 monad 动作以及一个处理函数，处理函数应说明如何从异常回到动作的类型：

```anchor MonadExcept
class MonadExcept (ε : outParam (Type u)) (m : Type v → Type w) where
  throw : ε → m α
  tryCatch : m α → (ε → m α) → m α
```

{anchorName MonadExcept}`MonadExcept` 上的宇宙层级与 {anchorName ExceptT}`ExceptT` 不同。
在 {anchorName ExceptT}`ExceptT` 中，{anchorName ExceptT}`ε` 和 {anchorName ExceptT}`α` 处于同一层级，而 {anchorName MonadExcept}`MonadExcept` 不作此限制。
这是因为 {anchorName MonadExcept}`MonadExcept` 从不把异常值放进 {anchorName MonadExcept}`m` 内部。
最一般的宇宙签名承认：在这一定义中，{anchorName MonadExcept}`ε` 与 {anchorName MonadExcept}`α` 完全独立。
更一般意味着该类型类可以为更多种类的类型提供实例。

一个使用 {anchorName MonadExcept}`MonadExcept` 的示例程序是简单的除法服务。
程序分为两部分：基于字符串、处理错误的前端用户界面，以及实际执行除法的后端。
前端和后端都可以抛出异常：前者针对格式错误的输入，后者针对除零错误。
异常是一个归纳类型：

```anchor ErrEx
inductive Err where
  | divByZero
  | notANumber : String → Err
```
后端检查是否为零，如果可以则相除：

```anchor divBackend
def divBackend [Monad m] [MonadExcept Err m] (n k : Int) : m Int :=
  if k == 0 then
    throw .divByZero
  else pure (n / k)
```
前端的辅助函数 {anchorName asNumber}`asNumber` 在传入的字符串不是数字时抛出异常。
整体前端把输入转换为 {anchorName asNumber}`Int` 并调用后端，通过返回友好的字符串错误来处理异常：

```anchor asNumber
def asNumber [Monad m] [MonadExcept Err m] (s : String) : m Int :=
  match s.toInt? with
  | none => throw (.notANumber s)
  | some i => pure i
```

```anchor divFrontend
def divFrontend [Monad m] [MonadExcept Err m] (n k : String) : m String :=
  tryCatch (do pure (toString (← divBackend (← asNumber n) (← asNumber k))))
    fun
      | .divByZero => pure "Division by zero!"
      | .notANumber s => pure s!"Not a number: \"{s}\""
```
抛出和捕获异常足够常见，Lean 为使用 {anchorName divFrontendSugary}`MonadExcept` 提供了特殊语法。
正如 {lit}`+` 是 {anchorName various}`HAdd.hAdd` 的简写，{kw}`try` 和 {kw}`catch` 可用作 {anchorName MonadExcept}`tryCatch` 方法的简写：

```anchor divFrontendSugary
def divFrontend [Monad m] [MonadExcept Err m] (n k : String) : m String :=
  try
    pure (toString (← divBackend (← asNumber n) (← asNumber k)))
  catch
    | .divByZero => pure "Division by zero!"
    | .notANumber s => pure s!"Not a number: \"{s}\""
```

除了 {anchorName m}`Except` 和 {anchorName ExceptT}`ExceptT`，其他类型也有有用的 {anchorName MonadExcept}`MonadExcept` 实例，其中有些初看并不像异常。
例如，{anchorName m}`Option` 导致的失败可以看作抛出不含任何数据的异常，因此存在 {anchorTerm OptionExcept}`MonadExcept Unit Option` 的实例，使得 {kw}`try`{lit}` ...`{kw}`catch`{lit}` ...` 语法可以与 {anchorName m}`Option` 一起使用。

# 状态

向 monad 添加可变状态的模拟，是让 monad 动作接受起始状态作为参数，并连同其结果一起返回最终状态。
状态 monad 的 bind 运算符把一条动作的最终状态作为参数传给下一条动作，从而在程序中传递状态。
这一模式也可以表达为单子变换器：

```anchor DefStateT
def StateT (σ : Type u)
    (m : Type u → Type v) (α : Type u) : Type (max u v) :=
  σ → m (α × σ)
```


再一次，monad 实例与 {anchorName State (module := Examples.Monads)}`State` 的实例非常相似。
唯一区别是输入和输出状态在底层 monad 中传递和返回，而不是用纯代码：

```anchor MonadStateT
instance [Monad m] : Monad (StateT σ m) where
  pure x := fun s => pure (x, s)
  bind result next := fun s => do
    let (v, s') ← result s
    next v s'
```

对应的类型类有 {anchorName MonadState}`get` 和 {anchorName MonadState}`set` 方法。
{anchorName MonadState}`get` 和 {anchorName MonadState}`set` 的一个缺点是，在更新状态时很容易 {anchorName MonadState}`set` 错状态。
这是因为取出状态、更新它、再保存更新后的状态，是编写某些程序的自然方式。
例如，下面的程序统计一串字母中不带变音符号的英语元音和辅音的数量：

```anchor countLetters
structure LetterCounts where
  vowels : Nat
  consonants : Nat
deriving Repr

inductive Err where
  | notALetter : Char → Err
deriving Repr

def vowels :=
  let lowerVowels := "aeiuoy"
  lowerVowels ++ lowerVowels.map (·.toUpper)

def consonants :=
  let lowerConsonants := "bcdfghjklmnpqrstvwxz"
  lowerConsonants ++ lowerConsonants.map (·.toUpper )

def countLetters (str : String) : StateT LetterCounts (Except Err) Unit :=
  let rec loop (chars : List Char) := do
    match chars with
    | [] => pure ()
    | c :: cs =>
      let st ← get
      let st' ←
        if c.isAlpha then
          if vowels.contains c then
            pure {st with vowels := st.vowels + 1}
          else if consonants.contains c then
            pure {st with consonants := st.consonants + 1}
          else -- modified or non-English letter
            pure st
        else throw (.notALetter c)
      set st'
      loop cs
  loop str.toList
```
很容易写成 {lit}`set st` 而不是 {anchorTerm countLetters}`set st'`。
在大型程序中，这类错误可能导致难以诊断的 bug。

对 {anchorName countLetters}`get` 的调用使用嵌套动作可以解决这一问题，但无法解决所有此类问题。
例如，某个函数可能根据结构中另外两个字段的值来更新其中一个字段。
这就需要两次分别对 {anchorName countLetters}`get` 的嵌套动作调用。
由于 Lean 编译器包含的优化只在存在对值的单一引用时才有效，重复引用状态可能导致代码明显变慢。
潜在的性能问题和潜在的 bug，都可以通过使用 {anchorName countLettersModify}`modify`（用函数变换状态）来规避：

```anchor countLettersModify
def countLetters (str : String) : StateT LetterCounts (Except Err) Unit :=
  let rec loop (chars : List Char) := do
    match chars with
    | [] => pure ()
    | c :: cs =>
      if c.isAlpha then
        if vowels.contains c then
          modify fun st => {st with vowels := st.vowels + 1}
        else if consonants.contains c then
          modify fun st => {st with consonants := st.consonants + 1}
        else -- modified or non-English letter
          pure ()
      else throw (.notALetter c)
      loop cs
  loop str.toList
```
类型类包含一个类似于 {anchorName modify}`modify` 的函数，名为 {anchorName modify}`modifyGet`，它允许函数在单步中既计算返回值又变换旧状态。
该函数返回一对：第一个元素是返回值，第二个元素是新状态；{anchorName modify}`modify` 只是在 {anchorName modify}`modifyGet` 所用的一对值上添加 {anchorName modify}`Unit` 的构造子：

```anchor modify
def modify [MonadState σ m] (f : σ → σ) : m Unit :=
  modifyGet fun s => ((), f s)
```

{anchorName MonadState}`MonadState` 的定义如下：

```anchor MonadState
class MonadState (σ : outParam (Type u)) (m : Type u → Type v) :
    Type (max (u+1) v) where
  get : m σ
  set : σ → m PUnit
  modifyGet : (σ → α × σ) → m α
```
{anchorName MonadState}`PUnit` 是 {anchorName modify}`Unit` 类型的宇宙多态版本，使得它可以处于 {anchorTerm MonadState}`Type u` 而非 {anchorTerm MonadState}`Type`。
虽然可以用 {anchorName MonadState}`get` 和 {anchorName MonadState}`set` 为 {anchorName MonadState}`modifyGet` 提供默认实现，但那样就无法获得使 {anchorName MonadState}`modifyGet` 有用的优化，从而使该方法失去意义。

# {lit}`Of` 类型类与 {lit}`The` 函数

到目前为止，每个携带额外信息（例如 {anchorName MonadExcept}`MonadExcept` 的异常类型，或 {anchorName MonadState}`MonadState` 的状态类型）的单子类型类，都将这类额外信息作为输出参数。
对简单程序而言，这通常很方便，因为组合了各用一次 {anchorName MonadStateT}`StateT`、{anchorName m}`ReaderT` 和 {anchorName ExceptT}`ExceptT` 的 monad，只对应一种状态类型、一种环境类型和一种异常类型。
然而，随着 monad 变复杂，可能涉及多种状态或错误类型。
此时，输出参数的使用使得在同一个 {kw}`do` 块中无法同时针对两种状态。

针对这些情况，还有额外信息不是输出参数的类型类版本。
这些版本在名称中使用 {lit}`Of` 一词。
例如，{anchorName getTheType}`MonadStateOf` 类似 {anchorName MonadState}`MonadState`，但没有 {anchorName MonadState}`outParam` 修饰符。

这些类不用 {anchorName MonadState}`outParam`，而是对各自的状态、环境或异常类型使用 {anchorName various}`semiOutParam`。
与 {anchorName MonadState}`outParam` 一样，{anchorName various}`semiOutParam` 不要求在 Lean 开始搜索实例之前就已确定。
但有一个重要区别：{anchorName MonadState}`outParam` 在搜索实例时会被忽略，因此它们真正是输出。
若在搜索之前已知某个 {anchorName MonadState}`outParam`，Lean 仅检查搜索结果是否与已知值相同。
另一方面，若在搜索开始前已知某个 {anchorName various}`semiOutParam`，它可以像输入参数一样用来缩小候选范围。

当状态 monad 的状态类型是 {anchorName MonadState}`outParam` 时，每个 monad 最多只能有一种状态类型。
这很方便，因为它改善了类型推断：状态类型可以在更多情形下被推断出来。
这也不方便，因为从多次使用 {anchorName countLetters}`StateT` 构建的 monad 无法提供有用的 {anchorName modify}`MonadState` 实例。
然而，使用 {anchorName modifyTheType}`MonadStateOf` 会使 Lean 在状态类型可用时将其纳入考量以选择实例，因此一个 monad 可以提供多种状态类型。
缺点是，当状态类型没有足够明确地指定时，得到的实例可能并非本意，从而导致令人困惑的错误信息。

类似地，还有类型类方法的版本，将额外信息的类型作为_显式_参数而非隐式参数接受。
对 {anchorName modifyTheType}`MonadStateOf`，有类型为
```anchorTerm getTheType
(σ : Type u) → {m : Type u → Type v} → [MonadStateOf σ m] → m σ
```
的 {anchorTerm getTheType}`getThe`，以及类型为
```anchorTerm modifyTheType
(σ : Type u) → {m : Type u → Type v} → [MonadStateOf σ m] → (σ → σ) → m PUnit
```
的 {anchorTerm modifyTheType}`modifyThe`。
没有 {lit}`setThe`，因为新状态的类型就足以决定应使用哪个外围状态 monad 变换器。

在 Lean 标准库中，非 {lit}`Of` 版本的类型类实例是根据带 {lit}`Of` 版本的实例定义的。
换句话说，实现 {lit}`Of` 版本会同时得到两种实现。
通常最好先实现 {lit}`Of` 版本，然后用非 {lit}`Of` 版本的类开始写程序；若输出参数变得不便，再过渡到 {lit}`Of` 版本。

# 变换器与 {lit}`Id`

恒等 monad {anchorName various}`Id` 是完全没有效应的 monad，用于某些出于某种原因期望 monad、但实际上并不需要效应的上下文。
{anchorName various}`Id` 的另一个用途是作为单子变换器栈的底层。
例如，{anchorTerm StateTDoubleB}`StateT σ Id` 的工作方式就像 {anchorTerm set (module:=Examples.Monads)}`State σ`。


# 练习

## Monad 约定

用纸笔检查：本节中每个单子变换器都满足单子变换器约定的规则。

## 日志变换器

定义 {anchorName WithLog (module:=Examples.Monads)}`WithLog` 的单子变换器版本。
再定义对应的类型类 {lit}`MonadWithLog`，并编写一个同时组合日志与异常的程序。

## 统计文件

用 {anchorName MonadStateT}`StateT` 修改 {lit}`doug` 的 monad，使其统计所见目录和文件的数量。
执行结束时，应显示类似如下的报告：
```
  Viewed 38 files in 5 directories.
```