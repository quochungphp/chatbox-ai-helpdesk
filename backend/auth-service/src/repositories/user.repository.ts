import { injectable } from "inversify";
import type { UserRole } from "@ai-service-desk/shared/types";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  department: string;
  role: UserRole;
};

const users: AuthUser[] = [
  {
    id: "usr_001",
    email: "employee@nab-demo.local",
    name: "Demo Employee",
    department: "Digital Banking",
    role: "employee"
  },
  {
    id: "usr_002",
    email: "admin@nab-demo.local",
    name: "Service Desk Admin",
    department: "Technology Operations",
    role: "admin"
  }
];

@injectable()
export class UserRepository {
  findByEmail(email: string): AuthUser | null {
    return users.find((user) => user.email === email) ?? null;
  }

  getDefaultUser(): AuthUser {
    return users[0];
  }
}

