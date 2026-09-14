// ===============================================
// DINEEASE RESTAURANT RESERVATION SYSTEM
// SQLite Database Manager with Complete CRUD Functions
// ===============================================

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for optimal performance and safety
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// ===============================================
// 1. INITIALIZE DATABASE & SCHEMA
// ===============================================
function initDatabase() {
    // 1. Tables table
    db.exec(`
        CREATE TABLE IF NOT EXISTS tables (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_number INTEGER UNIQUE NOT NULL,
            table_name TEXT NOT NULL,
            capacity INTEGER NOT NULL,
            zone TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'available',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 2. Reservations table
    db.exec(`
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            reservation_date TEXT NOT NULL,
            reservation_time TEXT NOT NULL,
            guests_count INTEGER NOT NULL,
            table_id INTEGER NOT NULL,
            table_number INTEGER NOT NULL,
            special_requests TEXT,
            status TEXT DEFAULT 'confirmed',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (table_id) REFERENCES tables(id)
        );
    `);

    // 3. Users table (for customer & admin authentication)
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'customer',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    seedInitialData();
}

// Seed 20 Tables and Default Admin
function seedInitialData() {
    const countRow = db.prepare('SELECT COUNT(*) as count FROM tables').get();
    if (countRow.count === 0) {
        console.log('Seeding 20 restaurant dining tables into SQLite...');
        const insertTable = db.prepare(`
            INSERT INTO tables (table_number, table_name, capacity, zone, description)
            VALUES (?, ?, ?, ?, ?)
        `);

        const initialTables = [
            // Zone 1: Main Dining Hall (Tables 1 - 8)
            [1, 'Table 01', 2, 'Main Hall', 'Cozy 2-seater table near center hall'],
            [2, 'Table 02', 2, 'Main Hall', 'Comfortable bistro 2-seater'],
            [3, 'Table 03', 2, 'Main Hall', 'Charming 2-seater by the interior fountain'],
            [4, 'Table 04', 2, 'Main Hall', 'Quiet 2-seater corner table'],
            [5, 'Table 05', 4, 'Main Hall', 'Classic 4-seater family table'],
            [6, 'Table 06', 4, 'Main Hall', 'Spacious 4-seater center booth'],
            [7, 'Table 07', 4, 'Main Hall', 'Elegant 4-seater timber table'],
            [8, 'Table 08', 4, 'Main Hall', 'Family 4-seater near the dessert bar'],

            // Zone 2: Window Bay (Tables 9 - 12)
            [9, 'Table 09', 2, 'Window Bay', 'Romantic 2-seater with skyline street view'],
            [10, 'Table 10', 2, 'Window Bay', 'Intimate 2-seater by glass window'],
            [11, 'Table 11', 4, 'Window Bay', 'Premium 4-seater with panoramic city view'],
            [12, 'Table 12', 4, 'Window Bay', 'Bright 4-seater window alcove'],

            // Zone 3: Terrace Garden (Tables 13 - 16)
            [13, 'Table 13', 4, 'Terrace Garden', 'Open-air 4-seater under garden canopy'],
            [14, 'Table 14', 4, 'Terrace Garden', 'Breezy 4-seater patio dining'],
            [15, 'Table 15', 6, 'Terrace Garden', 'Spacious 6-seater outdoor pergola'],
            [16, 'Table 16', 6, 'Terrace Garden', 'Festive 6-seater garden lounge table'],

            // Zone 4: VIP Private Lounge (Tables 17 - 20)
            [17, 'Table 17', 6, 'VIP Lounge', 'Exclusive 6-seater private booth with chandelier'],
            [18, 'Table 18', 6, 'VIP Lounge', 'Executive 6-seater lounge with plush seating'],
            [19, 'Table 19', 8, 'VIP Royal Suite', 'Grand 8-seater presidential banquet table'],
            [20, 'Table 20', 8, 'VIP Royal Suite', 'Royal 8-seater celebrations dining suite']
        ];

        for (const t of initialTables) {
            insertTable.run(t[0], t[1], t[2], t[3], t[4]);
        }
        console.log('Successfully seeded 20 dining tables.');
    }

    const adminRow = db.prepare('SELECT COUNT(*) as count FROM users WHERE email = ?').get('admin@dineease.com');
    if (adminRow.count === 0) {
        db.prepare(`
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)
        `).run('Restaurant Administrator', 'admin@dineease.com', 'admin123', 'admin');
        console.log('Default admin created: admin@dineease.com / admin123');
    }
}

// ===============================================
// 2. TABLE FUNCTIONS (CRUD)
// ===============================================

/**
 * Get all 20 dining tables
 */
function getAllTables() {
    return db.prepare(`
        SELECT id, table_number, table_name, capacity, zone, description, status
        FROM tables
        ORDER BY table_number ASC
    `).all();
}

/**
 * Get a specific table by its table number (1 - 20)
 */
function getTableByNumber(tableNumber) {
    const num = parseInt(tableNumber, 10);
    return db.prepare(`
        SELECT * FROM tables WHERE table_number = ?
    `).get(num);
}

/**
 * Get a specific table by its primary key ID
 */
function getTableById(tableId) {
    const id = parseInt(tableId, 10);
    return db.prepare(`
        SELECT * FROM tables WHERE id = ?
    `).get(id);
}

/**
 * Get all 20 tables enriched with live reservation status for a given date and time
 */
function getAvailableTables(date, time) {
    const tables = getAllTables();

    if (!date || !time) {
        return tables.map(t => ({ ...t, is_reserved: false }));
    }

    const booked = db.prepare(`
        SELECT table_number, customer_name
        FROM reservations
        WHERE reservation_date = ? AND reservation_time = ? AND status != 'cancelled'
    `).all(date, time);

    const bookedSet = new Set(booked.map(b => b.table_number));

    return tables.map(t => ({
        ...t,
        is_reserved: bookedSet.has(t.table_number)
    }));
}

/**
 * Update the general status of a table (e.g., 'available', 'maintenance')
 */
function updateTableStatus(tableNumber, status) {
    const num = parseInt(tableNumber, 10);
    const res = db.prepare(`
        UPDATE tables SET status = ? WHERE table_number = ?
    `).run(status, num);
    return res.changes > 0;
}

// ===============================================
// 3. RESERVATION FUNCTIONS (CRUD & Conflicts)
// ===============================================

/**
 * Check if a specific table is already reserved on a given date and time
 */
function isTableBooked(tableNumber, date, time) {
    const num = parseInt(tableNumber, 10);
    const booking = db.prepare(`
        SELECT id, customer_name, customer_email
        FROM reservations
        WHERE table_number = ? AND reservation_date = ? AND reservation_time = ? AND status != 'cancelled'
    `).get(num, date, time);
    return Boolean(booking);
}

/**
 * Create a new table reservation with full validation and conflict checks
 */
function createReservation({ name, email, phone, date, time, guests, table_number, special_requests }) {
    if (!name || !email || !phone || !date || !time || !guests || !table_number) {
        throw new Error('All required fields (name, email, phone, date, time, guests, table_number) must be provided.');
    }

    const tableNum = parseInt(table_number, 10);
    const guestsNum = parseInt(guests, 10);

    // 1. Verify table exists
    const table = getTableByNumber(tableNum);
    if (!table) {
        throw new Error(`Table ${tableNum} does not exist. Choose a table between 1 and 20.`);
    }

    // 2. Verify capacity
    if (guestsNum > table.capacity) {
        throw new Error(`Table ${tableNum} only seats up to ${table.capacity} guests. (Requested: ${guestsNum})`);
    }

    // 3. Double-booking conflict check
    if (isTableBooked(tableNum, date, time)) {
        const conflictError = new Error(`Table ${tableNum} (${table.table_name}) is already reserved for ${date} at ${time}.`);
        conflictError.code = 'CONFLICT';
        throw conflictError;
    }

    // 4. Insert reservation into SQLite
    const insertStmt = db.prepare(`
        INSERT INTO reservations (
            customer_name, customer_email, customer_phone,
            reservation_date, reservation_time, guests_count,
            table_id, table_number, special_requests, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `);

    const result = insertStmt.run(
        name.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        date,
        time,
        guestsNum,
        table.id,
        tableNum,
        special_requests ? special_requests.trim() : ''
    );

    // Auto-create customer account if not already in users table
    const existingUser = findUserByEmail(email.trim().toLowerCase());
    if (!existingUser) {
        createUser(name.trim(), email.trim().toLowerCase(), 'guest123', 'customer');
    }

    return getReservationById(result.lastInsertRowid);
}

/**
 * Retrieve a reservation by its ID with joined table information
 */
function getReservationById(id) {
    const resId = parseInt(id, 10);
    return db.prepare(`
        SELECT r.*, t.table_name, t.zone, t.capacity
        FROM reservations r
        LEFT JOIN tables t ON r.table_id = t.id
        WHERE r.id = ?
    `).get(resId);
}

/**
 * Get reservations with optional filters (by email, date, status)
 */
function getReservations({ email, date, status } = {}) {
    let query = `
        SELECT r.*, t.table_name, t.zone, t.capacity
        FROM reservations r
        LEFT JOIN tables t ON r.table_id = t.id
        WHERE 1=1
    `;
    const params = [];

    if (email) {
        query += ` AND r.customer_email = ?`;
        params.push(email.trim().toLowerCase());
    }
    if (date) {
        query += ` AND r.reservation_date = ?`;
        params.push(date);
    }
    if (status) {
        query += ` AND r.status = ?`;
        params.push(status);
    }

    query += ` ORDER BY r.reservation_date DESC, r.reservation_time ASC, r.id DESC`;

    return db.prepare(query).all(...params);
}

/**
 * Cancel a reservation (marks status as 'cancelled')
 */
function cancelReservation(id) {
    const resId = parseInt(id, 10);
    const existing = getReservationById(resId);
    if (!existing) {
        return null;
    }

    const res = db.prepare(`
        UPDATE reservations SET status = 'cancelled' WHERE id = ?
    `).run(resId);

    return res.changes > 0 ? getReservationById(resId) : null;
}

/**
 * Update reservation status ('confirmed', 'seated', 'completed', 'cancelled')
 */
function updateReservationStatus(id, status) {
    const validStatuses = ['confirmed', 'seated', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    const resId = parseInt(id, 10);
    const res = db.prepare(`
        UPDATE reservations SET status = ? WHERE id = ?
    `).run(status, resId);

    return res.changes > 0 ? getReservationById(resId) : null;
}

// ===============================================
// 4. USER & AUTH FUNCTIONS
// ===============================================

/**
 * Find user by email
 */
function findUserByEmail(email) {
    if (!email) return null;
    return db.prepare(`
        SELECT id, name, email, password, role, created_at
        FROM users
        WHERE email = ?
    `).get(email.trim().toLowerCase());
}

/**
 * Create a new user (customer or admin)
 */
function createUser(name, email, password, role = 'customer') {
    const cleanEmail = email.trim().toLowerCase();
    const existing = findUserByEmail(cleanEmail);
    if (existing) {
        throw new Error(`User with email ${cleanEmail} already exists.`);
    }

    const res = db.prepare(`
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
    `).run(name.trim(), cleanEmail, password.trim(), role);

    return {
        id: res.lastInsertRowid,
        name: name.trim(),
        email: cleanEmail,
        role
    };
}

/**
 * Verify user login credentials
 */
function verifyUser(email, password) {
    if (!email || !password) return null;
    const user = findUserByEmail(email);
    if (!user) return null;
    if (user.password !== password.trim()) return null;

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
}

// ===============================================
// 5. STATS & ANALYTICS FUNCTIONS
// ===============================================

/**
 * Get comprehensive dashboard analytics
 */
function getDashboardStats() {
    const totalTables = db.prepare('SELECT COUNT(*) as count FROM tables').get().count;
    const totalBookings = db.prepare('SELECT COUNT(*) as count FROM reservations').get().count;
    const confirmedBookings = db.prepare(`SELECT COUNT(*) as count FROM reservations WHERE status = 'confirmed'`).get().count;
    const cancelledBookings = db.prepare(`SELECT COUNT(*) as count FROM reservations WHERE status = 'cancelled'`).get().count;

    const today = new Date().toISOString().split('T')[0];
    const todayStats = db.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(guests_count), 0) as total_guests
        FROM reservations
        WHERE reservation_date = ? AND status != 'cancelled'
    `).get(today);

    const zoneStats = db.prepare(`
        SELECT zone, COUNT(*) as table_count
        FROM tables
        GROUP BY zone
    `).all();

    return {
        totalTables,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        todayBookingsCount: todayStats.count,
        todayGuests: todayStats.total_guests,
        zoneStats
    };
}

// ===============================================
// 6. UTILITY / RESET FUNCTIONS
// ===============================================

/**
 * Reset all reservation data (for testing)
 */
function clearAllReservations() {
    db.exec('DELETE FROM reservations;');
    return true;
}

// Initialize on load
initDatabase();

// Export database instance and all functions
module.exports = {
    db,
    initDatabase,
    // Table operations
    getAllTables,
    getTableByNumber,
    getTableById,
    getAvailableTables,
    updateTableStatus,
    // Reservation operations
    isTableBooked,
    createReservation,
    getReservationById,
    getReservations,
    cancelReservation,
    updateReservationStatus,
    // User operations
    findUserByEmail,
    createUser,
    verifyUser,
    // Analytics
    getDashboardStats,
    // Utility
    clearAllReservations
};
