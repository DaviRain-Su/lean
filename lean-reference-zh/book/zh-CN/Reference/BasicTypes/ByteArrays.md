# 字节数组

> 对应英文：[Byte Arrays](https://lean-lang.org/doc/reference/latest/Basic-Types/Byte-Arrays/)，抓取日期：2026-06-16。

`ByteArray` 是专门保存 `UInt8` 的高效数组类型。由于元素类型固定为字节，它比 `Array UInt8` 拥有更紧凑、更高效的运行时表示。

## 逻辑模型

逻辑上：

```lean
structure ByteArray where
  data : Array UInt8
```

也就是说，它可以看作 `Array UInt8` 的打包版本；但转换在运行时通常是线性代价。

## 运行时表示

编译后，`ByteArray` 是紧凑的 packed byte buffer：

- 无需每个元素一个指针间接；
- 修改操作会先检查引用计数；
- 若无其他引用，可原地修改。

这使它特别适合：

- 二进制协议
- 文件/网络字节流
- UTF-8 处理
- 编码/解码

## 构造与大小

常见 API：

- `empty`
- `emptyWithCapacity`
- `append`
- `fastAppend`
- `copySlice`
- `size`
- `usize`
- `isEmpty`

## 查找与修改

### 查找

- `get`
- `uget`
- `get!`
- `extract`

### 修改

- `push`
- `set`
- `uset`
- `set!`

与 `Array` 类似，很多更新操作在“唯一引用”场景下会退化为高效原地更新。

## 转换

- `toList`
- `toUInt64BE!`
- `toUInt64LE!`

### UTF-8 相关

- `utf8Decode?`
- `utf8DecodeChar?`
- `utf8DecodeChar`

这让 `ByteArray` 成为字符串/文本底层处理的重要桥梁。

## 迭代与切片

英文页还给出：

- `foldl` / `foldlM` / `forIn`
- `iter`
- `ByteArray.Iterator`
- `toByteSlice`
- `ByteSlice`

以及围绕 `ByteSlice` 的查找、转换和谓词 API。

## 使用建议

- 二进制数据首选 `ByteArray`，而不是普通 `List UInt8`。
- 若要频繁和字符串互转，要注意 UTF-8 decode/encode 的边界条件。
- 若只需要顺序扫描，不必急着转成 `List` 或 `Array`；优先保留在 `ByteArray` / iterator 形态。