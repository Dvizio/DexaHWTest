import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmployeesService } from './employees.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  UpdateEmployeeStatusDto,
} from './dto/employee.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';
import { EmployeeStatus } from './employee.entity';

@Controller('employees')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get('me')
  @Roles(UserRole.EMPLOYEE, UserRole.HRD)
  getProfile(@CurrentUser() user: any) {
    return this.employeesService.findMe(user.employeeId);
  }

  @Post()
  @Roles(UserRole.HRD)
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @Roles(UserRole.HRD)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: EmployeeStatus,
  ) {
    return this.employeesService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      status,
    });
  }

  @Get(':id')
  @Roles(UserRole.HRD)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.HRD)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.HRD)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeStatusDto: UpdateEmployeeStatusDto,
  ) {
    return this.employeesService.updateStatus(id, updateEmployeeStatusDto);
  }
}
