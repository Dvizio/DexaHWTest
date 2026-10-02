import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Employee } from '../employees/employee.entity';
import { Attendance } from './attendance.entity';
import { AttendancesService } from './attendances.service';
import { AttendancesController } from './attendances.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Employee]),
    MulterModule.register(),
  ],
  controllers: [AttendancesController],
  providers: [AttendancesService],
  exports: [AttendancesService],
})
export class AttendancesModule {}
