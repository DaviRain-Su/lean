# predicate transformer

> 对应英文：[Predicate Transformers](https://lean-lang.org/doc/reference/latest/The--mvcgen--tactic/Predicate-Transformers/)，抓取日期：2026-06-16。

predicate transformer semantics 把程序解释为“谓词到谓词的函数”，而不是“值到值的函数”。

- **postcondition**：程序运行后应满足的断言；
- **precondition**：为了保证该 postcondition，在运行前必须满足的断言。

`mvcgen` 采用 weakest precondition 风格：从给定 postcondition 出发，反推出确保它成立的最弱 precondition。

## SPred

`SPred` 是“带状态的谓词”类型。它按一组状态分量类型参数化，因此可表达会引用程序状态的断言。普通 proposition 可通过 `⌜P⌝` 嵌入 `SPred`。

## entailment 与逻辑连接词

stateful predicate 之间有 entailment 关系：

- `P ⊢ₛ Q`：`P` 蕴含 `Q`；
- `P ⊣⊢ₛ Q`：双向蕴含。

此外还提供内部连接词与量词，用来书写 stateful logic。

## Assertion 与 PostCond

在具体 monad 上，`Assertion` 表示“对该 monad 状态的断言”；`PostCond` 则把“返回值的后置条件”和“异常分支的后置条件”组合起来。

## PredTrans 与 WP

- `PredTrans`：谓词变换器；
- `WP`：把某个 monad 解释为 weakest precondition 语义所需的核心 type class。

此外还有：

- `WPMonad`
- adequacy lemma
- Hoare triple 语法
- `spec` lemma
- `Invariant`

这些一起构成 `mvcgen` 的理论基础。

## 使用建议

- 使用 `mvcgen` 前，先接受“程序 = predicate transformer”的视角；
- 写 specification lemma 时，最好把 postcondition 保持自由，方便自动化实例化；
- 若需要 monad-polymorphic 证明，尽早理解 `SPred` / `Assertion` / `PostCond` / `WP` 之间的关系。
