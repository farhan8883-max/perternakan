const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;  
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
app.use(cors());
const SECRET_KEY = process.env.SECRET_KEY || 'rahasia_saya';

// app.js atau file utama server Anda



// const mysql = require('mysql');

const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_peternak'

});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // folder penyimpanan
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // nama unik
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // batas 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    if (extName && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error('Hanya gambar yang diperbolehkan'));
    }
  }
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

app.get('/user', (req, res) => {
  connection.query('SELECT * FROM user', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Gagal mengambil data pengguna' });
    }
    res.json(results);
  });
});

app.use(cors());
app.use(express.json());
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

app.post('/user', (req, res) => {
  const { username, password, email, hp, akses } = req.body;

  // Validasi input
  if (!username || !password || !email || !hp || !akses) {
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  }

  // Enkripsi password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Kesalahan saat mengenkripsi password:', err);
      return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }

    const query = 'INSERT INTO user (username, password, email, hp, akses) VALUES (?, ?, ?, ?, ?)';
    connection.query(query, [username, hashedPassword, email, hp, akses], (err, result) => {
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


app.delete('/user/:id', (req, res) => {
  const userId = req.params.id;

  const query = 'DELETE FROM user WHERE id = ?';
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

app.put('/user/:id', (req, res) => {
  const userId = req.params.id;
  const { username, password, email, hp, akses } = req.body;

  if (!username || !password || !email || !hp || !akses) {
    return res.status(400).json({ error: 'Username, password, dan email wajib diisi' });
  }

  let query = 'UPDATE user SET username = ?, password = ?, email = ? , hp = ? , akses = ?';
  const params = [username, password, email, hp, akses];

  if (password) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    query += ', password = ?';
    params.push(hashedPassword);
  }

  query += ' WHERE id = ?';
  params.push(userId);

  connection.query(query, params, (err, result) => {
    if (err) {
      console.error('Gagal memperbarui data pengguna:', err);
      return res.status(500).json({ error: 'Gagal memperbarui data pengguna' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    res.status(200).json({ message: 'Data pengguna berhasil diperbarui' });
  });
});


// http://localhost:3000/api/hello
// get token jwt random jwt

// ======================= CRUD TABEL TERNAK =======================

// GET semua data ternak
app.get('/ternak', (req, res) => {
  connection.query('SELECT * FROM ternak', (err, results) => {
    if (err) {
      console.error('Gagal mengambil data ternak:', err);
      return res.status(500).json({ error: 'Gagal mengambil data ternak' });
    }
    res.json(results);
  });
});

// GET data ternak berdasarkan ID
app.get('/ternak', (req, res) => {
  const query = `
    SELECT t.*, u.username, u.email, u.hp
    FROM ternak t
    JOIN user u ON t.id_peternak = u.id
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Gagal mengambil data ternak:', err);
      return res.status(500).json({ error: 'Gagal mengambil data ternak' });
    }
    res.json(results);
  });
});


// POST data ternak baru
app.post('/ternak', upload.single('foto'), (req, res) => {
  const { nama_peternak, id_peternak, tanggal_kejadian, jenis_laporan, jumlah_ternak, lokasi_kejadian, keterangan } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: 'Foto wajib diunggah' });
  }

  const fotoPath = `/uploads/${req.file.filename}`;

  connection.query('SELECT * FROM user WHERE id = ?', [id_peternak], (err, results) => {
    if (err) return res.status(500).json({ error: 'Kesalahan server' });
    if (results.length === 0) return res.status(404).json({ error: 'Peternak tidak ditemukan' });

    const query = `
      INSERT INTO ternak (nama_peternak, id_peternak, tanggal_kejadian, jenis_laporan, jumlah_ternak, lokasi_kejadian, keterangan, foto)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    connection.query(query, [nama_peternak, id_peternak, tanggal_kejadian, jenis_laporan, jumlah_ternak, lokasi_kejadian, keterangan, fotoPath], (err, result) => {
      if (err) return res.status(500).json({ error: 'Gagal menambahkan data ternak' });
      res.status(201).json({ message: 'Data ternak berhasil ditambahkan', id: result.insertId, foto: fotoPath });
    });
  });
});


// PUT update data ternak
app.put('/ternak/:id', (req, res) => {
  const { id } = req.params;
  const { nama_peternak, id_peternak, tanggal_kejadian, jenis_laporan, jumlah_ternak, lokasi_kejadian, keterangan, foto } = req.body;

  const query = `
    UPDATE ternak
    SET nama_peternak=?, id_peternak=?, tanggal_kejadian=?, jenis_laporan=?, jumlah_ternak=?, lokasi_kejadian=?, keterangan=?, foto=?
    WHERE id=?
  `;
  connection.query(query, [nama_peternak, id_peternak, tanggal_kejadian, jenis_laporan, jumlah_ternak, lokasi_kejadian, keterangan, foto, id], (err, result) => {
    if (err) {
      console.error('Gagal mengupdate data ternak:', err);
      return res.status(500).json({ error: 'Gagal mengupdate data ternak' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data ternak tidak ditemukan' });
    }
    res.json({ message: 'Data ternak berhasil diperbarui' });
  });
});

// DELETE data ternak
app.delete('/ternak/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM ternak WHERE id=?', [id], (err, result) => {
    if (err) {
      console.error('Gagal menghapus data ternak:', err);
      return res.status(500).json({ error: 'Gagal menghapus data ternak' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data ternak tidak ditemukan' });
    }
    res.json({ message: 'Data ternak berhasil dihapus' });
  });
});

// 

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  connection.query('SELECT * FROM user WHERE username = ?', [username], (err, results) => {
    if (err) return res.status(500).json({ error: 'Kesalahan server' });
    if (results.length === 0) return res.status(401).json({ error: 'User tidak ditemukan' });

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Kesalahan server' });
      if (!isMatch) return res.status(401).json({ error: 'Password salah' });

      // Buat token
      const token = jwt.sign(
        { id: user.id, username: user.username, akses: user.akses },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      res.json({ token });
    });
  });
});

// GET ternak berdasarkan id_peternak (user yang login)
app.get('/ternak/user/:id_peternak', (req, res) => {
  const id_peternak = req.params.id_peternak;
  const query = `
    SELECT t.*, u.username, u.email, u.hp
    FROM ternak t
    JOIN user u ON t.id_peternak = u.id
    WHERE t.id_peternak = ?
  `;
  connection.query(query, [id_peternak], (err, results) => {
    if (err) {
      console.error('Gagal mengambil data ternak:', err);
      return res.status(500).json({ error: 'Gagal mengambil data ternak' });
    }
    res.json(results);
  });
});


// =================== CRUD CHECKLIST ===================

// CREATE (POST)
// Ambil semua checklist + data ternak
// =================== CRUD CHECKLIST ===================

// GET semua checklist + data ternak
app.get('/checklist', (req, res) => {
  const sql = `
    SELECT checklist.*, ternak.nama_peternak, ternak.jumlah_ternak, ternak.lokasi_kejadian
    FROM checklist
    JOIN ternak ON checklist.id_ternak = ternak.id
  `;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Gagal mengambil data checklist:', err);
      return res.status(500).json({ error: 'Gagal mengambil data checklist' });
    }
    res.json(results);
  });
});

// GET checklist berdasarkan ID
app.get('/checklist/:id', (req, res) => {
  const sql = `
    SELECT checklist.*, ternak.nama_peternak, ternak.jumlah_ternak, ternak.lokasi_kejadian
    FROM checklist
    JOIN ternak ON checklist.id_ternak = ternak.id
    WHERE checklist.id = ?
  `;
  connection.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error('Gagal mengambil data checklist:', err);
      return res.status(500).json({ error: 'Gagal mengambil data checklist' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Checklist tidak ditemukan' });
    }
    res.json(result[0]);
  });
});

// POST tambah checklist baru
app.post('/checklist', upload.single('foto'), (req, res) => {
  const data = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'Foto wajib diunggah' });
  }

  const fotoPath = `/uploads/${req.file.filename}`;

  const sql = `
    INSERT INTO checklist 
    (id_ternak, nama_petugas, id_petugas, id_laporan, check_lokasi, check_sesuai_jumlah, check_ada_foto, check_lengkap, status, catatan_petugas, foto) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  connection.query(sql, [
    data.id_ternak, data.nama_petugas, data.id_petugas, data.id_laporan,
    data.check_lokasi, data.check_sesuai_jumlah, data.check_ada_foto, data.check_lengkap,
    data.status, data.catatan_petugas, fotoPath
  ], (err, result) => {
    if (err) return res.status(500).json({ error: 'Gagal menambahkan checklist' });
    res.status(201).json({ message: 'Checklist berhasil dibuat', id: result.insertId, foto: fotoPath });
  });
});


// PUT update checklist
app.put('/checklist/:id', (req, res) => {
  const data = req.body;
  const sql = `
    UPDATE checklist SET 
    id_ternak=?, nama_petugas=?, id_petugas=?, id_laporan=?, check_lokasi=?, 
    check_sesuai_jumlah=?, check_ada_foto=?, check_lengkap=?, status=?, 
    catatan_petugas=?, foto=? WHERE id=?
  `;
  connection.query(sql, [
    data.id_ternak, data.nama_petugas, data.id_petugas, data.id_laporan,
    data.check_lokasi, data.check_sesuai_jumlah, data.check_ada_foto, data.check_lengkap,
    data.status, data.catatan_petugas, data.foto, req.params.id
  ], (err, result) => {
    if (err) {
      console.error('Gagal mengupdate checklist:', err);
      return res.status(500).json({ error: 'Gagal mengupdate checklist' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Checklist tidak ditemukan' });
    }
    res.json({ message: 'Checklist berhasil diperbarui' });
  });
});

// DELETE hapus checklist
app.delete('/checklist/:id', (req, res) => {
  const sql = `DELETE FROM checklist WHERE id=?`;
  connection.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error('Gagal menghapus checklist:', err);
      return res.status(500).json({ error: 'Gagal menghapus checklist' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Checklist tidak ditemukan' });
    }
    res.json({ message: 'Checklist berhasil dihapus' });
  });
});

// GET checklist berdasarkan id_ternak
app.get('/checklist/ternak/:id_ternak', (req, res) => {
  const sql = `
    SELECT checklist.*, ternak.nama_peternak, ternak.jumlah_ternak, ternak.lokasi_kejadian
    FROM checklist
    JOIN ternak ON checklist.id_ternak = ternak.id
    WHERE checklist.id_ternak = ?
  `;
  connection.query(sql, [req.params.id_ternak], (err, results) => {
    if (err) {
      console.error('Gagal mengambil data checklist:', err);
      return res.status(500).json({ error: 'Gagal mengambil data checklist' });
    }
    res.json(results);
  });
});



app.listen(3000, () => console.log('Server running on port 3000'));
