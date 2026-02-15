import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InjectDataSource, TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => databaseConfig(config),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger('Database');

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  onModuleInit() {
    if (this.dataSource.isInitialized) {
      this.logger.log('Database connected successfully');
    } else {
      this.logger.error('Database connection failed');
    }
  }
}
