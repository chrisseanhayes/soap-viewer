// ─── State ────────────────────────────────────────────────────────────────────

let currentLang       = 'java';
let currentActiveNode = null;
let content           = null;   // content.json
let langData          = null;   // language-data.json

// ─── Data Loading ─────────────────────────────────────────────────────────────

async function loadData() {
    const [c, l] = await Promise.all([
        fetch('./data/content.json').then(r => r.json()),
        fetch('./data/language-data.json').then(r => r.json()),
    ]);
    content  = c;
    langData = l;
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
    };
}

/** Escape a raw string for safe insertion inside an HTML attribute or text node. */
function escapeHtml(str) {
    return str
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;');
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

window.showDetails = function showDetails(nodeId) {
    currentActiveNode = nodeId;
    const sidebarContent = document.getElementById('sidebar-content');
    const node = mergeNode(nodeId);
    if (!node.title) return;

    const codeHtml = node.codeSnippet ? `
        <div class="bg-slate-800 p-4 rounded-lg border border-slate-700 mt-5 shadow-inner">
            <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                </svg>
                Code &amp; Payload Context
            </h4>
            <pre class="text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all"><code>${node.codeSnippet}</code></pre>
        </div>` : '';

    sidebarContent.innerHTML = `
        <div class="animate-fade-in space-y-4">
            <div class="border-b border-slate-200 pb-3">
                <h3 class="text-2xl font-bold text-blue-700">${node.title}</h3>
                <span class="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100">
                    ${content.sidebar.labelIdentifier}: ${nodeId}
                </span>
            </div>

            <div>
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Overview
                </h4>
                <p class="text-slate-700 leading-relaxed text-sm">${node.overview}</p>
            </div>

            <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                    </svg>
                    Developer Impact
                </h4>
                <p class="text-slate-700 leading-relaxed text-sm">${node.devImpact}</p>
            </div>

            <div>
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                    Next Steps
                </h4>
                <p class="text-slate-700 leading-relaxed text-sm">${node.interaction}</p>
            </div>

            <div class="bg-orange-50 p-3 rounded-lg border border-orange-100">
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                    </svg>
                    Branching &amp; Flow
                </h4>
                <p class="text-slate-700 leading-relaxed text-sm">${node.branching}</p>
            </div>

            ${codeHtml}
        </div>
    `;
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
        if (titleEl) titleEl.innerText  = cicd.title;
        if (textEl)  textEl.innerHTML   = cicd.body;
    }

    // 6. Refresh the sidebar if a node is currently open
    if (currentActiveNode) window.showDetails(currentActiveNode);
};

// ─── HTML Builders ────────────────────────────────────────────────────────────

function buildLangButtons() {
    return Object.entries(langData.languages).map(([key, l]) => {
        const isActive = key === 'java';
        const cls = isActive
            ? 'lang-btn px-6 py-2.5 rounded-md font-semibold text-sm bg-white shadow-sm text-blue-700 transition-all duration-200'
            : 'lang-btn px-6 py-2.5 rounded-md font-semibold text-sm text-slate-600 hover:text-slate-800 transition-all duration-200';
        return `<button onclick="setGlobalLanguage('${key}')" id="lang-${key}" class="${cls}">${l.label}</button>`;
    }).join('');
}

function buildFacadeBlocks() {
    return Object.entries(langData.facades).map(([lang, code]) => `
        <div id="facade-${lang}" class="facade-code ${lang === 'java' ? '' : 'hidden'}">
            <pre class="bg-slate-800 text-green-400 p-4 rounded-md text-sm overflow-x-auto font-mono shadow-inner"><code>${escapeHtml(code)}</code></pre>
        </div>`
    ).join('');
}

function buildToolingBlocks() {
    return Object.entries(langData.tooling).map(([lang, t]) => `
        <div id="tooling-${lang}" class="tooling-content ${lang === 'java' ? '' : 'hidden'} mt-6 animate-fade-in">
            <div class="bg-slate-50 p-5 rounded-lg border border-slate-200">
                <h4 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <span class="w-2 h-2 ${t.dotColor} rounded-full"></span>
                    ${t.heading}
                </h4>
                <p class="mb-3">${t.body}</p>
                <pre class="bg-slate-800 text-green-400 p-4 rounded-md text-xs overflow-x-auto font-mono shadow-inner"><code>${escapeHtml(t.code)}</code></pre>
            </div>
        </div>`
    ).join('');
}

// ─── Page Renderer ────────────────────────────────────────────────────────────

function renderPage() {
    const { meta: m, sidebar: sb, sections: s } = content;
    const cicdDefault = langData.cicd['java'];

    document.querySelector('#app-root').innerHTML = `
        <header class="text-center">
            <h1 class="text-3xl font-bold text-slate-900 mb-2">${m.pageTitle}</h1>
            <p class="text-slate-600 mb-6">${m.pageSubtitle}</p>

            <div class="flex justify-center mb-4">
                <div class="inline-flex bg-slate-200 rounded-lg p-1 shadow-inner">
                    ${buildLangButtons()}
                </div>
            </div>
            <p class="text-sm text-blue-600 font-medium">${m.diagramHint}</p>
        </header>

        <div class="flex flex-col lg:flex-row gap-6">
            <!-- Diagram -->
            <main class="mermaid-container w-full lg:w-2/3">
                <pre class="mermaid">
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#eff6ff', 'primaryTextColor': '#1e293b', 'primaryBorderColor': '#3b82f6', 'lineColor': '#64748b', 'secondaryColor': '#f0fdf4', 'tertiaryColor': '#fef2f2'}}}%%
graph TD
    classDef osiLayer fill:#f3f4f6,stroke:#94a3b8,stroke-width:2px,stroke-dasharray: 5 5;
    classDef process fill:#e0f2fe,stroke:#0ea5e9,stroke-width:2px;
    classDef soapLayer fill:#fef3c7,stroke:#d97706,stroke-width:2px;
    classDef clickable cursor:pointer,transition:all 0.2s;

    subgraph Client [Client Application Environment]
        AppClient[1. Client Application] -->|Initiates Request| Proxy[2. Client Proxy / Stub]
        Proxy -->|Generates XML| Serialize[3. Serialize to SOAP Message]
        class AppClient,Proxy,Serialize process;
        class AppClient,Proxy,Serialize clickable;
    end

    subgraph OSILayer7 [OSI Layer 7: Application]
        Serialize -->|Wraps in HTTP/SMTP| TransportProtocol[4. Transport Protocol]
        class TransportProtocol process;
        class TransportProtocol clickable;

        subgraph SOAPMessage [SOAP Message Structure]
            Envelope[SOAP Envelope]
            Header[SOAP Header - Optional]
            Body[SOAP Body - Required]
            Fault[SOAP Fault - Optional Error Info]
            Envelope --- Header
            Envelope --- Body
            Body -.- Fault
            class Envelope,Header,Body,Fault soapLayer;
            class Envelope,Header,Body,Fault clickable;
        end
        TransportProtocol -.-> SOAPMessage
    end

    subgraph OSILowerLayers [OSI Layers 1-4: Transport/Network]
        TCP[TCP/IP Routing]
        class TCP osiLayer;
        class TCP clickable;
    end
    TransportProtocol -->|Transmits via Port 80/443| TCP

    subgraph Server [Server Provider Environment]
        TCP -->|Receives Payload| ServerTransport[5. Web Server / Listener]
        ServerTransport -->|Extracts XML| Deserialize[6. Parse SOAP XML]
        Deserialize -->|Validates vs WSDL| Validate[7. WSDL Contract Validation]
        Validate -->|Invokes Logic| AppServer[8. Service Business Logic]
        class ServerTransport,Deserialize,Validate,AppServer process;
        class ServerTransport,Deserialize,Validate,AppServer clickable;
    end

    AppServer -.->|Generates Response XML| ServerTransport
    class Client,Server osiLayer;
    class OSILayer7 osiLayer;

    click AppClient       call showDetails() "Details on Client"
    click Proxy           call showDetails() "Details on Proxy"
    click Serialize       call showDetails() "Details on Serialization"
    click TransportProtocol call showDetails() "Details on Transport"
    click Envelope        call showDetails() "Details on Envelope"
    click Header          call showDetails() "Details on Header"
    click Body            call showDetails() "Details on Body"
    click Fault           call showDetails() "Details on Fault"
    click TCP             call showDetails() "Details on Networking"
    click ServerTransport call showDetails() "Details on Web Server"
    click Deserialize     call showDetails() "Details on Parsing"
    click Validate        call showDetails() "Details on Validation"
    click AppServer       call showDetails() "Details on Logic"
                </pre>
            </main>

            <!-- Sidebar -->
            <aside class="w-full lg:w-1/3 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-[600px]">
                <div class="p-4 border-b border-slate-100 bg-slate-50 rounded-t-lg">
                    <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        ${sb.heading}
                        <span id="sidebar-lang-badge" class="ml-2 text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Java</span>
                    </h2>
                </div>
                <div id="sidebar-content" class="p-6 flex-grow overflow-y-auto">
                    <div class="h-full flex flex-col items-center justify-center text-center text-slate-400">
                        <svg class="w-12 h-12 mb-4 text-slate-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
                        </svg>
                        <p class="text-sm">${sb.emptyState.replace('\n', '<br>')}</p>
                    </div>
                </div>
            </aside>
        </div>

        <!-- Understanding the Layers -->
        <section class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 class="text-xl font-semibold mb-4 text-slate-800">${s.understandingLayers.heading}</h2>
            <div class="grid md:grid-cols-2 gap-6 text-sm text-slate-600">
                <div>
                    <h3 class="font-bold text-slate-800 mb-2 border-b pb-1">${s.understandingLayers.osi7.heading}</h3>
                    <p>${s.understandingLayers.osi7.body}</p>
                </div>
                <div>
                    <h3 class="font-bold text-slate-800 mb-2 border-b pb-1">${s.understandingLayers.proxy.heading}</h3>
                    <p>${s.understandingLayers.proxy.body}</p>
                </div>
            </div>
        </section>

        <!-- Proxy & Facade Pattern -->
        <section class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 class="text-xl font-semibold mb-4 text-slate-800">${s.proxyPattern.heading}</h2>
            <div class="text-sm text-slate-600 space-y-4">
                <p>${s.proxyPattern.intro}</p>

                <div class="grid md:grid-cols-2 gap-6 mt-4">
                    <div class="bg-slate-50 p-5 rounded-lg border border-slate-200">
                        <h4 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                            </svg>
                            ${s.proxyPattern.developerView.heading}
                        </h4>
                        <p class="mb-4">${s.proxyPattern.developerView.body}</p>
                        ${buildFacadeBlocks()}
                    </div>

                    <div class="bg-blue-50 p-5 rounded-lg border border-blue-100">
                        <h4 class="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                            </svg>
                            ${s.proxyPattern.hiddenComplexity.heading}
                        </h4>
                        <p class="mb-3">${s.proxyPattern.hiddenComplexity.body}</p>
                        <ul class="list-disc pl-5 space-y-1.5 text-sm">
                            ${s.proxyPattern.hiddenComplexity.bullets.map(b => `<li>${b}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div class="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200 flex items-start gap-3">
                    <svg class="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    <div>
                        <strong class="text-slate-900 block mb-1">${s.proxyPattern.leakyAbstraction.heading}</strong>
                        ${s.proxyPattern.leakyAbstraction.body}
                    </div>
                </div>
            </div>
        </section>

        <!-- Tooling -->
        <section class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 class="text-xl font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <svg class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                ${s.tooling.heading}
            </h2>
            <div class="text-sm text-slate-600 space-y-4">
                <p>${s.tooling.intro}</p>
                ${buildToolingBlocks()}
                <div class="mt-4 p-4 bg-slate-100 rounded-lg border border-slate-200 text-slate-700 flex items-start gap-3">
                    <svg class="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <div>
                        <strong id="cicd-title" class="text-slate-900 block mb-1">${cicdDefault.title}</strong>
                        <span id="cicd-text">${cicdDefault.body}</span>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

loadData()
    .then(renderPage)
    .catch(err => {
        document.querySelector('#app-root').innerHTML = `
            <div class="text-center py-20 text-red-500">
                <p class="font-bold text-lg">Failed to load content</p>
                <p class="text-sm mt-2">${err.message}</p>
                <p class="text-xs mt-1 text-slate-500">
                    Make sure you are serving this page via a local HTTP server
                    (e.g. <code>python3 -m http.server</code>).
                </p>
            </div>`;
    });
