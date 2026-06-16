# 导出名称

> 对应英文：[Exporting Names](https://lean-lang.org/doc/reference/latest/Namespaces-and-Sections/#The-Lean-Language-Reference--Namespaces-and-Sections--Namespaces--Exporting-Names)，抓取日期：2026-06-16。

`export` 把其他 namespace 中的名称放进当前 namespace，就像它们是在当前 namespace 里声明的一样。

## 基本形式

```lean
export Some.Namespace (foo bar)
```

这会把 `foo`、`bar` 作为当前 namespace 中可见的别名导出。

## 与普通定义不同

导出的名称不是一个新定义，而是**透明别名**：

- 从 kernel 视角看，真正存在的仍只有原始名称；
- elaborator 在解析 identifier 时，会把导出名解析回原始目标。

因此 export 更像“名字级转发”，而不是重新定义。

## 导出到 root namespace

若在 root namespace 中导出某名称，它以后就可以无前缀直接使用。Lean 标准库会用这种方式导出一些常用名字，例如 `Option` 的构造子和某些关键 type class 方法。

## 与 `open` 的关系

当当前 namespace 被 `open` 时，导出的名称也会一起进入作用域。

因此 export 不只是“现在能叫这个名字”，还会影响未来其他文件在 `open` 当前 namespace 时看到的 API 形状。

## 使用建议

- 想对外重新整理 API、但不想复制定义时，用 `export`。
- 导出到 root namespace 要格外谨慎，因为它会永久增加全局无前缀名字。
- 若只是当前文件临时方便引用，不要用 `export`，用 `open` 更合适。