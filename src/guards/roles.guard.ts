import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'generated/prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { verify } from 'jsonwebtoken';

@Injectable()
export class RolesGuard implements CanActivate {
  matchRoles(requiredRoles: Role[], userRole: Role): boolean {
    return requiredRoles.includes(userRole);
  }
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get(Roles, context.getHandler());

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authHeader.split(' ')[1];

    try {
      const user = verify(token, process.env.JWT_SECRET_KEY || 'secret');
      const userRole = (user as any).role.toUpperCase();
      return this.matchRoles(requiredRoles, userRole);
    } catch (e) {
      throw new ForbiddenException('Invalid token');
    }
  }
}
