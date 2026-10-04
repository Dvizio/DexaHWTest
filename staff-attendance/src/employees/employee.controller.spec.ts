import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { EmployeesController } from './employees.controller.js';
import { EmployeesService } from './employees.service.js';
import { EmployeeStatus } from './employee.entity.js';
import { UserRole } from '../users/user.entity.js';

describe('EmployeesController', () => {
    let controller: EmployeesController;

    const mockEmployeesService = {
        findMe: vi.fn(),
        changePassword: vi.fn(),
        create: vi.fn(),
        findAll: vi.fn(),
        findOne: vi.fn(),
        update: vi.fn(),
        updateStatus: vi.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EmployeesController],
            providers: [
                {
                    provide: EmployeesService,
                    useValue: mockEmployeesService,
                },
            ],
        }).compile();

        controller = module.get<EmployeesController>(EmployeesController);

        vi.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getProfile', () => {
        it('should return the current employee profile', async () => {
            const user = {
                employeeId: 1,
                role: UserRole.EMPLOYEE,
            };

            const expected = {
                id: 1,
                name: 'James',
            };

            mockEmployeesService.findMe.mockResolvedValue(expected);

            const result = await controller.getProfile(user);

            expect(mockEmployeesService.findMe).toHaveBeenCalledWith(1);
            expect(result).toEqual(expected);
        });
    });

    describe('changePassword', () => {
        it('should change the employee password', async () => {
            const user = {
                employeeId: 1,
                role: UserRole.EMPLOYEE,
            };

            const dto = {
                currentPassword: 'old',
                newPassword: 'new',
            };

            const expected = {
                message: 'Password changed successfully',
            };

            mockEmployeesService.changePassword.mockResolvedValue(expected);

            const result = await controller.changePassword(user, dto);

            expect(mockEmployeesService.changePassword)
                .toHaveBeenCalledWith(1, dto);

            expect(result).toEqual(expected);
        });
    });

    describe('create', () => {
        it('should create an employee', async () => {
            const dto = {
                name: 'John Doe',
            };

            const expected = {
                id: 1,
                name: 'John Doe',
            };

            mockEmployeesService.create.mockResolvedValue(expected);

            const result = await controller.create(dto as any);

            expect(mockEmployeesService.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(expected);
        });
    });

    describe('findAll', () => {
        it('should return employees with default pagination', async () => {
            const expected = {
                data: [],
                total: 0,
            };

            mockEmployeesService.findAll.mockResolvedValue(expected);

            const result = await controller.findAll();

            expect(mockEmployeesService.findAll).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
                search: undefined,
                status: undefined,
            });

            expect(result).toEqual(expected);
        });

        it('should pass pagination and filters to the service', async () => {
            const expected = {
                data: [],
                total: 0,
            };

            mockEmployeesService.findAll.mockResolvedValue(expected);

            await controller.findAll(
                '2',
                '20',
                'Farrel',
                EmployeeStatus.ACTIVE,
            );

            expect(mockEmployeesService.findAll).toHaveBeenCalledWith({
                page: 2,
                limit: 20,
                search: 'Farrel',
                status: EmployeeStatus.ACTIVE,
            });
        });
    });

    describe('findOne', () => {
        it('should return an employee by id', async () => {
            const expected = {
                id: 1,
                name: 'John Doe',
            };

            mockEmployeesService.findOne.mockResolvedValue(expected);

            const result = await controller.findOne(1);

            expect(mockEmployeesService.findOne).toHaveBeenCalledWith(1);
            expect(result).toEqual(expected);
        });
    });

    describe('update', () => {
        it('should update an employee', async () => {
            const dto = {
                name: 'Updated Name',
            };

            const expected = {
                id: 1,
                name: 'Updated Name',
            };

            mockEmployeesService.update.mockResolvedValue(expected);

            const result = await controller.update(1, dto as any);

            expect(mockEmployeesService.update).toHaveBeenCalledWith(1, dto);
            expect(result).toEqual(expected);
        });
    });

    describe('updateStatus', () => {
        it('should update employee status', async () => {
            const dto = {
                status: EmployeeStatus.ACTIVE,
            };

            const expected = {
                id: 1,
                status: EmployeeStatus.ACTIVE,
            };

            mockEmployeesService.updateStatus.mockResolvedValue(expected);

            const result = await controller.updateStatus(1, dto);

            expect(mockEmployeesService.updateStatus)
                .toHaveBeenCalledWith(1, dto);

            expect(result).toEqual(expected);
        });
    });
});