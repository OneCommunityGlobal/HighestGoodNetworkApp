export default function EventInfoCard({ event }) {
  return (
    <div>
      <h2 style={{ margin: '0 0 6px 0' }}>{event.name}</h2>
      <div>Location: {event.location ?? '—'}</div>
      <div>Organizer: {event.organizer?.name ?? '—'}</div>
      <div>
        Time: {new Date(event.start).toLocaleString()} → {new Date(event.end).toLocaleString()}
      </div>
      {event.zoomLink && (
        <div>
          Zoom:{' '}
          <a href={event.zoomLink} target="_blank" rel="noreferrer">
            {event.zoomLink}
          </a>
        </div>
      )}
    </div>
  );
}
