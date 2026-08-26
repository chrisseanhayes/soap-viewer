import { html, render } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';

import { sidebarDetailTpl, sidebarPlaceholderTpl, sidebarBigPictureTpl } from '../templates/fragments/sidebar-detail.js';
import { diagramAndSidebarTpl }                      from '../templates/fragments/diagram.js';
import { understandingLayersTpl, proxyPatternTpl,
         toolingSectionTpl }                         from '../templates/fragments/sections.js';
import { langButtonsTpl, facadeBlocksTpl,
         toolingBlocksTpl }                          from '../templates/fragments/lang-controls.js';
import { errorTpl }                                  from '../templates/fragments/error.js';

// ─── State ────────────────────────────────────────────────────────────────────

let currentLang       = 'java';
let currentActiveNode = null;
let content           = null;   // content.json
let langData          = null;   // language-data.json
let diagramDef        = null;   // diagram.mmd

// ─── Data Loading ─────────────────────────────────────────────────────────────

async function loadData() {
    const [c, l, d] = await Promise.all([
        fetch('./data/content.json').then(r => r.json()),
        fetch('./data/language-data.json').then(r => r.json()),
        fetch('./data/diagram.mmd').then(r => r.text()),
    ]);
    content     = c;
    langData    = l;
    diagramDef  = d;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolve a field that may be a plain string or a language-keyed object.
 * Falls back to 'java' if the current language key is missing.
 */
function resolveText(field) {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[currentLang] || field['java'] || '';
}

/**
 * Merge the static content.json node with any language-data.json overrides
 * for the given nodeId, resolving all language-variant fields.
 */
function mergeNode(nodeId) {
    const base = content.nodes[nodeId]  || {};
    const lang = langData.nodes[nodeId] || {};
    return {
        title:       lang.title       || base.title       || '',
        overview:    resolveText(lang.overview    || base.overview),
        interaction: resolveText(lang.interaction || base.interaction),
        branching:   resolveText(lang.branching   || base.branching),
        devImpact:   resolveText(lang.devImpact   || base.devImpact),
        codeSnippet: resolveText(lang.codeSnippet || base.codeSnippet),
        handledBy:   resolveText(lang.handledBy   || base.handledBy),
        considerations: resolveText(lang.considerations || base.considerations),
    };
}

const navigationSequence = [
    'Client_BigPicture', 'Client', 'AppClient', 'EdgeInitiatesRequest', 'Proxy', 'EdgeGeneratesXML', 'Serialize',
    'OSILayer7_BigPicture', 'OSILayer7', 'EdgeWrapsInHTTP', 'TransportProtocol', 'SOAPMessage_BigPicture', 'SOAPMessage', 'ReqEnvelope',
    'ReqHeader', 'ReqBody', 'EdgeTransmits', 'OSILowerLayers_BigPicture', 'OSILowerLayers', 'TCP', 'EdgeReceivesPayload',
    'Server_BigPicture', 'Server', 'ServerTransport', 'EdgeExtractsXML', 'Deserialize', 'EdgeValidatesWSDL', 'Validate',
    'EdgeInvokesLogic', 'AppServer', 'EdgeGeneratesResponseXML', 'SOAPResponse_BigPicture', 'SOAPResponse', 'RespEnvelope', 'RespHeader', 'RespBody',
    'RespFault', 'EdgeReturnsViaPort', 'EdgeDeliversResponse', 'ClientTransport',
    'EdgeDeserializesResponseXML', 'Deserialize2', 'EdgeReturnsResult'
];

function updateNavigationUI() {
    const prevBtn = document.getElementById('btn-prev-step');
    const nextBtn = document.getElementById('btn-next-step');
    const counter = document.getElementById('step-counter');
    if (!prevBtn || !nextBtn || !counter) return;

    const idx = navigationSequence.indexOf(currentActiveNode);
    if (idx === -1) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        counter.innerText = '';
        return;
    }

    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === navigationSequence.length - 1;
    counter.innerText = `Step ${idx + 1} of ${navigationSequence.length}`;
}

window.prevStep = function() {
    const idx = navigationSequence.indexOf(currentActiveNode);
    if (idx > 0) {
        const prevId = navigationSequence[idx - 1];
        if (prevId.endsWith('_BigPicture')) {
            window.showBigPicture(prevId.replace('_BigPicture', ''));
        } else {
            window.showDetails(prevId);
        }
    }
};

window.nextStep = function() {
    const idx = navigationSequence.indexOf(currentActiveNode);
    if (idx < navigationSequence.length - 1) {
        const nextId = navigationSequence[idx + 1];
        if (nextId.endsWith('_BigPicture')) {
            window.showBigPicture(nextId.replace('_BigPicture', ''));
        } else {
            window.showDetails(nextId);
        }
    }
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

window.showDetails = function showDetails(nodeId) {
    currentActiveNode = nodeId;
    const node = mergeNode(nodeId);
    if (!node.title) return;

    render(
        sidebarDetailTpl(node, nodeId, content.sidebar.labelIdentifier),
        document.getElementById('sidebar-content'),
    );

    window.dispatchEvent(new CustomEvent('node:selected', { detail: nodeId }));
    updateNavigationUI();
};

window.showBigPicture = function showBigPicture(nodeId) {
    const node = content.nodes[nodeId];
    if (!node || !node.bigPicture) return;
    currentActiveNode = nodeId + '_BigPicture';
    render(
        sidebarBigPictureTpl(node.bigPicture, node.title),
        document.getElementById('sidebar-content'),
    );
    window.dispatchEvent(new CustomEvent('node:selected', { detail: currentActiveNode }));
    updateNavigationUI();
};

// ─── Language Switching ───────────────────────────────────────────────────────

window.setGlobalLanguage = function setGlobalLanguage(lang) {
    currentLang = lang;

    // 1. Update button styles
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('bg-white', 'shadow-sm', 'text-blue-700');
        btn.classList.add('text-slate-600');
    });
    const activeBtn = document.getElementById('lang-' + lang);
    if (activeBtn) {
        activeBtn.classList.remove('text-slate-600');
        activeBtn.classList.add('bg-white', 'shadow-sm', 'text-blue-700');
    }

    // 2. Update sidebar badge
    const badge = document.getElementById('sidebar-lang-badge');
    if (badge) badge.innerText = langData.languages[lang]?.label || lang;

    // 3. Toggle facade code block
    document.querySelectorAll('.facade-code').forEach(el => el.classList.add('hidden'));
    document.getElementById('facade-' + lang)?.classList.remove('hidden');

    // 4. Toggle tooling section
    document.querySelectorAll('.tooling-content').forEach(el => el.classList.add('hidden'));
    document.getElementById('tooling-' + lang)?.classList.remove('hidden');

    // 5. Update CI/CD callout text
    const cicd = langData.cicd[lang];
    if (cicd) {
        const titleEl = document.getElementById('cicd-title');
        const textEl  = document.getElementById('cicd-text');
        if (titleEl) titleEl.innerText = cicd.title;
        if (textEl)  textEl.innerHTML  = cicd.body;
    }

    // 6. Refresh the sidebar if a node is currently open
    if (currentActiveNode) {
        if (['Client', 'OSILayer7', 'SOAPMessage', 'OSILowerLayers', 'Server', 'SOAPResponse'].includes(currentActiveNode)) {
            window.showBigPicture(currentActiveNode);
        } else {
            window.showDetails(currentActiveNode);
        }
    }
};

// ─── Page Renderer ────────────────────────────────────────────────────────────

function renderPage() {
    const { meta: m, sidebar: sb, sections: s } = content;
    const cicdDefault = langData.cicd['java'];

    const pageTpl = html`
        <div class="w-full bg-white border-b border-slate-200 py-3 px-4 md:px-6 shadow-sm">
            <header class="max-w-[96rem] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div class="text-center md:text-left">
                    <h1 class="text-2xl md:text-3xl font-bold text-slate-900 mb-1">${m.pageTitle}</h1>
                    <div class="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                        <p class="text-sm text-slate-600">${m.pageSubtitle}</p>
                        <span class="hidden md:inline text-slate-300">|</span>
                        <p class="text-xs text-blue-600 font-medium">${m.diagramHint}</p>
                    </div>
                </div>
                <div class="flex-shrink-0">
                    <div class="inline-flex bg-slate-200 rounded-lg p-1 shadow-inner">
                        ${langButtonsTpl(langData.languages, currentLang, window.setGlobalLanguage)}
                    </div>
                </div>
            </header>
        </div>

        <div class="w-full bg-slate-50 border-b border-slate-200">
            <div class="w-full p-2 md:p-6">
                ${diagramAndSidebarTpl(sb)}
            </div>
        </div>

        <div class="max-w-5xl mx-auto p-6 md:p-12 space-y-8">
            ${understandingLayersTpl(s.understandingLayers)}
            ${proxyPatternTpl(s.proxyPattern, facadeBlocksTpl(langData.facades))}
            ${toolingSectionTpl(s.tooling, toolingBlocksTpl(langData.tooling), cicdDefault)}
        </div>
    `;

    // lit-html v3 does not pre-clear the container — explicitly remove the
    // "Loading content..." placeholder before rendering the page template in.
    const appRoot = document.querySelector('#app-root');
    appRoot.replaceChildren();
    render(pageTpl, appRoot);

    // Establish lit-html's ownership of #sidebar-content by rendering the placeholder
    // through the same render() path that showDetails() uses. Without this, the
    // placeholder lives inside the parent template's managed DOM and showDetails()'s
    // render() call conflicts with the parent part, leaving the placeholder visible.
    const sidebarEl = document.getElementById('sidebar-content');
    render(sidebarPlaceholderTpl(sb.emptyState), sidebarEl);

    // Set the mermaid source directly — bypasses lit-html's comment binding markers
    // which would otherwise appear inside the <pre> and break mermaid's parser.
    document.querySelector('pre.mermaid').textContent = diagramDef;

    // Notify mermaid-init that the DOM is ready for diagram rendering
    window.dispatchEvent(new CustomEvent('app:rendered'));

    // Auto-select the first node (1. Client Application) once the diagram is rendered
    window.addEventListener('diagram:rendered', () => {
        window.showDetails('AppClient');
    }, { once: true });
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

loadData()
    .then(renderPage)
    .catch(err => {
        const appRoot = document.querySelector('#app-root');
        appRoot.replaceChildren();
        render(errorTpl(err), appRoot);
    });
