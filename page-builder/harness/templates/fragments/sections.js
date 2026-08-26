import { html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { unsafeHTML } from 'https://cdn.jsdelivr.net/npm/lit-html@3/directives/unsafe-html.js';
import { iconSvg } from './icons.js';

/**
 * "Understanding the Layers" section.
 * @param {object} section - content.sections.understandingLayers
 */
export function understandingLayersTpl(section) {
    return html`
        <section class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 class="text-xl font-semibold mb-4 text-slate-800">${section.heading}</h2>
            <div class="grid md:grid-cols-2 gap-6 text-sm text-slate-600">
                <div>
                    <h3 class="font-bold text-slate-800 mb-2 border-b pb-1">${section.osi7.heading}</h3>
                    <p>${unsafeHTML(section.osi7.body)}</p>
                </div>
                <div>
                    <h3 class="font-bold text-slate-800 mb-2 border-b pb-1">${section.proxy.heading}</h3>
                    <p>${unsafeHTML(section.proxy.body)}</p>
                </div>
            </div>
        </section>
    `;
}

/**
 * "Proxy & Facade Pattern" section, including per-language facade code blocks.
 * @param {object} section  - content.sections.proxyPattern
 * @param {Array}  facades  - Rendered facade block templates from facadeBlocksTpl()
 */
export function proxyPatternTpl(section, facades) {
    return html`
        <section class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 class="text-xl font-semibold mb-4 text-slate-800">${section.heading}</h2>
            <div class="text-sm text-slate-600 space-y-4">
                <p>${unsafeHTML(section.intro)}</p>

                <div class="grid md:grid-cols-2 gap-6 mt-4">
                    <div class="bg-slate-50 p-5 rounded-lg border border-slate-200">
                        <h4 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            ${iconSvg('lightning', 'w-5 h-5 text-indigo-500')}
                            ${section.developerView.heading}
                        </h4>
                        <p class="mb-4">${unsafeHTML(section.developerView.body)}</p>
                        ${facades}
                    </div>

                    <div class="bg-blue-50 p-5 rounded-lg border border-blue-100">
                        <h4 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            ${iconSvg('flask', 'w-5 h-5 text-blue-600')}
                            ${section.hiddenComplexity.heading}
                        </h4>
                        <p class="mb-3">${unsafeHTML(section.hiddenComplexity.body)}</p>
                        <ul class="list-disc pl-5 space-y-1.5 text-sm">
                            ${section.hiddenComplexity.bullets.map(b => html`<li>${unsafeHTML(b)}</li>`)}
                        </ul>
                    </div>
                </div>

                <div class="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200 flex items-start gap-3">
                    ${iconSvg('warning', 'w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5')}
                    <div>
                        <strong class="text-slate-900 block mb-1">${section.leakyAbstraction.heading}</strong>
                        ${unsafeHTML(section.leakyAbstraction.body)}
                    </div>
                </div>
            </div>
        </section>
    `;
}

/**
 * "Tooling" section, including per-language tooling blocks and the CI/CD callout.
 * @param {object} section      - content.sections.tooling
 * @param {Array}  toolingBlocks - Rendered tooling block templates from toolingBlocksTpl()
 * @param {object} cicdDefault  - langData.cicd['java']
 */
export function toolingSectionTpl(section, toolingBlocks, cicdDefault) {
    return html`
        <section class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 class="text-xl font-semibold mb-4 text-slate-800 flex items-center gap-2">
                ${iconSvg('terminal', 'w-6 h-6 text-slate-600')}
                ${section.heading}
            </h2>
            <div class="text-sm text-slate-600 space-y-4">
                <p>${unsafeHTML(section.intro)}</p>
                ${toolingBlocks}
                <div class="mt-4 p-4 bg-slate-100 rounded-lg border border-slate-200 text-slate-700 flex items-start gap-3">
                    ${iconSvg('cog', 'w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5')}
                    <div>
                        <strong id="cicd-title" class="text-slate-900 block mb-1">${cicdDefault.title}</strong>
                        <span id="cicd-text">${unsafeHTML(cicdDefault.body)}</span>
                    </div>
                </div>
            </div>
        </section>
    `;
}
