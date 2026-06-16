# 名称

内核的第一个原始类型是 `Name`。正如名字所示，`Name` 为内核中的项目提供了一种寻址方式。

```
Name ::= anonymous | str Name String | num Name Nat
```

类型 `Name` 的元素会以点号分隔的形式显示，这种表示方式 Lean 用户应该非常熟悉。例如 `num (str (anonymous) "foo") 7` 显示为：`foo.7`。

# 实现细节

在实现层面上，名称的实现假定使用 UTF-8 字符串，其中字符表示为 Unicode 标量值。语言对字符串类型的假设对于实现字符串字面量的内核扩展同样至关重要。

关于名称的词法结构（lexical structure），更多信息可见[此处](https://github.com/leanprover/lean4/blob/504b6dc93f46785ccddb8c5ff4a8df5be513d887/doc/lexical_structure.md?plain=1#L40)。

导出器不会显式地输出匿名名称，而是默认将其视作导入名称序列中的第 0 个元素。
