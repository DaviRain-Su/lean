# Metaprogramming in Lean 4（中文版）

本仓库同步自 [Lean-zh/mp-lean-zh](https://github.com/Lean-zh/mp-lean-zh)，是 [Metaprogramming in Lean 4](https://leanprover-community.github.io/lean4-metaprogramming-book/) 的中文译本，纳入 [lean](../) monorepo 供学习工作台阅读。

**作者（英文原书）**：Arthur Paulino, Damiano Testa, Edward Ayers, Evgenia Karunus, Henrik Böving, Jannis Limperg, Siddhartha Gadgil, Siddharth Bhat  

**译者**： [subfish_zhou](https://github.com/subfish-zhou)

## 项目结构

```
mp-lean-zh/
├── lean/                  # 中文 Lean 源（mdgen 输入，与 Lean-zh 同步）
├── book/zh-CN/            # 导出 Markdown + INDEX.md（学习站阅读）
├── scripts/
│   ├── mdgen-lite.mjs     # Node 版 mdgen（macOS 上 lake mdgen 不可用时的替代）
│   └── sync-md.mjs        # 重新生成 book/zh-CN/*.md
├── lakefile.lean          # 上游 Lake 配置（可选：lake run mdbuild）
└── book.toml              # mdBook 配置（Lean-zh 建站用）
```

## 重新生成 Markdown

```bash
cd mp-lean-zh
node scripts/sync-md.mjs
```

在 Linux/CI 上也可使用官方工具链：

```bash
lake run mdbuild   # 输出到 md/，再复制到 book/zh-CN/
```

## 修改译文

请编辑 `lean/` 下的 `.lean` 文件（勿直接改生成的 `.md`）。Lean-zh 约定：代码块内避免 `/- ... -/` 块注释，说明用 `--` 单行注释。

## 与 Lean-zh 同步

从上游拉取更新：

```bash
git remote add lean-zh https://github.com/Lean-zh/mp-lean-zh.git  # 首次
git fetch lean-zh master
git checkout lean-zh/master -- lean/ md/SUMMARY.md lakefile.lean lean-toolchain lake-manifest.json
node scripts/sync-md.mjs
```

## 在线阅读

- Lean-zh mdBook：[leanprover.cn/mp-lean-zh](https://leanprover.cn/mp-lean-zh/)
- 本 monorepo 学习工作台：`lean_learning_site/books/reader.html?book=mp-lean`