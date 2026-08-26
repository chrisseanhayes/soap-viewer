import { html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { unsafeHTML } from 'https://cdn.jsdelivr.net/npm/lit-html@3/directives/unsafe-html.js';

/**
 * Renders the top-right language toggle buttons.
 * @param {object} languages - Record of language definitions
 * @param {string} currentLang - The currently active language
 * @param {function} onSelect - Callback when a language is selected
 */
export function langButtonsTpl(languages, currentLang, onSelect) {
    return Object.entries(languages).map(([lang, data]) => html`
        <button 
            id=${`lang-${lang}`}
            class=${`lang-btn px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${lang === currentLang ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600'}`}
            @click=${() => onSelect(lang)}
        >
            ${data.label}
        </button>
    `);
}

/**
 * Renders per-language facade code blocks (one shown, rest hidden).
 * @param {object} facades - langData.facades record ({ java: string, ... })
 * @param {string} currentLang - The currently active language
 */
export function facadeBlocksTpl(facades, currentLang) {
    return Object.entries(facades).map(([lang, code]) => html`
        <div id=${`facade-${lang}`} class=${`facade-code ${lang === currentLang ? '' : 'hidden'}`}>
            <pre class="bg-slate-800 text-green-400 p-4 rounded-md text-sm overflow-x-auto font-mono shadow-inner"><code>${code}</code></pre>
        </div>`
    );
}

/**
 * Renders per-language tooling blocks (one shown, rest hidden).
 * @param {object} tooling - langData.tooling record
 * @param {string} currentLang - The currently active language
 */
export function toolingBlocksTpl(tooling, currentLang) {
    return Object.entries(tooling).map(([lang, t]) => html`
        <div id=${`tooling-${lang}`} class=${`tooling-content ${lang === currentLang ? '' : 'hidden'} mt-6 animate-fade-in`}>
            <div class="bg-slate-50 p-5 rounded-lg border border-slate-200">
                <h4 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <span class=${`w-2 h-2 ${t.dotColor} rounded-full`}></span>
                    ${unsafeHTML(t.heading)}
                </h4>
                <p class="mb-3">${unsafeHTML(t.body)}</p>
                <pre class="bg-slate-800 text-green-400 p-4 rounded-md text-xs overflow-x-auto font-mono shadow-inner"><code>${t.code}</code></pre>
            </div>
        </div>`
    );
}
