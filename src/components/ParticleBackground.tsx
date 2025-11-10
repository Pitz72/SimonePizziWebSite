import React, { useRef, useEffect } from 'react';

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particlesArray: Particle[] = [];
    const numberOfParticles = 30;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      canvas: HTMLCanvasElement; // Aggiungi canvas come proprietà della classe
      ctx: CanvasRenderingContext2D; // Aggiungi ctx come proprietà della classe

      constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas; // Assegna canvas alla proprietà della classe
        this.ctx = ctx; // Assegna ctx alla proprietà della classe
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() * 0.4 - 0.2);
        this.speedY = (Math.random() * 0.4 - 0.2);
        this.color = 'rgba(34, 197, 94, 0.5)';
      }

      update() {
        if (this.x > this.canvas.width || this.x < 0) this.speedX *= -1; // Usa this.canvas
        if (this.y > this.canvas.height || this.y < 0) this.speedY *= -1; // Usa this.canvas
        this.x += this.speedX;
        this.y += this.speedY;
      }

      draw() {
        this.ctx.fillStyle = this.color; // Usa this.ctx
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    const init = () => {
      particlesArray = [];
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle(canvas, ctx)); // Passa canvas e ctx
      }
    };
    init();

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
        setCanvasSize();
        init();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 -z-20" />;
};

export default ParticleBackground;
