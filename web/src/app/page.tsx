import Link from "next/link";

export default function Home() {
  return (
    <div className="grid gap-6 py-12">
      <h1 className="text-3xl font-bold">CrowdTester</h1>
      <p className="text-zinc-700 max-w-2xl">
        A simple crowdtesting platform inspired by Testlio and uTest.
        Create projects and test cycles, recruit testers, and collect bug reports.
      </p>
      <div className="flex gap-4">
        <Link href="/register" className="px-4 py-2 rounded bg-black text-white">Get started</Link>
        <Link href="/login" className="px-4 py-2 rounded border">I already have an account</Link>
      </div>
      <section className="grid md:grid-cols-3 gap-4 pt-8">
        <Feature title="For Clients" desc="Spin up test cycles, invite testers, triage reports, and track payouts." />
        <Feature title="For Testers" desc="Discover open cycles, apply, and earn per approved bug." />
        <Feature title="For Admins" desc="Oversee activity, reports, and platform health." />
      </section>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="font-medium mb-1">{title}</div>
      <p className="text-sm text-zinc-600">{desc}</p>
    </div>
  );
}
