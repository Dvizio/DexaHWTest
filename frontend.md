# Frontend Build Prompt (React + Tailwind)

Build a React + Tailwind CSS frontend for the Staff Attendance Management System running on `http://localhost:3000`.

## Tech Stack
- React (Vite)
- Tailwind CSS
- Lucide React (icons)
- Axios (install with: `npm install axios`)

## API Endpoints (Exact)

### Auth
- `POST /auth/login`
  - Body: `{ username, password }`
  - Returns: `{ access_token: string, user: { id, username, role, employeeId } }`
  - Errors: `401` for invalid credentials

### Employees (HRD only)
- `GET /employees` -> Pagination query: `?page=1&limit=10&search=jane&status=ACTIVE`
- `GET /employees/:id`
- `POST /employees`
  - Body: `{ employee_number, name, email, phone?, department?, position? }`
- `PATCH /employees/:id`
  - Body: `{ name?, email?, phone?, department?, position? }`
- `PATCH /employees/:id/status`
  - Body: `{ status: "ACTIVE" | "INACTIVE" }`

### Employees (Employee self)
- `GET /employees/me`

### Attendances (Employee)
- `POST /attendances/check-in`
  - Multipart/form-data: `{ latitude, longitude, notes?, photo }` (photo required)
- `POST /attendances/check-out`
  - Multipart/form-data: `{ latitude, longitude, notes?, photo }` (photo required)
- `GET /attendances/me` -> Query: `?startDate=2026-10-01&endDate=2026-10-02`
- `GET /attendances/me/today`

### Attendances (HRD)
- `GET /attendances` -> Query: `?page=1&limit=10&startDate=&endDate=&employeeId=&status=`
- `GET /attendances/employee/:employeeId`
- `GET /attendances/:id`

## Features

### 1. Auth Flow
- Login page at `/login`
- Store JWT token in `localStorage`
- Auto-redirect based on role (`HRD` -> `/hrd`, `EMPLOYEE` -> `/employee`)

### 2. Employee Dashboard (`/employee`)
- Header: Name, role, logout button
- Check-In Button: Get location via Geolocation API, upload selfie, add notes
- Check-Out Button: Same as check-in
- Hit GET /attendances/me/today to switch between Check-In and Check-Out button
- Today's Attendance Status Card (ON_TIME, LATE)
- Attendance History Table with filters (date range, status)
- Employee Profile Card (from `/employees/me`)

### 3. HRD Dashboard (`/hrd`)
- Header: Name, logout button
- Employee Management Panel:
  - List table with search, pagination, status filter
  - Create new employee modal
  - Edit employee modal
  - Toggle employee active status
- Attendance Monitoring Panel:
  - All attendances table with filters (date range, employee, status)
  - Employee attendance detail view

## Styling
- Dark background (slate-900), light text (slate-100)
- Cards with rounded-lg, shadow-lg, border border-slate-700
- Buttons: primary (blue-600), danger (red-600), success (green-600)
- Table styling with border-collapse and hover states
- Modal overlay with backdrop blur
