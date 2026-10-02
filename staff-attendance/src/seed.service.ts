import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Employee, EmployeeStatus } from './employees/employee.entity.js';
import { User, UserRole } from './users/user.entity.js';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    const adminUser = await this.userRepository.findOne({
      where: { username: 'admin' },
    });

    if (!adminUser) {
      const employee = this.employeeRepository.create({
        employee_number: 'HRD001',
        name: 'System Admin',
        email: 'admin@wfh.com',
        phone: '08123456789',
        department: 'HRD',
        position: 'HR Manager',
        status: EmployeeStatus.ACTIVE,
      });
      await this.employeeRepository.save(employee);

      const passwordHash = await bcrypt.hash('Admin123!', 10);
      const user = this.userRepository.create({
        employee_id: employee.id,
        username: 'admin',
        password_hash: passwordHash,
        role: UserRole.HRD,
        is_active: true,
      });
      await this.userRepository.save(user);
      console.log('Seed: Admin user created successfully (admin / Admin123!)');
    }
  }
}
