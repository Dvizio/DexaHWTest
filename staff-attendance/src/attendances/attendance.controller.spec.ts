import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { AttendancesController } from './attendances.controller.js';
import { AttendancesService } from './attendances.service.js';
import { UserRole } from '../users/user.entity.js';

describe('AttendancesController', () => {
    let controller: AttendancesController;

    const mockAttendancesService = {
        checkIn: vi.fn(),
        checkOut: vi.fn(),
        getEmployeeAttendances: vi.fn(),
        getTodayAttendance: vi.fn(),
        getAllAttendances: vi.fn(),
        getAttendancesByEmployeeId: vi.fn(),
        getAttendanceById: vi.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AttendancesController],
            providers: [
                {
                    provide: AttendancesService,
                    useValue: mockAttendancesService,
                },
            ],
        }).compile();

        controller = module.get<AttendancesController>(AttendancesController);

        vi.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('checkIn', () => {
        it('should check in an employee with a photo', async () => {
            const user = {
                employeeId: 1,
                role: UserRole.EMPLOYEE,
            };

            const checkInDto = {
                latitude: -6.2,
                longitude: 106.8,
            };

            const file = {
                originalname: 'photo.jpg',
                mimetype: 'image/jpeg',
                filename: 'attendance.jpg',
            } as Express.Multer.File;

            const expected = {
                id: 1,
                message: 'Check-in successful',
            };

            mockAttendancesService.checkIn.mockResolvedValue(expected);

            const result = await controller.checkIn(
                user,
                file,
                checkInDto,
            );

            expect(mockAttendancesService.checkIn).toHaveBeenCalledWith(
                1,
                checkInDto,
                file,
            );

            expect(result).toEqual(expected);
        });

        it('should throw BadRequestException when photo is missing', async () => {
            const user = {
                employeeId: 1,
                role: UserRole.EMPLOYEE,
            };

            const checkInDto = {
                latitude: -6.2,
                longitude: 106.8,
            };

            await expect(
                controller.checkIn(
                    user,
                    undefined as unknown as Express.Multer.File,
                    checkInDto,
                ),
            ).rejects.toThrow(
                new BadRequestException('Photo file is required'),
            );

            expect(mockAttendancesService.checkIn).not.toHaveBeenCalled();
        });
    });

    describe('checkOut', () => {
        it('should check out an employee with a photo', async () => {
            const user = {
                employeeId: 1,
                role: UserRole.EMPLOYEE,
            };

            const checkOutDto = {
                latitude: -6.2,
                longitude: 106.8,
            };

            const file = {
                originalname: 'photo.jpg',
                mimetype: 'image/jpeg',
                filename: 'attendance.jpg',
            } as Express.Multer.File;

            const expected = {
                id: 1,
                message: 'Check-out successful',
            };

            mockAttendancesService.checkOut.mockResolvedValue(expected);

            const result = await controller.checkOut(
                user,
                file,
                checkOutDto,
            );

            expect(mockAttendancesService.checkOut).toHaveBeenCalledWith(
                1,
                checkOutDto,
                file,
            );

            expect(result).toEqual(expected);
        });

        it('should throw BadRequestException when photo is missing', async () => {
            const user = {
                employeeId: 1,
                role: UserRole.EMPLOYEE,
            };

            const checkOutDto = {
                latitude: -6.2,
                longitude: 106.8,
            };

            await expect(
                controller.checkOut(
                    user,
                    undefined as unknown as Express.Multer.File,
                    checkOutDto,
                ),
            ).rejects.toThrow(
                new BadRequestException('Photo file is required'),
            );

            expect(mockAttendancesService.checkOut).not.toHaveBeenCalled();
        });
    });

    describe('getMyAttendances', () => {
        it('should return the employee attendance history', async () => {
            const user = {
                employeeId: 1,
                role: UserRole.EMPLOYEE,
            };

            const filters = {
                page: 1,
                limit: 10,
            };

            const expected = {
                data: [],
                meta: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 1,
                },
            };

            mockAttendancesService.getEmployeeAttendances
                .mockResolvedValue(expected);

            const result = await controller.getMyAttendances(
                user,
                filters,
            );

            expect(
                mockAttendancesService.getEmployeeAttendances,
            ).toHaveBeenCalledWith(1, filters);

            expect(result).toEqual(expected);
        });
    });

    describe('getTodayAttendance', () => {
        it("should return today's attendance", async () => {
            const user = {
                employeeId: 1,
                role: UserRole.EMPLOYEE,
            };

            const expected = {
                id: 1,
                checkIn: new Date(),
                checkOut: null,
            };

            mockAttendancesService.getTodayAttendance
                .mockResolvedValue(expected);

            const result = await controller.getTodayAttendance(user);

            expect(
                mockAttendancesService.getTodayAttendance,
            ).toHaveBeenCalledWith(1);

            expect(result).toEqual(expected);
        });
    });

    describe('getAllAttendances', () => {
        it('should return all attendances', async () => {
            const filters = {
                page: 1,
                limit: 20,
            };

            const expected = {
                data: [],
                meta: {
                    page: 1,
                    limit: 20,
                    total: 0,
                    totalPages: 1,
                },
            };

            mockAttendancesService.getAllAttendances
                .mockResolvedValue(expected);

            const result = await controller.getAllAttendances(filters);

            expect(
                mockAttendancesService.getAllAttendances,
            ).toHaveBeenCalledWith(filters);

            expect(result).toEqual(expected);
        });
    });

    describe('getAttendancesByEmployeeId', () => {
        it('should return attendances for a specific employee', async () => {
            const employeeId = 1;

            const filters = {
                page: 1,
                limit: 10,
            };

            const expected = {
                data: [],
                meta: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 1,
                },
            };

            mockAttendancesService.getAttendancesByEmployeeId
                .mockResolvedValue(expected);

            const result = await controller.getAttendancesByEmployeeId(
                employeeId,
                filters,
            );

            expect(
                mockAttendancesService.getAttendancesByEmployeeId,
            ).toHaveBeenCalledWith(employeeId, filters);

            expect(result).toEqual(expected);
        });
    });

    describe('getAttendanceById', () => {
        it('should return an attendance by id', async () => {
            const attendanceId = 1;

            const expected = {
                id: attendanceId,
                employeeId: 1,
            };

            mockAttendancesService.getAttendanceById
                .mockResolvedValue(expected);

            const result = await controller.getAttendanceById(attendanceId);

            expect(
                mockAttendancesService.getAttendanceById,
            ).toHaveBeenCalledWith(attendanceId);

            expect(result).toEqual(expected);
        });
    });
});

