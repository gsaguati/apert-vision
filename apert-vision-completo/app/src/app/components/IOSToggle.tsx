import { useState, useCallback } from "react";
import { motion } from "motion/react";

interface IOSToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizes = {
  sm: { trackW: 36, trackH: 22, thumb: 16, offX: 3, onX: 17 },
  md: { trackW: 51, trackH: 31, thumb: 25, offX: 3, onX: 23 },
  lg: { trackW: 60, trackH: 36, thumb: 30, offX: 3, onX: 27 },
};

function playToggleSound(on: boolean) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";

    if (on) {
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.065);
    } else {
      osc.frequency.setValueAtTime(720, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(360, ctx.currentTime + 0.075);
    }

    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.11);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.13);
    osc.onended = () => ctx.close();
  } catch {
    // audio unavailable
  }
}

export function IOSToggle({
  checked = false,
  onChange,
  disabled = false,
  size = "md",
  label,
}: IOSToggleProps) {
  const [isOn, setIsOn] = useState(checked);
  const s = sizes[size];

  const toggle = useCallback(() => {
    if (disabled) return;
    const next = !isOn;
    setIsOn(next);
    playToggleSound(next);
    onChange?.(next);
  }, [isOn, disabled, onChange]);

  return (
    <div className="flex items-center gap-3">
      {label && (
        <span className="text-foreground select-none">{label}</span>
      )}
      <button
        role="switch"
        aria-checked={isOn}
        onClick={toggle}
        disabled={disabled}
        className={`relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
        style={{
          width: s.trackW,
          height: s.trackH,
          backgroundColor: isOn ? "#39e07a" : "#2a3550",
          transition: "background-color 0.2s ease",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <motion.span
          initial={false}
          animate={{ x: isOn ? s.onX : s.offX }}
          transition={{
            type: "spring",
            stiffness: 480,
            damping: 26,
            mass: 0.9,
          }}
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            translateY: "-50%",
            width: s.thumb,
            height: s.thumb,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.25)",
          }}
        />
      </button>
    </div>
  );
}
