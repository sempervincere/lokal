'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, MapPin, Navigation, Send, Plus, Trash2, Info } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';

const STEPS = ['Legitimasi Area', 'Detail Cluster', 'Review & Kirim'];

const OCCUPATION_OPTIONS = ['student', 'worker', 'freelancer', 'other'];
const DURATION_OPTIONS = ['under_6mo', '6mo_2y', '2y_plus'];
const PRESENCE_OPTIONS = ['daily', '3x_week', 'weekly', 'whenever'];
const ANCHOR_TYPE_OPTIONS = ['university', 'mall', 'market', 'station', 'office', 'residential'];

const LABELS: Record<string, string> = {
  student: 'Mahasiswa / Pelajar', worker: 'Pekerja / Karyawan', freelancer: 'Freelancer', other: 'Lainnya',
  under_6mo: 'Kurang dari 6 bulan', '6mo_2y': '6 bulan — 2 tahun', '2y_plus': 'Lebih dari 2 tahun',
  daily: 'Setiap hari', '3x_week': '3× seminggu', weekly: 'Seminggu sekali', whenever: 'Kalau perlu saja',
  university: 'Gerbang Universitas', mall: 'Pusat Perbelanjaan (Mall)', market: 'Pasar Tradisional', station: 'Stasiun / Terminal', office: 'Kawasan Perkantoran', residential: 'Kawasan Perumahan',
};

interface BizEntry { name: string; location: string; priceRange: string; }

export default function COClusterCreatePage() {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  // Step 1
  const [occupation, setOccupation] = useState('');
  const [occupationOther, setOccupationOther] = useState('');
  const [areaDuration, setAreaDuration] = useState('');
  const [primaryAnchor, setPrimaryAnchor] = useState('');
  const [physicalPresence, setPhysicalPresence] = useState('');
  const [businesses, setBusinesses] = useState<BizEntry[]>([{ name: '', location: '', priceRange: '' }]);

  // Step 2
  const [clusterName, setClusterName] = useState('');
  const [anchorType, setAnchorType] = useState('');
  const [corridorDesc, setCorridorDesc] = useState('');
  const [anchorLat, setAnchorLat] = useState<number | null>(null);
  const [anchorLng, setAnchorLng] = useState<number | null>(null);
  const [anchorLabel, setAnchorLabel] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const finalOccupation = occupation === 'other' && occupationOther.trim() ? `other: ${occupationOther.trim()}` : occupation;

  function canNext(): boolean {
    if (step === 0) {
      if (!occupation || (occupation === 'other' && !occupationOther.trim())) return false;
      if (!areaDuration || !primaryAnchor.trim() || !physicalPresence) return false;
      if (!businesses.some(b => b.name.trim())) return false;
      return true;
    }
    if (step === 1) {
      if (!clusterName.trim() || !anchorType || !corridorDesc.trim()) return false;
      if (anchorLat == null || anchorLng == null || !anchorLabel.trim()) return false;
      return true;
    }
    return true;
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) { setGeoError('Geolocation tidak didukung'); return; }
    setGeoLoading(true); setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      pos => { setAnchorLat(pos.coords.latitude); setAnchorLng(pos.coords.longitude); setAnchorLabel(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`); setGeoLoading(false); },
      () => { setGeoError('Gagal mendapatkan lokasi. Izinkan akses lokasi atau isi manual.'); setGeoLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function updateBiz(idx: number, field: keyof BizEntry, value: string) {
    setBusinesses(prev => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b));
  }

  function addBiz() { if (businesses.length < 5) setBusinesses(prev => [...prev, { name: '', location: '', priceRange: '' }]); }
  function removeBiz(idx: number) { if (businesses.length > 1) setBusinesses(prev => prev.filter((_, i) => i !== idx)); }

  async function handleSubmit() {
    setSubmitting(true); setError(null);
    const validBiz = businesses.filter(b => b.name.trim());
    const res = await fetch('/api/co/clusters/propose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        occupation: finalOccupation, areaDuration, primaryAnchor: primaryAnchor.trim(), physicalPresence,
        sampleBusinesses: validBiz.map(b => ({ name: b.name.trim(), location: b.location.trim() || '—', priceRange: b.priceRange.trim() || '—' })),
        clusterName: clusterName.trim(), clusterDescription: null, anchorType, corridorDesc: corridorDesc.trim(),
        anchorLat, anchorLng, anchorLabel: anchorLabel.trim(), radiusKm: 1.5,
      }),
    });
    if (!res.ok) { try { const d = await res.json(); setError(d.message || d.error || 'Gagal'); } catch { setError('Gagal mengirim'); } setSubmitting(false); return; }
    setSuccess(true); setTimeout(() => router.push('/co/dashboard/clusters'), 2000);
  }

  if (success) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Send size={28} color={T.p600} /></div>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Proposal Terkirim!</div>
        <div style={{ fontSize: 14, color: T.g500 }}>Admin akan mereview proposal kamu. Mengalihkan...</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      {/* Stepper */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: i <= step ? T.p600 : T.c200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: i <= step ? T.c50 : T.g500 }}>{i + 1}</div>
              <span style={{ marginLeft: 8, fontSize: 13, fontWeight: i === step ? 700 : 500, color: i <= step ? T.g900 : T.g500 }}>{s}</span>
              {i < STEPS.length - 1 && <div style={{ width: 48, height: 2, background: i < step ? T.p600 : T.c200, margin: '0 16px' }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* ── STEP 0: Area Legitimacy ───────────────────────────────── */}
        {step === 0 && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 4 }}>Legitimasi Area</div>
            <p style={{ fontSize: 13, color: T.g500, marginBottom: 20, lineHeight: 1.6 }}>Kami perlu memverifikasi bahwa kamu benar-benar mengenal area ini sebelum mengajukan cluster.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Occupation */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.g700, marginBottom: 8 }}>1. Apa status kamu di area ini?</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {OCCUPATION_OPTIONS.map(o => (
                    <button key={o} type="button" onClick={() => setOccupation(o)} style={{ padding: '8px 14px', borderRadius: 9999, border: `1.5px solid ${occupation === o ? T.p600 : T.c200}`, background: occupation === o ? T.p100 : T.c50, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', color: occupation === o ? T.p600 : T.g700, transition: 'all 150ms' }}>{LABELS[o]}</button>
                  ))}
                </div>
                {occupation === 'other' && <input placeholder="Sebutkan status kamu..." value={occupationOther} onChange={e => setOccupationOther(e.target.value)} style={{ marginTop: 8, width: '100%', padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${T.c200}`, fontSize: 13, fontFamily: 'inherit', color: T.g900, outline: 'none', boxSizing: 'border-box' }} />}
              </div>

              {/* Duration */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.g700, marginBottom: 8 }}>2. Sudah berapa lama kamu di area ini?</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {DURATION_OPTIONS.map(o => (
                    <button key={o} type="button" onClick={() => setAreaDuration(o)} style={{ padding: '10px 16px', borderRadius: 10, textAlign: 'left', border: `1.5px solid ${areaDuration === o ? T.p600 : T.c200}`, background: areaDuration === o ? T.p100 : T.c50, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', color: areaDuration === o ? T.p600 : T.g700, transition: 'all 150ms' }}>{LABELS[o]}</button>
                  ))}
                </div>
              </div>

              {/* Primary Anchor */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.g700, marginBottom: 8 }}>3. Apa anchor point utama kamu di area ini?</div>
                <p style={{ fontSize: 11, color: T.g500, marginBottom: 8, lineHeight: 1.5 }}>Contoh: &ldquo;Mahasiswa di Universitas Indonesia&rdquo; / &ldquo;Menjalankan bisnis di Jalan Margonda&rdquo; / &ldquo;Warga Kelurahan Beji&rdquo;</p>
                <textarea placeholder="Jelaskan koneksi kamu dengan area ini..." value={primaryAnchor} onChange={e => setPrimaryAnchor(e.target.value)} rows={2} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, resize: 'vertical', border: `1.5px solid ${T.c200}`, fontSize: 13, fontFamily: 'inherit', color: T.g900, outline: 'none', boxSizing: 'border-box', lineHeight: 1.5 }} />
              </div>

              {/* Physical Presence */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.g700, marginBottom: 8 }}>4. Seberapa sering kamu secara fisik berada di area ini?</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {PRESENCE_OPTIONS.map(o => (
                    <button key={o} type="button" onClick={() => setPhysicalPresence(o)} style={{ padding: '8px 14px', borderRadius: 9999, border: `1.5px solid ${physicalPresence === o ? T.p600 : T.c200}`, background: physicalPresence === o ? T.p100 : T.c50, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', color: physicalPresence === o ? T.p600 : T.g700, transition: 'all 150ms' }}>{LABELS[o]}</button>
                  ))}
                </div>
              </div>

              {/* Sample Businesses */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.g700, marginBottom: 8 }}>5. Sebutkan 5 bisnis F&B nyata yang saat ini beroperasi di koridor ini</div>
                <p style={{ fontSize: 11, color: T.g500, marginBottom: 12, lineHeight: 1.5 }}>Nama, perkiraan lokasi, dan rentang harga. Ini adalah pengecekan kualitas data sampel kamu — semakin spesifik, semakin baik.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {businesses.map((b, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.g500, width: 20, textAlign: 'right', flexShrink: 0 }}>{i + 1}.</span>
                      <input placeholder="Nama bisnis" value={b.name} onChange={e => updateBiz(i, 'name', e.target.value)} style={{ flex: '2 1 120px', padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${T.c200}`, fontSize: 12, fontFamily: 'inherit', color: T.g900, outline: 'none', minWidth: 0, boxSizing: 'border-box' }} />
                      <input placeholder="Lokasi perkiraan" value={b.location} onChange={e => updateBiz(i, 'location', e.target.value)} style={{ flex: '2 1 120px', padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${T.c200}`, fontSize: 12, fontFamily: 'inherit', color: T.g900, outline: 'none', minWidth: 0, boxSizing: 'border-box' }} />
                      <input placeholder="Rentang harga" value={b.priceRange} onChange={e => updateBiz(i, 'priceRange', e.target.value)} style={{ flex: '1 1 80px', padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${T.c200}`, fontSize: 12, fontFamily: 'inherit', color: T.g900, outline: 'none', minWidth: 0, boxSizing: 'border-box' }} />
                      {businesses.length > 1 && <button type="button" onClick={() => removeBiz(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}><Trash2 size={14} color={T.g500} /></button>}
                    </div>
                  ))}
                  {businesses.length < 5 && (
                    <button type="button" onClick={addBiz} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1.5px dashed ${T.c200}`, background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', color: T.p600 }}><Plus size={14} />Tambah bisnis</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1: Cluster Details ───────────────────────────────── */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 4 }}>Detail Cluster</div>
            <p style={{ fontSize: 13, color: T.g500, marginBottom: 20, lineHeight: 1.6 }}>Tentukan batas geografis dan karakteristik komersial dari cluster yang kamu usulkan.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Cluster Name */}
              <InputField placeholder="Nama Cluster (contoh: Jalan Margonda Corridor)" value={clusterName} onChange={e => setClusterName(e.target.value)} />

              {/* Anchor Type */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.g700, marginBottom: 8 }}>Apa aktivitas komersial yang menjadi anchor area ini?</div>
                <p style={{ fontSize: 11, color: T.g500, marginBottom: 8, lineHeight: 1.5 }}>Gerbang universitas, pusat perbelanjaan, pasar tradisional, dan stasiun memiliki pola pembelian yang sangat berbeda.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ANCHOR_TYPE_OPTIONS.map(o => (
                    <button key={o} type="button" onClick={() => setAnchorType(o)} style={{ padding: '8px 14px', borderRadius: 9999, border: `1.5px solid ${anchorType === o ? T.p600 : T.c200}`, background: anchorType === o ? T.p100 : T.c50, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', color: anchorType === o ? T.p600 : T.g700, transition: 'all 150ms' }}>{LABELS[o]}</button>
                  ))}
                </div>
              </div>

              {/* Corridor Description */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.g700, marginBottom: 8 }}>Deskripsikan koridor walkable 1.5km ini dengan kata-katamu sendiri</div>
                <p style={{ fontSize: 11, color: T.g500, marginBottom: 8, lineHeight: 1.5 }}>CO yang benar-benar mengenal area akan menyebut jalan spesifik dan landmark. Jawaban generik adalah red flag.</p>
                <textarea placeholder="Contoh: &ldquo;Jalan Margonda Raya dari gerbang UI ke selatan sampai pintu masuk Margo City Mall; termasuk Jalan Kukusan, Jalan Nusantara, dan strip komersial di belakang Stasiun Depok Baru dalam batas 1.5km.&rdquo;" value={corridorDesc} onChange={e => setCorridorDesc(e.target.value)} rows={4} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, resize: 'vertical', border: `1.5px solid ${T.c200}`, fontSize: 13, fontFamily: 'inherit', color: T.g900, outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }} />
              </div>

              {/* Map / Anchor Point */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.g700 }}>Titik Anchor — pusat radius 1.5km</div>
                  <button type="button" onClick={useCurrentLocation} disabled={geoLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: geoLoading ? 'wait' : 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 600, color: T.e600, background: T.e100, opacity: geoLoading ? 0.7 : 1 }}><Navigation size={12} color={T.e600} />{geoLoading ? 'Mendeteksi...' : '📍 Gunakan Lokasi Saya'}</button>
                </div>
                {geoError && <div style={{ padding: '8px 12px', background: '#FEF3C7', borderRadius: 8, marginBottom: 10, fontSize: 12, color: T.warning }}>{geoError}</div>}
                <div ref={mapContainerRef} style={{ width: '100%', height: 220, borderRadius: 14, background: T.c100, border: `1.5px solid ${T.c200}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, position: 'relative', overflow: 'hidden' }}>
                  {anchorLat != null && anchorLng != null ? (
                    <>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)' }}><MapPin size={36} color={T.p600} fill={T.p100} /></div>
                      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}><circle cx="50%" cy="45%" r="65" fill="none" stroke={T.p600} strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" /></svg>
                      <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center' }}><span style={{ fontSize: 11, color: T.p600, fontWeight: 700, background: T.c50, padding: '4px 12px', borderRadius: 6 }}>📍 {anchorLat.toFixed(5)}, {anchorLng.toFixed(5)}</span></div>
                      <div style={{ position: 'absolute', top: 12, right: 14, background: T.p600, color: T.c50, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6 }}>1.5 km</div>
                    </>
                  ) : (
                    <>
                      <MapPin size={28} color={T.g500} /><div style={{ fontSize: 13, color: T.g500 }}>Klik "Gunakan Lokasi Saya" atau isi koordinat di bawah</div>
                    </>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                  <InputField placeholder="Latitude (-6.3728)" value={anchorLat != null ? String(anchorLat) : ''} onChange={e => setAnchorLat(parseFloat(e.target.value) || null)} type="number" />
                  <InputField placeholder="Longitude (106.8315)" value={anchorLng != null ? String(anchorLng) : ''} onChange={e => setAnchorLng(parseFloat(e.target.value) || null)} type="number" />
                </div>
                <div style={{ marginTop: 10 }}><InputField placeholder="Label Anchor (contoh: Universitas Indonesia Gate)" value={anchorLabel} onChange={e => setAnchorLabel(e.target.value)} prefix={<MapPin size={14} color={T.g500} />} /></div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Review ────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 4 }}>Review Proposal</div>
            <p style={{ fontSize: 13, color: T.g500, marginBottom: 20 }}>Periksa kembali semua data sebelum dikirim ke admin.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: T.c100, borderRadius: 12, padding: '16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Legitimasi Area</div>
                {[
                  { l: 'Status di area', v: occupation === 'other' ? occupationOther : LABELS[occupation] || occupation },
                  { l: 'Durasi di area', v: LABELS[areaDuration] || areaDuration },
                  { l: 'Anchor point', v: primaryAnchor },
                  { l: 'Kehadiran fisik', v: LABELS[physicalPresence] || physicalPresence },
                  { l: 'Bisnis F&B', v: businesses.filter(b => b.name.trim()).map(b => b.name.trim()).join(', ') || '—' },
                ].map(r => (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.04)', fontSize: 13 }}><span style={{ color: T.g500 }}>{r.l}</span><span style={{ color: T.g900, fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>{r.v}</span></div>
                ))}
              </div>
              <div style={{ background: T.c100, borderRadius: 12, padding: '16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Detail Cluster</div>
                {[
                  { l: 'Nama cluster', v: clusterName },
                  { l: 'Tipe anchor', v: LABELS[anchorType] || anchorType },
                  { l: 'Deskripsi koridor', v: corridorDesc.length > 100 ? corridorDesc.slice(0, 100) + '...' : corridorDesc },
                  { l: 'Koordinat', v: `${anchorLat?.toFixed(5)}, ${anchorLng?.toFixed(5)}` },
                  { l: 'Label anchor', v: anchorLabel },
                  { l: 'Radius', v: '1.5 km' },
                ].map(r => (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.04)', fontSize: 13 }}><span style={{ color: T.g500 }}>{r.l}</span><span style={{ color: T.g900, fontWeight: 600, maxWidth: '55%', textAlign: 'right' }}>{r.v}</span></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div style={{ marginTop: 20, padding: '10px 14px', background: '#FEE2E2', borderRadius: 10, fontSize: 13, color: T.danger }}>{error}</div>}

        {/* Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
          <Button variant="ghost" icon={<ChevronLeft size={16} color={T.g500} />} onClick={() => step > 0 ? setStep(step - 1) : router.back()}>{step === 0 ? 'Batal' : 'Kembali'}</Button>
          {step < 2 ? (
            <Button icon={<ChevronRight size={16} color={T.c50} />} onClick={() => setStep(step + 1)} disabled={!canNext()}>Lanjut</Button>
          ) : (
            <Button icon={<Send size={16} color={T.c50} />} onClick={handleSubmit} disabled={submitting}>{submitting ? 'Mengirim...' : 'Kirim Proposal'}</Button>
          )}
        </div>
      </div>
    </div>
  );
}
