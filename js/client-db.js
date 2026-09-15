// ===============================================
// DINEEASE RESTAURANT RESERVATION SYSTEM
// Client-Side Simulated SQLite Engine (Offline / GitHub Pages Fallback)
// Ensures 100% full functionality even without a Node.js server running!
// ===============================================

const SEED_TABLES = [
    { table_number: 1, table_name: 'Table 01', capacity: 2, zone: 'Main Hall', description: 'Cozy 2-seater table near center hall' },
    { table_number: 2, table_name: 'Table 02', capacity: 2, zone: 'Main Hall', description: 'Comfortable bistro 2-seater' },
    { table_number: 3, table_name: 'Table 03', capacity: 2, zone: 'Main Hall', description: 'Charming 2-seater by the interior fountain' },
    { table_number: 4, table_name: 'Table 04', capacity: 2, zone: 'Main Hall', description: 'Quiet 2-seater corner table' },
    { table_number: 5, table_name: 'Table 05', capacity: 4, zone: 'Main Hall', description: 'Classic 4-seater family table' },
    { table_number: 6, table_name: 'Table 06', capacity: 4, zone: 'Main Hall', description: 'Spacious 4-seater center booth' },
    { table_number: 7, table_name: 'Table 07', capacity: 4, zone: 'Main Hall', description: 'Elegant 4-seater timber table' },
    { table_number: 8, table_name: 'Table 08', capacity: 4, zone: 'Main Hall', description: 'Family 4-seater near the dessert bar' },

    { table_number: 9, table_name: 'Table 09', capacity: 2, zone: 'Window Bay', description: 'Romantic 2-seater with skyline street view' },
    { table_number: 10, table_name: 'Table 10', capacity: 2, zone: 'Window Bay', description: 'Intimate 2-seater by glass window' },
    { table_number: 11, table_name: 'Table 11', capacity: 4, zone: 'Window Bay', description: 'Premium 4-seater with panoramic city view' },
    { table_number: 12, table_name: 'Table 12', capacity: 4, zone: 'Window Bay', description: 'Bright 4-seater window alcove' },

    { table_number: 13, table_name: 'Table 13', capacity: 4, zone: 'Terrace Garden', description: 'Open-air 4-seater under garden canopy' },
    { table_number: 14, table_name: 'Table 14', capacity: 4, zone: 'Terrace Garden', description: 'Breezy 4-seater patio dining' },
    { table_number: 15, table_name: 'Table 15', capacity: 6, zone: 'Terrace Garden', description: 'Spacious 6-seater outdoor pergola' },
    { table_number: 16, table_name: 'Table 16', capacity: 6, zone: 'Terrace Garden', description: 'Festive 6-seater garden lounge table' },

    { table_number: 17, table_name: 'Table 17', capacity: 6, zone: 'VIP Lounge', description: 'Exclusive 6-seater private booth with chandelier' },
    { table_number: 18, table_name: 'Table 18', capacity: 6, zone: 'VIP Lounge', description: 'Executive 6-seater lounge with plush seating' },
    { table_number: 19, table_name: 'Table 19', capacity: 8, zone: 'VIP Royal Suite', description: 'Grand 8-seater presidential banquet table' },
    { table_number: 20, table_name: 'Table 20', capacity: 8, zone: 'VIP Royal Suite', description: 'Royal 8-seater celebrations dining suite' }
];

const SEED_USERS = [
    { id: 1, name: 'Restaurant Admin', email: 'admin@dineease.com', password: 'admin123', role: 'admin' },
    { id: 2, name: 'Guest User', email: 'guest@example.com', password: 'guest123', role: 'customer' }
];

const SEED_RESERVATIONS = [
    {
        id: 101,
        customer_name: 'Priya Sharma',
        customer_email: 'priya@example.com',
        customer_phone: '+91 9876543210',
        reservation_date: new Date().toISOString().split('T')[0],
        reservation_time: '07:00 PM',
        guests_count: 2,
        table_number: 9,
        table_name: 'Table 09',
        zone: 'Window Bay',
        special_requests: 'Window side romantic dinner setup',
        status: 'confirmed',
        created_at: new Date().toISOString()
    },
    {
        id: 102,
        customer_name: 'Vikram Singh',
        customer_email: 'vikram@example.com',
        customer_phone: '+91 9876543211',
        reservation_date: new Date().toISOString().split('T')[0],
        reservation_time: '08:00 PM',
        guests_count: 6,
        table_number: 15,
        table_name: 'Table 15',
        zone: 'Terrace Garden',
        special_requests: 'Anniversary cake celebration',
        status: 'confirmed',
        created_at: new Date().toISOString()
    },
    {
        id: 103,
        customer_name: 'Rahul Mehta',
        customer_email: 'rahul@example.com',
        customer_phone: '+91 9876543212',
        reservation_date: new Date().toISOString().split('T')[0],
        reservation_time: '01:00 PM',
        guests_count: 4,
        table_number: 5,
        table_name: 'Table 05',
        zone: 'Main Hall',
        special_requests: 'High chair for toddler',
        status: 'completed',
        created_at: new Date().toISOString()
    }
];

class ClientDatabase {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('dineease_tables')) {
            localStorage.setItem('dineease_tables', JSON.stringify(SEED_TABLES));
        }
        if (!localStorage.getItem('dineease_reservations')) {
            localStorage.setItem('dineease_reservations', JSON.stringify(SEED_RESERVATIONS));
        }
        if (!localStorage.getItem('dineease_users')) {
            localStorage.setItem('dineease_users', JSON.stringify(SEED_USERS));
        }
    }

    getTables(date, time) {
        const tables = JSON.parse(localStorage.getItem('dineease_tables') || '[]');
        const reservations = JSON.parse(localStorage.getItem('dineease_reservations') || '[]');

        return tables.map(tbl => {
            let isReserved = false;
            let resDetails = null;

            if (date && time) {
                resDetails = reservations.find(r => 
                    parseInt(r.table_number, 10) === parseInt(tbl.table_number, 10) &&
                    r.reservation_date === date &&
                    r.reservation_time === time &&
                    (r.status === 'confirmed' || r.status === 'seated')
                );
                isReserved = Boolean(resDetails);
            }

            return {
                ...tbl,
                is_reserved: isReserved,
                reserved_by: resDetails ? resDetails.customer_name : null,
                reservation_id: resDetails ? resDetails.id : null
            };
        });
    }

    getReservations(filter = {}) {
        let reservations = JSON.parse(localStorage.getItem('dineease_reservations') || '[]');

        if (filter.email) {
            reservations = reservations.filter(r => r.customer_email.toLowerCase() === filter.email.toLowerCase());
        }
        if (filter.date) {
            reservations = reservations.filter(r => r.reservation_date === filter.date);
        }
        if (filter.status && filter.status !== 'all') {
            reservations = reservations.filter(r => r.status.toLowerCase() === filter.status.toLowerCase());
        }

        return reservations.sort((a, b) => b.id - a.id);
    }

    createReservation(data) {
        const reservations = JSON.parse(localStorage.getItem('dineease_reservations') || '[]');
        const tables = JSON.parse(localStorage.getItem('dineease_tables') || '[]');

        const tableNum = parseInt(data.table_number, 10);
        const tbl = tables.find(t => t.table_number === tableNum);

        if (!tbl) {
            throw new Error(`Table ${tableNum} does not exist.`);
        }

        if (parseInt(data.guests, 10) > tbl.capacity) {
            throw new Error(`Table ${tbl.table_name} accommodates up to ${tbl.capacity} guests only.`);
        }

        const conflict = reservations.find(r => 
            parseInt(r.table_number, 10) === tableNum &&
            r.reservation_date === data.date &&
            r.reservation_time === data.time &&
            (r.status === 'confirmed' || r.status === 'seated')
        );

        if (conflict) {
            throw new Error(`Table ${tableNum} is already reserved for ${data.date} at ${data.time}.`);
        }

        const newId = reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 101;
        const newRes = {
            id: newId,
            customer_name: data.name,
            customer_email: data.email,
            customer_phone: data.phone,
            reservation_date: data.date,
            reservation_time: data.time,
            guests_count: parseInt(data.guests, 10),
            table_number: tableNum,
            table_name: tbl.table_name,
            zone: tbl.zone,
            special_requests: data.special_requests || '',
            status: 'confirmed',
            created_at: new Date().toISOString()
        };

        reservations.push(newRes);
        localStorage.setItem('dineease_reservations', JSON.stringify(reservations));
        return newRes;
    }

    cancelReservation(id) {
        const reservations = JSON.parse(localStorage.getItem('dineease_reservations') || '[]');
        const resId = parseInt(id, 10);
        const target = reservations.find(r => r.id === resId);

        if (!target) return null;

        target.status = 'cancelled';
        localStorage.setItem('dineease_reservations', JSON.stringify(reservations));
        return target;
    }

    updateStatus(id, newStatus) {
        const reservations = JSON.parse(localStorage.getItem('dineease_reservations') || '[]');
        const resId = parseInt(id, 10);
        const target = reservations.find(r => r.id === resId);

        if (!target) return null;

        target.status = newStatus;
        localStorage.setItem('dineease_reservations', JSON.stringify(reservations));
        return target;
    }

    login(email, password) {
        const users = JSON.parse(localStorage.getItem('dineease_users') || '[]');
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (user) {
            if (user.password === password) {
                return user;
            }
            throw new Error('Incorrect password.');
        }

        // Auto-register demo guest
        const newUser = {
            id: users.length + 1,
            name: email.split('@')[0],
            email: email,
            password: password,
            role: 'customer'
        };
        users.push(newUser);
        localStorage.setItem('dineease_users', JSON.stringify(users));
        return newUser;
    }

    getStats() {
        const tables = JSON.parse(localStorage.getItem('dineease_tables') || '[]');
        const reservations = JSON.parse(localStorage.getItem('dineease_reservations') || '[]');

        return {
            totalTables: tables.length,
            totalBookings: reservations.length,
            confirmedBookings: reservations.filter(r => r.status === 'confirmed').length,
            seatedBookings: reservations.filter(r => r.status === 'seated').length,
            completedBookings: reservations.filter(r => r.status === 'completed').length,
            cancelledBookings: reservations.filter(r => r.status === 'cancelled').length
        };
    }
}

window.clientDb = new ClientDatabase();
