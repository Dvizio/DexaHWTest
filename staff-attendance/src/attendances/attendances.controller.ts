import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AttendancesService } from './attendances.service.js';
import { CheckInDto } from './dto/check-in.dto.js';
import { CheckOutDto } from './dto/check-out.dto.js';
import { AttendanceFilterDto } from './dto/attendance-filter.dto.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRole } from '../users/user.entity.js';

const allowedMimes = ['image/jpeg', 'image/png'];
const maxFileSize = 5 * 1024 * 1024;

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(
      new BadRequestException('Only JPG/JPEG and PNG files are allowed'),
      false,
    );
  }
  cb(null, true);
};

const storage = diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    const dir = process.env.UPLOAD_DIR || 'uploads/attendance';
    cb(null, dir);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    cb(null, `${randomName}${extname(file.originalname)}`);
  },
});

@Controller('attendances')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) { }

  @Post('check-in')
  @Roles(UserRole.EMPLOYEE)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage,
      fileFilter,
      limits: { fileSize: maxFileSize },
    }),
  )
  async checkIn(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() checkInDto: CheckInDto,
  ) {
    if (!file) {
      throw new BadRequestException('Photo file is required');
    }
    return this.attendancesService.checkIn(user.employeeId, checkInDto, file);
  }

  @Post('check-out')
  @Roles(UserRole.EMPLOYEE)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage,
      fileFilter,
      limits: { fileSize: maxFileSize },
    }),
  )
  async checkOut(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() checkOutDto: CheckOutDto,
  ) {
    if (!file) {
      throw new BadRequestException('Photo file is required');
    }
    return this.attendancesService.checkOut(user.employeeId, checkOutDto, file);
  }

  @Get('me')
  @Roles(UserRole.EMPLOYEE)
  getMyAttendances(
    @CurrentUser() user: any,
    @Query() filters: AttendanceFilterDto,
  ) {
    return this.attendancesService.getEmployeeAttendances(
      user.employeeId,
      filters,
    );
  }

  @Get('me/today')
  @Roles(UserRole.EMPLOYEE)
  getTodayAttendance(@CurrentUser() user: any) {
    return this.attendancesService.getTodayAttendance(user.employeeId);
  }

  @Get()
  @Roles(UserRole.HRD)
  getAllAttendances(@Query() filters: AttendanceFilterDto) {
    return this.attendancesService.getAllAttendances(filters);
  }

  @Get('employee/:employeeId')
  @Roles(UserRole.HRD)
  getAttendancesByEmployeeId(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query() filters: AttendanceFilterDto,
  ) {
    return this.attendancesService.getAttendancesByEmployeeId(
      employeeId,
      filters,
    );
  }

  @Get(':id')
  @Roles(UserRole.HRD)
  getAttendanceById(@Param('id', ParseIntPipe) id: number) {
    return this.attendancesService.getAttendanceById(id);
  }
}