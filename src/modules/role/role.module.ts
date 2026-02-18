import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/infrastructure/database/entities/role.entity';
import { RoleService } from './application/role.service';
import { RoleController } from './role.controller';
import { RoleRepository } from './infrastructure/role.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository],
  exports: [TypeOrmModule],
})
export class RoleModule {}
