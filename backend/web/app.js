const SERVER_URL = 'http://localhost:3000';

let tempData = [];
let distData = [];
let labels = [];
let soundData = [];

// Grafik Suhu
const tempChart = new Chart(document.getElementById('tempChart'), {
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'Suhu (°C)',
      data: tempData,
      borderWidth: 2
    }]
  }
});

// Grafik Ultrasonic
const distChart = new Chart(document.getElementById('distChart'), {
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'Jarak (cm)',
      data: distData,
      borderWidth: 2
    }]
  }
});

// Grafik Sound
const soundChart = new Chart(document.getElementById('soundChart'), {
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'Deteksi Suara',
      data: soundData,
      stepped: true,   // ⬅️ penting (event-based)
      borderWidth: 2
    }]
  },
  options: {
    scales: {
      y: {
        min: 0,
        max: 1,
        ticks: {
          stepSize: 1,
          callback: v => v === 1 ? 'DETEKSI' : 'NORMAL'
        }
      }
    }
  }
});


function fetchData() {
  fetch(`${SERVER_URL}/api/data`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) return;

      labels.length = 0;
      tempData.length = 0;
      distData.length = 0;
      soundData.length = 0;

      const table = document.getElementById('logTable');
      table.innerHTML = '';

      data.forEach(d => {
        labels.push(d.time);
        tempData.push(d.temperature);
        distData.push(d.distance);
        soundData.push(d.sound ? 1 : 0);

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${d.time}</td>
          <td>${d.temperature}</td>
          <td>${d.distance}</td>
          <td>${d.sound ? 'Ya' : 'Tidak'}</td>
          <td>${d.status}</td>
        `;
        table.prepend(tr);
      });

      const last = data[data.length - 1];
      document.getElementById('temp').innerText = last.temperature + ' °C';
      document.getElementById('fan').innerText = last.fan ? 'ON' : 'OFF';

      const hama = document.getElementById('hama');
      if (last.status === 'deteksi_hama') {
        hama.innerText = 'TERDETEKSI';
        hama.className = 'alert';
      } else {
        hama.innerText = 'NORMAL';
        hama.className = 'normal';
      }

      tempChart.update();
      distChart.update();
      soundChart.update();
    });
}

// ====== KONTROL ======
function sendControl(payload) {
  fetch(`${SERVER_URL}/api/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

function setFan(val) {
  sendControl({ fan: val });
}

function setBuzzer(val) {
  sendControl({ buzzer: val });
}

function setServo(angle) {
  sendControl({ servo_angle: angle });
}

// Refresh tiap 2 detik
setInterval(fetchData, 2000);

function showPage(id) {
  document.querySelectorAll('.page')
    .forEach(p => p.classList.remove('active'));

  document.getElementById(id).classList.add('active');
}
