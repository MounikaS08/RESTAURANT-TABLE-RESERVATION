# 🍽️ DineEase - Restaurant Table Reservation System

A full-stack restaurant table reservation web application with an **Express.js backend** and a built-in **SQLite database** managing **20 dining tables** across 4 curated zones.

---

## 🌐 Live Deployment & Links

- 🚀 **Live Demo on GitHub Pages**: [https://mounikas08.github.io/RESTAURANT-TABLE-RESERVATION/](https://mounikas08.github.io/RESTAURANT-TABLE-RESERVATION/)
- 👑 **Admin Portal Live**: [https://mounikas08.github.io/RESTAURANT-TABLE-RESERVATION/admin.html](https://mounikas08.github.io/RESTAURANT-TABLE-RESERVATION/admin.html)
- 📅 **Book Tables Live**: [https://mounikas08.github.io/RESTAURANT-TABLE-RESERVATION/reservations.html](https://mounikas08.github.io/RESTAURANT-TABLE-RESERVATION/reservations.html)
- 🔐 **Login Live**: [https://mounikas08.github.io/RESTAURANT-TABLE-RESERVATION/login.html](https://mounikas08.github.io/RESTAURANT-TABLE-RESERVATION/login.html)
- ☁️ **Deploy to Render (Full-Stack Express + SQLite)**: [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/MounikaS08/RESTAURANT-TABLE-RESERVATION)

---

## ✨ Features

- **20 Dining Tables Across 4 Zones**:
  - **Main Dining Hall** (Tables 01 – 08: 2 & 4 guests)
  - **Window Bay** (Tables 09 – 12: 2 & 4 guests with scenic skyline view)
  - **Terrace Garden** (Tables 13 – 16: 4 & 6 guests open-air dining)
  - **VIP Suites** (Tables 17 – 20: 6 & 8 guests luxury banquet)
- **Live Availability & Slot Checking**: Selecting date and time checks SQLite database in real-time.
- **Double-Booking Prevention**: Prevents two guests from reserving the same table at the same slot (HTTP 409 conflict detection).
- **Interactive Visual Table Grid**: Zone filter buttons, capacity tags, and instant table selection.
- **Customer Portal ("My Reservations")**: Look up, verify, or cancel confirmed bookings.
- **Admin Dashboard (`admin.html`)**:
  - Live metric cards (Total Tables: 20, Total Bookings, Confirmed, Cancelled).
  - Top-level master reservations table with search and filters.
  - Table visual matrix showing live `🟢 Available` or `🔴 Booked: Customer Name`.
  - One-click status updates (`seated`, `completed`, `cancelled`).
- **Authentication (`login.html`)**: Customer & Admin role management with 1-click quick demo buttons.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Fetch API)
- **Backend**: Node.js, Express.js, CORS
- **Database**: SQLite (via Node.js built-in `node:sqlite` — zero external DB software required)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Server
```bash
npm start
```
*(On Windows, you can also double-click `start_backend.bat`)*

### 3. Open in Browser
- **Home**: [http://localhost:3000/](http://localhost:3000/)
- **Reservations (20 Tables)**: [http://localhost:3000/reservations.html](http://localhost:3000/reservations.html)
- **Admin Portal**: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)
- **Login**: [http://localhost:3000/login.html](http://localhost:3000/login.html)

**Admin Credentials**:
- **Email**: `admin@dineease.com`
- **Password**: `admin123`

---

## 🧪 Testing

Run all 18 automated unit tests for database CRUD functions:
```bash
npm test
```

---

## 👤 Author

- GitHub: [@MounikaS08](https://github.com/MounikaS08)
