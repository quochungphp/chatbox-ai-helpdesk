import type { DemoUserInput } from "../src/clients/auth.client.js";

export const demoPassword = "DemoBank@12345";

export const authUsers: DemoUserInput[] = [
  {
    email: "employee.vn@demo-bank.local",
    firstName: "Lan",
    lastName: "Nguyen",
    password: demoPassword,
    phone: "+84900000001",
    roleName: "employee",
    username: "lan.nguyen"
  },
  {
    email: "agent.vn@demo-bank.local",
    firstName: "Minh",
    lastName: "Tran",
    password: demoPassword,
    phone: "+84900000002",
    roleName: "service_desk_agent",
    username: "minh.tran"
  },
  {
    email: "platform.engineer@demo-bank.local",
    firstName: "An",
    lastName: "Pham",
    password: demoPassword,
    phone: "+84900000003",
    roleName: "platform_engineer",
    username: "an.pham"
  },
  {
    email: "admin@demo-bank.local",
    firstName: "Hoa",
    lastName: "Le",
    password: demoPassword,
    phone: "+84900000004",
    roleName: "admin",
    username: "hoa.le"
  }
];
