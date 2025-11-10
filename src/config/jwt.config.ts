import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const getJWTConfig = (
  configService: ConfigService,
): JwtModuleOptions => {
  const secret = configService.get<string>('JWT_SECRET');

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return {
    secret: secret,
    signOptions: {
      expiresIn: configService.get('JWT_EXPIRES_IN') || '30d',
    },
  };
};
