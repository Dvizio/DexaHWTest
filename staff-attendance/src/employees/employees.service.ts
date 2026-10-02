import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindManyOptions, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Employee, EmployeeStatus } from './employee.entity.js';
import { User, UserRole } from '../users/user.entity.js';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  UpdateEmployeeStatusDto,
} from './dto/employee.dto.js';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async create(createEmployeeDto: CreateEmployeeDto, role: UserRole = UserRole.EMPLOYEE) {
    const employeeExists = await this.employeeRepository.findOne({
      where: [
        { employee_number: createEmployeeDto.employee_number },
        { email: createEmployeeDto.email },
      ],
    });

    if (employeeExists) {
      throw new ConflictException('Employee number or email already exists');
    }

    const employee = this.employeeRepository.create({
      ...createEmployeeDto,
      status: EmployeeStatus.ACTIVE,
    });
    await this.employeeRepository.save(employee);

    const username = createEmployeeDto.email.split('@')[0];
    const password = 'Welcome123!';
    const passwordHash = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      employee_id: employee.id,
      username,
      password_hash: passwordHash,
      role,
      is_active: true,
    });
    await this.userRepository.save(user);

    const { password_hash, ...userWithoutHash } = user;
    return {
      employee,
      user: userWithoutHash,
      temporaryPassword: password,
    };
  }

  async findAll(filters: {
    page?: number;
    limit?: number;
    search?: string;
    status?: EmployeeStatus;
  }) {
    const { page = 1, limit = 10, search, status } = filters;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Employee> = {};
    if (status) where.status = status;
    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [employees, total] = await this.employeeRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: employees,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    const { password_hash, ...userWithoutHash } = employee.user;
    return {
      ...employee,
      user: userWithoutHash,
    };
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.findOne(id);

    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const emailExists = await this.employeeRepository.findOne({
        where: { email: updateEmployeeDto.email },
      });
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    Object.assign(employee, updateEmployeeDto);
    await this.employeeRepository.save(employee);
    return employee;
  }

  async updateStatus(id: number, updateEmployeeStatusDto: UpdateEmployeeStatusDto) {
    const employee = await this.findOne(id);
    employee.status = updateEmployeeStatusDto.status;
    await this.employeeRepository.save(employee);

    if (updateEmployeeStatusDto.status === EmployeeStatus.INACTIVE) {
      await this.userRepository.update(
        { employee_id: id },
        { is_active: false },
      );
    }
    return employee;
  }

  async findMe(employeeId: number) {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
      relations: { user: true },
    });

    if (!employee) {
      throw new NotFoundException(`Employee not found`);
    }

    const { password_hash, ...userWithoutHash } = employee.user;
    return {
      ...employee,
      user: userWithoutHash,
    };
  }
}
