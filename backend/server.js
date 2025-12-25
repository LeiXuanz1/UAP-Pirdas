const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

/* ESP32 → SERVER  */
app.post('/api/sensor', (req, res) => {
  const {
    temperature,
    distance,
    sound,
    status,
    fan,
    buzzer,
    servo_angle
  } = req.body;

  const sql = `
    INSERT INTO logs
    (temperature, distance, sound, status, fan, buzzer, servo_angle)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [temperature, distance, sound, status, fan, buzzer, servo_angle],
    err => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Log saved' });
    }
  );
});

/* DASHBOARD → DATA LOG */
app.get('/api/data', (req, res) => {
  db.query(
    'SELECT * FROM logs ORDER BY timestamp DESC LIMIT 20',
    (err, rows) => {
      if (err) return res.status(500).send(err);
      res.json(rows.reverse());
    }
  );
});

/* DASHBOARD → KONTROL */
app.post('/api/control', (req, res) => {
  const { fan, buzzer, servo_angle, mode } = req.body;

  const sql = `
    UPDATE control SET
    fan = IFNULL(?, fan),
    buzzer = IFNULL(?, buzzer),
    servo_angle = IFNULL(?, servo_angle),
    mode = IFNULL(?, mode)
    WHERE id = 1
  `;

  db.query(sql, [fan, buzzer, servo_angle, mode], err => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Control updated' });
  });
});

/* ESP32 → AMBIL KONTROL */
app.get('/api/control', (req, res) => {
  db.query('SELECT * FROM control WHERE id = 1', (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows[0]);
  });
});

const path = require('path');

// Serve file frontend
app.use(express.static(path.join(__dirname, 'web')));

// Route utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'web/index.html'));
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
