/* Tab navigation */
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

tabs.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    panels.forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    const id = btn.dataset.tab;
    document.getElementById(id)?.classList.add('active');
  });
});

/* ThumbView */
const tvElements = {
  file: document.getElementById('thumb-file'),
  url: document.getElementById('thumb-url'),
  context: document.getElementById('tv-context'),
  theme: document.getElementById('tv-theme'),
  title: document.getElementById('tv-title'),
  channel: document.getElementById('tv-channel'),
  metrics: document.getElementById('tv-metrics'),
  durationToggle: document.getElementById('tv-duration-toggle'),
  duration: document.getElementById('tv-duration'),
  corner: document.getElementById('tv-corner'),
  download: document.getElementById('tv-download'),
  reset: document.getElementById('tv-reset'),
  preview: document.getElementById('tv-preview'),
};

let tvImageSrc = '';

function renderThumbView() {
  const context = tvElements.context.value;
  const theme = tvElements.theme.value;
  const title = tvElements.title.value || 'Titre de vidéo passionnant et optimisé CTR';
  const channel = tvElements.channel.value || 'Chaîne Excellente';
  const metrics = tvElements.metrics.value || '123 k vues • il y a 3 jours';
  const showDuration = tvElements.durationToggle.checked;
  const duration = tvElements.duration.value || '10:24';
  const radius = tvElements.corner.value || '12';

  const themeClass = theme === 'light' ? 'theme-light' : 'theme-dark';

  const img = tvImageSrc
    ? `<img src="${tvImageSrc}" alt="Miniature" crossorigin="anonymous"/>`
    : `<div style="display:grid;place-items:center;height:100%;color:#94a3b8">Aucune image</div>`;

  const thumb = `
    <div class="tv-thumb" style="--tv-radius:${radius}px">
      ${img}
      ${showDuration ? `<div class="tv-duration">${duration}</div>` : ''}
    </div>
  `;

  let body = '';
  if (context === 'feed') {
    body = `
      <div class="tv-feed ${themeClass}">
        <div class="tv-item">
          ${thumb}
          <div class="tv-meta">
            <div class="tv-title">${title}</div>
            <div class="tv-under">${channel} • ${metrics}</div>
          </div>
        </div>
        <div style="opacity:.5">
          <div class="tv-item">${thumb}<div class="tv-meta"><div class="tv-title">Vidéo voisine</div><div class="tv-under">Une autre chaîne • 95 k vues</div></div></div>
        </div>
      </div>
    `;
  } else if (context === 'watch') {
    body = `
      <div class="tv-watch ${themeClass}">
        <div class="tv-item">
          ${thumb}
          <div class="tv-meta">
            <div class="tv-title" style="font-size:20px">${title}</div>
            <div class="tv-under">${channel} • ${metrics}</div>
          </div>
        </div>
      </div>
    `;
  } else {
    body = `
      <div class="tv-mobile ${themeClass}">
        <div class="tv-item">
          ${thumb}
          <div class="tv-meta">
            <div class="tv-title" style="font-size:16px">${title}</div>
            <div class="tv-under">${channel} • ${metrics}</div>
          </div>
        </div>
      </div>
    `;
  }

  tvElements.preview.innerHTML = `<div class="tv-frame">${body}</div>`;
}

function handleFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    tvImageSrc = String(e.target?.result || '');
    renderThumbView();
  };
  reader.readAsDataURL(file);
}

tvElements.file.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (file) handleFile(file);
});

tvElements.url.addEventListener('change', () => {
  tvImageSrc = tvElements.url.value.trim();
  renderThumbView();
});

['context', 'theme', 'title', 'channel', 'metrics', 'duration', 'corner'].forEach((key) => {
  tvElements[key].addEventListener('input', renderThumbView);
});

tvElements.durationToggle.addEventListener('change', renderThumbView);

tvElements.reset.addEventListener('click', () => {
  tvImageSrc = '';
  tvElements.file.value = '';
  tvElements.url.value = '';
  tvElements.title.value = '';
  tvElements.channel.value = '';
  tvElements.metrics.value = '';
  tvElements.duration.value = '10:24';
  tvElements.corner.value = '12';
  tvElements.durationToggle.checked = true;
  renderThumbView();
});

async function downloadThumbView() {
  const node = tvElements.preview.querySelector('.tv-frame');
  if (!node) return;
  const { toPng } = await import('https://cdn.skypack.dev/html-to-image@1.11.11');
  const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'thumbview.png';
  a.click();
}

tvElements.download.addEventListener('click', downloadThumbView);

renderThumbView();

/* StatLab */
const slElements = {
  key: document.getElementById('yt-api-key'),
  channel: document.getElementById('yt-channel'),
  fetch: document.getElementById('sl-fetch'),
  demo: document.getElementById('sl-demo'),
  kpiSubs: document.getElementById('kpi-subs'),
  kpiViews: document.getElementById('kpi-views'),
  kpiVideos: document.getElementById('kpi-videos'),
  tableBody: document.querySelector('#sl-table tbody'),
};

const demoData = {
  channelTitle: 'Squiduu (Démo)',
  subscribers: 842000,
  views: 103_500_000,
  videos: 326,
  lastVideos: Array.from({ length: 12 }).map((_, i) => ({
    id: `demo${i}`,
    thumbnail: `https://picsum.photos/seed/thumb${i}/320/180`,
    title: `Vidéo démo ${i + 1} — idée ${['forte', 'curieuse', 'what if', 'extrême'][i % 4]}`,
    views: Math.floor(Math.random() * 900_000) + 20_000,
    likes: Math.floor(Math.random() * 45_000) + 1_000,
    comments: Math.floor(Math.random() * 3000),
    publishedAt: new Date(Date.now() - i * 864e5).toISOString(),
  })),
};

function formatNumber(n) {
  return new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(n);
}

function renderKpis({ subscribers, views, videos }) {
  slElements.kpiSubs.textContent = formatNumber(subscribers);
  slElements.kpiViews.textContent = formatNumber(views);
  slElements.kpiVideos.textContent = String(videos);
}

function renderTable(videos) {
  slElements.tableBody.innerHTML = videos
    .map((v) => `
      <tr>
        <td><img src="${v.thumbnail}" alt="thumb" /></td>
        <td>${v.title}</td>
        <td>${formatNumber(v.views)}</td>
        <td>${formatNumber(v.likes)}</td>
        <td>${formatNumber(v.comments)}</td>
        <td>${new Date(v.publishedAt).toLocaleDateString('fr-FR')}</td>
      </tr>
    `)
    .join('');
}

function loadDemo() {
  renderKpis(demoData);
  renderTable(demoData.lastVideos);
}

async function fetchChannelData(apiKey, channelInput) {
  // Lightweight client-side fetch using YouTube Data API v3
  // Supports handle like @name or channel ID/URL best effort.
  const key = apiKey.trim();
  const input = channelInput.trim();
  if (!key || !input) throw new Error('Clé API et chaîne requis');

  let channelId = '';
  if (input.startsWith('@')) {
    const handle = input.slice(1);
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&key=${key}`);
    const data = await res.json();
    channelId = data.items?.[0]?.id?.channelId || '';
  } else if (input.includes('/channel/')) {
    channelId = input.split('/channel/')[1].split(/[/?#]/)[0];
  } else if (input.startsWith('UC')) {
    channelId = input;
  } else {
    // Try search fallback
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(input)}&key=${key}`);
    const data = await res.json();
    channelId = data.items?.[0]?.id?.channelId || '';
  }
  if (!channelId) throw new Error("Chaîne introuvable");

  const [chRes, vidsRes] = await Promise.all([
    fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${key}`),
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=12&order=date&type=video&key=${key}`),
  ]);
  const ch = await chRes.json();
  const vids = await vidsRes.json();

  const stats = ch.items?.[0]?.statistics;
  const snippet = ch.items?.[0]?.snippet;

  const videoIds = vids.items?.map((i) => i.id.videoId).filter(Boolean) || [];
  const detailsRes = videoIds.length
    ? await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(',')}&key=${key}`)
    : null;
  const details = detailsRes ? await detailsRes.json() : { items: [] };

  const lastVideos = details.items.map((v) => ({
    id: v.id,
    thumbnail: v.snippet?.thumbnails?.medium?.url || '',
    title: v.snippet?.title || '',
    views: Number(v.statistics?.viewCount || 0),
    likes: Number(v.statistics?.likeCount || 0),
    comments: Number(v.statistics?.commentCount || 0),
    publishedAt: v.snippet?.publishedAt || new Date().toISOString(),
  }));

  return {
    channelTitle: snippet?.title || channelId,
    subscribers: Number(stats?.subscriberCount || 0),
    views: Number(stats?.viewCount || 0),
    videos: Number(stats?.videoCount || 0),
    lastVideos,
  };
}

slElements.demo.addEventListener('click', loadDemo);

slElements.fetch.addEventListener('click', async () => {
  try {
    slElements.fetch.disabled = true;
    slElements.fetch.textContent = 'Chargement…';
    const data = await fetchChannelData(slElements.key.value, slElements.channel.value);
    renderKpis(data);
    renderTable(data.lastVideos);
  } catch (e) {
    alert(e.message || 'Erreur lors du chargement');
  } finally {
    slElements.fetch.disabled = false;
    slElements.fetch.textContent = 'Récupérer';
  }
});

/* Infinite Brainstorm */
const canvas = document.getElementById('ib-canvas');
const ctx = canvas.getContext('2d');

const state = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  isPanning: false,
  panStartX: 0,
  panStartY: 0,
  mouseX: 0,
  mouseY: 0,
  snapToGrid: true,
  nodes: [], // { id, x, y, w, h, text, color }
  edges: [], // { a, b }
  selectedNodeId: null,
  linkingFromId: null,
};

function gridSnap(value, step = 16) {
  return state.snapToGrid ? Math.round(value / step) * step : value;
}

function createNode(x, y) {
  const id = `n${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const node = {
    id,
    x: gridSnap((x - state.offsetX) / state.zoom - 100),
    y: gridSnap((y - state.offsetY) / state.zoom - 50),
    w: 200,
    h: 120,
    text: 'Nouvelle idée',
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 55%)`,
  };
  state.nodes.push(node);
  draw();
}

function worldToScreen(x, y) {
  return { x: x * state.zoom + state.offsetX, y: y * state.zoom + state.offsetY };
}
function screenToWorld(x, y) {
  return { x: (x - state.offsetX) / state.zoom, y: (y - state.offsetY) / state.zoom };
}

function drawGrid() {
  const step = 32 * state.zoom;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let x = (state.offsetX % step); x < canvas.width; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = (state.offsetY % step); y < canvas.height; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  applyHiDPI();
  drawGrid();

  // Edges
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  state.edges.forEach((e) => {
    const a = state.nodes.find((n) => n.id === e.a);
    const b = state.nodes.find((n) => n.id === e.b);
    if (!a || !b) return;
    const as = worldToScreen(a.x + a.w / 2, a.y + a.h / 2);
    const bs = worldToScreen(b.x + b.w / 2, b.y + b.h / 2);
    ctx.beginPath();
    ctx.moveTo(as.x, as.y);
    ctx.lineTo(bs.x, bs.y);
    ctx.stroke();
  });
  ctx.restore();

  // Nodes
  state.nodes.forEach((n) => {
    const { x, y } = worldToScreen(n.x, n.y);
    const w = n.w * state.zoom;
    const h = n.h * state.zoom;

    // Card
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 12 * state.zoom, true, true);

    // Header bar
    ctx.fillStyle = n.color;
    roundRect(ctx, x, y, w, 8 * state.zoom, [12 * state.zoom, 12 * state.zoom, 0, 0], true, false);

    // Text
    ctx.fillStyle = '#e6e8ef';
    ctx.font = `${Math.max(12, 14 * state.zoom)}px Inter, sans-serif`;
    wrapText(ctx, n.text, x + 12 * state.zoom, y + 24 * state.zoom, w - 24 * state.zoom, 20 * state.zoom);

    // Selection
    if (state.selectedNodeId === n.id) {
      ctx.strokeStyle = '#6ee7ff';
      ctx.lineWidth = 2;
      roundRect(ctx, x - 4, y - 4, w + 8, h + 8, 14 * state.zoom, false, true);
    }
  });

  // Temporary link preview
  if (state.linkingFromId) {
    const from = state.nodes.find((n) => n.id === state.linkingFromId);
    if (from) {
      const fs = worldToScreen(from.x + from.w / 2, from.y + from.h / 2);
      ctx.save();
      ctx.strokeStyle = 'rgba(110,231,255,0.8)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fs.x, fs.y);
      ctx.lineTo(state.mouseX, state.mouseY);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  let r = typeof radius === 'number' ? [radius, radius, radius, radius] : radius;
  ctx.beginPath();
  ctx.moveTo(x + r[0], y);
  ctx.lineTo(x + width - r[1], y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r[1]);
  ctx.lineTo(x + width, y + height - r[2]);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r[2], y + height);
  ctx.lineTo(x + r[3], y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r[3]);
  ctx.lineTo(x, y + r[0]);
  ctx.quadraticCurveTo(x, y, x + r[0], y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, y);
      line = words[i] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function pickNodeAt(x, y) {
  const p = screenToWorld(x, y);
  for (let i = state.nodes.length - 1; i >= 0; i--) {
    const n = state.nodes[i];
    if (p.x >= n.x && p.x <= n.x + n.w && p.y >= n.y && p.y <= n.y + n.h) {
      return n;
    }
  }
  return null;
}

let draggingNode = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// HiDPI support
function applyHiDPI() {
  // Canvas is already sized to device pixels; keep transform at 1:1
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// Panning with Space or middle mouse
let isSpacePanning = false;

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { isSpacePanning = true; }
  if (e.key.toLowerCase() === 'delete' || e.key === 'Backspace') {
    if (state.selectedNodeId) {
      state.edges = state.edges.filter((ed) => ed.a !== state.selectedNodeId && ed.b !== state.selectedNodeId);
      state.nodes = state.nodes.filter((n) => n.id !== state.selectedNodeId);
      state.selectedNodeId = null;
      draw();
    }
  } else if (e.key.toLowerCase() === 'l') {
    if (state.selectedNodeId) {
      state.linkingFromId = state.linkingFromId ? null : state.selectedNodeId;
    }
  } else if (e.key === 'Enter') {
    if (state.selectedNodeId) {
      const node = state.nodes.find((n) => n.id === state.selectedNodeId);
      const text = prompt('Texte du post-it:', node.text);
      if (text != null) { node.text = text; draw(); }
    }
  }
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'Space') { isSpacePanning = false; }
});

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  state.mouseX = x; state.mouseY = y;
  const node = pickNodeAt(x, y);

  const wantPan = isSpacePanning || e.button === 1; // space or middle mouse
  if (wantPan || !node) {
    state.isPanning = true;
    state.panStartX = x - state.offsetX;
    state.panStartY = y - state.offsetY;
  } else if (node) {
    draggingNode = node;
    state.selectedNodeId = node.id;
    const p = screenToWorld(x, y);
    dragOffsetX = p.x - node.x;
    dragOffsetY = p.y - node.y;
  }
  document.body.style.userSelect = 'none';
  draw();
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  state.mouseX = x; state.mouseY = y;
  if (draggingNode) {
    const p = screenToWorld(x, y);
    draggingNode.x = gridSnap(p.x - dragOffsetX);
    draggingNode.y = gridSnap(p.y - dragOffsetY);
    draw();
  } else if (state.isPanning) {
    state.offsetX = x - state.panStartX;
    state.offsetY = y - state.panStartY;
    draw();
  }
});

window.addEventListener('mouseup', () => {
  draggingNode = null;
  state.isPanning = false;
  document.body.style.userSelect = '';
});
canvas.addEventListener('mouseleave', () => {
  draggingNode = null;
  state.isPanning = false;
});

canvas.addEventListener('dblclick', (e) => {
  const rect = canvas.getBoundingClientRect();
  createNode(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = Math.sign(e.deltaY);
  const factor = 1 - delta * 0.1;
  const oldZoom = state.zoom;
  const newZoom = Math.min(3, Math.max(0.3, oldZoom * factor));

  // Zoom to cursor
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const wx = (mx - state.offsetX) / oldZoom;
  const wy = (my - state.offsetY) / oldZoom;
  state.zoom = newZoom;
  state.offsetX = mx - wx * newZoom;
  state.offsetY = my - wy * newZoom;
  draw();
}, { passive: false });

// Link mode button
const ibLink = document.getElementById('ib-link');
ibLink.addEventListener('click', () => {
  if (state.linkingFromId) {
    state.linkingFromId = null;
    ibLink.classList.remove('active');
  } else if (state.selectedNodeId) {
    state.linkingFromId = state.selectedNodeId;
    ibLink.classList.add('active');
  } else {
    alert('Sélectionnez d\'abord un post-it à lier.');
  }
  draw();
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const node = pickNodeAt(x, y);
  if (node) {
    if (state.linkingFromId && state.linkingFromId !== node.id) {
      state.edges.push({ a: state.linkingFromId, b: node.id });
      state.linkingFromId = null;
      ibLink.classList.remove('active');
      draw();
      return;
    }
    state.selectedNodeId = node.id;
    draw();
  } else {
    state.selectedNodeId = null;
    draw();
  }
});

function resizeCanvasToDisplaySize() {
  const width = canvas.clientWidth;
  const height = Math.max(480, Math.floor((canvas.clientWidth * 9) / 16));
  const dpr = window.devicePixelRatio || 1;
  if (canvas.style.width !== `${width}px`) canvas.style.width = `${width}px`;
  if (canvas.style.height !== `${height}px`) canvas.style.height = `${height}px`;
  const targetW = Math.floor(width * dpr);
  const targetH = Math.floor(height * dpr);
  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
    applyHiDPI();
    draw();
  }
}

window.addEventListener('resize', resizeCanvasToDisplaySize);
resizeCanvasToDisplaySize();

// Controls
const ibAdd = document.getElementById('ib-add');
const ibCenter = document.getElementById('ib-center');
const ibExport = document.getElementById('ib-export');
const ibImport = document.getElementById('ib-import');
const ibSnap = document.getElementById('ib-snap');
const ibSnapshot = document.getElementById('ib-snapshot');

ibAdd.addEventListener('click', () => createNode(canvas.width / 2, canvas.height / 2));
ibCenter.addEventListener('click', () => {
  state.offsetX = canvas.width / 2 - 200;
  state.offsetY = canvas.height / 2 - 100;
  state.zoom = 1;
  draw();
});
ibExport.addEventListener('click', () => {
  const json = JSON.stringify({
    nodes: state.nodes,
    edges: state.edges,
    viewport: { zoom: state.zoom, offsetX: state.offsetX, offsetY: state.offsetY },
  }, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'brainstorm.json';
  a.click();
});
ibImport.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      state.nodes = Array.isArray(data.nodes) ? data.nodes : [];
      state.edges = Array.isArray(data.edges) ? data.edges : [];
      if (data.viewport) {
        state.zoom = data.viewport.zoom ?? 1;
        state.offsetX = data.viewport.offsetX ?? 0;
        state.offsetY = data.viewport.offsetY ?? 0;
      }
      draw();
    } catch (err) { alert('Fichier invalide'); }
  };
  reader.readAsText(file);
});
ibSnap.addEventListener('change', () => { state.snapToGrid = ibSnap.checked; });

// Simplify PNG export: directly from canvas
ibSnapshot.addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'brainstorm.png';
  a.click();
});

draw();