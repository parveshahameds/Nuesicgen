
import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isGenerating: boolean;
  isPlaying: boolean;
  melody: any;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ 
  isGenerating, 
  isPlaying, 
  melody 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    let animationTime = 0;

    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      if (isGenerating) {
        // Neural network generation visualization
        drawGenerationWaves(ctx, rect.width, rect.height, animationTime);
      } else if (isPlaying && melody) {
        // Audio playback visualization
        drawPlaybackWaves(ctx, rect.width, rect.height, animationTime);
      } else if (melody) {
        // Static waveform when not playing
        drawStaticWaveform(ctx, rect.width, rect.height);
      } else {
        // Default state
        drawIdleState(ctx, rect.width, rect.height);
      }

      animationTime += 0.02;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isGenerating, isPlaying, melody]);

  const drawGenerationWaves = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const centerY = height / 2;
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#8b5cf6');
    gradient.addColorStop(0.5, '#3b82f6');
    gradient.addColorStop(1, '#8b5cf6');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = 0; x < width; x++) {
      const frequency1 = 0.01;
      const frequency2 = 0.03;
      const amplitude1 = 30 * Math.sin(time * 2);
      const amplitude2 = 20 * Math.cos(time * 1.5);
      
      const y = centerY + 
        amplitude1 * Math.sin(x * frequency1 + time * 3) +
        amplitude2 * Math.sin(x * frequency2 + time * 2);
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();

    // Add neural processing indicators
    for (let i = 0; i < 5; i++) {
      const x = (width / 5) * i + (time * 50) % (width / 5);
      const opacity = Math.sin(time * 3 + i) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(139, 92, 246, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, centerY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawPlaybackWaves = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const centerY = height / 2;
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#10b981');
    gradient.addColorStop(0.5, '#3b82f6');
    gradient.addColorStop(1, '#10b981');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let x = 0; x < width; x++) {
      const progress = (x / width + time * 0.5) % 1;
      const amplitude = 40 * Math.sin(progress * Math.PI * 4);
      const y = centerY + amplitude * Math.sin(x * 0.02 + time * 4);
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();

    // Progress indicator
    const progressX = (time * 50) % width;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(progressX, 0);
    ctx.lineTo(progressX, height);
    ctx.stroke();
  };

  const drawStaticWaveform = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerY = height / 2;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = 0; x < width; x++) {
      const amplitude = 25 * Math.sin(x * 0.02) * Math.cos(x * 0.01);
      const y = centerY + amplitude;
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
  };

  const drawIdleState = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerY = height / 2;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Idle dots
    ctx.fillStyle = '#475569';
    for (let i = 0; i < 10; i++) {
      const x = (width / 10) * i;
      ctx.beginPath();
      ctx.arc(x, centerY, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  return (
    <div className="w-full h-32 bg-slate-900/50 rounded-lg overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default WaveformVisualizer;
