require('dotenv').config(); // Wczytuje zmienne środowiskowe z .env
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

console.log('DATABASE_URL:', process.env.DATABASE_URL);

// Konfiguracja połączenia z Supabase przez DATABASE_URL
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


// Sprawdzenie połączenia
db.connect()
  .then(() => console.log('✅ Połączono z bazą Supabase!'))
  .catch((err) => console.error('❌ Błąd połączenia z bazą:', err.message));

// Endpoint: najnowszy kurs
app.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM rozmowy LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brak danych' });
    }
    const { kurs, updated_at } = result.rows[0];
    res.json({ wartosc: kurs, data: updated_at });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Endpoint: wszystkie kursy
app.get('/rozmowy', async (req, res) => {
  try {
    const result = await db.query('SELECT data_rozmowy, godzina FROM rozmowy');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Serwer działa na porcie ${port}`);
});
