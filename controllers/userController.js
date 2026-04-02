// controllers/userController.js

import { db as database } from '../db.js';

// ADMIN: Get list of all users
export const getAllUsers = async (req, res) => {
    try {
        // Exclude the password hash from the output for security
        const users = await database.all('SELECT id, name, email, role FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve users." });
    }
};


// STUDENT/ADMIN: Update own profile (Mass Assignment Target!)
export const updateProfile = async (req, res) => {
    // The ID of the user to update is taken from the authenticated token
    const userId = req.user.id; 
    
    // The data sent by the client
    const { name, email, role } = req.body; 

    if (!name && !email) {
        return res.status(400).json({ message: "Provide name or email to update." });
    }
    
    try {
        // -----------------------------------------------------
        // 🐞 MASS ASSIGNMENT VULNERABILITY (INTENTIONAL FLAW) 🐞
        // We are constructing the SQL query using ALL incoming fields, including 'role'.
        // This allows a Student to send a body like { "role": "admin" } and elevate privileges.
        let query = 'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role) WHERE id = ?';
        
        const result = await database.run(
            query, 
            [name, email, role, userId] // The incoming 'role' from req.body is used here!
        );
        // -----------------------------------------------------

        if (result.changes === 0) {
            return res.status(404).json({ message: "User not found or no changes made." });
        }
        
        const updatedUser = await database.get('SELECT id, name, email, role FROM users WHERE id = ?', [userId]);
        res.json(updatedUser);
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
             return res.status(409).json({ message: "New email already in use." });
        }
        res.status(500).json({ message: "Failed to update profile." });
    }
};

// STUDENT/ADMIN: Get the logged-in user's profile data
export const getProfile = async (req, res) => {
    // 1. Get the authenticated user's ID from the token payload (secure source)
    const userId = req.user.id; 

    try {
        // 2. Query the database using the secure user ID
        // Exclude the password hash from the output for security
        const user = await database.get(
            'SELECT id, name, email, role FROM users WHERE id = ?', 
            [userId]
        );

        if (!user) {
            // This should rarely happen if authentication succeeded
            return res.status(404).json({ message: "User not found." });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: "Failed to retrieve profile data." });
    }
};