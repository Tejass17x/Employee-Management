const authenticate = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const role = req.headers['x-user-role'];

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No user session found.' });
  }

  req.user = {
    userId: parseInt(userId, 10),
    role: role || 'Employee'
  };
  
  next();
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      return res.status(403).json({ success: false, message: 'Forbidden: Access denied.' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
