"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function MembershipGate({ status, email }: { status: "pending" | "rejected"; email: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  async function signOut() {
    await supabase?.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return <main className="account-page">
    <nav className="nav account-nav"><Link className="brand" href="/"><span className="brand-mark">R</span><span>TYPE R <em>GARAGE</em><small>PORTUGAL</small></span></Link><button className="gate-signout" onClick={signOut}>Sair</button></nav>
    <section className="membership-gate"><p className="eyebrow"><span /> Adesão à comunidade</p><h1>{status === "pending" ? <>PEDIDO EM<br /><i>ANÁLISE.</i></> : <>ACESSO NÃO<br /><i>APROVADO.</i></>}</h1><p>{status === "pending" ? "O administrador vai confirmar o teu número com os membros do grupo de WhatsApp. Receberás acesso à garagem depois da aprovação." : "Não foi possível confirmar a tua adesão ao grupo de WhatsApp. Fala com um administrador do grupo para rever o pedido."}</p><small>{email}</small><Link className="text-link" href="/">← Voltar ao site</Link></section>
  </main>;
}
