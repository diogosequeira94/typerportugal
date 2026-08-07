import Link from "next/link";
import CarGallery from "../../components/CarGallery";

const builds = {
  fk8: {
    code: "FK8", name: "Civic Type R FK8", title: "O PADRÃO BRANCO.", image: "/cars/diogo/fk8-03.webp", owner: "Membro fundador", handle: "@typergarageportugal", location: "Centro (Lisboa)", year: "2019", colour: "Championship White", power: "320 CV", torque: "400 Nm", status: "Configuração de fábrica", note: "Um FK8 imaculado, anterior ao facelift, mantido exatamente como a Honda o idealizou — o ponto de partida para um projeto que dispensa apresentações.",
    parts: [["Motor", "2.0L VTEC TURBO · K20C1"], ["Escape", "Escape de fábrica com saída tripla"], ["Admissão", "Sistema de admissão de fábrica"], ["Suspensão", "Sistema de amortecimento adaptativo"], ["Jantes", "Jantes de liga leve de fábrica de 20 polegadas"], ["Travões", "Sistema de travagem dianteiro Brembo"]],
    gallery: [
      { src: "/cars/diogo/fk8-01.webp", alt: "FK8 do Diogo visto de frente em Lisboa" },
      { src: "/cars/diogo/fk8-02.webp", alt: "FK8 do Diogo numa estação de serviço" },
      { src: "/cars/diogo/fk8-03.webp", alt: "FK8 do Diogo junto a palmeiras" },
      { src: "/cars/diogo/fk8-04.webp", alt: "Traseira do FK8 do Diogo" },
      { src: "/cars/diogo/fk8-05.webp", alt: "FK8 do Diogo estacionado em Lisboa" },
      { src: "/cars/diogo/fk8-06.webp", alt: "Perspetiva traseira do FK8 do Diogo" },
    ],
  },
  fk2: {
    code: "FK2", name: "Civic Type R FK2", title: "A PRIMEIRA ERA TURBO.", image: "/cars/fk2.jpg", owner: "Destaque da garagem", handle: "@typergarageportugal", location: null, year: "2016", colour: "Branco Championship", power: "310 CV", torque: "400 Nm", status: "Destaque da comunidade", note: "O Type R turbo, puro e determinado, que redefiniu o ritmo para uma nova era de desempenho Civic.",
    parts: [["Motor", "2.0L VTEC TURBO · K20C1"], ["Escape", "Escape central de fábrica"], ["Admissão", "Caixa de ar de fábrica de alto fluxo"], ["Suspensão", "Eixo dianteiro de dupla articulação"], ["Jantes", "Jantes de liga leve de 19 polegadas"], ["Travões", "Sistema de travagem dianteiro Brembo"]],
    gallery: [{ src: "/cars/fk2.jpg", alt: "Honda Civic Type R FK2" }],
  },
  fl5: {
    code: "FL5", name: "Civic Type R FL5", title: "O PRÓXIMO ÁPICE.", image: "/cars/fl5.jpg", owner: "Destaque da garagem", handle: "@typergarageportugal", location: null, year: "2023", colour: "Branco Championship", power: "329 CV", torque: "420 Nm", status: "Destaque da comunidade", note: "Uma silhueta Type R mais limpa e madura, com a mesma dedicação à tração dianteira no seu ADN.",
    parts: [["Motor", "2.0L VTEC TURBO · K20C1"], ["Escape", "Escape de fábrica com saída tripla"], ["Admissão", "Admissão de ar frio de fábrica"], ["Suspensão", "Sistema de amortecimento adaptativo"], ["Jantes", "Jantes leves de liga de 19 polegadas"], ["Travões", "Sistema de travagem dianteiro Brembo"]],
    gallery: [{ src: "/cars/fl5.jpg", alt: "Honda Civic Type R FL5" }],
  },
};

export default async function BuildPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const build = builds[slug as keyof typeof builds] ?? builds.fk8;
  return <main className="profile-page">
    <nav className="nav"><Link className="brand" href="/"><span className="brand-mark">R</span><span>TYPE R <em>GARAGE</em><small>PORTUGAL</small></span></Link><Link className="back-link" href="/#garage">← Voltar à garagem</Link></nav>
    <section className="profile-hero">
      <div className="profile-image" style={{ backgroundImage: `linear-gradient(90deg,#080809 0%,transparent 70%),linear-gradient(0deg,#080809 0%,transparent 55%),url(${build.image})` }} />
      <div className="profile-heading"><p className="eyebrow"><span /> Perfil do carro · {build.code}</p><h1>{build.title.split(" ").slice(0,2).join(" ")}<br /><i>{build.title.split(" ").slice(2).join(" ")}</i></h1><div className="profile-key"><span>{build.name}</span><b>{build.year}</b><b>{build.colour}</b></div></div>
    </section>
    <section className="profile-content">
      <aside className="owner-card"><p className="eyebrow"><span /> Proprietário</p><h2>{build.owner}</h2><p>Parte da comunidade Type R Garage Portugal.</p><a href="https://instagram.com/" target="_blank" rel="noreferrer"><b>◎</b> Instagram <span>{build.handle}</span></a><a href="https://facebook.com/" target="_blank" rel="noreferrer"><b>f</b> Facebook <span>Type R Garage PT</span></a>{build.location && <div className="owner-location"><b aria-hidden="true">⌖</b><span><small>Localização</small>{build.location}</span></div>}<CarGallery title={build.name} images={build.gallery} /><div className="side-sound"><p className="eyebrow"><span /> Som do escape</p><b>▶</b><div><strong>Ouvir o carro</strong><span>A aguardar vídeo do proprietário</span></div></div></aside>
      <div className="build-details"><p className="eyebrow"><span /> Especificações</p><div className="headline-specs"><div><b>{build.power}</b><span>Potência</span></div><div><b>{build.torque}</b><span>Binário</span></div><div><b>6 MT</b><span>Transmissão</span></div></div><p className="profile-note">{build.note}</p><p className="eyebrow mods-label"><span /> Peças e modificações</p><div className="parts-list">{build.parts.map(([label,value], index) => <div key={label}><small>0{index + 1}</small><span>{label}</span><b>{value}</b></div>)}</div><section className="media-section"><p className="eyebrow"><span /> Galeria do proprietário</p><div className="gallery-grid">{["Perspetiva dianteira", "Pormenor", "Momento na estrada"].map((caption, index) => <figure key={caption} style={{ backgroundImage: `url(${build.image})`, backgroundPosition: `${35 + index * 25}% center` }}><figcaption>0{index + 1} · {caption}</figcaption></figure>)}</div></section><section className="sound-panel"><div><p className="eyebrow"><span /> Som do escape</p><h2>OUVE O <i>CARRO.</i></h2><p>Os proprietários poderão adicionar um pequeno vídeo para que a comunidade ouça cada carro exatamente como ele soa.</p></div><div className="sound-empty"><b>▶</b><span>Ainda não foi adicionado um vídeo do escape</span><small>Envio por membros brevemente</small></div></section><div className="build-note"><p className="eyebrow"><span /> Nota do proprietário</p><p>Este perfil é público por opção. O acesso de membros para contactos do proprietário, mensagens privadas ou submissão do teu Type R chegará numa versão futura.</p><span>{build.status}</span></div></div>
    </section>
    <footer><span>© 2026 TYPE R GARAGE PORTUGAL</span><span>HONDA E TYPE R SÃO MARCAS REGISTADAS DA HONDA MOTOR CO., LTD.</span><span>FOTOGRAFIAS: COLABORADORES DO WIKIMEDIA COMMONS</span></footer>
  </main>;
}
