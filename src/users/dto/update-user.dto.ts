import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  @MinLength(2)
  username?: string;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;
}
