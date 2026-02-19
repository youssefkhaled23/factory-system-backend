import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateUserPasswordDto {
  @IsString()
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون على الأقل 8 أحرف' })
  @MaxLength(20, { message: 'كلمة المرور يجب أن تكون أقل من 20 حرفًا' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).*$/, {
    message:
      'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل، ورقم، ورمز خاص مثل (!@#$%^&*)',
  })
  newPassword: string;
}
