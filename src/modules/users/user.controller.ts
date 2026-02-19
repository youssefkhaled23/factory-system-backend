import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { UsersServices } from './application/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UploadFile } from 'src/common/decorators/upload-file.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UserStatusEnum } from 'src/common/enums/enums';
import { AuthGuard } from 'src/common/guards/auth.guards';

@Controller({
  path: 'users',
  version: '1',
})
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersServices: UsersServices) {}

  @Post('add')
  @UploadFile({
    fieldName: 'avatar',
  })
  async createUser(
    @Body() data: CreateUserDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    const payload = {
      ...data,
      avatar: avatar.path,
    };

    const user = await this.usersServices.createUser(payload);
    return {
      status: true,
      message: 'تم إنشاء المستخدم بنجاح',
      data: {
        results: user,
      },
    };
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.usersServices.deleteUser(id);
    return {
      status: true,
      message: 'تم حذف المستخدم بنجاح',
    };
  }

  @Patch(':id')
  @UploadFile({
    fieldName: 'avatar',
  })
  async updateUser(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    if (avatar) {
      data.avatar = avatar.path;
    }

    const user = await this.usersServices.updateUser(id, data);
    return {
      status: true,
      message: 'تم تحديث المستخدم بنجاح',
      data: {
        results: user,
      },
    };
  }

  @Patch(':id/update-password')
  async updateUserPassword(
    @Body() data: UpdateUserPasswordDto,
    @Param('id') id: string,
  ) {
    const user = await this.usersServices.updateUserPassword(id, data);
    return {
      status: true,
      message: 'تم تحديث كلمة المرور بنجاح',
      data: {
        results: user,
      },
    };
  }

  @Patch(':id/update-status/:status')
  async updateStatus(
    @Param('id') id: string,
    @Param('status') status: UserStatusEnum,
  ) {
    const user = await this.usersServices.updateUserStatus(id, status);
    return {
      status: true,
      message: 'تم تحديث حالة المستخدم بنجاح',
      data: {
        results: user,
      },
    };
  }
}
