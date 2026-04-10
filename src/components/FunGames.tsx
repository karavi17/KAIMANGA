import React, { useEffect, useMemo, useRef, useState } from 'react';

type FunGamesProps = {
  onRetry?: () => void;
};

function useRafLoop(cb: (dt: number) => void, running: boolean) {
  const last = useRef(0);
  useEffect(() => {
    let id = 0;
    const loop = (t: number) => {
      const dt = (t - last.current) / 1000;
      last.current = t;
      if (running) cb(Math.min(dt, 0.05));
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [cb, running]);
}

function ButtonBar({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-center gap-3 mt-4">
      <button onClick={onRetry} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold">
        Retry
      </button>
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-xl bg-gray-900/80 border border-gray-700 rounded-2xl p-4 mx-auto">
      <div className="aspect-[16/9] bg-gray-950 rounded-xl flex items-center justify-center overflow-hidden">{children}</div>
    </div>
  );
}

function JumpRunner({ speed = 220 }: { speed?: number }) {
  const [x, setX] = useState(600);
  const [y, setY] = useState(0);
  const [vy, setVy] = useState(0);
  const [alive, setAlive] = useState(true);
  const gravity = 900;
  const ground = 120;
  const jump = () => alive && y === 0 && setVy(-420);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') jump(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [alive, y]);
  useRafLoop((dt) => {
    if (!alive) return;
    setX((v) => (v - speed * dt + 640) % 640);
    setVy((v) => v + gravity * dt);
    setY((v) => {
      let ny = v + vy * dt;
      if (ny > 0) { ny = 0; setVy(0); }
      return ny;
    });
    const obsX = x;
    const playerX = 80, playerY = ground + y;
    if (Math.abs(obsX - playerX) < 16 && playerY > ground - 28) setAlive(false);
  }, true);
  return (
    <Frame>
      <div onClick={jump} className="relative w-full h-full">
        <div className="absolute left-0 right-0 bottom-[120px] h-[2px] bg-gray-700" />
        <div className="absolute left-[72px] bottom-[120px]" style={{ transform: `translateY(${y}px)` }}>
          <div className="w-8 h-8 bg-orange-500 rounded-md" />
        </div>
        <div className="absolute bottom-[120px] w-[24px] h-[24px] bg-gray-300 left-0" style={{ transform: `translateX(${x}px)` }} />
        {!alive && <div className="absolute inset-0 flex items-center justify-center text-red-400 font-bold">Game Over</div>}
      </div>
    </Frame>
  );
}

function Flappy({ gap = 120 }: { gap?: number }) {
  const [y, setY] = useState(160);
  const [vy, setVy] = useState(0);
  const [x, setX] = useState(640);
  const [hole, setHole] = useState(160);
  const [alive, setAlive] = useState(true);
  const gravity = 560;
  const flap = () => alive && setVy(-220);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') flap(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [alive]);
  useRafLoop((dt) => {
    if (!alive) return;
    setVy((v) => v + gravity * dt);
    setY((v) => Math.max(0, Math.min(320, v + vy * dt)));
    setX((v) => {
      const nx = v - 180 * dt;
      if (nx < -40) {
        setHole(40 + Math.random() * 240);
        return 640;
      }
      return nx;
    });
    const px = 100, py = y;
    const collX = x < px + 16 && x + 40 > px;
    const collY = py < hole - gap / 2 || py + 16 > hole + gap / 2;
    if (collX && collY) setAlive(false);
  }, true);
  return (
    <Frame>
      <div onClick={flap} className="relative w-full h-full">
        <div className="absolute left-[96px] top-0 w-4 h-4 bg-orange-500 rounded-sm" style={{ transform: `translateY(${y}px)` }} />
        <div className="absolute top-0" style={{ transform: `translateX(${x}px)` }}>
          <div className="w-10 bg-gray-400 h-[160px]" style={{ height: `${hole - gap / 2}px` }} />
          <div className="w-10 bg-gray-400 absolute top-0 h-[160px]" style={{ top: `${hole + gap / 2}px`, height: `${320 - (hole + gap / 2)}px` }} />
        </div>
        {!alive && <div className="absolute inset-0 flex items-center justify-center text-red-400 font-bold">Game Over</div>}
      </div>
    </Frame>
  );
}

function SnakeGame({ size = 15 }: { size?: number }) {
  const [dir, setDir] = useState<[number, number]>([1, 0]);
  const [snake, setSnake] = useState<[number, number][]>([[7, 7]]);
  const [food, setFood] = useState<[number, number]>([10, 7]);
  const [alive, setAlive] = useState(true);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && dir[1] !== 1) setDir([0, -1]);
      if (e.key === 'ArrowDown' && dir[1] !== -1) setDir([0, 1]);
      if (e.key === 'ArrowLeft' && dir[0] !== 1) setDir([-1, 0]);
      if (e.key === 'ArrowRight' && dir[0] !== -1) setDir([1, 0]);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [dir]);
  useEffect(() => {
    if (!alive) return;
    const id = setInterval(() => {
      setSnake((s) => {
        const head = [s[0][0] + dir[0], s[0][1] + dir[1]] as [number, number];
        if (head[0] < 0 || head[1] < 0 || head[0] >= size || head[1] >= size || s.some(([x, y]) => x === head[0] && y === head[1])) {
          setAlive(false);
          return s;
        }
        const nf = head[0] === food[0] && head[1] === food[1];
        const ns = [head, ...s.slice(0, nf ? s.length : s.length - 1)];
        if (nf) {
          let fx = 0, fy = 0;
          do {
            fx = Math.floor(Math.random() * size);
            fy = Math.floor(Math.random() * size);
          } while (ns.some(([x, y]) => x === fx && y === fy));
          setFood([fx, fy]);
        }
        return ns;
      });
    }, 120);
    return () => clearInterval(id);
  }, [dir, food, size, alive]);
  return (
    <Frame>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, width: 320, height: 320 }}>
        {[...Array(size * size)].map((_, i) => {
          const x = i % size, y = Math.floor(i / size);
          const isSnake = snake.some(([sx, sy]) => sx === x && sy === y);
          const isFood = food[0] === x && food[1] === y;
          return <div key={i} className={`border border-gray-800 ${isSnake ? 'bg-orange-500' : isFood ? 'bg-green-500' : 'bg-gray-900'}`} />;
        })}
      </div>
      {!alive && <div className="absolute inset-0 flex items-center justify-center text-red-400 font-bold">Game Over</div>}
    </Frame>
  );
}

function Reaction() {
  const [phase, setPhase] = useState<'wait' | 'ready' | 'go'>('wait');
  const [score, setScore] = useState<number | null>(null);
  useEffect(() => {
    if (phase === 'ready') {
      const t = setTimeout(() => setPhase('go'), 600 + Math.random() * 1400);
      return () => clearTimeout(t);
    }
  }, [phase]);
  const onClick = () => {
    if (phase === 'wait') {
      setScore(null);
      setPhase('ready');
    } else if (phase === 'ready') {
      setScore(9999);
      setPhase('wait');
    } else {
      const now = performance.now();
      setScore(now % 1000);
      setPhase('wait');
    }
  };
  return (
    <Frame>
      <button onClick={onClick} className={`w-full h-full ${phase === 'go' ? 'bg-green-600' : phase === 'ready' ? 'bg-yellow-600' : 'bg-gray-800'} text-white font-bold`}>
        {phase === 'wait' ? 'Click to Start' : phase === 'ready' ? 'Wait…' : 'Click!'}
      </button>
      {score !== null && <div className="absolute bottom-4 left-0 right-0 text-center text-white font-bold">Score {Math.round(score)} ms</div>}
    </Frame>
  );
}

function AimTrainer({ rounds = 8 }: { rounds?: number }) {
  const [target, setTarget] = useState<[number, number]>([50, 50]);
  const [n, setN] = useState(0);
  const hit = () => {
    if (n + 1 >= rounds) setN(rounds);
    else {
      setN(n + 1);
      setTarget([10 + Math.random() * 80, 10 + Math.random() * 70]);
    }
  };
  return (
    <Frame>
      <div className="relative w-full h-full bg-gray-900">
        {n < rounds ? (
          <button onClick={hit} className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-orange-500 rounded-full" style={{ left: `${target[0]}%`, top: `${target[1]}%` }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-bold">Done</div>
        )}
      </div>
    </Frame>
  );
}

function Whack({ cells = 9 }: { cells?: number }) {
  const [idx, setIdx] = useState<number>(-1);
  const [score, setScore] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(Math.floor(Math.random() * cells)), 800);
    return () => clearInterval(t);
  }, [cells]);
  return (
    <Frame>
      <div className="grid grid-cols-3 gap-2 w-64">
        {[...Array(cells)].map((_, i) => (
          <button key={i} onClick={() => i === idx && setScore((s) => s + 1)} className="h-16 bg-gray-800 rounded-lg flex items-center justify-center">
            {i === idx && <div className="w-8 h-8 bg-orange-500 rounded-full" />}
          </button>
        ))}
      </div>
      <div className="text-white mt-2 font-bold">Score {score}</div>
    </Frame>
  );
}

function TicTac() {
  const [b, setB] = useState<string[]>(Array(9).fill(''));
  const [p, setP] = useState<'X' | 'O'>('X');
  const win = useMemo(() => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a, c, d] of lines) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    return '';
  }, [b]);
  useEffect(() => {
    if (p === 'O' && !win) {
      const empty = b.map((v, i) => v ? -1 : i).filter(i => i !== -1);
      if (empty.length > 0) {
        const i = empty[Math.floor(Math.random() * empty.length)];
        const nb = b.slice(); nb[i] = 'O'; setB(nb); setP('X');
      }
    }
  }, [p, b, win]);
  const play = (i: number) => {
    if (b[i] || win || p !== 'X') return;
    const nb = b.slice(); nb[i] = 'X'; setB(nb); setP('O');
  };
  return (
    <Frame>
      <div className="grid grid-cols-3 gap-2 w-48">
        {b.map((v, i) => (
          <button key={i} onClick={() => play(i)} className="h-16 bg-gray-800 text-white text-2xl font-bold rounded-lg">{v}</button>
        ))}
      </div>
      <div className="text-white mt-2 font-bold">{win ? `Win ${win}` : b.every(Boolean) ? 'Draw' : 'Play'}</div>
    </Frame>
  );
}

function Dodge({ speed = 200 }: { speed?: number }) {
  const [px, setPx] = useState(140);
  const [py] = useState(260);
  const [obs, setObs] = useState<{ x: number; y: number }[]>([]);
  const [alive, setAlive] = useState(true);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setPx((v) => Math.max(0, v - 20));
      if (e.key === 'ArrowRight') setPx((v) => Math.min(280, v + 20));
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  useRafLoop((dt) => {
    if (!alive) return;
    setObs((o) => {
      const no = o.map((e) => ({ x: e.x, y: e.y + speed * dt })).filter((e) => e.y < 300);
      if (Math.random() < 0.02) no.push({ x: Math.random() * 300, y: -20 });
      for (const e of no) if (Math.abs(e.x - px) < 16 && Math.abs(e.y - py) < 16) { setAlive(false); break; }
      return no;
    });
  }, true);
  return (
    <Frame>
      <div className="relative w-[320px] h-[300px] bg-gray-900">
        <div className="absolute w-4 h-4 bg-orange-500 rounded left-0 top-0" style={{ transform: `translate(${px}px, ${py}px)` }} />
        {obs.map((e, i) => <div key={i} className="absolute w-4 h-4 bg-gray-400 left-0 top-0" style={{ transform: `translate(${e.x}px, ${e.y}px)` }} />)}
        {!alive && <div className="absolute inset-0 flex items-center justify-center text-red-400 font-bold">Game Over</div>}
      </div>
    </Frame>
  );
}

function Catcher() {
  const [x, setX] = useState(140);
  const [drop, setDrop] = useState<{ x: number; y: number } | null>({ x: 160, y: -10 });
  const [score, setScore] = useState(0);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      const el = e.currentTarget as HTMLElement;
      const r = el.getBoundingClientRect();
      setX(Math.max(0, Math.min(280, e.clientX - r.left - 20)));
    };
    const el = document.getElementById('catcher-area');
    if (el) el.addEventListener('mousemove', h as any);
    return () => { if (el) el.removeEventListener('mousemove', h as any); };
  }, []);
  useRafLoop((dt) => {
    setDrop((d) => {
      if (!d) return { x: Math.random() * 300, y: -10 };
      const ny = d.y + 180 * dt;
      if (ny > 280) {
        if (Math.abs(d.x - x) < 20) setScore((s) => s + 1);
        return { x: Math.random() * 300, y: -10 };
      }
      return { x: d.x, y: ny };
    });
  }, true);
  return (
    <Frame>
      <div id="catcher-area" className="relative w-[320px] h-[300px] bg-gray-900">
        <div className="absolute w-8 h-2 bg-orange-500 left-0 bottom-2" style={{ transform: `translateX(${x}px)` }} />
        {drop && <div className="absolute w-4 h-4 bg-green-500 left-0 top-0" style={{ transform: `translate(${drop.x}px, ${drop.y}px)` }} />}
        <div className="absolute top-2 left-2 text-white text-sm font-bold">Score {score}</div>
      </div>
    </Frame>
  );
}

const games: { name: string; node: React.ReactNode }[] = [
  { name: 'JumpRunner', node: <JumpRunner speed={220} /> },
  { name: 'JumpRunner+', node: <JumpRunner speed={260} /> },
  { name: 'Flappy', node: <Flappy gap={120} /> },
  { name: 'Flappy+', node: <Flappy gap={100} /> },
  { name: 'Snake', node: <SnakeGame size={15} /> },
  { name: 'Snake+', node: <SnakeGame size={18} /> },
  { name: 'Reaction', node: <Reaction /> },
  { name: 'Aim', node: <AimTrainer rounds={8} /> },
  { name: 'Aim+', node: <AimTrainer rounds={12} /> },
  { name: 'Whack', node: <Whack cells={9} /> },
  { name: 'Whack+', node: <Whack cells={12} /> },
  { name: 'TicTac', node: <TicTac /> },
  { name: 'Dodge', node: <Dodge speed={220} /> },
  { name: 'Dodge+', node: <Dodge speed={280} /> },
  { name: 'Catcher', node: <Catcher /> },
  { name: 'Catcher+', node: <Catcher /> },
  { name: 'Runner x', node: <JumpRunner speed={300} /> },
  { name: 'Flappy x', node: <Flappy gap={90} /> },
  { name: 'Aim x', node: <AimTrainer rounds={16} /> },
  { name: 'Snake x', node: <SnakeGame size={12} /> }
];

export function FunGames({ onRetry }: FunGamesProps) {
  const [i] = useState(() => Math.floor(Math.random() * games.length));
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-white">
      <div className="text-lg font-bold text-orange-400">Server error 500. Take a break.</div>
      {games[i].node}
      <ButtonBar onRetry={onRetry} />
      <div className="text-xs text-gray-400">Random game: {games[i].name}</div>
    </div>
  );
}
