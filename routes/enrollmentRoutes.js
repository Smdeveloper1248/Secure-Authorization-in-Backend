// routes/enrollmentRoutes.js

import express from 'express';
import { getAllEnrollments,getMyEnrollments, getEnrollmentById, updateGrade,enrollStudent} from '../controllers/enrollmentController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// READ ALL: Admin Only
router.get('/', verifyToken, isAdmin, getAllEnrollments);

// 2. STUDENT/ADMIN: Enroll in a new course
router.post('/enroll', verifyToken, enrollStudent);


// GET /api/enrollments/me (Read own enrollments)
router.get('/me', verifyToken, getMyEnrollments); // ⭐

// READ SINGLE (IDOR Target!)
// UPDATE GRADE (Admin Only)
router.route('/:id')
    .get(verifyToken, getEnrollmentById) // 🐞 IDOR FLAW: Missing horizontal check in controller
    .put(verifyToken, isAdmin, updateGrade);

export default router;

