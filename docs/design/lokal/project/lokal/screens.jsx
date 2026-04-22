// LOKAL — All Screens
const { useState, useEffect, useRef } = React;

// ── LANDING ─────────────────────────────────────────────────────────
function LandingScreen({ onBrowse }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 80); }, []);
  const stats = [
    { val: '4.85 juta', label: 'Bisnis F&B di Indonesia' },
    { val: '60–90%', label: 'Gagal di tahun pertama' },
    { val: 'Rp 400K', label: 'Vs Rp 1.25M/jam konsultan' },
  ];
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', padding: '0 0 32px' }}>
      {/* Hero */}
      <div style={{ padding: '48px 24px 32px', flex: 1 }}>
        <div style={{ opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(16px)', transition: 'all 400ms ease' }}>
          <Badge variant="active" style={{ marginBottom: 20 }}>
            <Icon name="Sparkles" size={11} color={T.p600}/> Indonesia F&B Intelligence
          </Badge>
          <h1 style={{ fontSize: 38, fontWeight: 700, color: T.g900, lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            Simulate<br/>
            <span style={{ color: T.p600 }}>before you</span><br/>
            operate.
          </h1>
          <p style={{ fontSize: 16, color: T.g500, lineHeight: 1.65, margin: '0 0 32px', maxWidth: '30ch' }}>
            Validasi konsep F&B kamu terhadap data pasar hyperlokal yang terverifikasi — sebelum tanda tangan kontrak sewa.
          </p>
          <Btn size="lg" full onClick={onBrowse} icon={<Icon name="MapPin" size={18} color={T.c50}/>}>
            Jelajahi Cluster
          </Btn>
          <div style={{ marginTop: 12 }}>
            <Btn variant="ghost" full onClick={onBrowse}>Bagaimana cara kerjanya →</Btn>
          </div>
        </div>

        {/* Story card */}
        <div style={{
          marginTop: 36, padding: '18px 20px', background: T.e100,
          borderRadius: 16, borderLeft: `4px solid ${T.e600}`,
          opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(12px)',
          transition: 'all 400ms ease 150ms',
        }}>
          <p style={{ margin: 0, fontSize: 14, color: T.g700, lineHeight: 1.6, fontStyle: 'italic' }}>
            "Paman saya buka café matcha premium di Depok dengan harga Rp 50.000 — sama dengan Jakarta. Tutup dalam beberapa bulan. Price ceiling Depok adalah <strong>Rp 28.000</strong>. Tidak ada yang memberitahunya."
          </p>
          <div style={{ marginTop: 10, fontSize: 12, color: T.g500, fontWeight: 600 }}>— Kisah yang mendirikan LOKAL</div>
        </div>

        {/* Stats */}
        <div style={{
          marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
          opacity: vis ? 1 : 0, transition: 'all 400ms ease 250ms',
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: T.c100, borderRadius: 12, padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.p600, marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: T.g500, lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: '0 24px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, letterSpacing: '0.06em', marginBottom: 14, textTransform: 'uppercase' }}>Cara kerja</div>
        {[
          { n: '01', icon: 'Search', t: 'Pilih Cluster', d: 'Temukan area target kamu dari daftar cluster terverifikasi.' },
          { n: '02', icon: 'MessageCircle', t: 'Chat Gratis', d: '7 pesan gratis. Tanya tentang harga, kompetitor, dan pasar.' },
          { n: '03', icon: 'FileText', t: 'Buka Laporan', d: 'Bayar Rp 400K untuk simulasi 10-seksi + konsultasi AI 12 jam.' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={s.icon} size={18} color={T.p600}/>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.g900 }}>{s.t}</div>
              <div style={{ fontSize: 13, color: T.g500, lineHeight: 1.5, marginTop: 2 }}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BROWSE ──────────────────────────────────────────────────────────
function BrowseScreen({ clusters, onSelect, onBack }) {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('Semua');
  const cities = ['Semua', 'Depok', 'Jakarta Selatan', 'Tangerang Selatan', 'Surabaya'];
  const filtered = clusters.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
    const matchC = city === 'Semua' || c.city === city;
    return matchQ && matchC;
  });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
        <Input placeholder="Cari cluster atau kota..." value={search}
          onChange={e => setSearch(e.target.value)}
          prefix={<Icon name="Search" size={16} color={T.g500}/>}/>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {cities.map(c => (
            <button key={c} onClick={() => setCity(c)} style={{
              padding: '7px 14px', borderRadius: 9999, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              background: city === c ? T.p600 : T.c200,
              color: city === c ? T.c50 : T.g700,
              transition: 'all 150ms',
            }}>{c}</button>
          ))}
        </div>
        <div style={{ marginTop: 16, marginBottom: 4, fontSize: 12, color: T.g500, fontWeight: 500 }}>
          {filtered.length} cluster tersedia
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map((c, i) => <ClusterCard key={c.id} cluster={c} onSelect={onSelect} delay={i * 60}/>)}
      </div>
    </div>
  );
}

function ClusterCard({ cluster: c, onSelect, delay }) {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, []);
  const statusBadge = c.status === 'Active' ? 'active' : 'seeding';
  return (
    <div onClick={() => onSelect(c)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: T.c100, border: `1px solid ${T.c200}`, borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
        opacity: vis ? 1 : 0, transform: vis ? (hov ? 'translateY(-2px)' : 'none') : 'translateY(10px)',
        transition: `opacity 300ms ease ${delay}ms, transform 250ms ease, box-shadow 250ms ease`,
        boxShadow: hov ? '0 8px 24px rgba(26,26,26,0.10)' : '0 2px 8px rgba(26,26,26,0.05)',
      }}>
      <MapPlaceholder accent={c.mapAccent} color={c.color} height={100}/>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.g900 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: T.g500, marginTop: 2 }}>{c.subtitle}</div>
          </div>
          <ConfidenceRing score={c.confidenceScore}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          <Badge variant={statusBadge}>{c.status}</Badge>
          <Badge variant="dark" style={{ gap: 4 }}>
            <Icon name="ShieldCheck" size={10} color={T.c50}/> {c.zkDataPoints} titik data
          </Badge>
          <Badge variant="neutral">
            <Icon name="Clock" size={10} color={T.g500}/> {c.dataFreshness}h lalu
          </Badge>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          <div style={{ fontSize: 12, color: T.g500 }}>
            <span style={{ fontWeight: 600, color: T.g700 }}>{c.priceRange}</span> · {c.neighborhood}
          </div>
          <Btn size="sm" onClick={e => { e.stopPropagation(); onSelect(c); }}
            icon={<Icon name="MessageCircle" size={14} color={T.c50}/>}>
            Chat Gratis
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── CHAT ────────────────────────────────────────────────────────────
function ChatScreen({ cluster, onPaywall, onBack }) {
  const [msgs, setMsgs] = useState([{
    id: 0, role: 'ai',
    text: `Halo! Saya asisten LOKAL untuk cluster **${cluster.name}**.\n\nTanya apa saja tentang area ini — harga, kompetitor, potensi pasar. Kamu punya **7 pesan gratis**.`,
  }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [used, setUsed] = useState(0);
  const MAX = 7;
  const listRef = useRef(null);
  const suggestions = ['Harga kopi rata-rata berapa?', 'Kompetitor apa saja yang ada?', 'Apakah area ini cocok untuk specialty café?'];

  const scrollDown = () => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; };
  useEffect(scrollDown, [msgs, typing]);

  const sendMsg = (text) => {
    if (!text.trim() || typing) return;
    const newUsed = used + 1;
    setUsed(newUsed);
    setMsgs(m => [...m, { id: Date.now(), role: 'user', text }]);
    setInput('');

    if (newUsed >= MAX) {
      setTimeout(() => onPaywall(), 800);
      return;
    }
    setTyping(true);
    const responseIdx = Math.min(newUsed - 1, LOKAL_DATA.aiResponses.length - 1);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { id: Date.now() + 1, role: 'ai', text: LOKAL_DATA.aiResponses[responseIdx] }]);
      if (newUsed >= MAX - 1) {
        setTimeout(() => {
          setMsgs(m => [...m, {
            id: Date.now() + 2, role: 'ai', text: '⚡ Kamu hampir mencapai batas pesan gratis. Buka **laporan simulasi penuh** untuk analisis mendalam + konsultasi AI 12 jam.',
            cta: true,
          }]);
        }, 400);
      }
    }, 1200 + Math.random() * 600);
  };

  const renderText = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p);
  };

  const pct = (used / MAX) * 100;
  const barColor = used >= 6 ? T.danger : used >= 4 ? T.warning : T.p600;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Cluster header */}
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.c200}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: cluster.mapAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="MapPin" size={20} color={cluster.color}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.g900 }}>{cluster.name}</div>
            <div style={{ fontSize: 12, color: T.g500 }}>{cluster.subtitle} · {cluster.zkDataPoints} data points</div>
          </div>
          <Badge variant="dark" style={{ flexShrink: 0 }}>
            <Icon name="ShieldCheck" size={10} color={T.c50}/> ZK
          </Badge>
        </div>
        {/* Message counter bar */}
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.g500 }}>Pesan gratis digunakan</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: barColor }}>{used}/{MAX}</span>
          </div>
          <div style={{ height: 4, borderRadius: 9999, background: T.c200, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 9999, transition: 'width 300ms ease, background 300ms' }}/>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%', padding: '11px 14px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: m.role === 'user' ? T.p600 : m.cta ? T.e100 : T.c100,
              color: m.role === 'user' ? T.c50 : T.g900,
              fontSize: 14, lineHeight: 1.6,
              border: m.cta ? `1px solid ${T.e600}` : 'none',
            }}>
              {renderText(m.text)}
              {m.cta && (
                <button onClick={onPaywall} style={{
                  marginTop: 10, width: '100%', padding: '9px', borderRadius: 10,
                  background: T.e600, color: T.c50, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                }}>Buka Laporan Lengkap →</button>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', gap: 5, padding: '12px 16px', background: T.c100, borderRadius: '16px 16px 16px 4px', width: 'fit-content' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: T.g500, animation: `bounce 1.2s ease ${i*0.2}s infinite` }}/>
            ))}
          </div>
        )}
        {/* Suggestions */}
        {used === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => sendMsg(s)} style={{
                padding: '9px 14px', borderRadius: 10, border: `1px solid ${T.c200}`,
                background: T.c50, color: T.p600, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                textAlign: 'left', fontFamily: 'inherit', transition: 'all 150ms',
              }}>{s}</button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 20px 20px', flexShrink: 0, borderTop: `1px solid ${T.c200}` }}>
        {used >= MAX ? (
          <Btn variant="accent" full size="lg" onClick={onPaywall} icon={<Icon name="Lock" size={18} color={T.c50}/>}>
            Buka Simulasi Bisnis — Rp 400.000
          </Btn>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <Input placeholder="Tanya tentang cluster ini..." value={input}
                onChange={e => setInput(e.target.value)}
                style={{ borderRadius: 12 }}/>
            </div>
            <button onClick={() => sendMsg(input)} disabled={!input.trim() || typing}
              style={{
                width: 46, height: 46, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: !input.trim() || typing ? T.c200 : T.p600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'all 150ms',
              }}>
              <Icon name="Send" size={18} color={!input.trim() || typing ? T.g500 : T.c50}/>
            </button>
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: T.g500 }}>
          Data dari {cluster.zkDataPoints} titik terverifikasi · Diperbarui {cluster.dataFreshness}h lalu
        </div>
      </div>
    </div>
  );
}

// ── PAYWALL MODAL ───────────────────────────────────────────────────
function PaywallModal({ cluster, onContinue, onClose }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 50); }, []);
  const includes = [
    'Laporan simulasi bisnis 10 seksi',
    'Analisis harga per item menu vs price ceiling lokal',
    'Profil pelanggan target + demografis cluster',
    'Peta kompetitor + gap analisis',
    'Rekomendasi lokasi dalam cluster',
    'Proyeksi revenue konservatif–optimis',
    'Konsultasi AI 12 jam tak terbatas',
    'Laporan bisa diunduh (PDF)',
  ];
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(26,26,26,0.55)',
      display: 'flex', alignItems: 'flex-end', zIndex: 50,
      opacity: vis ? 1 : 0, transition: 'opacity 300ms',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', background: T.c50, borderRadius: '24px 24px 0 0',
        padding: '24px 24px 36px', maxHeight: '88%', overflowY: 'auto',
        transform: vis ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 350ms cubic-bezier(0,0,0.2,1)',
        boxShadow: '0 -16px 48px rgba(26,26,26,0.15)',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 9999, background: T.c200, margin: '0 auto 20px' }}/>
        <Badge variant="active" style={{ marginBottom: 12 }}>
          <Icon name="ShieldCheck" size={11} color={T.p600}/> Data Terverifikasi On-Chain
        </Badge>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: T.g900, margin: '0 0 8px', lineHeight: 1.2 }}>
          Buka Simulasi Bisnis Lengkap
        </h2>
        <p style={{ fontSize: 14, color: T.g500, margin: '0 0 20px', lineHeight: 1.6 }}>
          Analisis mendalam untuk konsep kamu di cluster <strong>{cluster?.name}</strong>, berdasarkan data lapangan terverifikasi.
        </p>
        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: T.c100, borderRadius: 14, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: T.g900, fontVariantNumeric: 'tabular-nums', fontFamily: 'JetBrains Mono, monospace' }}>
              Rp 400.000
            </div>
            <div style={{ fontSize: 12, color: T.g500 }}>Satu sesi · Laporan + 12 jam konsultasi</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: T.g500, textDecoration: 'line-through' }}>Rp 1.25jt/jam</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.success }}>Hemat 97%</div>
          </div>
        </div>
        {/* Includes */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>Yang kamu dapatkan</div>
          {includes.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <Icon name="Check" size={11} color={T.p600}/>
              </div>
              <div style={{ fontSize: 13, color: T.g700, lineHeight: 1.5 }}>{item}</div>
            </div>
          ))}
        </div>
        <Btn variant="accent" full size="lg" onClick={onContinue} icon={<Icon name="Lock" size={18} color={T.c50}/>}>
          Isi Konsep & Bayar
        </Btn>
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: T.g500 }}>
          Pembayaran via GoPay, OVO, atau transfer bank
        </div>
      </div>
    </div>
  );
}

// ── CONCEPT FORM ─────────────────────────────────────────────────────
function ConceptFormScreen({ cluster, onSubmit, onBack }) {
  const [step, setStep] = useState(0);
  const [subcategory, setSubcategory] = useState('');
  const [conceptName, setConceptName] = useState('');
  const [priceTier, setPriceTier] = useState('');
  const [target, setTarget] = useState('');
  const [menuItems, setMenuItems] = useState([{ name: '', price: '' }]);
  const [notes, setNotes] = useState('');

  const steps = ['Kategori', 'Konsep', 'Menu', 'Detail'];
  const cats = ['Café / Coffee Shop', 'Restoran (full menu)', 'Bakery / Pastry', 'Minuman Spesial', 'Street Food / Gerobak', 'Cloud Kitchen'];
  const tiers = [
    { id: 'budget', label: 'Budget', desc: '< Rp 20K rata-rata' },
    { id: 'mid', label: 'Mid-range', desc: 'Rp 20–50K rata-rata' },
    { id: 'premium', label: 'Premium', desc: '> Rp 50K rata-rata' },
  ];

  const addMenu = () => setMenuItems(m => [...m, { name: '', price: '' }]);
  const updateMenu = (i, field, val) => setMenuItems(m => m.map((it, idx) => idx === i ? { ...it, [field]: val } : it));
  const removeMenu = (i) => setMenuItems(m => m.filter((_, idx) => idx !== i));

  const canNext = [
    !!subcategory,
    !!conceptName && !!priceTier && !!target,
    menuItems.some(m => m.name && m.price),
    true,
  ][step];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.c200}`, flexShrink: 0 }}>
        <div style={{ fontSize: 13, color: T.g500, marginBottom: 14 }}>Cluster: <strong style={{ color: T.g900 }}>{cluster?.name}</strong></div>
        <ProgressSteps steps={steps} current={step}/>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {step === 0 && (
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, color: T.g900 }}>Kategori F&B</h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: T.g500 }}>Pilih tipe bisnis yang paling sesuai dengan konsep kamu.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cats.map(c => (
                <button key={c} onClick={() => setSubcategory(c)} style={{
                  padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${subcategory === c ? T.p600 : T.c200}`,
                  background: subcategory === c ? T.p100 : T.c50, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 14, fontWeight: subcategory === c ? 600 : 400,
                  color: subcategory === c ? T.p600 : T.g700, textAlign: 'left', transition: 'all 150ms',
                }}>{c}</button>
              ))}
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, color: T.g900 }}>Detail Konsep</h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: T.g500 }}>Ceritakan tentang konsep kamu.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: T.g700, display: 'block', marginBottom: 6 }}>Nama Konsep (opsional)</label>
                <Input placeholder="contoh: Kopi Nusantara, Matcha Kita..." value={conceptName} onChange={e => setConceptName(e.target.value)}/>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: T.g700, display: 'block', marginBottom: 8 }}>Positioning Harga</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {tiers.map(t => (
                    <button key={t.id} onClick={() => setPriceTier(t.id)} style={{
                      flex: 1, padding: '12px 8px', borderRadius: 12, border: `1.5px solid ${priceTier === t.id ? T.p600 : T.c200}`,
                      background: priceTier === t.id ? T.p100 : T.c50, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: priceTier === t.id ? T.p600 : T.g900 }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: T.g500, marginTop: 3 }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: T.g700, display: 'block', marginBottom: 6 }}>Target Pelanggan</label>
                <Input placeholder="contoh: mahasiswa, karyawan kantoran, keluarga..." value={target} onChange={e => setTarget(e.target.value)}/>
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, color: T.g900 }}>Menu Builder</h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: T.g500 }}>Masukkan produk dan harga rencana kamu. Kami akan analisis tiap item terhadap price ceiling lokal.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {menuItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ flex: 2 }}>
                    <Input placeholder="Nama produk" value={item.name} onChange={e => updateMenu(i, 'name', e.target.value)}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Input placeholder="Rp harga" value={item.price} onChange={e => updateMenu(i, 'price', e.target.value.replace(/\D/,''))}/>
                  </div>
                  {menuItems.length > 1 && (
                    <button onClick={() => removeMenu(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                      <Icon name="Trash2" size={16} color={T.danger}/>
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addMenu} style={{
                padding: '12px', borderRadius: 12, border: `2px dashed ${T.c200}`,
                background: 'transparent', cursor: 'pointer', color: T.g500,
                fontSize: 13, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Icon name="Plus" size={16} color={T.g500}/> Tambah item menu
              </button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, color: T.g900 }}>Pertanyaan Spesifik</h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: T.g500 }}>Ada hal tertentu yang ingin difokuskan dalam laporan? (opsional)</p>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="contoh: Saya khawatir tentang kompetisi dari chain besar. Apakah masih ada ruang untuk brand indie?"
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${T.c200}`,
                background: T.c50, fontFamily: 'inherit', fontSize: 14, color: T.g900, resize: 'vertical',
                minHeight: 120, outline: 'none', lineHeight: 1.6, boxSizing: 'border-box',
              }}/>
            {/* Summary */}
            <div style={{ marginTop: 20, padding: '16px', background: T.p100, borderRadius: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.p600, marginBottom: 10 }}>Ringkasan Konsep</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { l: 'Kategori', v: subcategory },
                  { l: 'Nama', v: conceptName || '(tidak diisi)' },
                  { l: 'Harga', v: tiers.find(t => t.id === priceTier)?.label },
                  { l: 'Target', v: target },
                  { l: 'Menu', v: `${menuItems.filter(m => m.name).length} item` },
                ].map(r => (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: T.g500 }}>{r.l}</span>
                    <span style={{ color: T.g900, fontWeight: 600 }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 20px 28px', flexShrink: 0, borderTop: `1px solid ${T.c200}`, display: 'flex', gap: 10 }}>
        {step > 0 && <Btn variant="secondary" onClick={() => setStep(s => s - 1)}>Kembali</Btn>}
        <Btn full={step === 0} disabled={!canNext}
          onClick={() => step < 3 ? setStep(s => s + 1) : onSubmit({ subcategory, conceptName, priceTier, target, menuItems, notes })}
          variant={step === 3 ? 'accent' : 'primary'}
          icon={step === 3 ? <Icon name="Lock" size={16} color={T.c50}/> : null}>
          {step === 3 ? 'Bayar & Generate Laporan' : 'Lanjut'}
        </Btn>
      </div>
    </div>
  );
}

// ── REPORT ─────────────────────────────────────────────────────────
function ReportScreen({ cluster, concept, onBack }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('Menganalisis data cluster...');
  const [expanded, setExpanded] = useState(null);
  const [rating, setRating] = useState(0);
  const [timeLeft, setTimeLeft] = useState(11 * 3600 + 23 * 60 + 47);
  const steps = ['Menganalisis data cluster...', 'Membandingkan harga menu...', 'Memetakan kompetitor...', 'Menyusun proyeksi revenue...', 'Laporan siap!'];

  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => {
      p += 4;
      setProgress(Math.min(p, 100));
      const idx = Math.min(Math.floor(p / 25), steps.length - 1);
      setProgressLabel(steps[idx]);
      if (p >= 100) { clearInterval(iv); setTimeout(() => setLoading(false), 500); }
    }, 80);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (loading) return;
    const iv = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [loading]);

  const fmt = (s) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 32 }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
        <Icon name="Sparkles" size={32} color={T.p600}/>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Membuat laporan kamu...</div>
      <div style={{ fontSize: 13, color: T.g500, marginBottom: 28, textAlign: 'center' }}>{progressLabel}</div>
      <div style={{ width: '100%', height: 6, background: T.c200, borderRadius: 9999, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: T.p600, borderRadius: 9999, transition: 'width 200ms ease' }}/>
      </div>
      <div style={{ fontSize: 12, color: T.g500 }}>{progress}%</div>
    </div>
  );

  const menuData = LOKAL_DATA.menuItems;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', background: T.p600, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Badge variant="dark" style={{ background: 'rgba(255,255,255,0.2)', color: T.c50 }}>
            <Icon name="FileText" size={10} color={T.c50}/> Laporan Bisnis
          </Badge>
          <Badge variant="dark" style={{ background: 'rgba(255,255,255,0.2)', color: T.c50 }}>
            <Icon name="Clock" size={10} color={T.c50}/> {fmt(timeLeft)} tersisa
          </Badge>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: T.c50 }}>{concept?.conceptName || 'Konsep Café Matcha'}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>
          {cluster?.name} · {concept?.subcategory || 'Café / Coffee Shop'}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Menu Price Analysis */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Analisis Harga Menu</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {menuData.map((item, i) => {
              const pct = (item.price / item.ceiling - 1) * 100;
              const isOk = item.status === 'ok', isRisk = item.status === 'risk', isWarn = item.status === 'warn';
              return (
                <div key={i} style={{
                  padding: '14px 16px', borderRadius: 14,
                  background: isRisk ? '#FEF2F2' : isWarn ? T.e100 : T.p100,
                  border: `1px solid ${isRisk ? '#FECACA' : isWarn ? '#F9D4C4' : '#C8E8DF'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.g900 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: T.g500, marginTop: 2 }}>
                        Ceiling cluster: <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>Rp {item.ceiling.toLocaleString('id')}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, color: T.g900 }}>
                        Rp {item.price.toLocaleString('id')}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: isRisk ? T.danger : isWarn ? T.e600 : T.success }}>
                        {isOk ? '✓ Aman' : isWarn ? `+${Math.round(pct)}% ceiling` : `+${Math.round(pct)}% — Risiko Tinggi`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Report Sections */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Analisis Lengkap</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LOKAL_DATA.reportSections.map((s, i) => (
              <SectionCard key={s.id} section={s} delay={i * 80}
                expanded={expanded === s.id}
                onToggle={() => setExpanded(expanded === s.id ? null : s.id)}/>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div style={{ padding: '20px', background: T.c100, borderRadius: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.g900, marginBottom: 12 }}>Laporan ini membantu?</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)} style={{
                flex: 1, padding: '12px 0', borderRadius: 10, border: `1.5px solid ${rating >= n ? T.warning : T.c200}`,
                background: rating >= n ? '#FEF3C7' : T.c50, cursor: 'pointer', fontSize: 18, transition: 'all 150ms',
              }}>⭐</button>
            ))}
          </div>
        </div>

        <Btn variant="secondary" full icon={<Icon name="Download" size={16} color={T.p600}/>}>
          Unduh Laporan (PDF)
        </Btn>
      </div>
    </div>
  );
}

Object.assign(window, { LandingScreen, BrowseScreen, ChatScreen, PaywallModal, ConceptFormScreen, ReportScreen });
