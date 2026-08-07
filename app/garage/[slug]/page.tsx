import Link from "next/link";
import UpcomingEvents from "../../components/UpcomingEvents";

const builds = {
  fk8: {
    code: "FK8", name: "Civic Type R FK8", title: "THE WHITE STANDARD.", image: "/cars/fk8.jpg", owner: "Founding member", handle: "@typergarageportugal", year: "2018", colour: "Championship White", power: "320 PS", torque: "400 Nm", status: "Factory specification", note: "A clean, pre-facelift FK8 kept exactly as Honda intended — the starting point for a build that needs no introduction.",
    parts: [["Engine", "2.0L VTEC TURBO · K20C1"], ["Exhaust", "Factory triple-exit exhaust"], ["Intake", "Factory intake system"], ["Suspension", "Adaptive damper system"], ["Wheels", "Factory 20-inch alloy wheels"], ["Brakes", "Brembo front brake package"]],
  },
  fk2: {
    code: "FK2", name: "Civic Type R FK2", title: "TURBO'S FIRST ACT.", image: "/cars/fk2.jpg", owner: "Garage feature", handle: "@typergarageportugal", year: "2016", colour: "Championship White", power: "310 PS", torque: "400 Nm", status: "Community feature", note: "The raw, purposeful turbocharged Type R that reset the pace for a new era of Civic performance.",
    parts: [["Engine", "2.0L VTEC TURBO · K20C1"], ["Exhaust", "Factory centre-exit exhaust"], ["Intake", "High-flow factory airbox"], ["Suspension", "Dual-axis front strut"], ["Wheels", "19-inch alloy wheels"], ["Brakes", "Brembo front brake package"]],
  },
  fl5: {
    code: "FL5", name: "Civic Type R FL5", title: "THE NEXT APEX.", image: "/cars/fl5.jpg", owner: "Garage feature", handle: "@typergarageportugal", year: "2023", colour: "Championship White", power: "329 PS", torque: "420 Nm", status: "Community feature", note: "A cleaner, more mature Type R shape with the same front-wheel-drive focus at its core.",
    parts: [["Engine", "2.0L VTEC TURBO · K20C1"], ["Exhaust", "Factory triple-exit exhaust"], ["Intake", "Factory cold-air intake"], ["Suspension", "Adaptive damper system"], ["Wheels", "19-inch lightweight alloy wheels"], ["Brakes", "Brembo front brake package"]],
  },
};

export default async function BuildPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const build = builds[slug as keyof typeof builds] ?? builds.fk8;
  return <main className="profile-page">
    <nav className="nav"><Link className="brand" href="/"><span className="brand-mark">R</span><span>TYPE R <em>GARAGE</em><small>PORTUGAL</small></span></Link><Link className="back-link" href="/#garage">← Back to garage</Link></nav>
    <UpcomingEvents />
    <section className="profile-hero">
      <div className="profile-image" style={{ backgroundImage: `linear-gradient(90deg,#080809 0%,transparent 70%),linear-gradient(0deg,#080809 0%,transparent 55%),url(${build.image})` }} />
      <div className="profile-heading"><p className="eyebrow"><span /> Build profile · {build.code}</p><h1>{build.title.split(" ").slice(0,2).join(" ")}<br /><i>{build.title.split(" ").slice(2).join(" ")}</i></h1><div className="profile-key"><span>{build.name}</span><b>{build.year}</b><b>{build.colour}</b></div></div>
    </section>
    <section className="profile-content">
      <aside className="owner-card"><p className="eyebrow"><span /> Owner</p><h2>{build.owner}</h2><p>Part of the Type R Garage Portugal community.</p><a href="https://instagram.com/" target="_blank" rel="noreferrer"><b>◎</b> Instagram <span>{build.handle}</span></a><a href="https://facebook.com/" target="_blank" rel="noreferrer"><b>f</b> Facebook <span>Type R Garage PT</span></a><div className="side-gallery"><p className="eyebrow"><span /> Owner&apos;s gallery</p><figure style={{ backgroundImage: `url(${build.image})` }}><figcaption>Open gallery</figcaption></figure></div><div className="side-sound"><p className="eyebrow"><span /> Exhaust sound</p><b>▶</b><div><strong>Hear the build</strong><span>Awaiting owner clip</span></div></div></aside>
      <div className="build-details"><p className="eyebrow"><span /> Specification</p><div className="headline-specs"><div><b>{build.power}</b><span>Power</span></div><div><b>{build.torque}</b><span>Torque</span></div><div><b>6 MT</b><span>Transmission</span></div></div><p className="profile-note">{build.note}</p><p className="eyebrow mods-label"><span /> Parts & modifications</p><div className="parts-list">{build.parts.map(([label,value], index) => <div key={label}><small>0{index + 1}</small><span>{label}</span><b>{value}</b></div>)}</div><section className="media-section"><p className="eyebrow"><span /> Owner&apos;s gallery</p><div className="gallery-grid">{["Front three-quarter", "Detail shot", "Road moment"].map((caption, index) => <figure key={caption} style={{ backgroundImage: `url(${build.image})`, backgroundPosition: `${35 + index * 25}% center` }}><figcaption>0{index + 1} · {caption}</figcaption></figure>)}</div></section><section className="sound-panel"><div><p className="eyebrow"><span /> Exhaust sound</p><h2>HEAR THE <i>BUILD.</i></h2><p>Owners will be able to add a short video clip so the community can hear each car exactly as it sounds.</p></div><div className="sound-empty"><b>▶</b><span>No exhaust clip added yet</span><small>Member upload coming soon</small></div></section><div className="build-note"><p className="eyebrow"><span /> Builder&apos;s note</p><p>This profile is public by choice. For owner contact details, private messages, or submitting your own Type R, member access will arrive in a later release.</p><span>{build.status}</span></div></div>
    </section>
    <footer><span>© 2026 TYPE R GARAGE PORTUGAL</span><span>HONDA AND TYPE R ARE TRADEMARKS OF HONDA MOTOR CO., LTD.</span><span>PHOTOS: WIKIMEDIA COMMONS CONTRIBUTORS</span></footer>
  </main>;
}
