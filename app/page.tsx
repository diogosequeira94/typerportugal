"use client";

import { useState } from "react";
import UpcomingEvents from "./components/UpcomingEvents";

const cars = [
  {
    code: "FK8",
    name: "Civic Type R FK8",
    owner: "Diogo's build",
    years: "2017–2021 · Pre-facelift",
    power: "320 PS",
    color: "Championship White",
    image:
      "/cars/fk8.jpg",
    lead: true,
  },
  {
    code: "FK2",
    name: "Civic Type R FK2",
    owner: "Garage feature",
    years: "2015–2017",
    power: "310 PS",
    color: "Crystal Black",
    image:
      "/cars/fk2.jpg",
  },
  {
    code: "FL5",
    name: "Civic Type R FL5",
    owner: "Garage feature",
    years: "2023–present",
    power: "329 PS",
    color: "Championship White",
    image:
      "/cars/fl5.jpg",
  },
];

const specs = [
  ["Engine", "2.0 VTEC TURBO"],
  ["Transmission", "6-speed manual"],
  ["Drive", "Front-wheel drive"],
  ["Status", "Factory specification"],
];

export default function Home() {
  const [filter, setFilter] = useState("All cars");
  const visibleCars = filter === "All cars" ? cars : cars.filter((car) => car.code === filter);

  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#top" aria-label="Type R Garage Portugal home">
          <span className="brand-mark">R</span>
          <span>TYPE R <em>GARAGE</em><small>PORTUGAL</small></span>
        </a>
        <div className="nav-links"><a href="#garage">Garage</a><a href="#story">The club</a><a href="#join">Join us</a></div>
        <a className="menu-button" href="#garage">Explore builds <span>↗</span></a>
      </nav>

      <section className="hero" id="top">
        <div className="grid-noise" />
        <div className="hero-copy">
          <p className="eyebrow"><span /> Portugal&apos;s Type R community</p>
          <h1>BUILT FOR<br /><i>THE DRIVE.</i></h1>
          <p className="hero-text">A home for the Civic Type R community. Explore the cars, the stories, and the details that make every build personal.</p>
          <div className="hero-actions"><a className="primary" href="#garage">View the garage <span>↓</span></a><a className="text-link" href="#story">Our story <span>→</span></a></div>
        </div>
        <div className="hero-car" role="img" aria-label="White Honda Civic Type R FK8" />
        <div className="hero-plate"><b>01</b><span>FEATURED BUILD</span><small>FK8 / STOCK / PT</small></div>
        <div className="hero-stats"><div><b>3</b><span>GENERATIONS</span></div><div><b>1</b><span>COMMUNITY</span></div><div><b>∞</b><span>ROADS AHEAD</span></div></div>
      </section>

      <UpcomingEvents />

      <section className="garage section" id="garage">
        <div className="section-heading"><div><p className="eyebrow"><span /> The collection</p><h2>THE <i>GARAGE.</i></h2></div><p>A living catalogue of Portugal&apos;s Civic Type Rs — from untouched icons to carefully crafted builds.</p></div>
        <div className="filters" aria-label="Filter cars by generation">
          {["All cars", "FK2", "FK8", "FL5"].map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}
        </div>
        <div className="car-grid">
          {visibleCars.map((car) => <article className={`car-card ${car.lead ? "featured" : ""}`} key={car.code}>
            <div className="card-image" style={{ backgroundImage: `linear-gradient(180deg, transparent 45%, #101010 100%), url(${car.image})` }}><span className="model-tag">{car.code}</span>{car.lead && <span className="stock-tag">★ FEATURED</span>}</div>
            <div className="card-body"><p>{car.owner}</p><h3>{car.name}</h3><div className="card-meta"><span>{car.years}</span><span>{car.power}</span></div><a href={`/garage/${car.code.toLowerCase()}`}>Open build <b>↗</b></a></div>
          </article>)}
        </div>
      </section>

      <section className="featured-build" id="featured">
        <div className="build-image" role="img" aria-label="White hatchback performance car in profile" />
        <div className="build-copy"><p className="eyebrow"><span /> First in the garage</p><h2>THE WHITE<br /><i>STANDARD.</i></h2><p className="build-description">A Championship White, pre-facelift FK8. Pure factory intent, a manual gearbox, and all the theatre that made this generation unforgettable.</p><div className="spec-grid">{specs.map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</div><a className="primary" href="/garage/fk8">View full profile <span>↗</span></a></div>
      </section>

      <section className="story section" id="story"><p className="eyebrow"><span /> Driven together</p><h2>MORE THAN<br />A <i>BADGE.</i></h2><p>Type R Garage Portugal is for owners who notice every detail: the sound of the VTEC turbo, the feel of a perfect downshift, and the road home after a Sunday run.</p><div className="story-rule" /></section>
      <section className="join" id="join"><p className="eyebrow"><span /> Your car belongs here</p><h2>KEEP THE<br /><i>RED LINE</i> CLOSE.</h2><a className="primary" href="mailto:hello@typergarage.pt">Get in touch <span>→</span></a></section>
      <footer><span>© 2026 TYPE R GARAGE PORTUGAL</span><span>HONDA AND TYPE R ARE TRADEMARKS OF HONDA MOTOR CO., LTD.</span><span>PHOTOS: WIKIMEDIA COMMONS CONTRIBUTORS</span></footer>
    </main>
  );
}
