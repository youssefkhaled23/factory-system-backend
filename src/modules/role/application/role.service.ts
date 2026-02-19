import { Injectable, Logger } from '@nestjs/common';
import { RoleRepository } from '../infrastructure/role.repository';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);
  constructor(private readonly roleRepository: RoleRepository) {}

  async getAllRoles() {
    this.logger.log('Fetching all roles');
    try {
      const roles = await this.roleRepository.getAllRoles();
      this.logger.log(`Fetched ${roles.length} roles successfully`);
      return roles;
    } catch (error) {
      this.logger.error('Failed to fetch roles', error.stack);
      throw error;
    }
  }
}
