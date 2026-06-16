# 在 LaTeX 中高亮 Lean 代码

> 对应英文：[Syntax Highlighting Lean in LaTeX](https://lean-lang.org/documentation/latex-syntax-highlighting/)，抓取日期：2026-06-16。

你可以直接从 VS Code 复制已经高亮的 Lean 代码，粘贴到任何支持 HTML 输入的富文本编辑器中。

如果要在 LaTeX 中高亮 Lean 代码，主要有两种选择：

- `listings`：常见、易配置，但可能会遇到 `listings` 和 LaTeX 对 Unicode 支持的限制。
- `minted`：封装 Pygments 语法高亮库的 LaTeX 包。配置步骤稍多，但搭配 XeLaTeX 或 LuaLaTeX 时可不受限制地支持 Unicode。

## 使用 `listings`

把 `lstlean.tex` 保存到同一目录，或保存到 `TEXINPUTS` 路径中，然后准备如下测试文件：

```tex
\documentclass{article}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{listings}
\usepackage{amssymb}

\usepackage{color}
\definecolor{keywordcolor}{rgb}{0.7, 0.1, 0.1}   % red
\definecolor{tacticcolor}{rgb}{0.0, 0.1, 0.6}    % blue
\definecolor{commentcolor}{rgb}{0.4, 0.4, 0.4}   % grey
\definecolor{symbolcolor}{rgb}{0.0, 0.1, 0.6}    % blue
\definecolor{sortcolor}{rgb}{0.1, 0.5, 0.1}      % green
\definecolor{attributecolor}{rgb}{0.7, 0.1, 0.1} % red

\def\lstlanguagefiles{lstlean.tex}
\lstset{language=lean}

\begin{document}
\begin{lstlisting}
theorem funext {f₁ f₂ : ∀ (x : α), β x} (h : ∀ x, f₁ x = f₂) : f₁ = f₂ := by
  show extfunApp (Quotient.mk f₁) = extfunApp (Quotient.mk f₂)
  apply congrArg
  apply Quotient.sound
  exact h
\end{lstlisting}
\end{document}
```

用以下命令编译：

```bash
pdflatex test.tex
```

对于较旧的 LaTeX 版本，可能需要在 `inputenc` 中使用 `[utf8x]` 而不是 `[utf8]`。

## 使用 `minted`

首先安装 Pygments（版本 2.18 或更新）。然后把下面的示例 LaTeX 文件保存为 `test.tex`：

```tex
\documentclass{article}
\usepackage{fontspec}
% switch to a monospace font supporting more Unicode characters
\setmonofont{FreeMono}
\usepackage{minted}
\newmintinline[lean]{lean4}{bgcolor=white}
\newminted[leancode]{lean4}{fontsize=\footnotesize}
\usemintedstyle{tango}  % a nice, colorful theme

\begin{document}
\begin{leancode}
theorem funext {f₁ f₂ : ∀ (x : α), β x} (h : ∀ x, f₁ x = f₂) : f₁ = f₂ := by
  show extfunApp (Quotient.mk' f₁) = extfunApp (Quotient.mk' f₂)
  apply congrArg
  apply Quotient.sound
  exact h
\end{leancode}
\end{document}
```

然后执行：

```bash
xelatex --shell-escape test.tex
```

注意：

- 需要使用 `xelatex` 或 `lualatex` 来处理代码中的 Unicode 字符。
- `--shell-escape` 是必需的，因为它允许 `xelatex` 在 shell 中执行 `pygmentize`。
- 如果没有安装 `FreeMono`，可以尝试直接写入其他字体名；`xelatex` 会使用操作系统字体。
- 如果所选等宽字体缺少某些 Unicode 符号，可以把这些符号指定给 fallback 字体或其他 LaTeX 替代代码。

例如：

```tex
\usepackage{newunicodechar}
\newfontfamily{\freeserif}{DejaVu Sans}
\newunicodechar{✝}{\freeserif{✝}}
\newunicodechar{𝓞}{\ensuremath{\mathcal{O}}}
```

如果你使用的是旧版 Pygments，可以把 `lean.py` 复制到工作目录，并使用 `lean4.py:Lean4Lexer -x` 代替上面的 `lean4`。如果你的 `minted` 版本是 2.7 或更新、但早于 3.0，还需要采用英文原页链接到的 workaround。