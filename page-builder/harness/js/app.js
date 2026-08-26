import { render, html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { langControlsTpl } from '../templates/fragments/lang-controls.js';
import { errorStateTpl } from '../templates/fragments/error.js';
import { diagramAndSidebarTpl } from '../templates/fragments/diagram.js';
import { sidebarPlaceholderTpl, sidebarDetailTpl, sidebarBigPictureTpl } from '../templates/fragments/sidebar-detail.js';
import { understandingLayersTpl, proxyPatternTpl, toolingSectionTpl } from '../templates/fragments/sections.js';
import { iconSvg } from '../templates/fragments/icons.js';
import { cls } from '../templates/fragments/classes.js';
import { langButtonsTpl, facadeBlocksTpl, toolingBlocksTpl } from '../templates/fragments/lang-controls.js';
import { errorTpl } from '../templates/fragments/error.js';

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
                <h1 class="${cls.appTitle}">${content.meta?.pageTitle || 'Architecture Viewer'}</h1>
                <p class="${cls.appSubtitle}">
                    ${content.meta?.pageDescription || 'Explore the request-response lifecycle.'}
                </p>
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
        window.dispatchEvent(new CustomEvent('mermaid-select-node', { detail: { nodeId: currentActiveNode } }));
    }
};

window.nextStep = function() {
    if (!content?.navigationSequence) return;
    const currentIndex = content.navigationSequence.indexOf(currentActiveNode);
    if (currentIndex < content.navigationSequence.length - 1) {
        currentActiveNode = content.navigationSequence[currentIndex + 1];
        updateSidebar();
        window.dispatchEvent(new CustomEvent('mermaid-select-node', { detail: { nodeId: currentActiveNode } }));
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

window.addEventListener('mermaid-node-clicked', (e) => {
    currentActiveNode = e.detail.nodeId;
    updateSidebar();
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
        window.dispatchEvent(new CustomEvent('mermaid-select-node', { detail: { nodeId: currentActiveNode } }));
    }
}

document.addEventListener('DOMContentLoaded', loadData);
