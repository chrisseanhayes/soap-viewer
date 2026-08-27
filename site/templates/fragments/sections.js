import { html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { unsafeHTML } from 'https://cdn.jsdelivr.net/npm/lit-html@3/directives/unsafe-html.js';
import { iconSvg } from './icons.js';
import { theme } from './theme.js';

const t = theme.colors;
const ts = t.surface;
const tx = t.text;

const cls = {
    card: `p-6 rounded-lg shadow-sm border ${ts.main} ${ts.border}`,
    heading: `text-xl font-semibold mb-4 ${tx.h2}`,
    headingIcon: `text-xl font-semibold mb-4 flex items-center gap-2 ${tx.h2}`,
    grid: `grid md:grid-cols-2 gap-6 text-sm ${tx.muted}`,
    subheading: `font-bold mb-2 border-b pb-1 ${tx.h2}`,
    textSpace: `text-sm space-y-4 ${tx.muted}`,
    gridInner: "grid md:grid-cols-2 gap-6 mt-4",
    bulletList: "list-disc pl-5 space-y-1.5 text-sm",
    calloutBase: "p-3 rounded-lg border",
    calloutFlex: "mt-4 p-4 rounded-lg border flex items-start gap-3",
    calloutTitle: `block mb-1 ${tx.h1}`
};

const sectionDeveloperViewIcon = () => iconSvg('lightning', `w-5 h-5 ${theme.colors.developerView.icon}`);
const sectionHiddenComplexityIcon = () => iconSvg('flask', `w-5 h-5 ${theme.colors.hiddenComplexity.icon}`);
const sectionLeakyAbstractionIcon = () => iconSvg('warning', `w-6 h-6 ${theme.colors.leakyAbstraction.icon} flex-shrink-0 mt-0.5`);
const sectionToolingHeadingIcon = () => iconSvg('terminal', 'w-6 h-6 text-slate-600');
const sectionCicdCalloutIcon = () => iconSvg('cog', `w-5 h-5 ${theme.colors.cicdCallout.icon} flex-shrink-0 mt-0.5`);

export function understandingLayersTpl(section) {
    return html`
        <section class="${cls.card}">
            <h2 class="${cls.heading}">${unsafeHTML(section.heading)}</h2>
            <div class="${cls.grid}">
                <div>
                    <h3 class="${cls.subheading}">${unsafeHTML(section.osi7.heading)}</h3>
                    <p>${unsafeHTML(section.osi7.body)}</p>
                </div>
                <div>
                    <h3 class="${cls.subheading}">${unsafeHTML(section.proxy.heading)}</h3>
                    <p>${unsafeHTML(section.proxy.body)}</p>
                </div>
            </div>
        </section>
    `;
}

export function proxyPatternTpl(section, facades) {
    const tDev = theme.colors.developerView;
    const tHidden = theme.colors.hiddenComplexity;
    const tLeaky = theme.colors.leakyAbstraction;

    return html`
        <section class="${cls.card}">
            <h2 class="${cls.heading}">${unsafeHTML(section.heading)}</h2>
            <div class="${cls.textSpace}">
                <p>${unsafeHTML(section.intro)}</p>

                <div class="${cls.gridInner}">
                    <div class="${cls.calloutBase} p-5 ${tDev.bg} ${tDev.border}">
                        <h4 class="${cls.headingIcon}">
                            ${sectionDeveloperViewIcon()}
                            ${unsafeHTML(section.developerView.heading)}
                        </h4>
                        <p class="mb-4">${unsafeHTML(section.developerView.body)}</p>
                        ${facades}
                    </div>

                    <div class="${cls.calloutBase} p-5 ${tHidden.bg} ${tHidden.border}">
                        <h4 class="${cls.headingIcon}">
                            ${sectionHiddenComplexityIcon()}
                            ${unsafeHTML(section.hiddenComplexity.heading)}
                        </h4>
                        <p class="mb-3">${unsafeHTML(section.hiddenComplexity.body)}</p>
                        <ul class="${cls.bulletList}">
                            ${section.hiddenComplexity.bullets.map(b => html`<li>${unsafeHTML(b)}</li>`)}
                        </ul>
                    </div>
                </div>

                <div class="${cls.calloutFlex} ${tLeaky.bg} ${tLeaky.border}">
                    ${sectionLeakyAbstractionIcon()}
                    <div>
                        <strong class="${cls.calloutTitle}">${unsafeHTML(section.leakyAbstraction.heading)}</strong>
                        ${unsafeHTML(section.leakyAbstraction.body)}
                    </div>
                </div>
            </div>
        </section>
    `;
}

export function toolingSectionTpl(section, toolingBlocks, cicdDefault) {
    const pt = theme.colors.cicdCallout;

    return html`
        <section class="${cls.card}">
            <h2 class="${cls.headingIcon}">
                ${sectionToolingHeadingIcon()}
                ${unsafeHTML(section.heading)}
            </h2>
            <div class="${cls.textSpace}">
                <p>${unsafeHTML(section.intro)}</p>
                ${toolingBlocks}
                <div class="${cls.calloutFlex} ${pt.bg} ${pt.border}">
                    ${sectionCicdCalloutIcon()}
                    <div>
                        <strong id="cicd-title" class="${cls.calloutTitle}">${unsafeHTML(cicdDefault.title)}</strong>
                        <span id="cicd-text">${unsafeHTML(cicdDefault.body)}</span>
                    </div>
                </div>
            </div>
        </section>
    `;
}
