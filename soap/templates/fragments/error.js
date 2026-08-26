import { html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';

/**
 * Renders the full-page error state when data loading fails.
 * @param {Error} err
 */
export function errorTpl(err) {
    return html`
        <div class="text-center py-20 text-red-500">
            <p class="font-bold text-lg">Failed to load content</p>
            <p class="text-sm mt-2">${err.message}</p>
            <p class="text-xs mt-1 text-slate-500">
                Make sure you are serving this page via a local HTTP server
                (e.g. <code>python3 -m http.server</code>).
            </p>
        </div>
    `;
}
