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

export function tooltipPillTpl(icon, text, definition, colorClass) {
    return html`
        <button type="button" @click="${() => window.showDefinitionModal(icon + ' ' + text, definition)}" class="inline-flex items-center mt-2 ml-2 px-2.5 py-0.5 rounded-md text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity ${colorClass}">
            ${icon} ${text}
        </button>
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
                ${['Client', 'Server'].includes(nodeId) ? 
                    tooltipPillTpl('💻', 'Compute', "Compute represents the physical or virtual machines where your application's actual work happens. It's the processor crunching numbers, memory holding data, and the operating system managing it all. In this context, it's where the code you write actually executes.", 'bg-purple-50 text-purple-800 border border-purple-200') 
                : nothing}
                ${['OSILayer7', 'OSILowerLayers', 'EdgeTransmits', 'EdgeReceivesPayload', 'EdgeReturnsViaPort', 'EdgeDeliversResponse'].includes(nodeId) ? 
                    tooltipPillTpl('☁️', 'Network', "The Network is the unpredictable space between machines. It's the cables, routers, switches, and radio waves that carry data from one place to another. Unlike the predictable Compute environment, the network can drop data, experience latency, or lose connection entirely.", 'bg-sky-50 text-sky-800 border border-sky-200') 
                : nothing}
                ${['SOAPMessage', 'SOAPResponse'].includes(nodeId) ? 
                    tooltipPillTpl('📄', 'Serialization', "Serialization is neither pure compute nor network—it's the translator between them. It is the process of converting live, in-memory objects from your application into a standardized text format (like XML or JSON) so they can be safely transmitted across the network and understood by a completely different machine on the other side.", 'bg-amber-50 text-amber-800 border border-amber-200') 
                : nothing}
            </div>

            ${node.overview ? sectionTpl('Overview', 'text-blue-500', 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', node.overview) : nothing}
            ${node.handledBy ? sectionTpl('Handled By', 'text-indigo-500', 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', node.handledBy) : nothing}
            ${node.considerations ? sectionTpl('Developer Considerations', 'text-teal-500', 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', node.considerations, 'bg-teal-50 p-3 rounded-lg border border-teal-100') : nothing}
            ${node.devImpact ? sectionTpl('Developer Impact', 'text-purple-500', 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', node.devImpact, 'bg-slate-50 p-3 rounded-lg border border-slate-100') : nothing}
            ${node.interaction ? sectionTpl('Next Steps', 'text-green-500', 'M14 5l7 7m0 0l-7 7m7-7H3', node.interaction) : nothing}
            ${node.branching ? sectionTpl('Branching & Flow', 'text-orange-500', 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', node.branching, 'bg-orange-50 p-3 rounded-lg border border-orange-100') : nothing}

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
/**
 * Renders the "big picture" panel for a container's role in the RPC journey.
 * @param {object} bp - The bigPicture object { role, summary, whyItExists, journeyStep }
 * @param {string} title - Container title
 */
export function sidebarBigPictureTpl(bp, title) {
    return html`
        <div class="animate-fade-in space-y-4">
            <div class="border-b border-indigo-100 pb-3">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full uppercase tracking-wide">Big Picture</span>
                </div>
                <h3 class="text-lg font-bold text-indigo-700">${title}</h3>
                <p class="text-sm font-semibold text-slate-600 mt-1">${bp.role}</p>
            </div>

            <div>
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/>
                    </svg>
                    How It Fits
                </h4>
                <p class="text-slate-700 leading-relaxed text-sm">${unsafeHTML(bp.summary)}</p>
            </div>

            <div class="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Why It Exists
                </h4>
                <p class="text-slate-700 leading-relaxed text-sm">${unsafeHTML(bp.whyItExists)}</p>
            </div>

            <div class="bg-slate-800 px-4 py-3 rounded-lg flex items-start gap-3">
                <svg class="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
                </svg>
                <p class="text-indigo-300 text-xs font-mono leading-relaxed">${bp.journeyStep}</p>
            </div>
        </div>
    `;
}
