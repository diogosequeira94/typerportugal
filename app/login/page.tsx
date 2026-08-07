"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setMessage("");
    setMessageType("");

    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, whatsapp },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      setLoading(false);
      if (error) {
        setMessageType("error");
        return setMessage(error.message);
      }
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setMessageType("success");
        setMessage("Conta criada. Confirma o email; depois, a adesão será validada pelo administrador do grupo.");
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessageType("error");
      return setMessage("Email ou palavra-passe incorretos.");
    }
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
    router.refresh();
  }

  return (
    <main className="account-page">
      <nav className="nav account-nav">
        <Link className="brand" href="/"><span className="brand-mark">R</span><span>TYPE R <em>GARAGE</em><small>PORTUGAL</small></span></Link>
        <Link className="back-link" href="/">← Voltar ao site</Link>
      </nav>
      <section className="auth-shell">
        <div className="auth-intro"><p className="eyebrow"><span /> Área de membros</p><h1>A TUA<br /><i>GARAGEM.</i></h1><p>Regista os teus Type R, atualiza os detalhes e partilha as fotografias com a comunidade.</p></div>
        <div className="auth-card">
          <div className="auth-tabs"><button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Entrar</button><button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Criar conta</button></div>
          {!supabase ? <div className="setup-notice"><b>Falta ligar o Supabase</b><p>Adiciona as variáveis de ambiente indicadas no README para ativar o registo.</p></div> : <form onSubmit={handleSubmit}>
            {mode === "register" && <label>Nome<input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label>}
            {mode === "register" && <label>Número de WhatsApp<input required type="tel" placeholder="+351 900 000 000" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} autoComplete="tel" /><small className="field-hint"><b>Porque pedimos?</b> Serve apenas para confirmar que pertences ao grupo de WhatsApp. Não fica público nem será usado para enviar mensagens.</small></label>}
            <label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
            <label>Palavra-passe<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"} /></label>
            {message && <p className={`form-message ${messageType}`} role="status">{message}</p>}
            <button className="primary account-primary" disabled={loading}>{loading ? "A processar…" : mode === "login" ? "Entrar na garagem" : "Criar a minha conta"}<span>→</span></button>
          </form>}
        </div>
      </section>
    </main>
  );
}
