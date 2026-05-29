# 维护复评清单

修改本技能或本技能资源后，按以下顺序复查：

1. 检查 `SKILL.md` 是否已把默认模式固定为“对话中审阅四段式源稿 + 最终 HTML”。
2. 检查 `SKILL.md` 是否已把 `title / summary / cover_prompt / markdown` 固定为第一核心步骤。
3. 检查 `SKILL.md` 是否已把 `title <= 64`、`summary <= 120`、`cover_prompt` 不进 HTML 写成硬约束。
4. 检查 `references/render-contract.md` 与 `references/usage-walkthroughs.md` 是否同步了 `source.md + final.html` 模式，以及可选微信封面图分支；若无，修正。
5. 抽查 `references/theme-spec.md` 与 `assets/theme-presets.js` 是否同步；若不同步，以技能内部主题规范为准修正。
6. 检查与 `wechat-html-composer` 的边界是否清楚，避免两个技能都声称默认“只输出最终 HTML”。
7. 检查封面图分支是否仍保持“HTML 在前、封面图在后、优化提示词不出现在输出物、封面图失败不阻塞 HTML、未落盘时仅在对话中返回结果”的固定约束。
8. 只有在修改脚本、显式落盘链路、批量主题导出链路，或让封面图分支进入脚本/导出链路后，才运行 `scripts/verify-render-wechat-article-html.js`；现有验证脚本覆盖 HTML/source 渲染链路与批量主题导出链路，不验证图像生成质量或图片文件内容。若当前修改只停留在规则层，仍需人工复查封面图分支约束是否与 `SKILL.md`、`references/render-contract.md`、`references/usage-walkthroughs.md` 一致。
