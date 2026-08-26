import { html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { iconSvg } from './icons.js';

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
                        ${iconSvg('zoomIn', 'w-4 h-4')}
                    </button>
                    <button class="custom-zoom-btn flex items-center justify-center w-8 h-8 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors" data-zoom="out" title="Zoom Out">
                        ${iconSvg('zoomOut', 'w-4 h-4')}
                    </button>
                    <div class="w-px bg-slate-200 mx-0.5 my-1"></div>
                    <div class="relative group flex items-center">
                        <button class="flex items-center justify-center px-2 min-w-[3rem] h-8 text-xs font-semibold rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                            Zoom
                            ${iconSvg('chevronDown', 'w-3 h-3 ml-1')}
                        </button>
                        <div class="absolute bottom-full right-0 pb-1 hidden group-hover:block z-50">
                            <div class="w-36 bg-white border border-slate-200 rounded-md shadow-lg py-1">
                                <button class="custom-zoom-btn w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900" data-zoom="fit">Fit</button>
                                <button class="custom-zoom-btn w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900" data-zoom="1">100%</button>
                                <button class="custom-zoom-btn w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900" data-zoom="1.5">150%</button>
                                <button class="custom-zoom-btn w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900" data-zoom="2">200%</button>
                                <div class="h-px bg-slate-200 my-1 mx-2"></div>
                                <label class="flex items-center w-full px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer" title="Zoom to selection">
                                    <input type="checkbox" id="zoom-on-select-toggle" class="mr-2 rounded border-slate-300 text-blue-600 focus:ring-blue-500" onchange="window.toggleZoomOnSelect()">
                                    Zoom on Select
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <pre class="mermaid w-full h-full"></pre>
            </main>

            <!-- Sidebar -->
            <aside class="w-full lg:w-1/4 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-full">
                <div class="p-4 border-b border-slate-100 bg-slate-50 rounded-t-lg">
                    <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        ${iconSvg('info', 'w-5 h-5 text-blue-600 flex-shrink-0')}
                        <span class="truncate">${sb.heading}</span>
                        <span id="sidebar-lang-badge" class="ml-auto text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full flex-shrink-0">Java</span>
                    </h2>
                </div>
                <div id="sidebar-content" class="p-6 flex-grow overflow-y-auto"></div>
                <div class="p-4 border-t border-slate-100 bg-slate-50 rounded-b-lg flex justify-between items-center">
                    <button id="btn-prev-step" class="text-sm px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled onclick="window.prevStep()">&larr; Previous</button>
                    <span id="step-counter" class="text-xs text-slate-500 font-medium whitespace-nowrap px-2"></span>
                    <button id="btn-next-step" class="text-sm px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled onclick="window.nextStep()">Next &rarr;</button>
                </div>
            </aside>
        </div>
    `;
}
