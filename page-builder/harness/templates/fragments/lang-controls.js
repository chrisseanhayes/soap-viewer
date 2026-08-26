import { html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { unsafeHTML } from 'https://cdn.jsdelivr.net/npm/lit-html@3/directives/unsafe-html.js';
import { theme } from './theme.js';

const t = theme.colors;
const ts = t.surface;
const tx = t.text;
const ti = t.interactive;

const cls = {
    btnActive: `lang-btn px-3 py-1.5 text-xs font-semibold rounded-md transition-all shadow-sm ${t.langToggle.btnActiveBg} ${t.langToggle.btnActiveText}`,
    btnInactive: `lang-btn px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${t.langToggle.btnInactiveText}`,
    facadeActive: "facade-code",
    facadeInactive: "facade-code hidden",
    toolingActive: "tooling-content mt-6 animate-fade-in",
    toolingInactive: "tooling-content hidden mt-6 animate-fade-in",
    toolingCard: `p-5 rounded-lg border ${ts.subtle} ${ts.border}`,
    toolingTitle: `font-bold mb-2 flex items-center gap-2 ${tx.h2}`,
    toolingBody: "mb-3",
    codeBlock: `p-4 rounded-md text-sm overflow-x-auto font-mono shadow-inner ${ts.dark} ${tx.code}`,
    codeBlockSm: `p-4 rounded-md text-xs overflow-x-auto font-mono shadow-inner ${ts.dark} ${tx.code}`
};

export function langButtonsTpl(languages, currentLang, onSelect) {
    return Object.entries(languages).map(([lang, data]) => html`
        <button 
            id=${`lang-${lang}`}
            class=${lang === currentLang ? cls.btnActive : cls.btnInactive}
            @click=${() => onSelect(lang)}
        >
            ${data.label}
        </button>
    `);
}

export function facadeBlocksTpl(facades, currentLang) {
    return Object.entries(facades).map(([lang, code]) => html`
        <div id=${`facade-${lang}`} class=${lang === currentLang ? cls.facadeActive : cls.facadeInactive}>
            <pre class="${cls.codeBlock}"><code>${code}</code></pre>
        </div>`
    );
}

export function toolingBlocksTpl(tooling, currentLang) {
    return Object.entries(tooling).map(([lang, pt]) => html`
        <div id=${`tooling-${lang}`} class=${lang === currentLang ? cls.toolingActive : cls.toolingInactive}>
            <div class="${cls.toolingCard}">
                <h4 class="${cls.toolingTitle}">
                    <span class=${`w-2 h-2 ${pt.dotColor} rounded-full`}></span>
                    ${unsafeHTML(pt.heading)}
                </h4>
                <p class="${cls.toolingBody}">${unsafeHTML(pt.body)}</p>
                <pre class="${cls.codeBlockSm}"><code>${pt.code}</code></pre>
            </div>
        </div>`
    );
}
