---
name: wechat-news-publisher
description: "当用户希望基于指定主题与时间，一次完成新闻检索、公众号源件生成、固定版式 HTML、参考图约束的模型封面图与指定目录落地时使用。"
---

# Skill: 一键式公众号新闻发布

## 本地资源与权威顺序

1. `SKILL.md` frontmatter：只定义技能标识与触发描述。
2. `SKILL.md` 正文：定义边界、流程、门禁、失败处理与交付要求；冲突时以正文为准。
3. `references/output-contract.md`：定义固定产物、目录和单向依赖。
4. `references/html-style-spec.md`：定义唯一允许的 HTML 版式。
5. `references/cover-style-spec.md`：定义唯一允许的封面构图、色彩与参考图约束。
6. `references/enterprise-quality-gates.md`：定义最终门禁。
7. `assets/cover-layout-reference.png`：封面唯一版式参考图。
8. `scripts/render-wechat-news-html.js`：唯一合法 HTML 渲染脚本。
9. `scripts/verify-wechat-news-publisher.js`：唯一合法本地验证脚本。
10. `_meta.json`：只提供注册元数据，不补充执行规则。
11. 未列入以上顺序的文件不参与执行判定。

## 核心用途

输入 `topic`、`time_input`、`need_cover`、`need_export`、`output_dir`，固定产出：

- `source.md`
- `final.html`
- `scover.png`

约束：

- `source.md` 是唯一源件。
- `final.html` 只由 `source.md` 正文生成。
- `scover.png` 只由 `source.md` 与 `assets/cover-layout-reference.png` 驱动生成。

## 何时使用

适用：

- 按主题和时间直接生成公众号新闻稿并落地。
- 需要固定 HTML 版式。
- 需要封面与参考图保持同构。

不适用：

- 只要新闻列表，不要发布产物。
- 只要最终 HTML，不要源件与封面图。
- 只要自由风格海报、插画或自定义封面。
- 需要多轮审稿、多主题并行或多套版式。

## 输入契约

- `topic`：必填。
- `time_input`：默认 `近期`。
- `need_cover`：默认 `false`。
- `need_export`：默认 `false`。
- `output_dir`：仅在 `need_export=true` 时必填。

只在以下情况追问，且只追问一次：

- `topic` 不清楚。
- 需要落地但没有 `output_dir`。
- 用户给出的保留/删除要求互相冲突。

## 执行不变量

- `新闻简报` 是唯一事实基准；成稿、HTML、封面图都只能基于它生成。
- `新闻简报` 固定先扩面形成候选集，再筛成最终入稿集；不得把候选集原样堆入成稿。
- `source.md` frontmatter 只允许 `title`、`summary`、`cover_prompt`。
- frontmatter 之后的 Markdown 正文是唯一 `正文基准`。
- `final.html` 只能由 `正文基准` 生成，不得读取 frontmatter。
- `assets/cover-layout-reference.png` 是封面唯一参考图与唯一版式锚点；文字提示只允许补强，不允许替代。
- 封面图主链路固定为模型生成；不得把 `qlmanage`、Chromium 截图、SVG 栅格化或其他宿主特定实现声明为主交付链路。
- 未经用户明确允许，不得增删改 `新闻简报` 中的事实、数字、时间、引用、来源、链接和结论。
- 未经用户明确允许，不得新增解释性判断、趋势推演、修辞性补充或背景性扩写。
- 落地时只能直接写入用户给定目录，不得额外创建子目录。

## 执行流程

### Step 1：输入归一

- 解析 `topic`、`time_input`、`need_cover`、`need_export`、`output_dir`，并将 `time_input` 换算为绝对 `检索时间窗`。
- 用户未给时间时固定使用最近 30 天。

### Step 2：新闻检索

- 发现当前环境可用的新闻或网页搜索能力。
- 按 `topic + time_input + 新闻` 构建 query。
- 执行扩面检索、过滤、去重、分类、排序，生成 `新闻简报`。
- 默认先形成 `12-20` 条候选，再筛成 `8-12` 条最终入稿；用户指定数量时按用户要求处理。
- 默认按四字分类收束：`国内要闻`、`民生服务`、`科技产业`、`国际局势`、`市场动态`。
- 当请求为“今日热点 / 今日要闻 / 热点新闻”类宽主题时，优先覆盖上述 5 类中的至少 4 类；明显不适配的类别允许留空，但不得伪造补位。
- 无搜索能力、结果为空或字段不完整时，必须显式失败。

`新闻简报` 每条至少保留：

- `标题`
- `来源`
- `发布时间`
- `摘要`
- `正文`
- `链接`

### Step 3：源件生成

基于 `新闻简报` 生成 `source.md`：

1. frontmatter：
   - `title`
   - `summary`
   - `cover_prompt`
2. Markdown 正文：
   - `# 标题`
   - 摘要导语
   - 固定结论块
   - 分类结构
   - 新闻正文
   - 原始链接索引

规则：

- `title` 不超过 64 字。
- `summary` 不超过 120 字。
- `cover_prompt` 必填。
- 正文首个 `# 标题` 必须与 frontmatter `title` 完全一致。
- 正文首段必须与 frontmatter `summary` 完全一致。
- 正文分类标题优先使用四字标签；除非主题天然不适配，否则不改成随意长标题。
- 固定结论块只允许 `1-2` 句，直接归纳当日主线，不展开分析。
- 每条新闻正文默认压缩为 `2-3` 句客观事实，只保留事件、动作、直接影响。
- 正文必须简约、集中，不得把单条新闻扩写成评论、专栏或背景长文。
- frontmatter 只承载元数据，不替正文补内容。
- 未经用户允许，不得静默删除已纳入条目。

### Step 4：HTML 生成

- 最终 HTML 固定采用 `references/html-style-spec.md`。
- 只能使用 `scripts/render-wechat-news-html.js`。
- HTML 只能根据 `正文基准` 生成。
- HTML 阶段不得改写正文事实、结构或结论。
- 用户要求其他 HTML 风格时，保持固定版式，不切换。

### Step 5：封面图生成

仅当 `need_cover=true` 时执行。

- 必须读取 `assets/cover-layout-reference.png` 作为唯一参考图与唯一版式锚点。
- 必须使用当前环境的模型生图能力生成 `scover.png`。
- 提示词输入固定来自 `title`、`summary`、`cover_prompt` 与正文中提炼出的 `5-6` 个热点卡片。
- 目标不是像素复制，而是与参考图保持同构：左侧大标题区、顶部深色识别条、右侧 `5-6` 张热点卡片、暖米白棕金配色、至少 `1` 张深色锚点卡片。
- 左侧标题区应在参考图安全区内略向左收，和顶部识别条、导语区形成更稳定的左对齐线。
- 日期只作时间锚点，字号较“热点新闻速览”类主标题缩小约 `10%`，不得压过主标题。
- 右侧必须保持固定卡片矩阵家族；卡片尺寸与排序可在参考图版式家族内自适应，不得自由流式排版，也不得机械写死为等宽等高 `3x2`。
- 文字提示只负责补强日期、主标题、卡片短标题和主题气质；核心规则固定为：`封面必须以参考图为唯一版式锚点，模型只允许替换主题内容，不允许替换整体构图。`
- 首轮结果若出现错字、信息缺失或版式明显漂移，可最多补 `2` 次重试。
- 当前环境没有可用图像生成能力时，封面图链路失败。

### Step 6：文件落地

仅当 `need_export=true` 时执行。标准路径固定为：

- `{output_dir}/source.md`
- `{output_dir}/final.html`
- `{output_dir}/scover.png`

规则：

- 直接写入用户指定目录。
- 不额外创建子目录。
- 未请求封面图时，不生成 `scover.png`。
- 任一写入失败都必须显式报错。

## 用户交互规则

1. 信息足够时直接执行，不先给多版方案。
2. 用户要求其他 HTML 风格或封面风格时，直接说明本技能只支持固定版式。
3. 用户要求落地时，不得改写文件名或目录结构。
4. 用户要求“更像某某风格”但未要求放弃当前技能时，只保留内容要求，不接受版式变体。
5. 用户要求只要某个产物时，可少交付，但不得改变已交付产物格式。
6. 用户要求导出最终文件时，不得手写 `final.html` 或 `scover.png`。

## 输出契约

以 `references/output-contract.md` 为准。

未要求落地时，直接返回：

- `source.md` 完整内容
- `final.html` 完整内容
- 若 `need_cover=true` 且环境可生图，返回封面图结果

要求落地时，只返回：

- 实际写入的 `source.md` 路径
- 实际写入的 `final.html` 路径
- 若适用，实际写入的 `scover.png` 路径
- 验证结论与失败项

## 质量门禁

必须同时满足：

- `事实一致`：`source.md` 与 `新闻简报` 不冲突，不漏条目。
- `正文独立`、`HTML 单源`、`元数据隔离`：正文可独立成立，`final.html` 只来自正文，且不读取 `title`、`summary`、`cover_prompt`。
- `参考图收束`、`版式一致`、`宿主解耦`：封面图必须使用 `assets/cover-layout-reference.png` 并保持同构，不把宿主特定栅格化工具声明为主交付链路。
- `路径准确`、`结果可验收`、`企业门禁`：落地路径准确、结果可核验，并以 `references/enterprise-quality-gates.md` 为最终门禁。

## 失败处理

- 搜索能力不可用：停止并说明无法完成实时新闻检索。
- 检索结果为空：返回未找到结果，不伪造源件与 HTML。
- `新闻简报` 字段不完整：丢弃异常条目；有效条目不足时显式说明。
- 标题或摘要无法在长度限制内保持主旨：提示用户收窄主题或确认压缩。
- HTML 生成失败：保留 `source.md`，显式报告原因。
- 缺少 `assets/cover-layout-reference.png`：封面图链路失败。
- 当前环境无图像生成能力：封面图链路失败。
- 封面图多次重试后仍明显偏离参考图：保留 `source.md` 与 `final.html`，显式报告失败。
- 用户给定目录不可写：停止落地并报告具体路径错误。
- 用户坚持要求自定义封面风格：判定为超出本技能边界。
- 脚本验证失败：不得声称链路可用。

## 验证与回归

修改后至少走查以下场景：

1. `生成人工智能最近一周的公众号新闻稿，带封面图，保存到 outputs/ai/`
2. `生成中东局势昨日的公众号新闻稿，不要封面图，只返回结果`
3. `生成苹果 WWDC 相关新闻 HTML，保存到 outputs/apple/`
4. `生成茅台股价新闻稿`
5. `按极简黑金风格生成今天热点新闻封面和 HTML`
6. 运行 `scripts/verify-wechat-news-publisher.js`

验收点：

- 场景 1：能产出 `source.md`、`final.html`、`scover.png`。
- 场景 2：不落地，且不生成封面图。
- 场景 3：HTML 只来自正文，不吃元数据。
- 场景 4：若主题实为行情/股价数据请求，能识别为边界场景并停止误触发。
- 场景 5：仍保持参考图同构，不因风格请求漂移；文字提示只能补强，不得替代参考图版式锚点。
- 场景 6：本地脚本验证通过，且人工对照 `assets/cover-layout-reference.png` 可确认封面版式一致。

## 维护原则

- 保持六条主轴稳定：`新闻简报事实基准`、`正文 HTML 单源`、`固定目录`、`固定 HTML 版式`、`固定封面参考图`、`固定输出文件名`。
- 新增规则只能补强闭环，不得重新引入多主题、多版式、多轮审稿或技能外依赖。
- 封面链路变更时，必须同步复核 `SKILL.md`、`references/cover-style-spec.md`、`references/output-contract.md`、`references/enterprise-quality-gates.md`、`assets/cover-layout-reference.png` 与验证脚本。
