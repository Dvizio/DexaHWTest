export type UserRole = 'EMPLOYEE' | 'HRD';

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export type AttendanceStatus = 'PRESENT' | 'LATE';

export interface User {
  id: number;
  employee_id: number;
  username: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Employee {
  id: number;
  employee_number: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Attendance {
  id: number;
  employee_id: number;
  attendance_date: string;
  check_in_at: string;
  check_out_at?: string | null;
  check_in_photo: string;
  check_out_photo?: string | null;
  check_in_latitude: number;
  check_in_longitude: number;
  check_out_latitude?: number | null;
  check_out_longitude?: number | null;
  status: AttendanceStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    role: UserRole;
    employeeId: number;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
