"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getTypeRPreset, typeRPresets } from "@/lib/type-r-models";

type Photo = { id: string; storage_path: string; public_url: string; position: number };
type ReviewStatus = "pending" | "published" | "rejected";
type Car = {
  id: string; owner_id: string; slug: string; owner_name: string; model: string;
  generation: string; year: number; color: string; power_cv: number; torque_nm: number | null;
  transmission: string; location: string | null; description: string | null;
  instagram: string | null; facebook: string | null; status: ReviewStatus;
  cover_image_url: string | null; car_photos: Photo[];
};
type MemberProfile = { id: string; email: string; name: string; whatsapp: string; status: "pending" | "approved" | "rejected"; created_at: string };
type OwnerMode = "self" | "member";

type FormState = {
  owner_name: string; model: string; generation: string; year: string; color: string;
  power_cv: string; torque_nm: string; transmission: string; location: string;
  description: string; instagram: string; facebook: string; status: ReviewStatus;
};

const emptyForm = (name: string): FormState => ({
  owner_name: name, model: "Civic Type R", generation: "", year: "", color: "",
  power_cv: "", torque_nm: "", transmission: "Manual de 6 velocidades", location: "",
  description: "", instagram: "", facebook: "", status: "pending",
});

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function DashboardClient({ user }: { user: { id: string; email: string; name: string; isAdmin: boolean } }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [cars, setCars] = useState<Car[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [ownerMode, setOwnerMode] = useState<OwnerMode>("self");
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [editing, setEditing] = useState<Car | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm(user.name));
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");
  const pendingMemberCount = members.filter((member) => member.status === "pending").length;
  const approvedMembers = members.filter((member) => member.status === "approved");
  const selectedPreset = getTypeRPreset(form.generation);

  const loadCars = useCallback(async () => {
    if (!supabase) return;
    let query = supabase.from("cars").select("*, car_photos(*)").order("created_at", { ascending: false });
    if (!user.isAdmin) query = query.eq("owner_id", user.id);
    const { data, error } = await query;
    setLoading(false);
    if (error) return setMessage(error.message);
    setCars((data as Car[]) ?? []);
  }, [supabase, user.id, user.isAdmin]);

  const loadMembers = useCallback(async () => {
    if (!supabase || !user.isAdmin) return;
    const { data, error } = await supabase.from("member_profiles").select("*").neq("id", user.id).order("created_at", { ascending: false });
    if (error) return setMessage(error.message);
    setMembers((data as MemberProfile[]) ?? []);
  }, [supabase, user.id, user.isAdmin]);

  useEffect(() => {
    if (!supabase) return;
    let query = supabase.from("cars").select("*, car_photos(*)").order("created_at", { ascending: false });
    if (!user.isAdmin) query = query.eq("owner_id", user.id);
    void query.then(({ data, error }) => {
        setLoading(false);
        if (error) setMessage(error.message);
        else setCars((data as Car[]) ?? []);
      });
  }, [supabase, user.id, user.isAdmin]);

  useEffect(() => {
    if (!supabase || !user.isAdmin) return;
    void supabase.from("member_profiles").select("*").neq("id", user.id).order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) setMessage(error.message);
      else setMembers((data as MemberProfile[]) ?? []);
    });
  }, [supabase, user.id, user.isAdmin]);

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function chooseGeneration(event: ChangeEvent<HTMLSelectElement>) {
    const preset = getTypeRPreset(event.target.value);
    setForm((current) => ({
      ...current,
      generation: event.target.value,
      model: "Civic Type R",
      power_cv: preset ? String(preset.powerCv) : "",
      transmission: preset?.transmission ?? current.transmission,
    }));
  }

  function startEdit(car: Car) {
    setEditing(car);
    if (user.isAdmin) {
      const isOwnCar = car.owner_id === user.id;
      setOwnerMode(isOwnCar ? "self" : "member");
      setSelectedOwnerId(isOwnCar ? "" : car.owner_id);
    }
    setForm({
      owner_name: car.owner_name, model: car.model, generation: car.generation,
      year: String(car.year), color: car.color, power_cv: String(car.power_cv),
      torque_nm: car.torque_nm ? String(car.torque_nm) : "", transmission: car.transmission,
      location: car.location ?? "", description: car.description ?? "",
      instagram: car.instagram ?? "", facebook: car.facebook ?? "", status: car.status,
    });
    setFiles([]); setMessage(""); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditing(null); setOwnerMode("self"); setSelectedOwnerId("");
    setForm(emptyForm(user.name)); setFiles([]); setMessage("");
  }

  function chooseOwnerMode(mode: OwnerMode) {
    setOwnerMode(mode);
    setSelectedOwnerId("");
    setForm((current) => ({ ...current, owner_name: mode === "self" ? user.name : "" }));
  }

  function chooseMemberOwner(memberId: string) {
    setSelectedOwnerId(memberId);
    const member = approvedMembers.find((item) => item.id === memberId);
    if (member) setForm((current) => ({ ...current, owner_name: member.name }));
  }

  async function uploadPhotos(carId: string, selectedFiles: File[], photoOwnerId: string) {
    if (!supabase || selectedFiles.length === 0) return [];
    const uploaded: { storage_path: string; public_url: string; position: number }[] = [];
    const currentCount = editing?.car_photos?.length ?? 0;

    for (const [index, file] of selectedFiles.entries()) {
      if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) throw new Error("Cada fotografia deve ser uma imagem até 8 MB.");
      const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${user.id}/${carId}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from("car-photos").upload(path, file, { cacheControl: "31536000", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("car-photos").getPublicUrl(path);
      uploaded.push({ storage_path: path, public_url: data.publicUrl, position: currentCount + index });
    }

    const { error } = await supabase.from("car_photos").insert(uploaded.map((photo) => ({ ...photo, car_id: carId, owner_id: photoOwnerId })));
    if (error) throw error;
    return uploaded;
  }

  async function saveCar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setSaving(true); setMessage(""); setMessageTone("error");
    try {
      const targetOwnerId = user.isAdmin && ownerMode === "member" ? selectedOwnerId : user.id;
      if (!targetOwnerId) throw new Error("Seleciona a conta do proprietário antes de guardar o carro.");
      const payload = {
        owner_name: form.owner_name.trim(), model: form.model.trim(),
        generation: form.generation.trim().toUpperCase(), year: Number(form.year), color: form.color.trim(),
        power_cv: Number(form.power_cv), torque_nm: form.torque_nm ? Number(form.torque_nm) : null,
        transmission: form.transmission.trim(), location: form.location.trim() || null,
        description: form.description.trim() || null, instagram: form.instagram.trim().replace(/^@/, "") || null,
        facebook: form.facebook.trim() || null, status: user.isAdmin ? form.status : "pending",
      };
      let carId = editing?.id;
      if (editing) {
        const updatePayload = user.isAdmin ? { ...payload, owner_id: targetOwnerId } : payload;
        let query = supabase.from("cars").update(updatePayload).eq("id", editing.id);
        if (!user.isAdmin) query = query.eq("owner_id", user.id);
        const { error } = await query;
        if (error) throw error;
        if (user.isAdmin && targetOwnerId !== editing.owner_id) {
          const { error: photoOwnerError } = await supabase.from("car_photos").update({ owner_id: targetOwnerId }).eq("car_id", editing.id);
          if (photoOwnerError) {
            await supabase.from("cars").update({ owner_id: editing.owner_id }).eq("id", editing.id);
            throw photoOwnerError;
          }
        }
      } else {
        const slug = `${slugify(`${form.generation}-${form.owner_name}`)}-${crypto.randomUUID().slice(0, 6)}`;
        const { data, error } = await supabase.from("cars").insert({ ...payload, owner_id: targetOwnerId, slug }).select("id").single();
        if (error) throw error;
        carId = data.id;
      }
      const uploaded = await uploadPhotos(carId!, files, targetOwnerId);
      if (uploaded.length && !editing?.cover_image_url) {
        let query = supabase.from("cars").update({ cover_image_url: uploaded[0].public_url }).eq("id", carId!);
        if (!user.isAdmin) query = query.eq("owner_id", user.id);
        const { error } = await query;
        if (error) throw error;
      }
      resetForm(); await loadCars(); setMessageTone("success");
      setMessage(user.isAdmin ? "Carro guardado com sucesso." : "Submissão enviada para aprovação do administrador.");
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Não foi possível guardar o carro.");
    } finally { setSaving(false); }
  }

  async function deleteCar(car: Car) {
    if (!supabase || !window.confirm(`Remover ${car.model} ${car.generation}?`)) return;
    setMessage("");
    const paths = car.car_photos?.map((photo) => photo.storage_path) ?? [];
    if (paths.length) await supabase.storage.from("car-photos").remove(paths);
    let query = supabase.from("cars").delete().eq("id", car.id);
    if (!user.isAdmin) query = query.eq("owner_id", user.id);
    const { error } = await query;
    if (error) return setMessage(error.message);
    if (editing?.id === car.id) resetForm();
    await loadCars();
  }

  async function deletePhoto(photo: Photo, car: Car) {
    if (!supabase || !window.confirm("Remover esta fotografia?")) return;
    if (!user.isAdmin && car.status !== "pending") {
      const { error: reviewError } = await supabase.from("cars").update({ status: "pending" }).eq("id", car.id).eq("owner_id", user.id);
      if (reviewError) return setMessage(reviewError.message);
    }
    const { error: storageError } = await supabase.storage.from("car-photos").remove([photo.storage_path]);
    if (storageError) return setMessage(storageError.message);
    let deleteQuery = supabase.from("car_photos").delete().eq("id", photo.id);
    if (!user.isAdmin) deleteQuery = deleteQuery.eq("owner_id", user.id);
    const { error } = await deleteQuery;
    if (error) return setMessage(error.message);
    if (car.cover_image_url === photo.public_url) {
      const replacement = car.car_photos.find((item) => item.id !== photo.id)?.public_url ?? null;
      let coverQuery = supabase.from("cars").update({ cover_image_url: replacement }).eq("id", car.id);
      if (!user.isAdmin) coverQuery = coverQuery.eq("owner_id", user.id);
      await coverQuery;
    }
    await loadCars();
    if (!user.isAdmin) setMessage("Fotografia removida. O carro voltou a ficar pendente para revisão.");
  }

  async function signOut() {
    await supabase?.auth.signOut(); router.push("/"); router.refresh();
  }

  async function updateMemberStatus(member: MemberProfile, status: MemberProfile["status"]) {
    if (!supabase || !user.isAdmin) return;
    setMessage("");
    const { error } = await supabase.from("member_profiles").update({ status }).eq("id", member.id);
    if (error) return setMessage(error.message);
    if (status !== "approved") await supabase.from("cars").update({ status: "pending" }).eq("owner_id", member.id);
    await Promise.all([loadMembers(), loadCars()]);
    setMessage(status === "approved" ? `${member.name} foi aprovado como membro.` : `O acesso de ${member.name} foi recusado.`);
  }

  async function updateCarStatus(car: Car, status: ReviewStatus) {
    if (!supabase || !user.isAdmin) return;
    const { error } = await supabase.from("cars").update({ status }).eq("id", car.id);
    if (error) return setMessage(error.message);
    await loadCars();
    setMessage(status === "published" ? "Carro aprovado e publicado." : "Submissão marcada como rejeitada.");
  }

  const carStatusLabel: Record<ReviewStatus, string> = { pending: "Pendente", published: "Publicado", rejected: "Rejeitado" };

  return <main className="dashboard-page">
    <nav className="dashboard-nav"><Link className="brand" href="/"><span className="brand-mark">R</span><span>TYPE R <em>GARAGE</em><small>PORTUGAL</small></span></Link><div>{user.isAdmin && <b className="admin-badge">Administrador</b>}{user.isAdmin && pendingMemberCount > 0 && <a className="pending-alert" href="#member-requests"><span className="notification-badge">{pendingMemberCount}</span> {pendingMemberCount === 1 ? "pedido pendente" : "pedidos pendentes"}</a>}<span>{user.email}</span><button onClick={signOut}>Sair</button></div></nav>
    <header className="dashboard-header"><div><p className="eyebrow"><span /> {user.isAdmin ? "Administração" : "Área de membros"}</p><h1>{user.isAdmin ? <>GESTÃO DA <i>GARAGEM.</i></> : <>A MINHA <i>GARAGEM.</i></>}</h1></div><p>{user.isAdmin ? "Aprova membros do grupo, revê submissões e gere todos os carros da comunidade." : "Adiciona os teus carros e mantém os detalhes atualizados. As submissões são revistas antes da publicação."}</p></header>
    <div className="dashboard-grid">
      <section className="car-editor"><div className="editor-title"><div><p className="eyebrow"><span /> {editing ? "Editar carro" : "Novo carro"}</p><h2>{editing ? `${editing.generation} · ${editing.model}` : "ADICIONAR CARRO"}</h2></div>{editing && <button onClick={resetForm}>Cancelar</button>}</div>
        <form onSubmit={saveCar}>
          {user.isAdmin && <fieldset className="owner-assignment"><legend>De quem é este carro?</legend><div className="owner-choice-grid"><label className={ownerMode === "self" ? "active" : ""}><input type="radio" name="owner_mode" checked={ownerMode === "self"} onChange={() => chooseOwnerMode("self")} /><span><b>O meu carro</b><small>Fica associado à tua conta de administrador.</small></span></label><label className={ownerMode === "member" ? "active" : ""}><input type="radio" name="owner_mode" checked={ownerMode === "member"} onChange={() => chooseOwnerMode("member")} /><span><b>Carro de um amigo</b><small>Escolhe um membro aprovado da comunidade.</small></span></label></div>{ownerMode === "member" && <label className="owner-member-select">Conta do proprietário<select value={selectedOwnerId} required onChange={(event) => chooseMemberOwner(event.target.value)}><option value="">Selecionar membro aprovado…</option>{approvedMembers.map((member) => <option key={member.id} value={member.id}>{member.name} · {member.email}</option>)}</select>{approvedMembers.length === 0 && <small>Aprova primeiro a conta do teu amigo para poderes associar-lhe o carro.</small>}</label>}</fieldset>}
          <div className="form-grid"><label>Nome do proprietário<input name="owner_name" required value={form.owner_name} onChange={updateField} /></label><label>Geração<select name="generation" required value={form.generation} onChange={chooseGeneration}><option value="">Selecionar Type R…</option><optgroup label="Era atmosférica">{typeRPresets.filter((preset) => preset.era === "Atmosférica").map((preset) => <option key={preset.code} value={preset.code}>{preset.code} — {preset.engine}</option>)}</optgroup><optgroup label="Era turbo">{typeRPresets.filter((preset) => preset.era === "Turbo").map((preset) => <option key={preset.code} value={preset.code}>{preset.code} — {preset.engine}</option>)}</optgroup></select></label>{selectedPreset && <div className="engine-preset wide" aria-live="polite"><small>{selectedPreset.era === "Turbo" ? "Era turbo" : "Era atmosférica"}</small><strong>{selectedPreset.code} · {selectedPreset.engine}</strong><span>{selectedPreset.powerCv} CV de fábrica · {selectedPreset.transmission}</span></div>}<label className="wide">Modelo<input name="model" required value={form.model} onChange={updateField} /></label><label>Ano<input name="year" required type="number" min="1997" max="2035" value={form.year} onChange={updateField} /></label><label>Cor<input name="color" required placeholder="Championship White" value={form.color} onChange={updateField} /></label><label>Potência (CV)<input name="power_cv" required type="number" min="1" value={form.power_cv} onChange={updateField} /><small>Preenchida com a potência de fábrica; altera se o carro estiver modificado.</small></label><label>Binário (Nm)<input name="torque_nm" type="number" min="1" value={form.torque_nm} onChange={updateField} /></label><label className="wide">Transmissão<input name="transmission" required value={form.transmission} onChange={updateField} /></label><label className="wide">Localização<input name="location" placeholder="Centro (Lisboa)" value={form.location} onChange={updateField} /></label><label>Instagram<input name="instagram" placeholder="nome.utilizador" value={form.instagram} onChange={updateField} /></label><label>Facebook (opcional)<input name="facebook" placeholder="https://facebook.com/..." value={form.facebook} onChange={updateField} /></label><label className="wide">Descrição<textarea name="description" rows={5} value={form.description} onChange={updateField} /></label><label className="wide">Fotografias<input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 8))} /><small>Até 8 imagens de 8 MB cada. As novas fotos são adicionadas às existentes.</small></label>{user.isAdmin ? <label className="wide">Estado<select name="status" value={form.status} onChange={updateField}><option value="pending">Pendente</option><option value="published">Publicado</option><option value="rejected">Rejeitado</option></select></label> : <p className="submission-note wide">Os carros novos e todas as alterações são enviados para aprovação antes de aparecerem publicamente.</p>}</div>
          {selectedPreset && <div className="type-r-reference"><span>{selectedPreset.years} · {selectedPreset.civicGeneration}</span><b>{selectedPreset.powerLabel}</b><p>{selectedPreset.note}</p>{selectedPreset.code === "EP3" && <small>O preenchimento automático usa 200 CV, correspondente à versão europeia.</small>}</div>}
          {message && <p className={`form-message ${messageTone}`} role="status">{message}</p>}<button className="primary account-primary" disabled={saving}>{saving ? "A guardar…" : editing ? "Guardar alterações" : "Adicionar à garagem"}<span>→</span></button>
        </form>
      </section>
      <section className="member-cars">{user.isAdmin && <div className="member-requests" id="member-requests"><p className="eyebrow"><span /> Pedidos de adesão</p>{members.length === 0 ? <p className="empty-cars">Ainda não existem pedidos.</p> : members.map((member) => <article key={member.id}><div><b>{member.name}</b><span>{member.email}</span><span>{member.whatsapp || "Sem número de WhatsApp"}</span></div><small className={`member-status ${member.status}`}>{member.status === "approved" ? "Aprovado" : member.status === "rejected" ? "Rejeitado" : "Pendente"}</small><div><button onClick={() => updateMemberStatus(member, "approved")}>Aprovar</button><button className="danger" onClick={() => updateMemberStatus(member, "rejected")}>Rejeitar</button></div></article>)}</div>}<p className="eyebrow"><span /> {user.isAdmin ? "Submissões de carros" : "Os meus carros"}</p>{loading ? <p className="empty-cars">A carregar…</p> : cars.length === 0 ? <p className="empty-cars">Ainda não existem carros nesta garagem.</p> : cars.map((car) => <article className="member-car" key={car.id}><div className="member-car-image" style={{ backgroundImage: car.cover_image_url ? `url(${car.cover_image_url})` : undefined }}><span className={car.status}>{carStatusLabel[car.status]}</span></div><div className="member-car-copy"><small>{car.year} · {car.color}{user.isAdmin ? ` · ${car.owner_name}` : ""}</small><h3>{car.generation} · {car.model}</h3><p>{car.power_cv} CV{car.location ? ` · ${car.location}` : ""}</p><div className="member-actions">{user.isAdmin && car.status !== "published" && <button className="approve" onClick={() => updateCarStatus(car, "published")}>Aprovar e publicar</button>}{user.isAdmin && car.status !== "rejected" && <button onClick={() => updateCarStatus(car, "rejected")}>Rejeitar</button>}<button onClick={() => startEdit(car)}>Editar</button>{car.status === "published" && <Link href={`/garage/${car.slug}`}>Ver perfil ↗</Link>}<button className="danger" onClick={() => deleteCar(car)}>Remover</button></div>{car.car_photos?.length > 0 && <div className="photo-strip">{[...car.car_photos].sort((a,b) => a.position - b.position).map((photo) => <button title="Remover fotografia" onClick={() => deletePhoto(photo, car)} key={photo.id} style={{ backgroundImage: `url(${photo.public_url})` }}><span>×</span></button>)}</div>}</div></article>)}</section>
    </div>
  </main>;
}
