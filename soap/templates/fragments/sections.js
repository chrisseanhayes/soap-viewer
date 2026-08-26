import { html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';

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
                    <p>${section.osi7.body}</p>
                </div>
                <div>
                    <h3 class="font-bold text-slate-800 mb-2 border-b pb-1">${section.proxy.heading}</h3>
                    <p>${section.proxy.body}</p>
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
                <p>${section.intro}</p>

                <div class="grid md:grid-cols-2 gap-6 mt-4">
                    <div class="bg-slate-50 p-5 rounded-lg border border-slate-200">
                        <h4 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                            </svg>
                            ${section.developerView.heading}
                        </h4>
                        <p class="mb-4">${section.developerView.body}</p>
                        ${facades}
                    </div>

                    <div class="bg-blue-50 p-5 rounded-lg border border-blue-100">
                        <h4 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                            </svg>
                            ${section.hiddenComplexity.heading}
                        </h4>
                        <p class="mb-3">${section.hiddenComplexity.body}</p>
                        <ul class="list-disc pl-5 space-y-1.5 text-sm">
                            ${section.hiddenComplexity.bullets.map(b => html`<li>${b}</li>`)}
                        </ul>
                    </div>
                </div>

                <div class="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200 flex items-start gap-3">
                    <svg class="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    <div>
                        <strong class="text-slate-900 block mb-1">${section.leakyAbstraction.heading}</strong>
                        ${section.leakyAbstraction.body}
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
                <svg class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                ${section.heading}
            </h2>
            <div class="text-sm text-slate-600 space-y-4">
                <p>${section.intro}</p>
                ${toolingBlocks}
                <div class="mt-4 p-4 bg-slate-100 rounded-lg border border-slate-200 text-slate-700 flex items-start gap-3">
                    <svg class="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <div>
                        <strong id="cicd-title" class="text-slate-900 block mb-1">${cicdDefault.title}</strong>
                        <span id="cicd-text">${cicdDefault.body}</span>
                    </div>
                </div>
            </div>
        </section>
    `;
}
