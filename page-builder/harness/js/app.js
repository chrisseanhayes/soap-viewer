import { render, html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { diagramAndSidebarTpl } from '../templates/fragments/diagram.js';
import { sidebarPlaceholderTpl, sidebarDetailTpl, sidebarBigPictureTpl } from '../templates/fragments/sidebar-detail.js';
import { understandingLayersTpl, proxyPatternTpl, toolingSectionTpl } from '../templates/fragments/sections.js';
import { iconSvg } from '../templates/fragments/icons.js';
import { cls as sharedCls } from '../templates/fragments/classes.js';
import { theme } from '../templates/fragments/theme.js';
import { langButtonsTpl, facadeBlocksTpl, toolingBlocksTpl } from '../templates/fragments/lang-controls.js';
import { errorTpl } from '../templates/fragments/error.js';

const t = theme.colors;
const ts = t.surface;
const tx = t.text;
const ti = t.interactive;

const cls = {
    appContainer: "max-w-7xl mx-auto px-4 py-6 space-y-8 animate-fade-in",
    appHeader: "flex items-center justify-between gap-6 pb-4 border-b border-slate-200",
    appHeaderText: "min-w-0",
    appTitle: `text-2xl font-extrabold tracking-tight ${tx.h1}`,
    appSubtitle: `text-sm leading-snug mt-0.5 ${tx.muted}`,
    appLangToggleContainer: "flex-shrink-0",
    appLangToggleInner: `inline-flex p-1 rounded-lg border ${t.langToggle.containerBg} ${t.langToggle.containerBorder}`,
    appRootLoading: `text-center py-20 ${tx.placeholder}`,
    modalOverlay: `fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${ts.overlay}`,
    modalContent: `rounded-xl shadow-2xl max-w-md w-full p-6 relative ${ts.main}`,
    modalCloseBtn: `absolute top-4 right-4 transition-colors ${tx.placeholder} ${ti.hoverTextLight}`,
    modalTitle: `text-xl font-bold mb-3 border-b pb-2 ${tx.h2} ${ts.borderLight}`,
    modalBody: `leading-relaxed text-sm ${tx.muted}`,
    modalFooter: "mt-6 flex justify-end",
    modalActionBtn: `px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${ti.btnBg} ${ti.btnHover} ${tx.body}`
};

let content = null;
let langData = null;
let currentLang = 'java';
let currentActiveNode = null;
let svgPanZoomInstance = null;

async function loadData() {
    try {
        const [contentRes, langRes] = await Promise.all([
            fetch('./data/content.json'),
            fetch('./data/language-data.json')
        ]);
        content = await contentRes.json();
        langData = await langRes.json();
        
        window.__diagramMeta = content.diagramMeta || {};
        currentLang = content.meta?.defaultLanguage || 'java';
        currentActiveNode = content.meta?.initialNodeId || 'AppClient';
        
        document.title = content.meta?.pageTitle || 'Architecture Viewer';
        
        renderApp();
        initMermaidDiagram();
    } catch (err) {
        console.error("Failed to load data", err);
        render(errorTpl(err), document.getElementById('app-root'));
    }
}

function renderApp() {
    const cicdDefault = langData.cicd && langData.cicd[currentLang] 
        ? langData.cicd[currentLang] 
        : { title: "CI/CD Deployment", body: "Deployment pipelines typically package the built artifact and deploy it to a container registry or application server." };

    const appTpl = html`
        <div class="${cls.appContainer}">
            <header class="${cls.appHeader}">
                <div class="${cls.appHeaderText}">
                    <h1 class="${cls.appTitle}">${content.meta?.pageTitle || 'Architecture Viewer'}</h1>
                    <p class="${cls.appSubtitle}">${content.meta?.pageDescription || 'Explore the request-response lifecycle.'}</p>
                </div>
                <div class="${cls.appLangToggleContainer}">
                    <div class="${cls.appLangToggleInner}">
                        ${langButtonsTpl(langData.languages, currentLang, (lang) => {
                            currentLang = lang;
                            renderApp();
                        })}
                    </div>
                </div>
            </header>

            ${diagramAndSidebarTpl(content.sidebar)}

            ${understandingLayersTpl(content.sections.understandingLayers)}
            
            ${proxyPatternTpl(content.sections.proxyPattern, facadeBlocksTpl(langData.facades, currentLang))}
            
            ${toolingSectionTpl(content.sections.tooling, toolingBlocksTpl(langData.tooling, currentLang), cicdDefault)}
        </div>
        <div id="modal-root"></div>
    `;

    const appRoot = document.querySelector('#app-root');
    if (appRoot) {
        if (appRoot.firstElementChild?.textContent === 'Loading content...') {
            appRoot.innerHTML = ''; 
        }
        render(appTpl, appRoot);
    }
    
    updateSidebar();
}

async function initMermaidDiagram() {
    const mermaidRes = await fetch('./data/diagram.mmd');
    const mermaidCode = await mermaidRes.text();
    const mermaidEl = document.querySelector('.mermaid');
    if (mermaidEl) {
        mermaidEl.textContent = mermaidCode;
        window.dispatchEvent(new Event('mermaid-ready'));
    }
}

window.prevStep = function() {
    if (!content?.navigationSequence) return;
    const currentIndex = content.navigationSequence.indexOf(currentActiveNode);
    if (currentIndex > 0) {
        currentActiveNode = content.navigationSequence[currentIndex - 1];
        updateSidebar();
        window.dispatchEvent(new CustomEvent('node:selected', { detail: { id: currentActiveNode, source: 'nav' } }));
    }
};

window.nextStep = function() {
    if (!content?.navigationSequence) return;
    const currentIndex = content.navigationSequence.indexOf(currentActiveNode);
    if (currentIndex < content.navigationSequence.length - 1) {
        currentActiveNode = content.navigationSequence[currentIndex + 1];
        updateSidebar();
        window.dispatchEvent(new CustomEvent('node:selected', { detail: { id: currentActiveNode, source: 'nav' } }));
    }
};

function updateSidebar() {
    if (!content) return;
    
    const sidebarEl = document.getElementById('sidebar-content');
    if (!sidebarEl) return;
    
    const btnPrev = document.getElementById('btn-prev-step');
    const btnNext = document.getElementById('btn-next-step');
    const stepCounter = document.getElementById('step-counter');
    const langBadge = document.getElementById('sidebar-lang-badge');
    
    if (langBadge && langData?.languages?.[currentLang]) {
        langBadge.textContent = langData.languages[currentLang].label;
    }
    
    if (!currentActiveNode) {
        render(sidebarPlaceholderTpl(content.sidebar.emptyState), sidebarEl);
        if (btnPrev) btnPrev.disabled = true;
        if (btnNext) btnNext.disabled = true;
        if (stepCounter) stepCounter.textContent = '';
        return;
    }
    
    const isBigPicture = content.nodes[currentActiveNode]?.isBigPicture || currentActiveNode.endsWith('_BigPicture');
    let template;
    
    if (isBigPicture) {
        const baseNodeId = currentActiveNode.replace('_BigPicture', '');
        const node = content.nodes[baseNodeId];
        template = sidebarBigPictureTpl(node.bigPicture, node.title);
    } else {
        const node = content.nodes[currentActiveNode];
        template = sidebarDetailTpl(node, currentActiveNode, content.sidebar.labelIdentifier, content.definitions);
    }
    
    render(template, sidebarEl);
    
    const currentIndex = content.navigationSequence.indexOf(currentActiveNode);
    if (btnPrev) btnPrev.disabled = currentIndex <= 0;
    if (btnNext) btnNext.disabled = currentIndex >= content.navigationSequence.length - 1;
    if (stepCounter) stepCounter.textContent = `Step ${currentIndex + 1} of ${content.navigationSequence.length}`;
}

window.showDetails = function(id) {
    window.dispatchEvent(new CustomEvent('node:selected', { detail: { id, source: 'click' } }));
};

window.addEventListener('node:selected', (e) => {
    // Only update sidebar if the event contains an id (it might just be a string if dispatched differently, but we send an object)
    const newId = typeof e.detail === 'string' ? e.detail : e.detail.id;
    if (newId && currentActiveNode !== newId) {
        currentActiveNode = newId;
        updateSidebar();
    }
});

const modalCloseIcon = () => iconSvg('close', 'w-6 h-6');

window.showDefinitionModal = function(title, definition) {
    const modalTpl = html`
        <div class="${cls.modalOverlay}" @click="${window.closeDefinitionModal}">
            <div class="${cls.modalContent}" @click="${e => e.stopPropagation()}">
                <button class="${cls.modalCloseBtn}" @click="${window.closeDefinitionModal}">
                    ${modalCloseIcon()}
                </button>
                <h3 class="${cls.modalTitle}">${title}</h3>
                <p class="${cls.modalBody}">${definition}</p>
                <div class="${cls.modalFooter}">
                    <button class="${cls.modalActionBtn}" @click="${window.closeDefinitionModal}">Got it</button>
                </div>
            </div>
        </div>
    `;
    render(modalTpl, document.getElementById('modal-root'));
};

window.closeDefinitionModal = function() {
    render(html``, document.getElementById('modal-root'));
};

window.toggleZoomOnSelect = function toggleZoomOnSelect() {
    const zoomToggle = document.getElementById('zoom-on-select-toggle');
    if (zoomToggle && zoomToggle.checked) {
        window.dispatchEvent(new CustomEvent('node:selected', { detail: { id: currentActiveNode, source: 'nav' } }));
    }
}

document.addEventListener('DOMContentLoaded', loadData);
