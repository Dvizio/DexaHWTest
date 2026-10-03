import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, MoreThan, LessThan, Between } from 'typeorm';
import { Employee, EmployeeStatus } from '../employees/employee.entity.js';
import { Attendance, AttendanceStatus } from './attendance.entity.js';
import { CheckInDto } from './dto/check-in.dto.js';
import { AttendanceFilterDto } from './dto/attendance-filter.dto.js';
import moment from 'moment';
import { CheckOutDto } from './dto/check-out.dto.js';

@Injectable()
export class AttendancesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) { }

  async checkIn(
    employeeId: number,
    checkInDto: CheckInDto,
    file: any,
  ) {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (employee.status === EmployeeStatus.INACTIVE) {
      throw new ForbiddenException('Employee is inactive');
    }

    const now = moment();
    const attendanceDate = now.format('YYYY-MM-DD'); // string type
    const checkInTime = now.toDate(); // Date object
    const attendanceTime = now.format('HH:mm:ss');

    const lateTime = process.env.ATTENDANCE_LATE_TIME || '09:00';
    const status = moment(attendanceTime, 'HH:mm:ss').isAfter(moment(lateTime, 'HH:mm'))
      ? AttendanceStatus.LATE
      : AttendanceStatus.PRESENT;

    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        employee_id: employeeId,
        attendance_date: attendanceDate,
      },
    });

    if (existingAttendance) {
      throw new ConflictException('Attendance already recorded for today');
    }

    const attendance = this.attendanceRepository.create({
      employee_id: employeeId,
      attendance_date: attendanceDate,
      check_in_at: checkInTime,
      check_in_photo: file ? file.path : '',
      check_in_latitude: checkInDto.latitude,
      check_in_longitude: checkInDto.longitude,
      check_out_at: null,
      check_out_photo: null,
      check_out_latitude: null,
      check_out_longitude: null,
      status,
      notes: checkInDto.notes,
    });

    await this.attendanceRepository.save(attendance);

    const { employee_id, ...result } = attendance;
    return result;
  }

  async checkOut(
    employeeId: number,
    checkOutDto: CheckOutDto,
    file: any,
  ) {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (employee.status === EmployeeStatus.INACTIVE) {
      throw new ForbiddenException('Employee is inactive');
    }

    const now = moment();
    const attendanceDate = now.format('YYYY-MM-DD'); // string type
    const checkOutTime = now.toDate(); // Date object type

    const attendanceToUpdate = await this.attendanceRepository.findOne({
      where: {
        employee_id: employeeId,
        attendance_date: attendanceDate,
      },
    });

    if (!attendanceToUpdate) {
      throw new NotFoundException('Attendance not found');
    }

    attendanceToUpdate.check_out_at = checkOutTime;
    attendanceToUpdate.check_out_photo = file ? file.path : '';
    attendanceToUpdate.check_out_latitude = checkOutDto.latitude;
    attendanceToUpdate.check_out_longitude = checkOutDto.longitude;

    const savedAttendance = await this.attendanceRepository.save(attendanceToUpdate);

    const { employee_id, ...result } = savedAttendance;
    return result;
  }

  async getEmployeeAttendances(employeeId: number, filters?: AttendanceFilterDto) {
    const query: FindOptionsWhere<Attendance> = { employee_id: employeeId };

    if (filters) {
      if (filters.date) {
        query.attendance_date = filters.date;
      }
      if (filters.startDate && filters.endDate) {
        query.attendance_date = Between(filters.startDate, filters.endDate);
      }
      if (filters.status) {
        query.status = filters.status;
      }
    }

    const { page = 1, limit = 10 } = filters || {};
    const skip = (page - 1) * limit;

    const [attendances, total] = await this.attendanceRepository.findAndCount({
      where: query,
      skip,
      take: limit,
      order: { attendance_date: 'DESC', check_in_at: 'DESC' },
    });

    return {
      data: attendances,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTodayAttendance(employeeId: number) {
    const today = moment().format('YYYY-MM-DD');

    const attendance = await this.attendanceRepository.findOne({
      where: {
        employee_id: employeeId,
        attendance_date: today,
      },
    });

    if (!attendance) {
      return null;
    }

    const { employee_id, ...result } = attendance;
    return result;
  }

  async getAllAttendances(filters: AttendanceFilterDto) {
    const queryBuilder = this.attendanceRepository.createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee');

    if (filters) {
      if (filters.employeeName) {
        queryBuilder.andWhere('employee.name LIKE :name', { name: `%${filters.employeeName}%` });
      }
      if (filters.date) {
        queryBuilder.andWhere('attendance.attendance_date = :date', { date: filters.date });
      }
      if (filters.startDate && filters.endDate) {
        queryBuilder.andWhere('attendance.attendance_date BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
      }
      if (filters.status) {
        queryBuilder.andWhere('attendance.status = :status', { status: filters.status });
      }
    }

    const { page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const [attendances, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('attendance.attendance_date', 'DESC')
      .addOrderBy('attendance.check_in_at', 'DESC')
      .getManyAndCount();

    return {
      data: attendances,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAttendanceById(id: number) {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: { employee: true },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    const { employee_id, ...result } = attendance;
    return result;
  }

  async getAttendancesByEmployeeId(employeeId: number, filters?: AttendanceFilterDto) {
    const query: FindOptionsWhere<Attendance> = { employee_id: employeeId };

    if (filters) {
      if (filters.date) {
        query.attendance_date = filters.date;
      }
      if (filters.startDate && filters.endDate) {
        query.attendance_date = Between(filters.startDate, filters.endDate);
      }
      if (filters.status) {
        query.status = filters.status;
      }
    }

    const { page = 1, limit = 10 } = filters || {};
    const skip = (page - 1) * limit;

    const [attendances, total] = await this.attendanceRepository.findAndCount({
      where: query,
      skip,
      take: limit,
      relations: { employee: true },
      order: { attendance_date: 'DESC', check_in_at: 'DESC' },
    });

    return {
      data: attendances,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
