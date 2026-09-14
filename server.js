// ===============================================
// DINEEASE RESTAURANT RESERVATION SYSTEM
// Express Server & REST API using database.js functions
// ===============================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const dbOps = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
    const time = new Date().toLocaleTimeString();
    console.log(`📡 [${time}] ${req.method} ${req.url}`);
    next();
});

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// ===============================================
// API ROUTES (Using database.js functions)
// ===============================================

// 1. GET /api/tables - List 20 tables with live availability for given date/time
app.get('/api/tables', (req, res) => {
    try {
        const { date, time } = req.query;
        const tables = dbOps.getAvailableTables(date, time);

        res.json({
            success: true,
            count: tables.length,
            tables
        });
    } catch (error) {
        console.error('Error fetching tables:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. GET /api/reservations - Get reservations (all or filtered)
app.get('/api/reservations', (req, res) => {
    try {
        const { email, date, status } = req.query;
        const reservations = dbOps.getReservations({ email, date, status });

        res.json({
            success: true,
            count: reservations.length,
            reservations
        });
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. POST /api/reservations - Create a new reservation
app.post('/api/reservations', (req, res) => {
    try {
        const { name, email, phone, date, time, guests, table_number, special_requests } = req.body;

        const reservation = dbOps.createReservation({
            name,
            email,
            phone,
            date,
            time,
            guests,
            table_number,
            special_requests
        });

        res.status(201).json({
            success: true,
            message: 'Reservation confirmed successfully!',
            reservation
        });
    } catch (error) {
        console.error('Error creating reservation:', error);
        if (error.code === 'CONFLICT') {
            return res.status(409).json({ success: false, error: error.message });
        }
        res.status(400).json({ success: false, error: error.message });
    }
});

// 4. DELETE /api/reservations/:id - Cancel a reservation
app.delete('/api/reservations/:id', (req, res) => {
    try {
        const id = req.params.id;
        const cancelled = dbOps.cancelReservation(id);

        if (!cancelled) {
            return res.status(404).json({ success: false, error: 'Reservation not found.' });
        }

        res.json({
            success: true,
            message: `Reservation #${id} for ${cancelled.customer_name} has been cancelled.`,
            reservation: cancelled
        });
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. PATCH /api/reservations/:id/status - Update reservation status (Admin)
app.patch('/api/reservations/:id/status', (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;

        const updated = dbOps.updateReservationStatus(id, status);

        if (!updated) {
            return res.status(404).json({ success: false, error: 'Reservation not found.' });
        }

        res.json({
            success: true,
            message: `Reservation #${id} status updated to ${status}.`,
            reservation: updated
        });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

// 6. POST /api/login - Authenticate user or admin
app.post('/api/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide email and password.' });
        }

        let user = dbOps.verifyUser(email, password);

        if (!user) {
            const existing = dbOps.findUserByEmail(email);
            if (existing) {
                return res.status(401).json({ success: false, error: 'Incorrect password.' });
            }

            // Auto-register demo customer
            user = dbOps.createUser(email.split('@')[0], email, password, 'customer');
        }

        res.json({
            success: true,
            message: 'Login successful!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 7. GET /api/stats - Dashboard analytics
app.get('/api/stats', (req, res) => {
    try {
        const stats = dbOps.getDashboardStats();
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`DineEase Server running at http://localhost:${PORT}`);
    console.log(`SQLite Database: restaurant.db connected`);
    console.log(`All CRUD Functions in database.js active`);
    console.log(`Default Admin: admin@dineease.com / admin123`);
    console.log(`===============================================`);
});
