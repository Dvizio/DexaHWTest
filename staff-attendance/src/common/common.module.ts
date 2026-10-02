import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigService } from './config/database.config.js';
import { Employee } from '../employees/employee.entity.js';
import { User } from '../users/user.entity.js';
import { Attendance } from '../attendances/attendance.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
    TypeOrmModule.forFeature([Employee, User, Attendance]),
  ],
  exports: [TypeOrmModule],
})
export class CommonModule {}
