import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigService } from './config/database.config';
import { Employee } from '../employees/employee.entity';
import { User } from '../users/user.entity';
import { Attendance } from '../attendances/attendance.entity';

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
