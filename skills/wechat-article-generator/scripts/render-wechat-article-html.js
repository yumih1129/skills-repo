#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const presets = require('../assets/theme-presets.js');

const HTML_EXPORT_MODE = 'html-file-export';
const SOURCE_HTML_EXPORT_MODE = 'source-html-export';
const DEFAULT_HTML_FILENAME = 'final.html';
const DEFAULT_SOURCE_FILENAME = 'source.md';

function parseArgs(argv) {
  const out = { unknown: [] };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--output') out.output = argv[++i];
    else if (arg === '--theme') out.theme = argv[++i];
    else if (arg === '--title') out.title = argv[++i];
    else if (arg === '--export-mode') out.exportMode = argv[++i];
    else if (arg === '--stdin') out.stdin = true;
    else if (arg === '--overwrite') out.overwrite = true;
    else if (arg === '--rename-if-exists') out.renameIfExists = true;
    else if (arg === '--help' || arg === '-h') out.help = true;
    else out.unknown.push(arg);
  }
  return out;
}

function readJson(options) {
  if (options.stdin && fs.fstatSync(0).isFile()) {
    throw new Error('stdin must be supplied by an in-memory producer, not a local file redirection.');
  }
  const raw = options.stdin ? fs.readFileSync(0, 'utf8') : '';
  return JSON.parse(raw);
}

function isPlainObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function firstDefined(...values) {
  for (const value of values) {
    if (value != null) return value;
  }
  return undefined;
}

function collapseInlineText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function countTextLength(value) {
  return Array.from(collapseInlineText(value)).length;
}

function isNonEmptyText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeMarkdownBody(value) {
  return String(value ?? '').replace(/^\uFEFF/, '').trim();
}

const READER_VISIBLE_META_PATTERNS = [
  { label: 'source.md', pattern: /\bsource\.md\b/i },
  { label: 'final.html', pattern: /\bfinal\.html\b/i },
  { label: 'cover_prompt', pattern: /\bcover_prompt\b/i },
  { label: '源稿文件', pattern: /源稿文件/ },
  { label: '封面提示词保存说明', pattern: /完整?封面提示词|封面提示词.{0,12}(保留|保存|写入|放在|位于)/ },
  { label: '原始链接保留说明', pattern: /原始链接.{0,12}(保留|保存|写入|放在|位于)/ },
  { label: '二次编辑说明', pattern: /二次编辑|后续再编辑|后续二次编辑/ },
  { label: '复核路径说明', pattern: /复核路径|便于.{0,12}复核|用于.{0,12}复核/ },
  { label: '写入文件说明', pattern: /已写入.{0,24}(source\.md|final\.html|源稿|文件|正文)/i },
  { label: '可复用正文写入说明', pattern: /可复用正文.{0,16}(写入|保留|保存)/ },
  { label: '执行过程说明', pattern: /执行过程|导出文件|资产管理说明/ },
];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function styleFrom(preset, key, fallback = '') {
  return preset[key] || fallback || '';
}

function normalizeTheme(themeName) {
  if (!themeName) return 'wechat-native-template';
  const rawName = String(themeName).trim();
  if (presets.themes[rawName]) return rawName;
  const key = rawName.toLowerCase();
  const mapping = {
    'wechat-native': 'wechat-native-template',
    'wechat native': 'wechat-native-template',
    '微信原生': 'wechat-native-template',
    '原生微信': 'wechat-native-template',
    '公众号原生': 'wechat-native-template',
    'academic-paper-template': 'academic-paper-template',
    academicPaper: 'academic-paper-template',
    'academic-paper': 'academic-paper-template',
    'academic paper': 'academic-paper-template',
    '论文主题': 'academic-paper-template',
    '论文风格': 'academic-paper-template',
    '论文风': 'academic-paper-template',
    paper: 'academic-paper-template',
    'paper-theme': 'academic-paper-template',
    '学术': 'academic-paper-template',
    '论文': 'academic-paper-template',
    apple: 'apple-style-template',
    'apple-style': 'apple-style-template',
    'apple style': 'apple-style-template',
    '苹果': 'apple-style-template',
    '苹果风': 'apple-style-template',
    'claude-code': 'claude-code-template',
    'claude code': 'claude-code-template',
    claude: 'claude-code-template',
    'claude风': 'claude-code-template',
    codex: 'codex-template',
    'codex风': 'codex-template',
    feishu: 'feishu-template',
    '飞书': 'feishu-template',
    '飞书风': 'feishu-template',
    juejin: 'juejin-template',
    '掘金': 'juejin-template',
    '掘金风': 'juejin-template',
    notion: 'notion-template',
    'notion风': 'notion-template',
    '知识库': 'notion-template',
    '知识库风': 'notion-template',
    obsidian: 'obsidian-template',
    '黑曜石': 'obsidian-template',
    '笔记库': 'obsidian-template'
  };
  return mapping[key] || mapping[rawName] || 'wechat-native-template';
}

function mergePreset(themeName) {
  const theme = presets.themes[themeName] || presets.themes['wechat-native-template'];
  return {
    ...presets.base,
    ...theme,
  };
}

function getThemeCapabilities(themeName) {
  return presets.themeCapabilities?.[themeName] || presets.themeCapabilities?.['wechat-native-template'] || {};
}

function renderText(text, preset) {
  const codeStyle = styleFrom(preset, 'inlineCode', presets.base.inlineCode);
  return String(text ?? '').split(/(`[^`]+`)/g).map((part) => {
    if (/^`[^`]+`$/.test(part)) {
      return `<code style="${codeStyle}">${escapeHtml(part.slice(1, -1))}</code>`;
    }
    return escapeHtml(part);
  }).join('');
}

function renderParagraph(text, preset, overrideStyle) {
  const style = overrideStyle || styleFrom(preset, 'paragraph', presets.base.paragraph);
  return `<p style="${style}">${renderText(text, preset)}</p>`;
}

function renderEyebrow(eyebrow, preset) {
  if (!isNonEmptyText(eyebrow)) return '';
  return `<p style="${styleFrom(preset, 'eyebrow', presets.base.eyebrow)}">${escapeHtml(eyebrow)}</p>`;
}

function renderMeta(meta, preset) {
  if (meta == null) return '';
  const items = Array.isArray(meta) ? meta : [meta];
  const styleKeys = ['metaPrimary', 'metaSecondary', 'metaTertiary'];
  return items.map((item, index) => {
    const text = typeof item === 'string' ? item : item?.text;
    const customStyle = isPlainObject(item) ? item.style : '';
    if (!isNonEmptyText(text)) {
      throw new Error(`meta[${index}] must be non-empty.`);
    }
    const style = customStyle || styleFrom(preset, styleKeys[index], styleFrom(preset, 'metaLine', presets.base.metaLine));
    return `<p style="${style}">${renderText(text, preset)}</p>`;
  }).join('');
}

function renderLead(lead, preset) {
  if (!lead) return '';
  if (typeof lead === 'string') {
    return renderParagraph(
      lead,
      preset,
      styleFrom(preset, 'lead', styleFrom(preset, 'paragraph', presets.base.paragraph)).replace('text-indent:2em;', 'text-indent:0;')
    );
  }

  if (preset.leadInlineLabel === true && isNonEmptyText(lead.title) && isNonEmptyText(lead.text)) {
    const textStyle = styleFrom(
      preset,
      'leadText',
      styleFrom(preset, 'lead', styleFrom(preset, 'paragraph', presets.base.paragraph))
    ).replace('text-indent:2em;', 'text-indent:0;');
    const labelStyle = styleFrom(preset, 'leadInlineLabelStyle', styleFrom(preset, 'keywordLabel', presets.base.keywordLabel));
    const label = /[：:]$/.test(lead.title) ? lead.title : `${lead.title}：`;
    return `<p style="${textStyle}"><strong style="${labelStyle}">${escapeHtml(label)}</strong>${renderText(lead.text, preset)}</p>`;
  }

  const title = lead.title ? `<p style="${styleFrom(preset, 'leadTitle', presets.base.leadTitle)}">${escapeHtml(lead.title)}</p>` : '';
  const textStyle = styleFrom(
    preset,
    'leadText',
    styleFrom(preset, 'lead', styleFrom(preset, 'paragraph', presets.base.paragraph))
  ).replace('text-indent:2em;', 'text-indent:0;');
  const text = lead.text ? renderParagraph(lead.text, preset, textStyle) : '';
  return title + text;
}

function renderKeywords(keywords, preset) {
  if (keywords == null) return '';
  let label = '关键词：';
  let value = '';

  if (typeof keywords === 'string') {
    value = keywords;
  } else if (Array.isArray(keywords)) {
    value = keywords.join('；');
  } else if (isPlainObject(keywords)) {
    label = isNonEmptyText(keywords.label) ? keywords.label : label;
    if (Array.isArray(keywords.items)) {
      value = keywords.items.join('；');
    } else {
      value = keywords.text || '';
    }
  }

  if (!isNonEmptyText(value)) return '';
  const lineStyle = styleFrom(preset, 'keywordLine', presets.base.keywordLine);
  const labelStyle = styleFrom(preset, 'keywordLabel', presets.base.keywordLabel);
  return `<p style="${lineStyle}"><strong style="${labelStyle}">${escapeHtml(label)}</strong>${renderText(value, preset)}</p>`;
}

function renderList(block, preset) {
  const tag = block.ordered ? 'ol' : 'ul';
  const listStyle = styleFrom(preset, 'list', presets.base.list);
  const itemStyle = styleFrom(preset, 'listItem', presets.base.listItem);
  const items = (block.items || []).map((item) => `<li style="${itemStyle}">${renderText(item, preset)}</li>`).join('');
  return `<${tag} style="${listStyle}">${items}</${tag}>`;
}

function renderQuote(text, preset) {
  const quoteStyle = styleFrom(preset, 'quote', '');
  const quoteTextStyle = styleFrom(
    preset,
    'quoteText',
    styleFrom(preset, 'paragraph', presets.base.paragraph)
  ).replace('text-indent:2em;', 'text-indent:0;');
  return `<blockquote style="${quoteStyle}">${renderParagraph(text, preset, quoteTextStyle)}</blockquote>`;
}

function renderCallout(block, preset) {
  const wrapperStyle = styleFrom(preset, 'callout', presets.base.callout);
  const labelStyle = styleFrom(preset, 'calloutLabel', presets.base.calloutLabel);
  const textStyle = styleFrom(preset, 'calloutText', presets.base.calloutText);
  const label = isNonEmptyText(block.label) ? `<p style="${labelStyle}">${escapeHtml(block.label)}</p>` : '';
  const text = `<p style="${textStyle}">${renderText(block.text, preset)}</p>`;
  return `<section style="${wrapperStyle}">${label}${text}</section>`;
}

function renderCode(block, preset) {
  const codeStyle = styleFrom(preset, 'code', presets.base.code);
  const codeInnerStyle = styleFrom(preset, 'codeInner', presets.base.codeInner);
  const language = block.language || 'text';
  return `<pre style="${codeStyle}" data-language="${escapeHtml(language)}"><code style="${codeInnerStyle}">${escapeHtml(block.text || '')}</code></pre>`;
}

function renderTable(block, preset) {
  const wrapperStyle = styleFrom(preset, 'tableWrapper', presets.base.tableWrapper);
  const labelStyle = styleFrom(preset, 'tableLabel', presets.base.tableLabel);
  const noteStyle = styleFrom(preset, 'tableNote', presets.base.tableNote);
  const noteEmphasisStyle = styleFrom(preset, 'tableNoteEmphasis', presets.base.tableNoteEmphasis);
  const tableStyle = styleFrom(preset, 'table', presets.base.table);
  const thStyle = styleFrom(preset, 'th', presets.base.th);
  const tdStrongStyle = styleFrom(preset, 'tdStrong', presets.base.tdStrong);
  const tdStyle = styleFrom(preset, 'td', presets.base.td);
  const headers = block.headers || [];
  const rows = block.rows || [];
  const widths = Array.isArray(block.columnWidths) ? block.columnWidths : [];

  const label = isNonEmptyText(block.label) ? `<p style="${labelStyle}">${escapeHtml(block.label)}</p>` : '';
  let note = '';
  if (isNonEmptyText(block.note)) {
    note = block.noteEmphasis
      ? `<p style="${noteStyle}"><em style="${noteEmphasisStyle}">${renderText(block.note, preset)}</em></p>`
      : `<p style="${noteStyle}">${renderText(block.note, preset)}</p>`;
  }

  const thead = headers.length
    ? `<thead><tr>${headers.map((cell, index) => {
      const widthStyle = isNonEmptyText(widths[index]) ? `width:${widths[index]};` : '';
      return `<th style="${thStyle}${widthStyle}">${renderText(cell, preset)}</th>`;
    }).join('')}</tr></thead>`
    : '';
  const tbody = rows.length
    ? `<tbody>${rows.map((row) => `<tr>${row.map((cell, index) => {
      const cellStyle = index === 0 ? tdStrongStyle : tdStyle;
      return `<td style="${cellStyle}">${renderText(cell, preset)}</td>`;
    }).join('')}</tr>`).join('')}</tbody>`
    : '';

  return `<section style="${wrapperStyle}">${label}${note}<table cellpadding="0" cellspacing="0" style="${tableStyle}">${thead}${tbody}</table></section>`;
}

function renderImage(block, preset) {
  const wrapperStyle = styleFrom(preset, 'imageWrapper', presets.base.imageWrapper);
  const imageStyle = styleFrom(preset, 'image', presets.base.image);
  const captionStyle = styleFrom(preset, 'imageCaption', presets.base.imageCaption);
  const caption = block.caption ? `<p style="${captionStyle}">${escapeHtml(block.caption)}</p>` : '';
  return `<section style="${wrapperStyle}"><img src="${escapeHtml(block.src || '')}" alt="${escapeHtml(block.alt || '')}" style="${imageStyle}" />${caption}</section>`;
}

function renderBlock(block, preset) {
  switch (block.type) {
    case 'paragraph':
      return renderParagraph(block.text, preset);
    case 'quote':
      return renderQuote(block.text, preset);
    case 'callout':
      return renderCallout(block, preset);
    case 'list':
      return renderList(block, preset);
    case 'table':
      return renderTable(block, preset);
    case 'code':
      return renderCode(block, preset);
    case 'image':
      return renderImage(block, preset);
    default:
      throw new Error(`Unsupported block type: ${block.type || 'missing'}.`);
  }
}

function renderSection(section, preset) {
  const level = section.level === 3 ? 3 : 2;
  const headingStyle = styleFrom(preset, level === 3 ? 'h3' : 'h2', '');
  const headingTag = level === 3 ? 'h3' : 'h2';
  const title = section.heading ? `<${headingTag} style="${headingStyle}">${escapeHtml(section.heading)}</${headingTag}>` : '';
  const blocks = (section.blocks || []).map((block) => renderBlock(block, preset)).join('');
  return `<section style="${styleFrom(preset, 'sectionWrapper', presets.base.sectionWrapper)}">${title}${blocks}</section>`;
}

function renderClosing(closing, preset) {
  if (!closing) return '';
  const items = Array.isArray(closing) ? closing : [closing];
  return items.map((item) => {
    if (typeof item === 'string') {
      return renderParagraph(item, preset, styleFrom(preset, 'closing', presets.base.closing));
    }
    return renderBlock({ ...item, type: item.type || 'paragraph' }, preset);
  }).join('');
}

function extractLeadText(lead) {
  if (lead == null) return null;
  if (typeof lead === 'string') return collapseInlineText(lead);
  if (isPlainObject(lead)) return collapseInlineText(lead.text);
  return null;
}

function validateBlock(block, location) {
  if (!block || typeof block !== 'object' || Array.isArray(block)) {
    throw new Error(`${location} must be an object block.`);
  }
  const type = block.type || 'paragraph';
  if (type === 'callout') {
    if (!isNonEmptyText(block.text)) {
      throw new Error(`${location}.callout requires non-empty text.`);
    }
    return;
  }
  const allowedTypes = new Set(['paragraph', 'quote', 'callout', 'list', 'table', 'code', 'image']);
  if (!allowedTypes.has(type)) {
    throw new Error(`${location} has unsupported block type: ${type}.`);
  }
  if ((type === 'paragraph' || type === 'quote') && !isNonEmptyText(block.text)) {
    throw new Error(`${location}.${type} requires non-empty text.`);
  }
  if (type === 'list') {
    if (!Array.isArray(block.items) || block.items.length === 0) {
      throw new Error(`${location}.list requires non-empty items.`);
    }
    block.items.forEach((item, index) => {
      if (!isNonEmptyText(String(item ?? ''))) {
        throw new Error(`${location}.list.items[${index}] must be non-empty.`);
      }
    });
  }
  if (type === 'table') {
    if (!Array.isArray(block.headers) || block.headers.length === 0) {
      throw new Error(`${location}.table requires non-empty headers.`);
    }
    if (!Array.isArray(block.rows) || block.rows.length === 0) {
      throw new Error(`${location}.table requires non-empty rows.`);
    }
    block.rows.forEach((row, rowIndex) => {
      if (!Array.isArray(row) || row.length !== block.headers.length) {
        throw new Error(`${location}.table.rows[${rowIndex}] must match header length.`);
      }
    });
    if (block.columnWidths != null) {
      if (!Array.isArray(block.columnWidths) || block.columnWidths.length !== block.headers.length) {
        throw new Error(`${location}.table.columnWidths must match header length when provided.`);
      }
    }
  }
  if (type === 'code' && !isNonEmptyText(block.text)) {
    throw new Error(`${location}.code requires non-empty text.`);
  }
  if (type === 'image' && !isNonEmptyText(block.src)) {
    throw new Error(`${location}.image requires non-empty src.`);
  }
}

function validateNoReaderVisibleMetaText(text, location) {
  if (text == null) return;
  const value = String(text);
  if (!value) return;
  const hit = READER_VISIBLE_META_PATTERNS.find(({ pattern }) => pattern.test(value));
  if (hit) {
    throw new Error(`${location} contains reader-visible source/export metadata: ${hit.label}.`);
  }
}

function validateNoReaderVisibleMetaInBlock(block, location) {
  if (!block || typeof block !== 'object' || Array.isArray(block)) return;
  const type = block.type || 'paragraph';
  if (type === 'paragraph' || type === 'quote' || type === 'callout' || type === 'code') {
    validateNoReaderVisibleMetaText(block.text, `${location}.text`);
  }
  if (type === 'callout') {
    validateNoReaderVisibleMetaText(block.label, `${location}.label`);
  }
  if (type === 'list' && Array.isArray(block.items)) {
    block.items.forEach((item, index) => validateNoReaderVisibleMetaText(item, `${location}.items[${index}]`));
  }
  if (type === 'table') {
    validateNoReaderVisibleMetaText(block.label, `${location}.label`);
    validateNoReaderVisibleMetaText(block.note, `${location}.note`);
    (block.headers || []).forEach((cell, index) => validateNoReaderVisibleMetaText(cell, `${location}.headers[${index}]`));
    (block.rows || []).forEach((row, rowIndex) => {
      (row || []).forEach((cell, cellIndex) => validateNoReaderVisibleMetaText(cell, `${location}.rows[${rowIndex}][${cellIndex}]`));
    });
  }
  if (type === 'image') {
    validateNoReaderVisibleMetaText(block.alt, `${location}.alt`);
    validateNoReaderVisibleMetaText(block.caption, `${location}.caption`);
  }
}

function validateNoReaderVisibleMetaInArticle(input) {
  validateNoReaderVisibleMetaText(input.eyebrow, 'eyebrow');
  const meta = Array.isArray(input.meta) ? input.meta : input.meta != null ? [input.meta] : [];
  meta.forEach((item, index) => {
    const text = typeof item === 'string' ? item : item?.text;
    validateNoReaderVisibleMetaText(text, `meta[${index}]`);
  });
  if (typeof input.lead === 'string') {
    validateNoReaderVisibleMetaText(input.lead, 'lead');
  } else if (isPlainObject(input.lead)) {
    validateNoReaderVisibleMetaText(input.lead.title, 'lead.title');
    validateNoReaderVisibleMetaText(input.lead.text, 'lead.text');
  }
  if (input.keywords != null) {
    const keywords = input.keywords;
    if (typeof keywords === 'string') {
      validateNoReaderVisibleMetaText(keywords, 'keywords');
    } else if (Array.isArray(keywords)) {
      keywords.forEach((item, index) => validateNoReaderVisibleMetaText(item, `keywords[${index}]`));
    } else if (isPlainObject(keywords)) {
      validateNoReaderVisibleMetaText(keywords.label, 'keywords.label');
      validateNoReaderVisibleMetaText(keywords.text, 'keywords.text');
      (keywords.items || []).forEach((item, index) => validateNoReaderVisibleMetaText(item, `keywords.items[${index}]`));
    }
  }
  collectBlocks(input).forEach(({ block, location }) => validateNoReaderVisibleMetaInBlock(block, location));
  (input.sections || []).forEach((section, index) => validateNoReaderVisibleMetaText(section.heading, `sections[${index}].heading`));
  const closing = Array.isArray(input.closing) ? input.closing : input.closing != null ? [input.closing] : [];
  closing.forEach((item, index) => {
    if (typeof item === 'string') {
      validateNoReaderVisibleMetaText(item, `closing[${index}]`);
    }
  });
}

function validateLead(lead) {
  if (lead == null) return;
  if (typeof lead === 'string') {
    if (!isNonEmptyText(lead)) throw new Error('lead must be non-empty when provided.');
    return;
  }
  if (!isPlainObject(lead)) {
    throw new Error('lead must be a string or object.');
  }
  if (!isNonEmptyText(lead.text)) {
    throw new Error('lead.text is required when lead is an object.');
  }
}

function validateArticleInput(input) {
  if (!isPlainObject(input)) {
    throw new Error('Article input must be an object.');
  }
  if (!isNonEmptyText(input.title || input.titleText)) {
    throw new Error('Article input requires a non-empty title.');
  }
  if (input.eyebrow != null && !isNonEmptyText(input.eyebrow)) {
    throw new Error('eyebrow must be non-empty when provided.');
  }
  if (input.meta != null) {
    const metaItems = Array.isArray(input.meta) ? input.meta : [input.meta];
    metaItems.forEach((item, index) => {
      const text = typeof item === 'string' ? item : item?.text;
      if (!isNonEmptyText(text)) {
        throw new Error(`meta[${index}] must be non-empty.`);
      }
    });
  }
  validateLead(input.lead);
  if (input.keywords != null) {
    const keywords = input.keywords;
    const value = typeof keywords === 'string'
      ? keywords
      : Array.isArray(keywords)
        ? keywords.join('；')
        : Array.isArray(keywords.items)
          ? keywords.items.join('；')
          : keywords.text;
    if (!isNonEmptyText(value || '')) {
      throw new Error('keywords must be non-empty when provided.');
    }
  }
  if (input.blocks != null) {
    if (!Array.isArray(input.blocks)) throw new Error('blocks must be an array when provided.');
    input.blocks.forEach((block, index) => validateBlock(block, `blocks[${index}]`));
  }
  if (!Array.isArray(input.sections) || input.sections.length === 0) {
    throw new Error('Article input requires at least one section.');
  }
  input.sections.forEach((section, sectionIndex) => {
    if (!isPlainObject(section)) {
      throw new Error(`sections[${sectionIndex}] must be an object.`);
    }
    if (section.level != null && section.level !== 2 && section.level !== 3) {
      throw new Error(`sections[${sectionIndex}].level must be 2 or 3.`);
    }
    if (!isNonEmptyText(section.heading)) {
      throw new Error(`sections[${sectionIndex}].heading is required.`);
    }
    if (!Array.isArray(section.blocks) || section.blocks.length === 0) {
      throw new Error(`sections[${sectionIndex}].blocks must be a non-empty array.`);
    }
    section.blocks.forEach((block, blockIndex) => validateBlock(block, `sections[${sectionIndex}].blocks[${blockIndex}]`));
  });
  if (input.closing != null) {
    const closing = Array.isArray(input.closing) ? input.closing : [input.closing];
    closing.forEach((item, index) => {
      if (typeof item === 'string') {
        if (!isNonEmptyText(item)) throw new Error(`closing[${index}] must be non-empty.`);
      } else {
        validateBlock({ ...item, type: item.type || 'paragraph' }, `closing[${index}]`);
      }
    });
  }
  validateNoReaderVisibleMetaInArticle(input);
}

function validateSource(source) {
  if (!isPlainObject(source)) {
    throw new Error('source must be an object.');
  }
  if (!isNonEmptyText(source.title)) {
    throw new Error('source.title is required.');
  }
  if (countTextLength(source.title) > 64) {
    throw new Error('source.title must be 64 characters or fewer.');
  }
  if (!isNonEmptyText(source.summary)) {
    throw new Error('source.summary is required.');
  }
  if (countTextLength(source.summary) > 120) {
    throw new Error('source.summary must be 120 characters or fewer.');
  }
  if (!isNonEmptyText(source.coverPrompt)) {
    throw new Error('source.cover_prompt is required. source.coverPrompt is accepted as a compatibility alias.');
  }
  if (!isNonEmptyText(source.markdown)) {
    throw new Error('source.markdown is required.');
  }
  if (/^#(?!#)\s+/m.test(source.markdown)) {
    throw new Error('source.markdown must not contain a top-level # heading; keep the title in source.title.');
  }
  if (/^---\s*$/m.test(source.markdown.split('\n')[0] || '')) {
    throw new Error('source.markdown must not start with frontmatter; frontmatter is generated separately.');
  }
  validateNoReaderVisibleMetaText(source.markdown, 'source.markdown');
}

function collectBlocks(input) {
  const blocks = [];
  if (Array.isArray(input.blocks)) {
    input.blocks.forEach((block, index) => blocks.push({ block, location: `blocks[${index}]` }));
  }
  (input.sections || []).forEach((section, sectionIndex) => {
    (section.blocks || []).forEach((block, blockIndex) => {
      blocks.push({ block, location: `sections[${sectionIndex}].blocks[${blockIndex}]` });
    });
  });
  const closing = Array.isArray(input.closing) ? input.closing : input.closing != null ? [input.closing] : [];
  closing.forEach((item, index) => {
    if (typeof item === 'object' && item && !Array.isArray(item)) {
      blocks.push({ block: item, location: `closing[${index}]` });
    }
  });
  return blocks;
}

function collectThemeMappingIssues(input, themeName) {
  const capabilities = getThemeCapabilities(themeName);
  const issues = [];

  if (input.eyebrow != null && capabilities.eyebrow === false) {
    issues.push('eyebrow');
  }
  if (input.meta != null && capabilities.meta === false) {
    issues.push('meta');
  }
  if (input.keywords != null && capabilities.keywords === false) {
    issues.push('keywords');
  }

  collectBlocks(input).forEach(({ block, location }) => {
    if ((block.type || 'paragraph') === 'callout' && capabilities.callout === false) {
      issues.push(`callout:${location}`);
    }
  });

  return issues;
}

function resolveRenderableTheme(input, requestedThemeName) {
  const normalizedTheme = normalizeTheme(requestedThemeName);
  if (normalizedTheme === 'wechat-native-template') {
    return { requestedTheme: normalizedTheme, effectiveTheme: normalizedTheme, downgraded: false, issues: [] };
  }

  const issues = collectThemeMappingIssues(input, normalizedTheme);
  if (issues.length > 0) {
    return {
      requestedTheme: normalizedTheme,
      effectiveTheme: 'wechat-native-template',
      downgraded: true,
      issues,
    };
  }

  return { requestedTheme: normalizedTheme, effectiveTheme: normalizedTheme, downgraded: false, issues: [] };
}

function buildHtml(input) {
  validateArticleInput(input);
  const themePlan = resolveRenderableTheme(input, input.theme);
  const themeName = themePlan.effectiveTheme;
  const preset = mergePreset(themeName);
  const title = input.title || input.titleText || '未命名文章';
  const eyebrow = input.eyebrow || null;
  const meta = input.meta || null;
  const lead = input.lead || null;
  const keywords = input.keywords || null;
  const sections = input.sections || [];
  const topBlocks = input.blocks || [];
  const closing = input.closing || null;

  const bodyStyle = styleFrom(preset, 'body', presets.base.body);
  const articleStyle = styleFrom(preset, 'article', presets.base.article);
  const titleStyle = styleFrom(preset, 'title', '');

  return [
    '<!DOCTYPE html>',
    '<html lang="zh-CN">',
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<meta name="format-detection" content="telephone=no,email=no,address=no">',
    `<title>${escapeHtml(title)}</title>`,
    '</head>',
    `<body style="${bodyStyle}">`,
    `<article style="${articleStyle}">`,
    renderEyebrow(eyebrow, preset),
    `<h1 style="${titleStyle}">${escapeHtml(title)}</h1>`,
    renderMeta(meta, preset),
    renderLead(lead, preset),
    renderKeywords(keywords, preset),
    topBlocks.map((block) => renderBlock(block, preset)).join(''),
    sections.map((section) => renderSection(section, preset)).join(''),
    renderClosing(closing, preset),
    '</article>',
    '</body>',
    '</html>'
  ].join('');
}

function validateHtml(html) {
  const banned = /<(script|iframe|form|style)\b|<div\b/i;
  if (banned.test(html)) {
    throw new Error('Generated HTML contains banned tags.');
  }
  if (!/<!DOCTYPE html>/i.test(html) || !/<html\b/i.test(html) || !/<head\b/i.test(html) || !/<body\b/i.test(html) || !/<article\b/i.test(html)) {
    throw new Error('Generated HTML is missing required document structure.');
  }
  const articleMatches = html.match(/<article\b/gi) || [];
  if (articleMatches.length !== 1) {
    throw new Error('Generated HTML must contain exactly one article.');
  }
  if (/<link\b[^>]*rel=["']?stylesheet/i.test(html) || /position\s*:\s*fixed/i.test(html)) {
    throw new Error('Generated HTML contains external CSS or fixed positioning.');
  }
  const missingInlineStyle = html.match(/<(body|article|section|h1|h2|h3|p|blockquote|ul|ol|li|table|th|td|pre|img)\b(?![^>]*\sstyle=)/i);
  if (missingInlineStyle) {
    throw new Error(`Generated HTML has a key node without inline style: ${missingInlineStyle[1]}.`);
  }
}

function hasDirectSourceFields(input) {
  if (!isPlainObject(input)) return false;
  return input.summary != null || input.coverPrompt != null || input.cover_prompt != null;
}

function normalizeSource(rawSource, overrides = {}) {
  const source = {
    title: collapseInlineText(firstDefined(overrides.title, rawSource.title, rawSource.titleText)),
    summary: collapseInlineText(firstDefined(rawSource.summary)),
    coverPrompt: collapseInlineText(firstDefined(rawSource.coverPrompt, rawSource.cover_prompt)),
    theme: normalizeTheme(firstDefined(overrides.theme, rawSource.theme)),
    markdown: normalizeMarkdownBody(firstDefined(rawSource.markdown)),
  };
  validateSource(source);
  return source;
}

function normalizeArticleFromSource(rawArticle, source, options = {}) {
  const article = { ...(isPlainObject(rawArticle) ? rawArticle : {}) };
  delete article.source;
  delete article.article;
  delete article.summary;
  delete article.coverPrompt;
  delete article.cover_prompt;
  delete article.markdown;

  const articleTitle = firstDefined(article.title, article.titleText);
  if (articleTitle != null && collapseInlineText(articleTitle) !== source.title) {
    throw new Error('article.title must match source.title when source is provided.');
  }

  const leadText = extractLeadText(article.lead);
  if (leadText != null && leadText !== source.summary) {
    throw new Error('article.lead must match source.summary when source is provided.');
  }

  const explicitTheme = firstDefined(options.theme, article.theme);
  if (article.theme != null && options.theme == null && normalizeTheme(article.theme) !== source.theme) {
    throw new Error('article.theme must match source.theme when source is provided.');
  }

  article.title = source.title;
  delete article.titleText;
  article.theme = normalizeTheme(firstDefined(explicitTheme, source.theme));

  if (article.lead == null) {
    article.lead = article.theme === 'academic-paper-template'
      ? { title: '摘要', text: source.summary }
      : source.summary;
  } else if (typeof article.lead === 'string') {
    article.lead = source.summary;
  } else {
    article.lead = {
      ...article.lead,
      text: source.summary,
    };
    if (article.theme === 'academic-paper-template' && !isNonEmptyText(article.lead.title)) {
      article.lead.title = '摘要';
    }
  }

  return article;
}

function normalizeExportInput(input, overrides = {}) {
  if (!isPlainObject(input)) {
    throw new Error('Input payload must be an object.');
  }

  if (input.source == null && !hasDirectSourceFields(input)) {
    throw new Error('Export input must include source fields: title, summary, cover_prompt, and markdown.');
  }

  const sourceRaw = input.source != null ? input.source : input;
  const source = normalizeSource(sourceRaw, overrides);
  const articleRaw = input.source != null
    ? (isPlainObject(input.article) ? input.article : input)
    : (isPlainObject(input.article) ? input.article : input);
  const articleInput = normalizeArticleFromSource(articleRaw, source, overrides);
  validateArticleInput(articleInput);
  return {
    inputModel: 'source-package',
    source,
    articleInput,
  };
}

function normalizeExportMode(mode) {
  if (!mode) return HTML_EXPORT_MODE;
  const key = String(mode).trim().toLowerCase();
  const mapping = {
    [HTML_EXPORT_MODE]: HTML_EXPORT_MODE,
    'html-only': HTML_EXPORT_MODE,
    'html-only-export': HTML_EXPORT_MODE,
    'html': HTML_EXPORT_MODE,
    [SOURCE_HTML_EXPORT_MODE]: SOURCE_HTML_EXPORT_MODE,
    'source+html': SOURCE_HTML_EXPORT_MODE,
    'source-html': SOURCE_HTML_EXPORT_MODE,
    'source-html-export': SOURCE_HTML_EXPORT_MODE,
    'bundle': SOURCE_HTML_EXPORT_MODE,
  };
  const normalized = mapping[key];
  if (!normalized) {
    throw new Error(`Unsupported export mode: ${mode}.`);
  }
  return normalized;
}

function serializeFrontmatterValue(value) {
  return JSON.stringify(String(value ?? ''));
}

function buildSourceMarkdown(source) {
  validateSource(source);
  return [
    '---',
    `title: ${serializeFrontmatterValue(source.title)}`,
    `summary: ${serializeFrontmatterValue(source.summary)}`,
    `cover_prompt: ${serializeFrontmatterValue(source.coverPrompt)}`,
    `theme: ${serializeFrontmatterValue(source.theme)}`,
    '---',
    '',
    source.markdown,
    ''
  ].join('\n');
}

function validateNoSourceLeak(html, source) {
  if (!source) return;
  if (html.includes(source.coverPrompt)) {
    throw new Error('Generated HTML leaked cover_prompt content.');
  }
  validateNoReaderVisibleMetaText(html, 'Generated HTML');
}

function inspectOutputPath(outputPath) {
  if (!isNonEmptyText(outputPath)) {
    throw new Error('Missing --output.');
  }
  const target = path.resolve(outputPath);
  if (fs.existsSync(target)) {
    if (fs.statSync(target).isDirectory()) {
      return { kind: 'directory', target };
    }
    if (!path.extname(target)) {
      throw new Error('Existing output path without extension must be a directory, not a file.');
    }
  }
  const ext = path.extname(target).toLowerCase();
  if (!ext) {
    return { kind: 'directory-path', target };
  }
  if (ext === '.md') {
    return { kind: 'md-file', target };
  }
  if (ext === '.html' || ext === '.htm') {
    return { kind: 'html-file', target };
  }
  throw new Error('Output path must be a directory, .html/.htm file, or .md naming hint.');
}

function resolveOutputTargets(outputPath, exportMode) {
  const inspected = inspectOutputPath(outputPath);

  if (exportMode === HTML_EXPORT_MODE) {
    if (inspected.kind === 'directory' || inspected.kind === 'directory-path') {
      return {
        exportMode,
        shape: 'html-default',
        htmlPath: path.join(inspected.target, DEFAULT_HTML_FILENAME),
      };
    }
    if (inspected.kind === 'md-file') {
      const base = path.basename(inspected.target, '.md');
      return {
        exportMode,
        shape: 'html-derived-from-md',
        htmlPath: path.join(path.dirname(inspected.target), `${base}.html`),
      };
    }
    return {
      exportMode,
      shape: 'html-explicit',
      htmlPath: inspected.target,
    };
  }

  if (inspected.kind === 'directory' || inspected.kind === 'directory-path') {
    return {
      exportMode,
      shape: 'pair-default',
      dir: inspected.target,
      sourcePath: path.join(inspected.target, DEFAULT_SOURCE_FILENAME),
      htmlPath: path.join(inspected.target, DEFAULT_HTML_FILENAME),
    };
  }

  if (inspected.kind === 'md-file') {
    const dir = path.dirname(inspected.target);
    const base = path.basename(inspected.target, '.md');
    return {
      exportMode,
      shape: 'pair-from-md',
      dir,
      base,
      sourcePath: inspected.target,
      htmlPath: path.join(dir, `${base}.html`),
    };
  }

  const dir = path.dirname(inspected.target);
  const ext = path.extname(inspected.target);
  const base = path.basename(inspected.target, ext);
  return {
    exportMode,
    shape: 'pair-from-html',
    dir,
    base,
    htmlExt: ext,
    sourcePath: path.join(dir, `${base}.source.md`),
    htmlPath: inspected.target,
  };
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function prepareHtmlPath(htmlPath, options = {}) {
  if (!fileExists(htmlPath) || options.overwrite) {
    return htmlPath;
  }
  if (!options.renameIfExists) {
    throw new Error(`Output file already exists: ${htmlPath}. Use --overwrite or --rename-if-exists.`);
  }
  const ext = path.extname(htmlPath);
  const dir = path.dirname(htmlPath);
  const base = path.basename(htmlPath, ext);
  for (let index = 1; index < 1000; index += 1) {
    const candidate = path.join(dir, `${base}-${index}${ext}`);
    if (!fileExists(candidate)) {
      return candidate;
    }
  }
  throw new Error(`Unable to allocate renamed output path for: ${htmlPath}.`);
}

function prepareOutputTargets(outputPath, exportMode, options = {}) {
  const targets = resolveOutputTargets(outputPath, exportMode);

  if (exportMode === HTML_EXPORT_MODE) {
    return {
      ...targets,
      htmlPath: prepareHtmlPath(targets.htmlPath, options),
    };
  }

  const conflicts = [targets.sourcePath, targets.htmlPath].filter((filePath) => fileExists(filePath));
  if (conflicts.length === 0 || options.overwrite) {
    return targets;
  }

  if (!options.renameIfExists) {
    throw new Error(`Output file already exists: ${conflicts[0]}. Use --overwrite or --rename-if-exists.`);
  }

  for (let index = 1; index < 1000; index += 1) {
    if (targets.shape === 'pair-default') {
      const candidate = {
        ...targets,
        sourcePath: path.join(targets.dir, `source-${index}.md`),
        htmlPath: path.join(targets.dir, `final-${index}.html`),
      };
      if (!fileExists(candidate.sourcePath) && !fileExists(candidate.htmlPath)) {
        return candidate;
      }
      continue;
    }

    if (targets.shape === 'pair-from-md') {
      const candidate = {
        ...targets,
        sourcePath: path.join(targets.dir, `${targets.base}-${index}.md`),
        htmlPath: path.join(targets.dir, `${targets.base}-${index}.html`),
      };
      if (!fileExists(candidate.sourcePath) && !fileExists(candidate.htmlPath)) {
        return candidate;
      }
      continue;
    }

    const candidate = {
      ...targets,
      sourcePath: path.join(targets.dir, `${targets.base}-${index}.source.md`),
      htmlPath: path.join(targets.dir, `${targets.base}-${index}${targets.htmlExt}`),
    };
    if (!fileExists(candidate.sourcePath) && !fileExists(candidate.htmlPath)) {
      return candidate;
    }
  }

  throw new Error(`Unable to allocate renamed output paths for: ${outputPath}.`);
}

function resolveOutputPath(outputPath) {
  return resolveOutputTargets(outputPath, HTML_EXPORT_MODE).htmlPath;
}

function prepareOutputPath(outputPath, options = {}) {
  return prepareOutputTargets(outputPath, HTML_EXPORT_MODE, options).htmlPath;
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function printHelp() {
  const lines = [
    'Usage:',
    '  node render-wechat-article-html.js --stdin --output <path> [--export-mode <mode>] [--theme <theme>] [--title <title>] [--overwrite|--rename-if-exists]',
    '',
    'Input options:',
    '  --stdin             Read export JSON from stdin supplied by an in-memory producer.',
    '',
    'Export modes:',
    `  ${HTML_EXPORT_MODE}    Write final HTML only. Default.`,
    `  ${SOURCE_HTML_EXPORT_MODE}  Write source.md and final.html together.`,
    '',
    'Output options:',
    '  --output            Directory, .html/.htm file, or .md naming hint.',
    '  --overwrite         Allow overwriting an existing output file.',
    '  --rename-if-exists  Auto-rename when output file already exists.',
  ];
  process.stdout.write(`${lines.join('\n')}\n`);
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }
  if (args.unknown.length > 0) {
    throw new Error(`Unknown argument(s): ${args.unknown.join(', ')}.`);
  }

  if (!args.stdin) {
    throw new Error('Missing --stdin.');
  }
  if (!args.output) {
    throw new Error('Missing --output.');
  }

  const exportMode = normalizeExportMode(args.exportMode);
  const input = readJson(args);
  const normalized = normalizeExportInput(input, {
    theme: args.theme,
    title: args.title,
  });
  const themePlan = resolveRenderableTheme(normalized.articleInput, normalized.articleInput.theme);
  const html = buildHtml(normalized.articleInput);
  validateHtml(html);
  validateNoSourceLeak(html, normalized.source);

  if (exportMode === SOURCE_HTML_EXPORT_MODE && !normalized.source) {
    throw new Error('source-html-export requires source fields or a source object in the input payload.');
  }

  const outputTargets = prepareOutputTargets(args.output, exportMode, {
    overwrite: args.overwrite,
    renameIfExists: args.renameIfExists,
  });

  ensureDir(outputTargets.htmlPath);
  fs.writeFileSync(outputTargets.htmlPath, html, 'utf8');

  if (exportMode === SOURCE_HTML_EXPORT_MODE) {
    const sourceMarkdown = buildSourceMarkdown(normalized.source);
    ensureDir(outputTargets.sourcePath);
    fs.writeFileSync(outputTargets.sourcePath, sourceMarkdown, 'utf8');
  }

  process.stdout.write(JSON.stringify({
    inputModel: normalized.inputModel,
    exportMode,
    requestedTheme: themePlan.requestedTheme,
    effectiveTheme: themePlan.effectiveTheme,
    downgradedToNative: themePlan.downgraded,
    downgradeReasons: themePlan.issues,
    output: outputTargets.htmlPath,
    sourceOutput: outputTargets.sourcePath || null,
  }, null, 2));
}

module.exports = {
  HTML_EXPORT_MODE,
  SOURCE_HTML_EXPORT_MODE,
  buildHtml,
  buildSourceMarkdown,
  collectThemeMappingIssues,
  escapeHtml,
  extractLeadText,
  mergePreset,
  normalizeExportInput,
  normalizeExportMode,
  normalizeSource,
  normalizeTheme,
  parseArgs,
  prepareOutputPath,
  prepareOutputTargets,
  printHelp,
  renderBlock,
  renderClosing,
  renderLead,
  renderSection,
  renderText,
  resolveOutputPath,
  resolveOutputTargets,
  resolveRenderableTheme,
  validateArticleInput,
  validateHtml,
  validateNoSourceLeak,
  validateNoReaderVisibleMetaText,
  validateSource,
};

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message || String(error));
    process.exit(1);
  }
}
