import { html, nothing } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { unsafeHTML } from 'https://cdn.jsdelivr.net/npm/lit-html@3/directives/unsafe-html.js';
import { iconSvg } from './icons.js';

/**
 * Empty-state placeholder shown before any node is selected.
 * @param {string} emptyState - content.sidebar.emptyState text
 */
export function sidebarPlaceholderTpl(emptyState) {
    return html`
        <div class="h-full flex flex-col items-center justify-center text-center text-slate-400">
            ${iconSvg('emptyState', 'w-12 h-12 mb-4 text-slate-300 animate-pulse')}
            <p class="text-sm">${unsafeHTML(emptyState.replace('\n', '<br>'))}</p>
        </div>
    `;
}

function sectionTpl(title, svgClass, iconName, content, containerClass = '') {
    return html`
        <div class="${containerClass}">
            <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                ${iconSvg(iconName, `w-4 h-4 ${svgClass}`)}
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
 * @param {object} node        - Merged node data (title, overview, devImpact, interaction, branching, codeSnippet, definitionPills)
 * @param {string} nodeId      - The node's identifier key
 * @param {string} label       - Label prefix from content.sidebar.labelIdentifier
 * @param {object} definitions - Dictionary of definition metadata from content.definitions
 */
export function sidebarDetailTpl(node, nodeId, label, definitions) {
    return html`
        <div class="animate-fade-in space-y-4">
            <div class="border-b border-slate-200 pb-3">
                <h3 class="text-2xl font-bold text-blue-700">${node.title}</h3>
                <span class="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100">
                    ${label}: ${nodeId}
                </span>
                ${(node.definitionPills || []).map(pill => {
                    const def = definitions[pill.id];
                    if (!def) return nothing;
                    return tooltipPillTpl(def.icon, def.label, def.body, def.colorClass);
                })}
            </div>

            ${node.overview ? sectionTpl('Overview', 'text-blue-500', 'info', node.overview) : nothing}
            ${node.handledBy ? sectionTpl('Handled By', 'text-indigo-500', 'briefcase', node.handledBy) : nothing}
            ${node.considerations ? sectionTpl('Developer Considerations', 'text-teal-500', 'lightbulb', node.considerations, 'bg-teal-50 p-3 rounded-lg border border-teal-100') : nothing}
            ${node.devImpact ? sectionTpl('Developer Impact', 'text-purple-500', 'lightning', node.devImpact, 'bg-slate-50 p-3 rounded-lg border border-slate-100') : nothing}
            ${node.interaction ? sectionTpl('Next Steps', 'text-green-500', 'arrowRight', node.interaction) : nothing}
            ${node.branching ? sectionTpl('Branching & Flow', 'text-orange-500', 'arrows', node.branching, 'bg-orange-50 p-3 rounded-lg border border-orange-100') : nothing}

            ${node.codeSnippet ? html`
                <div class="bg-slate-800 p-4 rounded-lg border border-slate-700 mt-5 shadow-inner">
                    <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                        ${iconSvg('lightning', 'w-4 h-4 text-emerald-400')}
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
                    ${iconSvg('puzzle', 'w-4 h-4 text-indigo-500')}
                    How It Fits
                </h4>
                <p class="text-slate-700 leading-relaxed text-sm">${unsafeHTML(bp.summary)}</p>
            </div>

            <div class="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                    ${iconSvg('question', 'w-4 h-4 text-indigo-400')}
                    Why It Exists
                </h4>
                <p class="text-slate-700 leading-relaxed text-sm">${unsafeHTML(bp.whyItExists)}</p>
            </div>

            <div class="bg-slate-800 px-4 py-3 rounded-lg flex items-start gap-3">
                ${iconSvg('doubleRight', 'w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0')}
                <p class="text-indigo-300 text-xs font-mono leading-relaxed">${bp.journeyStep}</p>
            </div>
        </div>
    `;
}
