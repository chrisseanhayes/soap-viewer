import { html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { unsafeHTML } from 'https://cdn.jsdelivr.net/npm/lit-html@3/directives/unsafe-html.js';
import { cls } from './classes.js';

export function langButtonsTpl(languages, currentLang, onSelect) {
    return Object.entries(languages).map(([lang, data]) => html`
        <button 
            id=${`lang-${lang}`}
            class=${lang === currentLang ? cls.langBtnActive : cls.langBtnInactive}
            @click=${() => onSelect(lang)}
        >
            ${data.label}
        </button>
    `);
}

export function facadeBlocksTpl(facades, currentLang) {
    return Object.entries(facades).map(([lang, code]) => html`
        <div id=${`facade-${lang}`} class=${lang === currentLang ? cls.facadeContainerActive : cls.facadeContainerInactive}>
            <pre class="${cls.codeBlock}"><code>${code}</code></pre>
        </div>`
    );
}

export function toolingBlocksTpl(tooling, currentLang) {
    return Object.entries(tooling).map(([lang, t]) => html`
        <div id=${`tooling-${lang}`} class=${lang === currentLang ? cls.toolingContainerActive : cls.toolingContainerInactive}>
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
