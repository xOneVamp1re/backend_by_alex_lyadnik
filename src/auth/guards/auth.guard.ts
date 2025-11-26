import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../../interfaces/jwt-payload.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Аутентификация - проверка JWT токена
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    let user: JwtPayload;
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      // Валидация структуры payload
      if (!this.isValidJwtPayload(payload)) {
        throw new UnauthorizedException('Invalid token payload structure');
      }

      user = {
        sub: payload.sub,
        email: payload.email,
        username: payload.username,
        isAdmin: payload.isAdmin,
      };

      request.user = user;
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }

    // 2. Авторизация - проверка ролей
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some((role: string) => {
        return this.checkUserRole(user, role);
      });

      if (!hasRequiredRole) {
        throw new ForbiddenException(
          `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
        );
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }

  private isValidJwtPayload(payload: unknown): payload is JwtPayload {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'sub' in payload &&
      'email' in payload &&
      'username' in payload &&
      'isAdmin' in payload &&
      typeof (payload as JwtPayload).sub === 'string' &&
      typeof (payload as JwtPayload).email === 'string' &&
      typeof (payload as JwtPayload).username === 'string' &&
      typeof (payload as JwtPayload).isAdmin === 'boolean'
    );
  }

  private checkUserRole(user: JwtPayload, role: string): boolean {
    switch (role) {
      case 'admin':
        return user.isAdmin === true;
      case 'user':
        return true; // Все аутентифицированные пользователи
      default:
        return false;
    }
  }
}
