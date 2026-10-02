# Staff Attendance Frontend (React + Vite + Tailwind CSS)

Modern, responsive web application for the **Staff Attendance Management System** supporting Role-Based Access Control (RBAC) for **Employees** and **HRD / Administrators**.

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure your backend NestJS service is running on `http://localhost:3000`:
```bash
cd ../staff-attendance
npm run start:dev
```

### 2. Install Dependencies & Run Dev Server
```bash
cd frontend
npm install
npm run dev
```

The frontend app will launch at `http://localhost:5173`.

---

## 🔑 Default Credentials

- **HRD / Admin**:
  - Username: `admin`
  - Password: `Admin123!`
  - Redirects to: `/hrd`

- **Employee**:
  - Create via the HRD Dashboard (`/hrd`).
  - The system automatically provisions the account with temporary password `Welcome123!`.
  - Redirects to: `/employee`

---

## 🌟 Key Features

### 1. Authentication & Protected Routing
- Clean dark theme login page with validation and quick-fill helper.
- Automatic JWT token persistence in `localStorage` with auto-logout on `401 Unauthorized`.
- Role-based redirect guards (`/login`, `/employee`, `/hrd`).

### 2. Employee Dashboard (`/employee`)
- **Profile Summary**: Displays employee details (Employee #, Department, Position, Contact).
- **Dynamic Attendance Card**:
  - Detects today's status (`GET /attendances/me/today`).
  - Shows **Check In Now** button if not yet checked in.
  - Shows **Check Out** button if checked in and active.
  - Shows **Completed for Today** status pill (`ON_TIME` / `LATE`) once both in & out are recorded.
- **Live Webcam Modal**:
  - Live video stream preview with face positioning guide.
  - Real-time GPS Geolocation acquisition with coordinates accuracy feedback.
  - Instant snapshot capture converted to multipart `FormData`.
- **Attendance History Table**:
  - Filter by date range (`startDate`, `endDate`) and status (`PRESENT`, `LATE`).
  - Pagination controls.
  - Interactive Google Maps links for location coordinates.
  - Selfie thumbnail view with full-size photo preview modal.

### 3. HRD Dashboard (`/hrd`)
- **Employee Management Panel**:
  - Employee list with name search, status filter (`ACTIVE` / `INACTIVE`), and pagination.
  - "Register New Employee" modal with auto-generated credentials reveal & copy button.
  - "Edit Employee" modal for updating contact & department details.
  - Instant account activation/deactivation toggle.
- **Attendance Monitoring Panel**:
  - Company-wide attendance records with date range, employee ID, and status filters.
  - In-depth detail modal with side-by-side Check-In and Check-Out selfie photos, timestamps, GPS coordinates, and notes.

---

## 🛠️ Tech Stack
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 (Slate-950 dark theme)
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **HTTP Client**: Axios with JWT request & response interceptors
