const jwt = require('jsonwebtoken');
const createError = require('http-errors');

const verifyToken = (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return next(createError(401, 'Authentication required'));
  }

  const token = header.slice(7); // strip "Bearer "
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(createError(401, 'Invalid or expired token'));
    }
    req.user = decoded;
    next();
  });
};

module.exports = { verifyToken };
