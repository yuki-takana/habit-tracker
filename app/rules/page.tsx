// app/rules/page.tsx  or  components/RulesPage.tsx
"use client"

export default function RulesPage() {
    const html =`
            
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#09090b;color:#e4e4e7;font-family:system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.65}
a{color:#818cf8;text-decoration:none}

.layout{display:grid;grid-template-columns:220px 1fr;min-height:100vh;max-width:1100px;margin:0 auto;gap:0}
@media(max-width:700px){.layout{grid-template-columns:1fr}}

.sidebar{padding:32px 16px 32px 0;position:sticky;top:0;height:100vh;overflow-y:auto;border-right:1px solid #27272a}
@media(max-width:700px){.sidebar{display:none}}
.sidebar::-webkit-scrollbar{width:4px}.sidebar::-webkit-scrollbar-track{background:transparent}.sidebar::-webkit-scrollbar-thumb{background:#27272a;border-radius:2px}

.s-title{font-size:9px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#3f3f46;padding:0 12px;margin-bottom:10px}
.s-link{display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:8px;font-size:12px;font-weight:600;color:#71717a;cursor:pointer;transition:background .15s,color .15s;margin-bottom:1px}
.s-link:hover{background:#18181b;color:#e4e4e7}
.s-link.active{background:#1e1b4b;color:#818cf8}
.s-dot{width:5px;height:5px;border-radius:50%;background:#27272a;flex-shrink:0;transition:background .15s}
.s-link.active .s-dot{background:#6366f1}
.s-divider{height:1px;background:#1a1a1a;margin:10px 12px}

.content{padding:40px 32px 80px;overflow:hidden}
@media(max-width:700px){.content{padding:24px 16px 60px}}

.page-header{margin-bottom:48px;padding-bottom:32px;border-bottom:1px solid #27272a}
.version-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:9999px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.25);color:#818cf8;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin-bottom:16px}
.vdot{width:6px;height:6px;border-radius:50%;background:#6366f1;position:relative}
.vdot::before{content:'';position:absolute;inset:0;border-radius:50%;background:#6366f1;animation:vpulse 2s ease infinite}
@keyframes vpulse{0%{opacity:.8;transform:scale(1)}70%{opacity:0;transform:scale(2.2)}100%{opacity:0}}
.page-title{font-size:clamp(28px,4vw,44px);font-weight:900;letter-spacing:-.03em;text-transform:uppercase;line-height:.95;color:#fff;margin-bottom:12px}
.page-title span{color:#6366f1}
.page-desc{font-size:14px;color:#52525b;max-width:560px;line-height:1.7;font-weight:500}
.meta-row{display:flex;gap:20px;margin-top:20px;flex-wrap:wrap}
.meta-chip{padding:5px 12px;border-radius:8px;background:#18181b;border:1px solid #27272a;font-size:11px;font-weight:700;color:#52525b;letter-spacing:.05em}
.meta-chip span{color:#a1a1aa}

.section{margin-bottom:52px;scroll-margin-top:24px}
.sec-header{display:flex;align-items:center;gap:12px;margin-bottom:20px}
.sec-num{width:28px;height:28px;border-radius:8px;background:#1e1b4b;border:1px solid rgba(99,102,241,.25);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#818cf8;flex-shrink:0}
.sec-title{font-size:18px;font-weight:900;letter-spacing:-.02em;text-transform:uppercase;color:#fff}
.sec-sub{font-size:12px;color:#3f3f46;font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin-left:4px}
.sec-divider{height:1px;background:#1a1a1a;margin-bottom:20px}

.sec-lead{font-size:13px;color:#71717a;line-height:1.75;margin-bottom:20px;padding:14px 16px;background:#111113;border-left:2px solid #6366f1;border-radius:0 8px 8px 0}

h3.rule-head{font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#a1a1aa;margin:24px 0 12px;display:flex;align-items:center;gap:8px}
h3.rule-head::after{content:'';flex:1;height:1px;background:#1a1a1a}

.rule-table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px}
.rule-table th{padding:8px 12px;text-align:left;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#3f3f46;border-bottom:1px solid #1f1f1f;background:#0d0d0f}
.rule-table td{padding:9px 12px;border-bottom:1px solid #161618;color:#a1a1aa;vertical-align:top}
.rule-table tr:last-child td{border-bottom:none}
.rule-table tr:hover td{background:#111113;color:#e4e4e7}
.td-earn{color:#34d399;font-weight:700}
.td-lose{color:#f87171;font-weight:700}
.td-neutral{color:#818cf8;font-weight:700}
.td-bold{color:#e4e4e7;font-weight:700}

.xp-badge{display:inline-flex;align-items:center;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:800}
.xp-earn{background:rgba(52,211,153,.1);color:#34d399;border:1px solid rgba(52,211,153,.2)}
.xp-lose{background:rgba(248,113,113,.1);color:#f87171;border:1px solid rgba(248,113,113,.2)}
.xp-note{background:rgba(99,102,241,.1);color:#818cf8;border:1px solid rgba(99,102,241,.2)}

.code-block{background:#0a0a0c;border:1px solid #1f1f22;border-radius:12px;padding:16px 18px;font-family:'SF Mono',ui-monospace,monospace;font-size:11px;line-height:1.8;color:#8892a4;margin-bottom:16px;overflow-x:auto}
.code-block .kw{color:#818cf8}
.code-block .fn{color:#34d399}
.code-block .str{color:#fbbf24}
.code-block .cm{color:#3f3f46}
.code-block .num{color:#f97316}

.rule-card{background:#111113;border:1px solid #1f1f22;border-radius:14px;padding:16px 18px;margin-bottom:12px}
.rc-head{font-size:11px;font-weight:800;color:#e4e4e7;margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em}
.rc-body{font-size:12px;color:#52525b;line-height:1.7}
.rc-body strong{color:#a1a1aa;font-weight:700}

.level-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;margin-bottom:16px}
.level-card{background:#111113;border:1px solid #1f1f22;border-radius:12px;padding:14px 16px;transition:border-color .2s}
.level-card:hover{border-color:#27272a}
.lc-num{font-size:22px;font-weight:900;color:#6366f1;line-height:1;margin-bottom:4px}
.lc-name{font-size:12px;font-weight:700;color:#e4e4e7;margin-bottom:2px}
.lc-xp{font-size:10px;color:#3f3f46;font-weight:600}
.lc-perk{font-size:10px;color:#52525b;margin-top:6px;padding-top:6px;border-top:1px solid #1a1a1a;line-height:1.5}

.streak-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-bottom:16px}
.streak-card{background:#111113;border:1px solid #1f1f22;border-radius:12px;padding:14px;text-align:center}
.sc-days{font-size:20px;font-weight:900;color:#fbbf24;line-height:1;margin-bottom:4px}
.sc-xp{font-size:11px;font-weight:700;color:#34d399;margin-bottom:4px}
.sc-reward{font-size:10px;color:#52525b;line-height:1.4}

.tree-stages{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:16px}
@media(max-width:600px){.tree-stages{grid-template-columns:repeat(4,1fr)}}
.ts-card{background:#0d1a0e;border:1px solid #1a2e1b;border-radius:10px;padding:10px 8px;text-align:center}
.ts-icon{font-size:18px;margin-bottom:5px;display:block}
.ts-name{font-size:9px;font-weight:800;color:#3b6d11;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px}
.ts-cond{font-size:9px;color:#1f3020;line-height:1.4}

.health-row{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
@media(max-width:500px){.health-row{grid-template-columns:repeat(2,1fr)}}
.hr-card{border-radius:10px;padding:12px;text-align:center}
.hr-card.green{background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.15)}
.hr-card.yellow{background:rgba(251,191,36,.06);border:1px solid rgba(251,191,36,.15)}
.hr-card.orange{background:rgba(249,115,22,.06);border:1px solid rgba(249,115,22,.15)}
.hr-card.red{background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.15)}
.hr-pct{font-size:14px;font-weight:900;margin-bottom:3px}
.green .hr-pct{color:#34d399}.yellow .hr-pct{color:#fbbf24}.orange .hr-pct{color:#fb923c}.red .hr-pct{color:#f87171}
.hr-status{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px}
.green .hr-status{color:#34d399}.yellow .hr-status{color:#fbbf24}.orange .hr-status{color:#fb923c}.red .hr-status{color:#f87171}
.hr-effect{font-size:9px;color:#3f3f46;line-height:1.4}

.formula-box{background:#080a08;border:1px solid #1a2e1b;border-radius:12px;padding:16px 18px;margin-bottom:16px;font-family:'SF Mono',ui-monospace,monospace;font-size:11px;line-height:1.9;color:#5a8a2f;overflow-x:auto}
.formula-box .kw{color:#34d399}
.formula-box .cm{color:#1f3020}
.formula-box .num{color:#7db544}

.shield-grid{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}
.shield-src{background:#1a1a2e;border:1px solid rgba(99,102,241,.2);border-radius:10px;padding:10px 14px;font-size:11px;color:#818cf8;font-weight:700}
.shield-src span{color:#4f46e5;margin-right:6px;font-size:13px}

.notif-card{background:#111113;border:1px solid #1f1f22;border-radius:12px;padding:14px 16px;margin-bottom:8px;display:flex;gap:12px;align-items:flex-start}
.notif-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.notif-icon.indigo{background:rgba(99,102,241,.15)}
.notif-icon.amber{background:rgba(251,191,36,.1)}
.notif-icon.green{background:rgba(52,211,153,.1)}
.notif-icon.red{background:rgba(248,113,113,.1)}
.notif-text{font-size:12px;color:#71717a;line-height:1.6;font-style:italic;background:#0d0d0f;padding:8px 12px;border-radius:8px;border:1px solid #1a1a1a;flex:1}

.edge-table{width:100%;border-collapse:collapse;font-size:11px}
.edge-table th{padding:7px 10px;text-align:left;font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#3f3f46;border-bottom:1px solid #1f1f1f;background:#0d0d0f}
.edge-table td{padding:8px 10px;border-bottom:1px solid #161618;color:#52525b;vertical-align:top}
.edge-table tr:last-child td{border-bottom:none}
.edge-table .scenario{color:#a1a1aa;font-weight:600}

.floor-callout{background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.15);border-radius:12px;padding:14px 16px;margin-bottom:16px;display:flex;gap:10px;align-items:flex-start}
.floor-icon{flex-shrink:0;margin-top:1px}
.floor-text{font-size:12px;color:#f87171;line-height:1.65}
.floor-text strong{font-weight:800}

.callout-green{background:rgba(52,211,153,.05);border:1px solid rgba(52,211,153,.12);border-radius:12px;padding:14px 16px;margin-bottom:16px;font-size:12px;color:#34d399;line-height:1.65}
.callout-indigo{background:rgba(99,102,241,.06);border:1px solid rgba(99,102,241,.18);border-radius:12px;padding:14px 16px;margin-bottom:16px;font-size:12px;color:#818cf8;line-height:1.65}

.xp-calc{background:#111113;border:1px solid #1f1f22;border-radius:14px;padding:20px;margin-bottom:16px}
.calc-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.calc-label{font-size:11px;font-weight:700;color:#52525b;min-width:160px;text-transform:uppercase;letter-spacing:.06em}
.calc-input{background:#0d0d0f;border:1px solid #27272a;border-radius:8px;padding:6px 10px;font-size:12px;color:#e4e4e7;width:70px;text-align:right;font-family:monospace}
.calc-input:focus{outline:none;border-color:#6366f1}
.calc-result{background:#0a0a0c;border-top:1px solid #1f1f22;padding-top:14px;margin-top:6px;display:flex;justify-content:space-between;align-items:center}
.calc-total-label{font-size:11px;color:#3f3f46;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
.calc-total{font-size:24px;font-weight:900;color:#6366f1}
.calc-breakdown{font-size:10px;color:#3f3f46;margin-top:4px}

.type-table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:16px}
.type-table th{padding:7px 12px;text-align:left;font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#3f3f46;border-bottom:1px solid #1f1f1f;background:#0d0d0f}
.type-table td{padding:8px 12px;border-bottom:1px solid #161618;color:#a1a1aa;vertical-align:top}
.type-table tr:last-child td{border-bottom:none}
</style>

<div class="layout">

<nav class="sidebar">
  <div class="s-title">Game rules</div>
  <div class="s-link active" onclick="scrollTo('s1',this)"><div class="s-dot"></div>Philosophy</div>
  <div class="s-link" onclick="scrollTo('s2',this)"><div class="s-dot"></div>XP — earning</div>
  <div class="s-link" onclick="scrollTo('s3',this)"><div class="s-dot"></div>XP — deductions</div>
  <div class="s-link" onclick="scrollTo('s4',this)"><div class="s-dot"></div>XP formulas</div>
  <div class="s-link" onclick="scrollTo('s5',this)"><div class="s-dot"></div>XP calculator</div>
  <div class="s-divider"></div>
  <div class="s-title">Progression</div>
  <div class="s-link" onclick="scrollTo('s6',this)"><div class="s-dot"></div>Level system</div>
  <div class="s-link" onclick="scrollTo('s7',this)"><div class="s-dot"></div>Streak system</div>
  <div class="s-link" onclick="scrollTo('s8',this)"><div class="s-dot"></div>Streak shields</div>
  <div class="s-divider"></div>
  <div class="s-title">Trees & forest</div>
  <div class="s-link" onclick="scrollTo('s9',this)"><div class="s-dot"></div>Tree growth</div>
  <div class="s-link" onclick="scrollTo('s10',this)"><div class="s-dot"></div>Tree health</div>
  <div class="s-link" onclick="scrollTo('s11',this)"><div class="s-dot"></div>Ghost trees</div>
  <div class="s-link" onclick="scrollTo('s12',this)"><div class="s-dot"></div>Forest system</div>
  <div class="s-divider"></div>
  <div class="s-title">System rules</div>
  <div class="s-link" onclick="scrollTo('s13',this)"><div class="s-dot"></div>AI agent rules</div>
  <div class="s-link" onclick="scrollTo('s14',this)"><div class="s-dot"></div>Weekly boss</div>
  <div class="s-link" onclick="scrollTo('s15',this)"><div class="s-dot"></div>Notifications</div>
  <div class="s-link" onclick="scrollTo('s16',this)"><div class="s-dot"></div>Anti-gaming</div>
  <div class="s-link" onclick="scrollTo('s17',this)"><div class="s-dot"></div>Edge cases</div>
</nav>

<main class="content">

  <div class="page-header">
    <div class="version-badge"><div class="vdot"></div>v1.0.0 — canonical</div>
    <div class="page-title">Habit tracker<br><span>Rule system</span></div>
    <p class="page-desc">The definitive ruleset governing XP, levels, streaks, trees, shields, and the forest. All game logic must implement exactly these rules.</p>
    <div class="meta-row">
      <div class="meta-chip">Status <span>Canonical</span></div>
      <div class="meta-chip">Version <span>1.0.0</span></div>
      <div class="meta-chip">Sections <span>17</span></div>
      <div class="meta-chip">Author <span>Abhishek</span></div>
    </div>
  </div>

  <div class="section" id="s1">
    <div class="sec-header">
      <div class="sec-num">01</div>
      <div>
        <div class="sec-title">Core philosophy</div>
      </div>
    </div>
    <div class="sec-divider"></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">
      <div class="rule-card"><div class="rc-head">Progress always feels possible</div><div class="rc-body">Even on bad days, the user earns something. No zero days.</div></div>
      <div class="rule-card"><div class="rc-head">Loss stings but never breaks</div><div class="rc-body">Penalties exist and are real. But the floor is always <strong>0 XP</strong> — never negative.</div></div>
      <div class="rule-card"><div class="rc-head">Consistency beats perfection</div><div class="rc-body">A 60% completion day still counts as a streak day. Sustainability over 100% grind.</div></div>
    </div>
  </div>

  <div class="section" id="s2">
    <div class="sec-header">
      <div class="sec-num">02</div>
      <div><div class="sec-title">XP — earning</div></div>
    </div>
    <div class="sec-divider"></div>

    <h3 class="rule-head">Base todo completion</h3>
    <table class="rule-table">
      <tr><th>Action</th><th>XP</th><th>Notes</th></tr>
      <tr><td>Complete todo before deadline</td><td><span class="xp-badge xp-earn">+10 XP</span></td><td style="color:#3f3f46">Base rate for all todos</td></tr>
      <tr><td>Complete todo early (≥ 2 hrs before deadline)</td><td><span class="xp-badge xp-earn">+15 XP</span></td><td style="color:#3f3f46">Replaces base +10, not additive</td></tr>
      <tr><td>Complete AI-generated todo</td><td><span class="xp-badge xp-earn">+12 XP</span></td><td style="color:#3f3f46">+2 bonus vs user-added todos</td></tr>
      <tr><td>First todo of the day</td><td><span class="xp-badge xp-earn">+5 XP</span></td><td style="color:#3f3f46">Momentum bonus, stacks on top</td></tr>
      <tr><td>Complete all todos for the day</td><td><span class="xp-badge xp-earn">+25 XP</span></td><td style="color:#3f3f46">Perfect day bonus at midnight</td></tr>
      <tr><td>Perfect day + streak ≥ 7 days</td><td><span class="xp-badge xp-earn">+35 XP</span></td><td style="color:#3f3f46">Hot streak bonus replaces +25</td></tr>
      <tr><td>Daily login (app open)</td><td><span class="xp-badge xp-earn">+3 XP</span></td><td style="color:#3f3f46">Once per calendar day</td></tr>
      <tr><td>Reflection todo completed</td><td><span class="xp-badge xp-earn">+15 XP</span></td><td style="color:#3f3f46">AI-assigned once per 7 days</td></tr>
      <tr><td>Ghost tree revived</td><td><span class="xp-badge xp-earn">+80 XP</span></td><td style="color:#3f3f46">One-time per revival event</td></tr>
    </table>

    <h3 class="rule-head">Streak milestone bonuses</h3>
    <div class="streak-grid">
      <div class="streak-card"><div class="sc-days">3</div><div style="font-size:9px;color:#3f3f46;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">days</div><div class="sc-xp">+30 XP</div><div class="sc-reward">Bronze flame unlocked</div></div>
      <div class="streak-card"><div class="sc-days">7</div><div style="font-size:9px;color:#3f3f46;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">days</div><div class="sc-xp">+100 XP</div><div class="sc-reward">Silver flame + 1 shield</div></div>
      <div class="streak-card"><div class="sc-days">14</div><div style="font-size:9px;color:#3f3f46;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">days</div><div class="sc-xp">+200 XP</div><div class="sc-reward">Gold flame + 1 shield</div></div>
      <div class="streak-card"><div class="sc-days">30</div><div style="font-size:9px;color:#3f3f46;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">days</div><div class="sc-xp">+500 XP</div><div class="sc-reward">Diamond flame + rare tree skin</div></div>
      <div class="streak-card"><div class="sc-days">60</div><div style="font-size:9px;color:#3f3f46;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">days</div><div class="sc-xp">+750 XP</div><div class="sc-reward">Purple flame + animated skin</div></div>
      <div class="streak-card"><div class="sc-days">90</div><div style="font-size:9px;color:#3f3f46;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">days</div><div class="sc-xp">+1500 XP</div><div class="sc-reward">Legendary flame + badge</div></div>
    </div>
  </div>

  <div class="section" id="s3">
    <div class="sec-header">
      <div class="sec-num">03</div>
      <div><div class="sec-title">XP — deductions</div></div>
    </div>
    <div class="sec-divider"></div>

    <div class="floor-callout">
      <div class="floor-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#f87171" stroke-width="2" stroke-linecap="round"/></svg></div>
      <div class="floor-text"><strong>Floor rule:</strong> Total XP can never go below 0. If a deduction would push XP negative, clamp at 0. Levels never regress — once reached, always kept. XP loss only affects the current level's progress bar.</div>
    </div>

    <table class="rule-table">
      <tr><th>Action</th><th>Deduction</th><th>Notes</th></tr>
      <tr><td>Miss a single todo (deadline passed)</td><td><span class="xp-badge xp-lose">−5 XP</span></td><td style="color:#3f3f46">Per missed todo, not per day</td></tr>
      <tr><td>Miss all todos for the day</td><td><span class="xp-badge xp-lose">−20 XP</span></td><td style="color:#3f3f46">Replaces per-todo deductions</td></tr>
      <tr><td>Streak breaks (no shield)</td><td><span class="xp-badge xp-lose">−50 XP</span></td><td style="color:#3f3f46">Applied at midnight streak check</td></tr>
      <tr><td>Streak shield activated</td><td><span class="xp-badge xp-lose">−30 XP</span></td><td style="color:#3f3f46">Cost of protection, always applies</td></tr>
      <tr><td>Inactivity decay (after 7 days)</td><td><span class="xp-badge xp-lose">−5% / day</span></td><td style="color:#3f3f46">Starts day 8, compounds daily</td></tr>
    </table>
  </div>

  <div class="section" id="s4">
    <div class="sec-header">
      <div class="sec-num">04</div>
      <div><div class="sec-title">XP formulas</div></div>
    </div>
    <div class="sec-divider"></div>

    <h3 class="rule-head">Todo completion</h3>
    <div class="formula-box"><span class="cm">// Base XP calculation per todo</span>
<span class="kw">let</span> xp = todo.isAIGenerated ? <span class="num">12</span> : <span class="num">10</span>
xp += todo.isEarly ? <span class="num">5</span> : <span class="num">0</span>         <span class="cm">// early = ≥ 2hrs before deadline</span>
xp += isFirstOfDay ? <span class="num">5</span> : <span class="num">0</span>        <span class="cm">// momentum bonus</span>
xp *= user.level >= <span class="num">8</span> ? <span class="num">1.1</span> : <span class="num">1</span>  <span class="cm">// level 8+ multiplier</span>
xp *= user.level >= <span class="num">10</span> ? <span class="num">1.25</span> : xp <span class="cm">// level 10 multiplier</span></div>

    <h3 class="rule-head">Perfect day bonus</h3>
    <div class="formula-box"><span class="cm">// Evaluated at midnight per user timezone</span>
<span class="kw">const</span> rate = completedTodos / totalTodos
<span class="kw">if</span> (rate >= <span class="num">1.0</span>) {
  xp += user.streak >= <span class="num">7</span> ? <span class="num">35</span> : <span class="num">25</span>
}</div>

    <h3 class="rule-head">Deduction logic</h3>
    <div class="formula-box"><span class="cm">// Miss deduction</span>
<span class="kw">const</span> deduction = isMissedDay ? <span class="num">20</span> : missedTodos * <span class="num">5</span>
user.xp = Math.<span class="fn">max</span>(<span class="num">0</span>, user.xp - deduction)

<span class="cm">// Streak break</span>
<span class="kw">if</span> (streakBroken && shields === <span class="num">0</span>) {
  user.xp = Math.<span class="fn">max</span>(<span class="num">0</span>, user.xp - <span class="num">50</span>)
  user.streak = <span class="num">0</span>
}

<span class="cm">// Inactivity decay (server cron, runs nightly)</span>
<span class="kw">if</span> (inactiveDays > <span class="num">7</span>) {
  <span class="kw">const</span> decay = Math.<span class="fn">floor</span>(user.xp * <span class="num">0.05</span>)
  user.xp = Math.<span class="fn">max</span>(<span class="num">0</span>, user.xp - decay)
}</div>
  </div>

  <div class="section" id="s5">
    <div class="sec-header">
      <div class="sec-num">05</div>
      <div><div class="sec-title">XP calculator</div></div>
    </div>
    <div class="sec-divider"></div>
    <div class="sec-lead">Simulate a day's XP outcome based on your activity.</div>

    <div class="xp-calc">
      <div class="calc-row"><span class="calc-label">Todos completed</span><input class="calc-input" id="ci-done" type="number" min="0" max="10" value="3" oninput="calcXP()"></div>
      <div class="calc-row"><span class="calc-label">Total todos today</span><input class="calc-input" id="ci-total" type="number" min="1" max="10" value="5" oninput="calcXP()"></div>
      <div class="calc-row"><span class="calc-label">AI todos (of completed)</span><input class="calc-input" id="ci-ai" type="number" min="0" max="10" value="2" oninput="calcXP()"></div>
      <div class="calc-row"><span class="calc-label">Early completions</span><input class="calc-input" id="ci-early" type="number" min="0" max="10" value="1" oninput="calcXP()"></div>
      <div class="calc-row"><span class="calc-label">Current streak (days)</span><input class="calc-input" id="ci-streak" type="number" min="0" value="5" oninput="calcXP()"></div>
      <div class="calc-result">
        <div>
          <div class="calc-total-label">XP earned today</div>
          <div class="calc-breakdown" id="calc-breakdown"></div>
        </div>
        <div class="calc-total" id="calc-total">0</div>
      </div>
    </div>
  </div>

  <div class="section" id="s6">
    <div class="sec-header">
      <div class="sec-num">06</div>
      <div><div class="sec-title">Level system</div></div>
    </div>
    <div class="sec-divider"></div>
    <div class="callout-indigo">Levels never reset or regress. XP is cumulative lifetime. Losing XP only affects progress to the next level, not your current level number.</div>

    <div class="level-grid">
      <div class="level-card"><div class="lc-num">1</div><div class="lc-name">Seed</div><div class="lc-xp">0 XP</div><div class="lc-perk">App access granted</div></div>
      <div class="level-card"><div class="lc-num">2</div><div class="lc-name">Sprout</div><div class="lc-xp">150 XP</div><div class="lc-perk">Custom reminder times</div></div>
      <div class="level-card"><div class="lc-num">3</div><div class="lc-name">Sapling</div><div class="lc-xp">400 XP</div><div class="lc-perk">+1 shield slot, AI breakdown unlocked</div></div>
      <div class="level-card"><div class="lc-num">4</div><div class="lc-name">Branch</div><div class="lc-xp">800 XP</div><div class="lc-perk">Weekly boss challenge unlocked</div></div>
      <div class="level-card"><div class="lc-num">5</div><div class="lc-name">Tree</div><div class="lc-xp">1,400 XP</div><div class="lc-perk">+1 shield slot, custom tree skin</div></div>
      <div class="level-card"><div class="lc-num">6</div><div class="lc-name">Grove</div><div class="lc-xp">2,200 XP</div><div class="lc-perk">Forest view unlocked</div></div>
      <div class="level-card"><div class="lc-num">7</div><div class="lc-name">Forest</div><div class="lc-xp">3,400 XP</div><div class="lc-perk">Rare tree seeds, +1 forest slot</div></div>
      <div class="level-card"><div class="lc-num">8</div><div class="lc-name">Elder</div><div class="lc-xp">5,000 XP</div><div class="lc-perk">XP multiplier ×1.1 on all earns</div></div>
      <div class="level-card"><div class="lc-num">9</div><div class="lc-name">Ancient</div><div class="lc-xp">7,200 XP</div><div class="lc-perk">+1 shield slot</div></div>
      <div class="level-card" style="border-color:rgba(99,102,241,.3)"><div class="lc-num" style="color:#fbbf24">10</div><div class="lc-name" style="color:#fbbf24">Legend</div><div class="lc-xp">10,000 XP</div><div class="lc-perk" style="color:#52525b">XP multiplier ×1.25, legend badge, profile border</div></div>
    </div>

    <div class="callout-green">Level 8+ multiplier applies to XP <em>earned only</em> — penalties are always face value and are never reduced by the multiplier.</div>
  </div>

  <div class="section" id="s7">
    <div class="sec-header">
      <div class="sec-num">07</div>
      <div><div class="sec-title">Streak system</div></div>
    </div>
    <div class="sec-divider"></div>

    <h3 class="rule-head">What counts as a streak day</h3>
    <div class="formula-box"><span class="cm">// Evaluated at midnight in user's local timezone</span>
streakCounts = (completedTodos / totalTodos) >= <span class="num">0.60</span>

<span class="cm">// 60% threshold — not 100%
// Rewards consistency over perfection
// 0 todos set → day is neutral (streak neither advances nor breaks)</span></div>

    <h3 class="rule-head">Grace period rule</h3>
    <div class="rule-card">
      <div class="rc-head">One automatic grace per 30 days</div>
      <div class="rc-body">If the user misses a day but completes <strong>200% of normal todos the next day</strong>, the missed streak day is forgiven. Grace recharges 30 days after last use. No manual trigger — system detects automatically.</div>
    </div>

    <h3 class="rule-head">Streak reset conditions</h3>
    <table class="rule-table">
      <tr><th>Condition</th><th>Result</th></tr>
      <tr><td>Completion rate &lt; 60% for a day + no shield</td><td class="td-lose">Streak resets to 0, −50 XP</td></tr>
      <tr><td>Completion rate &lt; 60% + shield available + auto-shield ON</td><td class="td-neutral">Streak preserved, shield consumed, −30 XP</td></tr>
      <tr><td>Zero todos set for a day</td><td class="td-neutral">Neutral — streak unchanged</td></tr>
      <tr><td>Grace period available + double completion next day</td><td class="td-earn">Streak preserved, grace consumed</td></tr>
    </table>
  </div>

  <div class="section" id="s8">
    <div class="sec-header">
      <div class="sec-num">08</div>
      <div><div class="sec-title">Streak shields</div></div>
    </div>
    <div class="sec-divider"></div>

    <div class="callout-indigo">Max 3 shields held at any time. Shields beyond 3 are discarded. Scarcity is intentional — it makes each shield feel valuable.</div>

    <h3 class="rule-head">Earning shields</h3>
    <div class="shield-grid">
      <div class="shield-src"><span>+1</span>Every 14-day streak</div>
      <div class="shield-src"><span>+1</span>Level 3 reached</div>
      <div class="shield-src"><span>+1</span>Level 5 reached</div>
      <div class="shield-src"><span>+1</span>Level 9 reached</div>
      <div class="shield-src"><span>+1</span>Weekly boss win</div>
    </div>

    <h3 class="rule-head">Shield activation logic</h3>
    <div class="formula-box"><span class="kw">if</span> (streakWouldBreak && shields > <span class="num">0</span> && autoShield) {
  shields -= <span class="num">1</span>
  xp = Math.<span class="fn">max</span>(<span class="num">0</span>, xp - <span class="num">30</span>)   <span class="cm">// −30 XP cost</span>
  streak += <span class="num">0</span>                     <span class="cm">// preserved, not incremented</span>
  tree.stage unchanged               <span class="cm">// tree does not shrink</span>
  <span class="fn">notify</span>(<span class="str">"Shield activated. Streak protected. −30 XP"</span>)
}</div>

    <table class="rule-table">
      <tr><th>Setting</th><th>Behaviour</th></tr>
      <tr><td>Auto-shield ON</td><td class="td-neutral">Shield activates silently at midnight if needed</td></tr>
      <tr><td>Auto-shield OFF</td><td class="td-neutral">Push notification sent, 15-minute window to manually activate</td></tr>
      <tr><td>Shield used + XP = 0</td><td class="td-neutral">Shield still works. XP stays at 0 (floor rule applies)</td></tr>
    </table>
  </div>

  <div class="section" id="s9">
    <div class="sec-header">
      <div class="sec-num">09</div>
      <div><div class="sec-title">Tree growth</div></div>
    </div>
    <div class="sec-divider"></div>

    <div class="sec-lead">Each habit gets its own tree. Tree state is independent per habit — a bad day for one habit doesn't affect other trees.</div>

    <h3 class="rule-head">7 growth stages</h3>
    <div class="tree-stages">
      <div class="ts-card"><span class="ts-icon">🌰</span><div class="ts-name">Seed</div><div class="ts-cond">Habit created, 0 days done</div></div>
      <div class="ts-card"><span class="ts-icon">🌱</span><div class="ts-name">Sprout</div><div class="ts-cond">1–3 days completed</div></div>
      <div class="ts-card"><span class="ts-icon">🪴</span><div class="ts-name">Sapling</div><div class="ts-cond">4–7 days, rate ≥ 70%</div></div>
      <div class="ts-card"><span class="ts-icon">🌿</span><div class="ts-name">Young</div><div class="ts-cond">14-day streak, rate ≥ 75%</div></div>
      <div class="ts-card"><span class="ts-icon">🌳</span><div class="ts-name">Full</div><div class="ts-cond">30-day streak, rate ≥ 80%</div></div>
      <div class="ts-card"><span class="ts-icon">🌲</span><div class="ts-name">Ancient</div><div class="ts-cond">90-day streak, rate ≥ 85%</div></div>
      <div class="ts-card" style="background:#1e1b4b;border-color:rgba(99,102,241,.3)"><span class="ts-icon">✨</span><div class="ts-name" style="color:#818cf8">Glowing</div><div class="ts-cond" style="color:#3c3489">180-day streak, rate ≥ 90%</div></div>
    </div>

    <h3 class="rule-head">Shrink rules</h3>
    <div class="formula-box"><span class="cm">// Tree loses one stage when either condition triggers</span>
<span class="kw">if</span> (consecutiveMissesForThisHabit >= <span class="num">2</span>) {
  tree.stage = Math.<span class="fn">max</span>(<span class="num">0</span>, tree.stage - <span class="num">1</span>)
}
<span class="kw">if</span> (rollingRate3Day < <span class="num">0.50</span>) {
  tree.stage = Math.<span class="fn">max</span>(<span class="num">0</span>, tree.stage - <span class="num">1</span>)
}
<span class="cm">// Loses ONE stage per trigger, not all stages at once
// Never shrinks below stage 0 — becomes Ghost Tree instead</span></div>
  </div>

  <div class="section" id="s10">
    <div class="sec-header">
      <div class="sec-num">10</div>
      <div><div class="sec-title">Tree health</div></div>
    </div>
    <div class="sec-divider"></div>
    <div class="sec-lead">Each tree tracks a rolling 7-day completion rate independently. Health status drives visual effects and system actions.</div>

    <div class="health-row">
      <div class="hr-card green"><div class="hr-pct">≥ 85%</div><div class="hr-status">Thriving</div><div class="hr-effect">Subtle glow effect on tree. No system action.</div></div>
      <div class="hr-card yellow"><div class="hr-pct">70–84%</div><div class="hr-status">Growing</div><div class="hr-effect">Normal state. Steady progress.</div></div>
      <div class="hr-card orange"><div class="hr-pct">50–69%</div><div class="hr-status">Struggling</div><div class="hr-effect">Leaves yellow. Push: "Want to simplify?"</div></div>
      <div class="hr-card red"><div class="hr-pct">&lt; 50%</div><div class="hr-status">Wilting</div><div class="hr-effect">Leaves fall. Push sent. Tree shrinks after 3 days.</div></div>
    </div>
  </div>

  <div class="section" id="s11">
    <div class="sec-header">
      <div class="sec-num">11</div>
      <div><div class="sec-title">Ghost trees</div></div>
    </div>
    <div class="sec-divider"></div>

    <div class="rule-card" style="border-color:rgba(248,113,113,.15);background:rgba(248,113,113,.03)">
      <div class="rc-head" style="color:#f87171">A tree never fully dies — it becomes a Ghost Tree</div>
      <div class="rc-body">When a tree would shrink below Seed (Stage 0), it becomes a bare, grey ghost tree in the garden. It's never deleted. The ghost serves as a permanent reminder — and a challenge to revive it.</div>
    </div>

    <h3 class="rule-head">Revival mechanic</h3>
    <div class="formula-box"><span class="cm">// Ghost revival logic</span>
<span class="kw">if</span> (tree.state === <span class="str">'ghost'</span> && consecutiveCompletedDays >= <span class="num">3</span>) {
  tree.state = <span class="str">'alive'</span>
  tree.stage = <span class="num">1</span>             <span class="cm">// returns to Sprout</span>
  user.xp += <span class="num">80</span>             <span class="cm">// revival bonus XP</span>
  <span class="fn">triggerRevivalAnimation</span>()  <span class="cm">// leaves burst, colour returns</span>
}</div>
  </div>

  <div class="section" id="s12">
    <div class="sec-header">
      <div class="sec-num">12</div>
      <div><div class="sec-title">Forest system</div></div>
    </div>
    <div class="sec-divider"></div>

    <div class="callout-green">When a Glowing Tree (Stage 7) completes a full todo set, it is permanently retired to the Forest. The habit tree resets to Seed. The forest entry is permanent — never removed.</div>

    <h3 class="rule-head">Forest milestones</h3>
    <table class="rule-table">
      <tr><th>Trees grown</th><th>Badge</th><th>Reward</th></tr>
      <tr><td class="td-bold">1</td><td>First Bloom</td><td class="td-neutral">Badge awarded</td></tr>
      <tr><td class="td-bold">5</td><td>Grove Keeper</td><td class="td-neutral">Badge + rare seed</td></tr>
      <tr><td class="td-bold">10</td><td>Forest Architect</td><td class="td-neutral">Badge + tree skin unlock</td></tr>
      <tr><td class="td-bold">25</td><td>Ancient Grove</td><td class="td-neutral">Badge + animated forest background</td></tr>
      <tr><td class="td-bold">50</td><td>Legend of the Forest</td><td class="td-neutral">Badge + permanent profile border</td></tr>
    </table>

    <h3 class="rule-head">Forest display rules</h3>
    <div class="rule-card"><div class="rc-head">Hidden until first tree</div><div class="rc-body">Forest section shows "Complete all todos to grow your first tree" until the first retirement event.</div></div>
    <div class="rule-card"><div class="rc-head">Persistent tree data</div><div class="rc-body">Each forest tree stores: habit name, retirement date, streak at retirement, days grown total, and palette seed for visual consistency.</div></div>
  </div>

  <div class="section" id="s13">
    <div class="sec-header">
      <div class="sec-num">13</div>
      <div><div class="sec-title">AI agent rules</div></div>
    </div>
    <div class="sec-divider"></div>

    <table class="rule-table">
      <tr><th>Rule</th><th>Value</th></tr>
      <tr><td>Max todos generated per day</td><td class="td-bold">5 todos</td></tr>
      <tr><td>Day 1–3 difficulty</td><td style="color:#34d399">Easy — build the habit first</td></tr>
      <tr><td>Day 4+ difficulty</td><td style="color:#fbbf24">Progressive overload — ramp up</td></tr>
      <tr><td>Reflection todo frequency</td><td class="td-bold">1 per 7 days</td></tr>
      <tr><td>No todo repetition</td><td style="color:#a1a1aa">Exact same text banned consecutive days</td></tr>
      <tr><td>Recalibration trigger (low)</td><td style="color:#f87171">Rate &lt; 60% for 7 days → simplify</td></tr>
      <tr><td>Recalibration trigger (high)</td><td style="color:#34d399">Rate &gt; 90% for 7 days → increase difficulty</td></tr>
      <tr><td>Sleep time boundary</td><td class="td-bold">Never schedule after user's sleep time</td></tr>
    </table>
  </div>

  <div class="section" id="s14">
    <div class="sec-header">
      <div class="sec-num">14</div>
      <div><div class="sec-title">Weekly boss challenge</div></div>
    </div>
    <div class="sec-divider"></div>

    <div class="callout-indigo">Appears every Sunday. Completing it gives +250 XP + 1 Shield. Failing it costs nothing — pure upside mechanic. This is intentional.</div>

    <table class="rule-table">
      <tr><th>Level</th><th>Difficulty</th><th>Example</th></tr>
      <tr><td>1–3</td><td style="color:#34d399">Easy</td><td style="color:#52525b">"Complete your workout today"</td></tr>
      <tr><td>4–6</td><td style="color:#fbbf24">Medium</td><td style="color:#52525b">"Log 3 hours of focused work"</td></tr>
      <tr><td>7–9</td><td style="color:#f97316">Hard</td><td style="color:#52525b">"Complete every habit at 100% today"</td></tr>
      <tr><td>10</td><td style="color:#818cf8">Legendary</td><td style="color:#52525b">"Perfect day + help someone else build a habit"</td></tr>
    </table>
  </div>

  <div class="section" id="s15">
    <div class="sec-header">
      <div class="sec-num">15</div>
      <div><div class="sec-title">Notifications</div></div>
    </div>
    <div class="sec-divider"></div>

    <div class="notif-card">
      <div class="notif-icon amber"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C12 2 7 8 7 13a5 5 0 0010 0c0-3-2-6-2-6s-1 3-3 3c0-3 0-8 0-8z" fill="#fbbf24"/></svg></div>
      <div class="notif-text">Your 21-day streak is at risk. Complete 2 more todos to keep it alive. 🔥</div>
    </div>
    <div class="notif-card">
      <div class="notif-icon indigo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 5v6c0 5.25 3.5 10 8 11 4.5-1 8-5.75 8-11V5l-8-3z" fill="#818cf8"/></svg></div>
      <div class="notif-text">Your shield blocked tonight's miss. Streak protected. −30 XP. 🛡️ 1 shield remaining.</div>
    </div>
    <div class="notif-card">
      <div class="notif-icon red"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#f87171" stroke-width="2"/><path d="M12 7v5m0 4h.01" stroke="#f87171" stroke-width="2" stroke-linecap="round"/></svg></div>
      <div class="notif-text">Your Morning Run tree lost a stage. 🍂 Complete 3 consecutive days to start recovering.</div>
    </div>
    <div class="notif-card">
      <div class="notif-icon green"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C12 2 7 8 7 13a5 5 0 0010 0" stroke="#34d399" stroke-width="2" stroke-linecap="round"/><path d="M12 22v-4" stroke="#34d399" stroke-width="2" stroke-linecap="round"/></svg></div>
      <div class="notif-text">Your Coding Habit tree has joined your forest! 🌳 That's 3 trees grown. Start a new seed?</div>
    </div>

    <h3 class="rule-head">Notification caps</h3>
    <table class="rule-table">
      <tr><th>Rule</th><th>Value</th></tr>
      <tr><td>Max pushes per user per day</td><td class="td-bold">5 notifications</td></tr>
      <tr><td>Quiet hours</td><td style="color:#a1a1aa">User-configurable, no pushes during window</td></tr>
      <tr><td>Streak danger time</td><td class="td-bold">8 PM local (always sent)</td></tr>
      <tr><td>Todo reminders</td><td style="color:#a1a1aa">30 min before, at deadline, 5 min after</td></tr>
    </table>
  </div>

  <div class="section" id="s16">
    <div class="sec-header">
      <div class="sec-num">16</div>
      <div><div class="sec-title">Anti-gaming rules</div></div>
    </div>
    <div class="sec-divider"></div>

    <div class="rule-card"><div class="rc-head">Todo completion window</div><div class="rc-body">A todo can only be marked complete within 24 hours of its creation. <strong>Backdating is not allowed</strong> — server-side timestamp validation on every completion event.</div></div>
    <div class="rule-card"><div class="rc-head">Rapid-fire protection</div><div class="rc-body">More than 1 completion per 10 seconds triggers a soft lock with a confirmation step. Prevents automated tap-spamming.</div></div>
    <div class="rule-card"><div class="rc-head">Streak is server-side</div><div class="rc-body">All streak logic runs on the server at midnight. The client displays streak count but <strong>cannot modify it</strong>. Timezone changes preserve streak, recalculate from new TZ going forward.</div></div>
    <div class="rule-card"><div class="rc-head">XP log is append-only</div><div class="rc-body">Every XP change (earn and deduct) is logged with timestamp, action type, and delta. No edits or deletes ever. Current XP = sum of all log entries (reconciled on load if discrepancy detected).</div></div>
  </div>

  <div class="section" id="s17">
    <div class="sec-header">
      <div class="sec-num">17</div>
      <div><div class="sec-title">Edge cases</div></div>
    </div>
    <div class="sec-divider"></div>

    <table class="edge-table">
      <tr><th>Scenario</th><th>Rule</th></tr>
      <tr><td class="scenario">User has 0 todos set for a day</td><td>Day is neutral — streak neither advances nor breaks. No deduction.</td></tr>
      <tr><td class="scenario">User deletes a habit mid-streak</td><td>Streak for that habit ends. Global streak and other habits unaffected.</td></tr>
      <tr><td class="scenario">App offline when deadline passes</td><td>Sync on reconnect. If within 1 hour of deadline, grace given. After 1 hour, penalty applies.</td></tr>
      <tr><td class="scenario">User changes timezone</td><td>Streak preserved. Day boundary recalculates from new TZ going forward only.</td></tr>
      <tr><td class="scenario">Two todos due at same minute</td><td>Both treated independently. Early bonus applies to each separately.</td></tr>
      <tr><td class="scenario">Shield used but user has 0 XP</td><td>Shield still activates and protects streak. XP stays at 0 (floor rule).</td></tr>
      <tr><td class="scenario">All habits deleted</td><td>Forest persists. XP persists. Level persists. Nothing is deleted from history.</td></tr>
      <tr><td class="scenario">Ghost tree todo completion</td><td>Todos still function normally. Ghost revival tracker counts consecutive completions independently.</td></tr>
      <tr><td class="scenario">Level 10 XP multiplier + deduction</td><td>Multiplier applies only to earned XP. Deductions are always face value — never multiplied or reduced.</td></tr>
      <tr><td class="scenario">Streak milestone hit during grace period</td><td>Milestone XP and reward still awarded. Grace period and milestone are independent events.</td></tr>
    </table>
  </div>

</main>
</div>

<script>
function scrollTo(id, el) {
  document.getElementById(id).scrollIntoView({behavior:'smooth', block:'start'});
  document.querySelectorAll('.s-link').forEach(l => l.classList.remove('active'));
  el.classList.add('active');
}

function calcXP() {
  const done = parseInt(document.getElementById('ci-done').value) || 0;
  const total = Math.max(1, parseInt(document.getElementById('ci-total').value) || 5);
  const ai = Math.min(done, parseInt(document.getElementById('ci-ai').value) || 0);
  const early = Math.min(done, parseInt(document.getElementById('ci-early').value) || 0);
  const streak = parseInt(document.getElementById('ci-streak').value) || 0;

  const regular = done - ai;
  let xp = 0;
  let parts = [];

  const baseRegular = regular * 10;
  const baseAI = ai * 12;
  if (baseRegular > 0) parts.push(regular + '×10 regular');
  if (baseAI > 0) parts.push(ai + '×12 AI');
  xp += baseRegular + baseAI;

  const earlyBonus = early * 5;
  if (earlyBonus > 0) { xp += earlyBonus; parts.push(early + '×5 early'); }

  if (done > 0) { xp += 5; parts.push('+5 momentum'); }

  const rate = done / total;
  if (rate >= 1.0) {
    const perfectBonus = streak >= 7 ? 35 : 25;
    xp += perfectBonus;
    parts.push('+' + perfectBonus + ' perfect day' + (streak >= 7 ? ' (hot)' : ''));
  }

  xp += 3;
  parts.push('+3 login');

  document.getElementById('calc-total').textContent = Math.round(xp);
  document.getElementById('calc-breakdown').textContent = parts.join('  ·  ');
}

calcXP();
</script>

    `
  return (
    <div className="min-h-screen bg-zinc-950">
        <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}