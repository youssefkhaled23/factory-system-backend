import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/infrastructure/database/entities/user.entity';

@Injectable()
export class UsersRepository extends Repository<User> {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(private readonly dataSource: DataSource) {
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
}
