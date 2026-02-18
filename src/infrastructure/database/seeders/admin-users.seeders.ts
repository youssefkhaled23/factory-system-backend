import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import * as argon2 from 'argon2';
import { UserStatusEnum } from '../../../common/enums/enums';

export async function seedAdminUser(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);

  const adminEmail: string = 'admin@factory.com';
  const adminPassword: string = 'Admin@123';

  const existingUser = await userRepo.findOne({
    where: { email: adminEmail },
  });

  if (existingUser) {
    console.log('⚠ Admin user already exists');
    return;
  }

  const superAdminRole = await roleRepo.findOne({
    where: { role_name: 'superadmin' },
  });

  if (!superAdminRole) {
    throw new Error('❌ superadmin role not found. Run roles seeder first.');
  }

  const hashedPassword: string = await argon2.hash(adminPassword);

  const adminUser = userRepo.create({
    name: 'Super Admin',
    email: adminEmail,
    password: hashedPassword,
    role: superAdminRole,
    status: UserStatusEnum.ACTIVE,
  });

  await userRepo.save(adminUser);

  console.log('✅ Admin user created');
  console.log(`📧 Email: ${adminEmail}`);
  console.log(`🔑 Password: ${adminPassword}`);
}
