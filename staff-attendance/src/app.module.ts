import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigService } from './common/config/database.config.js';
import { CommonModule } from './common/common.module.js';
import { AuthModule } from './auth/auth.module.js';
import { EmployeesModule } from './employees/employees.module.js';
import { AttendancesModule } from './attendances/attendances.module.js';
import { SeedService } from './seed.service.js';
import { Employee } from './employees/employee.entity.js';
import { User } from './users/user.entity.js';
import { Attendance } from './attendances/attendance.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
    TypeOrmModule.forFeature([Employee, User, Attendance]),
    CommonModule,
    AuthModule,
    EmployeesModule,
    AttendancesModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
