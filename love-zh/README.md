# 逻辑验证漫游指南（LoVe 2026）中文版

同步自 [Lean-zh/LoVe-zh](https://github.com/Lean-zh/LoVe-zh)，对应 [The Hitchhiker's Guide to Logical Verification (2025/2026)](https://github.com/lean-forward/logical_verification_2025)。

## 内容来源

| 部分 | 来源 |
|------|------|
| 第 1–8 章 Markdown | `pdf/逻辑验证漫游指南-2026-桌面版.pdf` → `scripts/extract-from-pdf.mjs` |
| 第 9–14 章 Markdown | 对照 `pdf/hitchhikers_guide_2025_en.pdf` 翻译并润色（`node scripts/proofread-compare.mjs` 比对节结构；中文 PDF 第三、四部分待发布） |
| 英文 PDF 参考 | `pdf/hitchhikers_guide_2025_en.pdf`；`node scripts/extract-from-pdf.mjs --english` 可提取英文原文 |
| Lean 练习 | `lean/` 目录（与 Lean-zh 同步） |

## 重新生成章节 Markdown

```bash
# 将 PDF 放在 pdf/ 目录
node scripts/extract-from-pdf.mjs
```

## 练习

```bash
# 在 VS Code 中打开 lean/ 作为 Lean 4 项目
```

## 校对说明

PDF 提取的文本缺少代码块高亮，页眉页脚已尽量剔除，**仍需人工校对**公式与 Lean 代码片段。