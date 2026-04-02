// controllers/enrollmentController.js

import { db as database } from '../db.js';

// ADMIN: Get ALL enrollment records
export const getAllEnrollments = async (req, res) => {
    try {
        // This query fetches enrollment data along with student and course names
        const enrollments = await database.all(`
            SELECT 
                e.id, 
                e.grade, 
                u.name AS student_name, 
                u.id AS student_id,
                c.code AS course_code,
                c.name AS course_name
            FROM enrollments e
            JOIN users u ON e.student_id = u.id
            JOIN courses c ON e.course_id = c.id
        `);
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve all enrollments." });
    }
};

// STUDENT/ADMIN: Get a SINGLE enrollment record (IDOR Target!)
// This route is the main IDOR target. The flaw is below!
export const getEnrollmentById = async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
        // 1. Fetch the enrollment record
        const enrollment = await database.get(`
            SELECT 
                e.*, 
                u.name AS student_name,
                c.code AS course_code,
                c.name AS course_name
            FROM enrollments e
            JOIN users u ON e.student_id = u.id
            JOIN courses c ON e.course_id = c.id
            WHERE e.id = ?
        `, [id]);

        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment record not found." });
        }

        // -----------------------------------------------------
        // 🐞 IDOR VULNERABILITY (INTENTIONAL FLAW) 🐞
        // We only check if the user is a student, but we DO NOT check 
        // if the student_id on the record matches the logged-in user's ID (req.user.id).
        // If the user is an admin, they are allowed.
        if (req.user.role === 'student' && enrollment.student_id !== req.user.id) {
            // This is the CRITICAL missing check!
            // We should put the check here, but we will omit it for the bug!
            // CORRECT CHECK WOULD BE: if (req.user.role === 'student' && enrollment.student_id !== req.user.id) { return res.status(403) }
            // For now, we will leave the door open for a student to check ANY enrollment ID.
        }
        // -----------------------------------------------------

        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve enrollment record." });
    }
};

// ADMIN: Update a grade (example of a high-privilege action)
export const updateGrade = async (req, res) => {
    const id = parseInt(req.params.id);
    const { grade } = req.body;

    if (grade === undefined) {
        return res.status(400).json({ message: "Grade value is required." });
    }

    try {
        const result = await database.run(
            'UPDATE enrollments SET grade = ? WHERE id = ?', 
            [grade, id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ message: "Enrollment record not found." });
        }
        res.json({ message: "Grade updated successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to update grade." });
    }
};


// STUDENT: Get all of the logged-in student's enrollment records
export const getMyEnrollments = async (req, res) => {
    // 1. Get the authenticated user's ID from the token payload
    const studentId = req.user.id; 

    try {
        // 2. Query the database, filtering by the logged-in student_id
        const enrollments = await database.all(`
            SELECT 
                e.id AS enrollment_id, 
                e.grade, 
                c.code AS course_code,
                c.name AS course_name,
                c.id AS course_id
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE e.student_id = ? 
        `, [studentId]);

        if (enrollments.length === 0) {
            return res.status(404).json({ message: "You are not currently enrolled in any courses." });
        }

        res.json(enrollments);
    } catch (error) {
        console.error('Error fetching my enrollments:', error);
        res.status(500).json({ message: "Failed to retrieve enrollment records." });
    }
};


// STUDENT: Enroll in a new course
export const enrollStudent = async (req, res) => {
    const studentId = req.user.id; // Get the user ID from the authenticated token
    const { course_id } = req.body;

    if (!course_id) {
        return res.status(400).json({ message: "Course ID is required for enrollment." });
    }

    try {
        // 1. Verify the course exists
        const course = await database.get('SELECT * FROM courses WHERE id = ?', [course_id]);
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }

        // 2. Attempt to insert the enrollment record
        const result = await database.run(
            'INSERT INTO enrollments (student_id, course_id, grade) VALUES (?, ?, NULL)', 
            [studentId, course_id]
        );

        res.status(201).json({ 
            message: "Enrollment successful.", 
            enrollment_id: result.lastID, 
            student_id: studentId,
            course_name: course.name
        });

    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(409).json({ message: "You are already enrolled in this course." });
        }
        console.error('Enrollment error:', error);
        res.status(500).json({ message: "Failed to process enrollment." });
    }
};
