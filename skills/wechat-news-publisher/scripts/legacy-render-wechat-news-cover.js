#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { parseSourceFile, normalizeText } = require('./render-wechat-news-html.js');

const WIDTH = 1410;
const HEIGHT = 600;

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
    else if (arg === '--help' || arg === '-h') out.help = true;
    else out.unknown.push(arg);
  }
  return out;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: legacy-render-wechat-news-cover.js --source <source.md> --output <scover.png> [--overwrite]',
      '',
      'Deterministically renders the fixed cover layout and writes scover.png.',
    ].join('\n')
  );
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function shorten(value, maxChars) {
  const chars = Array.from(normalizeText(value));
  if (chars.length <= maxChars) return chars.join('');
  return `${chars.slice(0, Math.max(0, maxChars - 1)).join('')}…`;
}

function wrapText(value, maxCharsPerLine, maxLines) {
  const chars = Array.from(normalizeText(value));
  const lines = [];
  let current = '';
  for (const char of chars) {
    if (current.length >= maxCharsPerLine) {
      lines.push(current);
      current = '';
      if (lines.length >= maxLines) break;
    }
    current += char;
  }
  if (lines.length < maxLines && current) {
    lines.push(current);
  }
  if (lines.length > maxLines) {
    return lines.slice(0, maxLines);
  }
  if (chars.length > lines.join('').length && lines.length > 0) {
    const last = lines.length - 1;
    lines[last] = shorten(lines[last], Math.max(1, maxCharsPerLine - 1));
  }
  return lines;
}

function deriveDateLine(title) {
  const fullDate = title.match(/\d{4}年\d{1,2}月\d{1,2}日/);
  if (fullDate) return fullDate[0];
  const monthDay = title.match(/\d{1,2}月\d{1,2}日/);
  if (monthDay) return monthDay[0];
  return '今日要闻';
}

function deriveMainTitle(title) {
  const cleaned = normalizeText(title)
    .replace(/\d{4}年\d{1,2}月\d{1,2}日/g, '')
    .replace(/\d{1,2}月\d{1,2}日/g, '')
    .replace(/^[：:·\-\s]+|[：:·\-\s]+$/g, '');
  if (!cleaned) return '热点新闻速览';
  return cleaned;
}

function extractCards(parsed) {
  const cards = [];
  for (const section of parsed.ast.sections) {
    if (/原始报道链接|原始报道索引/.test(section.heading)) continue;
    let addedH3 = 0;
    for (let i = 0; i < section.blocks.length; i += 1) {
      const block = section.blocks[i];
      if (block.type !== 'h3') continue;
      const nextParagraph = section.blocks.slice(i + 1).find((candidate) => candidate.type === 'paragraph');
      cards.push({
        title: shorten(block.text, 12),
        subtitle: shorten(nextParagraph ? nextParagraph.text : section.heading, 14),
      });
      addedH3 += 1;
      if (cards.length >= 6) break;
    }
    if (cards.length >= 6) break;
    if (addedH3 === 0) {
      const summaryParagraph = section.blocks.find((block) => block.type === 'paragraph');
      cards.push({
        title: shorten(section.heading, 12),
        subtitle: shorten(summaryParagraph ? summaryParagraph.text : parsed.meta.summary, 14),
      });
    }
    if (cards.length >= 6) break;
  }
  while (cards.length < 5) {
    cards.push({
      title: cards.length === 0 ? '今日热点' : `要点 ${cards.length + 1}`,
      subtitle: cards.length === 0 ? shorten(parsed.meta.summary, 14) : '重点信息整理',
    });
  }
  return cards.slice(0, 6);
}

function buildCard(card, layout, dark) {
  const titleLines = wrapText(card.title, dark ? 8 : 10, 2);
  const subtitleLines = wrapText(card.subtitle, dark ? 10 : 12, 2);
  const textColor = dark ? '#fff7ee' : '#4f3628';
  const subColor = dark ? '#f1dfcf' : '#765848';
  const stroke = dark ? '#4f3628' : '#d6b88d';
  const fill = dark ? '#60412e' : '#fff9f1';
  const accent = dark ? '#f2d3a3' : '#d6a15d';

  const titleSvg = titleLines.map((line, index) => (
    `<tspan x="${layout.x + 26}" y="${layout.y + 54 + index * 34}">${escapeXml(line)}</tspan>`
  )).join('');
  const subtitleSvg = subtitleLines.map((line, index) => (
    `<tspan x="${layout.x + 26}" y="${layout.y + 98 + index * 24}">${escapeXml(line)}</tspan>`
  )).join('');

  return [
    `<g>`,
    `<rect x="${layout.x}" y="${layout.y}" width="${layout.w}" height="${layout.h}" rx="18" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`,
    `<text font-family="'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif" font-size="18" font-weight="700" fill="${textColor}">${titleSvg}</text>`,
    `<text font-family="'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif" font-size="13" fill="${subColor}">${subtitleSvg}</text>`,
    `<path d="M${layout.x + 26} ${layout.y + layout.h - 42} H${layout.x + layout.w - 26}" stroke="${accent}" stroke-width="2" opacity="0.65"/>`,
    `<circle cx="${layout.x + layout.w - 42}" cy="${layout.y + 38}" r="7" fill="${accent}" opacity="0.35"/>`,
    `</g>`
  ].join('');
}

function buildSvg(parsed) {
  const title = parsed.ast.title;
  const dateLine = deriveDateLine(title);
  const mainTitle = deriveMainTitle(title);
  const titleLines = wrapText(mainTitle, 10, 2);
  const summaryLine = shorten(parsed.meta.summary, 16);
  const cards = extractCards(parsed);

  const cardLayouts = [
    { x: 745, y: 80, w: 355, h: 185, dark: false },
    { x: 1110, y: 55, w: 270, h: 180, dark: false },
    { x: 745, y: 280, w: 195, h: 170, dark: false },
    { x: 955, y: 245, w: 250, h: 205, dark: false },
    { x: 1218, y: 245, w: 162, h: 205, dark: true },
    { x: 745, y: 465, w: 635, h: 95, dark: false }
  ];

  const cardSvg = cards.slice(0, cardLayouts.length).map((card, index) => buildCard(card, cardLayouts[index], cardLayouts[index].dark)).join('');
  const titleSvg = titleLines.map((line, index) => (
    `<tspan x="76" y="${index === 0 ? 290 : 390}">${escapeXml(line)}</tspan>`
  )).join('');

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">`,
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="#fdf7ee"/>`,
    `<rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="url(#bgGradient)"/>`,
    `<defs>`,
    `<linearGradient id="bgGradient" x1="0" y1="0" x2="1" y2="1">`,
    `<stop offset="0%" stop-color="#fffaf2"/>`,
    `<stop offset="100%" stop-color="#f7ead7"/>`,
    `</linearGradient>`,
    `</defs>`,
    `<rect x="0" y="42" width="580" height="70" rx="0" fill="#4b2f1e"/>`,
    `<path d="M520 42 L580 42 L620 112 L560 112 Z" fill="#4b2f1e"/>`,
    `<text x="48" y="89" font-family="'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif" font-size="28" font-weight="700" fill="#fff7ee">今日速览 · 热点新闻</text>`,
    `<text x="640" y="88" font-family="'Times New Roman',serif" font-size="30" font-weight="700" fill="#d4954e">///</text>`,
    `<path d="M636 108 H745" stroke="#c88949" stroke-width="4"/>`,
    `<circle cx="386" cy="470" r="102" fill="#f5d7a6" opacity="0.35"/>`,
    `<path d="M0 565 H1410" stroke="#e1c79f" stroke-width="2"/>`,
    `<path d="M44 560 C160 512, 260 520, 390 560" stroke="#ecd6b5" stroke-width="2" fill="none"/>`,
    `<path d="M290 534 H590" stroke="#eddcc3" stroke-width="2"/>`,
    `<text x="76" y="220" font-family="'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif" font-size="44" font-weight="700" fill="#3a2618">${escapeXml(dateLine)}</text>`,
    `<text font-family="'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif" font-size="72" font-weight="700" fill="#351f12">${titleSvg}</text>`,
    `<path d="M76 430 H570" stroke="#b98b56" stroke-width="3"/>`,
    `<text x="76" y="484" font-family="'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif" font-size="28" fill="#5c3e2a">快速了解今日要闻</text>`,
    `<text x="410" y="485" font-family="'Times New Roman',serif" font-size="38" font-weight="700" fill="#c88949">›››</text>`,
    `<text x="76" y="520" font-family="'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif" font-size="18" fill="#9a7a62">${escapeXml(summaryLine)}</text>`,
    `<path d="M42 548 H190 M214 548 H298 M320 548 H612" stroke="#ead3b3" stroke-width="2"/>`,
    cardSvg,
    `</svg>`
  ].join('');
}

function writeTempHtml(svg) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wechat-news-cover-page-'));
  const htmlPath = path.join(tempDir, 'scover.html');
  const html = [
    '<!DOCTYPE html>',
    '<html lang="zh-CN">',
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<style>',
    'html,body{margin:0;padding:0;background:#fdf7ee;overflow:hidden;}',
    `body{width:${WIDTH}px;height:${HEIGHT}px;}`,
    `svg{display:block;width:${WIDTH}px;height:${HEIGHT}px;}`,
    '</style>',
    '</head>',
    '<body>',
    svg,
    '</body>',
    '</html>',
  ].join('');
  fs.writeFileSync(htmlPath, html, 'utf8');
  return { tempDir, htmlPath };
}

function assertSupportedHost() {
  if (process.platform !== 'darwin') {
    fail('Cover rendering is only supported on macOS. Run this skill on macOS or disable need_cover.');
  }
}

function resolveBrowserFromEnv() {
  const value = process.env.WECHAT_NEWS_BROWSER_BIN;
  if (!value) return null;
  const resolved = path.resolve(value);
  if (!fs.existsSync(resolved)) {
    fail(`WECHAT_NEWS_BROWSER_BIN does not exist: ${resolved}`);
  }
  return resolved;
}

function resolveBrowserCandidates() {
  return [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  ];
}

function resolveBrowserBinary() {
  assertSupportedHost();
  const envBrowser = resolveBrowserFromEnv();
  if (envBrowser) return envBrowser;
  for (const candidate of resolveBrowserCandidates()) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }
  fail(
    'No supported macOS Chromium browser was found. Install Google Chrome, Microsoft Edge, Chromium, or Brave Browser, or set WECHAT_NEWS_BROWSER_BIN.'
  );
}

function renderWithBrowser(browserPath, htmlPath, outputPath) {
  const fileUrl = `file://${htmlPath}`;
  const baseArgs = [
    '--allow-file-access-from-files',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--force-device-scale-factor=1',
    `--window-size=${WIDTH},${HEIGHT}`,
    `--screenshot=${outputPath}`,
    fileUrl,
  ];

  const attempts = [
    ['--headless=new', ...baseArgs],
    ['--headless', ...baseArgs],
  ];
  const failureLogs = [];

  for (const args of attempts) {
    const result = spawnSync(browserPath, args, { encoding: 'utf8' });
    if (result.status === 0 && fs.existsSync(outputPath)) {
      return;
    }
    failureLogs.push(
      [
        `args=${args[0]}`,
        `status=${result.status}`,
        result.error ? `error=${result.error.message}` : null,
        result.stderr ? `stderr=${result.stderr.trim()}` : null,
      ].filter(Boolean).join(' ')
    );
  }

  fail(`Failed to render cover PNG with browser: ${browserPath}. ${failureLogs.join(' | ')}`);
}

function renderCover(sourcePath, outputPath, overwrite) {
  const parsed = parseSourceFile(sourcePath);
  const svg = buildSvg(parsed);
  const resolvedOutput = path.resolve(outputPath);
  if (fs.existsSync(resolvedOutput) && !overwrite) {
    fail(`Output already exists: ${resolvedOutput}`);
  }
  fs.mkdirSync(path.dirname(resolvedOutput), { recursive: true });

  const browserPath = resolveBrowserBinary();
  const { tempDir: htmlTempDir, htmlPath } = writeTempHtml(svg);
  try {
    renderWithBrowser(browserPath, htmlPath, resolvedOutput);
  } finally {
    fs.rmSync(htmlTempDir, { recursive: true, force: true });
  }
  return resolvedOutput;
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
  if (!options.source || !options.output) {
    fail('--source and --output are required.');
  }
  renderCover(options.source, options.output, Boolean(options.overwrite));
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
  WIDTH,
  HEIGHT,
  buildSvg,
  extractCards,
  resolveBrowserBinary,
  renderCover,
};
