# WeChat Article HTML Exporter 使用手册

## 技能概述

**技能名称**：WeChat Article HTML Exporter

**标识**：`wechat-article-html-exporter`

**版本**：1.3.6

**功能**：将主题、素材、草稿或 Markdown 先在对话中整理为标准微信公众号成稿，确认后再输出微信兼容的内联样式 HTML；用户明确要求时可选落盘为 HTML 文件。

---

## 快速开始

### 基本用法

直接描述你的任务需求即可触发该技能，例如：

```text
帮我把这份产品发布草稿整理成公众号文章，先给我看 Markdown 成稿
```

```text
这是我们的活动文案，用 Notion 风格排版成公众号 HTML
```

```text
我有几个要点和一段简介，先帮我整理成文，确认后导出为 HTML 文件保存到 output/ 目录
```

---

## 功能特性

### 支持的能力

| 能力 | 说明 |
|------|------|
| 两阶段交付 | 先输出 Markdown 成稿供审阅，确认后再输出最终 HTML |
| 对话优先 | 中间结果只保留在对话中，不产生额外中间文件 |
| 9 种内置主题 | 微信原生、学术论文、Apple、Claude Code、Codex、飞书、掘金、Notion、Obsidian |
| Markdown 忠实整理 | 优先保留原文事实与立场，只做最小必要的排版结构化 |
| 文件可选落地 | 仅在用户明确要求路径或目录时才写入文件 |
| 内容风险收口 | 对日期、数据、价格等可变事实做审慎表达，必要时降级或移出论据 |

---

## 使用方式

### 适合的输入

- 文章草稿、要点列表、聊天记录或已有 Markdown 正文
- 需要先整理结构、确认内容再输出 HTML 的公众号排版需求
- 需要按特定主题风格（如 Apple、Notion、飞书）统一成稿
- 输入本身已是成文，但需要按公众号手机端阅读习惯重排层级与节奏

### 执行特点

- **不主动改写事实**：未经允许，不擅自增删原文的事实、数字、引用或结论立场
- **默认微信原生主题**：未指定主题时不追问，直接使用 `wechat-native-template`
- **Markdown 先行**：即使最终只需要 HTML，内部也会先完成标准 Markdown 成稿以保证内容准确
- **一次追问最多 3 个问题**：仅在主题、任务目标或内容冲突等阻塞性问题时才追问

---

## 输出结果

- **对话内 HTML**（默认）：在对话中直接输出微信公众号兼容的内联样式 HTML
- **文件落地 HTML**（可选）：用户明确指定输出路径时，将 HTML 写入该路径，不保留中间文件
- **中间产物**：仅存在于对话中的标准 Markdown 成稿，不生成额外 `.md` 或 `.json` 文件

---

## 使用示例

### 示例1：素材整理 + 对话内输出 HTML

**输入**：

```text
我有一篇关于 AI 编程工具对比的文章草稿，比较散，帮我整理成公众号文章，
用 Codex 风格，先给我看 Markdown
```

技能会先输出一份结构清晰、标题层级合理、段落节奏适合手机阅读的 Markdown 成稿；用户确认内容后，再输出对应的 Codex 风格 HTML。

---

### 示例2：主题未命中内置，自动回退

**输入**：

```text
帮我把这篇技术总结排版成公众号 HTML，用 "medium" 风格
```

"medium" 不是内置主题，技能会自动回退到 `wechat-native-template`，用微信原生风格完成排版，不会凭空编造样式。

---

### 示例3：确认内容后文件落地

**输入**：

```text
这篇行业分析文章已经确认没问题了，帮我导出 HTML 存到 output/report.html
```

技能会将已确认的 Markdown 成稿收束为内部结构，通过渲染脚本写入 `output/report.html`。若该文件已存在且用户未允许覆盖，技能会先询问。

---

## 注意事项

1. **与 wechat-html-composer 的区别**：如果你只要最终 HTML、不需要任何中间确认过程，直接使用 `wechat-html-composer` 更高效；本技能专为“先审阅再输出”的场景设计。
2. **主题不可混用**：选定一个主题后，全文所有组件严格服从该主题规范，不会出现“标题是飞书风、引用是 Notion 风”的混搭。
3. **Markdown 语法限制**：成稿只使用 `#/##/###`、段落、列表、引用、表格、代码块等标准语法，不出现四级以上标题，不混入原始 HTML 标签。
4. **图片处理**：有真实图片链接时使用标准 Markdown 语法；只有意图没有链接时只保留文字说明，不伪造资源地址。
5. **文件覆盖保护**：目标文件已存在且未获明确允许时，技能会询问而非静默覆盖。
6. **所有规则自包含**：技能执行完全依赖自身目录内的规则和资源，不需要外部模板或样例来补全样式。

---

## 适用场景

- 想把零散素材、要点或草稿整理成适合公众号发布的正式文章
- 需要先在对话中确认内容准确性，再决定是否输出 HTML
- 需要按特定品牌或平台风格（Apple、Notion、飞书等）统一文章视觉
- 需要最终获得可直接复制到公众号后台的 HTML 代码
- 需要把确认后的成稿落盘为 HTML 文件，供后续流程使用

---

## 相关文件

- 技能定义：`.agents/skills/wechat-article-html-exporter/SKILL.md`
- 元数据：`.agents/skills/wechat-article-html-exporter/_meta.json`
- 主题规范：`.agents/skills/wechat-article-html-exporter/references/theme-spec.md`
- 渲染契约：`.agents/skills/wechat-article-html-exporter/references/render-contract.md`
- 场景走查：`.agents/skills/wechat-article-html-exporter/references/usage-walkthroughs.md`
- 主题预设：`.agents/skills/wechat-article-html-exporter/assets/theme-presets.js`
- 渲染脚本：`.agents/skills/wechat-article-html-exporter/scripts/render-wechat-article-html.js`
- 验证脚本：`.agents/skills/wechat-article-html-exporter/scripts/verify-render-wechat-article-html.js`
