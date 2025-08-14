(function () {
    // ===== CSS =====
    const style = document.createElement("style");
    style.textContent = `
        .monitor-container {
            position: fixed;
            top: 100px;
            left: 100px;
            background: rgba(17,17,17,0.8);
            color: white;
            border-radius: 10px;
            box-shadow: 0 0 15px rgba(0,0,0,0.5);
            z-index: 99999;
            min-width: 450px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .monitor-header {
            cursor: grab;
            padding: 5px 10px;
            background: rgba(34,34,34,0.85);
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
            flex-shrink: 0;
        }
        .monitor-header:active { cursor: grabbing; }
        .monitor-header button {
            background: rgba(68,68,68,0.85);
            border: none;
            color: white;
            padding: 2px 6px;
            cursor: pointer;
            border-radius: 4px;
            margin-left: 3px;
        }
        .monitor-body {
            resize: both;
            overflow: auto;
            padding: 5px;
            flex-grow: 1;
        }
        .monitor-summary {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 12px;
        }
        .monitor-summary th, .monitor-summary td {
            border: 1px solid rgba(255,255,255,0.2);
            padding: 3px 5px;
            text-align: right;
        }
        .monitor-summary th {
            background: rgba(255,255,255,0.1);
            text-align: center;
        }
    `;
    document.head.appendChild(style);

    // ===== HTML =====
    const container = document.createElement("div");
    container.className = "monitor-container";
    container.innerHTML = `
        <div class="monitor-header">
            <span>FSS Monitor</span>
            <div>
                <button id="monitor-reset">Reset</button>
                <button id="monitor-close">×</button>
            </div>
        </div>
        <div class="monitor-body">
            <canvas id="monitor-chart" style="width:100%; height:200px;"></canvas>
            <table class="monitor-summary">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Current</th>
                        <th>Max</th>
                        <th>Min</th>
                        <th>Avg</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>CPU %</td><td id="cpu-cur">0</td><td id="cpu-max">0</td><td id="cpu-min">0</td><td id="cpu-avg">0</td></tr>
                    <tr><td>RAM MB</td><td id="ram-cur">0</td><td id="ram-max">0</td><td id="ram-min">0</td><td id="ram-avg">0</td></tr>
                    <tr><td>Net KB/s</td><td id="net-cur">0</td><td id="net-max">0</td><td id="net-min">0</td><td id="net-avg">0</td></tr>
                </tbody>
            </table>
        </div>
    `;
    document.body.appendChild(container);

    // ===== Drag chỉ ở header =====
    (function makeDraggable(el, handle) {
        let offsetX = 0, offsetY = 0, isDown = false;
        handle.addEventListener('mousedown', function (e) {
            if (e.target.tagName === "BUTTON") return;
            isDown = true;
            offsetX = e.clientX - el.offsetLeft;
            offsetY = e.clientY - el.offsetTop;
            document.addEventListener('mousemove', mouseMove);
            document.addEventListener('mouseup', mouseUp);
            e.preventDefault();
        });
        function mouseMove(e) {
            if (!isDown) return;
            el.style.left = `${e.clientX - offsetX}px`;
            el.style.top = `${e.clientY - offsetY}px`;
        }
        function mouseUp() {
            isDown = false;
            document.removeEventListener('mousemove', mouseMove);
            document.removeEventListener('mouseup', mouseUp);
        }
    })(container, container.querySelector(".monitor-header"));

    // ===== Close & Reset =====
    container.querySelector("#monitor-close").addEventListener("click", () => container.remove());
    const resetStats = () => {
        stats.cpu = [];
        stats.ram = [];
        stats.net = [];
    };
    container.querySelector("#monitor-reset").addEventListener("click", resetStats);

    // ===== Core functions =====
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

    // ===== Stats storage =====
    const stats = {
        cpu: [],
        ram: [],
        net: []
    };
    function updateStats(metric, value) {
        stats[metric].push(value);
        const arr = stats[metric];
        const max = Math.max(...arr);
        const min = Math.min(...arr);
        const avg = (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
        document.getElementById(`${metric}-cur`).textContent = value;
        document.getElementById(`${metric}-max`).textContent = max;
        document.getElementById(`${metric}-min`).textContent = min;
        document.getElementById(`${metric}-avg`).textContent = avg;
    }

    // ===== Chart.js load =====
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    script.onload = initChart;
    document.head.appendChild(script);

    function initChart() {
        const ctx = document.getElementById('monitor-chart').getContext('2d');
        const data = {
            labels: [],
            datasets: [
                { label: 'CPU (%)', borderColor: 'red', backgroundColor: 'rgba(255,0,0,0.1)', data: [], yAxisID: 'y' },
                { label: 'RAM (MB)', borderColor: 'green', backgroundColor: 'rgba(0,255,0,0.1)', data: [], yAxisID: 'y1' },
                { label: 'Net KB/s', borderColor: 'blue', backgroundColor: 'rgba(0,0,255,0.1)', data: [], yAxisID: 'y2' }
            ]
        };

        const chart = new Chart(ctx, {
            type: 'line',
            data,
            options: {
                responsive: true,
                interaction: { mode: 'index', intersect: false },
                stacked: false,
                plugins: { legend: { labels: { color: 'white' } } },
                scales: {
                    x: { ticks: { color: 'white' } },
                    y: { type: 'linear', position: 'left', ticks: { color: 'red' }, title: { display: true, text: 'CPU %', color: 'red' } },
                    y1: { type: 'linear', position: 'right', ticks: { color: 'green' }, grid: { drawOnChartArea: false }, title: { display: true, text: 'RAM MB', color: 'green' } },
                    y2: { type: 'linear', position: 'right', ticks: { color: 'blue' }, grid: { drawOnChartArea: false }, title: { display: true, text: 'KB/s', color: 'blue' } }
                }
            }
        });

        // ===== Update loop =====
        setInterval(() => {
            const now = new Date().toLocaleTimeString();
            const cpu = getCPUPercent();
            const ram = getRAMMB();
            const net = getNetworkKBps();

            // Chart history 60 điểm
            if (data.labels.length > 60) {
                data.labels.shift();
                data.datasets.forEach(ds => ds.data.shift());
            }
            data.labels.push(now);
            data.datasets[0].data.push(cpu);
            data.datasets[1].data.push(ram);
            data.datasets[2].data.push(net);
            chart.update();

            // Stats
            updateStats("cpu", cpu);
            updateStats("ram", ram);
            updateStats("net", net);
        }, 1000);

        // ===== Auto reset stats mỗi 1 giờ =====
        setInterval(resetStats, 3600 * 1000);
    }
})();
