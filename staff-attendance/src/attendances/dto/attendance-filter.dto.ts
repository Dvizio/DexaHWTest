import { IsOptional, IsDateString, IsEnum, IsInt, Min, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { AttendanceStatus } from '../attendance.entity.js';

export class AttendanceFilterDto {
  @IsOptional()
  @IsString()
  employeeName?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
