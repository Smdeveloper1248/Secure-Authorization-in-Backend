// routes/userRoutes.js

import express from 'express';
import { getAllUsers, updateProfile,getProfile } from '../controllers/userController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// READ ALL USERS: Admin Only (Vertical Privilege Escalation Target)
router.get('/', verifyToken, isAdmin, getAllUsers); 

router.get('/me', verifyToken, getProfile);

// UPDATE PROFILE: Mass Assignment Target!
router.put('/me', verifyToken, updateProfile);
// ⭐ NEW ROUTE: GET /api/users/me (Read own profile)




export default router;