const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Połączenie z Supabase (PostgreSQL)
const db = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false, // WAŻNE dla Supabase!
  },
});

db.connect()
  .then(() => console.log('✅ Połączono z bazą danych Supabase!'))
  .catch((err) => console.error('❌ Błąd połączenia z bazą danych:', err.message));

// Endpoint: /kurs (najświeższy kurs)
app.get('/kurs', async (req, res) => {
  try {
    const result = await db.query('SELECT kurs, updated_at FROM kurs ORDER BY updated_at DESC LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brak danych' });
    }
    const { kurs, updated_at } = result.rows[0];
    res.json({ wartosc: kurs, data: updated_at });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: /kursy – wszystkie kursy
app.get('/kursy', async (req, res) => {
  try {
    const result = await db.query('SELECT kurs AS wartosc, updated_at AS data FROM kurs ORDER BY updated_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 API działa na porcie ${port}`);
});
