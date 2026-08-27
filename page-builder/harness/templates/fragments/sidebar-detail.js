import { html, nothing } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { unsafeHTML } from 'https://cdn.jsdelivr.net/npm/lit-html@3/directives/unsafe-html.js';
import { iconSvg } from './icons.js';
import { theme } from './theme.js';
import { cls as sharedCls } from './classes.js';

const cls = {
    // Detail
    container: "animate-fade-in space-y-4",
    header: "border-b border-slate-200 pb-3",
    title: "text-2xl font-bold text-blue-700",
    idBadge: "inline-flex items-center mt-2 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100",
    section: "mb-4",
    sectionTitleBase: "text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1",
    sectionBodyBase: "text-slate-700 leading-relaxed text-sm",
    
    // Code Snippet
    codeSnippetContainer: "bg-slate-800 p-4 rounded-lg border border-slate-700 mt-5 shadow-inner",
    codeSnippetTitle: "text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2",
    codeSnippetText: "font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all",
    
    // Big Picture
    bpContainer: "animate-fade-in space-y-4",
    bpHeader: "border-b border-indigo-100 pb-3",
    bpBadgeContainer: "flex items-center gap-2 mb-1",
    bpBadge: "text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
    bpTitle: "text-lg font-bold",
    bpRole: "text-sm font-semibold text-slate-600 mt-1",
    bpSectionTitle: "text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1",
    bpSectionBody: "text-slate-700 leading-relaxed text-sm",
    journeyStepCard: "bg-slate-800 px-4 py-3 rounded-lg flex items-start gap-3",
    journeyStepText: "text-xs font-mono leading-relaxed",
    
    // Callout
    calloutBase: "p-3 rounded-lg border",
    
    // Placeholder
    placeholderContainer: "h-full flex flex-col items-center justify-center text-center text-slate-400",
    placeholderText: "text-sm",
    placeholderIcon: "w-12 h-12 mb-4 text-slate-300 animate-pulse"
};

// Specific Icon Wrappers
const sidebarEmptyStateIcon = () => iconSvg('emptyState', cls.placeholderIcon);
const sidebarOverviewIcon = () => iconSvg('info', `w-4 h-4 ${theme.colors.overview.icon}`);
const sidebarHandledByIcon = () => iconSvg('briefcase', `w-4 h-4 ${theme.colors.handledBy.icon}`);
const sidebarConsiderationsIcon = () => iconSvg('lightbulb', `w-4 h-4 ${theme.colors.considerations.icon}`);
const sidebarDevImpactIcon = () => iconSvg('lightning', `w-4 h-4 ${theme.colors.devImpact.icon}`);
const sidebarInteractionIcon = () => iconSvg('arrowRight', `w-4 h-4 ${theme.colors.interaction.icon}`);
const sidebarBranchingIcon = () => iconSvg('arrows', `w-4 h-4 ${theme.colors.branching.icon}`);
const sidebarCodeSnippetIcon = () => iconSvg('lightning', `w-4 h-4 ${theme.colors.code.icon}`);
const bpHowItFitsIcon = () => iconSvg('puzzle', `w-4 h-4 ${theme.colors.bigPicture.icon}`);
const bpWhyItExistsIcon = () => iconSvg('question', `w-4 h-4 ${theme.colors.bigPicture.iconAlt}`);
const bpJourneyStepIcon = () => iconSvg('doubleRight', `w-4 h-4 ${theme.colors.bigPicture.iconAlt} mt-0.5 flex-shrink-0`);

export function sidebarPlaceholderTpl(emptyState) {
    return html`
        <div class="${cls.placeholderContainer}">
            ${sidebarEmptyStateIcon()}
            <p class="${cls.placeholderText}">${unsafeHTML(emptyState.replace('\n', '<br>'))}</p>
        </div>
    `;
}

function baseSectionTpl(title, themeObj, iconFn, content, extraClasses = '') {
    const containerClasses = extraClasses 
        ? `${cls.section} ${extraClasses} ${themeObj.bg || ''} ${themeObj.border || ''}`.trim()
        : cls.section;

    return html`
        <div class="${containerClasses}">
            <h4 class="${cls.sectionTitleBase}">
                ${iconFn()}
                ${title}
            </h4>
            <p class="${cls.sectionBodyBase}">${unsafeHTML(content)}</p>
        </div>
    `;
}

const overviewSectionTpl = (content) => baseSectionTpl('Overview', theme.colors.overview, sidebarOverviewIcon, content);
const handledBySectionTpl = (content) => baseSectionTpl('Handled By', theme.colors.handledBy, sidebarHandledByIcon, content);
const considerationsSectionTpl = (content) => baseSectionTpl('Developer Considerations', theme.colors.considerations, sidebarConsiderationsIcon, content, 'p-3 rounded-lg border');
const devImpactSectionTpl = (content) => baseSectionTpl('Developer Impact', theme.colors.devImpact, sidebarDevImpactIcon, content, 'p-3 rounded-lg border');
const interactionSectionTpl = (content) => baseSectionTpl('Next Steps', theme.colors.interaction, sidebarInteractionIcon, content);
const branchingSectionTpl = (content) => baseSectionTpl('Branching & Flow', theme.colors.branching, sidebarBranchingIcon, content, 'p-3 rounded-lg border');

export function tooltipPillTpl(icon, text, definition, colorClass) {
    return html`
        <button type="button" @click="${() => window.showDefinitionModal(icon + ' ' + text, definition)}" class="${sharedCls.pill} ml-2 ${colorClass}">
            ${icon} ${text}
        </button>
    `;
}

export function sidebarDetailTpl(node, nodeId, label, definitions) {
    return html`
        <div class="${cls.container}">
            <div class="${cls.header}">
                <h3 class="${cls.title}">${node.title}</h3>
                <span class="${cls.idBadge}">
                    ${label}: ${nodeId}
                </span>
                ${(node.definitionPills || []).map(pill => {
                    const def = definitions[pill.id];
                    if (!def) return nothing;
                    return tooltipPillTpl(def.icon, def.label, def.body, def.colorClass);
                })}
            </div>

            ${node.overview ? overviewSectionTpl(node.overview) : nothing}
            ${node.handledBy ? handledBySectionTpl(node.handledBy) : nothing}
            ${node.considerations ? considerationsSectionTpl(node.considerations) : nothing}
            ${node.devImpact ? devImpactSectionTpl(node.devImpact) : nothing}
            ${node.interaction ? interactionSectionTpl(node.interaction) : nothing}
            ${node.branching ? branchingSectionTpl(node.branching) : nothing}

            ${node.codeSnippet ? html`
                <div class="${cls.codeSnippetContainer}">
                    <h4 class="${cls.codeSnippetTitle}">
                        ${sidebarCodeSnippetIcon()}
                        Code &amp; Payload Context
                    </h4>
                    <pre class="${cls.codeSnippetText} ${theme.colors.code.text}"><code>${node.codeSnippet}</code></pre>
                </div>` : nothing}
        </div>
    `;
}

export function sidebarBigPictureTpl(node, definitions) {
    const bp = node.bigPicture;
    const title = node.title;
    const t = theme.colors.bigPicture;
    return html`
        <div class="${cls.bpContainer}">
            <div class="${cls.bpHeader}">
                <div class="${cls.bpBadgeContainer}">
                    <span class="${cls.bpBadge} ${t.badgeBg} ${t.badgeText}">Big Picture</span>
                    ${(node.definitionPills || []).map(pill => {
                        const def = definitions[pill.id];
                        if (!def) return nothing;
                        return tooltipPillTpl(def.icon, def.label, def.body, def.colorClass);
                    })}
                </div>
                <h3 class="${cls.bpTitle} ${t.text}">${title}</h3>
                <p class="${cls.bpRole}">${bp.role}</p>
            </div>

            <div>
                <h4 class="${cls.bpSectionTitle}">
                    ${bpHowItFitsIcon()}
                    How It Fits
                </h4>
                <p class="${cls.bpSectionBody}">${unsafeHTML(bp.summary)}</p>
            </div>

            <div class="${cls.calloutBase} ${t.bg} ${t.border} p-3">
                <h4 class="${cls.bpSectionTitle}">
                    ${bpWhyItExistsIcon()}
                    Why It Exists
                </h4>
                <p class="${cls.bpSectionBody}">${unsafeHTML(bp.whyItExists)}</p>
            </div>

            <div class="${cls.journeyStepCard}">
                ${bpJourneyStepIcon()}
                <p class="${cls.journeyStepText} ${t.stepText}">${bp.journeyStep}</p>
            </div>
        </div>
    `;
}
