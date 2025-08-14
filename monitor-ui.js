// monitor-ui.js
import { MonitorCore } from './monitor-core.js';
import Chart from 'chart.js/auto';

const monitor = new MonitorCore();

// Tạo container drag & resize
const container = document.createElement('div');
container.style.position = 'absolute';
container.style.top = '50px';
container.style.left = '50px';
container.style.width = '600px';
container.style.height = '400px';
container.style.background = 'rgba(255,255,255,0.1)';
container.style.border = '1px solid rgba(0,0,0,0.2)';
container.style.resize = 'both';
container.style.overflow = 'auto';
container.style.padding = '10px';
document.body.appendChild(container);

// Chart canvas
const canvas = document.createElement('canvas');
container.appendChild(canvas);

const chart = new Chart(canvas, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      { label: 'CPU %', data: [], borderColor: 'red', fill: false },
      { label: 'RAM MB', data: [], borderColor: 'blue', fill: false },
      { label: 'Network KB/s', data: [], borderColor: 'green', fill: false },
    ],
  },
  options: {
    responsive: true,
    animation: false,
  },
});

// Table thống kê
const table = document.createElement('table');
table.style.width = '100%';
table.style.marginTop = '10px';
table.innerHTML = `
<tr>
  <th>Metric</th><th>Current</th><th>Max</th><th>Min</th><th>Avg</th>
</tr>
<tr><td>CPU %</td><td id="cpu-current"></td><td id="cpu-max"></td><td id="cpu-min"></td><td id="cpu-avg"></td></tr>
<tr><td>RAM MB</td><td id="ram-current"></td><td id="ram-max"></td><td id="ram-min"></td><td id="ram-avg"></td></tr>
<tr><td>KB/s</td><td id="network-current"></td><td id="network-max"></td><td id="network-min"></td><td id="network-avg"></td></tr>
`;
container.appendChild(table);

// Simulate dữ liệu real-time
function randomSample() {
  return {
    cpu: Math.random() * 100,
    ram: 2000 + Math.random() * 2000,
    network: Math.random() * 1000,
  };
}

function updateUI() {
  const sample = randomSample();
  monitor.addSample(sample.cpu, sample.ram, sample.network);

  // Update chart
  const time = new Date().toLocaleTimeString();
  chart.data.labels.push(time);
  chart.data.datasets[0].data.push(sample.cpu);
  chart.data.datasets[1].data.push(sample.ram);
  chart.data.datasets[2].data.push(sample.network);

  if (chart.data.labels.length > 60) { // chỉ giữ 60 điểm mới nhất
    chart.data.labels.shift();
    chart.data.datasets.forEach(ds => ds.data.shift());
  }
  chart.update('none');

  // Update table
  const stats = monitor.getStats();
  document.getElementById('cpu-current').textContent = stats.cpu.current.toFixed(1);
  document.getElementById('cpu-max').textContent = stats.cpu.max.toFixed(1);
  document.getElementById('cpu-min').textContent = stats.cpu.min.toFixed(1);
  document.getElementById('cpu-avg').textContent = stats.cpu.avg.toFixed(1);

  document.getElementById('ram-current').textContent = stats.ram.current.toFixed(0);
  document.getElementById('ram-max').textContent = stats.ram.max.toFixed(0);
  document.getElementById('ram-min').textContent = stats.ram.min.toFixed(0);
  document.getElementById('ram-avg').textContent = stats.ram.avg.toFixed(0);

  document.getElementById('network-current').textContent = stats.network.current.toFixed(0);
  document.getElementById('network-max').textContent = stats.network.max.toFixed(0);
  document.getElementById('network-min').textContent = stats.network.min.toFixed(0);
  document.getElementById('network-avg').textContent = stats.network.avg.toFixed(0);
}

setInterval(updateUI, 1000);
