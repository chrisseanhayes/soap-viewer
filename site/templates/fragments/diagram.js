import { html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { iconSvg } from './icons.js';
import { cls as sharedCls } from './classes.js';

const cls = {
    diagramLayout: "flex flex-col lg:flex-row gap-6 h-[75vh] min-h-[600px]",
    diagramMain: "mermaid-container w-full lg:w-3/4 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative",
    diagramSidebar: "w-full lg:w-1/4 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-full",
    
    // Zoom Controls
    zoomControlContainer: "absolute bottom-4 right-4 z-20 flex bg-white/90 shadow-sm border border-slate-200 rounded-md p-1 backdrop-blur-sm gap-1",
    zoomBtn: "custom-zoom-btn flex items-center justify-center w-8 h-8 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors",
    zoomDivider: "w-px bg-slate-200 mx-0.5 my-1",
    zoomDropdownGroup: "relative group flex items-center",
    zoomDropdownToggle: "flex items-center justify-center px-2 min-w-[3rem] h-8 text-xs font-semibold rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors",
    zoomDropdownMenu: "absolute bottom-full right-0 pb-1 hidden group-hover:block z-50",
    zoomDropdownMenuInner: "w-36 bg-white border border-slate-200 rounded-md shadow-lg py-1",
    zoomMenuBtn: "custom-zoom-btn w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    zoomMenuDivider: "h-px bg-slate-200 my-1 mx-2",
    zoomMenuLabel: "flex items-center w-full px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer",
    zoomMenuCheckbox: "mr-2 rounded border-slate-300 text-blue-600 focus:ring-blue-500",

    // Sidebar Shell
    sidebarHeader: "p-4 border-b border-slate-100 bg-slate-50 rounded-t-lg",
    sidebarTitle: "text-lg font-bold text-slate-800 flex items-center gap-2",
    sidebarTitleText: "truncate",
    sidebarLangBadge: "ml-auto text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full flex-shrink-0",
    sidebarContent: "p-6 flex-grow overflow-y-auto",
    sidebarFooter: "p-4 border-t border-slate-100 bg-slate-50 rounded-b-lg flex justify-between items-center",
    sidebarNavBtn: "text-sm px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    sidebarNavCounter: "text-xs text-slate-500 font-medium whitespace-nowrap px-2"
};

const diagramZoomInIcon = () => iconSvg('zoomIn', 'w-4 h-4');
const diagramZoomOutIcon = () => iconSvg('zoomOut', 'w-4 h-4');
const diagramZoomDropdownIcon = () => iconSvg('chevronDown', 'w-3 h-3 ml-1');
const shellSidebarTitleIcon = () => iconSvg('info', 'w-5 h-5 text-blue-600 flex-shrink-0');

export function diagramAndSidebarTpl(sb) {
    return html`
        <div class="${cls.diagramLayout}">
            <!-- Diagram -->
            <main class="${cls.diagramMain}">
                <div class="${cls.zoomControlContainer}">
                    <button class="${cls.zoomBtn}" data-zoom="in" title="Zoom In">
                        ${diagramZoomInIcon()}
                    </button>
                    <button class="${cls.zoomBtn}" data-zoom="out" title="Zoom Out">
                        ${diagramZoomOutIcon()}
                    </button>
                    <div class="${cls.zoomDivider}"></div>
                    <div class="${cls.zoomDropdownGroup}">
                        <button class="${cls.zoomDropdownToggle}">
                            Zoom
                            ${diagramZoomDropdownIcon()}
                        </button>
                        <div class="${cls.zoomDropdownMenu}">
                            <div class="${cls.zoomDropdownMenuInner}">
                                <button class="${cls.zoomMenuBtn}" data-zoom="fit">Fit</button>
                                <button class="${cls.zoomMenuBtn}" data-zoom="1">100%</button>
                                <button class="${cls.zoomMenuBtn}" data-zoom="1.5">150%</button>
                                <button class="${cls.zoomMenuBtn}" data-zoom="2">200%</button>
                                <div class="${cls.zoomMenuDivider}"></div>
                                <label class="${cls.zoomMenuLabel}" title="Zoom to selection">
                                    <input type="checkbox" id="zoom-on-select-toggle" class="${cls.zoomMenuCheckbox}" onchange="window.toggleZoomOnSelect()">
                                    Zoom on Select
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <pre class="mermaid w-full h-full"></pre>
            </main>

            <!-- Sidebar -->
            <aside class="${cls.diagramSidebar}">
                <div class="${cls.sidebarHeader}">
                    <h2 class="${cls.sidebarTitle}">
                        ${shellSidebarTitleIcon()}
                        <span class="${cls.sidebarTitleText}">${sb.heading}</span>
                        <span id="sidebar-lang-badge" class="${cls.sidebarLangBadge} ${sharedCls.pill}">Java</span>
                    </h2>
                </div>
                <div id="sidebar-content" class="${cls.sidebarContent}"></div>
                <div class="${cls.sidebarFooter}">
                    <button id="btn-prev-step" class="${cls.sidebarNavBtn}" disabled onclick="window.prevStep()">&larr; Previous</button>
                    <span id="step-counter" class="${cls.sidebarNavCounter}"></span>
                    <button id="btn-next-step" class="${cls.sidebarNavBtn}" disabled onclick="window.nextStep()">Next &rarr;</button>
                </div>
            </aside>
        </div>
    `;
}
