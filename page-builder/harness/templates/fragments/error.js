import { html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';

const cls = {
    container: "text-center py-20 text-red-500",
    title: "font-bold text-lg",
    message: "text-sm mt-2",
    hint: "text-xs mt-1 text-slate-500"
};

/**
 * Renders the full-page error state when data loading fails.
 * @param {Error} err
 */
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
