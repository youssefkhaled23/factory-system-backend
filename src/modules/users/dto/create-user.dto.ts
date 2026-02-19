import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsUUID,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'اسم المستخدم',
    example: 'Ahmed Hassan',
  })
  @IsString({ message: 'الاسم لازم يكون نص' })
  @IsNotEmpty({ message: 'الاسم مطلوب' })
  name: string;

  @ApiProperty({
    description: 'البريد الإلكتروني',
    example: 'ahmed@example.com',
  })
  @IsEmail({}, { message: 'صيغة البريد الإلكتروني غير صحيحة' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email: string;

  @ApiProperty({
    description: 'كلمة المرور',
    example: 'StrongPass123',
  })
  @IsString({ message: 'كلمة المرور لازم تكون نص' })
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون على الأقل 8 أحرف' })
  @MaxLength(20, { message: 'كلمة المرور يجب أن تكون أقل من 20 حرفًا' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).*$/, {
    message:
      'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل، ورقم، ورمز خاص مثل (!@#$%^&*)',
  })
  password: string;

  @ApiProperty({
    description: 'معرف الدور (Role ID)',
    example: 'a3f7c2e2-8c8f-4d3f-b8e2-123456789abc',
  })
  @IsUUID('4', { message: 'Role ID غير صالح' })
  @IsNotEmpty({ message: 'Role ID مطلوب' })
  roleId: string;

  @ApiPropertyOptional()
  @IsOptional()
  avatar?: string;
}
