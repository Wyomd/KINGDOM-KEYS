import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import {
  GOLD, GOLD_LIGHT, BLACK, SURFACE, SURFACE2, SURFACE3, TEXT, TEXT_MUTED,
  CATEGORIES, DAYS, MONTHS,
} from "./theme.js";

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const seedEvents = [
  { id:1,  name:"Saturday Mentoring Session",  date:"2026-05-02", time:"10:00 AM", endTime:"1:00 PM",  location:"Community Center, Room 4", description:"Weekly one-on-one mentoring sessions focused on goal-setting and accountability.", category:"Mentoring",  priority:"High",   submittedBy:"Admin",          approved:true, recurring:true },
  { id:2,  name:"Resume & Interview Workshop", date:"2026-05-06", time:"4:00 PM",  endTime:"6:00 PM",  location:"Library Meeting Room B",    description:"Learn how to build a standout resume and ace your first interview. Open to all mentees 15+.", category:"Workshop",   priority:"High",   submittedBy:"Coach Williams", approved:true },
  { id:3,  name:"College Campus Tour",         date:"2026-05-09", time:"9:00 AM",  endTime:"4:00 PM",  location:"State University Campus",   description:"Explore university life — meet students, tour facilities, and envision your future.", category:"Field_Trip", priority:"High",   submittedBy:"Admin",          approved:true },
  { id:4,  name:"Saturday Mentoring Session",  date:"2026-05-09", time:"10:00 AM", endTime:"1:00 PM",  location:"Community Center, Room 4", description:"Weekly one-on-one mentoring sessions.", category:"Mentoring", priority:"High", submittedBy:"Admin", approved:true, recurring:true },
  { id:5,  name:"Financial Literacy Seminar",  date:"2026-05-13", time:"5:30 PM",  endTime:"7:00 PM",  location:"Kingdom KEYS HQ",           description:"Budgeting, saving, and understanding credit — skills every young leader needs.", category:"Academic",   priority:"Medium", submittedBy:"Mentor Tasha",   approved:true },
  { id:6,  name:"Leadership Circle",           date:"2026-05-15", time:"3:00 PM",  endTime:"5:00 PM",  location:"Kingdom KEYS HQ",           description:"Monthly leadership roundtable. Senior mentees share progress and set new challenges.", category:"Leadership", priority:"High",   submittedBy:"Director",       approved:true },
  { id:7,  name:"Saturday Mentoring Session",  date:"2026-05-16", time:"10:00 AM", endTime:"1:00 PM",  location:"Community Center, Room 4", description:"Weekly one-on-one mentoring sessions.", category:"Mentoring", priority:"High", submittedBy:"Admin", approved:true, recurring:true },
  { id:8,  name:"Community Service Day",       date:"2026-05-20", time:"8:00 AM",  endTime:"12:00 PM", location:"Riverside Park",            description:"Give back to the community. Bring work gloves. Lunch provided.", category:"Community",  priority:"Medium", submittedBy:"Coach Williams", approved:true },
  { id:9,  name:"End-of-Month Celebration",    date:"2026-05-29", time:"6:00 PM",  endTime:"9:00 PM",  location:"Kingdom KEYS HQ",           description:"Recognize this month's achievements. Awards, food, and community. Families welcome!", category:"Social",     priority:"High",   submittedBy:"Admin",          approved:true },
  { id:10, name:"Saturday Mentoring Session",  date:"2026-05-30", time:"10:00 AM", endTime:"1:00 PM",  location:"Community Center, Room 4", description:"Weekly one-on-one mentoring sessions.", category:"Mentoring", priority:"High", submittedBy:"Admin", approved:true, recurring:true },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt      = d => d.toISOString().split("T")[0];
const todayStr = () => fmt(new Date());

function getMonthCells(year, month) {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const cells = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(fmt(new Date(year, month, d)));
  while (cells.length % 7) cells.push(null);
  return cells;
}

function downloadCSV(events) {
  const hdr  = "Subject,Start Date,Start Time,End Date,End Time,All Day Event,Description,Location\n";
  const rows = events
    .map(e => `"${e.name}","${e.date}","${e.time}","${e.date}","${e.endTime||""}","FALSE","${e.description}","${e.location}"`)
    .join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([hdr + rows], { type: "text/csv" }));
  a.download = "kingdom-keys-events.csv";
  a.click();
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:${BLACK};color:${TEXT};font-family:'DM Sans',sans-serif}
.kk{min-height:100vh;background:${BLACK}}
.nav{position:sticky;top:0;z-index:100;background:rgba(10,10,10,.97);backdrop-filter:blur(14px);border-bottom:1px solid #1c1c1c;display:flex;align-items:center;justify-content:space-between;padding:0 18px;height:54px;gap:10px}
.logo{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2px;color:${GOLD};white-space:nowrap;flex-shrink:0}
.logo span{color:${TEXT}}
.tabs{display:flex;gap:2px}
.tab{padding:5px 11px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;border:none;background:transparent;color:${TEXT_MUTED};transition:all .15s;letter-spacing:.3px}
.tab:hover{color:${TEXT};background:${SURFACE2}}
.tab.on{background:${GOLD};color:${BLACK}}
.nav-r{display:flex;gap:5px;flex-shrink:0}
.btn{padding:6px 12px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;border:none;transition:all .15s;letter-spacing:.3px;white-space:nowrap}
.btn-ghost{background:transparent;color:${TEXT_MUTED};border:1px solid #2a2a2a}
.btn-ghost:hover{color:${TEXT};border-color:#444}
.btn-gold{background:${GOLD};color:${BLACK}}
.btn-gold:hover{background:${GOLD_LIGHT}}
.btn-sm{padding:4px 9px;font-size:10px}
.btn-red{background:transparent;color:#ef4444;border:1px solid #3a1010}
.btn-red:hover{background:#1a0505}
.main{padding:16px 20px;max-width:1200px;margin:0 auto}
.slbl{font-size:10px;letter-spacing:3px;color:${GOLD};font-weight:700;margin-bottom:8px}
.wnav{display:flex;gap:5px;align-items:center}
.wnav button{background:${SURFACE2};border:none;color:${TEXT};width:26px;height:26px;border-radius:5px;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;transition:background .14s}
.wnav button:hover{background:${SURFACE3}}
.wnav-lbl{font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:1px;white-space:nowrap;padding:0 6px}
.sc{background:${SURFACE};border-radius:11px;padding:13px;margin-bottom:12px;border:1px solid #1e1e1e}
.sc-title{font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:1px;margin-bottom:9px}
.ecard{background:${SURFACE2};border-radius:10px;padding:12px;margin-bottom:7px;border:1px solid #222;border-left:3px solid ${GOLD};cursor:pointer;transition:all .15s}
.ecard:hover{transform:translateY(-1px);border-color:#303030;box-shadow:0 4px 16px rgba(0,0,0,.25)}
.ecard.hi{background:linear-gradient(135deg,#191300 0%,${SURFACE2} 100%)}
.ecard-top{display:flex;align-items:flex-start;justify-content:space-between;gap:7px}
.ecard-name{font-size:13px;font-weight:700;line-height:1.3;flex:1}
.ebadge{font-size:9px;font-weight:700;padding:2px 6px;border-radius:20px;letter-spacing:.3px;flex-shrink:0}
.emeta{display:flex;gap:8px;margin-top:5px;flex-wrap:wrap}
.em{font-size:11px;color:${TEXT_MUTED};display:flex;align-items:center;gap:3px}
.edesc{font-size:11px;color:${TEXT_MUTED};margin-top:5px;line-height:1.55}
.eactions{display:flex;gap:5px;margin-top:8px;padding-top:8px;border-top:1px solid #252525}
.recur{font-size:9px;background:${GOLD}18;color:${GOLD};padding:1px 5px;border-radius:9px;font-weight:700;margin-left:4px}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:200;display:flex;align-items:center;justify-content:center;padding:14px}
.modal{background:${SURFACE};border-radius:14px;max-width:480px;width:100%;border:1px solid ${GOLD}25;overflow:hidden;max-height:92vh;overflow-y:auto}
.mhdr{background:linear-gradient(90deg,${GOLD}10 0%,transparent 100%);padding:15px 17px;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:flex-start;gap:7px}
.mtitle{font-family:'Bebas Neue',sans-serif;font-size:19px;letter-spacing:1px}
.mx{background:none;border:none;color:${TEXT_MUTED};font-size:18px;cursor:pointer;padding:0;line-height:1;flex-shrink:0}
.mbody{padding:15px}
.form{display:flex;flex-direction:column;gap:9px}
.field label{font-size:10px;font-weight:700;color:${TEXT_MUTED};letter-spacing:1px;display:block;margin-bottom:3px}
.field input,.field select,.field textarea{width:100%;background:${SURFACE2};border:1px solid #282828;border-radius:7px;color:${TEXT};font-family:'DM Sans',sans-serif;font-size:13px;padding:7px 10px;outline:none;transition:border-color .15s}
.field input:focus,.field select:focus,.field textarea:focus{border-color:${GOLD}50}
.field textarea{min-height:68px;resize:vertical}
.field select option{background:${SURFACE2}}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.toast{position:fixed;bottom:18px;right:18px;z-index:500;background:${GOLD};color:${BLACK};font-weight:700;font-size:12px;padding:8px 14px;border-radius:7px;animation:tIn .2s ease;pointer-events:none}
@keyframes tIn{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
.dash-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}
.stc{background:${SURFACE};border:1px solid #1e1e1e;border-radius:10px;padding:12px}
.stn{font-family:'Bebas Neue',sans-serif;font-size:30px;color:${GOLD};line-height:1}
.stl{font-size:10px;color:${TEXT_MUTED};letter-spacing:1px;margin-top:2px}
.brow{display:flex;align-items:center;gap:7px;margin-bottom:5px}
.blbl{font-size:11px;width:85px;flex-shrink:0;color:${TEXT_MUTED}}
.btrk{flex:1;background:${SURFACE3};border-radius:3px;height:5px;overflow:hidden}
.bfil{height:100%;border-radius:3px}
.bct{font-size:10px;color:${TEXT_MUTED};width:16px;text-align:right}
.pi{background:${SURFACE2};border-radius:7px;padding:9px;margin-bottom:5px;display:flex;align-items:center;justify-content:space-between;gap:7px;border-left:3px solid ${GOLD}30}
.pn{font-size:12px;font-weight:700}
.ps{font-size:10px;color:${TEXT_MUTED};margin-top:1px}
.pb{display:flex;gap:3px}
.ok{background:#059669;color:#fff;border:none;border-radius:4px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer}
.no{background:${SURFACE3};color:${TEXT_MUTED};border:none;border-radius:4px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:${BLACK}}
::-webkit-scrollbar-thumb{background:#282828;border-radius:2px}

/* ── PUBLIC VIEW ── */
.pub{background:${BLACK};min-height:100vh}
.pub-hero{background:linear-gradient(135deg,#111 0%,${BLACK} 60%);border-bottom:2px solid ${GOLD}30;padding:28px 22px 22px;position:relative;overflow:hidden}
.pub-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 80% at 90% 50%,${GOLD}09 0%,transparent 70%)}
.pub-hero-in{position:relative;max-width:860px}
.pub-eye{font-size:9px;letter-spacing:3px;color:${GOLD};font-weight:700;margin-bottom:5px}
.pub-h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(28px,6vw,52px);line-height:1;letter-spacing:2px;margin-bottom:6px}
.pub-h1 .g{color:${GOLD}}
.pub-sub{font-size:12px;color:${TEXT_MUTED};max-width:460px;line-height:1.65}
.pub-stats{display:flex;gap:20px;margin-top:14px;flex-wrap:wrap}
.pub-sn{font-family:'Bebas Neue',sans-serif;font-size:24px;color:${GOLD};line-height:1}
.pub-sl{font-size:9px;color:${TEXT_MUTED};letter-spacing:1px;margin-top:1px}
.pub-nav{display:flex;align-items:center;justify-content:space-between;padding:10px 22px;background:${SURFACE};border-bottom:1px solid #1a1a1a;flex-wrap:wrap;gap:8px}
.pub-tabs{display:flex;gap:3px}
.pub-tab{padding:5px 12px;border-radius:5px;font-size:11px;font-weight:700;cursor:pointer;border:none;background:transparent;color:${TEXT_MUTED};transition:all .15s;letter-spacing:.3px}
.pub-tab:hover{color:${TEXT};background:${SURFACE2}}
.pub-tab.on{background:${GOLD}20;color:${GOLD};border:1px solid ${GOLD}35}
.pub-main{padding:18px 22px;max-width:860px;margin:0 auto}

/* Upcoming list */
.up-card{display:flex;gap:13px;background:${SURFACE};border-radius:11px;padding:14px;margin-bottom:9px;border:1px solid #1e1e1e;border-left:3px solid ${GOLD}40;transition:border-color .15s}
.up-card:hover{border-color:${GOLD}70}
.up-date-box{flex-shrink:0;width:46px;text-align:center;background:${GOLD}12;border-radius:8px;padding:6px 4px;border:1px solid ${GOLD}20}
.up-mo{font-size:9px;font-weight:700;color:${GOLD};letter-spacing:1px;text-transform:uppercase}
.up-day{font-family:'Bebas Neue',sans-serif;font-size:26px;color:${TEXT};line-height:1}
.up-body{flex:1}
.up-name{font-size:13px;font-weight:700;margin-bottom:3px}
.up-meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px}
.up-m{font-size:11px;color:${TEXT_MUTED}}
.up-desc{font-size:11px;color:#999;line-height:1.6}
.up-cat{font-size:9px;font-weight:700;padding:2px 7px;border-radius:9px;display:inline-block;margin-bottom:5px}
.today-banner{background:linear-gradient(90deg,${GOLD} 0%,${GOLD_LIGHT} 100%);color:${BLACK};border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px}
.tb-ico{font-size:22px;flex-shrink:0}
.tb-msg{font-size:13px;font-weight:800}
.tb-sub{font-size:11px;opacity:.65;margin-top:1px}

/* Month grid public */
.pmg-hdrs{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:2px}
.pmg-hdr{text-align:center;font-size:10px;font-weight:700;color:${TEXT_MUTED};letter-spacing:.5px;padding:5px 0}
.pmg-hdr.we{color:${GOLD}}
.pmg-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:18px}
.pmc{background:${SURFACE};min-height:72px;padding:6px;border-radius:6px;border:1px solid #1a1a1a;cursor:pointer;transition:all .14s}
.pmc:hover{border-color:#2a2a2a;background:${SURFACE2}}
.pmc.today{border-color:${GOLD}55;background:${GOLD}06}
.pmc.empty{background:transparent;border-color:transparent;cursor:default;pointer-events:none}
.pmc.we-c{background:#0f0d00}
.pmn{font-size:11px;font-weight:700;color:${TEXT_MUTED};margin-bottom:3px}
.pmc.today .pmn{background:${GOLD};color:${BLACK};width:19px;height:19px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px}
.pmdot{width:6px;height:6px;border-radius:50%;display:inline-block;margin:1px 1px 0 0}
.pmmname{font-size:9px;color:#777;margin-top:2px;line-height:1.3;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.pmmore{font-size:9px;color:${GOLD};font-weight:700}
.pub-legend{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px}
.pl-item{display:flex;align-items:center;gap:4px;font-size:10px;color:${TEXT_MUTED}}
.pl-dot{width:8px;height:8px;border-radius:2px;flex-shrink:0}
.footer{text-align:center;padding:24px;border-top:1px solid #181818;margin-top:12px}
.footer-logo{font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:2px;color:${GOLD};margin-bottom:3px}
.footer-sub{font-size:11px;color:${TEXT_MUTED}}
`;

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => {
    if (!document.getElementById("kk-css")) {
      const s = document.createElement("style");
      s.id = "kk-css";
      s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  const [tab,       setTab]       = useState("public");
  const [events,    setEvents]    = useState(() => {
    try {
      const saved = localStorage.getItem("kk-events");
      return saved ? JSON.parse(saved) : seedEvents;
    } catch { return seedEvents; }
  });
  const [selEv,     setSelEv]     = useState(null);
  const [editEv,    setEditEv]    = useState(null);
  const [toast,     setToast]     = useState(null);
  const [monthView, setMonthView] = useState({ year: 2026, month: 4 });

  useEffect(() => {
    localStorage.setItem("kk-events", JSON.stringify(events));
  }, [events]);

  const approved = events.filter(e => e.approved);
  const pending  = events.filter(e => !e.approved);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  const addEvent  = ev  => { setEvents(p => [...p, { ...ev, id: Date.now(), approved: false }]); showToast("Submitted for approval!"); };
  const saveEdit  = ev  => { setEvents(p => p.map(e => e.id === ev.id ? ev : e)); showToast("Saved ✓"); setEditEv(null); setSelEv(null); };
  const deleteEv  = id  => { setEvents(p => p.filter(e => e.id !== id)); showToast("Deleted"); setSelEv(null); setEditEv(null); };
  const approve   = id  => { setEvents(p => p.map(e => e.id === id ? { ...e, approved: true } : e)); showToast("Approved ✓"); };

  return (
    <div className="kk">
      <style>{CSS}</style>
      <nav className="nav">
        <div className="logo">KINGDOM <span>KEYS</span></div>
        <div className="tabs">
          <button className={`tab${tab === "public"    ? " on" : ""}`} onClick={() => setTab("public")}>📋 Public View</button>
          <button className={`tab${tab === "manage"    ? " on" : ""}`} onClick={() => setTab("manage")}>⚙️ Manage Events</button>
          <button className={`tab${tab === "submit"    ? " on" : ""}`} onClick={() => setTab("submit")}>+ Submit</button>
          <button className={`tab${tab === "dashboard" ? " on" : ""}`} onClick={() => setTab("dashboard")}>Dashboard</button>
        </div>
        <div className="nav-r">
          <button className="btn btn-ghost btn-sm" onClick={() => downloadCSV(approved)}>↓ CSV</button>
        </div>
      </nav>

      {tab === "public"    && <PublicView    events={approved} monthView={monthView} setMonthView={setMonthView} />}
      {tab === "manage"    && <ManageView    events={events} approved={approved} onEdit={ev => setEditEv({ ...ev })} onDelete={deleteEv} onApprove={approve} />}
      {tab === "submit"    && <SubmitView    onSubmit={addEvent} />}
      {tab === "dashboard" && <DashboardView events={events} approved={approved} pending={pending} onApprove={approve} onDelete={deleteEv} />}

      {selEv && (
        <div className="overlay" onClick={() => setSelEv(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="mhdr">
              <div>
                <div style={{ fontSize: 9, letterSpacing: 2, color: GOLD, fontWeight: 700, marginBottom: 3 }}>
                  {CATEGORIES[selEv.category]?.icon} {selEv.category.replace("_", " ")}
                  {selEv.recurring && <span className="recur">RECURRING</span>}
                </div>
                <div className="mtitle">{selEv.name}</div>
              </div>
              <button className="mx" onClick={() => setSelEv(null)}>✕</button>
            </div>
            <div className="mbody">
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 11 }}>
                <span className="em">📅 {selEv.date}</span>
                <span className="em">🕐 {selEv.time}{selEv.endTime ? ` – ${selEv.endTime}` : ""}</span>
                <span className="em">📍 {selEv.location}</span>
              </div>
              <p style={{ fontSize: 13, color: "#ccc", lineHeight: 1.7 }}>{selEv.description}</p>
              <div style={{ marginTop: 12, padding: "10px 12px", background: GOLD + "10", borderRadius: 7, border: `1px solid ${GOLD}25` }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: 1, marginBottom: 2 }}>🔑 BE THERE</div>
                <div style={{ fontSize: 12, color: TEXT_MUTED }}>This event is part of your Kingdom KEYS journey. Show up ready.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editEv && (
        <div className="overlay" onClick={() => setEditEv(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="mhdr">
              <div className="mtitle">EDIT EVENT</div>
              <button className="mx" onClick={() => setEditEv(null)}>✕</button>
            </div>
            <div className="mbody">
              <EForm initial={editEv} onSubmit={saveEdit} onCancel={() => setEditEv(null)} submitLabel="Save Changes ✓" showDelete onDelete={() => deleteEv(editEv.id)} />
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}

// ─── PUBLIC VIEW ──────────────────────────────────────────────────────────────
function PublicView({ events, monthView, setMonthView }) {
  const [pubTab,      setPubTab]      = useState("upcoming");
  const [selEv,       setSelEv]       = useState(null);
  const [downloading, setDownloading] = useState(false);
  const captureRef = useRef(null);
  const today = todayStr();

  const downloadImage = async () => {
    const el = captureRef.current;
    if (!el) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(el, {
        backgroundColor: BLACK,
        scale: 2,
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `kingdom-keys-${pubTab}-${new Date().toISOString().split("T")[0]}.png`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  const upcoming = events
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  const todayEvents = events.filter(e => e.date === today);
  const monthKey    = `${monthView.year}-${String(monthView.month + 1).padStart(2, "0")}`;
  const monthEvs    = events.filter(e => e.date.startsWith(monthKey)).sort((a, b) => a.date.localeCompare(b.date));

  const advMonth = dir => setMonthView(mv => {
    let m = mv.month + dir, y = mv.year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0;  y++; }
    return { year: y, month: m };
  });

  return (
    <div className="pub" ref={captureRef}>
      <div className="pub-hero">
        <div className="pub-hero-in">
          <div className="pub-eye">📅 KINGDOM KEYS MENTORING</div>
          <div className="pub-h1">YOUR <span className="g">KEYS</span><br />TO THE FUTURE</div>
          <div className="pub-sub">Stay locked in. Every event is an investment in yourself. Be present, be ready, be great.</div>
          <div className="pub-stats">
            <div><div className="pub-sn">{upcoming.length}</div><div className="pub-sl">UPCOMING EVENTS</div></div>
            <div><div className="pub-sn">{events.filter(e => e.priority === "High").length}</div><div className="pub-sl">MUST-ATTEND</div></div>
            <div><div className="pub-sn">{events.filter(e => e.recurring).length}</div><div className="pub-sl">WEEKLY SESSIONS</div></div>
          </div>
        </div>
      </div>

      <div className="pub-nav">
        <div className="pub-tabs">
          <button className={`pub-tab${pubTab === "upcoming"  ? " on" : ""}`} onClick={() => setPubTab("upcoming")}>📋 Upcoming</button>
          <button className={`pub-tab${pubTab === "calendar"  ? " on" : ""}`} onClick={() => setPubTab("calendar")}>📆 Calendar</button>
        </div>
        <button
          className="btn btn-gold btn-sm"
          onClick={downloadImage}
          disabled={downloading}
          style={{ opacity: downloading ? .6 : 1 }}
        >
          {downloading ? "Saving…" : "📱 Save as Image"}
        </button>
      </div>

      <div className="pub-main">
        {todayEvents.length > 0 && (
          <div className="today-banner">
            <div className="tb-ico">🔑</div>
            <div>
              <div className="tb-msg">TODAY: {todayEvents[0].name}</div>
              <div className="tb-sub">{todayEvents[0].time}{todayEvents[0].endTime ? ` – ${todayEvents[0].endTime}` : ""} · {todayEvents[0].location}</div>
            </div>
          </div>
        )}

        {pubTab === "upcoming" && (
          <>
            <div className="slbl">— UPCOMING EVENTS</div>
            {upcoming.length === 0
              ? <div style={{ textAlign: "center", padding: "32px 0", color: TEXT_MUTED, fontSize: 13 }}>No upcoming events scheduled.</div>
              : upcoming.map(ev => {
                const parts   = ev.date.split("-");
                const mo      = MONTHS[parseInt(parts[1]) - 1].slice(0, 3).toUpperCase();
                const day     = parseInt(parts[2]);
                const cat     = CATEGORIES[ev.category] || {};
                const isToday = ev.date === today;
                return (
                  <div key={ev.id} className="up-card" style={{ borderLeftColor: cat.color + "80" }} onClick={() => setSelEv(ev)}>
                    <div className="up-date-box" style={isToday ? { background: GOLD + "22", borderColor: GOLD + "50" } : {}}>
                      <div className="up-mo">{mo}</div>
                      <div className="up-day">{day}</div>
                      {isToday && <div style={{ fontSize: 7, color: GOLD, fontWeight: 700, letterSpacing: .5, marginTop: 1 }}>TODAY</div>}
                    </div>
                    <div className="up-body">
                      <span className="up-cat" style={{ background: cat.color + "1a", color: cat.color }}>
                        {cat.icon} {ev.category.replace("_", " ")}
                        {ev.recurring && <span style={{ marginLeft: 4, opacity: .7 }}>↻</span>}
                      </span>
                      <div className="up-name">{ev.name}{ev.priority === "High" && <span style={{ color: GOLD, fontSize: 10, marginLeft: 5 }}>★</span>}</div>
                      <div className="up-meta">
                        <span className="up-m">🕐 {ev.time}{ev.endTime ? ` – ${ev.endTime}` : ""}</span>
                        <span className="up-m">📍 {ev.location}</span>
                      </div>
                      <div className="up-desc">{ev.description}</div>
                    </div>
                  </div>
                );
              })
            }
          </>
        )}

        {pubTab === "calendar" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <div className="slbl" style={{ margin: 0 }}>— {MONTHS[monthView.month].toUpperCase()} {monthView.year}</div>
              <div className="wnav">
                <button onClick={() => advMonth(-1)}>‹</button>
                <div className="wnav-lbl">{MONTHS[monthView.month].slice(0, 3)} {monthView.year}</div>
                <button onClick={() => advMonth(1)}>›</button>
              </div>
            </div>
            <div className="pub-legend">
              {Object.entries(CATEGORIES)
                .filter(([c]) => events.some(e => e.category === c))
                .map(([c, v]) => (
                  <div key={c} className="pl-item">
                    <div className="pl-dot" style={{ background: v.color }} />
                    {v.icon} {c.replace("_", " ")}
                  </div>
                ))
              }
            </div>
            <div className="pmg-hdrs">
              {DAYS.map((d, i) => (
                <div key={d} className={`pmg-hdr${i === 0 || i === 6 ? " we" : ""}`}>{d}</div>
              ))}
            </div>
            <div className="pmg-grid">
              {getMonthCells(monthView.year, monthView.month).map((date, idx) => {
                const dayEvs = date ? events.filter(e => e.date === date) : [];
                const isToday = date === today;
                const dow = idx % 7;
                const isWE = dow === 0 || dow === 6;
                return (
                  <div
                    key={idx}
                    className={`pmc${!date ? " empty" : ""}${isToday ? " today" : ""}${isWE && date ? " we-c" : ""}`}
                    onClick={() => dayEvs.length && setSelEv(dayEvs[0])}
                  >
                    {date && <>
                      <div className="pmn">
                        {isToday
                          ? <span style={{ background: GOLD, color: BLACK, width: 19, height: 19, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
                              {parseInt(date.split("-")[2])}
                            </span>
                          : parseInt(date.split("-")[2])
                        }
                      </div>
                      <div>
                        {dayEvs.slice(0, 4).map(ev => (
                          <span key={ev.id} className="pmdot" style={{ background: CATEGORIES[ev.category]?.color }} title={ev.name} />
                        ))}
                      </div>
                      {dayEvs.length > 4 && <div className="pmmore">+{dayEvs.length - 4}</div>}
                      {dayEvs[0] && <div className="pmmname">{dayEvs[0].name}</div>}
                    </>}
                  </div>
                );
              })}
            </div>

            {monthEvs.length > 0 && <>
              <div className="slbl">— THIS MONTH</div>
              {monthEvs.map(ev => {
                const cat = CATEGORIES[ev.category] || {};
                return (
                  <div key={ev.id} className="up-card" style={{ borderLeftColor: cat.color + "70" }} onClick={() => setSelEv(ev)}>
                    <div className="up-date-box">
                      <div className="up-mo">{MONTHS[parseInt(ev.date.split("-")[1]) - 1].slice(0, 3).toUpperCase()}</div>
                      <div className="up-day">{parseInt(ev.date.split("-")[2])}</div>
                    </div>
                    <div className="up-body">
                      <span className="up-cat" style={{ background: cat.color + "1a", color: cat.color }}>{cat.icon} {ev.category.replace("_", " ")}</span>
                      <div className="up-name">{ev.name}{ev.priority === "High" && <span style={{ color: GOLD, fontSize: 10, marginLeft: 5 }}>★</span>}</div>
                      <div className="up-meta">
                        <span className="up-m">🕐 {ev.time}{ev.endTime ? ` – ${ev.endTime}` : ""}</span>
                        <span className="up-m">📍 {ev.location}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>}
          </>
        )}

        <div className="footer">
          <div className="footer-logo">KINGDOM KEYS MENTORING</div>
          <div className="footer-sub">College &amp; Career Readiness · Empowering the Next Generation</div>
        </div>
      </div>

      {selEv && (
        <div className="overlay" onClick={() => setSelEv(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="mhdr">
              <div>
                <div style={{ fontSize: 9, letterSpacing: 2, color: GOLD, fontWeight: 700, marginBottom: 3 }}>
                  {CATEGORIES[selEv.category]?.icon} {selEv.category.replace("_", " ")}
                  {selEv.recurring && <span className="recur">RECURRING</span>}
                </div>
                <div className="mtitle">{selEv.name}</div>
              </div>
              <button className="mx" onClick={() => setSelEv(null)}>✕</button>
            </div>
            <div className="mbody">
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 11 }}>
                <span className="em">📅 {selEv.date}</span>
                <span className="em">🕐 {selEv.time}{selEv.endTime ? ` – ${selEv.endTime}` : ""}</span>
                <span className="em">📍 {selEv.location}</span>
              </div>
              <p style={{ fontSize: 13, color: "#ccc", lineHeight: 1.7 }}>{selEv.description}</p>
              <div style={{ marginTop: 12, padding: "10px 12px", background: GOLD + "10", borderRadius: 7, border: `1px solid ${GOLD}25` }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: 1, marginBottom: 2 }}>🔑 BE THERE</div>
                <div style={{ fontSize: 12, color: TEXT_MUTED }}>This event is part of your Kingdom KEYS journey. Show up ready. Your mentors are expecting you.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MANAGE VIEW ──────────────────────────────────────────────────────────────
function ManageView({ events, approved, onEdit, onDelete, onApprove }) {
  const pending = events.filter(e => !e.approved);
  return (
    <div className="main">
      {pending.length > 0 && <>
        <div className="slbl">— PENDING APPROVAL</div>
        {pending.map(ev => (
          <div key={ev.id} className="pi" style={{ marginBottom: 7 }}>
            <div><div className="pn">{ev.name}</div><div className="ps">{ev.date} · {ev.time} · by {ev.submittedBy}</div></div>
            <div className="pb">
              <button className="ok" onClick={() => onApprove(ev.id)}>✓ Approve</button>
              <button className="no" onClick={() => onDelete(ev.id)}>✕</button>
            </div>
          </div>
        ))}
        <div style={{ height: 14 }} />
      </>}
      <div className="slbl">— ALL APPROVED EVENTS ({approved.length})</div>
      {approved.sort((a, b) => a.date.localeCompare(b.date)).map(ev => (
        <div key={ev.id} className={`ecard${ev.priority === "High" ? " hi" : ""}`}>
          <div className="ecard-top">
            <div style={{ fontSize: 15 }}>{CATEGORIES[ev.category]?.icon}</div>
            <div className="ecard-name">{ev.name}{ev.recurring && <span className="recur">↻ RECURRING</span>}</div>
            <span className="ebadge" style={{ background: CATEGORIES[ev.category]?.color + "20", color: CATEGORIES[ev.category]?.color }}>
              {ev.category.replace("_", " ")}
            </span>
          </div>
          <div className="emeta">
            <span className="em">📅 {ev.date}</span>
            <span className="em">🕐 {ev.time}{ev.endTime ? ` – ${ev.endTime}` : ""}</span>
            <span className="em">📍 {ev.location}</span>
          </div>
          <div className="edesc">{ev.description}</div>
          <div className="eactions">
            <button className="btn btn-ghost btn-sm" onClick={() => onEdit(ev)}>✏️ Edit</button>
            <button className="btn btn-red btn-sm"   onClick={() => onDelete(ev.id)}>🗑 Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SUBMIT VIEW ──────────────────────────────────────────────────────────────
function SubmitView({ onSubmit }) {
  return (
    <div className="main" style={{ maxWidth: 540 }}>
      <div className="slbl">— EVENT INTAKE FORM</div>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: 2, marginBottom: 4 }}>
        SUBMIT AN <span style={{ color: GOLD }}>EVENT</span>
      </div>
      <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 16, lineHeight: 1.65 }}>
        All submissions are reviewed before going live on the Public View.
      </p>
      <div className="sc">
        <EForm onSubmit={onSubmit} submitLabel="Submit for Approval →" />
      </div>
    </div>
  );
}

// ─── DASHBOARD VIEW ───────────────────────────────────────────────────────────
function DashboardView({ events, approved, pending, onApprove, onDelete }) {
  const catCounts = Object.keys(CATEGORIES)
    .map(cat => ({ cat, count: approved.filter(e => e.category === cat).length }))
    .filter(x => x.count > 0);
  const maxCat = Math.max(...catCounts.map(x => x.count), 1);

  return (
    <div className="main">
      <div className="slbl">— ANALYTICS</div>
      <div className="dash-grid">
        {[
          { n: approved.length,                                                                       l: "Approved"      },
          { n: pending.length,                                                                        l: "Pending"       },
          { n: approved.filter(e => e.recurring).length,                                             l: "Recurring"     },
          { n: approved.filter(e => e.priority === "High").length,                                   l: "High Priority" },
          { n: Object.keys(CATEGORIES).filter(c => approved.some(e => e.category === c)).length,     l: "Categories"    },
          { n: approved.filter(e => e.date >= todayStr()).length,                                     l: "Upcoming"      },
        ].map(({ n, l }) => (
          <div key={l} className="stc"><div className="stn">{n}</div><div className="stl">{l.toUpperCase()}</div></div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "start" }}>
        <div className="sc">
          <div className="sc-title">CATEGORY BREAKDOWN</div>
          {catCounts.map(({ cat, count }) => (
            <div key={cat} className="brow">
              <div className="blbl">{CATEGORIES[cat]?.icon} {cat.replace("_", " ")}</div>
              <div className="btrk"><div className="bfil" style={{ width: `${(count / maxCat) * 100}%`, background: CATEGORIES[cat]?.color }} /></div>
              <div className="bct">{count}</div>
            </div>
          ))}
        </div>
        <div className="sc">
          <div className="sc-title">PENDING APPROVALS</div>
          {pending.length === 0
            ? <div style={{ fontSize: 12, color: TEXT_MUTED }}>All caught up.</div>
            : pending.map(ev => (
              <div key={ev.id} className="pi">
                <div><div className="pn">{ev.name}</div><div className="ps">{ev.date} · {ev.submittedBy}</div></div>
                <div className="pb">
                  <button className="ok" onClick={() => onApprove(ev.id)}>✓</button>
                  <button className="no" onClick={() => onDelete(ev.id)}>✕</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ─── EVENT FORM ───────────────────────────────────────────────────────────────
function EForm({ initial, onSubmit, onCancel, submitLabel, showDelete, onDelete }) {
  const blank = { name: "", date: "", time: "", endTime: "", location: "", description: "", category: "Mentoring", priority: "Medium", submittedBy: "", recurring: false, approved: false };
  const [f, setF] = useState(initial || blank);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const handle = () => {
    if (!f.name || !f.date || !f.time || !f.location || !f.submittedBy) { alert("Please fill required fields."); return; }
    onSubmit({ ...f });
  };
  return (
    <div className="form">
      <div className="field"><label>SUBMITTED BY *</label><input placeholder="Your name" value={f.submittedBy} onChange={e => set("submittedBy", e.target.value)} /></div>
      <div className="field"><label>EVENT NAME *</label><input placeholder="e.g. Resume Workshop" value={f.name} onChange={e => set("name", e.target.value)} /></div>
      <div className="frow">
        <div className="field"><label>DATE *</label><input type="date" value={f.date} onChange={e => set("date", e.target.value)} /></div>
        <div className="field"><label>CATEGORY</label>
          <select value={f.category} onChange={e => set("category", e.target.value)}>
            {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{CATEGORIES[c].icon} {c.replace("_", " ")}</option>)}
          </select>
        </div>
      </div>
      <div className="frow">
        <div className="field"><label>START TIME *</label><input placeholder="e.g. 10:00 AM" value={f.time} onChange={e => set("time", e.target.value)} /></div>
        <div className="field"><label>END TIME</label><input placeholder="e.g. 12:00 PM" value={f.endTime} onChange={e => set("endTime", e.target.value)} /></div>
      </div>
      <div className="field"><label>LOCATION *</label><input placeholder="Building, Room, or Address" value={f.location} onChange={e => set("location", e.target.value)} /></div>
      <div className="field"><label>DESCRIPTION</label><textarea placeholder="What should attendees know?" value={f.description} onChange={e => set("description", e.target.value)} /></div>
      <div className="frow">
        <div className="field"><label>PRIORITY</label>
          <select value={f.priority} onChange={e => set("priority", e.target.value)}>
            <option value="High">⭐ High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="field"><label>RECURRING?</label>
          <select value={f.recurring ? "yes" : "no"} onChange={e => set("recurring", e.target.value === "yes")}>
            <option value="no">One-time</option>
            <option value="yes">↻ Weekly</option>
          </select>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
        <button className="btn btn-gold" style={{ flex: 1, padding: "9px", fontSize: 12, borderRadius: 7 }} onClick={handle}>{submitLabel}</button>
        {onCancel && <button className="btn btn-ghost" style={{ padding: "9px 12px" }} onClick={onCancel}>Cancel</button>}
      </div>
      {showDelete && <button className="btn btn-red" style={{ width: "100%", marginTop: 3, padding: "8px" }} onClick={onDelete}>🗑 Delete Event</button>}
      <p style={{ fontSize: 10, color: TEXT_MUTED, textAlign: "center" }}>* Required fields</p>
    </div>
  );
}
