import cors from "cors";
import express from "express";
import type { Express } from "express";
import helmet from "helmet";
import { health, success } from "@ai-service-desk/shared/utils";

const serviceName = "banking-service";

const applications = [
  { id: "app_payments", name: "Payments Hub", allowedDepartments: ["Digital Banking", "Payments"] },
  { id: "app_core", name: "Core Banking Portal", allowedDepartments: ["Technology Operations", "Branch Operations"] }
];

export function createApp(): Express {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json(health(serviceName)));
  app.get("/ready", (_req, res) => res.json(health(serviceName)));

  app.get("/api/banking/profile/:userId", (req, res) => {
    res.json(
      success({
        userId: req.params.userId,
        department: "Digital Banking",
        location: "Ho Chi Minh City",
        employeeType: "permanent"
      })
    );
  });

  app.get("/api/banking/applications", (_req, res) => res.json(success(applications)));

  app.post("/api/banking/access-check", (req, res) => {
    const { applicationId, department } = req.body as { applicationId?: string; department?: string };
    const application = applications.find((item) => item.id === applicationId);
    res.json(
      success({
        allowed: Boolean(application && department && application.allowedDepartments.includes(department)),
        application
      })
    );
  });

  return app;
}
