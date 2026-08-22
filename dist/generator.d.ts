import type { AICapabilityAvailability } from './chrome-ai.d.ts';
export type CollectionFieldType = 'string' | 'number' | 'boolean' | 'date' | 'string[]' | 'number[]' | 'image' | 'reference' | 'object';
export interface CollectionFieldDef {
    name: string;
    type: CollectionFieldType;
    description?: string;
    required?: boolean;
    defaultValue?: unknown;
}
export interface CollectionSchema {
    name: string;
    description?: string;
    fields: CollectionFieldDef[];
    bodyTemplate?: string;
    sampleThemes?: string[];
}
export interface GeneratedMockEntry {
    frontmatter: Record<string, unknown>;
    body: string;
    rawMarkdown: string;
    rawFrontmatter: string;
    collection: string;
    theme: string;
    timestamp: string;
}
/**
 * Built-in Preset Collection Schemas for common Astro workflows.
 */
export declare const PRESET_COLLECTIONS: Record<string, CollectionSchema>;
/**
 * Builds the structured prompt for Gemini Nano / Chrome AI Language Model.
 */
export declare function buildMockGenerationPrompt(schema: CollectionSchema, theme: string, options?: {
    customInstructions?: string;
}): string;
/**
 * Serializes a JavaScript object into clean YAML frontmatter format.
 */
export declare function serializeToYaml(obj: Record<string, unknown>): string;
/**
 * Combines frontmatter object and body into a complete markdown string.
 */
export declare function serializeToMarkdown(frontmatter: Record<string, unknown>, body: string): string;
/**
 * Parses raw markdown output from AI or user into frontmatter object and body.
 */
export declare function parseMockResponse(rawInput: string): {
    frontmatter: Record<string, unknown>;
    body: string;
    rawMarkdown: string;
    rawFrontmatter: string;
};
/**
 * Checks Chrome Built-in AI (window.ai.languageModel) availability.
 */
export declare function checkChromeAIAvailability(): Promise<AICapabilityAvailability>;
/**
 * Generates synthetic mock data using Chrome Built-in AI Gemini Nano.
 */
export declare function generateMockWithChromeAI(schema: CollectionSchema, theme: string, options?: {
    signal?: AbortSignal;
    customInstructions?: string;
}): Promise<GeneratedMockEntry>;
/**
 * Deterministic fallback mock data generator when Chrome AI is not active.
 */
export declare function generateFallbackMock(schema: CollectionSchema, theme: string): GeneratedMockEntry;
