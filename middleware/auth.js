const jwt = require('jsonwebtoken');


// Middleware untuk verifikasi token
// Middleware untuk verifikasi JWT
// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) return res.status(401).json({ error: 'Token tidak ditemukan' });

//   jwt.verify(token, SECRET_KEY, (err, user) => {
//     if (err) return res.status(403).json({ error: 'Token tidak valid' });
//     req.user = user;
//     next();
//   });
// }

// // Endpoint untuk ambil profil user yang login
// app.get('/profile', authenticateToken, (req, res) => {
//   const userId = req.user.id;
//   connection.query('SELECT username, email, akses FROM user WHERE id = ?', [userId], (err, results) => {
//     if (err) return res.status(500).json({ error: 'Gagal mengambil profil' });
//     if (results.length === 0) return res.status(404).json({ error: 'User tidak ditemukan' });
//     res.json(results[0]);
//   });
// });


// const authenticateToken = require('./middleware/auth');

// app.get('/dashboard', authenticateToken, (req, res) => {
//   res.json({ message: 'Selamat datang di dashboard', user: req.user });
// });

// app.get('/profile', verifyToken, (req, res) => {
//   const query = 'SELECT id, username, email, hp, akses FROM user WHERE id = ?';
//   connection.query(query, [req.user.id], (err, results) => {
//     if (err) {
//       console.error('Gagal mengambil data user:', err);
//       return res.status(500).json({ error: 'Gagal mengambil data user' });
//     }
//     if (results.length === 0) {
//       return res.status(404).json({ error: 'User tidak ditemukan' });
//     }
//     res.json(results[0]);
//   });
// });

// Middleware verifikasi token JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // format: Bearer token

  if (!token) return res.status(401).json({ error: 'Token tidak ditemukan' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token tidak valid' });
    req.user = decoded; // simpan data user dari token
    next();
  });
}

// Middleware cek role
function checkRole(role) {
  return (req, res, next) => {
    if (req.user.akses !== role) {
      return res.status(403).json({ error: 'Akses ditolak' });
    }
    next();
  };
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token tidak ditemukan' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token tidak valid' });
    req.user = user; // simpan payload JWT
    next();
  });
}

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/ternak', upload.single('foto'), (req, res) => {
  console.log(req.file); // data file foto
  console.log(req.body); // data lainnya
});

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token tidak ada atau format salah' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // simpan data user di request
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token tidak valid' });
  }
}

app.use('/uploads', express.static('uploads'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




module.exports = authenticateToken;