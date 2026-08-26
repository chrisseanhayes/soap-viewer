import { html, nothing } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { unsafeHTML } from 'https://cdn.jsdelivr.net/npm/lit-html@3/directives/unsafe-html.js';

/**
 * Empty-state placeholder shown before any node is selected.
 * @param {string} emptyState - content.sidebar.emptyState text
 */
export function sidebarPlaceholderTpl(emptyState) {
    return html`
        <div class="h-full flex flex-col items-center justify-center text-center text-slate-400">
            <svg class="w-12 h-12 mb-4 text-slate-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
            </svg>
            <p class="text-sm">${unsafeHTML(emptyState.replace('\n', '<br>'))}</p>
        </div>
    `;
}

function sectionTpl(title, svgClass, svgPath, content, containerClass = '') {
    return html`
        <div class="${containerClass}">
            <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                <svg class="w-4 h-4 ${svgClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${svgPath}"/>
                </svg>
                ${title}
            </h4>
            <p class="text-slate-700 leading-relaxed text-sm">${unsafeHTML(content)}</p>
        </div>
    `;
}

/**
 * Renders the detail panel for a clicked diagram node.
 * @param {object} node    - Merged node data (title, overview, devImpact, interaction, branching, codeSnippet)
 * @param {string} nodeId  - The node's identifier key
 * @param {string} label   - Label prefix from content.sidebar.labelIdentifier
 */
export function sidebarDetailTpl(node, nodeId, label) {
    return html`
        <div class="animate-fade-in space-y-4">
            <div class="border-b border-slate-200 pb-3">
                <h3 class="text-2xl font-bold text-blue-700">${node.title}</h3>
                <span class="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100">
                    ${label}: ${nodeId}
                </span>
            </div>

            ${sectionTpl('Overview', 'text-blue-500', 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', node.overview)}
            ${node.handledBy ? sectionTpl('Handled By', 'text-indigo-500', 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', node.handledBy) : nothing}
            ${node.considerations ? sectionTpl('Developer Considerations', 'text-teal-500', 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', node.considerations, 'bg-teal-50 p-3 rounded-lg border border-teal-100') : nothing}
            ${sectionTpl('Developer Impact', 'text-purple-500', 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', node.devImpact, 'bg-slate-50 p-3 rounded-lg border border-slate-100')}
            ${sectionTpl('Next Steps', 'text-green-500', 'M14 5l7 7m0 0l-7 7m7-7H3', node.interaction)}
            ${sectionTpl('Branching & Flow', 'text-orange-500', 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', node.branching, 'bg-orange-50 p-3 rounded-lg border border-orange-100')}

            ${node.codeSnippet ? html`
                <div class="bg-slate-800 p-4 rounded-lg border border-slate-700 mt-5 shadow-inner">
                    <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                        </svg>
                        Code &amp; Payload Context
                    </h4>
                    <pre class="text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all"><code>${node.codeSnippet}</code></pre>
                </div>` : nothing}
        </div>
    `;
}
