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

    // Các biến này cần được khai báo ở phạm vi ngoài hàm, 
    // ví dụ: ở đầu file monitor-core.js hoặc monitor-ui.js
    let lastTime = performance.now();
    let time = 0;
    let baseValue = 25; // Giá trị CPU cơ bản khi nhàn rỗi
    let amplitude = 15; // Biên độ dao động
    
    function getCPUPercent() {
        let now = performance.now();
        let deltaTime = (now - lastTime) / 1000; // Thời gian đã trôi qua (đơn vị: giây)
        lastTime = now;
    
        // Tăng biến 'time' để tạo hiệu ứng dao động
        time += deltaTime;
    
        // Dùng hàm sin để tạo một giá trị dao động mượt mà
        // Cộng thêm một chút ngẫu nhiên để trông tự nhiên hơn
        let simulatedValue = baseValue + amplitude * Math.sin(time / 2) + Math.random() * 5;
    
        // Giả lập thỉnh thoảng có spike (tăng đột biến)
        if (Math.random() < 0.05) { // 5% khả năng xảy ra spike
            simulatedValue += Math.random() * 40;
        }
    
        // Đảm bảo giá trị không vượt quá 100 và không âm
        return parseFloat(Math.min(100, Math.max(0, simulatedValue)).toFixed(2));
    }
    return {
        getCPUPercent,
        getRAMMB,
        getNetworkKBps
    };
})();
