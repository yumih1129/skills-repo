#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const htmlRenderer = require('./render-wechat-news-html.js');

const SKILL_ROOT = path.resolve(__dirname, '..');
const COVER_REFERENCE_PATH = path.join(SKILL_ROOT, 'assets', 'cover-layout-reference.png');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
}

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'wechat-news-publisher-'));
}

function readPngSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  const signature = buffer.subarray(0, 8).toString('hex');
  assert(signature === '89504e470d0a1a0a', `Not a PNG file: ${filePath}`);
  const chunkType = buffer.subarray(12, 16).toString('ascii');
  assert(chunkType === 'IHDR', `PNG must contain IHDR as the first chunk: ${filePath}`);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function writeFixture(dir) {
  const sourcePath = path.join(dir, 'source.md');
  const content = [
    '---',
    'title: "2026年6月1日热点新闻速览"',
    'summary: "今天的重点集中在政策、科技、市场和民生四条主线。"',
    'cover_prompt: "横版微信公众号封面，参考图同构版式，暖米白与棕褐浅金配色，左侧大标题区，右侧热点卡片矩阵，禁用水印、乱码、密集小字。"',
    '---',
    '',
    '# 2026年6月1日热点新闻速览',
    '',
    '今天的重点集中在政策、科技、市场和民生四条主线。',
    '',
    '> 今天最值得关注的，不是单条爆点，而是多条主线同步推进的节奏变化。',
    '',
    '## 今日热点分布',
    '',
    '| 分类 | 代表事件 | 观察关键词 |',
    '| --- | --- | --- |',
    '| 国内要闻 | 政策发布 | 执行边界 |',
    '| 科技产业 | 产业进展 | 落地能力 |',
    '',
    '## 国内要闻',
    '',
    '### 政策边界继续细化',
    '',
    '多项新规开始进入更具体的执行阶段，重点是把责任链条和公众预期进一步说清楚。',
    '',
    '- 规则更清楚',
    '- 执行更明确',
    '',
    '## 科技体育',
    '',
    '### 技术开始走向现实场景',
    '',
    '从展会到产业应用，新的科技热点正在从概念展示转向真实落地。',
    '',
    '> 技术类新闻的价值，越来越取决于它是否进入真实场景。',
    '',
    '## 原始报道链接',
    '',
    '- 新华社：https://example.com/a',
    '- 央视新闻：https://example.com/b',
    ''
  ].join('\n');
  fs.writeFileSync(sourcePath, content, 'utf8');
  return sourcePath;
}

function verifyHtml(sourcePath, dir) {
  const htmlPath = path.join(dir, 'final.html');
  const html = htmlRenderer.renderToHtml(sourcePath);
  fs.writeFileSync(htmlPath, html, 'utf8');

  assert(html.includes('<!DOCTYPE html>'), 'HTML must include doctype.');
  assert(html.includes('<article style='), 'HTML must include a single article container.');
  assert(html.includes('快速结论'), 'HTML must render the fixed callout label.');
  assert(html.includes('border-bottom:1px solid #dcc8b5;'), 'HTML must keep the fixed h2 separator style.');
  assert(!html.includes('cover_prompt'), 'HTML must not leak cover_prompt.');
  assert(!html.includes('title: "2026年6月1日热点新闻速览"'), 'HTML must not render frontmatter text.');
}

function verifyValidationFailure(dir) {
  const badPath = path.join(dir, 'bad-source.md');
  const badContent = [
    '---',
    'title: "不一致标题"',
    'summary: "摘要不同"',
    'cover_prompt: "横版微信公众号封面，参考图同构版式，暖米白与棕褐配色。"',
    '---',
    '',
    '# 另一个标题',
    '',
    '另一个摘要。',
    '',
    '## 原始报道链接',
    '',
    '- 示例：https://example.com',
    ''
  ].join('\n');
  fs.writeFileSync(badPath, badContent, 'utf8');

  let failed = false;
  try {
    htmlRenderer.renderToHtml(badPath);
  } catch (error) {
    failed = /must exactly match frontmatter title|must exactly match frontmatter summary|fixed conclusion block/.test(String(error.message || error));
  }
  assert(failed, 'Renderer must reject drift between frontmatter and reader-visible body.');
}

function verifyReferenceAsset() {
  assert(fs.existsSync(COVER_REFERENCE_PATH), 'Cover reference asset must exist.');
  const { width, height } = readPngSize(COVER_REFERENCE_PATH);
  assert(width > 0 && height > 0, 'Cover reference PNG dimensions must be positive.');
  const ratio = width / height;
  assert(ratio > 1.7 && ratio < 1.9, `Cover reference aspect ratio looks wrong: ${ratio}`);
}

function verifyAuthorityDocs() {
  const skill = readUtf8(path.join(SKILL_ROOT, 'SKILL.md'));
  const coverSpec = readUtf8(path.join(SKILL_ROOT, 'references', 'cover-style-spec.md'));
  const outputContract = readUtf8(path.join(SKILL_ROOT, 'references', 'output-contract.md'));
  const gates = readUtf8(path.join(SKILL_ROOT, 'references', 'enterprise-quality-gates.md'));
  const combined = [skill, coverSpec, outputContract, gates].join('\n');

  assert(skill.includes('assets/cover-layout-reference.png'), 'SKILL must reference the internal cover asset.');
  assert(skill.includes('默认先形成 `12-20` 条候选，再筛成 `8-12` 条最终入稿'), 'SKILL must define the widened search and narrowed publish set.');
  assert(skill.includes('每条新闻正文默认压缩为 `2-3` 句客观事实'), 'SKILL must keep source writing compressed.');
  assert(skill.includes('左侧标题区应在参考图安全区内略向左收'), 'SKILL must require a slightly left-shifted title block within the reference safe area.');
  assert(skill.includes('日期只作时间锚点，字号较“热点新闻速览”类主标题缩小约 `10%`'), 'SKILL must keep the date subordinate to the main headline.');
  assert(coverSpec.includes('唯一版式参考：`assets/cover-layout-reference.png`'), 'Cover spec must pin the reference image.');
  assert(coverSpec.includes('唯一版式锚点：`assets/cover-layout-reference.png`'), 'Cover spec must pin the reference image as the layout anchor.');
  assert(coverSpec.includes('固定矩阵家族'), 'Cover spec must keep the right-side cards in a fixed matrix family.');
  assert(coverSpec.includes('日期只作时间锚点，字号较“热点新闻速览”类主标题缩小约 `10%`'), 'Cover spec must keep the date as a secondary anchor.');
  assert(gates.includes('`scover.png` 必须使用模型生成'), 'Enterprise gates must require model-generated cover.');
  assert(gates.includes('文字提示只允许补强，不得替代'), 'Enterprise gates must keep text prompts as supplementary cover constraints.');
  assert(gates.includes('日期必须仅作时间锚点，字号较主标题缩小约 `10%`'), 'Enterprise gates must enforce date hierarchy.');
  assert(outputContract.includes('`source.md(title, summary, cover_prompt, 正文结构) + assets/cover-layout-reference.png -> scover.png`'), 'Output contract must define the cover dependency chain.');

  const forbidden = [
    'WECHAT_NEWS_BROWSER_BIN',
    'macOS 宿主',
    'legacy-render-wechat-news-cover.js',
    'Chromium headless',
  ];
  for (const marker of forbidden) {
    assert(!combined.includes(marker), `Authority docs must not rely on legacy cover chain marker: ${marker}`);
  }
}

function main() {
  const dir = makeTempDir();
  try {
    verifyReferenceAsset();
    verifyAuthorityDocs();
    const sourcePath = writeFixture(dir);
    verifyHtml(sourcePath, dir);
    verifyValidationFailure(dir);
    process.stdout.write('wechat-news-publisher verification passed.\n');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
