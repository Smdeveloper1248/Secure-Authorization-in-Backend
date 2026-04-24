// routes/userRoutes.js

import express from 'express';
import { getAllUsers, updateProfile,getProfile,deleteUserById } from '../controllers/userController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Profile management (Current User)
router.get('/me', verifyToken, getProfile);

// Vertical access control Vulnerability here
router.put('/me', verifyToken, updateProfile);  // Mass Assignment Target

// Admin management (All Users)
router.get('/', verifyToken, isAdmin, getAllUsers);
router.delete('/:id', verifyToken, isAdmin, deleteUserById);


export default router;