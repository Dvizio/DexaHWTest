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
import * as crypto from 'crypto';
import moment from 'moment';
import { AttendancesService } from './attendances.service.js';
import { CheckInDto } from './dto/check-in.dto.js';
import { CheckOutDto } from './dto/check-out.dto.js';
import { AttendanceFilterDto } from './dto/attendance-filter.dto.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRole } from '../users/user.entity.js';

export type AttendanceAction = 'CHECKIN' | 'CHECKOUT';

interface AuthenticatedRequest extends Request {
  user?: {
    userId?: number;
    employeeId?: number;
    username?: string;
    role?: string;
    sub?: number;
  };
}

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

export const createAttendanceStorage = (action: AttendanceAction) =>
  diskStorage({
    destination: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void,
    ) => {
      const dir = process.env.UPLOAD_DIR || 'uploads/attendance';
      cb(null, dir);
    },
    filename: (
      req: AuthenticatedRequest,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      // 1. Authenticated User Identifier (with sanitization)
      const rawUserIdentifier =
        req.user?.username ||
        (req.user?.employeeId ? `EMP_${req.user.employeeId}` : 'anonymous');
      const sanitizedUsername = rawUserIdentifier.replace(/[^a-zA-Z0-9_-]/g, '');

      // 2. Formatted timestamp YYYYMMDD_HHMMSS
      const timestamp = moment().format('YYYYMMDD_HHmmss');

      // 3. 4-character random hex suffix to prevent collisions
      const randomSuffix = crypto.randomBytes(2).toString('hex');

      // 4. File extension in lowercase
      const ext = extname(file.originalname).toLowerCase() || '.jpg';

      // 5. Output format: YYYYMMDD_HHMMSS_{RANDOM4}_{USERNAME}_{ACTION}{EXTENSION}
      const finalFileName = `${timestamp}_${randomSuffix}_${sanitizedUsername}_${action}${ext}`;

      cb(null, finalFileName);
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
      storage: createAttendanceStorage('CHECKIN'),
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
      storage: createAttendanceStorage('CHECKOUT'),
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