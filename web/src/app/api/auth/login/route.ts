import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body as { email: string; password: string };
    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const ok = await bcrypt.compare(password, user.hashedPassword);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
    });
    await setAuthCookie(token);

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
