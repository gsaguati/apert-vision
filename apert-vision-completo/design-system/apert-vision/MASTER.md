# Design System Master File — Apert Vision

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Apert Vision
**Generated:** 2026-06-24 (adaptado de UI Pro Max Skill + brand existente)
**Category:** Sports Analytics / Computer Vision Dashboard
**Style base:** Dark Mode (OLED), inspirado en plataformas profesionales de análisis deportivo

---

## Global Rules

### Color Palette (BRAND APERT — override de las defaults del skill)

| Role | Hex | CSS Variable | Uso |
|------|-----|--------------|-----|
| Primary | `#39E07A` | `--color-primary` | Verde Apert, CTAs principales, líneas de éxito |
| Primary Dark | `#1DB954` | `--color-primary-dark` | Hover/active del primary |
| Primary Glow | `rgba(57,224,122,0.20)` | `--color-primary-glow` | Sombras y resaltados |
| Background | `#080C14` | `--color-bg` | Fondo principal (dark mode) |
| Surface | `#0F1520` | `--color-surface` | Cards y contenedores |
| Surface 2 | `#151D2E` | `--color-surface-2` | Inputs, secundarios |
| Text | `#E8EAF0` | `--color-text` | Texto principal |
| Text Muted | `#6B7A99` | `--color-text-muted` | Texto secundario |
| Border | `rgba(255,255,255,0.07)` | `--color-border` | Bordes sutiles |
| Accent Blue | `#3B82F6` | `--color-blue` | Scrums (categoría secundaria) |
| Accent Amber | `#F59E0B` | `--color-amber` | Salidas/kickoffs (categoría terciaria) |
| Destructive | `#EF4444` | `--color-destructive` | Errores y eliminar |

### Typography

- **Heading Font:** `Fira Code` (cuando sea para números/data) o `Cambria` (para landing/títulos)
- **Body Font:** `Fira Sans` (mood: dashboard, data, analytics, precise)
- **Mono Font:** `Fira Code` o `JetBrains Mono` (números, timestamps, IDs)
- **Best For:** Dashboards, analytics, data visualization

**Google Fonts:**
```css
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap');
```

### Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps entre íconos y texto |
| `--space-sm` | `8px` / `0.5rem` | Padding interno de chips, badges |
| `--space-md` | `16px` / `1rem` | Padding estándar de cards |
| `--space-lg` | `24px` / `1.5rem` | Section padding, gaps entre cards |
| `--space-xl` | `32px` / `2rem` | Large gaps verticales |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths (adaptadas a dark mode)

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.4)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.5)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.6)` | Hero images, featured cards |
| `--shadow-glow` | `0 0 24px var(--color-primary-glow)` | Resaltado verde Apert |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `4px` | Chips, badges |
| `--radius-md` | `8px` | Buttons, inputs |
| `--radius-lg` | `12px` | Cards |
| `--radius-xl` | `16px` | Modals, hero cards |
| `--radius-full` | `9999px` | Pills, avatars |

---

## Component Specs

### Buttons

```css
/* Primary Button — verde Apert */
.btn-primary {
  background: var(--color-primary);
  color: var(--color-bg);
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 14px;
  border: none;
  transition: all 200ms ease;
  cursor: pointer;
}
.btn-primary:hover {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-glow);
}
.btn-primary:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all 200ms ease;
  cursor: pointer;
}
.btn-secondary:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
```

### Cards

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  transition: all 200ms ease;
}
.card:hover {
  border-color: rgba(57,224,122,0.20);
  box-shadow: var(--shadow-md);
}
```

### Stat Number (para dashboards)

```css
.stat-number {
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-weight: 700;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;  /* números alineados */
}
```

---

## Style Guidelines

**Style:** Dark Mode (OLED) con acento verde lima Apert
**Mood:** Profesional, técnico, deportivo, confiable
**Inspiraciones de referencia:** Linear · Vercel Dashboard · Hudl (sin las partes recargadas)

### Key Effects

- **Minimal glow** en CTAs primarios: `box-shadow: 0 0 24px rgba(57,224,122,0.2)`
- **Smooth transitions** 150-300ms en todo hover/focus
- **Subtle elevation** en cards: `box-shadow: var(--shadow-md)` al hover
- **Tabular nums** en métricas: `font-variant-numeric: tabular-nums`
- **Backdrop blur** en modales: `backdrop-filter: blur(8px)`

### Page Pattern — Video-First (Landing)

- **CTA Placement:** Overlay arriba de cancha + bottom section
- **Section Order:** Hero con cancha de fondo → Problema → Solución (con mockups) → Cómo funciona → Para quién → FAQ → Descarga

### Iconografía

- **Librería principal:** Lucide React (Desktop, Landing) / Material Icons Extended (Mobile)
- **Tamaño base:** 16px (`size={16}`) en inline, 20px en botones, 24px+ en headers
- **Stroke:** consistentemente 2px
- **Color:** heredar de contenedor (`color: currentColor`) salvo iconos categóricos (verde/azul/ambar)

---

## Anti-Patterns (Do NOT Use)

- ❌ **Emojis como íconos** (✅ ⏳ 🏉 etc.) → usar SVG (Lucide/Material Icons)
- ❌ **Light mode default** → Apert es dark mode por diseño
- ❌ **Layout-shifting hovers** (scale que mueve elementos vecinos) → usar transform sin layout
- ❌ **Hover sin transición** → siempre 150-300ms
- ❌ **Focus invisible** → siempre `:focus-visible { outline: 2px solid primary }`
- ❌ **Texto bajo contraste** → mínimo 4.5:1 (texto principal sobre fondo dark = ratio > 12:1)
- ❌ **Botones sin cursor pointer**
- ❌ **Fuentes mixtas inconsistentes** (mezclar 4 tipografías distintas)

---

## Pre-Delivery Checklist

Antes de marcar una pantalla como lista, verificar:

- [ ] Ningún emoji usado como ícono (usar SVG: Lucide o Material Icons)
- [ ] Todos los íconos del mismo set (Lucide en Desktop+Landing, Material Icons en Mobile)
- [ ] `cursor: pointer` en TODO lo clickeable
- [ ] Hover states con transiciones 150-300ms
- [ ] Focus states visibles para keyboard nav (`:focus-visible`)
- [ ] Contraste de texto ≥ 4.5:1 (texto principal típicamente > 12:1 sobre dark)
- [ ] `prefers-reduced-motion` respetado en animaciones
- [ ] Responsive: 375px (mobile), 768px (tablet), 1024px (desktop), 1440px (wide)
- [ ] Touch targets ≥ 44×44px (especial en Mobile)
- [ ] Empty states diseñados (no solo "No data")
- [ ] Loading states con skeleton o spinner
- [ ] Números con `tabular-nums` (no se mueven al cambiar)
- [ ] Tipografía Fira Sans (body) + Fira Code (números) cargada

---

## Stack-Specific Notes

### Landing (React + Vite)
- Tipografía: Fira Code + Fira Sans (override de Barlow que tiene hoy)
- Reemplazar emojis del Hero/Problema por SVG Lucide
- Conservar fondo cancha + cursor cancha verde

### Desktop (Electron + React)
- Tipografía monospace para números en Dashboard/Stats
- Lucide icons consistente (ya está parcialmente)
- Mejorar focus states en inputs y buttons
- Agregar skeleton loaders en Partidos/Dashboard

### Mobile (Kotlin + Compose)
- Material Icons Extended (ya disponible)
- Touch targets ≥ 48dp (Material 3 estándar)
- Sombras suaves con elevation Material
- Tipografía: cargar Fira Sans desde Google Fonts via `Font(R.font.fira_sans)`
