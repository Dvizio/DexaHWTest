import { IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CheckOutDto {
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude: number;

    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude: number;

    @IsOptional()
    @IsString()
    notes?: string;
}
