import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (auth.role === "TESTER") {
    const reports = await prisma.bugReport.findMany({
      where: { reporterId: auth.userId },
      include: { cycle: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ reports });
  }

  if (auth.role === "CLIENT") {
    const reports = await prisma.bugReport.findMany({
      where: { cycle: { project: { clientId: auth.userId } } },
      include: { cycle: true, reporter: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ reports });
  }

  const reports = await prisma.bugReport.findMany({
    include: { cycle: true, reporter: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reports });
}

export async function POST(request: Request) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.role !== "TESTER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { cycleId, title, description, steps, severity } = body as {
    cycleId: string;
    title: string;
    description: string;
    steps: string;
    severity?: string;
  };
  if (!cycleId || !title || !description || !steps) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const report = await prisma.bugReport.create({
    data: {
      cycleId,
      reporterId: auth.userId,
      title,
      description,
      steps,
      severity: severity ?? "LOW",
      status: "SUBMITTED",
    },
  });
  return NextResponse.json({ report });
}
