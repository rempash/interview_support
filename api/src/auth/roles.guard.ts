import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../users/role.enum';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true; // No roles required, allow access
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false; // Not authenticated
    }

    // Superuser can access everything
    if (user.role === Role.SUPERUSER) {
      return true;
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    if (!hasRole) {
      throw new ForbiddenException(`Access restricted. Requires one of the following roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
