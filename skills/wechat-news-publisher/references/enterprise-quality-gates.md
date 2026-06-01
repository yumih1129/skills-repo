# 企业级质量门禁

交付前必须同时通过以下门禁。

## Gate 1：输入门

- 输入字段已归一为 `topic`、`time_input`、`need_cover`、`need_export`、`output_dir`
- 阻塞性缺口已补齐
- 本轮请求未超出技能边界

## Gate 2：事实门

- 已形成结构化 `新闻简报`
- 每条新闻具备标题、来源、发布时间、摘要、正文、链接
- 已先形成扩面候选集，再筛成最终入稿集
- 宽主题场景下，最终入稿优先覆盖 `国内要闻`、`民生服务`、`科技产业`、`国际局势`、`市场动态` 中至少 `4` 类
- 未发生无授权的条目删减或事实改写

## Gate 3：源件门

- `source.md` frontmatter 仅包含 `title`、`summary`、`cover_prompt`
- 正文以 `# 标题` 起始
- 正文首段与 `summary` 一致
- 正文在首个 `##` 前包含固定结论块
- 正文末尾包含“原始报道链接 / 原始报道索引”章节
- 固定结论块简短直接
- 单条新闻正文默认收束为 `2-3` 句客观事实，不含无授权的解释性扩写或趋势推演

## Gate 4：渲染门

- `final.html` 必须由 `scripts/render-wechat-news-html.js` 生成
- `scover.png` 必须使用模型生成
- `scover.png` 必须以 `assets/cover-layout-reference.png` 作为唯一版式参考
- `assets/cover-layout-reference.png` 同时是唯一版式锚点；文字提示只允许补强，不得替代
- 左侧标题区必须在参考图安全区内保持稳定左对齐
- 日期必须仅作时间锚点，字号较主标题缩小约 `10%`
- 右侧必须保持固定卡片矩阵家族，不得自由流式排版，也不得机械写死为等宽等高 `3x2`
- HTML 不得读取 frontmatter
- 不得把 `qlmanage`、Chromium 截图、SVG 栅格化或其他宿主特定链路声明为主封面链路

## Gate 5：输出门

- 只写入 `{output_dir}/source.md`、`{output_dir}/final.html`、`{output_dir}/scover.png`
- 未请求封面图时，不生成 `scover.png`
- 任一写入失败即整项失败，不伪造成功

## Gate 6：验证门

- 运行 `scripts/verify-wechat-news-publisher.js`
- 验证通过后才允许声称本地链路可用
- 修改封面规则后，必须人工对照 `assets/cover-layout-reference.png` 复核版式一致性
- 修改 `SKILL.md`、`references/`、`assets/`、`scripts/` 中任一关键文件后，都应重新执行验证
