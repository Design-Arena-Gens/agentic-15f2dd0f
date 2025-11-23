import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body as {
      email: string;
      password: string;
      name: string;
      role?: "TESTER" | "CLIENT";
    };

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: role === "CLIENT" ? "CLIENT" : "TESTER",
        hashedPassword,
      },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
    });
    await setAuthCookie(token);

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
