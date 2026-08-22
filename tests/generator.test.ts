import { describe, expect, it } from 'bun:test';
import {
  PRESET_COLLECTIONS,
  buildMockGenerationPrompt,
  generateFallbackMock,
  parseMockResponse,
  serializeToMarkdown,
  serializeToYaml,
} from '../src/generator.js';

describe('Astro Dev Mock Generator', () => {
  describe('Prompt Generation for Collections', () => {
    it('generates a valid prompt for blog collection', () => {
      const blogSchema = PRESET_COLLECTIONS.blog;
      const theme = 'Edge database incident postmortem and root cause analysis';
      const prompt = buildMockGenerationPrompt(blogSchema, theme);

      expect(prompt).toContain('collection markdown file for the "blog" collection');
      expect(prompt).toContain(theme);
      expect(prompt).toContain('- title (string, required): Catchy and descriptive post title');
      expect(prompt).toContain('- pubDate (date, required): Publication date (YYYY-MM-DD)');
      expect(prompt).toContain('- tags (string[], required): Relevant category keywords');
      expect(prompt).toContain('YAML frontmatter enclosed in \'---\'');
    });

    it('generates a valid prompt for docs collection', () => {
      const docsSchema = PRESET_COLLECTIONS.docs;
      const theme = 'WebAssembly Module Loader & Streaming Compilation';
      const prompt = buildMockGenerationPrompt(docsSchema, theme, {
        customInstructions: 'Include step-by-step code snippets.',
      });

      expect(prompt).toContain('collection markdown file for the "docs" collection');
      expect(prompt).toContain(theme);
      expect(prompt).toContain('- order (number, optional): Sidebar sorting priority');
      expect(prompt).toContain('- badges (string[], optional): Status tags');
      expect(prompt).toContain('Additional guidelines: Include step-by-step code snippets.');
    });

    it('generates a valid prompt for products collection', () => {
      const productsSchema = PRESET_COLLECTIONS.products;
      const theme = 'Ergonomic Mechanical Keyboard with Custom QMK Firmware';
      const prompt = buildMockGenerationPrompt(productsSchema, theme);

      expect(prompt).toContain('collection markdown file for the "products" collection');
      expect(prompt).toContain('- price (number, required): Price in USD');
      expect(prompt).toContain('- inStock (boolean, required): Inventory availability');
      expect(prompt).toContain('- sku (string, required): Stock keeping unit ID');
    });

    it('generates a valid prompt for changelog collection', () => {
      const changelogSchema = PRESET_COLLECTIONS.changelog;
      const theme = 'Release v3.4.0: Streaming SSR Improvements';
      const prompt = buildMockGenerationPrompt(changelogSchema, theme);

      expect(prompt).toContain('collection markdown file for the "changelog" collection');
      expect(prompt).toContain('- version (string, required)');
      expect(prompt).toContain('- breaking (boolean, optional)');
    });
  });

  describe('YAML & Markdown Serialization', () => {
    it('serializes primitive and array values to YAML format', () => {
      const frontmatter = {
        title: 'Exploring Gemini Nano in Astro',
        rating: 4.8,
        inStock: true,
        tags: ['astro', 'ai', 'devtool'],
        author: 'Jane Doe',
      };

      const yaml = serializeToYaml(frontmatter);
      expect(yaml).toContain('title: Exploring Gemini Nano in Astro');
      expect(yaml).toContain('rating: 4.8');
      expect(yaml).toContain('inStock: true');
      expect(yaml).toContain('tags:');
      expect(yaml).toContain('  - astro');
      expect(yaml).toContain('  - ai');
      expect(yaml).toContain('  - devtool');
      expect(yaml).toContain('author: Jane Doe');
    });

    it('properly quotes strings with special characters in YAML', () => {
      const frontmatter = {
        title: 'Incident: Edge DB #404',
      };

      const yaml = serializeToYaml(frontmatter);
      expect(yaml).toContain('title: "Incident: Edge DB #404"');
    });

    it('serializes complete markdown with frontmatter delimiters and body', () => {
      const frontmatter = { title: 'Test Post', draft: false };
      const body = '## Introduction\n\nThis is a mock article body.';
      const markdown = serializeToMarkdown(frontmatter, body);

      expect(markdown.startsWith('---\n')).toBe(true);
      expect(markdown).toContain('title: Test Post');
      expect(markdown).toContain('draft: false');
      expect(markdown).toContain('---\n\n## Introduction\n\nThis is a mock article body.');
    });
  });

  describe('Mock Response Parsing', () => {
    it('parses clean AI response with frontmatter and body', () => {
      const rawAiResponse = `---
title: Synthetic Postmortem Report
pubDate: 2026-08-22
author: Alex Dev
tags:
  - incident
  - postmortem
draft: false
rating: 4.5
---

# Incident Postmortem: Global Edge Outage

## Timeline
- 14:00 UTC: Incident identified.
- 14:15 UTC: Failover completed.
`;

      const parsed = parseMockResponse(rawAiResponse);
      expect(parsed.frontmatter.title).toBe('Synthetic Postmortem Report');
      expect(parsed.frontmatter.pubDate).toBe('2026-08-22');
      expect(parsed.frontmatter.author).toBe('Alex Dev');
      expect(parsed.frontmatter.draft).toBe(false);
      expect(parsed.frontmatter.rating).toBe(4.5);
      expect(parsed.frontmatter.tags).toEqual(['incident', 'postmortem']);
      expect(parsed.body).toContain('# Incident Postmortem: Global Edge Outage');
      expect(parsed.body).toContain('14:00 UTC: Incident identified.');
    });

    it('strips markdown triple-backtick wrapper if present', () => {
      const wrappedResponse = `\`\`\`markdown
---
title: Wrapped Title
order: 12
---

# Content Body inside block
\`\`\``;

      const parsed = parseMockResponse(wrappedResponse);
      expect(parsed.frontmatter.title).toBe('Wrapped Title');
      expect(parsed.frontmatter.order).toBe(12);
      expect(parsed.body).toBe('# Content Body inside block');
    });

    it('handles response without frontmatter gracefully', () => {
      const rawText = '# Plain Markdown Body\n\nJust markdown text without frontmatter.';
      const parsed = parseMockResponse(rawText);

      expect(parsed.frontmatter).toEqual({});
      expect(parsed.body).toBe(rawText);
    });
  });

  describe('Fallback Mock Generator', () => {
    it('synthesizes realistic blog entry matching schema', () => {
      const blogSchema = PRESET_COLLECTIONS.blog;
      const theme = 'Edge database incident report';
      const mock = generateFallbackMock(blogSchema, theme);

      expect(mock.collection).toBe('blog');
      expect(mock.theme).toBe(theme);
      expect(mock.frontmatter.title).toBe(theme);
      expect(typeof mock.frontmatter.pubDate).toBe('string');
      expect(typeof mock.frontmatter.author).toBe('string');
      expect(Array.isArray(mock.frontmatter.tags)).toBe(true);
      expect(mock.body).toContain('synthetic entry');
      expect(mock.rawMarkdown).toContain('---\n');
      expect(mock.rawMarkdown).toContain(theme);
    });

    it('synthesizes products mock matching numeric and boolean fields', () => {
      const productSchema = PRESET_COLLECTIONS.products;
      const theme = 'Mechanical Keyboard';
      const mock = generateFallbackMock(productSchema, theme);

      expect(mock.frontmatter.name).toBe(theme);
      expect(typeof mock.frontmatter.price).toBe('number');
      expect(typeof mock.frontmatter.inStock).toBe('boolean');
      expect(typeof mock.frontmatter.sku).toBe('string');
      expect(mock.frontmatter.sku).toMatch(/^ASTRO-\d+$/);
    });
  });
});
