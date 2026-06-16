# 语义高亮

> 对应英文：[Semantic Highlighting](https://lean-lang.org/documentation/semantic-tokens/)，抓取日期：2026-06-16。

Lean language server 会向编辑器提供 semantic highlighting 信息。若要在 VS Code 中使用它，你可能需要在设置中启用 **Editor > Semantic Highlighting**。对应的 `settings.json` 配置是：

```json
"editor.semanticHighlighting.enabled": true
```

该选项的默认行为是交给当前颜色主题决定是否启用语义高亮。例如 VS Code 默认主题 `Dark+` 和 `Light+` 会启用语义高亮。

不过，如果你的颜色主题没有区分足够多的语法类别，或者区分得太细微，语义高亮仍可能不够明显。例如默认 `Light+` 主题使用 `#001080` 显示变量，这和默认文本颜色 `#000000` 非常接近，因此很容易漏看意外使用的自动绑定隐式参数（auto bound implicit arguments）。例如：

```lean
def my_id (n : nat) := n
```

Lean 可能把它解释为：

```lean
variable (nat : Sort u_1) (n : nat)
```

这里 `nat` 也许是拼写错误，原本想写的是 `Nat`。如果你的颜色主题足够好，就能看出 `n` 和 `nat` 颜色相同，因为二者都被 semantic highlighting 标记为变量。若写成 `(n : Nat)`，则 `n` 保持变量颜色，而 `Nat` 使用默认文本颜色。

## 自定义 semantic token 颜色

如果你使用的主题不适合 Lean，可以修改 **Semantic Token Color Customizations**。这个设置不能直接在偏好设置对话框中完成，但可以点击 **Edit in settings.json** 直接编辑设置文件。注意：必须像保存普通文件一样保存 `settings.json`，修改才会影响其他标签页或 VS Code 窗口。

可以在主配置对象中添加类似配置：

```json
"editor.semanticTokenColorCustomizations": {
  "[Default Light+]": {
    "rules": {
      "function": "#ff0000",
      "property": "#00ff00",
      "variable": "#ff00ff"
    }
  }
}
```

这个示例中的颜色不是为了好看，而是为了测试时容易在文件中看出来。实际使用时，请把 `Default Light+` 替换为你的主题名称；如果你使用多个主题，也可以分别定制。VS Code 会在 HTML 颜色值旁边显示小色块，悬停在颜色值上会打开颜色选择器。

## 查看 token 分类

若要理解上例中的 `function`、`property` 和 `variable` 具体指什么，最直接的方法是打开一个 Lean 文件，让 VS Code 告诉你文件中各部分的分类。

打开命令面板：

- Windows/Linux：`Ctrl+Shift+P`
- macOS：`⌘+Shift+P`

搜索 **Inspect Editor Tokens and Scopes**（通常输入 `tokens` 就能找到）。然后点击文件中的任意单词，查看显示信息中是否有 `semantic token type` 行。