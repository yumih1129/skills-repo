# SKILL 使用手册生成器 使用手册

## 技能概述

**技能名称**：SKILL 使用手册生成器

**标识**：`skill-manual-generate`

**版本**：1.1.0

**功能**：读取任意 SKILL 目录，理解其能力与边界，并根据目标复杂度与用户意图自动选择标准或极简模板，生成以 slug 命名的中文使用手册。

---

## 快速开始

### 基本用法

直接指定目标 SKILL 目录即可生成手册，例如：

```text
生成".agents/skills/news-briefing-search"操作手册
为这个SKILL生成使用手册，放在docs目录
帮我把 skill-create 目录整理成使用手册
```

---

## 功能特性

### 支持的能力

| 能力 | 说明 |
|------|------|
| 完整目录理解 | 通读目标 SKILL 全部有效内容，不止 SKILL.md 和 _meta.json |
| 模板自动选择 | 根据目标复杂度和用户意图自动选择标准或极简模板 |
| 参考手册借鉴 | 支持用户提供参考手册借鉴结构和语气 |
| 固定命名规则 | 输出文件名固定取自目标 _meta.json 中的 slug |
| 自定义输出 | 支持指定输出目录，未指定时默认当前工作区根目录 |

### 模板类型

| 模板 | 适用条件 |
|------|----------|
| 标准模板 | 用户要求正式/完整/交付型输出；目标含 scripts/assets/references>1；含多阶段/复评/分支/失败处理 |
| 极简模板 | 用户要求极简/简约输出；目标无 scripts/assets；references≤1；单一主要流程无复杂分支 |

---

## 使用方式

### 必需输入

- `skill_dir`：目标 SKILL 目录路径

### 可选输入

- `output_dir`：手册输出目录，默认当前工作区根目录
- `reference_doc_path`：参考手册路径，借鉴其结构和语气
- `template_style`：模板风格，auto/standard/minimal，默认 auto
- `doc_title`：手册标题，默认"{技能名称} 使用手册"

### 执行流程

#### 阶段 0: 确认任务

- 确认 skill_dir 存在且可读
- 确定 output_dir 和 reference_doc_path
- 扫描目标目录，建立阅读清单
- 选择模板（standard/minimal/auto）

#### 阶段 1: 读取与理解目标 SKILL

- 通读目标目录下全部有效内容
- 按路径字典序读取 .md/.json/.yml/.py/.sh/.js 等文件
- 提取：技能名称、核心用途、触发场景、输入要求、主流程、输出、不适用场景

#### 阶段 2: 学习参考结构

- 若提供 reference_doc_path，借鉴其结构和语气
- 若无，按 template_style 读取默认模板

#### 阶段 3: 起草手册

- 按模板填写，至少提供 3 组示例（主流程示例、边界/失败示例、输出示例）
- 所有内容必须源自目标 SKILL 真实能力，不得编造

#### 阶段 4: 写入文件

- 从 _meta.json 读取 slug
- 输出路径：{output_dir}/{slug}.md
- 默认整体重写，不在旧稿末尾追加

#### 阶段 5: 自检与验收

- 验证文件名、核心章节、示例匹配、路径正确性

---

## 输出结果

- 输出文件：`{output_dir}/{slug}.md`
- 格式：标准 Markdown
- 语言：中文
- 文件名固定取自目标 _meta.json 的 slug 字段

---

## 使用示例

### 示例1

**输入**：

```text
生成".agents/skills/news-briefing-search"操作手册
```

**输出**：

`docs/news-briefing-search.md`，包含该 SKILL 的概述、快速开始、功能特性、使用方式、示例、注意事项等章节。

### 示例2

**输入**：

```text
为 skill-create 生成手册，放在 docs 目录，template_style=minimal
```

**输出**：

`docs/skill-create.md`，使用极简模板输出（若满足全部极简条件）。

### 示例3

**输入**：

```text
帮我把这个SKILL整理成手册，参考已有手册 docs/skill-evaluate.md
```

**输出**：

借鉴参考手册的结构和语气，生成符合目标 SKILL 真实能力的使用手册。

---

## 注意事项

1. 先理解目标 SKILL，再按模板输出，不得在未读懂能力边界时套模板
2. 手册内容必须可追溯到目标 SKILL 的实际文件，不得编造能力
3. 目标目录需存在 SKILL.md 和 _meta.json，否则停止生成
4. 若提供参考手册，只借鉴结构和语气，不借鉴目标能力之外的内容
5. 输出文件名固定取自 _meta.json 中的 slug，不受用户指定影响

---

## 适用场景

- 用户要求为某个现有 SKILL 生成"使用手册"或"说明文档"
- 用户给出一个 SKILL 目录，要求自动整理为标准 Markdown 文档
- 用户希望手册文件名与目标 SKILL 的 slug 保持一致
- 用户要求参考既有手册风格，但内容必须来自另一套 SKILL 文件

---

## 相关文件

- 技能定义：`.agents/skills/skill-manual-generate/SKILL.md`
- 元数据：`.agents/skills/skill-manual-generate/_meta.json`
- 标准模板：`.agents/skills/skill-manual-generate/references/doc-template.md`
- 极简模板：`.agents/skills/skill-manual-generate/references/doc-template-minimal.md`
