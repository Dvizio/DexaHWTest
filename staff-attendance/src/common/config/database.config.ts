import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Employee } from '../../employees/employee.entity.js';
import { User } from '../../users/user.entity.js';
import { Attendance } from '../../attendances/attendance.entity.js';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const url = this.configService.get<string>('DATABASE_URL');
    return {
      type: 'mysql',
      url,
      entities: [Employee, User, Attendance],
      synchronize: this.configService.get<string>('NODE_ENV') === 'development',
      logging: false,
      autoLoadEntities: true,
    };
  }
}
