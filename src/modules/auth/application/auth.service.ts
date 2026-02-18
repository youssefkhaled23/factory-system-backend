import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { LoginDto } from '../dto/login.dto';
import { UsersRepository } from 'src/modules/users/infrastructure/user.repository';
import { HashingServices } from 'src/shared/services/hashing.service';
import { JwtTokenService } from 'src/shared/services/jwt-token.service';
import { PAYLOAD, REFRESHPAYLOAD } from 'src/interfaces/jwt.interface';
import { User } from 'src/infrastructure/database/entities/user.entity';
import { UserStatusEnum } from 'src/common/enums/enums';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

@Injectable()
export class AuthServices {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashingServices: HashingServices,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async login(
    data: LoginDto,
  ): Promise<{ token: string; refreshToken: string; existUser: User }> {
    const { email, password } = data;

    const existUser = await this.usersRepository.findByEmail(email);

    if (!existUser) {
      throw new NotFoundException('هذا المستخدم غير موجود');
    }

    if (existUser.status !== UserStatusEnum.ACTIVE) {
      throw new BadRequestException('هذا المستخدم غير نشط');
    }

    if (!existUser.password) {
      throw new BadRequestException('بيانات المستخدم غير مكتملة');
    }

    const isPasswordMatched = await this.hashingServices.compare(
      password,
      existUser.password,
    );

    if (!isPasswordMatched) {
      throw new BadRequestException(
        'كلمة المرور او البريد الالكتروني غير صحيح',
      );
    }

    const lastLoginAt = Date.now();
    const normalizedLastLoginAt = Math.floor(lastLoginAt / 1000) * 1000;

    const payload: PAYLOAD = {
      sub: existUser.id,
      email: existUser.email,
      roleId: existUser.role.id,
      lastLoginAt: normalizedLastLoginAt,
    };
    const refreshPayload: REFRESHPAYLOAD = {
      sub: existUser.id,
      email: existUser.email,
    };

    const token = await this.jwtTokenService.generateAccessToken(payload, '1h');

    const refreshToken = await this.jwtTokenService.generateRefreshToken(
      refreshPayload,
      '7d',
    );

    const hashedRefreshToken = await this.hashingServices.hash(refreshToken);

    existUser.refresh_token = hashedRefreshToken;
    existUser.last_login = new Date(normalizedLastLoginAt);

    await this.usersRepository.updateUser(existUser);

    return {
      token,
      refreshToken,
      existUser,
    };
  }

  async logout(userId: string): Promise<void> {
    const existUser = await this.usersRepository.findById(userId);

    if (!existUser) {
      throw new NotFoundException('هذا المستخدم غير موجود');
    }

    existUser.refresh_token = null;
    existUser.last_login = null;

    await this.usersRepository.updateUser(existUser);
  }

  async getProfile(userId: string): Promise<User> {
    const existUser = await this.usersRepository.findById(userId);

    if (!existUser) {
      throw new NotFoundException('هذا المستخدم غير موجود');
    }

    return existUser;
  }

  async refreshToken(data: RefreshTokenDto) {
    const { refreshToken } = data;

    const payload = await this.jwtTokenService.verifyRefreshToken(refreshToken);

    const existUser = await this.usersRepository.findById(payload.sub);

    if (!existUser) {
      throw new NotFoundException('هذا المستخدم غير موجود');
    }

    if (existUser.status !== UserStatusEnum.ACTIVE) {
      throw new BadRequestException('هذا المستخدم غير نشط');
    }

    if (!existUser.refresh_token) {
      throw new BadRequestException('لا يوجد توكن تحديث لهذا المستخدم');
    }

    const isRefreshTokenMatched = await this.hashingServices.compare(
      refreshToken,
      existUser.refresh_token,
    );

    if (!isRefreshTokenMatched) {
      throw new BadRequestException('توكن التحديث غير صالح');
    }

    const normalizedLastLoginAt =
      Math.floor(Number(existUser.last_login) / 1000) * 1000;

    const accessTokenPayload: PAYLOAD = {
      sub: existUser.id,
      email: existUser.email,
      roleId: existUser.role.id,
      lastLoginAt: normalizedLastLoginAt,
    };

    const newAccessToken = await this.jwtTokenService.generateAccessToken(
      accessTokenPayload,
      '1h',
    );

    const refreshTokenPayload: REFRESHPAYLOAD = {
      sub: existUser.id,
      email: existUser.email,
    };

    const newRefreshToken = await this.jwtTokenService.generateRefreshToken(
      refreshTokenPayload,
      '7d',
    );

    const hashedNewRefreshToken =
      await this.hashingServices.hash(newRefreshToken);

    existUser.refresh_token = hashedNewRefreshToken;

    await this.usersRepository.updateUser(existUser);

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
