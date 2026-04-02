// controllers/authController.js

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db as database } from '../db.js';

// --- Configuration ---
// Note: This secret should ideally be loaded from a .env file outside of controllers/middleware
const JWT_SECRET = 'your_super_secret_key_for_testing'; 
// ---------------------


// POST /api/auth/register
export const register = async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Defaulting to 'student' role
        const result = await database.run(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', 
            [name, email, hashedPassword, 'student']
        );

        res.status(201).json({ id: result.lastID, name, email, role: 'student' });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(409).json({ message: "User with this email already exists." });
        }
        console.error('Registration error:', error);
        res.status(500).json({ message: "Error during registration." });
    }
};


// POST /api/auth/login
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await database.get('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const payload = {
            id: user.id,
            role: user.role,
            email: user.email 
        };

        // Generate and sign the token
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); 
        
        res.json({ message: "Login successful.", token });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Server error during login." });
    }
};