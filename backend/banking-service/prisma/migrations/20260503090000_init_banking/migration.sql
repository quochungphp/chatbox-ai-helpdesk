-- CreateTable
CREATE TABLE "BankingEmployee" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "fullName" VARCHAR(120) NOT NULL,
    "department" VARCHAR(120) NOT NULL,
    "location" VARCHAR(120) NOT NULL,
    "employeeType" VARCHAR(40) NOT NULL,
    "jobTitle" VARCHAR(120) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankingEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankingApplication" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "ownerDepartment" VARCHAR(120) NOT NULL,
    "supportGroup" VARCHAR(120) NOT NULL,
    "allowedDepartments" TEXT[],
    "approvalRequired" BOOLEAN NOT NULL DEFAULT true,
    "riskLevel" VARCHAR(40) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankingApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankingEmployee_email_key" ON "BankingEmployee"("email");

-- CreateIndex
CREATE INDEX "BankingEmployee_department_idx" ON "BankingEmployee"("department");

-- CreateIndex
CREATE UNIQUE INDEX "BankingApplication_name_key" ON "BankingApplication"("name");

-- CreateIndex
CREATE INDEX "BankingApplication_ownerDepartment_idx" ON "BankingApplication"("ownerDepartment");

-- CreateIndex
CREATE INDEX "BankingApplication_riskLevel_idx" ON "BankingApplication"("riskLevel");
