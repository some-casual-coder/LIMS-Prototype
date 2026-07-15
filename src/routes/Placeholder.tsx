// Temporary placeholder shown until each screen is built in Phases 2–4.
// Visual design intentionally deferred until design considerations are provided.
export function Placeholder({ title, phase }: { title: string; phase: string }) {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: 720 }}>
      <p style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 12, color: '#6b7280', margin: 0 }}>
        LIMS — National Assembly of Kenya
      </p>
      <h1 style={{ fontSize: 24, margin: '0.5rem 0' }}>{title}</h1>
      <p style={{ color: '#4b5563' }}>
        This screen is scheduled for {phase}. The data model, routing, store and mock API
        that power it are already in place.
      </p>
    </main>
  );
}
