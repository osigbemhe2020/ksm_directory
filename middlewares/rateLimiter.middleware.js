const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: {
    status: "failed",
    message: "Too many requests, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = limiter;
