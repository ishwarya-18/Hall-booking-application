import jwt from 'jsonwebtoken';
export const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('Token verification failed:', err.message); // Log specific error
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = decoded; // Attach decoded token to the request
    next();
  });
};

