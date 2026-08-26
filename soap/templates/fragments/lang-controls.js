import { html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';

/**
 * Renders the language switcher button group.
 * @param {object}   languages       - langData.languages record
 * @param {string}   activeLang      - Currently selected language key
 * @param {Function} onSelectLang    - Callback invoked with the selected language key
 */
export function langButtonsTpl(languages, activeLang, onSelectLang) {
    return Object.entries(languages).map(([key, l]) => {
        const isActive = key === activeLang;
        const cls = isActive
            ? 'lang-btn px-6 py-2.5 rounded-md font-semibold text-sm bg-white shadow-sm text-blue-700 transition-all duration-200'
            : 'lang-btn px-6 py-2.5 rounded-md font-semibold text-sm text-slate-600 hover:text-slate-800 transition-all duration-200';
        return html`<button @click=${() => onSelectLang(key)} id=${`lang-${key}`} class=${cls}>${l.label}</button>`;
    });
}

/**
 * Renders per-language facade code blocks (one shown, rest hidden).
 * @param {object} facades - langData.facades record ({ java: string, ... })
 */
export function facadeBlocksTpl(facades) {
    return Object.entries(facades).map(([lang, code]) => html`
        <div id=${`facade-${lang}`} class=${`facade-code ${lang === 'java' ? '' : 'hidden'}`}>
            <pre class="bg-slate-800 text-green-400 p-4 rounded-md text-sm overflow-x-auto font-mono shadow-inner"><code>${code}</code></pre>
        </div>`
    );
}

/**
 * Renders per-language tooling blocks (one shown, rest hidden).
 * @param {object} tooling - langData.tooling record
 */
export function toolingBlocksTpl(tooling) {
    return Object.entries(tooling).map(([lang, t]) => html`
        <div id=${`tooling-${lang}`} class=${`tooling-content ${lang === 'java' ? '' : 'hidden'} mt-6 animate-fade-in`}>
            <div class="bg-slate-50 p-5 rounded-lg border border-slate-200">
                <h4 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <span class=${`w-2 h-2 ${t.dotColor} rounded-full`}></span>
                    ${t.heading}
                </h4>
                <p class="mb-3">${t.body}</p>
                <pre class="bg-slate-800 text-green-400 p-4 rounded-md text-xs overflow-x-auto font-mono shadow-inner"><code>${t.code}</code></pre>
            </div>
        </div>`
    );
}
