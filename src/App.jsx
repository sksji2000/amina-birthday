import { useEffect, useRef, useState } from "react";
import { config } from "./config.js";
import { particles, burst, rain, startMusic, stopMusic, isPlaying } from "./fx.js";

/* ---------- Background stars & hearts ---------- */
function Sky() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, x = c.getContext("2d"), dpr = devicePixelRatio || 1;
    let W, H, raf;
    const size = () => { W = c.width = innerWidth * dpr; H = c.height = innerHeight * dpr; };
    size(); addEventListener("resize", size);
    const items = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 2 + 0.5, s: Math.random() * 0.0004 + 0.0001, t: Math.random() * 6, h: Math.random() < 0.18 }));
    const loop = (t) => {
      x.clearRect(0, 0, W, H);
      items.forEach((o) => {
        o.y -= o.s; if (o.y < -0.05) o.y = 1.05;
        x.globalAlpha = (0.5 + 0.5 * Math.sin(t / 700 + o.t)) * 0.8;
        x.fillStyle = o.h ? "#ff7eb6" : "#fff";
        if (o.h) { x.font = o.r * 10 * dpr + "px serif"; x.fillText("♥", o.x * W, o.y * H); }
        else { x.beginPath(); x.arc(o.x * W, o.y * H, o.r * dpr, 0, 7); x.fill(); }
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); };
  }, []);
  return <canvas id="bg" ref={ref} />;
}

/* ---------- Confetti layer ---------- */
function Confetti() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, x = c.getContext("2d"); let raf;
    const size = () => { c.width = innerWidth; c.height = innerHeight; };
    size(); addEventListener("resize", size);
    const loop = () => {
      x.clearRect(0, 0, c.width, c.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.vx *= 0.99; p.r += p.vr; p.l -= 0.004;
        if (p.y > innerHeight + 20 || p.l <= 0) { particles.splice(i, 1); continue; }
        x.save(); x.globalAlpha = p.l; x.translate(p.x, p.y); x.rotate(p.r);
        x.fillStyle = p.c; x.fillRect(-p.w / 2, -p.w / 4, p.w, p.w / 2); x.restore();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); };
  }, []);
  return <canvas id="fx" ref={ref} />;
}

/* ---------- Stage 1: Gift ---------- */
function Gift({ onDone }) {
  const [open, setOpen] = useState(false);
  const tap = () => {
    if (open) return;
    startMusic(); setOpen(true); burst(120);
    setTimeout(onDone, 1400);
  };
  return (
    <>
      <h1> {config.name}… 💖</h1>
      <p>Someone has been planning something special just for you.</p>
      <div className={"gift" + (open ? " open" : "")} onClick={tap}>
        <div className="glid" /><div className="gbox" />
      </div>
      <div className="hint">Tap the gift to open it 🎁</div>
    </>
  );
}

/* ---------- Stage 2: Cake ---------- */
function Cake({ onDone }) {
  const total = config.candles || 5;
  const [out, setOut] = useState(Array(total).fill(false));
  const left = out.filter((o) => !o).length;
  const blow = (i) => {
    if (out[i]) return;
    const next = out.map((o, k) => (k === i ? true : o));
    setOut(next);
    if (next.every(Boolean)) { burst(220); setTimeout(onDone, 1800); }
  };
  return (
    <>
      <h1>Happy Birthday, {config.name}!</h1>
      <p>Make a wish… then tap each flame to blow out the candles 🕯️</p>
      <div className="cake">
        <div className="candles">
          {out.map((o, i) => (
            <div key={i} className={"candle" + (o ? " out" : "")} onClick={() => blow(i)}>
              <div className="flame" />
            </div>
          ))}
        </div>
        <div className="tier t1" /><div className="tier t2" /><div className="tier t3" /><div className="plate" />
      </div>
      <div className="hint">{left ? `${left} candle${left > 1 ? "s" : ""} left` : "Your wish is on its way ✨"}</div>
    </>
  );
}

/* ---------- Stage 3: Letter ---------- */
function Letter({ onAgain }) {
  const full = config.message.join("\n\n");
  const [n, setN] = useState(0);
  const done = n >= full.length;
  useEffect(() => {
    const r = setInterval(rain, 350);
    const stop = setTimeout(() => clearInterval(r), 9000);
    return () => { clearInterval(r); clearTimeout(stop); };
  }, []);
  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setN((v) => v + 1), 38);
    return () => clearTimeout(t);
  }, [n, done]);
  const paras = full.slice(0, n).split("\n\n");
  return (
    <>
      <h2>Dear {config.name},</h2>
      <div className="card letter">
        {paras.map((p, i) => <p key={i}>{p}</p>)}
        {done && <div className="sign">{config.from ? `With all my love, ${config.from}` : "With all my love 💌"}</div>}
      </div>
      {done && (
        <div className="reasons">
          {config.reasons.map((r, i) => (
            <div key={i} className="reason" style={{ animationDelay: i * 0.8 + "s" }}>{r}</div>
          ))}
        </div>
      )}
      <button className="btn" onClick={onAgain}>Celebrate again 🎉</button>
    </>
  );
}

/* ---------- App ---------- */
export default function App() {
  const [stage, setStage] = useState(0);
  const [music, setMusic] = useState(false);
  const [theme, setTheme] = useState(null);
  useEffect(() => { if (theme) document.documentElement.dataset.theme = theme; }, [theme]);
  const toggleTheme = () => {
    const dark = theme ? theme === "dark" : !matchMedia("(prefers-color-scheme: light)").matches;
    setTheme(dark ? "light" : "dark");
  };
  const toggleMusic = () => { isPlaying() ? stopMusic() : startMusic(); setMusic(isPlaying()); };
  useEffect(() => {
    const t = setInterval(() => setMusic(isPlaying()), 500);
    return () => clearInterval(t);
  }, []);
  return (
    <>
      <Sky /><Confetti />
      <div className="top">
        <button onClick={toggleMusic} style={{ opacity: music ? 1 : 0.5 }} title="Music">🎵</button>
        <button onClick={toggleTheme} title="Theme">🌗</button>
      </div>
      <section className="stage on" key={stage}>
        {stage === 0 && <Gift onDone={() => setStage(1)} />}
        {stage === 1 && <Cake onDone={() => setStage(2)} />}
        {stage === 2 && <Letter onAgain={() => setStage(0)} />}
      </section>
    </>
  );
}
