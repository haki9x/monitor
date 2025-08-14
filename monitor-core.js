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

    // Biến lưu trữ giá trị tham chiếu khi CPU nhàn rỗi.
    // Bạn có thể cần điều chỉnh giá trị này bằng cách chạy thử nghiệm.
    // Ví dụ: khi trình duyệt không làm gì, vòng lặp này mất 2ms để chạy.
    const IDLE_TIME_MS = 2; 
    
    function getCPUPercent() {
        let startTime = performance.now();
        let numIterations = 100000000; // Số lần lặp để tạo tác vụ nặng
    
        // Chạy một vòng lặp nặng để tiêu tốn CPU
        let dummy = 0;
        for (let i = 0; i < numIterations; i++) {
            dummy += Math.sqrt(i);
        }
        
        let endTime = performance.now();
        let totalTime = endTime - startTime;
    
        // Tính toán chỉ số "tương quan CPU"
        // Giá trị này càng cao, nghĩa là luồng chính càng bận.
        // Chúng ta chuẩn hóa nó thành một giá trị từ 0 đến 100.
        let cpuCorrelatedValue = (totalTime / IDLE_TIME_MS) * 100;
        
        // Giới hạn giá trị trong khoảng 0-100 để trông giống phần trăm
        return parseFloat(Math.min(100, cpuCorrelatedValue).toFixed(2));
    }
    
    // Ví dụ về cách sử dụng:
    // setInterval(() => {
    //     const cpu = getCPUCorrelation();
    //     console.log(`CPU Correlated Value: ${cpu}%`);
    //     // Cập nhật giá trị 'cpu' này vào biểu đồ
    // }, 1000);
    return {
        getCPUPercent,
        getRAMMB,
        getNetworkKBps
    };
})();
