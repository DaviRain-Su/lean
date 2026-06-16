# 惰性计算

> 对应英文：[Lazy Computations](https://lean-lang.org/doc/reference/latest/Basic-Types/Lazy-Computations/)，抓取日期：2026-06-16。

`Thunk α` 用于延迟计算某个值。只有在显式请求时，它才真正执行；一旦计算完成，结果会被缓存，之后再次请求不会重复计算。这种“最多算一次、按需计算”的策略就是惰性求值（lazy evaluation / call-by-need）。

## 逻辑模型

从 Lean 逻辑角度看，`Thunk α` 等价于一个 `Unit → α` 的函数包装：

```lean
structure Thunk (α : Type u) where
  fn : Unit → α
```

不过字段本身对普通用户是私有的；逻辑上虽然等价于函数，但实际应通过 `Thunk.get` 访问。

## 运行时表示

Lean runtime 对 `Thunk` 有专门支持。其对象大致包含两部分：

- `m_value`：已计算出的缓存值（若尚未计算则为空）
- `m_closure`：尚未执行的 closure

运行时维持一个关键不变式：二者至多一个非空。强制 thunk 时：

1. 若已有缓存值，直接返回；
2. 否则尝试获取 closure 锁；
3. 若成功，则执行 closure、缓存结果、释放 closure；
4. 若失败，则说明另一线程正在计算，当前线程等待结果完成。

## coercion

Lean 提供从任意 `α` 到 `Thunk α` 的 coercion。也就是说，表达式 `e` 在需要 `Thunk α` 的地方，可自动被解释为：

```lean
Thunk.mk (fun () => e)
```

注意：这与 `Thunk.pure` 不同。coercion 会真正延迟原表达式 `e` 的求值；而 `Thunk.pure` 接收的值已经是现成值，不再带来惰性。

## 常见 API

- `get`：强制并取得结果。
- `map`：在 thunk 结果上应用函数，并把新结果继续做成 thunk。
- `pure`：把一个已计算完成的值放进 thunk。
- `bind`：用前一个 thunk 的结果生成后一个 thunk。

## 使用建议

- 需要昂贵计算“也许不会被用到”时，用 `Thunk`。
- 若希望结果只算一次并缓存，`Thunk` 很合适；若希望每次都重新运行，应直接用函数 `Unit → α`。
- 在并发环境中，`Thunk` 的运行时支持可避免重复求值，但仍要清楚其强制时点和潜在等待行为。