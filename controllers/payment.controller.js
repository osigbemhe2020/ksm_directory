const logger = require("../logger");

const initializeDonatePayment = async (req, res) => {
    try {
        const { name, amount, email } = req.body;
        
        // Validate required fields
        if (!name || !amount || !email) {
            return res.status(400).json({ message: "Name, amount, and email are required" });
        }
        
        // Paystack API expects amount in kobo (1 kobo = 1/100 of a naira)
        const amountInKobo = Math.round(amount * 100);
        
        const response = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email, // Use the provided email
                amount: amountInKobo,
                callback_url: "http://localhost:3000/verify-payment",
                metadata: {
                    donor_name: name
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            logger.error({ errorData }, "Paystack initialization error");
            return res.status(response.status).json(errorData);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        logger.error({ err: error }, "Payment initialization error");
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

const verifyDonatePayment = async (req, res) => {
    try {
        const { reference } = req.query;
        
        if (!reference) {
            return res.status(400).json({ message: "Reference is required" });
        }
        
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            logger.error({ errorData }, "Paystack verification error");
            return res.status(response.status).json(errorData);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        logger.error({ err: error }, "Payment verification error");
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

module.exports = { initializeDonatePayment, verifyDonatePayment };