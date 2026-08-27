import { html, nothing } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { unsafeHTML } from 'https://cdn.jsdelivr.net/npm/lit-html@3/directives/unsafe-html.js';
import { iconSvg } from './icons.js';
import { theme } from './theme.js';
import { cls as sharedCls } from './classes.js';

const t = theme.colors;
const ts = t.surface;
const tx = t.text;
const bp = t.bigPicture;

const cls = {
    // Detail
    container: "animate-fade-in space-y-4",
    header: `border-b ${ts.border} pb-3`,
    title: `text-2xl font-bold ${tx.brand}`,
    idBadge: `inline-flex items-center mt-2 px-2.5 py-0.5 rounded-md text-xs font-semibold ${t.badge.idBg} ${t.badge.idText} border ${t.badge.idBorder}`,
    section: "mb-4",
    sectionTitleBase: `text-sm font-bold ${tx.h1} uppercase tracking-wider mb-1 flex items-center gap-1`,
    sectionBodyBase: `${tx.body} leading-relaxed text-sm`,
    
    // Code Snippet
    codeSnippetContainer: `${ts.dark} p-4 rounded-lg border ${ts.borderDark} mt-5 shadow-inner`,
    codeSnippetTitle: `text-xs font-bold ${tx.inverseTitle} uppercase tracking-wider mb-3 flex items-center gap-2`,
    codeSnippetText: "font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all",
    
    // Big Picture
    bpContainer: "animate-fade-in space-y-4",
    bpHeader: `border-b ${bp.headerBorder} pb-3`,
    bpBadgeContainer: "flex items-center gap-2 mb-1",
    bpBadge: "text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
    bpTitle: "text-lg font-bold",
    bpRole: `text-sm font-semibold ${tx.muted} mt-1`,
    bpSectionTitle: `text-sm font-bold ${tx.h1} uppercase tracking-wider mb-1 flex items-center gap-1`,
    bpSectionBody: `${tx.body} leading-relaxed text-sm`,
    journeyStepCard: `${ts.dark} px-4 py-3 rounded-lg flex items-start gap-3`,
    journeyStepText: "text-xs font-mono leading-relaxed",
    
    // Callout
    calloutBase: "p-3 rounded-lg border",
    
    // Placeholder
    placeholderContainer: `h-full flex flex-col items-center justify-center text-center ${tx.placeholder}`,
    placeholderText: "text-sm",
    placeholderIcon: `w-12 h-12 mb-4 ${tx.inverseTitle} animate-pulse`
};

// Specific Icon Wrappers
const sidebarEmptyStateIcon = () => iconSvg('emptyState', cls.placeholderIcon);
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

export function tooltipPillTpl(icon, text, definition, themeKey) {
    const finalColor = theme.colors.definitions[themeKey] || theme.colors.definitions.pillTheme05;
    return html`
        <button type="button" @click="${() => window.showDefinitionModal(icon + ' ' + text, definition)}" class="${sharedCls.pill} ml-2 ${finalColor}">
            ${icon} ${text}
        </button>
    `;
}

export function sidebarDetailTpl(node, nodeId, label, definitions) {
    return html`
        <div class="${cls.container}">
            <div class="${cls.header}">
                <h3 class="${cls.title}">${unsafeHTML(node.title)}</h3>
                <span class="${cls.idBadge}">
                    ${label}: ${nodeId}
                </span>
                ${(node.definitionPills || []).map(pill => {
                    const def = definitions[pill.id];
                    if (!def) return nothing;
                    return tooltipPillTpl(def.icon, def.label, def.body, def.theme);
                })}
            </div>

            ${(node.sections || []).map(sec => {
                const t = theme.colors[sec.theme] || {};
                const containerClasses = t.bg || t.border ? `${cls.section} p-3 rounded-lg border ${t.bg || ''} ${t.border || ''}` : cls.section;
                
                return html`
                    <div class="${containerClasses}">
                        <h4 class="${cls.sectionTitleBase} ${t.text || ''}">
                            ${iconSvg(sec.icon || 'info', `w-4 h-4 ${t.icon || ''}`)}
                            ${unsafeHTML(sec.title)}
                        </h4>
                        <p class="${cls.sectionBodyBase}">${unsafeHTML(sec.body)}</p>
                    </div>
                `;
            })}

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
                        return tooltipPillTpl(def.icon, def.label, def.body, def.theme);
                    })}
                </div>
                <h3 class="${cls.bpTitle} ${t.text}">${unsafeHTML(title)}</h3>
                <p class="${cls.bpRole}">${unsafeHTML(bp.role)}</p>
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
                <p class="${cls.journeyStepText} ${t.stepText}">${unsafeHTML(bp.journeyStep)}</p>
            </div>
        </div>
    `;
}
