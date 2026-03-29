import { useEffect, useRef, useState } from "react";

const EntryAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId: number;
    let progress = 0;
    const duration = 3000;
    const startTime = Date.now();

    const drawSPen = (x: number, y: number, rotation: number, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(x, y);
      ctx.rotate(rotation);

      ctx.fillStyle = "rgba(59, 130, 246, 0.9)";
      ctx.fillRect(-4, -40, 8, 80);

      ctx.fillStyle = "rgba(59, 130, 246, 0.6)";
      ctx.beginPath();
      ctx.arc(0, -45, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(59, 130, 246, ${0.8 * opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, -45, 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    };

    const drawGeometricShapes = (p: number, opacity: number) => {
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.5 * opacity})`;
      ctx.lineWidth = 2;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      const drawWave = (startX: number, startY: number, length: number) => {
        ctx.beginPath();
        const points = 100;
        for (let i = 0; i < points; i++) {
          const x = startX + (i / points) * length * p;
          const y = startY + Math.sin((i / points) * Math.PI * 4 + p * Math.PI) * 20;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      drawWave(centerX - 200, centerY - 100, 400);
      drawWave(centerX - 200, centerY + 100, 400);

      ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * opacity})`;
      ctx.beginPath();
      const r = 50 * p;
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(59, 130, 246, ${0.4 * opacity})`;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + p * Math.PI;
        const x1 = centerX + Math.cos(angle) * 80;
        const y1 = centerY + Math.sin(angle) * 80;
        const x2 = centerX + Math.cos(angle + Math.PI) * 120;
        const y2 = centerY + Math.sin(angle + Math.PI) * 120;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    };

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      progress = Math.min(elapsed / duration, 1);

      ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const penProgress = Math.min(progress * 1.2, 1);
      const penOpacity = Math.max(1 - (progress - 0.7) * 3.33, 0);

      if (penProgress < 1) {
        const penX = (canvas.width / 2) - 300 + penProgress * 600;
        const penY = (canvas.height / 2) - 200 + Math.sin(penProgress * Math.PI) * 100;
        const rotation = penProgress * Math.PI * 2;
        drawSPen(penX, penY, rotation, penOpacity);
      }

      const shapeProgress = Math.max(progress - 0.2, 0) / 0.6;
      if (shapeProgress > 0) {
        drawGeometricShapes(shapeProgress, Math.max(1 - progress, 0));
      }

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        onComplete();
      }
    };

    animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [onComplete]);

  if (!isAnimating) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 bg-slate-950"
      style={{ pointerEvents: isAnimating ? "auto" : "none" }}
    />
  );
};

export default EntryAnimation;
