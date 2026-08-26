import { html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';

/**
 * Renders the mermaid diagram panel and the sidebar shell.
 * The <pre class="mermaid"> is intentionally left empty here — app.js sets its
 * textContent directly after render() so mermaid's parser never sees lit-html's
 * internal comment binding markers.
 * @param {object} sb - content.sidebar object (heading, emptyState)
 */
export function diagramAndSidebarTpl(sb) {
    return html`
        <div class="flex flex-col lg:flex-row gap-6 h-[75vh] min-h-[600px]">
            <!-- Diagram -->
            <main class="mermaid-container w-full lg:w-3/4 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative">
                <pre class="mermaid w-full h-full"></pre>
            </main>

            <!-- Sidebar -->
            <aside class="w-full lg:w-1/4 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-full">
                <div class="p-4 border-b border-slate-100 bg-slate-50 rounded-t-lg">
                    <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <svg class="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span class="truncate">${sb.heading}</span>
                        <span id="sidebar-lang-badge" class="ml-auto text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full flex-shrink-0">Java</span>
                    </h2>
                </div>
                <div id="sidebar-content" class="p-6 flex-grow overflow-y-auto"></div>
            </aside>
        </div>
    `;
}
