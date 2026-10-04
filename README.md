# Staff Attendance System

Full-stack attendance management system with face verification.

## Prerequisites

- Node.js 18+
- MySQL 8+
- npm or yarn

## Setup

### Backend (staff-attendance/)

1. Navigate to backend:
```bash
cd staff-attendance
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Edit `.env` with values:
```text
DATABASE_URL=mysql://root:password@localhost:3306/wfh_attendance
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=1d
UPLOAD_DIR=uploads/attendance
NODE_ENV=development
```

5. Create MySQL database:
```sql
CREATE DATABASE wfh_attendance;
```

6. Run migrations (if any) or start server (TypeORM auto-sync in dev):
```bash
npm run start:dev
```

Backend runs on `http://localhost:3000`.

### Frontend (frontend/)

1. Navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Edit `.env` (already correct if backend on localhost:3000):
```text
VITE_API_URL=http://localhost:3000
```

5. Start development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Credentials

### Admin (HRD)
- Username: `admin`
- Password: `Admin123!`
- Dashboard: `/hrd`

### Employee
- Created via HRD dashboard
- Default password: `Welcome123!`
- Dashboard: `/employee`

## Tech Stack

### Backend
- NestJS
- TypeORM (MySQL)
- JWT authentication
- Multer file upload

### Frontend
- React + Vite
- Tailwind CSS
- React Router