'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ChevronLeft,
  Save,
  AlertCircle,
  Check,
  Plus,
  Trash2,
  Send,
  Building2,
  Users,
  Loader2,
} from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';

const OCCUPATION_OPTIONS = ['student', 'worker', 'freelancer', 'other'];
const DURATION_OPTIONS = ['under_6mo', '6mo_2y', '2y_plus'];
const PRESENCE_OPTIONS = ['daily', '3x_week', 'weekly', 'whenever'];
const ANCHOR_TYPE_OPTIONS = ['university', 'mall', 'market', 'station', 'office', 'residential'];

const LABELS: Record<string, string> = {
  student: 'Mahasiswa / Pelajar',
  worker: 'Pekerja / Karyawan',
  freelancer: 'Freelancer',
  other: 'Lainnya',
  under_6mo: 'Kurang dari 6 bulan',
  '6mo_2y': '6 bulan — 2 tahun',
  '2y_plus': 'Lebih dari 2 tahun',
  daily: 'Setiap hari',
  '3x_week': '3× seminggu',
  weekly: 'Seminggu sekali',
  whenever: 'Kalau perlu saja',
  university: 'Gerbang Universitas',
  mall: 'Pusat Perbelanjaan (Mall)',
  market: 'Pasar Tradisional',
  station: 'Stasiun / Terminal',
  office: 'Kawasan Perkantoran',
  residential: 'Kawasan Perumahan',
};

interface BizEntry {
  name: string;
  location: string;
  priceRange: string;
}

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
      .then(async (r) => {
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          throw new Error(d.error || 'Gagal memuat proposal');
        }
        return r.json();
      })
      .then((data) => {
        const p = data.proposal;
        const occ = p.occupation as string;
        if (occ.startsWith('other:')) {
          setOccupation('other');
          setOccupationOther(occ.replace('other:', '').trim());
        } else {
          setOccupation(occ);
        }
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
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [proposalId]);

  const finalOccupation =
    occupation === 'other' && occupationOther.trim()
      ? `other: ${occupationOther.trim()}`
      : occupation;

  function canSave(): boolean {
    if (!occupation || (occupation === 'other' && !occupationOther.trim())) return false;
    if (!areaDuration || !primaryAnchor.trim() || !physicalPresence) return false;
    if (!businesses.some((b) => b.name.trim())) return false;
    if (!clusterName.trim() || !anchorType || !corridorDesc.trim()) return false;
    if (anchorLat == null || anchorLng == null || !anchorLabel.trim()) return false;
    return true;
  }

  /* Business helpers */
  function updateBiz(idx: number, field: keyof BizEntry, value: string) {
    setBusinesses((prev) => prev.map((b, i) => (i === idx ? { ...b, [field]: value } : b)));
  }
  function addBiz() {
    if (businesses.length < 5)
      setBusinesses((prev) => [...prev, { name: '', location: '', priceRange: '' }]);
  }
  function removeBiz(idx: number) {
    if (businesses.length > 1)
      setBusinesses((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const validBiz = businesses.filter((b) => b.name.trim());
    const res = await fetch(`/api/co/clusters/proposal/${proposalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        occupation: finalOccupation,
        areaDuration,
        primaryAnchor: primaryAnchor.trim(),
        physicalPresence,
        sampleBusinesses: validBiz.map((b) => ({
          name: b.name.trim(),
          location: b.location.trim() || '—',
          priceRange: b.priceRange.trim() || '—',
        })),
        clusterName: clusterName.trim(),
        clusterDescription: null,
        anchorType,
        corridorDesc: corridorDesc.trim(),
        anchorLat,
        anchorLng,
        anchorLabel: anchorLabel.trim(),
        radiusKm: 1.5,
      }),
    });
    if (!res.ok) {
      try {
        const d = await res.json();
        setError(d.message || d.error || 'Gagal menyimpan perubahan.');
      } catch {
        setError('Gagal menyimpan perubahan.');
      }
      setSaving(false);
      return;
    }
    setSaveSuccess(true);
    setSaving(false);
    setTimeout(() => router.push('/co/dashboard/clusters'), 1500);
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 size={32} className="text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error && !saving) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center mb-4">
          <AlertCircle size={24} className="text-danger" />
        </div>
        <h2 className="text-lg font-bold text-warmgray-900 mb-2">Terjadi Kesalahan</h2>
        <p className="text-sm text-warmgray-500 mb-6">{error}</p>
        <Button variant="ghost" icon={<ChevronLeft size={16} />} onClick={() => router.back()}>
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8 md:px-8 md:py-10">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" icon={<ChevronLeft size={16} />} onClick={() => router.back()} className="mb-4">
            Kembali ke Daftar
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: T.p100 }}>
              <Send size={20} color={T.p600} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-warmgray-900">Edit Proposal</h1>
              <p className="text-sm text-warmgray-500">Perbarui data proposal cluster kamu sebelum direview admin.</p>
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 flex items-center gap-3">
            <Check size={18} className="text-success" />
            <p className="text-sm font-semibold text-warmgray-900">Perubahan disimpan! Mengalihkan...</p>
          </div>
        )}

        {/* ── Section 1: Legitimasi Area ── */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-warmgray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users size={16} /> Legitimasi Area
          </h2>
          <div className="space-y-4">
            {/* Occupation */}
            <div className="bg-cream-100 rounded-lokal-lg p-5 md:p-6">
              <h3 className="text-base font-semibold text-warmgray-900 mb-3">Status di area ini</h3>
              <div className="flex flex-wrap gap-3">
                {OCCUPATION_OPTIONS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setOccupation(o)}
                    className={`relative px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 border-[1.5px] flex items-center gap-2 ${
                      occupation === o
                        ? 'border-primary-600 bg-primary-100 text-primary-600'
                        : 'border-cream-200 bg-white text-warmgray-700 hover:border-cream-300'
                    }`}
                  >
                    {occupation === o && <Check size={14} strokeWidth={3} />}
                    {LABELS[o]}
                  </button>
                ))}
              </div>
              {occupation === 'other' && (
                <div className="mt-3">
                  <input
                    placeholder="Sebutkan status kamu..."
                    value={occupationOther}
                    onChange={(e) => setOccupationOther(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-[1.5px] border-cream-200 bg-white text-sm text-warmgray-900 placeholder:text-warmgray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Duration */}
            <div className="bg-cream-100 rounded-lokal-lg p-5 md:p-6">
              <h3 className="text-base font-semibold text-warmgray-900 mb-3">Durasi di area ini</h3>
              <div className="space-y-2">
                {DURATION_OPTIONS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setAreaDuration(o)}
                    className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-150 border-[1.5px] flex items-center justify-between ${
                      areaDuration === o
                        ? 'border-primary-600 bg-primary-100 text-primary-600'
                        : 'border-cream-200 bg-white text-warmgray-700 hover:border-cream-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {areaDuration === o && <Check size={14} strokeWidth={3} />}
                      {LABELS[o]}
                    </span>
                    {areaDuration === o && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: T.p600 }}>
                        <Check size={12} color="#fff" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Anchor */}
            <div className="bg-cream-100 rounded-lokal-lg p-5 md:p-6">
              <h3 className="text-base font-semibold text-warmgray-900 mb-1">Anchor point utama</h3>
              <p className="text-sm text-warmgray-500 mb-3">
                Contoh: "Mahasiswa di Universitas Indonesia" / "Menjalankan bisnis di Jalan Margonda"
              </p>
              <textarea
                placeholder="Jelaskan koneksi kamu dengan area ini..."
                value={primaryAnchor}
                onChange={(e) => setPrimaryAnchor(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-cream-200 bg-white text-sm text-warmgray-900 placeholder:text-warmgray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all resize-y leading-relaxed"
              />
            </div>

            {/* Physical Presence */}
            <div className="bg-cream-100 rounded-lokal-lg p-5 md:p-6">
              <h3 className="text-base font-semibold text-warmgray-900 mb-3">Kehadiran fisik di area</h3>
              <div className="flex flex-wrap gap-3">
                {PRESENCE_OPTIONS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setPhysicalPresence(o)}
                    className={`relative px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 border-[1.5px] flex items-center gap-2 ${
                      physicalPresence === o
                        ? 'border-primary-600 bg-primary-100 text-primary-600'
                        : 'border-cream-200 bg-white text-warmgray-700 hover:border-cream-300'
                    }`}
                  >
                    {physicalPresence === o && <Check size={14} strokeWidth={3} />}
                    {LABELS[o]}
                  </button>
                ))}
              </div>
            </div>

            {/* Businesses */}
            <div className="bg-cream-100 rounded-lokal-lg p-5 md:p-6">
              <h3 className="text-base font-semibold text-warmgray-900 mb-1">Bisnis F&B yang dikenal</h3>
              <p className="text-sm text-warmgray-500 mb-4">Nama, perkiraan lokasi, dan rentang harga. Semakin spesifik, semakin baik.</p>
              <div className="space-y-3">
                {businesses.map((b, i) => (
                  <div key={i} className="bg-white rounded-xl border border-cream-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-warmgray-500 uppercase tracking-wide">Bisnis {i + 1}</span>
                      {businesses.length > 1 && (
                        <button type="button" onClick={() => removeBiz(i)} className="p-1.5 rounded-lg hover:bg-danger/10 transition-colors">
                          <Trash2 size={14} className="text-danger" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-warmgray-500 mb-1">Nama Bisnis</label>
                        <input placeholder="Contoh: Kopi Kenangan" value={b.name} onChange={(e) => updateBiz(i, 'name', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-cream-200 text-sm text-warmgray-900 placeholder:text-warmgray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-warmgray-500 mb-1">Lokasi</label>
                        <input placeholder="Contoh: Jalan Margonda Raya" value={b.location} onChange={(e) => updateBiz(i, 'location', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-cream-200 text-sm text-warmgray-900 placeholder:text-warmgray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-warmgray-500 mb-1">Rentang Harga</label>
                        <input placeholder="Contoh: Rp 15K–25K" value={b.priceRange} onChange={(e) => updateBiz(i, 'priceRange', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-cream-200 text-sm text-warmgray-900 placeholder:text-warmgray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all" />
                      </div>
                    </div>
                  </div>
                ))}
                {businesses.length < 5 && (
                  <button type="button" onClick={addBiz} className="w-full py-3 rounded-xl border-[1.5px] border-dashed border-cream-300 text-sm font-semibold text-primary-600 hover:bg-primary-100/50 hover:border-primary-400 transition-all flex items-center justify-center gap-2">
                    <Plus size={16} /> Tambah Bisnis
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2: Detail Cluster ── */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-warmgray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building2 size={16} /> Detail Cluster
          </h2>
          <div className="space-y-4">
            {/* Cluster Name */}
            <div className="bg-cream-100 rounded-lokal-lg p-5 md:p-6">
              <h3 className="text-base font-semibold text-warmgray-900 mb-3">Nama Cluster</h3>
              <InputField placeholder="Nama Cluster (contoh: Jalan Margonda Corridor)" value={clusterName} onChange={(e: any) => setClusterName(e.target.value)} />
            </div>

            {/* Anchor Type */}
            <div className="bg-cream-100 rounded-lokal-lg p-5 md:p-6">
              <h3 className="text-base font-semibold text-warmgray-900 mb-1">Tipe anchor komersial</h3>
              <p className="text-sm text-warmgray-500 mb-4">Pola pembelian sangat berbeda antar tipe anchor.</p>
              <div className="flex flex-wrap gap-3">
                {ANCHOR_TYPE_OPTIONS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setAnchorType(o)}
                    className={`relative px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 border-[1.5px] flex items-center gap-2 ${
                      anchorType === o
                        ? 'border-primary-600 bg-primary-100 text-primary-600'
                        : 'border-cream-200 bg-white text-warmgray-700 hover:border-cream-300'
                    }`}
                  >
                    {anchorType === o && <Check size={14} strokeWidth={3} />}
                    {LABELS[o]}
                  </button>
                ))}
              </div>
            </div>

            {/* Corridor Description */}
            <div className="bg-cream-100 rounded-lokal-lg p-5 md:p-6">
              <h3 className="text-base font-semibold text-warmgray-900 mb-1">Deskripsi koridor 1.5km</h3>
              <p className="text-sm text-warmgray-500 mb-4">Sebut jalan spesifik dan landmark. Jawaban generik adalah red flag.</p>
              <textarea
                placeholder="Contoh: Jalan Margonda Raya dari gerbang UI ke selatan sampai pintu masuk Margo City Mall..."
                value={corridorDesc}
                onChange={(e) => setCorridorDesc(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-[1.5px] border-cream-200 bg-white text-sm text-warmgray-900 placeholder:text-warmgray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all resize-y leading-relaxed"
              />
            </div>

            {/* Coordinates */}
            <div className="bg-cream-100 rounded-lokal-lg p-5 md:p-6">
              <h3 className="text-base font-semibold text-warmgray-900 mb-3">Koordinat Anchor</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-warmgray-500 mb-1">Latitude</label>
                  <input placeholder="-6.3728" value={anchorLat != null ? String(anchorLat) : ''} onChange={(e) => setAnchorLat(parseFloat(e.target.value) || null)} type="number" step="any" className="w-full px-3 py-2.5 rounded-lg border border-cream-200 text-sm text-warmgray-900 placeholder:text-warmgray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-warmgray-500 mb-1">Longitude</label>
                  <input placeholder="106.8315" value={anchorLng != null ? String(anchorLng) : ''} onChange={(e) => setAnchorLng(parseFloat(e.target.value) || null)} type="number" step="any" className="w-full px-3 py-2.5 rounded-lg border border-cream-200 text-sm text-warmgray-900 placeholder:text-warmgray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-warmgray-500 mb-1">Label Anchor</label>
                <InputField placeholder="Contoh: Universitas Indonesia Gate" value={anchorLabel} onChange={(e: any) => setAnchorLabel(e.target.value)} prefix={<Building2 size={14} color={T.g500} />} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 flex items-center gap-2 text-sm text-danger">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex justify-between items-center pt-6 border-t border-cream-200">
          <Button variant="ghost" icon={<ChevronLeft size={16} />} onClick={() => router.back()}>
            Batal
          </Button>
          <Button icon={<Save size={16} />} onClick={handleSave} disabled={!canSave() || saving}>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
