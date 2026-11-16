// The home page's landscape: limestone ridges in haze behind "Lavanda", the
// name across the front ridge, and rows of lavender bushes swaying in front.
// Light runs dawn to dusk (the slider); drawn at 30 fps, only while on screen.
// Measured on a mid-range phone at 60 fps: 3.2 ms a frame (mockups/home.html has the meter).
(() => {
  const root = document.querySelector('.scene');
  if (!root) return;
  const cv = root.querySelector('canvas');
  const ctx = cv.getContext('2d');
  const slider = root.querySelector('input');
  const hourName = root.querySelector('output');
  const HOURS = JSON.parse(root.dataset.hours);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── colour helpers ──
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const rgb = (c, a = 1) => `rgba(${c.map(Math.round).join(',')},${a})`;

  // Light keyframes: dawn, noon, the violet hour.
  const K = [
    { top: hex('#2f3566'), bot: hex('#f3b79b'), haze: hex('#9b8fb6'), pine: hex('#2b3140'), earth: hex('#7a5a45'), lav: hex('#6f5fa8'), sun: [0.18, 0.40], sunC: hex('#ffd9b0') },
    { top: hex('#5f93d3'), bot: hex('#e7eef4'), haze: hex('#a9b7cf'), pine: hex('#33463a'), earth: hex('#b4844f'), lav: hex('#7d64c0'), sun: [0.55, 0.10], sunC: hex('#fff8e6') },
    { top: hex('#271f4d'), bot: hex('#ee9a7f'), haze: hex('#8c6f9f'), pine: hex('#2a2436'), earth: hex('#8a5a45'), lav: hex('#7a55b0'), sun: [0.82, 0.42], sunC: hex('#ffc28a') },
  ];
  function palette(h) {
    const [a, b, t] = h < 0.5 ? [K[0], K[1], h / 0.5] : [K[1], K[2], (h - 0.5) / 0.5];
    const o = {};
    for (const k in a) o[k] = mix(a[k], b[k], t);
    return o;
  }

  // ── terrain: seeded value noise ──
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const lattice = Array.from({ length: 512 }, rnd);
  const noise = x => { const i = Math.floor(x), f = x - i, s = f * f * (3 - 2 * f); return lattice[i & 511] * (1 - s) + lattice[(i + 1) & 511] * s; };
  const fbm = x => noise(x) * 0.6 + noise(x * 2.3 + 40) * 0.28 + noise(x * 5.1 + 90) * 0.12;

  // ── lavender bushes, drawn once at high resolution and reused ──
  // Each: grey-green foliage, a fan of stems, and on each stem a spike of
  // florets in whorls, gappy at the bottom and tight at the tip.
  const S = 384;
  function makeBush() {
    const c = document.createElement('canvas'); c.width = S; c.height = S;
    const g = c.getContext('2d'), bx = S / 2, by = S * 0.98;
    g.lineCap = 'round';
    for (let i = 0; i < 170; i++) {
      const a = -Math.PI / 2 + (rnd() - 0.5) * 2.4, l = S * (0.1 + rnd() * 0.2), ox = bx + (rnd() - 0.5) * S * 0.3;
      g.strokeStyle = `hsl(${95 + rnd() * 25},${10 + rnd() * 12}%,${30 + rnd() * 22}%)`;
      g.lineWidth = 1.5 + rnd() * 2.5;
      g.beginPath(); g.moveTo(ox, by);
      g.quadraticCurveTo(ox + Math.cos(a) * l * 0.4, by + Math.sin(a) * l * 0.6, ox + Math.cos(a) * l, by + Math.sin(a) * l * 0.85);
      g.stroke();
    }
    const stems = 28 + Math.floor(rnd() * 12);
    for (let i = 0; i < stems; i++) {
      const a = -Math.PI / 2 + (rnd() - 0.5) * 1.8, L = S * (0.5 + rnd() * 0.42), ox = bx + (rnd() - 0.5) * S * 0.14;
      const tx = ox + Math.cos(a) * L, ty = by + Math.sin(a) * L;
      const cx = ox + Math.cos(a) * L * 0.35, cy = by + Math.sin(a) * L * 0.65;
      g.strokeStyle = `hsl(${78 + rnd() * 18},20%,${36 + rnd() * 12}%)`; g.lineWidth = 1.8;
      g.beginPath(); g.moveTo(ox, by); g.quadraticCurveTo(cx, cy, tx, ty); g.stroke();
      const dx = tx - cx, dy = ty - cy, dl = Math.hypot(dx, dy), ux = dx / dl, uy = dy / dl, ang = Math.atan2(uy, ux);
      const spike = S * (0.12 + rnd() * 0.08), whorls = 7 + Math.floor(rnd() * 4), hue = 258 + rnd() * 18;
      for (let w = 0; w < whorls; w++) {
        const f = w / (whorls - 1), along = spike * (1 - Math.pow(f, 0.8));
        const px = tx - ux * along, py = ty - uy * along, r = S * 0.017 * (1.15 - f * 0.6);
        for (let k = -1; k <= 1; k++) {
          const light = 34 + f * 22 + rnd() * 10 + (k === 0 ? 6 : 0);
          g.fillStyle = `hsl(${hue + rnd() * 6},${42 + rnd() * 18}%,${light}%)`;
          g.beginPath(); g.ellipse(px - k * r * 0.95 * uy, py + k * r * 0.95 * ux, r * 1.1, r * 0.78, ang, 0, 7); g.fill();
        }
        // a tiny lit petal on some florets
        if (rnd() < 0.5) { g.fillStyle = `hsla(${hue},70%,82%,0.8)`; g.beginPath(); g.arc(px - uy * r * 0.4, py + ux * r * 0.4 - r * 0.3, r * 0.32, 0, 7); g.fill(); }
      }
    }
    return c;
  }
  const bushes = Array.from({ length: 6 }, makeBush);

  let W = 0, H = 0, ridges = [], horizon = 0, tufts = [], DPR = 1, pitch = 0;
  function build() {
    const dpr = DPR = Math.min(window.devicePixelRatio || 1, 2); // measured: 3.2 ms/frame at 1.5x on a mid phone
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = bg.width = W * dpr; cv.height = bg.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bgx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bgKey = -1;
    horizon = H * 0.6;
    // Four ridges, far to near: limestone sierra in haze, pine-dark in front.
    ridges = [0, 1, 2, 3].map(i => {
      const base = H * (0.34 + i * 0.075), amp = H * (0.2 - i * 0.035), freq = 0.0032 + i * 0.0016, off = i * 17.3;
      const pts = [];
      for (let x = -10; x <= W + 10; x += 6) pts.push([x, base + amp * (0.5 - fbm(x * freq + off))]);
      return { pts, depth: i / 3 };
    });
    // Lavender rows converging on a vanishing point behind the front ridge.
    // Each row is a hedge: a wedge running to the vanishing point, with tufts
    // (jittered, so no rings) picked out where it comes close.
    tufts = []; hedges = [];
    const rows = Math.max(12, Math.round(W / 70)), vx = W * 0.52, vy = horizon - H * 0.035, spread = W * 2.1;
    const yAt = p => vy + (H + 40 - vy) * p, pMin = (horizon + 1 - vy) / (H + 40 - vy);
    pitch = spread / rows;
    const half = pitch * 0.24;
    for (let r = 0; r <= rows; r++) {
      const xb = vx + (r / rows - 0.5) * spread;
      const edge = [];
      for (let p = pMin; p <= 1.001; p += 0.02) edge.push([vx + (xb - vx) * p, yAt(p), p]);
      hedges.push({ xb, edge, half });
      // bushes at even steps along the row in the world, so perspective sets the spacing;
      // z < 1 puts the nearest ones right up at the camera, bigger than the frame's foot.
      for (let z = 0.58 + rnd() * 0.3; z < 40; z += 0.36 + rnd() * 0.1) {
        const p = 1 / z;
        if (p < Math.max(pMin, 0.06)) break;
        const x = vx + (xb - vx) * p + (rnd() - 0.5) * half * 0.4 * p;
        tufts.push({ x, y: yAt(p), p, ph: rnd() * 6.28, v: Math.floor(rnd() * bushes.length), flip: rnd() < 0.5 });
      }
    }
    tufts.sort((a, b) => a.y - b.y);
  }
  let hedges = [];

  // Sky, ridges, word, pines, earth and hedges change only with the hour, so
  // they are drawn to an offscreen canvas and reused; only the bushes move.
  const bg = document.createElement('canvas'), bgx = bg.getContext('2d');
  let bgKey = -1;
  function drawBackdrop(c) {
    const ctx = bgx;
    // sky
    const g = ctx.createLinearGradient(0, 0, 0, horizon);
    g.addColorStop(0, rgb(c.top)); g.addColorStop(1, rgb(c.bot));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // sun with a soft halo
    const sx = W * c.sun[0], sy = H * c.sun[1], sr = Math.min(W, H) * 0.05;
    const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 6);
    halo.addColorStop(0, rgb(c.sunC, 0.55)); halo.addColorStop(1, rgb(c.sunC, 0));
    ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = rgb(c.sunC); ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 7); ctx.fill();

    const ridge = (rd) => {
      const col = mix(mix(c.haze, c.bot, 0.25), c.pine, Math.pow(rd.depth, 1.3));
      ctx.fillStyle = rgb(col);
      ctx.beginPath(); ctx.moveTo(-10, H);
      for (const [x, y] of rd.pts) ctx.lineTo(x, y);
      ctx.lineTo(W + 10, H); ctx.fill();
    };
    ridge(ridges[0]); ridge(ridges[1]);

    // The name: "Lavanda" rises out of the sierra (the near ridges cover its
    // foot); "de la Serranía" is set across the dark front ridge, after the pines.
    let fs = Math.min(W * 0.23, H * 0.34, 300);
    const lit = rgb(mix(c.bot, [255, 255, 255], 0.55), 0.94);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.font = `${fs}px 'Young Serif', Georgia, serif`;
    // narrow screens: shrink the word until it fits 90% of the width
    const wide = ctx.measureText('Lavanda').width;
    if (wide > W * 0.9) { fs *= (W * 0.9) / wide; ctx.font = `${fs}px 'Young Serif', Georgia, serif`; }
    const fs2 = Math.max(17, fs * 0.3);
    ctx.fillStyle = lit;
    ctx.fillText('Lavanda', W / 2, H * 0.49);

    ridge(ridges[2]); ridge(ridges[3]);

    // Aleppo pines along the front ridge: a leaning trunk and a ragged crown
    const pineC = mix(c.pine, [0, 0, 0], 0.15), front = ridges[3].pts;
    ctx.fillStyle = rgb(pineC); ctx.strokeStyle = rgb(pineC);
    for (let i = 3; i < front.length; i += 4) {
      const [x, y] = front[i], s = 5 + ((i * 7) % 7), lean = ((i * 13) % 5 - 2) * 0.6;
      if (y > horizon - 4) continue;
      ctx.lineWidth = Math.max(1, s * 0.18);
      ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x + lean, y - s * 1.1); ctx.stroke();
      for (let b = 0; b < 4; b++) {
        const bx = x + lean + ((b * 5) % 4 - 1.5) * s * 0.45, by = y - s * (1.2 + (b % 2) * 0.35);
        ctx.beginPath(); ctx.ellipse(bx, by, s * 0.62, s * 0.38, 0, 0, 7); ctx.fill();
      }
    }
    ctx.font = `${fs2}px 'Young Serif', Georgia, serif`;
    ctx.fillStyle = lit;
    ctx.fillText('de la Serranía', W / 2, horizon - H * 0.025);

    // field: earth
    const eg = ctx.createLinearGradient(0, horizon, 0, H);
    eg.addColorStop(0, rgb(mix(c.earth, c.haze, 0.35))); eg.addColorStop(1, rgb(c.earth));
    ctx.fillStyle = eg; ctx.fillRect(0, horizon, W, H - horizon);

    const lavHi = mix(c.lav, c.sunC, 0.4), lavLo = mix(c.lav, [20, 10, 40], 0.3), lavFar = mix(c.lav, c.haze, 0.45);
    // hedges: a wedge per row, hazier toward the horizon
    for (const hg of hedges) {
      const grad = ctx.createLinearGradient(0, horizon, 0, H);
      grad.addColorStop(0, rgb(lavFar)); grad.addColorStop(1, rgb(mix(lavLo, [70, 84, 66], 0.55)));
      ctx.fillStyle = grad;
      ctx.beginPath();
      for (const [x, y, p] of hg.edge) ctx.lineTo(x - hg.half * p, y - hg.half * p * 0.32);
      for (let i = hg.edge.length - 1; i >= 0; i--) { const [x, y, p] = hg.edge[i]; ctx.lineTo(x + hg.half * p, y + hg.half * p * 0.06); }
      ctx.fill();
    }
  }

  function draw(h, t) {
    const c = palette(h), key = Math.round(h * 400);
    if (key !== bgKey) { drawBackdrop(c); bgKey = key; }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(bg, 0, 0);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // bushes, far to near; a gust travels across the field and bends the stems
    for (const k of tufts) {
      const size = pitch * 1.3 * k.p, sc = size / S;
      if (k.x < -size || k.x > W + size || k.y - size > H) continue;
      const gust = 0.55 + 0.45 * Math.sin(t * 0.45 - k.x * 0.004 + k.y * 0.002);
      const skew = Math.sin(t * 1.6 + k.x * 0.011 + k.ph) * 0.07 * gust + 0.05 * gust;
      const fx = k.flip ? -sc : sc;
      ctx.setTransform(DPR * fx, 0, DPR * skew * sc, DPR * sc, DPR * k.x, DPR * k.y);
      ctx.drawImage(bushes[k.v], -S / 2, -S * 0.98);
    }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // the hour's light over the field, and haze toward the horizon
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = rgb(mix([255, 255, 255], mix(c.sunC, c.haze, 0.5), 0.55));
    ctx.fillRect(0, horizon - H * 0.02, W, H);
    ctx.globalCompositeOperation = 'source-over';
    const hz = ctx.createLinearGradient(0, horizon - H * 0.02, 0, horizon + (H - horizon) * 0.45);
    hz.addColorStop(0, rgb(mix(c.haze, c.bot, 0.3), 0.7)); hz.addColorStop(1, rgb(c.haze, 0));
    ctx.fillStyle = hz; ctx.fillRect(0, horizon - H * 0.02, W, (H - horizon) * 0.5);
  }

  const names = h => HOURS[h < 0.2 ? 0 : h < 0.4 ? 1 : h < 0.62 ? 2 : h < 0.85 ? 3 : 4];
  let hour = reduce ? 0.78 : 0.02, t0 = performance.now(), intro = !reduce;
  // 30 fps: the browser still calls every screen frame, but only every other one
  // draws (the 2 ms slack keeps 60 Hz screens from dropping to 20 fps).
  const FRAME_MS = 1000 / 30;
  let lastDraw = -Infinity;
  function frame(now) {
    if (now - lastDraw < FRAME_MS - 2 && !reduce && onScreen) { requestAnimationFrame(frame); return; }
    lastDraw = now;
    const t = (now - t0) / 1000;
    if (intro) {
      const k = Math.min(1, t / 3.5), e = 1 - Math.pow(1 - k, 3);
      hour = 0.02 + e * 0.76;
      slider.value = Math.round(hour * 100);
      if (k === 1) intro = false;
    }
    hourName.textContent = names(hour);
    draw(hour, t);
    if (!reduce && onScreen) requestAnimationFrame(frame); else running = false;
  }
  let onScreen = true, running = false;
  const start = () => { if (!running) { running = true; requestAnimationFrame(frame); } };
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen && !reduce) start(); }).observe(cv);
  slider.addEventListener('input', () => {
    intro = false; hour = slider.value / 100;
    if (reduce) { hourName.textContent = names(hour); draw(hour, 0); }
  });
  addEventListener('resize', () => { build(); if (reduce) draw(hour, 0); });

  build();
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { bgKey = -1; start(); });
})();
