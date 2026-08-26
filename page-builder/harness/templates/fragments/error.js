import { html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { cls } from './classes.js';

/**
 * Renders the full-page error state when data loading fails.
 * @param {Error} err
 */
export function errorTpl(err) {
    return html`
        <div class="${cls.errorContainer}">
            <p class="${cls.errorTitle}">Failed to load content</p>
            <p class="${cls.errorMessage}">${err.message}</p>
            <p class="${cls.errorHint}">
                Make sure you are serving this page via a local HTTP server
                (e.g. <code>python3 -m http.server</code>).
            </p>
        </div>
    `;
}
