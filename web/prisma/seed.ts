// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Upsert users
  const adminPass = await bcrypt.hash("admin123", 10);
  const clientPass = await bcrypt.hash("client123", 10);
  const testerPass = await bcrypt.hash("tester123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { email: "admin@example.com", name: "Admin", role: "ADMIN", hashedPassword: adminPass },
  });

  const client = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: { email: "client@example.com", name: "Client Corp", role: "CLIENT", hashedPassword: clientPass },
  });

  const tester = await prisma.user.upsert({
    where: { email: "tester@example.com" },
    update: {},
    create: { email: "tester@example.com", name: "Test User", role: "TESTER", hashedPassword: testerPass },
  });

  const project = await prisma.project.create({
    data: {
      title: "Mobile App",
      description: "E2E testing for our new mobile app",
      clientId: client.id,
    },
  });

  await prisma.testCycle.createMany({
    data: [
      { title: "Cycle 1", description: "Login and onboarding", status: "OPEN", rewardPerBug: 500, maxTesters: 100, projectId: project.id },
      { title: "Cycle 2", description: "Payments and checkout", status: "OPEN", rewardPerBug: 1000, maxTesters: 50, projectId: project.id },
    ],
  });

  console.log("Seeded users: ", { admin: admin.email, client: client.email, tester: tester.email });
}

main().finally(async () => {
  await prisma.$disconnect();
});
