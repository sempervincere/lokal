// LOKAL — Auth Page
const { useState } = React;

function AuthPage({ onEnterBO, onEnterCO, lang }) {
  const L = LANG[lang];
  const A = L.auth;
  const [mode, setMode] = useState('signup'); // 'login' | 'signup'
  const [role, setRole] = useState('bo'); // 'bo' | 'co'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      role === 'bo' ? onEnterBO() : onEnterCO();
    }, 900);
  };

  const roles = [
    { id: 'bo', icon: 'BarChart2', title: A.bo, desc: A.boDesc },
    { id: 'co', icon: 'MapPin', title: A.co, desc: A.coDesc },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', fontFamily: "'Plus Jakarta Sans', sans-serif",
      background: T.c50,
    }}>
      {/* Left panel */}
      <div style={{
        flex: '0 0 44%', background: T.g900, padding: '48px', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(ellipse at 20% 80%, ${T.p600}22 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, ${T.e600}18 0%, transparent 50%)` }} />
        <img src="uploads/Logo-LOKAL-AI-remove.png" alt="LOKAL" style={{ height: 34, objectFit: 'contain', filter: 'brightness(0) invert(1)', alignSelf: 'flex-start', position: 'relative' }} />
        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: 'clamp(28px,3vw,42px)', fontWeight: 700, color: T.c50, lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 20px' }}>
            {lang === 'id' ? '"Simulate before\nyou operate."' : '"Simulate before\nyou operate."'}
          </p>
          <p style={{ fontSize: 15, color: 'rgba(253,251,247,0.5)', lineHeight: 1.65, margin: '0 0 36px', maxWidth: '38ch' }}>
            {lang === 'id'
              ? 'Validasi konsep F&B kamu dengan data hyperlokal terverifikasi sebelum mempertaruhkan modal.'
              : 'Validate your F&B concept with verified hyperlocal data before risking your capital.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: 'ShieldCheck', text: lang === 'id' ? '34+ data point terverifikasi per cluster' : '34+ verified data points per cluster' },
              { icon: 'Lock', text: lang === 'id' ? 'Pembayaran IDRX di Solana — transparan' : 'IDRX payments on Solana — fully transparent' },
              { icon: 'Clock', text: lang === 'id' ? 'Laporan + konsultasi AI 12 jam' : '10-section report + 12-hour AI consultation' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={f.icon} size={16} color={T.p400} />
                </div>
                <span style={{ fontSize: 14, color: 'rgba(253,251,247,0.65)', lineHeight: 1.5, paddingTop: 6 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(253,251,247,0.25)', position: 'relative' }}>
          © 2025 LOKAL AI · Powered by Solana
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 5%' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: T.g900, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
            {mode === 'login' ? A.loginTitle : A.signupTitle}
          </h1>
          <p style={{ fontSize: 14, color: T.g500, margin: '0 0 28px' }}>
            {mode === 'signup'
              ? (lang === 'id' ? 'Gratis untuk memulai. Tidak perlu kartu kredit.' : 'Free to start. No credit card required.')
              : (lang === 'id' ? 'Lanjutkan simulasi kamu.' : 'Continue your simulations.')}
          </p>

          {/* Role selector (signup only) */}
          {mode === 'signup' && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{A.roleTitle}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {roles.map(r => (
                  <button key={r.id} onClick={() => setRole(r.id)} style={{
                    padding: '14px', borderRadius: 12,
                    border: `2px solid ${role === r.id ? T.p600 : T.c200}`,
                    background: role === r.id ? T.p100 : T.c50,
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    transition: 'all 150ms',
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: role === r.id ? T.p600 : T.c200, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                      <Icon name={r.icon} size={16} color={role === r.id ? T.c50 : T.g500} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: role === r.id ? T.p600 : T.g900, marginBottom: 3 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: T.g500, lineHeight: 1.4 }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {mode === 'signup' && (
              <Input placeholder={A.name} value={name} onChange={e => setName(e.target.value)}
                prefix={<Icon name="Users" size={16} color={T.g500} />} />
            )}
            <Input placeholder={A.email} value={email} onChange={e => setEmail(e.target.value)} type="email"
              prefix={<Icon name="MessageCircle" size={16} color={T.g500} />} />
            <Input placeholder={A.password} value={password} onChange={e => setPassword(e.target.value)} type="password"
              prefix={<Icon name="Lock" size={16} color={T.g500} />} />
          </div>

          <Btn full size="lg" onClick={submit} disabled={loading}
            icon={loading ? null : <Icon name="ArrowRight" size={16} color={T.c50} />}>
            {loading ? (lang === 'id' ? 'Memproses...' : 'Processing...') : (mode === 'login' ? A.loginBtn : A.signupBtn)}
          </Btn>

          {/* Wallet note */}
          <div style={{ marginTop: 16, padding: '12px 14px', background: T.p100, borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Icon name="Wallet" size={16} color={T.p600} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 12, color: T.p600, lineHeight: 1.5 }}>{A.walletNote}</span>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 13,
              color: T.p600, fontFamily: 'inherit', fontWeight: 600,
            }}>
              {mode === 'login' ? A.toggleSignup : A.toggleLogin}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AuthPage });
