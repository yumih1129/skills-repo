#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const renderer = require('./render-wechat-article-html.js');
const presets = require('../assets/theme-presets.js');

function parseArgs(argv) {
  const out = { unknown: [] };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--output') out.output = argv[++i];
    else if (arg === '--themes') out.themes = argv[++i];
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

function isNonEmptyText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

const ALL_THEME_ALIASES = new Set([
  'all',
  '*',
  'all themes',
  'all-themes',
  '全部',
  '全部主题',
  '所有主题',
  '全主题',
  '各种主题',
  '各主题',
  '每种主题',
  '所有内置主题',
  '内置全部主题',
  '全部内置主题',
  '所有风格',
  '全部风格',
  '各种风格',
  '各种主题风格',
  '所有内置风格',
  '内置全部风格',
  '全部内置风格',
]);

function isAllThemeRequest(value) {
  return ALL_THEME_ALIASES.has(String(value).trim().toLowerCase());
}

function normalizeThemeList(value) {
  if (!isNonEmptyText(value)) {
    throw new Error('Missing --themes.');
  }

  const rawThemes = isAllThemeRequest(value)
    ? Object.keys(presets.themes)
    : String(value).split(',').map((item) => item.trim()).filter(Boolean);

  if (rawThemes.length === 0) {
    throw new Error('--themes must contain at least one theme.');
  }

  const seen = new Set();
  const themes = [];
  rawThemes.forEach((rawTheme) => {
    const normalized = renderer.normalizeTheme(rawTheme);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      themes.push({
        requestedTheme: rawTheme,
        theme: normalized,
      });
    }
  });
  return themes;
}

function themeBasename(themeName) {
  return themeName.replace(/-template$/, '');
}

function inspectOutputDir(outputPath) {
  if (!isNonEmptyText(outputPath)) {
    throw new Error('Missing --output.');
  }
  const target = path.resolve(outputPath);
  if (fs.existsSync(target) && !fs.statSync(target).isDirectory()) {
    throw new Error('Batch output path must be a directory.');
  }
  return target;
}

function preparePath(filePath, options = {}) {
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    throw new Error(`Output file path is a directory: ${filePath}.`);
  }
  if (!fs.existsSync(filePath) || options.overwrite) {
    return filePath;
  }
  if (!options.renameIfExists) {
    throw new Error(`Output file already exists: ${filePath}. Use --overwrite or --rename-if-exists.`);
  }

  const ext = path.extname(filePath);
  const dir = path.dirname(filePath);
  const base = path.basename(filePath, ext);
  for (let index = 1; index < 1000; index += 1) {
    const candidate = path.join(dir, `${base}-${index}${ext}`);
    if (!fs.existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(`Unable to allocate renamed output path for: ${filePath}.`);
}

function buildBatch(input, themes, options = {}) {
  const baseNormalized = renderer.normalizeExportInput(input, {
    title: options.title,
  });

  const outputs = themes.map(({ requestedTheme, theme }) => {
    const normalized = renderer.normalizeExportInput(input, {
      title: options.title,
      theme,
    });
    const themePlan = renderer.resolveRenderableTheme(normalized.articleInput, normalized.articleInput.theme);
    const html = renderer.buildHtml(normalized.articleInput);
    renderer.validateHtml(html);
    renderer.validateNoSourceLeak(html, normalized.source);
    return {
      requestedTheme,
      theme,
      effectiveTheme: themePlan.effectiveTheme,
      downgradedToNative: themePlan.downgraded,
      downgradeReasons: themePlan.issues,
      html,
    };
  });

  return {
    inputModel: baseNormalized.inputModel,
    source: baseNormalized.source,
    outputs,
  };
}

function writeBatch(batch, outputDir, exportMode, options = {}) {
  const sourceHtmlMode = renderer.normalizeExportMode(exportMode) === renderer.SOURCE_HTML_EXPORT_MODE;
  const prepared = batch.outputs.map((item) => ({
    ...item,
    output: preparePath(path.join(outputDir, `${themeBasename(item.theme)}.html`), options),
  }));

  const sourceOutput = sourceHtmlMode
    ? preparePath(path.join(outputDir, 'source.md'), options)
    : null;

  const writeItems = prepared.map((item) => ({
    output: item.output,
    content: item.html,
  }));
  if (sourceOutput) {
    writeItems.push({
      output: sourceOutput,
      content: renderer.buildSourceMarkdown(batch.source),
    });
  }

  const writtenOutputs = [];
  fs.mkdirSync(outputDir, { recursive: true });
  try {
    writeItems.forEach((item) => {
      fs.writeFileSync(item.output, item.content, 'utf8');
      writtenOutputs.push(item.output);
    });
  } catch (error) {
    writtenOutputs.forEach((output) => {
      try {
        fs.rmSync(output, { force: true });
      } catch (_) {
        // Cleanup is best-effort; no intermediate files are created by this script.
      }
    });
    throw error;
  }

  return {
    sourceOutput,
    outputs: prepared.map((item) => ({
      requestedTheme: item.requestedTheme,
      theme: item.theme,
      effectiveTheme: item.effectiveTheme,
      downgradedToNative: item.downgradedToNative,
      downgradeReasons: item.downgradeReasons,
      output: item.output,
    })),
  };
}

function printHelp() {
  const lines = [
    'Usage:',
    '  node render-wechat-article-theme-batch.js --stdin --output <dir> --themes <theme,...|all|全部主题|各种主题> [--export-mode <mode>] [--title <title>] [--overwrite|--rename-if-exists]',
    '',
    'Input options:',
    '  --stdin             Read export JSON from stdin supplied by an in-memory producer.',
    '',
    'Batch options:',
    '  --themes            Comma-separated theme list, or an all-theme alias such as all, 全部主题, or 各种主题.',
    '  --output            Output directory.',
    '',
    'Export modes:',
    `  ${renderer.HTML_EXPORT_MODE}    Write theme HTML files only. Default.`,
    `  ${renderer.SOURCE_HTML_EXPORT_MODE}  Write source.md plus theme HTML files.`,
    '',
    'Output options:',
    '  --overwrite         Allow overwriting existing output files.',
    '  --rename-if-exists  Auto-rename when output files already exist.',
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

  const exportMode = renderer.normalizeExportMode(args.exportMode);
  const themes = normalizeThemeList(args.themes);
  const outputDir = inspectOutputDir(args.output);
  const input = readJson(args);
  const batch = buildBatch(input, themes, {
    title: args.title,
  });
  const written = writeBatch(batch, outputDir, exportMode, {
    overwrite: args.overwrite,
    renameIfExists: args.renameIfExists,
  });

  process.stdout.write(JSON.stringify({
    inputModel: batch.inputModel,
    exportMode,
    outputDir,
    sourceOutput: written.sourceOutput,
    outputs: written.outputs,
  }, null, 2));
}

module.exports = {
  buildBatch,
  isAllThemeRequest,
  normalizeThemeList,
  themeBasename,
  writeBatch,
};

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message || String(error));
    process.exit(1);
  }
}
