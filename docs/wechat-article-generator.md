# 微信公众号文章生成器 使用手册

## 技能概述

**技能名称**：微信公众号文章生成器

**标识**：`wechat-article-generator`

**版本**：1.5.0

**功能**：将主题、素材、草稿或 Markdown 先整理为可审阅的四段式公众号发布源稿（标题、摘要、封面提示词、正文），确认后按内置多主题生成微信兼容内联样式 HTML。

---

## 快速开始

### 基本用法

直接描述你的任务需求即可触发该技能，例如：

```text
帮我把这篇文章整理成公众号格式，先给我看标题和摘要
```

```text
把这段要点整理成公众号文章，用原生微信风格
```

```text
导出这篇公众号文章的 source.md 和 final.html，用论文主题
```

---

## 功能特性

### 支持的能力

| 能力 | 说明 |
|------|------|
| 四段式发布源稿整理 | 从任意形式输入中提取并生成标题（≤64字）、摘要（≤120字）、封面提示词和标准正文 Markdown |
| 内容忠实整理 | 默认采用"忠实排版整理"模式，只做结构重排和断句，不擅自改写事实、数据、引用和立场 |
| 多主题 HTML 渲染 | 内置 9 个主题（微信原生、论文、Apple、Claude Code、Codex、飞书、掘金、Notion、Obsidian），输出微信兼容内联样式 HTML |
| 对话优先，不产生中间文件 | 所有中间整理结果默认只放在当前对话中，不生成额外 Markdown、JSON 或过程文件 |
| 可选文件落地 | 支持两种导出模式：仅导出 `final.html`，或同时导出 `source.md + final.html` |
| 触发边界明确 | 用户只要最终 HTML 不要中间过程时，自动转交 `wechat-html-composer`，避免误触发 |

---

## 使用方式

### 适合的输入

- 要点、聊天记录、碎片素材，需先整理成完整文章再输出 HTML
- 已有 Markdown 或正文草稿，希望在对话中审阅标题、摘要、结构和封面提示词
- 需要保留可复用源稿（`source.md`）和最终 HTML 作为发布资产
- 明确要求使用特定主题风格（如论文主题、飞书风、掘金风等）
- 需要人工核对文章标题、摘要和封面提示词后再输出最终结果

### 执行特点

- **源稿先行**：始终先生成含标题、摘要、封面提示词和正文的四段式发布源稿，确认后再进入 HTML
- **对话优先**：中间结果只出现在对话中，不转存为额外文件
- **自包含执行**：所有规则、主题规范和样式预设均在技能目录内，不依赖外部资源
- **主题固定，内容动态**：主题负责视觉语法（颜色、边线、圆角等），内容决定哪些块位出现
- **微信兼容优先**：HTML 只使用公众号复制链路稳定的基础标签和内联样式

---

## 输出结果

- **四段式发布源稿**（对话中展示）：标题、摘要、封面提示词、正文 Markdown
- **微信兼容内联样式 HTML**（最终交付）：`title`、`summary` 和正文渲染为可直接复制到公众号编辑器的 HTML，不含 `cover_prompt`
- **`final.html`**（可选文件落地）：最终 HTML 文件
- **`source.md`**（可选文件落地，含 frontmatter）：可复用、可再编辑的发布源稿，frontmatter 至少包含 `title`、`summary`、`cover_prompt`、`theme`

---

## 使用示例

### 示例1

**输入**（用户给素材，希望先在对话中整理再输出 HTML）：

```text
我写了一篇关于远程办公效率的文章草稿，帮我整理成公众号格式，先看标题和摘要，确认后再给 HTML。
```

### 示例2

**输入**（用户只要最终 HTML，不要中间过程——自动转交）：

```text
把这个 Markdown 直接转成公众号 HTML 就行，不用确认。
```

技能识别为"只要最终 HTML 不要过程"，自动转交 `wechat-html-composer` 处理。

### 示例3

**输入**（用户要求文件落地，同时保留源稿）：

```text
把这篇公众号文章导出到 output 目录，我要 source.md + final.html，用论文主题。
```

技能在对话中完成源稿确认后，落盘 `source.md`（含 frontmatter + 正文）和 `final.html`。

---

## 注意事项

1. **默认主题**：未指定主题时使用 `wechat-native-template`（微信原生风格）。
2. **内容忠实优先**：如果"更像公众号文风"和"更忠于原文"冲突，优先保留原文事实、语义和立场。
3. **封面提示词始终生成**：`cover_prompt` 是发布源稿的必要字段，即使你不关心封面也会在源稿中保留。
4. **正文 Markdown 不使用一级标题**：标题已外提为源稿字段，正文从 `##` 二级标题开始。
5. **主题禁止混用**：不同主题的组件语法固定，不允许把 A 主题的样式借给 B 主题使用。
6. **标题和摘要有限长**：标题不超过 64 字，摘要不超过 120 字。
7. **文件覆盖需确认**：目标文件已存在时，未获允许不会覆盖。
8. **未经允许不得改写**：擅自增删事实、改写结论立场或替换引用原话均被禁止。
9. **论文主题**：使用 `academic-paper-template`，支持作者/单位/日期前置信息、严格摘要格式和关键词行，`wechat-default-template` 是其兼容别名。

---

## 适用场景

- 需要先在对话中审阅标题、摘要和正文结构，再输出 HTML 的正式发布流程
- 需要保留可复用源稿（`source.md`）作为长期发布资产
- 从碎片素材（要点、聊天记录等）整理为结构完整的公众号文章
- 需要按特定主题风格（论文、飞书、掘金等）输出的场景
- 不适用于：只要最终 HTML 不要过程（应使用 `wechat-html-composer`）、纯封面设计、抄袭或洗稿

---

## 相关文件

- 技能定义：`.agents/skills/wechat-article-generator/SKILL.md`
- 元数据：`.agents/skills/wechat-article-generator/_meta.json`
- 渲染契约：`.agents/skills/wechat-article-generator/references/render-contract.md`
- 主题规范：`.agents/skills/wechat-article-generator/references/theme-spec.md`
- 场景走查：`.agents/skills/wechat-article-generator/references/usage-walkthroughs.md`
- 主题预设：`.agents/skills/wechat-article-generator/assets/theme-presets.js`
- 渲染脚本：`.agents/skills/wechat-article-generator/scripts/render-wechat-article-html.js`
- 验证脚本：`.agents/skills/wechat-article-generator/scripts/verify-render-wechat-article-html.js`
