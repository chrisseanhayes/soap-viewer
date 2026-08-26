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
            const subgraphKeys = ['Client', 'OSILayer7', 'SOAPMessage', 'SOAPResponse', 'OSILowerLayers', 'Server'];
            svgElement.querySelectorAll('.cluster').forEach(cluster => {
                const idAttr = cluster.getAttribute('id') || '';
                let match = null;
                
                // Some versions use id="Client", others use id="flowchart-Client-123"
                for (const key of subgraphKeys) {
                    if (idAttr === key || idAttr.includes('-' + key + '-')) {
                        match = key;
                        break;
                    }
                }
                
                // Fallback: look at the text label if ID matching fails
                if (!match) {
                    const labelEl = cluster.querySelector('.cluster-label, .label');
                    if (labelEl) {
                        const text = labelEl.textContent;
                        if (text.includes('Client Application')) match = 'Client';
                        else if (text.includes('OSI Layer 7')) match = 'OSILayer7';
                        else if (text.includes('SOAP Request Message')) match = 'SOAPMessage';
                        else if (text.includes('SOAP Response Message')) match = 'SOAPResponse';
                        else if (text.includes('OSI Layers 1-4')) match = 'OSILowerLayers';
                        else if (text.includes('Server Provider')) match = 'Server';
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
            const edgeMappings = {
                'Initiates Request': 'EdgeInitiatesRequest',
                'Generates XML': 'EdgeGeneratesXML',
                'Wraps in HTTP/SMTP': 'EdgeWrapsInHTTP',
                'Transmits via Port 80/443': 'EdgeTransmits',
                'Receives Payload': 'EdgeReceivesPayload',
                'Extracts XML': 'EdgeExtractsXML',
                'Validates vs WSDL': 'EdgeValidatesWSDL',
                'Invokes Logic': 'EdgeInvokesLogic',
                'Generates Response XML': 'EdgeGeneratesResponseXML',
                'Returns via Port 80/443': 'EdgeReturnsViaPort',
                'Delivers Response': 'EdgeDeliversResponse',
                'Deserializes Response XML': 'EdgeDeserializesResponseXML',
                'Returns Result / Throws Fault': 'EdgeReturnsResult'
            };

            svgElement.querySelectorAll('.edgeLabel').forEach(label => {
                const text = label.textContent.trim();
                let match = null;
                for (const [key, nodeId] of Object.entries(edgeMappings)) {
                    if (text.includes(key)) {
                        match = nodeId;
                        break;
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

            // Listen for selection events to highlight the active item
            window.addEventListener('node:selected', (e) => {
                const selectedId = e.detail;
                
                // Zoom on select logic
                const zoomToggle = document.getElementById('zoom-on-select-toggle');
                
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

                if (zoomToggle && !zoomToggle.checked) {
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
                } else if (zoomToggle && zoomToggle.checked) {
                    const getParentClusterId = (id) => {
                        if (id.endsWith('_BigPicture')) id = id.replace('_BigPicture', '');
                        const map = {
                            'AppClient': 'Client', 'Proxy': 'Client', 'EdgeInitiatesRequest': 'Client',
                            'Serialize': 'Client', 'EdgeGeneratesXML': 'Client',
                            'ClientTransport': 'Client', 'Deserialize2': 'Client', 'EdgeDeserializesResponseXML': 'Client', 'EdgeReturnsResult': 'Client',
                            
                            'TransportProtocol': 'OSILayer7',
                            
                            'ReqEnvelope': 'SOAPMessage', 'ReqHeader': 'SOAPMessage', 'ReqBody': 'SOAPMessage',
                            
                            'TCP': 'OSILowerLayers',
                            
                            'ServerTransport': 'Server', 'Deserialize': 'Server',
                            'Validate': 'Server', 'AppServer': 'Server',
                            'EdgeExtractsXML': 'Server', 'EdgeValidatesWSDL': 'Server', 
                            'EdgeInvokesLogic': 'Server', 'EdgeGeneratesResponseXML': 'Server',
                            
                            'RespEnvelope': 'SOAPResponse', 'RespHeader': 'SOAPResponse', 'RespBody': 'SOAPResponse', 'RespFault': 'SOAPResponse'
                        };
                        const clusters = ['Client', 'OSILayer7', 'SOAPMessage', 'SOAPResponse', 'OSILowerLayers', 'Server'];
                        if (clusters.includes(id)) return id;
                        return map[id] || null;
                    };

                    const clusterId = getParentClusterId(selectedId);
                    let targetEl = null;
                    let targetIsCluster = false;

                    if (clusterId) {
                        targetEl = Array.from(svgElement.querySelectorAll('.cluster')).find(cluster => {
                            const idAttr = cluster.getAttribute('id') || '';
                            if (idAttr === clusterId || idAttr.includes('-' + clusterId + '-')) return true;
                            if (clusterId === 'Client' && cluster.textContent.includes('Client Application')) return true;
                            if (clusterId === 'OSILayer7' && cluster.textContent.includes('OSI Layer 7')) return true;
                            if (clusterId === 'SOAPMessage' && cluster.textContent.includes('SOAP Request Message')) return true;
                            if (clusterId === 'SOAPResponse' && cluster.textContent.includes('SOAP Response Message')) return true;
                            if (clusterId === 'OSILowerLayers' && cluster.textContent.includes('OSI Layers 1-4')) return true;
                            if (clusterId === 'Server' && cluster.textContent.includes('Server Provider')) return true;
                            return false;
                        });
                        if (targetEl) targetIsCluster = true;
                    }

                    if (!targetEl) {
                        targetEl = Array.from(svgElement.querySelectorAll('.node')).find(node => {
                            const idAttr = node.getAttribute('id') || '';
                            return idAttr === selectedId || idAttr.includes('-' + selectedId + '-');
                        });
                        
                        if (!targetEl) {
                            const reverseEdgeMappings = {
                                'EdgeInitiatesRequest': 'Initiates Request', 'EdgeGeneratesXML': 'Generates XML',
                                'EdgeWrapsInHTTP': 'Wraps in HTTP/SMTP', 'EdgeTransmits': 'Transmits via Port 80/443',
                                'EdgeReceivesPayload': 'Receives Payload', 'EdgeExtractsXML': 'Extracts XML',
                                'EdgeValidatesWSDL': 'Validates vs WSDL', 'EdgeInvokesLogic': 'Invokes Logic',
                                'EdgeGeneratesResponseXML': 'Generates Response XML', 'EdgeReturnsViaPort': 'Returns via Port 80/443',
                                'EdgeDeliversResponse': 'Delivers Response', 'EdgeDeserializesResponseXML': 'Deserializes Response XML',
                                'EdgeReturnsResult': 'Returns Result / Throws Fault'
                            };
                            const edgeText = reverseEdgeMappings[selectedId];
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
                            const zoomX = sizes.width / cw;
                            const zoomY = sizes.height / ch;
                            
                            // Target clusters fit cleanly (0.95 margin), while edges/nodes cap out earlier to avoid getting too close
                            let targetAbsoluteZoom = Math.min(zoomX, zoomY) * (targetIsCluster ? 0.95 : 0.8);
                            const maxAllowedZoom = targetIsCluster ? 5 : 2;
                            targetAbsoluteZoom = Math.min(targetAbsoluteZoom, maxAllowedZoom);
                            
                            const initialZoom = sizes.realZoom / panZoomInstance.getZoom();
                            let relativeZoom = targetAbsoluteZoom / initialZoom;
                            relativeZoom = Math.max(0.5, Math.min(relativeZoom, 5));
                            
                            const currentScreenCenterX = screenLeft + rectBox.width / 2;
                            const currentScreenCenterY = screenTop + rectBox.height / 2;
                            
                            const svgCenterX = (currentScreenCenterX - currentPan.x) / currentZoom;
                            const svgCenterY = (currentScreenCenterY - currentPan.y) / currentZoom;
                            
                            window._isProgrammaticZoom = true;
                            
                            const originalRelativeZoom = panZoomInstance.getZoom();
                            const originalPan = panZoomInstance.getPan();
                            
                            panZoomInstance.zoom(relativeZoom);
                            
                            const targetRealZoom = panZoomInstance.getSizes().realZoom;
                            const targetPanX = (sizes.width / 2) - (svgCenterX * targetRealZoom);
                            const targetPanY = (sizes.height / 2) - (svgCenterY * targetRealZoom);
                            
                            panZoomInstance.zoom(originalRelativeZoom);
                            panZoomInstance.pan(originalPan);
                            
                            window._isProgrammaticZoom = false;
                            
                            animateTo(relativeZoom, targetPanX, targetPanY);
                        }
                    }
                }
                
                // Remove existing highlights
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
                    return;
                }

                // 1. Check Nodes
                let targetNode = Array.from(svgElement.querySelectorAll('.node')).find(node => {
                    const idAttr = node.getAttribute('id') || '';
                    return idAttr === selectedId || idAttr.includes('-' + selectedId + '-');
                });
                
                if (targetNode) {
                    targetNode.classList.add('highlighted-svg-node');
                    return;
                }

                // 2. Check Clusters (Outer Layers)
                let targetCluster = Array.from(svgElement.querySelectorAll('.cluster')).find(cluster => {
                    const idAttr = cluster.getAttribute('id') || '';
                    if (idAttr === selectedId || idAttr.includes('-' + selectedId + '-')) return true;
                    // Fallback to label check
                    if (selectedId === 'Client' && cluster.textContent.includes('Client Application')) return true;
                    if (selectedId === 'OSILayer7' && cluster.textContent.includes('OSI Layer 7')) return true;
                    if (selectedId === 'SOAPMessage' && cluster.textContent.includes('SOAP Request Message')) return true;
                    if (selectedId === 'SOAPResponse' && cluster.textContent.includes('SOAP Response Message')) return true;
                    if (selectedId === 'OSILowerLayers' && cluster.textContent.includes('OSI Layers 1-4')) return true;
                    if (selectedId === 'Server' && cluster.textContent.includes('Server Provider')) return true;
                    return false;
                });

                if (targetCluster) {
                    targetCluster.classList.add('highlighted-svg-cluster');
                    return;
                }

                // 3. Check Edges
                const reverseEdgeMappings = {
                    'EdgeInitiatesRequest': 'Initiates Request',
                    'EdgeGeneratesXML': 'Generates XML',
                    'EdgeWrapsInHTTP': 'Wraps in HTTP/SMTP',
                    'EdgeTransmits': 'Transmits via Port 80/443',
                    'EdgeReceivesPayload': 'Receives Payload',
                    'EdgeExtractsXML': 'Extracts XML',
                    'EdgeValidatesWSDL': 'Validates vs WSDL',
                    'EdgeInvokesLogic': 'Invokes Logic',
                    'EdgeGeneratesResponseXML': 'Generates Response XML',
                    'EdgeReturnsViaPort': 'Returns via Port 80/443',
                    'EdgeDeliversResponse': 'Delivers Response',
                    'EdgeDeserializesResponseXML': 'Deserializes Response XML',
                    'EdgeReturnsResult': 'Returns Result / Throws Fault'
                };
                
                const edgeText = reverseEdgeMappings[selectedId];
                if (edgeText) {
                    let targetEdge = Array.from(svgElement.querySelectorAll('.edgeLabel')).find(label => {
                        return label.textContent.includes(edgeText);
                    });
                    if (targetEdge) {
                        targetEdge.classList.add('highlighted-svg-edge-label');
                    }
                }
            });

            // Signal that the diagram is fully rendered and interactive
            window.dispatchEvent(new CustomEvent('diagram:rendered'));
        },
    });
});
