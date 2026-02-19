import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import { RoleService } from './application/role.service';
import { AuthGuard } from 'src/common/guards/auth.guards';

@Controller({
  path: 'roles',
  version: '1',
})
@UseGuards(AuthGuard)
export class RoleController {
  private readonly logger = new Logger(RoleController.name);
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async getAllRoles() {
    this.logger.log('Fetching all roles');
    const roles = await this.roleService.getAllRoles();
    this.logger.log(`Fetched ${roles.length} roles successfully`);

    return {
      status: true,
      message: 'تم جلب جميع الأدوار بنجاح',
      data: {
        results: roles,
      },
    };
  }
}
