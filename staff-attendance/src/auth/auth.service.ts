import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity.js';
import { LoginDto } from './dto/login.dto.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async login(loginDto: LoginDto) {
        const user = await this.userRepository.findOne({
            where: { username: loginDto.username },
            relations: { employee: true },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
            loginDto.password,
            user.password_hash,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.is_active) {
            throw new UnauthorizedException('User account is inactive');
        }

        if (user.employee?.status === 'INACTIVE') {
            throw new UnauthorizedException('Employee is inactive');
        }

        const payload = {
            sub: user.id,
            employeeId: user.employee_id,
            role: user.role,
            username: user.username,
        };

        const refreshSecret = this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET');
        const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN');
        const refreshToken = this.jwtService.sign(payload, {
            secret: refreshSecret,
            expiresIn: refreshExpiresIn as any,
        });
        const accessToken = this.jwtService.sign(payload);


        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                employeeId: user.employee_id,
            },
        };
    }

    async refreshToken(refreshToken: string) {
        try {
            const refreshSecret = this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET');

            if (!refreshSecret) {
                throw new Error('Refresh token secret is not configured');
            }

            const decoded = this.jwtService.verify(refreshToken, { secret: refreshSecret });
            const payload = {
                sub: decoded.sub,
                employeeId: decoded.employeeId,
                role: decoded.role,
                username: decoded.username,
            };
            const accessToken = this.jwtService.sign(payload);
            return {
                access_token: accessToken,
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

}
