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
        <div class="flex flex-col lg:flex-row gap-6">
            <!-- Diagram -->
            <main class="mermaid-container w-full lg:w-2/3">
                <pre class="mermaid"></pre>
            </main>

            <!-- Sidebar -->
            <aside class="w-full lg:w-1/3 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-[600px]">
                <div class="p-4 border-b border-slate-100 bg-slate-50 rounded-t-lg">
                    <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        ${sb.heading}
                        <span id="sidebar-lang-badge" class="ml-2 text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Java</span>
                    </h2>
                </div>
                <div id="sidebar-content" class="p-6 flex-grow overflow-y-auto">
                    <div class="h-full flex flex-col items-center justify-center text-center text-slate-400">
                        <svg class="w-12 h-12 mb-4 text-slate-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
                        </svg>
                        <p class="text-sm">${sb.emptyState.replace('\n', html`<br>`)}</p>
                    </div>
                </div>
            </aside>
        </div>
    `;
}
