const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const cors = require('cors');



// ...existing code...
router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
        return res.status(400).json({ msg: "Name, email, and password are required" });
    }

    try {
        // Check if email already exists
        const emailCheck = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(409).json({ msg: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const created_at = moment().format("YYYY-MM-DD HH:mm:ss");
        const updated_at = created_at;

        const query = `
            INSERT INTO users (name, email, password, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, email, created_at
        `;
        const result = await pool.query(query, [name, email, hashedPassword, created_at, updated_at]);
        res.status(201).json({ msg: "Registration successful", user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ msg: "Error registering user", error: err.message });
    }
});
// ...existing code...

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await pool.query(query, [email]);
    const user = result.rows[0];
    if (!user) {
        return res.status(401).json({ msg: "Account not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ msg: "Invalid password" });
    }
    const token = jwt.sign({ user: {
        id: user.id,    
        name: user.name,
        email: user.email
    } }, process.env.JWT_SECRET,{expiresIn: "1h"});
    if(token){
        res.status(200).json({ token,msg:"Login successful"});
    }
    else{
        res.status(500).json({ msg: "Error generating token" });
    }
});
module.exports = router;