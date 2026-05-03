'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Navigation,
  Send,
  Plus,
  Trash2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';

/* ── Constants ─────────────────────────────────────────────── */

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

/* ── Map Helpers ───────────────────────────────────────────── */

function createCircleGeoJSON(center: [number, number], radiusKm: number, points = 64) {
  const coords: [number, number][] = [];
  const distanceX = radiusKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = radiusKm / 110.574;
  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    coords.push([center[0] + distanceX * Math.cos(theta), center[1] + distanceY * Math.sin(theta)]);
  }
  coords.push(coords[0]);
  return { type: 'Feature' as const, geometry: { type: 'Polygon' as const, coordinates: [coords] }, properties: {} };
}

/* ── Component ─────────────────────────────────────────────── */

export default function COClusterCreatePage() {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const circleSourceRef = useRef<string | null>(null);

  const [step, setStep] = useState(0);

  /* Step 1 */
  const [occupation, setOccupation] = useState('');
  const [occupationOther, setOccupationOther] = useState('');
  const [areaDuration, setAreaDuration] = useState('');
  const [primaryAnchor, setPrimaryAnchor] = useState('');
  const [physicalPresence, setPhysicalPresence] = useState('');
  const [businesses, setBusinesses] = useState<BizEntry[]>([{ name: '', location: '', priceRange: '' }]);

  /* Step 2 */
  const [clusterName, setClusterName] = useState('');
  const [anchorType, setAnchorType] = useState('');
  const [corridorDesc, setCorridorDesc] = useState('');
  const [anchorLat, setAnchorLat] = useState<number | null>(null);
  const [anchorLng, setAnchorLng] = useState<number | null>(null);
  const [anchorLabel, setAnchorLabel] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  /* Submit */
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const finalOccupation = occupation === 'other' && occupationOther.trim() ? `other: ${occupationOther.trim()}` : occupation;

  /* Scroll to top on step change */
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);

  /* Mapbox init (Step 2 only) */
  useEffect(() => {
    if (step !== 1 || !mapContainerRef.current || mapRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) { setGeoError('Mapbox token tidak ditemukan.'); return; }
    mapboxgl.accessToken = token;

    const initialLat = anchorLat ?? -6.3728;
    const initialLng = anchorLng ?? 106.8315;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [initialLng, initialLat],
      zoom: 14.5,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));

    map.on('load', () => {
      const sourceId = `circle-${Date.now()}`;
      circleSourceRef.current = sourceId;
      map.addSource(sourceId, { type: 'geojson', data: createCircleGeoJSON([initialLng, initialLat], 1.5) as any });
      map.addLayer({ id: `${sourceId}-fill`, type: 'fill', source: sourceId, paint: { 'fill-color': T.p600, 'fill-opacity': 0.08 } });
      map.addLayer({ id: `${sourceId}-line`, type: 'line', source: sourceId, paint: { 'line-color': T.p600, 'line-width': 2, 'line-dasharray': [4, 3], 'line-opacity': 0.6 } });

      const el = document.createElement('div');
      el.className = 'w-8 h-8 rounded-full flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing';
      el.style.backgroundColor = T.p600;
      el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
      const marker = new mapboxgl.Marker({ element: el, draggable: true }).setLngLat([initialLng, initialLat]).addTo(map);
      marker.on('dragend', () => {
        const { lng, lat } = marker.getLngLat();
        setAnchorLat(Number(lat.toFixed(5)));
        setAnchorLng(Number(lng.toFixed(5)));
        setAnchorLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        const src = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
        if (src) src.setData(createCircleGeoJSON([lng, lat], 1.5) as any);
      });
      markerRef.current = marker;
    });
    mapRef.current = map;

    return () => { map.remove(); mapRef.current = null; markerRef.current = null; circleSourceRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function syncMapToCoords(lat: number, lng: number) {
    const map = mapRef.current;
    if (!map) return;
    if (markerRef.current) markerRef.current.setLngLat([lng, lat]);
    map.flyTo({ center: [lng, lat], zoom: 14.5, essential: true });
    const sid = circleSourceRef.current;
    if (sid) {
      const src = map.getSource(sid) as mapboxgl.GeoJSONSource;
      if (src) src.setData(createCircleGeoJSON([lng, lat], 1.5) as any);
    }
  }

  /* ── Validation ── */
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

  /* ── Geolocation ── */
  function useCurrentLocation() {
    if (!navigator.geolocation) { setGeoError('Geolocation tidak didukung.'); return; }
    setGeoLoading(true); setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setAnchorLat(lat); setAnchorLng(lng); setAnchorLabel(`${lat}, ${lng}`);
        setGeoLoading(false);
        syncMapToCoords(lat, lng);
      },
      () => { setGeoError('Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.'); setGeoLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  /* ── Business helpers ── */
  function updateBiz(idx: number, field: keyof BizEntry, value: string) {
    setBusinesses(prev => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b));
  }
  function addBiz() { if (businesses.length < 5) setBusinesses(prev => [...prev, { name: '', location: '', priceRange: '' }]); }
  function removeBiz(idx: number) { if (businesses.length > 1) setBusinesses(prev => prev.filter((_, i) => i !== idx)); }

  /* ── Submit ── */
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
    if (!res.ok) { try { const d = await res.json(); setError(d.message || d.error || 'Gagal mengirim'); } catch { setError('Gagal mengirim'); } setSubmitting(false); return; }
    setSuccess(true); setTimeout(() => router.push('/co/dashboard/clusters'), 2000);
  }

  /* ════════════════════════════════════════════════════════════
     Render
     ════════════════════════════════════════════════════════════ */

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
      {/* ── Stepper ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  background: i < step ? T.p600 : i === step ? T.p600 : T.c200,
                  color: i <= step ? T.c50 : T.g500,
                  transition: 'all 200ms',
                }}>
                  {i < step ? <Check size={18} /> : i + 1}
                </div>
                <span style={{
                  fontSize: 14, fontWeight: i === step ? 700 : 500,
                  color: i === step ? T.g900 : i < step ? T.g700 : T.g500,
                  transition: 'all 200ms',
                }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: 48, height: 3, borderRadius: 2,
                  background: i < step ? T.p600 : T.c200,
                  margin: '0 14px',
                  transition: 'all 200ms',
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* ── STEP 0: Area Legitimacy ── */}
        {step === 0 && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Legitimasi Area</div>
              <p style={{ fontSize: 14, color: T.g500, lineHeight: 1.6 }}>Kami perlu memverifikasi bahwa kamu benar-benar mengenal area ini sebelum mengajukan cluster.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Q1: Occupation */}
              <div style={{ background: T.c100, borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: T.p600, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: T.c50, flexShrink: 0 }}>1</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.g900 }}>Apa status kamu di area ini?</div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {OCCUPATION_OPTIONS.map(o => (
                    <button key={o} type="button" onClick={() => setOccupation(o)} style={{
                      padding: '10px 18px', borderRadius: 9999, border: `1.5px solid ${occupation === o ? T.p600 : T.c200}`,
                      background: occupation === o ? T.p100 : T.c50, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                      fontFamily: 'inherit', color: occupation === o ? T.p600 : T.g700, transition: 'all 150ms',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      {occupation === o && <Check size={14} strokeWidth={3} />}
                      {LABELS[o]}
                    </button>
                  ))}
                </div>
                {occupation === 'other' && <input placeholder="Sebutkan status kamu..." value={occupationOther} onChange={e => setOccupationOther(e.target.value)} style={{ marginTop: 12, width: '100%', padding: '11px 16px', borderRadius: 12, border: `1.5px solid ${T.c200}`, fontSize: 14, fontFamily: 'inherit', color: T.g900, outline: 'none', boxSizing: 'border-box' }} />}
              </div>

              {/* Q2: Duration */}
              <div style={{ background: T.c100, borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: T.p600, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: T.c50, flexShrink: 0 }}>2</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.g900 }}>Sudah berapa lama kamu di area ini?</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {DURATION_OPTIONS.map(o => (
                    <button key={o} type="button" onClick={() => setAreaDuration(o)} style={{
                      padding: '12px 18px', borderRadius: 12, textAlign: 'left', border: `1.5px solid ${areaDuration === o ? T.p600 : T.c200}`,
                      background: areaDuration === o ? T.p100 : T.c50, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                      fontFamily: 'inherit', color: areaDuration === o ? T.p600 : T.g700, transition: 'all 150ms',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {areaDuration === o && <Check size={14} strokeWidth={3} />}
                        {LABELS[o]}
                      </span>
                      {areaDuration === o && <div style={{ width: 20, height: 20, borderRadius: '50%', background: T.p600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12} color={T.c50} strokeWidth={3} /></div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q3: Primary Anchor */}
              <div style={{ background: T.c100, borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: T.p600, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: T.c50, flexShrink: 0 }}>3</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.g900 }}>Apa anchor point utama kamu di area ini?</div>
                </div>
                <p style={{ fontSize: 13, color: T.g500, marginBottom: 12, lineHeight: 1.5, marginLeft: 38 }}>Contoh: &ldquo;Mahasiswa di Universitas Indonesia&rdquo; / &ldquo;Menjalankan bisnis di Jalan Margonda&rdquo; / &ldquo;Warga Kelurahan Beji&rdquo;</p>
                <textarea placeholder="Jelaskan koneksi kamu dengan area ini..." value={primaryAnchor} onChange={e => setPrimaryAnchor(e.target.value)} rows={3} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, resize: 'vertical', border: `1.5px solid ${T.c200}`, fontSize: 14, fontFamily: 'inherit', color: T.g900, outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }} />
              </div>

              {/* Q4: Physical Presence */}
              <div style={{ background: T.c100, borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: T.p600, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: T.c50, flexShrink: 0 }}>4</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.g900 }}>Seberapa sering kamu secara fisik berada di area ini?</div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {PRESENCE_OPTIONS.map(o => (
                    <button key={o} type="button" onClick={() => setPhysicalPresence(o)} style={{
                      padding: '10px 18px', borderRadius: 9999, border: `1.5px solid ${physicalPresence === o ? T.p600 : T.c200}`,
                      background: physicalPresence === o ? T.p100 : T.c50, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                      fontFamily: 'inherit', color: physicalPresence === o ? T.p600 : T.g700, transition: 'all 150ms',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      {physicalPresence === o && <Check size={14} strokeWidth={3} />}
                      {LABELS[o]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q5: Sample Businesses */}
              <div style={{ background: T.c100, borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: T.p600, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: T.c50, flexShrink: 0 }}>5</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.g900 }}>Sebutkan 5 bisnis F&B nyata yang saat ini beroperasi di koridor ini</div>
                </div>
                <p style={{ fontSize: 13, color: T.g500, marginBottom: 16, lineHeight: 1.5, marginLeft: 38 }}>Nama, perkiraan lokasi, dan rentang harga. Ini adalah pengecekan kualitas data sampel kamu — semakin spesifik, semakin baik.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {businesses.map((b, i) => (
                    <div key={i} style={{ background: T.c50, borderRadius: 12, border: `1px solid ${T.c200}`, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bisnis {i + 1}</span>
                        {businesses.length > 1 && (
                          <button type="button" onClick={() => removeBiz(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                            <Trash2 size={14} color={T.g500} />
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.2fr', gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 11, color: T.g500, marginBottom: 4, fontWeight: 500 }}>Nama Bisnis</div>
                          <input placeholder="Contoh: Kopi Kenangan" value={b.name} onChange={e => updateBiz(i, 'name', e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: `1.5px solid ${T.c200}`, fontSize: 13, fontFamily: 'inherit', color: T.g900, outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: T.g500, marginBottom: 4, fontWeight: 500 }}>Lokasi Perkiraan</div>
                          <input placeholder="Contoh: Jalan Margonda Raya" value={b.location} onChange={e => updateBiz(i, 'location', e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: `1.5px solid ${T.c200}`, fontSize: 13, fontFamily: 'inherit', color: T.g900, outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: T.g500, marginBottom: 4, fontWeight: 500 }}>Rentang Harga</div>
                          <input placeholder="Rp 15K–25K" value={b.priceRange} onChange={e => updateBiz(i, 'priceRange', e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: `1.5px solid ${T.c200}`, fontSize: 13, fontFamily: 'inherit', color: T.g900, outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {businesses.length < 5 && (
                    <button type="button" onClick={addBiz} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: `1.5px dashed ${T.c200}`, background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', color: T.p600, transition: 'all 150ms' }}>
                      <Plus size={14} />Tambah bisnis
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1: Cluster Details ── */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Detail Cluster</div>
              <p style={{ fontSize: 14, color: T.g500, lineHeight: 1.6 }}>Tentukan batas geografis dan karakteristik komersial dari cluster yang kamu usulkan.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Cluster Name */}
              <div style={{ background: T.c100, borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 10 }}>Nama Cluster</div>
                <InputField placeholder="Nama Cluster (contoh: Jalan Margonda Corridor)" value={clusterName} onChange={e => setClusterName(e.target.value)} />
              </div>

              {/* Anchor Type */}
              <div style={{ background: T.c100, borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 4 }}>Aktivitas komersial yang menjadi anchor area ini</div>
                <p style={{ fontSize: 13, color: T.g500, marginBottom: 14, lineHeight: 1.5 }}>Gerbang universitas, pusat perbelanjaan, pasar tradisional, dan stasiun memiliki pola pembelian yang sangat berbeda.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ANCHOR_TYPE_OPTIONS.map(o => (
                    <button key={o} type="button" onClick={() => setAnchorType(o)} style={{
                      padding: '10px 18px', borderRadius: 9999, border: `1.5px solid ${anchorType === o ? T.p600 : T.c200}`,
                      background: anchorType === o ? T.p100 : T.c50, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                      fontFamily: 'inherit', color: anchorType === o ? T.p600 : T.g700, transition: 'all 150ms',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      {anchorType === o && <Check size={14} strokeWidth={3} />}
                      {LABELS[o]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Corridor Description */}
              <div style={{ background: T.c100, borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 4 }}>Deskripsikan koridor walkable 1.5km ini</div>
                <p style={{ fontSize: 13, color: T.g500, marginBottom: 14, lineHeight: 1.5 }}>CO yang benar-benar mengenal area akan menyebut jalan spesifik dan landmark. Jawaban generik adalah red flag.</p>
                <textarea placeholder="Contoh: &ldquo;Jalan Margonda Raya dari gerbang UI ke selatan sampai pintu masuk Margo City Mall; termasuk Jalan Kukusan, Jalan Nusantara, dan strip komersial di belakang Stasiun Depok Baru dalam batas 1.5km.&rdquo;" value={corridorDesc} onChange={e => setCorridorDesc(e.target.value)} rows={4} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, resize: 'vertical', border: `1.5px solid ${T.c200}`, fontSize: 14, fontFamily: 'inherit', color: T.g900, outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }} />
              </div>

              {/* Map / Anchor Point */}
              <div style={{ background: T.c100, borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 2 }}>Titik Anchor — Pusat Radius 1.5km</div>
                    <p style={{ fontSize: 13, color: T.g500 }}>Geser pin di peta atau isi koordinat manual di bawah.</p>
                  </div>
                  <button type="button" onClick={useCurrentLocation} disabled={geoLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: 'none', cursor: geoLoading ? 'wait' : 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: T.e600, background: T.e100, opacity: geoLoading ? 0.7 : 1, transition: 'all 150ms', flexShrink: 0 }}>
                    <Navigation size={14} color={T.e600} />
                    {geoLoading ? 'Mendeteksi...' : '📍 Gunakan Lokasi Saya'}
                  </button>
                </div>
                {geoError && <div style={{ padding: '10px 14px', background: '#FEF3C7', borderRadius: 10, marginBottom: 12, fontSize: 13, color: T.warning, display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={16} />{geoError}</div>}

                <div ref={mapContainerRef} style={{ width: '100%', height: 320, borderRadius: 14, border: `1.5px solid ${T.c200}`, position: 'relative', overflow: 'hidden', background: T.c100 }}>
                  {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: T.g500 }}>
                      <MapPin size={32} color={T.g500} style={{ marginBottom: 8 }} />
                      <span style={{ fontSize: 14 }}>Mapbox token tidak dikonfigurasi</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: T.g500, marginBottom: 4 }}>Latitude</div>
                    <input placeholder="-6.3728" value={anchorLat != null ? String(anchorLat) : ''} onChange={e => { const v = parseFloat(e.target.value); setAnchorLat(Number.isNaN(v) ? null : v); }} type="number" step="any" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${T.c200}`, fontSize: 14, fontFamily: 'inherit', color: T.g900, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: T.g500, marginBottom: 4 }}>Longitude</div>
                    <input placeholder="106.8315" value={anchorLng != null ? String(anchorLng) : ''} onChange={e => { const v = parseFloat(e.target.value); setAnchorLng(Number.isNaN(v) ? null : v); }} type="number" step="any" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${T.c200}`, fontSize: 14, fontFamily: 'inherit', color: T.g900, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: T.g500, marginBottom: 4 }}>Label Anchor</div>
                  <InputField placeholder="Contoh: Universitas Indonesia Gate" value={anchorLabel} onChange={e => setAnchorLabel(e.target.value)} prefix={<MapPin size={14} color={T.g500} />} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Review ── */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Review Proposal</div>
              <p style={{ fontSize: 14, color: T.g500 }}>Periksa kembali semua data sebelum dikirim ke admin.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: T.c100, borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14 }}>Legitimasi Area</div>
                {[
                  { l: 'Status di area', v: occupation === 'other' ? occupationOther : LABELS[occupation] || occupation },
                  { l: 'Durasi di area', v: LABELS[areaDuration] || areaDuration },
                  { l: 'Anchor point', v: primaryAnchor || '—' },
                  { l: 'Kehadiran fisik', v: LABELS[physicalPresence] || physicalPresence },
                  { l: 'Bisnis F&B', v: businesses.filter(b => b.name.trim()).map(b => b.name.trim()).join(', ') || '—' },
                ].map(r => (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.04)', fontSize: 14 }}>
                    <span style={{ color: T.g500 }}>{r.l}</span>
                    <span style={{ color: T.g900, fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>{r.v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: T.c100, borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14 }}>Detail Cluster</div>
                {[
                  { l: 'Nama cluster', v: clusterName },
                  { l: 'Tipe anchor', v: LABELS[anchorType] || anchorType },
                  { l: 'Deskripsi koridor', v: corridorDesc },
                  { l: 'Koordinat', v: `${anchorLat?.toFixed(5) || '—'}, ${anchorLng?.toFixed(5) || '—'}` },
                  { l: 'Label anchor', v: anchorLabel },
                  { l: 'Radius', v: '1.5 km' },
                ].map(r => (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.04)', fontSize: 14 }}>
                    <span style={{ color: T.g500 }}>{r.l}</span>
                    <span style={{ color: T.g900, fontWeight: 600, maxWidth: '55%', textAlign: 'right' }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div style={{ marginTop: 24, padding: '12px 16px', background: '#FEE2E2', borderRadius: 12, fontSize: 14, color: T.danger, display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={16} />{error}</div>}

        {/* Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: `1px solid ${T.c200}` }}>
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
