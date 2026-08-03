const express = require('express');
const router = express.Router();
const db = require('../Config/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Utility functions for database queries
const checkUserExists = (email) => {
    return new Promise((resolve, reject) => {
        const checkUserSql = 'SELECT * FROM users WHERE email = ?';
        db.query(checkUserSql, [email], (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
};
const insertUser = (userData) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)';
        db.query(sql, userData, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};
// router.get('/get-users', (req, res) => {
//     const sql = 'SELECT id, full_name, email, role FROM users'; // Fetch user details (excluding password)
//     db.query(sql, (err, results) => {
//         if (err) {
//             console.error('Error fetching users:', err);
//             return res.status(500).json({ error: 'Internal Server Error' });
//         }
//         res.status(200).json(results);
//     });
// });

router.patch('/users/:id/role', (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    const sql = 'UPDATE users SET role = ? WHERE id = ?';
    db.query(sql, [role, id], (err, result) => {
        if (err) {
            console.error('Error updating role:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'Role updated successfully!' });
        } else {
            res.status(404).json({ success: false, message: 'User not found!' });
        }
    });
});
router.patch('/users/:id', (req, res) => {
    const { id } = req.params;
    console.log(id);
    
    const { full_name, password } = req.body;
    // Hash the new password if it is provided
    let hashedPassword = password;
    if (password) {
        const bcrypt = require("bcrypt");
        hashedPassword = bcrypt.hashSync(password, 10);
    }

    const sql = 'UPDATE users SET full_name = ?, password = ? WHERE id = ?';
    db.query(sql, [full_name, hashedPassword, id], (err, result) => {
        if (err) {
            console.error('Error updating user details:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'User updated successfully!' });
        } else {
            res.status(404).json({ success: false, message: 'User not found!' });
        }
    });
});


router.get('/user/:userid', (req, res) => {
    const { userid } = req.params;  // Match the correct parameter name
    
    const sql = 'SELECT * FROM users WHERE id = ?'; // Fetch user details (excluding password)
    db.query(sql, [userid], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });  // If user is not found
        }
        
        res.status(200).json(results[0]);  // Return only the first result (assuming id is unique)
    });
});

// LOGIN ROUTE
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check for empty fields
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    const checkUserSql = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserSql, [email], async (err, data) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: 'No user found with this email.' });
        }

        const user = data[0];

        // Verify password
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, fullName:user.full_name },
            JWT_SECRET,
            { expiresIn: '5h' } // Token expires in 5 hours
        );

        return res.json({ message: 'Login successful', token });
    });
});

// SIGNUP ROUTE
router.post('/signup', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const role = "user";
        

        if (!fullName || !email || !password) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUsers = await checkUserExists(email);

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: "User already exists with this email." });
        }

        // Insert new user
        const userData = [email, hashedPassword, fullName, role];
        const result = await insertUser(userData);

        res.status(201).json({ id: result.insertId, fullName, email });
    } catch (err) {
        console.error("Error during signup:", err);

        if (err.code === "ER_DUP_ENTRY") {
            // Handle unique constraint violation
            return res.status(400).json({ error: "Email already in use." });
        }

        // Catch-all for server errors
        res.status(500).json({ error: "Internal Server Error. Please try again later." });
    }
});

router.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM users WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'User deleted successfully!' });
        } else {
            res.status(404).json({ success: false, message: 'User not found!' });
        }
    });
});

module.exports = router;
