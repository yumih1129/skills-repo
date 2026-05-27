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
  return fs.mkdtempSync(path.join(os.tmpdir(), 'wechat-article-generator-'));
}

function verifyDirectRenderStillWorks() {
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
  assert(/<article\b/.test(html), 'Direct render must contain an article.');
  assert(html.includes('Codex Style'), 'Direct render eyebrow must be rendered.');
  assert(html.includes('System Note'), 'Direct render callout label must be rendered.');
  assert(html.includes('Table 1'), 'Direct render table label must be rendered.');
}

function verifyThemeFallback() {
  assert(renderer.normalizeTheme('unknown-theme') === 'wechat-native-template', 'Unknown theme must fall back to wechat-native-template.');
  assert(renderer.normalizeTheme('论文主题') === 'academic-paper-template', '论文主题 alias must resolve to academic-paper-template.');
  assert(renderer.normalizeTheme('wechat-default-template') === 'academic-paper-template', 'Legacy theme key must resolve to academic-paper-template.');
  assert(renderer.normalizeTheme(undefined) === 'wechat-native-template', 'Missing theme must default to wechat-native-template.');
}

function verifyOverwriteRefusal() {
  const tempDir = makeTempDir();
  const outputPath = path.join(tempDir, 'final.html');
  fs.writeFileSync(outputPath, 'existing', 'utf8');
  let failed = false;
  try {
    renderer.prepareOutputTargets(outputPath, renderer.HTML_EXPORT_MODE);
  } catch (error) {
    failed = /already exists/i.test(String(error.message || error));
  }
  assert(failed, 'prepareOutputTargets must refuse silent overwrite.');
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

function verifySourcePackageNormalization() {
  const normalized = renderer.normalizeExportInput({
    source: {
      title: '面向公众号的发布源稿',
      summary: '一段 120 字以内的文章摘要。',
      cover_prompt: '制作一张现代、克制、适合公众号头图的封面，主标题居中，配色为青灰和米白，不要人物写真，不要水印。',
      theme: 'academic-paper-template',
      markdown: '引入段落。\n\n## 第一部分\n\n正文内容。',
    },
    article: {
      meta: ['作者姓名', '团队名称', '2026 年 5 月 27 日'],
      sections: [
        {
          level: 2,
          heading: '第一部分',
          blocks: [{ type: 'paragraph', text: '正文内容。' }],
        },
      ],
    },
  });

  assert(normalized.inputModel === 'source-package', 'Source payload must be normalized as source-package.');
  assert(normalized.source.title === '面向公众号的发布源稿', 'Source title must be preserved.');
  assert(normalized.articleInput.title === normalized.source.title, 'Article title must mirror source title.');
  assert(normalized.articleInput.theme === 'academic-paper-template', 'Article theme must inherit source theme.');
  assert(normalized.articleInput.lead.title === '摘要', 'Academic theme must auto-attach 摘要 title.');
  assert(normalized.articleInput.lead.text === normalized.source.summary, 'Lead text must mirror source summary.');

  const html = renderer.buildHtml(normalized.articleInput);
  renderer.validateHtml(html);
  renderer.validateNoSourceLeak(html, normalized.source);
  assert(html.includes('摘要'), 'Summary label must be rendered for academic theme source packages.');
}

function verifySourceValidation() {
  let failed = false;
  try {
    renderer.normalizeSource({
      title: 'a'.repeat(65),
      summary: '摘要',
      cover_prompt: '封面提示词',
      theme: 'wechat-native-template',
      markdown: '## 章节\n\n正文',
    });
  } catch (error) {
    failed = /64 characters or fewer/i.test(String(error.message || error));
  }
  assert(failed, 'Source title length must be validated.');

  failed = false;
  try {
    renderer.normalizeSource({
      title: '标题',
      summary: 'b'.repeat(121),
      cover_prompt: '封面提示词',
      theme: 'wechat-native-template',
      markdown: '## 章节\n\n正文',
    });
  } catch (error) {
    failed = /120 characters or fewer/i.test(String(error.message || error));
  }
  assert(failed, 'Source summary length must be validated.');

  failed = false;
  try {
    renderer.normalizeSource({
      title: '标题',
      summary: '摘要',
      cover_prompt: '封面提示词',
      theme: 'wechat-native-template',
      markdown: '# 重复标题\n\n## 章节\n\n正文',
    });
  } catch (error) {
    failed = /top-level # heading/i.test(String(error.message || error));
  }
  assert(failed, 'Source markdown must reject top-level # headings.');
}

function verifySourceArticleMismatchFailure() {
  let failed = false;
  try {
    renderer.normalizeExportInput({
      source: {
        title: '源稿标题',
        summary: '摘要内容',
        cover_prompt: '封面提示词',
        theme: 'wechat-native-template',
        markdown: '## 章节\n\n正文',
      },
      article: {
        title: '另一个标题',
        sections: [
          {
            level: 2,
            heading: '章节',
            blocks: [{ type: 'paragraph', text: '正文内容。' }],
          },
        ],
      },
    });
  } catch (error) {
    failed = /must match source.title/i.test(String(error.message || error));
  }
  assert(failed, 'Source/article title mismatch must fail.');
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
}

function verifyAcademicPaperPresetMapping() {
  const preset = renderer.mergePreset('academic-paper-template');
  const html = renderer.buildHtml({
    title: '论文标题',
    theme: 'academic-paper-template',
    meta: ['作者甲', '某某大学', '2026 年 5 月 27 日'],
    lead: { title: '摘要', text: '这是严格论文模板下的摘要正文。' },
    keywords: { items: ['关键词一', '关键词二', '关键词三'] },
    blocks: [
      {
        type: 'table',
        label: 'Table 1',
        note: '三线表样式验证',
        headers: ['字段', '内容', '说明'],
        rows: [['标题', '居中', '论文式标题']],
      },
      { type: 'code', language: 'text', text: 'appendix sample' },
    ],
    sections: [
      {
        level: 2,
        heading: '研究设计',
        blocks: [
          { type: 'paragraph', text: '正文内容。' },
          { type: 'quote', text: '引用内容。' },
        ],
      },
      {
        level: 3,
        heading: '变量定义',
        blocks: [{ type: 'paragraph', text: '更多内容。' }],
      },
    ],
  });

  renderer.validateHtml(html);
  assert(html.includes(`<h1 style="${preset.title}">论文标题</h1>`), 'Academic title style must come directly from preset mapping.');
  assert(html.includes(`<p style="${preset.metaPrimary}">作者甲</p>`), 'Academic primary meta must come directly from preset mapping.');
  assert(html.includes(`<p style="${preset.metaSecondary}">某某大学</p>`), 'Academic secondary meta must come directly from preset mapping.');
  assert(html.includes(`<p style="${preset.metaTertiary}">2026 年 5 月 27 日</p>`), 'Academic tertiary meta must come directly from preset mapping.');
  assert(html.includes(`<p style="${preset.leadText}"><strong style="${preset.leadInlineLabelStyle}">摘要：</strong>这是严格论文模板下的摘要正文。</p>`), 'Academic abstract must render as an inline 摘要 label followed by正文.');
  assert(html.includes(`<p style="${preset.keywordLine}"><strong style="${preset.keywordLabel}">关键词：</strong>关键词一；关键词二；关键词三</p>`), 'Academic keywords line must come directly from preset mapping.');
  assert(html.includes(`<h2 style="${preset.h2}">研究设计</h2>`), 'Academic h2 style must come directly from preset mapping.');
  assert(html.includes(`<h3 style="${preset.h3}">变量定义</h3>`), 'Academic h3 style must come directly from preset mapping.');
  assert(html.includes(`<blockquote style="${preset.quote}">`), 'Academic quote style must come directly from preset mapping.');
  assert(html.includes(`<table cellpadding="0" cellspacing="0" style="${preset.table}">`), 'Academic table style must come directly from preset mapping.');
  assert(html.includes(`<th style="${preset.th}"`), 'Academic table header style must come directly from preset mapping.');
  assert(html.includes(`<td style="${preset.tdStrong}">标题</td>`), 'Academic strong-first-column cell style must come directly from preset mapping.');
  assert(html.includes(`<pre style="${preset.code}" data-language="text">`), 'Academic code style must come directly from preset mapping.');
}

function verifyHtmlOnlyExport() {
  const tempDir = makeTempDir();
  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, 'render-wechat-article-html.js'), '--stdin', '--output', tempDir],
    {
      encoding: 'utf8',
      input: JSON.stringify({
        source: {
          title: '无中间产物',
          summary: '这是一段用于验证只导出 HTML 的公众号摘要。',
          cover_prompt: '制作一张简洁的公众号封面，主题为无中间产物，青灰配色，不要人物，不要水印。',
          theme: 'wechat-native-template',
          markdown: '引入段落。\n\n## 章节\n\n正文内容。',
        },
        article: {
          sections: [
            {
              level: 2,
              heading: '章节',
              blocks: [{ type: 'paragraph', text: '正文内容' }],
            },
          ],
        },
      }),
    }
  );

  assert(result.status === 0, `html-only export must succeed: ${result.stderr}`);
  const files = fs.readdirSync(tempDir).sort();
  assert(files.length === 1 && files[0] === 'final.html', 'Directory html export must only contain final.html.');
  const payload = JSON.parse(result.stdout);
  assert(payload.exportMode === renderer.HTML_EXPORT_MODE, 'Default export mode must be html-file-export.');
  assert(payload.inputModel === 'source-package', 'HTML export must use the source-package input model.');
}

function verifyExportRequiresSource() {
  const tempDir = makeTempDir();
  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, 'render-wechat-article-html.js'), '--stdin', '--output', tempDir],
    {
      encoding: 'utf8',
      input: JSON.stringify({
        title: '缺少源稿',
        sections: [
          {
            level: 2,
            heading: '章节',
            blocks: [{ type: 'paragraph', text: '正文内容' }],
          },
        ],
      }),
    }
  );

  assert(result.status !== 0, 'Export must fail when source fields are missing.');
  assert(/source fields/i.test(result.stderr), 'Missing source failure must explain the source field contract.');
}

function verifySourceHtmlExport() {
  const tempDir = makeTempDir();
  const result = spawnSync(
    process.execPath,
    [
      path.join(__dirname, 'render-wechat-article-html.js'),
      '--stdin',
      '--output',
      tempDir,
      '--export-mode',
      renderer.SOURCE_HTML_EXPORT_MODE,
    ],
    {
      encoding: 'utf8',
      input: JSON.stringify({
        source: {
          title: '完整发布资产',
          summary: '适合公众号的摘要内容。',
          cover_prompt: '为公众号文章设计一张克制的封面，主标题居中，青灰米白配色，不要照片感人物，不要水印。',
          theme: 'wechat-native-template',
          markdown: '引入段落。\n\n## 第一部分\n\n正文内容。',
        },
        article: {
          sections: [
            {
              level: 2,
              heading: '第一部分',
              blocks: [{ type: 'paragraph', text: '正文内容。' }],
            },
          ],
        },
      }),
    }
  );

  assert(result.status === 0, `source-html export must succeed: ${result.stderr}`);
  const files = fs.readdirSync(tempDir).sort();
  assert(files.length === 2, 'Source+HTML export must only create two files.');
  assert(files[0] === 'final.html' && files[1] === 'source.md', 'Source+HTML export must create final.html and source.md.');

  const html = fs.readFileSync(path.join(tempDir, 'final.html'), 'utf8');
  const sourceMd = fs.readFileSync(path.join(tempDir, 'source.md'), 'utf8');
  assert(!html.includes('主标题居中，青灰米白配色'), 'HTML must not leak cover prompt text.');
  assert(/^---\n/m.test(sourceMd), 'source.md must start with frontmatter.');
  assert(sourceMd.includes('cover_prompt:'), 'source.md frontmatter must contain cover_prompt.');
  assert(sourceMd.includes('\n## 第一部分\n'), 'source.md must contain the markdown body.');

  const payload = JSON.parse(result.stdout);
  assert(payload.sourceOutput && payload.sourceOutput.endsWith('source.md'), 'CLI payload must report source.md output.');
}

function verifySourceMdNamingHint() {
  const tempDir = makeTempDir();
  const sourceHint = path.join(tempDir, 'package.md');
  const targets = renderer.resolveOutputTargets(sourceHint, renderer.SOURCE_HTML_EXPORT_MODE);
  assert(targets.sourcePath.endsWith('package.md'), 'MD naming hint must keep the requested source path.');
  assert(targets.htmlPath.endsWith('package.html'), 'MD naming hint must derive matching HTML basename.');
}

function verifyUnicodeBase64Path() {
  const tempDir = makeTempDir();
  const outputPath = path.join(tempDir, 'article.html');
  const article = {
    source: {
      title: 'Unicode τ 测试',
      summary: '导语含 τ 字符，用于验证 Unicode 输出。',
      cover_prompt: '制作一张简洁的 Unicode 测试封面，包含 τ 字符，不要水印。',
      theme: 'wechat-native-template',
      markdown: '引入段落含 τ。\n\n## 正文\n\n包含 τ 的正文内容。',
    },
    article: {
      sections: [
        {
          level: 2,
          heading: '正文',
          blocks: [{ type: 'paragraph', text: '包含 τ 的正文内容' }],
        },
      ],
    },
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
  verifyDirectRenderStillWorks();
  verifyThemeFallback();
  verifyOverwriteRefusal();
  verifyStructureFailure();
  verifySourcePackageNormalization();
  verifySourceValidation();
  verifySourceArticleMismatchFailure();
  verifyThemeGuardrails();
  verifyStrictPresetMapping();
  verifyAcademicPaperPresetMapping();
  verifyHtmlOnlyExport();
  verifyExportRequiresSource();
  verifySourceHtmlExport();
  verifySourceMdNamingHint();
  verifyUnicodeBase64Path();
  process.stdout.write('Verification passed.\n');
}

try {
  main();
} catch (error) {
  console.error(error.message || String(error));
  process.exit(1);
}
