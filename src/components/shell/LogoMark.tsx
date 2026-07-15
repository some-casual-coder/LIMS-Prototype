import emblem from '@/assets/national-assembly-emblem-sq.png';

// Official National Assembly of Kenya emblem, framed in a clean white rounded
// box so it reads clearly on both the dark green sidebar and light surfaces.
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        flex: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
        borderRadius: Math.round(size * 0.26),
        border: '1px solid rgba(16, 33, 24, 0.08)',
        boxShadow: '0 1px 2px rgba(16, 33, 24, 0.14)',
      }}
    >
      <img
        src={emblem}
        width={Math.round(size * 0.82)}
        height={Math.round(size * 0.82)}
        alt="National Assembly of Kenya"
        style={{ display: 'block', objectFit: 'contain' }}
      />
    </span>
  );
}
