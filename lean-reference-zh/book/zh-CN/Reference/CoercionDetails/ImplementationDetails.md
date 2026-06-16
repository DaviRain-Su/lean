# coercion 的实现细节

> 对应英文：[Implementation Details](https://lean-lang.org/doc/reference/latest/Coercions/Implementation-Details/)，抓取日期：2026-06-16。

普通 coercion 插入会使用链式搜索；而到 sort 的 coercion、到函数的 coercion，以及 dependent coercion，都不参与这一链式拼接。它们各自有更专门的插入路径。

## unfolding coercion

Lean 在插入 coercion 后，会尽量把 `Coe.coe` 等包装展开掉。这样做的目的有两个：

- 最终生成的 term 更易读；
- coercion 可通过函数包装精确控制被 coercion 项的求值方式。

这种展开由内部 attribute `coe_decl` 控制。对普通用户而言，这属于 coercion 系统内部实现，而不是公共 API。

## chaining 的内部结构

用户通常只接触：

- `Coe`
- `CoeDep`
- `CoeSort`
- `CoeFun`

但为了实现普通 coercion 链，Lean 内部还使用几层辅助 type class：

- `CoeTC`
- `CoeOTC`
- `CoeHTC`
- `CoeHTCT`

它们分别对应不同阶段的链闭包。

### `CoeTC`

表示 `Coe*` 的传递闭包。

### `CoeOTC`

表示 `CoeOut*` 后接 `CoeTC`。

### `CoeHTC`

表示可选 `CoeHead` 后接 `CoeOTC`。

### `CoeHTCT`

表示 `CoeHTC` 后再接可选 `CoeTail`；也就是“完整普通 coercion 链”的内部实现层。

最终 `CoeT` 则表示：

- 要么是一条 `CoeHTCT` 链；
- 要么是单个 `CoeDep`。

## 为什么用户不应直接实现这些辅助类

这些类主要用于精确编码链式搜索顺序和方向。直接手写它们：

- 很容易破坏预期链规则；
- 难以维护；
- 会把内部实现细节泄漏到库接口中。

普通库设计应优先实现高层接口：`Coe` / `CoeDep` / `CoeSort` / `CoeFun`。

## 调试价值

虽然不该直接写这些类，但知道它们存在很有帮助。若某条 coercion 没按预期插入，问题常见于：

- 走的是错误方向（应 `CoeOut` 却写成 `Coe`，反之亦然）；
- 你以为会链起来，其实场景属于 `CoeDep` / `CoeFun` / `CoeSort`，不会链；
- 目标不在普通值到值 coercion 范围内。

## 使用建议

- 面向用户的库 API，优先站在“高层 coercion 语义”设计，不要暴露内部辅助类。
- 真正调试复杂 coercion 链问题时，再把这些辅助类当作实现诊断工具来理解。