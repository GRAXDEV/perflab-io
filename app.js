/**
 * PerfLab.io Engine Architecture
 * Showcases performance telemetry, synchronous vs asynchronous task scheduling loops,
 * lightweight canvas-based data rendering profiles, and concurrency protection.
 */

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements References
    const btnUnoptimized = document.getElementById('btnUnoptimized');
    const btnOptimized = document.getElementById('btnOptimized');
    const iterationsSelect = document.getElementById('iterations');
    const exeTimeDisplay = document.getElementById('exeTime');
    const uiStateDisplay = document.getElementById('uiState');
    
    // Dashboard Tracking Metrics Elements
    const metricLoad = document.getElementById('metricLoad');
    const metricDOM = document.getElementById('metricDOM');
    const metricMemory = document.getElementById('metricMemory');
    const canvas = document.getElementById('performanceGraph');

    // Array to store performance event point history
    const performanceHistory = [];
    
    // Concurrency Lock Variable: Prevents multiple race conditions during analysis loops
    let isProcessorActive = false;

    /**
     * Heavy mathematical computing workload loop simulation
     */
    function processDataChunk(index) {
        return Math.sqrt(Math.sin(index) * Math.cos(index));
    }

    /**
     * Unoptimized Pattern: Blocks the main UI loop execution thread entirely
     */
    function runSynchronousProcessor(total) {
        if (isProcessorActive) return; // Guard clause: Prevent duplicate execution loops
        
        isProcessorActive = true;
        updateUIState(true);
        toggleControls(true);

        const startTime = performance.now();

        // Blocking process path execution sequence
        for (let i = 0; i < total; i++) {
            processDataChunk(i);
        }

        const endTime = performance.now();
        finalizeExecution(startTime, endTime, 'Sync');
    }

    /**
     * Optimized Pattern: Splits structural load into asynchronous micro-task batch windows
     */
    function runAsynchronousProcessor(total) {
        if (isProcessorActive) return; // Guard clause: Prevent duplicate execution loops
        
        isProcessorActive = true;
        updateUIState(true);
        toggleControls(true);

        const startTime = performance.now();
        let currentIteration = 0;
        const chunkSize = 15000; // Safe execution frame threshold size

        function scheduleNextBatch() {
            const batchLimit = Math.min(currentIteration + chunkSize, total);
            
            for (let i = currentIteration; i < batchLimit; i++) {
                processDataChunk(i);
            }

            currentIteration = batchLimit;

            if (currentIteration < total) {
                // Return main engine path thread context control to browser frame loop window
                setTimeout(scheduleNextBatch, 0);
            } else {
                const endTime = performance.now();
                finalizeExecution(startTime, endTime, 'Async');
            }
        }

        scheduleNextBatch();
    }

    // Controls Interactivity Guard
    function toggleControls(isDisabled) {
        if (btnUnoptimized) btnUnoptimized.disabled = isDisabled;
        if (btnOptimized) btnOptimized.disabled = isDisabled;
        if (iterationsSelect) iterationsSelect.disabled = isDisabled;
        
        // Add visual transparency indicators to show interface element lockouts
        const controls = [btnUnoptimized, btnOptimized, iterationsSelect];
        controls.forEach(control => {
            if (control) control.style.opacity = isDisabled ? '0.5' : '1';
        });
    }

    // Status Engine UI Modifiers
    function updateUIState(isRunning) {
        if (isRunning) {
            uiStateDisplay.textContent = "⚠️ BLOCKED";
            uiStateDisplay.className = "value status-running";
        } else {
            uiStateDisplay.textContent = "⚡ Responsive";
            uiStateDisplay.className = "value status-idle";
        }
    }

    function finalizeExecution(start, end, label) {
        const delta = parseFloat((end - start).toFixed(2));
        exeTimeDisplay.textContent = `${delta}ms`;
        updateUIState(false);
        
        // Push coordinate logs into the data visualization queue array matrix
        performanceHistory.push({ label, value: delta });
        if (performanceHistory.length > 8) performanceHistory.shift(); // Keep matrix window capped at 8 logs
        
        drawPerformanceGraph();
        
        // Release structural lock to accept subsequent profiling attempts safely
        isProcessorActive = false;
        toggleControls(false);
    }

    /**
     * Custom Vanilla HTML5 Canvas Core Graph Engine
     */
    function drawPerformanceGraph() {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Wipe view boundary frames clean
        ctx.clearRect(0, 0, width, height);
        
        if (performanceHistory.length === 0) {
            // Draw empty canvas graph placeholder text elements
            ctx.fillStyle = '#4b5563';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Execute tests above to map performance profile curves.', width / 2, height / 2);
            return;
        }

        const padding = 30;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);
        
        // Pin dynamic scaling limits across history loops configurations
        const maxVal = Math.max(...performanceHistory.map(d => d.value), 10);
        
        // Render cross-axis matrix background guide paths lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 3; i++) {
            const y = padding + (chartHeight / 3) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Project plot values coordinates tracking coordinates arrays mapping conversions
        const points = performanceHistory.map((d, index) => {
            const x = padding + (index / (Math.max(performanceHistory.length - 1, 1))) * chartWidth;
            const y = (height - padding) - (d.value / maxVal) * chartHeight;
            return { x, y, ...d };
        });

        // Form trend line connector path geometries strings sequences — Updated to Emerald Mint
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.beginPath();
        points.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();

        // Pin localized performance status dots tracking shapes markers
        points.forEach((pt) => {
            ctx.fillStyle = pt.label === 'Sync' ? '#ef4444' : '#10b981'; // Red for blocking, emerald for async
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
            ctx.fill();

            // Append performance dynamic data metric numerical value text arrays
            ctx.fillStyle = '#9ca3af';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${pt.value}ms`, pt.x, pt.y - 10);
            
            // Label axis nodes at bottom of chart boundary fields
            ctx.fillStyle = '#4b5563';
            ctx.fillText(pt.label, pt.x, height - 10);
        });
    }

    // Native Performance Monitoring Pipeline Modules APIs Handlers
    function updateTelemetryDashboard() {
        // 1. FIXED: Extract precise total node complexity dynamically after paint frames render
        if (metricDOM) {
            metricDOM.textContent = document.getElementsByTagName('*').length;
        }

        // 2. Safely capture system memory profiles if exposed by the engine container
        if (metricMemory && performance.memory) {
            const memoryUsageMB = (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1);
            metricMemory.textContent = `${memoryUsageMB} MB`;
        } else if (metricMemory) {
            metricMemory.textContent = 'N/A';
        }

        // 3. FIXED: Delayed callback window isolates exact browser compilation speeds safely
        const calculateLoadTiming = () => {
            setTimeout(() => {
                const [navigationEntry] = performance.getEntriesByType('navigation');
                if (navigationEntry && navigationEntry.duration > 0) {
                    metricLoad.textContent = `${navigationEntry.duration.toFixed(0)}ms`;
                } else {
                    const currentUptime = performance.now();
                    metricLoad.textContent = `${currentUptime.toFixed(0)}ms`;
                }
            }, 200); // 200ms tick window protects metrics parsing loops from race condition stalls
        };

        if (document.readyState === 'complete') {
            calculateLoadTiming();
        } else {
            window.addEventListener('load', calculateLoadTiming, { once: true });
        }
    }

    // Wire up listeners using modern passive settings configuration specifications profiles
    if (btnUnoptimized && btnOptimized) {
        btnUnoptimized.addEventListener('click', () => {
            const count = parseInt(iterationsSelect.value, 10);
            setTimeout(() => runSynchronousProcessor(count), 50);
        }, { passive: true });

        btnOptimized.addEventListener('click', () => {
            const count = parseInt(iterationsSelect.value, 10);
            runAsynchronousProcessor(count);
        }, { passive: true });
    }

    // Trigger Initial Lifecycle Dashboard Renders Updates Loops
    updateTelemetryDashboard();
    drawPerformanceGraph();
});
