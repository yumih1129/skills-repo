# SKILL 使用手册生成器 使用手册

## 技能概述

**技能名称**：SKILL 使用手册生成器

**标识**：`skill-manual-generate`

**版本**：1.1.0

**功能**：读取任意 SKILL 目录，理解其能力与边界，根据目标复杂度与用户意图自动选择标准或极简模板，生成以 slug 命名的中文 Markdown 使用手册。

---

## 快速开始

### 基本用法

直接给出目标 SKILL 目录路径和输出目录即可，例如：

```text
生成 .agents/skills/skill-stabilize 的操作手册，放在 docs 目录下
```

```text
把 .agents/skills/news-briefing-search 做成使用手册，极简风格
```

```text
参考 docs/skill-create.md 的结构，为 .agents/skills/skill-evaluate 生成手册
```

---

## 功能特性

### 支持的能力

| 能力 | 说明 |
|------|------|
| 目录级通读 | 按字典序扫描目标 SKILL 全部文件，包括 `references/`、`scripts/`、`assets/` 及同目录其他说明性文件，不只看 `SKILL.md` 和 `_meta.json` |
| 自动模板选择 | 根据目标 SKILL 复杂度（目录结构、流程复杂度、模板/脚本/素材数量）和用户意图，自动在标准模板与极简模板间选择 |
| 参考结构学习 | 用户提供参考手册路径时，借鉴其标题结构、章节顺序和表达语气，但不复制领域内容 |
| slug 命名落盘 | 输出文件名固定取自目标 `_meta.json` 的 `slug` 字段，输出路径为 `{output_dir}/{slug}.md` |
| 质量门禁与自检 | 生成后自动检查结构完整性、内容可追溯性、路径规范性和模板匹配度 |
| 失败安全处理 | 目标目录缺失、关键文件不全、slug 非法时停止并给出明确修复建议，不编造内容 |

---

## 使用方式

### 适合的输入

- 明确给出目标 SKILL 目录路径（如 `.agents/skills/xxx`）和输出目录
- 可用 `template_style` 指定模板风格：`standard`（标准）、`minimal`（极简）或 `auto`（自动判断）
- 可选提供参考手册路径，借鉴其结构和语气
- 可自定义手册标题（`doc_title`），未指定时默认使用“{技能名称} 使用手册”

### 执行特点

- 阶段化执行：确认任务 → 通读目标 SKILL → 学习参考结构 → 起草 → 写入 → 自检验收
- 所有手册内容必须可追溯到目标 SKILL 的实际文件，不编造未声明的能力、流程或输出
- 默认输出到当前工作区根目录（未指定 `output_dir` 时）
- 目标文件已存在时默认整体重写，不会在旧稿末尾追加

---

## 输出结果

- 输出文件：`{output_dir}/{slug}.md`，标准 Markdown 格式，中文
- 标准模板成稿包含：概述、快速开始、功能特性、使用方式、输出结果、示例、注意事项、适用场景、相关文件
- 极简模板成稿保留：概述、如何使用、能力、输出、示例、注意事项、相关文件
- 生成工作单记录：目标目录、输出目录、slug、标题、模板来源、模板选择依据、已读取文件、已排除文件

---

## 使用示例

### 示例 1：主流程 — 标准模板自动生成

**输入**：

```text
生成 .agents/skills/skill-create 的操作手册，放在 docs 目录下
```

技能通读目标目录全部文件 → 判断 SKILL.md 含多阶段/分支/失败处理，自动选标准模板 → 输出 `docs/skill-create.md`。

### 示例 2：边界 — 目标目录缺失关键文件

**输入**：

```text
生成 .agents/skills/incomplete-skill 的手册
```

技能检测到目标目录缺少 `SKILL.md` 或 `_meta.json`，停止生成并明确指出缺失项和修复建议。

### 示例 3：输出产物 — 用户指定极简风格

**输入**：

```text
用极简模板为 .agents/skills/requirements-brief 生成手册
```

技能按 `template_style=minimal` 直接使用极简模板，输出精简版手册，省略功能特性表格等展开章节。

---

## 注意事项

1. 目标目录至少需要 `SKILL.md` 和 `_meta.json`，二者缺一即停止生成。
2. 手册面向使用者，不面向设计者；重点写“如何使用”，不是写设计背景。
3. 不得编造目标 SKILL 未声明的能力、流程、资源、输出或权限——所有内容必须可追溯。
4. 极简模板仅在用户明确要求或目标 SKILL 极简条件全部满足时使用，否则默认标准模板。
5. 输出文件名固定为 `slug + .md`，不得擅自改用 `.txt`、`.mdx` 或其他格式。
6. 若目标能力边界不清，优先保守归纳，不得用主观猜测补齐。

---

## 适用场景

- 为已有 SKILL 生成正式、可交付的中文使用手册
- 将零散的 SKILL 目录整理为结构化的说明文档
- 希望手册文件名与 SKILL 的 `slug` 保持一致
- 参考既有手册风格，为另一套 SKILL 生成风格统一的手册
- 批量生成多个 SKILL 的使用手册（逐个调用）

---

## 相关文件

- 技能定义：`.agents/skills/skill-manual-generate/SKILL.md`
- 元数据：`.agents/skills/skill-manual-generate/_meta.json`
- 标准模板：`.agents/skills/skill-manual-generate/references/doc-template.md`
- 极简模板：`.agents/skills/skill-manual-generate/references/doc-template-minimal.md`
