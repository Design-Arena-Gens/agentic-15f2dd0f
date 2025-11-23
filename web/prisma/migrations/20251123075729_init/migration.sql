-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'TESTER',
    "hashedPassword" TEXT NOT NULL,
    "bio" TEXT,
    "payoutInfo" TEXT
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestCycle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startAt" DATETIME,
    "endAt" DATETIME,
    "rewardPerBug" INTEGER NOT NULL DEFAULT 0,
    "maxTesters" INTEGER NOT NULL DEFAULT 50,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "TestCycle_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'APPLIED',
    "testerId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    CONSTRAINT "Application_testerId_fkey" FOREIGN KEY ("testerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Application_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "TestCycle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BugReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'LOW',
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "screenshotUrls" TEXT,
    "rewardCents" INTEGER NOT NULL DEFAULT 0,
    "reporterId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    CONSTRAINT "BugReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BugReport_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "TestCycle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amountCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "testerId" TEXT NOT NULL,
    CONSTRAINT "Payout_testerId_fkey" FOREIGN KEY ("testerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Application_testerId_cycleId_key" ON "Application"("testerId", "cycleId");
