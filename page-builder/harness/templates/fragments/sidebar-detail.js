import { html, nothing } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { unsafeHTML } from 'https://cdn.jsdelivr.net/npm/lit-html@3/directives/unsafe-html.js';
import { iconSvg } from './icons.js';
import { cls } from './classes.js';
import { theme } from './theme.js';

// Specific Icon Wrappers
const emptyStateIcon = () => iconSvg('emptyState', cls.placeholderIcon);
const overviewIcon = () => iconSvg('info', `w-4 h-4 ${theme.colors.overview.icon}`);
const handledByIcon = () => iconSvg('briefcase', `w-4 h-4 ${theme.colors.handledBy.icon}`);
const considerationsIcon = () => iconSvg('lightbulb', `w-4 h-4 ${theme.colors.considerations.icon}`);
const devImpactIcon = () => iconSvg('lightning', `w-4 h-4 ${theme.colors.devImpact.icon}`);
const interactionIcon = () => iconSvg('arrowRight', `w-4 h-4 ${theme.colors.interaction.icon}`);
const branchingIcon = () => iconSvg('arrows', `w-4 h-4 ${theme.colors.branching.icon}`);
const codeSnippetIcon = () => iconSvg('lightning', `w-4 h-4 ${theme.colors.code.icon}`);
const bpHowItFitsIcon = () => iconSvg('puzzle', `w-4 h-4 ${theme.colors.bigPicture.icon}`);
const bpWhyItExistsIcon = () => iconSvg('question', `w-4 h-4 ${theme.colors.bigPicture.iconAlt}`);
const bpJourneyStepIcon = () => iconSvg('doubleRight', `w-4 h-4 ${theme.colors.bigPicture.iconAlt} mt-0.5 flex-shrink-0`);

export function sidebarPlaceholderTpl(emptyState) {
    return html`
        <div class="${cls.placeholderContainer}">
            ${emptyStateIcon()}
            <p class="${cls.placeholderText}">${unsafeHTML(emptyState.replace('\n', '<br>'))}</p>
        </div>
    `;
}

function baseSectionTpl(title, themeObj, iconFn, content, extraClasses = '') {
    const containerClasses = extraClasses 
        ? `${cls.detailSection} ${extraClasses} ${themeObj.bg || ''} ${themeObj.border || ''}`.trim()
        : cls.detailSection;

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

// Custom wrapper functions for semantic sections
const overviewSectionTpl = (content) => baseSectionTpl('Overview', theme.colors.overview, overviewIcon, content);
const handledBySectionTpl = (content) => baseSectionTpl('Handled By', theme.colors.handledBy, handledByIcon, content);
const considerationsSectionTpl = (content) => baseSectionTpl('Developer Considerations', theme.colors.considerations, considerationsIcon, content, 'p-3 rounded-lg border');
const devImpactSectionTpl = (content) => baseSectionTpl('Developer Impact', theme.colors.devImpact, devImpactIcon, content, 'p-3 rounded-lg border');
const interactionSectionTpl = (content) => baseSectionTpl('Next Steps', theme.colors.interaction, interactionIcon, content);
const branchingSectionTpl = (content) => baseSectionTpl('Branching & Flow', theme.colors.branching, branchingIcon, content, 'p-3 rounded-lg border');

export function tooltipPillTpl(icon, text, definition, colorClass) {
    return html`
        <button type="button" @click="${() => window.showDefinitionModal(icon + ' ' + text, definition)}" class="${cls.pill} ml-2 ${colorClass}">
            ${icon} ${text}
        </button>
    `;
}

export function sidebarDetailTpl(node, nodeId, label, definitions) {
    return html`
        <div class="${cls.detailContainer}">
            <div class="${cls.detailHeader}">
                <h3 class="${cls.detailTitle}">${node.title}</h3>
                <span class="${cls.detailIdBadge}">
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
                        ${codeSnippetIcon()}
                        Code &amp; Payload Context
                    </h4>
                    <pre class="${cls.codeSnippetText} ${theme.colors.code.text}"><code>${node.codeSnippet}</code></pre>
                </div>` : nothing}
        </div>
    `;
}

export function sidebarBigPictureTpl(bp, title) {
    const t = theme.colors.bigPicture;
    return html`
        <div class="${cls.bpContainer}">
            <div class="${cls.bpHeader}">
                <div class="${cls.bpBadgeContainer}">
                    <span class="${cls.bpBadge} ${t.badgeBg} ${t.badgeText}">Big Picture</span>
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
