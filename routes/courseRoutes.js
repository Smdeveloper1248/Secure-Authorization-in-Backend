// routes/courseRoutes.js

import express from 'express';
import { createCourse, updateCourse, deleteCourse, getCourses } from '../controllers/courseController.js';
import { verifyToken, isAdmin, isStudent } from '../middleware/auth.js';

const router = express.Router();

// READ ALL: Accessible by Admin & Student (Vertical Access Control Test)
// CREATE: Admin Only (Vertical Privilege Escalation Target)
router.route('/')
    .get(verifyToken, getCourses) 
    .post(verifyToken, isAdmin, createCourse); 

// UPDATE/DELETE: Admin Only
router.route('/:id')
    .put(verifyToken, isAdmin, updateCourse)
    .delete(verifyToken, isAdmin, deleteCourse); 

export default router;