import type { AstroIntegration } from 'astro';
import type { CollectionSchema } from './generator.js';

export interface DevMockGeneratorOptions {
  /**
   * Additional custom collection schemas to provide in the dev toolbar selector.
   */
  customCollections?: Record<string, CollectionSchema>;
  /**
   * Default selected collection when toolbar app is opened.
   */
  defaultCollection?: string;
}

/**
 * Astro Dev Mock Generator Integration.
 *
 * Adds an Astro Dev Toolbar app to generate synthetic, realistic mock data
 * for Astro Content Collections using Chrome Built-in AI (Gemini Nano).
 */
export function devMockGenerator(options: DevMockGeneratorOptions = {}): AstroIntegration {
  return {
    name: 'astro-dev-mock-generator',
    hooks: {
      'astro:config:setup': ({ addDevToolbarApp }) => {
        addDevToolbarApp({
          id: 'astro-dev-mock-generator',
          name: 'Mock Generator',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
          entrypoint: new URL('./app.js', import.meta.url).pathname,
        });
      },
    },
  };
}

export default devMockGenerator;

export * from './generator.js';
