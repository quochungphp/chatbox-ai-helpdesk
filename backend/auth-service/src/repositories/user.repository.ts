import { inject, injectable } from "inversify";
import type { Permission, Role, User } from "@prisma/client";
import { TYPES } from "../bootstrap-type.js";
import { PrismaService } from "../services/prisma.service.js";

export type UserWithAccess = User & {
  role: Role & {
    permissions: Array<{
      permission: Permission;
    }>;
  };
};

export type CreateUserInput = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
  secretKey: string;
  roleName?: string;
};

export type UpdateUserProfileInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

/**
 * Database access layer for users, roles, and permissions. Service classes
 * depend on this repository instead of calling Prisma directly.
 */
@injectable()
export class UserRepository {
  constructor(@inject(TYPES.PrismaService) private readonly prisma: PrismaService) {}

  /**
   * Finds a user by id and includes role + permission access metadata.
   */
  async findById(id: string): Promise<UserWithAccess | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: this.userAccessInclude()
    });
  }

  /**
   * Finds a user by normalized email.
   */
  async findByEmail(email: string): Promise<UserWithAccess | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: this.userAccessInclude()
    });
  }

  /**
   * Finds a user by username.
   */
  async findByUsername(username: string): Promise<UserWithAccess | null> {
    return this.prisma.user.findUnique({
      where: { username },
      include: this.userAccessInclude()
    });
  }

  /**
   * Checks signup uniqueness across email and username.
   */
  async findByEmailOrUsername(email: string, username: string): Promise<UserWithAccess | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { username }]
      },
      include: this.userAccessInclude()
    });
  }

  /**
   * Creates the user and ensures the requested role has baseline permissions.
   */
  async create(input: CreateUserInput): Promise<UserWithAccess> {
    const role = await this.ensureRole(input.roleName ?? "employee");

    return this.prisma.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        username: input.username,
        email: input.email.toLowerCase(),
        phone: input.phone,
        passwordHash: input.passwordHash,
        secretKey: input.secretKey,
        roleId: role.id
      },
      include: this.userAccessInclude()
    });
  }

  /**
   * Updates profile fields and reloads access metadata.
   */
  async updateById(id: string, input: UpdateUserProfileInput): Promise<UserWithAccess | null> {
    return this.prisma.user.update({
      where: { id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email.toLowerCase(),
        phone: input.phone
      },
      include: this.userAccessInclude()
    });
  }

  /**
   * Replaces the stored password hash after PasswordService has hashed it.
   */
  async updatePassword(id: string, passwordHash: string): Promise<UserWithAccess> {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash },
      include: this.userAccessInclude()
    });
  }

  /**
   * Keeps Prisma include shape consistent for every user read path.
   */
  private userAccessInclude() {
    return {
      role: {
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      }
    } as const;
  }

  /**
   * Creates missing roles lazily so local demos do not need a seed step first.
   */
  private async ensureRole(roleName: string): Promise<Role> {
    const role = await this.prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `${roleName} role`
      }
    });

    await this.ensureDefaultPermissions(role.id, roleName);
    return role;
  }

  /**
   * Attaches default permissions to a role in an idempotent way.
   */
  private async ensureDefaultPermissions(roleId: string, roleName: string): Promise<void> {
    const permissions = roleName === "admin" ? adminPermissions : employeePermissions;

    for (const permissionInput of permissions) {
      const permission = await this.prisma.permission.upsert({
        where: { name: permissionInput.name },
        update: {},
        create: permissionInput
      });

      await this.prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId,
          permissionId: permission.id
        }
      });
    }
  }
}

const employeePermissions = [
  {
    name: "profile:read",
    resource: "profile",
    action: "read",
    description: "Read own user profile"
  },
  {
    name: "profile:update",
    resource: "profile",
    action: "update",
    description: "Update own user profile"
  },
  {
    name: "password:update",
    resource: "password",
    action: "update",
    description: "Change own password"
  }
];

const adminPermissions = [
  ...employeePermissions,
  {
    name: "users:manage",
    resource: "users",
    action: "manage",
    description: "Manage platform users"
  },
  {
    name: "roles:manage",
    resource: "roles",
    action: "manage",
    description: "Manage roles and permissions"
  }
];
