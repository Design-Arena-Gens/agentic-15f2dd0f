"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"TESTER" | "CLIENT">("TESTER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto grid gap-4">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input className="border rounded px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="flex gap-3 items-center text-sm">
          <label className="flex gap-2 items-center"><input type="radio" name="role" checked={role==="TESTER"} onChange={()=>setRole("TESTER")} /> Tester</label>
          <label className="flex gap-2 items-center"><input type="radio" name="role" checked={role==="CLIENT"} onChange={()=>setRole("CLIENT")} /> Client</label>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">{loading ? "Creating..." : "Create account"}</button>
      </form>
    </div>
  );
}
