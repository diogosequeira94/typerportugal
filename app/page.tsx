"use client";

import Link from "next/link";
import { useState } from "react";
import UpcomingEvents from "./components/UpcomingEvents";

const cars = [
  {
    code: "FK8",
    name: "Civic Type R FK8",
    owner: "O carro do Diogo",
    years: "2017–2021 · Pre-facelift",
    power: "320 PS",
    color: "Branco Championship",
    image:
      "/cars/fk8.jpg",
    lead: true,
  },
  {
    code: "FK2",
    name: "Civic Type R FK2",
    owner: "Destaque da garagem",
    years: "2015–2017",
    power: "310 PS",
    color: "Preto Crystal",
    image:
      "/cars/fk2.jpg",
  },
  {
    code: "FL5",
    name: "Civic Type R FL5",
    owner: "Destaque da garagem",
    years: "2023–presente",
    power: "329 PS",
    color: "Branco Championship",
    image:
      "/cars/fl5.jpg",
  },
];

const specs = [
  ["Motor", "2.0 VTEC TURBO"],
  ["Transmissão", "Manual de 6 velocidades"],
  ["Tração", "Dianteira"],
  ["Estado", "Configuração de fábrica"],
];

export default function Home() {
  const [filter, setFilter] = useState("Todos");
  const visibleCars = filter === "Todos" ? cars : cars.filter((car) => car.code === filter);

  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#top" aria-label="Página inicial da Type R Garage Portugal">
          <span className="brand-mark">R</span>
          <span>TYPE R <em>GARAGE</em><small>PORTUGAL</small></span>
        </a>
        <div className="nav-links"><a href="#garage">Garagem</a><a href="#story">O clube</a><a href="#join">Junta-te a nós</a></div>
        <a className="menu-button" href="#garage">Explorar carros <span>↗</span></a>
      </nav>

      <section className="hero" id="top">
        <div className="grid-noise" />
        <div className="hero-copy">
          <p className="eyebrow"><span /> A comunidade Type R de Portugal</p>
          <h1>FEITO PARA<br /><i>CONDUZIR.</i></h1>
          <p className="hero-text">Uma casa para a comunidade Civic Type R. Descobre os carros, as histórias e os detalhes que tornam cada projeto único.</p>
          <div className="hero-actions"><a className="primary" href="#garage">Ver a garagem <span>↓</span></a><a className="text-link" href="#story">A nossa história <span>→</span></a></div>
        </div>
        <div className="hero-car" role="img" aria-label="Honda Civic Type R FK8 branco" />
        <div className="hero-plate"><b>01</b><span>CARRO EM DESTAQUE</span><small>FK8 / ORIGINAL / PT</small></div>
        <div className="hero-stats"><div><b>3</b><span>GERAÇÕES</span></div><div><b>1</b><span>COMUNIDADE</span></div><div><b>∞</b><span>ESTRADAS POR PERCORRER</span></div></div>
      </section>

      <UpcomingEvents />

      <section className="garage section" id="garage">
        <div className="section-heading"><div><p className="eyebrow"><span /> A coleção</p><h2>A <i>GARAGEM.</i></h2></div><p>Um catálogo vivo dos Civic Type R de Portugal — desde ícones imaculados a projetos cuidadosamente preparados.</p></div>
        <div className="filters" aria-label="Filtrar carros por geração">
          {["Todos", "FK2", "FK8", "FL5"].map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}
        </div>
        <div className="car-grid">
          {visibleCars.map((car) => <article className={`car-card ${car.lead ? "featured" : ""}`} key={car.code}>
            <Link className="car-card-link" href={`/garage/${car.code.toLowerCase()}`} aria-label={`Ver ${car.name}`}>
              <div className="card-image" style={{ backgroundImage: `linear-gradient(180deg, transparent 45%, #101010 100%), url(${car.image})` }}><span className="model-tag">{car.code}</span>{car.lead && <span className="stock-tag">★ DESTAQUE</span>}</div>
              <div className="card-body"><p className="card-owner"><span>{car.owner}</span><b aria-hidden="true">↗</b></p><h3>{car.name}</h3><div className="card-meta"><span>{car.years}</span><span>{car.power}</span></div></div>
            </Link>
          </article>)}
        </div>
      </section>

      <section className="featured-build" id="featured">
        <div className="build-image" role="img" aria-label="Automóvel desportivo branco visto de perfil" />
        <div className="build-copy"><p className="eyebrow"><span /> O primeiro da garagem</p><h2>O PADRÃO<br /><i>BRANCO.</i></h2><p className="build-description">Um FK8 Branco Championship, anterior ao facelift. Pura intenção de fábrica, caixa manual e todo o dramatismo que tornou esta geração inesquecível.</p><div className="spec-grid">{specs.map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</div><Link className="primary" href="/garage/fk8">Ver perfil completo <span>↗</span></Link></div>
      </section>

      <section className="story section" id="story"><p className="eyebrow"><span /> Juntos pela estrada</p><h2>MAIS DO QUE<br />UM <i>SÍMBOLO.</i></h2><p>A Type R Garage Portugal é para quem repara em cada detalhe: o som do VTEC Turbo, a sensação de uma redução perfeita e a estrada para casa depois de um passeio de domingo.</p><div className="story-rule" /></section>
      <section className="join" id="join"><p className="eyebrow"><span /> O teu carro pertence aqui</p><h2>MANTÉM A<br /><i>LINHA VERMELHA</i> POR PERTO.</h2><a className="primary" href="mailto:hello@typergarage.pt">Fala connosco <span>→</span></a></section>
      <footer><span>© 2026 TYPE R GARAGE PORTUGAL</span><span>HONDA E TYPE R SÃO MARCAS REGISTADAS DA HONDA MOTOR CO., LTD.</span><span>FOTOGRAFIAS: COLABORADORES DO WIKIMEDIA COMMONS</span></footer>
    </main>
  );
}
