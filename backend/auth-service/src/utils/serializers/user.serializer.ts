import type { UserWithAccess } from "../../repositories/user.repository.js";

export function serializeUser(user: UserWithAccess) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    phone: user.phone,
    provider: user.provider,
    role: {
      id: user.role.id,
      name: user.role.name,
      description: user.role.description
    },
    permissions: user.role.permissions.map(({ permission }) => ({
      id: permission.id,
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description
    })),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

