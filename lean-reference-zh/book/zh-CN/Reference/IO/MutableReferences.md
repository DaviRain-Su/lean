# 可变引用

> 对应英文：[Mutable References](https://lean-lang.org/doc/reference/latest/IO/Mutable-References/)，抓取日期：2026-06-16。

普通 state monad 用 tuple 显式传递状态，而 Lean runtime 也提供真正由可变内存单元支持的 mutable reference。它们的类型是 `IO.Ref α`，强调“这里有一个可变 cell，读写必须显式进行”。

`IO.Ref` 通过 `ST.Ref` 实现，因此大部分 `ST.Ref` API 也可以直接用于 `IO.Ref`。

## `IO.Ref`

- `IO.Ref α`：在 `IO` monad 中可读写的可变引用单元。
- `IO.mkRef a`：创建一个新引用，初始值为 `a`。

与纯函数式状态不同，`IO.Ref` 通过共享可变单元表达状态更新。

## ST：受限的可变状态

当不希望引入任意副作用，而只想使用可变状态时，可以用 `ST`。

- `ST σ α`：只允许可变状态这一类副作用。
- `runST`：运行 `ST` 计算，并防止 mutable reference 泄漏到外部。
- `EST ε σ α` / `runEST`：允许可变状态与异常。

`ST` 的关键性质是：如果所有 mutable reference 都在本次执行中创建，并且没有泄漏到外部，那么求值结果是确定的。

## 常用读写操作

`ST.Ref` / `IO.Ref` 常用操作包括：

- `get`：读取当前值。
- `set`：写入新值。
- `modify`：原子地用函数更新值。
- `modifyGet`：更新值的同时返回额外结果。
- `swap`：替换当前值并返回旧值。

`modify` 和 `modifyGet` 尤其适合避免“先读后写”模式中的 data race。

## 比较与别名

`ptrEq` 用于判断两个引用是否实际上指向同一个底层 cell。两个不同 `mkRef` 创建出来的引用，即使内容相同，也不是同一个 cell；而同一 cell 的别名，修改其一会影响其二。

## ST-backed state monad

`ST.Ref.toMonadStateOf` 可从某个引用生成 `MonadStateOf` instance。这样可以让“按 state monad API 编写的代码”在底层用 mutable reference 执行，从而获得更好的性能或更自然的实现。

## 并发语义

可变引用还可用作低层锁机制。`take` 会读取并“拿走”引用中的值，使后续尝试读取或再次 `take` 的线程阻塞，直到有新值通过 `set` 写回。这个机制较底层，通常更建议使用高层同步抽象。