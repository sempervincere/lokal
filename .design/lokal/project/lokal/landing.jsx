// LOKAL — Landing Page
const { useState, useEffect, useRef } = React;

function LandingPage({ onLogin, lang, setLang }) {
  const L = LANG[lang];
  const [scrolled, setScrolled] = useState(false);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    setTimeout(() => setVis(true), 100);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cities = lang === 'id'
    ? ['Semua Kota', 'Depok', 'Jakarta Selatan', 'Tangerang Selatan', 'Surabaya']
    : ['All Cities', 'Depok', 'South Jakarta', 'South Tangerang', 'Surabaya'];
  const [cityFilter, setCityFilter] = useState(cities[0]);

  const filtered = CLUSTERS.filter(c =>
    cityFilter === cities[0] || c.city === ['Depok','Jakarta Selatan','Tangerang Selatan','Surabaya'][cities.indexOf(cityFilter)-1]
  );

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: T.c50, color: T.g900, minHeight: '100vh' }}>

      {/* ── FLOATING NAV ── */}
      <div style={{
        position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 100, display: 'flex', alignItems: 'center', gap: 0,
        background: scrolled ? 'rgba(253,251,247,0.92)' : 'rgba(253,251,247,0.75)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${scrolled ? T.c200 : 'rgba(245,241,236,0.6)'}`,
        borderRadius: 9999, padding: '8px 10px 8px 20px',
        boxShadow: scrolled ? '0 4px 24px rgba(26,26,26,0.09)' : '0 2px 12px rgba(26,26,26,0.05)',
        transition: 'all 300ms ease',
        width: 'min(860px, calc(100vw - 40px))',
      }}>
        <img src="uploads/Logo-LOKAL-AI-remove.png" alt="LOKAL" style={{ height: 30, objectFit: 'contain', marginRight: 24 }} />
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {[
            { label: L.nav.browse, id: 'section-clusters' },
            { label: L.nav.how, id: 'section-how' },
            { label: L.nav.pricing, id: 'section-pricing' },
          ].map(item => (
            <button key={item.id} onClick={() => {
              const el = document.getElementById(item.id);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '7px 14px',
              borderRadius: 9999, fontSize: 14, fontWeight: 500, color: T.g700,
              fontFamily: 'inherit', transition: 'all 150ms',
            }}
              onMouseEnter={e => e.currentTarget.style.background = T.c200}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >{item.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} style={{
            background: T.c200, border: 'none', cursor: 'pointer', padding: '6px 12px',
            borderRadius: 9999, fontSize: 12, fontWeight: 700, color: T.g700,
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <Icon name="Globe" size={13} color={T.g500} /> {lang.toUpperCase()}
          </button>
          <button onClick={onLogin} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px',
            fontSize: 14, fontWeight: 600, color: T.g700, fontFamily: 'inherit',
          }}>{L.nav.login}</button>
          <Btn onClick={onLogin}>{L.nav.cta}</Btn>
        </div>
      </div>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '120px 5% 80px', maxWidth: 1200, margin: '0 auto', gap: 60, position: 'relative' }}>
        {/* Subtle animated background */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '10%', left: '5%', width: 480, height: 480, borderRadius: '50%', background: `radial-gradient(circle, ${T.p100} 0%, transparent 70%)`, opacity: 0.7, animation: 'heroPulse 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: 360, height: 360, borderRadius: '50%', background: `radial-gradient(circle, ${T.e100} 0%, transparent 70%)`, opacity: 0.6, animation: 'heroPulse 10s ease-in-out 2s infinite' }} />
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.035 }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="herogrid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke={T.g900} strokeWidth="0.8"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#herogrid)"/>
          </svg>
        </div>
        <div style={{ flex: '0 0 52%', opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(24px)', transition: 'all 600ms ease', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: T.p100, border: `1px solid ${T.p400}30`, borderRadius: 9999, padding: '5px 14px', marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.p600 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: T.p600, letterSpacing: '0.02em' }}>{L.hero.badge}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(48px, 5.5vw, 76px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.03em', margin: '0 0 24px', color: T.g900 }}>
            {L.hero.h1a}<br />
            <span style={{ color: T.p600, fontStyle: 'italic' }}>{L.hero.h1b}</span><br />
            {L.hero.h1c}
          </h1>
          <p style={{ fontSize: 18, color: T.g500, lineHeight: 1.7, margin: '0 0 36px', maxWidth: '46ch' }}>{L.hero.sub}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Btn size="lg" onClick={onLogin} icon={<Icon name="MapPin" size={18} color={T.c50} />}>{L.hero.cta1}</Btn>
            <Btn size="lg" variant="secondary" onClick={() => { const el = document.getElementById('section-how'); if(el) el.scrollIntoView({behavior:'smooth'}); }}>{L.hero.cta2} →</Btn>
          </div>
          <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex' }}>
              {['#1B7A65','#C17A5F','#5B8BA0','#D4A03D'].map((c,i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: '2px solid white', marginLeft: i > 0 ? -8 : 0 }} />
              ))}
            </div>
            <span style={{ fontSize: 13, color: T.g500 }}>{L.hero.proof}</span>
          </div>
        </div>

        {/* Hero visual */}
        <div style={{ flex: 1, opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(32px)', transition: 'all 700ms ease 150ms', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'relative' }}>
            {/* Main cluster card */}
            <div style={{ background: T.c100, borderRadius: 20, border: `1px solid ${T.c200}`, overflow: 'hidden', boxShadow: '0 16px 48px rgba(26,26,26,0.10)' }}>
              <MapPlaceholder accent="#E6F3EF" color={T.p400} height={160} />
              <div style={{ padding: '20px 22px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.g900 }}>Jalan Margonda</div>
                    <div style={{ fontSize: 13, color: T.g500, marginTop: 2 }}>UI Gate — Margo City · Depok</div>
                  </div>
                  <ConfRing score={87} />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  <Badge variant="active"><Icon name="ShieldCheck" size={10} color={T.p600} /> Active</Badge>
                  <Badge variant="dark"><Icon name="ShieldCheck" size={10} color={T.c50} /> 34 titik data</Badge>
                  <Badge variant="neutral"><Icon name="Clock" size={10} color={T.g500} /> 23j lalu</Badge>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {[
                    { l: 'Price Ceiling Café', v: 'Rp 35.000' },
                    { l: 'Dominan Usia', v: '18–25th (58%)' },
                    { l: 'Digital Payment', v: '87% adoption' },
                    { l: 'Peak Traffic', v: '800–1.200/jam' },
                  ].map(s => (
                    <div key={s.l} style={{ background: T.c50, borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ fontSize: 10, color: T.g500, fontWeight: 600, marginBottom: 3 }}>{s.l}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.g900, fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <Btn full onClick={onLogin} icon={<Icon name="MessageCircle" size={15} color={T.c50} />}>
                  {lang === 'id' ? 'Chat Gratis 7 Pesan' : '7 Free Chat Messages'}
                </Btn>
              </div>
            </div>
            {/* Floating badge */}
            <div style={{
              position: 'absolute', top: -16, right: -16,
              background: T.g900, borderRadius: 14, padding: '10px 16px',
              boxShadow: '0 8px 24px rgba(26,26,26,0.2)',
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Confidence Score</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.c50, letterSpacing: '-0.02em' }}>87<span style={{ fontSize: 12, opacity: 0.6 }}>/100</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section style={{ background: T.g900, padding: '80px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.p400, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>{L.problem.label}</div>
          <blockquote style={{ fontSize: 'clamp(18px,2.2vw,26px)', color: 'rgba(253,251,247,0.9)', lineHeight: 1.6, fontStyle: 'italic', maxWidth: '70ch', margin: '0 0 12px', fontWeight: 400 }}>
            {L.problem.quote}
          </blockquote>
          <div style={{ fontSize: 13, color: 'rgba(253,251,247,0.4)', marginBottom: 60 }}>{L.problem.source}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
            {L.problem.stats.map((s, i) => (
              <div key={i} style={{ borderTop: `2px solid ${i === 3 ? T.p600 : 'rgba(255,255,255,0.12)'}`, paddingTop: 20 }}>
                <div style={{ fontSize: 'clamp(22px,2.5vw,32px)', fontWeight: 700, color: i === 3 ? T.p400 : T.c50, letterSpacing: '-0.02em', marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>{s.val}</div>
                <div style={{ fontSize: 13, color: 'rgba(253,251,247,0.5)', lineHeight: 1.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="section-how" style={{ padding: '80px 5%', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>{L.how.label}</div>
        <h2 style={{ fontSize: 'clamp(28px,3vw,42px)', fontWeight: 700, color: T.g900, letterSpacing: '-0.02em', margin: '0 0 52px' }}>
          {lang === 'id' ? 'Tiga langkah\nmenuju keputusan yang tepat.' : 'Three steps to\na confident decision.'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
          {L.how.steps.map((s, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.p400, letterSpacing: '0.06em', marginBottom: 20 }}>{s.n}</div>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Icon name={['MapPin','MessageCircle','FileText'][i]} size={22} color={T.p600} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: T.g900, margin: '0 0 10px' }}>{s.t}</h3>
              <p style={{ fontSize: 15, color: T.g500, lineHeight: 1.65, margin: 0 }}>{s.d}</p>
              {i < 2 && <div style={{ position: 'absolute', top: 68, right: -16, color: T.c200, fontSize: 24 }}>→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── CLUSTER PREVIEW ── */}
      <section id="section-clusters" style={{ padding: '20px 5% 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{L.clusters.label}</div>
            <h2 style={{ fontSize: 'clamp(24px,2.5vw,36px)', fontWeight: 700, color: T.g900, letterSpacing: '-0.02em', margin: 0 }}>{L.clusters.sub}</h2>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {cities.map(c => (
              <button key={c} onClick={() => setCityFilter(c)} style={{
                padding: '7px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all 150ms',
                background: cityFilter === c ? T.p600 : T.c200,
                color: cityFilter === c ? T.c50 : T.g700,
              }}>{c}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
          {CLUSTERS.map((c, i) => <LandingClusterCard key={c.id} cluster={c} onChat={onLogin} lang={lang} delay={i * 80} />)}
        </div>
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <Btn variant="secondary" onClick={onLogin} icon={<Icon name="ArrowRight" size={15} color={T.p600} />}>
            {lang === 'id' ? 'Lihat Semua Cluster' : 'View All Clusters'}
          </Btn>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="section-pricing" style={{ padding: '80px 5%', background: T.c100 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>{L.pricing.label}</div>
            <h2 style={{ fontSize: 'clamp(26px,3vw,40px)', fontWeight: 700, color: T.g900, letterSpacing: '-0.02em', margin: 0 }}>{L.pricing.sub}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {L.pricing.plans.map((p, i) => (
              <div key={i} style={{
                background: p.highlight ? T.g900 : T.c50,
                borderRadius: 20, padding: '28px 26px',
                border: p.highlight ? 'none' : `1px solid ${T.c200}`,
                boxShadow: p.highlight ? '0 12px 40px rgba(26,26,26,0.15)' : '0 2px 8px rgba(26,26,26,0.04)',
                position: 'relative', overflow: 'hidden',
              }}>
                {p.highlight && <div style={{ position: 'absolute', top: 16, right: 16 }}><Badge variant="active">Populer</Badge></div>}
                <div style={{ fontSize: 13, fontWeight: 700, color: p.highlight ? T.p400 : T.g500, marginBottom: 6 }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, color: p.highlight ? T.c50 : T.g900, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{p.price}</span>
                  {p.period && <span style={{ fontSize: 13, color: p.highlight ? 'rgba(253,251,247,0.5)' : T.g500 }}>{p.period}</span>}
                </div>
                <p style={{ fontSize: 13, color: p.highlight ? 'rgba(253,251,247,0.6)' : T.g500, margin: '0 0 20px' }}>{p.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: p.highlight ? T.p100 : T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name="Check" size={10} color={T.p600} />
                      </div>
                      <span style={{ fontSize: 13, color: p.highlight ? 'rgba(253,251,247,0.8)' : T.g700 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Btn variant={p.highlight ? 'primary' : 'secondary'} full onClick={onLogin}>{p.cta}</Btn>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '48px 5%', background: T.g900 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap' }}>
          <div>
            <img src="uploads/Logo-LOKAL-AI-remove.png" alt="LOKAL" style={{ height: 32, objectFit: 'contain', marginBottom: 12, filter: 'brightness(0) invert(1)' }} />
            <p style={{ fontSize: 13, color: 'rgba(253,251,247,0.4)', maxWidth: '40ch', lineHeight: 1.6, margin: 0 }}>{L.footer.desc}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Badge variant="dark" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
              <Icon name="ShieldCheck" size={11} color="rgba(255,255,255,0.6)" /> Powered by Solana
            </Badge>
            <Badge variant="dark" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
              ZK Verified Data
            </Badge>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LandingClusterCard({ cluster: c, onChat, lang, delay }) {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, []);
  const L = LANG[lang];
  return (
    <div onClick={onChat} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: T.c50, borderRadius: 18, border: `1px solid ${T.c200}`, overflow: 'hidden', cursor: 'pointer',
        opacity: vis ? 1 : 0, transform: vis ? (hov ? 'translateY(-3px)' : 'none') : 'translateY(12px)',
        transition: `opacity 350ms ease ${delay}ms, transform 250ms ease, box-shadow 250ms ease`,
        boxShadow: hov ? '0 12px 32px rgba(26,26,26,0.10)' : '0 2px 8px rgba(26,26,26,0.04)',
      }}>
      <div style={{ position: 'relative' }}>
        <MapPlaceholder accent={c.accent} color={c.iconColor} height={130} />
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          <Badge variant={c.status === 'Active' ? 'active' : 'seeding'}>{c.status}</Badge>
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <ConfRing score={c.confidence} size={40} />
        </div>
      </div>
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 2 }}>{c.name}</div>
        <div style={{ fontSize: 12, color: T.g500, marginBottom: 12 }}>{c.subtitle} · {c.neighborhood}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { l: lang === 'id' ? 'Price Ceiling' : 'Price Ceiling', v: `Rp ${(c.keyStats.priceCeiling / 1000).toFixed(0)}K` },
            { l: lang === 'id' ? 'ZK Data Points' : 'ZK Data Points', v: `${c.zkPoints} titik` },
            { l: lang === 'id' ? 'Traffic' : 'Traffic', v: c.traffic },
            { l: lang === 'id' ? 'Diperbarui' : 'Updated', v: `${c.freshness}j lalu` },
          ].map(s => (
            <div key={s.l} style={{ background: T.c100, borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ fontSize: 10, color: T.g500, fontWeight: 600 }}>{s.l}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.g900, marginTop: 2 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {c.categories.slice(0, 3).map(cat => <Badge key={cat} variant="neutral" style={{ fontSize: 10 }}>{cat}</Badge>)}
        </div>
        <Btn full size="sm" onClick={onChat} icon={<Icon name="MessageCircle" size={14} color={T.c50} />}>{L.clusters.chat}</Btn>
      </div>
    </div>
  );
}

Object.assign(window, { LandingPage });
