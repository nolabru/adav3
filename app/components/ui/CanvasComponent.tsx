import React, { useEffect, useRef } from 'react';
import { renderCanvas } from './CanvasRenderer';

export const CanvasComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Wait for the DOM to be fully loaded
      setTimeout(() => {
        renderCanvas();
      }, 100);
    }
  }, []);

  return (
    <canvas
      id="canvas"
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    />
  );
};

export default CanvasComponent;
