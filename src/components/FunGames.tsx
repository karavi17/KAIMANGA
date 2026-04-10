import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

function ButtonBar({ onRetry, onExit }: { onRetry?: () => void, onExit?: () => void }) {
  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <button 
        onClick={onRetry} 
        className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-900/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
        Retry Request
      </button>
      {onExit && (
        <button 
          onClick={onExit} 
          className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold border border-gray-700 transition-all transform hover:scale-105 active:scale-95"
        >
          Go Back
        </button>
      )}
    </div>
  );
}

function Frame({ children, title, score }: { children: React.ReactNode; title: string; score?: number }) {
  return (
    <div className="w-full max-w-2xl bg-gray-900/90 border border-gray-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 animate-pulse" />
      
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-orange-400 font-black tracking-widest uppercase text-sm">{title}</h3>
        {score !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs font-bold uppercase">Score</span>
            <span className="text-white font-black text-xl tabular-nums">{score}</span>
          </div>
        )}
      </div>

      <div className="aspect-[16/9] bg-black rounded-2xl flex items-center justify-center overflow-hidden border border-gray-800 shadow-inner relative group">
        {children}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-tighter">Use Space or Arrow Keys to Play</p>
      </div>
    </div>
  );
}

function JumpRunner({ speed = 220 }: { speed?: number }) {
  const [x, setX] = useState(600);
  const [y, setY] = useState(0);
  const [vy, setVy] = useState(0);
  const [alive, setAlive] = useState(true);
  const [score, setScore] = useState(0);
  const gravity = 1200;
  const ground = 140;
  
  const jump = () => alive && y === 0 && setVy(-500);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') jump(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [alive, y]);

  useRafLoop((dt) => {
    if (!alive) return;
    setX((v) => {
      let nx = v - speed * dt;
      if (nx < -40) {
        setScore(s => s + 1);
        return 640;
      }
      return nx;
    });
    setVy((v) => v + gravity * dt);
    setY((v) => {
      let ny = v + vy * dt;
      if (ny > 0) { ny = 0; setVy(0); }
      return ny;
    });
    const obsX = x;
    const playerY = ground + y;
    if (Math.abs(obsX - 80) < 30 && playerY > ground - 40) setAlive(false);
  }, true);

  return (
    <Frame title="Neon Runner" score={score}>
      <div onClick={jump} className="relative w-full h-full bg-gradient-to-b from-black to-gray-900 cursor-pointer">
        <div className="absolute left-0 right-0 bottom-[140px] h-[4px] bg-indigo-900/50 shadow-[0_0_20px_rgba(79,70,229,0.3)]" />
        
        <div className="absolute left-[72px] bottom-[140px] transition-transform" style={{ transform: `translateY(${y}px)` }}>
          <div className="w-10 h-10 bg-orange-500 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.5)] border-2 border-orange-400 flex items-center justify-center text-xl">
            {alive ? '🐱' : '💥'}
          </div>
        </div>

        <div className="absolute bottom-[140px] w-8 h-12 bg-red-600 rounded-t-lg shadow-[0_0_15px_rgba(220,38,38,0.5)] border-2 border-red-500 flex items-center justify-center" style={{ transform: `translateX(${x}px)` }}>
          🔥
        </div>

        {!alive && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500">
            <h4 className="text-4xl font-black text-red-500 mb-4 tracking-tighter uppercase italic">Wasted</h4>
            <button onClick={() => { setAlive(true); setX(600); setY(0); setScore(0); }} className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition">Respawn</button>
          </div>
        )}
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
  const [score, setScore] = useState(0);
  const gravity = 800;
  
  const flap = () => alive && setVy(-280);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') flap(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [alive]);

  useRafLoop((dt) => {
    if (!alive) return;
    setVy((v) => v + gravity * dt);
    setY((v) => {
      let ny = v + vy * dt;
      if (ny < 0 || ny > 320) setAlive(false);
      return ny;
    });
    setX((v) => {
      const nx = v - 220 * dt;
      if (nx < -60) {
        setHole(60 + Math.random() * 200);
        setScore(s => s + 1);
        return 640;
      }
      return nx;
    });
    const px = 100, py = y;
    const collX = x < px + 30 && x + 60 > px;
    const collY = py < hole - gap / 2 || py + 20 > hole + gap / 2;
    if (collX && collY) setAlive(false);
  }, true);

  return (
    <Frame title="Sky Bird" score={score}>
      <div onClick={flap} className="relative w-full h-full bg-gradient-to-b from-sky-900 to-indigo-950 cursor-pointer overflow-hidden">
        <div className="absolute left-[96px] top-0 transition-transform" style={{ transform: `translateY(${y}px)` }}>
          <div className="w-10 h-10 bg-yellow-400 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.5)] border-2 border-yellow-300 flex items-center justify-center text-xl">
            {alive ? '🐤' : '💀'}
          </div>
        </div>

        <div className="absolute top-0 w-16 h-full flex flex-col justify-between" style={{ transform: `translateX(${x}px)` }}>
          <div className="w-full bg-emerald-600 rounded-b-2xl border-x-4 border-b-4 border-emerald-500 shadow-lg" style={{ height: `${hole - gap / 2}px` }} />
          <div className="w-full bg-emerald-600 rounded-t-2xl border-x-4 border-t-4 border-emerald-500 shadow-lg" style={{ height: `${320 - (hole + gap / 2)}px` }} />
        </div>

        {!alive && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
            <h4 className="text-4xl font-black text-red-500 mb-4 tracking-tighter uppercase italic">Crashed</h4>
            <button onClick={() => { setAlive(true); setY(160); setVy(0); setX(640); setScore(0); }} className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition">Retry</button>
          </div>
        )}
      </div>
    </Frame>
  );
}

function SnakeGame({ size = 15 }: { size?: number }) {
  const [dir, setDir] = useState<[number, number]>([1, 0]);
  const [snake, setSnake] = useState<[number, number][]>([[7, 7], [6, 7], [5, 7]]);
  const [food, setFood] = useState<[number, number]>([10, 7]);
  const [alive, setAlive] = useState(true);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.key === 'ArrowUp' || e.key === 'w') && dir[1] !== 1) setDir([0, -1]);
      if ((e.key === 'ArrowDown' || e.key === 's') && dir[1] !== -1) setDir([0, 1]);
      if ((e.key === 'ArrowLeft' || e.key === 'a') && dir[0] !== 1) setDir([-1, 0]);
      if ((e.key === 'ArrowRight' || e.key === 'd') && dir[0] !== -1) setDir([1, 0]);
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
          setScore(sc => sc + 10);
          let fx = 0, fy = 0;
          do {
            fx = Math.floor(Math.random() * size);
            fy = Math.floor(Math.random() * size);
          } while (ns.some(([x, y]) => x === fx && y === fy));
          setFood([fx, fy]);
        }
        return ns;
      });
    }, 100);
    return () => clearInterval(id);
  }, [dir, food, size, alive]);

  return (
    <Frame title="Neon Snake" score={score}>
      <div className="relative w-full h-full flex items-center justify-center bg-gray-950">
        <div className="grid gap-px bg-gray-800 border-2 border-gray-800 rounded-sm overflow-hidden" style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, width: 280, height: 280 }}>
          {[...Array(size * size)].map((_, i) => {
            const x = i % size, y = Math.floor(i / size);
            const isHead = snake[0][0] === x && snake[0][1] === y;
            const isSnake = snake.some(([sx, sy]) => sx === x && sy === y);
            const isFood = food[0] === x && food[1] === y;
            return (
              <div 
                key={i} 
                className={`relative transition-all duration-200 ${
                  isHead ? 'bg-orange-500 z-10 scale-110 shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 
                  isSnake ? 'bg-orange-600/80' : 
                  isFood ? 'bg-green-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 
                  'bg-black'
                }`}
              >
                {isFood && <span className="absolute inset-0 flex items-center justify-center text-[8px]">🍎</span>}
              </div>
            );
          })}
        </div>
        {!alive && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
            <h4 className="text-4xl font-black text-red-500 mb-4 tracking-tighter uppercase italic">Game Over</h4>
            <button onClick={() => { setAlive(true); setSnake([[7, 7], [6, 7], [5, 7]]); setScore(0); }} className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition">Respawn</button>
          </div>
        )}
      </div>
    </Frame>
  );
}

function Reaction() {
  const [phase, setPhase] = useState<'wait' | 'ready' | 'go'>('wait');
  const [score, setScore] = useState<number | null>(null);
  const startTime = useRef(0);

  useEffect(() => {
    if (phase === 'ready') {
      const t = setTimeout(() => {
        setPhase('go');
        startTime.current = performance.now();
      }, 1000 + Math.random() * 3000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const onClick = () => {
    if (phase === 'wait') {
      setScore(null);
      setPhase('ready');
    } else if (phase === 'ready') {
      setScore(null);
      setPhase('wait');
      alert('Too early! Wait for green.');
    } else {
      const diff = performance.now() - startTime.current;
      setScore(Math.round(diff));
      setPhase('wait');
    }
  };

  return (
    <Frame title="Reflex Test" score={score || 0}>
      <button 
        onClick={onClick} 
        className={`w-full h-full transition-colors duration-150 flex flex-col items-center justify-center gap-4 ${
          phase === 'go' ? 'bg-emerald-500 shadow-[inset_0_0_100px_rgba(0,0,0,0.2)]' : 
          phase === 'ready' ? 'bg-rose-500 shadow-[inset_0_0_100px_rgba(0,0,0,0.2)]' : 
          'bg-indigo-600'
        }`}
      >
        <div className="text-6xl mb-2">
          {phase === 'go' ? '⚡' : phase === 'ready' ? '🛑' : '🎯'}
        </div>
        <span className="text-3xl font-black uppercase tracking-tighter text-white drop-shadow-lg">
          {phase === 'wait' ? 'Click to Start' : phase === 'ready' ? 'Wait for Green...' : 'CLICK NOW!'}
        </span>
        {score !== null && (
          <div className="mt-4 px-6 py-2 bg-black/30 rounded-full backdrop-blur-md">
            <span className="text-white font-bold">{score}ms</span>
          </div>
        )}
      </button>
    </Frame>
  );
}

function AimTrainer({ rounds = 10 }: { rounds?: number }) {
  const [target, setTarget] = useState<[number, number]>([50, 50]);
  const [n, setN] = useState(0);
  const [score, setScore] = useState(0);
  const startTime = useRef(performance.now());

  const hit = () => {
    const now = performance.now();
    const diff = now - startTime.current;
    const points = Math.max(10, Math.round(1000 - diff / 2));
    setScore(s => s + points);
    startTime.current = now;

    if (n + 1 >= rounds) setN(rounds);
    else {
      setN(n + 1);
      setTarget([15 + Math.random() * 70, 15 + Math.random() * 70]);
    }
  };

  return (
    <Frame title="Aim Master" score={score}>
      <div className="relative w-full h-full bg-slate-950 cursor-crosshair">
        {n < rounds ? (
          <button 
            onClick={hit} 
            className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center group active:scale-90 transition-transform" 
            style={{ left: `${target[0]}%`, top: `${target[1]}%` }}
          >
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
            <div className="w-10 h-10 bg-red-600 rounded-full border-4 border-white shadow-[0_0_15px_rgba(220,38,38,0.6)] flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full" />
            </div>
          </button>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
            <h4 className="text-4xl font-black text-green-500 mb-4 tracking-tighter uppercase italic">Finished</h4>
            <div className="text-white text-xl font-bold mb-6">Final Score: {score}</div>
            <button onClick={() => { setN(0); setScore(0); setTarget([50, 50]); startTime.current = performance.now(); }} className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition">Play Again</button>
          </div>
        )}
      </div>
    </Frame>
  );
}

function Whack({ cells = 9 }: { cells?: number }) {
  const [idx, setIdx] = useState<number>(-1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setIdx(Math.floor(Math.random() * cells)), 700);
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => { clearInterval(t); clearInterval(timer); };
  }, [cells, timeLeft]);

  return (
    <Frame title="Whack-A-Mole" score={score}>
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-amber-900/20">
        <div className="grid grid-cols-3 gap-4 p-4 bg-amber-950/40 rounded-3xl border border-amber-900/50 shadow-2xl">
          {[...Array(cells)].map((_, i) => (
            <button 
              key={i} 
              onClick={() => {
                if (i === idx && timeLeft > 0) {
                  setScore((s) => s + 100);
                  setIdx(-1);
                }
              }} 
              className="w-16 h-16 bg-amber-900/60 rounded-full border-b-8 border-amber-950 shadow-inner flex items-center justify-center relative overflow-hidden active:border-b-0 active:translate-y-1 transition-all"
            >
              <div className={`absolute transition-all duration-200 text-3xl ${i === idx ? 'top-2' : 'top-20'}`}>
                🐹
              </div>
            </button>
          ))}
        </div>
        <div className="absolute top-4 right-4 bg-black/40 px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
          Time: {timeLeft}s
        </div>
        {timeLeft <= 0 && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
            <h4 className="text-4xl font-black text-orange-500 mb-4 tracking-tighter uppercase italic">Time's Up</h4>
            <div className="text-white text-xl font-bold mb-6">Final Score: {score}</div>
            <button onClick={() => { setTimeLeft(30); setScore(0); }} className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition">Play Again</button>
          </div>
        )}
      </div>
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
    if (p === 'O' && !win && b.some(v => !v)) {
      const t = setTimeout(() => {
        const empty = b.map((v, i) => v ? -1 : i).filter(i => i !== -1);
        const i = empty[Math.floor(Math.random() * empty.length)];
        const nb = b.slice(); nb[i] = 'O'; setB(nb); setP('X');
      }, 500);
      return () => clearTimeout(t);
    }
  }, [p, b, win]);

  const play = (i: number) => {
    if (b[i] || win || p !== 'X') return;
    const nb = b.slice(); nb[i] = 'X'; setB(nb); setP('O');
  };

  return (
    <Frame title="Tic-Tac-Toe">
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-950">
        <div className="grid grid-cols-3 gap-3 p-4 bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl">
          {b.map((v, i) => (
            <button 
              key={i} 
              onClick={() => play(i)} 
              className={`w-16 h-16 rounded-xl flex items-center justify-center text-4xl font-black transition-all transform active:scale-90 ${
                v === 'X' ? 'bg-indigo-600 text-white' : 
                v === 'O' ? 'bg-orange-600 text-white' : 
                'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <div className={`mt-6 px-6 py-2 rounded-full font-black uppercase tracking-widest text-sm ${win ? 'bg-green-600' : 'bg-gray-800'}`}>
          {win ? `${win} Wins!` : b.every(Boolean) ? 'Draw' : p === 'X' ? 'Your Turn' : 'Thinking...'}
        </div>
        {(win || b.every(Boolean)) && (
          <button 
            onClick={() => { setB(Array(9).fill('')); setP('X'); }} 
            className="mt-4 text-orange-400 font-bold hover:underline"
          >
            Play Again
          </button>
        )}
      </div>
    </Frame>
  );
}

function Dodge({ speed = 200 }: { speed?: number }) {
  const [px, setPx] = useState(140);
  const [obs, setObs] = useState<{ x: number; y: number; char: string }[]>([]);
  const [alive, setAlive] = useState(true);
  const [score, setScore] = useState(0);
  const chars = ['☄️', '🌑', '👾', '🚀'];

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') setPx((v) => Math.max(0, v - 30));
      if (e.key === 'ArrowRight' || e.key === 'd') setPx((v) => Math.min(280, v + 30));
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useRafLoop((dt) => {
    if (!alive) return;
    setObs((o) => {
      const no = o.map((e) => ({ ...e, y: e.y + speed * dt })).filter((e) => e.y < 320);
      if (Math.random() < 0.05) no.push({ x: Math.random() * 280, y: -20, char: chars[Math.floor(Math.random() * chars.length)] });
      for (const e of no) {
        if (Math.abs(e.x - px) < 25 && Math.abs(e.y - 260) < 25) {
          setAlive(false);
          break;
        }
      }
      return no;
    });
    setScore(s => s + 1);
  }, true);

  return (
    <Frame title="Star Dodge" score={Math.floor(score/10)}>
      <div className="relative w-full h-full bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
        <div 
          className="absolute w-12 h-12 flex items-center justify-center text-3xl transition-all duration-100" 
          style={{ transform: `translate(${px}px, 260px)` }}
        >
          🛸
        </div>
        {obs.map((e, i) => (
          <div 
            key={i} 
            className="absolute w-8 h-8 flex items-center justify-center text-2xl" 
            style={{ transform: `translate(${e.x}px, ${e.y}px)` }}
          >
            {e.char}
          </div>
        ))}
        {!alive && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
            <h4 className="text-4xl font-black text-red-500 mb-4 tracking-tighter uppercase italic">Destroyed</h4>
            <div className="text-white text-xl font-bold mb-6">Score: {Math.floor(score/10)}</div>
            <button onClick={() => { setAlive(true); setObs([]); setScore(0); }} className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition">Re-entry</button>
          </div>
        )}
      </div>
    </Frame>
  );
}

function Catcher() {
  const [x, setX] = useState(140);
  const [drop, setDrop] = useState<{ x: number; y: number; char: string } | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const items = ['💎', '💰', '🌟', '🍕'];

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const el = document.getElementById('catcher-area');
      if (!el) return;
      const r = el.getBoundingClientRect();
      setX(Math.max(0, Math.min(280, e.clientX - r.left - 20)));
    };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  useRafLoop((dt) => {
    if (missed >= 3) return;
    setDrop((d) => {
      if (!d) return { x: Math.random() * 280, y: -20, char: items[Math.floor(Math.random() * items.length)] };
      const ny = d.y + 200 * dt;
      if (ny > 280) {
        if (Math.abs(d.x - x) < 30) {
          setScore((s) => s + 500);
        } else {
          setMissed(m => m + 1);
        }
        return { x: Math.random() * 280, y: -20, char: items[Math.floor(Math.random() * items.length)] };
      }
      return { ...d, y: ny };
    });
  }, true);

  return (
    <Frame title="Loot Collector" score={score}>
      <div id="catcher-area" className="relative w-full h-full bg-gradient-to-b from-indigo-900/40 to-black overflow-hidden">
        <div className="absolute bottom-4 left-4 flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i < (3 - missed) ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-gray-800'}`} />
          ))}
        </div>
        <div 
          className="absolute w-16 h-10 flex items-center justify-center text-4xl" 
          style={{ transform: `translateX(${x}px)`, bottom: '8px' }}
        >
          🛒
        </div>
        {drop && (
          <div 
            className="absolute w-10 h-10 flex items-center justify-center text-2xl transition-all" 
            style={{ transform: `translate(${drop.x}px, ${drop.y}px)` }}
          >
            {drop.char}
          </div>
        )}
        {missed >= 3 && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
            <h4 className="text-4xl font-black text-orange-500 mb-4 tracking-tighter uppercase italic">Inventory Full</h4>
            <div className="text-white text-xl font-bold mb-6">Total Loot: {score}</div>
            <button onClick={() => { setMissed(0); setScore(0); setDrop(null); }} className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition">Restart</button>
          </div>
        )}
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
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-500 overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center gap-8 py-10">
        <div className="text-center space-y-2 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Connection Error 500
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter leading-none italic uppercase">
            Server's <span className="text-orange-500 underline decoration-indigo-500 underline-offset-8">Down</span>
          </h2>
          <p className="text-gray-400 font-medium text-sm leading-relaxed px-4">
            Our servers are taking a nap. While we wake them up, why don't you try to beat this random mini-game?
          </p>
        </div>

        {games[i].node}

        <div className="flex flex-col items-center gap-4">
          <ButtonBar onRetry={onRetry} onExit={() => navigate(-1)} />
          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-md">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Game</span>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <span className="text-xs font-black text-orange-400 uppercase italic">{games[i].name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
