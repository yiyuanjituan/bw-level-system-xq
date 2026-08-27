import { mkdir, opendir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const sourceDirectory = path.join(root, "src");
const chineseRegex = /[\u{4E00}-\u{9FFF}\u{3400}-\u{4DBF}]/u;
const attributeRegex = /([:@#A-Za-z_][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
const stringLiteralRegex = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g;
const templateLiteralRegex = /`(?:\\.|[^`\\])*`/g;
const translateCallRegex = /\$t\s*\(\s*(["'`])[\s\S]*?\1\s*\)|(?<![\w$.])t\s*\(\s*(["'`])[\s\S]*?\2\s*\)/g;
const safeScriptProperties = new Set(["message", "title", "placeholder"]);
const identifierAttributes = new Set([
  "src",
  "href",
  "to",
  "name",
  "icon",
  "class",
  "style",
  "id",
  "key",
  "ref",
  "type",
  "path",
  "url",
  "color",
  "prefix",
  "suffix",
  "component",
  "rules"
]);

function containsChinese(value) {
  return chineseRegex.test(value);
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/g, "\u00A0")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function createTranslateCall(functionName, value) {
  return `${functionName}(${JSON.stringify(value)})`;
}

function createSingleQuotedValue(value) {
  return `'${value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")}'`;
}

function createBoundAttribute(attributeName, value) {
  return `:${attributeName}="$t(${createSingleQuotedValue(value)})"`;
}

function findRootTemplate(code) {
  const openingTag = /<template\b[^>]*>/.exec(code);
  if (!openingTag) return undefined;

  let depth = 1;
  const cursorRegex = /<\/?template\b[^>]*>/g;
  cursorRegex.lastIndex = openingTag.index + openingTag[0].length;

  for (const match of code.matchAll(cursorRegex)) {
    if (match.index === undefined) continue;
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth > 0) continue;

    return {
      contentStart: openingTag.index + openingTag[0].length,
      contentEnd: match.index
    };
  }

  return undefined;
}

function collectTemplateTags(template) {
  const tags = [];
  let cursor = 0;

  while (cursor < template.length) {
    const tagStart = template.indexOf("<", cursor);
    if (tagStart === -1) break;

    if (template.startsWith("<!--", tagStart)) {
      const commentEnd = template.indexOf("-->", tagStart + 4);
      const end = commentEnd === -1 ? template.length : commentEnd + 3;
      tags.push({ text: template.slice(tagStart, end), start: tagStart });
      cursor = end;
      continue;
    }

    const nextCharacter = template[tagStart + 1] ?? "";
    if (!/[A-Za-z/]/.test(nextCharacter)) {
      cursor = tagStart + 1;
      continue;
    }

    let quote = "";
    let tagEnd = -1;
    for (let index = tagStart + 1; index < template.length; index += 1) {
      const character = template[index];
      if (quote) {
        if (character === quote && template[index - 1] !== "\\") quote = "";
        continue;
      }

      if (character === "\"" || character === "'") {
        quote = character;
        continue;
      }

      if (character === ">") {
        tagEnd = index + 1;
        break;
      }
    }

    if (tagEnd === -1) break;
    tags.push({ text: template.slice(tagStart, tagEnd), start: tagStart });
    cursor = tagEnd;
  }

  return tags;
}

function collectScriptBlocks(code) {
  const blocks = [];
  const blockRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/g;

  for (const match of code.matchAll(blockRegex)) {
    if (match.index === undefined) continue;
    blocks.push({
      contentStart: match.index + match[0].indexOf(match[1]),
      contentEnd: match.index + match[0].length - "</script>".length
    });
  }

  return blocks;
}

function isProtected(start, end, ranges) {
  return ranges.some(range => start < range.end && end > range.start);
}

function addReplacement(replacements, replacement) {
  const overlappingIndex = replacements.findIndex(current => (
    replacement.start < current.end && replacement.end > current.start
  ));
  if (overlappingIndex !== -1) replacements.splice(overlappingIndex, 1);
  replacements.push(replacement);
}

function applyReplacements(code, replacements) {
  return [...replacements]
    .sort((left, right) => right.start - left.start)
    .reduce((result, replacement) => (
      result.slice(0, replacement.start) + replacement.text + result.slice(replacement.end)
    ), code);
}

function createLineLocator(code) {
  const lineStarts = [0];
  for (let index = 0; index < code.length; index += 1) {
    if (code[index] === "\n") lineStarts.push(index + 1);
  }

  return function locate(offset) {
    let low = 0;
    let high = lineStarts.length - 1;
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      if (lineStarts[middle] <= offset) low = middle + 1;
      else high = middle - 1;
    }

    const lineIndex = Math.max(0, high);
    return {
      line: lineIndex + 1,
      column: offset - lineStarts[lineIndex] + 1
    };
  };
}

function createCandidate({ filePath, code, block, kind, value, start, end, safety, reason, replacement }) {
  const locate = createLineLocator(code);
  const position = locate(start);
  return {
    file: path.relative(root, filePath).replace(/\\/g, "/"),
    block,
    kind,
    value,
    start,
    end,
    safety,
    reason,
    replacement,
    line: position.line,
    column: position.column
  };
}

function appendStaticText(replacements, candidates, filePath, code, rawText, offset) {
  if (!containsChinese(rawText)) return;

  const leadingWhitespace = /^\s*/.exec(rawText)?.[0] ?? "";
  const trailingWhitespace = /\s*$/.exec(rawText)?.[0] ?? "";
  const displayText = decodeEntities(rawText.trim());
  if (!displayText) return;

  if (/[<>]/.test(displayText)) {
    return;
  }

  const replacement = {
    start: offset,
    end: offset + rawText.length,
    text: `${leadingWhitespace}{{ ${createTranslateCall("$t", displayText)} }}${trailingWhitespace}`
  };

  candidates.push(createCandidate({
    filePath,
    code,
    block: "template",
    kind: "text",
    value: displayText,
    start: replacement.start,
    end: replacement.end,
    safety: "safe",
    reason: "模板静态文本",
    replacement: replacement.text
  }));
  addReplacement(replacements, replacement);
}

function appendTextNodeReplacements(replacements, candidates, filePath, code, template, start, end, templateOffset) {
  let cursor = start;

  while (cursor < end) {
    const expressionStart = template.indexOf("{{", cursor);
    const staticEnd = expressionStart === -1 ? end : expressionStart;
    appendStaticText(replacements, candidates, filePath, code, template.slice(cursor, staticEnd), templateOffset + cursor);
    if (expressionStart === -1) break;

    const expressionEnd = template.indexOf("}}", expressionStart + 2);
    if (expressionEnd === -1) break;
    cursor = expressionEnd + 2;
  }
}

function shouldSkipDynamicAttribute(attributeValue) {
  if (!containsChinese(attributeValue)) return true;
  if (/\$t\s*\(|(?<![\w$.])t\s*\(/.test(attributeValue)) return true;
  if (/^\s*['"](?:[/#]|https?:)/.test(attributeValue)) return true;
  if (/^\s*\{\s*(path|name|query|params)\s*:/.test(attributeValue)) return true;
  return false;
}

function appendAttributeReplacements(replacements, candidates, filePath, code, tag, tagOffset) {
  for (const match of tag.matchAll(attributeRegex)) {
    const attributeName = match[1];
    const rawValue = match[2] ?? match[3] ?? "";
    const absoluteMatchStart = tagOffset + (match.index ?? 0);
    const normalizedName = attributeName.replace(/^[:@]/, "").split(".")[0];
    const decodedValue = decodeEntities(rawValue);

    if (attributeName.startsWith("@") || attributeName.startsWith("#")) continue;

    if (!attributeName.startsWith(":") && !attributeName.startsWith("v-")) {
      if (identifierAttributes.has(normalizedName) || !containsChinese(decodedValue)) continue;

      const replacementText = createBoundAttribute(attributeName, decodedValue);
      candidates.push(createCandidate({
        filePath,
        code,
        block: "template",
        kind: "attribute",
        value: decodedValue,
        start: absoluteMatchStart,
        end: absoluteMatchStart + match[0].length,
        safety: "safe",
        reason: "模板静态展示属性",
        replacement: replacementText
      }));
      addReplacement(replacements, {
        start: absoluteMatchStart,
        end: absoluteMatchStart + match[0].length,
        text: replacementText
      });
      continue;
    }

    if (shouldSkipDynamicAttribute(rawValue)) continue;
    candidates.push(createCandidate({
      filePath,
      code,
      block: "template",
      kind: "dynamic-attribute",
      value: decodedValue,
      start: absoluteMatchStart,
      end: absoluteMatchStart + match[0].length,
      safety: "manual",
      reason: "动态绑定表达式需要人工确认"
    }));
  }
}

function collectTemplateReplacements(filePath, code, template, templateOffset) {
  const replacements = [];
  const candidates = [];
  let lastTagEnd = 0;

  for (const match of collectTemplateTags(template)) {
    const tag = match.text;
    const tagStart = match.start;
    appendTextNodeReplacements(replacements, candidates, filePath, code, template, lastTagEnd, tagStart, templateOffset);
    lastTagEnd = tagStart + tag.length;

    if (tag.startsWith("<!--") || tag.startsWith("</")) continue;
    appendAttributeReplacements(replacements, candidates, filePath, code, tag, templateOffset + tagStart);
  }

  appendTextNodeReplacements(replacements, candidates, filePath, code, template, lastTagEnd, template.length, templateOffset);

  const retainedReplacements = new Set(replacements.map(replacement => (
    `${replacement.start}:${replacement.end}:${replacement.text}`
  )));
  const visibleCandidates = candidates.filter(candidate => (
    candidate.safety !== "safe"
      || retainedReplacements.has(`${candidate.start}:${candidate.end}:${candidate.replacement}`)
  ));

  return { replacements, candidates: visibleCandidates };
}

function parseStringLiteral(literal) {
  try {
    if (literal.startsWith("\"")) return JSON.parse(literal);
    return JSON.parse(`"${literal.slice(1, -1).replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}"`);
  } catch {
    return literal.slice(1, -1);
  }
}

function isModuleSpecifier(source, stringStart) {
  const prefix = source.slice(Math.max(0, stringStart - 120), stringStart);
  return /(?:\bimport|\bfrom|\brequire)\s*[(:]?\s*$/.test(prefix);
}

function getObjectPropertyName(source, matchStart) {
  const prefix = source.slice(Math.max(0, matchStart - 120), matchStart);
  return /([A-Za-z_$][\w$]*)\s*:\s*$/.exec(prefix)?.[1];
}

function isBusinessIdentifier(source, matchStart, matchEnd, value) {
  const prefix = source.slice(Math.max(0, matchStart - 120), matchStart);
  const trimmedPrefix = prefix.trimEnd();
  const suffix = source.slice(matchEnd, matchEnd + 120);
  const trimmedValue = value.trim();

  if (/=\s*$/.test(trimmedPrefix)) return true;
  if (/:\s*$/.test(trimmedPrefix) && !safeScriptProperties.has(getObjectPropertyName(source, matchStart))) return true;
  if (/\{\s*$/.test(trimmedPrefix)) return true;
  if (/^\s*:\s/.test(suffix)) return true;
  if (/^(?:\/|#|https?:)/.test(trimmedValue)) return true;
  if (/^(?:type|platformId|gameType|orderStatus|agentMode)$/.test(trimmedValue)) return true;
  return false;
}

function getSafeScriptReason(source, matchStart) {
  const propertyName = getObjectPropertyName(source, matchStart);
  if (propertyName && safeScriptProperties.has(propertyName)) return `${propertyName} 展示文案`;

  const prefix = source.slice(Math.max(0, matchStart - 120), matchStart);
  if (/\bnew\s+Error\s*\(\s*$/.test(prefix)) return "表单校验错误文案";
  if (/\b(showToast|showSuccessToast|showFailToast|showLoadingToast|showDialog|showConfirmDialog)\s*\(\s*$/.test(prefix)) {
    return "Vant 提示文案";
  }

  return "";
}

function collectProtectedRanges(script) {
  const protectedRanges = [];
  const commentRegex = /\/\/[^\n]*|\/\*[\s\S]*?\*\//g;

  for (const match of script.matchAll(commentRegex)) {
    protectedRanges.push({
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length
    });
  }

  for (const match of script.matchAll(translateCallRegex)) {
    protectedRanges.push({
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length
    });
  }

  return protectedRanges;
}

function collectScriptReplacements(filePath, code, script, scriptOffset) {
  const replacements = [];
  const candidates = [];
  const protectedRanges = collectProtectedRanges(script);

  for (const match of script.matchAll(stringLiteralRegex)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const value = parseStringLiteral(match[0]);
    if (isProtected(start, end, protectedRanges)) continue;
    if (!containsChinese(value)) continue;
    if (isModuleSpecifier(script, start)) continue;

    const absoluteStart = scriptOffset + start;
    const reason = getSafeScriptReason(script, start);
    const isBusinessValue = isBusinessIdentifier(script, start, end, value);
    if (!reason || isBusinessValue) {
      candidates.push(createCandidate({
        filePath,
        code,
        block: "script",
        kind: "string",
        value,
        start: absoluteStart,
        end: scriptOffset + end,
        safety: "manual",
        reason: isBusinessValue ? "疑似业务标识或对象配置值" : "脚本文案上下文不明确"
      }));
      continue;
    }

    const replacementText = createTranslateCall("t", value);
    candidates.push(createCandidate({
      filePath,
      code,
      block: "script",
      kind: "string",
      value,
      start: absoluteStart,
      end: scriptOffset + end,
      safety: "safe",
      reason,
      replacement: replacementText
    }));
    addReplacement(replacements, {
      start: absoluteStart,
      end: scriptOffset + end,
      text: replacementText
    });
  }

  for (const match of script.matchAll(templateLiteralRegex)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const literal = match[0];
    if (isProtected(start, end, protectedRanges)) continue;
    if (!containsChinese(literal)) continue;
    if (isModuleSpecifier(script, start)) continue;

    candidates.push(createCandidate({
      filePath,
      code,
      block: "script",
      kind: "template-literal",
      value: literal.slice(1, -1),
      start: scriptOffset + start,
      end: scriptOffset + end,
      safety: "manual",
      reason: "模板字符串可能包含变量拼接，需要人工确认"
    }));
  }

  return { replacements, candidates };
}

function ensureTImport(code) {
  const localesImportRegex = /import\s+\{([^}]*)\}\s+from\s+["']@\/locales["'];?/;
  const localesImport = localesImportRegex.exec(code);

  if (localesImport) {
    const importedNames = localesImport[1].split(",").map(name => name.trim()).filter(Boolean);
    if (importedNames.includes("t")) return code;

    const nextNames = [...importedNames, "t"].sort((left, right) => left.localeCompare(right));
    return code.replace(localesImportRegex, `import { ${nextNames.join(", ")} } from "@/locales";`);
  }

  return code.replace(/(<script setup[^>]*>\r?\n)/, `$1import { t } from "@/locales";\n`);
}

function formatCandidate(candidate) {
  const tag = `${candidate.safety}/${candidate.block}/${candidate.kind}`;
  const value = JSON.stringify(candidate.value);
  const replacement = candidate.replacement ? ` => ${candidate.replacement}` : "";
  return `${candidate.file}:${candidate.line}:${candidate.column} [${tag}] ${candidate.reason} ${value}${replacement}`;
}

function getOutputPath(args) {
  const outputArg = args.find(arg => arg.startsWith("--output="));
  if (!outputArg) return path.join(root, ".tmp", "i18n-candidates-final.txt");
  return path.resolve(root, outputArg.slice("--output=".length));
}

async function collectVueFiles(directory) {
  const files = [];

  async function walk(currentDirectory) {
    const entries = await opendir(currentDirectory);
    for await (const entry of entries) {
      const entryPath = path.join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules") await walk(entryPath);
      } else if (entry.isFile() && entry.name.endsWith(".vue")) {
        files.push(entryPath);
      }
    }
  }

  await walk(directory);
  return files;
}

async function main() {
  const args = process.argv.slice(2);
  const shouldApply = args.includes("--apply") || args.includes("--apply-safe");
  const outputPath = getOutputPath(args);
  const files = await collectVueFiles(sourceDirectory);
  const allCandidates = [];
  const changedFiles = [];

  for (const filePath of files) {
    const originalCode = await readFile(filePath, "utf8");
    const normalizedCode = originalCode.replace(/^\uFEFF/, "");
    if (!containsChinese(normalizedCode)) continue;

    const replacements = [];
    const fileCandidates = [];
    const template = findRootTemplate(normalizedCode);
    if (template) {
      const templateSource = normalizedCode.slice(template.contentStart, template.contentEnd);
      const result = collectTemplateReplacements(filePath, normalizedCode, templateSource, template.contentStart);
      replacements.push(...result.replacements);
      fileCandidates.push(...result.candidates);
    }

    for (const block of collectScriptBlocks(normalizedCode)) {
      const scriptSource = normalizedCode.slice(block.contentStart, block.contentEnd);
      const result = collectScriptReplacements(filePath, normalizedCode, scriptSource, block.contentStart);
      replacements.push(...result.replacements);
      fileCandidates.push(...result.candidates);
    }

    allCandidates.push(...fileCandidates);
    if (!replacements.length || !shouldApply) continue;

    let nextCode = applyReplacements(normalizedCode, replacements);
    const usesScriptT = replacements.some(replacement => replacement.text.startsWith("t("));
    if (usesScriptT) nextCode = ensureTImport(nextCode);

    if (nextCode !== normalizedCode) {
      await writeFile(filePath, nextCode, "utf8");
      changedFiles.push(path.relative(root, filePath).replace(/\\/g, "/"));
    }
  }

  const safeCount = allCandidates.filter(candidate => candidate.safety === "safe").length;
  const manualCount = allCandidates.filter(candidate => candidate.safety === "manual").length;
  const output = [
    "# i18n 候选清单",
    "",
    `生成时间：${new Date().toISOString()}`,
    `安全候选：${safeCount}`,
    `人工候选：${manualCount}`,
    "",
    ...allCandidates.map(formatCandidate),
    ""
  ].join("\n");
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, output, "utf8");

  console.log(shouldApply ? `已应用 ${changedFiles.length} 个 Vue 文件的安全多语言改写` : "已完成 dry-run，未改写 Vue 文件");
  console.log(`候选清单：${path.relative(root, outputPath).replace(/\\/g, "/")}`);
  console.log(`安全候选：${safeCount}`);
  console.log(`人工候选：${manualCount}`);
  if (changedFiles.length) console.log(changedFiles.join("\n"));
}

export {
  findRootTemplate,
  collectTemplateTags,
  collectScriptBlocks,
  collectTemplateReplacements,
  collectScriptReplacements,
  applyReplacements,
  ensureTImport,
  isBusinessIdentifier
};

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main();
}
