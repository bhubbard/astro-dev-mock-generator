/**
 * TypeScript definitions for Chrome Built-in AI (Prompt API, LanguageModel, etc.)
 * Compatible with Chrome 128+ Built-in AI APIs.
 */

export type AICapabilityAvailability = 'readily' | 'after-download' | 'no';

export interface AICapabilities {
  readonly available: AICapabilityAvailability;
  readonly defaultTemperature?: number;
  readonly maxTemperature?: number;
  readonly defaultTopK?: number;
  readonly maxTopK?: number;
}

export interface AILanguageModelPromptOptions {
  signal?: AbortSignal;
}

export interface AILanguageModelCreateOptions {
  signal?: AbortSignal;
  systemPrompt?: string;
  initialPrompts?: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  topK?: number;
}

export interface AILanguageModel {
  prompt(input: string, options?: AILanguageModelPromptOptions): Promise<string>;
  promptStreaming(input: string, options?: AILanguageModelPromptOptions): ReadableStream<string>;
  countPromptTokens(input: string, options?: AILanguageModelPromptOptions): Promise<number>;
  readonly maxTokens: number;
  readonly tokensSoFar: number;
  readonly tokensLeft: number;
  readonly topK: number;
  readonly temperature: number;
  clone(): Promise<AILanguageModel>;
  destroy(): void;
}

export interface AILanguageModelFactory {
  capabilities(): Promise<AICapabilities>;
  create(options?: AILanguageModelCreateOptions): Promise<AILanguageModel>;
}

export interface AISummarizerCapabilities {
  readonly available: AICapabilityAvailability;
}

export interface AISummarizerCreateOptions {
  type?: 'tl;dr' | 'key-points' | 'teaser' | 'headline';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
  signal?: AbortSignal;
}

export interface AISummarizer {
  summarize(text: string, options?: { context?: string; signal?: AbortSignal }): Promise<string>;
  summarizeStreaming(text: string, options?: { context?: string; signal?: AbortSignal }): ReadableStream<string>;
  destroy(): void;
}

export interface AISummarizerFactory {
  capabilities(): Promise<AISummarizerCapabilities>;
  create(options?: AISummarizerCreateOptions): Promise<AISummarizer>;
}

export interface AIRewriterCapabilities {
  readonly available: AICapabilityAvailability;
}

export interface AIRewriterCreateOptions {
  tone?: 'as-is' | 'more-formal' | 'more-casual';
  format?: 'as-is' | 'plain-text' | 'markdown';
  length?: 'as-is' | 'shorter' | 'longer';
  sharedContext?: string;
  signal?: AbortSignal;
}

export interface AIRewriter {
  rewrite(text: string, options?: { context?: string; signal?: AbortSignal }): Promise<string>;
  rewriteStreaming(text: string, options?: { context?: string; signal?: AbortSignal }): ReadableStream<string>;
  destroy(): void;
}

export interface AIRewriterFactory {
  capabilities(): Promise<AIRewriterCapabilities>;
  create(options?: AIRewriterCreateOptions): Promise<AIRewriter>;
}

export interface AIWriterCapabilities {
  readonly available: AICapabilityAvailability;
}

export interface AIWriterCreateOptions {
  tone?: 'formal' | 'neutral' | 'casual';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
  signal?: AbortSignal;
}

export interface AIWriter {
  write(task: string, options?: { context?: string; signal?: AbortSignal }): Promise<string>;
  writeStreaming(task: string, options?: { context?: string; signal?: AbortSignal }): ReadableStream<string>;
  destroy(): void;
}

export interface AIWriterFactory {
  capabilities(): Promise<AIWriterCapabilities>;
  create(options?: AIWriterCreateOptions): Promise<AIWriter>;
}

export interface AITranslatorCapabilities {
  languagePairAvailable(sourceLanguage: string, targetLanguage: string): Promise<AICapabilityAvailability>;
}

export interface AITranslator {
  translate(input: string): Promise<string>;
  destroy(): void;
}

export interface AITranslatorFactory {
  capabilities(): Promise<AITranslatorCapabilities>;
  create(options: { sourceLanguage: string; targetLanguage: string; signal?: AbortSignal }): Promise<AITranslator>;
}

export interface ChromeAI {
  languageModel?: AILanguageModelFactory;
  assistant?: AILanguageModelFactory;
  summarizer?: AISummarizerFactory;
  rewriter?: AIRewriterFactory;
  writer?: AIWriterFactory;
  translator?: AITranslatorFactory;
}

declare global {
  interface Window {
    ai?: ChromeAI;
  }
}
