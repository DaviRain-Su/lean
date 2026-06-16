# 显示公理依赖

> 对应英文：[Displaying Axiom Dependencies](https://lean-lang.org/doc/reference/latest/Axioms/#The-Lean-Language-Reference--Axioms--Displaying-Axiom-Dependencies)，抓取日期：2026-06-16。

Lean 提供 `#print axioms` 来显示某个声明**传递依赖**的所有公理。

## 基本用法

```lean
#print axioms name
```

这里的 `name` 应是一个已定义的标识符。输出会列出：

- 该声明直接使用的公理
- 它调用的其他 proof / definition 进一步依赖的公理

因此它反映的是**整条依赖链**，而不只是当前文件里肉眼能看到的公理。

## 典型用途

- 审计某个 theorem 是否依赖 `sorryAx`
- 检查是否用了自定义 axiom
- 识别是否出现 `Lean.trustCompiler`
- 对比两个证明的可信边界

## 示例

若某定义中用了 `sorry`：

```lean
def lazy : 4 == 2 + 1 + 1 := by
  sorry
```

那么：

```lean
#print axioms lazy
```

会报告它依赖 `sorryAx`。

## 与 `#guard_msgs` 的配合

这个命令还能和 `#guard_msgs` 一起使用，把“某个声明依赖哪些 axiom”写进测试中。这样未来若依赖变化，就能在 CI 或本地测试里立刻发现。

## 使用建议

- 高可信度 proof 交付前，优先跑一遍 `#print axioms`。
- 库维护中，可把关键 theorem 的 axiom 依赖检查纳入测试。
- 调试“为什么这个 theorem 不够纯净”时，`#print axioms` 往往是第一步。