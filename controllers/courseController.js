// controllers/courseController.js

import { db as database } from '../db.js';

// ADMIN: Create a new course
export const createCourse = async (req, res) => {
    const { code, name } = req.body;
    if (!code || !name) {
        return res.status(400).json({ message: "Course code and name are required." });
    }

    try {
        const result = await database.run(
            'INSERT INTO courses (code, name) VALUES (?, ?)', 
            [code, name]
        );
        res.status(201).json({ id: result.lastID, code, name });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(409).json({ message: "Course code already exists." });
        }
        res.status(500).json({ message: "Failed to create course." });
    }
};

// ADMIN: Update a course
export const updateCourse = async (req, res) => {
    const id = parseInt(req.params.id);
    const { code, name } = req.body;

    if (!code && !name) {
        return res.status(400).json({ message: "Provide code or name to update." });
    }

    try {
        const result = await database.run(
            'UPDATE courses SET code = COALESCE(?, code), name = COALESCE(?, name) WHERE id = ?', 
            [code, name, id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ message: "Course not found or no changes made." });
        }

        const updatedCourse = await database.get('SELECT * FROM courses WHERE id = ?', [id]);
        res.json(updatedCourse);
    } catch (error) {
        res.status(500).json({ message: "Failed to update course." });
    }
};

// ADMIN: Delete a course
export const deleteCourse = async (req, res) => {
    const id = parseInt(req.params.id);
    
    try {
        const result = await database.run('DELETE FROM courses WHERE id = ?', [id]);

        if (result.changes === 0) {
            return res.status(404).json({ message: "Course not found." });
        }
        // 204 No Content for successful deletion
        res.status(204).send(); 
    } catch (error) {
        res.status(500).json({ message: "Failed to delete course." });
    }
};

// PUBLIC: Get all courses (Read All, accessible by Admin and Student)
export const getCourses = async (req, res) => {
    try {
        const courses = await database.all('SELECT * FROM courses');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve courses." });
    }
};