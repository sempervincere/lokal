// LOKAL — Cluster Owner Dashboard
const { useState, useEffect } = React;

function COSidebar({ page, setPage, lang, onLogout }) {
  const L = LANG[lang].co_dash;
  const nav = [
    { id: 'overview', icon: 'Activity', label: L.overview },
    { id: 'fields', icon: 'FileText', label: L.fields },
    { id: 'earnings', icon: 'DollarSign', label: L.earnings },
    { id: 'cluster', icon: 'MapPin', label: L.clusters },
  ];
  return (
    <div style={{ width: 240, background: T.c50, borderRight: `1px solid ${T.c200}`, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.c200}` }}>
        <img src="uploads/Logo-LOKAL-AI-remove.png" alt="LOKAL" style={{ height: 28, objectFit: 'contain' }} />
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="Award" size={16} color={T.p600} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.g900 }}>Rizky F.</div>
            <div style={{ fontSize: 11, color: T.g500 }}>Cluster Owner · Tier 3</div>
          </div>
        </div>
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
      <div style={{ padding: '12px 10px', borderTop: `1px solid ${T.c200}` }}>
        <div style={{ padding: '10px 12px', borderRadius: 10, background: T.p100, marginBottom: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.p600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Wallet</div>
          <div style={{ fontSize: 11, color: T.g500, fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>7xKp...3mNq</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.p600, marginTop: 4 }}>Rp 485.000 IDRX</div>
        </div>
        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, color: T.g500, background: 'transparent', transition: 'all 150ms', textAlign: 'left', width: '100%' }}
          onMouseEnter={e => e.currentTarget.style.background = T.c100}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <Icon name="LogOut" size={16} color={T.g500} />{LANG[lang].dash.logout}
        </button>
      </div>
    </div>
  );
}

// ── CO Overview ───────────────────────────────────────────────────────
function COOverview({ lang }) {
  const L = LANG[lang].co_dash;
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em' }}>
          {lang === 'id' ? 'Selamat datang, Rizky 👋' : 'Welcome back, Rizky 👋'}
        </div>
        <div style={{ fontSize: 14, color: T.g500, marginTop: 4 }}>
          {lang === 'id' ? 'Cluster Margonda kamu aktif dan menghasilkan pendapatan.' : 'Your Margonda cluster is active and generating income.'}
        </div>
      </div>

      {/* Score cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>{L.coScore}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ConfRing score={78} size={52} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.g900 }}>78</div>
              <div style={{ fontSize: 11, color: T.g500 }}>Tier 3 — Expert</div>
            </div>
          </div>
        </div>
        <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>{L.trustScore}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ConfRing score={91} size={52} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.g900 }}>91</div>
              <div style={{ fontSize: 11, color: T.success }}>Trusted</div>
            </div>
          </div>
        </div>
        <StatCard icon="DollarSign" label={L.totalEarned} value="Rp 485K" sub={lang === 'id' ? 'sejak bergabung' : 'since joining'} />
        <StatCard icon="Clock" label={L.pendingPayout} value="Rp 80K" sub={lang === 'id' ? 'dicairkan bulan ini' : 'paid out this month'} />
      </div>

      {/* Cluster status */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.g900 }}>{L.myCluster}</div>
            <Badge variant="active">Active</Badge>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <MapPlaceholder accent="#E6F3EF" color={T.p400} height={100} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 4 }}>Jalan Margonda</div>
              <div style={{ fontSize: 12, color: T.g500, marginBottom: 14 }}>UI Gate — Margo City · Depok</div>
              <ProgressBar value={19} max={20} label={L.fieldProgress} color={T.p600} />
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <Badge variant="dark"><Icon name="ShieldCheck" size={10} color={T.c50} /> 34 data points</Badge>
                <Badge variant="active">87/100 confidence</Badge>
              </div>
            </div>
          </div>
        </div>
        <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, padding: '22px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.g900, marginBottom: 14 }}>
            {lang === 'id' ? 'Sesi Bulan Ini' : 'Sessions This Month'}
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: T.g900, letterSpacing: '-0.02em', marginBottom: 4 }}>12</div>
          <div style={{ fontSize: 13, color: T.g500, marginBottom: 14 }}>{lang === 'id' ? 'sesi berbayar di cluster kamu' : 'paid sessions on your cluster'}</div>
          <div style={{ padding: '12px', background: T.p100, borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: T.g500, marginBottom: 3 }}>{lang === 'id' ? 'Revenue share bulan ini' : 'Revenue share this month'}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.p600, fontVariantNumeric: 'tabular-nums', fontFamily: 'JetBrains Mono, monospace' }}>Rp 480.000</div>
            <div style={{ fontSize: 11, color: T.g500 }}>12 × Rp 40.000 (10%)</div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, padding: '22px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.g900, marginBottom: 16 }}>
          {lang === 'id' ? 'Aktivitas Terbaru' : 'Recent Activity'}
        </div>
        {[
          { icon: 'DollarSign', text: lang === 'id' ? 'Revenue share diterima dari 3 sesi baru' : 'Revenue share received from 3 new sessions', time: '2j lalu', color: T.success },
          { icon: 'ShieldCheck', text: lang === 'id' ? 'Field M5 divalidasi oleh admin' : 'Field M5 validated by admin', time: '1h lalu', color: T.p600 },
          { icon: 'AlertTriangle', text: lang === 'id' ? 'Pengingat: refresh kuartal dalam 7 hari' : 'Reminder: quarterly refresh in 7 days', time: '1h lalu', color: T.warning },
          { icon: 'Star', text: lang === 'id' ? 'Rating baru: 5⭐ dari sesi BO' : 'New rating: 5⭐ from BO session', time: '2h lalu', color: T.warning },
        ].map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 14, marginBottom: i < 3 ? 14 : 0, borderBottom: i < 3 ? `1px solid ${T.c200}` : 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: T.c100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={a.icon} size={15} color={a.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: T.g700 }}>{a.text}</div>
              <div style={{ fontSize: 11, color: T.g500, marginTop: 3 }}>{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CO Fields ─────────────────────────────────────────────────────────
function COFields({ lang }) {
  const [filter, setFilter] = useState('all');
  const [formBuilderField, setFormBuilderField] = useState(null); // field being built
  const [linkCopied, setLinkCopied] = useState(false);

  const filters = [
    { id: 'all', label: lang === 'id' ? 'Semua' : 'All' },
    { id: 'VALIDATED', label: lang === 'id' ? 'Tervalidasi' : 'Validated' },
    { id: 'PENDING', label: lang === 'id' ? 'Pending' : 'Pending' },
  ];
  const validated = CO_FIELDS.filter(f => f.status === 'VALIDATED').length;
  const filtered = filter === 'all' ? CO_FIELDS : CO_FIELDS.filter(f => f.status === filter);

  // Form Builder Modal
  const FormBuilderModal = ({ field, onClose }) => {
    const [title, setTitle] = useState(lang === 'id'
      ? `Survei LOKAL — ${field.name}`
      : `LOKAL Survey — ${field.name}`);
    const [intro, setIntro] = useState(lang === 'id'
      ? `Halo! Kami sedang mengumpulkan data tentang "${field.name}" di area kamu. Survei ini hanya butuh 2 menit dan sangat membantu komunitas lokal.`
      : `Hi! We're collecting data about "${field.name}" in your area. This survey only takes 2 minutes and helps the local community.`);
    const [questions, setQuestions] = useState(
      field.complex
        ? [
            { id: 1, text: lang === 'id' ? `Berapa maksimal yang bersedia kamu bayar untuk kategori ${field.name}?` : `What is the maximum you are willing to pay for ${field.name}?`, type: 'range' },
            { id: 2, text: lang === 'id' ? 'Seberapa sering kamu mengunjungi tempat F&B di area ini?' : 'How often do you visit F&B places in this area?', type: 'choice' },
            { id: 3, text: lang === 'id' ? 'Apa metode pembayaran yang paling sering kamu gunakan?' : 'What payment method do you use most often?', type: 'choice' },
          ]
        : [
            { id: 1, text: lang === 'id' ? `Kapan jam ramai pengunjung di area ini menurut pengamatanmu?` : `When is the peak visitor hour in this area based on your observation?`, type: 'choice' },
            { id: 2, text: lang === 'id' ? 'Apakah ada catatan tambahan untuk data ini?' : 'Any additional notes for this data?', type: 'text' },
          ]
    );
    const mockLink = `https://forms.lokal.id/s/${field.code.toLowerCase()}-margonda-${Math.random().toString(36).slice(2,7)}`;

    const copyLink = () => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    };

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: T.c50, borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(26,26,26,0.2)' }}>
          {/* Modal header */}
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.c200}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.g900 }}>
                {lang === 'id' ? 'Form Builder' : 'Form Builder'}
              </div>
              <div style={{ fontSize: 12, color: T.g500, marginTop: 2 }}>
                {lang === 'id' ? `Template untuk field: ` : 'Template for field: '}
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: T.p600 }}>{field.code}</span>
                {' — '}{field.name}
              </div>
            </div>
            <button onClick={onClose} style={{ background: T.c200, border: 'none', borderRadius: 8, padding: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="X" size={16} color={T.g700} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {/* Form title */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: T.g700, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {lang === 'id' ? 'Judul Survei' : 'Survey Title'}
              </label>
              <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${T.c200}`, background: T.c50, fontFamily: 'inherit', fontSize: 14, color: T.g900, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = T.p500}
                onBlur={e => e.target.style.borderColor = T.c200}
              />
            </div>

            {/* Intro text */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: T.g700, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {lang === 'id' ? 'Teks Pembuka' : 'Introduction Text'}
              </label>
              <textarea value={intro} onChange={e => setIntro(e.target.value)} rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${T.c200}`, background: T.c50, fontFamily: 'inherit', fontSize: 13, color: T.g700, outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
                onFocus={e => e.target.style.borderColor = T.p500}
                onBlur={e => e.target.style.borderColor = T.c200}
              />
            </div>

            {/* Questions */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.g700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {lang === 'id' ? 'Pertanyaan' : 'Questions'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {questions.map((q, i) => (
                  <div key={q.id} style={{ background: T.c100, borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 7, background: T.p600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.c50 }}>{i + 1}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <textarea value={q.text}
                        onChange={e => setQuestions(qs => qs.map((qq, idx) => idx === i ? { ...qq, text: e.target.value } : qq))}
                        rows={2} style={{ width: '100%', border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, color: T.g900, resize: 'none', outline: 'none', lineHeight: 1.5, boxSizing: 'border-box' }}
                      />
                      <Badge variant={q.type === 'range' ? 'info' : q.type === 'choice' ? 'active' : 'neutral'} style={{ fontSize: 10, marginTop: 6 }}>
                        {q.type === 'range' ? (lang === 'id' ? 'Skala / Angka' : 'Range / Number') : q.type === 'choice' ? (lang === 'id' ? 'Pilihan Ganda' : 'Multiple Choice') : (lang === 'id' ? 'Teks Bebas' : 'Open Text')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Respondent requirements */}
            <div style={{ padding: '14px 16px', background: T.p100, borderRadius: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.p600, marginBottom: 8 }}>
                {lang === 'id' ? 'Persyaratan Responden (dari LOKAL)' : 'Respondent Requirements (from LOKAL)'}
              </div>
              {[
                lang === 'id' ? 'Minimum 20 responden per field survei' : 'Minimum 20 respondents per survey field',
                lang === 'id' ? 'Mix demografis: min. 2 dari 3 kelompok usia' : 'Demographic mix: min. 2 of 3 age groups',
                lang === 'id' ? 'Maks. 70% dari jaringan primermu sendiri' : 'Max. 70% from your own primary network',
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: T.p600, marginBottom: 4 }}>
                  <Icon name="Check" size={13} color={T.p600} style={{ flexShrink: 0, marginTop: 1 }} />{r}
                </div>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.c200}`, display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ flex: 1, background: T.c100, borderRadius: 9, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
              <Icon name="Globe" size={14} color={T.g500} />
              <span style={{ fontSize: 11, color: T.g500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono, monospace' }}>{mockLink}</span>
            </div>
            <button onClick={copyLink} style={{
              padding: '9px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: linkCopied ? T.success : T.p600, color: T.c50,
              fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              transition: 'background 200ms',
            }}>
              <Icon name={linkCopied ? 'Check' : 'Globe'} size={14} color={T.c50} />
              {linkCopied ? (lang === 'id' ? 'Tersalin!' : 'Copied!') : (lang === 'id' ? 'Salin Link' : 'Copy Link')}
            </button>
            <Btn variant="primary" onClick={onClose}>{lang === 'id' ? 'Simpan & Tutup' : 'Save & Close'}</Btn>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', position: 'relative' }}>
      {formBuilderField && <FormBuilderModal field={formBuilderField} onClose={() => setFormBuilderField(null)} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 4 }}>
            {lang === 'id' ? 'Data Fields — Tier 1' : 'Data Fields — Tier 1'}
          </div>
          <div style={{ fontSize: 13, color: T.g500 }}>{validated}/20 {lang === 'id' ? 'field tervalidasi' : 'fields validated'}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '7px 14px', borderRadius: 9999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              fontFamily: 'inherit', transition: 'all 150ms',
              background: filter === f.id ? T.p600 : T.c200, color: filter === f.id ? T.c50 : T.g700,
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <ProgressBar value={validated} max={20} label={lang === 'id' ? 'Progress Tier 1' : 'Tier 1 Progress'} color={T.p600} />
      </div>

      <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.c200}`, background: T.c100 }}>
              {['Code', lang === 'id' ? 'Nama Field' : 'Field Name', lang === 'id' ? 'Metode' : 'Method', lang === 'id' ? 'Nilai' : 'Value', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.g500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((f, i) => (
              <tr key={f.code} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.c200}` : 'none', transition: 'background 150ms' }}
                onMouseEnter={e => e.currentTarget.style.background = T.c100}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: T.p600 }}>{f.code}</span>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.g900 }}>{f.name}</div>
                  {f.complex && <Badge variant="info" style={{ marginTop: 4, fontSize: 9 }}>★ Complex</Badge>}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{ fontSize: 12, color: T.g500 }}>{f.complex ? (lang === 'id' ? 'Survei' : 'Survey') : (lang === 'id' ? 'Observasi' : 'Observation')}</span>
                </td>
                <td style={{ padding: '13px 16px', fontSize: 12, color: f.status === 'VALIDATED' ? T.g700 : T.g500, maxWidth: 180 }}>
                  {f.value}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <Badge variant={f.status === 'VALIDATED' ? 'active' : 'seeding'} style={{ fontSize: 10 }}>
                    {f.status === 'VALIDATED' ? (lang === 'id' ? 'Tervalidasi' : 'Validated') : 'Pending'}
                  </Badge>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setFormBuilderField(f)} style={{
                      background: f.status === 'VALIDATED' ? T.c200 : T.p100, border: 'none', borderRadius: 7,
                      padding: '6px 12px', fontSize: 11, fontWeight: 600,
                      color: f.status === 'VALIDATED' ? T.g500 : T.p600, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      {f.status === 'VALIDATED' ? (lang === 'id' ? 'Edit' : 'Edit') : (lang === 'id' ? 'Submit' : 'Submit')}
                    </button>
                    {f.complex && (
                      <button onClick={() => setFormBuilderField(f)} style={{
                        background: T.e100, border: 'none', borderRadius: 7,
                        padding: '6px 10px', fontSize: 11, fontWeight: 600,
                        color: T.e600, cursor: 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <Icon name="Globe" size={11} color={T.e600} />
                        {lang === 'id' ? 'Buat Form' : 'Form'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── CO Earnings ───────────────────────────────────────────────────────
function COEarnings({ lang }) {
  const earnings = [
    { type: lang === 'id' ? 'Revenue share — 12 sesi' : 'Revenue share — 12 sessions', amount: 480000, date: 'Apr 2025', status: 'paid' },
    { type: lang === 'id' ? 'Revenue share — 8 sesi' : 'Revenue share — 8 sessions', amount: 320000, date: 'Mar 2025', status: 'paid' },
    { type: lang === 'id' ? 'Bonus refresh kuartal' : 'Quarterly refresh bonus', amount: 125000, date: 'Mar 2025', status: 'paid' },
    { type: lang === 'id' ? 'Milestone Tier 2 fields' : 'Tier 2 milestone payment', amount: 80000, date: 'Feb 2025', status: 'paid' },
    { type: lang === 'id' ? 'Milestone Tier 1 fields' : 'Tier 1 milestone payment', amount: 170000, date: 'Jan 2025', status: 'paid' },
  ];
  const total = earnings.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard icon="DollarSign" label={lang === 'id' ? 'Total Pendapatan' : 'Total Earned'} value={`Rp ${(total/1000).toFixed(0)}K`} sub={lang === 'id' ? 'sejak bergabung' : 'since joining'} />
        <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
            {lang === 'id' ? 'Revenue Share Rate' : 'Revenue Share Rate'}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: T.g900, letterSpacing: '-0.02em' }}>10%</div>
          <div style={{ fontSize: 12, color: T.g500 }}>Tier 3 (Rep 70–100)</div>
          <div style={{ fontSize: 12, color: T.success, marginTop: 4 }}>Rp 40.000 / sesi</div>
        </div>
        <div style={{ background: T.p100, border: `1px solid ${T.p400}30`, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.p600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
            {lang === 'id' ? 'Estimasi Bulan Ini' : 'This Month Estimate'}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: T.p600, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', fontFamily: 'JetBrains Mono, monospace' }}>Rp 480K</div>
          <div style={{ fontSize: 12, color: T.p500 }}>12 sesi × Rp 40.000</div>
        </div>
      </div>

      {/* Payout history */}
      <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 16 }}>
        {lang === 'id' ? 'Riwayat Pembayaran' : 'Payment History'}
      </div>
      <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.c200}`, background: T.c100 }}>
              {[lang === 'id' ? 'Tipe' : 'Type', lang === 'id' ? 'Jumlah' : 'Amount', lang === 'id' ? 'Tanggal' : 'Date', 'Status'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.g500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {earnings.map((e, i) => (
              <tr key={i} style={{ borderBottom: i < earnings.length - 1 ? `1px solid ${T.c200}` : 'none' }}
                onMouseEnter={ev => ev.currentTarget.style.background = T.c100}
                onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 20px', fontSize: 13, color: T.g700 }}>{e.type}</td>
                <td style={{ padding: '14px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700, color: T.success, fontVariantNumeric: 'tabular-nums' }}>+Rp {e.amount.toLocaleString('id')}</td>
                <td style={{ padding: '14px 20px', fontSize: 13, color: T.g500 }}>{e.date}</td>
                <td style={{ padding: '14px 20px' }}><Badge variant="active" style={{ fontSize: 10 }}>{lang === 'id' ? 'Dibayar' : 'Paid'}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── CO Cluster View ───────────────────────────────────────────────────
function COClusterView({ lang }) {
  const c = CLUSTERS[0];
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <Badge variant="active">Active</Badge>
            <Badge variant="dark"><Icon name="ShieldCheck" size={10} color={T.c50} /> {c.zkPoints} data points</Badge>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: T.g900, margin: '0 0 4px' }}>{c.name}</h2>
          <p style={{ fontSize: 14, color: T.g500, margin: 0 }}>{c.anchor} · {c.neighborhood}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="secondary" size="sm" icon={<Icon name="FileText" size={14} color={T.p600} />}>
            {lang === 'id' ? 'Kirim Update' : 'Submit Update'}
          </Btn>
          <Btn size="sm" icon={<Icon name="Settings" size={14} color={T.c50} />}>
            {lang === 'id' ? 'Kelola' : 'Manage'}
          </Btn>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        <div>
          <MapPlaceholder accent="#E6F3EF" color={T.p400} height={220} label={c.anchor} />
          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { l: 'Confidence Score', v: '87/100' },
              { l: lang === 'id' ? 'Kelengkapan Data' : 'Data Completeness', v: '95%' },
              { l: lang === 'id' ? 'Sesi Bulan Ini' : 'Sessions This Month', v: '12' },
              { l: lang === 'id' ? 'Rating Rata-rata' : 'Average Rating', v: '4.8 ⭐' },
              { l: lang === 'id' ? 'Diperbarui' : 'Last Updated', v: '23j lalu' },
              { l: lang === 'id' ? 'Refresh Berikut' : 'Next Refresh', v: '7 hari' },
            ].map(s => (
              <div key={s.l} style={{ background: T.c100, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.l}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginTop: 4 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Refresh reminder */}
        <div>
          <div style={{ background: T.e100, borderRadius: 16, padding: '20px', border: `1px solid ${T.e500}30`, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
              <Icon name="AlertTriangle" size={18} color={T.e600} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.e600 }}>
                  {lang === 'id' ? 'Refresh Kuartal: 7 Hari Lagi' : 'Quarterly Refresh: 7 Days Left'}
                </div>
                <div style={{ fontSize: 12, color: T.g500, marginTop: 4 }}>
                  {lang === 'id' ? 'Perbarui semua field Tier 1 & 2 untuk bonus Rp 125.000.' : 'Update all Tier 1 & 2 fields for a Rp 125,000 bonus.'}
                </div>
              </div>
            </div>
            <ProgressBar value={13} max={20} label={lang === 'id' ? 'Field di-refresh' : 'Fields refreshed'} color={T.e600} />
            <div style={{ marginTop: 12 }}>
              <Btn variant="accent" full size="sm">{lang === 'id' ? 'Mulai Refresh' : 'Start Refresh'}</Btn>
            </div>
          </div>

          {/* NFT credential */}
          <div style={{ background: T.g900, borderRadius: 16, padding: '20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.p400, marginBottom: 12 }}>
              {lang === 'id' ? 'Soulbound NFT Credential' : 'Soulbound NFT Credential'}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="Award" size={22} color={T.p600} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.c50 }}>LOKAL CO — Rizky F.</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace' }}>depok-margonda-001</div>
              </div>
            </div>
            {[
              { l: 'Reputation Score', v: '78 / 100' },
              { l: 'Trust Score', v: '91 / 100' },
              { l: 'Cluster Tier', v: 'Tier 3 — Expert' },
              { l: 'Multiplier', v: '1.7× base rate' },
            ].map(s => (
              <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.45)' }}>{s.l}</span>
                <span style={{ color: T.c50, fontWeight: 600 }}>{s.v}</span>
              </div>
            ))}
            <button style={{ marginTop: 14, width: '100%', padding: '9px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              {lang === 'id' ? 'Lihat di Solana Explorer →' : 'View on Solana Explorer →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main CO Dashboard ─────────────────────────────────────────────────
function CODashboard({ lang, setLang, onLogout }) {
  const [page, setPage] = useState(() => localStorage.getItem('lokal_co_page') || 'overview');
  useEffect(() => { localStorage.setItem('lokal_co_page', page); }, [page]);
  const L = LANG[lang].co_dash;
  const titles = { overview: L.overview, fields: L.fields, earnings: L.earnings, cluster: L.clusters };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: T.c50 }}>
      <COSidebar page={page} setPage={setPage} lang={lang} onLogout={onLogout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar title={titles[page]} lang={lang} setLang={setLang} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {page === 'overview' && <COOverview lang={lang} />}
          {page === 'fields' && <COFields lang={lang} />}
          {page === 'earnings' && <COEarnings lang={lang} />}
          {page === 'cluster' && <COClusterView lang={lang} />}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CODashboard });
