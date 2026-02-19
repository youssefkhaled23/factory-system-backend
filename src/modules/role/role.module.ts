import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/infrastructure/database/entities/role.entity';
import { RoleService } from './application/role.service';
import { RoleController } from './role.controller';
import { RoleRepository } from './infrastructure/role.repository';
import { UsersRepository } from '../users/infrastructure/user.repository';
import { PaginationService } from 'src/shared/services/pagination.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository, UsersRepository, PaginationService],
  exports: [TypeOrmModule, RoleRepository],
})
export class RoleModule {}
