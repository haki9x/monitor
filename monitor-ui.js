(function(){
    // ===== MonitorCore =====
    class MonitorCore {
        constructor() {
            this.data = { fps: [], ram: [] };
            this.stats = {
                fps: { current:0, max:0, min:Infinity, sum:0, avg:0 },
                ram: { current:0, max:0, min:Infinity, sum:0, avg:0 }
            };
            this.count = 0;
        }

        addSample(fps, ram) {
            this.count++;

            this.stats.fps.current = fps;
            this.stats.fps.max = Math.max(this.stats.fps.max, fps);
            this.stats.fps.min = Math.min(this.stats.fps.min, fps);
            this.stats.fps.sum += fps;
            this.stats.fps.avg = this.stats.fps.sum / this.count;

            this.stats.ram.current = ram;
            this.stats.ram.max = Math.max(this.stats.ram.max, ram);
            this.stats.ram.min = Math.min(this.stats.ram.min, ram);
            this.stats.ram.sum += ram;
            this.stats.ram.avg = this.stats.ram.sum / this.count;

            this.data.fps.push(fps);
            this.data.ram.push(ram);
        }

        getStats() { return this.stats; }
    }

    const monitor = new MonitorCore();

    // ===== Tạo container =====
    const container = document.createElement('div');
    container.id = 'monitor-container';
    Object.assign(container.style, {
        position:'absolute',
        top:'50px',
        left:'50px',
        width:'600px',
        height:'400px',
        background:'rgba(255,255,255,0.1)',
        border:'1px solid rgba(0,0,0,0.2)',
        resize:'both',
        overflow:'auto',
        padding:'10px',
        fontFamily:'Arial, sans-serif',
        fontSize:'12px'
    });
    document.body.appendChild(container);

    // Chart canvas
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    // Table
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.marginTop = '10px';
    table.style.borderCollapse = 'collapse';
    table.innerHTML = `
        <tr>
          <th>Metric</th><th>Current</th><th>Max</th><th>Min</th><th>Avg</th>
        </tr>
        <tr><td>FPS</td><td id="fps-current"></td><td id="fps-max"></td><td id="fps-min"></td><td id="fps-avg"></td></tr>
        <tr><td>RAM MB</td><td id="ram-current"></td><td id="ram-max"></td><td id="ram-min"></td><td id="ram-avg"></td></tr>
    `;
    container.appendChild(table);

    // ===== Chart.js =====
    const chart = new Chart(canvas.getContext('2d'), {
        type:'line',
        data:{
            labels:[],
            datasets:[
                { label:'FPS', data:[], borderColor:'orange', fill:false },
                { label:'RAM MB', data:[], borderColor:'blue', fill:false }
            ]
        },
        options:{
            responsive:true,
            animation:false,
            scales:{ y:{ beginAtZero:true } }
        }
    });

    // ===== Measure FPS + RAM =====
    let lastTime = performance.now();
    let frameCount = 0;

    function measure() {
        frameCount++;
        const now = performance.now();
        if(now - lastTime >= 1000){
            const fps = frameCount;
            frameCount = 0;
            lastTime = now;

            let ram = 0;
            if(performance.memory){
                ram = performance.memory.usedJSHeapSize / 1048576; // MB
            }

            monitor.addSample(fps, ram);

            // Update Chart
            const time = new Date().toLocaleTimeString();
            chart.data.labels.push(time);
            chart.data.datasets[0].data.push(fps);
            chart.data.datasets[1].data.push(ram);
            if(chart.data.labels.length > 60){
                chart.data.labels.shift();
                chart.data.datasets.forEach(ds=>ds.data.shift());
            }
            chart.update('none');

            // Update Table
            const stats = monitor.getStats();
            document.getElementById('fps-current').textContent = stats.fps.current.toFixed(0);
            document.getElementById('fps-max').textContent = stats.fps.max.toFixed(0);
            document.getElementById('fps-min').textContent = stats.fps.min.toFixed(0);
            document.getElementById('fps-avg').textContent = stats.fps.avg.toFixed(0);

            document.getElementById('ram-current').textContent = stats.ram.current.toFixed(2);
            document.getElementById('ram-max').textContent = stats.ram.max.toFixed(2);
            document.getElementById('ram-min').textContent = stats.ram.min.toFixed(2);
            document.getElementById('ram-avg').textContent = stats.ram.avg.toFixed(2);
        }
        requestAnimationFrame(measure);
    }

    measure();
})();
