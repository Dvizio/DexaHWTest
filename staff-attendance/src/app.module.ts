import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigService } from './common/config/database.config';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { AttendancesModule } from './attendances/attendances.module';
import { SeedService } from './seed.service';
import { Employee } from './employees/employee.entity';
import { User } from './users/user.entity';
import { Attendance } from './attendances/attendance.entity';

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
