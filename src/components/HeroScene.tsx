"use client";
import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  pulseOffset: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
}

export default function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let mouseX = 0;
    let mouseY = 0;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", handleMouse);

    // Orbital nodes
    const nodes: Node[] = [
      { x: 0, y: 0, vx: 0, vy: 0, radius: 6, color: "#00D4FF", pulseOffset: 0 },
      { x: 0, y: 0, vx: 0, vy: 0, radius: 5, color: "#7B61FF", pulseOffset: 1 },
      { x: 0, y: 0, vx: 0, vy: 0, radius: 7, color: "#0066FF", pulseOffset: 2 },
      { x: 0, y: 0, vx: 0, vy: 0, radius: 4, color: "#00D4FF", pulseOffset: 3 },
      { x: 0, y: 0, vx: 0, vy: 0, radius: 5, color: "#7B61FF", pulseOffset: 4 },
      { x: 0, y: 0, vx: 0, vy: 0, radius: 6, color: "#0066FF", pulseOffset: 5 },
    ];

    const orbits = [
      { radius: 120, speed: 0.4, offset: 0 },
      { radius: 160, speed: -0.3, offset: 2 },
      { radius: 100, speed: 0.5, offset: 4 },
      { radius: 190, speed: 0.25, offset: 1 },
      { radius: 140, speed: -0.45, offset: 3 },
      { radius: 175, speed: 0.2, offset: 5 },
    ];

    // Particles
    const particles: Particle[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * 1200 - 600,
      y: Math.random() * 800 - 400,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      size: Math.random() * 1.5 + 0.5,
    }));

    const drawGlow = (x: number, y: number, radius: number, color: string, alpha: number) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, color + Math.round(alpha * 255).toString(16).padStart(2, "0"));
      grad.addColorStop(1, color + "00");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2 + mouseX * 30;
      const cy = H / 2 + mouseY * 20;

      ctx.clearRect(0, 0, W, H);
      time += 0.008;

      // === Particles ===
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x > W / 2 + 600) p.x = -600;
        if (p.x < -600) p.x = W / 2 + 600;
        if (p.y > H / 2 + 400) p.y = -400;
        if (p.y < -400) p.y = H / 2 + 400;

        ctx.beginPath();
        ctx.arc(cx + p.x, cy + p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${p.alpha * (0.5 + Math.sin(time * 2 + p.x) * 0.3)})`;
        ctx.fill();
      });

      // === Orbital rings ===
      [120, 155, 190].forEach((r, i) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.35, time * (i % 2 === 0 ? 0.2 : -0.15), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 102, 255, ${0.12 - i * 0.02})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // === Update & draw orbital nodes ===
      nodes.forEach((node, i) => {
        const orb = orbits[i];
        const angle = time * orb.speed + orb.offset;
        node.x = cx + Math.cos(angle) * orb.radius;
        node.y = cy + Math.sin(angle) * orb.radius * 0.38;

        // Connection line to center
        const lineAlpha = 0.15 + Math.sin(time * 2 + orb.offset) * 0.1;
        const grad = ctx.createLinearGradient(cx, cy, node.x, node.y);
        grad.addColorStop(0, node.color + "00");
        grad.addColorStop(0.5, node.color + Math.round(lineAlpha * 255).toString(16).padStart(2, "0"));
        grad.addColorStop(1, node.color + "00");
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(node.x, node.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Node glow
        const pulse = 1 + Math.sin(time * 3 + node.pulseOffset) * 0.3;
        drawGlow(node.x, node.y, node.radius * 5 * pulse, node.color, 0.15);

        // Node core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
        const nodeGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * pulse);
        nodeGrad.addColorStop(0, "#ffffff");
        nodeGrad.addColorStop(0.4, node.color);
        nodeGrad.addColorStop(1, node.color + "88");
        ctx.fillStyle = nodeGrad;
        ctx.fill();
      });

      // === Central brain ===
      // Outer aura
      drawGlow(cx, cy, 90, "#0066FF", 0.06 + Math.sin(time) * 0.02);
      drawGlow(cx, cy, 55, "#00D4FF", 0.1 + Math.sin(time * 1.5) * 0.03);

      // Rotating hexagon wireframe
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.5);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const x = Math.cos(a) * 38;
        const y = Math.sin(a) * 38;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(0, 102, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Inner rotating triangle
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-time * 0.8);
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        const x = Math.cos(a) * 24;
        const y = Math.sin(a) * 24;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(0, 212, 255, 0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Core circle
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
      coreGrad.addColorStop(0, "#ffffff");
      coreGrad.addColorStop(0.3, "#00D4FF");
      coreGrad.addColorStop(1, "#0066FF");
      ctx.beginPath();
      ctx.arc(cx, cy, 16 + Math.sin(time * 2) * 2, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
}
