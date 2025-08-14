// monitor-core.js
window.MonitorCore = (function() {
    let prevNetBytes = 0;
    let lastTime = performance.now();

    function getNetworkKBps() {
        const entries = performance.getEntriesByType('resource');
        let totalBytes = entries.reduce((sum, e) => sum + (e.transferSize || 0), 0);
        let kbps = (totalBytes - prevNetBytes) / 1024;
        prevNetBytes = totalBytes;
        return parseFloat(kbps.toFixed(2));
    }

    function getRAMMB() {
        if (performance.memory) {
            return parseFloat((performance.memory.usedJSHeapSize / 1048576).toFixed(2));
        }
        return 0;
    }

    function getCPUPercent() {
        let now = performance.now();
        let diff = now - lastTime;
        lastTime = now;
        // Giả lập CPU load, muốn chính xác phải dùng API ngoài trình duyệt
        return parseFloat((Math.random() * 30 + 10).toFixed(2));
    }

    return {
        getCPUPercent,
        getRAMMB,
        getNetworkKBps
    };
})();
