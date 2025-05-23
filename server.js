const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Połączenie z bazą danych za pomocą zmiennych środowiskowych
const db = mysql.createConnection({
  host: process.env.DB_HOST,     // np. 'aws.connect.psdb.io' (PlanetScale)
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('Błąd połączenia z MySQL:', err.message);
    return;
  }
  console.log('Połączono z MySQL');
});

// Endpoint: /kurs (najświeższy kurs)
app.get('/kurs', (req, res) => {
  db.query('SELECT kurs, updated_at FROM kurs ORDER BY updated_at DESC LIMIT 1', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Brak danych' });

    const { kurs, updated_at } = results[0];
    res.json({ wartosc: kurs, data: updated_at });
  });
});

// Endpoint: /kursy – wszystkie kursy
app.get('/kursy', (req, res) => {
  db.query('SELECT kurs AS wartosc, updated_at AS data FROM kurs ORDER BY updated_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`API działa na porcie ${port}`);
});
