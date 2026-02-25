import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { AuthServices } from './application/auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from 'src/common/guards/auth.guards';
import type { RequestWithUser } from 'src/interfaces/jwt.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthServices) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User Login' })
  async login(@Body() data: LoginDto) {
    const { existUser, refreshToken, token } =
      await this.authService.login(data);

    return {
      status: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        results: {
          user: {
            id: existUser.id,
            email: existUser.email,
            name: existUser.name,
            role: existUser.role,
          },
          token,
          refreshToken,
        },
      },
    };
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'User Refresh Token' })
  async refresh(@Body() data: RefreshTokenDto) {
    const { refreshToken, token } = await this.authService.refreshToken(data);
    return {
      status: true,
      message: 'تم تحديث التوكن بنجاح',
      data: {
        results: {
          token,
          refreshToken,
        },
      },
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'User Profile' })
  async getProfile(@Req() request: RequestWithUser) {
    const user = await this.authService.getProfile(request.user.sub);
    return {
      status: true,
      message: 'تم جلب البيانات بنجاح',
      data: { results: user },
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User Logout' })
  async logout(@Req() request: RequestWithUser) {
    await this.authService.logout(request.user.sub);

    return {
      status: true,
      message: 'تم تسجيل الخروج بنجاح',
    };
  }
}
