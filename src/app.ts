import { defineToolbarApp } from 'astro/toolbar';
import {
  PRESET_COLLECTIONS,
  checkChromeAIAvailability,
  generateMockWithChromeAI,
  generateFallbackMock,
  type CollectionSchema,
  type GeneratedMockEntry,
} from './generator.js';

export default defineToolbarApp({
  init(canvas, app, server) {
    // Inject Styles
    const style = document.createElement('style');
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

    // Root Container
    const container = document.createElement('div');
    container.className = 'mock-window';
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

    // Elements
    const toast = container.querySelector('#toast') as HTMLElement;
    const aiStatus = container.querySelector('#ai-status') as HTMLElement;
    const aiStatusText = container.querySelector('#ai-status-text') as HTMLElement;
    const collectionSelect = container.querySelector('#collection-select') as HTMLSelectElement;
    const themeInput = container.querySelector('#theme-input') as HTMLInputElement;
    const themeChips = container.querySelector('#theme-chips') as HTMLElement;
    const generateBtn = container.querySelector('#generate-btn') as HTMLButtonElement;
    const btnSpinner = container.querySelector('#btn-spinner') as HTMLElement;
    const btnText = container.querySelector('#btn-text') as HTMLElement;
    const resultBox = container.querySelector('#result-box') as HTMLElement;
    const codeOutput = container.querySelector('#code-output') as HTMLElement;
    const copyBtn = container.querySelector('#copy-btn') as HTMLButtonElement;
    const downloadBtn = container.querySelector('#download-btn') as HTMLButtonElement;
    const tabButtons = container.querySelectorAll('.tab-btn');

    let currentTab: 'markdown' | 'frontmatter' | 'json' = 'markdown';
    let currentResult: GeneratedMockEntry | null = null;
    let aiAvailable = false;

    function showToast(msg: string) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    }

    function renderThemeChips() {
      const selectedKey = collectionSelect.value;
      const schema = PRESET_COLLECTIONS[selectedKey];
      themeChips.innerHTML = '';
      if (schema?.sampleThemes) {
        schema.sampleThemes.forEach((theme) => {
          const chip = document.createElement('button');
          chip.className = 'chip-btn';
          chip.textContent = theme;
          chip.addEventListener('click', () => {
            themeInput.value = theme;
          });
          themeChips.appendChild(chip);
        });
      }
    }

    async function checkAI() {
      const availability = await checkChromeAIAvailability();
      aiStatus.className = 'ai-status-badge';
      if (availability === 'readily') {
        aiStatus.classList.add('status-ready');
        aiStatusText.textContent = 'Gemini Nano Ready';
        aiAvailable = true;
      } else if (availability === 'after-download') {
        aiStatus.classList.add('status-download');
        aiStatusText.textContent = 'Downloading Nano Model';
        aiAvailable = true;
      } else {
        aiStatus.classList.add('status-fallback');
        aiStatusText.textContent = 'Fallback Mode (Synthetic Engine)';
        aiAvailable = false;
      }
    }

    function updateOutputView() {
      if (!currentResult) return;
      if (currentTab === 'markdown') {
        codeOutput.textContent = currentResult.rawMarkdown;
      } else if (currentTab === 'frontmatter') {
        codeOutput.textContent = currentResult.rawFrontmatter;
      } else if (currentTab === 'json') {
        codeOutput.textContent = JSON.stringify(currentResult.frontmatter, null, 2);
      }
    }

    // Event listeners
    collectionSelect.addEventListener('change', () => {
      renderThemeChips();
      const schema = PRESET_COLLECTIONS[collectionSelect.value];
      if (schema?.sampleThemes?.[0]) {
        themeInput.value = schema.sampleThemes[0];
      }
    });

    tabButtons.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabButtons.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        currentTab = (tab.getAttribute('data-tab') as any) || 'markdown';
        updateOutputView();
      });
    });

    generateBtn.addEventListener('click', async () => {
      const collectionKey = collectionSelect.value;
      const schema = PRESET_COLLECTIONS[collectionKey] || PRESET_COLLECTIONS.blog;
      const theme = themeInput.value.trim() || 'Synthetic Incident Report';

      generateBtn.disabled = true;
      btnSpinner.style.display = 'inline-block';
      btnText.textContent = 'Synthesizing mock data...';

      try {
        if (aiAvailable) {
          try {
            currentResult = await generateMockWithChromeAI(schema, theme);
          } catch (err) {
            console.warn('[astro-dev-mock-generator] Gemini Nano generation failed, using fallback:', err);
            currentResult = generateFallbackMock(schema, theme);
          }
        } else {
          currentResult = generateFallbackMock(schema, theme);
        }

        resultBox.style.display = 'flex';
        updateOutputView();
        showToast('Mock entry generated!');
      } catch (error: any) {
        showToast(`Error: ${error?.message || 'Failed to generate'}`);
      } finally {
        generateBtn.disabled = false;
        btnSpinner.style.display = 'none';
        btnText.textContent = 'Generate Synthetic Mock Entry';
      }
    });

    copyBtn.addEventListener('click', async () => {
      if (!currentResult) return;
      let textToCopy = currentResult.rawMarkdown;
      if (currentTab === 'frontmatter') textToCopy = currentResult.rawFrontmatter;
      if (currentTab === 'json') textToCopy = JSON.stringify(currentResult.frontmatter, null, 2);

      await navigator.clipboard.writeText(textToCopy);
      showToast(`Copied ${currentTab} to clipboard!`);
    });

    downloadBtn.addEventListener('click', () => {
      if (!currentResult) return;
      const slug = currentResult.theme
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const filename = `${slug || 'mock-entry'}.md`;
      const blob = new Blob([currentResult.rawMarkdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Downloaded ${filename}`);
    });

    // Initialize UI state
    renderThemeChips();
    checkAI();
  },
});
