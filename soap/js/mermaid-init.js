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
        },
    });
});
