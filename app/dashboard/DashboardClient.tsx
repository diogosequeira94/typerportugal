"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Photo = { id: string; storage_path: string; public_url: string; position: number };
type Car = {
  id: string; owner_id: string; slug: string; owner_name: string; model: string;
  generation: string; year: number; color: string; power_cv: number; torque_nm: number | null;
  transmission: string; location: string | null; description: string | null;
  instagram: string | null; facebook: string | null; status: "draft" | "published";
  cover_image_url: string | null; car_photos: Photo[];
};

type FormState = {
  owner_name: string; model: string; generation: string; year: string; color: string;
  power_cv: string; torque_nm: string; transmission: string; location: string;
  description: string; instagram: string; facebook: string; status: "draft" | "published";
};

const emptyForm = (name: string): FormState => ({
  owner_name: name, model: "Civic Type R", generation: "", year: "", color: "",
  power_cv: "", torque_nm: "", transmission: "Manual de 6 velocidades", location: "",
  description: "", instagram: "", facebook: "", status: "draft",
});

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function DashboardClient({ user }: { user: { id: string; email: string; name: string } }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [cars, setCars] = useState<Car[]>([]);
  const [editing, setEditing] = useState<Car | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm(user.name));
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadCars = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from("cars").select("*, car_photos(*)")
      .eq("owner_id", user.id).order("created_at", { ascending: false });
    setLoading(false);
    if (error) return setMessage(error.message);
    setCars((data as Car[]) ?? []);
  }, [supabase, user.id]);

  useEffect(() => {
    if (!supabase) return;
    void supabase.from("cars").select("*, car_photos(*)")
      .eq("owner_id", user.id).order("created_at", { ascending: false })
      .then(({ data, error }) => {
        setLoading(false);
        if (error) setMessage(error.message);
        else setCars((data as Car[]) ?? []);
      });
  }, [supabase, user.id]);

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function startEdit(car: Car) {
    setEditing(car);
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
    setEditing(null); setForm(emptyForm(user.name)); setFiles([]); setMessage("");
  }

  async function uploadPhotos(carId: string, selectedFiles: File[]) {
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

    const { error } = await supabase.from("car_photos").insert(uploaded.map((photo) => ({ ...photo, car_id: carId, owner_id: user.id })));
    if (error) throw error;
    return uploaded;
  }

  async function saveCar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setSaving(true); setMessage("");
    try {
      const payload = {
        owner_id: user.id, owner_name: form.owner_name.trim(), model: form.model.trim(),
        generation: form.generation.trim().toUpperCase(), year: Number(form.year), color: form.color.trim(),
        power_cv: Number(form.power_cv), torque_nm: form.torque_nm ? Number(form.torque_nm) : null,
        transmission: form.transmission.trim(), location: form.location.trim() || null,
        description: form.description.trim() || null, instagram: form.instagram.trim().replace(/^@/, "") || null,
        facebook: form.facebook.trim() || null, status: form.status,
      };
      let carId = editing?.id;
      if (editing) {
        const { error } = await supabase.from("cars").update(payload).eq("id", editing.id).eq("owner_id", user.id);
        if (error) throw error;
      } else {
        const slug = `${slugify(`${form.generation}-${form.owner_name}`)}-${crypto.randomUUID().slice(0, 6)}`;
        const { data, error } = await supabase.from("cars").insert({ ...payload, slug }).select("id").single();
        if (error) throw error;
        carId = data.id;
      }
      const uploaded = await uploadPhotos(carId!, files);
      if (uploaded.length && !editing?.cover_image_url) {
        const { error } = await supabase.from("cars").update({ cover_image_url: uploaded[0].public_url }).eq("id", carId!).eq("owner_id", user.id);
        if (error) throw error;
      }
      resetForm(); await loadCars(); setMessage("Carro guardado com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível guardar o carro.");
    } finally { setSaving(false); }
  }

  async function deleteCar(car: Car) {
    if (!supabase || !window.confirm(`Remover ${car.model} ${car.generation}?`)) return;
    setMessage("");
    const paths = car.car_photos?.map((photo) => photo.storage_path) ?? [];
    if (paths.length) await supabase.storage.from("car-photos").remove(paths);
    const { error } = await supabase.from("cars").delete().eq("id", car.id).eq("owner_id", user.id);
    if (error) return setMessage(error.message);
    if (editing?.id === car.id) resetForm();
    await loadCars();
  }

  async function deletePhoto(photo: Photo, car: Car) {
    if (!supabase || !window.confirm("Remover esta fotografia?")) return;
    const { error: storageError } = await supabase.storage.from("car-photos").remove([photo.storage_path]);
    if (storageError) return setMessage(storageError.message);
    const { error } = await supabase.from("car_photos").delete().eq("id", photo.id).eq("owner_id", user.id);
    if (error) return setMessage(error.message);
    if (car.cover_image_url === photo.public_url) {
      const replacement = car.car_photos.find((item) => item.id !== photo.id)?.public_url ?? null;
      await supabase.from("cars").update({ cover_image_url: replacement }).eq("id", car.id).eq("owner_id", user.id);
    }
    await loadCars();
  }

  async function signOut() {
    await supabase?.auth.signOut(); router.push("/"); router.refresh();
  }

  return <main className="dashboard-page">
    <nav className="dashboard-nav"><Link className="brand" href="/"><span className="brand-mark">R</span><span>TYPE R <em>GARAGE</em><small>PORTUGAL</small></span></Link><div><span>{user.email}</span><button onClick={signOut}>Sair</button></div></nav>
    <header className="dashboard-header"><div><p className="eyebrow"><span /> Área de membros</p><h1>A MINHA <i>GARAGEM.</i></h1></div><p>Adiciona os teus carros, mantém os detalhes atualizados e decide quando ficam públicos.</p></header>
    <div className="dashboard-grid">
      <section className="car-editor"><div className="editor-title"><div><p className="eyebrow"><span /> {editing ? "Editar carro" : "Novo carro"}</p><h2>{editing ? `${editing.generation} · ${editing.model}` : "ADICIONAR CARRO"}</h2></div>{editing && <button onClick={resetForm}>Cancelar</button>}</div>
        <form onSubmit={saveCar}>
          <div className="form-grid"><label>Nome do proprietário<input name="owner_name" required value={form.owner_name} onChange={updateField} /></label><label>Geração<input name="generation" required placeholder="FK8" value={form.generation} onChange={updateField} /></label><label className="wide">Modelo<input name="model" required value={form.model} onChange={updateField} /></label><label>Ano<input name="year" required type="number" min="1997" max="2035" value={form.year} onChange={updateField} /></label><label>Cor<input name="color" required placeholder="Championship White" value={form.color} onChange={updateField} /></label><label>Potência (CV)<input name="power_cv" required type="number" min="1" value={form.power_cv} onChange={updateField} /></label><label>Binário (Nm)<input name="torque_nm" type="number" min="1" value={form.torque_nm} onChange={updateField} /></label><label className="wide">Transmissão<input name="transmission" required value={form.transmission} onChange={updateField} /></label><label className="wide">Localização<input name="location" placeholder="Centro (Lisboa)" value={form.location} onChange={updateField} /></label><label>Instagram<input name="instagram" placeholder="nome.utilizador" value={form.instagram} onChange={updateField} /></label><label>Facebook (opcional)<input name="facebook" placeholder="https://facebook.com/..." value={form.facebook} onChange={updateField} /></label><label className="wide">Descrição<textarea name="description" rows={5} value={form.description} onChange={updateField} /></label><label className="wide">Fotografias<input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 8))} /><small>Até 8 imagens de 8 MB cada. As novas fotos são adicionadas às existentes.</small></label><label className="wide">Visibilidade<select name="status" value={form.status} onChange={updateField}><option value="draft">Rascunho — só eu vejo</option><option value="published">Publicado — visível na comunidade</option></select></label></div>
          {message && <p className="form-message" role="status">{message}</p>}<button className="primary account-primary" disabled={saving}>{saving ? "A guardar…" : editing ? "Guardar alterações" : "Adicionar à garagem"}<span>→</span></button>
        </form>
      </section>
      <section className="member-cars"><p className="eyebrow"><span /> Os meus carros</p>{loading ? <p className="empty-cars">A carregar…</p> : cars.length === 0 ? <p className="empty-cars">Ainda não tens carros. Preenche o formulário para adicionares o primeiro.</p> : cars.map((car) => <article className="member-car" key={car.id}><div className="member-car-image" style={{ backgroundImage: car.cover_image_url ? `url(${car.cover_image_url})` : undefined }}><span>{car.status === "published" ? "Publicado" : "Rascunho"}</span></div><div className="member-car-copy"><small>{car.year} · {car.color}</small><h3>{car.generation} · {car.model}</h3><p>{car.power_cv} CV{car.location ? ` · ${car.location}` : ""}</p><div className="member-actions"><button onClick={() => startEdit(car)}>Editar</button>{car.status === "published" && <Link href={`/garage/${car.slug}`}>Ver perfil ↗</Link>}<button className="danger" onClick={() => deleteCar(car)}>Remover</button></div>{car.car_photos?.length > 0 && <div className="photo-strip">{car.car_photos.sort((a,b) => a.position - b.position).map((photo) => <button title="Remover fotografia" onClick={() => deletePhoto(photo, car)} key={photo.id} style={{ backgroundImage: `url(${photo.public_url})` }}><span>×</span></button>)}</div>}</div></article>)}</section>
    </div>
  </main>;
}
