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
export declare function devMockGenerator(options?: DevMockGeneratorOptions): AstroIntegration;
export default devMockGenerator;
export * from './generator.js';
