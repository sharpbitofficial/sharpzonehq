import { useEffect, useRef, useState, useCallback } from "react";

const EntryAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [opacity, setOpacity] = useState(1);

  const stableOnComplete = useCallback(onComplete, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const duration = 3500; // ms
    const start = performance.now();
    let raf: number;

    // Easing
    const ease = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

    // Phase timings (normalized 0-1)
    const phases = {
      glow:      [0, 0.14],
      spen:      [0.10, 0.24],
      compass:   [0.20, 0.40],
      geometric: [0.35, 0.58],
      logoReveal:[0.55, 0.72],
      textWrite: [0.68, 0.88],
      finalHold: [0.88, 1.0],
    };

    const phaseProgress = (t: number, [s, e]: number[]) => clamp01((t - s) / (e - s));

    const drawSPen = (ctx: CanvasRenderingContext2D, cx: number, cy: number, angle: number, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      // Pen body
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.roundRect(-3, -35, 6, 55, 2);
      ctx.fill();
      // Pen tip
      ctx.fillStyle = "#1d4ed8";
      ctx.beginPath();
      ctx.moveTo(-3, 20);
      ctx.lineTo(3, 20);
      ctx.lineTo(0, 30);
      ctx.closePath();
      ctx.fill();
      // Button
      ctx.fillStyle = "#60a5fa";
      ctx.fillRect(-2, -20, 4, 8);
      ctx.restore();
    };

    const drawCompass = (ctx: CanvasRenderingContext2D, cx: number, cy: number, angle: number, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy);
      // Pivot
      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      // Left leg (pencil)
      ctx.save();
      ctx.rotate(angle - 0.25);
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 40);
      ctx.stroke();
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.moveTo(-2, 38);
      ctx.lineTo(2, 38);
      ctx.lineTo(0, 44);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      // Right leg (needle)
      ctx.save();
      ctx.rotate(-(angle - 0.25));
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 40);
      ctx.stroke();
      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.moveTo(-1, 38);
      ctx.lineTo(1, 38);
      ctx.lineTo(0, 45);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.restore();
    };

    const animate = (now: number) => {
      const elapsed = now - start;
      const t = clamp01(elapsed / duration);
      const w = W(), h = H();
      const cx = w / 2, cy = h / 2;

      // Clear
      ctx.clearRect(0, 0, w, h);

      // Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
      bgGrad.addColorStop(0, "#0f1729");
      bgGrad.addColorStop(0.5, "#0c1220");
      bgGrad.addColorStop(1, "#060a14");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Phase 1: Soft glow
      const glowP = ease(phaseProgress(t, phases.glow));
      if (glowP > 0) {
        const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
        glowGrad.addColorStop(0, `rgba(59,130,246,${0.15 * glowP})`);
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // Phase 2: S-Pen baseline stroke
      const spenP = ease(phaseProgress(t, phases.spen));
      if (spenP > 0 && t < phases.geometric[1]) {
        const lineStartX = cx - 100;
        const lineEndX = cx + 100;
        const lineX = lineStartX + (lineEndX - lineStartX) * spenP;
        const penAlpha = t > phases.compass[0] ? clamp01(1 - phaseProgress(t, [phases.compass[0], phases.compass[1]])) : 1;
        // Draw baseline
        ctx.strokeStyle = `rgba(59,130,246,${0.6 * Math.min(spenP * 2, 1)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lineStartX, cy + 30);
        ctx.lineTo(lineX, cy + 30);
        ctx.stroke();
        // Draw S-Pen
        drawSPen(ctx, lineX, cy + 30, -Math.PI / 6, penAlpha);
      }

      // Phase 3: Compass circle
      const compassP = ease(phaseProgress(t, phases.compass));
      if (compassP > 0) {
        const circleR = 45;
        const fadeOut = t > phases.logoReveal[0] ? clamp01(1 - phaseProgress(t, phases.logoReveal)) : 1;
        // Circle arc
        ctx.strokeStyle = `rgba(59,130,246,${0.7 * fadeOut})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy - 10, circleR, 0, Math.PI * 2 * compassP);
        ctx.stroke();
        // Glow on circle
        if (compassP > 0.8) {
          const glowAlpha = (compassP - 0.8) / 0.2 * 0.3 * fadeOut;
          const cGlow = ctx.createRadialGradient(cx, cy - 10, circleR - 5, cx, cy - 10, circleR + 15);
          cGlow.addColorStop(0, `rgba(59,130,246,${glowAlpha})`);
          cGlow.addColorStop(1, "transparent");
          ctx.fillStyle = cGlow;
          ctx.beginPath();
          ctx.arc(cx, cy - 10, circleR + 15, 0, Math.PI * 2);
          ctx.fill();
        }
        // Draw compass tool
        if (compassP < 1) {
          const compassAngle = compassP * Math.PI * 2;
          drawCompass(ctx, cx, cy - 10, 0.3, fadeOut * 0.8);
        }
      }

      // Phase 4: Geometric tools - triangle + ruler lines
      const geoP = ease(phaseProgress(t, phases.geometric));
      if (geoP > 0) {
        const fadeOut = t > phases.logoReveal[0] ? clamp01(1 - phaseProgress(t, phases.logoReveal)) : 1;
        ctx.strokeStyle = `rgba(96,165,250,${0.5 * fadeOut})`;
        ctx.lineWidth = 1.5;

        // Triangle (set square)
        const triP = clamp01(geoP * 2);
        if (triP > 0) {
          const pts = [
            [cx - 50, cy + 30],
            [cx, cy - 50],
            [cx + 50, cy + 30],
          ];
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          for (let i = 1; i <= 3; i++) {
            const segP = clamp01(triP * 3 - (i - 1));
            if (segP > 0) {
              const prev = pts[(i - 1) % 3];
              const next = pts[i % 3];
              ctx.lineTo(
                prev[0] + (next[0] - prev[0]) * segP,
                prev[1] + (next[1] - prev[1]) * segP
              );
            }
          }
          ctx.stroke();
        }

        // Horizontal ruler lines
        const rulerP = clamp01(geoP * 2 - 0.5);
        if (rulerP > 0) {
          ctx.strokeStyle = `rgba(148,163,184,${0.3 * fadeOut})`;
          ctx.lineWidth = 1;
          for (let i = 0; i < 3; i++) {
            const lp = clamp01(rulerP * 3 - i * 0.5);
            if (lp > 0) {
              const y = cy - 20 + i * 25;
              ctx.beginPath();
              ctx.moveTo(cx - 60, y);
              ctx.lineTo(cx - 60 + 120 * lp, y);
              ctx.stroke();
            }
          }
        }

        // Diagonal precision lines
        const diagP = clamp01(geoP * 2 - 0.7);
        if (diagP > 0) {
          ctx.strokeStyle = `rgba(59,130,246,${0.4 * fadeOut})`;
          const diags = [
            [cx - 40, cy + 30, cx + 40, cy - 40],
            [cx + 40, cy + 30, cx - 40, cy - 40],
          ];
          diags.forEach(([x1, y1, x2, y2]) => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1 + (x2 - x1) * diagP, y1 + (y2 - y1) * diagP);
            ctx.stroke();
          });
        }
      }

      // Phase 5: Logo reveal - geometric lines morph into logo shape
      const logoP = ease(phaseProgress(t, phases.logoReveal));
      if (logoP > 0) {
        ctx.save();
        ctx.globalAlpha = logoP;
        // Shield/logo shape
        const logoGrad = ctx.createLinearGradient(cx - 40, cy - 50, cx + 40, cy + 40);
        logoGrad.addColorStop(0, "#3b82f6");
        logoGrad.addColorStop(0.5, "#2563eb");
        logoGrad.addColorStop(1, "#0ea5e9");
        ctx.fillStyle = logoGrad;
        ctx.strokeStyle = "rgba(96,165,250,0.8)";
        ctx.lineWidth = 2;
        // Draw a stylized "S" shield
        ctx.beginPath();
        ctx.moveTo(cx, cy - 40);
        ctx.bezierCurveTo(cx + 35, cy - 40, cx + 40, cy - 15, cx + 30, cy);
        ctx.bezierCurveTo(cx + 20, cy + 12, cx + 5, cy + 20, cx, cy + 40);
        ctx.bezierCurveTo(cx - 5, cy + 20, cx - 20, cy + 12, cx - 30, cy);
        ctx.bezierCurveTo(cx - 40, cy - 15, cx - 35, cy - 40, cx, cy - 40);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner "S" letter
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(cx + 12, cy - 18);
        ctx.bezierCurveTo(cx + 5, cy - 25, cx - 15, cy - 22, cx - 12, cy - 10);
        ctx.bezierCurveTo(cx - 8, cy, cx + 8, cy + 2, cx + 12, cy + 12);
        ctx.bezierCurveTo(cx + 15, cy + 24, cx - 5, cy + 27, cx - 12, cy + 20);
        ctx.stroke();

        // Glow
        const logoGlow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 80);
        logoGlow.addColorStop(0, `rgba(59,130,246,${0.2 * logoP})`);
        logoGlow.addColorStop(1, "transparent");
        ctx.fillStyle = logoGlow;
        ctx.fillRect(cx - 80, cy - 80, 160, 160);
        ctx.restore();
      }

      // Phase 6: Text writing "SharpZone"
      const textP = ease(phaseProgress(t, phases.textWrite));
      if (textP > 0) {
        const text = "SharpZone";
        const fontSize = Math.min(w * 0.06, 36);
        ctx.save();
        ctx.font = `700 ${fontSize}px 'Space Grotesk', system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const textY = cy + 55;

        // Clip to reveal text progressively
        const textWidth = ctx.measureText(text).width;
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx - textWidth / 2 - 5, textY - 5, (textWidth + 10) * textP, fontSize + 10);
        ctx.clip();

        // Text gradient
        const tGrad = ctx.createLinearGradient(cx - textWidth / 2, 0, cx + textWidth / 2, 0);
        tGrad.addColorStop(0, "#ffffff");
        tGrad.addColorStop(0.5, "#e0f2fe");
        tGrad.addColorStop(1, "#bfdbfe");
        ctx.fillStyle = tGrad;
        ctx.fillText(text, cx, textY);
        ctx.restore();

        // S-Pen writing effect
        if (textP < 0.95) {
          const penX = cx - textWidth / 2 + textWidth * textP;
          drawSPen(ctx, penX, textY + fontSize / 2, -Math.PI / 5, clamp01((1 - textP) * 3));
        }

        // Glow on completion
        if (textP > 0.9) {
          const glowA = (textP - 0.9) / 0.1 * 0.4;
          ctx.shadowColor = `rgba(59,130,246,${glowA})`;
          ctx.shadowBlur = 20;
          ctx.fillStyle = `rgba(255,255,255,${glowA * 0.3})`;
          ctx.fillText(text, cx, textY);
          ctx.shadowBlur = 0;
        }

        // Tagline
        if (textP > 0.5) {
          const tagP = clamp01((textP - 0.5) / 0.5);
          ctx.globalAlpha = tagP;
          ctx.font = `400 ${fontSize * 0.35}px 'DM Sans', system-ui, sans-serif`;
          ctx.fillStyle = `rgba(148,163,184,${tagP})`;
          ctx.fillText("Precision in Every Pixel", cx, textY + fontSize + 8);
          ctx.globalAlpha = 1;
        }
        ctx.restore();
      }

      // Phase 7: Final hold + transition
      if (t >= 1) {
        setOpacity(0);
        setTimeout(() => {
          setIsAnimating(false);
          stableOnComplete();
        }, 400);
        return;
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [stableOnComplete]);

  if (!isAnimating) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50"
      style={{
        opacity,
        transition: "opacity 0.4s ease-out",
        background: "#060a14",
        pointerEvents: isAnimating ? "auto" : "none",
      }}
    />
  );
};

export default EntryAnimation;
