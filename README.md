# skills-repo

`skills-repo` 是一个用于维护 SKILL 资源的仓库，包含技能元数据、技能说明、使用手册、评估报告，以及对应的 GitHub Pages 展示站点。

仓库内容分为两层：

- 内容层：`skills/`、`docs/`、`evaluations/`
- 展示层：`ui/`，负责把上述内容渲染为可浏览的静态站点

## 仓库结构

```text
.
├── .github/workflows/    # GitHub Actions 工作流
├── docs/                 # 技能使用手册源文件（Markdown）
├── evaluations/          # 技能评估报告源文件（Markdown）
├── skills/               # SKILL 定义目录，每个技能一个子目录
│   └── <skill-slug>/
│       ├── SKILL.md
│       └── _meta.json
├── ui/                   # Next.js 静态站点
├── .gitignore
├── LICENSE
└── README.md
```

当前 `skills/` 下已包含以下技能：

- `news-briefing-search`
- `requirements-brief`
- `skill-create`
- `skill-evaluate`
- `skill-manual-generate`
- `skill-stabilize`

## 数据说明

每个技能目录至少包含两个核心文件：

- `SKILL.md`：技能定义与说明
- `_meta.json`：结构化元数据，用于站点展示和索引

仓库还维护两类补充文档：

- `docs/`：面向使用者的技能使用手册
- `evaluations/`：面向质量审阅的技能评估报告

`ui/` 在构建时会读取这些源文件，并生成展示站点所需资源。

## 维护流程

推荐流程如下：

1. 在 `skills/<slug>/` 下维护 `SKILL.md` 和 `_meta.json`
2. 在 `docs/` 下补充对应手册，例如 `docs/<slug>.md`
3. 在 `evaluations/` 下补充对应评估，例如 `evaluations/<slug>.md`
4. 进入 `ui/` 完成站点侧验证、构建与发布检查
5. 提交并推送仓库变更

## 说明

- 根目录 `LICENSE` 为整个仓库的许可证文件
- 根目录 `.gitignore` 用于忽略仓库级别的本地环境文件与缓存
- `ui/.gitignore` 仅处理前端子项目内部的依赖和构建产物

## 相关文档

- 前端展示站说明：[`ui/README.md`](ui/README.md)
