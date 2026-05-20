export default function SectionTag({ children }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--verde)',
      letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18,
    }}>
      <span style={{ width: 22, height: 1, background: 'var(--verde)', display: 'block' }} />
      {children}
    </div>
  )
}
