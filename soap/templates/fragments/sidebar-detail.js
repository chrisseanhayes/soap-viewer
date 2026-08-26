import { html, nothing } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';

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

            <div>
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Overview
                </h4>
                <p class="text-slate-700 leading-relaxed text-sm">${node.overview}</p>
            </div>

            <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                    </svg>
                    Developer Impact
                </h4>
                <p class="text-slate-700 leading-relaxed text-sm">${node.devImpact}</p>
            </div>

            <div>
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                    Next Steps
                </h4>
                <p class="text-slate-700 leading-relaxed text-sm">${node.interaction}</p>
            </div>

            <div class="bg-orange-50 p-3 rounded-lg border border-orange-100">
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                    </svg>
                    Branching &amp; Flow
                </h4>
                <p class="text-slate-700 leading-relaxed text-sm">${node.branching}</p>
            </div>

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
