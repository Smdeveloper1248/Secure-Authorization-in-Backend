// index.js

import express from 'express';
import { initializeDatabase } from './db.js'; 
// No need for jwt, bcrypt, or direct database access here!

// Import route files
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import userRoutes from './routes/userRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';


const app = express();
const port = 3000;

// --- Body Parsers (MUST stay here) ---
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// ------------------------------------


// --- 🚀 ROUTE REGISTRATION ---

// Base path: /api/auth (Login/Register)
app.use('/api/auth', authRoutes);

// Base path: /api/courses
app.use('/api/courses', courseRoutes);

// Base path: /api/users
app.use('/api/users', userRoutes);

// Base path: /api/enrollments
app.use('/api/enrollments', enrollmentRoutes);


// --- Base Route (Health Check) ---
app.get('/', (req, res) => {
    res.send('Student Portal API is running. Final structure achieved!');
});


// --- SERVER STARTUP (Initialize DB first) ---
const startServer = async () => {
    try {
        await initializeDatabase();

        app.listen(port, () => {
            console.log(`🚀 Server running at http://localhost:${port}`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
    }
};

startServer();