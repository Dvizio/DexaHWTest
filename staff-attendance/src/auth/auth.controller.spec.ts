import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call AuthService.login with the login DTO', async () => {
      const loginDto = {
        username: 'farrel',
        password: 'password123',
      };

      const expected = {
        accessToken: 'test-token',
      };

      mockAuthService.login.mockResolvedValue(expected);

      const result = await controller.login(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expected);
    });
  });
});
