import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/infrastructure/database/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { RoleRepository } from 'src/modules/role/infrastructure/role.repository';

@Injectable()
export class UsersRepository extends Repository<User> {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly roleRepository: RoleRepository,
  ) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.findOneBy({ email });
    } catch (error: unknown) {
      this.logger.error(
        `Failed to find user by email: ${email}`,
        error instanceof Error ? error.stack : undefined,
      );

      return null;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await this.findOneBy({ id });
    } catch (error: unknown) {
      this.logger.error(
        `Failed to find user by id: ${id}`,
        error instanceof Error ? error.stack : undefined,
      );

      return null;
    }
  }

  async updateUser(user: User): Promise<User> {
    try {
      return await this.save(user);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to update user with id: ${user.id}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }

  async createUser(data: CreateUserDto): Promise<User> {
    try {
      const user = this.create(data);
      await this.save(user);
      return user;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to create user with email: ${data.email}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await super.delete(id);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to delete user with id: ${id}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }

  async ensureEmailIsUnique(email: string): Promise<void> {
    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('المستخدم موجود بالفعل');
    }
  }

  async validateRoleExists(roleId: string) {
    const role = await this.roleRepository.getRoleById(roleId);

    if (!role) {
      throw new NotFoundException('الدور غير موجود');
    }

    return role;
  }
}
