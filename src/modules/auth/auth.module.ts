import { Module } from '@nestjs/common';
import { AuthServices } from './application/auth.service';
import { AuthRepository } from './infrastructure/auth.repository';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/user.module';
import { HashingServices } from 'src/shared/services/hashing.service';
import { JwtTokenModule } from 'src/shared/modules/jwt-token.module';
import { AuthGuard } from 'src/common/guards/auth.guards';

@Module({
  imports: [UsersModule, JwtTokenModule],
  controllers: [AuthController],
  providers: [AuthServices, AuthRepository, HashingServices, AuthGuard],
})
export class AuthModule {}
