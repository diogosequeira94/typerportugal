const events = [
  { name: "AJA", date: "09/08", dateTime: "2026-08-09", location: "Carcavelos" },
  {
    name: "Serra Drive and Chill",
    date: "09/08",
    dateTime: "2026-08-09",
    location: "Serra da Estrela",
  },
];

export default function UpcomingEvents() {
  return (
    <aside className="events-bar" aria-label="Próximos eventos">
      <strong>Próximos eventos</strong>
      <div className="events-list">
        {events.map((event) => (
          <div className="event-item" key={`${event.name}-${event.location}`}>
            <b>{event.name}</b>
            <time dateTime={event.dateTime}>{event.date}</time>
            <span>{event.location}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
