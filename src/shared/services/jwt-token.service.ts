import {
  Injectable,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { PAYLOAD, REFRESHPAYLOAD } from 'src/interfaces/jwt.interface';

@Injectable()
export class JwtTokenService {
  private readonly logger = new Logger(JwtTokenService.name);

  constructor(private readonly jwtService: JwtService) {}

  private readonly ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
  private readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

  async generateAccessToken(
    payload: PAYLOAD,
    expiresIn: StringValue | number = '15m',
  ): Promise<string> {
    try {
      return await this.jwtService.signAsync(payload, {
        secret: this.ACCESS_SECRET,
        expiresIn,
      });
    } catch (error) {
      this.logger.error(
        `Failed to generate ACCESS token for sub => ${payload.sub}`,
        error,
      );

      throw new InternalServerErrorException('Access token generation failed');
    }
  }

  async generateRefreshToken(
    payload: REFRESHPAYLOAD,
    expiresIn: StringValue | number = '7d',
  ): Promise<string> {
    try {
      return await this.jwtService.signAsync(payload, {
        secret: this.REFRESH_SECRET,
        expiresIn,
      });
    } catch (error) {
      this.logger.error(
        `Failed to generate REFRESH token for sub => ${payload.sub}`,
        error,
      );

      throw new InternalServerErrorException('Refresh token generation failed');
    }
  }
  async generateAuthTokens(payload: PAYLOAD) {
    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken({
      sub: payload.sub,
      email: payload.email,
    });

    return { accessToken, refreshToken };
  }
  async verifyAccessToken(token: string): Promise<PAYLOAD> {
    try {
      return await this.jwtService.verifyAsync<PAYLOAD>(token, {
        secret: this.ACCESS_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token', error);
    }
  }

  async verifyRefreshToken(token: string): Promise<REFRESHPAYLOAD> {
    try {
      return await this.jwtService.verifyAsync<REFRESHPAYLOAD>(token, {
        secret: this.REFRESH_SECRET,
      });
    } catch (error) {
      this.logger.error('error to verify refreshToken', error);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
