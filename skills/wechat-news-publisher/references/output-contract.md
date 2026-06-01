# 输出契约

本技能的产物、目录和依赖固定如下。

## 固定路径

标准落地路径固定为：

- `{output_dir}/source.md`
- `{output_dir}/final.html`
- `{output_dir}/scover.png`

规则：

- 直接写入用户给定目录。
- 不创建额外子目录。
- `scover.png` 为固定文件名。

## 固定产物

- `source.md`：唯一源件。
- `final.html`：只由 `source.md` 正文生成的固定版式 HTML。
- `scover.png`：由模型生成、并受 `assets/cover-layout-reference.png` 约束的固定版式封面图。

## `source.md` 契约

固定结构：

```md
---
title: "..."
summary: "..."
cover_prompt: "..."
---

# {title}

{summary}

> {固定结论块}

{markdown 正文}
```

约束：

- frontmatter 只允许 `title`、`summary`、`cover_prompt`。
- 正文是唯一 `正文基准`。
- 正文 `# 标题` 必须与 frontmatter `title` 完全一致。
- 正文首段必须与 frontmatter `summary` 完全一致。
- 正文在首个 `##` 前必须包含固定结论块。
- 正文必须包含分类结构、新闻正文和原始链接索引。
- 正文分类优先使用固定四字标签。
- 固定结论块控制在 `1-2` 句。
- 单条新闻正文默认压缩为 `2-3` 句客观事实，不补背景长文、趋势推演或评论性扩写。

## 单向依赖

- `新闻简报 -> source.md`
- `source.md 正文 -> final.html`
- `source.md(title, summary, cover_prompt, 正文结构) + assets/cover-layout-reference.png -> scover.png`

禁止关系：

- `source.md` frontmatter -> `final.html`
- `source.md` frontmatter -> 正文自动补全
- `final.html` -> `scover.png`
- `scover.png` -> `final.html`

## 不可漂移项

- 文件名不可改。
- 目录层级不可改。
- `final.html` 只能由正文生成。
- `scover.png` 必须使用参考图约束的模型生成。
- `assets/cover-layout-reference.png` 既是唯一参考图，也是唯一版式锚点。
- 未请求封面图时，不生成 `scover.png`。
