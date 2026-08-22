// node_modules/astro/dist/toolbar/index.js
function defineToolbarApp(app) {
  return app;
}

// src/generator.ts
var PRESET_COLLECTIONS = {
  blog: {
    name: "blog",
    description: "Blog posts or articles with publication dates and metadata",
    sampleThemes: [
      "Edge database incident postmortem and root cause analysis",
      "Optimizing island architecture performance in Astro v5",
      "Refactoring monolithic CSS into utility classes",
      "Zero-JS search implementation using browser built-in APIs"
    ],
    fields: [
      { name: "title", type: "string", description: "Catchy and descriptive post title", required: true },
      { name: "description", type: "string", description: "Brief SEO summary / excerpt", required: true },
      { name: "pubDate", type: "date", description: "Publication date (YYYY-MM-DD)", required: true },
      { name: "author", type: "string", description: "Author name or handle", required: true },
      { name: "tags", type: "string[]", description: "Relevant category keywords", required: true },
      { name: "draft", type: "boolean", description: "Draft status flag", required: false, defaultValue: false },
      { name: "heroImage", type: "image", description: "Relative path or URL to hero image", required: false }
    ]
  },
  docs: {
    name: "docs",
    description: "Documentation pages, API reference, or knowledge base entries",
    sampleThemes: [
      "Authentication Middleware Configuration & JWT Validation",
      "Database Connection Pooling & Retry Strategies",
      "Custom Dev Toolbar Integrations in Astro",
      "WebAssembly Module Loader & Streaming Compilation"
    ],
    fields: [
      { name: "title", type: "string", description: "Document or API title", required: true },
      { name: "description", type: "string", description: "Overview of the guide", required: true },
      { name: "section", type: "string", description: "Docs section or category", required: true },
      { name: "order", type: "number", description: "Sidebar sorting priority", required: false, defaultValue: 1 },
      { name: "badges", type: "string[]", description: "Status tags (e.g. experimental, v2.0)", required: false },
      { name: "version", type: "string", description: "Target version specification", required: false }
    ]
  },
  products: {
    name: "products",
    description: "E-commerce product catalog entries or digital items",
    sampleThemes: [
      "Ergonomic Mechanical Keyboard with Custom QMK Firmware",
      "Ultra-wide Curved OLED Gaming Monitor 144Hz",
      "Minimalist Leather Laptop Sleeve 14-inch",
      "Noise-Cancelling Wireless Studio Headphones"
    ],
    fields: [
      { name: "name", type: "string", description: "Product title", required: true },
      { name: "price", type: "number", description: "Price in USD", required: true },
      { name: "category", type: "string", description: "Department or category", required: true },
      { name: "inStock", type: "boolean", description: "Inventory availability", required: true },
      { name: "rating", type: "number", description: "Average rating 1.0 to 5.0", required: false, defaultValue: 4.8 },
      { name: "tags", type: "string[]", description: "Product tags and features", required: false },
      { name: "sku", type: "string", description: "Stock keeping unit ID", required: true }
    ]
  },
  changelog: {
    name: "changelog",
    description: "Release notes, version milestones, and bugfix logs",
    sampleThemes: [
      "Release v3.4.0: Streaming SSR & Island Hydration Improvements",
      "Patch v3.4.1: Hotfix for Web Worker Memory Leak",
      "Major v4.0.0: Unified Routing Engine & Built-in Analytics"
    ],
    fields: [
      { name: "version", type: "string", description: "Semantic version tag", required: true },
      { name: "releaseDate", type: "date", description: "Release date (YYYY-MM-DD)", required: true },
      { name: "type", type: "string", description: "major, minor, or patch", required: true },
      { name: "breaking", type: "boolean", description: "Contains breaking changes", required: false, defaultValue: false },
      { name: "authors", type: "string[]", description: "Contributors list", required: false }
    ]
  }
};
function buildMockGenerationPrompt(schema, theme, options) {
  const fieldsSpec = schema.fields.map((f) => `- ${f.name} (${f.type}${f.required ? ", required" : ", optional"}): ${f.description || f.name}`).join(`
`);
  const customNote = options?.customInstructions ? `
Additional guidelines: ${options.customInstructions}` : "";
  return `You are a mock data generator for Astro Content Collections.
Generate a single realistic Astro content collection markdown file for the "${schema.name}" collection.

Theme/Topic: "${theme}"${customNote}

Required Frontmatter Schema Fields:
${fieldsSpec}

Rules:
1. Start immediately with YAML frontmatter enclosed in '---'.
2. Provide realistic, high-quality synthetic data for all fields strictly matching their types:
   - string: quoted or unquoted string
   - number: numeric literal (no quotes)
   - boolean: true or false
   - date: ISO date string 'YYYY-MM-DD'
   - string[]: YAML array of strings
3. Follow the closing '---' with a realistic, well-formatted Markdown body (including headings, paragraphs, lists, code snippets, or callouts relevant to the theme).
4. Output ONLY the raw markdown content with frontmatter. Do not wrap the entire output in triple-backtick markdown fences.`;
}
function serializeToYaml(obj) {
  const lines = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined)
      continue;
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else {
        lines.push(`${key}:`);
        for (const item of value) {
          if (typeof item === "string") {
            lines.push(`  - ${formatYamlString(item)}`);
          } else {
            lines.push(`  - ${item}`);
          }
        }
      }
    } else if (typeof value === "object" && value !== null) {
      if (value instanceof Date) {
        lines.push(`${key}: ${value.toISOString().split("T")[0]}`);
      } else {
        lines.push(`${key}:`);
        for (const [subKey, subVal] of Object.entries(value)) {
          lines.push(`  ${subKey}: ${typeof subVal === "string" ? formatYamlString(subVal) : subVal}`);
        }
      }
    } else if (typeof value === "string") {
      lines.push(`${key}: ${formatYamlString(value)}`);
    } else if (typeof value === "boolean" || typeof value === "number") {
      lines.push(`${key}: ${value}`);
    } else {
      lines.push(`${key}: ${String(value)}`);
    }
  }
  return lines.join(`
`);
}
function formatYamlString(str) {
  if (str.includes(`
`) || str.includes(":") || str.includes("#") || str.includes('"') || str.includes("'")) {
    return JSON.stringify(str);
  }
  return str;
}
function serializeToMarkdown(frontmatter, body) {
  const yaml = serializeToYaml(frontmatter);
  const cleanBody = body.trim();
  return `---
${yaml}
---

${cleanBody}
`;
}
function parseMockResponse(rawInput) {
  let content = rawInput.trim();
  if (content.startsWith("```markdown") || content.startsWith("```md") || content.startsWith("```")) {
    content = content.replace(/^```[a-zA-Z]*\n?/, "").replace(/```\s*$/, "").trim();
  }
  let rawFrontmatter = "";
  let body = "";
  const frontmatter = {};
  if (content.startsWith("---")) {
    const parts = content.split(/^---\s*$/m);
    if (parts.length >= 3) {
      rawFrontmatter = parts[1].trim();
      body = parts.slice(2).join("---").trim();
    } else {
      body = content;
    }
  } else {
    body = content;
  }
  if (rawFrontmatter) {
    const lines = rawFrontmatter.split(`
`);
    let currentArrayKey = null;
    let currentArray = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#"))
        continue;
      if (line.startsWith("  - ") || line.startsWith("- ")) {
        const itemVal = line.replace(/^\s*-\s*/, "").trim();
        const parsedItem = parseScalarYaml(itemVal);
        if (currentArrayKey) {
          currentArray.push(parsedItem);
        }
        continue;
      } else {
        if (currentArrayKey) {
          frontmatter[currentArrayKey] = currentArray;
          currentArrayKey = null;
          currentArray = [];
        }
      }
      const colonIdx = line.indexOf(":");
      if (colonIdx !== -1) {
        const key = line.substring(0, colonIdx).trim();
        const valuePart = line.substring(colonIdx + 1).trim();
        if (valuePart === "" || valuePart === "[]") {
          if (valuePart === "[]") {
            frontmatter[key] = [];
          } else {
            currentArrayKey = key;
            currentArray = [];
          }
        } else {
          frontmatter[key] = parseScalarYaml(valuePart);
        }
      }
    }
    if (currentArrayKey) {
      frontmatter[currentArrayKey] = currentArray;
    }
  }
  const rawMarkdown = serializeToMarkdown(frontmatter, body);
  return {
    frontmatter,
    body,
    rawMarkdown,
    rawFrontmatter
  };
}
function parseScalarYaml(value) {
  const trimmed = value.trim();
  if (trimmed === "true")
    return true;
  if (trimmed === "false")
    return false;
  if (trimmed === "null")
    return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }
  if (trimmed.startsWith('"') && trimmed.endsWith('"') || trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner)
      return [];
    return inner.split(",").map((s) => parseScalarYaml(s.trim()));
  }
  return trimmed;
}
async function checkChromeAIAvailability() {
  if (typeof window === "undefined" || !window.ai?.languageModel) {
    return "no";
  }
  try {
    const caps = await window.ai.languageModel.capabilities();
    return caps.available;
  } catch {
    return "no";
  }
}
async function generateMockWithChromeAI(schema, theme, options) {
  if (typeof window === "undefined" || !window.ai?.languageModel) {
    throw new Error("Chrome Built-in AI (window.ai.languageModel) is not available in this environment.");
  }
  const caps = await window.ai.languageModel.capabilities();
  if (caps.available === "no") {
    throw new Error("Gemini Nano is not supported or not enabled in this browser. Please enable chrome://flags/#prompt-api-for-gemini-nano");
  }
  const session = await window.ai.languageModel.create({
    systemPrompt: "You are an accurate, fast mock data synthesizer for Astro Content Collections.",
    temperature: 0.7,
    topK: 40,
    signal: options?.signal
  });
  try {
    const prompt = buildMockGenerationPrompt(schema, theme, options);
    const rawResult = await session.prompt(prompt, { signal: options?.signal });
    const parsed = parseMockResponse(rawResult);
    return {
      frontmatter: parsed.frontmatter,
      body: parsed.body,
      rawMarkdown: parsed.rawMarkdown,
      rawFrontmatter: parsed.rawFrontmatter,
      collection: schema.name,
      theme,
      timestamp: new Date().toISOString()
    };
  } finally {
    session.destroy();
  }
}
function generateFallbackMock(schema, theme) {
  const frontmatter = {};
  const today = new Date().toISOString().split("T")[0];
  for (const field of schema.fields) {
    switch (field.type) {
      case "string":
        if (field.name.toLowerCase().includes("title") || field.name.toLowerCase().includes("name")) {
          frontmatter[field.name] = theme;
        } else if (field.name.toLowerCase().includes("description")) {
          frontmatter[field.name] = `A synthetic mock entry exploring ${theme.toLowerCase()} with Astro.`;
        } else if (field.name.toLowerCase().includes("author")) {
          frontmatter[field.name] = "Alex Rivers";
        } else if (field.name.toLowerCase().includes("sku")) {
          frontmatter[field.name] = `ASTRO-${Math.floor(1000 + Math.random() * 9000)}`;
        } else if (field.name.toLowerCase().includes("version")) {
          frontmatter[field.name] = "v1.4.0";
        } else if (field.name.toLowerCase().includes("type")) {
          frontmatter[field.name] = "minor";
        } else if (field.name.toLowerCase().includes("section")) {
          frontmatter[field.name] = "Guides";
        } else if (field.name.toLowerCase().includes("category")) {
          frontmatter[field.name] = "Hardware";
        } else {
          frontmatter[field.name] = `Sample ${field.name} for ${theme}`;
        }
        break;
      case "number":
        if (field.name.toLowerCase().includes("price")) {
          frontmatter[field.name] = 149.99;
        } else if (field.name.toLowerCase().includes("rating")) {
          frontmatter[field.name] = 4.9;
        } else if (field.name.toLowerCase().includes("order")) {
          frontmatter[field.name] = 1;
        } else {
          frontmatter[field.name] = 42;
        }
        break;
      case "boolean":
        frontmatter[field.name] = field.defaultValue ?? true;
        break;
      case "date":
        frontmatter[field.name] = today;
        break;
      case "string[]":
        if (field.name.toLowerCase().includes("tag")) {
          frontmatter[field.name] = ["astro", "gemini-nano", "mock-data", "dev-toolbar"];
        } else if (field.name.toLowerCase().includes("badge")) {
          frontmatter[field.name] = ["featured", "v5.0"];
        } else if (field.name.toLowerCase().includes("author")) {
          frontmatter[field.name] = ["Alex Rivers", "Jordan Lee"];
        } else {
          frontmatter[field.name] = ["item-1", "item-2", "item-3"];
        }
        break;
      case "number[]":
        frontmatter[field.name] = [10, 20, 30];
        break;
      case "image":
        frontmatter[field.name] = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200";
        break;
      case "reference":
        frontmatter[field.name] = "related-entry-slug";
        break;
      case "object":
        frontmatter[field.name] = { generated: true, note: "Synthetic schema object" };
        break;
    }
  }
  const body = `## Overview

This is an automatically generated synthetic entry for **${theme}**. It was synthesized by the Astro Dev Mock Generator to allow instant testing and previewing of layouts, queries, and components without cluttering your repository's content folder.

### Key Highlights
- **Zero file clutter:** Generated entirely in-memory or copied to clipboard.
- **Type conformant:** Strictly respects the \`${schema.name}\` content collection schema.
- **Realistic formatting:** Includes code snippets, lists, and callout blocks.

\`\`\`typescript
// Example usage in Astro Content Collections
import { getCollection } from 'astro:content';

const posts = await getCollection('${schema.name}');
console.log(\`Loaded \${posts.length} entries\`);
\`\`\`

> **Developer Note:** Use the copy buttons in the Dev Toolbar to copy frontmatter or complete markdown into clipboard!`;
  const rawMarkdown = serializeToMarkdown(frontmatter, body);
  const rawFrontmatter = serializeToYaml(frontmatter);
  return {
    frontmatter,
    body,
    rawMarkdown,
    rawFrontmatter,
    collection: schema.name,
    theme,
    timestamp: new Date().toISOString()
  };
}

// src/app.ts
var app_default = defineToolbarApp({
  init(canvas, app, server) {
    const style = document.createElement("style");
    style.textContent = `
      :host {
        --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        --bg-panel: #131418;
        --bg-panel-header: #1a1b23;
        --bg-card: #20222e;
        --bg-input: #12131a;
        --border-subtle: #2d3040;
        --border-focus: #7c3aed;
        --text-primary: #f3f4f6;
        --text-muted: #9ca3af;
        --text-dim: #6b7280;
        --accent-purple: #8b5cf6;
        --accent-purple-hover: #7c3aed;
        --accent-gradient: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
        --badge-green-bg: rgba(34, 197, 94, 0.15);
        --badge-green-text: #4ade80;
        --badge-amber-bg: rgba(245, 158, 11, 0.15);
        --badge-amber-text: #fbbf24;
        --badge-blue-bg: rgba(59, 130, 246, 0.15);
        --badge-blue-text: #60a5fa;
      }

      .mock-window {
        position: fixed;
        bottom: 72px;
        right: 24px;
        width: 640px;
        max-width: calc(100vw - 48px);
        max-height: calc(100vh - 120px);
        background: var(--bg-panel);
        border: 1px solid var(--border-subtle);
        border-radius: 14px;
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
        font-family: var(--font-sans);
        color: var(--text-primary);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 999999;
      }

      .window-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 18px;
        background: var(--bg-panel-header);
        border-bottom: 1px solid var(--border-subtle);
      }

      .title-group {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .logo-badge {
        background: var(--accent-gradient);
        color: #ffffff;
        font-weight: 700;
        font-size: 11px;
        padding: 3px 8px;
        border-radius: 6px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }

      .title-text {
        font-size: 14px;
        font-weight: 600;
        color: #ffffff;
      }

      .ai-status-badge {
        font-size: 11px;
        padding: 3px 10px;
        border-radius: 9999px;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: currentColor;
      }

      .status-ready { background: var(--badge-green-bg); color: var(--badge-green-text); }
      .status-download { background: var(--badge-amber-bg); color: var(--badge-amber-text); }
      .status-fallback { background: var(--badge-blue-bg); color: var(--badge-blue-text); }

      .window-body {
        padding: 18px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .control-row {
        display: flex;
        gap: 12px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
      }

      .form-group label {
        font-size: 12px;
        font-weight: 500;
        color: var(--text-muted);
      }

      .select-input, .text-input {
        background: var(--bg-input);
        border: 1px solid var(--border-subtle);
        border-radius: 8px;
        padding: 8px 12px;
        color: var(--text-primary);
        font-size: 13px;
        font-family: inherit;
        outline: none;
        transition: border-color 0.15s ease;
      }

      .select-input:focus, .text-input:focus {
        border-color: var(--border-focus);
      }

      .chips-container {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 4px;
      }

      .chip-btn {
        background: var(--bg-card);
        border: 1px solid var(--border-subtle);
        color: var(--text-muted);
        font-size: 11px;
        padding: 4px 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .chip-btn:hover {
        border-color: var(--accent-purple);
        color: #ffffff;
        background: rgba(139, 92, 246, 0.1);
      }

      .generate-btn {
        background: var(--accent-gradient);
        color: #ffffff;
        border: none;
        border-radius: 8px;
        padding: 10px 16px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: opacity 0.15s ease, transform 0.05s ease;
      }

      .generate-btn:hover:not(:disabled) {
        opacity: 0.95;
      }

      .generate-btn:active:not(:disabled) {
        transform: scale(0.98);
      }

      .generate-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .result-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: var(--bg-card);
        border: 1px solid var(--border-subtle);
        border-radius: 10px;
        padding: 14px;
      }

      .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .tab-group {
        display: flex;
        gap: 4px;
        background: var(--bg-input);
        padding: 3px;
        border-radius: 6px;
      }

      .tab-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
      }

      .tab-btn.active {
        background: var(--bg-card);
        color: #ffffff;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      }

      .action-group {
        display: flex;
        gap: 8px;
      }

      .action-btn {
        background: var(--bg-input);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
        font-size: 12px;
        padding: 5px 10px;
        border-radius: 6px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s ease;
      }

      .action-btn:hover {
        background: rgba(255,255,255,0.08);
        border-color: #4b5563;
      }

      .code-preview {
        background: var(--bg-input);
        border: 1px solid var(--border-subtle);
        border-radius: 8px;
        padding: 12px;
        font-family: var(--font-mono);
        font-size: 12px;
        color: #e5e7eb;
        max-height: 260px;
        overflow: auto;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .toast {
        position: absolute;
        top: 14px;
        left: 50%;
        transform: translateX(-50%);
        background: #10b981;
        color: #ffffff;
        font-size: 12px;
        font-weight: 600;
        padding: 6px 14px;
        border-radius: 9999px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease, transform 0.2s ease;
      }

      .toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(4px);
      }

      .spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    canvas.appendChild(style);
    const container = document.createElement("div");
    container.className = "mock-window";
    container.innerHTML = `
      <div class="toast" id="toast">Copied to clipboard!</div>
      <div class="window-header">
        <div class="title-group">
          <span class="logo-badge">Gemini Mock</span>
          <span class="title-text">Content Collection Synthesizer</span>
        </div>
        <div id="ai-status" class="ai-status-badge status-fallback">
          <span class="status-dot"></span>
          <span id="ai-status-text">Checking AI...</span>
        </div>
      </div>

      <div class="window-body">
        <div class="control-row">
          <div class="form-group" style="max-width: 180px;">
            <label for="collection-select">Collection Schema</label>
            <select id="collection-select" class="select-input">
              <option value="blog">Blog (Articles)</option>
              <option value="docs">Docs (API & Guides)</option>
              <option value="products">Products (Catalog)</option>
              <option value="changelog">Changelog (Releases)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="theme-input">Prompt Theme / Scenario</label>
            <input id="theme-input" class="text-input" type="text" placeholder="e.g., Edge database incident postmortem" value="Edge database incident postmortem" />
          </div>
        </div>

        <div class="form-group">
          <label>Quick Suggestions</label>
          <div id="theme-chips" class="chips-container"></div>
        </div>

        <button id="generate-btn" class="generate-btn">
          <span id="btn-spinner" class="spinner" style="display: none;"></span>
          <span id="btn-text">Generate Synthetic Mock Entry</span>
        </button>

        <div id="result-box" class="result-container" style="display: none;">
          <div class="result-header">
            <div class="tab-group">
              <button class="tab-btn active" data-tab="markdown">Markdown</button>
              <button class="tab-btn" data-tab="frontmatter">Frontmatter (YAML)</button>
              <button class="tab-btn" data-tab="json">JSON</button>
            </div>
            <div class="action-group">
              <button id="copy-btn" class="action-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Copy
              </button>
              <button id="download-btn" class="action-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download
              </button>
            </div>
          </div>
          <pre id="code-output" class="code-preview"></pre>
        </div>
      </div>
    `;
    canvas.appendChild(container);
    const toast = container.querySelector("#toast");
    const aiStatus = container.querySelector("#ai-status");
    const aiStatusText = container.querySelector("#ai-status-text");
    const collectionSelect = container.querySelector("#collection-select");
    const themeInput = container.querySelector("#theme-input");
    const themeChips = container.querySelector("#theme-chips");
    const generateBtn = container.querySelector("#generate-btn");
    const btnSpinner = container.querySelector("#btn-spinner");
    const btnText = container.querySelector("#btn-text");
    const resultBox = container.querySelector("#result-box");
    const codeOutput = container.querySelector("#code-output");
    const copyBtn = container.querySelector("#copy-btn");
    const downloadBtn = container.querySelector("#download-btn");
    const tabButtons = container.querySelectorAll(".tab-btn");
    let currentTab = "markdown";
    let currentResult = null;
    let aiAvailable = false;
    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2000);
    }
    function renderThemeChips() {
      const selectedKey = collectionSelect.value;
      const schema = PRESET_COLLECTIONS[selectedKey];
      themeChips.innerHTML = "";
      if (schema?.sampleThemes) {
        schema.sampleThemes.forEach((theme) => {
          const chip = document.createElement("button");
          chip.className = "chip-btn";
          chip.textContent = theme;
          chip.addEventListener("click", () => {
            themeInput.value = theme;
          });
          themeChips.appendChild(chip);
        });
      }
    }
    async function checkAI() {
      const availability = await checkChromeAIAvailability();
      aiStatus.className = "ai-status-badge";
      if (availability === "readily") {
        aiStatus.classList.add("status-ready");
        aiStatusText.textContent = "Gemini Nano Ready";
        aiAvailable = true;
      } else if (availability === "after-download") {
        aiStatus.classList.add("status-download");
        aiStatusText.textContent = "Downloading Nano Model";
        aiAvailable = true;
      } else {
        aiStatus.classList.add("status-fallback");
        aiStatusText.textContent = "Fallback Mode (Synthetic Engine)";
        aiAvailable = false;
      }
    }
    function updateOutputView() {
      if (!currentResult)
        return;
      if (currentTab === "markdown") {
        codeOutput.textContent = currentResult.rawMarkdown;
      } else if (currentTab === "frontmatter") {
        codeOutput.textContent = currentResult.rawFrontmatter;
      } else if (currentTab === "json") {
        codeOutput.textContent = JSON.stringify(currentResult.frontmatter, null, 2);
      }
    }
    collectionSelect.addEventListener("change", () => {
      renderThemeChips();
      const schema = PRESET_COLLECTIONS[collectionSelect.value];
      if (schema?.sampleThemes?.[0]) {
        themeInput.value = schema.sampleThemes[0];
      }
    });
    tabButtons.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabButtons.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        currentTab = tab.getAttribute("data-tab") || "markdown";
        updateOutputView();
      });
    });
    generateBtn.addEventListener("click", async () => {
      const collectionKey = collectionSelect.value;
      const schema = PRESET_COLLECTIONS[collectionKey] || PRESET_COLLECTIONS.blog;
      const theme = themeInput.value.trim() || "Synthetic Incident Report";
      generateBtn.disabled = true;
      btnSpinner.style.display = "inline-block";
      btnText.textContent = "Synthesizing mock data...";
      try {
        if (aiAvailable) {
          try {
            currentResult = await generateMockWithChromeAI(schema, theme);
          } catch (err) {
            console.warn("[astro-dev-mock-generator] Gemini Nano generation failed, using fallback:", err);
            currentResult = generateFallbackMock(schema, theme);
          }
        } else {
          currentResult = generateFallbackMock(schema, theme);
        }
        resultBox.style.display = "flex";
        updateOutputView();
        showToast("Mock entry generated!");
      } catch (error) {
        showToast(`Error: ${error?.message || "Failed to generate"}`);
      } finally {
        generateBtn.disabled = false;
        btnSpinner.style.display = "none";
        btnText.textContent = "Generate Synthetic Mock Entry";
      }
    });
    copyBtn.addEventListener("click", async () => {
      if (!currentResult)
        return;
      let textToCopy = currentResult.rawMarkdown;
      if (currentTab === "frontmatter")
        textToCopy = currentResult.rawFrontmatter;
      if (currentTab === "json")
        textToCopy = JSON.stringify(currentResult.frontmatter, null, 2);
      await navigator.clipboard.writeText(textToCopy);
      showToast(`Copied ${currentTab} to clipboard!`);
    });
    downloadBtn.addEventListener("click", () => {
      if (!currentResult)
        return;
      const slug = currentResult.theme.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const filename = `${slug || "mock-entry"}.md`;
      const blob = new Blob([currentResult.rawMarkdown], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Downloaded ${filename}`);
    });
    renderThemeChips();
    checkAI();
  }
});
export {
  app_default as default
};
