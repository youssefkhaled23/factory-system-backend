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
import { UserQueryDto } from '../dto/user-query.dto';
import { PaginationService } from 'src/shared/services/pagination.service';
import { UserListResponse } from 'src/interfaces/pagination.interfaces';

@Injectable()
export class UsersRepository extends Repository<User> {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly roleRepository: RoleRepository,
    private readonly paginationService: PaginationService,
  ) {
    super(User, dataSource.createEntityManager());
  }

  // Refactored getAllUsers method
  async getAllUsers(query: UserQueryDto): Promise<UserListResponse<User>> {
    const { querySearch, status, roleId } = query;
    this.logger.log('Fetching all users');
    try {
      let queryBuilder = this.createQueryBuilder('user').leftJoinAndSelect(
        'user.role',
        'role',
      );

      // Apply status filter if provided
      if (status !== undefined) {
        queryBuilder = queryBuilder.andWhere('user.status = :status', {
          status,
        });
      }

      // Apply querySearch filter if provided
      if (querySearch) {
        queryBuilder = queryBuilder.andWhere(
          'user.name LIKE :querySearch OR user.email LIKE :querySearch',
          { querySearch: `%${querySearch}%` },
        );
      }

      // Apply roleId filter if provided
      if (roleId) {
        queryBuilder = queryBuilder.andWhere('user.role.id = :roleId', {
          roleId,
        });
      }

      const { pagination, results } = await this.paginationService.pagination(
        queryBuilder,
        query,
      );

      this.logger.log(`Fetched ${results.length} users successfully`);
      return { results, pagination };
    } catch (error) {
      this.logger.error('Failed to fetch users', error.stack);
      throw error;
    }
  }

  // Finding user by email
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

  // Finding user by id
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

  // Updating user details
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

  // Creating a new user
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

  // Deleting user by ID
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

  // Ensuring email uniqueness
  async ensureEmailIsUnique(email: string): Promise<void> {
    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('المستخدم موجود بالفعل');
    }
  }

  // Validating if the role exists
  async validateRoleExists(roleId: string) {
    const role = await this.roleRepository.getRoleById(roleId);

    if (!role) {
      throw new NotFoundException('الدور غير موجود');
    }

    return role;
  }
}
