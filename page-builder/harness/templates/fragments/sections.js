import { html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { unsafeHTML } from 'https://cdn.jsdelivr.net/npm/lit-html@3/directives/unsafe-html.js';
import { 
    sectionDeveloperViewIcon, sectionHiddenComplexityIcon, sectionLeakyAbstractionIcon, 
    sectionToolingHeadingIcon, sectionCicdCalloutIcon 
} from './icons.js';
import { cls } from './classes.js';
import { theme } from './theme.js';

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
                            ${sectionDeveloperViewIcon()}
                            ${section.developerView.heading}
                        </h4>
                        <p class="mb-4">${unsafeHTML(section.developerView.body)}</p>
                        ${facades}
                    </div>

                    <div class="${cls.calloutBase} p-5 ${tHidden.bg} ${tHidden.border}">
                        <h4 class="${cls.sectionHeadingIcon}">
                            ${sectionHiddenComplexityIcon()}
                            ${section.hiddenComplexity.heading}
                        </h4>
                        <p class="mb-3">${unsafeHTML(section.hiddenComplexity.body)}</p>
                        <ul class="${cls.sectionBulletList}">
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
        <section class="${cls.sectionCard}">
            <h2 class="${cls.sectionHeadingIcon}">
                ${sectionToolingHeadingIcon()}
                ${section.heading}
            </h2>
            <div class="${cls.sectionTextSpace}">
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
