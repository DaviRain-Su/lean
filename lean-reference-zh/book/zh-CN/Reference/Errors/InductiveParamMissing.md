# inductiveParamMissing

> 对应英文：[About: inductiveParamMissing](https://lean-lang.org/doc/reference/latest/Error-Explanations/About___--inductiveParamMissing/)，抓取日期：2026-06-16。

错误码：`lean.inductiveParamMissing`

含义：constructor 中出现 inductive type 时缺少参数。

严重性：Error。起始版本：4.22.0。

这个错误发生在 inductive type constructor 在某个 constructor type 中被部分应用，导致一个或多个 parameter 被省略。elaborator 要求：在当前 inductive definition 内部，任何引用该 inductive type 的位置都必须显式给出所有 parameter，包括 constructor type 中的引用。

如果确实需要部分应用 type constructor，而不指定某个参数，那么该参数不能是 parameter，必须改成 index。

## 常见场景

在高阶 predicate 的参数中传递当前 inductive predicate 时，可能需要部分应用当前 type constructor。若某个参数被声明在冒号左侧，它就必须始终给出；省略它会报这个错误。

## 修复方向

- 检查报错位置中当前 inductive type 的应用是否缺少 parameter。
- 如果缺少的是固定参数，补上它。
- 如果缺少的是需要稍后才提供的值，把它从 parameter 改成 index。

与 `inductiveParamMismatch` 一样，核心判断是：这个量是否必须在整个 inductive declaration 中固定不变。固定不变才是 parameter；需要变化或部分应用时省略的应是 index。
