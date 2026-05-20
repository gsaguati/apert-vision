export default function SectionTitle({ main, green, style = {} }) {
  return (
    <h2 style={{
      fontFamily: 'var(--display)',
      fontSize: 'clamp(46px, 6vw, 78px)',
      lineHeight: 0.92,
      letterSpacing: 1,
      marginBottom: 22,
      ...style,
    }}>
      {main}
      <br />
      <span style={{ color: 'var(--verde)' }}>{green}</span>
    </h2>
  )
}
