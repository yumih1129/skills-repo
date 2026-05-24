# SKILLS Hub

SKILLS Hub 是一个面向 Codex 与 OpenClaw 的技能展示站点，用于统一呈现仓库中的 SKILL 元数据、使用手册与评估报告。

## 技术栈

- Next.js 14（App Router）
- TypeScript
- Tailwind CSS
- shadcn/ui 风格设计

## 本地运行

```bash
cd ui
npm install
npm run dev
```

启动后访问：`http://localhost:3000`

## 构建

```bash
npm run build
```

构建产物输出至 `out/` 目录。

## GitHub Pages 部署

本项目已适配 GitHub Pages 与 GitHub Actions 自动部署。

1. 在仓库设置中启用 GitHub Pages。
2. 将发布源设置为 GitHub Actions。
3. 推送至 `main` 分支后自动构建并发布。

部署地址示例：`https://[username].github.io/skills-repo/`

## 目录结构

```text
ui/
├── src/
│   ├── app/        # Next.js 页面与布局
│   ├── components/ # 页面组件
│   ├── data/       # 技能数据读取
│   ├── generated/  # 构建期生成的数据
│   └── lib/        # 工具函数
├── public/         # 静态资源
└── out/            # 构建输出
```

## SKILL 图标渲染说明

系统支持三类图标来源，渲染规则如下。

### 1. `emoji`

- 适用于旧格式或直接表意图标。
- 按统一容器居中显示。
- 以字符语义为主，保持最小侵入式展示。

示例：

```json
{
  "iconType": "emoji",
  "icon": "📰"
}
```

### 2. `library`

- 适用于图标库名称，例如 `lucide`。
- 通过对应图标库动态映射并渲染。
- 统一使用当前主题色与固定尺寸，保证样式一致。

示例：

```json
{
  "iconType": "library",
  "iconLibrary": "lucide",
  "icon": "Wrench"
}
```

### 3. `svg`

- 适用于内联 SVG 字符串。
- 渲染前统一处理尺寸与颜色属性，保留 `viewBox`。
- 使用 `currentColor` 继承主题颜色，保证浅色与深色模式一致。

示例：

```json
{
  "iconType": "svg",
  "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\"/></svg>"
}
```

### 渲染要求

- 同一页面内的图标容器尺寸必须统一。
- 不同来源的图标不得出现视觉尺度不一致。
- 图标仅负责语义表达，不应破坏卡片和详情面板的版式秩序。
