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

// src/index.ts
function devMockGenerator(options = {}) {
  return {
    name: "astro-dev-mock-generator",
    hooks: {
      "astro:config:setup": ({ addDevToolbarApp }) => {
        addDevToolbarApp({
          id: "astro-dev-mock-generator",
          name: "Mock Generator",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
          entrypoint: new URL("./app.js", import.meta.url).pathname
        });
      }
    }
  };
}
var src_default = devMockGenerator;
export {
  serializeToYaml,
  serializeToMarkdown,
  parseMockResponse,
  generateMockWithChromeAI,
  generateFallbackMock,
  devMockGenerator,
  src_default as default,
  checkChromeAIAvailability,
  buildMockGenerationPrompt,
  PRESET_COLLECTIONS
};
