# WeChat Article Generator 使用手册

## 技能概述

**技能名称**：WeChat Article Generator

**标识**：`wechat-article-generator`

**版本**：1.5.7

**功能**：将用户提供的主题、素材、草稿、Markdown 或正文先整理为可审阅的公众号发布源稿（标题、摘要、封面提示词、正文 Markdown），确认后按内置主题生成微信兼容的内联样式 HTML。

---

## 快速开始

### 基本用法

直接描述你的任务需求即可触发该技能，例如：

```text
根据以下要点帮我整理一篇公众号文章，先看源稿再输出 HTML：
[你的素材或要点]
```

```text
把我这份 Markdown 草稿整理成公众号发布源稿，先确认再生成 wechat-native 风格的 HTML。
```

```text
根据下面的聊天记录整理成公众号文章，我要保留 source.md 和 final.html，用 codex 主题。
```

---

## 功能特性

### 支持的能力

| 能力 | 说明 |
|------|------|
| 四段式发布源稿整理 | 从任意输入（主题、素材、草稿、Markdown、聊天记录）整理出标题、摘要、封面提示词、正文 Markdown |
| 内容忠实排版 | 默认忠实于原文事实与立场，不擅自改写数字、引用、结论 |
| 微信兼容 HTML 生成 | 确认源稿后按内置主题生成纯内联样式、无脚本的公众号兼容 HTML |
| 多主题批量导出 | 支持同一份源稿按多个内置主题生成多份 HTML |
| 文件资产落盘 | 可按需落盘 `final.html`、`source.md + final.html`，或批量主题导出 |
| 可选封面图生成 | 用户明确要求时，在主 HTML 交付后追加微信封面图生成 |

---

## 使用方式

### 适合的输入

- 要点、提纲、草稿、聊天记录等碎片化素材
- 已写好的 Markdown 正文或连续文本
- 本地文件路径（文章内容来源）
- 包含主题、读者、长度等偏好的需求描述

### 执行特点

- 默认在对话中完成内容整理与确认，不生成过程文件
- 内容确认后才生成最终 HTML，不会跳过源稿审核
- 未指定主题时默认使用 `wechat-native-template`（微信原生风格）
- 用户只需说"落盘"或"导出文件"即可进入文件导出分支，无需指定技术参数

---

## 交付物

- **发布源稿**（对话中展示）：包含标题（≤64 字）、摘要（≤120 字）、封面提示词、标准正文 Markdown
- **最终 HTML**（对话中或文件）：微信兼容的内联样式 HTML，不含封面提示词等元信息
- **`source.md`**（可选落盘）：含 frontmatter（title/summary/cover_prompt/theme）的 Markdown 源稿
- **`final.html`**（可选落盘）：由确定性渲染脚本生成的最终 HTML 文件
- **多主题 HTML**（可选）：同一份源稿的多主题批量导出
- **`cover.png`**（可选）：用户明确要求时的微信封面图

---

## 使用示例

### 示例 1：对话整理 + 确认后生成 HTML

**输入**：

```text
帮我把以下要点整理成公众号文章，我想先看效果再确认：
- 远程办公的三大优势
- 实际落地的五个挑战
- 给团队的三条建议
```

**过程**：技能会在对话中先展示四段式发布源稿（标题、摘要、封面提示词、正文 Markdown）供你审阅，确认后生成最终 HTML。

---

### 示例 2：只要最终 HTML，不要中间过程

**输入**：

```text
把这篇发给我的文章生成公众号 HTML，直接用 feishu 风格。
[文章内容]
```

**说明**：如果你只需要最终 HTML、不需要中间审阅和源稿保留，系统会优先使用 `wechat-html-composer` 处理。如果你明确点名 `wechat-article-generator`，则会先在内部完成整理再输出 HTML。

---

### 示例 3：落盘 source.md + final.html + 封面图

**输入**：

```text
根据以下素材整理公众号文章，输出 source.md 和 final.html 到 docs/ 目录，用 notion 主题，再帮我生成一张微信封面图。
[素材]
```

**过程**：技能会先在对话中确认源稿，再依次生成最终 HTML、写入 source.md + final.html 到 docs/，最后尝试在当前环境生成封面图。

---

## 注意事项

1. 标题不超过 64 字，摘要不超过 120 字，这是硬约束。
2. 默认只做忠实排版整理，不改写事实、数字、引用或结论立场；如需润色请明确说明。
3. 中间产物（源稿整理）只出现在对话中，不会生成临时文件或隐藏文件。
4. 文件落地必须通过技能目录内的确定性渲染脚本，手写 HTML 不能替代。
5. 指定的主题若未命中内置主题（9 个），会自动降级为 `wechat-native-template`。
6. 封面图生成是附加分支，依赖当前运行环境的图像生成能力；生成失败不会影响 HTML 主交付。
7. 目标文件已存在时不会自动覆盖，会先询问你的决定。
8. 正文 Markdown 只会承载读者可见的文章内容，不会混入文件路径、封面提示词、执行说明等元信息。

---

## 适用场景

- 你想先把碎片素材整理成一篇结构清晰的公众号文章，确认后再生成 HTML
- 你需要同时输出标题、摘要、封面提示词和正文，用于公众号发布全流程
- 你想把同一篇文章按多个内置主题风格分别生成 HTML
- 你需要保留可复用的 `source.md` 源稿，方便后续再编辑
- 你需要配套的微信封面图作为文章发布资产的一部分

---

## 相关文件

- 技能定义：`.agents/skills/wechat-article-generator/SKILL.md`
- 元数据：`.agents/skills/wechat-article-generator/_meta.json`
- 渲染契约：`.agents/skills/wechat-article-generator/references/render-contract.md`
- 主题规范：`.agents/skills/wechat-article-generator/references/theme-spec.md`
- 内容格式标准：`.agents/skills/wechat-article-generator/references/content-format-standard.md`
- 质量门禁：`.agents/skills/wechat-article-generator/references/quality-gates.md`
- 维护清单：`.agents/skills/wechat-article-generator/references/maintenance-checklist.md`
- 场景走查：`.agents/skills/wechat-article-generator/references/usage-walkthroughs.md`
- 渲染脚本：`.agents/skills/wechat-article-generator/scripts/render-wechat-article-html.js`
- 批量渲染脚本：`.agents/skills/wechat-article-generator/scripts/render-wechat-article-theme-batch.js`
- 验证脚本：`.agents/skills/wechat-article-generator/scripts/verify-render-wechat-article-html.js`
- 主题预设：`.agents/skills/wechat-article-generator/assets/theme-presets.js`
