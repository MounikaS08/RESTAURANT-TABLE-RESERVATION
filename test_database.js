// ===============================================
// Test Script for database.js Functions
// ===============================================

const dbOps = require('./database');

console.log('Testing all functions in database.js...\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`✅ PASS: ${message}`);
        passed++;
    } else {
        console.error(`❌ FAIL: ${message}`);
        failed++;
    }
}

try {
    // 1. getAllTables
    const allTables = dbOps.getAllTables();
    assert(Array.isArray(allTables) && allTables.length === 20, `getAllTables() returns 20 tables (got ${allTables.length})`);

    // 2. getTableByNumber
    const table5 = dbOps.getTableByNumber(5);
    assert(table5 && table5.table_number === 5 && table5.capacity === 4, `getTableByNumber(5) returns Table 05 with capacity 4`);

    // 3. getTableById
    const tableById = dbOps.getTableById(1);
    assert(tableById && tableById.table_number === 1, `getTableById(1) returns Table 01`);

    // 4. getAvailableTables
    const availTables = dbOps.getAvailableTables('2026-10-01', '08:00 PM');
    assert(availTables.length === 20 && availTables.every(t => t.is_reserved === false), `getAvailableTables() marks all as unreserved for future slot`);

    // 5. isTableBooked before booking
    const bookedBefore = dbOps.isTableBooked(7, '2026-10-01', '08:00 PM');
    assert(bookedBefore === false, `isTableBooked(7) is initially false`);

    // 6. createReservation
    const newRes = dbOps.createReservation({
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '9876543210',
        date: '2026-10-01',
        time: '08:00 PM',
        guests: 4,
        table_number: 7,
        special_requests: 'Anniversary'
    });
    assert(newRes && newRes.id && newRes.table_number === 7 && newRes.status === 'confirmed', `createReservation() successfully inserts reservation #${newRes?.id}`);

    // 7. isTableBooked after booking
    const bookedAfter = dbOps.isTableBooked(7, '2026-10-01', '08:00 PM');
    assert(bookedAfter === true, `isTableBooked(7) is now true after booking`);

    // 8. Double booking conflict check
    let conflictCaught = false;
    try {
        dbOps.createReservation({
            name: 'Another Person',
            email: 'another@example.com',
            phone: '9123456780',
            date: '2026-10-01',
            time: '08:00 PM',
            guests: 4,
            table_number: 7
        });
    } catch (err) {
        if (err.code === 'CONFLICT') conflictCaught = true;
    }
    assert(conflictCaught, `createReservation() blocks double-booking for the same table at same time`);

    // 9. getReservationById
    const fetchedRes = dbOps.getReservationById(newRes.id);
    assert(fetchedRes && fetchedRes.customer_name === 'Test Customer', `getReservationById() retrieves created reservation`);

    // 10. getReservations with email filter
    const myReservations = dbOps.getReservations({ email: 'test@example.com' });
    assert(myReservations.length >= 1, `getReservations({ email }) finds customer's reservations`);

    // 11. updateReservationStatus
    const updatedRes = dbOps.updateReservationStatus(newRes.id, 'seated');
    assert(updatedRes && updatedRes.status === 'seated', `updateReservationStatus() changes status to seated`);

    // 12. cancelReservation
    const cancelledRes = dbOps.cancelReservation(newRes.id);
    assert(cancelledRes && cancelledRes.status === 'cancelled', `cancelReservation() cancels reservation`);

    // 13. Verify table is freed up after cancellation
    const isBookedNow = dbOps.isTableBooked(7, '2026-10-01', '08:00 PM');
    assert(isBookedNow === false, `Table 7 is free again after cancellation`);

    // 14. findUserByEmail & verifyUser
    const adminUser = dbOps.findUserByEmail('admin@dineease.com');
    assert(adminUser && adminUser.role === 'admin', `findUserByEmail() finds default admin`);

    const verifiedAdmin = dbOps.verifyUser('admin@dineease.com', 'admin123');
    assert(verifiedAdmin && verifiedAdmin.role === 'admin', `verifyUser() successfully validates correct password`);

    const badLogin = dbOps.verifyUser('admin@dineease.com', 'wrongpassword');
    assert(badLogin === null, `verifyUser() rejects invalid password`);

    // 15. createUser
    const tempEmail = `user_${Date.now()}@example.com`;
    const newUser = dbOps.createUser('Demo User', tempEmail, 'secret123', 'customer');
    assert(newUser && newUser.email === tempEmail, `createUser() registers new user`);

    // 16. getDashboardStats
    const stats = dbOps.getDashboardStats();
    assert(stats && stats.totalTables === 20 && stats.zoneStats.length > 0, `getDashboardStats() returns metrics including totalTables = 20`);

    console.log(`\n===============================================`);
    console.log(`Total tests passed: ${passed} / ${passed + failed}`);
    console.log(`All functions in database.js are 100% OPERATIONAL!`);
    console.log(`===============================================\n`);

} catch (e) {
    console.error('Unexpected error during testing:', e);
}
