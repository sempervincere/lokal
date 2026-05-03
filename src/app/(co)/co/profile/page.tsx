'use client';

import { useEffect, useState } from 'react';
import {
  User, Phone, Briefcase, ShieldCheck, Award, Mail, Hash,
  MapPin, Wallet, TrendingUp, Edit3, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ConfidenceRing } from '@/components/ui/ConfidenceRing';
import { getCoTier } from '@/lib/constants/pricing';
import { useCoContext } from '@/lib/co-context';

interface ProfileData {
  id: string;
  email: string;
  fullName: string;
  username: string | null;
  phoneNumber: string | null;
  jobTitle: string | null;
  referralSource: string | null;
  kycCompleted: boolean;
  hasKtp: boolean;
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
  const displayName = profile?.username?.trim() || profile?.fullName?.trim() || 'Cluster Owner';

  useEffect(() => {
    fetch('/api/co/profile')
      .then(r => { if (!r.ok) throw new Error('Gagal'); return r.json(); })
      .then(data => {
        setProfile(data);
        setUsername(data.username || '');
        setPhone(data.phoneNumber || '');
        setJob(data.jobTitle || '');
      })
      .catch(() => setError('Gagal memuat profil'))
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

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
      <LoadingSpinner size="lg" />
    </div>
  );

  if (!profile) return (
    <div style={{ flex: 1, padding: '48px 32px', textAlign: 'center' }}>
      <div style={{ fontSize: 16, color: T.danger }}>{error || 'Data tidak tersedia'}</div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
      <div style={{ maxWidth: 840, margin: '0 auto', animation: 'pageEnter 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>

        {/* ═══════════════════════════════════════════════════════
            Hero Section
            ═══════════════════════════════════════════════════════ */}
        <div style={{
          background: `linear-gradient(135deg, ${T.p100} 0%, ${T.c100} 100%)`,
          borderRadius: 20, padding: '28px 32px', marginBottom: 24,
          border: `1px solid ${T.c200}`, display: 'flex', alignItems: 'center', gap: 20,
          flexWrap: 'wrap',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: T.p600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 4px 16px rgba(27,122,101,0.25)',
          }}>
            <User size={32} color={T.c50} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em' }}>{displayName}</div>
              <div style={{
                padding: '4px 12px', borderRadius: 9999, background: T.p600, color: T.c50,
                fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Award size={11} />{tier.label}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: T.g500 }}>
                <Mail size={13} color={T.g500} />{profile.email}
              </div>
              {profile.kycCompleted ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: T.success }}>
                  <ShieldCheck size={13} color={T.success} />KYC Terverifikasi
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: T.warning }}>
                  <AlertCircle size={13} color={T.warning} />KYC Belum Lengkap
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            Score Cards
            ═══════════════════════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {/* Reputasi */}
          <div style={{
            background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, padding: '22px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(27,122,101,0.10)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <ConfidenceRing score={coScore} size={64} />
            <div style={{ fontSize: 13, fontWeight: 700, color: T.g900, marginTop: 10 }}>Reputasi</div>
            <div style={{ fontSize: 12, color: T.g500, marginTop: 2 }}>{tier.label}</div>
          </div>

          {/* Trust */}
          <div style={{
            background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, padding: '22px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(27,122,101,0.10)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <ConfidenceRing score={trustScore} size={64} />
            <div style={{ fontSize: 13, fontWeight: 700, color: T.g900, marginTop: 10 }}>Trust Score</div>
            <div style={{ fontSize: 12, color: T.success, marginTop: 2 }}>Trusted</div>
          </div>

          {/* Tier Info */}
          <div style={{
            background: T.c50, border: `1px solid ${T.c200}`, borderRadius: 16, padding: '22px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(27,122,101,0.10)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: T.p100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={28} color={T.p600} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.g900, marginTop: 10 }}>Revenue Share</div>
            <div style={{ fontSize: 12, color: T.g500, marginTop: 2 }}>{tier.shareRate}% per sesi</div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            Informasi Akun (Read-only)
            ═══════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Informasi Akun</div>
          <div style={{ background: T.c100, borderRadius: 16, padding: '6px 8px', border: `1px solid ${T.c200}` }}>
            {[
              { icon: <Mail size={16} color={T.g500} />, label: 'Email', value: profile.email },
              { icon: <User size={16} color={T.g500} />, label: 'Nama Lengkap', value: profile.fullName },
            ].map((item, i) => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                borderBottom: i < 1 ? `1px solid ${T.c200}` : 'none',
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: T.c50, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.g500, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 14, color: T.g900, fontWeight: 500 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            Data Profil (Editable)
            ═══════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Data Profil</div>
          <div style={{ background: T.c100, borderRadius: 16, padding: '22px 24px', border: `1px solid ${T.c200}` }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.g500, marginBottom: 6 }}>Username</div>
                <InputField placeholder="username" value={username} onChange={e => setUsername(e.target.value)} prefix={<Hash size={16} color={T.g500} />} />
                <div style={{ fontSize: 11, color: T.g500, marginTop: 5 }}>3–30 karakter, huruf, angka, underscore, dan strip.</div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.g500, marginBottom: 6 }}>Nomor Telepon</div>
                <InputField placeholder="+62 8xx-xxxx-xxxx" value={phone} onChange={e => setPhone(e.target.value)} prefix={<Phone size={16} color={T.g500} />} type="tel" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.g500, marginBottom: 6 }}>Posisi / Pekerjaan</div>
                <InputField placeholder="Contoh: Mahasiswa, Karyawan, Wirausaha" value={job} onChange={e => setJob(e.target.value)} prefix={<Briefcase size={16} color={T.g500} />} />
              </div>
              {profile.referralSource && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.g500, marginBottom: 6 }}>Sumber Referral</div>
                  <div style={{ fontSize: 14, color: T.g700, padding: '10px 0' }}>{profile.referralSource}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            Status Verifikasi
            ═══════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Status Verifikasi</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* KTP */}
            <div style={{
              background: profile.hasKtp ? T.p100 : T.c100, borderRadius: 14, padding: '16px 20px',
              border: `1px solid ${profile.hasKtp ? `${T.p600}30` : T.c200}`,
              display: 'flex', alignItems: 'center', gap: 14,
              transition: 'all 200ms ease',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: profile.hasKtp ? T.p600 : T.c200,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Wallet size={18} color={profile.hasKtp ? T.c50 : T.g500} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.g900 }}>Verifikasi KTP</div>
                <div style={{ fontSize: 12, color: profile.hasKtp ? T.p600 : T.g500, marginTop: 2 }}>
                  {profile.hasKtp ? 'Terverifikasi — hash tersimpan di sistem' : 'Belum diverifikasi'}
                </div>
              </div>
              {profile.hasKtp ? (
                <CheckCircle2 size={20} color={T.success} />
              ) : (
                <AlertCircle size={20} color={T.warning} />
              )}
            </div>

            {/* KYC */}
            <div style={{
              background: profile.kycCompleted ? T.p100 : T.c100, borderRadius: 14, padding: '16px 20px',
              border: `1px solid ${profile.kycCompleted ? `${T.p600}30` : T.c200}`,
              display: 'flex', alignItems: 'center', gap: 14,
              transition: 'all 200ms ease',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: profile.kycCompleted ? T.p600 : T.c200,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShieldCheck size={18} color={profile.kycCompleted ? T.c50 : T.g500} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.g900 }}>KYC Lengkap</div>
                <div style={{ fontSize: 12, color: profile.kycCompleted ? T.p600 : T.g500, marginTop: 2 }}>
                  {profile.kycCompleted ? 'Semua dokumen telah diverifikasi' : 'Lengkapi KYC untuk mulai mengajukan cluster'}
                </div>
              </div>
              {profile.kycCompleted ? (
                <CheckCircle2 size={20} color={T.success} />
              ) : (
                <Button size="sm" variant="secondary" onClick={() => window.location.href = '/co/kyc'}>Lengkapi</Button>
              )}
            </div>
          </div>
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{ padding: '12px 16px', background: '#FEE2E2', borderRadius: 12, marginBottom: 16, fontSize: 14, color: T.danger, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />{error}
          </div>
        )}
        {success && (
          <div style={{ padding: '12px 16px', background: '#ECFDF5', borderRadius: 12, marginBottom: 16, fontSize: 14, color: T.success, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} />Profil berhasil disimpan!
          </div>
        )}

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleSave} size="lg" disabled={saving} icon={<Edit3 size={16} color={T.c50} />}>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
