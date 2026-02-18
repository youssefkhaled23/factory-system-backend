import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtTokenService } from '../services/jwt-token.service';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [JwtTokenService],
  exports: [JwtTokenService],
})
export class JwtTokenModule {}
