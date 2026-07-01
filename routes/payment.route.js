const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/payment.controller");
//const requireAuth = require("../middlewares/auth.middleware");

router.post("/donate", PaymentController.initializeDonatePayment);
router.get("/verify-donation", PaymentController.verifyDonatePayment);
//router.post("/dues", requireAuth, PaymentController.Dues);




module.exports = router;
