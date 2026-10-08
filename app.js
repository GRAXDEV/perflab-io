document.addEventListener('DOMContentLoaded', () => {
    const btnUnoptimized = document.getElementById('btnUnoptimized');
    const btnOptimized = document.getElementById('btnOptimized');
    const iterationsSelect = document.getElementById('iterations');
    const exeTimeDisplay = document.getElementById('exeTime');
    const uiStateDisplay = document.getElementById('uiState');
    const metricLoad = document.getElementById('metricLoad');
    const metricDOM = document.getElementById('metricDOM');
    const metricMemory = document.getElementById('metricMemory');
    const canvas = document.getElementById('performanceGraph');
    const performanceHistory = [];
    let isProcessorActive = false;

    function processDataChunk(index) { return Math.sqrt(Math.sin(index) * Math.cos(index)); }

    function runSynchronousProcessor(total) {
        if (isProcessorActive) return;
        isProcessorActive = true; updateUIState(true); toggleControls(true);
        const startTime = performance.now();
        for (let i = 0; i < total; i++) { processDataChunk(i); }
        const endTime = performance.now(); finalizeExecution(startTime, endTime, 'Sync');
    }

    function runAsynchronousProcessor(total) {
        if (isProcessorActive) return;
        isProcessorActive = true; updateUIState(true); toggleControls(true);
        const startTime = performance.now(); let currentIteration = 0; const chunkSize = 15000;
        function scheduleNextBatch() {
            const batchLimit = Math.min(currentIteration + chunkSize, total);
            for (let i = currentIteration; i < batchLimit; i++) { processDataChunk(i); }
            currentIteration = batchLimit;
            if (currentIteration < total) { setTimeout(scheduleNextBatch, 0); }
            else { const endTime = performance.now(); finalizeExecution(startTime, endTime, 'Async'); }
        }
        scheduleNextBatch();
    }

    function toggleControls(isDisabled) {
        if (btnUnoptimized) btnUnoptimized.disabled = isDisabled;
        if (btnOptimized) btnOptimized.disabled = isDisabled;
        if (iterationsSelect) iterationsSelect.disabled = isDisabled;
        [btnUnoptimized, btnOptimized, iterationsSelect].forEach(c => { if (c) c.style.opacity = isDisabled ? '0.5' : '1'; });
    }

    function updateUIState(isRunning) {
        if (isRunning) { uiStateDisplay.textContent = "⚠️ BLOCKED"; uiStateDisplay.className = "value status-running"; }
        else { uiStateDisplay.textContent = "⚡ Responsive"; uiStateDisplay.className = "value status-idle"; }
    }

    function finalizeExecution(start, end, label) {
        const delta = parseFloat((end - start).toFixed(2)); exeTimeDisplay.textContent = `${delta}ms`; updateUIState(false);
        performanceHistory.push({ label, value: delta }); if (performanceHistory.length > 8) performanceHistory.shift();
        drawPerformanceGraph(); isProcessorActive = false; toggleControls(false);
    }

    function drawPerformanceGraph() {
        if (!canvas) return; const ctx = canvas.getContext('2d'); const width = canvas.width; const height = canvas.height;
        ctx.clearRect(0, 0, width, height);
        if (performanceHistory.length === 0) {
            ctx.fillStyle = '#4b5563'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('Execute tests to map charts.', width / 2, height / 2); return;
        }
        const padding = 30; const chartWidth = width - (padding * 2); const chartHeight = height - (padding * 2);
        const maxVal = Math.max(...performanceHistory.map(d => d.value), 10);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'; ctx.lineWidth = 1;
        for (let i = 0; i <= 3; i++) { const y = padding + (chartHeight / 3) * i; ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(width - padding, y); ctx.stroke(); }
        const points = performanceHistory.map((d, idx) => {
            const x = padding + (idx / (Math.max(performanceHistory.length - 1, 1))) * chartWidth;
            const y = (height - padding) - (d.value / maxVal) * chartHeight; return { x, y, ...d };
        });
        ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2; ctx.beginPath();
        points.forEach((pt, idx) => { if (idx === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y); }); ctx.stroke();
        points.forEach((pt) => {
            ctx.fillStyle = pt.label === 'Sync' ? '#ef4444' : '#10b981'; ctx.beginPath(); ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#9ca3af'; ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.fillText(`${pt.value}ms`, pt.x, pt.y - 10);
            ctx.fillStyle = '#4b5563'; ctx.fillText(pt.label, pt.x, height - 10);
        });
    }

    function updateTelemetryDashboard() {
        if (metricDOM) metricDOM.textContent = document.getElementsByTagName('*').length;
        if (metricMemory && performance.memory) { metricMemory.textContent = `${(performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1)} MB`; }
        else if (metricMemory) { metricMemory.textContent = 'N/A'; }
        const calculateLoadTiming = () => {
            setTimeout(() => {
                const [entry] = performance.getEntriesByType('navigation');
                if (entry && entry.duration > 0) metricLoad.textContent = `${entry.duration.toFixed(0)}ms`;
                else metricLoad.textContent = `${performance.now().toFixed(0)}ms`;
            }, 100);
        };
        if (document.readyState === 'complete') calculateLoadTiming(); else window.addEventListener('load', calculateLoadTiming, { once: true });
    }

    if (btnUnoptimized && btnOptimized) {
        btnUnoptimized.addEventListener('click', () => { setTimeout(() => runSynchronousProcessor(parseInt(iterationsSelect.value, 10)), 50); }, { passive: true });
        btnOptimized.addEventListener('click', () => { runAsynchronousProcessor(parseInt(iterationsSelect.value, 10)); }, { passive: true });
    }
    updateTelemetryDashboard(); drawPerformanceGraph();
});
