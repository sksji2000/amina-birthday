// Confetti particles + birthday tune (WebAudio, no files needed)
export const particles = [];
const colors = ["#ff7eb6", "#ffd87a", "#8fd3ff", "#b69cff", "#fff", "#7dffb2"];

export function burst(n = 160, x = innerWidth / 2, y = innerHeight / 2) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.28, v = Math.random() * 12 + 4;
    particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, c: colors[i % 6], w: Math.random() * 8 + 4, r: Math.random() * 6, vr: Math.random() * 0.4 - 0.2, l: 1 });
  }
}
export function rain() {
  for (let i = 0; i < 5; i++)
    particles.push({ x: Math.random() * innerWidth, y: -10, vx: Math.random() * 2 - 1, vy: Math.random() * 2 + 2, c: colors[i % 3], w: 8, r: 0, vr: 0.1, l: 1 });
}

const mel = [[392,.5],[392,.25],[440,1],[392,1],[523,1],[494,2],[392,.5],[392,.25],[440,1],[392,1],[587,1],[523,2],[392,.5],[392,.25],[784,1],[659,1],[523,1],[494,1],[440,1.5],[698,.5],[698,.25],[659,1],[523,1],[587,1],[523,2]];
let ac, playing = false, timer;
function playOnce() {
  ac = ac || new (window.AudioContext || window.webkitAudioContext)();
  let t = ac.currentTime + 0.1;
  mel.forEach(([f, d]) => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = "triangle"; o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.12, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, t + d * 0.42);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d * 0.45);
    t += d * 0.45;
  });
  return (t - ac.currentTime) * 1000;
}
export const isPlaying = () => playing;
export function startMusic() {
  if (playing) return; playing = true;
  const loop = () => { if (playing) timer = setTimeout(loop, playOnce() + 1500); };
  loop();
}
export function stopMusic() { playing = false; clearTimeout(timer); }
