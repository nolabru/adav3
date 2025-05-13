interface OscillatorOptions {
  phase?: number;
  offset?: number;
  frequency?: number;
  amplitude?: number;
}

class Oscillator {
  phase: number;
  offset: number;
  frequency: number;
  amplitude: number;

  constructor(options: OscillatorOptions = {}) {
    this.phase = options.phase ?? 0;
    this.offset = options.offset ?? 0;
    this.frequency = options.frequency ?? 0.001;
    this.amplitude = options.amplitude ?? 1;
  }

  update(): number {
    this.phase += this.frequency;
    return this.offset + Math.sin(this.phase) * this.amplitude;
  }

  value(): number {
    return this.offset + Math.sin(this.phase) * this.amplitude;
  }
}

class Node {
  x: number;
  y: number;
  vx: number;
  vy: number;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
  }
}

interface LineOptions {
  spring: number;
}

class Line {
  spring: number;
  friction: number;
  nodes: Node[] = [];

  constructor(options: LineOptions) {
    this.spring = options.spring + 0.1 * Math.random() - 0.05;
    this.friction = E.friction + 0.01 * Math.random() - 0.005;

    for (let i = 0; i < E.size; i++) {
      const node = new Node();
      node.x = pos.x;
      node.y = pos.y;
      this.nodes.push(node);
    }
  }

  update() {
    let e = this.spring;
    let t = this.nodes[0];
    t.vx += (pos.x - t.x) * e;
    t.vy += (pos.y - t.y) * e;

    for (let i = 0; i < this.nodes.length; i++) {
      t = this.nodes[i];

      if (i > 0) {
        const n = this.nodes[i - 1];
        t.vx += (n.x - t.x) * e;
        t.vy += (n.y - t.y) * e;
        t.vx += n.vx * E.dampening;
        t.vy += n.vy * E.dampening;
      }

      t.vx *= this.friction;
      t.vy *= this.friction;
      t.x += t.vx;
      t.y += t.vy;

      e *= E.tension;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    let n = this.nodes[0].x;
    let i = this.nodes[0].y;

    ctx.beginPath();
    ctx.moveTo(n, i);

    for (let a = 1; a < this.nodes.length - 2; a++) {
      const e = this.nodes[a];
      const t = this.nodes[a + 1];
      n = 0.5 * (e.x + t.x);
      i = 0.5 * (e.y + t.y);
      ctx.quadraticCurveTo(e.x, e.y, n, i);
    }

    const e = this.nodes[this.nodes.length - 2];
    const t = this.nodes[this.nodes.length - 1];
    ctx.quadraticCurveTo(e.x, e.y, t.x, t.y);
    ctx.stroke();
    ctx.closePath();
  }
}

// --- Variáveis globais ---
let ctx: CanvasRenderingContext2D;
let f: Oscillator;
let lines: Line[] = [];

const pos = { x: 0, y: 0 };

const E = {
  debug: true,
  friction: 0.5,
  trails: 80,
  size: 50,
  dampening: 0.025,
  tension: 0.99,
};

// --- Eventos ---
function onMousemove(event: MouseEvent | TouchEvent) {
  function createLines() {
    lines = [];

    for (let i = 0; i < E.trails; i++) {
      lines.push(new Line({ spring: 0.45 + (i / E.trails) * 0.025 }));
    }
  }

  function handleMove(e: MouseEvent | TouchEvent) {
    if (e instanceof TouchEvent && e.touches.length) {
      pos.x = e.touches[0].pageX;
      pos.y = e.touches[0].pageY;
    } else if (e instanceof MouseEvent) {
      pos.x = e.clientX;
      pos.y = e.clientY;
    }

    e.preventDefault?.();
  }

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      pos.x = e.touches[0].pageX;
      pos.y = e.touches[0].pageY;
    }
  }

  document.removeEventListener('mousemove', onMousemove);
  document.removeEventListener('touchstart', onMousemove);
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('touchmove', handleMove);
  document.addEventListener('touchstart', handleTouchStart);

  handleMove(event);
  createLines();
  render();
}

// --- Renderização ---
function render() {
  if (!ctx) {
    return;
  }

  (ctx as any).running = true;

  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `hsla(${Math.round(f.update())},100%,50%,0.025)`;
  ctx.lineWidth = 10;

  for (const line of lines) {
    line.update();
    line.draw(ctx);
  }

  (ctx as any).frame++;
  requestAnimationFrame(render);
}

function resizeCanvas() {
  ctx.canvas.width = window.innerWidth - 20;
  ctx.canvas.height = window.innerHeight;
}

// --- Inicialização ---
export function renderCanvas() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;

  if (!canvas) {
    return;
  }

  ctx = canvas.getContext('2d')!;
  (ctx as any).running = true;
  (ctx as any).frame = 1;

  f = new Oscillator({
    phase: Math.random() * 2 * Math.PI,
    amplitude: 85,
    frequency: 0.0015,
    offset: 285,
  });

  document.addEventListener('mousemove', onMousemove);
  document.addEventListener('touchstart', onMousemove);
  document.body.addEventListener('orientationchange', resizeCanvas);
  window.addEventListener('resize', resizeCanvas);

  window.addEventListener('focus', () => {
    if (!(ctx as any).running) {
      (ctx as any).running = true;
      render();
    }
  });

  window.addEventListener('blur', () => {
    (ctx as any).running = false;
  });

  resizeCanvas();
}
