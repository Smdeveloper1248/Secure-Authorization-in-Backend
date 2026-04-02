// db.js

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt'; // <-- New import for password hashing

// Specify the path to your database file
const dbPath = './student_portal.sqlite'; 

let db;

/**
 * Initializes and connects to the SQLite database.
 * Creates tables and seeds initial users if the database is new.
 */
async function initializeDatabase() {
  try {
    // 1. Open the database connection
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log(`🗄️ Connected to database: ${dbPath}`);

    // 2. Create tables
    await createTables(db);
    
    // 3. Seed initial data (Admin and Student)
    await seedInitialData(db);

    return db;
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  }
}


/**
 * Defines the database schema (3 tables).
 */
async function createTables(dbInstance) {
    // 1. users table: Holds login and role info
    await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student' -- 'admin' or 'student'
        )
    `);

    // 2. courses table: Holds course catalog
    await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL
        )
    `);

    // 3. enrollments table: Links students and courses (crucial for IDOR testing)
    await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS enrollments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            grade REAL, -- NULL until graded, or REAL for a score
            FOREIGN KEY (student_id) REFERENCES users(id),
            FOREIGN KEY (course_id) REFERENCES courses(id),
            UNIQUE (student_id, course_id) -- A student can only enroll once per course
        )
    `);
    console.log('✅ All tables (users, courses, enrollments) ensured/created.');
}


/**
 * Seeds the database with an Admin and a Student for testing.
 */
async function seedInitialData(dbInstance) {
    const count = await dbInstance.get('SELECT COUNT(*) as count FROM users');
    
    // Only seed if the users table is empty
    if (count.count === 0) {
        console.log('✨ Seeding initial users and data...');
        
        const saltRounds = 10;
        
        // --- 1. Create Admin User ---
        const adminPasswordHash = await bcrypt.hash('adminpass', saltRounds);
        await dbInstance.run(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', 
            ['System Admin', 'admin@vu.edu', adminPasswordHash, 'admin']
        );
        const adminUser = await dbInstance.get('SELECT * FROM users WHERE role = ?', ['admin']);
        console.log(`   - Admin User Created (ID: ${adminUser.id})`);

        // --- 2. Create Sample Student User ---
        const studentPasswordHash = await bcrypt.hash('studentpass', saltRounds);
        await dbInstance.run(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', 
            ['Alex Student', 'alex@vu.edu', studentPasswordHash, 'student']
        );
        const alexUser = await dbInstance.get('SELECT * FROM users WHERE email = ?', ['alex@vu.edu']);
        console.log(`   - Student User Created (ID: ${alexUser.id})`);

        // --- 3. Create Sample Courses ---
        await dbInstance.run('INSERT INTO courses (code, name) VALUES (?, ?)', ['CS101', 'Intro to Computing']);
        await dbInstance.run('INSERT INTO courses (code, name) VALUES (?, ?)', ['SE301', 'Software Engineering']);
        const cs101 = await dbInstance.get('SELECT * FROM courses WHERE code = ?', ['CS101']);
        const se301 = await dbInstance.get('SELECT * FROM courses WHERE code = ?', ['SE301']);
        console.log(`   - Courses Created (CS101 ID: ${cs101.id}, SE301 ID: ${se301.id})`);

        // --- 4. Create Sample Enrollment (Target for IDOR) ---
        // Alex is enrolled in CS101 with a grade
        await dbInstance.run(
            'INSERT INTO enrollments (student_id, course_id, grade) VALUES (?, ?, ?)', 
            [alexUser.id, cs101.id, 85.5]
        );
        console.log('   - Alex enrolled in CS101.');
    }
}


// Export the initializer and the db object
export { initializeDatabase, db };