// app.js
const express = require("express");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const MemberController = require("./controllers/member.controller");
const cors = require("cors");
const memberRoutes = require("./routes/member.route");
const authRoutes = require("./routes/auth.route");
const requireAuth = require("./middlewares/auth.middleware");
const documentRoutes = require("./routes/document.route");
const paymentRoutes = require("./routes/payment.route");
const { handleRegistrationUpload } = require("./middlewares/upload.middleware");


const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: "supersecret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
  cookie: {
    httpOnly: true,
    maxAge: 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

app.post("/members/add", handleRegistrationUpload, MemberController.register);
app.use("/members", requireAuth, memberRoutes);
app.use("/auth", authRoutes);
app.use("/documents", requireAuth, documentRoutes);
app.use("/payment", paymentRoutes)

module.exports = app;