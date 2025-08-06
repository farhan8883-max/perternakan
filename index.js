const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
app.use(cors());

// const mysql = require('mysql');

const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_peternak'
  // database: 'buku_tamu',
});

connection.connect((err) => {
  if (err) {
    console.error('Gagal terhubung ke MySQL:', err);
    return;
  }
  console.log('Berhasil terhubung ke MySQL!');
});

connection.query('SELECT * FROM user', (err, results) => {
  if (err) throw err;
  console.log(results);
});


// const connection = mysql.createConnection({
//   host:

app.use(express.json());

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  const query = 'SELECT * FROM user WHERE id = ?';
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Kesalahan saat mengambil data pengguna:', err);
      return res.status(500).json({ error: 'Gagal mengambil data pengguna' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    res.json(results[0]);
  });
});




// Contoh endpoint GET
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Halo dari mantap!' });
});

app.get('/', (req, res) => {
  res.send('Welcome to my web the User API!');
});

// Contoh endpoint POST
app.post('/api/data', (req, res) => {
  const data = req.body;
  res.status(201).json({ received: data });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

app.get('/api/hello', (req, res) => {
  console.log('Endpoint /api/hello diakses');
  res.json({ message: 'Halo dari REST API Node.js!' });
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.post('/users', (req, res) => {
  const { username, email, Kota, password} = req.body;

  // Validasi input
  if (!username || !email || !Kota || !password) {
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  }

  // Enkripsi password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Kesalahan saat mengenkripsi password:', err);
      return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }

    const query = 'INSERT INTO users (username, email, Kota, password) VALUES (?, ?, ?, ?)';
    connection.query(query, [username, email, Kota, hashedPassword], (err, result) => {
      if (err) {
        console.error('Gagal menyimpan data pengguna:', err);
        return res.status(500).json({ error: 'Gagal menyimpan data pengguna' });
      }

      res.status(201).json({
        message: 'Pengguna berhasil ditambahkan',
        userId: result.insertId,
      });
    });
  });
});



app.delete('/users/:id', (req, res) => {
  const userId = req.params.id;

  const query = 'DELETE FROM users WHERE id = ?';
  connection.query(query, [userId], (err, result) => {
    if (err) {
      console.error('Gagal menghapus pengguna:', err);
      return res.status(500).json({ error: 'Gagal menghapus pengguna' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    res.status(200).json({ message: 'Pengguna berhasil dihapus' });
  });
});

app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  const { username, email, Kota, password } = req.body;

  // Validasi input
  if (!username || !email || !Kota || !password) {
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  }
})

app.post('/comments', (req, res) => {
  const { user_id, comment_text } = req.body;

  // Validasi input
  if (!user_id || !comment_text) {
    return res.status(400).json({ error: 'user_id dan comment_text wajib diisi' });
  }

  const query = 'INSERT INTO comments (user_id, comment_text) VALUES (?, ?)';
  connection.query(query, [user_id, comment_text], (err, result) => {
    if (err) {
      console.error('Gagal menyimpan komentar:', err);
      return res.status(500).json({ error: 'Gagal menyimpan komentar' });
    }

    res.status(201).json({
      message: 'Komentar berhasil ditambahkan',
      commentId: result.insertId,
    });
  });
});
app.get('/comments', (req, res) => {
  const query = 'SELECT * FROM comments';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Gagal mengambil komentar:', err);
      return res.status(500).json({ error: 'Gagal mengambil komentar' });
    }

    res.json(results);
  });
});