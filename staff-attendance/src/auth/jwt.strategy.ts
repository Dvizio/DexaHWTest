import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret) {
            throw new Error('JWT_SECRET is not configured');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });

    }

    async validate(payload: any) {
        const user = await this.userRepository.findOne({
            where: { id: payload.sub },
            relations: { employee: true },
        });

        if (!user || !user.is_active || user.employee?.status === 'INACTIVE') {
            throw new UnauthorizedException('User is inactive or unauthorized');
        }

        return {
            userId: payload.sub,
            employeeId: payload.employeeId,
            role: payload.role,
            username: user.username,
        };
    }
}
