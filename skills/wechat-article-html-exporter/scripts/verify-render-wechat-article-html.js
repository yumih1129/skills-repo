#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const renderer = require('./render-wechat-article-html.js');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'wechat-article-html-exporter-'));
}

function verifyPositiveRender() {
  const html = renderer.buildHtml({
    title: '验证标题',
    theme: 'codex-template',
    eyebrow: 'Codex Style',
    lead: '导语内容',
    blocks: [
      { type: 'callout', label: 'System Note', text: '提示块内容' },
      {
        type: 'table',
        label: 'Table 1',
        note: 'Codex 风格模板的关键构成',
        noteEmphasis: true,
        columnWidths: ['22%', '34%', '44%'],
        headers: ['模块', '处理', '说明'],
        rows: [['标题', '左对齐', '像系统文档']],
      },
    ],
    sections: [
      {
        level: 2,
        heading: '章节',
        blocks: [{ type: 'paragraph', text: '正文内容' }],
      },
    ],
  });
  renderer.validateHtml(html);
  assert(/<article\b/.test(html), 'Positive render must contain an article.');
  assert(html.includes('Codex Style'), 'Eyebrow must be rendered.');
  assert(html.includes('System Note'), 'Callout label must be rendered.');
  assert(html.includes('Table 1'), 'Table label must be rendered.');
}

function verifyThemeFallback() {
  assert(renderer.normalizeTheme('unknown-theme') === 'wechat-native-template', 'Unknown theme must fall back to wechat-native-template.');
  assert(renderer.normalizeTheme('论文主题') === 'academic-paper-template', '论文主题 alias must resolve to academic-paper-template.');
  assert(renderer.normalizeTheme('wechat-default-template') === 'academic-paper-template', 'Legacy theme key must resolve to academic-paper-template.');
  assert(renderer.normalizeTheme(undefined) === 'wechat-native-template', 'Missing theme must default to wechat-native-template.');
}

function verifyOverwriteRefusal() {
  const tempDir = makeTempDir();
  const outputPath = path.join(tempDir, 'article.html');
  fs.writeFileSync(outputPath, 'existing', 'utf8');
  let failed = false;
  try {
    renderer.prepareOutputPath(outputPath);
  } catch (error) {
    failed = /already exists/i.test(String(error.message || error));
  }
  assert(failed, 'prepareOutputPath must refuse silent overwrite.');
}

function verifyStructureFailure() {
  let failed = false;
  try {
    renderer.buildHtml({
      title: '坏结构',
      sections: [{ level: 2, heading: '章节', blocks: [{ type: 'unknown', text: 'x' }] }],
    });
  } catch (error) {
    failed = /unsupported block type/i.test(String(error.message || error));
  }
  assert(failed, 'Invalid structure must fail before rendering.');
}

function verifyThemeSpecificFrontMatter() {
  const html = renderer.buildHtml({
    title: '论文式标题',
    theme: 'academic-paper-template',
    meta: ['作者姓名', '团队名称', '2026 年 5 月 26 日'],
    lead: {
      title: '摘要',
      text: '这是摘要内容。',
    },
    keywords: {
      label: '关键词：',
      items: ['公众号排版', '论文版式'],
    },
    sections: [
      {
        level: 2,
        heading: '引言',
        blocks: [{ type: 'paragraph', text: '正文内容。' }],
      },
    ],
  });
  renderer.validateHtml(html);
  assert(html.includes('作者姓名'), 'Meta lines must be rendered.');
  assert(html.includes('摘要'), 'Lead title must be rendered.');
  assert(html.includes('关键词：'), 'Keywords line must be rendered.');
}

function verifyThemeCoverage() {
  const themes = [
    'wechat-native-template',
    'academic-paper-template',
    'apple-style-template',
    'claude-code-template',
    'codex-template',
    'feishu-template',
    'juejin-template',
    'notion-template',
    'obsidian-template',
  ];

  themes.forEach((theme) => {
    const html = renderer.buildHtml({
      title: `${theme} 标题`,
      theme,
      sections: [
        {
          level: 2,
          heading: '章节',
          blocks: [{ type: 'paragraph', text: '正文内容。' }],
        },
      ],
    });
    renderer.validateHtml(html);
    assert(html.includes(`${theme} 标题`), `Theme ${theme} must render title.`);
  });
}

function verifyThemeGuardrails() {
  const nativePreset = renderer.mergePreset('wechat-native-template');

  const eyebrowPlan = renderer.resolveRenderableTheme({
    title: '论文主题',
    theme: 'academic-paper-template',
    eyebrow: 'Should Downgrade',
    sections: [
      {
        level: 2,
        heading: '章节',
        blocks: [{ type: 'paragraph', text: '正文内容。' }],
      },
    ],
  }, 'academic-paper-template');
  assert(eyebrowPlan.effectiveTheme === 'wechat-native-template', 'academic-paper-template must downgrade to native when eyebrow is unmapped.');
  assert(eyebrowPlan.downgraded === true, 'Unmapped eyebrow must trigger native downgrade.');

  const eyebrowHtml = renderer.buildHtml({
    title: '论文主题',
    theme: 'academic-paper-template',
    eyebrow: 'Should Downgrade',
    sections: [
      {
        level: 2,
        heading: '章节',
        blocks: [{ type: 'paragraph', text: '正文内容。' }],
      },
    ],
  });
  assert(eyebrowHtml.includes(`<body style="${nativePreset.body}">`), 'Downgraded eyebrow case must render with native body style.');

  const calloutPlan = renderer.resolveRenderableTheme({
    title: '论文主题',
    theme: 'academic-paper-template',
    sections: [
      {
        level: 2,
        heading: '章节',
        blocks: [{ type: 'callout', text: '自动切回微信原生' }],
      },
    ],
  }, 'academic-paper-template');
  assert(calloutPlan.effectiveTheme === 'wechat-native-template', 'academic-paper-template must downgrade to native when callout is unmapped.');
  assert(calloutPlan.issues.some((item) => String(item).startsWith('callout:')), 'Downgrade reasons must record unmapped callout.');
}

function verifyStrictPresetMapping() {
  const preset = renderer.mergePreset('obsidian-template');
  const html = renderer.buildHtml({
    title: 'Obsidian 标题',
    theme: 'obsidian-template',
    eyebrow: 'Obsidian风格',
    lead: '导语内容',
    blocks: [
      { type: 'callout', label: 'Vault Note', text: '提示块内容' },
      {
        type: 'table',
        label: 'Table 1',
        note: '表格说明',
        noteEmphasis: true,
        columnWidths: ['22%', '34%', '44%'],
        headers: ['模块', '处理', '说明'],
        rows: [['标题', '左对齐', '像笔记库首页']],
      },
      { type: 'code', language: 'text', text: 'code sample' },
    ],
    sections: [
      {
        level: 2,
        heading: '主章节',
        blocks: [
          { type: 'paragraph', text: '正文内容。' },
          { type: 'quote', text: '引用内容。' },
        ],
      },
      {
        level: 3,
        heading: '小标题',
        blocks: [{ type: 'paragraph', text: '更多内容。' }],
      },
    ],
  });

  renderer.validateHtml(html);
  assert(html.includes(`<body style="${preset.body}">`), 'Theme body style must come directly from preset mapping.');
  assert(html.includes(`<article style="${preset.article}">`), 'Theme article style must come directly from preset mapping.');
  assert(html.includes(`<p style="${preset.eyebrow}">Obsidian风格</p>`), 'Theme eyebrow style must come directly from preset mapping.');
  assert(html.includes(`<h1 style="${preset.title}">Obsidian 标题</h1>`), 'Theme title style must come directly from preset mapping.');
  assert(html.includes(`<p style="${preset.lead}">导语内容</p>`), 'Theme lead style must come directly from preset mapping.');
  assert(html.includes(`<section style="${preset.callout}">`), 'Theme callout wrapper style must come directly from preset mapping.');
  assert(html.includes(`<p style="${preset.calloutLabel}">Vault Note</p>`), 'Theme callout label style must come directly from preset mapping.');
  assert(html.includes(`<h2 style="${preset.h2}">主章节</h2>`), 'Theme h2 style must come directly from preset mapping.');
  assert(html.includes(`<h3 style="${preset.h3}">小标题</h3>`), 'Theme h3 style must come directly from preset mapping.');
  assert(html.includes(`<blockquote style="${preset.quote}">`), 'Theme quote style must come directly from preset mapping.');
  assert(html.includes(`<table cellpadding="0" cellspacing="0" style="${preset.table}">`), 'Theme table style must come directly from preset mapping.');
  assert(html.includes(`<pre style="${preset.code}" data-language="text">`), 'Theme code style must come directly from preset mapping.');
  assert(!html.includes('background:#1e1e1e'), 'Obsidian preset mapping must not drift to ad hoc dark theme backgrounds.');
  assert(!html.includes('border-bottom:1px solid #3a3a3a;'), 'Obsidian preset mapping must not drift to ad hoc underline h2 styles.');
}

function verifyNoIntermediateArtifacts() {
  const tempDir = makeTempDir();
  const outputPath = path.join(tempDir, 'article.html');
  const stdinInput = JSON.stringify({
    title: '无中间产物',
    sections: [
      {
        level: 2,
        heading: '章节',
        blocks: [{ type: 'paragraph', text: '正文内容' }],
      },
    ],
  });

  const result = spawnSync(process.execPath, [path.join(__dirname, 'render-wechat-article-html.js'), '--stdin', '--output', outputPath], {
    encoding: 'utf8',
    input: stdinInput,
  });

  assert(result.status === 0, `stdin render must succeed: ${result.stderr}`);
  assert(fs.existsSync(outputPath), 'HTML output must exist.');
  const files = fs.readdirSync(tempDir).sort();
  assert(files.length === 1 && files[0] === 'article.html', 'Output directory must only contain the final HTML file.');
}

function verifyUnicodeBase64Path() {
  const tempDir = makeTempDir();
  const outputPath = path.join(tempDir, 'article.html');
  const article = {
    title: 'Unicode τ 测试',
    lead: '导语含 τ 字符',
    sections: [
      {
        level: 2,
        heading: '正文',
        blocks: [{ type: 'paragraph', text: '包含 τ 的正文内容' }],
      },
    ],
  };
  const base64 = Buffer.from(JSON.stringify(article), 'utf8').toString('base64');
  const result = spawnSync(process.execPath, [path.join(__dirname, 'render-wechat-article-html.js'), '--input-base64', base64, '--output', outputPath], {
    encoding: 'utf8',
  });

  assert(result.status === 0, `base64 render must succeed: ${result.stderr}`);
  const html = fs.readFileSync(outputPath, 'utf8');
  assert(html.includes('τ'), 'Unicode character must be preserved in HTML output.');
}

function main() {
  verifyPositiveRender();
  verifyThemeFallback();
  verifyOverwriteRefusal();
  verifyStructureFailure();
  verifyThemeSpecificFrontMatter();
  verifyThemeCoverage();
  verifyThemeGuardrails();
  verifyStrictPresetMapping();
  verifyNoIntermediateArtifacts();
  verifyUnicodeBase64Path();
  process.stdout.write('Verification passed.\n');
}

try {
  main();
} catch (error) {
  console.error(error.message || String(error));
  process.exit(1);
}
