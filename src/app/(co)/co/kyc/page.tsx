'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, User, Phone, Briefcase, Hash, Globe } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const REFERRAL_OPTIONS = ['Instagram', 'X', 'TikTok', 'Friends', 'Other'];

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data as BufferSource);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function COKycPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyDone, setAlreadyDone] = useState(false);

  // KYC fields
  const [ktpNumber, setKtpNumber] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [referralOther, setReferralOther] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  useEffect(() => {
    fetch('/api/co/profile')
      .then(r => {
        if (!r.ok) throw new Error('NOT_AUTHORIZED');
        return r.json();
      })
      .then(data => {
        if (data.kycCompleted) {
          setAlreadyDone(true);
          router.replace('/co/dashboard/clusters');
          return;
        }
        if (data.username) setUsername(data.username || '');
        if (data.phoneNumber) setPhoneNumber(data.phoneNumber || '');
        if (data.jobTitle) setJobTitle(data.jobTitle || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (ktpNumber.length !== 16 || !/^\d{16}$/.test(ktpNumber)) {
      setError('Nomor KTP harus tepat 16 digit angka');
      return;
    }

    if (!username || username.length < 3) {
      setError('Username minimal 3 karakter');
      return;
    }

    const finalReferral = referralSource === 'Other' && referralOther.trim()
      ? `Other: ${referralOther.trim()}`
      : referralSource;

    if (!finalReferral) {
      setError('Pilih sumber referral');
      return;
    }

    setSubmitting(true);

    const ktpHash = await sha256(ktpNumber.trim());

    const res = await fetch('/api/co/kyc', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ktpHash,
        username,
        phoneNumber: phoneNumber || undefined,
        referralSource: finalReferral,
      }),
    });

    if (!res.ok) {
      let message = 'Gagal menyimpan KYC';
      try { const data = await res.json(); message = data.message || data.error || message; } catch {}
      setError(message);
      setSubmitting(false);
      return;
    }

    const data = await res.json();

    // Also update job title if provided
    if (jobTitle.trim()) {
      await fetch('/api/co/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle: jobTitle.trim() }),
      }).catch(() => {});
    }

    router.push('/co/dashboard/clusters');
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (alreadyDone) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={18} color={T.p600} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.g900 }}>Verifikasi Akun</div>
            <div style={{ fontSize: 13, color: T.g500 }}>Lengkapi data diri sebelum melanjutkan</div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: T.g500, lineHeight: 1.6, marginBottom: 24 }}>
          Sebagai Cluster Owner, kami perlu verifikasi identitas kamu. Data KTP akan di-hash (SHA-256) — kami tidak menyimpan nomor asli kamu.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            <InputField
              placeholder="Username (min. 3 karakter)"
              value={username}
              onChange={e => setUsername(e.target.value)}
              prefix={<User size={16} color={T.g500} />}
              required
            />

            <InputField
              placeholder="Nomor KTP (16 digit)"
              value={ktpNumber}
              onChange={e => setKtpNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
              prefix={<Hash size={16} color={T.g500} />}
              type="text"
              inputMode="numeric"
              required
            />

            <InputField
              placeholder="Nomor Telepon (opsional)"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              prefix={<Phone size={16} color={T.g500} />}
              type="tel"
            />

            <InputField
              placeholder="Posisi / Pekerjaan (opsional)"
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              prefix={<Briefcase size={16} color={T.g500} />}
            />

            {/* Referral source */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.g500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Globe size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Dari mana kamu tahu LOKAL?
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {REFERRAL_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { setReferralSource(opt); if (opt !== 'Other') setReferralOther(''); }}
                    style={{
                      padding: '8px 14px', borderRadius: 9999, border: `1.5px solid ${referralSource === opt ? T.p600 : T.c200}`,
                      background: referralSource === opt ? T.p100 : T.c50, cursor: 'pointer',
                      fontSize: 12, fontWeight: 600, fontFamily: 'inherit', color: referralSource === opt ? T.p600 : T.g700,
                      transition: 'all 150ms',
                    }}
                  >{opt}</button>
                ))}
              </div>
              {referralSource === 'Other' && (
                <input
                  placeholder="Sebutkan sumbernya..."
                  value={referralOther}
                  onChange={e => setReferralOther(e.target.value)}
                  style={{
                    marginTop: 8, width: '100%', padding: '9px 14px', borderRadius: 10,
                    border: `1.5px solid ${T.c200}`, fontSize: 13, fontFamily: 'inherit',
                    color: T.g900, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              )}
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: '#FEE2E2', borderRadius: 10, marginBottom: 16, fontSize: 13, color: T.danger }}>
              {error}
            </div>
          )}

          <Button type="submit" full size="lg" disabled={submitting}>
            {submitting ? 'Menyimpan...' : 'Verifikasi & Lanjutkan'}
          </Button>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: T.g500, lineHeight: 1.5 }}>
            KTP kamu di-hash di browser sebelum dikirim. Server tidak pernah melihat nomor asli KTP kamu.
          </p>
        </form>
      </div>
    </div>
  );
}
