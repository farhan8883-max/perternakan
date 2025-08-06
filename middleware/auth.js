const jwt = require('jsonwebtoken');


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token tidak valid' });
    req.user = user;
    next();
  });
}

const authenticateToken = require('./middleware/auth');

app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Selamat datang di dashboard', user: req.user });
});

module.exports = authenticateToken;