# 单子变换器的顺序

%%%
tag := "monad-transformer-order"
%%%

从单子变换器栈组合单子时，重要的是要意识到单子变换器的层叠顺序很重要。
同一组变换器的不同顺序会产生不同的单子。

这个版本的 {anchorName countLettersClassy}`countLetters` 与前一版本类似，只是它使用类型类来描述可用效应的集合，而不是提供一个具体的单子：

```anchor countLettersClassy
def countLetters [Monad m] [MonadState LetterCounts m] [MonadExcept Err m]
    (str : String) : m Unit :=
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
状态和异常单子变换器可以按两种不同顺序组合，每种都会产生一个同时具有两种类型类实例的单子：

```anchor SomeMonads
abbrev M1 := StateT LetterCounts (ExceptT Err Id)
abbrev M2 := ExceptT Err (StateT LetterCounts Id)
```

在程序不会抛出异常的输入上运行时，两个单子产生类似的结果：
```anchor countLettersM1Ok
#eval countLetters (m := M1) "hello" ⟨0, 0⟩
```
```anchorInfo countLettersM1Ok
Except.ok ((), { vowels := 2, consonants := 3 })
```
```anchor countLettersM2Ok
#eval countLetters (m := M2) "hello" ⟨0, 0⟩
```
```anchorInfo countLettersM2Ok
(Except.ok (), { vowels := 2, consonants := 3 })
```
然而，这些返回值之间存在细微差别。
在 {anchorName M1eval}`M1` 的情况下，最外层的构造子是 {anchorName MonadExceptT}`Except.ok`，它包含单元构造子与最终状态的配对。
在 {anchorName M2eval}`M2` 的情况下，最外层的构造子是配对，其中包含仅应用于单元构造子的 {anchorName MonadExceptT}`Except.ok`。
最终状态位于 {anchorName MonadExceptT}`Except.ok` 之外。
在这两种情况下，程序都会返回元音和辅音的计数。

另一方面，当字符串导致抛出异常时，只有一个单子会返回元音和辅音的计数。
使用 {anchorName M1eval}`M1` 时，只返回一个异常值：
```anchor countLettersM1Error
#eval countLetters (m := M1) "hello!" ⟨0, 0⟩
```
```anchorInfo countLettersM1Error
Except.error (StEx.Err.notALetter '!')
```
使用 {anchorName SomeMonads}`M2` 时，异常值会与抛出异常时的状态配对：
```anchor countLettersM2Error
#eval countLetters (m := M2) "hello!" ⟨0, 0⟩
```
```anchorInfo countLettersM2Error
(Except.error (StEx.Err.notALetter '!'), { vowels := 2, consonants := 3 })
```

可能很容易认为 {anchorName SomeMonads}`M2` 优于 {anchorName SomeMonads}`M1`，因为它提供了更多可能对调试有用的信息。
同一程序在 {anchorName SomeMonads}`M1` 中计算出的答案可能与在 {anchorName SomeMonads}`M2` 中_不同_，并没有原则性的理由说其中一种答案必然优于另一种。
这一点可以通过向程序添加一个处理异常的步骤来看出：

```anchor countWithFallback
def countWithFallback
    [Monad m] [MonadState LetterCounts m] [MonadExcept Err m]
    (str : String) : m Unit :=
  try
    countLetters str
  catch _ =>
    countLetters "Fallback"
```
该程序总是成功，但可能以不同的结果成功。
如果没有抛出异常，则结果与 {anchorName countWithFallback}`countLetters` 相同：
```anchor countWithFallbackM1Ok
#eval countWithFallback (m := M1) "hello" ⟨0, 0⟩
```
```anchorInfo countWithFallbackM1Ok
Except.ok ((), { vowels := 2, consonants := 3 })
```
```anchor countWithFallbackM2Ok
#eval countWithFallback (m := M2) "hello" ⟨0, 0⟩
```
```anchorInfo countWithFallbackM2Ok
(Except.ok (), { vowels := 2, consonants := 3 })
```
然而，如果异常被抛出并被捕获，则最终状态会非常不同。
在 {anchorName countWithFallbackM1Error}`M1` 中，最终状态只包含来自 {anchorTerm countWithFallback}`"Fallback"` 的字母计数：
```anchor countWithFallbackM1Error
#eval countWithFallback (m := M1) "hello!" ⟨0, 0⟩
```
```anchorInfo countWithFallbackM1Error
Except.ok ((), { vowels := 2, consonants := 6 })
```
在 {anchorName countWithFallbackM2Error}`M2` 中，最终状态包含来自 {anchorTerm countWithFallbackM2Error}`"hello!"` 和 {anchorTerm countWithFallback}`"Fallback"` 的字母计数，正如在命令式语言中所预期的那样：
```anchor countWithFallbackM2Error
#eval countWithFallback (m := M2) "hello!" ⟨0, 0⟩
```
```anchorInfo countWithFallbackM2Error
(Except.ok (), { vowels := 4, consonants := 9 })
```

在 {anchorName countWithFallbackM1Error}`M1` 中，抛出异常会将状态“回滚”到捕获异常的位置。
在 {anchorName countLettersM2Error}`M2` 中，对状态的修改会在抛出和捕获异常之后仍然保留。
这一差异可以通过展开 {anchorName SomeMonads}`M1` 和 {anchorName SomeMonads}`M2` 的定义来看出。
{anchorTerm M1eval}`M1 α` 展开为 {anchorTerm M1eval}`LetterCounts → Except Err (α × LetterCounts)`，而 {anchorTerm M2eval}`M2 α` 展开为 {anchorTerm M2eval}`LetterCounts → Except Err α × LetterCounts`。
也就是说，{anchorTerm M1eval}`M1 α` 描述的是接受初始字母计数、返回错误或 {anchorName M1eval}`α` 与更新后计数之配对的函数。
在 {anchorName M1eval}`M1` 中抛出异常时，没有最终状态。
{anchorTerm M2eval}`M2 α` 描述的是接受初始字母计数、返回新的字母计数与错误或 {anchorName M2eval}`α` 之配对的函数。
在 {anchorName M2eval}`M2` 中抛出异常时，异常会伴随一个状态。

# 交换单子
%%%
tag := "commuting-monads"
%%%

在函数式编程的术语中，如果两个单子变换器可以重新排序而不改变程序的含义，则称它们_交换_。
当 {anchorName SomeMonads}`StateT` 和 {anchorName SomeMonads}`ExceptT` 被重新排序时程序的结果可能不同，这一事实意味着状态和异常不交换。
一般而言，不应期望单子变换器会交换。

尽管并非所有单子变换器都交换，但有些会。
例如，两次使用 {anchorName SomeMonads}`StateT` 可以重新排序。
在 {anchorTerm StateTDoubleA}`StateT σ (StateT σ' Id) α` 中展开定义，得到的类型是 {anchorTerm StateTDoubleA}`σ → σ' → ((α × σ) × σ')`，而 {anchorTerm StateTDoubleB}`StateT σ' (StateT σ Id) α` 得到的是 {anchorTerm StateTDoubleB}`σ' → σ → ((α × σ') × σ)`。
换句话说，它们之间的差异在于，它们在返回类型中以不同的方式嵌套 {anchorName StateTDoubleA}`σ` 和 {anchorName StateTDoubleA}`σ'` 类型，并且以不同的顺序接受参数。
任何客户端代码仍然需要提供相同的输入，并且仍然会收到相同的输出。

大多数同时具有可变状态和异常的编程语言都像 {anchorName SomeMonads}`M2` 那样工作。
在这些语言中，_应当_在抛出异常时回滚的状态很难表达，通常需要以很像 {anchorName SomeMonads}`M1` 中显式传递状态值的方式来模拟。
单子变换器赋予了为手头问题选择适用的效应排序解释的自由，两种选择都同样易于编程。
但它们也要求在变换器顺序的选择上保持谨慎。
强大的表达能力伴随着责任：要检查所表达的内容是否就是所意图的内容，而 {anchorName countWithFallback}`countWithFallback` 的类型签名可能过于多态了。


# 练习
%%%
tag := "monad-transformer-order-exercises"
%%%

 * 通过展开定义并推理所得类型，验证 {anchorName m}`ReaderT` 和 {anchorName SomeMonads}`StateT` 交换。
 * {anchorName m}`ReaderT` 和 {anchorName SomeMonads}`ExceptT` 交换吗？通过展开定义并推理所得类型来检验你的答案。
 * 基于 {anchorName Many (module:=Examples.Monads.Many)}`Many` 的定义构造单子变换器 {lit}`ManyT`，并提供合适的 {anchorName AlternativeOptionT}`Alternative` 实例。验证它满足 {anchorName AlternativeOptionT}`Monad` 约定。
 * {lit}`ManyT` 与 {anchorName SomeMonads}`StateT` 交换吗？如果交换，通过展开定义并推理所得类型来检验你的答案。如果不交换，分别在 {lit}`ManyT (StateT σ Id)` 和 {lit}`StateT σ (ManyT Id)` 中编写一个程序。每个程序都应是更适合给定单子变换器顺序的那种。