import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scope = url.searchParams.get("scope") || "open"; // open|mine|project
  const projectId = url.searchParams.get("projectId") || undefined;
  const auth = await getAuth();

  if (scope === "project" && !projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  let where: any = {};
  if (scope === "open") where = { status: "OPEN" };
  if (scope === "project" && projectId) where = { projectId };
  if (scope === "mine" && auth) {
    if (auth.role === "CLIENT") {
      // cycles across client's projects
      where = { project: { clientId: auth.userId } };
    } else if (auth.role === "TESTER") {
      // cycles tester applied to
      where = { applications: { some: { testerId: auth.userId } } };
    }
  }

  const cycles = await prisma.testCycle.findMany({
    where,
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ cycles });
}

export async function POST(request: Request) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.role !== "CLIENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { projectId, title, description, status, rewardPerBug, maxTesters } = body as {
    projectId: string;
    title: string;
    description: string;
    status?: string;
    rewardPerBug?: number;
    maxTesters?: number;
  };
  if (!projectId || !title || !description) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const cycle = await prisma.testCycle.create({
    data: {
      projectId,
      title,
      description,
      status: status ?? "OPEN",
      rewardPerBug: rewardPerBug ?? 0,
      maxTesters: maxTesters ?? 50,
    },
  });
  return NextResponse.json({ cycle });
}
