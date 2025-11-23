import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.role !== "CLIENT" && auth.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const where = auth.role === "ADMIN" ? {} : { clientId: auth.userId };
  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.role !== "CLIENT")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { title, description } = body as { title: string; description: string };
  if (!title || !description)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const project = await prisma.project.create({
    data: { title, description, clientId: auth.userId },
  });
  return NextResponse.json({ project });
}
