module.exports = function(req, res, next) {
  // verifyToken middleware'den sonra çağrılır, req.user zaten orada
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
