import { AppDataSource } from '../data-source';
import { seedAdminUser } from './admin-users.seeders';
import { seedRoles } from './role.seeders';

async function runSeeders() {
  console.log('ENV CHECK →', {
    DB_USERNAME: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT SET',
    DB_NAME: process.env.DB_NAME,
  });

  await AppDataSource.initialize();

  console.log('🌱 Running seeders...');

  await seedRoles(AppDataSource);
  await seedAdminUser(AppDataSource);

  console.log('✅ Seeding completed');

  process.exit();
}

runSeeders();
