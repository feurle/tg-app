import { useState } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
// Font: DM Sans (clean, modern, slightly characterful) + DM Mono for accents
// Color: Warm white base, slate grays, emerald accent (Tier Gesund = nature/health)
// Rhythm: 8pt grid, generous whitespace, subtle borders

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap";
document.head.appendChild(fontLink);

const style = document.createElement("style");
style.textContent = `
  * { font-family: 'DM Sans', sans-serif; }
  .mono { font-family: 'DM Mono', monospace; }
  
  :root {
    --bg: #FAFAF8;
    --surface: #FFFFFF;
    --border: #E8E6E1;
    --border-strong: #D4D0C8;
    --text-primary: #1A1916;
    --text-secondary: #6B6860;
    --text-muted: #9C9A94;
    --accent: #16A34A;
    --accent-light: #DCFCE7;
    --accent-hover: #15803D;
    --danger: #DC2626;
    --danger-light: #FEE2E2;
    --warning: #D97706;
    --warning-light: #FEF3C7;
  }

  body { background: var(--bg); }

  .tab-btn {
    padding: 8px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    border: none;
  }
  .tab-btn.active {
    background: var(--text-primary);
    color: white;
  }
  .tab-btn:not(.active) {
    background: transparent;
    color: var(--text-secondary);
  }
  .tab-btn:not(.active):hover {
    background: var(--border);
    color: var(--text-primary);
  }

  /* Navbar */
  .navbar {
    height: 60px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .nav-logo {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.3px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .nav-logo-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
  }
  .nav-links {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .nav-link {
    padding: 6px 14px;
    border-radius: 7px;
    font-size: 14px;
    font-weight: 400;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.12s ease;
    text-decoration: none;
  }
  .nav-link:hover, .nav-link.active {
    background: var(--bg);
    color: var(--text-primary);
  }
  .nav-link.active {
    font-weight: 500;
  }
  .nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .lang-btn {
    padding: 5px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-muted);
    background: var(--bg);
    border: 1px solid var(--border);
    cursor: pointer;
    font-family: 'DM Mono', monospace;
    transition: all 0.12s;
  }
  .lang-btn:hover { color: var(--text-primary); border-color: var(--border-strong); }
  .btn-primary {
    padding: 8px 18px;
    background: var(--text-primary);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    letter-spacing: -0.1px;
  }
  .btn-primary:hover { background: #2D2C29; transform: translateY(-1px); }
  .btn-secondary {
    padding: 7px 16px;
    background: var(--surface);
    color: var(--text-primary);
    border: 1px solid var(--border-strong);
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-secondary:hover { border-color: var(--text-primary); }
  .btn-danger {
    padding: 7px 16px;
    background: var(--danger-light);
    color: var(--danger);
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-danger:hover { background: #FECACA; }
  .btn-accent {
    padding: 8px 18px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-accent:hover { background: var(--accent-hover); transform: translateY(-1px); }

  /* Footer */
  .footer {
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .footer-brand {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
  }
  .footer-copy {
    font-size: 13px;
    color: var(--text-muted);
  }
  .footer-links {
    display: flex;
    gap: 20px;
  }
  .footer-link {
    font-size: 13px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: color 0.12s;
  }
  .footer-link:hover { color: var(--text-primary); }

  /* Public Page */
  .hero {
    padding: 80px 32px 64px;
    max-width: 900px;
    margin: 0 auto;
  }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    background: var(--accent-light);
    color: var(--accent);
    border-radius: 100px;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 24px;
  }
  .hero-title {
    font-size: 48px;
    font-weight: 300;
    color: var(--text-primary);
    line-height: 1.15;
    letter-spacing: -1.5px;
    margin-bottom: 20px;
  }
  .hero-title strong {
    font-weight: 600;
  }
  .hero-sub {
    font-size: 17px;
    color: var(--text-secondary);
    line-height: 1.6;
    max-width: 520px;
    margin-bottom: 36px;
    font-weight: 300;
  }
  .hero-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  /* Article Grid */
  .section {
    padding: 0 32px 64px;
    max-width: 900px;
    margin: 0 auto;
  }
  .section-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
  }
  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.4px;
  }
  .section-link {
    font-size: 13px;
    color: var(--accent);
    cursor: pointer;
    font-weight: 500;
  }
  .article-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .article-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .article-card:hover {
    border-color: var(--border-strong);
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  }
  .article-card-tag {
    font-size: 11px;
    font-weight: 500;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
  }
  .article-card-title {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1.4;
    margin-bottom: 8px;
    letter-spacing: -0.2px;
  }
  .article-card-excerpt {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
    font-weight: 300;
  }
  .article-card-date {
    margin-top: 14px;
    font-size: 12px;
    color: var(--text-muted);
    font-family: 'DM Mono', monospace;
  }

  /* Sidebar Layout */
  .app-shell {
    display: flex;
    height: calc(100vh - 60px);
    overflow: hidden;
  }
  .sidebar {
    width: 220px;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    padding: 16px 12px;
  }
  .sidebar-section-label {
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--text-muted);
    padding: 0 8px;
    margin: 16px 0 6px;
  }
  .sidebar-section-label:first-child { margin-top: 4px; }
  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 400;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.12s;
  }
  .sidebar-item:hover { background: var(--bg); color: var(--text-primary); }
  .sidebar-item.active {
    background: var(--accent-light);
    color: var(--accent);
    font-weight: 500;
  }
  .sidebar-icon { font-size: 15px; width: 18px; text-align: center; }
  .sidebar-footer {
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }
  .user-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 8px;
  }
  .user-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--accent-light);
    color: var(--accent);
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .user-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
  .user-role { font-size: 11px; color: var(--text-muted); }

  /* Main Content */
  .main-content {
    flex: 1;
    overflow-y: auto;
    background: var(--bg);
  }
  .page-header {
    padding: 28px 32px 0;
    margin-bottom: 24px;
  }
  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.6px;
    margin-bottom: 4px;
  }
  .page-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
    font-weight: 300;
  }
  .page-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
  }

  /* Table */
  .table-container {
    margin: 0 32px 32px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
  }
  .table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
  }
  .search-input {
    padding: 7px 12px 7px 34px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 13px;
    color: var(--text-primary);
    outline: none;
    width: 220px;
    transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
    position: relative;
  }
  .search-input:focus { border-color: var(--border-strong); background: white; }
  .search-wrap { position: relative; }
  .search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    font-size: 13px;
  }
  table { width: 100%; border-collapse: collapse; }
  thead tr { border-bottom: 1px solid var(--border); }
  th {
    padding: 11px 16px;
    text-align: left;
    font-size: 11.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
  }
  td {
    padding: 13px 16px;
    font-size: 13.5px;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border);
  }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover td { background: var(--bg); }
  .td-secondary { color: var(--text-secondary); font-size: 13px; }
  .td-mono { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--text-secondary); }

  /* Badges */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 9px;
    border-radius: 100px;
    font-size: 11.5px;
    font-weight: 500;
  }
  .badge-green { background: var(--accent-light); color: var(--accent); }
  .badge-yellow { background: var(--warning-light); color: var(--warning); }
  .badge-red { background: var(--danger-light); color: var(--danger); }
  .badge-gray { background: var(--bg); color: var(--text-secondary); border: 1px solid var(--border); }

  /* Row actions */
  .row-actions { display: flex; gap: 6px; }
  .icon-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    transition: all 0.12s;
  }
  .icon-btn:hover { border-color: var(--text-primary); color: var(--text-primary); }
  .icon-btn.danger:hover { border-color: var(--danger); color: var(--danger); background: var(--danger-light); }

  /* Stats */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding: 0 32px;
    margin-bottom: 24px;
  }
  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
  }
  .stat-label { font-size: 12px; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 8px; }
  .stat-value { font-size: 28px; font-weight: 600; color: var(--text-primary); letter-spacing: -1px; }
  .stat-delta { font-size: 12px; color: var(--accent); margin-top: 4px; font-weight: 500; }

  /* Pagination */
  .pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-top: 1px solid var(--border);
  }
  .pagination-info { font-size: 12.5px; color: var(--text-muted); }
  .pagination-btns { display: flex; gap: 4px; }
  .page-btn {
    width: 30px;
    height: 30px;
    border-radius: 7px;
    border: 1px solid var(--border);
    background: var(--surface);
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    transition: all 0.12s;
  }
  .page-btn:hover { border-color: var(--text-primary); color: var(--text-primary); }
  .page-btn.active { background: var(--text-primary); color: white; border-color: var(--text-primary); }

  /* Login Page */
  .login-page {
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .login-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 40px;
    width: 380px;
  }
  .login-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 32px;
  }
  .login-title { font-size: 22px; font-weight: 600; color: var(--text-primary); letter-spacing: -0.5px; margin-bottom: 6px; }
  .login-sub { font-size: 14px; color: var(--text-secondary); font-weight: 300; margin-bottom: 28px; }
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 13px; font-weight: 500; color: var(--text-primary); margin-bottom: 6px; }
  .form-input {
    width: 100%;
    padding: 9px 12px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 14px;
    color: var(--text-primary);
    outline: none;
    transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
    box-sizing: border-box;
  }
  .form-input:focus { border-color: var(--text-primary); background: white; }
  .form-input::placeholder { color: var(--text-muted); }
  .login-submit {
    width: 100%;
    padding: 11px;
    background: var(--text-primary);
    color: white;
    border: none;
    border-radius: 9px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    margin-top: 8px;
    transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .login-submit:hover { background: #2D2C29; }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 28px 0;
  }
`;
document.head.appendChild(style);

// ─── Data ─────────────────────────────────────────────────────────────────────
const articles = [
  { id: 1, tag: "Ernährung", title: "Optimale Futterplanung für Ihren Hund im Winter", excerpt: "Warum Hunde in der kalten Jahreszeit mehr Energie benötigen.", date: "12.01.2025" },
  { id: 2, tag: "Gesundheit", title: "Früherkennung von Gelenkserkrankungen bei Katzen", excerpt: "Symptome die Sie kennen sollten und wann ein Tierarztbesuch nötig ist.", date: "08.01.2025" },
  { id: 3, tag: "Pflege", title: "Fellpflege im Fellwechsel: Tipps für Tierhalter", excerpt: "Mit der richtigen Pflegeroutine durch die Übergangsjahreszeit.", date: "03.01.2025" },
];

const customers = [
  { id: 1, name: "Maria Hofer", email: "m.hofer@email.at", city: "Wien", animals: "Hund, Katze", status: "active" },
  { id: 2, name: "Thomas Gruber", email: "t.gruber@gmail.com", city: "Graz", animals: "Pferd", status: "active" },
  { id: 3, name: "Anna Berger", email: "anna.b@outlook.com", city: "Linz", animals: "Katze", status: "inactive" },
  { id: 4, name: "Klaus Schneider", email: "k.schneider@web.at", city: "Salzburg", animals: "Hund", status: "active" },
  { id: 5, name: "Eva Müller", email: "eva.m@email.com", city: "Innsbruck", animals: "Vogel, Hund", status: "pending" },
];

// ─── Components ───────────────────────────────────────────────────────────────

function Navbar({ activePage, onNavigate, isLoggedIn }) {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <div className="nav-logo-dot" />
        Tier Gesund
      </div>
      <div className="nav-links">
        <a className={`nav-link ${activePage === "home" ? "active" : ""}`} onClick={() => onNavigate("home")}>Home</a>
        <a className={`nav-link ${activePage === "news" ? "active" : ""}`} onClick={() => onNavigate("news")}>News</a>
        {isLoggedIn && <a className={`nav-link ${activePage === "customers" ? "active" : ""}`} onClick={() => onNavigate("customers")}>Verwaltung</a>}
      </div>
      <div className="nav-right">
        {["DE", "EN"].map(l => <button key={l} className="lang-btn">{l}</button>)}
        {isLoggedIn
          ? <button className="btn-secondary" onClick={() => onNavigate("home", false)}>Abmelden</button>
          : <button className="btn-primary" onClick={() => onNavigate("login")}>Anmelden</button>
        }
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div>
        <div className="footer-brand">Tier Gesund</div>
        <div className="footer-copy">© 2025 Tier Gesund GmbH</div>
      </div>
      <div className="footer-links">
        {["Datenschutz", "Impressum", "Kontakt"].map(l => <span key={l} className="footer-link">{l}</span>)}
      </div>
    </footer>
  );
}

function HomePage({ onNavigate }) {
  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 60px)" }}>
      <div className="hero">
        <div className="hero-tag">
          <span>🌿</span> Tiergesundheit im Fokus
        </div>
        <h1 className="hero-title">
          Gesunde Tiere,<br />
          <strong>glückliche Halter.</strong>
        </h1>
        <p className="hero-sub">
          Expertenwissen rund um Tierernährung, Vorsorge und Pflege — verständlich aufbereitet für jeden Tierhalter.
        </p>
        <div className="hero-actions">
          <button className="btn-primary">Artikel entdecken</button>
          <button className="btn-secondary">Mehr erfahren</button>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <span className="section-title">Aktuelle Artikel</span>
          <span className="section-link" onClick={() => onNavigate("news")}>Alle anzeigen →</span>
        </div>
        <div className="article-grid-3">
          {articles.map(a => (
            <div key={a.id} className="article-card">
              <div className="article-card-tag">{a.tag}</div>
              <div className="article-card-title">{a.title}</div>
              <div className="article-card-excerpt">{a.excerpt}</div>
              <div className="article-card-date">{a.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NewsPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 60px)" }}>
      <div className="hero" style={{ paddingBottom: 32 }}>
        <h1 className="hero-title" style={{ fontSize: 36 }}><strong>News & Artikel</strong></h1>
        <p className="hero-sub" style={{ marginBottom: 0 }}>Alle Beiträge rund um Tiergesundheit, Ernährung und Pflege.</p>
      </div>
      <div className="section">
        <div className="article-grid-3">
          {[...articles, ...articles].map((a, i) => (
            <div key={i} className="article-card">
              <div className="article-card-tag">{a.tag}</div>
              <div className="article-card-title">{a.title}</div>
              <div className="article-card-excerpt">{a.excerpt}</div>
              <div className="article-card-date">{a.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ activePage, onNavigate }) {
  const items = [
    { label: "Übersicht", icon: "◻", page: "dashboard" },
    { section: "Verwaltung" },
    { label: "Kunden", icon: "◻", page: "customers" },
    { label: "Benutzer", icon: "◻", page: "users" },
    { label: "Artikel", icon: "◻", page: "articles" },
  ];
  return (
    <aside className="sidebar">
      {items.map((item, i) =>
        item.section
          ? <div key={i} className="sidebar-section-label">{item.section}</div>
          : <div key={i} className={`sidebar-item ${activePage === item.page ? "active" : ""}`} onClick={() => onNavigate(item.page)}>
              <span className="sidebar-icon" style={{ fontSize: 10, opacity: 0.6 }}>●</span>
              {item.label}
            </div>
      )}
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">AD</div>
          <div>
            <div className="user-name">Admin</div>
            <div className="user-role">Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function CustomersPage() {
  const [search, setSearch] = useState("");
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );
  const statusBadge = (s) => {
    if (s === "active") return <span className="badge badge-green">Aktiv</span>;
    if (s === "inactive") return <span className="badge badge-gray">Inaktiv</span>;
    return <span className="badge badge-yellow">Ausstehend</span>;
  };
  return (
    <div className="main-content">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="page-title">Kundenverwaltung</div>
            <div className="page-subtitle">Alle registrierten Kunden und deren Tiere</div>
          </div>
          <button className="btn-accent">+ Neuer Kunde</button>
        </div>
      </div>

      <div className="stats-row">
        {[
          { label: "Kunden gesamt", value: "52", delta: "+3 diesen Monat" },
          { label: "Aktiv", value: "41", delta: "79% Aktivrate" },
          { label: "Neue diese Woche", value: "4", delta: "+2 vs. Vorwoche" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-delta">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Suchen..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary">Export</button>
            <button className="btn-secondary">Filter</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Stadt</th>
              <th>Tiere</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td className="td-secondary">{c.email}</td>
                <td className="td-secondary">{c.city}</td>
                <td className="td-secondary">{c.animals}</td>
                <td>{statusBadge(c.status)}</td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" title="Bearbeiten">✏️</button>
                    <button className="icon-btn danger" title="Löschen">🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <span className="pagination-info">Zeige {filtered.length} von {customers.length} Kunden</span>
          <div className="pagination-btns">
            {[1, 2, 3].map(n => <button key={n} className={`page-btn ${n === 1 ? "active" : ""}`}>{n}</button>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ onLogin }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="nav-logo-dot" />
          <span style={{ fontWeight: 600, fontSize: 16, color: "var(--text-primary)" }}>Tier Gesund</span>
        </div>
        <div className="login-title">Willkommen zurück</div>
        <div className="login-sub">Melden Sie sich an um fortzufahren</div>
        <div className="form-group">
          <label className="form-label">Benutzername</label>
          <input className="form-input" defaultValue="admin" />
        </div>
        <div className="form-group">
          <label className="form-label">Passwort</label>
          <input className="form-input" type="password" defaultValue="••••••" />
        </div>
        <button className="login-submit" onClick={onLogin}>Anmelden</button>
        <div className="divider" />
        <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
          Zugang nur für autorisierte Benutzer
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = (p, loggedIn) => {
    if (loggedIn === false) setIsLoggedIn(false);
    setPage(p);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setPage("customers");
  };

  const isPrivate = ["customers", "users", "articles", "dashboard"].includes(page);
  const showNavbar = page !== "login";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {showNavbar && <Navbar activePage={page} onNavigate={navigate} isLoggedIn={isLoggedIn} />}

      <div style={{ flex: 1 }}>
        {page === "login" && <LoginPage onLogin={handleLogin} />}
        {page === "home" && <HomePage onNavigate={navigate} />}
        {page === "news" && <NewsPage />}

        {isPrivate && isLoggedIn && (
          <div className="app-shell">
            <Sidebar activePage={page} onNavigate={setPage} />
            {page === "customers" && <CustomersPage />}
            {["users", "articles", "dashboard"].includes(page) && (
              <div className="main-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>◻</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text-secondary)" }}>
                    {page.charAt(0).toUpperCase() + page.slice(1)}verwaltung
                  </div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>Seite in Entwicklung</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {!isPrivate && page !== "login" && <Footer />}
    </div>
  );
}
