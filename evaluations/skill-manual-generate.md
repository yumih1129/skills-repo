# skill-manual-generate 使用手册

## 技能概述

**技能名称**：skill-manual-generate

**标识**：`skill-manual-generate`

**版本**：1.1.0

**功能**：读取任意 SKILL 目录，理解其能力与边界，并根据目标复杂度与用户意图自动选择标准或极简模板，生成以 slug 命名的中文使用手册。

---

## 快速开始

### 基本用法

直接描述你的任务需求即可触发该技能，例如：

```text
为 .agents/skills/skill-evaluate 生成使用手册
```

```text
根据 skill-dir 生成对应的使用手册，输出到 docs/ 目录
```

```text
把 wechat-writer 这个技能的使用手册生成出来
```

---

## 功能特性

### 支持的能力

| 能力 | 说明 |
|------|------|
| 完整目录理解 | 通读目标 SKILL 目录下的全部有效内容，包括 SKILL.md、_meta.json、references/、scripts/、assets/ |
| 智能模板选择 | 根据目标 SKILL 复杂度与用户意图自动选择标准或极简模板 |
| 规范输出 | 输出为以 slug 命名的标准 Markdown 格式中文使用手册 |
| 自定义输出位置 | 支持指定输出目录，未指定时默认写入当前工作区根目录 |
| 参考风格 | 若提供参考手册路径，可借鉴其结构和语气 |

---

## 使用方式

### 适合的输入

- 目标 SKILL 的目录路径（如 `.agents/skills/skill-evaluate`）
- 期望的手册输出目录（如 `docs/`）
- 参考手册路径（可选，用于借鉴结构和语气）
- 模板风格偏好：`auto`（默认）、`standard` 或 `minimal`（可选）
- 手册标题（可选，默认使用"{技能名称} 使用手册"）

### 执行特点

- 先完整理解目标 SKILL，再按最合适的模板输出 Markdown 文档
- 不得在未读懂能力边界的情况下套模板生成
- 所有手册内容必须可追溯到目标 SKILL 的实际文件
- 同一输入在同一版本下必须按相同的读取顺序、模板选择顺序和落盘规则处理
- 手册面向使用者，重点写"如何使用"，不是写设计背景

---

## 输出结果

- 目标文件路径：`{output_dir}/{slug}.md`
- slug 固定取自目标目录 `_meta.json` 中的 `slug` 字段
- 输出格式为标准 Markdown
- 输出文档默认语言为中文

---

## 使用示例

### 示例1：生成标准手册

**输入**：

```text
为 .agents/skills/skill-evaluate 生成使用手册，输出到 docs/
```

**输出**：

生成 `docs/skill-evaluate.md`，包含技能概述、快速开始、功能特性、使用方式、输出结果、使用示例、注意事项等章节。

### 示例2：指定极简风格

**输入**：

```text
生成 skill-manual-generate 的使用手册，模板风格设置为 minimal
```

**输出**：

生成 `docs/skill-manual-generate.md`，使用极简模板，保留核心章节（概述、如何使用、能力、输出、示例、注意事项）。

### 示例3：参考既有风格

**输入**：

```text
根据 docs/skill-evaluate.md 的风格，为 skill-stabilize 生成使用手册
```

**输出**：

生成 `docs/skill-stabilize.md`，借鉴参考手册的标题结构、章节顺序和语气风格，但内容完全来自目标 SKILL 的真实能力。

---

## 注意事项

1. **不得编造能力**：所有手册内容必须可追溯到目标 SKILL 的实际文件，不得编造未声明的能力、流程、资源、输出或权限
2. **目录级理解**：必须以"目录级理解"为前提，不得只读取 `SKILL.md` 和 `_meta.json` 就草率成稿
3. **slug 固定**：输出文件名固定取自目标目录 `_meta.json` 中的 `slug` 字段，扩展名固定为 `.md`
4. **相对路径**：文档中"相关文件"章节的目录路径统一使用相对当前工作区根目录的表示，不得出现绝对路径
5. **缺失关键文件时停止**：若目标目录缺失 `SKILL.md` 或 `_meta.json`，停止生成并明确指出缺失项，只提修复建议不编造内容
6. **不适用场景**：用户要创建新 SKILL 本体、只要求质量评估、或未提供可读取的 SKILL 目录时，不应触发本技能

---

## 相关文件

- 技能定义：`.agents/skills/skill-manual-generate/SKILL.md`
- 元数据：`.agents/skills/skill-manual-generate/_meta.json`
- 标准模板：`.agents/skills/skill-manual-generate/references/doc-template.md`
- 极简模板：`.agents/skills/skill-manual-generate/references/doc-template-minimal.md`
