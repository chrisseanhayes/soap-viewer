import { html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { unsafeHTML } from 'https://cdn.jsdelivr.net/npm/lit-html@3/directives/unsafe-html.js';
import { 
    sectionDeveloperViewIcon, sectionHiddenComplexityIcon, sectionLeakyAbstractionIcon, 
    sectionToolingHeadingIcon, sectionCicdCalloutIcon 
} from './icons.js';
import { theme } from './theme.js';

const cls = {
    card: "bg-white p-6 rounded-lg shadow-sm border border-slate-200",
    heading: "text-xl font-semibold mb-4 text-slate-800",
    headingIcon: "text-xl font-semibold mb-4 text-slate-800 flex items-center gap-2",
    grid: "grid md:grid-cols-2 gap-6 text-sm text-slate-600",
    subheading: "font-bold text-slate-800 mb-2 border-b pb-1",
    textSpace: "text-sm text-slate-600 space-y-4",
    gridInner: "grid md:grid-cols-2 gap-6 mt-4",
    bulletList: "list-disc pl-5 space-y-1.5 text-sm",
    calloutBase: "p-3 rounded-lg border",
    calloutFlex: "mt-4 p-4 rounded-lg border flex items-start gap-3",
    calloutTitle: "text-slate-900 block mb-1"
};

export function understandingLayersTpl(section) {
    return html`
        <section class="${cls.card}">
            <h2 class="${cls.heading}">${section.heading}</h2>
            <div class="${cls.grid}">
                <div>
                    <h3 class="${cls.subheading}">${section.osi7.heading}</h3>
                    <p>${unsafeHTML(section.osi7.body)}</p>
                </div>
                <div>
                    <h3 class="${cls.subheading}">${section.proxy.heading}</h3>
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
            <h2 class="${cls.heading}">${section.heading}</h2>
            <div class="${cls.textSpace}">
                <p>${unsafeHTML(section.intro)}</p>

                <div class="${cls.gridInner}">
                    <div class="${cls.calloutBase} p-5 ${tDev.bg} ${tDev.border}">
                        <h4 class="${cls.headingIcon}">
                            ${sectionDeveloperViewIcon()}
                            ${section.developerView.heading}
                        </h4>
                        <p class="mb-4">${unsafeHTML(section.developerView.body)}</p>
                        ${facades}
                    </div>

                    <div class="${cls.calloutBase} p-5 ${tHidden.bg} ${tHidden.border}">
                        <h4 class="${cls.headingIcon}">
                            ${sectionHiddenComplexityIcon()}
                            ${section.hiddenComplexity.heading}
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
                        <strong class="${cls.calloutTitle}">${section.leakyAbstraction.heading}</strong>
                        ${unsafeHTML(section.leakyAbstraction.body)}
                    </div>
                </div>
            </div>
        </section>
    `;
}

export function toolingSectionTpl(section, toolingBlocks, cicdDefault) {
    const t = theme.colors.cicdCallout;

    return html`
        <section class="${cls.card}">
            <h2 class="${cls.headingIcon}">
                ${sectionToolingHeadingIcon()}
                ${section.heading}
            </h2>
            <div class="${cls.textSpace}">
                <p>${unsafeHTML(section.intro)}</p>
                ${toolingBlocks}
                <div class="${cls.calloutFlex} ${t.bg} ${t.border}">
                    ${sectionCicdCalloutIcon()}
                    <div>
                        <strong id="cicd-title" class="${cls.calloutTitle}">${cicdDefault.title}</strong>
                        <span id="cicd-text">${unsafeHTML(cicdDefault.body)}</span>
                    </div>
                </div>
            </div>
        </section>
    `;
}
