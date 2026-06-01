#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const STYLES = {
  body: "margin:0;padding:0;background:#ffffff;color:#2f241f;user-select:text;-webkit-user-select:text;font-size:15px;font-family:'Times New Roman','PingFang SC','Hiragino Sans GB','Microsoft YaHei','Helvetica Neue',Arial,sans-serif;",
  article: "max-width:680px;margin:0 auto;padding:32px 22px 54px;box-sizing:border-box;background:#ffffff;user-select:text;-webkit-user-select:text;",
  title: "margin:0 0 16px;font-size:26px;line-height:1.32;font-weight:700;letter-spacing:-0.022em;text-align:left;color:#2f241f;",
  lead: "margin:0 0 26px;max-width:624px;font-size:15px;line-height:1.98;color:#4f4139;text-align:justify;",
  callout: "margin:0 0 30px;padding:18px 18px 16px;background-color:#fcf8f4;border:1px solid #dcc8b5;border-left:4px solid #a26d49;border-radius:14px;",
  calloutLabel: "margin:0 0 8px;font-size:13px;line-height:1.8;font-weight:700;letter-spacing:0.12em;color:#a26d49;text-transform:uppercase;",
  calloutText: "margin:0;font-size:15px;line-height:1.95;color:#2f241f;text-align:justify;text-indent:0;",
  h2: "margin:38px 0 14px;padding:0 0 11px;font-size:21px;line-height:1.36;font-weight:700;letter-spacing:-0.02em;color:#2f241f;border-bottom:1px solid #dcc8b5;",
  h3: "margin:24px 0 10px;padding-left:12px;border-left:2px solid #c7a88c;font-size:15px;line-height:1.78;font-weight:700;letter-spacing:0.01em;color:#2f241f;",
  paragraph: "margin:0 0 15px;font-size:15px;line-height:1.95;color:#2f241f;text-align:justify;text-indent:0;",
  list: "margin:10px 0 18px;padding-left:22px;color:#2f241f;",
  listItem: "margin:6px 0;font-size:15px;line-height:1.9;",
  quote: "margin:22px 0;padding:15px 16px;background-color:#fbf6f1;border:1px solid #e2d4c6;border-left:3px solid #a26d49;border-radius:12px;",
  quoteText: "margin:0;font-size:15px;line-height:1.95;color:#5f5148;text-align:justify;",
  tableLabel: "margin:0 0 8px;font-size:13px;line-height:1.8;font-weight:700;letter-spacing:0.1em;color:#a26d49;text-transform:uppercase;",
  tableNote: "margin:0 0 10px;font-size:15px;line-height:1.85;color:#2f241f;",
  table: "width:100%;border-collapse:collapse;table-layout:fixed;font-size:14px;line-height:1.85;color:#2f241f;border-top:1.5px solid #dcc8b5;border-bottom:1.5px solid #dcc8b5;background-color:#fdfaf6;",
  th: "padding:13px 12px;border:none;border-bottom:1px solid #dcc8b5;background-color:#f7efe7;text-align:left;font-weight:700;color:#2f241f;",
  tdStrong: "padding:12px 12px;border:none;border-bottom:1px solid #eaded0;background-color:#fdfaf6;vertical-align:top;font-weight:600;word-break:break-word;",
  td: "padding:12px 12px;border:none;border-bottom:1px solid #eaded0;background-color:#fdfaf6;vertical-align:top;word-break:break-word;"
};

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const out = { unknown: [] };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--source') out.source = argv[++i];
    else if (arg === '--output') out.output = argv[++i];
    else if (arg === '--overwrite') out.overwrite = true;
    else if (arg === '--stdout') out.stdout = true;
    else if (arg === '--help' || arg === '-h') out.help = true;
    else out.unknown.push(arg);
  }
  return out;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: render-wechat-news-html.js --source <source.md> [--output <final.html>] [--stdout] [--overwrite]',
      '',
      'Deterministically renders the fixed HTML layout from source.md.',
    ].join('\n')
  );
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function countChars(value) {
  return Array.from(normalizeText(value)).length;
}

function readSourceFile(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
}

function parseFrontmatter(raw) {
  if (!raw.startsWith('---\n')) {
    fail('source.md must start with frontmatter.');
  }
  const endIndex = raw.indexOf('\n---\n', 4);
  if (endIndex === -1) {
    fail('source.md frontmatter is not closed.');
  }
  const metaBlock = raw.slice(4, endIndex);
  const body = raw.slice(endIndex + 5).trim();
  const meta = {};
  for (const line of metaBlock.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^([a-z_]+):\s*(.+)$/);
    if (!match) {
      fail(`Invalid frontmatter line: ${trimmed}`);
    }
    const key = match[1];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }
  return { meta, body };
}

function parseTableLine(line) {
  const trimmed = line.trim();
  const inner = trimmed.replace(/^\|/, '').replace(/\|$/, '');
  return inner.split('|').map((cell) => normalizeText(cell));
}

function isTableSeparator(line) {
  const trimmed = line.trim();
  return /^\|?[\s:-]+(\|[\s:-]+)+\|?$/.test(trimmed);
}

function isMarkerLine(line) {
  return /^#{1,3}\s+/.test(line) || /^>\s?/.test(line) || /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line) || /^\|/.test(line);
}

function parseBlocks(lines, startIndex, stopOnH2) {
  const blocks = [];
  let i = startIndex;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (stopOnH2 && /^##\s+/.test(line)) {
      break;
    }
    if (/^###\s+/.test(line)) {
      blocks.push({ type: 'h3', text: normalizeText(line.replace(/^###\s+/, '')) });
      i += 1;
      continue;
    }
    if (/^>\s?/.test(line)) {
      const quoteLines = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(normalizeText(lines[i].replace(/^>\s?/, '')));
        i += 1;
      }
      blocks.push({ type: 'quote', text: normalizeText(quoteLines.join(' ')) });
      continue;
    }
    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line);
      const items = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        ((ordered && /^\d+\.\s+/.test(lines[i])) || (!ordered && /^[-*]\s+/.test(lines[i])))
      ) {
        items.push(normalizeText(lines[i].replace(ordered ? /^\d+\.\s+/ : /^[-*]\s+/, '')));
        i += 1;
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }
    if (/^\|/.test(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headers = parseTableLine(lines[i]);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(parseTableLine(lines[i]));
        i += 1;
      }
      blocks.push({ type: 'table', headers, rows });
      continue;
    }

    const paragraphLines = [];
    while (i < lines.length && lines[i].trim()) {
      if (stopOnH2 && /^##\s+/.test(lines[i])) break;
      if (paragraphLines.length > 0 && isMarkerLine(lines[i])) break;
      paragraphLines.push(normalizeText(lines[i]));
      i += 1;
    }
    blocks.push({ type: 'paragraph', text: normalizeText(paragraphLines.join(' ')) });
  }

  return { blocks, nextIndex: i };
}

function parseMarkdown(body) {
  const lines = body.split('\n');
  let i = 0;
  while (i < lines.length && !lines[i].trim()) i += 1;
  if (i >= lines.length || !/^#\s+/.test(lines[i])) {
    fail('source markdown must start with a reader-visible # title.');
  }
  const title = normalizeText(lines[i].replace(/^#\s+/, ''));
  i += 1;

  const prelude = parseBlocks(lines, i, true);
  i = prelude.nextIndex;
  const sections = [];
  while (i < lines.length) {
    while (i < lines.length && !lines[i].trim()) i += 1;
    if (i >= lines.length) break;
    if (!/^##\s+/.test(lines[i])) {
      fail(`Unexpected body content before section heading: ${lines[i]}`);
    }
    const heading = normalizeText(lines[i].replace(/^##\s+/, ''));
    i += 1;
    const parsed = parseBlocks(lines, i, true);
    sections.push({ heading, blocks: parsed.blocks });
    i = parsed.nextIndex;
  }
  return { title, preludeBlocks: prelude.blocks, sections };
}

function validateSourceShape(parsed) {
  const allowedMetaKeys = ['title', 'summary', 'cover_prompt'];
  for (const key of Object.keys(parsed.meta)) {
    if (!allowedMetaKeys.includes(key)) {
      fail(`Unsupported frontmatter key: ${key}`);
    }
  }
  if (!parsed.meta.title || !parsed.meta.summary || !parsed.meta.cover_prompt) {
    fail('source.md frontmatter must contain title, summary and cover_prompt.');
  }
  if (countChars(parsed.meta.title) > 64) {
    fail('source.md title must be 64 characters or fewer.');
  }
  if (countChars(parsed.meta.summary) > 120) {
    fail('source.md summary must be 120 characters or fewer.');
  }
  if (parsed.ast.title !== normalizeText(parsed.meta.title)) {
    fail('reader-visible # title must exactly match frontmatter title.');
  }
  const firstPreludeParagraph = parsed.ast.preludeBlocks.find((block) => block.type === 'paragraph');
  if (!firstPreludeParagraph) {
    fail('source markdown must contain a summary paragraph after the # title.');
  }
  if (normalizeText(firstPreludeParagraph.text) !== normalizeText(parsed.meta.summary)) {
    fail('first reader-visible paragraph must exactly match frontmatter summary.');
  }
  const preludeCallout = parsed.ast.preludeBlocks.find((block) => block.type === 'quote');
  if (!preludeCallout) {
    fail('source markdown must contain a pre-section blockquote as the fixed conclusion block.');
  }
  if (parsed.ast.sections.length === 0) {
    fail('source markdown must contain at least one ## section.');
  }
  const lastSectionHeading = parsed.ast.sections[parsed.ast.sections.length - 1].heading;
  if (!/原始报道链接|原始报道索引/.test(lastSectionHeading)) {
    fail('source markdown must end with an 原始报道链接 / 原始报道索引 section.');
  }
}

function renderParagraph(text, style) {
  return `<p style="${style}">${escapeHtml(text)}</p>`;
}

function renderList(block) {
  const tag = block.ordered ? 'ol' : 'ul';
  const items = block.items.map((item) => `<li style="${STYLES.listItem}">${escapeHtml(item)}</li>`).join('');
  return `<${tag} style="${STYLES.list}">${items}</${tag}>`;
}

function renderQuote(text) {
  return `<blockquote style="${STYLES.quote}"><p style="${STYLES.quoteText}">${escapeHtml(text)}</p></blockquote>`;
}

function renderTable(block, sectionHeading) {
  const label = sectionHeading.includes('链接') ? '原始报道索引' : '今日热点地图';
  const headCells = block.headers.map((cell) => `<th style="${STYLES.th}">${escapeHtml(cell)}</th>`).join('');
  const bodyRows = block.rows.map((row) => {
    const cells = row.map((cell, index) => `<td style="${index === 0 ? STYLES.tdStrong : STYLES.td}">${escapeHtml(cell)}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  return [
    `<section style="margin:18px 0;">`,
    `<p style="${STYLES.tableLabel}">${escapeHtml(label)}</p>`,
    `<table cellpadding="0" cellspacing="0" style="${STYLES.table}">`,
    `<thead><tr>${headCells}</tr></thead>`,
    `<tbody>${bodyRows}</tbody>`,
    `</table>`,
    `</section>`
  ].join('');
}

function renderBlock(block, context) {
  if (block.type === 'paragraph') return renderParagraph(block.text, STYLES.paragraph);
  if (block.type === 'list') return renderList(block);
  if (block.type === 'quote') return context.prelude ? '' : renderQuote(block.text);
  if (block.type === 'h3') return `<h3 style="${STYLES.h3}">${escapeHtml(block.text)}</h3>`;
  if (block.type === 'table') return renderTable(block, context.sectionHeading || '');
  fail(`Unsupported block type: ${block.type}`);
}

function buildHtmlFromAst(ast) {
  const preludeParagraphs = ast.preludeBlocks.filter((block) => block.type === 'paragraph');
  const preludeCallout = ast.preludeBlocks.find((block) => block.type === 'quote');

  const preludeHtml = [];
  if (preludeParagraphs.length > 0) {
    preludeHtml.push(renderParagraph(preludeParagraphs[0].text, STYLES.lead));
  }
  if (preludeCallout) {
    preludeHtml.push(
      `<section style="${STYLES.callout}">` +
        `<p style="${STYLES.calloutLabel}">快速结论</p>` +
        `<p style="${STYLES.calloutText}">${escapeHtml(preludeCallout.text)}</p>` +
      `</section>`
    );
  }
  for (const block of ast.preludeBlocks) {
    if (block === preludeParagraphs[0] || block === preludeCallout) continue;
    preludeHtml.push(renderBlock(block, { prelude: true }));
  }

  const sectionsHtml = ast.sections.map((section) => {
    const blocksHtml = section.blocks.map((block) => renderBlock(block, { sectionHeading: section.heading })).join('');
    return `<section style="margin:0;"><h2 style="${STYLES.h2}">${escapeHtml(section.heading)}</h2>${blocksHtml}</section>`;
  }).join('');

  return [
    '<!DOCTYPE html>',
    '<html lang="zh-CN">',
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<meta name="format-detection" content="telephone=no,email=no,address=no">',
    `<title>${escapeHtml(ast.title)}</title>`,
    '</head>',
    `<body style="${STYLES.body}">`,
    `<article style="${STYLES.article}">`,
    `<h1 style="${STYLES.title}">${escapeHtml(ast.title)}</h1>`,
    preludeHtml.join(''),
    sectionsHtml,
    '</article>',
    '</body>',
    '</html>'
  ].join('');
}

function parseSourceFile(filePath) {
  const raw = readSourceFile(filePath);
  const parsed = parseFrontmatter(raw);
  const ast = parseMarkdown(parsed.body);
  const result = {
    filePath,
    meta: parsed.meta,
    body: parsed.body,
    ast,
  };
  validateSourceShape(result);
  return result;
}

function renderToHtml(filePath) {
  const parsed = parseSourceFile(filePath);
  return buildHtmlFromAst(parsed.ast);
}

function writeOutput(outputPath, content, overwrite) {
  const resolved = path.resolve(outputPath);
  if (fs.existsSync(resolved) && !overwrite) {
    fail(`Output already exists: ${resolved}`);
  }
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, content, 'utf8');
  return resolved;
}

function main() {
  const options = parseArgs(process.argv);
  if (options.help) {
    printHelp();
    return;
  }
  if (options.unknown.length > 0) {
    fail(`Unknown arguments: ${options.unknown.join(', ')}`);
  }
  if (!options.source) {
    fail('--source is required.');
  }
  const html = renderToHtml(options.source);
  if (options.stdout || !options.output) {
    process.stdout.write(html);
    return;
  }
  writeOutput(options.output, html, Boolean(options.overwrite));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}

module.exports = {
  parseSourceFile,
  buildHtmlFromAst,
  renderToHtml,
  normalizeText,
  countChars,
};
