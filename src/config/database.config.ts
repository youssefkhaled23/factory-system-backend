import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (
  config: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql',

  host: config.get<string>('DB_HOST'),
  port: Number(config.get<number>('DB_PORT')),
  username: config.get<string>('DB_USER'),
  password: config.get<string>('DB_PASSWORD'),
  database: config.get<string>('DB_NAME'),

  autoLoadEntities: true,

  synchronize: config.get('NODE_ENV') !== 'production',
  logging: config.get('NODE_ENV') !== 'production',

  charset: 'utf8mb4',
  timezone: 'Z',
});
