import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (auth.role === "TESTER") {
    const applications = await prisma.application.findMany({
      where: { testerId: auth.userId },
      include: { cycle: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ applications });
  }

  if (auth.role === "CLIENT") {
    const applications = await prisma.application.findMany({
      where: { cycle: { project: { clientId: auth.userId } } },
      include: { tester: true, cycle: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ applications });
  }

  // admin
  const applications = await prisma.application.findMany({
    include: { tester: true, cycle: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ applications });
}

export async function POST(request: Request) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.role !== "TESTER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { cycleId } = body as { cycleId: string };
  if (!cycleId) return NextResponse.json({ error: "cycleId required" }, { status: 400 });

  try {
    const app = await prisma.application.create({
      data: { cycleId, testerId: auth.userId },
    });
    return NextResponse.json({ application: app });
  } catch (e) {
    return NextResponse.json({ error: "Already applied or invalid" }, { status: 400 });
  }
}
