const RPG_CLASSES = {
  "JavaScript": "DOM Necromancer",
  "TypeScript": "Type Archmage",
  "Python": "AI Alchemist",
  "C#": "Cyber Paladin",
  "Java": "Enterprise Templar",
  "C++": "Memory Warlock",
  "C": "Pointer Monk",
  "Go": "Concurrency Ranger",
  "Rust": "Borrow Checker Knight",
  "PHP": "Legacy Sorcerer",
  "Ruby": "Gem Enchanter",
  "Swift": "iOS Valkyrie",
  "Kotlin": "Null-Safety Druid",
  "HTML": "Markup Bard",
  "CSS": "Style Illusionist",
  "Shell": "Terminal Assassin",
  "default": "Code Mercenary"
};

const THEMES = {
  cyberpunk: {
    bg1: "#070312",
    bg2: "#14082e",
    grid: "rgba(0, 240, 255, 0.05)",
    border: "#00f0ff",
    accent: "#ff0055",
    text: "#ffffff",
    muted: "#7c82a8",
    subtext: "#00f0ff",
    panelBg: "#110926",
    barBg: "#1d1138",
    atk: "#ff0055",
    def: "#00f0ff",
    chm: "#fcee09"
  },
  matrix: {
    bg1: "#020804",
    bg2: "#07170b",
    grid: "rgba(0, 255, 65, 0.05)",
    border: "#00ff41",
    accent: "#00cc33",
    text: "#e6ffe6",
    muted: "#4d8859",
    subtext: "#00ff41",
    panelBg: "#051208",
    barBg: "#0b2410",
    atk: "#00ff41",
    def: "#39ff14",
    chm: "#a3ffb4"
  },
  dracula: {
    bg1: "#16171f",
    bg2: "#242636",
    grid: "rgba(189, 147, 249, 0.05)",
    border: "#bd93f9",
    accent: "#ff79c6",
    text: "#f8f8f2",
    muted: "#757c9c",
    subtext: "#8be9fd",
    panelBg: "#1d1e2b",
    barBg: "#31344a",
    atk: "#ff5555",
    def: "#8be9fd",
    chm: "#f1fa8c"
  }
};

function escapeXml(unsafe) {
  return String(unsafe || "").replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

async function fetchAvatarAsBase64(avatarUrl) {
  try {
    const response = await fetch(avatarUrl);
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const contentType = response.headers.get("content-type") || "image/png";
    return `data:${contentType};base64,${btoa(binary)}`;
  } catch {
    return "";
  }
}

function calculateStats(user, repos) {
  const langCounts = {};
  let topLang = "default";
  let maxCount = 0;

  if (Array.isArray(repos)) {
    for (const repo of repos) {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
        if (langCounts[repo.language] > maxCount) {
          maxCount = langCounts[repo.language];
          topLang = repo.language;
        }
      }
    }
  }

  const rpgClass = RPG_CLASSES[topLang] || RPG_CLASSES["default"];
  const createdDate = new Date(user.created_at);
  const now = new Date();
  const yearsActive = Math.max(1, (now - createdDate) / (1000 * 60 * 60 * 24 * 365.25));

  const atk = Math.min(99, Math.max(12, Math.round(12 + (user.public_repos * 1.8))));
  const def = Math.min(99, Math.max(15, Math.round(15 + (yearsActive * 8.9))));
  const chm = Math.min(99, Math.max(12, Math.round(12 + (Math.log10(user.followers + 1) * 35))));
  const ovr = Math.min(99, Math.round((atk * 0.4) + (def * 0.35) + (chm * 0.25)));
  const level = Math.min(99, Math.max(1, Math.floor(yearsActive + (user.public_repos / 4))));

  let tier = "C-TIER";
  if (ovr >= 85) tier = "S-TIER";
  else if (ovr >= 70) tier = "A-TIER";
  else if (ovr >= 50) tier = "B-TIER";

  return {
    username: user.login,
    name: user.name || user.login,
    rpgClass,
    topLang: topLang === "default" ? "POLYGLOT" : topLang.toUpperCase(),
    level,
    tier,
    stats: { atk, def, chm, ovr }
  };
}

function renderSVG(data, avatarBase64, themeName) {
  const t = THEMES[themeName] || THEMES.cyberpunk;
  const maxBar = 230;
  const atkW = Math.round((data.stats.atk / 99) * maxBar);
  const defW = Math.round((data.stats.def / 99) * maxBar);
  const chmW = Math.round((data.stats.chm / 99) * maxBar);

  return `<svg width="460" height="205" viewBox="0 0 460 205" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.bg1}" />
      <stop offset="100%" stop-color="${t.bg2}" />
    </linearGradient>
    <pattern id="cyberGrid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${t.grid}" stroke-width="1"/>
    </pattern>
    <pattern id="barTicks" width="10" height="10" patternUnits="userSpaceOnUse">
      <line x1="10" y1="0" x2="10" y2="10" stroke="${t.bg1}" stroke-width="2" />
    </pattern>
    <clipPath id="avatarClip">
      <rect x="24" y="24" width="84" height="84" rx="12" />
    </clipPath>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <style>
      .sans { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
      .mono { font-family: 'Consolas', 'Courier New', monospace; }
      .name { font-size: 19px; font-weight: 900; fill: ${t.text}; letter-spacing: 0.4px; }
      .class-badge { font-size: 10px; font-weight: 800; fill: ${t.subtext}; letter-spacing: 1.4px; }
      .stat-title { font-size: 10px; font-weight: 800; fill: ${t.text}; letter-spacing: 0.8px; }
      .stat-sub { font-size: 9px; font-weight: 700; fill: ${t.muted}; }
      .stat-val { font-size: 11px; font-weight: 900; fill: ${t.text}; }
      .ovr-num { font-size: 23px; font-weight: 900; fill: ${t.text}; }
      .ovr-lbl { font-size: 8px; font-weight: 800; fill: ${t.subtext}; letter-spacing: 1.5px; }
      .tier-lbl { font-size: 8px; font-weight: 900; fill: #ffffff; letter-spacing: 1px; }
      .anim-bar { animation: fillBar 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform-origin: left; transform: scaleX(0); }
      @keyframes fillBar { to { transform: scaleX(1); } }
    </style>
  </defs>

  <rect x="2" y="2" width="456" height="201" rx="14" fill="url(#bgGrad)" />
  <rect x="2" y="2" width="456" height="201" rx="14" fill="url(#cyberGrid)" />
  <rect x="2" y="2" width="456" height="201" rx="14" stroke="${t.border}" stroke-width="1.5" stroke-opacity="0.65" />

  <path d="M 2 28 L 2 14 Q 2 2 14 2 L 32 2" stroke="${t.border}" stroke-width="3" fill="none" />
  <path d="M 428 2 L 446 2 Q 458 2 458 14 L 458 28" stroke="${t.accent}" stroke-width="3" fill="none" />
  <path d="M 2 177 L 2 191 Q 2 203 14 203 L 32 203" stroke="${t.accent}" stroke-width="3" fill="none" />
  <path d="M 428 203 L 446 203 Q 458 203 458 191 L 458 177" stroke="${t.border}" stroke-width="3" fill="none" />

  <rect x="21" y="21" width="90" height="90" rx="15" fill="${t.panelBg}" stroke="${t.border}" stroke-width="2" />
  ${avatarBase64 ? `<image x="24" y="24" width="84" height="84" href="${avatarBase64}" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice" />` : ""}
  <circle cx="103" cy="103" r="5" fill="${t.atk}" stroke="${t.bg1}" stroke-width="2" />

  <rect x="21" y="122" width="90" height="24" rx="6" fill="${t.panelBg}" stroke="${t.accent}" stroke-width="1.5" />
  <text x="66" y="138" text-anchor="middle" class="mono" fill="${t.text}" font-size="11" font-weight="900">LVL ${data.level}</text>

  <rect x="21" y="153" width="90" height="26" rx="6" fill="${t.panelBg}" stroke="${t.barBg}" stroke-width="1" />
  <text x="66" y="169" text-anchor="middle" class="mono" fill="${t.muted}" font-size="9" font-weight="700">@${escapeXml(data.username.substring(0, 11))}</text>

  <text x="128" y="41" class="sans name">${escapeXml(data.name.substring(0, 17))}</text>
  
  <rect x="128" y="49" width="136" height="19" rx="4" fill="${t.panelBg}" stroke="${t.border}" stroke-width="0.8" stroke-opacity="0.5" />
  <text x="196" y="62" text-anchor="middle" class="mono class-badge">${escapeXml(data.rpgClass)}</text>

  <rect x="270" y="49" width="88" height="19" rx="4" fill="${t.panelBg}" stroke="${t.accent}" stroke-width="0.8" stroke-opacity="0.6" />
  <text x="314" y="62" text-anchor="middle" class="mono" fill="${t.text}" font-size="9" font-weight="800">WPN: ${escapeXml(data.topLang.substring(0, 7))}</text>

  <polygon points="409,16 441,31 441,66 409,81 377,66 377,31" fill="${t.panelBg}" stroke="${t.border}" stroke-width="2" />
  <text x="409" y="34" text-anchor="middle" class="mono ovr-lbl">OVR</text>
  <text x="409" y="57" text-anchor="middle" class="mono ovr-num">${data.stats.ovr}</text>
  <rect x="387" y="63" width="44" height="13" rx="3" fill="${t.accent}" />
  <text x="409" y="72" text-anchor="middle" class="mono tier-lbl">${data.tier}</text>

  <text x="128" y="96" class="mono stat-title">ATK <tspan class="stat-sub">// REPOS</tspan></text>
  <text x="438" y="96" text-anchor="end" class="mono stat-val">${data.stats.atk}<tspan fill="${t.muted}">/99</tspan></text>
  <rect x="128" y="102" width="${maxBar}" height="9" rx="3" fill="${t.barBg}" />
  <rect x="128" y="102" width="${atkW}" height="9" rx="3" fill="${t.atk}" class="anim-bar" filter="url(#glow)" />
  <rect x="128" y="102" width="${maxBar}" height="9" rx="3" fill="url(#barTicks)" />

  <text x="128" y="133" class="mono stat-title">DEF <tspan class="stat-sub">// YEARS EXP</tspan></text>
  <text x="438" y="133" text-anchor="end" class="mono stat-val">${data.stats.def}<tspan fill="${t.muted}">/99</tspan></text>
  <rect x="128" y="139" width="${maxBar}" height="9" rx="3" fill="${t.barBg}" />
  <rect x="128" y="139" width="${defW}" height="9" rx="3" fill="${t.def}" class="anim-bar" filter="url(#glow)" />
  <rect x="128" y="139" width="${maxBar}" height="9" rx="3" fill="url(#barTicks)" />

  <text x="128" y="170" class="mono stat-title">CHM <tspan class="stat-sub">// FOLLOWERS</tspan></text>
  <text x="438" y="170" text-anchor="end" class="mono stat-val">${data.stats.chm}<tspan fill="${t.muted}">/99</tspan></text>
  <rect x="128" y="176" width="${maxBar}" height="9" rx="3" fill="${t.barBg}" />
  <rect x="128" y="176" width="${chmW}" height="9" rx="3" fill="${t.chm}" class="anim-bar" filter="url(#glow)" />
  <rect x="128" y="176" width="${maxBar}" height="9" rx="3" fill="url(#barTicks)" />
</svg>`;
}

function renderLandingPage(origin) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GitHub Dev RPG Card — Dynamic README Generator</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #06070c;
      background-image: 
        radial-gradient(at 15% 15%, rgba(0, 240, 255, 0.12) 0px, transparent 45%),
        radial-gradient(at 85% 85%, rgba(255, 0, 85, 0.12) 0px, transparent 45%);
      color: #f8f8f2;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 45px 20px;
    }
    .container {
      max-width: 820px;
      width: 100%;
    }
    .hero {
      text-align: center;
      margin-bottom: 32px;
    }
    .badge {
      display: inline-block;
      background: rgba(0, 240, 255, 0.1);
      border: 1px solid rgba(0, 240, 255, 0.4);
      color: #00f0ff;
      font-family: monospace;
      font-size: 11px;
      font-weight: 700;
      padding: 5px 12px;
      border-radius: 99px;
      letter-spacing: 1.5px;
      margin-bottom: 12px;
      text-transform: uppercase;
    }
    h1 {
      font-size: 38px;
      font-weight: 900;
      letter-spacing: -0.5px;
      background: linear-gradient(90deg, #ffffff, #00f0ff, #ff0055);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #8b92b8;
      font-size: 16px;
      max-width: 540px;
      margin: 0 auto;
      line-height: 1.5;
    }
    .panel {
      background: rgba(16, 18, 30, 0.85);
      backdrop-filter: blur(14px);
      border: 1px solid #232742;
      border-radius: 18px;
      padding: 28px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      margin-bottom: 24px;
    }
    .controls {
      display: grid;
      grid-template-columns: 1fr 170px 140px;
      gap: 12px;
      margin-bottom: 24px;
    }
    @media (max-width: 640px) {
      .controls { grid-template-columns: 1fr; }
    }
    input, select, button {
      padding: 13px 16px;
      border-radius: 10px;
      border: 1px solid #2e3458;
      background: #090b14;
      color: #fff;
      font-size: 14px;
      outline: none;
      transition: all 0.2s;
    }
    input:focus, select:focus {
      border-color: #00f0ff;
      box-shadow: 0 0 0 3px rgba(0, 240, 255, 0.15);
    }
    .gen-btn {
      background: linear-gradient(135deg, #ff0055, #c80044);
      border: none;
      font-weight: 800;
      letter-spacing: 0.5px;
      cursor: pointer;
      text-transform: uppercase;
    }
    .gen-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 0, 85, 0.35);
    }
    .preview-stage {
      background: radial-gradient(circle at center, #141829 0%, #090a12 100%);
      border: 1px dashed #2e3458;
      border-radius: 14px;
      padding: 28px 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 22px;
      min-height: 245px;
      position: relative;
    }
    .preview-stage img {
      max-width: 100%;
      height: auto;
      filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.65));
    }
    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 12px;
      font-weight: 700;
      color: #8b92b8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .code-box {
      display: flex;
      gap: 10px;
      align-items: center;
      background: #070810;
      border: 1px solid #232742;
      border-radius: 10px;
      padding: 10px 14px;
    }
    .code-text {
      flex: 1;
      font-family: 'Consolas', monospace;
      font-size: 13px;
      color: #00f0ff;
      word-break: break-all;
    }
    .copy-btn {
      background: #00f0ff;
      color: #070810;
      border: none;
      font-weight: 800;
      padding: 10px 18px;
      border-radius: 8px;
      cursor: pointer;
      white-space: nowrap;
    }
    .copy-btn:hover { opacity: 0.9; }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    @media (max-width: 720px) {
      .grid-2 { grid-template-columns: 1fr; }
    }
    .info-card {
      background: rgba(16, 18, 30, 0.7);
      border: 1px solid #232742;
      border-radius: 14px;
      padding: 22px;
    }
    .info-card h3 {
      font-size: 16px;
      color: #00f0ff;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .stat-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .stat-list li {
      font-size: 13.5px;
      color: #b4bae0;
      line-height: 1.45;
    }
    .stat-tag {
      display: inline-block;
      font-family: monospace;
      font-weight: 800;
      font-size: 11px;
      padding: 2px 7px;
      border-radius: 4px;
      margin-right: 6px;
      color: #fff;
    }
    .tag-atk { background: #ff0055; }
    .tag-def { background: #0099ff; }
    .tag-chm { background: #d4af37; }
    .tag-cls { background: #9d4edd; }
    .steps li {
      margin-bottom: 11px;
      font-size: 13.5px;
      color: #b4bae0;
      line-height: 1.5;
      list-style-position: inside;
    }
    code.inline {
      background: #1a1e36;
      color: #ff79c6;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="badge">⚡ Serverless SVG HUD Generator</div>
      <h1>GitHub Dev RPG Card</h1>
      <p class="subtitle">Turn your GitHub activity, repositories, and top programming language into a cyberpunk RPG character sheet for your profile README.</p>
    </div>

    <div class="panel">
      <div class="controls">
        <input type="text" id="username" placeholder="Enter GitHub username (e.g. torvalds)" value="ZephyrProtogen" />
        <select id="theme" onchange="generateCard()">
          <option value="cyberpunk">⚡ Cyberpunk</option>
          <option value="dracula">🧛 Dracula</option>
          <option value="matrix">🟢 Matrix</option>
        </select>
        <button class="gen-btn" onclick="generateCard()">Generate</button>
      </div>

      <div class="preview-stage">
        <img id="card-img" src="${origin}/?username=ZephyrProtogen&theme=cyberpunk" alt="GitHub RPG Card Preview" />
      </div>

      <div class="code-header">
        <span>Markdown Snippet (Paste into your README.md)</span>
      </div>
      <div class="code-box">
        <div class="code-text" id="md-code">![GitHub RPG Card](${origin}/?username=ZephyrProtogen&theme=cyberpunk)</div>
        <button class="copy-btn" id="copy-btn" onclick="copyMarkdown()">Copy Code</button>
      </div>
    </div>

    <div class="grid-2">
      <div class="info-card">
        <h3>📊 RPG Stat Mechanics</h3>
        <ul class="stat-list">
          <li><span class="stat-tag tag-atk">ATK</span> <strong>Attack Power:</strong> Scales with your total number of public repositories (~50 repos = Max 99 ATK).</li>
          <li><span class="stat-tag tag-def">DEF</span> <strong>Defense & Resilience:</strong> Calculated from your GitHub account age in years (~10 years = Max 99 DEF).</li>
          <li><span class="stat-tag tag-chm">CHM</span> <strong>Charisma & Fame:</strong> Logarithmic scale based on your GitHub followers count.</li>
          <li><span class="stat-tag tag-cls">CLASS & WPN</span> <strong>Hero Class & Weapon:</strong> Automatically forged from the dominant language across your 30 most recent repositories.</li>
        </ul>
      </div>

      <div class="info-card">
        <h3>🚀 Quick Setup Tutorial</h3>
        <ol class="steps">
          <li>Type your <strong>GitHub Username</strong> above and pick a HUD theme (<code class="inline">cyberpunk</code>, <code class="inline">dracula</code>, or <code class="inline">matrix</code>).</li>
          <li>Click <strong>Copy Code</strong> to grab your personalized Markdown image tag.</li>
          <li>Open your special GitHub profile repository (named <code class="inline">your-username/your-username</code>).</li>
          <li>Paste the snippet into your <code class="inline">README.md</code> file and commit changes — your live RPG card is now equipped!</li>
        </ol>
      </div>
    </div>
  </div>

  <script>
    const origin = "${origin}";
    function generateCard() {
      const user = document.getElementById('username').value.trim();
      const theme = document.getElementById('theme').value;
      if (!user) return alert('Please enter a GitHub username!');
      
      const cardUrl = origin + '/?username=' + encodeURIComponent(user) + '&theme=' + theme;
      document.getElementById('card-img').src = cardUrl;
      document.getElementById('md-code').innerText = '![GitHub RPG Card](' + cardUrl + ')';
    }

    function copyMarkdown() {
      const code = document.getElementById('md-code').innerText;
      navigator.clipboard.writeText(code);
      const btn = document.getElementById('copy-btn');
      btn.innerText = '✓ Copied!';
      setTimeout(() => { btn.innerText = 'Copy Code'; }, 2000);
    }

    document.getElementById('username').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') generateCard();
    });
  </script>
</body>
</html>`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const username = url.searchParams.get("username");
    const theme = (url.searchParams.get("theme") || env.DEFAULT_THEME || "cyberpunk").toLowerCase();

    if (!username) {
      return new Response(renderLandingPage(url.origin), {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    let response = await cache.match(cacheKey);

    if (response) {
      return response;
    }

    const headers = {
      "User-Agent": "Cloudflare-Worker-GitHub-RPG-Card",
      "Accept": "application/vnd.github.v3+json"
    };

    if (env.GH_TOKEN) {
      headers["Authorization"] = `Bearer ${env.GH_TOKEN}`;
    }

    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers }),
        fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=30&sort=pushed`, { headers })
      ]);

      if (!userRes.ok) {
        return new Response(`GitHub API Error: ${userRes.status}`, { status: userRes.status });
      }

      const userData = await userRes.json();
      const reposData = reposRes.ok ? await reposRes.json() : [];

      const rpgData = calculateStats(userData, reposData);
      const avatarBase64 = await fetchAvatarAsBase64(userData.avatar_url);
      const svg = renderSVG(rpgData, avatarBase64, theme);

      response = new Response(svg, {
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": "public, max-age=14400, s-maxage=7200"
        }
      });

      ctx.waitUntil(cache.put(cacheKey, response.clone()));

      return response;
    } catch (error) {
      return new Response(`Server Error: ${error.message}`, { status: 500 });
    }
  }
};