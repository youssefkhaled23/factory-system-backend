import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Role } from 'src/infrastructure/database/entities/role.entity';

@Injectable()
export class RoleRepository extends Repository<Role> {
  private readonly logger = new Logger(RoleRepository.name);

  constructor(private readonly dataSource: DataSource) {
    super(Role, dataSource.createEntityManager());
  }

  async getRoleById(id: string): Promise<Role | null> {
    try {
      const role = await this.findOneBy({ id });
      return role;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to retrieve role with id: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );

      return null;
    }
  }
}
