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
                <div class="absolute bottom-4 right-4 z-20 flex bg-white/90 shadow-sm border border-slate-200 rounded-md p-1 backdrop-blur-sm gap-1">
                    <button class="custom-zoom-btn flex items-center justify-center w-8 h-8 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors" data-zoom="in" title="Zoom In">
                        <!-- Plus Magnifying Glass -->
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                    </button>
                    <button class="custom-zoom-btn flex items-center justify-center w-8 h-8 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors" data-zoom="out" title="Zoom Out">
                        <!-- Minus Magnifying Glass -->
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM7 10h6" />
                        </svg>
                    </button>
                    <div class="w-px bg-slate-200 mx-0.5 my-1"></div>
                    <button class="custom-zoom-btn flex items-center justify-center w-8 h-8 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors" data-zoom="fit" title="Fit to Screen">
                        <!-- Fit Magnifying Glass -->
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                    <div class="w-px bg-slate-200 mx-0.5 my-1"></div>
                    <button class="custom-zoom-btn flex items-center justify-center px-2 min-w-[2rem] h-8 text-xs font-semibold rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors" data-zoom="1">100%</button>
                    <button class="custom-zoom-btn flex items-center justify-center px-2 min-w-[2rem] h-8 text-xs font-semibold rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors" data-zoom="1.5">150%</button>
                    <button class="custom-zoom-btn flex items-center justify-center px-2 min-w-[2rem] h-8 text-xs font-semibold rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors" data-zoom="2">200%</button>
                </div>
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
