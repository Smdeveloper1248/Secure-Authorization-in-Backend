// controllers/userController.js

import { db as database } from '../db.js';
// import { updateProfileDTO } from '../dto/user.dto.js';

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


// STUDENT/ADMIN: Update own profile (Highly Vulnerable Version)
export const updateProfile = async (req, res) => {
    const userId = req.user.id;

    // Mass Assignment Fix, Preventing Vertical Access Control

    // const updates = updateProfileDTO(req.body);

    const updates = req.body;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No data provided to update." });
    }

    try {
       
        const fields = Object.keys(updates)
            .map(field => `${field} = ?`)
            .join(', ');

        const values = Object.values(updates);

        const query = `UPDATE users SET ${fields} WHERE id = ?`;

        const result = await database.run(query, [...values, userId]);
        // -----------------------------------------------------

        if (result.changes === 0) {
            return res.status(404).json({ message: "User not found or no changes made." });
        }

        const updatedUser = await database.get(
            'SELECT id, name, email, role FROM users WHERE id = ?', 
            [userId]
        );

        res.json(updatedUser);
    } catch (error) {
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

export const deleteUserById = async (req, res) => {
    // Extract id from the URL parameters (e.g., /users/:id)
    const { id } = req.params;

    try {
        // Execute the delete query
        const result = await database.run('DELETE FROM users WHERE id = ?', [id]);

        // check if any row was actually deleted
        if (result.changes === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ message: "User deleted successfully." });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: "Failed to delete user." });
    }
};