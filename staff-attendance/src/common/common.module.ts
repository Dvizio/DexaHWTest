import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employees/employee.entity.js';
import { User } from '../users/user.entity.js';
import { Attendance } from '../attendances/attendance.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, User, Attendance]),
  ],
  exports: [TypeOrmModule],
})
export class CommonModule { }