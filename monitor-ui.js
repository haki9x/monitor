(function () {
    const style = document.createElement("style");
    style.textContent = `
        .monitor-container {
            position: fixed;
            top: 100px;
            left: 100px;
            background: #111;
            color: white;
            border-radius: 10px;
            box-shadow: 0 0 15px rgba(0,0,0,0.5);
            z-index: 99999;
            min-width: 300px;
            min-height: 200px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .monitor-header {
            cursor: grab;
            padding: 5px 10px;
            background: #222;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
            flex-shrink: 0;
        }
        .monitor-header:active {
            cursor: grabbing;
        }
        .monitor-header button {
            background: #444;
            border: none;
            color: white;
            padding: 2px 6px;
            cursor: pointer;
            border-radius: 4px;
        }
        .monitor-body {
            resize: both;
            overflow: auto;
            padding: 5px;
            flex-grow: 1;
        }
    `;
    document.head.appendChild(style);

    const container = document.createElement("div");
    container.className = "monitor-container";
    container.innerHTML = `
        <div class="monitor-header">
            <span>Monitor (Gom chung)</span>
            <div>
                <button id="monitor-mode">Mode</button>
                <button id="monitor-close">×</button>
            </div>
        </div>
        <div class="monitor-body">
            <canvas id="monitor-chart" style="width:100%; height:300px;"></canvas>
        </div>
    `;
    document.body.appendChild(container);

    // Drag chỉ ở header
    (function makeDraggable(el, handle) {
        let offsetX = 0, offsetY = 0, isDown = false;

        handle.addEventListener('mousedown', function (e) {
            if (e.target.tagName === "BUTTON") return; // tránh drag khi bấm nút
            isDown = true;
            offsetX = e.clientX - el.offsetLeft;
            offsetY = e.clientY - el.offsetTop;
            document.addEventListener('mousemove', mouseMove);
            document.addEventListener('mouseup', mouseUp);
            e.preventDefault(); // chặn resize khi drag
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

    // Close
    container.querySelector("#monitor-close").addEventListener("click", () => {
        container.remove();
    });

    // Mode switch
    container.querySelector("#monitor-mode").addEventListener("click", () => {
        alert("Switch mode chưa implement");
    });

    // Chart.js
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

        // Lấy dữ liệu từ MonitorCore
        setInterval(() => {
            const now = new Date().toLocaleTimeString();
            if (data.labels.length > 20) {
                data.labels.shift();
                data.datasets.forEach(ds => ds.data.shift());
            }
            data.labels.push(now);
            data.datasets[0].data.push(window.MonitorCore.getCPUPercent());
            data.datasets[1].data.push(window.MonitorCore.getRAMMB());
            data.datasets[2].data.push(window.MonitorCore.getNetworkKBps());
            chart.update();
        }, 1000);
    }
})();
