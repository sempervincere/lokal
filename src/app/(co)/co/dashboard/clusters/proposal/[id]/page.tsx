'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ChevronLeft, Save, AlertCircle, Check, Plus, Trash2,
  Send, Building2, Users, Loader2,
} from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';

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

export default function ProposalEditPage() {
  const router = useRouter();
  const params = useParams();
  const proposalId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  /* Form state */
  const [occupation, setOccupation] = useState('');
  const [occupationOther, setOccupationOther] = useState('');
  const [areaDuration, setAreaDuration] = useState('');
  const [primaryAnchor, setPrimaryAnchor] = useState('');
  const [physicalPresence, setPhysicalPresence] = useState('');
  const [businesses, setBusinesses] = useState<BizEntry[]>([{ name: '', location: '', priceRange: '' }]);
  const [clusterName, setClusterName] = useState('');
  const [anchorType, setAnchorType] = useState('');
  const [corridorDesc, setCorridorDesc] = useState('');
  const [anchorLat, setAnchorLat] = useState<number | null>(null);
  const [anchorLng, setAnchorLng] = useState<number | null>(null);
  const [anchorLabel, setAnchorLabel] = useState('');

  /* Load proposal */
  useEffect(() => {
    fetch(`/api/co/clusters/proposal/${proposalId}`)
      .then(async r => {
        if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.error || 'Gagal memuat proposal'); }
        return r.json();
      })
      .then(data => {
        const p = data.proposal;
        const occ = p.occupation as string;
        if (occ.startsWith('other:')) { setOccupation('other'); setOccupationOther(occ.replace('other:', '').trim()); }
        else { setOccupation(occ); }
        setAreaDuration(p.areaDuration);
        setPrimaryAnchor(p.primaryAnchor);
        setPhysicalPresence(p.physicalPresence);
        setClusterName(p.clusterName);
        setAnchorType(p.anchorType);
        setCorridorDesc(p.corridorDesc);
        setAnchorLat(p.anchorLat);
        setAnchorLng(p.anchorLng);
        setAnchorLabel(p.anchorLabel);
        const biz = Array.isArray(p.sampleBusinesses) ? p.sampleBusinesses : [];
        setBusinesses(biz.length > 0 ? biz : [{ name: '', location: '', priceRange: '' }]);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [proposalId]);

  const finalOccupation = occupation === 'other' && occupationOther.trim() ? `other: ${occupationOther.trim()}` : occupation;

  function canSave(): boolean {
    if (!occupation || (occupation === 'other' && !occupationOther.trim())) return false;
    if (!areaDuration || !primaryAnchor.trim() || !physicalPresence) return false;
    if (!businesses.some(b => b.name.trim())) return false;
    if (!clusterName.trim() || !anchorType || !corridorDesc.trim()) return false;
    if (anchorLat == null || anchorLng == null || !anchorLabel.trim()) return false;
    return true;
  }

  /* Business helpers */
  function updateBiz(idx: number, field: keyof BizEntry, value: string) {
    setBusinesses(prev => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b));
  }
  function addBiz() { if (businesses.length < 5) setBusinesses(prev => [...prev, { name: '', location: '', priceRange: '' }]); }
  function removeBiz(idx: number) { if (businesses.length > 1) setBusinesses(prev => prev.filter((_, i) => i !== idx)); }

  async function handleSave() {
    setSaving(true); setError(null);
    const validBiz = businesses.filter(b => b.name.trim());
    const res = await fetch(`/api/co/clusters/proposal/${proposalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        occupation: finalOccupation, areaDuration, primaryAnchor: primaryAnchor.trim(), physicalPresence,
        sampleBusinesses: validBiz.map(b => ({ name: b.name.trim(), location: b.location.trim() || '—', priceRange: b.priceRange.trim() || '—' })),
        clusterName: clusterName.trim(), clusterDescription: null, anchorType, corridorDesc: corridorDesc.trim(),
        anchorLat, anchorLng, anchorLabel: anchorLabel.trim(), radiusKm: 1.5,
      }),
    });
    if (!res.ok) {
      try { const d = await res.json(); setError(d.message || d.error || 'Gagal menyimpan perubahan.'); } catch { setError('Gagal menyimpan perubahan.'); }
      setSaving(false); return;
    }
    setSaveSuccess(true); setSaving(false);
    setTimeout(() => router.push('/co/dashboard/clusters'), 1500);
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <Loader2 size={32} color={T.p600} style={{ animation: 'lokal-spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error && !saving) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <AlertCircle size={24} color={T.danger} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 6 }}>Terjadi Kesalahan</div>
        <p style={{ fontSize: 14, color: T.g500, marginBottom: 20 }}>{error}</p>
        <Button variant="ghost" icon={<ChevronLeft size={16} />} onClick={() => router.back()}>Kembali</Button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <Button variant="ghost" size="sm" icon={<ChevronLeft size={16} />} onClick={() => router.back()} style={{ marginBottom: 12 }}>
            Kembali ke Daftar
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={22} color={T.p600} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.g900 }}>Edit Proposal</div>
              <p style={{ fontSize: 14, color: T.g500, marginTop: 2 }}>Perbarui data proposal cluster kamu sebelum direview admin.</p>
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div style={{ marginBottom: 20, padding: '14px 18px', background: '#ECFDF5', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${T.success}40` }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: T.success, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={14} color={T.c50} strokeWidth={3} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.g900 }}>Perubahan disimpan!</div>
              <div style={{ fontSize: 12, color: T.g500 }}>Mengalihkan ke daftar cluster...</div>
            </div>
          </div>
        )}

        {/* ── Section 1: Legitimasi Area ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={14} />Legitimasi Area
          </div>

          {/* Occupation */}
          <div style={{ background: T.c100, borderRadius: 16, padding: '20px 24px', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 12 }}>Status di area ini</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {OCCUPATION_OPTIONS.map(o => (
                <button key={o} type="button" onClick={() => setOccupation(o)} style={{
                  padding: '10px 18px', borderRadius: 9999, border: `1.5px solid ${occupation === o ? T.p600 : T.c200}`,
                  background: occupation === o ? T.p100 : T.c50, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  fontFamily: 'inherit', color: occupation === o ? T.p600 : T.g700, transition: 'all 150ms',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {occupation === o && <Check size={14} strokeWidth={3} />}{LABELS[o]}
                </button>
              ))}
            </div>
            {occupation === 'other' && (
              <input placeholder="Sebutkan status kamu..." value={occupationOther} onChange={e => setOccupationOther(e.target.value)}
                style={{ marginTop: 12, width: '100%', padding: '11px 16px', borderRadius: 12, border: `1.5px solid ${T.c200}`, fontSize: 14, fontFamily: 'inherit', color: T.g900, outline: 'none', boxSizing: 'border-box' }} />
            )}
          </div>

          {/* Duration */}
          <div style={{ background: T.c100, borderRadius: 16, padding: '20px 24px', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 12 }}>Durasi di area ini</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DURATION_OPTIONS.map(o => (
                <button key={o} type="button" onClick={() => setAreaDuration(o)} style={{
                  padding: '12px 18px', borderRadius: 12, textAlign: 'left', border: `1.5px solid ${areaDuration === o ? T.p600 : T.c200}`,
                  background: areaDuration === o ? T.p100 : T.c50, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  fontFamily: 'inherit', color: areaDuration === o ? T.p600 : T.g700, transition: 'all 150ms',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {areaDuration === o && <Check size={14} strokeWidth={3} />}{LABELS[o]}
                  </span>
                  {areaDuration === o && (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: T.p600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} color={T.c50} strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Anchor */}
          <div style={{ background: T.c100, borderRadius: 16, padding: '20px 24px', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 4 }}>Anchor point utama</div>
            <p style={{ fontSize: 13, color: T.g500, marginBottom: 12, lineHeight: 1.5 }}>Contoh: &ldquo;Mahasiswa di Universitas Indonesia&rdquo; / &ldquo;Menjalankan bisnis di Jalan Margonda&rdquo;</p>
            <textarea placeholder="Jelaskan koneksi kamu dengan area ini..." value={primaryAnchor} onChange={e => setPrimaryAnchor(e.target.value)} rows={3}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, resize: 'vertical', border: `1.5px solid ${T.c200}`, fontSize: 14, fontFamily: 'inherit', color: T.g900, outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }} />
          </div>

          {/* Physical Presence */}
          <div style={{ background: T.c100, borderRadius: 16, padding: '20px 24px', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 12 }}>Kehadiran fisik di area</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PRESENCE_OPTIONS.map(o => (
                <button key={o} type="button" onClick={() => setPhysicalPresence(o)} style={{
                  padding: '10px 18px', borderRadius: 9999, border: `1.5px solid ${physicalPresence === o ? T.p600 : T.c200}`,
                  background: physicalPresence === o ? T.p100 : T.c50, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  fontFamily: 'inherit', color: physicalPresence === o ? T.p600 : T.g700, transition: 'all 150ms',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {physicalPresence === o && <Check size={14} strokeWidth={3} />}{LABELS[o]}
                </button>
              ))}
            </div>
          </div>

          {/* Businesses */}
          <div style={{ background: T.c100, borderRadius: 16, padding: '20px 24px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 4 }}>Bisnis F&B yang dikenal</div>
            <p style={{ fontSize: 13, color: T.g500, marginBottom: 16, lineHeight: 1.5 }}>Nama, perkiraan lokasi, dan rentang harga. Semakin spesifik, semakin baik.</p>
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
                      <input placeholder="Contoh: Kopi Kenangan" value={b.name} onChange={e => updateBiz(i, 'name', e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: `1.5px solid ${T.c200}`, fontSize: 13, fontFamily: 'inherit', color: T.g900, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: T.g500, marginBottom: 4, fontWeight: 500 }}>Lokasi</div>
                      <input placeholder="Contoh: Jalan Margonda Raya" value={b.location} onChange={e => updateBiz(i, 'location', e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: `1.5px solid ${T.c200}`, fontSize: 13, fontFamily: 'inherit', color: T.g900, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: T.g500, marginBottom: 4, fontWeight: 500 }}>Rentang Harga</div>
                      <input placeholder="Rp 15K–25K" value={b.priceRange} onChange={e => updateBiz(i, 'priceRange', e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: `1.5px solid ${T.c200}`, fontSize: 13, fontFamily: 'inherit', color: T.g900, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>
              ))}
              {businesses.length < 5 && (
                <button type="button" onClick={addBiz} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px',
                  borderRadius: 10, border: `1.5px dashed ${T.c200}`, background: 'transparent', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, fontFamily: 'inherit', color: T.p600, transition: 'all 150ms',
                }}><Plus size={14} />Tambah Bisnis</button>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 2: Detail Cluster ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Building2 size={14} />Detail Cluster
          </div>

          {/* Cluster Name */}
          <div style={{ background: T.c100, borderRadius: 16, padding: '20px 24px', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 10 }}>Nama Cluster</div>
            <InputField placeholder="Nama Cluster (contoh: Jalan Margonda Corridor)" value={clusterName} onChange={e => setClusterName(e.target.value)} />
          </div>

          {/* Anchor Type */}
          <div style={{ background: T.c100, borderRadius: 16, padding: '20px 24px', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 4 }}>Tipe anchor komersial</div>
            <p style={{ fontSize: 13, color: T.g500, marginBottom: 14, lineHeight: 1.5 }}>Pola pembelian sangat berbeda antar tipe anchor.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ANCHOR_TYPE_OPTIONS.map(o => (
                <button key={o} type="button" onClick={() => setAnchorType(o)} style={{
                  padding: '10px 18px', borderRadius: 9999, border: `1.5px solid ${anchorType === o ? T.p600 : T.c200}`,
                  background: anchorType === o ? T.p100 : T.c50, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  fontFamily: 'inherit', color: anchorType === o ? T.p600 : T.g700, transition: 'all 150ms',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {anchorType === o && <Check size={14} strokeWidth={3} />}{LABELS[o]}
                </button>
              ))}
            </div>
          </div>

          {/* Corridor Description */}
          <div style={{ background: T.c100, borderRadius: 16, padding: '20px 24px', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 4 }}>Deskripsi koridor 1.5km</div>
            <p style={{ fontSize: 13, color: T.g500, marginBottom: 14, lineHeight: 1.5 }}>Sebut jalan spesifik dan landmark. Jawaban generik adalah red flag.</p>
            <textarea placeholder="Contoh: Jalan Margonda Raya dari gerbang UI ke selatan sampai pintu masuk Margo City Mall..."
              value={corridorDesc} onChange={e => setCorridorDesc(e.target.value)} rows={4}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, resize: 'vertical', border: `1.5px solid ${T.c200}`, fontSize: 14, fontFamily: 'inherit', color: T.g900, outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }} />
          </div>

          {/* Coordinates */}
          <div style={{ background: T.c100, borderRadius: 16, padding: '20px 24px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.g900, marginBottom: 10 }}>Koordinat Anchor</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: T.g500, marginBottom: 4 }}>Latitude</div>
                <input placeholder="-6.3728" value={anchorLat != null ? String(anchorLat) : ''}
                  onChange={e => setAnchorLat(parseFloat(e.target.value) || null)} type="number" step="any"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${T.c200}`, fontSize: 14, fontFamily: 'inherit', color: T.g900, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: T.g500, marginBottom: 4 }}>Longitude</div>
                <input placeholder="106.8315" value={anchorLng != null ? String(anchorLng) : ''}
                  onChange={e => setAnchorLng(parseFloat(e.target.value) || null)} type="number" step="any"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${T.c200}`, fontSize: 14, fontFamily: 'inherit', color: T.g900, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: T.g500, marginBottom: 4 }}>Label Anchor</div>
              <InputField placeholder="Contoh: Universitas Indonesia Gate" value={anchorLabel} onChange={e => setAnchorLabel(e.target.value)} prefix={<Building2 size={14} color={T.g500} />} />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: 20, padding: '12px 16px', background: '#FEE2E2', borderRadius: 12, fontSize: 14, color: T.danger, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />{error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, borderTop: `1px solid ${T.c200}` }}>
          <Button variant="ghost" icon={<ChevronLeft size={16} />} onClick={() => router.back()}>Batal</Button>
          <Button icon={<Save size={16} color={T.c50} />} onClick={handleSave} disabled={!canSave() || saving}>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
