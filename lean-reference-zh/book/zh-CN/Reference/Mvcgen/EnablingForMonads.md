# 为 monad 启用 `mvcgen`

> 对应英文：[Enabling mvcgen For Monads](https://lean-lang.org/doc/reference/latest/The--mvcgen--tactic/Enabling--mvcgen--For-Monads/)，抓取日期：2026-06-16。

若一个 monad 是用 Lean 标准库已有的 monad transformer（如 `ExceptT`、`StateT`）实现的，通常不需要额外实例；其他 monad 则通常需要提供：

- `WP`
- `LawfulMonad`
- `WPMonad`

## 基本目标

`mvcgen` 主要支持“单线程控制流 + 可中断状态”这一类普通命令式程序 effect。更奇特的 effect 目前并非重点支持对象。

## adequacy lemma

提供完基础实例后，下一步通常是证明 adequacy lemma：它说明某个 monad 的 weakest precondition 语义，确实足以推出所期望的实际谓词结论。

## primitive operator 与 spec lemma

具体 monad 往往还带有一组 primitive operator。为了让 `mvcgen` 正常工作，这些 operator 通常都需要 specification lemma。

理想情况下，spec lemma 应直接以 predicate transformer 风格描述 operator，而不是只给出某种前后状态关系。因为前者更方便自动化把“当前 postcondition”精确传递给下一步。

## 设计建议

- 可把内部状态细节私有化，仅暴露一组 carefully designed assertion operator；
- 为每个 primitive operator 补 spec lemma；
- 优先写“precondition 作为 postcondition 的函数”的规格，而不是只写宽泛关系式。
