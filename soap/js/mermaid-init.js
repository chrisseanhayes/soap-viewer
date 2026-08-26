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

            const panZoomInstance = svgPanZoom(svgElement, {
                zoomEnabled: true,
                mouseWheelZoomEnabled: false,
                controlIconsEnabled: false,
                fit: true,
                center: true,
                minZoom: 0.5,
                maxZoom: 5,
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
            const subgraphKeys = ['Client', 'OSILayer7', 'SOAPMessage', 'OSILowerLayers', 'Server'];
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
                        else if (text.includes('SOAP Message Structure')) match = 'SOAPMessage';
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
                'Generates Response XML': 'EdgeGeneratesResponseXML'
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
                
                // Remove existing highlights
                svgElement.querySelectorAll('.highlighted-svg-node').forEach(el => el.classList.remove('highlighted-svg-node'));
                svgElement.querySelectorAll('.highlighted-svg-cluster').forEach(el => el.classList.remove('highlighted-svg-cluster'));
                svgElement.querySelectorAll('.highlighted-svg-edge-label').forEach(el => el.classList.remove('highlighted-svg-edge-label'));

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
                    if (selectedId === 'SOAPMessage' && cluster.textContent.includes('SOAP Message Structure')) return true;
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
                    'EdgeGeneratesResponseXML': 'Generates Response XML'
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
        },
    });
});
