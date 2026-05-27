# 渲染契约

本契约定义“四段式发布源稿”如何映射为最终 HTML。它的核心目标有五个：

- 第一中间产物是可审阅的四段式发布源稿
- 中间结果默认只保留在当前对话或执行上下文中
- 最终结果收束为微信兼容的内联样式 HTML
- 一旦主题确定，组件样式必须对齐本技能内部已固化的对应主题规范
- 当用户要求落盘时，可以稳定导出 `final.html`，或导出 `source.md + final.html`

默认不要求把中间结构保存为用户可见的 `.json` 文件。只有用户明确要求文件落地时，才允许写出最终发布资产，而且应优先通过内存、标准输入或 base64 完成 HTML 渲染，不新增无意义中间产物。

重要收窄：

- 发布源稿是内容审阅基准与结构来源，不是“写完再随手拆字段”的装饰性包装。
- 在调用 `scripts/render-wechat-article-html.js` 前，执行者必须先把已确认的发布源稿收束为本契约的结构化对象。
- 若结构化对象与已确认源稿不一致，应视为失败，退回源稿阶段修正；不能假装脚本会替你纠偏。
- `cover_prompt` 属于源稿元数据，不属于读者页面内容，禁止渲染进最终 HTML。

## 发布源稿契约

默认的对话审阅形态固定为：

```text
标题：{title}
摘要：{summary}
封面提示词：{cover_prompt}
正文：
{markdown}
```

字段要求：

- `title`：公众号标题，长度不得超过 64 字。
- `summary`：公众号摘要，长度不得超过 120 字。
- `cover_prompt`：完整封面提示词，应可直接用于封面生成或设计。
- `markdown`：标准微信公众号正文 Markdown，不重复元数据字段。
- `theme`：执行上下文中的隐含字段；对话中可展示，也可不展示，但落盘为 `source.md` 时必须写入 frontmatter。

字段命名约定：

- 对话展示、`source.md` frontmatter、评审结论和源稿契约统一使用 `cover_prompt`。
- 渲染脚本为了兼容历史输入，仍接受 `coverPrompt` 作为兼容别名。
- 一旦进入当前技能的规范链路，就应把两者视为同一字段；对外描述时优先使用 `cover_prompt`，避免出现两套公开命名。

正文 Markdown 的最小结构要求：

- 不再包含 `#` 一级标题；标题由 `title` 字段承载。
- 开头可有引入段，主章节从 `##` 开始。
- 允许 `###` 作为 `##` 的从属展开。
- 列表、引用、表格、代码块必须使用标准 Markdown 语法。

若用户输入本来带有 `# 标题` 的 Markdown：

- 先提取 `#` 内容进入 `title`
- 再从正文中移除该一级标题
- 若开头首段可提炼为摘要，则提炼进 `summary`

## `source.md` 文件格式

当用户明确要求导出可复用源稿时，`source.md` 必须使用以下格式：

```markdown
---
title: 文章标题
summary: 120 字内摘要
cover_prompt: 完整封面提示词
theme: wechat-native-template
---

引入段落。

## 第一部分

正文段落。
```

文件要求：

- frontmatter 至少包含 `title`、`summary`、`cover_prompt`、`theme`
- frontmatter 之后直接接正文 Markdown
- 正文不重复 `# 标题`
- `summary` 与 `cover_prompt` 只放在 frontmatter，不在正文中机械重复

## 对话中间结构

中间结构默认以对话中的结构块表达，不要求展示机器 JSON。最小结构应覆盖：

- `title`
- `summary`
- `cover_prompt`
- `markdown`
- `theme`

必要时可补充：

- `eyebrow`：标题上方的小型主题标签
- `meta`：论文式或文档式前置信息
- `keywords`：关键词或关键标签行
- `callout`：标题或摘要之后的提示块
- `risk_notes`：仅在审阅阶段提示用户的高风险事实说明，不进入最终 HTML

## 机器结构

当需要走脚本渲染或做确定性校验时，可以在执行上下文中临时转换为以下结构：

```json
{
  "source": {
    "title": "文章标题",
    "summary": "120 字内摘要",
    "cover_prompt": "完整封面提示词",
    "theme": "wechat-native-template",
    "markdown": "引入段落。\n\n## 第一部分\n\n正文"
  },
  "article": {
    "eyebrow": "可选的小型主题标签",
    "title": "文章标题",
    "meta": ["作者姓名", "团队名称", "日期"],
    "theme": "wechat-native-template",
    "lead": {
      "title": "摘要",
      "text": "120 字内摘要"
    },
    "keywords": {
      "label": "关键词：",
      "items": ["公众号排版", "内联样式"]
    },
    "blocks": [
      { "type": "callout", "label": "System Note", "text": "..." },
      { "type": "quote", "text": "..." },
      { "type": "list", "ordered": false, "items": ["...", "..."] },
      {
        "type": "table",
        "label": "Table 1",
        "note": "表格说明文字",
        "noteEmphasis": true,
        "columnWidths": ["22%", "34%", "44%"],
        "headers": ["A", "B", "C"],
        "rows": [["1", "2", "3"]]
      },
      { "type": "code", "language": "text", "text": "..." },
      { "type": "image", "src": "...", "alt": "...", "caption": "..." }
    ],
    "sections": [
      {
        "level": 2,
        "heading": "章节标题",
        "blocks": [
          { "type": "paragraph", "text": "..." },
          { "type": "quote", "text": "..." },
          { "type": "list", "ordered": false, "items": ["...", "..."] }
        ]
      }
    ],
    "closing": [
      { "type": "paragraph", "text": "收尾内容" }
    ]
  }
}
```

该结构默认只存在于执行内存、标准输入或 base64 参数中。除非用户明确要求发布资产落地且执行环境确有需要，不得把它保留为用户可见的中间文件。

若直接把机器结构交给渲染脚本：

- 规范写法仍是 `cover_prompt`
- `coverPrompt` 仅作兼容别名接受
- 脚本内部可以把它归一化为 JS 友好的字段，但这不改变外部契约

字段职责收窄：

- `source.title`：最终 `h1` 的唯一标题来源。
- `source.summary`：导语或摘要区的唯一摘要来源。
- `source.cover_prompt`：源稿规范字段；只保留在源稿或导出文件中，不进入 `article` 的渲染节点。
- `source.markdown`：正文内容的唯一文本基准。
- `article`：从已确认源稿推导出的主题化渲染结构，而不是绕开源稿重新自由生成的文案。

## 映射规则

- `source.title` -> `article.title` -> `h1`
- `source.summary` -> `article.lead.text`
- `source.cover_prompt` -> 仅源稿元数据，不渲染
- `source.theme` -> `article.theme`
- `source.markdown` -> 执行者收束内部结构时的唯一正文基准
- `article.eyebrow` -> `h1` 之前的主题标签段落
- `article.meta` -> `h1` 之后的前置信息段落
- `article.lead.title` + `article.lead.text` -> 摘要或导语块
- `article.keywords` -> 摘要之后的关键词行
- `article.blocks` -> 标题之后、章节之前的固定支持块区域
- `callout` -> 提示块
- `sections[].level = 2` -> `h2`
- `sections[].level = 3` -> `h3`
- `paragraph` -> `p`
- `quote` -> `blockquote`
- `list` -> `ul` / `ol`
- `table` -> `table`
- `table.label` -> 表格题签
- `table.note` -> 表格副说明或图注式说明
- `code` -> `pre > code`
- `image` -> `img` + 说明文本
- `closing` -> 收尾块，通常使用段落或轻提示块

## 渲染规则

1. 先选定主题，再套用该主题的 preset。
2. 先确认发布源稿已经通过“内容准确”“长度合规”和“结构可转 HTML”检查。
3. 再读取本技能内部的主题规范，确认该主题已经固化的组件形态，再决定是否使用 `eyebrow`、`meta`、`keywords`、`callout`、表格题注和代码块。
4. 主题 preset 只负责把技能内部已确认的组件样式程序化，不允许脱离主题规范自行创造“差不多”的样式。
5. 内部结构必须从已确认的源稿推导，不得绕过源稿阶段回到原始素材重新自由生成。
6. `blocks` 位于 lead 和 keywords 之后、sections 之前，`sections` 位于主章节区域，`closing` 位于正文收尾。
7. HTML 必须是完整文档，`body` 中只保留一个主要 `article` 作为复制面。
8. 所有样式都必须写入内联 `style`。
9. 不允许 `script`、`iframe`、`form`、正文 `div`、外部 CSS、动画或固定定位。
10. 未知块类型、空标题、空章节、空列表、空表格、空代码和缺少 `src` 的图片必须在渲染前失败。
11. 对技能内部主题规范中已固化的组件，颜色、留白、边线、对齐、圆角和题注写法都应保持一致。
12. “美化”必须建立在结构正确之上；如果源稿还存在长段堆叠、并列关系未列表化等问题，禁止跳到 HTML 阶段硬修视觉。
13. 对当前主题无法映射的组件或结构，必须整篇回退到 `wechat-native-template`；不允许回退到 `base` 样式伪装成“也支持”，也不允许局部混入别的主题组件。
14. 允许变化的只有内容，不允许变化主题组件的样式值来源；所有主题样式必须直接来自 preset 映射，不得自行改写成“更像某主题”的另一套实现。

## 对话展示规则

- 中间结构默认用固定四段式源稿展示。
- 默认先展示源稿，再决定是否补充结构说明。
- 不用原始 JSON 作为面向用户的默认展示格式。
- 若用户要求先确认结构，再继续生成 HTML，停在源稿块即可，但必须明确下一步是输出对应 HTML。
- 若用户要求立即成稿，源稿整理可以压缩成一句到一段的对话说明，然后直接输出最终 HTML。
- 若主题是 `academic-paper-template`，按“论文主题”处理，可在对话中显式确认论文式前置信息、摘要和关键词行，再输出 HTML。

## 验证规则

- 源稿必须同时包含 `title`、`summary`、`cover_prompt`、`markdown`。
- `title` 不得超过 64 字。
- `summary` 不得超过 120 字。
- 必须包含 `<!DOCTYPE html>`。
- HTML 内容必须与已确认源稿一致，不能在转换阶段再改写内容。
- 最终 HTML 必须包含 `html`、`head`、`body`、`article`。
- `body` 中必须只有一个主要 `article`。
- 不得出现禁止标签。
- 关键节点必须带内联 `style`。
- 不得把正文 Markdown 原文直接包成一个大段落。
- 同主题下的不同输入，只能改变内容密度，不改变块模型。
- 若将主题规范里存在的 `eyebrow`、`callout`、表格题注或关键词行省略掉，必须是因为当前内容不需要，而不是因为渲染链路不支持。
- 若某主题组件使用特殊样式，例如 `codex` 的左强调线 `h2`、`feishu` 的胶囊 `h3`、`academic-paper` 的摘要与关键词行，输出时不得替换为其他主题的通用写法。
- 除 `academic-paper-template` 外，正文段落、提示块正文与收尾不应出现 `text-indent:2em`；若出现，应判定为主题映射失败。
- 若发布源稿本身仍像素材拼贴而不像可发布文章，则应判定为前序失败，而不是把责任转嫁给 HTML 样式。
- 若输出 HTML 的关键样式值与当前主题 preset 不一致，应判定为主题映射失败；若当前主题无法覆盖该结构，应自动切回微信原生主题，而不是解释为“风格发挥”。
- 若 HTML 中出现 `cover_prompt` 文本，应判定为源稿泄漏失败。

## 输出模式规则

- 默认外部交付顺序是：先在对话中给出四段式源稿供审阅；确认后再输出最终 HTML。
- 只有在用户明确不要中间过程且仍坚持使用本技能时，才允许内部保留四段式源稿而不默认在对话中展开，然后直接输出最终 HTML。
- 脚本或 CLI 导出入口必须接收 `source` 包装结构，或直接接收同时包含 `title`、`summary`、`cover_prompt`、`markdown` 的源稿字段；只包含 `article` 或旧式正文结构的输入必须失败，不能绕过 `cover_prompt`。
- 用户明确要求文件落地但未要求保留源稿时，进入 `html-file-export`，只写出 `final.html`。
- 用户明确要求保留可复用源稿、输出 md + html、导出完整发布资产时，进入 `source-html-export`，写出 `source.md + final.html`。
- 无论是否落地，都不得把内部结构 `.json` 文件作为最终交付物。

## 输出路径规则

- `html-file-export`：
  - 输出路径是已存在目录时，写入该目录下的 `final.html`。
  - 输出路径是 `.html` 或 `.htm` 文件时，写入该文件。
  - 输出路径是 `.md` 文件时，只把它当作命名提示，写入同目录、同 basename 的 `.html` 文件。
  - 输出路径没有扩展名且不存在时，视为目录路径，写入其下的 `final.html`。
- `source-html-export`：
  - 输出路径是已存在目录时，写入该目录下的 `source.md` 与 `final.html`。
  - 输出路径是 `.md` 文件时，写入该 Markdown 文件，并在同目录同 basename 下写出对应 `.html` 文件。
  - 输出路径是 `.html` 或 `.htm` 文件时，写入该 HTML 文件，并在同目录同 basename 下写出 `.source.md` 文件。
  - 输出路径没有扩展名且不存在时，视为目录路径，写入其下的 `source.md` 与 `final.html`。
- 输出路径已存在、没有扩展名且不是目录时，必须失败。
- 目标文件已存在时，默认失败；只有显式允许覆盖或显式允许自动改名时才继续。
- 用户工作区中不得生成或保留内部结构 `.json` 文件。
