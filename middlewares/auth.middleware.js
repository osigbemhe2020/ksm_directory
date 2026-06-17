// middleware/requireAuth.js

const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    
    // Check if they need to change their password first
    if (req.session.user.mustChangePassword && req.path !== '/me') {
      return res.status(403).json({
        status: "failed",
        message: "You must change your password before continuing"
      });
    }
    

    next(); // ✅ logged in, let them through
  } else {
    res.status(401).json({
      status: "failed",
      message: "You must be logged in to access this"
    });
  }
};

module.exports = requireAuth;