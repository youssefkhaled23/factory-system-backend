import { DataSource } from 'typeorm';
import { Role } from '../entities/role.entity';
import { RolesEnum } from '../../../common/enums/enums';

export async function seedRoles(dataSource: DataSource) {
  const roleRepo = dataSource.getRepository(Role);

  const roles: Array<{ role_name: string; role_key: RolesEnum }> = [
    { role_name: 'superadmin', role_key: RolesEnum.SUPER_ADMIN },
    { role_name: 'admin', role_key: RolesEnum.ADMIN },
  ];

  for (const roleData of roles) {
    const exists = await roleRepo.findOne({
      where: [{ role_key: roleData.role_key }],
    });

    if (!exists) {
      const role = roleRepo.create(roleData);
      await roleRepo.save(role);
      console.log(
        `✅ Role created: ${roleData.role_name} (${roleData.role_key})`,
      );
    } else {
      console.log(
        `⚠ Role already exists: ${roleData.role_name} (${roleData.role_key})`,
      );
    }
  }
}
