# WeChat News Publisher 使用手册

## 技能概述

**技能名称**：WeChat News Publisher

**标识**：`wechat-news-publisher`

**版本**：1.2.0

**功能**：基于指定主题与时间，一次性完成新闻检索、公众号源件生成、固定版式 HTML、模型封面图与指定目录落地。

---

## 快速开始

### 基本用法

直接描述你的任务需求即可触发该技能，例如：

```text
生成人工智能最近一周的公众号新闻稿，带封面图，保存到 outputs/ai/
```

```text
生成中东局势昨日的公众号新闻稿，不要封面图，只返回结果
```

```text
生成苹果 WWDC 相关新闻 HTML，保存到 outputs/apple/
```

---

## 功能特性

### 支持的能力

| 能力 | 说明 |
|------|------|
| 新闻检索 | 按主题与时间自动搜索、扩面、去重、分类、排序，生成结构化新闻简报 |
| 源件生成 | 从新闻简报生成固定格式的 source.md，含 frontmatter、结论块、分类结构与链接索引 |
| HTML 渲染 | 由 source.md 正文生成固定版式 HTML，暖白棕褐色系，编辑部专题风格 |
| 封面图生成 | 以参考图为版式锚点，通过模型生图能力生成与参考图同构的固定版式封面图 |
| 文件落地 | 按固定路径将 source.md、final.html、scover.png 写入指定目录 |

---

## 使用方式

### 适合的输入

- 指定明确的新闻主题，如“人工智能”“中东局势”“科技产业动态”
- 附时间范围，如“最近一周”“昨日”“2026年5月”，未指定时默认最近 30 天
- 需要完整发布产物（源件 + HTML + 封面）的公众号新闻发布场景
- 接受固定版式与固定封面风格，不需要自由定制版式

### 执行特点

- 完整六步流水线：输入归一 → 新闻检索 → 源件生成 → HTML 生成 → 封面图生成 → 文件落地
- 封面图与落地均为可选项，通过 `need_cover` 和 `need_export` 控制
- 新闻简报为唯一事实基准，源件、HTML、封面图均单向依赖简报
- 固定版式不可漂移，不支持用户自定义 HTML 风格或封面风格

---

## 输出结果

未要求落地时，直接返回：

- `source.md` 完整内容
- `final.html` 完整内容
- 若要求封面图且环境可生图，返回封面图

要求落地时（`need_export=true`），写入固定路径：

- `{output_dir}/source.md` — 唯一源件
- `{output_dir}/final.html` — 固定版式 HTML
- `{output_dir}/scover.png` — 固定版式封面图（仅 `need_cover=true` 时生成）

---

## 使用示例

### 示例1：主流程 — 完整发布

**输入**：

```text
生成人工智能最近一周的公众号新闻稿，带封面图，保存到 outputs/ai/
```

**预期产出**：`outputs/ai/source.md`、`outputs/ai/final.html`、`outputs/ai/scover.png`

---

### 示例2：边界场景 — 金融行情请求

**输入**：

```text
生成茅台股价新闻稿
```

**预期行为**：识别为股价/行情数据请求，判断为超出技能边界，停止并说明原因。

---

### 示例3：部分产物 — 只输出 HTML

**输入**：

```text
生成苹果 WWDC 相关新闻 HTML，保存到 outputs/apple/
```

**预期产出**：`outputs/apple/source.md`、`outputs/apple/final.html`（不生成封面图）

---

## 注意事项

1. **不接受自定义版式**：HTML 与封面图版式均为固定规范，若要求“极简黑金”“渐变风格”等，技能将拒绝并保持固定版式。
2. **新闻简报是唯一事实基准**：源件、HTML、封面图均基于简报生成，未经用户允许不得增删改简报中的事实、数字、时间、来源与结论。
3. **封面图依赖参考图与模型生图能力**：缺少 `assets/cover-layout-reference.png` 或当前环境无图像生成能力时，封面图链路失败，但源件与 HTML 仍可正常产出。
4. **需要搜索能力支持**：当前环境必须具备可用的新闻或网页搜索能力，否则新闻检索步骤将显式失败，不会伪造内容。
5. **落地路径固定**：文件直接写入用户指定目录，不额外创建子目录，文件名不可修改。

---

## 适用场景

- 按主题与时间生成公众号新闻稿并落地为完整发布资产
- 需要固定 HTML 版式、不接受风格变体的正式发布流程
- 需要固定封面版式、以参考图为唯一锚点的封面生成
- 一次性完成从检索到发布的全链路，无需多轮审稿或多主题并行

以下场景不适用：

- 只要新闻列表，不要发布产物
- 只要最终 HTML，不要源件与封面图
- 需要自由风格海报、插画或自定义封面
- 需要多轮审稿、多主题并行或多套版式切换

---

## 相关文件

- 技能定义：`.agents/skills/wechat-news-publisher/SKILL.md`
- 元数据：`.agents/skills/wechat-news-publisher/_meta.json`
- 输出契约：`.agents/skills/wechat-news-publisher/references/output-contract.md`
- HTML 版式规范：`.agents/skills/wechat-news-publisher/references/html-style-spec.md`
- 封面图规范：`.agents/skills/wechat-news-publisher/references/cover-style-spec.md`
- 企业质量门禁：`.agents/skills/wechat-news-publisher/references/enterprise-quality-gates.md`
- HTML 渲染脚本：`.agents/skills/wechat-news-publisher/scripts/render-wechat-news-html.js`
- 验证脚本：`.agents/skills/wechat-news-publisher/scripts/verify-wechat-news-publisher.js`
- 封面参考图：`.agents/skills/wechat-news-publisher/assets/cover-layout-reference.png`
