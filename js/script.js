// ===============================================
// DINEEASE RESTAURANT RESERVATION SYSTEM
// Client-Side API Integration (SQLite Backend)
// ===============================================

const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';

let currentTables = [];
let selectedZone = 'all';

// ===============================================
// INITIALIZATION ON PAGE LOAD
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
    updateNavbarAuth();
    initReservationPage();
    initLoginPage();
});

// Update Navbar if user is logged in
function updateNavbarAuth() {
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    const navLoginLink = document.getElementById('navLoginLink');

    if (navLoginLink && userEmail) {
        if (userRole === 'admin') {
            navLoginLink.textContent = 'Admin (Sign Out)';
            navLoginLink.href = '#';
            navLoginLink.onclick = (e) => {
                e.preventDefault();
                logoutUser();
            };
        } else {
            navLoginLink.textContent = `Hi, ${userEmail.split('@')[0]} (Logout)`;
            navLoginLink.href = '#';
            navLoginLink.onclick = (e) => {
                e.preventDefault();
                logoutUser();
            };
        }
    }
}

function logoutUser() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    alert('You have logged out.');
    window.location.reload();
}

// ===============================================
// RESERVATION PAGE LOGIC (20 Tables + Booking API)
// ===============================================
function initReservationPage() {
    const reservationForm = document.getElementById('reservationForm');
    const tablesGrid = document.getElementById('tablesGrid');
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    const guestsSelect = document.getElementById('guests');
    const zoneFilterContainer = document.getElementById('zoneFilterContainer');

    if (!reservationForm || !tablesGrid) return;

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    if (dateInput) {
        dateInput.min = today;
        if (!dateInput.value) {
            dateInput.value = today;
        }
    }

    // Default time slot if empty
    if (timeSelect && !timeSelect.value) {
        timeSelect.value = '07:00 PM';
    }

    // Default guests if empty
    if (guestsSelect && !guestsSelect.value) {
        guestsSelect.value = '2';
    }

    // Prefill customer email if logged in
    const userEmail = localStorage.getItem('userEmail');
    const emailInput = document.getElementById('email');
    if (emailInput && userEmail) {
        emailInput.value = userEmail;
    }

    // Zone Filter Buttons
    if (zoneFilterContainer) {
        zoneFilterContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.zone-btn');
            if (!btn) return;

            zoneFilterContainer.querySelectorAll('.zone-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedZone = btn.dataset.zone;
            renderTables();
        });
    }

    // Re-check table availability on date or time change
    if (dateInput) {
        dateInput.addEventListener('change', () => fetchTablesWithAvailability());
    }
    if (timeSelect) {
        timeSelect.addEventListener('change', () => fetchTablesWithAvailability());
    }
    if (guestsSelect) {
        guestsSelect.addEventListener('change', () => renderTables());
    }

    // Initial load of 20 tables
    fetchTablesWithAvailability();

    // Handle Form Submit
    reservationForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const guests = document.getElementById('guests').value;
        const special_requests = (document.getElementById('special_requests') || {}).value || '';

        const selectedTableInput = document.querySelector('input[name="table"]:checked');

        if (!selectedTableInput) {
            alert('Please select one of the 20 dining tables below.');
            return;
        }

        const table_number = selectedTableInput.value;
        const submitBtn = document.getElementById('submitBtn');
        const originalBtnText = submitBtn.innerHTML;

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Saving into SQLite Database...</span>';

            const response = await fetch(`${API_BASE}/api/reservations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    date,
                    time,
                    guests,
                    table_number,
                    special_requests
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(`⚠️ Reservation Failed: ${data.error || 'Could not complete reservation.'}`);
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                fetchTablesWithAvailability();
                return;
            }

            // Save email for quick lookup
            localStorage.setItem('userEmail', email);

            // Show Confirmation
            alert(
                `🎉 Reservation Confirmed in SQLite Database!\n\n` +
                `Booking ID: #${data.reservation.id}\n` +
                `Name: ${data.reservation.customer_name}\n` +
                `Table: Table ${data.reservation.table_number < 10 ? '0' + data.reservation.table_number : data.reservation.table_number} (${data.reservation.table_name})\n` +
                `Zone: ${data.reservation.zone}\n` +
                `Date: ${data.reservation.reservation_date} | Time: ${data.reservation.reservation_time}\n` +
                `Guests: ${data.reservation.guests_count}`
            );

            // Reset selection and refresh tables
            fetchTablesWithAvailability();

            // Switch to My Reservations view
            if (typeof switchSection === 'function') {
                const lookupEmail = document.getElementById('lookupEmail');
                if (lookupEmail) lookupEmail.value = email;
                switchSection('my');
            }

        } catch (error) {
            console.error('Error submitting reservation:', error);
            alert('Could not connect to the backend server. Please verify the server is running on port 3000.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

// Fetch tables with availability for currently selected date & time
async function fetchTablesWithAvailability() {
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    const tablesGrid = document.getElementById('tablesGrid');

    if (!tablesGrid) return;

    const date = dateInput ? dateInput.value : '';
    const time = timeSelect ? timeSelect.value : '';

    let url = `${API_BASE}/api/tables`;
    if (date && time) {
        url += `?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.success && Array.isArray(data.tables)) {
            currentTables = data.tables;
            renderTables();
        }
    } catch (err) {
        console.error('Failed to load tables from backend:', err);
        tablesGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #dc2626; padding: 20px;">
                Unable to connect to database. Please make sure the server is running at http://localhost:3000
            </div>
        `;
    }
}

// Render the 20 tables into the grid
function renderTables() {
    const tablesGrid = document.getElementById('tablesGrid');
    if (!tablesGrid) return;

    const guestsSelect = document.getElementById('guests');
    const selectedGuests = guestsSelect ? parseInt(guestsSelect.value, 10) : 0;

    // Filter tables by zone
    let filtered = currentTables;
    if (selectedZone !== 'all') {
        filtered = currentTables.filter(t => t.zone.toLowerCase().includes(selectedZone.toLowerCase()));
    }

    if (filtered.length === 0) {
        tablesGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 20px; color: #78716c;">No tables found in this zone.</div>`;
        return;
    }

    // Check if user already picked a table
    const currentlyChecked = document.querySelector('input[name="table"]:checked');
    let checkedVal = currentlyChecked ? parseInt(currentlyChecked.value, 10) : null;

    // Auto-select first available table if none selected
    if (!checkedVal) {
        const firstAvail = filtered.find(t => !t.is_reserved && (selectedGuests === 0 || t.capacity >= selectedGuests));
        if (firstAvail) {
            checkedVal = firstAvail.table_number;
        }
    }

    tablesGrid.innerHTML = '';

    filtered.forEach(t => {
        const isReserved = Boolean(t.is_reserved);
        const capacityTooSmall = selectedGuests > 0 && t.capacity < selectedGuests;
        const isDisabled = isReserved || capacityTooSmall;
        const isSelected = checkedVal === t.table_number && !isDisabled;

        const card = document.createElement('div');
        card.className = `table-card ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`;
        card.id = `table-card-${t.table_number}`;

        let statusText = 'Available';
        let statusClass = 'status-avail';

        if (isReserved) {
            statusText = 'Reserved';
            statusClass = 'status-reserved';
        } else if (capacityTooSmall) {
            statusText = `Max ${t.capacity} Guests`;
            statusClass = 'status-reserved';
        }

        card.innerHTML = `
            <input
                type="radio"
                id="tbl_${t.table_number}"
                name="table"
                value="${t.table_number}"
                ${isDisabled ? 'disabled' : ''}
                ${isSelected ? 'checked' : ''}
            >
            <div class="tbl-num">${t.table_name}</div>
            <div class="tbl-zone">${t.zone}</div>
            <div class="tbl-cap">👥 Up to ${t.capacity} Guests</div>
            <div>
                <span class="tbl-status-badge ${statusClass}">${statusText}</span>
            </div>
        `;

        if (!isDisabled) {
            card.addEventListener('click', () => {
                document.querySelectorAll('.table-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            });
        }

        tablesGrid.appendChild(card);
    });
}

// ===============================================
// MY RESERVATIONS VIEW & CANCEL (SQLite Backend)
// ===============================================
async function loadMyReservations() {
    const listContainer = document.getElementById('reservationList');
    const lookupEmail = document.getElementById('lookupEmail');
    if (!listContainer) return;

    let email = '';
    if (lookupEmail && lookupEmail.value.trim()) {
        email = lookupEmail.value.trim();
    } else {
        email = localStorage.getItem('userEmail') || '';
        if (lookupEmail) lookupEmail.value = email;
    }

    if (!email) {
        listContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #78716c;">
                <h3>Enter Your Email Above</h3>
                <p>Please enter the email address used when booking to view your reservations.</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 30px; color: #78716c;">
            Fetching reservations from SQLite database...
        </div>
    `;

    try {
        const res = await fetch(`${API_BASE}/api/reservations?email=${encodeURIComponent(email)}`);
        const data = await res.json();

        if (!data.success || data.reservations.length === 0) {
            listContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: #fffaf5; border-radius: 16px; border: 1px dashed #fed7aa;">
                    <h3>No Reservations Found</h3>
                    <p style="color: #78716c; margin-top: 6px;">We could not find any bookings for <strong>${escapeHtml(email)}</strong>.</p>
                    <button
                        onclick="switchSection('book')"
                        style="margin-top: 15px; padding: 10px 22px; background: #b45309; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">
                        Book a Table Now
                    </button>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = '';

        data.reservations.forEach(r => {
            const card = document.createElement('div');
            card.className = 'res-card';
            const isCancelled = r.status === 'cancelled';

            card.innerHTML = `
                <div class="res-card-header">
                    <div class="res-card-table">🍽️ Table ${r.table_number < 10 ? '0' + r.table_number : r.table_number}</div>
                    <span class="res-badge ${r.status}">${r.status}</span>
                </div>

                <div class="res-details">
                    <div><strong>Zone:</strong> ${r.zone || 'Main Dining'}</div>
                    <div><strong>Guests:</strong> ${r.guests_count} Guests</div>
                    <div><strong>Date:</strong> 📅 ${r.reservation_date}</div>
                    <div><strong>Time:</strong> ⏰ ${r.reservation_time}</div>
                    <div><strong>Booked Under:</strong> ${escapeHtml(r.customer_name)}</div>
                    <div><strong>Phone:</strong> ${escapeHtml(r.customer_phone)}</div>
                </div>

                ${r.special_requests ? `
                    <div style="font-size: 13px; color: #78716c; margin-bottom: 14px; background: #f8fafc; padding: 8px 12px; border-radius: 8px;">
                        <strong>Note:</strong> ${escapeHtml(r.special_requests)}
                    </div>
                ` : ''}

                ${!isCancelled ? `
                    <button class="cancel-btn" onclick="cancelReservationById(${r.id})">
                        Cancel This Reservation
                    </button>
                ` : `
                    <div style="text-align: center; font-size: 13px; color: #991b1b; font-weight: 700;">
                        This reservation has been cancelled
                    </div>
                `}
            `;

            listContainer.appendChild(card);
        });

    } catch (err) {
        console.error('Error fetching reservations:', err);
        listContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #dc2626; padding: 20px;">
                Failed to load reservations from database.
            </div>
        `;
    }
}

// Cancel reservation by ID
async function cancelReservationById(id) {
    if (!confirm(`Are you sure you want to cancel reservation #${id}?`)) return;

    try {
        const res = await fetch(`${API_BASE}/api/reservations/${id}`, { method: 'DELETE' });
        const data = await res.json();

        if (data.success) {
            alert(data.message || 'Reservation cancelled successfully!');
            loadMyReservations();
            fetchTablesWithAvailability();
        } else {
            alert(`⚠️ Error: ${data.error || 'Failed to cancel reservation.'}`);
        }
    } catch (err) {
        console.error('Error cancelling reservation:', err);
        alert('Network error while cancelling reservation.');
    }
}

// ===============================================
// LOGIN SYSTEM (Database Auth & Role Redirect)
// ===============================================
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        if (!email || !password) {
            alert('Please enter your email and password.');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                alert(`⚠️ Login Failed: ${data.error || 'Invalid credentials'}`);
                return;
            }

            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userRole', data.user.role);

            alert(`Welcome, ${data.user.name}! (${data.user.role.toUpperCase()})`);

            if (data.user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'reservations.html';
            }

        } catch (err) {
            console.error('Login error:', err);
            alert('Could not reach backend database for authentication.');
        }
    });
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}