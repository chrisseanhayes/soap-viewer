import { html } from 'https://cdn.jsdelivr.net/npm/lit-html@3/+esm';
import { diagramZoomInIcon, diagramZoomOutIcon, diagramZoomDropdownIcon, shellSidebarTitleIcon } from './icons.js';
import { cls } from './classes.js';

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
                        <span id="sidebar-lang-badge" class="${cls.sidebarLangBadge}">Java</span>
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
