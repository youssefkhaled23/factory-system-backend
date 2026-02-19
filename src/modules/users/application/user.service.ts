import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { UsersRepository } from 'src/modules/users/infrastructure/user.repository';
import { RoleRepository } from 'src/modules/role/infrastructure/role.repository';
import { HashingServices } from 'src/shared/services/hashing.service';

import { CreateUserDto } from '../dto/create-user.dto';
import { User } from 'src/infrastructure/database/entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { deleteFile } from 'src/utils/file.util';
import { RolesEnum, UserStatusEnum } from 'src/common/enums/enums';
import { UpdateUserPasswordDto } from '../dto/update-user-password.dto';

@Injectable()
export class UsersServices {
  private readonly logger = new Logger(UsersServices.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly roleRepository: RoleRepository,
    private readonly hashingService: HashingServices,
  ) {}

  async createUser(data: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${data.email}`);

    try {
      await this.usersRepository.ensureEmailIsUnique(data.email);
      this.logger.debug(`Email is unique: ${data.email}`);
      const role = await this.roleRepository.getRoleById(data.roleId);
      if (!role) {
        this.logger.warn(`Role not found: ${data.roleId}`);
        throw new NotFoundException('الدور غير موجود');
      }

      const hashedPassword = await this.hashingService.hash(data.password);
      this.logger.debug(`Password hashed for: ${data.email}`);

      const userToCreate = {
        ...data,
        password: hashedPassword,
        role,
      };

      const newUser = await this.usersRepository.createUser(userToCreate);

      this.logger.log(`User created successfully → ID: ${newUser.id}`);

      return newUser;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to create user with email: ${data.email}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    this.logger.log(`Deleting user with ID: ${id}`);

    const existingUser = await this.usersRepository.findById(id);

    if (!existingUser) {
      this.logger.warn(`User not found for deletion → ID: ${id}`);
      throw new NotFoundException('المستخدم غير موجود');
    }

    if (existingUser.avatar) {
      await deleteFile(existingUser.avatar);
      this.logger.log(`Deleted previous avatar for user → ID: ${id}`);
    }

    try {
      await this.usersRepository.deleteUser(id);
      this.logger.log(`User deleted successfully → ID: ${id}`);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to delete user with ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  async updateUser(id: string, data: UpdateUserDto) {
    this.logger.log(`Attempting to update user with ID: ${id}`);

    try {
      const existingUser = await this.usersRepository.findById(id);

      if (!existingUser) {
        this.logger.warn(`User not found → ID: ${id}`);
        throw new NotFoundException('المستخدم غير موجود');
      }

      if (existingUser.status !== UserStatusEnum.ACTIVE) {
        throw new BadRequestException('لا يمكن تحديث مستخدم غير نشط');
      }

      if (data.password) {
        this.logger.warn(
          `Password update attempt blocked for user → ID: ${id}`,
        );
        throw new BadRequestException(
          'لا يمكن تحديث كلمة المرور من خلال هذا المسار',
        );
      }

      if (data.roleId) {
        this.logger.warn(`Role update attempt blocked for user → ID: ${id}`);
        throw new BadRequestException('لا يمكن تحديث الدور من خلال هذا المسار');
      }

      if (data.avatar && existingUser.avatar) {
        await deleteFile(existingUser.avatar);
        this.logger.log(`Deleted previous avatar for user → ID: ${id}`);
      }

      const userToUpdate = {
        ...existingUser,
        ...data,
      };

      const updatedUser = await this.usersRepository.updateUser(userToUpdate);

      this.logger.log(`User updated successfully → ID: ${id}`);

      return updatedUser;
    } catch (error) {
      this.logger.error(`Failed to update user → ID: ${id}`, error.stack);
      throw error;
    }
  }

  async updateUserPassword(id: string, data: UpdateUserPasswordDto) {
    this.logger.log(`Attempting to update password for user → ID: ${id}`);
    const existingUser = await this.usersRepository.findById(id);

    if (!existingUser) {
      this.logger.warn(`User not found for password update → ID: ${id}`);
      throw new NotFoundException('المستخدم غير موجود');
    }

    if (existingUser.status !== UserStatusEnum.ACTIVE) {
      throw new BadRequestException(
        'لا يمكن تحديث كلمة المرور لمستخدم غير نشط',
      );
    }

    try {
      const hashedPassword = await this.hashingService.hash(data.newPassword);
      existingUser.password = hashedPassword;

      const updatedUser = await this.usersRepository.updateUser(existingUser);

      this.logger.log(`Password updated successfully → ID: ${id}`);

      return updatedUser;
    } catch (error) {
      this.logger.error(
        `Failed to update password for user → ID: ${id}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateUserStatus(id: string, status: UserStatusEnum) {
    this.logger.log(
      `Attempting to update status for user → ID: ${id} to ${status}`,
    );
    const existingUser = await this.usersRepository.findById(id);

    if (!existingUser) {
      this.logger.warn(`User not found for status update → ID: ${id}`);
      throw new NotFoundException('المستخدم غير موجود');
    }

    const userRole = await this.roleRepository.getRoleById(
      existingUser.role.id,
    );

    if (userRole?.role_key === RolesEnum.SUPER_ADMIN) {
      throw new ConflictException(
        'لا يمكن تحديث حالة مستخدم لديه دور SUPER ADMIN',
      );
    }

    if (existingUser.status !== UserStatusEnum.ACTIVE) {
      throw new BadRequestException('لا يمكن تحديث حالة مستخدم غير نشط');
    }

    try {
      existingUser.status = status;
      const updatedUser = await this.usersRepository.updateUser(existingUser);
      this.logger.log(`Status updated successfully → ID: ${id} to ${status}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(
        `Failed to update status for user → ID: ${id}`,
        error.stack,
      );
      throw error;
    }
  }
}
