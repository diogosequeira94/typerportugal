import Link from "next/link";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";
import MembershipGate from "./MembershipGate";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return <main className="account-page"><nav className="nav account-nav"><Link className="brand" href="/"><span className="brand-mark">R</span><span>TYPE R <em>GARAGE</em><small>PORTUGAL</small></span></Link><Link className="back-link" href="/">← Voltar ao site</Link></nav><section className="dashboard-setup"><p className="eyebrow"><span /> Configuração</p><h1>LIGA A TUA<br /><i>GARAGEM.</i></h1><p>Cria o projeto Supabase, executa o ficheiro <code>supabase/schema.sql</code> e adiciona as duas variáveis descritas no README.</p></section></main>;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const isAdmin = user.app_metadata?.role === "admin";
  const { data: profile } = await supabase!.from("member_profiles").select("status").eq("id", user.id).maybeSingle();
  if (!isAdmin && profile?.status !== "approved") {
    return <MembershipGate status={profile?.status === "rejected" ? "rejected" : "pending"} email={user.email ?? ""} />;
  }

  return <DashboardClient user={{ id: user.id, email: user.email ?? "", name: String(user.user_metadata?.name ?? "Membro Type R"), isAdmin }} />;
}
