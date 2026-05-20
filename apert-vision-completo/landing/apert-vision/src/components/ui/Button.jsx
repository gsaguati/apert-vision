import { useState } from 'react'

export function BtnPrimary({ href = '#', children, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <a
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        background: hov ? 'var(--verde2)' : 'var(--verde)',
        color: 'var(--negro)',
        padding: '15px 30px', borderRadius: 4,
        fontSize: 15, fontWeight: 700,
        textDecoration: 'none',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? '0 8px 32px var(--verde-glow)' : 'none',
        transition: 'all .2s',
      }}
    >
      {children}
    </a>
  )
}

export function BtnSecondary({ href = '#', children }) {
  const [hov, setHov] = useState(false)
  return (
    <a
      href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        background: 'transparent',
        color: hov ? 'var(--verde)' : 'var(--blanco)',
        padding: '14px 26px', borderRadius: 4,
        fontSize: 15, fontWeight: 500,
        textDecoration: 'none',
        border: `1px solid ${hov ? 'var(--verde)' : 'var(--gris2)'}`,
        transform: hov ? 'translateY(-2px)' : 'none',
        transition: 'all .2s',
      }}
    >
      {children}
    </a>
  )
}
