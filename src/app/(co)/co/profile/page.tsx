'use client';

import { useEffect, useState } from 'react';
import { User, Phone, Briefcase, ShieldCheck, Award, Mail, Hash } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getCoTier } from '@/lib/constants/pricing';
import { useCoContext } from '@/lib/co-context';

interface ProfileData {
  id: string; email: string; fullName: string; username: string | null;
  phoneNumber: string | null; jobTitle: string | null; referralSource: string | null;
  kycCompleted: boolean; hasKtp: boolean;
}

export default function COProfilePage() {
  const ctx = useCoContext();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [job, setJob] = useState('');

  const coScore = ctx?.co?.coScore ?? 0;
  const trustScore = ctx?.co?.trustScore ?? 60;
  const tier = getCoTier(coScore);

  useEffect(() => {
    fetch('/api/co/profile')
      .then(r => { if (!r.ok) throw new Error('Gagal'); return r.json(); })
      .then(data => { setProfile(data); setUsername(data.username || ''); setPhone(data.phoneNumber || ''); setJob(data.jobTitle || ''); })
      .catch(() => setError('Gagal memuat'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true); setError(null); setSuccess(false);
    const res = await fetch('/api/co/profile', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username || undefined, phoneNumber: phone || undefined, jobTitle: job || undefined }),
    });
    if (!res.ok) { try { const d = await res.json(); setError(d.message || d.error || 'Gagal menyimpan'); } catch { setError('Gagal menyimpan'); } }
    else { setSuccess(true); setTimeout(() => setSuccess(false), 2500); }
    setSaving(false);
  }

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}><LoadingSpinner size="lg" /></div>;
  if (!profile) return <div style={{ flex: 1, padding: '48px 32px', textAlign: 'center' }}><div style={{ fontSize: 16, color: T.danger }}>{error || 'Data tidak tersedia'}</div></div>;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} color={T.p600} /></div>
          <div><div style={{ fontSize: 18, fontWeight: 700, color: T.g900 }}>Profil Saya</div><div style={{ fontSize: 13, color: T.g500 }}>Kelola informasi akun kamu</div></div>
        </div>

        {/* Scores */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Reputasi</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: T.g900, marginTop: 4 }}>{coScore}</div>
            <div style={{ fontSize: 11, color: T.g500 }}>{tier.label}</div>
          </div>
          <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Trust</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: T.g900, marginTop: 4 }}>{trustScore}</div>
            <div style={{ fontSize: 11, color: T.success }}>Trusted</div>
          </div>
          <div style={{ background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={18} color={profile.kycCompleted ? T.success : T.g500} />
            <div style={{ fontSize: 11, fontWeight: 700, color: profile.kycCompleted ? T.success : T.g500, marginTop: 4 }}>{profile.kycCompleted ? 'Terverifikasi' : 'Belum'}</div>
          </div>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.g500, marginBottom: 4 }}>Email</div>
            <div style={{ fontSize: 14, color: T.g700, padding: '8px 0' }}>{profile.email}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.g500, marginBottom: 4 }}>Nama Lengkap</div>
            <div style={{ fontSize: 14, color: T.g700, padding: '8px 0' }}>{profile.fullName}</div>
          </div>
          <InputField placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} prefix={<User size={16} color={T.g500} />} />
          <InputField placeholder="Nomor Telepon" value={phone} onChange={e => setPhone(e.target.value)} prefix={<Phone size={16} color={T.g500} />} type="tel" />
          <InputField placeholder="Posisi / Pekerjaan" value={job} onChange={e => setJob(e.target.value)} prefix={<Briefcase size={16} color={T.g500} />} />
          {profile.referralSource && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.g500, marginBottom: 4 }}>Sumber Referral</div>
              <div style={{ fontSize: 14, color: T.g700, padding: '8px 0' }}>{profile.referralSource}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.g500, marginBottom: 4 }}>KTP</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' }}>
              <ShieldCheck size={14} color={profile.hasKtp ? T.success : T.g500} />
              <span style={{ fontSize: 13, color: profile.hasKtp ? T.success : T.g500 }}>{profile.hasKtp ? 'Terverifikasi (hash tersimpan)' : 'Belum diverifikasi'}</span>
            </div>
          </div>
        </div>

        {error && <div style={{ padding: '10px 14px', background: '#FEE2E2', borderRadius: 10, marginBottom: 16, fontSize: 13, color: T.danger }}>{error}</div>}
        {success && <div style={{ padding: '10px 14px', background: '#ECFDF5', borderRadius: 10, marginBottom: 16, fontSize: 13, color: T.success }}>Profil berhasil disimpan!</div>}

        <Button onClick={handleSave} full size="lg" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
      </div>
    </div>
  );
}
