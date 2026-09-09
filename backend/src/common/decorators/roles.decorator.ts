import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * @Roles('ADMIN') – attach required roles to a route handler or controller.
 * Read by RolesGuard via the Reflector.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
