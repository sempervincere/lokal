// LOKAL — Business Owner Dashboard
const { useState, useEffect, useRef } = React;

// ── Sidebar ──────────────────────────────────────────────────────────
function BOSidebar({ page, setPage, lang, onLogout, walletConnected, onConnectWallet }) {
  const L = LANG[lang].dash;
  const nav = [
    { id: 'overview', icon: 'Activity', label: L.overview },
    { id: 'clusters', icon: 'MapPin', label: L.clusters },
    { id: 'history', icon: 'FileText', label: L.history },
    { id: 'subscription', icon: 'CreditCard', label: L.subscription },
  ];
  return (
    <div style={{ width: 240, background: T.c50, borderRight: `1px solid ${T.c200}`, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.c200}` }}>
        <img src="uploads/Logo-LOKAL-AI-remove.png" alt="LOKAL" style={{ height: 28, objectFit: 'contain' }} />
      </div>
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {nav.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
            border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: page === n.id ? 600 : 500,
            color: page === n.id ? T.p600 : T.g700, background: page === n.id ? T.p100 : 'transparent',
            transition: 'all 150ms', textAlign: 'left', width: '100%',
          }}
            onMouseEnter={e => { if (page !== n.id) e.currentTarget.style.background = T.c100; }}
            onMouseLeave={e => { if (page !== n.id) e.currentTarget.style.background = 'transparent'; }}
          >
            <Icon name={n.icon} size={17} color={page === n.id ? T.p600 : T.g500} />
            {n.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: '12px 10px', borderTop: `1px solid ${T.c200}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button onClick={onConnectWallet} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10,
          border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
          color: walletConnected ? T.success : T.e600, background: walletConnected ? T.p100 : T.e100,
          transition: 'all 150ms', width: '100%',
        }}>
          <Icon name="Wallet" size={15} color={walletConnected ? T.success : T.e600} />
          {walletConnected ? L.walletConnected : L.wallet}
          {walletConnected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.success, marginLeft: 'auto' }} />}
        </button>
        <button onClick={onLogout} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
          border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
          color: T.g500, background: 'transparent', transition: 'all 150ms', textAlign: 'left', width: '100%',
        }}
          onMouseEnter={e => e.currentTarget.style.background = T.c100}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Icon name="LogOut" size={16} color={T.g500} />{L.logout}
        </button>
      </div>
    </div>
  );
}

// ── Top Bar ───────────────────────────────────────────────────────────
function TopBar({ title, lang, setLang, sub }) {
  return (
    <div style={{ padding: '20px 32px', borderBottom: `1px solid ${T.c200}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.c50 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.g900, margin: 0, letterSpacing: '-0.01em' }}>{title}</h1>
        {sub && <p style={{ fontSize: 13, color: T.g500, margin: '2px 0 0' }}>{sub}</p>}
      </div>
      <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} style={{
        background: T.c200, border: 'none', cursor: 'pointer', padding: '7px 14px',
        borderRadius: 9999, fontSize: 12, fontWeight: 700, color: T.g700,
        fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <Icon name="Globe" size={13} color={T.g500} />{lang.toUpperCase()}
      </button>
    </div>
  );
}

// ── Overview Page ─────────────────────────────────────────────────────
function BOOverview({ lang }) {
  const L = LANG[lang].dash;
  const stats = [
    { icon: 'CreditCard', label: L.credits, value: '2', sub: 'Pay-per-use', trend: null, color: T.p600 },
    { icon: 'FileText', label: L.sessions, value: '3', sub: lang === 'id' ? 'sesi total' : 'total sessions', trend: null, color: T.p600 },
    { icon: 'MapPin', label: L.activeClusters, value: '4', sub: lang === 'id' ? 'cluster aktif' : 'active clusters', trend: 25, color: T.p600 },
    { icon: 'Star', label: L.avgScore, value: '70', sub: lang === 'id' ? 'rata-rata skor' : 'avg score', trend: 3, color: T.warning },
  ];
  return (
    <div style={{ padding: '28px 32px', flex: 1, overflowY: 'auto' }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em' }}>
          {L.greeting}, Budi 👋
        </div>
        <div style={{ fontSize: 14, color: T.g500, marginTop: 4 }}>
          {lang === 'id' ? 'Berikut ringkasan aktivitas kamu di LOKAL.' : 'Here\'s a summary of your LOKAL activity.'}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32, marginTop: 24 }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>
      {/* Recent simulations */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 16 }}>{L.recentSims}</div>
        <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.c200}` }}>
                {[lang === 'id' ? 'Cluster' : 'Cluster', lang === 'id' ? 'Konsep' : 'Concept', lang === 'id' ? 'Tanggal' : 'Date', 'Status', lang === 'id' ? 'Skor' : 'Score', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.g500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_SESSIONS.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < MOCK_SESSIONS.length - 1 ? `1px solid ${T.c200}` : 'none', transition: 'background 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = T.c100}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: T.g900 }}>{s.cluster}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: T.g700 }}>{s.concept}</td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: T.g500 }}>{s.date}</td>
                  <td style={{ padding: '14px 16px' }}><Badge variant={s.paid ? 'active' : 'neutral'}>{s.status}</Badge></td>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: s.score ? (s.score >= 70 ? T.success : T.warning) : T.g500, fontVariantNumeric: 'tabular-nums' }}>{s.score ? `${s.score}/100` : '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    {s.paid && <button style={{ background: T.p100, border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: T.p600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {lang === 'id' ? 'Lihat' : 'View'}
                    </button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Quick actions */}
      <div style={{ background: T.p100, borderRadius: 16, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.p600, marginBottom: 6 }}>
            {lang === 'id' ? 'Siap validasi konsep baru?' : 'Ready to validate a new concept?'}
          </div>
          <div style={{ fontSize: 13, color: T.p500 }}>
            {lang === 'id' ? 'Jelajahi 4 cluster aktif dan mulai chat gratis sekarang.' : 'Browse 4 active clusters and start a free chat now.'}
          </div>
        </div>
        <Btn icon={<Icon name="MapPin" size={16} color={T.c50} />} style={{ flexShrink: 0 }}>
          {lang === 'id' ? 'Jelajahi Cluster' : 'Browse Clusters'}
        </Btn>
      </div>
    </div>
  );
}

// ── Cluster Browse ────────────────────────────────────────────────────
function BOClusters({ lang }) {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const L = LANG[lang];

  const cities = [
    { id: 'all', label: lang === 'id' ? 'Semua' : 'All' },
    { id: 'Depok', label: 'Depok' },
    { id: 'Jakarta Selatan', label: 'Jaksel' },
    { id: 'Tangerang Selatan', label: 'Tangsel' },
    { id: 'Surabaya', label: 'Surabaya' },
  ];
  const filtered = CLUSTERS.filter(c => {
    const q = search.toLowerCase();
    const mq = !q || c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q) || c.neighborhood.toLowerCase().includes(q);
    const mc = cityFilter === 'all' || c.city === cityFilter;
    return mq && mc;
  });

  // ⚠️ Order matters: most specific states first
  if (reportOpen && selected) return <BOReport cluster={selected} lang={lang} onBack={() => setReportOpen(false)} />;
  if (formOpen && selected) return <BOConceptForm cluster={selected} lang={lang} onBack={() => setFormOpen(false)} onSubmit={() => { setFormOpen(false); setReportOpen(true); }} />;
  if (paywallOpen && selected) return <BOPaywall cluster={selected} lang={lang} onClose={() => { setPaywallOpen(false); }} onContinue={() => { setPaywallOpen(false); setFormOpen(true); }} />;
  if (chatOpen && selected) return <BOChat cluster={selected} lang={lang} onBack={() => { setChatOpen(false); setSelected(null); }} onPaywall={() => { setChatOpen(false); setPaywallOpen(true); }} onSkip={() => { setChatOpen(false); setPaywallOpen(true); }} />;
  if (selected) return <BOClusterDetail cluster={selected} lang={lang} onBack={() => setSelected(null)} onChat={() => setChatOpen(true)} onSkipToReport={() => { setPaywallOpen(true); }} />;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 260px' }}>
          <Input placeholder={lang === 'id' ? 'Cari cluster, kota, atau area...' : 'Search clusters, cities, areas...'}
            value={search} onChange={e => setSearch(e.target.value)} prefix={<Icon name="Search" size={16} color={T.g500} />} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {cities.map(c => (
            <button key={c.id} onClick={() => setCityFilter(c.id)} style={{
              padding: '9px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              background: cityFilter === c.id ? T.p600 : T.c200, color: cityFilter === c.id ? T.c50 : T.g700, transition: 'all 150ms',
            }}>{c.label}</button>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 12, color: T.g500, marginBottom: 16 }}>{filtered.length} {lang === 'id' ? 'cluster ditemukan' : 'clusters found'}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
        {filtered.map((c, i) => <BOClusterCard key={c.id} cluster={c} lang={lang} onSelect={() => setSelected(c)} delay={i * 60} />)}
      </div>
    </div>
  );
}

function BOClusterCard({ cluster: c, lang, onSelect, delay }) {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, []);
  return (
    <div onClick={onSelect} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: T.c50, borderRadius: 16, border: `1px solid ${T.c200}`, overflow: 'hidden', cursor: 'pointer',
        opacity: vis ? 1 : 0, transform: vis ? (hov ? 'translateY(-2px)' : 'none') : 'translateY(10px)',
        transition: `opacity 300ms ease ${delay}ms, transform 220ms, box-shadow 220ms`,
        boxShadow: hov ? '0 8px 28px rgba(26,26,26,0.10)' : '0 2px 6px rgba(26,26,26,0.04)',
      }}>
      <div style={{ position: 'relative' }}>
        <MapPlaceholder accent={c.accent} color={c.iconColor} height={110} />
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <Badge variant={c.status === 'Active' ? 'active' : 'seeding'}>{c.status}</Badge>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <ConfRing score={c.confidence} size={42} />
        </div>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 2 }}>{c.name}</div>
        <div style={{ fontSize: 12, color: T.g500, marginBottom: 12 }}>{c.subtitle} · {c.neighborhood}</div>
        {/* Key stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7, marginBottom: 12 }}>
          {[
            { l: 'Price Ceiling', v: `Rp ${(c.keyStats.priceCeiling/1000).toFixed(0)}K`, col: T.p600 },
            { l: 'ZK Data', v: `${c.zkPoints} pts`, col: T.g900 },
            { l: lang === 'id' ? 'Diperbarui' : 'Updated', v: `${c.freshness}j`, col: T.g900 },
          ].map(s => (
            <div key={s.l} style={{ background: T.c100, borderRadius: 8, padding: '8px 9px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.l}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.col, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
            </div>
          ))}
        </div>
        {/* Completeness bar */}
        <ProgressBar value={c.completeness} label={lang === 'id' ? 'Kelengkapan data' : 'Data completeness'} color={c.iconColor} height={4} />
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          {c.categories.slice(0, 3).map(cat => <Badge key={cat} variant="neutral" style={{ fontSize: 10 }}>{cat}</Badge>)}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Btn size="sm" full onClick={onSelect} icon={<Icon name="Eye" size={13} color={T.c50} />}>
            {lang === 'id' ? 'Lihat Detail' : 'View Detail'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── Cluster Detail ────────────────────────────────────────────────────
function BOClusterDetail({ cluster: c, lang, onBack, onChat, onSkipToReport }) {
  const [tab, setTab] = useState('overview');
  const tabs = [
    { id: 'overview', label: lang === 'id' ? 'Overview' : 'Overview' },
    { id: 'insights', label: lang === 'id' ? 'Market Signals' : 'Market Signals' },
    { id: 'about', label: lang === 'id' ? 'Tentang Cluster' : 'About Cluster' },
  ];
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: T.g500, marginBottom: 20, fontFamily: 'inherit' }}>
        <Icon name="ChevronLeft" size={16} color={T.g500} /> {lang === 'id' ? 'Kembali ke daftar' : 'Back to list'}
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Left */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <Badge variant={c.status === 'Active' ? 'active' : 'seeding'}>{c.status}</Badge>
                <Badge variant="dark"><Icon name="ShieldCheck" size={10} color={T.c50} /> {c.zkPoints} data points</Badge>
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: T.g900, letterSpacing: '-0.02em', margin: '0 0 4px' }}>{c.name}</h2>
              <p style={{ fontSize: 14, color: T.g500, margin: 0 }}>{c.anchor} · {c.neighborhood}</p>
            </div>
            <ConfRing score={c.confidence} size={56} />
          </div>
          <MapPlaceholder accent={c.accent} color={c.iconColor} height={200} label={c.anchor} />
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, margin: '20px 0', borderBottom: `1px solid ${T.c200}` }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? T.p600 : T.g500,
                borderBottom: `2px solid ${tab === t.id ? T.p600 : 'transparent'}`, marginBottom: -1, transition: 'all 150ms',
              }}>{t.label}</button>
            ))}
          </div>
          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { l: 'Price Ceiling (Café)', v: `Rp ${(c.keyStats.priceCeiling/1000).toFixed(0)}.000`, icon: 'TrendingDown' },
                { l: lang === 'id' ? 'Digital Payment' : 'Digital Payment', v: `${c.keyStats.digitalPayment}% adoption`, icon: 'CreditCard' },
                { l: lang === 'id' ? 'Peak Hours' : 'Peak Hours', v: c.keyStats.peakHour, icon: 'Clock' },
                { l: lang === 'id' ? 'Dominan Usia' : 'Dominant Age', v: c.keyStats.dominantAge, icon: 'Users' },
                { l: lang === 'id' ? 'Traffic Level' : 'Traffic Level', v: c.traffic, icon: 'Activity' },
                { l: lang === 'id' ? 'Saturasi Pasar' : 'Market Saturation', v: c.saturation, icon: 'BarChart2' },
              ].map(s => (
                <div key={s.l} style={{ background: T.c100, borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: T.c50, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={s.icon} size={16} color={T.p600} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.g900, marginTop: 2 }}>{s.v}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === 'insights' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Price intelligence */}
              <div style={{ background: T.p100, borderRadius: 14, padding: '18px 20px', border: `1px solid ${T.p400}22` }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.p600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                  {lang === 'id' ? 'Intelijen Harga' : 'Price Intelligence'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { l: lang === 'id' ? 'Price Ceiling Café' : 'Café Price Ceiling', v: `Rp ${(c.keyStats.priceCeiling/1000).toFixed(0)}.000` },
                    { l: lang === 'id' ? 'Willingness to Pay' : 'Willingness to Pay', v: `Rp ${(c.keyStats.willingness/1000).toFixed(0)}.000` },
                    { l: lang === 'id' ? 'Sweet Spot Konversi' : 'Conversion Sweet Spot', v: `Rp ${(c.keyStats.willingness*0.75/1000).toFixed(0)}K–${(c.keyStats.willingness/1000).toFixed(0)}K` },
                    { l: lang === 'id' ? 'Sensitivitas Harga' : 'Price Sensitivity', v: '7.2 / 10' },
                  ].map(s => <div key={s.l} style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.p600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.l}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginTop: 4, fontVariantNumeric: 'tabular-nums', fontFamily: 'JetBrains Mono, monospace' }}>{s.v}</div>
                  </div>)}
                </div>
              </div>
              {/* Behavioral signals */}
              <div style={{ background: T.c100, borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                  {lang === 'id' ? 'Sinyal Perilaku Konsumen' : 'Consumer Behavior Signals'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { l: lang === 'id' ? 'Adopsi Pembayaran Digital' : 'Digital Payment Adoption', v: `${c.keyStats.digitalPayment}%`, bar: c.keyStats.digitalPayment },
                    { l: lang === 'id' ? 'Preferensi Delivery' : 'Delivery Preference', v: '45%', bar: 45 },
                    { l: lang === 'id' ? 'Sensitivitas Halal' : 'Halal Sensitivity', v: `${c.keyStats.halal}/5`, bar: c.keyStats.halal * 20 },
                  ].map(s => <div key={s.l}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: T.g700 }}>{s.l}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.g900 }}>{s.v}</span>
                    </div>
                    <div style={{ height: 5, background: T.c200, borderRadius: 9999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s.bar}%`, background: T.p600, borderRadius: 9999 }} />
                    </div>
                  </div>)}
                </div>
              </div>
              {/* Dining patterns */}
              <div style={{ background: T.c100, borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  {lang === 'id' ? 'Pola Kunjungan' : 'Visit Patterns'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { l: lang === 'id' ? 'Hangout / Nongkrong' : 'Hangout / Chill', v: '60%' },
                    { l: lang === 'id' ? 'Quick Meal' : 'Quick Meal', v: '25%' },
                    { l: lang === 'id' ? 'Peak Weekday' : 'Peak Weekday', v: c.keyStats.peakHour },
                    { l: lang === 'id' ? 'Lag Adopsi Tren' : 'Trend Adoption Lag', v: '3–4 minggu' },
                  ].map(s => <div key={s.l} style={{ background: T.c50, borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: T.g500, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.g900, marginTop: 3 }}>{s.v}</div>
                  </div>)}
                </div>
              </div>
              <div style={{ padding: '12px 14px', background: T.e100, borderRadius: 10, fontSize: 12, color: T.e600, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Icon name="Lock" size={14} color={T.e600} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{lang === 'id' ? 'Analisis mendalam — termasuk breakdown kompetitor, simulasi revenue, dan strategi lokasi — tersedia di laporan simulasi penuh.' : 'Deep analysis — including competitor breakdown, revenue simulation, and location strategy — is available in the full simulation report.'}</span>
              </div>
            </div>
          )}
          {tab === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: 'MapPin', l: lang === 'id' ? 'Anchor Point' : 'Anchor Point', v: c.anchor },
                { icon: 'Activity', l: lang === 'id' ? 'Tipe Anchor' : 'Anchor Type', v: c.anchorType },
                { icon: 'Users', l: lang === 'id' ? 'Kategori F&B' : 'F&B Categories', v: c.categories.join(', ') },
                { icon: 'Clock', l: lang === 'id' ? 'Radius Cluster' : 'Cluster Radius', v: '1.5 km dari anchor point' },
                { icon: 'ShieldCheck', l: 'ZK Data Points', v: `${c.zkPoints} titik data terverifikasi on-chain` },
                { icon: 'Star', l: 'Confidence Score', v: `${c.confidence}/100 berdasarkan kualitas data` },
                { icon: 'Award', l: lang === 'id' ? 'Cluster Owner Tier' : 'Cluster Owner Tier', v: `Tier ${c.coTier} — ${c.coTier === 3 ? 'Expert' : c.coTier === 2 ? 'Established' : 'New'}` },
              ].map(s => <div key={s.l} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 16px', background: T.c100, borderRadius: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: T.c50, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={s.icon} size={16} color={T.p600} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.l}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.g900, marginTop: 2 }}>{s.v}</div>
                </div>
              </div>)}
            </div>
          )}
        </div>
        {/* Right — CTA panel */}
        <div>
          <div style={{ background: T.c100, borderRadius: 16, padding: '22px', border: `1px solid ${T.c200}`, position: 'sticky', top: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.g900, marginBottom: 6 }}>
              {lang === 'id' ? 'Mulai Eksplorasi Cluster Ini' : 'Start Exploring This Cluster'}
            </div>
            <p style={{ fontSize: 13, color: T.g500, lineHeight: 1.6, margin: '0 0 18px' }}>
              {lang === 'id' ? 'Chat gratis 7 pesan dengan AI konsultan. Setelah itu, buka laporan simulasi penuh.' : '7 free chat messages with our AI consultant. Then unlock the full simulation report.'}
            </p>
            <Btn full icon={<Icon name="MessageCircle" size={15} color={T.c50} />} onClick={onChat} style={{ marginBottom: 8 }}>
              {lang === 'id' ? 'Chat Gratis Sekarang' : 'Start Free Chat'}
            </Btn>
            <div style={{ textAlign: 'center', fontSize: 12, color: T.g500, marginBottom: 10 }}>
              {lang === 'id' ? '7 pesan gratis · Tidak perlu pembayaran' : '7 free messages · No payment required'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 16px' }}>
              <div style={{ flex: 1, height: 1, background: T.c200 }} />
              <span style={{ fontSize: 11, color: T.g500, fontWeight: 600 }}>{lang === 'id' ? 'atau' : 'or'}</span>
              <div style={{ flex: 1, height: 1, background: T.c200 }} />
            </div>
            <Btn full variant="accent" icon={<Icon name="Sparkles" size={15} color={T.c50} />} onClick={onSkipToReport} style={{ marginBottom: 6 }}>
              {lang === 'id' ? 'Langsung Generate Laporan' : 'Skip to Full Report'}
            </Btn>
            <div style={{ textAlign: 'center', fontSize: 11, color: T.g500 }}>
              {lang === 'id' ? 'Rp 400.000 · Laporan 10 seksi + 12 jam konsultasi' : 'Rp 400,000 · 10-section report + 12h consultation'}
            </div>
            <div style={{ padding: '14px', background: T.c50, borderRadius: 12, border: `1px solid ${T.c200}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.g700, marginBottom: 10 }}>{lang === 'id' ? 'Laporan Penuh Mencakup:' : 'Full Report Includes:'}</div>
              {['Executive Summary','Customer Profile','Market Sizing','Competitive Analysis','Location Intel','Pricing Strategy','Product-Market Fit','Go-to-Market Plan','Risk Register','Financial Modeling'].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="Check" size={9} color={T.p600} />
                  </div>
                  <span style={{ fontSize: 12, color: T.g700 }}>{s}</span>
                </div>
              ))}
              <div style={{ marginTop: 14, padding: '12px', background: T.p100, borderRadius: 9 }}>
                <div style={{ fontSize: 11, color: T.g500 }}>{lang === 'id' ? 'Harga per sesi' : 'Price per session'}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.p600, fontVariantNumeric: 'tabular-nums', fontFamily: 'JetBrains Mono, monospace' }}>Rp 400.000</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Chat ──────────────────────────────────────────────────────────────
function BOChat({ cluster: c, lang, onBack, onPaywall, onSkip }) {
  const [msgs, setMsgs] = useState([{ id: 0, role: 'ai', text: `${lang === 'id' ? 'Halo! Saya asisten LOKAL untuk cluster' : 'Hi! I\'m your LOKAL assistant for the'} **${c.name}**. ${lang === 'id' ? 'Tanya apa saja tentang area ini. Kamu punya **7 pesan gratis**.' : 'Ask me anything about this area. You have **7 free messages**.'}` }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [used, setUsed] = useState(0);
  const listRef = useRef(null);
  const MAX = 7;
  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [msgs, typing]);

  const AI_RESPONSES = LANG[lang] === LANG.id ? [
    `Harga rata-rata kopi di ${c.name} berkisar **Rp ${(c.keyStats.willingness/1000).toFixed(0)}.000–${(c.keyStats.priceCeiling/1000).toFixed(0)}.000**. Price ceiling terverifikasi: **Rp ${(c.keyStats.priceCeiling/1000).toFixed(0)}.000**.`,
    `Segmen dominan adalah **${c.keyStats.dominantAge}**. Digital payment adoption: **${c.keyStats.digitalPayment}%**. GoPay dan OVO paling populer.`,
    `Traffic peak di cluster ini: **${c.keyStats.peakHour}**. Level traffic keseluruhan: **${c.traffic}**.`,
    `Saturasi pasar: **${c.saturation}**. Ada gap di specialty coffee lokal dengan harga accessible di bawah Rp 32.000.`,
    `Untuk konsep café, sweet spot harga adalah **Rp ${(c.keyStats.willingness/1000 * 0.8).toFixed(0)}K–${(c.keyStats.willingness/1000).toFixed(0)}K**. Di atas itu, konversi turun drastis.`,
    `Kamu sudah hampir mencapai batas pesan gratis. Buka **laporan simulasi lengkap** untuk analisis 10 seksi + konsultasi 12 jam.`,
  ] : [
    `Average coffee prices at ${c.name} range from **Rp ${(c.keyStats.willingness/1000).toFixed(0)}K–${(c.keyStats.priceCeiling/1000).toFixed(0)}K**. Verified price ceiling: **Rp ${(c.keyStats.priceCeiling/1000).toFixed(0)}K**.`,
    `The dominant segment here is **${c.keyStats.dominantAge}**. Digital payment adoption: **${c.keyStats.digitalPayment}%**. GoPay and OVO dominate.`,
    `Peak traffic: **${c.keyStats.peakHour}**. Overall traffic level: **${c.traffic}**.`,
    `Market saturation: **${c.saturation}**. There's a gap in local specialty coffee with accessible pricing under Rp 32,000.`,
    `For a café concept, the pricing sweet spot is **Rp ${(c.keyStats.willingness/1000 * 0.8).toFixed(0)}K–${(c.keyStats.willingness/1000).toFixed(0)}K**. Above that, conversion drops sharply.`,
    `You're almost at your free message limit. Unlock the **full simulation report** for a 10-section analysis + 12-hour consultation.`,
  ];

  const send = (text) => {
    if (!text.trim() || typing) return;
    const nu = used + 1;
    setUsed(nu);
    setMsgs(m => [...m, { id: Date.now(), role: 'user', text }]);
    setInput('');
    if (nu >= MAX) { setTimeout(onPaywall, 800); return; }
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const resp = AI_RESPONSES[Math.min(nu - 1, AI_RESPONSES.length - 1)];
      setMsgs(m => [...m, { id: Date.now() + 1, role: 'ai', text: resp, cta: nu >= MAX - 1 }]);
    }, 1100 + Math.random() * 500);
  };

  const bold = (t) => t.split(/\*\*(.*?)\*\*/g).map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p);
  const pct = (used / MAX) * 100;
  const barColor = used >= 6 ? T.danger : used >= 4 ? T.warning : T.p600;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.c200}`, background: T.c50, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><Icon name="ChevronLeft" size={18} color={T.g500} /></button>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="MapPin" size={18} color={c.iconColor} />
          </div>
          <div><div style={{ fontSize: 14, fontWeight: 700, color: T.g900 }}>{c.name}</div><div style={{ fontSize: 12, color: T.g500 }}>{c.zkPoints} data points · {lang === 'id' ? 'Terverifikasi' : 'Verified'}</div></div>
          <div style={{ marginLeft: 'auto' }}><Badge variant="dark"><Icon name="ShieldCheck" size={10} color={T.c50} /> ZK</Badge></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.g500 }}>{lang === 'id' ? 'Pesan gratis digunakan' : 'Free messages used'}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: barColor }}>{used}/{MAX}</span>
        </div>
        <div style={{ height: 4, background: T.c200, borderRadius: 9999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 9999, transition: 'width 300ms, background 300ms' }} />
        </div>
      </div>
      {/* Skip to Report banner */}
      <div style={{ padding: '10px 24px', background: T.e100, borderBottom: `1px solid ${T.e500}22`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: T.e600, fontWeight: 500 }}>
          {lang === 'id' ? 'Sudah yakin dengan cluster ini?' : 'Already confident about this cluster?'}
        </span>
        <button onClick={onSkip} style={{ background: T.e600, border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: T.c50, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon name="Sparkles" size={12} color={T.c50} />
          {lang === 'id' ? 'Langsung Generate Laporan →' : 'Skip → Generate Report'}
        </button>
      </div>
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '75%', padding: '12px 16px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: m.role === 'user' ? T.p600 : m.cta ? T.e100 : T.c100,
              color: m.role === 'user' ? T.c50 : T.g900, fontSize: 14, lineHeight: 1.6,
              border: m.cta ? `1px solid ${T.e500}` : 'none',
            }}>
              {bold(m.text)}
              {m.cta && <button onClick={onPaywall} style={{ marginTop: 12, width: '100%', padding: '10px', borderRadius: 10, background: T.e600, color: T.c50, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>{lang === 'id' ? 'Buka Laporan Lengkap →' : 'Unlock Full Report →'}</button>}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', gap: 5, padding: '12px 16px', background: T.c100, borderRadius: '16px 16px 16px 4px', width: 'fit-content' }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: T.g500, animation: `bounce 1.2s ease ${i*0.2}s infinite` }} />)}
          </div>
        )}
        {used === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {(lang === 'id' ? ['Berapa price ceiling di sini?','Siapa kompetitor terkuat?','Apakah cocok untuk konsep premium?'] : ['What\'s the price ceiling here?','Who are the top competitors?','Is this suitable for a premium concept?']).map((s, i) => (
              <button key={i} onClick={() => send(s)} style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${T.c200}`, background: T.c50, color: T.p600, fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 150ms' }}
                onMouseEnter={e => e.currentTarget.style.background = T.p100}
                onMouseLeave={e => e.currentTarget.style.background = T.c50}
              >{s}</button>
            ))}
          </div>
        )}
      </div>
      {/* Input */}
      <div style={{ padding: '14px 24px 20px', borderTop: `1px solid ${T.c200}`, flexShrink: 0, background: T.c50 }}>
        {used >= MAX ? (
          <Btn variant="accent" full size="lg" onClick={onPaywall} icon={<Icon name="Lock" size={16} color={T.c50} />}>
            {lang === 'id' ? 'Buka Simulasi Bisnis — Rp 400.000' : 'Unlock Business Simulation — Rp 400,000'}
          </Btn>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <Input placeholder={lang === 'id' ? 'Tanya tentang cluster ini...' : 'Ask about this cluster...'} value={input} onChange={e => setInput(e.target.value)} />
            </div>
            <button onClick={() => send(input)} disabled={!input.trim() || typing} style={{ width: 44, height: 44, borderRadius: 10, border: 'none', cursor: 'pointer', background: !input.trim() || typing ? T.c200 : T.p600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 150ms' }}>
              <Icon name="Send" size={17} color={!input.trim() || typing ? T.g500 : T.c50} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Paywall ───────────────────────────────────────────────────────────
function BOPaywall({ cluster: c, lang, onClose, onContinue }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(26,26,26,0.4)', padding: 32 }}>
      <div style={{ background: T.c50, borderRadius: 24, padding: '36px', maxWidth: 460, width: '100%', boxShadow: '0 16px 48px rgba(26,26,26,0.15)' }}>
        <Badge variant="active" style={{ marginBottom: 16 }}><Icon name="ShieldCheck" size={11} color={T.p600} /> {lang === 'id' ? 'Data Terverifikasi On-Chain' : 'On-Chain Verified Data'}</Badge>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: T.g900, margin: '0 0 8px', letterSpacing: '-0.01em' }}>{lang === 'id' ? 'Buka Simulasi Bisnis Lengkap' : 'Unlock Full Business Simulation'}</h2>
        <p style={{ fontSize: 14, color: T.g500, margin: '0 0 22px', lineHeight: 1.6 }}>{lang === 'id' ? `Analisis mendalam untuk konsep kamu di cluster ${c.name}.` : `Deep analysis for your concept at the ${c.name} cluster.`}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', background: T.c100, borderRadius: 14, marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: T.g900, fontFamily: 'JetBrains Mono, monospace', fontVariantNumeric: 'tabular-nums' }}>Rp 400.000</div>
            <div style={{ fontSize: 12, color: T.g500 }}>{lang === 'id' ? 'Satu sesi · Laporan + 12 jam konsultasi' : 'One session · Report + 12h consultation'}</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: T.g500, textDecoration: 'line-through' }}>Rp 1.25jt/jam</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.success }}>Hemat 97%</div>
          </div>
        </div>
        {['Laporan simulasi bisnis 10 seksi','Analisis harga per item menu vs price ceiling','Jendela konsultasi AI 12 jam','Unduh laporan PDF'].map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 9, alignItems: 'center' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="Check" size={11} color={T.p600} />
            </div>
            <span style={{ fontSize: 13, color: T.g700 }}>{f}</span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <Btn variant="ghost" onClick={onClose}>{lang === 'id' ? 'Batal' : 'Cancel'}</Btn>
          <Btn variant="accent" full onClick={onContinue} icon={<Icon name="ArrowRight" size={15} color={T.c50} />}>
            {lang === 'id' ? 'Isi Konsep & Bayar' : 'Fill Concept & Pay'}
          </Btn>
        </div>
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: T.g500 }}>
          {lang === 'id' ? 'GoPay · OVO · Bank Transfer · Phantom (IDRX)' : 'GoPay · OVO · Bank Transfer · Phantom (IDRX)'}
        </div>
      </div>
    </div>
  );
}

// ── Concept Form ──────────────────────────────────────────────────────
function BOConceptForm({ cluster: c, lang, onBack, onSubmit }) {
  const [step, setStep] = useState(0);
  const [sub, setSub] = useState('');
  const [name, setName] = useState('');
  const [tier, setTier] = useState('');
  const [target, setTarget] = useState('');
  const [menu, setMenu] = useState([{ name: '', price: '' }]);
  const [notes, setNotes] = useState('');
  const steps = lang === 'id' ? ['Kategori','Konsep','Menu','Detail'] : ['Category','Concept','Menu','Details'];
  const cats = lang === 'id'
    ? ['Café / Coffee Shop','Restoran (full menu)','Bakery / Pastry','Minuman Spesial','Street Food / Gerobak','Cloud Kitchen']
    : ['Café / Coffee Shop','Restaurant (full menu)','Bakery / Pastry','Specialty Beverage','Street Food / Booth','Cloud Kitchen'];
  const tiers = lang === 'id'
    ? [{id:'budget',l:'Budget',d:'< Rp 20K rata-rata'},{id:'mid',l:'Mid-range',d:'Rp 20–50K rata-rata'},{id:'premium',l:'Premium',d:'> Rp 50K rata-rata'}]
    : [{id:'budget',l:'Budget',d:'< Rp 20K avg'},{id:'mid',l:'Mid-range',d:'Rp 20–50K avg'},{id:'premium',l:'Premium',d:'> Rp 50K avg'}];
  const canNext = [!!sub, !!name&&!!tier&&!!target, menu.some(m=>m.name&&m.price), true][step];
  const addMenu = () => setMenu(m=>[...m,{name:'',price:''}]);
  const upMenu = (i,f,v) => setMenu(m=>m.map((it,idx)=>idx===i?{...it,[f]:v}:it));
  const delMenu = (i) => setMenu(m=>m.filter((_,idx)=>idx!==i));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '20px 32px', borderBottom: `1px solid ${T.c200}`, flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: T.g500, marginBottom: 14, fontFamily: 'inherit' }}>
          <Icon name="ChevronLeft" size={16} color={T.g500} />{lang === 'id' ? 'Kembali' : 'Back'}
        </button>
        <div style={{ fontSize: 13, color: T.g500, marginBottom: 12 }}>{lang === 'id' ? 'Cluster:' : 'Cluster:'} <strong style={{ color: T.g900 }}>{c.name}</strong></div>
        <StepsProgress steps={steps} current={step} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', maxWidth: 600 }}>
        {step === 0 && <>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: T.g900, margin: '0 0 6px' }}>{lang === 'id' ? 'Kategori F&B' : 'F&B Category'}</h3>
          <p style={{ fontSize: 14, color: T.g500, margin: '0 0 20px' }}>{lang === 'id' ? 'Pilih tipe bisnis yang paling sesuai.' : 'Choose the business type that best fits.'}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {cats.map(cat => <button key={cat} onClick={() => setSub(cat)} style={{ padding: '13px 16px', borderRadius: 12, border: `1.5px solid ${sub===cat?T.p600:T.c200}`, background: sub===cat?T.p100:T.c50, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: sub===cat?600:400, color: sub===cat?T.p600:T.g700, textAlign: 'left', transition: 'all 150ms' }}>{cat}</button>)}
          </div>
        </>}
        {step === 1 && <>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: T.g900, margin: '0 0 6px' }}>{lang === 'id' ? 'Detail Konsep' : 'Concept Details'}</h3>
          <p style={{ fontSize: 14, color: T.g500, margin: '0 0 20px' }}>{lang === 'id' ? 'Ceritakan tentang konsep kamu.' : 'Tell us about your concept.'}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div><label style={{ fontSize: 13, fontWeight: 600, color: T.g700, display: 'block', marginBottom: 6 }}>{lang === 'id' ? 'Nama Konsep' : 'Concept Name'}</label><Input placeholder={lang === 'id' ? 'contoh: Kopi Nusantara...' : 'e.g. Matcha Corner...'} value={name} onChange={e=>setName(e.target.value)} /></div>
            <div><label style={{ fontSize: 13, fontWeight: 600, color: T.g700, display: 'block', marginBottom: 8 }}>{lang === 'id' ? 'Positioning Harga' : 'Price Positioning'}</label>
              <div style={{ display: 'flex', gap: 8 }}>{tiers.map(t=><button key={t.id} onClick={()=>setTier(t.id)} style={{ flex:1,padding:'12px 8px',borderRadius:12,border:`1.5px solid ${tier===t.id?T.p600:T.c200}`,background:tier===t.id?T.p100:T.c50,cursor:'pointer',fontFamily:'inherit',transition:'all 150ms' }}><div style={{ fontSize:13,fontWeight:700,color:tier===t.id?T.p600:T.g900 }}>{t.l}</div><div style={{ fontSize:11,color:T.g500,marginTop:3 }}>{t.d}</div></button>)}</div>
            </div>
            <div><label style={{ fontSize: 13, fontWeight: 600, color: T.g700, display: 'block', marginBottom: 6 }}>{lang === 'id' ? 'Target Pelanggan' : 'Target Customer'}</label><Input placeholder={lang === 'id' ? 'contoh: mahasiswa, karyawan kantoran...' : 'e.g. students, office workers...'} value={target} onChange={e=>setTarget(e.target.value)} /></div>
          </div>
        </>}
        {step === 2 && <>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: T.g900, margin: '0 0 6px' }}>{lang === 'id' ? 'Menu Builder' : 'Menu Builder'}</h3>
          <p style={{ fontSize: 14, color: T.g500, margin: '0 0 20px' }}>{lang === 'id' ? 'Masukkan produk dan harga rencana kamu.' : 'Enter your planned products and prices.'}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {menu.map((it,i)=><div key={i} style={{ display:'flex',gap:10,alignItems:'center' }}>
              <div style={{ flex:2 }}><Input placeholder={lang === 'id' ? 'Nama produk' : 'Product name'} value={it.name} onChange={e=>upMenu(i,'name',e.target.value)} /></div>
              <div style={{ flex:1 }}><Input placeholder="Rp harga" value={it.price} onChange={e=>upMenu(i,'price',e.target.value.replace(/\D/,''))} /></div>
              {menu.length>1&&<button onClick={()=>delMenu(i)} style={{ background:'none',border:'none',cursor:'pointer',padding:4 }}><Icon name="Trash2" size={16} color={T.danger} /></button>}
            </div>)}
            <button onClick={addMenu} style={{ padding:'12px',borderRadius:12,border:`2px dashed ${T.c200}`,background:'transparent',cursor:'pointer',color:T.g500,fontSize:13,fontWeight:600,fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>
              <Icon name="Plus" size={16} color={T.g500} />{lang === 'id' ? 'Tambah item' : 'Add item'}
            </button>
          </div>
        </>}
        {step === 3 && <>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: T.g900, margin: '0 0 6px' }}>{lang === 'id' ? 'Pertanyaan Spesifik' : 'Specific Questions'}</h3>
          <p style={{ fontSize: 14, color: T.g500, margin: '0 0 20px' }}>{lang === 'id' ? 'Ada hal tertentu yang ingin difokuskan? (opsional)' : 'Anything specific to focus on? (optional)'}</p>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder={lang === 'id' ? 'contoh: Saya khawatir dengan kompetisi chain besar...' : 'e.g. I\'m worried about competition from chains...'} style={{ width:'100%',padding:'14px',borderRadius:12,border:`1.5px solid ${T.c200}`,background:T.c50,fontFamily:'inherit',fontSize:14,color:T.g900,resize:'vertical',minHeight:120,outline:'none',lineHeight:1.6,boxSizing:'border-box',marginBottom:20 }} />
          <div style={{ background:T.p100,borderRadius:14,padding:'16px' }}>
            <div style={{ fontSize:12,fontWeight:700,color:T.p600,marginBottom:10 }}>{lang === 'id' ? 'Ringkasan Konsep' : 'Concept Summary'}</div>
            {[{l:lang==='id'?'Kategori':'Category',v:sub},{l:lang==='id'?'Nama':'Name',v:name},{l:lang==='id'?'Harga':'Price',v:tiers.find(t=>t.id===tier)?.l},{l:lang==='id'?'Target':'Target',v:target},{l:lang==='id'?'Menu':'Menu',v:`${menu.filter(m=>m.name).length} item`}].map(r=><div key={r.l} style={{ display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:6 }}><span style={{ color:T.g500 }}>{r.l}</span><span style={{ color:T.g900,fontWeight:600 }}>{r.v}</span></div>)}
          </div>
        </>}
      </div>
      <div style={{ padding: '16px 32px 24px', borderTop: `1px solid ${T.c200}`, display: 'flex', gap: 10, background: T.c50 }}>
        {step > 0 && <Btn variant="secondary" onClick={() => setStep(s => s - 1)}>{lang === 'id' ? 'Kembali' : 'Back'}</Btn>}
        <Btn full={step === 0} disabled={!canNext} variant={step === 3 ? 'accent' : 'primary'}
          onClick={() => step < 3 ? setStep(s => s + 1) : onSubmit()}
          icon={step === 3 ? <Icon name="Lock" size={15} color={T.c50} /> : null}>
          {step === 3 ? (lang === 'id' ? 'Bayar & Generate Laporan' : 'Pay & Generate Report') : (lang === 'id' ? 'Lanjut' : 'Continue')}
        </Btn>
      </div>
    </div>
  );
}

// ── Report ────────────────────────────────────────────────────────────
function BOReport({ cluster: c, lang, onBack }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [progLabel, setProgLabel] = useState('');
  const [timeLeft, setTimeLeft] = useState(43200);
  const [expanded, setExpanded] = useState(null);
  const [rating, setRating] = useState(0);
  const L = LANG[lang].report;
  const progSteps = lang === 'id'
    ? ['Menganalisis data cluster...','Membandingkan harga menu...','Memetakan kompetitor...','Menyusun proyeksi...','Laporan siap!']
    : ['Analyzing cluster data...','Comparing menu prices...','Mapping competitors...','Building projections...','Report ready!'];

  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => {
      p += 3.5;
      setProgress(Math.min(p, 100));
      setProgLabel(progSteps[Math.min(Math.floor(p / 25), 4)]);
      if (p >= 100) { clearInterval(iv); setTimeout(() => setLoading(false), 400); }
    }, 70);
    return () => clearInterval(iv);
  }, []);
  useEffect(() => {
    if (loading) return;
    const iv = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [loading]);
  const fmt = (s) => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}><Icon name="Sparkles" size={32} color={T.p600} /></div>
      <div style={{ fontSize: 17, fontWeight: 700, color: T.g900, marginBottom: 6 }}>{L.generating}</div>
      <div style={{ fontSize: 13, color: T.g500, marginBottom: 28 }}>{progLabel}</div>
      <div style={{ width: 320, height: 6, background: T.c200, borderRadius: 9999, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: T.p600, borderRadius: 9999, transition: 'width 200ms ease' }} />
      </div>
      <div style={{ fontSize: 12, color: T.g500 }}>{Math.round(progress)}%</div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {/* Report header */}
      <div style={{ background: T.g900, padding: '24px 32px' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16, fontFamily: 'inherit' }}>
          <Icon name="ChevronLeft" size={15} color="rgba(255,255,255,0.5)" />{lang === 'id' ? 'Kembali' : 'Back'}
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <Badge variant="active">Laporan Selesai</Badge>
              <Badge variant="dark" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
                <Icon name="Clock" size={10} color="rgba(255,255,255,0.7)" /> {L.timer}: {fmt(timeLeft)}
              </Badge>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: T.c50, letterSpacing: '-0.01em', margin: '0 0 4px' }}>Kopi Nusantara — Café Specialty</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{c.name} · Café / Coffee Shop</p>
          </div>
          <Btn variant="secondary" style={{ borderColor: 'rgba(255,255,255,0.2)', color: T.c50 }} icon={<Icon name="Download" size={15} color={T.c50} />}>{L.download}</Btn>
        </div>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>
        {/* Menu price analysis */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>{L.menuAnalysis}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
            {MENU_ITEMS.map((item, i) => {
              const pct = ((item.price/item.ceiling)-1)*100;
              return <div key={i} style={{ padding: '14px 16px', borderRadius: 14, background: item.status==='ok'?T.p100:item.status==='warn'?T.e100:'#FEF2F2', border: `1px solid ${item.status==='ok'?'#C8E8DF':item.status==='warn'?'#F2CAB8':'#FECACA'}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.g900, marginBottom: 4 }}>{item.name}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: T.g900, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>Rp {item.price.toLocaleString('id')}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: item.status==='ok'?T.success:item.status==='warn'?T.e600:T.danger }}>{item.note}</div>
                <div style={{ height: 3, background: 'rgba(0,0,0,0.08)', borderRadius: 9999, marginTop: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((item.price/item.ceiling)*100,100)}%`, background: item.status==='ok'?T.success:item.status==='warn'?T.e600:T.danger, borderRadius: 9999 }} />
                </div>
                <div style={{ fontSize: 10, color: T.g500, marginTop: 4 }}>Ceiling: Rp {item.ceiling.toLocaleString('id')}</div>
              </div>;
            })}
          </div>
        </div>

        {/* 10 sections */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>{L.sections}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {REPORT_SECTIONS.map((s, i) => <SectionExpander key={s.id} section={s} delay={i * 60} />)}
          </div>
        </div>

        {/* Rating */}
        <div style={{ background: T.c100, borderRadius: 16, padding: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.g900 }}>{L.rating}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ width: 40, height: 40, borderRadius: 10, border: `1.5px solid ${rating>=n?T.warning:T.c200}`, background: rating>=n?'#FEF3C7':T.c50, cursor: 'pointer', fontSize: 18, transition: 'all 150ms' }}>⭐</button>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Simulation History ────────────────────────────────────────────────
function BOHistory({ lang }) {
  const L = LANG[lang].dash;
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 20 }}>{L.history}</div>
      {MOCK_SESSIONS.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: T.g500 }}>{L.noHistory}</div>
      ) : (
        <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.c200}`, background: T.c100 }}>
                {['Cluster','Konsep','Tanggal','Status','Skor','Aksi'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.g500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_SESSIONS.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < MOCK_SESSIONS.length - 1 ? `1px solid ${T.c200}` : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = T.c100}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600, color: T.g900 }}>{s.cluster}</td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: T.g700 }}>{s.concept}</td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: T.g500 }}>{s.date}</td>
                  <td style={{ padding: '16px 20px' }}><Badge variant={s.paid ? 'active' : 'neutral'}>{s.status}</Badge></td>
                  <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700, color: s.score ? (s.score >= 70 ? T.success : T.warning) : T.g500, fontVariantNumeric: 'tabular-nums' }}>{s.score ? `${s.score}/100` : '—'}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {s.paid && <button style={{ background: T.p100, border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: T.p600, cursor: 'pointer', fontFamily: 'inherit' }}>{lang === 'id' ? 'Lihat Laporan' : 'View Report'}</button>}
                      <button style={{ background: T.c200, border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: T.g700, cursor: 'pointer', fontFamily: 'inherit' }}>{lang === 'id' ? 'Ulangi Chat' : 'Retry Chat'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Subscription ──────────────────────────────────────────────────────
function BOSubscription({ lang }) {
  const L = LANG[lang];
  const [billing, setBilling] = useState('monthly');
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 6 }}>{L.dash.subscription}</div>
      <div style={{ fontSize: 14, color: T.g500, marginBottom: 28 }}>{lang === 'id' ? 'Kelola paket langganan kamu.' : 'Manage your subscription plan.'}</div>
      {/* Current plan */}
      <div style={{ background: T.p100, borderRadius: 16, padding: '20px 24px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16, border: `1px solid ${T.p400}30` }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: T.p600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="CreditCard" size={22} color={T.c50} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.p600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lang === 'id' ? 'Paket Saat Ini' : 'Current Plan'}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.g900, marginTop: 2 }}>Free</div>
          <div style={{ fontSize: 13, color: T.g500 }}>{lang === 'id' ? '2 kredit tersisa dari pembelian terakhir' : '2 credits remaining from last purchase'}</div>
        </div>
      </div>
      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {[
          { name: 'Pay-per-use', price: 'Rp 400K', per: lang==='id'?'/sesi':'/session', features: ['10-section report','12h AI chat','Per-menu analysis','PDF download'], highlight: false },
          { name: 'Explorer', price: 'Rp 1.2jt', per: lang==='id'?'/bulan':'/month', features: ['4 sesi/bulan','Rollover 2 sesi','Semua Pay-per-use','Priority support'], highlight: true },
          { name: 'Operator', price: 'Rp 3jt', per: lang==='id'?'/bulan':'/month', features: ['12 sesi/bulan','Priority generation','Email support','Team access'], highlight: false },
          { name: 'Agency', price: 'Rp 8jt', per: lang==='id'?'/bulan':'/month', features: ['Unlimited sesi','API access','White-label report','Dedicated support'], highlight: false },
        ].map((p, i) => (
          <div key={i} style={{ background: p.highlight ? T.g900 : T.c50, borderRadius: 18, padding: '24px 20px', border: p.highlight ? 'none' : `1px solid ${T.c200}`, boxShadow: p.highlight ? '0 8px 32px rgba(26,26,26,0.15)' : '0 1px 4px rgba(26,26,26,0.05)', position: 'relative' }}>
            {p.highlight && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)' }}><Badge variant="active">Populer</Badge></div>}
            <div style={{ fontSize: 13, fontWeight: 700, color: p.highlight ? T.p400 : T.g500, marginBottom: 8 }}>{p.name}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: p.highlight ? T.c50 : T.g900, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{p.price}</div>
            <div style={{ fontSize: 12, color: p.highlight ? 'rgba(253,251,247,0.5)' : T.g500, marginBottom: 16 }}>{p.per}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {p.features.map((f, j) => <div key={j} style={{ display: 'flex', gap: 8, fontSize: 12, color: p.highlight ? 'rgba(253,251,247,0.75)' : T.g700 }}>
                <Icon name="Check" size={13} color={p.highlight ? T.p400 : T.p600} style={{ flexShrink: 0, marginTop: 1 }} />{f}
              </div>)}
            </div>
            <Btn full variant={p.highlight ? 'primary' : 'secondary'} size="sm">{lang === 'id' ? 'Pilih Paket' : 'Choose Plan'}</Btn>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main BO Dashboard ─────────────────────────────────────────────────
function BODashboard({ lang, setLang, onLogout }) {
  const [page, setPage] = useState(() => localStorage.getItem('lokal_bo_page') || 'overview');
  const [wallet, setWallet] = useState(false);
  useEffect(() => { localStorage.setItem('lokal_bo_page', page); }, [page]);
  const L = LANG[lang].dash;
  const titles = { overview: L.overview, clusters: L.clusters, history: L.history, subscription: L.subscription };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: T.c50 }}>
      <BOSidebar page={page} setPage={setPage} lang={lang} onLogout={onLogout} walletConnected={wallet} onConnectWallet={() => setWallet(w => !w)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar title={titles[page]} lang={lang} setLang={setLang} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {page === 'overview' && <BOOverview lang={lang} />}
          {page === 'clusters' && <BOClusters lang={lang} />}
          {page === 'history' && <BOHistory lang={lang} />}
          {page === 'subscription' && <BOSubscription lang={lang} />}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BODashboard });
