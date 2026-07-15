import emblem from '@/assets/national-assembly-emblem-sq.png';

export function LogoMark({ size = 34, framed = false }: { size?: number; framed?: boolean }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        flex: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: framed ? '#fff' : 'transparent',
        borderRadius: framed ? Math.round(size * 0.26) : 0,
        border: framed ? '1px solid rgba(16, 33, 24, 0.08)' : 0,
        boxShadow: framed ? '0 1px 2px rgba(16, 33, 24, 0.14)' : 'none',
      }}
    >
      <img
        src={emblem}
        width={Math.round(size * (framed ? 0.82 : 1))}
        height={Math.round(size * (framed ? 0.82 : 1))}
        alt="National Assembly of Kenya"
        style={{ display: 'block', objectFit: 'contain' }}
      />
    </span>
  );
}
