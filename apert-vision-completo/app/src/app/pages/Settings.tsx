import { useState } from "react";
import { IOSToggle } from "../components/IOSToggle";
import { Save, Info } from "lucide-react";

const teamColors = [
  { name: "Verde", hex: "#16a34a" },
  { name: "Azul", hex: "#2563eb" },
  { name: "Rojo", hex: "#dc2626" },
  { name: "Blanco", hex: "#f8fafc" },
  { name: "Negro", hex: "#0f172a" },
  { name: "Amarillo", hex: "#ca8a04" },
  { name: "Celeste", hex: "#0284c7" },
  { name: "Naranja", hex: "#ea580c" },
];

export default function Settings() {
  const [homeColor, setHomeColor] = useState("#16a34a");
  const [awayColor, setAwayColor] = useState("#2563eb");
  const [confidence, setConfidence] = useState(85);
  const [saved, setSaved] = useState(false);

  const [toggles, setToggles] = useState({
    autoDetect: true,
    showBoundingBoxes: true,
    showConfidence: true,
    realtimePossession: true,
    audioFeedback: false,
    darkMode: true,
    emailNotifications: false,
    autoExport: false,
  });

  const setToggle = (key: keyof typeof toggles) => (v: boolean) =>
    setToggles(t => ({ ...t, [key]: v }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
      <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <h2 className="text-foreground" style={{ fontSize: 13, fontWeight: 600 }}>{title}</h2>
      </div>
      <div className="divide-y" style={{ borderColor: "var(--border)" }}>
        {children}
      </div>
    </div>
  );

  const Row = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <div className="text-foreground" style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {description && <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{description}</div>}
      </div>
      {children}
    </div>
  );

  return (
    <div className="p-6 max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground" style={{ fontSize: 18 }}>Configuración</h1>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Preferencias del sistema de análisis</div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-80 transition-all"
          style={{
            backgroundColor: saved ? "rgba(57,224,122,0.15)" : "var(--primary)",
            color: saved ? "var(--primary)" : "var(--primary-foreground)",
            fontSize: 13,
            fontWeight: 500,
            border: saved ? "1px solid var(--primary)" : "none",
          }}
        >
          <Save size={14} />
          {saved ? "¡Guardado!" : "Guardar cambios"}
        </button>
      </div>

      {/* Team colors */}
      <Section title="Colores de Equipos">
        <div className="px-5 py-4">
          <div className="flex items-start gap-2 p-3 rounded-lg mb-4" style={{ backgroundColor: "rgba(57,224,122,0.06)", border: "1px solid rgba(57,224,122,0.2)" }}>
            <Info size={14} style={{ color: "var(--primary)", marginTop: 1, shrink: 0 }} />
            <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              Estos colores se usan para identificar posesión de pelota en el análisis de video. Si los colores son muy similares, la detección puede ser imprecisa.
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {[
              { label: "Equipo Local", current: homeColor, set: setHomeColor },
              { label: "Equipo Visitante", current: awayColor, set: setAwayColor },
            ].map(({ label, current, set }) => (
              <div key={label}>
                <div className="text-foreground mb-2" style={{ fontSize: 12, fontWeight: 500 }}>{label}</div>
                <div className="flex flex-wrap gap-2">
                  {teamColors.map(c => (
                    <button
                      key={c.hex}
                      onClick={() => set(c.hex)}
                      title={c.name}
                      className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c.hex,
                        outline: current === c.hex ? "2px solid var(--primary)" : "2px solid transparent",
                        outlineOffset: 2,
                        border: c.hex === "#f8fafc" ? "1px solid rgba(255,255,255,0.15)" : "none",
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: current }} />
                  <span className="font-mono" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{current}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* AI settings */}
      <Section title="Modelo de IA">
        <Row label="Umbral de confianza" description="Formaciones por debajo de este umbral no se muestran">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={50}
              max={99}
              value={confidence}
              onChange={e => setConfidence(Number(e.target.value))}
              style={{ width: 100, accentColor: "var(--primary)" }}
            />
            <span className="font-mono" style={{ fontSize: 13, color: "var(--primary)", fontWeight: 500, minWidth: 36 }}>
              {confidence}%
            </span>
          </div>
        </Row>
        <Row label="Detección automática de formaciones" description="YOLO detecta line-outs, scrums y salidas automáticamente">
          <IOSToggle checked={toggles.autoDetect} onChange={setToggle("autoDetect")} size="sm" />
        </Row>
        <Row label="Mostrar bounding boxes en video" description="Dibuja recuadros sobre las formaciones detectadas">
          <IOSToggle checked={toggles.showBoundingBoxes} onChange={setToggle("showBoundingBoxes")} size="sm" />
        </Row>
        <Row label="Mostrar porcentaje de confianza" description="Superpone el score de confianza en cada detección">
          <IOSToggle checked={toggles.showConfidence} onChange={setToggle("showConfidence")} size="sm" />
        </Row>
        <Row label="Indicador de posesión en tiempo real" description="Muestra el HUD de posesión superpuesto en el video">
          <IOSToggle checked={toggles.realtimePossession} onChange={setToggle("realtimePossession")} size="sm" />
        </Row>
      </Section>

      {/* Interface */}
      <Section title="Interfaz">
        <Row label="Feedback de audio" description="Sonido de confirmación al activar opciones">
          <IOSToggle checked={toggles.audioFeedback} onChange={setToggle("audioFeedback")} size="sm" />
        </Row>
        <Row label="Modo oscuro" description="Tema oscuro para uso en vestuario o sala de análisis">
          <IOSToggle checked={toggles.darkMode} onChange={setToggle("darkMode")} size="sm" />
        </Row>
      </Section>

      {/* Notifications */}
      <Section title="Notificaciones">
        <Row label="Notificaciones por email" description="Recibir email cuando finalice el procesamiento de un video">
          <IOSToggle checked={toggles.emailNotifications} onChange={setToggle("emailNotifications")} size="sm" />
        </Row>
        <Row label="Exportación automática" description="Generar PDF automáticamente al completar cada análisis">
          <IOSToggle checked={toggles.autoExport} onChange={setToggle("autoExport")} size="sm" />
        </Row>
      </Section>

      {/* Model info */}
      <div
        className="rounded-xl border p-4 flex items-center justify-between"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div>
          <div className="text-foreground" style={{ fontSize: 13, fontWeight: 500 }}>Modelo activo</div>
          <div className="font-mono" style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>
            YOLO v8 · Rugby Formation Model v2.1.4
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono"
          style={{ backgroundColor: "rgba(57,224,122,0.1)", fontSize: 11, color: "var(--primary)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--primary)" }} />
          ACTIVO
        </div>
      </div>
    </div>
  );
}
