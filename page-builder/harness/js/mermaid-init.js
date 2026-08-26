import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });

// app.js dispatches 'app:rendered' after lit-html has written the diagram into the DOM.
// Listening here instead of DOMContentLoaded ensures the .mermaid pre element exists.
window.addEventListener('app:rendered', () => {
    mermaid.run({
        querySelector: '.mermaid',
        postRenderCallback: (id) => {
            const svgElement = document.querySelector(`#${id}`);
            if (!svgElement) return;

            svgElement.setAttribute('width', '100%');
            svgElement.setAttribute('height', '100%');

            window._isProgrammaticZoom = false;
            const handleManualZoomPan = function() {
                if (!window._isProgrammaticZoom) {
                    const toggle = document.getElementById('zoom-on-select-toggle');
                    if (toggle && toggle.checked) {
                        toggle.checked = false;
                    }
                }
            };

            const panZoomInstance = svgPanZoom(svgElement, {
                zoomEnabled: true,
                mouseWheelZoomEnabled: false,
                controlIconsEnabled: false,
                fit: true,
                center: true,
                minZoom: 0.5,
                maxZoom: 5,
                onZoom: handleManualZoomPan,
                onPan: handleManualZoomPan
            });

            window.addEventListener('resize', () => {
                panZoomInstance.resize();
                panZoomInstance.fit();
                panZoomInstance.center();
            });

            // Wire up custom zoom controls
            document.querySelectorAll('.custom-zoom-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const btnEl = e.target.closest('button');
                    if (!btnEl) return;
                    const zoomVal = btnEl.getAttribute('data-zoom');
                    if (zoomVal === 'in') {
                        panZoomInstance.zoomIn();
                    } else if (zoomVal === 'out') {
                        panZoomInstance.zoomOut();
                    } else if (zoomVal === 'fit') {
                        panZoomInstance.fit();
                        panZoomInstance.center();
                    } else if (zoomVal) {
                        const scale = parseFloat(zoomVal);
                        if (!isNaN(scale)) {
                            panZoomInstance.zoom(scale);
                            panZoomInstance.center();
                        }
                    }
                });
            });

            // Mermaid 10 doesn't reliably trigger 'click' directives on subgraphs (clusters).
            // We manually attach click listeners to the cluster SVG groups.
            const diagramMeta = window.__diagramMeta || { subgraphs: [], labelToNodeMap: {}, nodeToLabelMap: {}, nodeToSubgraphMap: {} };
            const subgraphKeys = diagramMeta.subgraphs || [];
            
            svgElement.querySelectorAll('.cluster').forEach(cluster => {
                const idAttr = cluster.getAttribute('id') || '';
                let match = null;
                
                for (const key of subgraphKeys) {
                    if (idAttr === key || idAttr.includes('-' + key + '-')) {
                        match = key;
                        break;
                    }
                }
                
                if (!match) {
                    const labelEl = cluster.querySelector('.cluster-label, .label');
                    if (labelEl) {
                        const text = labelEl.textContent.trim();
                        match = diagramMeta.labelToNodeMap[text] || null;
                    }
                }

                if (match) {
                    cluster.style.cursor = 'pointer';

                    // We also want hover effect if possible, but cursor: pointer is enough for now.
                    cluster.addEventListener('click', (e) => {
                        // Prevent triggering if a child node was clicked (handled by mermaid's own click)
                        if (e.target.closest('.node') || e.target.closest('.edgeLabel')) return;
                        window.showDetails(match);
                        e.stopPropagation();
                    });

                    // Inject a ? button (foreignObject) at the top-left of the cluster
                    const bgRect = cluster.querySelector('rect');
                    if (bgRect) {
                        const bx = parseFloat(bgRect.getAttribute('x') || 0);
                        const by = parseFloat(bgRect.getAttribute('y') || 0);
                        const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
                        fo.setAttribute('x', bx + 6);
                        fo.setAttribute('y', by + 6);
                        fo.setAttribute('width', '18');
                        fo.setAttribute('height', '18');
                        fo.style.overflow = 'visible';
                        fo.style.pointerEvents = 'all';

                        const btn = document.createElement('button');
                        btn.textContent = '?';
                        btn.title = 'How this fits into the big picture';
                        btn.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
                        btn.setAttribute('data-bigpicture-btn', match);
                        Object.assign(btn.style, {
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.92)',
                            border: '1px solid #cbd5e1',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: '1',
                            padding: '0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                            transition: 'color 0.15s, border-color 0.15s',
                        });
                        btn.addEventListener('mouseenter', () => {
                            if (btn.classList.contains('highlighted-bigpicture-btn')) return;
                            btn.style.color = '#dc2626';
                            btn.style.borderColor = '#f87171';
                        });
                        btn.addEventListener('mouseleave', () => {
                            if (btn.classList.contains('highlighted-bigpicture-btn')) return;
                            btn.style.color = '#94a3b8';
                            btn.style.borderColor = '#cbd5e1';
                        });
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            window.showBigPicture(match);
                        });

                        fo.appendChild(btn);
                        cluster.appendChild(fo);
                    }
                }
            });

            // Also attach click listeners to the text labels on the connecting arrows (edges)
            svgElement.querySelectorAll('.edgeLabel').forEach(label => {
                const text = label.textContent.trim();
                let match = diagramMeta.labelToNodeMap[text] || null;
                // Try partial matching if exact match fails
                if (!match) {
                    for (const [key, nodeId] of Object.entries(diagramMeta.labelToNodeMap)) {
                        if (text.includes(key)) {
                            match = nodeId;
                            break;
                        }
                    }
                }

                if (match) {
                    label.style.cursor = 'pointer';
                    // Add a subtle hover hint by styling the foreignObject div if present
                    const div = label.querySelector('div');
                    if (div) {
                        div.style.transition = 'color 0.2s';
                        label.addEventListener('mouseenter', () => div.style.color = '#2563eb');
                        label.addEventListener('mouseleave', () => div.style.color = '');
                    }

                    label.addEventListener('click', (e) => {
                        window.showDetails(match);
                        e.stopPropagation();
                    });
                }
            });

            const animateTo = (targetRelativeZoom, targetPanX, targetPanY) => {
                const originalRelativeZoom = panZoomInstance.getZoom();
                const originalPan = panZoomInstance.getPan();
                
                const startTime = performance.now();
                const duration = 400; // 400ms transition
                const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                
                if (panZoomInstance._animationId) {
                    cancelAnimationFrame(panZoomInstance._animationId);
                }
                
                const step = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    let progress = elapsed / duration;
                    if (progress > 1) progress = 1;
                    
                    const ease = easeInOutCubic(progress);
                    
                    const currentZoom = originalRelativeZoom + (targetRelativeZoom - originalRelativeZoom) * ease;
                    const currentPanX = originalPan.x + (targetPanX - originalPan.x) * ease;
                    const currentPanY = originalPan.y + (targetPanY - originalPan.y) * ease;
                    
                    window._isProgrammaticZoom = true;
                    panZoomInstance.zoom(currentZoom);
                    panZoomInstance.pan({ x: currentPanX, y: currentPanY });
                    window._isProgrammaticZoom = false;
                    
                    if (progress < 1) {
                        panZoomInstance._animationId = requestAnimationFrame(step);
                    } else {
                        panZoomInstance._animationId = null;
                    }
                };
                panZoomInstance._animationId = requestAnimationFrame(step);
            };

            window.addEventListener('zoom:fit', () => {
                window._isProgrammaticZoom = true;
                const originalRelativeZoom = panZoomInstance.getZoom();
                const originalPan = panZoomInstance.getPan();
                
                panZoomInstance.fit();
                panZoomInstance.center();
                
                const targetRelativeZoom = panZoomInstance.getZoom();
                const targetPan = panZoomInstance.getPan();
                
                panZoomInstance.zoom(originalRelativeZoom);
                panZoomInstance.pan(originalPan);
                window._isProgrammaticZoom = false;
                
                animateTo(targetRelativeZoom, targetPan.x, targetPan.y);
            });

            // Listen for selection events to highlight the active item
            window.addEventListener('node:selected', (e) => {
                let selectedId, source;
                if (typeof e.detail === 'string') {
                    selectedId = e.detail;
                    source = 'click';
                } else {
                    selectedId = e.detail.id;
                    source = e.detail.source || 'click';
                }
                
                // 1. UPDATE HIGHLIGHTS FIRST
                svgElement.querySelectorAll('.highlighted-svg-node').forEach(el => el.classList.remove('highlighted-svg-node'));
                svgElement.querySelectorAll('.highlighted-svg-cluster').forEach(el => el.classList.remove('highlighted-svg-cluster'));
                svgElement.querySelectorAll('.highlighted-svg-edge-label').forEach(el => el.classList.remove('highlighted-svg-edge-label'));
                svgElement.querySelectorAll('.highlighted-bigpicture-btn').forEach(btn => {
                    btn.classList.remove('highlighted-bigpicture-btn');
                    btn.style.background = 'rgba(255,255,255,0.92)';
                    btn.style.color = '#94a3b8';
                    btn.style.borderColor = '#cbd5e1';
                });

                if (selectedId.endsWith('_BigPicture')) {
                    const baseId = selectedId.replace('_BigPicture', '');
                    const btn = svgElement.querySelector(`[data-bigpicture-btn="${baseId}"]`);
                    if (btn) {
                        btn.classList.add('highlighted-bigpicture-btn');
                        btn.style.background = '#dc2626';
                        btn.style.color = '#ffffff';
                        btn.style.borderColor = '#dc2626';
                    }
                } else {
                    let targetNode = Array.from(svgElement.querySelectorAll('.node')).find(node => {
                        const idAttr = node.getAttribute('id') || '';
                        return idAttr === selectedId || idAttr.includes('-' + selectedId + '-');
                    });
                    
                    if (targetNode) {
                        targetNode.classList.add('highlighted-svg-node');
                    } else {
                        let targetCluster = Array.from(svgElement.querySelectorAll('.cluster')).find(cluster => {
                            const idAttr = cluster.getAttribute('id') || '';
                            if (idAttr === selectedId || idAttr.includes('-' + selectedId + '-')) return true;
                            const expectedLabel = window.__diagramMeta?.nodeToLabelMap?.[selectedId];
                            if (expectedLabel && cluster.textContent.includes(expectedLabel)) return true;
                            return false;
                        });

                        if (targetCluster) {
                            targetCluster.classList.add('highlighted-svg-cluster');
                        } else {
                            const edgeText = window.__diagramMeta?.nodeToLabelMap?.[selectedId];
                            if (edgeText) {
                                let targetEdge = Array.from(svgElement.querySelectorAll('.edgeLabel')).find(label => label.textContent.includes(edgeText));
                                if (targetEdge) targetEdge.classList.add('highlighted-svg-edge-label');
                            }
                        }
                    }
                }

                // 2. STATE MACHINE: DECIDE VIEWPORT MOVEMENT
                let zoomTargetId = selectedId;
                if (selectedId.endsWith('_BigPicture')) {
                    zoomTargetId = selectedId.replace('_BigPicture', '');
                }
                
                const zoomToggle = document.getElementById('zoom-on-select-toggle');
                const isZoomOn = zoomToggle && zoomToggle.checked;
                
                window._isProgrammaticZoom = true;
                const currentRelativeZoom = panZoomInstance.getZoom();
                const originalPanForCheck = panZoomInstance.getPan();
                panZoomInstance.fit();
                const fitZoom = panZoomInstance.getZoom();
                panZoomInstance.zoom(currentRelativeZoom);
                panZoomInstance.pan(originalPanForCheck);
                window._isProgrammaticZoom = false;
                
                const isCurrentlyFit = Math.abs(currentRelativeZoom - fitZoom) < 0.05;
                
                let movementAction = 'NONE';
                if (isZoomOn) {
                    movementAction = 'ZOOM_TO_NODE';
                } else if (source === 'nav') {
                    if (isCurrentlyFit) {
                        movementAction = 'NONE';
                    } else {
                        movementAction = 'PAN_TO_NODE';
                    }
                }
                
                if (movementAction === 'NONE') return;

                // 3. CALCULATE TARGET AND ANIMATE
                const clusterId = window.__diagramMeta?.subgraphs?.includes(zoomTargetId) 
                    ? zoomTargetId 
                    : (window.__diagramMeta?.nodeToSubgraphMap?.[zoomTargetId] || null);
                let targetEl = null;
                let targetIsCluster = false;

                if (clusterId) {
                    targetEl = Array.from(svgElement.querySelectorAll('.cluster')).find(cluster => {
                        const idAttr = cluster.getAttribute('id') || '';
                        if (idAttr === clusterId || idAttr.includes('-' + clusterId + '-')) return true;
                        const expectedLabel = window.__diagramMeta?.nodeToLabelMap?.[clusterId];
                        if (expectedLabel && cluster.textContent.includes(expectedLabel)) return true;
                        return false;
                    });
                    if (targetEl) targetIsCluster = true;
                }

                if (!targetEl) {
                    targetEl = Array.from(svgElement.querySelectorAll('.node')).find(node => {
                        const idAttr = node.getAttribute('id') || '';
                        return idAttr === zoomTargetId || idAttr.includes('-' + zoomTargetId + '-');
                    });
                    
                    if (!targetEl) {
                        const edgeText = window.__diagramMeta?.nodeToLabelMap?.[zoomTargetId];
                        if (edgeText) {
                            targetEl = Array.from(svgElement.querySelectorAll('.edgeLabel')).find(label => label.textContent.includes(edgeText));
                        }
                    }
                }

                if (targetEl) {
                    const rectForBounds = targetIsCluster ? (targetEl.querySelector('rect') || targetEl) : targetEl;
                    const rectBox = rectForBounds.getBoundingClientRect();
                    const svgBox = svgElement.getBoundingClientRect();
                    
                    const screenLeft = rectBox.left - svgBox.left;
                    const screenTop = rectBox.top - svgBox.top;
                    
                    const sizes = panZoomInstance.getSizes();
                    const currentZoom = sizes.realZoom;
                    const currentPan = panZoomInstance.getPan();
                    
                    const cw = rectBox.width / currentZoom;
                    const ch = rectBox.height / currentZoom;

                    if (cw > 0 && ch > 0) {
                        let targetRelativeZoom;
                        
                        if (movementAction === 'ZOOM_TO_NODE') {
                            const zoomX = sizes.width / cw;
                            const zoomY = sizes.height / ch;
                            
                            let targetAbsoluteZoom = Math.min(zoomX, zoomY) * (targetIsCluster ? 0.95 : 0.8);
                            const maxAllowedZoom = targetIsCluster ? 5 : 2;
                            targetAbsoluteZoom = Math.min(targetAbsoluteZoom, maxAllowedZoom);
                            
                            const initialZoom = sizes.realZoom / panZoomInstance.getZoom();
                            targetRelativeZoom = targetAbsoluteZoom / initialZoom;
                            targetRelativeZoom = Math.max(0.5, Math.min(targetRelativeZoom, 5));
                        } else if (movementAction === 'PAN_TO_NODE') {
                            targetRelativeZoom = currentRelativeZoom;
                        }
                        
                        const currentScreenCenterX = screenLeft + rectBox.width / 2;
                        const currentScreenCenterY = screenTop + rectBox.height / 2;
                        
                        const svgCenterX = (currentScreenCenterX - currentPan.x) / currentZoom;
                        const svgCenterY = (currentScreenCenterY - currentPan.y) / currentZoom;
                        
                        window._isProgrammaticZoom = true;
                        const originalRelativeZoom = panZoomInstance.getZoom();
                        const originalPan = panZoomInstance.getPan();
                        
                        panZoomInstance.zoom(targetRelativeZoom);
                        
                        const targetRealZoom = panZoomInstance.getSizes().realZoom;
                        const targetPanX = (sizes.width / 2) - (svgCenterX * targetRealZoom);
                        const targetPanY = (sizes.height / 2) - (svgCenterY * targetRealZoom);
                        
                        panZoomInstance.zoom(originalRelativeZoom);
                        panZoomInstance.pan(originalPan);
                        window._isProgrammaticZoom = false;
                        
                        animateTo(targetRelativeZoom, targetPanX, targetPanY);
                    }
                }
            });

            // Signal that the diagram is fully rendered and interactive
            window.dispatchEvent(new CustomEvent('diagram:rendered'));
        },
    });
});
