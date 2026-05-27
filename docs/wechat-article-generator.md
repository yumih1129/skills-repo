# WeChat Article Generator 使用手册

## 技能概述

**技能名称**：WeChat Article Generator

**标识**：`wechat-article-generator`

**版本**：1.5.1

**功能**：将主题、素材、草稿或 Markdown 先整理为可审阅的公众号发布源稿（标题、摘要、封面提示词、正文 Markdown），确认后再按内置多主题生成微信兼容内联样式 HTML。

---

## 快速开始

直接描述你的任务需求即可触发该技能，例如：

```text
帮我把这篇技术文章整理成公众号发布稿，先给我看标题和摘要。
```

```text
我有一份产品介绍要点，帮我排版成微信公众号文章，用苹果风格。
```

```text
把我这份 Markdown 转成公众号 HTML，同时保留 source.md 源稿，导出到 output 目录。
```

---

## 功能特性

### 支持的能力

| 能力 | 说明 |
|------|------|
| 四段式发布源稿整理 | 从任意输入中提取标题（≤64 字）、摘要（≤120 字）、封面提示词和标准正文 Markdown，四部分互相一致 |
| 多主题渲染 | 内置 9 套公众号主题：微信原生、学术论文、Apple 风格、Claude Code、Codex、飞书、掘金、Notion、Obsidian |
| 忠实排版整理 | 默认不擅改原意，将口语化内容整理为层级清晰、段落整齐、节奏稳定的手机端正文 |
| 对话优先 | 中间结果只在对话中展示，不额外创建文件；仅在用户明确要求时才落盘 |
| 文件导出 | 支持两种文件导出模式：仅 HTML（`final.html`）或完整发布资产（`source.md` + `final.html`） |
| 微信兼容 HTML | 使用基础标签和内联样式，杜绝脚本、`div` 依赖和不可控外链，确保公众号复制链路稳定 |
| 主题自包含 | 每个主题的组件样式在技能目录内独立定义，执行时不依赖外部模板或样式样例 |
| 风险收口 | 对日期、数据、价格、政策等可变事实优先使用用户来源，无法核验时降低确定性表达 |

---

## 使用方式

### 适合的输入

- 完整的正文、Markdown 草稿或已排版文章
- 要点、摘录、聊天记录或碎片素材
- 已有主题但缺少标题/摘要/封面提示词的半成稿
- 需要按特定风格统一排版的文章

### 执行特点

- **先审阅后输出**：默认先在对话中展示四段式源稿供确认，再生成 HTML
- **不追问非关键信息**：主题未指定时默认用微信原生风格，输出路径未指定时不主动询问
- **主题权威优先**：主题确定后，组件样式严格按技能内部规范执行，不允许混用或自拟
- **阻塞性缺口最多问 3 个问题**：仅在主题/任务目标完全不清、输出路径冲突或内容要求矛盾时才追问

---

## 输出结果

### 默认模式（对话审阅）

在对话中按以下顺序交付：

1. **发布源稿**：标题、摘要、封面提示词、正文 Markdown
2. **确认后的最终 HTML**：微信兼容内联样式 HTML，不包含 `cover_prompt`

### 文件导出模式

- **仅 HTML**（`html-file-export`）：落盘 `final.html`
- **完整资产**（`source-html-export`）：落盘 `source.md`（含 frontmatter）和 `final.html`

`source.md` 的 frontmatter 固定包含 `title`、`summary`、`cover_prompt`、`theme` 四个字段。

---

## 使用示例

### 示例 1：正向触发——先整理再确认

**输入**：

```text
我写了一篇关于 VS Code Copilot 使用技巧的文章草稿，内容比较散，
帮我整理成可以发公众号的形式。先给我看标题、摘要和排版后的正文。
```

**执行**：技能会在对话中给出四段式源稿供确认，用户确认后直接输出对应 HTML。

---

### 示例 2：边界触发——只要最终 HTML

**输入**：

```text
把这篇 Markdown 转成公众号 HTML，不要过程，直接给结果。
```

**执行**：技能会判断这是 `wechat-html-composer` 的适用场景并优先转交。如果用户明确点名当前技能，则内部完成源稿整理后直接输出 HTML，不在对话中展开四段内容。

---

### 示例 3：文件落地——导出完整发布资产

**输入**：

```text
用学术论文主题排版这篇论文摘要，导出 source.md 和 final.html 到 output 目录。
```

**执行**：先在对话中确认四段式源稿，确认后落盘 `source.md`（含 frontmatter）和 `final.html`，使用 `academic-paper-template` 主题。

---

## 注意事项

1. **默认不创建文件**：所有中间结果停留在对话中，不会向用户工作区写入额外 Markdown、JSON 或说明文档。
2. **`cover_prompt` 不进 HTML**：封面提示词仅作为源稿元数据保留，不会渲染到最终 HTML 中。
3. **标题和摘要有硬性长度限制**：标题不超过 64 字，摘要不超过 120 字。
4. **正文 Markdown 有语法子集限制**：禁止一级标题、四级及以上标题、原始 HTML 标签、内联样式和伪列表；并列信息用标准列表，引述用 `>`，代码用围栏代码块。
5. **主题不可混用**：每个主题的组件语法独立，不允许跨主题借用组件（如把 codex 的左强调线标题用到飞书主题）。
6. **未映射组件自动回退**：当前主题无法映射用户请求的组件时，整篇回退到微信原生主题，不允许局部自拟样式。
7. **可变事实审慎处理**：涉及日期、数据、价格、政策等无法核验的信息时，优先降级表达或移出核心论据。
8. **文件覆盖需确认**：目标文件已存在时，必须先询问用户是否覆盖。
9. **与 wechat-html-composer 的边界**：用户只要最终 HTML 不要过程时优先转交 `wechat-html-composer`；用户要求先确认源稿、保留 `source.md` 或明确点名本技能时才使用当前技能。

---

## 适用场景

- 用户希望先在对话中整理内容、确认标题摘要和结构，再输出 HTML
- 用户需要得到一份包含标题、摘要、封面提示词和正文的标准发布源稿
- 用户需要按特定视觉风格（Apple、飞书、Notion 等）排版公众号文章
- 用户最终需要 HTML 文件或 `source.md + final.html` 落地
- 用户希望中间过程在对话中完成，不产生工作区垃圾文件

---

## 相关文件

- 技能定义：`.agents/skills/wechat-article-generator/SKILL.md`
- 元数据：`.agents/skills/wechat-article-generator/_meta.json`
- 渲染契约：`.agents/skills/wechat-article-generator/references/render-contract.md`
- 主题规范：`.agents/skills/wechat-article-generator/references/theme-spec.md`
- 场景走查：`.agents/skills/wechat-article-generator/references/usage-walkthroughs.md`
- 样式预设：`.agents/skills/wechat-article-generator/assets/theme-presets.js`
- 渲染脚本：`.agents/skills/wechat-article-generator/scripts/render-wechat-article-html.js`
- 验证脚本：`.agents/skills/wechat-article-generator/scripts/verify-render-wechat-article-html.js`
