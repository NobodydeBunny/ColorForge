/* ═══════════════════════════════════════════════════════════════
   COLOR FORGE — Material Theme Builder  ·  app.js
═══════════════════════════════════════════════════════════════ */
'use strict';

// ── STATE ──────────────────────────────────────────────────────
const MAT_KEYS = ['primary','primaryVariant','secondary','secondaryVariant','background','surface','error'];

let matTheme = {
  primary:          '#6200EE',
  primaryVariant:   '#3700B3',
  secondary:        '#03DAC6',
  secondaryVariant: '#018786',
  background:       '#FFFFFF',
  surface:          '#FFFFFF',
  error:            '#B00020',
};

let customRoles = []; // [{name, hex}]

let gradState = { c1: '#6200EE', c2: '#03DAC6', dir: 'to right' };

let autoVariant = { primaryVariant: true, secondaryVariant: true };

function calcVariant(hex) {
  const { r, g, b } = hexToRgb(hex);
  return '#' + [r, g, b]
    .map(v => Math.max(0, Math.round(v * 0.58)).toString(16).padStart(2, '0'))
    .join('').toUpperCase();
}

function syncAutoButtons() {
  ['primaryVariant', 'secondaryVariant'].forEach(key => {
    const btn = document.getElementById(`auto-${key}`);
    const pk  = document.getElementById(`pk-${key}`);
    if (btn) btn.classList.toggle('active', autoVariant[key]);
    if (pk) {
      pk.style.opacity       = autoVariant[key] ? '0.35' : '1';
      pk.style.pointerEvents = autoVariant[key] ? 'none' : 'auto';
    }
  });
}

let modalFmt = 'css';
let codeFmt  = 'css';

// ── ROLE META ──────────────────────────────────────────────────
const ROLE_LABELS = {
  primary:          'Primary',
  primaryVariant:   'Primary Variant',
  secondary:        'Secondary',
  secondaryVariant: 'Secondary Variant',
  background:       'Background',
  surface:          'Surface',
  error:            'Error',
  onPrimary:        'On Primary',
  onSecondary:      'On Secondary',
  onBackground:     'On Background',
  onSurface:        'On Surface',
  onError:          'On Error',
};

const GRID_CORE    = ['primary','primaryVariant','secondary','secondaryVariant'];
const GRID_SURFACE = ['background','surface','error'];
const GRID_ON      = ['onPrimary','onSecondary','onBackground','onSurface','onError'];

const CONTRAST_PAIRS = [
  { fg:'onPrimary',    bg:'primary',    label:'On Primary'    },
  { fg:'onSecondary',  bg:'secondary',  label:'On Secondary'  },
  { fg:'onBackground', bg:'background', label:'On Background' },
  { fg:'onSurface',    bg:'surface',    label:'On Surface'    },
  { fg:'onError',      bg:'error',      label:'On Error'      },
  { fg:'primary',      bg:'background', label:'Primary on Bg' },
  { fg:'secondary',    bg:'background', label:'Secondary on Bg'},
  { fg:'error',        bg:'surface',    label:'Error on Surface'},
];

// ── COLOR UTILS ────────────────────────────────────────────────
function hexToRgb(hex) {
  hex = hex.replace('#','');
  if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  const n = parseInt(hex, 16);
  return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
}

function luminance(hex) {
  const {r,g,b} = hexToRgb(hex);
  return [r,g,b].reduce((acc,v,i) => {
    v /= 255;
    v = v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
    return acc + v * [0.2126,0.7152,0.0722][i];
  }, 0);
}

function contrastRatio(h1, h2) {
  const l1 = luminance(h1), l2 = luminance(h2);
  return (Math.max(l1,l2)+0.05) / (Math.min(l1,l2)+0.05);
}

function onColor(hex) {
  return luminance(hex) > 0.35 ? '#000000' : '#FFFFFF';
}

function wcagGrade(ratio) {
  if (ratio >= 7.0) return { label:'AAA', cls:'grade-aaa' };
  if (ratio >= 4.5) return { label:'AA',  cls:'grade-aa'  };
  return { label:'Fail', cls:'grade-fail' };
}

function toKebab(s) { return s.replace(/([A-Z])/g,'-$1').toLowerCase().replace(/^-/,''); }
function toSnake(s) { return s.replace(/([A-Z])/g,'_$1').toLowerCase().replace(/^_/,''); }

// ── DERIVED COLORS ─────────────────────────────────────────────
function getDerived() {
  return {
    onPrimary:    onColor(matTheme.primary),
    onSecondary:  onColor(matTheme.secondary),
    onBackground: onColor(matTheme.background),
    onSurface:    onColor(matTheme.surface),
    onError:      onColor(matTheme.error),
  };
}

function getFullPalette() {
  return { ...matTheme, ...getDerived() };
}

// ── GRADIENT CSS ───────────────────────────────────────────────
function buildGradCSS() {
  const { c1, c2, dir } = gradState;
  return dir === 'radial'
    ? `radial-gradient(circle, ${c1}, ${c2})`
    : `linear-gradient(${dir}, ${c1}, ${c2})`;
}

// ── SIDEBAR SYNC ───────────────────────────────────────────────
function syncSidebar() {
  const derived = getDerived();
  const full = { ...matTheme, ...derived };

  MAT_KEYS.forEach(key => {
    const sw = document.getElementById(`sw-${key}`);
    const hx = document.getElementById(`hx-${key}`);
    const pk = document.getElementById(`pk-${key}`);
    if (sw) sw.style.setProperty('--sc', matTheme[key]);
    if (hx) hx.textContent = matTheme[key].toUpperCase();
    if (pk) pk.value = matTheme[key];
  });

  Object.entries(derived).forEach(([key, val]) => {
    const sw = document.getElementById(`sw-${key}`);
    const hx = document.getElementById(`hx-${key}`);
    if (sw) sw.style.setProperty('--sc', val);
    if (hx) hx.textContent = val.toUpperCase();
  });

  // gradient
  const grad = buildGradCSS();
  const bar  = document.getElementById('gradPreviewBar');
  const txt  = document.getElementById('gradCSSText');
  const gs1  = document.getElementById('gs1');
  const gs2  = document.getElementById('gs2');
  if (bar) bar.style.background = grad;
  if (txt) txt.textContent = grad;
  if (gs1) gs1.style.setProperty('--sc', gradState.c1);
  if (gs2) gs2.style.setProperty('--sc', gradState.c2);
}

// ── THEME CARD HTML ────────────────────────────────────────────
let cardCounter = 0;
function makeCard(key, hex, label) {
  cardCounter++;
  const num = cardCounter;
  const on = onColor(hex);
  const numBg = on === '#FFFFFF' ? 'rgba(255,255,255,.15)' : 'rgba(0,0,0,.12)';
  return `
    <div class="theme-card">
      <div class="tc-color" style="background:${hex};">
        <div class="tc-num" style="background:${numBg};color:${on};">${num}</div>
      </div>
      <div class="tc-body">
        <div class="tc-role">${label}</div>
        <div class="tc-hex">
          <span class="mono">${hex.toUpperCase()}</span>
          <button class="tc-copy" onclick="quickCopy('${hex.toUpperCase()}',this)">⎘</button>
        </div>
      </div>
    </div>
  `;
}

// ── RENDER PALETTE GRIDS ───────────────────────────────────────
function renderPalette() {
  cardCounter = 0;
  const full = getFullPalette();

  document.getElementById('grid-core').innerHTML =
    GRID_CORE.map(k => makeCard(k, full[k], ROLE_LABELS[k])).join('');

  document.getElementById('grid-surface').innerHTML =
    GRID_SURFACE.map(k => makeCard(k, full[k], ROLE_LABELS[k])).join('');

  document.getElementById('grid-on').innerHTML =
    GRID_ON.map(k => makeCard(k, full[k], ROLE_LABELS[k])).join('');

  // Custom roles
  const custSection = document.getElementById('customPaletteSection');
  const custGrid    = document.getElementById('grid-custom');
  if (customRoles.length > 0) {
    custSection.style.display = '';
    custGrid.innerHTML = customRoles.map(r => makeCard(r.name, r.hex, r.name)).join('');
  } else {
    custSection.style.display = 'none';
    custGrid.innerHTML = '';
  }

  // gradient
  const grad = buildGradCSS();
  const fp   = document.getElementById('gradFullPreview');
  const ft   = document.getElementById('gradFullText');
  if (fp) fp.style.background = grad;
  if (ft) ft.textContent = grad;

  renderContrast();
}

// ── CONTRAST ───────────────────────────────────────────────────
function renderContrast() {
  const full = getFullPalette();
  document.getElementById('contrastGrid').innerHTML = CONTRAST_PAIRS.map(pair => {
    const ratio = contrastRatio(full[pair.fg], full[pair.bg]);
    const grade = wcagGrade(ratio);
    return `
      <div class="contrast-card">
        <div class="contrast-demo" style="background:${full[pair.bg]};color:${full[pair.fg]};">
          <span>Aa</span>
          <span style="font-size:11px;font-weight:400;">Sample text</span>
        </div>
        <div class="contrast-meta">
          <span class="contrast-label">${pair.label}</span>
          <div class="contrast-right">
            <span class="contrast-ratio">${ratio.toFixed(2)}:1</span>
            <span class="grade-badge ${grade.cls}">${grade.label}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ── UI PREVIEW ─────────────────────────────────────────────────
function renderPreview() {
  const p = getFullPalette();

  document.getElementById('phoneScreen').innerHTML = `
    <div style="background:${p.background};color:${p.onBackground};min-height:680px;position:relative;font-family:'Syne',sans-serif;">

      <div class="pv-statusbar" style="background:${p.primary};"></div>

      <div class="pv-appbar" style="background:${p.primary};color:${p.onPrimary};">
        <span style="font-size:20px;">☰</span>
        <span class="pv-appbar-title">My App</span>
        <div class="pv-appbar-icon" style="background:rgba(255,255,255,.15);">◎</div>
      </div>

      <div class="pv-body">

        <!-- Hero card -->
        <div class="pv-card" style="background:${p.surface};color:${p.onSurface};box-shadow:0 2px 10px rgba(0,0,0,.1);">
          <div class="pv-card-title">Welcome back</div>
          <div class="pv-card-sub">Here's what's happening today</div>
          <div class="pv-btns">
            <div class="pv-btn" style="background:${p.primary};color:${p.onPrimary};">Primary</div>
            <div class="pv-btn" style="background:${p.secondary};color:${p.onSecondary};">Secondary</div>
          </div>
        </div>

        <!-- Chips -->
        <div class="pv-chips">
          <div class="pv-chip" style="background:${p.primary};color:${p.onPrimary};">Design</div>
          <div class="pv-chip" style="background:${p.primaryVariant};color:${onColor(p.primaryVariant)};">System</div>
          <div class="pv-chip" style="background:${p.secondary};color:${p.onSecondary};">Colors</div>
          <div class="pv-chip" style="background:${p.secondaryVariant};color:${onColor(p.secondaryVariant)};">Theme</div>
        </div>

        <!-- Form card -->
        <div class="pv-card" style="background:${p.surface};color:${p.onSurface};box-shadow:0 2px 10px rgba(0,0,0,.1);">
          <div class="pv-card-title">Sign In</div>
          <input class="pv-input" style="background:${p.background};color:${p.onBackground};border-color:${p.primary};" placeholder="Email address" readonly />
          <input class="pv-input" style="background:${p.background};color:${p.onBackground};border-color:${p.primaryVariant};" placeholder="Password" type="password" readonly />
          <div class="pv-btns">
            <div class="pv-btn" style="background:${p.primary};color:${p.onPrimary};">Sign In</div>
            <div class="pv-btn pv-btn-outline" style="border:1.5px solid ${p.primary};color:${p.primary};">Register</div>
          </div>
        </div>

        <!-- Error banner -->
        <div class="pv-error-bar" style="background:${p.error};color:${p.onError};">
          <span style="font-size:16px;">⚠</span>
          Invalid credentials — please try again.
        </div>

        <!-- Variant card -->
        <div class="pv-card" style="background:${p.primaryVariant};color:${onColor(p.primaryVariant)};box-shadow:0 2px 10px rgba(0,0,0,.15);">
          <div class="pv-card-title">Pro Feature</div>
          <div class="pv-card-sub">Unlock all capabilities</div>
          <div class="pv-btn" style="background:${p.secondary};color:${p.onSecondary};border-radius:8px;text-align:center;padding:9px;">Upgrade Now</div>
        </div>

        <!-- Nav -->
        <div class="pv-nav" style="background:${p.surface};color:${p.onSurface};border-top-color:${p.background};">
          <div class="pv-nav-item" style="color:${p.primary};">
            <div class="pv-nav-ico">⌂</div><span>Home</span>
          </div>
          <div class="pv-nav-item">
            <div class="pv-nav-ico">⊞</div><span>Explore</span>
          </div>
          <div class="pv-nav-item">
            <div class="pv-nav-ico">♡</div><span>Saved</span>
          </div>
          <div class="pv-nav-item">
            <div class="pv-nav-ico">◎</div><span>Profile</span>
          </div>
        </div>

      </div>

      <!-- FAB -->
      <div class="pv-fab" style="background:${p.secondary};color:${p.onSecondary};">+</div>

    </div>
  `;
}

// ── CUSTOM ROLES ───────────────────────────────────────────────
function renderCustomRoleList() {
  const list = document.getElementById('customRoleList');
  if (customRoles.length === 0) {
    list.innerHTML = '<div class="no-custom">No custom roles yet</div>';
    return;
  }
  list.innerHTML = customRoles.map((r,i) => `
    <div class="custom-role-item">
      <div class="custom-swatch" style="background:${r.hex};"></div>
      <span class="custom-name">${r.name}</span>
      <span class="custom-hex mono">${r.hex.toUpperCase()}</span>
      <button class="custom-del" onclick="deleteCustomRole(${i})" title="Remove">✕</button>
    </div>
  `).join('');
}

function addCustomRole() {
  const nameEl  = document.getElementById('addRoleName');
  const pickEl  = document.getElementById('addColorPicker');
  const name    = nameEl.value.trim();
  const hex     = pickEl.value;
  if (!name) { showToast('Enter a role name'); return; }
  if (customRoles.find(r => r.name.toLowerCase() === name.toLowerCase())) {
    showToast('Role name already exists'); return;
  }
  customRoles.push({ name, hex });
  nameEl.value = '';
  renderCustomRoleList();
  renderPalette();
  renderCodeTab();
  showToast(`"${name}" added`);
}

function deleteCustomRole(i) {
  customRoles.splice(i, 1);
  renderCustomRoleList();
  renderPalette();
  renderCodeTab();
}

// ── EXPORT CODE ────────────────────────────────────────────────
function s(cls, txt) { return `<span class="${cls}">${txt}</span>`; }

function generateCSS(highlight = true) {
  const full  = getFullPalette();
  const extra = customRoles.map(r => [toKebab(r.name), r.hex.toUpperCase()]);
  const wrap  = highlight ? s : (_,t) => t;

  const vars = [
    ...Object.entries(full).map(([k,v]) => [toKebab(k), v.toUpperCase()]),
    ...extra,
  ].map(([k,v]) => `  ${wrap('t-var','--'+k)}: ${wrap('t-val',v)};`);

  return [
    wrap('t-cmt','/* Color Forge — Generated Material Theme */'),
    wrap('t-sel',':root') + ' {',
    ...vars,
    '}',
    '',
    wrap('t-cmt','/* Example usage */'),
    wrap('t-sel','.btn-primary') + ' {',
    `  ${wrap('t-attr','background')}: ${wrap('t-var','var(--primary)')};`,
    `  ${wrap('t-attr','color')}: ${wrap('t-var','var(--on-primary)')};`,
    '}',
  ].join('\n');
}

function generateJSON() {
  const full  = getFullPalette();
  const obj   = { colors: {}, custom: {}, meta: { tool:'Color Forge', version:'2.0' } };
  Object.entries(full).forEach(([k,v]) => { obj.colors[k] = v.toUpperCase(); });
  customRoles.forEach(r => { obj.custom[r.name] = r.hex.toUpperCase(); });
  return JSON.stringify(obj, null, 2)
    .replace(/"([\w\s]+)":/g, (_,k) => `${s('t-key','"'+k+'"')}:`)
    .replace(/: "([^"]+)"/g, (_,v) => `: ${s('t-str','"'+v+'"')}`);
}

function generateAndroid() {
  const full   = getFullPalette();
  const lines  = [
    s('t-tag','<?xml') + ` ${s('t-attr','version')}=${s('t-str','"1.0"')} ${s('t-attr','encoding')}=${s('t-str','"utf-8"')}${s('t-tag','?>')}`,
    s('t-tag','<resources>'),
    ...Object.entries(full).map(([k,v]) =>
      `  ${s('t-tag','<color')} ${s('t-attr','name')}=${s('t-str','"'+toSnake(k)+'"')}>${s('t-val',v.toUpperCase())}${s('t-tag','</color>')}`
    ),
    ...customRoles.map(r =>
      `  ${s('t-tag','<color')} ${s('t-attr','name')}=${s('t-str','"'+toSnake(r.name)+'"')}>${s('t-val',r.hex.toUpperCase())}${s('t-tag','</color>')}`
    ),
    s('t-tag','</resources>'),
  ];
  return lines.join('\n');
}

function generateTailwind() {
  const full    = getFullPalette();
  const entries = [
    ...Object.entries(full).map(([k,v]) =>
      `        ${s('t-key',"'"+toKebab(k)+"'")}: ${s('t-str',"'"+v.toUpperCase()+"'")},`
    ),
    ...customRoles.map(r =>
      `        ${s('t-key',"'"+toKebab(r.name)+"'")}: ${s('t-str',"'"+r.hex.toUpperCase()+"'")},`
    ),
  ];
  return [
    s('t-cmt','// Color Forge — Tailwind Config'),
    'module.exports = {',
    `  ${s('t-key','theme')}: {`,
    `    ${s('t-key','extend')}: {`,
    `      ${s('t-key','colors')}: {`,
    ...entries,
    '      },',
    '    },',
    '  },',
    '};',
  ].join('\n');
}

function getRaw(fmt) {
  const full = getFullPalette();
  switch(fmt) {
    case 'css': {
      const vars = [...Object.entries(full).map(([k,v]) => `  --${toKebab(k)}: ${v.toUpperCase()};`),
                    ...customRoles.map(r => `  --${toKebab(r.name)}: ${r.hex.toUpperCase()};`)];
      return { text: ['/* Color Forge */', ':root {', ...vars, '}'].join('\n'), ext:'css' };
    }
    case 'json': {
      const obj = { colors:{}, custom:{}, meta:{tool:'Color Forge',version:'2.0'} };
      Object.entries(full).forEach(([k,v])=>{ obj.colors[k]=v.toUpperCase(); });
      customRoles.forEach(r=>{ obj.custom[r.name]=r.hex.toUpperCase(); });
      return { text: JSON.stringify(obj,null,2), ext:'json' };
    }
    case 'android': {
      const lines = ['<?xml version="1.0" encoding="utf-8"?>','<resources>',
        ...Object.entries(full).map(([k,v])=>`  <color name="${toSnake(k)}">${v.toUpperCase()}</color>`),
        ...customRoles.map(r=>`  <color name="${toSnake(r.name)}">${r.hex.toUpperCase()}</color>`),
        '</resources>'];
      return { text: lines.join('\n'), ext:'xml' };
    }
    case 'tailwind': {
      const entries = [
        ...Object.entries(full).map(([k,v])=>`        '${toKebab(k)}': '${v.toUpperCase()}',`),
        ...customRoles.map(r=>`        '${toKebab(r.name)}': '${r.hex.toUpperCase()}',`),
      ];
      return { text: ['// Color Forge — Tailwind','module.exports = {','  theme: {','    extend: {','      colors: {',
        ...entries,'      },','    },','  },','};'].join('\n'), ext:'js' };
    }
    default: return { text:'', ext:'txt' };
  }
}

function renderCodeTab() {
  const el = document.getElementById('codeOut');
  switch(codeFmt) {
    case 'css':      el.innerHTML = generateCSS();      break;
    case 'json':     el.innerHTML = generateJSON();     break;
    case 'android':  el.innerHTML = generateAndroid();  break;
    case 'tailwind': el.innerHTML = generateTailwind(); break;
  }
}

function renderModalCode() {
  const el = document.getElementById('modalCodeOut');
  switch(modalFmt) {
    case 'css':      el.innerHTML = generateCSS();      break;
    case 'json':     el.innerHTML = generateJSON();     break;
    case 'android':  el.innerHTML = generateAndroid();  break;
    case 'tailwind': el.innerHTML = generateTailwind(); break;
  }
}

// ── EXPORT IMAGE ───────────────────────────────────────────────
function exportImage() {
  const full = getFullPalette();
  const matEntries = [...GRID_CORE, ...GRID_SURFACE, ...GRID_ON]
    .map(k => ({ key: k, hex: full[k], label: ROLE_LABELS[k] }));
  const custEntries = customRoles.map(r => ({ key: r.name, hex: r.hex, label: r.name }));
  const all = [...matEntries, ...custEntries];

  const COLS = 4, CW = 210, CH = 135, PAD = 22, TOP = 64;
  const rows = Math.ceil(all.length / COLS);

  const canvas = document.createElement('canvas');
  canvas.width  = COLS * CW + PAD * 2;
  canvas.height = rows * CH + PAD * 2 + TOP;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f0f13';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#f0f0f6';
  ctx.font = 'bold 20px "Syne", sans-serif';
  ctx.fillText('Color Forge — Material Theme', PAD, 38);

  all.forEach(({ hex, label }, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = PAD + col * CW;
    const y = TOP + PAD + row * CH;
    const on = onColor(hex);

    // card
    rrFill(ctx, x, y, CW - 10, CH - 10, 12, hex);

    // all text centered in card
    const cx = x + (CW - 10) / 2;
    const cy = y + (CH - 10) / 2;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = on;
    ctx.fillText(label, cx, cy - 12);

    ctx.font = '12px monospace';
    ctx.fillStyle = on === '#FFFFFF' ? 'rgba(255,255,255,.75)' : 'rgba(0,0,0,.6)';
    ctx.fillText(hex.toUpperCase(), cx, cy + 8);

    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = on === '#FFFFFF' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.2)';
    ctx.fillText('#' + (i + 1), cx, cy + 26);

    ctx.textBaseline = 'alphabetic';
  });

  const a = document.createElement('a');
  a.download = 'colorforge-theme.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
  showToast('Image exported!');
}

function rrFill(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath(); ctx.fill();
}

// ── PRESETS ────────────────────────────────────────────────────
const PRESETS = {
  'Material Default': {
    primary:'#6200EE', primaryVariant:'#3700B3',
    secondary:'#03DAC6', secondaryVariant:'#018786',
    background:'#FFFFFF', surface:'#FFFFFF', error:'#B00020',
  },
  'Ocean Blue': {
    primary:'#0077B6', primaryVariant:'#005F99',
    secondary:'#00B4D8', secondaryVariant:'#0096C7',
    background:'#F0F8FF', surface:'#FFFFFF', error:'#EF233C',
  },
  'Amber Dark': {
    primary:'#FFAB00', primaryVariant:'#FF8F00',
    secondary:'#69F0AE', secondaryVariant:'#00E676',
    background:'#121212', surface:'#1E1E1E', error:'#CF6679',
  },
  'Rose Gold': {
    primary:'#C2185B', primaryVariant:'#880E4F',
    secondary:'#FF8A65', secondaryVariant:'#E64A19',
    background:'#FFF8F8', surface:'#FFFFFF', error:'#B71C1C',
  },
  'Forest': {
    primary:'#2E7D32', primaryVariant:'#1B5E20',
    secondary:'#8BC34A', secondaryVariant:'#689F38',
    background:'#F1F8E9', surface:'#FFFFFF', error:'#C62828',
  },
  'Indigo Night': {
    primary:'#7C4DFF', primaryVariant:'#651FFF',
    secondary:'#FF6D00', secondaryVariant:'#E65100',
    background:'#0A0A1A', surface:'#13132A', error:'#FF5252',
  },
};

function buildPresetGrid() {
  const grid = document.getElementById('presetGrid');
  grid.innerHTML = Object.entries(PRESETS).map(([name, colors]) => {
    const sw = [colors.primary, colors.primaryVariant, colors.secondary, colors.error]
      .map(c => `<span style="background:${c};"></span>`).join('');
    return `<div class="preset-card" data-name="${name}">
      <div class="preset-swatches">${sw}</div>
      <div class="preset-name">${name}</div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', () => {
      const name = card.dataset.name;
      matTheme = { ...PRESETS[name] };
      autoVariant = { primaryVariant: false, secondaryVariant: false };
      renderAll();
      document.getElementById('presetFlyout').classList.add('hidden');
      showToast(`"${name}" applied`);
    });
  });
}

// ── TOAST ──────────────────────────────────────────────────────
let _toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
}

function quickCopy(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied!');
    if (btn) {
      const old = btn.textContent;
      btn.textContent = '✓';
      setTimeout(() => btn.textContent = old, 1400);
    }
  });
}

// ── FULL RENDER ────────────────────────────────────────────────
function renderAll() {
  syncSidebar();
  syncAutoButtons();
  renderPalette();
  renderPreview();
  renderCodeTab();
}

// ── INIT & EVENTS ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  buildPresetGrid();

  // Material color pickers
  MAT_KEYS.forEach(key => {
    const pk = document.getElementById(`pk-${key}`);
    if (!pk) return;
    pk.addEventListener('input', e => {
      matTheme[key] = e.target.value;
      if (key === 'primary' && autoVariant.primaryVariant) {
        matTheme.primaryVariant = calcVariant(e.target.value);
      }
      if (key === 'secondary' && autoVariant.secondaryVariant) {
        matTheme.secondaryVariant = calcVariant(e.target.value);
      }
      if (key === 'primaryVariant') {
        autoVariant.primaryVariant = false;
        syncAutoButtons();
      }
      if (key === 'secondaryVariant') {
        autoVariant.secondaryVariant = false;
        syncAutoButtons();
      }
      renderAll();
    });
  });

  // Copy role buttons
  document.querySelectorAll('.copy-role').forEach(btn => {
    btn.addEventListener('click', () => {
      const key  = btn.dataset.key;
      const full = getFullPalette();
      if (full[key]) quickCopy(full[key].toUpperCase(), btn);
    });
  });

  // Add custom role
  document.getElementById('addRoleBtn').addEventListener('click', addCustomRole);
  document.getElementById('addRoleName').addEventListener('keydown', e => {
    if (e.key === 'Enter') addCustomRole();
  });

  // Add swatch preview sync
  document.getElementById('addColorPicker').addEventListener('input', e => {
    document.getElementById('addSwatchPreview').style.setProperty('--sc', e.target.value);
  });

  // Gradient pickers
  document.getElementById('gc1').addEventListener('input', e => {
    gradState.c1 = e.target.value;
    renderAll();
  });
  document.getElementById('gc2').addEventListener('input', e => {
    gradState.c2 = e.target.value;
    renderAll();
  });

  // Gradient directions
  document.getElementById('gradDirs').querySelectorAll('.gd').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gd').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gradState.dir = btn.dataset.dir;
      renderAll();
    });
  });

  // Click grad bar to copy CSS
  document.getElementById('gradPreviewBar').addEventListener('click', () => {
    quickCopy(buildGradCSS(), null);
  });

  // Main tabs
  document.querySelectorAll('.mtab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.mtab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
  });

  // Code format tabs
  document.getElementById('codeFmtTabs').querySelectorAll('.cfmt').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.cfmt').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      codeFmt = tab.dataset.fmt;
      renderCodeTab();
    });
  });

  // Code copy
  document.getElementById('codeCopyBtn').addEventListener('click', () => {
    const { text } = getRaw(codeFmt);
    navigator.clipboard.writeText(text).then(() => showToast('Code copied!'));
  });

  // Header: Preset
  const presetFlyout = document.getElementById('presetFlyout');
  document.getElementById('btnPreset').addEventListener('click', e => {
    e.stopPropagation();
    presetFlyout.classList.toggle('hidden');
    document.getElementById('exportMenu').classList.add('hidden');
  });

  // Header: Reset
  document.getElementById('btnReset').addEventListener('click', () => {
    matTheme = { primary:'#6200EE', primaryVariant:'#3700B3', secondary:'#03DAC6',
      secondaryVariant:'#018786', background:'#FFFFFF', surface:'#FFFFFF', error:'#B00020' };
    customRoles = [];
    autoVariant = { primaryVariant: true, secondaryVariant: true };
    renderCustomRoleList();
    renderAll();
    showToast('Theme reset');
  });

  // Header: Export image
  document.getElementById('btnExportImg').addEventListener('click', exportImage);

  // Header: Export dropdown
  const exportMenu = document.getElementById('exportMenu');
  document.getElementById('btnExport').addEventListener('click', () => {
    modalFmt = 'css';
    syncModalTabs();
    renderModalCode();
    document.getElementById('exportModal').classList.remove('hidden');
  });
  document.getElementById('btnExportDrop').addEventListener('click', e => {
    e.stopPropagation();
    exportMenu.classList.toggle('hidden');
    presetFlyout.classList.add('hidden');
  });
  exportMenu.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      modalFmt = btn.dataset.fmt;
      exportMenu.classList.add('hidden');
      syncModalTabs();
      renderModalCode();
      document.getElementById('exportModal').classList.remove('hidden');
    });
  });

  // Dismiss dropdowns on outside click
  document.addEventListener('click', () => {
    exportMenu.classList.add('hidden');
    presetFlyout.classList.add('hidden');
  });
  [exportMenu, presetFlyout].forEach(el => el.addEventListener('click', e => e.stopPropagation()));

  // Modal fmt tabs
  document.getElementById('modalFmtTabs').querySelectorAll('.mfmt').forEach(tab => {
    tab.addEventListener('click', () => {
      modalFmt = tab.dataset.fmt;
      syncModalTabs();
      renderModalCode();
    });
  });
  function syncModalTabs() {
    document.querySelectorAll('.mfmt').forEach(t => t.classList.toggle('active', t.dataset.fmt === modalFmt));
  }

  // Modal copy
  document.getElementById('modalCopy').addEventListener('click', () => {
    const { text } = getRaw(modalFmt);
    navigator.clipboard.writeText(text).then(() => showToast('Copied!'));
  });

  // Modal download
  document.getElementById('modalDownload').addEventListener('click', () => {
    const { text, ext } = getRaw(modalFmt);
    const blob = new Blob([text], { type:'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `colorforge-theme.${ext}`; a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded!');
  });

  // Modal close
  document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('exportModal').classList.add('hidden');
  });
  document.getElementById('exportModal').addEventListener('click', function(e) {
    if (e.target === this) this.classList.add('hidden');
  });

  // Auto-variant toggles
  document.querySelectorAll('.auto-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      autoVariant[key] = !autoVariant[key];
      if (autoVariant[key]) {
        const src = key === 'primaryVariant' ? 'primary' : 'secondary';
        matTheme[key] = calcVariant(matTheme[src]);
      }
      renderAll();
    });
  });

  // Initial render
  renderAll();
});