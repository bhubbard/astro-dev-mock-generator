# astro-dev-mock-generator

[![npm version](https://img.shields.io/badge/npm-v0.1.0-orange.svg)](https://www.npmjs.com/package/astro-dev-mock-generator)
[![Astro](https://img.shields.io/badge/Astro-5.x%20%7C%206.x%20%7C%207.x-FF5D01.svg?logo=astro)](https://astro.build)
[![Chrome AI](https://img.shields.io/badge/AI-Gemini%20Nano%20(window.ai)-4285F4.svg?logo=googlechrome)](https://developer.chrome.com/docs/ai/built-in)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Astro Dev Toolbar app that generates synthetic, realistic mock data for Astro Content Collections without cluttering local markdown files using on-device Gemini Nano (`window.ai.languageModel`).**

---

## 🚀 Overview

When building Astro content-driven sites, developing and styling page templates, components, and pagination often requires sample markdown entries. Manually creating placeholder `.md` files clutters your git history, confuses build workflows, and requires constant cleanup.

`astro-dev-mock-generator` adds an interactive app to your **Astro Dev Toolbar** that synthesizes realistic, schema-valid mock entries in seconds right in your browser using **Chrome Built-in AI (Gemini Nano)**.

- **Zero Git / Local File Clutter:** Keep your repository clean. Generate mock content in memory and preview it on the fly.
- **On-Device Gemini Nano:** Instant generation with zero API keys, no network latency, and complete privacy via `window.ai.languageModel`.
- **Preconfigured Schemas:** Out-of-the-box support for `blog`, `docs`, `products`, and `changelog` collections.
- **Clipboard & Download Actions:** Copy full markdown with YAML frontmatter, isolate frontmatter, export JSON, or download directly.
- **Offline / Fallback Synthesizer:** Includes a built-in synthetic generator if Chrome AI is unavailable.

---

## 📦 Installation

Install `astro-dev-mock-generator` using your favorite package manager:

```bash
# Using Bun
bun add -d astro-dev-mock-generator

# Using pnpm
pnpm add -D astro-dev-mock-generator

# Using npm
npm install --save-dev astro-dev-mock-generator
```

---

## 🛠️ Configuration

Add the integration to your `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import devMockGenerator from 'astro-dev-mock-generator';

export default defineConfig({
  integrations: [
    devMockGenerator({
      defaultCollection: 'blog',
    }),
  ],
});
```

---

## 🌐 Chrome AI (Gemini Nano) Setup

To leverage on-device Gemini Nano generation, enable Chrome's Built-in AI flags in Chrome 128+ or Chrome Canary/Dev:

1. Open `chrome://flags/#prompt-api-for-gemini-nano` in Chrome and set it to **Enabled**.
2. Open `chrome://flags/#optimization-guide-on-device-model` and set it to **Enabled BypassPerfRequirement**.
3. Relaunch Chrome.
4. Open `chrome://components` and find **Optimization Guide On Device Model**. Click **Check for update** to ensure the model binaries (~1.5GB) are downloaded.

> **Note:** If Chrome AI is not active or enabled, `astro-dev-mock-generator` automatically switches to its offline deterministic synthetic data engine.

---

## 💡 Usage

1. Start your Astro development server:
   ```bash
   bun dev
   ```
2. Open your site in Chrome (`http://localhost:4321`).
3. Click the **Mock Generator** icon in the Astro Dev Toolbar at the bottom of your screen.
4. Select your collection schema (e.g. `blog`, `docs`, `products`, `changelog`).
5. Choose a suggested topic chip or enter a custom prompt (e.g., *"Edge database incident postmortem"*).
6. Click **Generate Synthetic Mock Entry**.
7. Preview the output in the Markdown, Frontmatter, or JSON tabs, and click **Copy** or **Download**.

---

## 🧩 Programmatic API

You can also use the mock generator programmatically in your scripts, tests, or seeders:

```typescript
import {
  PRESET_COLLECTIONS,
  generateFallbackMock,
  buildMockGenerationPrompt,
  parseMockResponse
} from 'astro-dev-mock-generator';

// Generate mock data for the blog schema
const entry = generateFallbackMock(
  PRESET_COLLECTIONS.blog,
  'Optimizing island architecture in Astro v5'
);

console.log(entry.frontmatter);
// { title: '...', pubDate: '2026-08-22', author: '...', tags: [...] }

console.log(entry.rawMarkdown);
// Full markdown output ready for testing
```

---

## 🧪 Testing & Verification

Run tests and typechecks:

```bash
# Run unit tests
bun test

# Run TypeScript type check
bun run typecheck

# Build bundle
bun run build
```

---

## 📄 License

MIT © bhubbard
