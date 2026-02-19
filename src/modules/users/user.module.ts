import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UsersServices } from './application/user.service';
import { UsersRepository } from './infrastructure/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/infrastructure/database/entities/user.entity';
import { RoleModule } from '../role/role.module';
import { HashingServices } from 'src/shared/services/hashing.service';
import { PaginationService } from 'src/shared/services/pagination.service';
@Module({
  imports: [TypeOrmModule.forFeature([User]), RoleModule],
  controllers: [UsersController],
  providers: [
    UsersServices,
    UsersRepository,
    HashingServices,
    PaginationService,
  ],
  exports: [TypeOrmModule, UsersRepository],
})
export class UsersModule {}
