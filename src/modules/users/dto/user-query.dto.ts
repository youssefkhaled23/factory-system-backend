import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { UserStatusEnum } from 'src/common/enums/enums';

export class UserQueryDto {
  @IsOptional()
  @IsString({ message: 'البحث يجب أن يكون نصًا' })
  querySearch?: string;

  @IsOptional()
  @IsInt({ message: 'الصفحة يجب أن تكون رقم صحيح' })
  @Min(1, { message: 'الصفحة يجب أن تبدأ من 1' })
  page?: number;

  @IsEnum(UserStatusEnum, {
    message: 'الحالة يجب أن تكون واحدة من: active, inactive',
  })
  @IsOptional()
  status?: UserStatusEnum;

  @IsOptional()
  @IsBoolean({ message: 'يجب أن يكون has_pagination قيمة صحيحة' })
  @Transform(({ value }): boolean => {
    return typeof value === 'string' ? value.toLowerCase() === 'true' : value;
  })
  hasPagination?: boolean;

  @IsOptional()
  @IsString({ message: 'roleId يجب أن يكون نصًا' })
  roleId: string;

  @IsOptional()
  @IsInt({ message: 'الحد الأقصى يجب أن يكون رقم صحيح' })
  @Min(1, { message: 'الحد الأقصى يجب أن يكون على الأقل 1' })
  @Max(100, { message: 'الحد الأقصى لا يمكن أن يتجاوز 100' })
  limit?: number;
}
