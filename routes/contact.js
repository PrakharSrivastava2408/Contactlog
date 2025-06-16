const express = require("express");
const router = express.Router();
const pool = require("../db");
const moment = require("moment");
const authenticate = require("../middleware/tokenverfication");

// GET all contacts
router.get("/", authenticate, (req, res) => {
    pool.query("SELECT * FROM contacts", (err, result) => {
        if (err) {
            return res.status(500).json({ msg: "Error fetching contacts" }); // ✅ return here
        }
        res.status(200).json(result.rows);
    });
});

// POST new contact
router.post("/", authenticate, async (req, res) => {
    try {
        const user_id = req.user.name;
        const { name, email, phone } = req.body;
        const created_at = moment().format("YYYY-MM-DD HH:mm:ss");
        const updated_at = created_at;
        
        const query = `
            INSERT INTO contacts (name, email, phone, created_at, updated_at, created_by,updated_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const result = await pool.query(query, [name, email, phone, created_at, updated_at, user_id, user_id]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ msg: "Error adding contact" ,error:err.message});
    }
});

router.get("/:id", authenticate, async (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT * FROM contacts
        WHERE id = $1 AND created_by = $2
    `;
    try {
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: "Contact not found" });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ msg: "Error fetching contact" ,error:err.message});
    }
});

router.put("/:id", authenticate, async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.name;
    const { name, email, phone } = req.body;
    const updated_at = moment().format("YYYY-MM-DD HH:mm:ss");

    const query = `
        UPDATE contacts
        SET name = $1, email = $2, phone = $3, updated_at = $4, updated_by = $5
        WHERE id = $6
        RETURNING *
    `;

    try {
        const result = await pool.query(query, [name, email, phone, updated_at, user_id, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ msg: "Contact not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("Error updating contact:", err);
        res.status(500).json({ msg: "Error updating contact" });
    }
});


router.delete("/:id", authenticate, async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.name;
    const query = `
        DELETE FROM contacts
        WHERE id = $1
        RETURNING *
    `;

    try {
        const result = await pool.query(query, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ msg: "Contact not found" });
        }
        res.status(200).json({ msg: "Contact deleted successfully" });
    } catch (err) {
        console.error("Error deleting contact:", err);
        res.status(500).json({ msg: "Error deleting contact" });
    }
});

module.exports = router;
