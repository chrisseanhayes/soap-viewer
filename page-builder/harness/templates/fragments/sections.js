import { html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { unsafeHTML } from 'https://cdn.jsdelivr.net/npm/lit-html@3/directives/unsafe-html.js';
import { iconSvg } from './icons.js';
import { cls } from './classes.js';
import { theme } from './theme.js';

// Specific Icon Wrappers
const developerViewIcon = () => iconSvg('lightning', `w-5 h-5 ${theme.colors.developerView.icon}`);
const hiddenComplexityIcon = () => iconSvg('flask', `w-5 h-5 ${theme.colors.hiddenComplexity.icon}`);
const leakyAbstractionIcon = () => iconSvg('warning', `w-6 h-6 ${theme.colors.leakyAbstraction.icon} flex-shrink-0 mt-0.5`);
const toolingHeadingIcon = () => iconSvg('terminal', 'w-6 h-6 text-slate-600');
const cicdCalloutIcon = () => iconSvg('cog', `w-5 h-5 ${theme.colors.cicdCallout.icon} flex-shrink-0 mt-0.5`);

export function understandingLayersTpl(section) {
    return html`
        <section class="${cls.sectionCard}">
            <h2 class="${cls.sectionHeading}">${section.heading}</h2>
            <div class="${cls.sectionGrid}">
                <div>
                    <h3 class="${cls.sectionSubheading}">${section.osi7.heading}</h3>
                    <p>${unsafeHTML(section.osi7.body)}</p>
                </div>
                <div>
                    <h3 class="${cls.sectionSubheading}">${section.proxy.heading}</h3>
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
        <section class="${cls.sectionCard}">
            <h2 class="${cls.sectionHeading}">${section.heading}</h2>
            <div class="${cls.sectionTextSpace}">
                <p>${unsafeHTML(section.intro)}</p>

                <div class="${cls.sectionGridInner}">
                    <div class="${cls.calloutBase} p-5 ${tDev.bg} ${tDev.border}">
                        <h4 class="${cls.sectionHeadingIcon}">
                            ${developerViewIcon()}
                            ${section.developerView.heading}
                        </h4>
                        <p class="mb-4">${unsafeHTML(section.developerView.body)}</p>
                        ${facades}
                    </div>

                    <div class="${cls.calloutBase} p-5 ${tHidden.bg} ${tHidden.border}">
                        <h4 class="${cls.sectionHeadingIcon}">
                            ${hiddenComplexityIcon()}
                            ${section.hiddenComplexity.heading}
                        </h4>
                        <p class="mb-3">${unsafeHTML(section.hiddenComplexity.body)}</p>
                        <ul class="${cls.sectionBulletList}">
                            ${section.hiddenComplexity.bullets.map(b => html`<li>${unsafeHTML(b)}</li>`)}
                        </ul>
                    </div>
                </div>

                <div class="${cls.calloutFlex} ${tLeaky.bg} ${tLeaky.border}">
                    ${leakyAbstractionIcon()}
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
        <section class="${cls.sectionCard}">
            <h2 class="${cls.sectionHeadingIcon}">
                ${toolingHeadingIcon()}
                ${section.heading}
            </h2>
            <div class="${cls.sectionTextSpace}">
                <p>${unsafeHTML(section.intro)}</p>
                ${toolingBlocks}
                <div class="${cls.calloutFlex} ${t.bg} ${t.border}">
                    ${cicdCalloutIcon()}
                    <div>
                        <strong id="cicd-title" class="${cls.calloutTitle}">${cicdDefault.title}</strong>
                        <span id="cicd-text">${unsafeHTML(cicdDefault.body)}</span>
                    </div>
                </div>
            </div>
        </section>
    `;
}
