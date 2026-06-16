# Iterator

> 对应英文：[Iterators](https://lean-lang.org/doc/reference/latest/Iterators/)，抓取日期：2026-06-16。

iterator 为某个数据源中的每个元素提供顺序访问。典型 iterator 允许逐个访问 collection 中的元素，例如 list、array 或 `TreeMap`；但 iterator 也可以通过执行某种 monadic effect 来提供数据，例如读取文件。

iterator 为这些操作提供共同接口。面向 iterator API 编写的代码可以不关心数据来自哪里。

## 内部状态

每个 iterator 都维护内部状态，使它能确定下一个值。因为 Lean 是纯函数式语言，消费 iterator 不会使原 iterator 失效，而是产生一个带更新状态的副本。和往常一样，reference counting 会把只使用一次的值优化为 destructive update 风格的程序。

要使用 iterator，需要导入：

```lean
import Std.Data.Iterators
```

## 为什么使用 iterator

iterator 可以避免为中间结果构造临时 collection。例如，把一个 array 映射、过滤、再折叠时，如果每一步都产生完整中间 array，会分配额外内存。iterator combinator 可以把这些步骤组合起来，只在最终 consumer 请求数据时计算足够多的元素。

iterator 也让不同 collection 的遍历接口统一。只要某个数据源能产生 iterator，消费端就可以用同一套 combinator 和 consumer 处理它。

## Producer、consumer 与 combinator

Lean 标准库提供三类 iterator operation。

### Producer

producer 从某个数据源创建新的 iterator。它们决定 iterator 会返回哪些数据，以及这些数据如何计算，但不控制计算何时发生。

按照约定，collection type `Coll` 会提供函数 `Coll.iter`，返回遍历 collection 元素的 iterator。例如：

- `List.iter`
- `Array.iter`
- `TreeMap.iter`

其他内建 type，例如 range，也按同一约定支持 iteration。

### Consumer

consumer 为某个目的使用 iterator 中的数据。consumer 请求 iterator 的数据，而 iterator 只计算足够满足请求的数据。常见 consumer 包括 fold、collect、search、count 等。

### Combinator

combinator 既是 consumer 又是 producer：它从已有 iterator 创建新的 iterator。例如：

- `Iter.map`
- `Iter.filter`

得到的新 iterator 会通过消费底层 iterator 来产生数据；它不会立即遍历底层 collection，而是在自身被消费时才进行实际迭代。

## 推理与运行时

iterator API 既要支持高效运行，也要支持对程序行为进行推理。运行时方面，reference counting 和延迟消费有助于避免中间结构。证明方面，需要理解 iterator 的 producer、consumer、combinator 如何组合，以及它们如何保持顺序访问语义。

## 后续小节

英文参考手册随后把本章展开为：

- 22.1 Run-Time Considerations
- 22.2 Iterator Definitions
- 22.3 Consuming Iterators
- 22.4 Iterator Combinators
- 22.5 Reasoning About Iterators