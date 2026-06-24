// ─────────────────────────────────────────────────────────────────────────────
// Sistema de íconos de línea (estilo Lucide) — reemplaza los emojis del sitio.
// Uso: <Icon name="clock" size={22} />  · hereda el color con currentColor.
// ─────────────────────────────────────────────────────────────────────────────

const PATHS = {
  // ── Computer vision / marca ──────────────────────────────
  scan: (
    <>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <rect x="8" y="8" width="8" height="8" rx="1" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ),

  // ── Problema ─────────────────────────────────────────────
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v17a1 1 0 0 0 1 1h17" />
      <path d="M8 16v-4" />
      <path d="M13 16V9" />
      <path d="M18 16v-7" />
    </>
  ),
  film: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
    </>
  ),
  wallet: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" />
      <path d="M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3" />
      <path d="M21 11v4h-4a2 2 0 0 1 0-4h4Z" />
    </>
  ),

  // ── Solución / formaciones ───────────────────────────────
  lineout: (
    <>
      <path d="M12 3v6" />
      <path d="m8 7 4-4 4 4" />
      <circle cx="6" cy="14" r="2" />
      <circle cx="18" cy="14" r="2" />
      <path d="M4 21v-1a2 2 0 0 1 2-2 2 2 0 0 1 2 2v1" />
      <path d="M16 21v-1a2 2 0 0 1 2-2 2 2 0 0 1 2 2v1" />
    </>
  ),
  scrum: (
    <>
      <path d="M12 3 4 6v5c0 4 3.4 7.6 8 10 4.6-2.4 8-6 8-10V6l-8-3Z" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  kickoff: (
    <>
      <path d="M12 2c3 2.5 5 6 5 10a5 5 0 0 1-10 0c0-4 2-7.5 5-10Z" />
      <path d="M9 17c-1.5 1-2 3-2 5M15 17c1.5 1 2 3 2 5" />
      <circle cx="12" cy="11" r="1.5" />
    </>
  ),

  // ── Audiencia ────────────────────────────────────────────
  trophy: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" />
      <path d="M12 14v3M9 21h6M10 21v-2a2 2 0 0 1 4 0v2" />
    </>
  ),
  player: (
    <>
      <circle cx="13" cy="5" r="2" />
      <path d="m6 21 3-5 2 2 3-1" />
      <path d="m11 18 1-5-3 1-1 3" />
      <path d="m12 13 4 1 3-3" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v15" />
      <path d="M12 9h7a1 1 0 0 1 1 1v11" />
      <path d="M7 9h1M7 13h1M16 13h1M7 17h1M16 17h1M3 21h18" />
    </>
  ),

  // ── Tecnología ───────────────────────────────────────────
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </>
  ),
  video: (
    <>
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="m16 10 6-3v10l-6-3" />
    </>
  ),
  terminal: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9 3 3-3 3M13 15h4" />
    </>
  ),
  zap: (
    <>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </>
  ),
  smartphone: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </>
  ),
  cloud: (
    <>
      <path d="M7 18a4 4 0 0 1-.5-7.97 5.5 5.5 0 0 1 10.6-1.04A3.75 3.75 0 0 1 17 18H7Z" />
    </>
  ),

  // ── Descarga / plataformas ───────────────────────────────
  windows: (
    <>
      <path d="M3 5.5 10.5 4.5v7H3V5.5Z" />
      <path d="M12 4.2 21 3v8.5h-9V4.2Z" />
      <path d="M3 12.5h7.5v7L3 18.5v-6Z" />
      <path d="M12 12.5h9V21l-9-1.2v-7.3Z" />
    </>
  ),
  android: (
    <>
      <path d="M5 17a7 7 0 0 1 14 0H5Z" />
      <path d="m6 8 2 3M18 8l-2 3" />
      <path d="M5 17v3M19 17v3" />
      <circle cx="9.5" cy="13.5" r=".6" fill="currentColor" />
      <circle cx="14.5" cy="13.5" r=".6" fill="currentColor" />
    </>
  ),
  apple: (
    <>
      <path d="M16 12.5c0-2 1.5-3 1.6-3.1A4 4 0 0 0 14 7.5c-1.3 0-2 .7-3 .7s-1.8-.7-3-.7A4.2 4.2 0 0 0 5 11.7C5 15 7.5 19 9.5 19c1 0 1.3-.6 2.5-.6s1.5.6 2.5.6c1.4 0 2.6-2 3.5-3.7-1.7-.7-2-2.5-2-2.8Z" />
      <path d="M12.5 5c.7-.9.6-2 .6-2s-1.1.1-1.8.9c-.6.7-.6 1.8-.6 1.8s1.1.1 1.8-.7Z" />
    </>
  ),
  linux: (
    <>
      <path d="M9 4a3 3 0 0 1 6 0c0 1.5-.5 2.5-.5 4 0 1 .5 1.5 1.5 3s2 3 2 5a2 2 0 0 1-2.5 2c-.8 1-2 1-3.5 1s-2.7 0-3.5-1A2 2 0 0 1 6 16c0-2 1-3.5 2-5s1.5-2 1.5-3c0-1.5-.5-2.5-.5-4Z" />
      <path d="M10.5 9c.5.4 2.5.4 3 0" />
      <circle cx="10.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="13.5" cy="7.5" r=".5" fill="currentColor" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 21h14" />
    </>
  ),

  // ── UI ───────────────────────────────────────────────────
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  arrowUpRight: (
    <>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </>
  ),
  check: <path d="m5 12 4 4 10-10" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  play: <path d="M8 5.5v13l11-6.5-11-6.5Z" />,
  upload: (
    <>
      <path d="M12 21V9" />
      <path d="m7 13 5-5 5 5" />
      <path d="M5 4h14" />
    </>
  ),
}

// Esquinas tipo "bounding box" de computer vision para enmarcar elementos.
export function CvCorners() {
  return (
    <>
      <span className="cv-corner tl" />
      <span className="cv-corner tr" />
      <span className="cv-corner bl" />
      <span className="cv-corner br" />
    </>
  )
}

export default function Icon({ name, size = 24, strokeWidth = 1.6, style, className }) {
  const path = PATHS[name]
  if (!path) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {path}
    </svg>
  )
}
