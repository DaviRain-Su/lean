# Lean 4 类型检查（中文版）

同步自 [Lean-zh/type-checking-in-lean-zh](https://github.com/Lean-zh/type-checking-in-lean-zh)。

原书为 Lean 社区关于内核与类型检查的 mdBook，说明可信代码基、表达式、声明与类型推断等。

## 阅读

从 [book/zh-CN/INDEX.md](book/zh-CN/INDEX.md) 开始。

## 更新

```bash
git fetch lean-zh master
git checkout lean-zh/master -- src/
rsync -a --exclude SUMMARY.md src/ book/zh-CN/
```