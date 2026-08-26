import { html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { unsafeHTML } from 'https://cdn.jsdelivr.net/npm/lit-html@3/directives/unsafe-html.js';
import { theme } from './theme.js';

const t = theme.colors.langToggle;

const cls = {
    btnActive: `lang-btn px-3 py-1.5 text-xs font-semibold rounded-md transition-all shadow-sm ${t.btnActiveBg} ${t.btnActiveText}`,
    btnInactive: `lang-btn px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${t.btnInactiveText}`,
    facadeActive: "facade-code",
    facadeInactive: "facade-code hidden",
    toolingActive: "tooling-content mt-6 animate-fade-in",
    toolingInactive: "tooling-content hidden mt-6 animate-fade-in",
    toolingCard: "bg-slate-50 p-5 rounded-lg border border-slate-200",
    toolingTitle: "font-bold text-slate-800 mb-2 flex items-center gap-2",
    toolingBody: "mb-3",
    codeBlock: "bg-slate-800 text-green-400 p-4 rounded-md text-sm overflow-x-auto font-mono shadow-inner",
    codeBlockSm: "bg-slate-800 text-green-400 p-4 rounded-md text-xs overflow-x-auto font-mono shadow-inner"
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
    return Object.entries(tooling).map(([lang, t]) => html`
        <div id=${`tooling-${lang}`} class=${lang === currentLang ? cls.toolingActive : cls.toolingInactive}>
            <div class="${cls.toolingCard}">
                <h4 class="${cls.toolingTitle}">
                    <span class=${`w-2 h-2 ${t.dotColor} rounded-full`}></span>
                    ${unsafeHTML(t.heading)}
                </h4>
                <p class="${cls.toolingBody}">${unsafeHTML(t.body)}</p>
                <pre class="${cls.codeBlockSm}"><code>${t.code}</code></pre>
            </div>
        </div>`
    );
}
