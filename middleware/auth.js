// middleware/auth.js

import jwt from 'jsonwebtoken';

// --- Configuration ---
// IMPORTANT: Use the same secret key defined in your authController.js
const JWT_SECRET = 'your_super_secret_key_for_testing'; 
// ---------------------


/**
 * Middleware 1: Verifies the JWT token from the Authorization header 
 * and attaches the decoded user payload (id, role, email) to req.user.
 */
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // 401: Unauthorized (No token provided)
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        // 403: Forbidden (Invalid or expired token)
        console.error('JWT Verification Error:', error.message);
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};


/**
 * Middleware 2: Restricts access to Admin role only (Vertical Access Control)
 * This must be called AFTER verifyToken.
 */
export const isAdmin = (req, res, next) => {
   
    if (req.user.role !== 'admin') {
        // 403: Forbidden
        return res.status(403).json({ message: "Forbidden. Admin privileges required." });
    }
    next();
};


/**
 * Middleware 3: Restricts access to Student role only
 * This must be called AFTER verifyToken.
 */
export const isStudent = (req, res, next) => {
    // Assumes verifyToken has run and populated req.user
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: "Forbidden. Student privileges required." });
    }
    next();
};