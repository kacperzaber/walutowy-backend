if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // 👈 do obsługi JSON w request.body

// Logowanie środowiska
console.log('🧪 process.env:', process.env);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
if (!process.env.DATABASE_URL) {
  console.error('❌ Brak DATABASE_URL! Upewnij się, że zmienna jest ustawiona w Render');
}

// Połączenie z bazą
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

db.connect()
  .then(() => console.log('✅ Połączono z bazą Supabase!'))
  .catch((err) => console.error('❌ Błąd połączenia z bazą:', err.message));

// Endpointy

// GET /
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

// GET /rozmowy
app.get('/rozmowy', async (req, res) => {
  try {
    const result = await db.query('SELECT data_rozmowy, godzina FROM rozmowy');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST /rozmowy – dodaje nową rozmowę
app.post('/rozmowy', async (req, res) => {
  const { data_rozmowy, godzina } = req.body;

  if (!data_rozmowy || !godzina) {
    return res.status(400).json({ error: 'Brakuje danych: data_rozmowy lub godzina' });
  }

  try {
    await db.query(
      'INSERT INTO rozmowy (data_rozmowy, godzina) VALUES ($1, $2)',
      [data_rozmowy, godzina]
    );
    res.status(201).json({ message: 'Rozmowa dodana pomyślnie' });
  } catch (err) {
    console.error('❌ Błąd podczas dodawania rozmowy:', err.message);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Start serwera
app.listen(port, () => {
  console.log(`🚀 Serwer działa na porcie ${port}`);
});
