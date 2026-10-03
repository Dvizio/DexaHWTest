import { IsString, IsEmail } from 'class-validator';

export class ChangePasswordDto {
    @IsString()
    oldPassword: string;

    @IsString()
    newPassword: string;
}