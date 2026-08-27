import { html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { theme } from './theme.js';

const t = theme.colors;

const cls = {
    container: `text-center py-20 ${t.text.error}`,
    title: "font-bold text-lg",
    message: "text-sm mt-2",
    hint: `text-xs mt-1 ${t.text.light}`
};

export function errorTpl(err) {
    return html`
        <div class="${cls.container}">
            <p class="${cls.title}">Failed to load content</p>
            <p class="${cls.message}">${err.message}</p>
            <p class="${cls.hint}">
                Make sure you are serving this page via a local HTTP server
                (e.g. <code>python3 -m http.server</code>).
            </p>
        </div>
    `;
}
