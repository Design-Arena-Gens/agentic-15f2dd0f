import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const auth = await getAuth();
  if (!auth) {
    return (
      <div>
        <p>You must be signed in.</p>
        <Link className="underline" href="/login">Go to login</Link>
      </div>
    );
  }

  if (auth.role === "CLIENT") return <ClientDashboard userId={auth.userId} />;
  if (auth.role === "TESTER") return <TesterDashboard userId={auth.userId} />;
  return <AdminDashboard />;
}

async function ClientDashboard({ userId }: { userId: string }) {
  const projects = await prisma.project.findMany({ where: { clientId: userId } });
  const cycles = await prisma.testCycle.findMany({ where: { project: { clientId: userId } }, include: { project: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Client dashboard</h1>
      <CreateProjectForm />
      <section>
        <h2 className="font-medium mb-2">Your projects</h2>
        <ul className="grid gap-2">
          {projects.map((p)=> (
            <li key={p.id} className="rounded border p-3">
              <div className="font-medium">{p.title}</div>
              <p className="text-sm text-zinc-600 mb-2">{p.description}</p>
              <CreateCycleForm projectId={p.id} />
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-medium mb-2">Your cycles</h2>
        <ul className="grid gap-2">
          {cycles.map((c)=> (
            <li key={c.id} className="rounded border p-3">
              <div className="font-medium">{c.title} <span className="text-xs ml-2 px-2 py-0.5 border rounded">{c.status}</span></div>
              <p className="text-sm text-zinc-600">{c.description}</p>
              <div className="text-xs text-zinc-500 mt-1">Project: {c.project.title}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

async function TesterDashboard({ userId }: { userId: string }) {
  const openCycles = await prisma.testCycle.findMany({ where: { status: "OPEN" }, include: { project: { include: { client: true } } }, orderBy: { createdAt: "desc" } });
  const myApps = await prisma.application.findMany({ where: { testerId: userId }, include: { cycle: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Tester dashboard</h1>
      <section>
        <h2 className="font-medium mb-2">Open cycles</h2>
        <ul className="grid gap-2">
          {openCycles.map((c) => (
            <li key={c.id} className="rounded border p-3">
              <div className="font-medium">{c.title} <span className="text-xs ml-2 px-2 py-0.5 border rounded">{c.status}</span></div>
              <p className="text-sm text-zinc-600">{c.description}</p>
              <div className="text-xs text-zinc-500 mt-1">Project: {c.project.title}</div>
              <ApplyButton cycleId={c.id} />
              <ReportForm cycleId={c.id} />
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-medium mb-2">My applications</h2>
        <ul className="grid gap-2">
          {myApps.map((a)=> (
            <li key={a.id} className="rounded border p-3">
              <div className="font-medium">{a.cycle.title}</div>
              <div className="text-sm">Status: {a.status}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

async function AdminDashboard() {
  const users = await prisma.user.count();
  const reports = await prisma.bugReport.count();
  const cycles = await prisma.testCycle.count();
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Users" value={users} />
        <Stat label="Cycles" value={cycles} />
        <Stat label="Reports" value={reports} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border bg-white p-4">
      <div className="text-sm text-zinc-600">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function CreateProjectForm() {
  return (
    <form className="grid gap-2 rounded border p-3" action={async (formData: FormData) => {
      "use server";
      const title = String(formData.get("title") || "");
      const description = String(formData.get("description") || "");
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
    }}>
      <div className="font-medium">Create new project</div>
      <input className="border rounded px-3 py-2" name="title" placeholder="Title" />
      <textarea className="border rounded px-3 py-2" name="description" placeholder="Description" />
      <button className="px-3 py-2 rounded bg-black text-white w-fit">Create project</button>
    </form>
  );
}

function CreateCycleForm({ projectId }: { projectId: string }) {
  return (
    <form className="grid gap-2 rounded border p-3 mt-2" action={async (formData: FormData) => {
      "use server";
      const title = String(formData.get("title") || "");
      const description = String(formData.get("description") || "");
      const rewardPerBug = Number(formData.get("rewardPerBug") || 0);
      await fetch("/api/cycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, title, description, rewardPerBug, status: "OPEN" }),
      });
    }}>
      <div className="text-sm font-medium">Create cycle</div>
      <input className="border rounded px-3 py-2" name="title" placeholder="Title" />
      <textarea className="border rounded px-3 py-2" name="description" placeholder="Description" />
      <input className="border rounded px-3 py-2" name="rewardPerBug" type="number" placeholder="Reward per bug (cents)" />
      <button className="px-3 py-2 rounded bg-black text-white w-fit">Create cycle</button>
    </form>
  );
}

function ApplyButton({ cycleId }: { cycleId: string }) {
  return (
    <form action={async () => {
      "use server";
      await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cycleId }),
      });
    }}>
      <button className="mt-2 px-3 py-1.5 rounded border">Apply</button>
    </form>
  );
}

function ReportForm({ cycleId }: { cycleId: string }) {
  return (
    <form className="grid gap-2 mt-2" action={async (formData: FormData) => {
      "use server";
      const title = String(formData.get("title") || "");
      const description = String(formData.get("description") || "");
      const steps = String(formData.get("steps") || "");
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cycleId, title, description, steps, severity: "LOW" }),
      });
    }}>
      <input className="border rounded px-3 py-2" name="title" placeholder="Bug title" />
      <textarea className="border rounded px-3 py-2" name="description" placeholder="Description" />
      <textarea className="border rounded px-3 py-2" name="steps" placeholder="Reproduction steps" />
      <button className="px-3 py-2 rounded bg-black text-white w-fit">Submit report</button>
    </form>
  );
}
