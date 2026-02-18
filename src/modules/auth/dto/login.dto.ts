import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@factory.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    example: 'Admin@123',
    description: 'User password',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password too short' })
  password: string;
}
